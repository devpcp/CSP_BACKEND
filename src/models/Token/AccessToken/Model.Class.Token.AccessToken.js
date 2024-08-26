const _ = require("lodash");
const utilIsIPv6 = require("../../../utils/util.IsIPv6");
const utilIsIPv4 = require("../../../utils/util.IsIPv4");
const { config_access_token_expiration_time } = require("../../../config");

/**
 * The access token is expiring in (Seconds)
 * **Example:** 30 * 60 = 1800 seconds (30 Minutes)
 * @type {number}
 */
const accessTokenExpiredInSecond = config_access_token_expiration_time;

/**
 * An object class to make "AccessToken" point that easier to get some properties, example: expires_in
 */
class ModelClassTokenAccessToken {
    jwt_id = "";
    access_token = "";
    expires_at = 0;
    created_at = 0;
    created_by_ip = 0;

    /**
     * @type {"Bearer"}
     */
    token_type = "Bearer";

    /**
     * @param {object} data
     * @param {string} data.jwt_id
     * @param {string} data.access_token
     * @param {number} data.expires_at
     * @param {number} data.created_at
     * @param {string?} data.created_by_ip
     */
    constructor(data) {
        const iniTimeStamp = Date.now();
        if (_.isString(data.jwt_id)) {
            this.jwt_id = data.jwt_id;
        }
        if (_.isString(data.access_token)) {
            this.access_token = data.access_token;
        }
        if (_.isSafeInteger(data.expires_at)) {
            this.expires_at = data.expires_at;
        } else {
            this.expires_at = iniTimeStamp + (accessTokenExpiredInSecond * 1000)
        }
        if (_.isSafeInteger(data.created_at)) {
            this.created_at = data.created_at;
        } else {
            this.created_at = iniTimeStamp;
        }
        if (_.isString(data.created_by_ip)) {
            if (data.created_by_ip) {
                if (utilIsIPv6(data.created_by_ip)) {
                    this.created_by_ip = data.created_by_ip;
                }
                if (utilIsIPv4(data.created_by_ip)) {
                    this.created_by_ip = data.created_by_ip;
                }
            }
        }
    }

    /**
     * Lifetime left in seconds of this refresh token
     * @returns {number}
     */
    get expires_in() {
        const timeLeft = this.expires_at - Date.now();
        return _.round((timeLeft <= 0 ? 0 : timeLeft) / 1000);
    }

    toObject() {
        return {
            jwt_id: this.jwt_id,
            access_token: this.access_token,
            token_type: this.token_type,
            expires_at: this.expires_at,
            expires_in: this.expires_in,
            created_at: this.created_at,
            created_by_ip: this.created_by_ip
        };
    }
}

module.exports = ModelClassTokenAccessToken;