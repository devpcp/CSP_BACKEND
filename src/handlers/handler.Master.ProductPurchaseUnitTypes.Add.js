const _ = require("lodash");
const { handleSaveLog } = require("./log");
const { Op, literal, Transaction } = require("sequelize");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const { config_run_number_master_product_purchase_unit_types_prefix } = require("../config");
const db = require('../db')
const ProductPurchaseUnitTypes = require("../models/model").ProductPurchaseUnitTypes;

const handlerMasterProductPurchaseUnitTypesAdd = async (request) => {
    const action = "add product purchase unit types";

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
                    var check = await ProductPurchaseUnitTypes.findOne({
                        where: { internal_code_id: internal_code_id }
                    })

                    if (check) {
                        await transaction.rollback();
                        await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }


                var check = await ProductPurchaseUnitTypes.findOne({
                    where: {

                        [Op.and]: [
                            { type_group_id: request.body.type_group_id },
                            {
                                type_name: {
                                    [Op.or]: [
                                        { th: type_name.th },
                                        (type_name.en) ? { en: type_name.en } : {}
                                    ]
                                }
                            }
                        ]

                    }
                })

                if (check) {
                    await transaction.rollback();
                    await handleSaveLog(request, [[action], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                    throw 'ชื่อนี้ถูกใช้ไปแล้ว';
                }

                const createRunNumber = await utilGetRunNumberFromModel(
                    ProductPurchaseUnitTypes,
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_master_product_purchase_unit_types_prefix
                            }
                        ).then(r => r.prefix),
                        transaction: transaction
                    }
                );
                const createdDocument = await ProductPurchaseUnitTypes.create(
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


        await handleSaveLog(request, [[action, transactionResult.id, request.body], ""]);

        return utilSetFastifyResponseJson("success", transactionResult);
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], `error : ${error}`]);
        return utilSetFastifyResponseJson("failed", error);

    }

};


module.exports = handlerMasterProductPurchaseUnitTypesAdd;