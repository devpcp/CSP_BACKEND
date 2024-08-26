const bcrypt = require("bcrypt");
const _ = require("lodash");

/**
 * A utility to help comparison password between from request and exists
 * @param requestPassword {string} - A password wants to compare with "existsPassword"
 * @param existsPassword {string} - An original password to compare
 * @returns {Promise<Boolean>}
 */
const utilComparePassword = async (requestPassword, existsPassword) => {
    if (_.isString(requestPassword) && _.isString(existsPassword)) {
        return await bcrypt.compareSync(requestPassword, existsPassword);
    } else {
        if (!_.isString(requestPassword)) {
            throw new Error(`@requestPassword is must be String`);
        } else if (!_.isString(existsPassword)) {
            throw new Error(`@existsPassword is must be String`);
        } else {
            throw new Error(`Unexceptional error occurred`);
        }
    }
};

module.exports = utilComparePassword;