const { lineAPIGetAccessToken, lineAPIGetUserProfile, getLineSessionState } = require("../utils/util.LineAPI");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { isPlainObject } = require("lodash");
const { handleSaveLog } = require("./log");
const { config_line_login_api_callback_url_error } = require("../config");

/**
 * It gets the access token from LINE Login, and returns it to the client.
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request - The request object.
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault} reply - The reply object is used to send a response back to the client.
 * @param {import("fastify").FastifyInstance} app - The fastify instance
 * @returns a JSON object with the key "success" and the value of the getLineAccessToken variable.
 */
const serviceAuthOAuthLineLoginCallback = async (request, reply, app) => {
    const action = 'get oauth lineLoginCallback';

    try {
        if (request.query["error"]) {
            await handleSaveLog(request, [[action], `error : ${request.query}`]);

            if (config_line_login_api_callback_url_error) {
                reply.redirect(config_line_login_api_callback_url_error);
                return;
            }
            else {
                return utilSetFastifyResponseJson("failed", request.query);
            }
        }

        const code = request.query.code;
        const state = request.query.state;

        const getLineAccessToken = await lineAPIGetAccessToken(app, code, state);
        const getLineUserProfile = await lineAPIGetUserProfile(app, getLineAccessToken.access_token);

        const getSessionState = getLineSessionState(state)
        if (isPlainObject(getSessionState) && getSessionState.redirect_uri) {
            const redirect_uri = new URL(getSessionState.redirect_uri);
            const params_RedirectURL = new URL(redirect_uri.searchParams.get('redirect_uri'));
            params_RedirectURL.searchParams.set('userId', getLineUserProfile.userId);
            params_RedirectURL.searchParams.set('displayName', getLineUserProfile.displayName);
            redirect_uri.searchParams.set('redirect_uri', params_RedirectURL.href);

            await handleSaveLog(request, [[action], '']);

            reply.redirect(redirect_uri.href);
        }
        else {
            await handleSaveLog(request, [[action], '']);

            return utilSetFastifyResponseJson("success", { userId: getLineUserProfile.userId });
        }
    } catch (error) {
        console.error(error);
        await handleSaveLog(request, [[action], `error : ${error.toString()} -> ${error.stack}`]);

        if (config_line_login_api_callback_url_error) {
            reply.redirect(config_line_login_api_callback_url_error);
        }
        else {
            throw error;
        }
    }
};

/**
 * It takes the request and reply objects from the fastify server, and passes them to the serviceAuthOAuthLineLoginCallback
 * function, along with the app object
 * @param {import("fastify").FastifyInstance} app - The fastify instance
 * @returns The function createInstanceCallback is being returned.
 */
const handlerAuthOAuthLineLoginCallback = (app) => {
    /**
     * It takes the request and reply objects from the Hapi server, and passes them to the
     * serviceAuthOAuthLineLoginCallback function, along with the app object
     * @param {import("fastify").FastifyRequest} request - The request object from the HTTP request.
     * @param {import("fastify").FastifyReply} reply - The reply object from the HapiJS framework.
     * @returns the result of the serviceAuthOAuthLineLoginCallback function.
     */
    const createInstanceCallback = async (request, reply) => {
        return serviceAuthOAuthLineLoginCallback(request, reply, app);
    };

    return createInstanceCallback;
};


module.exports = handlerAuthOAuthLineLoginCallback;