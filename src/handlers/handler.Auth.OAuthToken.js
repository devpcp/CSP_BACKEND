const {
    config_access_token_secret_oauth,
    config_session_types
} = require("../config");
const { Transaction } = require("sequelize");
const {
    handleSaveLog,
} = require("./log");

const _ = require("lodash");

const {
    isUUID,
} = require("../utils/generate");
const {
    getIMDBOAuthCodeSession,
} = require("../utils/util.EngineOAuthCodeSession");
const {
    COAuthRefreshTokenSession,
    getIMDBOAuthRefreshTokenSession
} = require("../utils/util.EngineOAuthRefreshTokenSession");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestIPAddress = require("../utils/util.GetFastifyRequestIPAddress");
const utilSetAccessToken = require("../utils/util.SetAccessToken");
const utilSetRefreshToken = require("../utils/util.SetRefreshToken");
const utilGetFastifyRequestHeaderOrigin = require("../utils/util.GetFastifyRequestHeaderOrigin");
const utilConvertJwtAudience = require("../utils/util.ConvertJwtAudience");

const modelOAuth = require("../models/model").Oauth;
const modelSessions = require("../models/model").Sessions;
const db = require("../db");

/**
 * An action in "grant_type" is allowed to do this "handlerAuthOAuthToken"
 * @type {string[]}
 */
const setAllowedGrantTypes = ['authorization_code', 'refresh_token', 'client_credentials'];


/**
 * A handler (Controller) to handle generate "access_token" and "refresh_token" where issued from OAuth
 * - [POST] => /api/oauth/token
 * - The "grant_type" is defined to action
 * @param {import("../types/type.Handler.Auth").IHandlerAuthOAuthTokenRequest} request
 */
