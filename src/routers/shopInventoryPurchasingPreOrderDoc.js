const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');

/**
 * @param {import("fastify").FastifyInstance} app
 */
const shopInventoryTransactionRouters = async (app) => {
    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopInventoryPurchasingPreOrderDoc/Model.Schema.ShopInventoryPurchasingPreOrderDoc").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderDoc.Add")
    });

    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopInventoryPurchasingPreOrderDoc/Model.Schema.ShopInventoryPurchasingPreOrderDoc").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderDoc.All")
    });

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopInventoryPurchasingPreOrderDoc/Model.Schema.ShopInventoryPurchasingPreOrderDoc").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderDoc.ById")
    });

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopInventoryPurchasingPreOrderDoc/Model.Schema.ShopInventoryPurchasingPreOrderDoc").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderDoc.Put")
    });

};

module.exports = shopInventoryTransactionRouters;