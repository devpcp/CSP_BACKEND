const {
    isString,
} = require("lodash");

/**
 * A utility help validate string for "YYYY-MM-DD"
 * @param {string} stringInput
 * @returns {boolean}
 */
const utilIsDateYYYYMMDDWithDash = (stringInput = '') => {
    if (!isString(stringInput)) { return false; }
    else {
        const regexCheck = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

        return regexCheck.test(stringInput);
    }
};

module.exports = utilIsDateYYYYMMDDWithDash;