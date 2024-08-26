const _ = require("lodash");
const { isNull } = require('../utils/generate');
const { Op, literal } = require("sequelize");
const { handleSaveLog } = require('./log');
const { generateSearchOpFromKeys } = require('../utils/generate');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilGetFastifyRequestHeaderAcceptLanguage = require('../utils/util.GetFastifyRequestHeaderAcceptLanguage');
const utilGetRunNumberFromModel = require('../utils/util.GetRunNumberFromModel');
const utilGetIsUse = require('../utils/util.GetIsUse');
const ExpensesTypeGroup = require('../models/model').ExpensesTypeGroup;

const handleAllRaw = async (request) => {
    const handlerName = 'get master expenses type group all raw';

    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        var sort = request.query.sort
        var order = request.query.order
        var search = request.query.search
        const status = utilGetIsUse(_.get(request, 'query.status', 'default'));

        var attr = {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesTypeGroup\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesTypeGroup\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        var where_q = {
            [Op.and]: [
                {
                    ...status,
                    [Op.or]:
                    {
                        group_type_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        },
                        code_id: { [Op.iLike]: '%' + search + '%' }
                    }
                }],

        }

        var data = await ExpensesTypeGroup.findAll({
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
    const handlerName = 'get master expenses type group all';

    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        var sort = request.query.sort
        var order = request.query.order
        var search = request.query.search
        const status = utilGetIsUse(_.get(request, 'query.status', 'default'));


        var attr = {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesTypeGroup\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesTypeGroup\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        var where_q = {
            [Op.and]: [
                {
                    ...status,
                    [Op.or]:
                    {
                        group_type_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        },
                        code_id: { [Op.iLike]: '%' + search + '%' }
                    }
                }],

        }

        var data = await ExpensesTypeGroup.findAll({
            attributes: attr,
            where: where_q,
            order: [[sort, order]],
            limit: limit,
            offset: (page - 1) * limit
        })

        var length_data = await ExpensesTypeGroup.count({
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
    const handlerName = 'get master expenses type group byid';

    var id = request.params.id
    var data = await ExpensesTypeGroup.findOne({
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesTypeGroup\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesTypeGroup\".\"updated_by\" )"), 'updated_by'],
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
        await handleSaveLog(request, [[handlerName], 'expenses type group not found'])
        return utilSetFastifyResponseJson("failed", "expenses type group not found");
    }
}

const handleAdd = async (request) => {

    const handlerName = 'add master expenses type group';

    try {

        var createRunNumber = await utilGetRunNumberFromModel(ExpensesTypeGroup, 'run_no', { prefix_config: 'GDOC-' })

        var create = await ExpensesTypeGroup.create({
            ...request.body,
            code_id: createRunNumber.runString,
            run_no: createRunNumber.runNumber,
            isuse: 1,
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

    const handlerName = 'put master expenses type group';

    try {

        var { group_type_name } = request.body
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

        const find = await ExpensesTypeGroup.findAll({ where: { id: id } });
        if (!find[0]) {
            await handleSaveLog(request, [[handlerName], "id not found"]);
            return utilSetFastifyResponseJson("failed", "id not found");
        }

        if (!isNull(group_type_name)) {
            data.group_type_name = group_type_name
        }

        data.updated_by = request.id
        data.updated_date = Date.now()
        var before_update = await ExpensesTypeGroup.findOne({
            where: {
                id: id
            }
        });

        await ExpensesTypeGroup.update(data, {
            where: {
                id: id
            }
        });

        const put = await ExpensesTypeGroup.findOne(
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