const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('./../config');
const { handleSaveLog } = require('../handlers/log');
const customError = require('../utils/custom-error');
const { v4: uuidv4 } = require('uuid');
const { Op, literal } = require("sequelize");
const { isNull, paginate, isUUID } = require('../utils/generate')
const engineAuthSession = require('../utils/engine.Auth.Session');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson')
const utilGetFastifyRequestIPAddress = require('../utils/util.GetFastifyRequestIPAddress')
const utilSetRefreshToken = require('../utils/util.SetRefreshToken')
const { setAccessTokenSession } = require("../utils/util.EngineAccessTokenSession");
const { config_access_token_engine_session_time } = require("../config");
const utilSetAccessTokenOauth = require('../utils/util.SetAccessTokenOauth');
const handlerAuthAccessTokenOauth = require("./handler.Auth.OAuthCode");
const User = require('../models/model').User;
const Oauth = require('../models/model').Oauth;


/**
 * Json web token are expired in second
 * - 35 * 60 = 35 Minutes
 */
const jwtTokenExpiredInSecond = 35 * 60;
/**
 * Session's pool
 * @type {engineAuthSession}
 */
const authSessions = new engineAuthSession((jwtTokenExpiredInSecond * 1000) + 10000, 0, () => { });

const comparePassword = async (request, password, existsPassword) => {
    const isPasswordCorrect = await bcrypt.compareSync(password, existsPassword)
    if (!isPasswordCorrect) {
        await handleSaveLog(request, [['login'], 'password incorrect'])
        return customError({
            message: '',
            status: 'failed',
            statusCode: 401,
            data: 'user or password incorrect'
        })
    } else {
        return true
    }
}

const generateAccessToken = (userId) => {
    const timeStamp = new Date().getTime();
    const expiresIn = timeStamp + (jwtTokenExpiredInSecond * 1000);
    const jwtPayload = {
        iat: timeStamp,
        exp: expiresIn,
        aud: String(userId)
    };
    const encodeToken = jwt.sign(jwtPayload, config.secret.accessToken);
    return {
        accessToken: { access_token: String(encodeToken).toString(), expires_in: jwtPayload.exp },
        optionalTokenData: {
            ...jwtPayload
        }
    }
}

const handlelogout = async (request) => {

    var user = await User.findAll({
        where: { id: request.id }
    })

    await User.update({
        login_status: 0,

    }, {
        where: { id: user[0].id }
    })


    return ({ status: 'success', data: 'successful' })

}

const handleLogin = async (request) => {

    const { user_name, password } = request.body
    const rows = await User.findAll({ where: { user_name: user_name } })
    const user = rows[0]
    if (!user) {
        await handleSaveLog(request, [['login'], 'user_name not found'])
        return customError({
            message: '',
            status: 'failed',
            statusCode: 401,
            data: 'user or password incorrect'
        })
    }


    await comparePassword(request, password, user.password)

    const { accessToken, optionalTokenData } = await generateAccessToken(user.id)

    // const response = mapUserResponseObject(userId, user, accessToken)
    request.id = user.id

    await User.update({ login_status: 1, last_login: optionalTokenData.iat, token_date: optionalTokenData.iat }, {
        where: { id: user.id }
    }).then(r => {
        authSessions.setSession(user.id);
    })
    users = ({ ...user.dataValues, ...accessToken, exp: optionalTokenData.exp })
    delete users.password;

    return ({ status: 'success', data: users })

}

