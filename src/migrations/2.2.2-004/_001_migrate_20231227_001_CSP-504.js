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
    ShopPartnerDebtDoc,
    ShopPartnerDebtBillingNoteDoc,
    ShopPartnerDebtBillingNoteList
} = require("../../models/model");
const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");
const ShopPartnerDebtList = require('../../models/ShopPartnerDebtList/ShopPartnerDebtList');

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
                console.log(`indexShop: ${indexShop + 1} of ${shop_code_ids.length}`);
                // const element_shop_id = shop_code_ids[indexShop].shop_id;
                // const element_shop_code_id = shop_code_ids[indexShop].shop_code_id;
                const table_name = shop_code_ids[indexShop].shop_code_id;


                // const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels;
                // const {
                //     ShopCustomerDebtBillingNoteDoc,
                //     ShopCustomerDebtBillingNoteList
                // } = ShopModels;

                await ShopPartnerDebtDebitNoteDoc(table_name).sync({
                    force: true,
                    transaction: transaction
                });

                await ShopPartnerDebtDebitNoteList(table_name).sync({
                    force: true,
                    transaction: transaction
                });

                await ShopPartnerDebtCreditNoteDoc(table_name).sync({
                    force: true,
                    transaction: transaction
                });

                await ShopPartnerDebtCreditNoteList(table_name).sync({
                    force: true,
                    transaction: transaction
                });

                await ShopPartnerDebtDoc(table_name).sync({
                    force: true,
                    transaction: transaction
                });

                await ShopPartnerDebtList(table_name).sync({
                    force: true,
                    transaction: transaction
                });

                await ShopPartnerDebtBillingNoteDoc(table_name).sync({
                    force: true,
                    transaction: transaction
                });

                await ShopPartnerDebtBillingNoteList(table_name).sync({
                    force: true,
                    transaction: transaction
                });


                await db.query(
                    `
                            ALTER TABLE app_shops_datas.dat_01hq0004_payment_transaction ADD COLUMN IF NOT EXISTS shop_inventory_transaction_id uuid DEFAULT NULL ;
                            COMMENT ON COLUMN app_shops_datas.dat_01hq0004_payment_transaction.shop_inventory_transaction_id IS 'รหัสหลักตารางข้อมูลใบนำเข้า';
                       
                            ALTER TABLE app_shops_datas.dat_01hq0004_payment_transaction ADD COLUMN IF NOT EXISTS shop_partner_debt_doc_id uuid DEFAULT NULL ;
                            COMMENT ON COLUMN app_shops_datas.dat_01hq0004_payment_transaction.shop_partner_debt_doc_id IS 'รหัสหลักตารางข้อมูลเอกสารเจ้าหนี้การค้า';

                            ALTER TABLE app_shops_datas.dat_01hq0004_inventory_transaction_doc ADD COLUMN IF NOT EXISTS price_grand_total decimal(12,2) DEFAULT 0 ;
                            COMMENT ON COLUMN app_shops_datas.dat_01hq0004_inventory_transaction_doc.price_grand_total IS 'จำนวนเงินรวมทั้งสิ้น';

                            ALTER TABLE app_shops_datas.dat_01hq0004_inventory_transaction_doc ADD COLUMN IF NOT EXISTS debt_price_amount decimal(12,2) DEFAULT 0 ;
                            COMMENT ON COLUMN app_shops_datas.dat_01hq0004_inventory_transaction_doc.debt_price_amount IS 'จำนวนเงินเจ้าหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)';

                            ALTER TABLE app_shops_datas.dat_01hq0004_inventory_transaction_doc ADD COLUMN IF NOT EXISTS debt_price_amount_left decimal(12,2) DEFAULT 0 ;
                            COMMENT ON COLUMN app_shops_datas.dat_01hq0004_inventory_transaction_doc.debt_price_amount_left IS 'จำนวนเงินเจ้าหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)';
                            
                            UPDATE app_shops_datas.dat_01hq0004_inventory_transaction_doc
                            SET price_grand_total= replace(details->>'net_price',',','')::float;

                            ALTER TABLE app_shops_datas.dat_01hq0004_inventory_transaction_doc ADD COLUMN IF NOT EXISTS payment_paid_status SMALLINT DEFAULT 1 ;
                            COMMENT ON COLUMN app_shops_datas.dat_01hq0004_inventory_transaction_doc.payment_paid_status IS 'สถานะการชําระเงิน\n0 = ยกเลิกชำระ\n1 = ยังไม่ชำระ\n2 = ค้างชำระ\n3 = ชําระแล้ว\n4 = ชําระเกิน\n6 = เจ้าหนี้การค้า' ;
                            
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

migrateTableCreation({ transaction: null });

module.exports = migrateTableCreation;