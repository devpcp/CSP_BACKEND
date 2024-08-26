const _ = require("lodash");

const {
    handleSaveLog,
} = require("./log");

const {
    setAccessTokenSession,
} = require("../utils/util.EngineAccessTokenSession");
const {
    createSession,
} = require("../utils/util.EngineSession");
const utilGetFastifyRequestIPAddress = require("../utils/util.GetFastifyRequestIPAddress");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson.js");
const utilComparePassword = require("../utils/util.ComparePassword");
const utilSetAccessToken = require("../utils/util.SetAccessToken");
const utilSetRefreshToken = require("../utils/util.SetRefreshToken");
const utilGetFastifyRequestHeaderOrigin = require("../utils/util.GetFastifyRequestHeaderOrigin");

const {
    config_access_token_engine_session_time,
    config_session_types
} = require("../config");

const db = require("../db");
const UserModel = require("../models/model").User;

const { Transaction } = require("sequelize");



/**
 * A handler (Controller) to handle login
 * - [POST] => /api/login
 * @param {import("../types/type.Handler.Auth").IHandlerLoginRequest|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerAuthLogin = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST Auth.Login';
    try {
        return await db.transaction(
            {
                isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
                transaction: request?.transaction || options?.transaction || null
            },
            async (transaction) => {
                if (!request?.transaction || !options?.transaction) {
                    request.transaction = transaction;
                    options.transaction = transaction;
                }

                const {
                    user_name,
                    password
                } = request.body;

                const currentTime = Date.now();
                const requestIp = utilGetFastifyRequestIPAddress(request).ip;
                const requestAudience = utilGetFastifyRequestHeaderOrigin(request);

                if (!_.isString(user_name) || !_.isString(password)) {
                    throw Error("ชื่อผู้ใช้หรือรหัสผ่านมีการส่งข้อมูลที่ไม่ถูกต้อง");
                }
                else {
                    const findUser = await UserModel.findOne(
                        {
                            where: {
                                user_name: user_name
                            }
                        }
                    );
                    if (!findUser) {
                        throw Error("ลงชื่อเข้าใช้ไม่สําเร็จ");
                    }
                    else {
                        const comparePassword = await utilComparePassword(password, findUser.password);
                        if (!comparePassword) {
                            throw Error("ลงชื่อเข้าใช้ไม่สําเร็จ");
                        }
                        else {
                            /**
                             * Receive new AccessToken
                             */
                            const setAccessToken = await utilSetAccessToken(
                                findUser.id,
                                {
                                    currentTime: currentTime,
                                    requestIp: requestIp,
                                    audience: requestAudience,
                                    scope: "default"
                                }
                            );
                            /**
                             * Receive new RefreshToken
                             */
                            const setRefreshToken = await utilSetRefreshToken(
                                findUser.id,
                                setAccessToken.access_token,
                                {
                                    currentTime: currentTime,
                                    requestIp: requestIp
                                }
                            );

                            // Delete unused data before send to client
                            delete findUser.dataValues.password;
                            delete findUser.dataValues.token_set;

                            // Attach user id to this session fastify.request.id
                            request.id = findUser.id;

                            await setAccessTokenSession(findUser.id, config_access_token_engine_session_time, { transaction: transaction });

                            const [createAccessTokenSessionDoc, createRefreshTokenSessionDoc] = await Promise.all([
                                createSession({
                                    id: setAccessToken.jwt_id,
                                    session_type: "access_token",
                                    created_time: new Date(setAccessToken.created_at),
                                    expiration_time: new Date(setAccessToken.expires_at),
                                    detail: {
                                        ...setAccessToken.toObject(),
                                        expires_in: undefined,
                                        refresh_token_by: setRefreshToken.refresh_token
                                    },
                                    transaction: transaction
                                }),
                                createSession({
                                    id: setRefreshToken.refresh_token,
                                    session_type: "refresh_token",
                                    created_time: new Date(setRefreshToken.created_at),
                                    expiration_time: new Date(setRefreshToken.expires_at),
                                    detail: {
                                        ...setRefreshToken.toObject(),
                                        expires_in: undefined
                                    },
                                    transaction: transaction
                                })
                            ]);

                            /**
                             * Update token_set into UserModel by id
                             */
                            const updateUserLoginTimestamp = await UserModel.update(
                                {
                                    last_login: currentTime,
                                    token_date: currentTime
                                },
                                {
                                    where: {
                                        id: findUser.id
                                    },
                                    transaction: transaction
                                },
                            );

                            await handleSaveLog(request, [[action], ""]);

                            return utilSetFastifyResponseJson(
                                "success",
                                {
                                    access_token: setAccessToken.access_token,
                                    token_type: setAccessToken.token_type,
                                    expires_in: setAccessToken.expires_in,
                                    expires_at: setAccessToken.expires_at,
                                    refresh_token: setRefreshToken.refresh_token,
                                    user_id: findUser.id
                                }
                            );
                        }
                    }
                }
            }
        );
    }
    catch (error) {
        await handleSaveLog(request, [[action], `error : ${error}`]);
        throw error;
    }
};

module.exports = handlerAuthLogin;