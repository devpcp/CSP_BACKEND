const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');

/**
 * Route => /api/
 * @param {import("fastify").FastifyInstance} app
 */
const shopAppointmentRouters = async (app) => {


    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/ShopAppointment/Model.Schema.ShopAppointment").all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopAppointment").handlerAll
    });

    app.route({
        method: "POST",
        url: "/add",
        schema: require("../models/ShopAppointment/Model.Schema.ShopAppointment").add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopAppointment").handlerAdd
    });

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: require("../models/ShopAppointment/Model.Schema.ShopAppointment").byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopAppointment").handlerById
    });

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: require("../models/ShopAppointment/Model.Schema.ShopAppointment").put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/shopAppointment").handlerPut
    });
};


module.exports = shopAppointmentRouters;