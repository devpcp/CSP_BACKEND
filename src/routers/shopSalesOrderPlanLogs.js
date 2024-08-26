const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');

/**
 * Route => /api/shopSalesOrderPlanLogs
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopSalesOrderPlanRouters = async (app) => {
    // Route [POST] => /api/shopSalesOrderPlanLogs/add
    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopSalesOrderPlanLogs/Model.Schema.ShopSalesOrderPlanLogs").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesOrderPlanLogs.Add")
    });
    // Route [GET] => /api/shopSalesOrderPlanLogs/all
    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopSalesOrderPlanLogs/Model.Schema.ShopSalesOrderPlanLogs").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesOrderPlanLogs.All")
    });
    // Route [GET] => /api/shopSalesOrderPlanLogs/byid/:id
    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopSalesOrderPlanLogs/Model.Schema.ShopSalesOrderPlanLogs").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesOrderPlanLogs.ById")
    });
    // Route [PUT] => /api/shopSalesOrderPlanLogs/put/:id
    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopSalesOrderPlanLogs/Model.Schema.ShopSalesOrderPlanLogs").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesOrderPlanLogs.Put")
    });
};

module.exports = shopSalesOrderPlanRouters;