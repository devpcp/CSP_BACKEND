const _ = require("lodash");
const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");
const modelShopPurchaseOrderDoc = require("../models/model").ShopPurchaseOrderDoc;
const modelShopPurchaseOrderList = require("../models/model").ShopPurchaseOrderList;

/**
 * @param {import("../types/type.Handler.ShopPurchaseOrderDoc").IHandlerShopPersonalCustomersAddRequest} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault | {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault | {}} options
 */
const handlerShopPurchaseOrderDocAdd = async (request, reply = {}, options = {}) => {
    const action = 'post shopInventoryPurchasingPreOrderDoc add';

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date())
        options.currentDateTime = currentDateTime;

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                /**
                 * A class's dynamics instance of model "ShopPurchaseOrderDoc"
                 */
                const instanceModelShopPurchaseOrderDoc = modelShopPurchaseOrderDoc(table_name);
                /**
                 * A class's dynamics instance of model "ShopPurchaseOrderList"
                 */
                const instanceModelShopPurchaseOrderList = modelShopPurchaseOrderList(table_name);

                const tempInsertShopPurchaseOrderDoc = {
                    ...request.body,
                    shop_id: findShopsProfile.id,
                    created_by: request.id,
                    created_date: currentDateTime,
                    updated_by: null,
                    updated_date: null,
                    id: undefined,
                    ShopPurchaseOrderLists: undefined
                };

                const createShopPurchaseOrderDoc = await instanceModelShopPurchaseOrderDoc.create(
                    tempInsertShopPurchaseOrderDoc,
                    {
                        transaction: transaction,
                        validate: true
                    }
                );

                const tempInsertShopPurchaseOrderLists = request.body.shopPurchaseOrderLists.reduce(
                    (previousValue, currentValue) => {
                        const tempInsertShopPurchaseOrderList = {
                            ...currentValue,
                            shop_id: findShopsProfile.id,
                            doc_purchase_order_id: createShopPurchaseOrderDoc.get('id'),
                            status: 1,
                            created_by: request.id,
                            created_date: currentDateTime,
                            updated_by: null,
                            updated_date: null,
                            id: undefined
                        };

                        previousValue.push(tempInsertShopPurchaseOrderList);

                        return previousValue;
                    },
                    []
                );

                const createShopPurchaseOrderLists = await instanceModelShopPurchaseOrderList.bulkCreate(
                    tempInsertShopPurchaseOrderLists,
                    {
                        transaction: transaction,
                        validate: true
                    }
                );

                return {
                    ShopPurchaseOrderDoc: createShopPurchaseOrderDoc,
                    ShopPurchaseOrderLists: createShopPurchaseOrderLists
                };
            }
        );

        await handleSaveLog(request, [[action, transactionResult.ShopPurchaseOrderDoc.id], '']);
        for (let i = 0; i < transactionResult.ShopPurchaseOrderLists.length; i++) {
            const element = transactionResult.ShopPurchaseOrderLists[i];
            await handleSaveLog(request, [[action, element.id], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        throw error;
    }
};


module.exports = handlerShopPurchaseOrderDocAdd;