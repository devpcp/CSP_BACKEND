const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    add_by_file,
    all
} = require('../models/ShopLegacySalesOut/Model.Schema.ShopLegacySalesOut');
const handlerShopLegacySalesOutAdd = require('../handlers/handler.ShopLegacySalesOut.Add');
const handlerShopLegacySalesOutAll = require('../handlers/handler.ShopLegacySalesOut.All');

/**
 * Route => /api/shopSalesTransactionDoc
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopLegacySalesOut = async (app) => {
    // Route [POST] => /api/shopLegacySalesOut/add
    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopLegacySalesOutAdd
    });

    // Route [GET] => /api/shopLegacySalesOut/addByFile
    app.route({
        method: "POST",
        url: "/addByFile",
        schema: add_by_file,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopLegacySalesOutAdd
    });

    // Route [GET] => /api/shopLegacySalesOut/all
    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopLegacySalesOutAll
    });

    // // Route [GET] => /api/shopSalesTransactionDoc/all
    // app.route({
    //     method: "GET",
    //     url: "/all",
    //     schema: require("../models/ShopSalesTransactionDoc/Model.Schema.ShopSalesTransactionDoc").all,
    //     preHandler: [verifyAccessToken, verifyAccessPermission],
    //     handler: require("../handlers/handler.ShopSalesTransactionDoc.All")
    // });
    //
    // // Route [GET] => /api/shopSalesTransactionDoc/byid/:id
    // app.route({
    //     method: "GET",
    //     url: "/byid/:id",
    //     schema: require("../models/ShopSalesTransactionDoc/Model.Schema.ShopSalesTransactionDoc").byid,
    //     preHandler: [verifyAccessToken, verifyAccessPermission],
    //     handler: require("../handlers/handler.ShopSalesTransactionDoc.ById")
    // });
    //
    // // Route [PUT] => /api/shopSalesTransactionDoc/put/:id
    // app.route({
    //     method: "PUT",
    //     url: "/put/:id",
    //     schema: require("../models/ShopSalesTransactionDoc/Model.Schema.ShopSalesTransactionDoc").put,
    //     preHandler: [verifyAccessToken, verifyAccessPermission],
    //     handler: require("../handlers/handler.ShopSalesTransactionDoc.Put")
    // });
};

module.exports = shopLegacySalesOut;