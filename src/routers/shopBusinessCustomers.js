const { verifyAccessToken } = require("../hooks/auth");
const { verifyAccessPermission } = require("../hooks/permission");

/**
 * Route => /api/shopBusinessCustomers
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopBusinessCustomersRouters = async (app) => {
    // Route [POST] => /api/shopBusinessCustomers/add
    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopBusinessCustomers/Model.Schema.ShopBusinessCustomers").add,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.ShopBusinessCustomers.Add")
    });
    // Route [POST] => /api/shopBusinessCustomers/addByFile
    app.route({
        method: "POST",
        url: "/addByFile",
        schema: require("../models/ShopBusinessCustomers/Model.Schema.ShopBusinessCustomers").add_by_file,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.ShopBusinessCustomers.AddByFile")
    });
    // Route [GET] => /api/shopBusinessCustomers/all
    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopBusinessCustomers/Model.Schema.ShopBusinessCustomers").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopBusinessCustomers.All")
    });
    // Route [GET] => /api/shopBusinessCustomers/byid/:id
    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopBusinessCustomers/Model.Schema.ShopBusinessCustomers").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopBusinessCustomers.ById")
    });
    // Route [PUT] => /api/shopBusinessCustomers/put/:id
    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopBusinessCustomers/Model.Schema.ShopBusinessCustomers").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopBusinessCustomers.Put")
    });
};


module.exports = shopBusinessCustomersRouters;