/**
 * A function do dynamics table of model ShopPartnerDebtBillingNoteList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_partner_debt_bn_list"
 */
const ShopPartnerDebtBillingNoteList = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const { isUUID } = require("../../utils/generate");
    const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Op } = require("sequelize");

    const db = require("../../db");

    const __model = require("../model");
    const {
        User,
        ShopsProfiles: ShopProfile,
        TaxTypes: TaxType,
    } = __model;
    const ShopBusinessPartner = __model.ShopBusinessPartners(table_name);
    const ShopInventoryTransaction = __model.ShopInventoryTransaction(table_name);
    const ShopPartnerDebtBillingNoteDoc = __model.ShopPartnerDebtBillingNoteDoc(table_name);
    const ShopPartnerDebtDebitNoteDoc = __model.ShopPartnerDebtDebitNoteDoc(table_name);
    const ShopPartnerDebtCreditNoteDoc = __model.ShopPartnerDebtCreditNoteDoc(table_name);

    class ShopPartnerDebtBillingNoteList extends Model {
        static async createOrUpdateShopPartnerDebtBillingNote_Lists(shopId = null, userId = null, shop_partner_debt_bn_doc_id = null, shopPartnerDebtBillingNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!isUUID(shop_partner_debt_bn_doc_id)) { throw new Error(`Require parameter shop_partner_debt_bn_doc_id must be UUID`); }
            if (!Array.isArray(shopPartnerDebtBillingNoteLists)) { throw new Error(`Require parameter shopPartnerDebtBillingNoteLists must be array`); }

            /**
             * @type {Date}
             */
            const currentDateTime = options?.currentDateTime || new Date();

            /**
             * @type {import("sequelize").Transaction}
             */
            const transaction = options?.transaction;

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopInventoryImportDoc,
                ShopPaymentTransaction,
                ShopPartnerDebtBillingNoteDoc,
                ShopPartnerDebtBillingNoteList,
                ShopPartnerDebtDebitNoteDoc,
                ShopPartnerDebtCreditNoteDoc
            } = ShopModels;

            /**
             * @type {{
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: Object<string, *> | null;
             *  currentData: ShopPartnerDebtBillingNoteList;
             * }[]};
             */
            const createdAndUpdatedDocuments = [];

            // ถ้าเป็นการยกเลิกเอกสาร แล้วไม่ได้ส่งการแก้ไขรายการนั้น จะต้องทำให้รายการไม่ถูกแก้ไข
            if (options?.isCancelStatus_Doc === true) {
                const findShopPartnerDebtBillingNoteList = await ShopPartnerDebtBillingNoteList.findAll({
                    where: {
                        shop_partner_debt_bn_doc_id: shop_partner_debt_bn_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findShopPartnerDebtBillingNoteList.length; index++) {
                    const findShopPartnerDebtList = findShopPartnerDebtBillingNoteList[index];
                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: false,
                        previousData: findShopPartnerDebtList.toJSON(),
                        currentData: findShopPartnerDebtList
                    });
                }
            }

            // Cancel unused ShopPartnerDebtBillingNoteList
            /**
             * @type {string[]}
             */
            const filterUsedIds = shopPartnerDebtBillingNoteLists.reduce((prev, curr) => {
                if (isUUID(curr?.id)) {
                    prev.push(curr.id);
                }
                return prev;
            }, []);
            const whereQuery = {};
            if (filterUsedIds.length > 0) {
                whereQuery['id'] = {
                    [Op.notIn]: filterUsedIds
                };
                whereQuery['shop_partner_debt_bn_doc_id'] = shop_partner_debt_bn_doc_id;
            }
            else {
                whereQuery['shop_partner_debt_bn_doc_id'] = shop_partner_debt_bn_doc_id;
            }
            if (Object.keys(whereQuery).length > 0) {
                whereQuery['status'] = 1;

                const findUnusedShopPartnerDebtBillingNoteList = await ShopPartnerDebtBillingNoteList.findAll({
                    where: whereQuery,
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findUnusedShopPartnerDebtBillingNoteList.length; index++) {
                    const element = findUnusedShopPartnerDebtBillingNoteList[index];

                    const element__previousData = element.toJSON();

                    element.set({
                        status: 0,
                        updated_by: userId,
                        updated_date: currentDateTime
                    });

                    await element.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: true,
                        previousData: element__previousData,
                        currentData: element
                    });
                }
            }

            // Edit or Create ShopPartnerDebtBillingNoteList
            for (let index = 0; index < shopPartnerDebtBillingNoteLists.length; index++) {
                const shopPartnerDebtBillingNoteList = shopPartnerDebtBillingNoteLists[index];

                if (!isUUID(shopPartnerDebtBillingNoteList.id)) { // สร้างรายการ
                    if (!isUUID(shopPartnerDebtBillingNoteList?.shop_inventory_transaction_id)) {
                        if (isUUID(shopPartnerDebtBillingNoteList?.shop_partner_debt_dn_doc_id)) {
                            const findShopPartnerDebtDebitNoteDoc = await ShopPartnerDebtDebitNoteDoc.findOne({
                                where: {
                                    id: shopPartnerDebtBillingNoteList?.shop_partner_debt_dn_doc_id
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (!findShopPartnerDebtDebitNoteDoc) {
                                throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้า ในการสร้างข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                            }

                            const objToCreate = {
                                shop_id: shopId,
                                seq_number: shopPartnerDebtBillingNoteList?.seq_number,
                                shop_partner_debt_bn_doc_id: shop_partner_debt_bn_doc_id,
                                shop_partner_debt_dn_doc_id: findShopPartnerDebtDebitNoteDoc.get('id'),
                                shop_partner_debt_cn_doc_id: null,
                                doc_date: shopPartnerDebtBillingNoteList?.doc_date || currentDateTime,
                                bus_partner_id: findShopPartnerDebtDebitNoteDoc.get('bus_partner_id'),
                                tax_type_id: findShopPartnerDebtDebitNoteDoc.get('tax_type_id'),
                                vat_type: findShopPartnerDebtDebitNoteDoc.get('vat_type'),
                                vat_rate: findShopPartnerDebtDebitNoteDoc.get('vat_rate') || 0,
                                price_discount_bill: findShopPartnerDebtDebitNoteDoc.get('price_discount_bill') || 0,
                                price_discount_before_pay: findShopPartnerDebtDebitNoteDoc.get('price_discount_before_pay') || 0,
                                price_sub_total: findShopPartnerDebtDebitNoteDoc.get('price_sub_total') || 0,
                                price_discount_total: findShopPartnerDebtDebitNoteDoc.get('price_discount_total') || 0,
                                price_amount_total: findShopPartnerDebtDebitNoteDoc.get('price_amount_total') || 0,
                                price_before_vat: findShopPartnerDebtDebitNoteDoc.get('price_before_vat') || 0,
                                price_vat: findShopPartnerDebtDebitNoteDoc.get('price_vat') || 0,
                                price_grand_total: findShopPartnerDebtDebitNoteDoc.get('price_grand_total') || 0,
                                debt_due_date: findShopPartnerDebtDebitNoteDoc.get('debt_due_date') || null,
                                debt_price_amount: Object.hasOwn(shopPartnerDebtBillingNoteList, 'debt_price_amount')
                                    ? shopPartnerDebtBillingNoteList.debt_price_amount !== null
                                        ? shopPartnerDebtBillingNoteList.debt_price_amount
                                        : findShopPartnerDebtDebitNoteDoc.get('price_grand_total')
                                    : findShopPartnerDebtDebitNoteDoc.get('price_grand_total'),
                                debt_price_paid_total: Object.hasOwn(shopPartnerDebtBillingNoteList, 'debt_price_paid_total')
                                    ? shopPartnerDebtBillingNoteList.debt_price_paid_total !== null
                                        ? shopPartnerDebtBillingNoteList.debt_price_paid_total
                                        : 0
                                    : 0,
                                details: shopPartnerDebtBillingNoteList?.details || {},
                                status: 1,
                                created_by: userId,
                                created_date: currentDateTime,
                                updated_by: null,
                                updated_date: null
                            };

                            if (objToCreate.hasOwnProperty('id')) {
                                delete objToCreate.id;
                            }

                            const createdShopPartnerDebtList = await ShopPartnerDebtBillingNoteList.create(
                                objToCreate,
                                {
                                    validate: true,
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                }
                            );

                            createdAndUpdatedDocuments.push({
                                isCreated: true,
                                isUpdated: false,
                                previousData: null,
                                currentData: createdShopPartnerDebtList
                            });

                            continue;
                        }

                        if (isUUID(shopPartnerDebtBillingNoteList?.shop_partner_debt_cn_doc_id)) {
                            const findShopPartnerDebtCreditNoteDoc = await ShopPartnerDebtCreditNoteDoc.findOne({
                                where: {
                                    id: shopPartnerDebtBillingNoteList?.shop_partner_debt_cn_doc_id
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (!findShopPartnerDebtCreditNoteDoc) {
                                throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้า ในการสร้างข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                            }

                            const objToCreate = {
                                shop_id: shopId,
                                seq_number: shopPartnerDebtBillingNoteList?.seq_number,
                                shop_partner_debt_bn_doc_id: shop_partner_debt_bn_doc_id,
                                shop_partner_debt_dn_doc_id: null,
                                shop_partner_debt_cn_doc_id: findShopPartnerDebtCreditNoteDoc.get('id'),
                                doc_date: shopPartnerDebtBillingNoteList?.doc_date || currentDateTime,
                                bus_partner_id: findShopPartnerDebtCreditNoteDoc.get('bus_partner_id') || null,
                                tax_type_id: findShopPartnerDebtCreditNoteDoc.get('tax_type_id') || null,
                                vat_type: findShopPartnerDebtCreditNoteDoc.get('vat_type') || null,
                                vat_rate: findShopPartnerDebtCreditNoteDoc.get('vat_rate') || 0,
                                price_discount_bill: findShopPartnerDebtCreditNoteDoc.get('price_discount_bill') || 0,
                                price_discount_before_pay: findShopPartnerDebtCreditNoteDoc.get('price_discount_before_pay') || 0,
                                price_sub_total: findShopPartnerDebtCreditNoteDoc.get('price_sub_total') || 0,
                                price_discount_total: findShopPartnerDebtCreditNoteDoc.get('price_discount_total') || 0,
                                price_amount_total: findShopPartnerDebtCreditNoteDoc.get('price_amount_total') || 0,
                                price_before_vat: findShopPartnerDebtCreditNoteDoc.get('price_before_vat') || 0,
                                price_vat: findShopPartnerDebtCreditNoteDoc.get('price_vat') || 0,
                                price_grand_total: findShopPartnerDebtCreditNoteDoc.get('price_grand_total') || 0,
                                debt_due_date: findShopPartnerDebtCreditNoteDoc.get('debt_due_date') || null,
                                debt_price_amount: Object.hasOwn(shopPartnerDebtBillingNoteList, 'debt_price_amount')
                                    ? shopPartnerDebtBillingNoteList.debt_price_amount !== null
                                        ? shopPartnerDebtBillingNoteList.debt_price_amount
                                        : findShopPartnerDebtCreditNoteDoc.get('price_grand_total')
                                    : findShopPartnerDebtCreditNoteDoc.get('price_grand_total'),
                                debt_price_paid_total: Object.hasOwn(shopPartnerDebtBillingNoteList, 'debt_price_paid_total')
                                    ? shopPartnerDebtBillingNoteList.debt_price_paid_total !== null
                                        ? shopPartnerDebtBillingNoteList.debt_price_paid_total
                                        : 0
                                    : 0,
                                details: shopPartnerDebtBillingNoteList?.details || {},
                                status: 1,
                                created_by: userId,
                                created_date: currentDateTime,
                                updated_by: null,
                                updated_date: null
                            };

                            if (objToCreate.hasOwnProperty('id')) {
                                delete objToCreate.id;
                            }

                            const createdShopPartnerDebtList = await ShopPartnerDebtBillingNoteList.create(
                                objToCreate,
                                {
                                    validate: true,
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                }
                            );

                            createdAndUpdatedDocuments.push({
                                isCreated: true,
                                isUpdated: false,
                                previousData: null,
                                currentData: createdShopPartnerDebtList
                            });

                            continue;
                        }
                    }


                    if (!isUUID(shopPartnerDebtBillingNoteList?.shop_inventory_transaction_id)) {
                        throw new Error(`ต้องการข้อมูลรหัสหลักเอกสารใบนำเข้า ในการสร้างข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    // ค้นหาเอกสารใบนำเข้า ที่มีสถาณะเป็นเจ้าหนี้การค้า
                    const findShopInventoryTransaction = await ShopInventoryImportDoc.findOne({
                        attributes: {
                            exclude: ['created_by', 'created_at', 'updated_by', 'updated_at']
                        },
                        where: {
                            id: shopPartnerDebtBillingNoteList.shop_inventory_transaction_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopInventoryTransaction) {
                        throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า ในการสร้างข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopInventoryTransaction.get('status') !== 1) {
                        throw new Error(`ไม่อนุญาติสร้างรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า ที่เอกสารใบนำเข้าถูกยกเลิกไปแล้ว: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบนำเข้า ${findShopInventoryTransaction.get('code_id')}`);
                    }
                    else if (findShopInventoryTransaction.get('payment_paid_status') !== 6) {
                        throw new Error(`ข้อมูลเอกสารใบนำเข้า จะต้องมีสถาณะการชำระเงินเป็นเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบนำเข้า ${findShopInventoryTransaction.get('code_id')}`);
                    }
                    else {
                        // ค้นหารายการชำระเงินจากใบนำเข้า จะต้องมีการชำระเงินเป็นบันทึกหนี้มาก่อน
                        const findShopInventoryTransaction_isPaymentMethod_isPartnerDebt = await ShopPaymentTransaction.findOne({
                            attributes: ['id', 'code_id'],
                            where: {
                                shop_inventory_transaction_id: findShopInventoryTransaction.get('id'),
                                payment_method: 6,
                                canceled_payment_by: null,
                                canceled_payment_date: null
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopInventoryTransaction_isPaymentMethod_isPartnerDebt) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า ที่มีช่องทางการชำระเงินเป็นเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบนำเข้า ${findShopInventoryTransaction.get('code_id')}`);
                        }

                        /**
                         * หา debt_price_paid_total จากการชำระเงินของเอกวารใบนำเข้า
                         * @returns {Promise<number>}
                         */
                        const fnGet__debt_price_paid_total__fromShopPaymentTransaction = async () => {
                            const findShopPaymentTransaction = await ShopPaymentTransaction.findAll({
                                attributes: [
                                    'id',
                                    'code_id',
                                    'shop_inventory_transaction_id',
                                    'payment_price_grand_total',
                                    'payment_price_paid'
                                ],
                                where: {
                                    shop_inventory_transaction_id: findShopInventoryTransaction.get('id'),
                                    payment_status: 1,
                                    payment_method: {
                                        [Op.ne]: 6
                                    },
                                    canceled_payment_by: null,
                                    canceled_payment_date: null,
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            /**
                             * จำนวนเงินรวมทั้งสิ้น ของเอกสารใบนำเข้า
                             * @type {number}
                             */
                            const shopServiceDoc__price_grand_total = Number(findShopInventoryTransaction.get('price_grand_total'));
                            /**
                             * จำนวนเงินรวมทั้งสิ้น ที่จ่ายเงินไปกินเอกสารใบนำเข้า ไปแล้ว
                             * @type {number}
                             */
                            const shopPaymentTransaction__payment_price_paid = findShopPaymentTransaction.reduce((sum, current) => sum + Number(current.get('payment_price_paid')), 0);

                            return shopServiceDoc__price_grand_total - shopPaymentTransaction__payment_price_paid;
                        };

                        const objToCreate = {
                            shop_id: shopId,
                            seq_number: shopPartnerDebtBillingNoteList?.seq_number,
                            shop_partner_debt_bn_doc_id: shop_partner_debt_bn_doc_id,
                            shop_inventory_transaction_id: findShopInventoryTransaction.get('id'),
                            doc_date: shopPartnerDebtBillingNoteList?.doc_date || currentDateTime,
                            bus_partner_id: findShopInventoryTransaction.get('bus_partner_id'),
                            tax_type_id: findShopInventoryTransaction.details.tax_type,
                            price_discount_bill: findShopInventoryTransaction.details.tailgate_discount,
                            price_discount_before_pay: '0.00',
                            price_sub_total: findShopInventoryTransaction.details.total_price_all,
                            price_discount_total: findShopInventoryTransaction.details.total_discount,
                            price_amount_total: findShopInventoryTransaction.details.total_price_all_after_discount,
                            price_before_vat: findShopInventoryTransaction.details.price_before_vat,
                            price_vat: findShopInventoryTransaction.details.vat,
                            price_grand_total: findShopInventoryTransaction.get('price_grand_total'),
                            debt_due_date: shopPartnerDebtBillingNoteList?.debt_due_date || null,
                            debt_price_amount: Object.hasOwn(shopPartnerDebtBillingNoteList, 'debt_price_amount')
                                ? shopPartnerDebtBillingNoteList.debt_price_amount !== null
                                    ? shopPartnerDebtBillingNoteList.debt_price_amount
                                    : findShopInventoryTransaction.get('debt_price_amount')
                                : findShopInventoryTransaction.get('debt_price_amount'),
                            debt_price_paid_total: Object.hasOwn(shopPartnerDebtBillingNoteList, 'debt_price_paid_total')
                                ? shopPartnerDebtBillingNoteList.debt_price_paid_total !== null
                                    ? shopPartnerDebtBillingNoteList.debt_price_paid_total
                                    : await fnGet__debt_price_paid_total__fromShopPaymentTransaction()
                                : await fnGet__debt_price_paid_total__fromShopPaymentTransaction(),
                            details: shopPartnerDebtBillingNoteList?.details || {},
                            status: 1,
                            created_by: userId,
                            created_date: currentDateTime,
                            updated_by: null,
                            updated_date: null
                        };

                        if (objToCreate.hasOwnProperty('id')) {
                            delete objToCreate.id;
                        }

                        objToCreate.debt_price_amount_left = Object.hasOwn(shopPartnerDebtBillingNoteList, 'debt_price_amount_left')
                            ? shopPartnerDebtBillingNoteList.debt_price_amount_left !== null
                                ? shopPartnerDebtBillingNoteList.debt_price_amount_left
                                : findShopInventoryTransaction.get('debt_price_amount_left')
                            : findShopInventoryTransaction.get('debt_price_amount_left');

                        const createdShopPartnerDebtList = await ShopPartnerDebtBillingNoteList.create(
                            objToCreate,
                            {
                                validate: true,
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );

                        createdAndUpdatedDocuments.push({
                            isCreated: true,
                            isUpdated: false,
                            previousData: null,
                            currentData: createdShopPartnerDebtList
                        });
                    }
                }
                else { // แก้ไขรายการ
                    if (!isUUID(shopPartnerDebtBillingNoteList?.id)) {
                        throw new Error(`ต้องการข้อมูลรหัสหลักรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    /**
                     * รายการเจ้าหนี้การค้า ที่ต้องการแก้ไข
                     */
                    const findShopPartnerDebtBillingNoteList = await ShopPartnerDebtBillingNoteList.findOne({
                        where: {
                            id: shopPartnerDebtBillingNoteList?.id,
                            shop_partner_debt_bn_doc_id: shop_partner_debt_bn_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopPartnerDebtBillingNoteList) {
                        throw new Error(`ไม่พบข้อมูลรหัสหลักรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopPartnerDebtBillingNoteList.previous('status') !== 1) {
                        throw new Error(`ไม่สามารถแก้ไขข้อมูลรหัสหลักรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า เนื่องจากรายการนี้อยกเลิกไปแล้ว: รายการที่ ${shopPartnerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else {
                        const objEditData = {};

                        if (shopPartnerDebtBillingNoteList.hasOwnProperty('seq_number')) {
                            objEditData.seq_number = shopPartnerDebtBillingNoteList.seq_number;
                        }
                        if (shopPartnerDebtBillingNoteList.hasOwnProperty('shop_inventory_transaction_id')) {
                            objEditData.shop_inventory_transaction_id = shopPartnerDebtBillingNoteList.shop_inventory_transaction_id;
                        }
                        if (shopPartnerDebtBillingNoteList.hasOwnProperty('debt_price_paid_total')) {
                            objEditData.debt_price_paid_total = shopPartnerDebtBillingNoteList.debt_price_paid_total;
                        }
                        if (shopPartnerDebtBillingNoteList.hasOwnProperty('details')) {
                            objEditData.details = shopPartnerDebtBillingNoteList.details;
                        }
                        if (shopPartnerDebtBillingNoteList.hasOwnProperty('status')) {
                            objEditData.status = shopPartnerDebtBillingNoteList.status;
                        }

                        if (Object.keys(objEditData).length === 0) {
                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: false,
                                previousData: findShopPartnerDebtBillingNoteList.toJSON(),
                                currentData: findShopPartnerDebtBillingNoteList
                            });
                        }
                        else {
                            objEditData.updated_by = userId;
                            objEditData.updated_date = currentDateTime;

                            const findShopPartnerDebtBillingNoteList__previousData = findShopPartnerDebtBillingNoteList.toJSON();

                            findShopPartnerDebtBillingNoteList.set(objEditData);
                            await findShopPartnerDebtBillingNoteList.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: true,
                                previousData: findShopPartnerDebtBillingNoteList__previousData,
                                currentData: findShopPartnerDebtBillingNoteList
                            });
                        }
                    }
                }
            }

            return createdAndUpdatedDocuments;
        }
    }

    ShopPartnerDebtBillingNoteList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า`,
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
                allowNull: false,
                primaryKey: true
            },
            shop_id: {
                comment: `รหัสตารางข้อมูลร้านค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopProfile,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            seq_number: {
                comment: `ลำดับรายการ`,
                type: DataTypes.INTEGER,
                allowNull: false
            },
            shop_partner_debt_bn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopPartnerDebtBillingNoteDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            shop_partner_debt_dn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopPartnerDebtDebitNoteDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_partner_debt_cn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopPartnerDebtCreditNoteDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_inventory_transaction_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบนำเข้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopInventoryTransaction,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            doc_date: {
                comment: `วันที่เอกสาร`,
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            bus_partner_id: {
                comment: `รหัสตารางข้อมูลผุ้จำหน่าย`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopBusinessPartner,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            tax_type_id: {
                comment: `รหัสตารางข้อมูลประเภทภาษีมูลค่าเพิ่ม`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: TaxType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            vat_type: {
                comment: 'ประเภทภาษีมูลค่าเพิ่ม (Vat types)'
                    + '\n1 = รวมภาษีมูลค่าเพิ่ม'
                    + '\n2 = ไม่รวมภาษีมูลค่าเพิ่ม'
                    + '\n3 = ไม่คิดภาษีมูลค่าเพิ่ม',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2, 3]]
                }
            },
            vat_rate: {
                comment: `อัตราภาษีมูลค่าเพิ่ม`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            price_discount_bill: {
                comment: `ส่วนลดท้ายบิล`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_discount_before_pay: {
                comment: `ส่วนลดก่อนชำระเงิน`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_sub_total: {
                comment: `รวมเป็นเงิน`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_discount_total: {
                comment: `ส่วนลดรวม`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_amount_total: {
                comment: `ราคาหลังหักส่วนลด`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_before_vat: {
                comment: `ราคาก่อนรวมภาษี`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_vat: {
                comment: `ภาษีมูลค่าเพิ่ม`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_grand_total: {
                comment: `จำนวนเงินรวมทั้งสิ้น`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            debt_due_date: {
                comment: `วันครบกำหนดชำระหนี้`,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            debt_price_amount: {
                comment: `จำนวนเงินเจ้าหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_amount_left: {
                comment: `จำนวนเงินเจ้าหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    meta_data: {}
                }
            },
            status: {
                comment: `สถานะรายการ 0 = ลบรายการ, 1 = ใช้งานรายการ`,
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1]]
                }
            },
            created_by: {
                comment: `สร้างข้อมูลโดย`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: User,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            created_date: {
                comment: `สร้างข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal('now()')
            },
            updated_by: {
                comment: `ปรับปรุงข้อมูลโดย`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: User,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            updated_date: {
                comment: `ปรับปรุงข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            }
        },
        {
            sequelize: db,
            modelName: 'ShopPartnerDebtBillingNoteList',
            tableName: `dat_${table_name}_partner_debt_bn_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า',
            indexes: [
                {
                    name: `idx_${table_name}_partner_cbn_list_shop_id`,
                    fields: ['shop_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_shop_partner_debt_cbn_doc_id`,
                    fields: ['shop_partner_debt_bn_doc_id']
                },
                {
                    name: `idx_${table_name}_partner_cbn_list_ccn_doc_id`,
                    fields: ['shop_partner_debt_cn_doc_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_shop_inventory_transaction_id`,
                    fields: ['shop_inventory_transaction_id']
                },
                {
                    name: `idx_${table_name}_partner_cbn_list_bus_cus_id`,
                    fields: ['bus_partner_id']
                },
                {
                    name: `idx_${table_name}_partner_cbn_list_tax_type_id`,
                    fields: ['tax_type_id']
                }
            ]
        }
    );

    ShopPartnerDebtBillingNoteList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopPartnerDebtBillingNoteList.belongsTo(ShopPartnerDebtBillingNoteDoc, { foreignKey: 'shop_partner_debt_bn_doc_id', as: 'ShopPartnerDebtBillingNoteDoc' });
    ShopPartnerDebtBillingNoteList.belongsTo(ShopPartnerDebtDebitNoteDoc, { foreignKey: 'shop_partner_debt_dn_doc_id', as: 'ShopPartnerDebtDebitNoteDoc' });
    ShopPartnerDebtBillingNoteList.belongsTo(ShopPartnerDebtCreditNoteDoc, { foreignKey: 'shop_partner_debt_cn_doc_id', as: 'ShopPartnerDebtCreditNoteDoc' });
    ShopPartnerDebtBillingNoteList.belongsTo(ShopInventoryTransaction, { foreignKey: 'shop_inventory_transaction_id', as: 'ShopInventoryTransaction' });
    ShopPartnerDebtBillingNoteList.belongsTo(ShopBusinessPartner, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartner' });
    ShopPartnerDebtBillingNoteList.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopPartnerDebtBillingNoteList.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopPartnerDebtBillingNoteList.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopPartnerDebtDebitNoteDoc,
            ShopPartnerDebtList,
            ShopInventoryImportDoc,
            ShopPartnerDebtCreditNoteDoc,
            ShopPartnerDebtBillingNoteList,
        } = ShopModels;

        /**
         * @param {ShopPartnerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validateListSelectOnlyOne = async (instance, options) => {
            let existsCount = 0;
            if (isUUID(instance.get('shop_partner_debt_dn_doc_id'))) { existsCount += 1; }
            if (isUUID(instance.get('shop_partner_debt_cn_doc_id'))) { existsCount += 1; }
            if (isUUID(instance.get('shop_inventory_transaction_id'))) { existsCount += 1; }
            if (existsCount !== 1) {
                throw new Error(`กรุณาเลือกเอกสารต้นทางอย่างใดอย่างหนึ่ง (ใบส่งสินค้าชั่วคราว, ใบเพิ่มหนี้เจ้าหนี้การค้า, ใบลดหนี้เจ้าหนี้การค้า): รายการที่ ${instance.get('seq_number')}`);
            }
        };

        /**
         * @param {ShopPartnerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>} options
         */
        const hookBeforeSave_setOptionsDocumentIsCancelStatus = async (instance, options) => {
            if (instance.isNewRecord) {
                return;
            }
            else if (!instance.isNewRecord && instance.previous('status') !== 1) {
                throw new Error(`ไม่สามารถยกแก้ไขข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้าได้ เนื่องจากเคยยกเลิกไปแล้ว`);
            }
            else if (!instance.isNewRecord && instance.changed() && instance.previous('status') === 1 && instance.get('status') === 1) {
                return;
            }
            else if (!instance.isNewRecord && instance.changed('status') && instance.previous('status') === 1 && instance.get('status') === 0) {
                options.isCancelStatus_Doc = true;
                return;
            }
            else {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้าได้ เนื่องจากเกิดข้อผิดพลาดอื่น ๆ`);
            }
        };

        /**
         * @param {ShopPartnerDebtList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>) & { isCancelStatus_Doc?: boolean; }} options
         */
        const hookBeforeSave_checkFields = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (isUUID(instance.get('shop_partner_debt_dn_doc_id'))) {
                const findDoc = await ShopPartnerDebtDebitNoteDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_partner_debt_dn_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้า จากการสร้างหรือแก้ไขรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('shop_partner_debt_cn_doc_id'))) {
                const findDoc = await ShopPartnerDebtCreditNoteDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_partner_debt_cn_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้า จากการสร้างหรือแก้ไขรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('shop_inventory_transaction_id'))) {
                const findDoc = await ShopInventoryImportDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_inventory_transaction_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า จากการสร้างหรือแก้ไขรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('bus_partner_id'))) {
                const findDoc = await ShopBusinessPartner.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('bus_partner_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลผุ้จำหน่าย จากการสร้างหรือแก้ไขเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('tax_type_id'))) {
                const findDoc = await TaxType.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('tax_type_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลประเภทภาษี จากการสร้างหรือแก้ไขเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
        };

        /**
         * Mutation ข้อมูลฟิวส์ "details.meta_data"
         * @param {ShopPartnerDebtList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>) & { isCancelStatus_Doc?: boolean; }} options
         */
        const hookBeforeSave_mutationField_details__meta_data = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const details = {
                ...(!instance.isNewRecord ? instance.previous('details') || {} : {}),
                ...(instance.get('details') || {}),
                meta_data: {
                    ...(!instance.isNewRecord ? instance.previous('details')?.meta_data || {} : {})
                }
            };

            if (
                (instance.isNewRecord)
                ||
                (
                    (!instance.isNewRecord && instance.previous('status') === 1 && instance.get('status') === 1)
                    &&
                    (
                        instance.changed('shop_partner_debt_dn_doc_id')
                        || instance.changed('shop_partner_debt_cn_doc_id')
                        || instance.changed('shop_inventory_transaction_id')
                        || instance.changed('bus_partner_id')
                        || instance.changed('tax_type_id')
                    )
                )
            ) {
                const fnFindAndSetToMetaData = async (instanceFieldName, metaDataFieldName, model, where = {}, transaction = null) => {
                    if (!instance.isNewRecord && !instance.changed(instanceFieldName)) { return; }
                    if (!isUUID(instance.get(instanceFieldName))) {
                        details.meta_data[metaDataFieldName] = null;
                        return;
                    }
                    else {
                        const findModelObject = await model.findOne({
                            where: where,
                            transaction: transaction
                        });
                        if (findModelObject) {
                            details.meta_data[metaDataFieldName] = findModelObject?.toJSON() || null;
                            return;
                        }
                        else {
                            details.meta_data[metaDataFieldName] = null;
                            return;
                        }
                    }
                };

                await Promise.all([
                    fnFindAndSetToMetaData(
                        'shop_partner_debt_dn_doc_id',
                        'ShopPartnerDebtDebitNoteDoc',
                        ShopPartnerDebtDebitNoteDoc,
                        {
                            id: instance.get('shop_partner_debt_dn_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_partner_debt_cn_doc_id',
                        'ShopPartnerDebtCreditNoteDoc',
                        ShopPartnerDebtCreditNoteDoc,
                        {
                            id: instance.get('shop_partner_debt_cn_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_inventory_transaction_id',
                        'ShopInventoryTransaction',
                        ShopInventoryTransaction,
                        {
                            id: instance.get('shop_inventory_transaction_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'bus_partner_id',
                        'ShopBusinessPartner',
                        ShopBusinessPartner,
                        {
                            id: instance.get('bus_partner_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'tax_type_id',
                        'TaxType',
                        TaxType,
                        {
                            id: instance.get('tax_type_id')
                        },
                        transaction
                    ),
                ]);
            }

            instance.set('details', details);
        };

        /**
         * ตรวจสอบการซ้ำกันของใบเพิ่มหนี้ในรายการเจ้าหนี้การค้า
         * @param {ShopPartnerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtBillingNoteList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtBillingNoteList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtDebitNoteDocs = async (instance, options) => {
            if (!instance.get('shop_partner_debt_dn_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopPartnerDebtBillingNoteList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_partner_debt_bn_doc_id: instance.get('shop_partner_debt_bn_doc_id'),
                    shop_partner_debt_dn_doc_id: instance.get('shop_partner_debt_dn_doc_id'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findLists.length > 1) {
                throw new Error(`ไม่สามารถบันทึกรายการเจ้าหนี้การค้าซ้ำกันได้: รายการที่ (${findLists.map(w => w.get('seq_number'))})`);
            }
        };

        /**
         * ตรวจสอบการซ้ำกันของใบลดหนี้ในรายการเจ้าหนี้การค้า
         * @param {ShopPartnerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtBillingNoteList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtBillingNoteList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtCreditNoteDocs = async (instance, options) => {
            if (!instance.get('shop_partner_debt_cn_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopPartnerDebtBillingNoteList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_partner_debt_bn_doc_id: instance.get('shop_partner_debt_bn_doc_id'),
                    shop_partner_debt_cn_doc_id: instance.get('shop_partner_debt_cn_doc_id'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findLists.length > 1) {
                throw new Error(`ไม่สามารถบันทึกรายการเจ้าหนี้การค้าซ้ำกันได้: รายการที่ (${findLists.map(w => w.get('seq_number'))})`);
            }
        };

        /**
         * ตรวจสอบการซ้ำกันของใบนำเข้าในรายการเจ้าหนี้การค้า
         * @param {ShopPartnerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtBillingNoteList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtBillingNoteList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopInventoryTransactions = async (instance, options) => {
            if (!instance.get('shop_inventory_transaction_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopPartnerDebtBillingNoteList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_partner_debt_bn_doc_id: instance.get('shop_partner_debt_bn_doc_id'),
                    shop_inventory_transaction_id: instance.get('shop_inventory_transaction_id'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findLists.length > 1) {
                throw new Error(`ไม่สามารถบันทึกรายการเจ้าหนี้การค้าซ้ำกันได้: รายการที่ (${findLists.map(w => w.get('seq_number'))})`);
            }
        };


        /**
        * @param {ShopPartnerDebtBillingNoteList} instance
        * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtBillingNoteList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtBillingNoteList>) & { isCancelStatus_Doc?: boolean }} options
        */
        const hookBeforeSave_mutationField__vat_type = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            if (instance.isNewRecord || (!instance.isNewRecord && instance.changed('tax_type_id'))) {

                const vatTypeId = {
                    /**
                     * รวม Vat
                     */
                    "IncludeVat": "8c73e506-31b5-44c7-a21b-3819bb712321",
                    /**
                     * ไม่รวม Vat
                     */
                    "ExcludeVat": "fafa3667-55d8-49d1-b06c-759c6e9ab064",
                    /**
                     * ไม่คิด Vat
                     */
                    "NoVat": "52b5a676-c331-4d03-b650-69fc5e591d2c"
                };
                const vatType = {
                    /**
                     * รวม Vat
                     */
                    "IncludeVat": 1,
                    /**
                     * ไม่รวม Vat
                     */
                    "ExcludeVat": 2,
                    /**
                     * ไม่คิด Vat
                     */
                    "NoVat": 3,
                    "UnknownVat": 0
                };
                const vatRate = {
                    /**
                     * รวม Vat
                     */
                    "IncludeVat": 7,
                    /**
                     * ไม่รวม Vat
                     */
                    "ExcludeVat": 7,
                    /**
                     * ไม่คิด Vat
                     */
                    "NoVat": 0,
                    "UnknownVat": 0
                };
                switch (instance.get('tax_type_id')) {
                    // 8c73e506-31b5-44c7-a21b-3819bb712321 = รวม Vat (1)
                    case vatTypeId["IncludeVat"]: {
                        instance.set('vat_type', vatType["IncludeVat"]);
                        instance.set('vat_rate', vatRate["IncludeVat"]);
                        break;
                    }
                    // fafa3667-55d8-49d1-b06c-759c6e9ab064 = ไม่รวม Vat (2)
                    case vatTypeId["ExcludeVat"]: {
                        instance.set('vat_type', vatType["ExcludeVat"]);
                        instance.set('vat_rate', vatRate["ExcludeVat"]);
                        break;
                    }
                    // 52b5a676-c331-4d03-b650-69fc5e591d2c = ไม่คิด Vat (3)
                    case vatTypeId["NoVat"]: {
                        instance.set('vat_type', vatType["NoVat"]);
                        instance.set('vat_rate', vatRate["NoVat"]);
                        break;
                    }
                    default: {
                        instance.set('vat_type', vatType["UnknownVat"]);
                        instance.set('vat_rate', vatRate["UnknownVat"]);
                        break;
                    }
                }
            }
        };

        return {
            hookBeforeValidate_validateListSelectOnlyOne,
            hookBeforeSave_setOptionsDocumentIsCancelStatus,
            hookBeforeSave_checkFields,
            hookBeforeSave_mutationField_details__meta_data,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtDebitNoteDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtCreditNoteDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopInventoryTransactions,
            hookBeforeSave_mutationField__vat_type
        }
    };

    ShopPartnerDebtBillingNoteList.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_validateListSelectOnlyOne(instance, options);
    });

    ShopPartnerDebtBillingNoteList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__vat_type(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField_details__meta_data(instance, options);
    });

    ShopPartnerDebtBillingNoteList.afterSave(async (instance, options) => {
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtDebitNoteDocs(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtCreditNoteDocs(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopInventoryTransactions(instance, options);
    });


    return ShopPartnerDebtBillingNoteList;
};


module.exports = ShopPartnerDebtBillingNoteList;