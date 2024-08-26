require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction } = require("sequelize");
const db = require("../../db");
const moment = require("moment/moment");
const {
    ShopsProfiles: ShopProfile,
    initShopModel,
    ShopBank,
    ShopCheckCustomer
} = require("../../models/model");
const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

const migrateTableCreation = async ({ transaction }) => {
    console.time('Migration-Run');

    const currentDateTime = moment();

    const findShopProfiles = await ShopProfile.findAll({
        transaction: transaction || null,
        order: [['shop_code_id', 'ASC']]
    });
    const shop_code_ids = findShopProfiles.map(w => ({ shop_id: w.get('id'), shop_code_id: w.shop_code_id.toLowerCase() }));

    const transactionResults = await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            for (let indexShop = 0; indexShop < shop_code_ids.length; indexShop++) {

                const table_name = shop_code_ids[indexShop].shop_code_id;

                await ShopBank(table_name).sync({
                    // force: true
                });

                await ShopCheckCustomer(table_name).sync({
                    // force: true
                });

            }

        }
    );

    console.timeEnd('Migration-Run');
    return transactionResults;
};

migrateTableCreation({ transaction: null });

module.exports = migrateTableCreation;