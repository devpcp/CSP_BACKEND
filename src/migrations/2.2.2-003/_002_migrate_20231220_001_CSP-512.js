require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const moment = require("moment/moment");
const { ShopsProfiles: ShopProfile, initShopModel, ShopCustomerDebtList, ShopCustomerDebtBillingNoteList } = require("../../models/model");
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
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list
                    drop column if exists shop_customer_debt_billing_note_doc_id;

                    alter table app_shops_datas.dat_01hq0001_customer_debt_list
                    alter column shop_service_order_doc_id drop not null;

                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list
                    alter column shop_service_order_doc_id drop not null;

                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_shop_customer_debt_bn_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_shop_customer_debt_cn_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_list_shop_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_li_shop_service_order_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_shop_temporary_delivery_orde_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_list_shop_tax_invoice_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_list_bus_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_list_per_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_list_vehicle_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_list_tax_type_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_list_created_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_list_updated_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_b_shop_customer_debt_bn_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_b_shop_customer_debt_cn_doc_id_fkey1;
                    

                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_li_shop_customer_debt_cn_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_customer_debt_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_service_order_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_li_shop_temporary_delivery_orde_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_tax_invoice_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_bus_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_per_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_vehicle_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_tax_type_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_created_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_updated_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_l_shop_customer_debt_cn_doc_id_fkey1;

                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_l_shop_temporary_delivery_orde_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_bus_customer_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_created_by_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_per_customer_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_customer_debt_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_service_order_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_tax_invoice_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_tax_type_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_updated_by_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_vehicle_customer_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_customer_debt_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_service_order_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_li_shop_temporary_delivery_orde_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_shop_tax_invoice_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_bus_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_per_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_vehicle_customer_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_tax_type_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_created_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_list_updated_by_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_li_shop_customer_debt_cn_doc_id_fkey;

                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_b_shop_customer_debt_dn_doc_id_fkey1;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_l_shop_customer_debt_dn_doc_id_fkey1;

                    alter table app_shops_datas.dat_01hq0001_customer_debt_list drop constraint if exists dat_01hq0001_customer_debt_li_shop_customer_debt_dn_doc_id_fkey;
                    
                    alter table app_shops_datas.dat_01hq0001_customer_debt_bn_list drop constraint if exists dat_01hq0001_customer_debt_bn_shop_customer_debt_dn_doc_id_fkey;

                    `.replace(/(01hq0001)/g, table_name),
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );

                await ShopCustomerDebtList(table_name).sync({
                    force: false,
                    alter: true,
                    transaction: transaction
                });

                await ShopCustomerDebtBillingNoteList(table_name).sync({
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