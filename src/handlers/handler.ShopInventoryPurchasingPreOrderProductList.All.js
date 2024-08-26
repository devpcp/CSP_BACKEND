const { Op, literal } = require("sequelize");
const { handleSaveLog } = require("./log");
const { paginate, isUUID } = require("../utils/generate");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelProducts = require("../models/model").Product;

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopInventoryPurchasingPreOrderProductListAll = async (request) => {
    const action = 'get shopInventoryPurchasingPreOrderProductList all';

    try {
        // Init data as requested
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        const search = request.query.search || "";
        const status = ['0', '1', '2'].includes(request.query.status) ? { status: +request.query.status } : { status: { [Op.ne]: 0 } };
        const sort = request.query.sort || "created_date";
        const order = request.query.order || "desc";
        const limit = +request.query.limit || 10;
        const page = +request.query.page || 1;

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
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
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

            const findDocuments = await instanceModelShopInventoryPurchasingPreOrderProductList.findAll({
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
                    ...status,
                    [Op.or]: [
                        ...(isUUID(search) ? [{ id: { [Op.eq]: search } }] : []),
                        ...(isUUID(search) ? [{ product_id: { [Op.eq]: search } }] : []),
                        ...pageLang.map(
                            w => literal(`"ShopProduct->Product".product_name->>'${w}' iLIKE '%${search}%'`),
                        )
                    ]
                },
                order: [[sort, order]]
            });

            await handleSaveLog(request, [[action, '', request.query], '']);

            return utilSetFastifyResponseJson("success", paginate(findDocuments, limit, page));
        }
    }
    catch (error) {
        await handleSaveLog(request, [[action, '', request.query], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopInventoryPurchasingPreOrderProductListAll;