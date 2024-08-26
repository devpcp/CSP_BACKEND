const _ = require("lodash");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const {
    config_run_number_shop_inventory_purchasing_pre_order_prefix,
} = require("../config");

const modelShopInventoryPurchasingPreOrderDoc = require("../models/model").ShopInventoryPurchasingPreOrderDoc;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<{}>} request
 * @returns {Promise<IUtilFastifyResponseJson<ShopBusinessPartners>>}
 */
const handlerShopBusinessPartnersAdd = async (request) => {
    const action = 'post shopInventoryPurchasingPreOrderDoc add';

    try {
        const currentDateTime = Date.now();

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
        const instanceModelShopInventoryPurchasingPreOrderDoc = modelShopInventoryPurchasingPreOrderDoc(table_name);

        const createRunNumber = await utilGetRunNumberFromModel(
            instanceModelShopInventoryPurchasingPreOrderDoc,
            'run_no',
            {
                prefix_config: await utilGetDocumentTypePrefix(
                    _.get(request.body, 'doc_type_id', ''),
                    {
                        defaultPrefix: config_run_number_shop_inventory_purchasing_pre_order_prefix
                    }
                ).then(r => r.prefix),
            }
        );

        const tempInsertData = {
            ...request.body,
            shop_id: findShopsProfile.id,
            code_id: createRunNumber.runString,
            run_no: createRunNumber.runNumber,
            created_by: request.id,
            created_date: currentDateTime,
            updated_by: null,
            updated_date: null,
        };

        delete tempInsertData.id;

        const createdDocument = await instanceModelShopInventoryPurchasingPreOrderDoc.create(tempInsertData);

        await handleSaveLog(request, [[action, createdDocument.id], ""]);

        return utilSetFastifyResponseJson("success", createdDocument);

    } catch (error) {
        await handleSaveLog(request, [[action, '', request.body], `error : ${error}`]);

        throw error;
    }
};

module.exports = handlerShopBusinessPartnersAdd;