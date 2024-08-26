const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');

/**
 * Route => /api/validators
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const validatorsRouters = async (app) => {
    // Route [GET] => /api/validators/user
    app.route({
        method: "GET",
        url: "/user",
        schema: require("../models/Validators/Model.Schema.Validators").user,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Validators.User")
    });

    // Route [GET] => /api/validators/sub-domain
    app.route({
        method: "GET",
        url: "/sub-domain",
        schema: require("../models/Validators/Model.Schema.Validators").sub_domain,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require("../handlers/handler.Validators.SubDomain")
    });

};

module.exports = validatorsRouters;