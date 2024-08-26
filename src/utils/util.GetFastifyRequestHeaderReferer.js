const _ = require("lodash");

/**
 * A utility to get origin URL from HTTP header "referer"
 * @template T
 * @param {import("fastify").FastifyRequest | import("fastify").FastifyRequest<T> | import("../types/type.Default.Fastify").FastifyRequestDefault | import("../types/type.Default.Fastify").FastifyRequestDefault<T>} request
 * @returns {string}
 */
const utilGetFastifyRequestHeaderReferer = (request) => {
    return _.isString(request.headers["referer"]) ? request.headers["referer"] : "";
};


module.exports = utilGetFastifyRequestHeaderReferer;