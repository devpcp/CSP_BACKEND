const { Op } = require("sequelize");
const { handleSaveLog } = require('./log');
const { isNull } = require('../utils/generate');

const sequelize = require('../db');
const ThirdPartyApi = require('../models/model').ThirdPartyApi;


const handleAllRaw = async (request) => {

    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;

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

    var where_q = {
        [Op.and]: [
            { isuse: isuse }],
        [Op.or]: [
            { third_party_api_name: { [Op.like]: '%' + search + '%' } },
            { url_api_link: { [Op.like]: '%' + search + '%' } }
        ]
    }

    var data = await ThirdPartyApi.findAll({
        where: where_q,
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApi\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApi\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        order: [[sort, order]]
    })


    await handleSaveLog(request, [['get ThirdPartyApi all raw'], ''])
    return ({ status: "successful", data: data })

}


const handleAll = async (request) => {
    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;

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

    var where_q = {
        [Op.and]: [
            { isuse: isuse }],
        [Op.or]: [
            { third_party_api_name: { [Op.like]: '%' + search + '%' } },
            { url_api_link: { [Op.like]: '%' + search + '%' } }
        ]
    }

    var data = await ThirdPartyApi.findAll({
        where: where_q,
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApi\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApi\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        order: [[sort, order]],
        limit: limit,
        offset: (page - 1) * limit,
    })

    var length_data = await ThirdPartyApi.count({
        where: where_q
    })

    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: data.length,
        totalCount: length_data,
        data: data

    }

    await handleSaveLog(request, [['get ThirdPartyApi all'], ''])
    return ({ status: "successful", data: pag })

}

const handleById = async (req) => {
    var id = req.params.id
    var data = await ThirdPartyApi.findOne({
        where: {
            id: id
        },
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApi\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApi\".\"updated_by\" )"), 'updated_by'],
            ]
        }
    })
    if (data) {
        await handleSaveLog(req, [['get ThirdPartyApi by id'], ''])
        return ({ status: "successful", data: data })
    } else {
        await handleSaveLog(req, [['get ThirdPartyApi by id'], 'ThirdPartyApi not found'])
        return ({ status: "failed", data: "ThirdPartyApi not found" })
    }
}

const handleAdd = async (request) => {
    var action = 'add ThirdPartyApi'
    try {
        var { sort_order } = request.body
        const isuse = 1

        if (isNull(sort_order)) {
            var sort_order = await ThirdPartyApi.max('sort_order') || 0
        }

        var create = await ThirdPartyApi.create({
            ...request.body,
            isuse: isuse,
            sort_order: parseInt(sort_order) + 1,
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
    var action = 'put ThirdPartyApi'

    try {
        var { third_party_api_name, url_api_link, detail, sort_order } = request.body
        var status = request.body.status

        var data = {}
        var id = request.params.id

        const find = await ThirdPartyApi.findAll({ where: { id: id } });
        if (!find[0]) {
            await handleSaveLog(request, [[action], 'ThirdPartyApi not found'])
            return ({ status: "failed", data: "ThirdPartyApi not found" })
        }

        if (!isNull(third_party_api_name)) {
            data.third_party_api_name = third_party_api_name
        }

        if (!isNull(url_api_link)) {
            data.url_api_link = url_api_link
        }

        if (!isNull(detail)) {
            data.detail = detail
        }

        if (!isNull(sort_order)) {
            data.sort_order = sort_order
        }

        if (!isNull(status)) {
            if (status == 'delete') {
                data.isuse = 2
            } else if (status == 'active') {
                data.isuse = 1
            } else if (status == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }

        data.updated_by = request.id
        data.updated_date = Date.now()

        var before_update = await ThirdPartyApi.findOne({
            where: {
                id: id
            }
        });

        await ThirdPartyApi.update(data, {
            where: {
                id: id
            }
        });

        var put = await ThirdPartyApi.findOne({
            where: { id: id }
        })

        await handleSaveLog(request, [[action, id, request.body, before_update], ''])
        return ({ status: "successful", data: put })
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }

}
module.exports = {
    handleAllRaw,
    handleAll,
    handleById,
    handleAdd,
    handlePut
}