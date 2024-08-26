const _ = require("lodash");

const {
    config_refresh_token_expiration_time_oauth,
} = require("../config");

/**
 * An in-memory database from session on "refresh_token" via OAuth
 * @type {import("../types/util.EngineOAuthRefreshTokenSession").IInMemoryDBOAuthRefreshTokenObjectSession<{}, COAuthRefreshTokenSession>}
 */
const imDBOAuthRefreshTokenSession = {};

/**
 * A config session lifetime of “refresh_token” via OAuth
 * - type is second
 * @type {number}
 */
const OAUTH_REFRESH_TOKEN_EXPIRATION_TIME = config_refresh_token_expiration_time_oauth;

/**
 * A class template instance from session of "refresh_token" via OAuth
 */
class COAuthRefreshTokenSession {
    /**
     * A sessionId of OAuth "refresh_token"
     * @type {string}
     */
    refresh_token = "";
    /**
     * A sessionId of OAuth "Code Session"
     * @type {string}
     */
    code = "";
    /**
     * A field of "client_id" from model "OAuth"
     * @type {string}
     */
    client_id = "";
    /**
     * A field of "client_secret" from model "OAuth"
     * @type {string}
     */
    client_secret = "";

    user_id = "";

    /**
     *
     * @param {string} refresh_token
     * @param {string} code
     * @param {string} client_id
     * @param {string} client_secret
     * @param {string} user_id
     */
    constructor(refresh_token, code, client_id, client_secret, user_id) {
        if (_.isString(refresh_token)) {
            this.refresh_token = refresh_token || "";
        }
        if (_.isString(code)) {
            this.code = code || "";
        }
        if (_.isString(client_id)) {
            this.client_id = client_id || "";
        }
        if (_.isString(client_secret)) {
            this.client_secret = client_secret || "";
        }
        if (_.isString(user_id)) {
            this.user_id = user_id || "";
        }
    };

    /**
     * @returns {number}
     */
    get expirationTime() {
        return _.get(imDBOAuthRefreshTokenSession[`${this.refresh_token}`], "expirationTime", 0);
    };

    /**
     * @returns {this}
     */
    get instance() {
        return _.get(imDBOAuthRefreshTokenSession[`${this.refresh_token}`], "instance", null);
    };

    valueOf() {
        return {
            refresh_token: this.refresh_token,
            code: this.code,
            client_id: this.client_id,
            client_secret: this.client_secret,
            user_id: this.user_id,
            expirationTime: this.expirationTime
        }
    };

    toObject() {
        return this.valueOf();
    };

    toString() {
        return JSON.stringify(this.valueOf());
    };

    /**
     * A private method function to generate interval for handle session timeout
     * @returns {number|NodeJS.Timer}
     */
    #doSetInterval = () => {
        if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`]) {
            return imDBOAuthRefreshTokenSession[`${this.refresh_token}`].intervalPointer;
        }
        else {
            return setInterval(() => {
                if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`].expirationTime > 0) {
                    --imDBOAuthRefreshTokenSession[`${this.refresh_token}`].expirationTime;
                    // console.log(new Date(), `OAuth RefreshToken Session[${this.refresh_token}]`, imDBOAuthRefreshTokenSession[`${this.refresh_token}`].expirationTime);
                }
                else {
                    if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`].intervalPointer) {
                        clearInterval(imDBOAuthRefreshTokenSession[`${this.refresh_token}`].intervalPointer);
                        delete imDBOAuthRefreshTokenSession[`${this.refresh_token}`];
                    }
                }
            }, 1000);
        }
    };

    /**
     * A method function to add session
     * @returns {import("../types/util.EngineOAuthRefreshTokenSession").IInMemoryDBOAuthRefreshTokenObjectSessionModel | null}
     */
    doSignIn = () => {
        if (!this.refresh_token) {
            return null;
        }
        if (!this.code) {
            return null;
        }
        if (!this.client_id) {
            return null;
        }
        if (!this.client_secret) {
            return null;
        }
        if (!this.user_id) {
            return null;
        }

        if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`]) {
            if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`].refresh_token !== this.refresh_token) {
                return null;
            }
            if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`].code !== this.code) {
                return null;
            }
            if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`].client_id !== this.client_id) {
                return null;
            }
            if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`].client_secret !== this.client_secret) {
                return null;
            }
            if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`].user_id !== this.user_id) {
                return null;
            }

            if (!this.doSignOut()) {
                return null;
            }
        }

        imDBOAuthRefreshTokenSession[`${this.refresh_token}`] = {
            refresh_token: this.refresh_token,
            code: this.code,
            client_id: this.client_id,
            client_secret: this.client_secret,
            user_id: this.user_id,
            expirationTime: OAUTH_REFRESH_TOKEN_EXPIRATION_TIME,
            intervalPointer: this.#doSetInterval(),
            instance: this,
        };

        return imDBOAuthRefreshTokenSession[`${this.refresh_token}`];
    };

    /**
     * A method function to remove session
     * @returns {boolean}
     */
    doSignOut = () => {
        if (imDBOAuthRefreshTokenSession[`${this.refresh_token}`]) {
            clearInterval(imDBOAuthRefreshTokenSession[`${this.refresh_token}`].intervalPointer);
            delete imDBOAuthRefreshTokenSession[`${this.refresh_token}`];
            return true;
        }
        else {
            return false;
        }
    };
}


module.exports = {
    getIMDBOAuthRefreshTokenSession: () => imDBOAuthRefreshTokenSession,
    COAuthRefreshTokenSession: COAuthRefreshTokenSession
};