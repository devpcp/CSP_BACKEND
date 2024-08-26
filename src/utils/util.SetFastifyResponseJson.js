const _ = require("lodash");

/**
 * A set of status parameter's function-utilSetFastifyResponseJson
 * @type {import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJsonFieldStatus[]}
 */
const allowedStatusNames = [
    "success",
    "failed"
];

/**
 * A utility helps you to render Fastify's reply with JSON schema
 * @template T
 * @param {"success"|"failed"} status
 * @param {T} data
 * @returns {import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<T>}
 */
const utilSetFastifyResponseJson = (status, data) => {
    if (!_.isString(status) || !allowedStatusNames.includes(status)) {
        throw Error(`Render response data has failed, due parameter "status" must be only one of [${allowedStatusNames}]`);
    }
    else {
        return { status: status, data: data };
    }
};

module.exports = utilSetFastifyResponseJson;