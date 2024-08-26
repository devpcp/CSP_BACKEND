const _ = require("lodash");

/**
 * A utility help to check is ip version 4 (IPv4)
 * @param {string} ipAddress
 * @param {(error: Error) => {}} callback
 * @returns {boolean}
 */
const utilIsIPv4 = (ipAddress = "", callback = (error) => {}) => {
    if (!_.isFunction(callback)) {
        callback = (error) => {}
    }
    try {
        if (!_.isString(ipAddress)) {
            return false;
        }
        else {
            const regexExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            return regexExp.test(ipAddress);
        }
    }
    catch (error) {
        callback(error);
        return false;
    }
};

module.exports = utilIsIPv4;