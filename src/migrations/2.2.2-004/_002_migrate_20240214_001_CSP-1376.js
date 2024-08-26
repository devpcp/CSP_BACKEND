require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const moment = require("moment/moment");
const {
    ShopsProfiles: ShopProfile,
    initShopModel,
    ShopPartnerDebtDebitNoteDoc,
    ShopPartnerDebtDebitNoteList,
    ShopPartnerDebtCreditNoteDoc,
    ShopPartnerDebtCreditNoteList,
    ShopCustomerDebtDoc,
    ShopCustomerDebtList
} = require("../../models/model");
const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

const migrateTableChangesFields = async ({ transaction }) => {
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

                await db.query(
                    `
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_li_shop_customer_debt_cn_doc_id_fkey;

                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_li_shop_customer_debt_dn_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_li_shop_temporary_delivery_orde_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_bus_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_created_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_per_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_shop_customer_debt_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_shop_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_shop_service_order_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_shop_tax_invoice_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_tax_type_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_updated_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_vehicle_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_shop_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_shop_customer_debt_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_shop_service_order_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_l_shop_temporary_delivery_orde_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_shop_tax_invoice_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_bus_customer_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_per_customer_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_vehicle_customer_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_tax_type_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_created_by_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_list_updated_by_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_l_shop_customer_debt_dn_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0004_customer_debt_list drop constraint if exists dat_01hq0004_customer_debt_l_shop_customer_debt_cn_doc_id_fkey1;
                    `.replace(/(01hq0004)+/ig, table_name).replace(/\s+/ig, ' '),
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );

                await ShopCustomerDebtDoc(table_name).sync({
                    force: false,
                    alter: true,
                    transaction: transaction
                });

                await ShopCustomerDebtList(table_name).sync({
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

migrateTableChangesFields({ transaction: null });

module.exports = migrateTableChangesFields;