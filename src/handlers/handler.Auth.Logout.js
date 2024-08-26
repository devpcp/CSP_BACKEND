const {
    handleSaveLog,
} = require("./log");

const {
    isUUID,
} = require("../utils/generate");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const UserModel = require("../models/model").User;


/**
 * A handler (Controller) to handle logout
 * - [GET] => /api/logout
 * @param {import("../types/type.Handler.Auth").IHandlerLogoutRequest} request
 */
const handlerAuthLogout = async (request) => {
    try {
        /**
         * An user id
         * @type {string}
         */
        const userId = request.id;

        if (!isUUID(userId)) {
            throw Error("unauthorized");
        } else {
            const findUser = await UserModel.findOne(
                {
                    where: {
                        id: userId
                    }
                }
            );

            if (!findUser) {
                throw Error("User not found");
            } else {
                await UserModel.update(
                    {
                        login_status: 0,
                        token_date: null,
                        token_set: null
                    },
                    {
                        where: {
                            id: userId
                        }
                    }
                );

                await handleSaveLog(request, [["get logout"], ""]);

                return utilSetFastifyResponseJson(
                    "success",
                    "ok"
                );
            }
        }
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [["get logout"], `error : ${error}`]);
        return utilSetFastifyResponseJson(
            "success",
            "ok"
        );
    }
};

module.exports = handlerAuthLogout;