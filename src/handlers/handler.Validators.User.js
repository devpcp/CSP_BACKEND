const {
    isString,
} = require("lodash");

const {
    handleSaveLog,
} = require("./log");

const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelUsers = require("../models/model").User;


/**
 * A handler to validate User from request by database
 * - Route [GET] => /api/validators/user
 * @param request {import("../types/type.Default.Fastify").FastifyRequestDefault}
 * @returns {Promise<IUtilFastifyResponseJson<{user_name?: string|null, e_mail?: string|null}>>}
 */
const handlerValidatorsUser = async (request) => {
    const handlerName = "get validators user";

    try {
        /**
         * A micro function help to find "user_name" from model "Users"
         * @param {string} user_name
         * @returns {Promise<{user_name?: string|null}>}
         */
        const fnFindUsername = async (user_name) => {
            if (!isString(user_name) || !user_name) {
                return {};
            }
            else {
                const findDocument = await modelUsers.findOne({
                    where: {
                        user_name: user_name
                    }
                });

                if (!findDocument) {
                    return { user_name: null };
                }
                else {
                    return { user_name: user_name };
                }
            }
        };

        /**
         * A micro function help to find "e_mail" from model "Users"
         * @param {string} e_mail
         * @returns {Promise<{e_mail?: string|null}>}
         */
        const fnFindEmail = async (e_mail) => {
            if (!isString(e_mail) || !e_mail) {
                return {};
            }
            else {
                const findDocument = await modelUsers.findOne({
                    where: {
                        e_mail: e_mail
                    }
                });

                if (!findDocument) {
                    return { e_mail: null };
                }
                else {
                    return { e_mail: e_mail };
                }
            }
        };

        const [findUsername, findEmail] = await Promise.all([
            fnFindUsername(request.query.user_name),
            fnFindEmail(request.query.e_mail)
        ]);

        await handleSaveLog(request, [[handlerName], ""]);

        return utilSetFastifyResponseJson("success", { ...findUsername, ...findEmail });

    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerValidatorsUser;