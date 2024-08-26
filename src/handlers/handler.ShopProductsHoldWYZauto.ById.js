const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");


const handlerShopProductsHoldWYZautoById = async (request) => {
    const action = 'get ShopProductsHoldWYZauto byid';

    try {
        const request_id = request.params.id;

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

            const modelShopProductsHoldWYZauto = require("../models/model").ShopProductsHoldWYZauto(table_name);

            const findDocument = await modelShopProductsHoldWYZauto.findOne({
                where: {
                    id: request_id
                }
            });

            await handleSaveLog(request, [[action], '']);

            return utilSetFastifyResponseJson('success', findDocument);
        }
    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw new Error(`Request is error LogId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopProductsHoldWYZautoById;