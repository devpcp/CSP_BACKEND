const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');

/**
 * @param {import("fastify").FastifyInstance} app
 */
const shopInventoryTransactionRouters = async (app) => {
    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopInventoryPurchasingPreOrderProductList/Model.Schema.ShopInventoryPurchasingPreOrderProductList").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderProductList.Add")
    });

    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopInventoryPurchasingPreOrderProductList/Model.Schema.ShopInventoryPurchasingPreOrderProductList").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderProductList.All")
    });

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopInventoryPurchasingPreOrderProductList/Model.Schema.ShopInventoryPurchasingPreOrderProductList").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderProductList.ById")
    });

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopInventoryPurchasingPreOrderProductList/Model.Schema.ShopInventoryPurchasingPreOrderProductList").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderProductList.Put")
    });

    app.route({
        method: "DELETE",
        url: "/delete/:id",
        schema: require("../models/ShopInventoryPurchasingPreOrderProductList/Model.Schema.ShopInventoryPurchasingPreOrderProductList").del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopInventoryPurchasingPreOrderProductList.Delete")
    });
};

module.exports = shopInventoryTransactionRouters;