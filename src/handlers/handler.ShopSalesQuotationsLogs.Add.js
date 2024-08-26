const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");

const ShopSalesQuotationsLogs = require("../models/model").ShopSalesQuotationsLogs;


/**
 * A handler to add new ShopSalesQuotationsLogs into database
 * - Route [POST] => /api/shopSalesQuotationsLogs/add
 * @param {import("../types/type.Handler.ShopPersonalCustomers").IHandlerShopPersonalCustomersAddRequest} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopPersonalCustomers>>}
 */
const handlerShopSalesQuotationsLogsAdd = async (request) => {
    const action = 'post shopSalesQuotationsLogs add';

    try {
        const currentDateTime = Date.now();
        const user_id = request.id;

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        if (!findShopsProfile) {
            throw Error(`Variable "findShopsProfile" return not found`);
        } else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            throw Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
        } else {
            /**
             * A name for create dynamics table
             * @type {string}
             */
            const table_name = findShopsProfile.shop_code_id;

            /**
             * A class's dynamics instance of model "ShopSalesQuotationsLogs"
             */
            const instanceModelShopSalesQuotationsLogs = ShopSalesQuotationsLogs(table_name);

            const tempInsertData = {
                ...request.body,
                shop_id: findShopsProfile.id,
                created_by: user_id,
                created_date: currentDateTime,
                updated_by: null,
                updated_date: null
            };

            delete tempInsertData.id;

            const createdDocument = await instanceModelShopSalesQuotationsLogs.create(tempInsertData);

            await handleSaveLog(request, [[action, createdDocument.id, request.body], ""]);

            return utilSetFastifyResponseJson("success", createdDocument);
        }
    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopSalesQuotationsLogsAdd;