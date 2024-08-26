const {
    Op,
} = require("sequelize");
const _ = require("lodash");

const {
    handleSaveLog,
} = require("./log");

const {
    paginate,
    generateSearchOpFromKeys
} = require("../utils/generate");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilGetFastifyRequestShopCodeId = require("../utils/util.GetFastifyRequestShopCodeId");
const utilGetSequelizeQueryJsonField = require("../utils/util.GetSequelizeQueryJsonField");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelShopProfiles = require("../models/model").ShopsProfiles;
const modelProducts = require("../models/model").Product;
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;
const modelShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const modelShopProducts = require("../models/model").ShopProduct;


/**
 * A handler to list shopSalesOrderPlanLogs from database
 * - Route [POST] => /api/shopSalesOrderPlanLogs/all
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<{pages: number, currentCount: number, currentPage: number, totalCount: number, data:  ShopSalesOrderPlanLogs[]}>>}
 */
const handlerShopSalesOrderPlanLogsAll = async (request) => {
    const handlerName = "get shopSalesOrderPlanLogs all";

    try {
        // Init data as requested
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        const search = request.query.search || "";
        const status = ['0', '1', '2'].includes(request.query.status) ? { status: +request.query.status } : {};
        const sort = request.query.sort || "created_date";
        const order = request.query.order || "asc";
        const limit = +request.query.limit || 10;
        const page = +request.query.page || 1;
        const jsonField = {
            details: utilGetSequelizeQueryJsonField(_.get(request.query, "jsonField.details", "")),
            warehouse_detail: utilGetSequelizeQueryJsonField(_.get(request.query, "jsonField.warehouse_detail", "")),
        };

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

        const findShopSalesOrderPlanLogs = await instanceModelShopSalesOrderPlanLogs.findAll({
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
                ...status,
                details: {
                    [Op.or]: [
                        ...generateSearchOpFromKeys(jsonField.details, Op.iLike, `%${search}%`)
                    ]
                },
                warehouse_detail: {
                    [Op.or]: [
                        ...generateSearchOpFromKeys(jsonField.warehouse_detail, Op.iLike, `%${search}%`)
                    ]
                }
            },
            order: [[sort, order]]
        });

        await handleSaveLog(request, [[handlerName], ""]);

        return utilSetFastifyResponseJson("success", paginate(findShopSalesOrderPlanLogs, limit, page));
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopSalesOrderPlanLogsAll;