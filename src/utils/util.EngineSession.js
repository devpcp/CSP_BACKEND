const { Op } = require("sequelize");
const uuidV4 = require("uuid").v4;
const { isUUID } = require("./generate");
const { isDate, isPlainObject, isNull, isString } = require("lodash");
const modelSessions = require("../models/model").Sessions;
const { config_session_types } = require("../config");


/**
 * It creates a session document in the database
 * @param {import("../types/type.Util.EngineSession").ICreateSession} param0
 * @returns A session document
 */
const createSession = async ({id, session_type, created_time, expiration_time, detail, transaction}) => {
    if (!isUUID(id)) { throw Error(`id is required`); }
    else if (!isString(session_type) || !config_session_types[session_type]) { throw Error(`session_type is required`); }
    else if (!isDate(created_time)) { throw Error(`created_time is required`); }
    else if (!isDate(expiration_time)) { throw Error(`expiration_time is required`); }
    else if (created_time.valueOf() > expiration_time.valueOf()) { throw Error(`created_time not expired before expiration_time`); }
    else if (!isPlainObject(detail) && !isNull(detail)) { throw Error(`detail is required`); }
    else {
        const createdSessionDocument = await modelSessions.create(
            {
                id,
                created_time,
                expiration_time,
                detail,
                session_type: config_session_types[session_type],
            },
            {
                transaction: transaction
            }
        );

        return createdSessionDocument;
    }
};


/**
 * "Get a session document from the database, if it exists and is not expired."
 * The function takes an object as an argument. The object has two properties: id and transaction. The id property is the
 * id of the session document to get. The transaction property is the transaction to use when querying the database
 * @param {import("../types/type.Util.EngineSession").IGetSession} param0
 * @returns The session document
 */
const getSession = async ({ id = null, session_type = "", transaction = null }) => {
    const findSessionDocument = await modelSessions.findOne(
        {
            where: {
                id: {
                    [Op.eq]: id
                },
                session_type: {
                    [Op.eq]: config_session_types[session_type] || null
                },
                expiration_time: {
                    [Op.lt]: new Date()
                }
            },
            transaction: transaction
        }
    );

    if (!findSessionDocument) {
        throw Error('Session is not found or is expired');
    }
    else {
        return findSessionDocument;
    }
};


module.exports = {
    createSession,
    getSession,
}