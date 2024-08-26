/**
 * A utility help you convert our URL to get "URL Origin"
 * @param inputURL
 * @returns {string}
 */
const utilConvertURLOrigin = (inputURL = "") => {
    if (!inputURL) {
        return "";
    }
    else {
        const url = new URL(`blob:${inputURL}`);
        return url.origin;
    }
};

module.exports = utilConvertURLOrigin;