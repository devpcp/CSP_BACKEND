const { verifyAccessToken } = require("../hooks/auth");
/**
 * Route => /api/upload
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const downloadRouter = async (app) => {

    // Route [GET] => /api/upload/all
    app.route({
        method: "GET",
        url: "/",
        schema: require("../models/Download/Model.Schema.Download").download,
        handler: require("../handlers/handler.Download.File")
    });
};

module.exports = downloadRouter;