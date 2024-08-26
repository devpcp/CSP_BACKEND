const { Op } = require("sequelize");
const { handleSaveLog } = require('../handlers/log');
const { isNull } = require('../utils/generate');

const sequelize = require('../db');
const ProductCompleteSize = require("../models/model").ProductCompleteSize;

const handleAll = async (request) => {

    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search

    var pro = await ProductCompleteSize.findAll({
        where: {
            // [Op.and]: [{ isuse: [1] }],
            complete_size_name: {
                [Op.or]: [
                    { th: { [Op.like]: '%' + search + '%' } },
                    { en: { [Op.like]: '%' + search + '%' } },
                    // { prov_name_en: { [Op.like]: '%' + search + '%' } }
                ]
            }

        },
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductCompleteSize\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductCompleteSize\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        order: [[sort, order]],


    })

    await handleSaveLog(request, [['get ProductCompleteSize all'], ''])
    return ({ status: "successful", data: pro })

}



const handleById = async (req) => {
    var pro_bran_id = req.params.id
    var data = await ProductCompleteSize.findAll({
        where: {
            id: pro_bran_id
        },
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductCompleteSize\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductCompleteSize\".\"updated_by\" )"), 'updated_by'],
            ]
        }
    })
    if (data[0]) {

        await handleSaveLog(req, [['get ProductCompleteSize byid'], ''])
        return ({ status: "successful", data: [data[0]] })
    } else {
        await handleSaveLog(req, [['get ProductCompleteSize byid'], 'ProductCompleteSize not found'])
        return ({ status: "failed", data: "ProductCompleteSize not found" })
    }
}

const handleAdd = async (request) => {
    var action = 'add ProductCompleteSize'
    try {

        var { complete_size_name, code_id } = request.body
        const isuse = 1

        if (isNull(complete_size_name)) {
            await handleSaveLog(request, [[action], 'complete_size_name null'])
            return ({ status: "failed", data: "complete_size_name can not null" })
        }


        var create = await ProductCompleteSize.create({
            complete_size_name: complete_size_name,
            code_id: code_id,
            isuse: isuse,
            created_by: request.id,
            created_date: Date.now()
        })

        await handleSaveLog(request, [[action, create.id, request.body], ''])
        return ({ status: "successful", data: create })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handlePut = async (request) => {
    var action = 'put ProductCompleteSize'
    try {
        var { complete_size_name, code_id } = request.body
        var status_brand = request.body.status

        var data = {}
        var brand_id = request.params.id

        const find_group = await ProductCompleteSize.findAll({ where: { id: brand_id } });
        if (!find_group[0]) {
            await handleSaveLog(request, [[action], 'ProductCompleteSize not found'])
            return ({ status: "failed", data: "ProductCompleteSize not found" })
        }

        if (!isNull(complete_size_name)) {
            data.complete_size_name = complete_size_name
        }

        if (!isNull(code_id)) {
            data.code_id = code_id
        }


        if (!isNull(status_brand)) {
            if (status_brand == 'delete') {
                data.isuse = 2
            } else if (status_brand == 'active') {
                data.isuse = 1
            } else if (status_brand == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }

        data.updated_by = request.id
        data.updated_date = Date.now()

        var before_update = await ProductCompleteSize.findOne({
            where: {
                id: brand_id
            }
        });

        await ProductCompleteSize.update(data, {
            where: {
                id: brand_id
            }
        });

        var put = await ProductCompleteSize.findOne({
            where: { id: brand_id }
        })

        await handleSaveLog(request, [[action, brand_id, request.body, before_update], ''])
        return ({ status: "successful", data: put })
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }

}

module.exports = {

    handleAll,
    handleById,
    handleAdd,
    handlePut
}