require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const moment = require("moment");
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const { Op, literal } = require("sequelize");
const { ShopsProfiles: ShopProfile } = require("../../models/model");

const documentType = {
    "ServiceOrder": "7ef3840f-3d7f-43de-89ea-dce215703c16",
    "SalesOrder": "67c45df3-4f84-45a8-8efc-de22fef31978"
};

const documentVatType = {
    "IncludedVat": 1,
    "ExcludedVat": 2,
    "NonVat": 3
};
const documentVatTypeId = {
    "IncludedVat": "8c73e506-31b5-44c7-a21b-3819bb712321",
    "ExcludedVat": "fafa3667-55d8-49d1-b06c-759c6e9ab064",
    "NonVat": "52b5a676-c331-4d03-b650-69fc5e591d2c"
};
const vatTypeRate = {
    "IncludedVat": 7,
    "ExcludedVat": 7,
    "NonVat": 0
};
const superAdminUserId = "90f5a0a9-a111-49ee-94df-c5623811b6cc";


const fnGetPaymentFromShopSalesTransactionDoc = async (shop_code, shop_sales_transaction_id, options = {}) => {
    /**
     * @type {{
     *   id: string;
     *   shop_id: string;
     *   doc_date: string;
     *   status: number;
     *   status_name: string;
     *   payment_type: number;
     *   payment_type_name: string;
     *   grand_total: string;
     *   payment_cash: string;
     *   payment_change: string;
     *   payment_bank_id: string | null;
     *   payment_bank_name: string | null;
     *   payment_payment_method_id: string | null;
     *   payment_payment_method_name: string | null;
     *   payment_credit_card_type_id: string | null;
     *   payment_credit_card_type_name: string | null;
     *   payment_credit_card_last_4_end_digit: string | null;
     *   payment_transfer_transferor_name: string | null;
     *   payment_transfer_transfered_time: any;
     *   payment_payment_date: Date | null;
     *   payment_remark: string | null;
     *   payment_details: Object<string, *>,
     *   created_date: Date;
     *   updated_date: Date | null;
     * }[]}
     */
    const queryResult = await db.query(
        `
        SELECT id,
           shop_id,
           doc_date,
           status,
           CASE WHEN status = 0 THEN 'ยกเลิกชำระ' ELSE 'ชำระเงินแล้ว' END AS status_name,
           ((details#>'{payment}')->>'type')::integer AS payment_type,
           ((details#>'{payment}')->>'type_text')::VARCHAR AS payment_type_name,
           ((details#>'{calculate_result}')->>'net_total')::DECIMAL(10, 2) AS grand_total,
           (coalesce((REGEXP_REPLACE((details#>'{payment}')->>'cash', '[^\\d\\.]', '', 'ig')), '0'))::DECIMAL(10,2) AS payment_cash,
           (coalesce((REGEXP_REPLACE((details#>'{payment}')->>'change', '[^\\d\\.]', '', 'ig')), '0'))::DECIMAL(10,2) AS payment_change,
           ((details#>'{payment}')->>'bank_id')::uuid AS payment_bank_id,
           ((details#>'{payment}')->'bank_name'->>'th')::VARCHAR AS payment_bank_name,
           ((details#>'{payment}')->>'payment_method_id')::VARCHAR AS payment_payment_method_id,
           ((details#>'{payment}')->'payment_method_text'->>'th')::VARCHAR AS payment_payment_method_name,
           ((details#>'{payment}')->>'card_type_id')::uuid AS payment_credit_card_type_id,
           ((details#>'{payment}')->'card_type_text'->>'th')::VARCHAR AS payment_credit_card_type_name,
           ((details#>'{payment}')->>'card_4_end_code')::VARCHAR AS payment_credit_card_last_4_end_digit,
           ((details#>'{payment}')->>'transferor_name')::VARCHAR AS payment_transfer_transferor_name,
           ((details#>'{payment}')->>'transfer_time')::timestamptz AS payment_transfer_transfered_time,
           ((details#>'{payment}')->>'payment_date')::timestamptz AS payment_payment_date,
           ((details#>'{payment}')->>'remark') AS payment_remark,
           details#>'{payment}' AS payment_details,
           created_date,
           updated_date
        FROM app_shops_datas.dat_01hq0010_sales_transaction_doc
        WHERE id = :shop_sales_transaction_id
            AND purchase_status = True
            AND status IN (0, 3)
        `.replace(/(dat_01hq0010_sales_transaction_doc)/g, `dat_${shop_code}_sales_transaction_doc`),
        {
            transaction: options?.transaction || null,
            type: QueryTypes.SELECT,
            replacements: {
                shop_sales_transaction_id: shop_sales_transaction_id
            }
        }
    );

    return queryResult?.[0];
};

