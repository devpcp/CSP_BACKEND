const { verifyAccessToken } = require("../hooks/auth");
const { verifyAccessPermission } = require("../hooks/permission");

/**
 * Route => /api/shopBusinessPartners
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopBusinessPartnersRouters = async (app) => {
    // Route [POST] => /api/shopBusinessPartners/add
    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopBusinessPartners/Model.Schema.ShopBusinessPartners").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopBusinessPartners.Add")
    });
    // Route [POST] => /api/shopBusinessPartners/addByFile
    app.route({
        method: "POST",
        url: "/addByFile",
        schema: require("../models/ShopBusinessPartners/Model.Schema.ShopBusinessPartners").add_by_file,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.ShopBusinessPartners.AddByFile")
    });
    // Route [GET] => /api/shopBusinessPartners/all
    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopBusinessPartners/Model.Schema.ShopBusinessPartners").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopBusinessPartners.All")
    });
    // Route [GET] => /api/shopBusinessPartners/byid/:id
    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopBusinessPartners/Model.Schema.ShopBusinessPartners").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopBusinessPartners.ById")
    });
    // Route [GET] => /api/shopBusinessPartners/put/:id
    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopBusinessPartners/Model.Schema.ShopBusinessPartners").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.ShopBusinessPartners.Put")
    });
};


module.exports = shopBusinessPartnersRouters;