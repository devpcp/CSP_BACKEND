const {
    handleSaveLog,
} = require("./log");

const utilGetFastifyRequestShopCodeId = require("../utils/util.GetFastifyRequestShopCodeId");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelShopProfiles = require("../models/model").ShopsProfiles;
const modelProducts = require("../models/model").Product;
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;
const modelShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const modelShopProducts = require("../models/model").ShopProduct;


/**
 * A handler to list shopSalesOrderPlanLogs from database by params request id
 * - Route [GET] => /api/shopSalesOrderPlan/all
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopSalesOrderPlanLogs>>}
 */
const handlerShopSalesOrderPlanLogsById = async (request) => {
    const handlerName = "get shopSalesOrderPlanLogs byid";

    try {
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = await utilGetFastifyRequestShopCodeId(request);
        /**
         * A class's dynamics instance of model "ShopSalesTransactionDoc"
         */
        const instanceModelShopSalesTransactionDoc = modelShopSalesTransactionDoc(table_name);
        /**
         * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
         */
        const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);
        /**
         * A class's dynamics instance of model "ShopProducts"
         */
        const instanceModelShopProducts = modelShopProducts(table_name);

        const findShopSalesOrderPlanLogs = await instanceModelShopSalesOrderPlanLogs.findOne({
            attributes: {
                include: [
                    ...utilGetCreateByAndUpdatedByFromModel(instanceModelShopSalesOrderPlanLogs, { projectUpdated_by: false }),
                ]
            },
            include: [
                {
                    model: modelShopProfiles,
                    as: 'ShopsProfiles'
                },
                {
                    model: instanceModelShopProducts,
                    as: 'ShopProducts',
                    include: [
                        { model: modelProducts }
                    ]
                },
                {
                    model: instanceModelShopSalesTransactionDoc,
                    as: 'ShopSalesTransactionDoc'
                }
            ],
            where: {
                id: request.params.id
            }
        });

        await handleSaveLog(request, [[handlerName], ""]);

        return utilSetFastifyResponseJson("success", findShopSalesOrderPlanLogs);
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopSalesOrderPlanLogsById;