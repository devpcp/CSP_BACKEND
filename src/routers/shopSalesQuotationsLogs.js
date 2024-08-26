const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');

/**
 * Route => /api/shopSalesQuotationsLogs
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopShopSalesQuotationsLogsRouters = async (app) => {
    // Route [POST] => /api/shopSalesQuotationsLogs/add
    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopSalesQuotationsLogs/Model.Schema.ShopSalesQuotationsLogs").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesQuotationsLogs.Add")
    });
    // Route [GET] => /api/shopSalesQuotationsLogs/all
    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopSalesQuotationsLogs/Model.Schema.ShopSalesQuotationsLogs").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesQuotationsLogs.All")
    });
    // Route [GET] => /api/shopSalesQuotationsLogs/byid/:id
    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopSalesQuotationsLogs/Model.Schema.ShopSalesQuotationsLogs").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesQuotationsLogs.ById")
    });
    // Route [PUT] => /api/shopSalesQuotationsLogs/put/:id
    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopSalesQuotationsLogs/Model.Schema.ShopSalesQuotationsLogs").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesQuotationsLogs.Put")
    });
};

module.exports = shopShopSalesQuotationsLogsRouters;