const _ = require("lodash");
const { Transaction } = require("sequelize");
const { isUUID } = require("../utils/generate");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestShopCodeId = require("../utils/util.GetFastifyRequestShopCodeId");
const utilSetShopStockProductBalance = require("../utils/util.SetShopStockProductBalance");
const utilGetCurrentProductShopStock = require("../utils/util.GetCurrentProductShopStock");
const utilSetShopInventoryMovementLog = require("../utils/util.SetShopInventoryMovementLog");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const {
    config_document_type_ids_no_modify_product_stock,
} = require('../config');

const db = require("../db");
const modelShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const modelShopWarehouses = require("../models/model").ShopWarehouse;
const modelShopStockProductBalances = require("../models/model").ShopStock;
const modelShopSalesTransactionDoc = require('../models/model').ShopSalesTransactionDoc;


/**
 * A service for handle handlerShopSalesOrderPlanLogsAdd to calculate ShopStockBalance from your orders logs ADD_HOLDING_PRODUCT
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("sequelize").Transaction} transaction
 * @param options
 * @returns {Promise<ShopStock[]>}
 */
const serviceShopSalesOrderPlanLogsAdd = async (request, transaction, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const option_movementLog_details = _.get(options,'movementLog_details', {});
    options.movementLog_details = option_movementLog_details;

    const option_movementLog_doc_sale_id = _.get(options, 'movementLog_doc_sale_id', null)
    if (!isUUID(option_movementLog_doc_sale_id)) {
        throw Error('Variable options.movementLog_doc_sale_id must be String UUID type')
    }

    const option_movementLog_doc_sale_log_id = _.get(options, 'movementLog_doc_sale_log_id', null)
    if (!isUUID(option_movementLog_doc_sale_log_id)) {
        throw Error('Variable options.movementLog_doc_sale_log_id must be String UUID type')
    }

    if (!request) {
        throw Error(`parameter request is required`);
    }
    else if (!transaction) {
        throw Error(`parameter transaction is required`);
    }
    else {
        const findShop = await utilCheckShopTableName(request);

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShop.shop_code_id;

        const instanceModelShopWarehouses = modelShopWarehouses(table_name);
        /**
         * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
         */
        const instanceModelShopStockProductBalances = modelShopStockProductBalances(table_name);

        /**
         * @type {import("../types/service.ShopSalesOrderPlanLogs").IWarehouseDetail}
         */
        const warehouse_detail = request.body.warehouse_detail;

        const findWarehouse = await instanceModelShopWarehouses.findOne({
            where: {
                id: warehouse_detail.warehouse
            }
        });

        if (!findWarehouse) {
            throw Error(`findWarehouse return not found`);
        }
        else {
            const result = [];

            for (let indexSelfItem = 0; indexSelfItem < warehouse_detail.shelf.length; indexSelfItem++) {
                const elementSelfItem = warehouse_detail.shelf[indexSelfItem];

                const currentProductShopStock = await utilGetCurrentProductShopStock(
                    table_name,
                    {
                        transaction: transaction,
                        findShopProductId: request.body.product_id,
                        findShopWarehouseId: warehouse_detail.warehouse,
                        findShopWarehouseItemId: elementSelfItem.item,
                        findPurchaseUnitId: elementSelfItem.purchase_unit_id || null,
                        findDotMfd: elementSelfItem.dot_mfd || null
                    }
                );
                if (currentProductShopStock.length !== 1) {
                    throw Error('Variable currentProductShopStock.length must return 1');
                }

                await utilSetShopStockProductBalance(
                    table_name,
                    request.body.product_id,
                    warehouse_detail.warehouse,
                    elementSelfItem.item,
                    elementSelfItem.purchase_unit_id,
                    elementSelfItem.dot_mfd,
                    "add_holding_product",
                    elementSelfItem.amount,
                    {
                        transaction: transaction,
                        updated_by: request.id
                    }
                );

                await utilSetShopInventoryMovementLog(
                    'SO',
                    {
                        shop_id: findShop.get('id'),
                        product_id: request.body.product_id,
                        doc_sale_id: option_movementLog_doc_sale_id,
                        doc_sale_log_id: option_movementLog_doc_sale_log_id,
                        stock_id: currentProductShopStock[0].id,
                        warehouse_id: warehouse_detail.warehouse,
                        warehouse_item_id: elementSelfItem.item,
                        purchase_unit_id: elementSelfItem.purchase_unit_id || null,
                        dot_mfd: elementSelfItem.dot_mfd || null,
                        count_previous_stock: currentProductShopStock[0].balance,
                        count_adjust_stock: (Math.abs(+(elementSelfItem.amount))) * -1,
                        details: { documentType: 'SO', reasons: 'Add holding stock', ...option_movementLog_details},
                        created_by: request.id,
                        created_date: currentDateTime
                    },
                    {
                        transaction: transaction,
                        currentDateTime: currentDateTime
                    }
                );

                result.push(
                    await instanceModelShopStockProductBalances.findOne(
                        {
                            where: {
                                product_id: request.body.product_id
                            },
                            transaction: transaction
                        }
                    )
                )
            }

            return result;
        }
    }
};


/**
 * A handler to add new "ShopSalesOrderPlanLogs" document data into database
 * - Route [POST] => /api/shopSalesOrderPlanLogs/add
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param options
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopSalesOrderPlanLogs>>}
 */
const handlerShopSalesOrderPlanLogsAdd = async (request, reply = {}, options = {}) => {
    const handlerName = "post shopSalesOrderPlanLogs add";

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        const option_movementLog_details = _.get(options,'movementLog_details', {});
        options.movementLog_details = option_movementLog_details;

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = await utilGetFastifyRequestShopCodeId(request);

        const transactionResult = await db.transaction(
            {
                transaction: request.transaction,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                /**
                 * A class's dynamics instance of model "ShopSalesTransactionDoc"
                 */
                const instanceModelShopSalesTransactionDoc = modelShopSalesTransactionDoc(table_name);
                /**
                 * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
                 */
                const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

                const findShopSalesTransactionDocDocument = await instanceModelShopSalesTransactionDoc.findOne(
                    {
                        where: {
                            id: request.body.doc_sale_id
                        },
                        transaction: transaction
                    }
                );
                if (!findShopSalesTransactionDocDocument) {
                    throw Error(`doc_sale_id is not found`);
                }
                options.movementLog_doc_sale_id = findShopSalesTransactionDocDocument.get('id');

                const tempInsertData = {
                    ...request.body,
                    created_by: request.id,
                    created_date: currentDateTime,
                    updated_by: null,
                    updated_date: null,
                };

                delete tempInsertData.id;

                const createdDocument = await instanceModelShopSalesOrderPlanLogs.create(tempInsertData, { transaction: transaction });
                options.movementLog_doc_sale_log_id = createdDocument.get('id');
                options.movementLog_details = { documentType: 'SO', reasons: 'Create', ...option_movementLog_details}
                const updateShopStockProduct = config_document_type_ids_no_modify_product_stock.includes(findShopSalesTransactionDocDocument.doc_type_id)
                    ? []
                    : await serviceShopSalesOrderPlanLogsAdd(request, transaction, options);

                await createdDocument.reload({ transaction: transaction })

                if (!createdDocument || !updateShopStockProduct) {
                    throw Error(`create document is error`);
                }
                else {
                    return createdDocument;
                }
            }
        );

        await handleSaveLog(request, [[handlerName, transactionResult.id, request.body], '']);

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[handlerName, '', request.body], error]);

        throw error;
    }
};


module.exports = handlerShopSalesOrderPlanLogsAdd;