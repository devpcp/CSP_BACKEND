const _ = require("lodash");
const moment = require("moment");
const {
    Op,
    literal
} = require("sequelize");

const {
    config_code_token_expiration_time_oauth,
    config_session_types
} = require("../config");

const db = require("../db");
const modelSessions = require("../models/model").Sessions;
const modelOAuths = require("../models/model").Oauth;
const { isUUID } = require("./generate");


/**
 * A config session lifetime of “Code” via OAuth
 * - type is second
 * @type {number}
 */
const OAUTH_CODE_EXPIRATION_TIME = config_code_token_expiration_time_oauth;

/**
 * A class template instance from session of "Code" via OAuth
 */
class COAuthCodeSession {
    /**
     * A sessionId
     * @type {string}
     */
    code = '';
    /**
     * A typeof session
     * - Default: 'oauth_code' -> 4
     * @type {number}
     */
    session_type = config_session_types["oauth_code"];
    /**
     * A field of "client_id" from model "OAuth"
     * @type {string}
     */
    client_id = '';
    /**
     * A field of "client_secret" from model "OAuth"
     * @type {string}
     */
    client_secret = '';
    /**
     * An optional field
     * @type {string}
     */
    redirect_uri = '';
    /**
     * An optional field
     * @type {string}
     */
    origin = '';
    /**
     * An optional field
     * @type {string}
     */
    scope = '';
    /**
     * Session created at UnixTime
     * @type {number|null}
     */
    created_at = null;
    /**
     * Session expired at UnixTime
     * @type {number|null}
     */
    expired_at = null;

    /**
     * @param {string} client_id
     * @param {string} client_secret
     * @param {object?} options
     * @param {string?} options.redirect_uri
     * @param {string?} options.origin
     * @param {string?} options.scope
     */
    constructor(client_id, client_secret, options = {}) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.redirect_uri = _.get(options, 'redirect_uri', '');
        this.origin = _.get(options, 'origin', '');
        this.scope = _.get(options, 'scope', '');
    };

    /**
     * @returns {string}
     */
    get code() { return this.code; };
    /**
     * @returns {string}
     */
    get client_id() { return this.client_id };
    /**
     * @returns {string}
     */
    get client_secret() { return this.client_secret };
    /**
     * @returns {string}
     */
    get redirect_uri() { return this.redirect_uri };
    /**
     * @returns {string}
     */
    get origin() { return this.origin };
    /**
     * @returns {string}
     */
    get scope() { return this.scope };
    /**
     * @returns {number|null}
     */
    get created_at() { return this.created_at };
    /**
     * @returns {number|null}
     */
    get expired_at() { return this.expired_at };

    valueOf () {
        return {
            code: this.code,
            session_type: this.session_type,
            client_id: this.client_id,
            client_secret: this.client_secret,
            redirect_uri: this.redirect_uri,
            origin: this.origin,
            scope: this.scope,
            created_at: this.created_at,
            expired_at: this.expired_at
        }
    };

    toObject () {
        return this.valueOf();
    };

    toString () {
        return JSON.stringify(this.valueOf());
    };

    /**
     * A method function to add session
     * @returns {Promise<string|null>} - Return code if failed return null
     */
    doSignIn = async () => {
        /**
         * @type {import("sequelize").Transaction}
         */
        const transaction = await db.transaction({ isolationLevel: "SERIALIZABLE" });

        try {
            if (!isUUID(this.client_id)) {
                return null;
            }

            const findOAuthDocument = await modelOAuths.findOne(
                {
                    where: {
                        client_id: this.client_id,
                        client_secret: this.client_secret
                    },
                    transaction: transaction
                }
            );
            if (!findOAuthDocument) {
                return null;
            }

            const whiteListsURI = findOAuthDocument.site_whitelist.split(',').filter(w => _.isString(w) && w !== '');
            if (!whiteListsURI.includes(this.redirect_uri)) {
                if (!whiteListsURI.includes('*')) {
                    return null;
                }
            }

            const createSessionsDocument = await modelSessions.create(
                {
                    session_type: this.session_type,
                    created_time: Date.now(),
                    expiration_time: moment().add(OAUTH_CODE_EXPIRATION_TIME, 'second').valueOf(),
                    detail: {
                        client_id: this.client_id,
                        redirect_uri: this.redirect_uri,
                        origin: this.origin,
                        scope: this.scope
                    }
                },
                {
                    transaction: transaction
                }
            );

            await transaction.commit();

            this.code = createSessionsDocument.id;
            this.created_at = createSessionsDocument.created_time.valueOf();
            this.expired_at = createSessionsDocument.expiration_time.valueOf();

            return this.code;
        }
        catch (error) {
            await transaction.rollback();

            throw error;
        }
    };

    /**
     * A method function to revoke oath code session
     */
    doSignOut = () => {
        new Promise(async (resolve, reject) => {
            const findSessions = await modelSessions.findOne({
                where: {
                    [Op.and]: [
                        { id: { [Op.eq]: this.code } },
                        { session_type: { [Op.eq]: this.session_type } },
                        literal(`detail->>'singOut_at' ISNULL`)
                    ]
                }
            });

            if (findSessions && findSessions.detail) {
                findSessions.detail['singOut_at'] = Date.now();
                await findSessions.save();
            }

            resolve();
        })
            .then()
            .catch()
    };
}


/**
 * @return {Promise<{sessionId: string; client_id: string; client_secret: string; scope: string|null;}|null>}
 */
const getIMDBOAuthCodeSession = async (sessionId, client_id, client_secret) => {
    const [findOAuthDocument, findSessionDocument] = await Promise.all([
        modelOAuths.findOne(
            {
                where: {
                    client_id: client_id,
                    client_secret: client_secret
                }
            }
        ),
        modelSessions.findOne(
            {
                where: {
                    [Op.and]: [
                        { id: { [Op.eq]: sessionId } },
                        {
                            expiration_time: {
                                [Op.gte]: Date.now()
                            }
                        }
                    ]
                }
            }
        )
    ]);

    if (!findOAuthDocument) {
        return null;
    }
    else if (!findSessionDocument) {
        return null;
    }
    else {
        return {
            code: sessionId,
            client_id: client_id,
            client_secret: client_secret,
            scope: findSessionDocument.detail.scope || null
        };
    }
};


module.exports = {
    getIMDBOAuthCodeSession: getIMDBOAuthCodeSession,
    COAuthCodeSession: COAuthCodeSession
};