const fnCreateTempTablePaymentFromShopSalesTransactionDoc = async (shop_code, options = {}) => {
    // const checkTable = await (db.query(
    //     `
    //     SELECT * FROM app_shops_datas.dat_01hq0010_old_payment_doc LIMIT 1;
    //     `.replace(/(_01hq0010_)/g, `_${shop_code}_`),
    //     {
    //         transaction: options?.transaction || null,
    //         type: QueryTypes.RAW
    //     }
    // ).then(() => true).catch(() => false));
    const checkTable = false;
    if (checkTable === false) {
        await db.query(
        `
        CREATE TABLE IF NOT EXISTS app_shops_datas.dat_01hq0010_old_payment_doc
        AS (
            SELECT id,
                shop_id,
                doc_date,
                status,
                CASE WHEN status = 0 THEN 'ยกเลิกชำระ' ELSE 'ชำระเงินแล้ว' END AS status_name,
                ((details#>'{payment}')->>'type')::integer AS payment_type,
                ((details#>'{payment}')->>'type_text')::VARCHAR AS payment_type_name,
                ((details#>'{calculate_result}')->>'net_total')::DECIMAL(10, 2) AS grand_total,
                (coalesce((REGEXP_REPLACE((details#>'{payment}')->>'cash', '[^\\d\\.]', '', 'ig')), '0'))::DECIMAL(10,2) AS payment_cash,
                (coalesce((REGEXP_REPLACE((details#>'{payment}')->>'change', '[^\\d\\.]', '', 'ig')), '0'))::DECIMAL(10,2) AS payment_change,
                ((details#>'{payment}')->>'bank_id')::uuid AS payment_bank_id,
                ((details#>'{payment}')->'bank_name'->>'th')::VARCHAR AS payment_bank_name,
                ((details#>'{payment}')->>'payment_method_id')::uuid AS payment_payment_method_id,
                ((details#>'{payment}')->'payment_method_text'->>'th')::VARCHAR AS payment_payment_method_name,
                ((details#>'{payment}')->>'card_type_id')::uuid AS payment_credit_card_type_id,
                ((details#>'{payment}')->'card_type_text'->>'th')::VARCHAR AS payment_credit_card_type_name,
                ((details#>'{payment}')->>'card_4_end_code')::VARCHAR AS payment_credit_card_last_4_end_digit,
                ((details#>'{payment}')->>'transferor_name')::VARCHAR AS payment_transfer_transferor_name,
                ((details#>'{payment}')->>'transfer_time')::timestamptz AS payment_transfer_transfered_time,
                ((details#>'{payment}')->>'payment_date')::timestamptz AS payment_payment_date,
                ((details#>'{payment}')->>'remark') AS payment_remark,
                details#>'{payment}' AS payment_details,
                created_date,
                updated_date
            FROM app_shops_datas.dat_01hq0010_sales_transaction_doc
            WHERE purchase_status = True
                AND status IN (0, 3)
        );
        `.replace(/(_01hq0010_)/g, `_${shop_code}_`),
            {
                transaction: options?.transaction || null,
                type: QueryTypes.RAW
            }
        );
        await db.query(
        `
        ALTER TABLE IF EXISTS app_shops_datas.dat_01hq0010_old_payment_doc add unique (id);
        CREATE UNIQUE INDEX IF NOT EXISTS dat_01hq0010_old_payment_doc_pkey on app_shops_datas.dat_01hq0010_old_payment_doc (id);
        `.replace(/(_01hq0010_)/g, `_${shop_code}_`),
            {
                transaction: options?.transaction || null,
                type: QueryTypes.RAW
            }
        );
    }
};

const fnDropTempTablePaymentFromShopSalesTransactionDoc = async (shop_code, options = {}) => {
    await db.query(
        `
        DROP TABLE IF EXISTS app_shops_datas.dat_01hq0010_old_payment_doc;
        `.replace(/(_01hq0010_)/g, `_${shop_code}_`),
        {
            transaction: options?.transaction || null,
            type: QueryTypes.RAW
        }
    );
};

