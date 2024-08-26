const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");

/**
 * A handler for update data in table `ShopInventoryPurchasingPreOrderProductList`
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopInventoryPurchasingPreOrderProductListPut = async (request) => {
    const action = 'put shopInventoryPurchasingPreOrderProductList put';

    /**
     * A user's id where from user's request
     * - type: string<uuid>
     * @type {string}
     */
    const user_id = request.id;
    if (!isUUID(user_id)) {
        throw Error(`Unauthorized`);
    }

    /**
     * A PK id of model, where to use for update document
     * @type {string}
     */
    const request_id = request.params.id;
    if (!isUUID(request_id)) {
        throw Error(`Require params "id" from your request`);
    }

    /**
     * @type {import("sequelize").Transaction}
     */
    const transaction = await db.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         * and return with shop
         */
        const table_name = await utilCheckShopTableName(request).then(r => r['shop_code_id']);

        if (!utilCheckModelShopsProfilesAtFieldShopCodeId(table_name)) {
            throw Error(`Shop code is not found`);
        }
        else {
            /**
             * A class's dynamics instance of model "ShopInventoryPurchasingPreOrderProductList"
             */
            const instanceModelShopInventoryPurchasingPreOrderProductList = require('../models/model').ShopInventoryPurchasingPreOrderProductList(table_name);

            const beforeUpdateDocument = await instanceModelShopInventoryPurchasingPreOrderProductList.findOne(
                {
                    where: {
                        id: request_id
                    },
                    transaction: transaction
                }
            );

            /**
             * Converted field: "status" from request status
             */
            const status = [0, 1, 2].includes(request.body['status']) ? { status: request.body['status'] } : {};

            await instanceModelShopInventoryPurchasingPreOrderProductList.update(
                {
                    ...request.body,
                    ...status,
                    updated_by: user_id,
                    updated_date: Date.now(),
                },
                {
                    where: {
                        id: request_id
                    },
                    transaction: transaction
                }
            );

            const findUpdatedDocument = await instanceModelShopInventoryPurchasingPreOrderProductList.findOne(
                {
                    where: {
                        id: request_id
                    },
                    transaction: transaction
                }
            );

            await transaction.commit();

            await handleSaveLog(request, [[action, request_id, request.body, beforeUpdateDocument], '']);

            return utilSetFastifyResponseJson('success', findUpdatedDocument);
        }
    } catch (error) {
        await transaction.rollback();

        await handleSaveLog(request, [[action, request_id, request.body], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopInventoryPurchasingPreOrderProductListPut;