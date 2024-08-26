const { Op } = require("sequelize");
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");

const sequelize = require('../db');
const Product = require('../models/Product/Product');
const ProductType = require("../models/ProductType/ProductType");
const ProductBrand = require("../models/ProductBrand/ProductBrand");
const ProductCompleteSize = require("../models/ProductCompleteSize/ProductCompleteSize");
const ProductModelType = require("../models/ProductModelType/ProductModelType");
const ShopBank = require("../models/ShopBank/ShopBank");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const { BankNameList } = require("../models/model");

const handleAll = async (request, res) => {


    const shop_table = await utilCheckShopTableName(request)
    const table_name = shop_table.shop_code_id;


    const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    let search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;
    let account_no = request.query.account_no;

    var isuse = []
    if (status == 'delete') {
        isuse = [2]
    } else if (status == 'active') {
        isuse = [1]
    } else if (status == 'block') {
        isuse = [0]
    } else {
        isuse = [1, 0]
    }

    account_no = (account_no) ? { account_no: account_no } : {}


    var where_q = {
        [Op.and]: [{ isuse: isuse }, account_no],
        [Op.or]: [
            {
                account_name: {
                    [Op.or]: [
                        { th: { [Op.like]: '%' + search + '%' } },
                        { en: { [Op.like]: '%' + search + '%' } },
                    ]
                },
                account_no: { [Op.like]: '%' + search + '%' }
            },

        ],


    }


    var data = await ShopBank(table_name).findAll({
        order: [[sort, order]],
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopBank\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopBank\".\"updated_by\" )"), 'updated_by']
            ]
        },
        required: false,
        include: [{ model: BankNameList }],
        where: where_q,
        limit: limit,
        offset: (page - 1) * limit,
    })


    var length_data = await ShopBank(table_name).count({
        where: where_q
    })



    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: data.length,
        totalCount: length_data,
        data: data

    }



    await handleSaveLog(request, [['get shop bank all'], ''])
    return ({ status: 'success', data: pag })

}


const handleAdd = async (request, res) => {
    var action = 'add shop bank'
    try {

        const shop_table = await utilCheckShopTableName(request)
        const table_name = shop_table.shop_code_id;



        var create = await ShopBank(table_name).create({
            ...request.body,
            isuse: 1,
            created_date: Date.now(),
            created_by: request.id,
        })

        await handleSaveLog(request, [[action, create.id, request.body], ''])
        return ({ status: "success", data: create })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleById = async (request, res) => {
    try {

        const shop_table = await utilCheckShopTableName(request)
        const table_name = shop_table.shop_code_id;


        var id = request.params.id

        var find_product = await ShopBank(table_name).findOne({
            attributes: {
                include: [
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopBank\".\"created_by\" )"), 'created_by'],
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopBank\".\"updated_by\" )"), 'updated_by']
                ]
            },
            include: [{ model: BankNameList }],
            where: {
                id: id
            },
        });

        await handleSaveLog(request, [['get shop bank byid'], ''])
        return ({ status: "success", data: find_product })


    } catch (error) {
        error = error
        await handleSaveLog(request, [['get shop bank byid'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handlePut = async (request, res) => {
    var action = 'put shop bank'
    try {

        const shop_table = await utilCheckShopTableName(request)
        const table_name = shop_table.shop_code_id;


        var { account_name, account_no, bank_id, details } = request.body

        var isuse = request.body.status

        var id = request.params.id
        var data = {}


        const before_update = await ShopBank(table_name).findOne({ where: { id: id } });
        if (!before_update) {
            await handleSaveLog(request, [[action], 'bank not found'])
            return ({ status: "failed", data: "bank not found" })
        }
        if (!isNull(account_name)) {
            data.account_name = account_name
        }

        if (!isNull(account_no)) {
            data.account_no = account_no
        }


        if (!isNull(bank_id)) {
            data.bank_id = bank_id
        }


        if (!isNull(details)) {
            data.details = details
        }

        if (!isNull(isuse)) {
            if (isuse == 'delete') {
                data.isuse = 2
            } else if (isuse == 'active') {
                data.isuse = 1
            } else if (isuse == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }


        data.updated_by = request.id
        data.updated_date = new Date()

        await ShopBank(table_name).update(data, {
            where: {
                id: id
            }
        });

        var update = await ShopBank(table_name).findOne({
            where: {
                id: id
            }
        });


        await handleSaveLog(request, [[action, id, request.body, before_update], ''])
        return ({ status: "success", data: update })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    handleAll,
    handleAdd,
    handleById,
    handlePut
}