const fnGetPaymentFromShopSalesTransactionDocFromTempTable = async (shop_code, shop_sales_transaction_id, options = {}) => {
    /**
     * @type {{
     *   id: string;
     *   shop_id: string;
     *   doc_date: string;
     *   status: number;
     *   status_name: string;
     *   payment_type: number;
     *   payment_type_name: string;
     *   grand_total: string;
     *   payment_cash: string;
     *   payment_change: string;
     *   payment_bank_id: string | null;
     *   payment_bank_name: string | null;
     *   payment_payment_method_id: string | null;
     *   payment_payment_method_name: string | null;
     *   payment_credit_card_type_id: string | null;
     *   payment_credit_card_type_name: string | null;
     *   payment_credit_card_last_4_end_digit: string | null;
     *   payment_transfer_transferor_name: string | null;
     *   payment_transfer_transfered_time: any;
     *   payment_payment_date: Date | null;
     *   payment_remark: string | null;
     *   payment_details: Object<string, *>,
     *   created_date: Date;
     *   updated_date: Date | null;
     * }[]}
     */
    const queryResult = await db.query(
        `
        SELECT *
        FROM app_shops_datas.dat_01hq0010_old_payment_doc
        WHERE id = :shop_sales_transaction_id
        `.replace(/(_01hq0010_)/g, `_${shop_code}_`),
        {
            transaction: options?.transaction || null,
            type: QueryTypes.SELECT,
            replacements: {
                shop_sales_transaction_id: shop_sales_transaction_id
            }
        }
    );

    return queryResult?.[0];
};


/**
 * @param {string} shop_code
 * @param {Object} options
 * @return {Promise<{doc_type_id: string, doc_type_code: string, run_no: number, code_id: string, created_by: string, created_date: string}[]>}
 */
const fnGetLatestDocumentCode = async (shop_code, options = {}) => {
    /**
     * @type {{
     *   doc_type_id: string
     *   doc_type_code: string
     *   run_no: number
     *   code_id: string
     *   created_by: string
     *   created_date: string
     * }[]}
     */
    const queryResult = await db.query(
        `
        WITH
        CTE_DocData AS (
            SELECT code_id_prefix, doc_type_id, max(code_id) AS code_id
            FROM app_shops_datas.dat_01hq0010_service_order_doc
            GROUP BY code_id_prefix, doc_type_id
        )
        SELECT CTE_DocData.doc_type_id,
               CTE_DocData.code_id_prefix AS doc_type_code,
               (coalesce(NULLIF((substr(replace(CTE_DocData.code_id, CTE_DocData.code_id_prefix, ''), 7)), ''), '0'))::integer AS run_no,
               CTE_DocData.code_id AS code_id,
               "ShopServiceOrderDoc".created_by,
               "ShopServiceOrderDoc".created_date
        FROM CTE_DocData
        JOIN app_shops_datas.dat_01hq0010_service_order_doc AS "ShopServiceOrderDoc" ON "ShopServiceOrderDoc".code_id = CTE_DocData.code_id;
        `.replace(/(_01hq0010_)/g, `_${shop_code}_`),
        {
            transaction: options?.transaction || null,
            type: QueryTypes.SELECT
        }
    );

    return queryResult;
};

const fnUpdateShopServiceOrder__IsMigratedToFalse = async (shop_code, options = {}) => {
    await db.query(
        `
        UPDATE app_shops_datas.dat_01hq0012_service_order_doc
        SET is_migrated = false;
        UPDATE app_shops_datas.dat_01hq0012_service_order_list
        SET is_migrated = false;
        `.replace(/(_01hq0012_)/g, `_${shop_code}_`),
        {
            transaction: options?.transaction || null,
            type: QueryTypes.UPDATE
        }
    );
}