const handleRegisterOauth = async (request, response) => {


    try {
        var { user_id, site_whitelist, client_secret } = request.body
        const find_user = await User.findAll({
            where: {
                id: user_id
            }
        });

        if (!find_user[0]) {
            await handleSaveLog(request, [['register oauth'], 'user not found'])
            return ({ status: 'failed', data: 'user not found' })
        }

        const find_oauth = await Oauth.findAll({
            where: {
                user_id: user_id
            }
        });

        if (find_oauth[0]) {
            await handleSaveLog(request, [['register oauth'], 'this user already have oauth'])
            return ({ status: 'failed', data: 'this user already have oauth' })
        }

        var client = await Oauth.create({
            client_secret: client_secret,
            user_id: user_id,
            site_whitelist: site_whitelist,
            isuse: 1,
            created_by: request.id,
            created_date: Date.now()
        })

        await handleSaveLog(request, [['register oauth'], ''])
        return ({ status: 'success', data: client })
    } catch (error) {

        error = error.toString()
        await handleSaveLog(request, [['register oauth'], 'error : ' + error])
        return ({ status: 'failed', data: error })
    }

}

/**
 * A handler to generate OAuth
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("fastify").FastifyReply} reply
 * @returns {Promise<IUtilFastifyResponseJson<string>|import("fastify").FastifyReply>} - Reply with json by error OR redirect url
 */
const handleOauth = async (request, reply) => {
    const client_id = request.query.client_id
    const redirect_uri = request.query.redirect_uri

    if (!isUUID(client_id)) {
        return utilSetFastifyResponseJson('failed', 'client_id not allowed')
    }

    const check_client = await Oauth.findOne({
        where: {
            client_id: client_id
        }
    })

    if (!check_client) {
        return utilSetFastifyResponseJson('failed', 'client_id not found')
    }

    if (!redirect_uri.includes(check_client.site_whitelist)) {
        return utilSetFastifyResponseJson('failed', 'redirect_uri not allow')
    }

    const code = uuidv4()

    const code_auth = request.session.code_auth || []
    code_auth.push(code)

    request.session.code_auth = code_auth

    return reply.redirect(redirect_uri + '?code=' + code)

    // http://localhost:5001/api/oauth?response_type=code&client_id=b6c418ab-5861-41ab-853f-d757a7d4d459&redirect_uri=http://dookdik2021.ddns.net:8902/register&scope=email
}

/**
 *
 * @param {import("../types/type.Default.Fastify")} request
 * @param reply
 * @returns {Promise<IUtilFastifyResponseJson<unknown>|undefined>}
 */
const handleOauthToken = async (request, reply) => {


    var code_auth = request.session.code_auth || []
    var { grant_type, code, client_id, redirect_uri, client_secret } = request.body

    const currentTime = Date.now();
    const requestIp = utilGetFastifyRequestIPAddress(request).ip;

    var check_client = await Oauth.findOne({
        where: {
            client_id: client_id, client_secret: client_secret
        }
    })

    if (redirect_uri) {
        if (!redirect_uri.includes(check_client.site_whitelist)) {
            return utilSetFastifyResponseJson('failed', 'redirect_uri not allow')
        }
    }


    var findUser = await User.findOne({
        where: {
            id: check_client.user_id
        }
    })


    // request.session.destroy('code_auth')
    if (grant_type == 'authorization_code') {


        if (!code) {
            return utilSetFastifyResponseJson('failed', "body should have required property 'code'")
        }

        code = code.toString()

        if (!code || !code_auth.includes(code)) {
            return utilSetFastifyResponseJson('failed', { error: 'code not find', coockieID: request.session })
        }



        const setAccessToken = await utilSetAccessTokenOauth(findUser.id, { currentTime: currentTime, requestIp: requestIp });
        const setRefreshToken = await utilSetRefreshToken(findUser.id, setAccessToken.access_token, { currentTime: currentTime, requestIp: requestIp });
        delete findUser.dataValues.password;
        delete findUser.dataValues.token_set;
        request.id = findUser.id;
        await setAccessTokenSession(findUser.id, config_access_token_engine_session_time);

        await handleSaveLog(request, [["post login"], ""]);


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

    } else if (grant_type == 'refresh_token2') {

        if (!refresh_token) {
            return utilSetFastifyResponseJson('failed', "body should have required property 'code'")
        }
        request.id = findUser.id
        return await handlerAuthAccessTokenOauth(request)


    } else {
        return utilSetFastifyResponseJson('failed', 'grant_type not allow')
    }



}