const handlerAuthOAuthToken = async (request) => {
    /**
     * @type {import("sequelize").Transaction}
     */
    const transaction = await db.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED });

    try {
        /**
         * Current timestamp where request is access into handler
         * @type {number}
         */
        const currentTime = Date.now();
        /**
         * An ip address where attached from request
         * @type {string|""}
         */
        const requestIp = utilGetFastifyRequestIPAddress(request).ip;
        /**
         * A cors origin HTTP from request
         * @type {string}
         */
        const requestReferAudience = utilGetFastifyRequestHeaderOrigin(request);

        const {
            grant_type,
            code,
            client_id,
            client_secret,
            refresh_token,
        } = request.body;

        if (!setAllowedGrantTypes.includes(grant_type)) {
            throw Error('grant_type not allow');
        }
        else if (!isUUID(client_id) || !client_id) {
            throw Error('client_id not allow');
        }
        else if (!_.isString(client_secret) || !client_secret) {
            throw Error('client_secret not allow');
        }
        else if (grant_type === 'refresh_token' && !_.isString(refresh_token) && !refresh_token) {
            throw Error('request not allow');
        }
        else {
            const findOAuth = await modelOAuth.findOne({
                where: {
                    client_id: client_id,
                    client_secret: client_secret
                },
                transaction: transaction
            });
            if (!findOAuth) {
                throw Error('client_id not found');
            }

            if (requestReferAudience) {
                const currentOrigin = new URL(requestReferAudience).origin;
                const allowedSiteOrigins = _.isString(findOAuth.site_whitelist) ? _.uniq(utilConvertJwtAudience(findOAuth.site_whitelist).map(w => new URL(w).origin)) : [];

                if (!allowedSiteOrigins.includes(currentOrigin)) {
                    throw Error('origin not allowed');
                }
            }

            // const whiteListsURI = findOAuth.site_whitelist.split(',');
            // if (!utilConvertJwtAudience(whiteListsURI).includes(requestReferAudience)) {
            //     throw Error('origin not allowed');


            // }
            // else {
            if (grant_type === "authorization_code") {
                const findCodeSession = await getIMDBOAuthCodeSession(code, client_id, client_secret);

                if (!findCodeSession) {
                    throw Error('code session not found or is expired');
                }
                else {
                    /**
                     * Receive new AccessToken
                     */
                    const setAccessToken = await utilSetAccessToken(
                        findOAuth.user_id,
                        {
                            currentTime: currentTime,
                            requestIp: requestIp,
                            audience: requestReferAudience,
                            scope: findCodeSession.scope || "guest",
                            client_id: findOAuth.client_id,
                            secret: config_access_token_secret_oauth
                        }
                    );

                    /**
                     * Receive new RefreshToken
                     */
                    const setRefreshToken = await utilSetRefreshToken(
                        findOAuth.user_id,
                        setAccessToken.access_token,
                        {
                            currentTime: currentTime,
                            requestIp: requestIp
                        }
                    );

                    const [createAccessTokenSessionDoc, createRefreshTokenSessionDoc] = await Promise.all([
                        modelSessions.create(
                            {
                                id: setAccessToken.jwt_id,
                                session_type: config_session_types["access_token"],
                                created_time: setAccessToken.created_at,
                                expiration_time: setAccessToken.expires_at,
                                detail: {
                                    ...setAccessToken.toObject(),
                                    expires_in: undefined,
                                    refresh_token_by: setRefreshToken.refresh_token
                                }
                            },
                            {
                                transaction: transaction
                            }
                        ),
                        modelSessions.create(
                            {
                                id: setRefreshToken.refresh_token,
                                session_type: config_session_types["refresh_token"],
                                created_time: setRefreshToken.created_at,
                                expiration_time: setRefreshToken.expires_at,
                                detail: {
                                    ...setRefreshToken.toObject(),
                                    expires_in: undefined
                                }
                            },
                            {
                                transaction: transaction
                            }
                        )
                    ]);

                    await transaction.commit();

                    await handleSaveLog(request, [["post oauth token"], ""]);

                    return utilSetFastifyResponseJson(
                        "success",
                        {
                            access_token: setAccessToken.access_token,
                            token_type: setAccessToken.token_type,
                            expires_in: setAccessToken.expires_in,
                            expires_at: setAccessToken.expires_at,
                            refresh_token: setRefreshToken.refresh_token,
                            user_id: findOAuth.user_id
                        }
                    );
                }
            }
            else if (grant_type === "refresh_token") {
                const findCodeSession = await getIMDBOAuthCodeSession(refresh_token, client_id, client_secret);

                if (!findCodeSession) {
                    throw Error('refresh_token session not found or is expired');
                }
                else {
                    /**
                     * Receive new AccessToken
                     */
                    const setAccessToken = await utilSetAccessToken(
                        findOAuth.user_id,
                        {
                            currentTime: currentTime,
                            requestIp: requestIp,
                            audience: requestReferAudience,
                            scope: findCodeSession.scope || "guest",
                            client_id: findOAuth.client_id,
                            secret: config_access_token_secret_oauth
                        }
                    );

                    const createAccessTokenSessionDoc = await modelSessions.create(
                        {
                            id: setAccessToken.jwt_id,
                            session_type: config_session_types["access_token"],
                            created_time: setAccessToken.created_at,
                            expiration_time: setAccessToken.expires_at,
                            detail: {
                                ...setAccessToken.toObject(),
                                expires_in: undefined,
                                refresh_token_by: refresh_token
                            }
                        }
                    );

                    await transaction.commit();

                    await handleSaveLog(request, [["post oauth token"], ""]);

                    return utilSetFastifyResponseJson(
                        "success",
                        {
                            access_token: setAccessToken.access_token,
                            token_type: setAccessToken.token_type,
                            expires_in: setAccessToken.expires_in,
                            expires_at: setAccessToken.expires_at,
                            refresh_token: refresh_token,
                            user_id: findOAuth.user_id
                        }
                    );
                }
            }
            else if (grant_type === 'client_credentials') {
                /**
                 * Receive new AccessToken
                 */
                const setAccessToken = await utilSetAccessToken(
                    findOAuth.user_id,
                    {
                        currentTime: currentTime,
                        requestIp: requestIp,
                        audience: requestReferAudience || 'null',
                        scope: "guest",
                        client_id: findOAuth.client_id,
                        secret: config_access_token_secret_oauth
                    }
                );
                /**
                        * Receive new RefreshToken
                        */
                const setRefreshToken = await utilSetRefreshToken(findOAuth.user_id, setAccessToken.access_token, {
                    currentTime: currentTime,
                    requestIp: requestIp
                });

                /**
                 * Prepare new session "OAuth RefreshToken"
                 */
                const [createAccessTokenSessionDoc, createRefreshTokenSessionDoc] = await Promise.all([
                    modelSessions.create(
                        {
                            id: setAccessToken.jwt_id,
                            session_type: config_session_types["access_token"],
                            created_time: setAccessToken.created_at,
                            expiration_time: setAccessToken.expires_at,
                            detail: {
                                ...setAccessToken.toObject(),
                                expires_in: undefined,
                                refresh_token_by: setRefreshToken.refresh_token
                            }
                        },
                        {
                            transaction: transaction
                        }
                    ),
                    modelSessions.create(
                        {
                            id: setRefreshToken.refresh_token,
                            session_type: config_session_types["refresh_token"],
                            created_time: setRefreshToken.created_at,
                            expiration_time: setRefreshToken.expires_at,
                            detail: {
                                ...setRefreshToken.toObject(),
                                expires_in: undefined
                            }
                        },
                        {
                            transaction: transaction
                        }
                    )
                ]);

                await transaction.commit();

                await handleSaveLog(request, [["post oauth token"], ""]);

                return utilSetFastifyResponseJson(
                    "success",
                    {
                        access_token: setAccessToken.access_token,
                        token_type: setAccessToken.token_type,
                        expires_in: setAccessToken.expires_in,
                        expires_at: setAccessToken.expires_at,
                        refresh_token: setRefreshToken.refresh_token,
                        user_id: findOAuth.user_id
                    }
                );
            }
            else {
                throw Error('grant_type not allow');
            }
            // }
        }
    } catch (error) {
        await transaction.rollback();
        await handleSaveLog(request, [["post oauth token"], `error : ${error}`]);
        throw error;
    }
};

module.exports = handlerAuthOAuthToken;