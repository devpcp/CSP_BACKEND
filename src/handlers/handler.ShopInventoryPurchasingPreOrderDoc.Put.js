const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");

const db = require("../db");
const modelShopInventoryPurchasingPreOrderDoc = require("../models/model").ShopInventoryPurchasingPreOrderDoc;

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopInventoryPurchasingPreOrderDocPut = async (request) => {
    const action = 'put shopInventoryPurchasingPreOrderDoc put';

    /**
     * @type {import("sequelize").Transaction}
     */
    const transaction = await db.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });

    try {
        /**
         * A user's id where from user's request
         * - type: string<uuid>
         * @type {string}
         */
        const user_id = request.id;
        /**
         * A PK id of model, where to use for update document
         * @type {string}
         */
        const request_pk_id = request.params.id;
        /**
         * Converted field: "status" from request status
         */
        const status = [0, 1, 2, 3, 4].includes(request.body['status']) ? { status: request.body['status'] } : {};

        if (!user_id) {
            throw Error(`Unauthorized`);
        }
        else if (!isUUID(request_pk_id)) {
            throw Error(`Require params "id" from your request`);
        }
        else {
            /**
             * A result of find data to see what ShopProfile's id whereby this user's request
             */
            const findShopsProfile = await utilCheckShopTableName(request);
            /**
             * A name for create dynamics table
             * @type {string}
             */
            const table_name = findShopsProfile.shop_code_id;

            if (!findShopsProfile) {
                throw Error(`Variable "findShopsProfile" return not found`);
            }
            else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
                throw Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            }
            else {
                /**
                 * A class's dynamics instance of model "ShopInventoryPurchasingPreOrderDoc"
                 */
                const instanceModelShopInventoryPurchasingPreOrderDoc = modelShopInventoryPurchasingPreOrderDoc(table_name);

                const before_update = await instanceModelShopInventoryPurchasingPreOrderDoc.findOne(
                    {
                        where: {
                            id: request.params.id
                        },
                        transaction: transaction
                    }
                );


                const updatedDocument = await instanceModelShopInventoryPurchasingPreOrderDoc.update(
                    {
                        ...request.body,
                        ...status,
                        updated_by: user_id,
                        updated_date: Date.now(),
                    },
                    {
                        where: {
                            id: request_pk_id
                        },
                        transaction: transaction
                    }
                );

                const findUpdatedDocument = await instanceModelShopInventoryPurchasingPreOrderDoc.findOne(
                    {
                        where: {
                            id: request_pk_id
                        },
                        transaction: transaction
                    }
                );

                await transaction.commit();

                await handleSaveLog(request, [[action, request.params.id, request.body, before_update], '']);

                return utilSetFastifyResponseJson('success', findUpdatedDocument);
            }
        }
    }
    catch (error) {
        await transaction.rollback();

        await handleSaveLog(request, [[action, request.params.id, request.body], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopInventoryPurchasingPreOrderDocPut;