const _ = require("lodash");
const { Op, literal } = require("sequelize");
const {
    handleSaveLog,
} = require("./log");

const {
    isUUID,
} = require("../utils/generate");

const utilSetAccessToken = require("../utils/util.SetAccessToken");
const utilGetFastifyRequestIPAddress = require("../utils/util.GetFastifyRequestIPAddress");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestHeaderOrigin = require("../utils/util.GetFastifyRequestHeaderOrigin");

const ModelClassRefreshToken = require("../models/Token/RefreshToken/Model.Class.Token.RefreshToken");

const UserModel = require("../models/model").User;
const Sessions = require("../models/model").Sessions;
const { config_session_types } = require("../config");


/**
 * A handler (Controller) to handle make new "access_token" from verify "refresh_token" from request
 * - [POST] => /api/token/access_token
 * @param {import("../types/type.Handler.Auth").IHandlerAuthAccessTokenRequest} request
 */
const handlerAuthAccessToken = async (request) => {
    try {
        const {
            refresh_token,
        } = request.body;

        /**
         * An user id
         * @type {string}
         */
        const userId = request.id;
        const currentTime = Date.now();
        const requestIp = utilGetFastifyRequestIPAddress(request).ip;
        const requestAudience = utilGetFastifyRequestHeaderOrigin(request);

        if (!isUUID(refresh_token) || !isUUID(userId)) {
            throw Error("Unfulfilled as requested");
        } else {
            const findSessionRefreshToken = await Sessions.findOne(
                {
                    where: {
                        id: refresh_token,
                        session_type: config_session_types["refresh_token"],
                        expiration_time: {
                            [Op.gt]: new Date()
                        },
                        [Op.and]: [
                            literal(`(detail->>'revoked_at')::Numeric = 0`)
                        ]
                    }
                }
            );

            if (!findSessionRefreshToken) {
                throw Error("User not exists or you not logged in")
            } else {
                if (!_.isPlainObject(findSessionRefreshToken.detail)) {
                    throw Error("User not logged in");
                } else {
                    const originAccessToken = new ModelClassRefreshToken(findSessionRefreshToken.detail);
                    if (originAccessToken.refresh_token !== refresh_token) {
                        throw Error("RefreshToken is unfulfilled as requested, due is expired or not exists");
                    } else {
                        if (originAccessToken.isExpired()) {
                            throw Error("RefreshToken is unfulfilled as requested, due is expired or not exists");
                        } else {
                            const newAccessToken = await utilSetAccessToken(
                                userId,
                                {
                                    currentTime: currentTime,
                                    requestIp: requestIp,
                                    audience: requestAudience,
                                    scope: "default"
                                }
                            );

                            // Update User Login Status
                            await UserModel.update(
                                {
                                    login_status: 1,
                                },
                                {
                                    where: {
                                        id: userId
                                    }
                                }
                            );

                            // Create Session AccessToken Document
                            await Sessions.create({
                                id: newAccessToken.jwt_id,
                                session_type: config_session_types["access_token"],
                                created_time: newAccessToken.created_at,
                                expiration_time: newAccessToken.expires_at,
                                detail: {
                                    ...newAccessToken.toObject(),
                                    expires_in: undefined,
                                    refresh_token_by: refresh_token
                                }
                            });

                            await handleSaveLog(request, ["post token access_token", ""]);

                            return utilSetFastifyResponseJson(
                                "success",
                                {
                                    access_token: newAccessToken.access_token,
                                    token_type: newAccessToken.token_type,
                                    expires_in: newAccessToken.expires_in,
                                    expires_at: newAccessToken.expires_at,
                                }
                            );
                        }
                    }
                }
            }
        }
    } catch (error) {
        await handleSaveLog(request, ["post token access_token", `error : ${error}`]);

        throw error;
    }
};

module.exports = handlerAuthAccessToken;