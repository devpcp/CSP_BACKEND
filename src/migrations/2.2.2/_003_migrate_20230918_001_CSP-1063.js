require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const moment = require("moment");
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const { Op, literal } = require("sequelize");
const { ShopsProfiles: ShopProfile } = require("../../models/model");
const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels")

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

            for (let i = 0; i < shop_code_ids.length; i++) {
                const element_shop_code_id = shop_code_ids[i].shop_code_id;
                console.log(`Init model shop: ${i + 1} of ${shop_code_ids.length}`);
                utilGetModelsAndShopModels(element_shop_code_id);
            }

            for (let indexShop = 0; indexShop < shop_code_ids.length; indexShop++) {
                console.log(`indexShop: ${indexShop + 1} of ${shop_code_ids.length}`);
                const element_shop_id = shop_code_ids[indexShop].shop_id;
                const element_shop_code_id = shop_code_ids[indexShop].shop_code_id;

                // if (element_shop_code_id !== '01hq0010' && element_shop_code_id !== '01hq0004') {
                //     continue;
                // }
                // if (element_shop_code_id !== '01hq0012') { continue; }
                // if (element_shop_code_id !== '01hq0011') { continue; }

                const ShopModels = utilGetModelsAndShopModels(element_shop_code_id).ShopModels || initShopModel(element_shop_code_id);
                const {
                    ShopServiceOrderDoc,
                    ShopServiceOrderList,
                    ShopCustomerDebtDoc,
                    ShopCustomerDebtList,
                    ShopPaymentTransaction,
                } = ShopModels;

                const runSyncTable = async () => {
                    await db.query(
                        `
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_code_id_key;
                                 
                            drop index if exists app_shops_datas.dat_01hq0003_payment_transaction_code_id_key;
                                 
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transact_shop_temporary_delivery_orde_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_bank_name_list_id_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_canceled_payment_by_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_created_by_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_doc_type_id_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_payment_payee_by_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_shop_id_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_shop_service_order_doc_id_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_shop_tax_invoice_doc_id_fkey;

                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                            drop constraint if exists dat_01hq0003_payment_transaction_updated_by_fkey;
                                 
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_shop_customer_debt_doc_id_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_shop_id_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_doc_type_id_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_shop_service_order_doc_id_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transact_shop_temporary_delivery_orde_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_shop_tax_invoice_doc_id_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_bank_name_list_id_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_payment_payee_by_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_canceled_payment_by_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_created_by_fkey;
                            
                            alter table app_shops_datas.dat_01hq0003_payment_transaction
                                drop constraint if exists dat_01hq0003_payment_transaction_updated_by_fkey;
                            
                            drop index if exists app_shops_datas.dat_01hq0003_payment_transaction_code_id;
                        `.replace(/(01hq0003)/g, element_shop_code_id.toLowerCase()),
                        {
                            type: QueryTypes.RAW,
                            transaction: transaction
                        }
                    );
                    await db.query(
                        `
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_bus_customer_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_created_by_fkey;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_doc_type_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_per_customer_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_shop_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_tax_type_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_updated_by_fkey;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_vehicle_customer_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_shop_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_doc_type_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_bus_customer_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_per_customer_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_vehicle_customer_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_tax_type_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_created_by_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0002_service_order_doc
                            drop constraint if exists dat_01hq0002_service_order_doc_updated_by_fkey1;
                        `.replace(/(01hq0002)/g, element_shop_code_id.toLowerCase()),
                        {
                            type: QueryTypes.RAW,
                            transaction: transaction
                        }
                    );
                    await db.query(
                        `
                        alter table app_shops_datas.dat_01hq0013_payment_transaction
                            alter column shop_service_order_doc_id drop not null;
                        `.replace(/(01hq0013)/g, element_shop_code_id.toLowerCase()),
                        {
                            type: QueryTypes.RAW,
                            transaction: transaction
                        }
                    );
                    await db.query(
                        `
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_created_by_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_purchase_unit_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_product_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_service_order_doc_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_stock_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_warehouse_id_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_updated_by_fkey;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_service_order_doc_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_product_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_stock_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_shop_warehouse_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_purchase_unit_id_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_created_by_fkey1;
                        
                        alter table app_shops_datas.dat_01hq0001_service_order_list
                            drop constraint if exists dat_01hq0001_service_order_list_updated_by_fkey1;
                        drop index if exists app_shops_datas."01hq0001_job_list_shop_service_order_doc_id_idx";

                        drop index if exists app_shops_datas."01hq0001_job_list_shop_product_id_idx";
                        
                        drop index if exists app_shops_datas."01hq0001_job_list_shop_stock_id_idx";
                        
                        drop index if exists app_shops_datas."01hq0001_job_list_shop_warehouse_id_idx";
                        
                        drop index if exists app_shops_datas."01hq0001_job_list_shop_warehouse_shelf_item_id_idx";
                        
                        drop index if exists app_shops_datas."01hq0001_job_list_purchase_unit_id_idx";
                        
                        drop index if exists app_shops_datas."01hq0001_job_list_dot_mfd_idx";
                        `.replace(/(01hq0001)/g, element_shop_code_id.toLowerCase()),
                        {
                            type: QueryTypes.RAW,
                            transaction: transaction
                        }
                    );
                    if (false) {
                        await ((async () => {
                            try {
                                await ShopPaymentTransaction.destroy({
                                    where: {
                                        shop_customer_debt_doc_id: {
                                            [Op.not]: null
                                        }
                                    },
                                    transaction: transaction,
                                    ShopModels: ShopModels,
                                    hooks: false
                                });
                            } catch (error) {
                                console.log(`Failed to delete 'shop_customer_debt_doc_id' from ShopPaymentTransaction: Shop code_id ${element_shop_code_id}`);
                            }
                        })());
                    }
                    await ShopCustomerDebtDoc.sync({
                        force: true,
                        transaction: transaction
                    });
                    await ShopCustomerDebtList.sync({
                        force: true,
                        transaction: transaction
                    });
                    await ShopPaymentTransaction.sync({
                        force: false,
                        alter: true,
                        transaction: transaction
                    });
                    await ShopServiceOrderDoc.sync({
                        force: false,
                        alter: true,
                        transaction: transaction
                    });
                    await ShopServiceOrderList.sync({
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