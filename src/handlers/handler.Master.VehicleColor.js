const _ = require("lodash");
const {  isNull } = require('../utils/generate');
const { Op, literal, Transaction } = require("sequelize");
const { handleSaveLog } = require('./log');
const { generateSearchOpFromKeys } = require('../utils/generate');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilGetFastifyRequestHeaderAcceptLanguage = require('../utils/util.GetFastifyRequestHeaderAcceptLanguage');
const utilGetIsUse = require('../utils/util.GetIsUse');
const utilGetRunNumberFromModel = require('../utils/util.GetRunNumberFromModel');
const utilGetDocumentTypePrefix = require('../utils/util.GetDocumentTypePrefix');
const { config_run_number_master_vehicle_color_prefix } = require('../config');
const db = require('../db');
const VehicleColor = require('../models/model').VehicleColor;

const handleAllRaw = async (request) => {
    const handlerName = 'get master vehicle color all raw';

    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        var sort = request.query.sort
        var order = request.query.order
        var search = request.query.search
        const status = utilGetIsUse(_.get(request, 'query.status', 'default'));

        var attr = {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleColor\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleColor\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        var where_q = {
            [Op.and]: [
                {
                    ...status,
                    [Op.or]:
                    {
                        vehicle_color_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        },
                        internal_code_id: { [Op.like]: '%' + search + '%' },
                        code_id: { [Op.iLike]: '%' + search + '%' }
                    }
                }],

        }

        var data = await VehicleColor.findAll({
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
    const handlerName = 'get master vehicle color all';

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
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleColor\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleColor\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        var where_q = {
            [Op.and]: [
                {
                    ...status,
                    [Op.or]:
                    {
                        vehicle_color_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        },
                        internal_code_id: { [Op.like]: '%' + search + '%' },
                        code_id: { [Op.iLike]: '%' + search + '%' }
                    }
                }],

        }

        var data = await VehicleColor.findAll({
            attributes: attr,
            where: where_q,
            order: [[sort, order]],
            limit: limit,
            offset: (page - 1) * limit
        })

        var length_data = await VehicleColor.count({
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
    const handlerName = 'get master vehicle color byid';

    var id = request.params.id
    var data = await VehicleColor.findOne({
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleColor\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleColor\".\"updated_by\" )"), 'updated_by'],
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
        await handleSaveLog(request, [[handlerName], 'vehicle color not found'])
        return utilSetFastifyResponseJson("failed", "vehicle color not found");
    }
}

const handleAdd = async (request) => {
    const handlerName = 'add master vehicle color';

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

                var { internal_code_id, vehicle_color_name } = request.body
                var check_order = await VehicleColor.max('order_by') || 0

                if (internal_code_id) {
                    var check = await VehicleColor.findOne({
                        where: { internal_code_id: internal_code_id }
                    })

                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[handlerName], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }


                var check = await VehicleColor.findOne({
                    where: {
                        vehicle_color_name: {
                            [Op.or]: [
                                { th: vehicle_color_name.th },
                                (vehicle_color_name.en) ? { en: vehicle_color_name.en } : {}
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
                    VehicleColor,
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_master_vehicle_color_prefix
                            }
                        ).then(r => r.prefix),
                        transaction: transaction
                    }
                );
                const createdDocument = await VehicleColor.create(
                    {
                        ...request.body,
                        code_id: createRunNumber.runString,
                        run_no: createRunNumber.runNumber,
                        isuse: 1,
                        order_by: check_order + 1,
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
    const handlerName = 'put master vehicle color';

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

                var { internal_code_id, vehicle_color_name } = request.body

                const beforeUpdateDocument = await VehicleColor.findOne({
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
                    var check = await VehicleColor.findOne({
                        where: { internal_code_id: internal_code_id, id: { [Op.ne]: request.params.id } }
                    })
                    if (check) {
                        await handleSaveLog(request, [[handlerName], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }

                if (!isNull(vehicle_color_name)) {
                    var check = await VehicleColor.findOne({
                        where: {
                            vehicle_color_name: {
                                [Op.or]: [
                                    { th: vehicle_color_name.th },
                                    (vehicle_color_name.en) ? { en: vehicle_color_name.en } : {}
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

                const updatedDocument = await VehicleColor.update(
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

                const afterUpdateDocument = await VehicleColor.findOne({
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