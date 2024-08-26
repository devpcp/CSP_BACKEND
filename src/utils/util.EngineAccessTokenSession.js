const _ = require("lodash");

const {
    isUUID,
} = require("./generate");

const { config_access_token_expiration_time } = require("../config")

const UserModel = require("../models/model").User;


/**
 * @type {import("../types/type.Util.EngineAccessToken").IInMemoryDBAccessTokenSession}
 */
const imDBAccessTokenSession = {};


/**
 * A helper to set object session
 * @param {string} userId - A user id from "id" of DB UserModel
 * @param {number} expiresIn - An expiration of this session when triggered this function will go update "login_status"=0 in DB UserModel
 * @return {{intervalPointer: NodeJS.Timer, timeoutPointer: NodeJS.Timeout}}
 */
const setAccessTokenObject = (userId, expiresIn = config_access_token_expiration_time) => {
    if (isUUID(userId) && Number.isSafeInteger(expiresIn)) {
        let expires_in = expiresIn;
        const intervalPointer = setInterval(
            function () {
                if (expires_in > 0) {
                    --expires_in;
                }
            },
            1000
        );
        const timeoutPointer = setTimeout(
            async function () {
                try {
                    await UserModel.update(
                        {
                            login_status: 0
                        },
                        {
                            where: {
                                id: userId
                            }
                        }
                    );

                    delete imDBAccessTokenSession[userId];
                } catch (error) {
                    clearTimeout(intervalPointer);
                }
            },
            expiresIn * 1000
        );

        return { intervalPointer: intervalPointer, timeoutPointer: timeoutPointer }
    }
};

/**
 * A utility engine help to commit "login_status" in DB UserModel
 * @template TAppend
 * @param {string} userId - A user id from "id" of DB UserModel
 * @param {number} expiresIn - An expiration of this session when triggered this function will go update "login_status"=0 in DB UserModel
 * @param {object} options
 * @param {TAppend} options.append - An object custom that you can attach in this session
 * @param {import("sequelize").Transaction|null} options.transaction - An transaction if you wants to use
 * @return {Promise<import("../types/type.Util.EngineAccessToken").IInMemoryDBAccessTokenObjectSession<TAppend>>}
 */
const setAccessTokenSession = async (userId = "", expiresIn = config_access_token_expiration_time, options = {}) => {
    if (isUUID(userId)) {
        await UserModel.update(
            {
                login_status: 1,
            },
            {
                where: {
                    id: userId
                },
                transaction: _.get(options, 'transaction', null)
            }
        );

        if (!imDBAccessTokenSession[userId]) {
            /**
             * A created "access_token" session
             * @type {{timeoutPointer: number, intervalPointer: number}}
             */
            const setATSResult = setAccessTokenObject(userId, expiresIn);
            const appendDataFromOption = _.isPlainObject(_.get(options, "append", {})) ? _.get(options, "append", {}) : {};
            imDBAccessTokenSession[userId] = { appendDataFromOption, ...setATSResult };
            return imDBAccessTokenSession[userId];
        }
        else {
            if ((imDBAccessTokenSession[userId].intervalPointer)) {
                clearInterval(imDBAccessTokenSession[userId].intervalPointer);
            }
            if ((imDBAccessTokenSession[userId].timeoutPointer)) {
                clearTimeout(imDBAccessTokenSession[userId].timeoutPointer);
            }
            /**
             * A created "access_token" session
             * @type {{timeoutPointer: number, intervalPointer: number}}
             */
            const setATSResult = setAccessTokenObject(userId, expiresIn);
            const appendDataFromOption = _.isPlainObject(_.get(options, "append", {})) ? _.get(options, "append", {}) : {};
            imDBAccessTokenSession[userId] = { appendDataFromOption, ...setATSResult };
            return imDBAccessTokenSession[userId];
        }
    }
};

module.exports = {
    getIMDBAccessTokenSession: () => imDBAccessTokenSession,
    setAccessTokenSession: setAccessTokenSession,
}