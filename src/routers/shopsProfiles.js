const {verifyAccessToken} = require("../hooks/auth");
const {verifyAccessPermission} = require("../hooks/permission");

const {
    add,
    all,
    byid,
    put,
} = require("../models/ShopsProfiles/schema");

const {
    shopsProfilesAdd,
    shopsProfilesAll,
    shopsProfilesById,
    shopsProfilesPut
} = require("../handlers/shopsProfiles");

/**
 * Route => /api/shopsProfiles
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopsProfilesRouters = async (app) => {
    // Route [POST] => /api/shopsProfiles/add
    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken],
        handler: shopsProfilesAdd
    });
    // Route [GET] => /api/shopsProfiles/all
    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: shopsProfilesAll
    });
    // Route [GET] => /api/shopsProfiles/byid/:id
    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: shopsProfilesById
    });
    // Route [PUT] => /api/shopsProfiles/put/:id
    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: shopsProfilesPut
    });
};

module.exports = shopsProfilesRouters;