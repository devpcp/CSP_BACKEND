/**
 * A function do dynamics table of model ShopCustomerDebtBillingNoteList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_customer_debt_bn_list"
 */
const ShopCustomerDebtBillingNoteList = (table_name) => {
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
    const ShopBusinessCustomer = __model.ShopBusinessCustomers(table_name);
    const ShopPersonalCustomer = __model.ShopPersonalCustomers(table_name);
    const ShopVehicleCustomer = __model.ShopVehicleCustomer(table_name);
    const ShopServiceOrderDoc = __model.ShopServiceOrderDoc(table_name);
    const ShopTemporaryDeliveryOrderDoc = __model.ShopTemporaryDeliveryOrderDoc(table_name);
    const ShopTaxInvoiceDoc = __model.ShopTaxInvoiceDoc(table_name);
    const ShopCustomerDebtBillingNoteDoc = __model.ShopCustomerDebtBillingNoteDoc(table_name);
    const ShopCustomerDebtDebitNoteDoc = __model.ShopCustomerDebtDebitNoteDoc(table_name);
    const ShopCustomerDebtCreditNoteDoc = __model.ShopCustomerDebtCreditNoteDoc(table_name);
    const ShopCustomerDebtCreditNoteDocT2 = __model.ShopCustomerDebtCreditNoteDocT2(table_name);

    class ShopCustomerDebtBillingNoteList extends Model {
        static async createOrUpdateShopCustomerDebtBillingNote_Lists(shopId = null, userId = null, shop_customer_debt_bn_doc_id = null, shopCustomerDebtBillingNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!isUUID(shop_customer_debt_bn_doc_id)) { throw new Error(`Require parameter shop_customer_debt_bn_doc_id must be UUID`); }
            if (!Array.isArray(shopCustomerDebtBillingNoteLists)) { throw new Error(`Require parameter shopCustomerDebtBillingNoteLists must be array`); }

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
                ShopServiceOrderDoc,
                ShopPaymentTransaction,
                ShopTemporaryDeliveryOrderDoc,
                ShopTaxInvoiceDoc,
                ShopCustomerDebtBillingNoteDoc,
                ShopCustomerDebtBillingNoteList,
                ShopCustomerDebtDebitNoteDoc,
                ShopCustomerDebtDebitNoteDocT2,
                ShopCustomerDebtCreditNoteDoc
            } = ShopModels;

            /**
             * @type {{
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: Object<string, *> | null;
             *  currentData: ShopCustomerDebtBillingNoteList;
             * }[]};
             */
            const createdAndUpdatedDocuments = [];

            // ถ้าเป็นการยกเลิกเอกสาร แล้วไม่ได้ส่งการแก้ไขรายการนั้น จะต้องทำให้รายการไม่ถูกแก้ไข
            if (options?.isCancelStatus_Doc === true) {
                const findShopCustomerDebtBillingNoteList = await ShopCustomerDebtBillingNoteList.findAll({
                    where: {
                        shop_customer_debt_bn_doc_id: shop_customer_debt_bn_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findShopCustomerDebtBillingNoteList.length; index++) {
                    const findShopCustomerDebtList = findShopCustomerDebtBillingNoteList[index];
                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: false,
                        previousData: findShopCustomerDebtList.toJSON(),
                        currentData: findShopCustomerDebtList
                    });
                }
            }

            // Cancel unused ShopCustomerDebtBillingNoteList
            /**
             * @type {string[]}
             */
            const filterUsedIds = shopCustomerDebtBillingNoteLists.reduce((prev, curr) => {
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
                whereQuery['shop_customer_debt_bn_doc_id'] = shop_customer_debt_bn_doc_id;
            }
            else {
                whereQuery['shop_customer_debt_bn_doc_id'] = shop_customer_debt_bn_doc_id;
            }
            if (Object.keys(whereQuery).length > 0) {
                whereQuery['status'] = 1;

                const findUnusedShopCustomerDebtBillingNoteList = await ShopCustomerDebtBillingNoteList.findAll({
                    where: whereQuery,
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findUnusedShopCustomerDebtBillingNoteList.length; index++) {
                    const element = findUnusedShopCustomerDebtBillingNoteList[index];

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

            // Edit or Create ShopCustomerDebtBillingNoteList
            for (let index = 0; index < shopCustomerDebtBillingNoteLists.length; index++) {
                const shopCustomerDebtBillingNoteList = shopCustomerDebtBillingNoteLists[index];

                if (!isUUID(shopCustomerDebtBillingNoteList.id)) { // สร้างรายการ
                    if (!isUUID(shopCustomerDebtBillingNoteList?.shop_service_order_doc_id)) {
                        if (isUUID(shopCustomerDebtBillingNoteList?.shop_customer_debt_dn_doc_id)) {
                            const findShopCustomerDebtDebitNoteDoc = await ShopCustomerDebtDebitNoteDoc.findOne({
                                where: {
                                    id: shopCustomerDebtBillingNoteList?.shop_customer_debt_dn_doc_id
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (!findShopCustomerDebtDebitNoteDoc) {
                                throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า ในการสร้างข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                            }

                            const objToCreate = {
                                shop_id: shopId,
                                seq_number: shopCustomerDebtBillingNoteList?.seq_number,
                                shop_customer_debt_bn_doc_id: shop_customer_debt_bn_doc_id,
                                shop_customer_debt_dn_doc_id: findShopCustomerDebtDebitNoteDoc.get('id'),
                                shop_customer_debt_cn_doc_id: null,
                                shop_customer_debt_cn_doc_id_t2: null,
                                doc_date: shopCustomerDebtBillingNoteList?.doc_date || currentDateTime,
                                bus_customer_id: findShopCustomerDebtDebitNoteDoc.get('bus_customer_id'),
                                per_customer_id: findShopCustomerDebtDebitNoteDoc.get('per_customer_id'),
                                tax_type_id: findShopCustomerDebtDebitNoteDoc.get('tax_type_id'),
                                vat_type: findShopCustomerDebtDebitNoteDoc.get('vat_type'),
                                vat_rate: findShopCustomerDebtDebitNoteDoc.get('vat_rate') || 0,
                                price_discount_bill: findShopCustomerDebtDebitNoteDoc.get('price_discount_bill') || 0,
                                price_discount_before_pay: findShopCustomerDebtDebitNoteDoc.get('price_discount_before_pay') || 0,
                                price_sub_total: findShopCustomerDebtDebitNoteDoc.get('price_sub_total') || 0,
                                price_discount_total: findShopCustomerDebtDebitNoteDoc.get('price_discount_total') || 0,
                                price_amount_total: findShopCustomerDebtDebitNoteDoc.get('price_amount_total') || 0,
                                price_before_vat: findShopCustomerDebtDebitNoteDoc.get('price_before_vat') || 0,
                                price_vat: findShopCustomerDebtDebitNoteDoc.get('price_vat') || 0,
                                price_grand_total: findShopCustomerDebtDebitNoteDoc.get('price_grand_total') || 0,
                                debt_due_date: findShopCustomerDebtDebitNoteDoc.get('debt_due_date') || null,
                                debt_price_amount: Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_amount')
                                    ? shopCustomerDebtBillingNoteList.debt_price_amount !== null
                                        ? shopCustomerDebtBillingNoteList.debt_price_amount
                                        : findShopCustomerDebtDebitNoteDoc.get('price_grand_total')
                                    : findShopCustomerDebtDebitNoteDoc.get('price_grand_total'),
                                debt_price_paid_total: Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_paid_total')
                                    ? shopCustomerDebtBillingNoteList.debt_price_paid_total !== null
                                        ? shopCustomerDebtBillingNoteList.debt_price_paid_total
                                        : 0
                                    : 0,
                                details: shopCustomerDebtBillingNoteList?.details || {},
                                status: 1,
                                created_by: userId,
                                created_date: currentDateTime,
                                updated_by: null,
                                updated_date: null
                            };

                            if (objToCreate.hasOwnProperty('id')) {
                                delete objToCreate.id;
                            }

                            const createdShopCustomerDebtList = await ShopCustomerDebtBillingNoteList.create(
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
                                currentData: createdShopCustomerDebtList
                            });

                            continue;
                        }

                        if (isUUID(shopCustomerDebtBillingNoteList?.shop_customer_debt_cn_doc_id)) {
                            const findShopCustomerDebtCreditNoteDoc = await ShopCustomerDebtCreditNoteDoc.findOne({
                                where: {
                                    id: shopCustomerDebtBillingNoteList?.shop_customer_debt_cn_doc_id
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (!findShopCustomerDebtCreditNoteDoc) {
                                throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า ในการสร้างข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                            }

                            const objToCreate = {
                                shop_id: shopId,
                                seq_number: shopCustomerDebtBillingNoteList?.seq_number,
                                shop_customer_debt_bn_doc_id: shop_customer_debt_bn_doc_id,
                                shop_customer_debt_dn_doc_id: null,
                                shop_customer_debt_cn_doc_id: findShopCustomerDebtCreditNoteDoc.get('id'),
                                doc_date: shopCustomerDebtBillingNoteList?.doc_date || currentDateTime,
                                bus_customer_id: findShopCustomerDebtCreditNoteDoc.get('bus_customer_id') || null,
                                per_customer_id: findShopCustomerDebtCreditNoteDoc.get('per_customer_id') || null,
                                tax_type_id: findShopCustomerDebtCreditNoteDoc.get('tax_type_id') || null,
                                vat_type: findShopCustomerDebtCreditNoteDoc.get('vat_type') || null,
                                vat_rate: findShopCustomerDebtCreditNoteDoc.get('vat_rate') || 0,
                                price_discount_bill: findShopCustomerDebtCreditNoteDoc.get('price_discount_bill') || 0,
                                price_discount_before_pay: findShopCustomerDebtCreditNoteDoc.get('price_discount_before_pay') || 0,
                                price_sub_total: findShopCustomerDebtCreditNoteDoc.get('price_sub_total') || 0,
                                price_discount_total: findShopCustomerDebtCreditNoteDoc.get('price_discount_total') || 0,
                                price_amount_total: findShopCustomerDebtCreditNoteDoc.get('price_amount_total') || 0,
                                price_before_vat: findShopCustomerDebtCreditNoteDoc.get('price_before_vat') || 0,
                                price_vat: findShopCustomerDebtCreditNoteDoc.get('price_vat') || 0,
                                price_grand_total: findShopCustomerDebtCreditNoteDoc.get('price_grand_total') || 0,
                                debt_due_date: findShopCustomerDebtCreditNoteDoc.get('debt_due_date') || null,
                                debt_price_amount: Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_amount')
                                    ? shopCustomerDebtBillingNoteList.debt_price_amount !== null
                                        ? shopCustomerDebtBillingNoteList.debt_price_amount
                                        : findShopCustomerDebtCreditNoteDoc.get('price_grand_total')
                                    : findShopCustomerDebtCreditNoteDoc.get('price_grand_total'),
                                debt_price_paid_total: Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_paid_total')
                                    ? shopCustomerDebtBillingNoteList.debt_price_paid_total !== null
                                        ? shopCustomerDebtBillingNoteList.debt_price_paid_total
                                        : 0
                                    : 0,
                                details: shopCustomerDebtBillingNoteList?.details || {},
                                status: 1,
                                created_by: userId,
                                created_date: currentDateTime,
                                updated_by: null,
                                updated_date: null
                            };

                            if (objToCreate.hasOwnProperty('id')) {
                                delete objToCreate.id;
                            }

                            const createdShopCustomerDebtList = await ShopCustomerDebtBillingNoteList.create(
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
                                currentData: createdShopCustomerDebtList
                            });

                            continue;
                        }
                        if (isUUID(shopCustomerDebtBillingNoteList?.shop_customer_debt_cn_doc_id_t2)) {
                            const findShopCustomerDebtCreditNoteDoc = await ShopCustomerDebtCreditNoteDocT2.findOne({
                                where: {
                                    id: shopCustomerDebtBillingNoteList?.shop_customer_debt_cn_doc_id_t2
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (!findShopCustomerDebtCreditNoteDoc) {
                                throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ ไม่ติดภาษี ของลูกหนี้การค้า ในการสร้างข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                            }

                            const objToCreate = {
                                shop_id: shopId,
                                seq_number: shopCustomerDebtBillingNoteList?.seq_number,
                                shop_customer_debt_bn_doc_id: shop_customer_debt_bn_doc_id,
                                shop_customer_debt_dn_doc_id: null,
                                shop_customer_debt_cn_doc_id: null,
                                shop_customer_debt_cn_doc_id_t2: findShopCustomerDebtCreditNoteDoc.get('id'),
                                doc_date: shopCustomerDebtBillingNoteList?.doc_date || currentDateTime,
                                bus_customer_id: findShopCustomerDebtCreditNoteDoc.get('bus_customer_id') || null,
                                per_customer_id: findShopCustomerDebtCreditNoteDoc.get('per_customer_id') || null,
                                tax_type_id: findShopCustomerDebtCreditNoteDoc.get('tax_type_id') || null,
                                vat_type: findShopCustomerDebtCreditNoteDoc.get('vat_type') || null,
                                vat_rate: findShopCustomerDebtCreditNoteDoc.get('vat_rate') || 0,
                                price_discount_bill: findShopCustomerDebtCreditNoteDoc.get('price_discount_bill') || 0,
                                price_discount_before_pay: findShopCustomerDebtCreditNoteDoc.get('price_discount_before_pay') || 0,
                                price_sub_total: findShopCustomerDebtCreditNoteDoc.get('price_sub_total') || 0,
                                price_discount_total: findShopCustomerDebtCreditNoteDoc.get('price_discount_total') || 0,
                                price_amount_total: findShopCustomerDebtCreditNoteDoc.get('price_amount_total') || 0,
                                price_before_vat: findShopCustomerDebtCreditNoteDoc.get('price_before_vat') || 0,
                                price_vat: findShopCustomerDebtCreditNoteDoc.get('price_vat') || 0,
                                price_grand_total: findShopCustomerDebtCreditNoteDoc.get('price_grand_total') || 0,
                                debt_due_date: findShopCustomerDebtCreditNoteDoc.get('debt_due_date') || null,
                                debt_price_amount: Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_amount')
                                    ? shopCustomerDebtBillingNoteList.debt_price_amount !== null
                                        ? shopCustomerDebtBillingNoteList.debt_price_amount
                                        : findShopCustomerDebtCreditNoteDoc.get('price_grand_total')
                                    : findShopCustomerDebtCreditNoteDoc.get('price_grand_total'),
                                debt_price_paid_total: Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_paid_total')
                                    ? shopCustomerDebtBillingNoteList.debt_price_paid_total !== null
                                        ? shopCustomerDebtBillingNoteList.debt_price_paid_total
                                        : 0
                                    : 0,
                                details: shopCustomerDebtBillingNoteList?.details || {},
                                status: 1,
                                created_by: userId,
                                created_date: currentDateTime,
                                updated_by: null,
                                updated_date: null
                            };

                            if (objToCreate.hasOwnProperty('id')) {
                                delete objToCreate.id;
                            }

                            const createdShopCustomerDebtList = await ShopCustomerDebtBillingNoteList.create(
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
                                currentData: createdShopCustomerDebtList
                            });

                            continue;
                        }
                    }


                    if (!isUUID(shopCustomerDebtBillingNoteList?.shop_service_order_doc_id)) {
                        throw new Error(`ต้องการข้อมูลรหัสหลักเอกสารใบสั่งซ่อม/ใบสั่งขาย ในการสร้างข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    // ค้นหาเอกสารใบสั่งซ่อม/ใบสั่งขาย ที่มีสถาณะเป็นลูกหนี้การค้า
                    const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                        attributes: {
                            exclude: ['details', 'created_by', 'created_at', 'updated_by', 'updated_at']
                        },
                        where: {
                            id: shopCustomerDebtBillingNoteList.shop_service_order_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopServiceOrderDoc) {
                        throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย ในการสร้างข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopServiceOrderDoc.get('status') !== 1) {
                        throw new Error(`ไม่อนุญาติสร้างรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า ที่เอกสารใบสั่งซ่อม/ใบสั่งขายถูกยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบสั่งซ่อม/ใบสั่งขาย ${findShopServiceOrderDoc.get('code_id')}`);
                    }
                    else if (findShopServiceOrderDoc.get('payment_paid_status') !== 5) {
                        throw new Error(`ข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย จะต้องมีสถาณะการชำระเงินเป็นลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบสั่งซ่อม/ใบสั่งขาย ${findShopServiceOrderDoc.get('code_id')}`);
                    }
                    else {
                        // ค้นหารายการชำระเงินจากใบส่งซ่อม/ใบสั่งขาย จะต้องมีการชำระเงินเป็นบันทึกหนี้มาก่อน
                        const findShopServiceOrderDoc_isPaymentMethod_isCustomerDebt = await ShopPaymentTransaction.findOne({
                            attributes: ['id', 'code_id'],
                            where: {
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                payment_method: 5,
                                canceled_payment_by: null,
                                canceled_payment_date: null
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopServiceOrderDoc_isPaymentMethod_isCustomerDebt) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย ที่มีช่องทางการชำระเงินเป็นลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบสั่งซ่อม/ใบสั่งขาย ${findShopServiceOrderDoc.get('code_id')}`);
                        }

                        const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                            attributes: ['id'],
                            where: {
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                status: 1
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });

                        const findShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                            attributes: ['id'],
                            where: {
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                status: 1
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });

                        /**
                         * หา debt_price_paid_total จากการชำระเงินของเอกวารใบสั่งซ่อม/ใบสั่งขาย
                         * @returns {Promise<number>}
                         */
                        const fnGet__debt_price_paid_total__fromShopPaymentTransaction = async () => {
                            const findShopPaymentTransaction = await ShopPaymentTransaction.findAll({
                                attributes: [
                                    'id',
                                    'code_id',
                                    'shop_service_order_doc_id',
                                    'payment_price_grand_total',
                                    'payment_price_paid'
                                ],
                                where: {
                                    shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                    payment_status: 1,
                                    payment_method: {
                                        [Op.ne]: 5
                                    },
                                    canceled_payment_by: null,
                                    canceled_payment_date: null,
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            /**
                             * จำนวนเงินรวมทั้งสิ้น ของเอกสารใบสั่งซ่อม/ใบสั่งขาย
                             * @type {number}
                             */
                            const shopServiceDoc__price_grand_total = Number(findShopServiceOrderDoc.get('price_grand_total'));
                            /**
                             * จำนวนเงินรวมทั้งสิ้น ที่จ่ายเงินไปกินเอกสารใบสั่งซ่อม/ใบสั่งขาย ไปแล้ว
                             * @type {number}
                             */
                            const shopPaymentTransaction__payment_price_paid = findShopPaymentTransaction.reduce((sum, current) => sum + Number(current.get('payment_price_paid')), 0);

                            return shopServiceDoc__price_grand_total - shopPaymentTransaction__payment_price_paid;
                        };

                        const objToCreate = {
                            shop_id: shopId,
                            seq_number: shopCustomerDebtBillingNoteList?.seq_number,
                            shop_customer_debt_bn_doc_id: shop_customer_debt_bn_doc_id,
                            shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                            shop_temporary_delivery_order_doc_id: findShopTemporaryDeliveryOrderDoc?.get('id') || null,
                            shop_tax_invoice_doc_id: findShopTaxInvoiceDoc?.get('id') || null,
                            doc_date: shopCustomerDebtBillingNoteList?.doc_date || currentDateTime,
                            bus_customer_id: findShopServiceOrderDoc.get('bus_customer_id'),
                            per_customer_id: findShopServiceOrderDoc.get('per_customer_id'),
                            vehicle_customer_id: findShopServiceOrderDoc.get('vehicle_customer_id'),
                            tax_type_id: findShopServiceOrderDoc.get('tax_type_id'),
                            vat_type: findShopServiceOrderDoc.get('vat_type'),
                            vat_rate: findShopServiceOrderDoc.get('vat_rate'),
                            price_discount_bill: findShopServiceOrderDoc.get('price_discount_bill'),
                            price_discount_before_pay: findShopServiceOrderDoc.get('price_discount_before_pay'),
                            price_sub_total: findShopServiceOrderDoc.get('price_sub_total'),
                            price_discount_total: findShopServiceOrderDoc.get('price_discount_total'),
                            price_amount_total: findShopServiceOrderDoc.get('price_amount_total'),
                            price_before_vat: findShopServiceOrderDoc.get('price_before_vat'),
                            price_vat: findShopServiceOrderDoc.get('price_vat'),
                            price_grand_total: findShopServiceOrderDoc.get('price_grand_total'),
                            debt_due_date: shopCustomerDebtBillingNoteList?.debt_due_date || null,
                            debt_price_amount: Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_amount')
                                ? shopCustomerDebtBillingNoteList.debt_price_amount !== null
                                    ? shopCustomerDebtBillingNoteList.debt_price_amount
                                    : findShopServiceOrderDoc.get('debt_price_amount')
                                : findShopServiceOrderDoc.get('debt_price_amount'),
                            debt_price_paid_total: Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_paid_total')
                                ? shopCustomerDebtBillingNoteList.debt_price_paid_total !== null
                                    ? shopCustomerDebtBillingNoteList.debt_price_paid_total
                                    : await fnGet__debt_price_paid_total__fromShopPaymentTransaction()
                                : await fnGet__debt_price_paid_total__fromShopPaymentTransaction(),
                            details: shopCustomerDebtBillingNoteList?.details || {},
                            status: 1,
                            created_by: userId,
                            created_date: currentDateTime,
                            updated_by: null,
                            updated_date: null
                        };

                        if (objToCreate.hasOwnProperty('id')) {
                            delete objToCreate.id;
                        }

                        objToCreate.debt_price_amount_left = Object.hasOwn(shopCustomerDebtBillingNoteList, 'debt_price_amount_left')
                            ? shopCustomerDebtBillingNoteList.debt_price_amount_left !== null
                                ? shopCustomerDebtBillingNoteList.debt_price_amount_left
                                : findShopServiceOrderDoc.get('debt_price_amount_left')
                            : findShopServiceOrderDoc.get('debt_price_amount_left');

                        const createdShopCustomerDebtList = await ShopCustomerDebtBillingNoteList.create(
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
                            currentData: createdShopCustomerDebtList
                        });
                    }
                }
                else { // แก้ไขรายการ
                    if (!isUUID(shopCustomerDebtBillingNoteList?.id)) {
                        throw new Error(`ต้องการข้อมูลรหัสหลักรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    /**
                     * รายการลูกหนี้การค้า ที่ต้องการแก้ไข
                     */
                    const findShopCustomerDebtBillingNoteList = await ShopCustomerDebtBillingNoteList.findOne({
                        where: {
                            id: shopCustomerDebtBillingNoteList?.id,
                            shop_customer_debt_bn_doc_id: shop_customer_debt_bn_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopCustomerDebtBillingNoteList) {
                        throw new Error(`ไม่พบข้อมูลรหัสหลักรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopCustomerDebtBillingNoteList.previous('status') !== 1) {
                        throw new Error(`ไม่สามารถแก้ไขข้อมูลรหัสหลักรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า เนื่องจากรายการนี้อยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtBillingNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else {
                        const objEditData = {};

                        if (shopCustomerDebtBillingNoteList.hasOwnProperty('seq_number')) {
                            objEditData.seq_number = shopCustomerDebtBillingNoteList.seq_number;
                        }
                        if (shopCustomerDebtBillingNoteList.hasOwnProperty('shop_service_order_doc_id')) {
                            objEditData.shop_service_order_doc_id = shopCustomerDebtBillingNoteList.shop_service_order_doc_id;
                        }
                        if (shopCustomerDebtBillingNoteList.hasOwnProperty('debt_price_paid_total')) {
                            objEditData.debt_price_paid_total = shopCustomerDebtBillingNoteList.debt_price_paid_total;
                        }
                        if (shopCustomerDebtBillingNoteList.hasOwnProperty('details')) {
                            objEditData.details = shopCustomerDebtBillingNoteList.details;
                        }
                        if (shopCustomerDebtBillingNoteList.hasOwnProperty('status')) {
                            objEditData.status = shopCustomerDebtBillingNoteList.status;
                        }

                        if (Object.keys(objEditData).length === 0) {
                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: false,
                                previousData: findShopCustomerDebtBillingNoteList.toJSON(),
                                currentData: findShopCustomerDebtBillingNoteList
                            });
                        }
                        else {
                            objEditData.updated_by = userId;
                            objEditData.updated_date = currentDateTime;

                            const findShopCustomerDebtBillingNoteList__previousData = findShopCustomerDebtBillingNoteList.toJSON();

                            findShopCustomerDebtBillingNoteList.set(objEditData);
                            await findShopCustomerDebtBillingNoteList.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: true,
                                previousData: findShopCustomerDebtBillingNoteList__previousData,
                                currentData: findShopCustomerDebtBillingNoteList
                            });
                        }
                    }
                }
            }

            return createdAndUpdatedDocuments;
        }
    }

    ShopCustomerDebtBillingNoteList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า`,
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
            shop_customer_debt_bn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopCustomerDebtBillingNoteDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            shop_customer_debt_dn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopCustomerDebtDebitNoteDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_customer_debt_cn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopCustomerDebtCreditNoteDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_customer_debt_cn_doc_id_t2: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า ไม่คิดภาษี`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopCustomerDebtCreditNoteDocT2,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_service_order_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopServiceOrderDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_temporary_delivery_order_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopTemporaryDeliveryOrderDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_tax_invoice_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบกำกับภาษี`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopTaxInvoiceDoc,
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
            bus_customer_id: {
                comment: `รหัสตารางข้อมูลลูกค้าธุรกิจ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopBusinessCustomer,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            per_customer_id: {
                comment: `รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopPersonalCustomer,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            vehicle_customer_id: {
                comment: `รหัสตารางข้อมูลยานพาหนะ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopVehicleCustomer,
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
                comment: `จำนวนเงินลูกหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_amount_left: {
                comment: `จำนวนเงินลูกหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)`,
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
            modelName: 'ShopCustomerDebtBillingNoteList',
            tableName: `dat_${table_name}_customer_debt_bn_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า',
            indexes: [
                {
                    name: `idx_${table_name}_cbn_list_shop_id`,
                    fields: ['shop_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_shop_customer_debt_cbn_doc_id`,
                    fields: ['shop_customer_debt_bn_doc_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_ccn_doc_id`,
                    fields: ['shop_customer_debt_cn_doc_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_shop_service_order_doc_id`,
                    fields: ['shop_service_order_doc_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_tmp_doc_id`,
                    fields: ['shop_temporary_delivery_order_doc_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_inv_doc_id`,
                    fields: ['shop_tax_invoice_doc_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_bus_cus_id`,
                    fields: ['bus_customer_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_per_cus_id`,
                    fields: ['per_customer_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_veh_cus_id`,
                    fields: ['vehicle_customer_id']
                },
                {
                    name: `idx_${table_name}_cbn_list_tax_type_id`,
                    fields: ['tax_type_id']
                }
            ]
        }
    );

    ShopCustomerDebtBillingNoteList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopCustomerDebtBillingNoteDoc, { foreignKey: 'shop_customer_debt_bn_doc_id', as: 'ShopCustomerDebtBillingNoteDoc' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopCustomerDebtDebitNoteDoc, { foreignKey: 'shop_customer_debt_dn_doc_id', as: 'ShopCustomerDebtDebitNoteDoc' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopCustomerDebtCreditNoteDoc, { foreignKey: 'shop_customer_debt_cn_doc_id', as: 'ShopCustomerDebtCreditNoteDoc' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopCustomerDebtCreditNoteDocT2, { foreignKey: 'shop_customer_debt_cn_doc_id_t2', as: 'ShopCustomerDebtCreditNoteDocT2' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopServiceOrderDoc, { foreignKey: 'shop_service_order_doc_id', as: 'ShopServiceOrderDoc' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_temporary_delivery_order_doc_id', as: 'ShopTemporaryDeliveryOrderDoc' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopTaxInvoiceDoc, { foreignKey: 'shop_tax_invoice_doc_id', as: 'ShopTaxInvoiceDoc' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopCustomerDebtBillingNoteList.belongsTo(ShopVehicleCustomer, { foreignKey: 'vehicle_customer_id', as: 'ShopVehicleCustomer' });
    ShopCustomerDebtBillingNoteList.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopCustomerDebtBillingNoteList.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopCustomerDebtBillingNoteList.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopCustomerDebtDebitNoteDoc,
            ShopCustomerDebtList,
            ShopServiceOrderDoc,
            ShopTemporaryDeliveryOrderDoc,
            ShopTaxInvoiceDoc,
            ShopCustomerDebtCreditNoteDoc,
            ShopCustomerDebtBillingNoteList,
            ShopVehicleCustomer
        } = ShopModels;

        /**
         * @param {ShopCustomerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validateListSelectOnlyOne = async (instance, options) => {
            let existsCount = 0;
            if (isUUID(instance.get('shop_customer_debt_dn_doc_id'))) { existsCount += 1; }
            if (isUUID(instance.get('shop_customer_debt_cn_doc_id'))) { existsCount += 1; }
            if (isUUID(instance.get('shop_customer_debt_cn_doc_id_t2'))) { existsCount += 1; }
            if (isUUID(instance.get('shop_service_order_doc_id')) || isUUID(instance.get('shop_temporary_delivery_order_doc_id'))) { existsCount += 1; }
            if (existsCount !== 1) {
                throw new Error(`กรุณาเลือกเอกสารต้นทางอย่างใดอย่างหนึ่ง (ใบส่งสินค้าชั่วคราว, ใบเพิ่มหนี้ลูกหนี้การค้า, ใบลดหนี้ลูกหนี้การค้า): รายการที่ ${instance.get('seq_number')}`);
            }
        };

        /**
         * @param {ShopCustomerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>} options
         */
        const hookBeforeSave_setOptionsDocumentIsCancelStatus = async (instance, options) => {
            if (instance.isNewRecord) {
                return;
            }
            else if (!instance.isNewRecord && instance.previous('status') !== 1) {
                throw new Error(`ไม่สามารถยกแก้ไขข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้าได้ เนื่องจากเคยยกเลิกไปแล้ว`);
            }
            else if (!instance.isNewRecord && instance.changed() && instance.previous('status') === 1 && instance.get('status') === 1) {
                return;
            }
            else if (!instance.isNewRecord && instance.changed('status') && instance.previous('status') === 1 && instance.get('status') === 0) {
                options.isCancelStatus_Doc = true;
                return;
            }
            else {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้าได้ เนื่องจากเกิดข้อผิดพลาดอื่น ๆ`);
            }
        };

        /**
         * @param {ShopCustomerDebtList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>) & { isCancelStatus_Doc?: boolean; }} options
         */
        const hookBeforeSave_checkFields = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (isUUID(instance.get('shop_customer_debt_dn_doc_id'))) {
                const findDoc = await ShopCustomerDebtDebitNoteDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_customer_debt_dn_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า จากการสร้างหรือแก้ไขรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('shop_customer_debt_cn_doc_id'))) {
                const findDoc = await ShopCustomerDebtCreditNoteDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_customer_debt_cn_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า จากการสร้างหรือแก้ไขรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('shop_customer_debt_cn_doc_id_t2'))) {
                const findDoc = await ShopCustomerDebtCreditNoteDocT2.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_customer_debt_cn_doc_id_t2')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ ไม่คิดภาษี ของลูกหนี้การค้า จากการสร้างหรือแก้ไขรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('shop_service_order_doc_id'))) {
                const findDoc = await ShopServiceOrderDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_service_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย จากการสร้างหรือแก้ไขรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('shop_temporary_delivery_order_doc_id'))) {
                const findDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_temporary_delivery_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งสินค้าชั่วคราว จากการสร้างหรือแก้ไขรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('shop_tax_invoice_doc_id'))) {
                const findDoc = await ShopTaxInvoiceDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_tax_invoice_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบกำกับภาษี จากการสร้างหรือแก้ไขรายการใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('bus_customer_id'))) {
                const findDoc = await ShopBusinessCustomer.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('bus_customer_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลลูกค้าธุรกิจ จากการสร้างหรือแก้ไขเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('per_customer_id'))) {
                const findDoc = await ShopPersonalCustomer.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('per_customer_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลลูกค้าบุคคลธรรมดา จากการสร้างหรือแก้ไขเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
            if (isUUID(instance.get('vehicle_customer_id'))) {
                const findDoc = await ShopVehicleCustomer.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('vehicle_customer_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลรถลูกค้า จากการสร้างหรือแก้ไขเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
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
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลประเภทภาษี จากการสร้างหรือแก้ไขเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
            }
        };

        /**
         * Mutation ข้อมูลฟิวส์ "details.meta_data"
         * @param {ShopCustomerDebtList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>) & { isCancelStatus_Doc?: boolean; }} options
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
                        instance.changed('shop_customer_debt_dn_doc_id')
                        || instance.changed('shop_customer_debt_cn_doc_id')
                        || instance.changed('shop_customer_debt_cn_doc_id_t2')
                        || instance.changed('shop_service_order_doc_id')
                        || instance.changed('shop_temporary_delivery_order_doc_id')
                        || instance.changed('shop_tax_invoice_doc_id')
                        || instance.changed('bus_customer_id')
                        || instance.changed('per_customer_id')
                        || instance.changed('vehicle_customer_id')
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
                        'shop_customer_debt_dn_doc_id',
                        'ShopCustomerDebtDebitNoteDoc',
                        ShopCustomerDebtDebitNoteDoc,
                        {
                            id: instance.get('shop_customer_debt_dn_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_customer_debt_cn_doc_id',
                        'ShopCustomerDebtCreditNoteDoc',
                        ShopCustomerDebtCreditNoteDoc,
                        {
                            id: instance.get('shop_customer_debt_cn_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_customer_debt_cn_doc_id_t2',
                        'ShopCustomerDebtCreditNoteDocT2',
                        ShopCustomerDebtCreditNoteDocT2,
                        {
                            id: instance.get('shop_customer_debt_cn_doc_id_t2')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_service_order_doc_id',
                        'ShopServiceOrderDoc',
                        ShopServiceOrderDoc,
                        {
                            id: instance.get('shop_service_order_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_temporary_delivery_order_doc_id',
                        'ShopTemporaryDeliveryOrderDoc',
                        ShopTemporaryDeliveryOrderDoc,
                        {
                            id: instance.get('shop_temporary_delivery_order_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_tax_invoice_doc_id',
                        'ShopTaxInvoiceDoc',
                        ShopTaxInvoiceDoc,
                        {
                            id: instance.get('shop_tax_invoice_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'bus_customer_id',
                        'ShopBusinessCustomer',
                        ShopBusinessCustomer,
                        {
                            id: instance.get('bus_customer_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'per_customer_id',
                        'ShopPersonalCustomer',
                        ShopPersonalCustomer,
                        {
                            id: instance.get('per_customer_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'vehicle_customer_id',
                        'ShopVehicleCustomer',
                        ShopVehicleCustomer,
                        {
                            id: instance.get('vehicle_customer_id')
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
         * ตรวจสอบการซ้ำกันของใบเพิ่มหนี้ในรายการลูกหนี้การค้า
         * @param {ShopCustomerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtBillingNoteList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtBillingNoteList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtDebitNoteDocs = async (instance, options) => {
            if (!instance.get('shop_customer_debt_dn_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopCustomerDebtBillingNoteList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_customer_debt_bn_doc_id: instance.get('shop_customer_debt_bn_doc_id'),
                    shop_customer_debt_dn_doc_id: instance.get('shop_customer_debt_dn_doc_id'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findLists.length > 1) {
                throw new Error(`ไม่สามารถบันทึกรายการลูกหนี้การค้าซ้ำกันได้: รายการที่ (${findLists.map(w => w.get('seq_number'))})`);
            }
        };

        /**
         * ตรวจสอบการซ้ำกันของใบลดหนี้ในรายการลูกหนี้การค้า
         * @param {ShopCustomerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtBillingNoteList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtBillingNoteList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocs = async (instance, options) => {
            if (!instance.get('shop_customer_debt_cn_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopCustomerDebtBillingNoteList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_customer_debt_bn_doc_id: instance.get('shop_customer_debt_bn_doc_id'),
                    shop_customer_debt_cn_doc_id: instance.get('shop_customer_debt_cn_doc_id'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findLists.length > 1) {
                throw new Error(`ไม่สามารถบันทึกรายการลูกหนี้การค้าซ้ำกันได้: รายการที่ (${findLists.map(w => w.get('seq_number'))})`);
            }
        };

        /**
         * ตรวจสอบการซ้ำกันของใบลดหนี้ในรายการลูกหนี้การค้า ไม่คิดภาษ๊
         * @param {ShopCustomerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtBillingNoteList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtBillingNoteList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocsT2 = async (instance, options) => {
            if (!instance.get('shop_customer_debt_cn_doc_id_t2')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopCustomerDebtBillingNoteList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_customer_debt_bn_doc_id: instance.get('shop_customer_debt_bn_doc_id'),
                    shop_customer_debt_cn_doc_id_t2: instance.get('shop_customer_debt_cn_doc_id_t2'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findLists.length > 1) {
                throw new Error(`ไม่สามารถบันทึกรายการลูกหนี้การค้าซ้ำกันได้: รายการที่ (${findLists.map(w => w.get('seq_number'))})`);
            }
        };

        /**
         * ตรวจสอบการซ้ำกันของใบสั่งซ่อม/ใบสั่งขายในรายการลูกหนี้การค้า
         * @param {ShopCustomerDebtBillingNoteList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtBillingNoteList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtBillingNoteList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopServiceOrderDocs = async (instance, options) => {
            if (!instance.get('shop_service_order_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopCustomerDebtBillingNoteList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_customer_debt_bn_doc_id: instance.get('shop_customer_debt_bn_doc_id'),
                    shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findLists.length > 1) {
                throw new Error(`ไม่สามารถบันทึกรายการลูกหนี้การค้าซ้ำกันได้: รายการที่ (${findLists.map(w => w.get('seq_number'))})`);
            }
        };

        return {
            hookBeforeValidate_validateListSelectOnlyOne,
            hookBeforeSave_setOptionsDocumentIsCancelStatus,
            hookBeforeSave_checkFields,
            hookBeforeSave_mutationField_details__meta_data,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtDebitNoteDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocsT2,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopServiceOrderDocs
        }
    };

    ShopCustomerDebtBillingNoteList.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_validateListSelectOnlyOne(instance, options);
    });

    ShopCustomerDebtBillingNoteList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField_details__meta_data(instance, options);
    });

    ShopCustomerDebtBillingNoteList.afterSave(async (instance, options) => {
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtDebitNoteDocs(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocs(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocsT2(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopServiceOrderDocs(instance, options);
    });


    return ShopCustomerDebtBillingNoteList;
};


module.exports = ShopCustomerDebtBillingNoteList;