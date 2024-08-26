const _ = require("lodash");
const { isNull, paginate } = require('../utils/generate')
const { Op, literal, Transaction } = require("sequelize");
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const utilGetIsUse = require("../utils/util.GetIsUse");
const { config_run_number_master_vehicle_brand_prefix } = require("../config");
const db = require('../db');
const VehicleBrand = require('../models/model').VehicleBrand;
const VehicleModelType = require("../models/model").VehicleModelType;
const VehicleType = require("../models/model").VehicleType;

const handleAdd = async (request) => {
    const action = 'add master vehicle brand';

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
                    brand_name
                } = request.body;

                if (internal_code_id) {
                    var check = await VehicleBrand.findOne({
                        where: { internal_code_id: internal_code_id }
                    })

                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }


                var check = await VehicleBrand.findOne({
                    where: {
                        brand_name: {
                            [Op.or]: [
                                { th: brand_name.th },
                                (brand_name.en) ? { en: brand_name.en } : {}
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
                    VehicleBrand,
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_master_vehicle_brand_prefix
                            }
                        ).then(r => r.prefix),
                        transaction: transaction
                    }
                );

                const createdDocument = await VehicleBrand.create(
                    {
                        code_id: createRunNumber.runString,
                        run_no: createRunNumber.runNumber,
                        internal_code_id: internal_code_id,
                        brand_name: brand_name,
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

        return utilSetFastifyResponseJson('success', transactionResult);
    }
    catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handleAll = async (request) => {
    const action = 'get master vehicle brand all';

    try {
        const search = request.query.search || '';
        const status = request.query.status || 'default';
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'desc';
        const limit = request.query.limit || 0;
        const page = request.query.page || 1;

        const isuse = utilGetIsUse(status);

        const findDocuments = await VehicleBrand.findAll({
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleBrand\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleBrand\".\"updated_by\" )"), 'updated_by'],
                ]
            },
            include: [
                {
                    model: VehicleModelType,
                    include: [
                        { model: VehicleType }
                    ]
                }
            ],
            where: {
                ...isuse,
                [Op.or]: {
                    code_id: { [Op.iLike]: '%' + search + '%' },
                    internal_code_id: { [Op.iLike]: '%' + search + '%' },
                    brand_name: {
                        [Op.or]: [
                            { th: { [Op.iLike]: '%' + search + '%' } },
                            { en: { [Op.iLike]: '%' + search + '%' } }
                        ]
                    },
                }
            },
            order: [[sort, order]],
        });


        await handleSaveLog(request, [["get master vehicle type all"], ""]);

        return utilSetFastifyResponseJson("success", (limit <= 0 || page <= 0) ? findDocuments : paginate(findDocuments, limit, page));
    }
    catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handleById = async (request) => {
    const action = 'get master vehicle brand by id';

    try {
        const findDocument = await VehicleBrand.findOne({
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleBrand\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleBrand\".\"updated_by\" )"), 'updated_by'],
                ]
            },
            include: [
                {
                    model: VehicleModelType,
                    include: [
                        { model: VehicleType }
                    ]
                }
            ],
            where: {
                id: request.params.id
            }
        });

        await handleSaveLog(request, [[action], '']);

        return utilSetFastifyResponseJson('success', findDocument);
    }
    catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handlePut = async (request) => {
    const action = 'put master vehicle brand';

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
                    brand_name
                } = request.body;


                const beforeUpdateDocument = await VehicleBrand.findOne({
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
                    var check = await VehicleBrand.findOne({
                        where: { internal_code_id: internal_code_id, id: { [Op.ne]: request.params.id } }
                    })
                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }

                if (!isNull(brand_name)) {
                    var check = await VehicleBrand.findOne({
                        where: {
                            brand_name: {
                                [Op.or]: [
                                    { th: brand_name.th },
                                    (brand_name.en) ? { en: brand_name.en } : {}
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


                const updatedDocument = await VehicleBrand.update(
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

                const afterUpdateDocument = await VehicleBrand.findOne({
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
    }
    catch (error) {
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
