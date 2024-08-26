const _ = require("lodash");
const {isUUID} = require("./generate");
const ModelUser = require("../models/model").User;
const ModelClassRefreshToken = require("../models/Token/RefreshToken/Model.Class.Token.RefreshToken");

/**
 * A utility help you get refresh token in DB from UserModel
 * @param {string} user_id
 * @param {string?} refresh_token
 * @return {Promise<ModelClassRefreshToken|undefined>}
 */
const utilGetRefreshToken = async (user_id, refresh_token) => {
    if (!isUUID(user_id)) {
        throw Error("@user_id is required and type is string uuid");
    } else {
        const findUser = await ModelUser.findOne(
            {
                where: {
                    id: user_id
                }
            }
        );

        if (isUUID(refresh_token)) {
            if (!_.isPlainObject(findUser.token_set)) {
                return;
            } else {
                const getRefreshToken = new ModelClassRefreshToken({...findUser.token_set});
                return getRefreshToken;
            }
        } else {
            if (!_.isPlainObject(findUser.token_set)) {
                return;
            } else {
                const getRefreshToken = new ModelClassRefreshToken({...findUser.token_set});
                return getRefreshToken;
            }
        }
    }
};

module.exports = utilGetRefreshToken;