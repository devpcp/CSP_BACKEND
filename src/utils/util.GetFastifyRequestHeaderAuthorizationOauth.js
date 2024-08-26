const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { config_access_token_secret_oauth } = require("../config");

/**
 * Private key's The Access token
 * @type {string}
 */
const ACCESS_TOKEN_SECRET_OAUTH = config_access_token_secret_oauth;

/**
 * A utility to get header "Authorization" from fastify request's header
 * @template T
 * @param {import("fastify").FastifyRequest<T> | import("fastify").FastifyRequest} request
 * @param {object?} options
 * @param {boolean?} options.verifyToken - Do verify this token if not correct this will be throw error
 * @param {boolean?} options.verifyTokenWithoutTime - Do verify this token without check time expiration if not correct this will be throw error
 * @param {boolean?} options.raw - Do attach "raw" object in to output, says this is the string of "access_token"
 * @return {Promise<import("jsonwebtoken").JwtPayload<{aud: string, exp: number, iat: number, raw?: string}>|null>}
 */
const utilGetFastifyRequestHeaderAuthorizationOauth = async (request, options) => {
    const headerAuthorization = request.headers["authorization"];
    const currentTime = Date.now();
    if (!headerAuthorization) { return null; }
    else {
        const preAccessToken = headerAuthorization.split("Bearer ");
        if (preAccessToken.length !== 2) { return null; }
        else {
            if (_.isPlainObject(options)) {
                if (_.isBoolean(options.verifyToken)) {
                    jwt.verify(preAccessToken[1], ACCESS_TOKEN_SECRET_OAUTH, { clockTimestamp: currentTime, algorithms: ["HS256"] });
                }
                if (_.isBoolean(options.verifyTokenWithoutTime)) {
                    jwt.verify(preAccessToken[1], ACCESS_TOKEN_SECRET_OAUTH, { algorithms: ["HS256"] });
                }
                if (_.isBoolean(options.raw)) {
                    return { rawType: "Bearer", raw: preAccessToken[1] };
                }
            }

            /**
             * @type {import("jsonwebtoken").JwtPayload<{aud: string, exp: number, iat: number}>}
             */
            const accessToken = jwt.decode(preAccessToken[1], { json: true });

            if (_.isPlainObject(options)) {
                if (_.isBoolean(options.raw)) {
                    return { ...accessToken, raw: preAccessToken[1] };
                }
            }

            return accessToken;
        }
    }
};

module.exports = utilGetFastifyRequestHeaderAuthorizationOauth;