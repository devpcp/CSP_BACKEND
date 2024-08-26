const _ = require("lodash");
const jwt = require("jsonwebtoken");

const {
    config_access_token_secret,
    config_access_token_issuer_url,
    config_access_token_secret_oauth,
} = require("../config");

const utilGetFastifyRequestHeaderOrigin = require("./util.GetFastifyRequestHeaderOrigin");
const utilConvertJwtAudience = require("./util.ConvertJwtAudience");

const modelOauth = require("../models/model").Oauth;
const modelUser = require("../models/model").User;

/**
 * The issuer who is generator Jwt tokens
 * @type {string}
 */
const ACCESS_TOKEN_ISSUER = config_access_token_issuer_url;

/**
 * Private key's The Access token
 * @type {string}
 */
const ACCESS_TOKEN_SECRET = config_access_token_secret;

/**
 * Private key's The Access token via OAuth
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
 * @return {Promise<import("../types/type.Default.JwtPayload").IJwtPayloadDefault<{rawType?: string, raw?: string}> | null>}
 */
const utilGetFastifyRequestHeaderAuthorization = async (request, options) => {
    const currentTime = Date.now();
    const headerAuthorization = request.headers["authorization"];
    const headerOrigin = utilGetFastifyRequestHeaderOrigin(request);
    console.log('headerOrigin')
    console.log(headerOrigin)

    if (!headerAuthorization) { return null; }
    else {
        const preAccessToken = headerAuthorization.split("Bearer ");
        if (preAccessToken.length !== 2) { return null; }
        else {
            /**
             * @type {import("../types/type.Default.JwtPayload").ISchemaJwtPayloadDefault | null}
             */
            const accessToken = jwt.decode(preAccessToken[1], { json: true });

            if (_.isPlainObject(options)) {
                // Conditions -> Options: verifyToken
                if (_.isBoolean(options.verifyToken)) {
                    if (accessToken.scope === "default") {
                        const checkUserId = await modelUser.findOne({
                            where: {
                                id: accessToken.sub
                            }
                        });

                        if (!checkUserId) { throw Error(`Jwt sub is not found`); }
                        else {
                            jwt.verify(
                                preAccessToken[1],
                                ACCESS_TOKEN_SECRET,
                                {
                                    issuer: ACCESS_TOKEN_ISSUER,
                                    subject: checkUserId.id,
                                    audience: utilGetFastifyRequestHeaderOrigin(request),
                                    clockTimestamp: currentTime,
                                    algorithms: ["HS256"]
                                }
                            );
                        }
                    }
                    else if (accessToken.scope === "guest") {
                        const checkClientId = await modelOauth.findOne({
                            where: {
                                user_id: accessToken.sub,
                                client_id: accessToken.client_id
                            }
                        });

                        if (!checkClientId) { throw Error(`Jwt sub is not found`); }
                        else if (headerOrigin && !utilConvertJwtAudience(checkClientId.site_whitelist).includes(headerOrigin)) {
                            throw Error(`Jwt aud is not found`);
                        }
                        else {
                            jwt.verify(
                                preAccessToken[1],
                                ACCESS_TOKEN_SECRET_OAUTH,
                                {
                                    issuer: ACCESS_TOKEN_ISSUER,
                                    subject: checkClientId.user_id,
                                    audience: utilConvertJwtAudience(checkClientId.site_whitelist),
                                    clockTimestamp: currentTime,
                                    algorithms: ["HS256"]
                                }
                            );
                        }
                    }
                    else {
                        throw Error(`Token is out of scope`);
                    }
                }
                // Conditions -> Options: verifyTokenWithoutTime
                if (_.isBoolean(options.verifyTokenWithoutTime)) {
                    if (accessToken.scope === "default") {
                        const checkUserId = await modelUser.findOne({
                            where: {
                                id: accessToken.sub
                            }
                        });

                        if (!checkUserId) { throw Error(`Jwt sub is not found`); }
                        else {
                            jwt.verify(
                                preAccessToken[1],
                                ACCESS_TOKEN_SECRET,
                                {
                                    issuer: ACCESS_TOKEN_ISSUER,
                                    subject: checkUserId.id,
                                    audience: utilGetFastifyRequestHeaderOrigin(request),
                                    algorithms: ["HS256"]
                                }
                            );
                        }
                    }
                    else if (accessToken.scope === "guest") {
                        const checkClientId = await modelOauth.findOne({
                            where: {
                                user_id: accessToken.sub,
                                client_id: accessToken.client_id
                            }
                        });

                        if (!checkClientId) { throw Error(`Jwt sub is not found`); }
                        else if (!utilConvertJwtAudience(checkClientId.site_whitelist).includes(headerOrigin)) { throw Error(`Jwt aud is not found`); }
                        else {
                            jwt.verify(
                                preAccessToken[1],
                                ACCESS_TOKEN_SECRET_OAUTH,
                                {
                                    issuer: ACCESS_TOKEN_ISSUER,
                                    subject: checkClientId.user_id,
                                    audience: utilConvertJwtAudience(checkClientId.site_whitelist),
                                    algorithms: ["HS256"]
                                }
                            );
                        }
                    }
                    else {
                        throw Error(`Token is out of scope`);
                    }
                }
                // Conditions -> Options: raw
                if (_.isBoolean(options.raw)) {
                    return { rawType: "Bearer", raw: preAccessToken[1] };
                }
            }

            if (_.isPlainObject(options)) {
                if (_.isBoolean(options.raw)) {
                    return { ...accessToken, raw: preAccessToken[1] };
                }
            }

            return accessToken;
        }
    }
};

module.exports = utilGetFastifyRequestHeaderAuthorization;