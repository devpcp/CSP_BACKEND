const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelProducts = require("../models/model").Product;

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopInventoryPurchasingPreOrderProductListById = async (request) => {
    const action = 'get shopInventoryPurchasingPreOrderProductList byid';

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
            throw instanceError;
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
            throw instanceError;
        }
        else {
            /**
             * A class's dynamics instance of model "ShopProduct"
             */
            const instanceModelShopProducts = require("../models/model").ShopProduct(table_name);
            /**
             * A class's dynamics instance of model "ShopInventoryPurchasingPreOrderDoc"
             */
            const instanceModelShopInventoryPurchasingPreOrderProductList = require("../models/model").ShopInventoryPurchasingPreOrderProductList(table_name);

            const findDocument = await instanceModelShopInventoryPurchasingPreOrderProductList.findAll({
                attributes: {
                    include: [
                        ...utilGetCreateByAndUpdatedByFromModel(instanceModelShopInventoryPurchasingPreOrderProductList),
                    ]
                },
                include: [
                    {
                        model: instanceModelShopProducts,
                        as: 'ShopProduct',
                        include: [
                            {
                                model: modelProducts
                            }
                        ]
                    }
                ],
                where: {
                    id: id
                }
            });

            await handleSaveLog(request, [[action], '']);

            return utilSetFastifyResponseJson("success", findDocument);
        }
    }
    catch (error) {
        await handleSaveLog(request, [[action, '', request.query], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopInventoryPurchasingPreOrderProductListById;