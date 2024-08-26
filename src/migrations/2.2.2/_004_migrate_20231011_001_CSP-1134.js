require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const moment = require("moment");
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const { Op, literal } = require("sequelize");
const { ShopsProfiles: ShopProfile } = require("../../models/model");

const migrateAddTableShopCustomerDebt = async ({ transaction }) => {
    console.time('Migration-Run');
    const {
        initShopModel,
        ShopsProfiles: ShopProfile,
        DocumentTypes,
        ShopInventoryMovementLog,
        ShopDocumentCode
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
            const shop_code_ids = findShopProfiles.map(w => ({ shop_id: w.get('id'), shop_code_id: w.shop_code_id.toLowerCase()}));

            for (let indexShop = 0; indexShop < shop_code_ids.length; indexShop++) {
                console.log(`indexShop: ${indexShop + 1} of ${shop_code_ids.length}`);
                const element_shop_id = shop_code_ids[indexShop].shop_id;
                const element_shop_code_id = shop_code_ids[indexShop].shop_code_id;

                // if (element_shop_code_id !== '01hq0010' && element_shop_code_id !== '01hq0004') {
                //     continue;
                // }
                // if (element_shop_code_id !== '01hq0012') { continue; }
                // if (element_shop_code_id !== '01hq0011') { continue; }

                const ShopModels = initShopModel(element_shop_code_id);
                const {
                    ShopProduct
                } = ShopModels;

                const runSyncTable = async () => {
                    await db.query(
                        `
                        alter table app_shops_datas.dat_01hq0001_products drop constraint if exists dat_01hq0001_products_created_by_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_products drop constraint if exists dat_01hq0001_products_product_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_products drop constraint if exists dat_01hq0001_products_updated_by_fkey;

                        alter table app_shops_datas.dat_01hq0001_products
                            drop constraint if exists dat_01hq0001_products_product_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_products
                            drop constraint if exists dat_01hq0001_products_created_by_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_products
                            drop constraint if exists dat_01hq0001_products_updated_by_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_products
                            drop constraint if exists dat_01hq0001_products_product_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_products
                            drop constraint if exists dat_01hq0001_products_created_by_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_products
                            drop constraint if exists dat_01hq0001_products_updated_by_fkey;
                        `.replace(/(01hq0001)/g, element_shop_code_id.toLowerCase()),
                        {
                            type: QueryTypes.RAW,
                            transaction: transaction
                        }
                    );
                    await ShopProduct.sync({
                        force: false,
                        alter: true,
                        transaction: transaction
                    });
                };

                await runSyncTable()
            }
            // throw new Error('Passed!');
        }
    );

    console.timeEnd('Migration-Run');
    return transactionResults;
};

migrateAddTableShopCustomerDebt({ transaction: null });

module.exports = migrateAddTableShopCustomerDebt;