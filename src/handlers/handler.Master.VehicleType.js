const _ = require("lodash");
const { paginate, isNull } = require('../utils/generate')
const { Op, literal, Transaction } = require("sequelize");
const { handleSaveLog } = require('../handlers/log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const { config_run_number_master_vehicle_type_prefix } = require("../config");
const db = require('../db');
const VehicleType = require('../models/model').VehicleType;


const handleAdd = async (request) => {
    const action = 'add master vehicle type';

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

                const {
                    internal_code_id,
                    type_name
                } = request.body;

                if (internal_code_id) {
                    var check = await VehicleType.findOne({
                        where: { internal_code_id: internal_code_id }
                    })

                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }


                var check = await VehicleType.findOne({
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
                    await handleSaveLog(request, [[action], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                    throw 'ชื่อนี้ถูกใช้ไปแล้ว';
                }
                const createRunNumber = await utilGetRunNumberFromModel(
                    VehicleType,
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_master_vehicle_type_prefix
                            }
                        ).then(r => r.prefix),
                        transaction: transaction
                    }
                );

                const createdDocument = await VehicleType.create(
                    {
                        code_id: createRunNumber.runString,
                        run_no: createRunNumber.runNumber,
                        internal_code_id: internal_code_id,
                        type_name: type_name,
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

        await handleSaveLog(request, [[action, transactionResult.id, request.body], ""]);

        return utilSetFastifyResponseJson("success", transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson("failed", error.toString());
    }
};


const handleAll = async (request) => {
    const search = request.query.search || '';
    const status = request.query.status || 'default';
    const sort = request.query.sort || 'created_date';
    const order = request.query.order || 'desc';
    const limit = request.query.limit || 0;
    const page = request.query.page || 1;

    const isuse = utilGetIsUse(status);

    const findDocuments = await VehicleType.findAll({
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleType\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleType\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        where: {
            ...isuse,
            [Op.or]: {
                code_id: { [Op.like]: '%' + search + '%' },
                internal_code_id: { [Op.like]: '%' + search + '%' },
                type_name: {
                    [Op.or]: [
                        { th: { [Op.like]: '%' + search + '%' } },
                        { en: { [Op.like]: '%' + search + '%' } }
                    ]
                },
            }
        },
        order: [[sort, order]],
    });


    await handleSaveLog(request, [["get master vehicle type all"], ""]);

    return utilSetFastifyResponseJson("success", (limit <= 0 || page <= 0) ? findDocuments : paginate(findDocuments, limit, page));
};


const handleById = async (request) => {
    const action = 'get master vehicle type by id';

    try {
        const findDocument = await VehicleType.findOne({
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleType\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleType\".\"updated_by\" )"), 'updated_by'],
                ]
            },
            where: {
                id: request.params.id
            }
        });

        await handleSaveLog(request, [[action], '']);

        return utilSetFastifyResponseJson('success', findDocument);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handlePut = async (request) => {
    const action = 'put master vehicle type';

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

                const {
                    internal_code_id,
                    type_name
                } = request.body;


                const beforeUpdateDocument = await VehicleType.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                });


                if (!beforeUpdateDocument) {
                    await transaction.rollback();
                    await handleSaveLog(request, [action, "id not found"]);
                    throw 'id not found';
                }

                if (!isNull(internal_code_id)) {
                    var check = await VehicleType.findOne({
                        where: { internal_code_id: internal_code_id, id: { [Op.ne]: request.params.id } }
                    })
                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }

                if (!isNull(type_name)) {
                    var check = await VehicleType.findOne({
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
                        await transaction.rollback();
                        await handleSaveLog(request, [[action], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                        throw 'ชื่อนี้ถูกใช้ไปแล้ว';
                    }
                }

                const updatedDocument = await VehicleType.update(
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

                const afterUpdateDocument = await VehicleType.findOne({
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

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.beforeUpdateDocument], ''])

        return utilSetFastifyResponseJson('success', transactionResult.afterUpdateDocument);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = {
    handleAdd,
    handleAll,
    handleById,
    handlePut
};