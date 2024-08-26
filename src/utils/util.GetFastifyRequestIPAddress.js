const _ = require("lodash");
const utilIsIPv4 = require("./util.IsIPv4");
const utilIsIPv6 = require("./util.IsIPv6");

/**
 * A utility help to get ip from a fastify's request
 * @template T
 * @param {import("fastify").FastifyRequest<T> | import("fastify").FastifyRequest | import("../types/type.Default.Fastify").FastifyRequestDefault | import("../types/type.Default.Fastify").FastifyRequestDefault<T>} request - A fastify's request
 * @return {{ip: string | "", version: "v4"|"v6"|""}}
 */
const utilGetFastifyRequestIPAddress = (request) => {
    const requestIP = request.headers['HTTP_X_REAL_IP'] || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const requestIP_Version = utilIsIPv4(requestIP) ? "v4" : utilIsIPv6(requestIP) ? "v6" : "";
    return {
        ip: _.isArray(requestIP) ? "" : requestIP,
        version: requestIP_Version
    };
};

module.exports = utilGetFastifyRequestIPAddress;