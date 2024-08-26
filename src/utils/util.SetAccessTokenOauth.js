const _ = require("lodash");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const {
    config_access_token_expiration_time,
    config_access_token_secret_oauth
} = require("../config");

const ModelClassAccessToken = require("../models/Token/AccessToken/Model.Class.Token.AccessToken");

/**
 * The access token is expiring in (Seconds)
 * **Example:** 30 * 60 = 1800 seconds (30 Minutes)
 * @type {number}
 */
const accessTokenExpiredInSecond = config_access_token_expiration_time;

/**
 * Private key's The Access token
 * @type {string}
 */
const ACCESS_TOKEN_SECRET_OAUTH = config_access_token_secret_oauth;

/**
 * @param {string} user_id
 * @param {object} options
 * @param {number?} options.currentTime
 * @param {string?} options.requestIp
 * @return {Promise<ModelClassAccessToken>}
 */
const utilSetAccessTokenOauth = async (user_id, options) => {
    if (!_.isString(user_id) || !uuid.validate(user_id)) {
        throw new Error("Require parameter {user_id: string uuid}");
    } else {
        // Set&Check Options
        /**
         * Options: The current time can be override time
         * @type {number}
         */
        let currentTime = Date.now();
        if (_.isPlainObject(options)) {
            currentTime = _.get(options, "currentTime", currentTime);
        }
        /**
         * Options: The ip address who is call this service
         * @type {string}
         */
        let xRequestIP = "";
        if (_.isPlainObject(options)) {
            xRequestIP = _.get(options, "requestIp", "");
        }

        /**
         * audience (aud)
         * - User who is owner of this access_token (mean that who is login to get this token)
         * @type {string}
         */
        const audience = user_id;
        /**
         * issuedAt (iat)
         * - Created date of this access_token
         * @type {number}
         */
        const issuedAt = currentTime;
        /**
         * expirationTime (exp)
         * - Use this access_token before expired at this time
         * @type {number}
         */
        const expirationTime = currentTime + (accessTokenExpiredInSecond * 10000);

        /**
         * Payload's for sign data to Jwt access_token
         * @type {{aud: string, exp: number, iat: number}}
         */
        const jwtPayload = {
            aud: audience,
            iat: issuedAt,
            exp: expirationTime
        };

        /**
         * Jwt encoded to String
         * @type {string}
         */
        const encodeToken = jwt.sign(jwtPayload, ACCESS_TOKEN_SECRET_OAUTH, { algorithm: "HS256" });

        if (!encodeToken) {
            throw Error("@encodeToken have error when sign jwt access_token");
        } else {
            const objAccessToken = new ModelClassAccessToken({
                access_token: encodeToken,
                expires_at: expirationTime,
                created_at: currentTime,
                created_by_ip: xRequestIP,
            });

            return objAccessToken;
        }
    }
}

module.exports = utilSetAccessTokenOauth;
