require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const moment = require("moment/moment");
const {
    ShopsProfiles: ShopProfile,
    initShopModel

} = require("../../models/model");
const ShopProduct = require('../../models/ShopProduct/ShopProduct');

const migratePriceArrShopProducts = async ({ transaction }) => {
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

                console.log(`indexShop: ${indexShop + 1} of ${shop_code_ids.length} ${table_name}`);

                await ShopProduct(table_name).sync({ alter: true })

                await db.query(
                    `
                                ALTER TABLE app_shops_datas.dat_01hq0004_business_customers ADD COLUMN IF NOT EXISTS tags uuid[] NULL;
                                COMMENT ON COLUMN app_shops_datas.dat_01hq0004_business_customers.tags IS 'array ของ id tags';
                                                           
                            `.replace(/(01hq0004)+/ig, table_name).replace(/\s+/ig, ' '),
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );

                await db.query(
                    `
                                ALTER TABLE app_shops_datas.dat_01hq0004_personal_customers ADD COLUMN IF NOT EXISTS tags uuid[] NULL;
                                COMMENT ON COLUMN app_shops_datas.dat_01hq0004_personal_customers.tags IS 'array ของ id tags';
                                                           
                            `.replace(/(01hq0004)+/ig, table_name).replace(/\s+/ig, ' '),
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );




            }

        }
    );

    console.timeEnd('Migration-Run');
    return transactionResults;
};

migratePriceArrShopProducts({ transaction: null });

module.exports = migratePriceArrShopProducts;