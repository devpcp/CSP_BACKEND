const {
    isString,
} = require("lodash");

const utilCheckShopTableName = require("./util.CheckShopTableName");


/**
 * A utility help get value of "shop_code_id" from fastify's request
 * - Popularity use for "table_name" from scenario "Dynamic Tables"
 * @param {import("fastify").FastifyRequest<T> | import("fastify").FastifyRequest | import("../types/type.Default.Fastify").FastifyRequestDefault | import("../types/type.Default.Fastify").FastifyRequestDefault<T>} request - A fastify's request
 * @returns {Promise<string>}
 */
const utilGetFastifyRequestShopCodeId = async (request) => {
    /**
     * A result of find data to see what ShopProfile's id whereby this user's request
     */
    const findShopsProfile = await utilCheckShopTableName(request);

    if (!findShopsProfile || !findShopsProfile.shop_code_id || !isString(findShopsProfile.shop_code_id)) { throw Error(`"shop_code_id" is not found from request`); }
    else {
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        return table_name;
    }
};


module.exports = utilGetFastifyRequestShopCodeId;