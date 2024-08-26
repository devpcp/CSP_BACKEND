const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelShopProfiles = require("../models/model").ShopsProfiles;
const modelDocumentTypes = require("../models/model").DocumentTypes;
const modelDocumentTypeGroups = require("../models/model").DocumentTypeGroups;
const modelShopInventoryPurchasingPreOrderDoc = require("../models/model").ShopInventoryPurchasingPreOrderDoc;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopInventoryPurchasingPreOrderDocById = async (request) => {
    const action = 'get shopInventoryPurchasingPreOrderDoc byid';

    try {
        // Init data as requested
        const id = request.params.id;

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
            const instanceError = new Error(`Variable "findShopsProfile" return not found`);
            await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", null);
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", null);
        }
        else {
            /**
             * A class's dynamics instance of model "ShopBusinessPartners"
             */
            const instanceModelShopBusinessPartners = require("../models/ShopBusinessPartners/ShopBusinessPartners")(table_name);
            /**
             * A class's dynamics instance of model "ShopInventoryPurchasingPreOrderDoc"
             */
            const instanceModelShopInventoryPurchasingPreOrderDoc = modelShopInventoryPurchasingPreOrderDoc(table_name);

            const findDocument = await instanceModelShopInventoryPurchasingPreOrderDoc.findOne({
                attributes: {
                    include: [
                        ...utilGetCreateByAndUpdatedByFromModel(instanceModelShopInventoryPurchasingPreOrderDoc),
                    ]
                },
                include: [
                    { model: modelShopProfiles, as: 'ShopsProfiles' },
                    { model: instanceModelShopBusinessPartners, as: 'ShopBusinessPartners' },
                    {
                        model: modelDocumentTypes,
                        as: 'DocumentTypes',
                        include: [
                            {
                                model: modelDocumentTypeGroups
                            }
                        ],
                    },
                ],
                where: {
                    id: id
                }
            });

            await handleSaveLog(request, [[action, request.params.id], '']);

            return utilSetFastifyResponseJson("success", findDocument);
        }
    }
    catch (error) {
        await handleSaveLog(request, [[action, request.params.id], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopInventoryPurchasingPreOrderDocById;