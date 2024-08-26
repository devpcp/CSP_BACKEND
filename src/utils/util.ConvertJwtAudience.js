const _ = require("lodash");
const utilConvertURLOrigin = require("./util.ConvertURLOrigin");

/**
 * A utility help you render Jwt "audience"
 * @param {string | string[]} inputJwtAudience
 * @returns {string[]}
 */
const utilConvertJwtAudience = (inputJwtAudience = "") => {
    if (_.isString(inputJwtAudience) && inputJwtAudience !== "") {
        const splitUrls = inputJwtAudience.split(",");
        if (splitUrls.length > 1) {
            return utilConvertJwtAudience(splitUrls);
        }
        return [utilConvertURLOrigin(inputJwtAudience)];
    }
    else if (_.isArray(inputJwtAudience)) {
        const audienceSets = inputJwtAudience
            .filter(where => _.isString(where) && where !== "")
            .map(where => utilConvertURLOrigin(where));
        return audienceSets;
    }
    else {
        return [];
    }
};


module.exports = utilConvertJwtAudience;