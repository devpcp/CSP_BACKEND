require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const moment = require("moment/moment");
const {
    ShopsProfiles: ShopProfile,
    initShopModel,
    ShopAppointment
} = require("../../models/model");
const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

const migrateTableAlternation = async ({ transaction }) => {
    console.time('Migration-Run');

    const currentDateTime = moment();

    const findShopProfiles = await ShopProfile.findAll({
        transaction: transaction || null,
        order: [['shop_code_id', 'ASC']]
    });
    const shop_code_ids = findShopProfiles.map(w => ({ shop_id: w.get('id'), shop_code_id: w.shop_code_id.toLowerCase()}));
    // for (let indexShop = 0; indexShop < shop_code_ids.length; indexShop++) {
    //     console.log(`Init Model Shop: ${indexShop + 1} of ${shop_code_ids.length}`);
    //     const table_name = shop_code_ids[indexShop].shop_code_id;
    //     const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels;
    // }

    const transactionResults = await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            for (let indexShop = 0; indexShop < shop_code_ids.length; indexShop++) {
                console.log(`indexShop: ${indexShop + 1} of ${shop_code_ids.length}`);
                // const element_shop_id = shop_code_ids[indexShop].shop_id;
                // const element_shop_code_id = shop_code_ids[indexShop].shop_code_id;
                const table_name = shop_code_ids[indexShop].shop_code_id;


                // const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels;
                // const {
                //     ShopCustomerDebtBillingNoteDoc,
                //     ShopCustomerDebtBillingNoteList
                // } = ShopModels;

                await db.query(
                    `
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_bus_customer_id_fkey;

                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_created_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_per_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_shop_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_updated_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_vehicles_customers_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_shop_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_bus_customer_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_per_customer_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_vehicles_customers_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_created_by_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_appointment drop constraint if exists dat_01hq0004_appointment_updated_by_fkey1;

                    `.replace(/(01hq0004)/g, table_name),
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );

                await ShopAppointment(table_name).sync({
                    force: false,
                    alter: true,
                    transaction: transaction
                });
            }

        }
    );

    console.timeEnd('Migration-Run');
    return transactionResults;
};

migrateTableAlternation({ transaction: null });

module.exports = migrateTableAlternation;