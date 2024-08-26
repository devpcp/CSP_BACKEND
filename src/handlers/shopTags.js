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
const ShopTags = require("../models/ShopTags/ShopTags");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");

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
    let tag_type = request.query.tag_type;

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

    tag_type = (tag_type) ? { tag_type: tag_type } : {}


    var where_q = {
        [Op.and]: [{ isuse: isuse }, tag_type],
        [Op.or]: [
            {
                tag_name: {
                    [Op.or]: [
                        { th: { [Op.like]: '%' + search + '%' } },
                        { en: { [Op.like]: '%' + search + '%' } },
                    ]
                }
            },

        ],


    }


    var producr = await ShopTags(table_name).findAll({
        order: [[sort, order]],
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopTags\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopTags\".\"updated_by\" )"), 'updated_by']
            ]
        },
        required: false,
        where: where_q,
        limit: limit,
        offset: (page - 1) * limit,
    })


    var length_data = await ShopTags(table_name).count({
        where: where_q
    })



    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: producr.length,
        totalCount: length_data,
        data: producr

    }



    await handleSaveLog(request, [['get shop tags all'], ''])
    return ({ status: 'success', data: pag })

}


const handleAdd = async (request, res) => {
    var action = 'add shop tags'
    try {

        const shop_table = await utilCheckShopTableName(request)
        const table_name = shop_table.shop_code_id;


        // request.id = '90f5a0a9-a111-49ee-94df-c5623811b6cc'
        var { tag_name, tag_type } = request.body

        if (isNull(tag_name)) {
            await handleSaveLog(request, [[action], 'tag_name null'])
            return ({ status: "failed", data: "tag_name can not null" })
        }



        const details = request.body?.details || {};

        // return custom_path_code_id

        let check_run = await ShopTags(table_name).findOne({
            order: [['run_no', 'desc']]
        })

        let run_no = 0
        if (check_run) {
            run_no = parseInt(check_run.run_no) + 1
        }


        var create = await ShopTags(table_name).create({
            tag_name: tag_name,
            tag_type: tag_type,
            isuse: 1,
            run_no: run_no,
            created_date: Date.now(),
            created_by: request.id,
            details: details
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

        var find_product = await ShopTags(table_name).findOne({
            attributes: {
                include: [
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopTags\".\"created_by\" )"), 'created_by'],
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopTags\".\"updated_by\" )"), 'updated_by']
                ]
            },
            where: {
                id: id
            },
        });

        await handleSaveLog(request, [['get shop tags byid'], ''])
        return ({ status: "success", data: find_product })


    } catch (error) {
        error = error
        await handleSaveLog(request, [['get shop tags byid'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handlePut = async (request, res) => {
    var action = 'put shop tags'
    try {

        const shop_table = await utilCheckShopTableName(request)
        const table_name = shop_table.shop_code_id;


        var { tag_name, tag_type, details } = request.body

        var isuse = request.body.status

        var id = request.params.id
        var data = {}


        const before_update = await ShopTags(table_name).findOne({ where: { id: id } });
        if (!before_update) {
            await handleSaveLog(request, [[action], 'tags not found'])
            return ({ status: "failed", data: "tags not found" })
        }
        if (!isNull(tag_name)) {
            data.tag_name = tag_name
        }

        if (!isNull(tag_type)) {
            data.tag_type = tag_type
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

        await ShopTags(table_name).update(data, {
            where: {
                id: id
            }
        });

        var update = await ShopTags(table_name).findOne({
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