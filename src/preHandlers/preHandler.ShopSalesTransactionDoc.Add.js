const { isUUID } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;

/**
 * Checking the existence of the document in the database, if the document exists, then the function will throw an error,
 * otherwise the function will return true
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request - The request object
 * @returns {Promise<boolean>} A boolean value
 */
const preHandlerShopSalesTransactionDocAdd = async (request) => {
    if (isUUID(request.body.vehicles_customers_id)) {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        /**
         * A class's dynamics instance of model "ShopSalesTransactionDoc"
         */
        const instanceModelShopSalesTransactionDoc = modelShopSalesTransactionDoc(table_name);

        const findDocument = await instanceModelShopSalesTransactionDoc.findOne({
            where: {
                vehicles_customers_id: request.body.vehicles_customers_id,
                doc_type_id: '67c45df3-4f84-45a8-8efc-de22fef31978',
                status: 1
            },
        });

        if (findDocument) {
            throw Error(`Cannot create new document in this vehicles_customers_id, due old document is this vehicles_customers_id have status is 1 (some document is not finished)`)
        }
        else {
            return true;
        }
    }
    else {
        return true;
    }
};


module.exports = preHandlerShopSalesTransactionDocAdd;