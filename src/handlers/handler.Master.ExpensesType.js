const _ = require("lodash");
const { isNull } = require('../utils/generate');
const { Op, literal, Transaction } = require("sequelize");
const config = require('../config');
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const { generateSearchOpFromKeys } = require('../utils/generate');
const utilGetFastifyRequestHeaderAcceptLanguage = require('../utils/util.GetFastifyRequestHeaderAcceptLanguage');
const utilGetRunNumberFromModel = require('../utils/util.GetRunNumberFromModel');
const utilGetDocumentTypePrefix = require('../utils/util.GetDocumentTypePrefix');
const db = require('../db');
const ExpensesType = require('../models/model').ExpensesType;
const ExpensesTypeGroup = require('../models/model').ExpensesTypeGroup;

const handleAllRaw = async (request) => {
    const handlerName = 'get master expenses type all raw';

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
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesType\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesType\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        var inc = [{ model: ExpensesTypeGroup }]

        var where_q = {
            [Op.and]: [{ isuse: isuse },
            {
                [Op.or]: {
                    type_name: {
                        [Op.or]: [
                            ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                        ]
                    },
                    code_id: { [Op.iLike]: '%' + search + '%' },
                    internal_code_id: { [Op.iLike]: '%' + search + '%' }
                }

            }]
        }

        var data = await ExpensesType.findAll({
            attributes: attr,
            where: where_q,
            include: inc,
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
    const handlerName = 'get master expenses type all';

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
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesType\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesType\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        var inc = [{ model: ExpensesTypeGroup }]

        var where_q = {
            [Op.and]: [{ isuse: isuse },
            {
                [Op.or]:
                {
                    type_name: {
                        [Op.or]: [
                            ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                        ]
                    },
                    code_id: { [Op.iLike]: '%' + search + '%' },
                    internal_code_id: { [Op.iLike]: '%' + search + '%' }

                }
            }]
        }

        var data = await ExpensesType.findAll({
            attributes: attr,
            where: where_q,
            include: inc,
            order: [[sort, order]],
            limit: limit,
            offset: (page - 1) * limit
        })

        var length_data = await ExpensesType.count({
            attributes: attr,
            include: inc,
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
    const handlerName = 'get master expenses type byid';

    var id = request.params.id
    var data = await ExpensesType.findOne({
        include: [{ model: ExpensesTypeGroup }],
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesType\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ExpensesType\".\"updated_by\" )"), 'updated_by'],
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
        await handleSaveLog(request, [[handlerName], 'expenses type not found'])
        return utilSetFastifyResponseJson("failed", "expenses type not found");
    }
}


const handleAdd = async (request) => {
    const handlerName = 'add master expenses type';

    try {
        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                var { internal_code_id, type_name } = request.body

                if (internal_code_id) {
                    var check = await ExpensesType.findOne({
                        where: { internal_code_id: internal_code_id }
                    })

                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[handlerName], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }


                var check = await ExpensesType.findOne({
                    where: {
                        type_name: {
                            [Op.or]: [
                                { th: type_name.th },
                                (type_name.en) ? { en: type_name.en } : {}
                            ]
                        }
                    }
                })

                if (check) {
                    await transaction.rollback();
                    await handleSaveLog(request, [[handlerName], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                    throw 'ชื่อนี้ถูกใช้ไปแล้ว';
                }

                const createRunNumber = await utilGetRunNumberFromModel(
                    ExpensesType,
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config.config_run_number_master_expenses_types_prefix
                            }
                        ).then(r => r.prefix),
                        transaction: transaction
                    }
                );
                const createdDocument = await ExpensesType.create(
                    {
                        ...request.body,
                        code_id: createRunNumber.runString,
                        run_no: createRunNumber.runNumber,
                        isuse: 1,
                        created_by: request.id,
                        created_date: Date.now()
                    },
                    {
                        transaction: transaction
                    }
                );

                return createdDocument;
            }
        );

        await handleSaveLog(request, [[handlerName, transactionResult.id, request.body], ""]);

        return utilSetFastifyResponseJson("success", transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error.toString()}`]);
        return utilSetFastifyResponseJson("failed", error.toString());
    }
};

const handlePut = async (request) => {
    const handlerName = 'put master expenses type';

    try {
        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                // Convert Status
                switch (request.body.status) {
                    case 'block': {
                        request.body.isuse = 0;
                        break;
                    }
                    case 'active': {
                        request.body.isuse = 1;
                        break;
                    }
                    case 'delete': {
                        request.body.isuse = 2;
                        break;
                    }
                    default: {
                        delete request.body.status;
                        delete request.body.isuse;
                    }
                }

                var { internal_code_id, type_name } = request.body

                const beforeUpdateDocument = await ExpensesType.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                });

                if (!beforeUpdateDocument) {
                    await handleSaveLog(request, [handlerName, "id not found"]);
                    throw 'id not found';
                }

                if (!isNull(internal_code_id)) {
                    var check = await ExpensesType.findOne({
                        where: { internal_code_id: internal_code_id, id: { [Op.ne]: request.params.id } }
                    })
                    if (check) {
                        await handleSaveLog(request, [[handlerName], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }

                if (!isNull(type_name)) {
                    var check = await ExpensesType.findOne({
                        where: {
                            type_name: {
                                [Op.or]: [
                                    { th: type_name.th },
                                    (type_name.en) ? { en: type_name.en } : {}
                                ]
                            },
                            id: { [Op.ne]: request.params.id }
                        }
                    })

                    if (check) {
                        await handleSaveLog(request, [[handlerName], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                        throw 'ชื่อนี้ถูกใช้ไปแล้ว';
                    }
                }

                const updatedDocument = await ExpensesType.update(
                    {
                        ...request.body,
                        updated_by: request.id,
                        updated_date: Date.now()
                    },
                    {
                        where: {
                            id: request.params.id
                        },
                        transaction: transaction
                    }
                );

                const afterUpdateDocument = await ExpensesType.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                });

                return {
                    beforeUpdateDocument: beforeUpdateDocument,
                    afterUpdateDocument: afterUpdateDocument
                };
            }
        );

        await handleSaveLog(request, [[handlerName, request.params.id, request.body, transactionResult.beforeUpdateDocument], ''])

        return utilSetFastifyResponseJson('success', transactionResult.afterUpdateDocument);

    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};

module.exports = {

    handleAllRaw,
    handleAll,
    handleById,
    handleAdd,
    handlePut
}