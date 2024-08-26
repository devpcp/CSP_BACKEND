const xSequelize = require("../db");
const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");


/**
 * A handler for delete data in table `ShopInventoryPurchasingPreOrderProductList`
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopInventoryPurchasingPreOrderProductListDelete = async (request) => {
    const action = 'delete shopInventoryPurchasingPreOrderProductList delete';

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
    const transaction = await xSequelize.transaction({ isolationLevel: 'SERIALIZABLE' });

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

            const beforeDeleteDocument = await instanceModelShopInventoryPurchasingPreOrderProductList.findOne(
                {
                    where: {
                        id: request_id
                    },
                    transaction: transaction
                }
            );

            await instanceModelShopInventoryPurchasingPreOrderProductList.destroy(
                {
                    where: {
                        id: request_id
                    },
                    transaction: transaction
                }
            );

            await transaction.commit();

            await handleSaveLog(request, [[action, request_id, '', beforeDeleteDocument], '']);

            return utilSetFastifyResponseJson('success', null);
        }
    } catch (error) {
        await transaction.rollback();

        await handleSaveLog(request, [[action, request_id, ''], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopInventoryPurchasingPreOrderProductListDelete;