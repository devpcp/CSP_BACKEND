const { verifyAccessToken } = require("../hooks/auth");
const { verifyAccessPermission } = require("../hooks/permission");

/**
 * Route => /api/shopPersonalCustomers
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopPersonalCustomersRouters = async (app) => {
    // Route [POST] => /api/shopPersonalCustomers/add
    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopPersonalCustomers/Model.Schema.ShopPersonalCustomers").add,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.ShopPersonalCustomers.Add")
    });
    // Route [POST] => /api/shopBusinessCustomers/addByFile
    app.route({
        method: "POST",
        url: "/addByFile",
        schema: require("../models/ShopPersonalCustomers/Model.Schema.ShopPersonalCustomers").add_by_file,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.ShopPersonalCustomers.AddByFile")
    });
    // Route [GET] => /api/shopPersonalCustomers/all
    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopPersonalCustomers/Model.Schema.ShopPersonalCustomers").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopPersonalCustomers.All")
    });
    // Route [GET] => /api/shopPersonalCustomers/byid/:id
    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopPersonalCustomers/Model.Schema.ShopPersonalCustomers").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopPersonalCustomers.ById")
    });
    // Route [PUT] => /api/shopPersonalCustomers/put/:id
    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopPersonalCustomers/Model.Schema.ShopPersonalCustomers").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopPersonalCustomers.Put")
    });
};


module.exports = shopPersonalCustomersRouters;