const {
    config_access_token_issuer_url,
    config_access_token_expiration_time,
    config_access_token_secret
} = require("../config");

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const ModelClassAccessToken = require("../models/Token/AccessToken/Model.Class.Token.AccessToken");

/**
 * The access token (default scope) is expiring in (Seconds)
 * - **Example:** 30 * 60 = 1800 seconds (30 Minutes)
 * @type {number}
 */
const defaultAccessTokenExpiredInSecond = config_access_token_expiration_time;

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
 * @param {string} user_id
 * @param {object} options
 * @param {number?} options.currentTime
 * @param {string?} options.requestIp
 * @param {string?} options.client_id
 * @param {"default" | "guest" ?} options.scope
 * @param {string | string[] ?} options.audience
 * @param {string?} options.secret
 * @return {Promise<ModelClassAccessToken>}`
 */
const utilSetAccessToken = async (user_id, options) => {
    if (!_.isString(user_id) || !uuid.validate(user_id)) {
        throw new Error("Require parameter {user_id: string uuid}");
    } else {
        // Set&Check Options
        /**
         * Options: The current time can be override time
         * @type {number}
         */
        let xCurrentTime = Date.now();
        if (_.isPlainObject(options)) {
            xCurrentTime = _.get(options, "currentTime", xCurrentTime);
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
         * Options: Client Id
         * @type {string}
         */
        let xClientId = "";
        if (_.isPlainObject(options)) {
            xClientId = _.get(options, "client_id", "");
        }
        /**
         * Options: Permissions granted by the user
         * - default: "default"
         * - when is out of scope, we are override scope to "guest"
         * @type {"default" | "guest"}
         */
        let xScope = "default";
        if (_.isPlainObject(options)) {
            xScope = _.get(options, "scope", "default");
            const scopeAvailable = ["default", "guest"];
            if (!scopeAvailable.includes(xScope)) {
                xScope = "guest";
            }
        }
        /**
         * Options: The http address who is asking jwt
         * @type {string|string[]}
         */
        let xAudience = "";
        if (_.isPlainObject(options)) {
            xAudience = _.get(options, "audience", "");
        }
        let xSecret = ACCESS_TOKEN_SECRET;
        if (_.isPlainObject(options)) {
            xSecret = _.get(options, "secret", ACCESS_TOKEN_SECRET);
        }

        /**
         * JWT ID (jti)
         * - Unique identifier that can be used to prevent the JWT from being replayed
         * @type {string}
         */
        const jwtId = uuid.v4();
        /**
         * Issuer (iss)
         * - URL who is generated this jwt
         * @type {string}
         */
        const issuer = ACCESS_TOKEN_ISSUER;
        /**
         * Subject (sub)
         * - User who is owner of this access_token (mean that who is login to get this token)
         * @type {string}
         */
        const subject = user_id;
        /**
         * Audience (aud)
         * - URL who is asked to this jwt
         * @type {string|string[]}
         */
        const audience = xAudience;
        /**
         * Issued At (iat)
         * - Created date of this access_token
         * @type {number}
         */
        const issuedAt = xCurrentTime;
        /**
         * Expiration Time (exp)
         * - Use this access_token before expired at this time
         * @type {number}
         */
        const expirationTime = xCurrentTime + (defaultAccessTokenExpiredInSecond * 1000);
        /**
         * Scope Values (scope)
         * @type {"default"|"guest"}
         */
        const scope = xScope;
        /**
         * Client Identifier (client_id)
         * @type {string}
         */
        const client_id = xClientId;

        /**
         * Payload's for sign data to Jwt access_token
         * @type {import("../types/type.Default.JwtPayload").ISchemaJwtPayloadDefault}
         */
        const jwtPayload = {
            iat: issuedAt,
            exp: expirationTime,
            scope: scope,
            client_id: client_id,
        };

        /**
         * Jwt encoded to String
         * @type {string}
         */
        const encodeToken = jwt.sign(
            jwtPayload,
            xSecret,
            {
                algorithm: "HS256",
                jwtid: jwtId,
                issuer: issuer,
                subject: subject,
                audience: audience
            }
        );

        if (!encodeToken) {
            throw Error("@encodeToken have error when sign jwt access_token");
        } else {
            const objAccessToken = new ModelClassAccessToken({
                jwt_id: jwtId,
                access_token: encodeToken,
                expires_at: expirationTime,
                created_at: xCurrentTime,
                created_by_ip: xRequestIP,
            });

            return objAccessToken;
        }
    }
}

module.exports = utilSetAccessToken;
