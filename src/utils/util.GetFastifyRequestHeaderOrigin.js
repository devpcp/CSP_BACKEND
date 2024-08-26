const _ = require("lodash");

/**
 * A utility to get origin URL from HTTP header "origin"
 * @template T
 * @param {import("fastify").FastifyRequest | import("fastify").FastifyRequest<T> | import("../types/type.Default.Fastify").FastifyRequestDefault | import("../types/type.Default.Fastify").FastifyRequestDefault<T>} request
 * @returns {string}
 */
const utilGetFastifyRequestHeaderOrigin = (request) => {
    return _.isString(request.headers["origin"]) ? request.headers["origin"] : "";
};


module.exports = utilGetFastifyRequestHeaderOrigin;