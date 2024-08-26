const { verifyAccessToken } = require("../hooks/auth");
/**
 * Route => /api/upload
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const routerUpload = async (app) => {
    // Route [POST] => /api/upload/file
    app.route({
        method: "POST",
        url: "/file",
        schema: require("../models/Upload/Model.Schema.Upload").file,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Upload.File")
    });
    // Route [GET] => /api/upload/all
    app.route({
        method: "GET",
        url: "/all",
        schema: require("../models/Upload/Model.Schema.Upload").all,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Upload.All")
    });
    // Route [POST] => /api/upload/fileCustomPath
    app.route({
        method: "POST",
        url: "/fileCustomPath",
        schema: require("../models/Upload/Model.Schema.Upload").file_custome_path,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Upload.File.V3")
    });
    // Route [DELETE] => /api/upload/deleteFile/:path
    app.route({
        method: "DELETE",
        url: "/deleteFile",
        schema: require("../models/Upload/Model.Schema.Upload").delete_file,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Upload.File.Delete")
    });
};

module.exports = routerUpload;