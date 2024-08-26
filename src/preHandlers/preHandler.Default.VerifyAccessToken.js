const authErrors = require("../errors/auth");

const {
    handleSaveLog,
} = require("../handlers/log");
const customError = require("../utils/custom-error");

const {
    isUUID,
} = require("../utils/generate");
const {
    setAccessTokenSession,
} = require("../utils/util.EngineAccessTokenSession");
const utilGetFastifyRequestHeaderAuthorization = require("../utils/util.GetFastifyRequestHeaderAuthorization");

const {
    config_skip_verify_access_token,
    config_access_token_engine_session_time,
} = require("../config");

const modelUser = require("../models/model").User;

/**
 * A set of URL when you need to skip verify jwt by "expires_in"
 * @type {string[]}
 */
const enumURLSkipTimeCheck = [
    "/api/token/access_token",
];

/**
 * A set of URL when you want not allowed OAuth to access
 * @type {string[]}
 */
const enumURLBlacklistOAuth = [
    "/api/token/access_token",
];

/**
 * A set of URL when you want allowed OAuth to access
 * - Note: when you have set on this, the variable name "enumURLBlacklistOAuth" is not check
 * @type {string[]}
 */
const enumURLWhitelistOAuth = [
    // "/api/user/register",
];

/**
 * A preHandler to check access_token where attached in "Authorization" from fastify request's header
 * - Attached "request.id" when passed this preHandler
 * @template T
 * @param {import("fastify").FastifyRequest<T> | import("fastify").FastifyRequest} request
 * @return {Promise<boolean>}
 */
const preHandlerDefaultVerifyAccessToken = async (request) => {
    const objAccessToken = enumURLSkipTimeCheck.includes(request.url) ?
        await utilGetFastifyRequestHeaderAuthorization(request, { verifyTokenWithoutTime: true })
            .catch(
                async (error) => {
                    await handleSaveLog(request, [['verify access token'], `error : ${error}`]);
                    return null;
                }
            )
        :
        await utilGetFastifyRequestHeaderAuthorization(request, { verifyToken: !config_skip_verify_access_token })
            .catch(
                async (error) => {
                    await handleSaveLog(request, [['verify access token'], `error : ${error}`]);
                    return null;
                }
            );


    console.log('objAccessToken')

    console.log(objAccessToken)
    if (!objAccessToken || !isUUID(objAccessToken.sub)) {
        await handleSaveLog(request, [['verify access token'], 'Unauthorized']);
        return customError(authErrors.Unauthorized);
    }
    else if (objAccessToken.scope === "guest" && enumURLWhitelistOAuth.length === 0 && enumURLBlacklistOAuth.includes(request.url)) {
        await handleSaveLog(request, [['verify access token'], 'Unauthorized']);
        return customError(authErrors.Unauthorized);
    }
    else if (objAccessToken.scope === "guest" && enumURLWhitelistOAuth.length > 0 && !enumURLWhitelistOAuth.includes(request.url)) {
        await handleSaveLog(request, [['verify access token'], 'Unauthorized']);
        return customError(authErrors.Unauthorized);
    }
    else {
        const findUser = await modelUser.findOne(
            {
                where: {
                    id: objAccessToken.sub
                }
            }
        );
        if (!findUser) {
            await handleSaveLog(request, [['verify access token'], 'Unauthorized']);
            return customError(authErrors.Unauthorized);
        }
        else {
            await setAccessTokenSession(objAccessToken.sub, config_access_token_engine_session_time);

            /**
             * Attach userId in "id" from fastify's request to next preHandler/handler
             * @type {string}
             */
            request.id = objAccessToken.sub;

            return true;
        }
    }
};

module.exports = preHandlerDefaultVerifyAccessToken;