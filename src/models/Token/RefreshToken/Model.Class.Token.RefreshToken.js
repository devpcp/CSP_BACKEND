const _ = require("lodash");
const uuid = require("uuid");
const utilIsIPv6 = require("../../../utils/util.IsIPv6");
const utilIsIPv4 = require("../../../utils/util.IsIPv4");
const { config_refresh_token_expiration_time } = require("../../../config");

/**
 * The refresh token is expiring in (Seconds)
 * **Example:** (((60 * 60) * 24 ) * 7) = 604800 seconds (7 Days)
 * @type {number}
 */
const refreshTokenExpiredInSecond = config_refresh_token_expiration_time;

/**
 * An object class to make "RefreshToken" point that easier to get some properties, example: expires_in
 */
class ModelClassTokenRefreshToken {
    refresh_token = "";
    access_token = "";
    expires_at = 0;
    created_at = 0;
    created_by_ip = "";
    revoked_at = 0;
    revoked_by_ip = "";
    revoked_by_refresh_token = "";

    /**
     * @param {object} data
     * @param {string} data.refresh_token
     * @param {string} data.access_token
     * @param {number} data.expires_at
     * @param {number} data.created_at
     * @param {string?} data.created_by_ip
     * @param {number?} data.revoked_at
     * @param {string?} data.revoked_by_ip
     * @param {string?} data.revoked_by_refresh_token
     */
    constructor(data) {
        const iniTimeStamp = Date.now();
        if (_.isString(data.refresh_token) && data.refresh_token) {
            this.refresh_token = data.refresh_token;
        } else {
            this.refresh_token = uuid.v4();
        }
        if (_.isString(data.access_token) && data.access_token) {
            this.access_token = data.access_token;
        }
        if (_.isSafeInteger(data.expires_at)) {
            this.expires_at = data.expires_at;
        } else {
            this.expires_at = iniTimeStamp + (refreshTokenExpiredInSecond * 1000)
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
        if (_.isSafeInteger(data.revoked_at)) {
            this.revoked_at = data.revoked_at;
        }
        if (_.isString(data.revoked_by_ip)) {
            if (data.revoked_by_ip) {
                if (utilIsIPv6(data.revoked_by_ip)) {
                    this.revoked_by_ip = data.revoked_by_ip;
                }
                if (utilIsIPv4(data.revoked_by_ip)) {
                    this.revoked_by_ip = data.revoked_by_ip;
                }
            }
        }
        if (_.isString(data.revoked_by_refresh_token)) {
            this.revoked_by_refresh_token = data.revoked_by_refresh_token;
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
            refresh_token: this.refresh_token,
            access_token: this.access_token,
            expires_at: this.expires_at,
            expires_in: this.expires_in,
            created_at: this.created_at,
            created_by_ip: this.created_by_ip,
            revoked_at: this.revoked_at,
            revoked_by_ip: this.revoked_by_ip,
            revoked_by_refresh_token: this.revoked_by_refresh_token,
        };
    }

    toObjectDBTokenSet() {
        return {
            refresh_token: this.refresh_token,
            access_token: this.access_token,
            expires_at: this.expires_at,
            created_at: this.created_at,
            created_by_ip: this.created_by_ip,
            revoked_at: this.revoked_at,
            revoked_by_ip: this.revoked_by_ip,
            revoked_by_refresh_token: this.revoked_by_refresh_token,
        };
    }

    isExpired() {
        const result = this.expires_in <= 0;
        return result;
    }
}

module.exports = ModelClassTokenRefreshToken;