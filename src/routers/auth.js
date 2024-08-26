const {
    handleRegisterOauth,
    handleOauth,
    handleOauthToken,
    handleOauthAll,
    handleOauthById,
    handleOauthPut
} = require('../handlers/auth');
const { verifyAccessToken } = require('../hooks/auth');
const { register_oauth, token, oauth, OauthAll, OauthById, OauthPut, OauthLineCallback, OAuthLine, line_notify, line_message } = require('../models/Users/schema');

/**
 * @param {import("fastify").FastifyInstance} app 
 */
const authRouters = async (app) => {
    // Route [POST] => /api/login
    app.route({
        method: "POST",
        url: "/login",
        schema: require("../models/Login/Model.Schema.Login").login,
        // preHandler: [],
        handler: require("../handlers/handler.Auth.Login")
    });
    // Route [GET] => /api/logout
    app.route({
        method: "GET",
        url: "/logout",
        schema: require("../models/Logout/Model.Schema.Logout").logout,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Auth.Logout")
    });

    // Route [POST] => /api/token/access_token
    app.route({
        method: "POST",
        url: "/token/access_token",
        schema: require("../models/Token/AccessToken/Model.Schema.Token.AccessToken").access_token,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Auth.AccessToken")
    });

    // Route [POST] => /api/oauth/register
    app.route({
        method: "POST",
        url: "/oauth/register",
        schema: register_oauth,
        preHandler: [verifyAccessToken],
        handler: handleRegisterOauth
    });
    // Route [GET] => /api/oauth/all
    app.route({
        method: "GET",
        url: "/ouath/all",
        schema: OauthAll,
        preHandler: [verifyAccessToken],
        handler: handleOauthAll
    });
    // Route [GET] => /api/oauth/byid/:id
    app.route({
        method: "GET",
        url: "/ouath/byid/:id",
        schema: OauthById,
        preHandler: [verifyAccessToken],
        handler: handleOauthById
    });
    // Route [PUT] => /api/oauth/put/:id
    app.route({
        method: "PUT",
        url: "/ouath/put/:id",
        schema: OauthPut,
        preHandler: [verifyAccessToken],
        handler: handleOauthPut
    });
    // Route [GET] => /api/oauth
    app.route({
        method: "GET",
        url: "/oauth",
        schema: oauth,
        // preHandler: [],
        handler: require("../handlers/handler.Auth.OAuthCode")
    });
    // Route [POST] => /api/oauth/token
    app.route({
        method: "POST",
        url: "/oauth/token",
        schema: token,
        // preHandler: [],
        handler: require("../handlers/handler.Auth.OAuthToken")
    });
    // Route [GET] => /api/oauth/line
    app.route({
        method: "GET",
        url: "/oauth/line",
        schema: OAuthLine,
        // preHandler: [],
        handler: require("../handlers/handler.Auth.OAuthLineLogin")
    });
    // Route [GET] => /api/oauth/line/callback
    app.route({
        method: "GET",
        url: "/oauth/line/callback",
        schema: OauthLineCallback,
        // preHandler: [],
        handler: require("../handlers/handler.Auth.OAuthLineLogin.Callback")(app)
    });

    app.route({
        method: "POST",
        url: "/line/notify",
        schema: line_notify,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Auth.LintNotify")
    });

    app.route({
        method: "POST",
        url: "/line/message/:line_user_id",
        schema: line_message,
        preHandler: [verifyAccessToken],
        handler: require("../handlers/handler.Auth.LineMessage")
    });
}

module.exports = authRouters