const handleOauthAll = async (request, res) => {

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;

    var isuse = []
    if (status == 'delete') {
        isuse = [2]
    } else if (status == 'active') {
        isuse = [1]
    } else if (status == 'block') {
        isuse = [0]
    } else {
        isuse = [1, 0]
    }


    var data = await Oauth.findAll({
        order: [[sort, order]],
        include: {
            model: User,
            attributes: {
                // Don't show vulnerable data
                exclude: ["password", "token_set"]
            }
        },
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Oauth\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Oauth\".\"updated_by\" )"), 'updated_by']
            ]
        },
        where: {
            [Op.and]: [{ isuse: isuse }],
            [Op.or]: [

                { site_whitelist: { [Op.like]: '%' + search + '%' } },
                // ปิดใช้งาน {client_id} เพราะทำให้ เกิด SQL error
                // { client_id: { [Op.like]: '%' + search + '%' } },
                { "$User.user_name$": { [Op.like]: '%' + search + '%' } },
                // { '$Dealer.dealer_name->"th"$': { [Op.like]: '%' + search + '%' } },
            ]
        }
    })

    await handleSaveLog(request, [['get oauth all'], ''])
    return ({ status: 'success', data: paginate(data, limit, page) })
}

const handleOauthById = async (request, res) => {
    try {

        var user_id = request.params.id
        const find_user = await Oauth.findAll({
            include: { model: User },
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Oauth\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Oauth\".\"updated_by\" )"), 'updated_by']
                ]
            },
            where: {
                client_id: user_id
            }
        });
        if (find_user[0]) {
            await handleSaveLog(request, [['get oauth by id'], ''])
            return ({ status: "successful", data: [find_user[0]] })
        } else {
            await handleSaveLog(request, [['get oauth by id'], 'Oauth  not found'])
            return ({ status: "failed", data: "Oauth not found" })
        }

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['get oauth by id'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleOauthPut = async (request, res) => {
    var action = 'put oauth'
    try {

        var client_id = request.params.id

        var { user_id, site_whitelist, client_secret } = request.body
        var isuse = request.body.status


        const find_oauth = await Oauth.findAll({
            where: {
                client_id: client_id
            }
        });

        if (!find_oauth[0]) {
            await handleSaveLog(request, [[action], 'client_id not found'])
            return ({ status: 'failed', data: 'client_id not found' })
        }

        var data = {}

        if (!isNull(user_id)) {

            const check_user = await User.findAll({
                where: {
                    id: user_id
                }
            });
            if (!check_user[0]) {
                await handleSaveLog(request, [[action], 'user_id not found'])
                return ({ status: "failed", data: "user_id not found" })
            } else {
                data.user_id = user_id
            }
        }
        if (!isNull(site_whitelist)) {
            data.site_whitelist = site_whitelist
        }
        if (!isNull(client_secret)) {
            data.client_secret = client_secret
        }


        if (!isNull(isuse)) {
            if (isuse == 'delete') {
                data.isuse = 2
            } else if (isuse == 'active') {
                data.isuse = 1
            } else if (isuse == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }

        data.updated_by = request.id
        data.updated_date = Date.now()

        var before_update = await Oauth.findOne({
            where: {
                client_id: client_id
            }
        });

        await Oauth.update(data, {
            where: {
                client_id: client_id
            }
        });


        await handleSaveLog(request, [[action, client_id, request.body, before_update], ''])
        return ({ status: "successful", data: "success" })


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}
module.exports = {
    handleRegisterOauth,
    handleLogin,
    handleOauth,
    handleOauthToken,
    handlelogout,
    handleOauthAll,
    handleOauthPut,
    handleOauthById
}