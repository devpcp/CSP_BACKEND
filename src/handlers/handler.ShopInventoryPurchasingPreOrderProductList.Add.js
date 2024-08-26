const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopInventoryPurchasingPreOrderProductListAdd = async (request) => {
    const action = 'post shopInventoryPurchasingPreOrderProductList add';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        /**
         * A class's dynamics instance of model "ShopBusinessPartners"
         */
        const instanceModelShopInventoryPurchasingPreOrderProductList = require('../models/model').ShopInventoryPurchasingPreOrderProductList(table_name);

        const tempInsertData = {
            ...request.body,
            shop_id: findShopsProfile.id,
            created_by: request.id,
            created_date: Date.now(),
            updated_by: null,
            updated_date: null,
        };

        delete tempInsertData.id;

        const createdDocument = await instanceModelShopInventoryPurchasingPreOrderProductList.create(tempInsertData);

        await handleSaveLog(request, [[action, createdDocument.id], '']);

        return utilSetFastifyResponseJson('success', createdDocument);

    } catch (error) {
        await handleSaveLog(request, [[action, '', request.body], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopInventoryPurchasingPreOrderProductListAdd;