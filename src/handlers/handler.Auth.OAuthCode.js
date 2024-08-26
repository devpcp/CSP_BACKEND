const {
    handleSaveLog,
} = require("./log");

const {
    isUUID,
} = require("../utils/generate");
const {
    COAuthCodeSession,
} = require("../utils/util.EngineOAuthCodeSession");

const modelOAuth = require("../models/model").Oauth;
const utilGetFastifyRequestHeaderOrigin = require("../utils/util.GetFastifyRequestHeaderOrigin");
const { isString, uniq } = require("lodash");


/**
 * A handler (Controller) to handle open session of OAuth code and redirect HTTP from request "redirect_uri"
 * - [GET] => /api/oauth
 * @param {import("../types/type.Handler.Auth").IHandlerAuthOAuthCodeRequest} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault} reply
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<string>|import("fastify").FastifyReply>} - Reply with json by error OR redirect url
 */
const handlerAuthOAuthCode = async (request, reply) => {
    try {
        const client_id = request.query.client_id || "";
        const redirect_uri = request.query.redirect_uri || "";
        const origin = utilGetFastifyRequestHeaderOrigin(request);
        const scope = request.query.scope || "guest";

        /**
         * A regular expression to check is URL from HTTP/HTTPS protocol
         * @type {RegExp}
         */
        const regexURI = /https?:\/\/(?:w{1,3}\.)?[^\s.]+(?:\.[a-z]+)*(?::\d+)?((?:\/\w+)|(?:-\w+))*\/?(?![^<]*(?:<\/\w+>|\/?>))/ig;

        if (!isUUID(client_id)) {
            throw Error('client_id not allowed');
        }
        else if (!regexURI.test(redirect_uri)) {
            throw Error('redirect_uri not allowed');
        }
        else if (scope !== "guest") {
            throw Error('scope not allowed');
        }
        else {
            const findOAuth = await modelOAuth.findOne({
                where: {
                    client_id: client_id
                }
            });

            if (!findOAuth) {
                throw Error('client_id not found');
            }
            else {
                // const splitSiteWhiteLists = findOAuth.site_whitelist.split(',').filter(w => w !== "");
                // if (!splitSiteWhiteLists.includes(redirect_uri)) {
                //     throw Error('redirect_uri not allow');
                // }
                const instanceRedirectURI = new URL(redirect_uri);

                /**
                 * @type {string[]}
                 */
                const allowedSiteOrigins = isString(findOAuth.site_whitelist) ? uniq(findOAuth.site_whitelist.split(",").map(w => new URL(w).origin)) : [];
                /**
                 * @type {string[]}
                 */
                const allowedSiteURLs = isString(findOAuth.site_whitelist) ? uniq(findOAuth.site_whitelist.split(",").map(w => new URL(w).origin + new URL(w).pathname.replace(/\/{1}$/, ''))) : [];


                if (!allowedSiteOrigins.includes(instanceRedirectURI.origin)) {
                    throw Error('origin not allow');
                }
                else if (!allowedSiteURLs.includes(instanceRedirectURI.origin + instanceRedirectURI.pathname.replace(/\/{1}$/, ''))) {
                    throw Error('redirect_uri not allow');
                }
                else {
                    /**
                     * A created instance of class "COAuthCodeSession"
                     * @type {COAuthCodeSession}
                     */
                    const OAuthInstance = new COAuthCodeSession(
                        findOAuth.client_id,
                        findOAuth.client_secret,
                        {
                            redirect_uri: redirect_uri,
                            origin: origin,
                            scope: scope
                        }
                    );
                    await OAuthInstance.doSignIn();

                    return reply.redirect(`${redirect_uri}?code=${OAuthInstance.code}`);
                }
            }
        }
    } catch (error) {
        await handleSaveLog(request, [["get oauth"], `error : ${error}`]);
        throw error;
    }
};

module.exports = handlerAuthOAuthCode;