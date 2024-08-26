const _ = require("lodash");
const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetAverageVehicleCustomerMileage = require("../utils/util.GetAverageVehicleCustomerMileage");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const { config_run_number_shop_sales_order_prefix } = require("../config");


const db = require("../db");
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;


/**
 * A handler to add new shopSalesTransactionDoc into database
 * - Route [POST] => /api/shopSalesTransactionDoc/add
 * @param request {import("../types/type.Default.Fastify").FastifyRequestDefault}
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param options
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopSalesTransactionDoc>>}
 */
const handlerShopSalesTransactionDocAdd = async (request, reply = {}, options = {}) => {
    const handlerName = 'post shopSalesTransactionDoc add';

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        if (!isUUID(request.body.bus_customer_id) && !isUUID(request.body.per_customer_id)) {
            throw Error(`Require one of ['bus_customer_id', 'per_customer_id'] contains valid data from request`);
        }

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        return await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if(!request.transaction) {
                    request.transaction = transaction;
                }

                /**
                 * A class's dynamics instance of model "ShopSalesTransactionDoc"
                 */
                const instanceModelShopSalesTransactionDoc = modelShopSalesTransactionDoc(table_name);

                // Create database's table
                // Currently is not use, due is waste of process
                // await instanceModelShopSalesTransactionDoc.sync();

                const createRunNumber = await utilGetRunNumberFromModel(
                    instanceModelShopSalesTransactionDoc,
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_shop_sales_order_prefix,
                                transaction: transaction
                            }
                        ).then(r => r.prefix),
                        whereQuery: {
                            ...(
                                _.get(findShopsProfile, 'shop_config.separate_ShopSalesTransaction_DocType_doc_code', false)
                                ? {
                                    doc_type_id: _.get(request.body, 'doc_type_id', null)
                                }
                                : {}
                            )
                        },
                        transaction: transaction
                    }
                );

                if (isUUID(request.body.vehicles_customers_id) && _.isFinite(Number(_.get(request.body, 'details.mileage', 0)))) {
                    request.body.details.mileage_average = await utilGetAverageVehicleCustomerMileage(
                        table_name,
                        request.body.vehicles_customers_id,
                        Number(_.get(request.body, 'details.mileage', 0)),
                        {
                            transaction: transaction
                        }
                    );

                    if (_.isFinite(Number(request.body.details.mileage_average))) {
                        request.body.details.mileage_average = String(request.body.details.mileage_average)
                    }
                    else {
                        throw Error(`details.mileage_average is not Finite`);
                    }
                }

                const tempInsertData = {
                    ...request.body,
                    run_no: createRunNumber.runNumber,
                    code_id: createRunNumber.runString,
                    created_by: request.id,
                    created_date: currentDateTime,
                    updated_by: null,
                    updated_date: null,
                };

                delete tempInsertData.id;

                const createdDocument = await instanceModelShopSalesTransactionDoc.create(
                    tempInsertData,
                    {
                        transaction: transaction
                    }
                );

                await handleSaveLog(request, [[handlerName, createdDocument.id, request.body], '']);

                return utilSetFastifyResponseJson('success', createdDocument);
            }
        );
    } catch (error) {
        await handleSaveLog(request, [[handlerName, '', request.body], error]);

        throw error;
    }
};


module.exports = handlerShopSalesTransactionDocAdd;