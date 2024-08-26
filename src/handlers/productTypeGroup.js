const _ = require("lodash");
const { config_run_number_master_product_type_group_prefix } = require("../config");
const { isNull } = require('../utils/generate');
const { Op, Transaction } = require("sequelize");
const { handleSaveLog } = require('../handlers/log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");

const sequelize = require('../db');
const ProductTypeGroup = require("../models/model").ProductTypeGroup;


const handleAdd = async (request) => {
    const action = 'add product group type';

    try {
        const transactionResult = await sequelize.transaction(
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
                    group_type_name
                } = request.body;


                if (internal_code_id) {
                    var check = await ProductTypeGroup.findOne({
                        where: { internal_code_id: internal_code_id }
                    })

                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }


                var check = await ProductTypeGroup.findOne({
                    where: {
                        group_type_name: {
                            [Op.or]: [
                                { th: group_type_name.th },
                                (group_type_name.en) ? { en: group_type_name.en } : {}
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
                    ProductTypeGroup,
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_master_product_type_group_prefix
                            }
                        ).then(r => r.prefix),
                        transaction: transaction
                    }
                );

                const createdDocument = await ProductTypeGroup.create(
                    {
                        code_id: createRunNumber.runString,
                        run_no: createRunNumber.runNumber,
                        internal_code_id: internal_code_id,
                        isstock: true,
                        group_type_name: group_type_name,
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


const handleAllRaw = async (request) => {
    const search = request.query.search || '';
    const status = request.query.status || 'default';
    const sort = request.query.sort || 'created_date';
    const order = request.query.order || 'desc';
    const limit = request.query.limit || 0;
    const page = request.query.page || 1;

    const isuse = utilGetIsUse(status);

    const findDocuments = await ProductTypeGroup.findAll({
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductTypeGroup\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductTypeGroup\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        where: {
            ...isuse,
            [Op.or]: {
                code_id: { [Op.like]: '%' + search + '%' },
                internal_code_id: { [Op.like]: '%' + search + '%' },
                group_type_name: {
                    [Op.or]: [
                        { th: { [Op.like]: '%' + search + '%' } },
                        { en: { [Op.like]: '%' + search + '%' } }
                    ]
                },
            }
        },
        order: [[sort, order]],
    });

    await handleSaveLog(request, [["get product group type all"], ""]);

    return utilSetFastifyResponseJson("success", findDocuments);
};

const handleAll = async (request) => {
    const search = request.query.search || '';
    const status = request.query.status || 'default';
    const sort = request.query.sort || 'created_date';
    const order = request.query.order || 'desc';
    const limit = request.query.limit || 0;
    const page = request.query.page || 1;

    const isuse = utilGetIsUse(status);


    var attr = {
        include: [
            [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductTypeGroup\".\"created_by\" )"), 'created_by'],
            [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductTypeGroup\".\"updated_by\" )"), 'updated_by'],
        ]
    }

    var where_q = {
        ...isuse,
        [Op.or]: {
            code_id: { [Op.like]: '%' + search + '%' },
            internal_code_id: { [Op.like]: '%' + search + '%' },
            group_type_name: {
                [Op.or]: [
                    { th: { [Op.like]: '%' + search + '%' } },
                    { en: { [Op.like]: '%' + search + '%' } }
                ]
            },
        }
    }


    var data = await ProductTypeGroup.findAll({
        attributes: attr,
        where: where_q,
        order: [[sort, order]],
        limit: limit,
        offset: (page - 1) * limit
    })

    var length_data = await ProductTypeGroup.count({
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

    await handleSaveLog(request, [["get product group type all"], ""]);

    return utilSetFastifyResponseJson("success", pag);
};

const handleById = async (request) => {
    const action = 'get product group type by id';

    try {
        const findDocument = await ProductTypeGroup.findOne({
            attributes: {
                include: [
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductTypeGroup\".\"created_by\" )"), 'created_by'],
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductTypeGroup\".\"updated_by\" )"), 'updated_by'],
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
    const action = 'put product group type';

    try {
        const transactionResult = await sequelize.transaction(
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

                var { internal_code_id, group_type_name } = request.body

                const beforeUpdateDocument = await ProductTypeGroup.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                });

                if (!beforeUpdateDocument) {
                    await handleSaveLog(request, [action, "id not found"]);
                    throw 'id not found';
                }

                if (!isNull(internal_code_id)) {
                    var check = await ProductTypeGroup.findOne({
                        where: { internal_code_id: internal_code_id, id: { [Op.ne]: request.params.id } }
                    })
                    if (check) {
                        await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }

                if (!isNull(group_type_name)) {
                    var check = await ProductTypeGroup.findOne({
                        where: {
                            group_type_name: {
                                [Op.or]: [
                                    { th: group_type_name.th },
                                    (group_type_name.en) ? { en: group_type_name.en } : {}
                                ]
                            },
                            id: { [Op.ne]: request.params.id }
                        }
                    })

                    if (check) {
                        await handleSaveLog(request, [[action], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                        throw 'ชื่อนี้ถูกใช้ไปแล้ว';
                    }
                }

                const updatedDocument = await ProductTypeGroup.update(
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

                const afterUpdateDocument = await ProductTypeGroup.findOne({
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
    handleAllRaw,
    handleAll,
    handleById,
    handlePut
};