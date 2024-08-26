const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const preHandlerShopSalesTransactionDocAdd = require("../preHandlers/preHandler.ShopSalesTransactionDoc.Add");

/**
 * Route => /api/shopSalesTransactionDoc
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopSalesTransactionDoc = async (app) => {
    // Route [POST] => /api/shopSalesTransactionDoc/add
    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopSalesTransactionDoc/Model.Schema.ShopSalesTransactionDoc").add,
        preHandler: [verifyAccessToken, verifyAccessPermission, preHandlerShopSalesTransactionDocAdd],
        handler: require("../handlers/handler.ShopSalesTransactionDoc.Add")
    });

    // Route [GET] => /api/shopSalesTransactionDoc/all
    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopSalesTransactionDoc/Model.Schema.ShopSalesTransactionDoc").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesTransactionDoc.All")
    });

    // Route [GET] => /api/shopSalesTransactionDoc/byid/:id
    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopSalesTransactionDoc/Model.Schema.ShopSalesTransactionDoc").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesTransactionDoc.ById")
    });

    // Route [PUT] => /api/shopSalesTransactionDoc/put/:id
    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopSalesTransactionDoc/Model.Schema.ShopSalesTransactionDoc").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesTransactionDoc.Put")
    });

    app.route({
        method: "GET",
        url: "/easy-search",
        schema: require("../models/ShopSalesTransactionDoc/Model.Schema.ShopSalesTransactionDoc").easySearch,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopSalesTransactionDoc.EasySearch")
    })
};

module.exports = shopSalesTransactionDoc;