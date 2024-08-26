const { get } = require("lodash");
const { lineAPICreateLogin } = require("../utils/util.LineAPI");
const { handleSaveLog } = require("./log");
const { config_line_login_api_callback_url_error } = require("../config");

/**
 * It creates a URL for the user to login to LINE, and then redirects the user to that URL
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request - The fastify request object.
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault} reply - The fastify reply object is used to send a response to the client.
 */
const handlerAuthOAuthLineLogin = async (request, reply) => {
    const action = 'get oauth lineLogin';

    try {
        /**
         * It creates a URL for the user to login to LINE, and then redirects the user to that URL
         * @type {string|null}
         */
        const redirect_uri = get(request, "query.redirect_uri", null);
        const getLineLoginURL = await lineAPICreateLogin(redirect_uri);

        await handleSaveLog(request, [[action], '']);

        reply.redirect(getLineLoginURL);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error}`]);

        if (config_line_login_api_callback_url_error) {
            reply.redirect(config_line_login_api_callback_url_error);
        }
        else {
            throw error;
        }
    }
};


module.exports = handlerAuthOAuthLineLogin;