const { isString } = require('lodash');


/**
 * If the subDomain is a string, is at least 3 characters long, is at most 63 characters long, and contains only letters,
 * numbers, and hyphens, then return true, otherwise return false.
 * @param {string} [subDomain] - The subdomain to validate.
 * @returns A function that takes a string as an argument and returns a boolean.
 */
const utilNginxIsFormatSubDomainNameValid = (subDomain = '') => {
    const minimumLength = 3;

    if (!isString(subDomain)) {
        return false;
    }
    else if (subDomain.length < minimumLength) {
        return false;
    }
    else if (subDomain.length > 63) {
        return false;
    }
    else if (new RegExp(`^[a-zA-Z0-9][a-zA-Z0-9-]{1,${64 - minimumLength}}[a-zA-Z0-9]$`).test(subDomain) === false) {
        return false;
    }
    else {
        return true;
    }
};


module.exports = utilNginxIsFormatSubDomainNameValid;