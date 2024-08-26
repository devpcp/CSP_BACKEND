const { isNull } = require('../utils/generate')
const { Op, literal } = require("sequelize");
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const { generateSearchOpFromKeys } = require('../utils/generate');
const utilGetFastifyRequestHeaderAcceptLanguage = require('../utils/util.GetFastifyRequestHeaderAcceptLanguage');
const NameTitle = require('../models/model').NameTitle;

const handleAllRaw = async (request) => {
    const handlerName = 'get master name title all raw';

    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        var sort = request.query.sort
        var order = request.query.order
        var search = request.query.search
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

        var attr = {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"NameTitle\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"NameTitle\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        var where_q = {
            [Op.and]: [{ isuse: isuse },
            {
                [Op.or]:
                {
                    name_title: {
                        [Op.or]: [
                            ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                        ]
                    },
                    code_id: { [Op.iLike]: '%' + search + '%' }
                }
            }],

        }

        var data = await NameTitle.findAll({
            attributes: attr,
            where: where_q,
            order: [[sort, order]]
        })

        await handleSaveLog(request, [[handlerName], ""]);
        return utilSetFastifyResponseJson("success", data);
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);
        throw error;
    }
}

const handleAll = async (request) => {
    const handlerName = 'get master name title all';

    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        var sort = request.query.sort
        var order = request.query.order
        var search = request.query.search
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

        var attr = {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"NameTitle\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"NameTitle\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        var where_q = {
            [Op.and]: [{ isuse: isuse },
            {
                [Op.or]:
                {
                    name_title: {
                        [Op.or]: [
                            ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                        ]
                    },
                    code_id: { [Op.iLike]: '%' + search + '%' }
                }
            }],

        }

        var data = await NameTitle.findAll({
            attributes: attr,
            where: where_q,
            order: [[sort, order]],
            limit: limit,
            offset: (page - 1) * limit
        })

        var length_data = await NameTitle.count({
            attributes: attr,
            where: where_q
        })

        var pag = {
            currentPage: page,
            pages: Math.ceil(length_data / limit),
            currentCount: data.length,
            totalCount: length_data,
            data: data

        }

        await handleSaveLog(request, [[handlerName], ""]);
        return utilSetFastifyResponseJson("success", pag);
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);
        throw error;
    }
}

const handleById = async (request) => {
    const handlerName = 'get master name title byid';

    var id = request.params.id
    var data = await NameTitle.findOne({
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"NameTitle\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"NameTitle\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        where: {
            id: id
        }
    })
    if (data) {

        await handleSaveLog(request, [[handlerName], ""]);
        return utilSetFastifyResponseJson("success", data);
    } else {
        await handleSaveLog(request, [[handlerName], 'name title not found'])
        return utilSetFastifyResponseJson("failed", "name title not found");
    }
}

const handleAdd = async (request) => {

    const handlerName = 'add master name title';

    try {
        var check_order = await NameTitle.max('order_by') || 0

        var create = await NameTitle.create({
            ...request.body,
            isuse: 1,
            order_by: check_order + 1,
            created_by: request.id,
            created_date: Date.now()
        })
        await handleSaveLog(request, [[handlerName, create.id, request.body], ""]);
        return utilSetFastifyResponseJson("success", create);

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[handlerName], 'error : ' + error]);
        return utilSetFastifyResponseJson("failed", error);
    }
}

const handlePut = async (request) => {

    const handlerName = 'put master name title';

    try {

        var { code_id, name_title, initials, order_by } = request.body
        var isuse = request.body.status

        var data = {}
        var id = request.params.id

        if (!isNull(isuse)) {
            if (isuse == 'delete') {
                data.isuse = 2
            } else if (isuse == 'active') {
                data.isuse = 1
            } else if (isuse == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[handlerName], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }
        }

        const find = await NameTitle.findAll({ where: { id: id } });
        if (!find[0]) {
            await handleSaveLog(request, [[handlerName], "id not found"]);
            return utilSetFastifyResponseJson("failed", "id not found");
        }

        if (!isNull(code_id)) {
            data.code_id = code_id
        }

        if (!isNull(name_title)) {
            data.name_title = name_title
        }

        if (!isNull(initials)) {
            data.initials = initials
        }

        if (!isNull(order_by)) {
            data.order_by = order_by
        }

        data.updated_by = request.id
        data.updated_date = Date.now()
        var before_update = await NameTitle.findOne({
            where: {
                id: id
            }
        });

        await NameTitle.update(data, {
            where: {
                id: id
            }
        });

        const put = await NameTitle.findOne(
            {
                where: {
                    id: id
                }
            }
        );

        await handleSaveLog(request, [[handlerName, id, request.body, before_update], ""])
        return utilSetFastifyResponseJson("success", put);
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[handlerName], 'error : ' + error]);
        return utilSetFastifyResponseJson("failed", error);
    }

}
module.exports = {
    handleAllRaw,
    handleAll,
    handleById,
    handleAdd,
    handlePut
}