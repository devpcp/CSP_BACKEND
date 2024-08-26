const utilConvertStringToNumberSeconds = require("./util.ConvertStringToNumberSeconds");

/**
 * A utility help convert string contains number and property of times To number of "milliseconds"
 * - example: inputString = "20m"
 * - example: inputString = "350h"
 * @param inputString
 * @return {number}
 */
const utilConvertStringToNumberMilliseconds = (inputString = "") => {
    return utilConvertStringToNumberSeconds(inputString) * 1000;
};

module.exports = utilConvertStringToNumberMilliseconds;