const migrateAddColumnAndRefactorShopProfile = async ({ transaction }) => {
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
            const fnCreateOldPayment = async () => {
                for (let i = 0; i < shop_code_ids.length; i++) {
                    const shop_code_id = shop_code_ids[i].shop_code_id;
                    await fnCreateTempTablePaymentFromShopSalesTransactionDoc(
                        shop_code_id,
                        {
                            transaction: transaction
                        }
                    );
                }
            };
            const fnDropTableOldPayment = async () => {
                for (let i = 0; i < shop_code_ids.length; i++) {
                    const shop_code_id = shop_code_ids[i].shop_code_id;
                    await fnDropTempTablePaymentFromShopSalesTransactionDoc(
                        shop_code_id,
                        {
                            transaction: transaction
                        }
                    );
                }
            };

            await fnDropTableOldPayment();
            await fnCreateOldPayment();
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
                    ShopStock,
                    ShopServiceOrderDoc,
                    ShopServiceOrderList,
                    ShopTemporaryDeliveryOrderDoc,
                    ShopTemporaryDeliveryOrderList,
                    ShopTaxInvoiceDoc,
                    ShopTaxInvoiceList,
                    ShopPaymentTransaction,
                    ShopSalesTransactionDoc,
                    ShopSalesOrderPlanLogs
                } = ShopModels;
                const modelShopInventoryMovementLog = ShopInventoryMovementLog(element_shop_code_id);
                const modelShopDocumentCode = ShopDocumentCode(element_shop_code_id);

                const runSyncTable = async () => {
                    await ShopServiceOrderDoc.sync({
                        force: true,
                        transaction: transaction
                    });
                    await ShopServiceOrderList.sync({
                        force: true,
                        transaction: transaction
                    });
                    await ShopTemporaryDeliveryOrderDoc.sync({
                        force: true,
                        transaction: transaction
                    });
                    await ShopTemporaryDeliveryOrderList.sync({
                        force: true,
                        transaction: transaction
                    });
                    await ShopTaxInvoiceDoc.sync({
                        force: true,
                        transaction: transaction
                    });
                    await ShopTaxInvoiceList.sync({
                        force: true,
                        transaction: transaction
                    });
                    await ShopPaymentTransaction.sync({
                        force: true,
                        transaction: transaction
                    });

                    await db.query(
                        `
                            WITH
                                CTE_1 AS (
                                    SELECT row_number() over (ORDER BY run_no ASC) AS running_number, id
                                    FROM app_shops_datas.dat_01hq0010_inventory_movement_logs
                                )
                            UPDATE app_shops_datas.dat_01hq0010_inventory_movement_logs AS MovementLog
                            SET run_no = CTE_1.running_number
                                FROM CTE_1
                            WHERE (CTE_1.id = MovementLog.id);
                        `.replace(/(dat_01hq0010_)+/ig, `dat_${element_shop_code_id}_`),
                        {
                            transaction: transaction,
                            type: QueryTypes.UPDATE
                        }
                    );
                    const countDataShopInventoryMovementLog__BeforeCreate = await modelShopInventoryMovementLog.count({ transaction: transaction });
                    const dataShopInventoryMovementLog = await modelShopInventoryMovementLog.findAll({
                        attributes: {
                            include: [[literal('(SELECT True)'), 'is_migrated']],
                            exclude: [
                                'shop_service_order_doc_id',
                                'shop_service_order_list_id',
                                'shop_temporary_delivery_order_doc_id',
                                'shop_temporary_delivery_order_list_id',
                                'is_migrated'
                            ]
                        },
                        transaction: transaction,
                        raw: true
                    });
                    if (countDataShopInventoryMovementLog__BeforeCreate !== dataShopInventoryMovementLog.length) {
                        throw Error(`Data is not match, count__Length: ${countDataShopInventoryMovementLog__BeforeCreate}, find__Length: ${dataShopInventoryMovementLog.length}`);
                    }
                    await modelShopInventoryMovementLog.sync({
                        force: true,
                        transaction: transaction
                    });
                    await modelShopInventoryMovementLog.bulkCreate(dataShopInventoryMovementLog, { transaction: transaction });
                    const countDataShopInventoryMovementLog__AfterCreate = await modelShopInventoryMovementLog.count({ transaction: transaction });
                    if (countDataShopInventoryMovementLog__AfterCreate !== countDataShopInventoryMovementLog__BeforeCreate) {
                        throw Error(`Data is not match, count__Length: ${countDataShopInventoryMovementLog__BeforeCreate}, find__Length: ${countDataShopInventoryMovementLog__AfterCreate}`);
                    }
                };

                const runTest = async () => {
                    const documentTypes = [
                        // {"th":"ใบสั่งซ่อม","en":"Order Plan"} : S01
                        '7ef3840f-3d7f-43de-89ea-dce215703c16',
                        // {"th":"ใบสั่งขาย/ใบจองสินค้า","en":"sales order"} : S02
                        '67c45df3-4f84-45a8-8efc-de22fef31978'
                    ];
                    const fidShopSalesTransactionDoc__Ids = await ShopSalesTransactionDoc.findAll({
                        attributes: ['id'],
                        where: {
                            doc_type_id: {
                                [Op.in]: documentTypes
                            },
                            // purchase_status: true
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    for (let indexShopSalesTDoc = 0; indexShopSalesTDoc < fidShopSalesTransactionDoc__Ids.length; indexShopSalesTDoc++) {
                        console.log(`indexShop: ${indexShop + 1} of ${shop_code_ids.length}, indexShopSalesTDoc: ${indexShopSalesTDoc + 1} of ${fidShopSalesTransactionDoc__Ids.length}`);
                        const element = fidShopSalesTransactionDoc__Ids[indexShopSalesTDoc];

                        const findShopServiceOrderDocExists = await ShopServiceOrderDoc.findOne({
                            where: {
                                id: element.get('id')
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (findShopServiceOrderDocExists) { continue; }

                        const findShopSalesTransactionDoc = await ShopSalesTransactionDoc.findOne({
                            where: {
                                id: element.get('id')
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });

                        if (findShopSalesTransactionDoc.get('status') === 0) {
                            continue;
                        }

                        const findDocumentType = await DocumentTypes.findOne({
                            attributes: ['internal_code_id'],
                            where: {
                                id: findShopSalesTransactionDoc.get('doc_type_id')
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });

                        const objToCreateDocument = {
                            is_migrated: true,
                            id: findShopSalesTransactionDoc.get('id'),
                            shop_id: findShopSalesTransactionDoc.get('shop_id'),
                            code_id: findShopSalesTransactionDoc.get('code_id'),
                            code_id_prefix: findDocumentType.get('internal_code_id'),
                            doc_date: findShopSalesTransactionDoc.get('doc_date'),
                            doc_type_id: findShopSalesTransactionDoc.get('doc_type_id'),
                            doc_type_code_id:
                                findShopSalesTransactionDoc.get('doc_type_id') === documentTypes[0]
                                    ? 'JOB'
                                    : findShopSalesTransactionDoc.get('doc_type_id') === documentTypes[1]
                                        ? 'SLO'
                                        : findShopSalesTransactionDoc.get('sale_type') === false
                                            ? 'JOB'
                                            : 'SLO',
                            doc_sales_type:
                                findShopSalesTransactionDoc.get('doc_type_id') === documentTypes[0]
                                    ? 1
                                    : findShopSalesTransactionDoc.get('doc_type_id') === documentTypes[1]
                                        ? 2
                                        : findShopSalesTransactionDoc.get('sale_type') === false
                                            ? 1
                                            : 2,
                            bus_customer_id: findShopSalesTransactionDoc.get('bus_customer_id'),
                            per_customer_id: findShopSalesTransactionDoc.get('per_customer_id'),
                            vehicle_customer_id: findShopSalesTransactionDoc.get('vehicles_customers_id'),
                            tax_type_id: findShopSalesTransactionDoc.get('details')?.tax_id,
                            /**
                             * ส่วนลดท้ายบิล
                             */
                            price_discount_bill: Math.abs(findShopSalesTransactionDoc.get('details')?.calculate_result?.discount || 0),
                            /**
                             * ส่วนลดก่อนชำระเงิน
                             */
                            price_discount_before_pay: 0,
                            /**
                             * รวมเป็นเงิน
                             */
                            price_sub_total: findShopSalesTransactionDoc.get('details')?.calculate_result?.total || 0,
                            /**
                             * ส่วนลดรวม
                             */
                            price_discount_total: Math.abs(findShopSalesTransactionDoc.get('details')?.calculate_result?.discount || 0),
                            /**
                             * ราคาหลังหักส่วนลด
                             */
                            price_amount_total: Math.abs((findShopSalesTransactionDoc.get('details')?.calculate_result?.total || 0) - (findShopSalesTransactionDoc.get('details')?.calculate_result?.discount || 0)),
                            /**
                             * ราคาก่อนรวมภาษี
                             */
                            price_before_vat: Math.abs((findShopSalesTransactionDoc.get('details')?.calculate_result?.total || 0) - (findShopSalesTransactionDoc.get('details')?.calculate_result?.discount || 0)),
                            /**
                             * ภาษีมูลค่าเพิ่ม
                             */
                            price_vat: findShopSalesTransactionDoc.get('details')?.calculate_result?.vat || 0,
                            /**
                             * จำนวนเงินรวมทั้งสิ้น
                             */
                            price_grand_total: findShopSalesTransactionDoc.get('details')?.calculate_result?.net_total || 0,
                            payment_paid_status:
                                findShopSalesTransactionDoc.get('status') <= 0
                                    ? 0
                                    : findShopSalesTransactionDoc.get('purchase_status') === true
                                        ? 3
                                        : 1,
                            details: {
                                previous_mileage: findShopSalesTransactionDoc.get('details')?.mileage_old || "0",
                                current_mileage: findShopSalesTransactionDoc.get('details')?.mileage || "0",
                                average_mileage: findShopSalesTransactionDoc.get('details')?.mileage_average || "0",
                                customer_phone: findShopSalesTransactionDoc.get('details')?.customer_phone || "",
                                ref_doc: "",
                                remark: findShopSalesTransactionDoc.get('details')?.remark || null,
                                remark_inside: findShopSalesTransactionDoc.get('details')?.remark_inside || null,
                                repair_man: findShopSalesTransactionDoc.get('details')?.repair_man || [],
                                user_id: findShopSalesTransactionDoc.get('details')?.user_id || "",
                                migrate_data: {
                                    ShopSalesTransactionDoc: findShopSalesTransactionDoc.toJSON()
                                }
                            },
                            status:
                                findShopSalesTransactionDoc.get('status') === 0
                                ? 0
                                : 1,
                            created_by: findShopSalesTransactionDoc.get('created_by'),
                            created_date: findShopSalesTransactionDoc.get('created_date'),
                            updated_by: findShopSalesTransactionDoc.get('updated_by'),
                            updated_date: findShopSalesTransactionDoc.get('updated_date'),
                        };

                        const createdShopServiceOrderDoc = await ShopServiceOrderDoc.create(
                            objToCreateDocument,
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );

                        const details = findShopSalesTransactionDoc.get('details') || {};
                        const list_service_product = details?.list_service_product || [];
                        if (Array.isArray(list_service_product)) {
                            for (let indexList = 0; indexList < list_service_product.length; indexList++) {
                                console.log(`indexShop: ${indexShop + 1} of ${shop_code_ids.length}, indexShopSalesTDoc: ${indexShopSalesTDoc + 1} of ${fidShopSalesTransactionDoc__Ids.length}, indexList: ${indexList + 1} of ${list_service_product.length}`);
                                const element = list_service_product[indexList];

                                if (!element?.id) {
                                    continue;
                                }
                                if (element?.amount <= 0) {
                                    continue;
                                }
                                const findShopServiceOrderListExists = await ShopServiceOrderList.findOne({
                                    where: {
                                        id: element.id,
                                    },
                                    transaction: transaction
                                });
                                if (findShopServiceOrderListExists) { continue; }
                                if (element?.shop_stock_id) {
                                    const findShopStockExists = await ShopStock.findOne({
                                        where: {
                                            id: element.shop_stock_id,
                                        },
                                        transaction: transaction
                                    });
                                    if (!findShopStockExists) { continue; }
                                }

                                const findShopSalesOrderPlanLog = await ShopSalesOrderPlanLogs.findOne({
                                    where: {
                                        id: element.id,
                                        status: 1
                                    },
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                });
                                if (!findShopSalesOrderPlanLog) {
                                    throw new Error(`ไม่พบรายการใบสั่งซ่อม (เก่า)`);
                                }

                                const objToCreateDocument = {
                                    is_migrated: true,
                                    id: findShopSalesOrderPlanLog.get('id'),
                                    shop_id: findShopSalesTransactionDoc.get('shop_id'),
                                    shop_service_order_doc_id: createdShopServiceOrderDoc.get('id'),
                                    seq_number: indexList + 1,
                                    shop_product_id: element?.product_id,
                                    shop_stock_id: element?.shop_stock_id,
                                    shop_warehouse_id: element?.warehouse_id,
                                    shop_warehouse_shelf_item_id: element?.shelf_code,
                                    purchase_unit_id: element?.purchase_unit_id === 'null'? null : element?.purchase_unit_id || null,
                                    dot_mfd:
                                        !element?.dot_mfd
                                        ? null
                                        : element?.dot_mfd === '-'
                                            ? null
                                            : element?.dot_mfd === 'null'
                                                ? null
                                                : element?.dot_mfd,
                                    amount: element?.amount,
                                    cost_unit: element?.product_cost === 'null' ? 0 : element?.product_cost || 0,
                                    price_unit: element?.price || 0,
                                    price_discount: element?.discount_old || 0,
                                    price_discount_percent: element?.discount_percent_old || 0,
                                    price_grand_total: element?.each_total_price,
                                    details: {
                                        change_name_status: element?.changed_product_name ? true : false,
                                        changed_name: element?.changed_product_name || null,
                                        dot_mfd_list: element?.dot_mfd_list,
                                        remark: element?.each_remark_list_service_product || null,
                                        migrate_data: {
                                            ShopSalesOrderPlanLog: findShopSalesOrderPlanLog.toJSON()
                                        }
                                    },
                                    status: findShopSalesOrderPlanLog.get('status'),
                                    created_by: findShopSalesOrderPlanLog.get('created_by'),
                                    created_date: findShopSalesOrderPlanLog.get('created_date'),
                                    updated_by: findShopSalesOrderPlanLog.get('updated_by'),
                                    updated_date: findShopSalesOrderPlanLog.get('updated_date')
                                };

                                const createdShopServiceOrderList = await ShopServiceOrderList.create(
                                    objToCreateDocument,
                                    {
                                        transaction: transaction,
                                        ShopModels: ShopModels
                                    }
                                );
                            }
                        }

                        await ShopServiceOrderList.mutationFields__ProportionDiscount(
                            findShopSalesTransactionDoc.get('id'),
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );

                        // Add PaymentTransaction if exists

                        if ((findShopSalesTransactionDoc.get('status') === 0
                            || findShopSalesTransactionDoc.get('status') === 3)
                            && findShopSalesTransactionDoc.get('purchase_status') === true) {
                            const ShopSalesTransactionDoc__Payment = await fnGetPaymentFromShopSalesTransactionDocFromTempTable(
                                element_shop_code_id,
                                findShopSalesTransactionDoc.get('id'),
                                {
                                    transaction: transaction
                                }
                            );
                            if (ShopSalesTransactionDoc__Payment) {
                                const objPaymentTransactionToCreate = {
                                    shop_id: createdShopServiceOrderDoc.get('shop_id'),
                                    doc_date: createdShopServiceOrderDoc.get('doc_date'),
                                    shop_service_order_doc_id: createdShopServiceOrderDoc.get('id'),
                                    bank_name_list_id: ShopSalesTransactionDoc__Payment.payment_bank_id || null,
                                    payment_method: ShopSalesTransactionDoc__Payment.payment_type || 0,
                                    payment_status: 1,
                                    payment_price_grand_total: createdShopServiceOrderDoc.get('price_grand_total'),
                                    payment_price_paid: createdShopServiceOrderDoc.get('price_grand_total'),
                                    payment_paid_date: ShopSalesTransactionDoc__Payment.payment_payment_date,
                                    payment_payee_by: createdShopServiceOrderDoc.get('updated_by') || createdShopServiceOrderDoc.get('created_by'),
                                    is_partial_payment: false,
                                    canceled_payment_by: findShopSalesTransactionDoc.get('status') === 0
                                        ? createdShopServiceOrderDoc.get('updated_by')
                                        : null,
                                    canceled_payment_date: findShopSalesTransactionDoc.get('status') === 0
                                        ? createdShopServiceOrderDoc.get('updated_date')
                                        : null,
                                    details: !ShopSalesTransactionDoc__Payment.payment_details
                                        ? {
                                            actual_paid: ShopSalesTransactionDoc__Payment?.payment_cash,
                                            change: ShopSalesTransactionDoc__Payment?.payment_change,
                                            payment_method_id: ShopSalesTransactionDoc__Payment?.payment_payment_method_id,
                                            payment_method_text: ShopSalesTransactionDoc__Payment?.payment_payment_method_name,
                                            card_type_id: ShopSalesTransactionDoc__Payment?.payment_credit_card_type_id,
                                            card_type_text: ShopSalesTransactionDoc__Payment?.payment_payment_method_name,
                                            card_4_end_code: ShopSalesTransactionDoc__Payment?.payment_credit_card_last_4_end_digit,
                                            transferor_name: ShopSalesTransactionDoc__Payment?.payment_transfer_transferor_name,
                                            transfer_time: ShopSalesTransactionDoc__Payment?.payment_transfer_transfered_time,
                                            remark: ShopSalesTransactionDoc__Payment?.payment_remark,
                                            migrate_data: {
                                                ShopPayment: null,
                                                ShopPayment_refactoredData: ShopSalesTransactionDoc__Payment
                                            }
                                        }
                                        : {
                                            actual_paid: ShopSalesTransactionDoc__Payment?.payment_cash,
                                            change: ShopSalesTransactionDoc__Payment?.payment_change,
                                            payment_method_id: ShopSalesTransactionDoc__Payment?.payment_payment_method_id,
                                            payment_method_text: ShopSalesTransactionDoc__Payment?.payment_payment_method_name,
                                            card_type_id: ShopSalesTransactionDoc__Payment?.payment_credit_card_type_id,
                                            card_type_text: ShopSalesTransactionDoc__Payment?.payment_payment_method_name,
                                            card_4_end_code: ShopSalesTransactionDoc__Payment?.payment_credit_card_last_4_end_digit,
                                            transferor_name: ShopSalesTransactionDoc__Payment?.payment_transfer_transferor_name,
                                            transfer_time: ShopSalesTransactionDoc__Payment?.payment_transfer_transfered_time,
                                            remark: ShopSalesTransactionDoc__Payment?.payment_remark,
                                            migrate_data: {
                                                ShopPayment: ShopSalesTransactionDoc__Payment.payment_details,
                                                ShopPayment_refactoredData: ShopSalesTransactionDoc__Payment
                                            }
                                        },
                                    created_by: createdShopServiceOrderDoc.get('updated_by') || createdShopServiceOrderDoc.get('created_by'),
                                    created_date: ShopSalesTransactionDoc__Payment.payment_payment_date,
                                    updated_by: findShopSalesTransactionDoc.get('status') === 0
                                        ? createdShopServiceOrderDoc.get('updated_by')
                                        : null,
                                    updated_date: findShopSalesTransactionDoc.get('status') === 0
                                        ? ShopSalesTransactionDoc__Payment.payment_payment_date
                                        : null,
                                };
                                const createdPaymentTransaction = await ShopPaymentTransaction.create(
                                    objPaymentTransactionToCreate,
                                    {
                                        transaction: transaction,
                                        ShopModels: ShopModels
                                    }
                                );
                            }
                        }
                    }

                    const findDocumentCodesData = await fnGetLatestDocumentCode(
                        element_shop_code_id,
                        {
                            transaction: transaction
                        }
                    );
                    for (let i = 0; i < findDocumentCodesData.length; i++) {
                        const ele = findDocumentCodesData[i];
                        const findShopDocumentCodeExists = await modelShopDocumentCode.findOne({
                            where: {
                                doc_type_code: ele.doc_type_code,
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (findShopDocumentCodeExists) { continue; }
                        await modelShopDocumentCode.create(
                            {
                                shop_id: element_shop_id,
                                doc_type_id: ele.doc_type_id,
                                doc_type_code: ele.doc_type_code,
                                run_no: ele.run_no,
                                code_id: ele.code_id,
                                created_by: ele.created_by,
                                created_date: ele.created_date
                            },
                            {
                                transaction: transaction,
                                ShopModels: ShopModels,
                                hooks: false
                            }
                        );
                    }

                    await fnUpdateShopServiceOrder__IsMigratedToFalse(element_shop_code_id, { transaction: transaction });
                };



                await runSyncTable();
                await runTest();
                // throw new Error('Passed!');
            }
            await fnDropTableOldPayment();


            // console.timeEnd('Migration-Run');
            // throw new Error('Passed!');
        }
    );

    console.timeEnd('Migration-Run');
    return transactionResults;
};

migrateAddColumnAndRefactorShopProfile({ transaction: null });

module.exports = migrateAddColumnAndRefactorShopProfile;