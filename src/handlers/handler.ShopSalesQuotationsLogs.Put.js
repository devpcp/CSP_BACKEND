const { Transaction } = require("sequelize");
const {
    handleSaveLog,
} = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSequelizeCreateTableIfNotExistsFromModel = require("../utils/util.Sequelize.CreateTableIfNotExistsFromModel");

const db = require("../db");
const ShopSalesQuotationsLogs = require("../models/model").ShopSalesQuotationsLogs;


const handlerMasterProductPurchaseUnitTypesPut = async (request) => {
    const action = "put shopSalesQuotationsLogs put";

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        /**
         * A name for dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        /**
         * A class's dynamics instance of model "ShopSalesQuotationsLogs"
         */
        const instanceModelShopSalesQuotationsLogs = ShopSalesQuotationsLogs(table_name);
        await utilSequelizeCreateTableIfNotExistsFromModel(instanceModelShopSalesQuotationsLogs);

        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                const currentDateTime = Date.now();

                const beforeUpdateDocument = await instanceModelShopSalesQuotationsLogs.findOne(
                    {
                        where: {
                            id: request.params.id
                        },
                        transaction: transaction
                    }
                );

                const updatedDocument = await instanceModelShopSalesQuotationsLogs.update(
                    {
                        ...request.body,
                        updated_by: request.id,
                        updated_date: currentDateTime,
                    },
                    {
                        where: {
                            id: request.params.id
                        },
                        transaction: transaction
                    }
                );

                const afterUpdateDocument = await instanceModelShopSalesQuotationsLogs.findOne(
                    {
                        where: {
                            id: request.params.id
                        },
                        transaction: transaction
                    }
                );



                return {
                    beforeUpdateDocument: beforeUpdateDocument,
                    afterUpdateDocument: afterUpdateDocument,
                };
            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.beforeUpdateDocument], ""]);

        return utilSetFastifyResponseJson("success", transactionResult.afterUpdateDocument);

    } catch (error) {
        await handleSaveLog(request, [[action], ""]);

        throw error;
    }
};


module.exports = handlerMasterProductPurchaseUnitTypesPut;