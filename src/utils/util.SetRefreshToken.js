const _ = require("lodash");
const uuid = require("uuid");

const {
    isUUID,
} = require("./generate");

const { config_refresh_token_expiration_time } = require("../config");

const ModelClassRefreshToken = require("../models/Token/RefreshToken/Model.Class.Token.RefreshToken");


/**
 * The refresh token is expiring in (Seconds)
 * **Example:** (((60 * 60) * 24 ) * 7) = 604800 seconds (7 Days)
 * @type {number}
 */
const refreshTokenExpiredInSecond = config_refresh_token_expiration_time;


/**
 * A service to generate refresh token for "handlerAuthLogin"
 * @param {string} user_id
 * @param {string} access_token
 * @param {object?} options
 * @param {number?} options.currentTime
 * @param {string?} options.requestIp
 * @return {Promise<ModelClassRefreshToken>}
 */
const utilSetRefreshToken = async (user_id, access_token, options) => {
    if (!isUUID(user_id)) {
        throw new Error(`Require parameter {user_id: string uuid}`);
    } else if (!_.isString(access_token)) {
        throw new Error(`Require parameter {access_token: string,uuid}`);
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
         * Require data: The refresh token is expiring At
         * @type {number}
         */
        const rExpiredAt = currentTime + (refreshTokenExpiredInSecond * 1000);


        const setAccessToken = new ModelClassRefreshToken({
            refresh_token: uuid.v4(),
            access_token: access_token,
            expires_at: rExpiredAt,
            created_at: currentTime,
            created_by_ip: xRequestIP,
            revoked_at: 0,
            revoked_by_ip: "",
            revoked_by_refresh_token: "",
        });

        return setAccessToken;
    }
}

module.exports = utilSetRefreshToken;