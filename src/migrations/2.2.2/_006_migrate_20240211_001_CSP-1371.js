require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const moment = require("moment");
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const { Op, literal } = require("sequelize");
const { ShopsProfiles: ShopProfile } = require("../../models/model");

const migrateChangeCheckColumnType = async ({ transaction }) => {
    console.time('Migration-Run');

    const {
        initShopModel,
        ShopsProfiles: ShopProfile,
    } = require("../../models/model");

    const transactionResults = await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const currentDateTime = moment();
            const findShopProfiles = await ShopProfile.findAll({
                transaction: transaction,
                order: [['shop_code_id', 'ASC']]
            });
            const shop_code_ids = findShopProfiles.map(w => ({ shop_id: w.get('id'), shop_code_id: w.shop_code_id.toLowerCase() }));

            for (let indexShop = 0; indexShop < shop_code_ids.length; indexShop++) {
                console.log(`indexShop: ${indexShop + 1} of ${shop_code_ids.length}`);
                const element_shop_id = shop_code_ids[indexShop].shop_id;
                const element_shop_code_id = shop_code_ids[indexShop].shop_code_id;


                await db.query(
                    `
                        alter table app_shops_datas.dat_${element_shop_code_id}_check_customer alter column check_amount type numeric;      
                        `,
                    {
                        type: QueryTypes.RAW,
                    }
                );

            }

            // throw new Error('Passed!');
        }
    );

    console.timeEnd('Migration-Run');
    return transactionResults;
};

migrateChangeCheckColumnType({ transaction: null });

module.exports = migrateChangeCheckColumnType;