const _ = require("lodash")
const acceptLangParser = require("accept-language-parser");
/**
 * A utility to generate language from HTTP header "accept-language"
 *  - Example returns: ["en", "th", "jp"]
 *  - Default returns: ["en", "th"]
 *  - Always return value "th" in array
 * @param {import("fastify").FastifyRequest<{Headers: {"accept-language": string}}>} request
 * @return {string[]}
 */
const utilGetFastifyRequestHeaderAcceptLanguage = (request) => {
    const headerAcceptLanguage = request.headers["accept-language"];
    if (!headerAcceptLanguage) {
        return ["en", "th"];
    }
    else {
        /**
         * A contents from HTTP header "accept-language" from package "accept-language-parser"
         * @type {{code?: string, region?: string, quality?: string}[]}
         */
        const parsedAcceptLanguage =  acceptLangParser.parse(request.headers["accept-language"]);
        if (!_.isArray(parsedAcceptLanguage)) {
            return ["en", "th"];
        }
        else {
            const reducedAcceptLanguage = parsedAcceptLanguage.reduce(
                (prev, curr) => {
                    if (_.isString(curr.code)) {
                        if (!prev.includes(curr.code.toLowerCase())) {
                            prev.push(curr.code.toLowerCase());
                        }
                    }
                    return prev;
                },
                []
            );

            if (reducedAcceptLanguage.length === 0) {
                return ["en", "th"];
            }
            else if (!reducedAcceptLanguage.includes("th")) {
                return [...reducedAcceptLanguage, "th"];
            }
            else {
                return reducedAcceptLanguage;
            }
        }
    }
};

module.exports = utilGetFastifyRequestHeaderAcceptLanguage;