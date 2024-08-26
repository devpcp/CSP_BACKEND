const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');

/**
 * Route => /api/shopHqRouters
 * @param {import("fastify").FastifyInstance} app
 */
const shopHqRouters = async (app) => {


    app.route({
        method: "GET",
        url: "/all_raw",
        schema: require("../models/ShopHq/schema").all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopHq").handleAllRaw
    });

    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopHq/schema").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopHq").handleAll
    });

    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopHq/schema").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopHq").handleAdd
    });

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopHq/schema").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopHq").handleById
    });

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopHq/schema").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopHq").handlePut
    });
};


module.exports = shopHqRouters;