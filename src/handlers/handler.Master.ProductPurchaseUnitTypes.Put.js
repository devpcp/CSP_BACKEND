const _ = require("lodash");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { Op, Transaction } = require("sequelize");
const { isNull } = require('../utils/generate');
const db = require('../db');
const ProductPurchaseUnitTypes = require("../models/model").ProductPurchaseUnitTypes;
const modelProductTypeGroup = require("../models/model").ProductTypeGroup;

const handlerMasterProductPurchaseUnitTypesPut = async (request) => {
    const action = "put master product purchase unit types ";

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

                const beforeUpdateDocument = await ProductPurchaseUnitTypes.findOne({
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
                    var check = await ProductPurchaseUnitTypes.findOne({
                        where: { internal_code_id: internal_code_id, id: { [Op.ne]: request.params.id } }
                    })
                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }

                if (!isNull(type_name)) {
                    var check = await ProductPurchaseUnitTypes.findOne({
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

                const updatedDocument = await ProductPurchaseUnitTypes.update(
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

                const afterUpdateDocument = await ProductPurchaseUnitTypes.findOne(
                    {
                        include: [
                            { model: modelProductTypeGroup, as: 'ProductTypeGroup' }
                        ],
                        where: {
                            id: request.params.id
                        },
                        transaction: transaction
                    }
                );

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

module.exports = handlerMasterProductPurchaseUnitTypesPut;