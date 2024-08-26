const memModelShopTables = {};

/**
 * @param {string} table_name
 * @returns {{
 *     table_name: string;
 *     Models: Object<string, *>;
 *     ShopModels: Object<string, *>;
 * }}
 */
const utilGetModelsAndShopModels = (table_name, options = {}) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name' as String`); }
    table_name = table_name.toLowerCase();

    if (!memModelShopTables[table_name]) {
        const Models = require("../models/model");
        memModelShopTables[table_name] = {
            table_name: table_name,
            Models: Models,
            ShopModels: Models.initShopModel(table_name)
        };
    }

    return memModelShopTables[table_name];
};

module.exports = utilGetModelsAndShopModels;