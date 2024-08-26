/**
 * A function do dynamics table of model ShopCustomerDebtList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_customer_debt_list"
 */
const ShopCustomerDebtList = (table_name) => {
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
    const ShopCustomerDebtDoc = __model.ShopCustomerDebtDoc(table_name);
    const ShopCustomerDebtDebitNoteDoc = __model.ShopCustomerDebtDebitNoteDoc(table_name);
    const ShopCustomerDebtCreditNoteDoc = __model.ShopCustomerDebtCreditNoteDoc(table_name);
    const ShopCustomerDebtCreditNoteDocT2 = __model.ShopCustomerDebtCreditNoteDocT2(table_name);

    class ShopCustomerDebtList extends Model {
        static async createOrEditShopCustomerDebt_Lists(shop_id, userId, shop_customer_debt_doc_id, shopCustomerDebtLists = [], options = {}) {
            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopServiceOrderDoc,
                ShopCustomerDebtDoc,
                ShopCustomerDebtList,
                ShopTemporaryDeliveryOrderDoc,
                ShopTaxInvoiceDoc,
                ShopPaymentTransaction,
                ShopCustomerDebtDebitNoteDoc,
                ShopCustomerDebtCreditNoteDoc,
                ShopCustomerDebtCreditNoteDocT2
            } = ShopModels;

            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(shop_customer_debt_doc_id)) {
                throw new Error(`Require parameter 'shop_customer_debt_doc_id' as UUID`);
            }
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }
            if (!Array.isArray(shopCustomerDebtLists)) {
                throw new Error(`Require parameter 'shopCustomerDebtLists' as Array`);
            }

            /**
             * @type {{
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: Object<string, *> | null;
             *  currentData: ShopCustomerDebtList;
             * }[]};
             */
            const createdAndUpdatedDocuments = [];

            // ถ้าเป็นการยกเลิกเอกสาร แล้วไม่ได้ส่งการแก้ไขรายการนั้น จะต้องทำให้รายการไม่ถูกแก้ไข
            if (options?.isCancelStatus_Doc === true) {
                const findShopCustomerDebtLists = await ShopCustomerDebtList.findAll({
                    where: {
                        shop_customer_debt_doc_id: shop_customer_debt_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findShopCustomerDebtLists.length; index++) {
                    const findShopCustomerDebtList = findShopCustomerDebtLists[index];
                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: false,
                        previousData: findShopCustomerDebtList.toJSON(),
                        currentData: findShopCustomerDebtList
                    });
                }
                return createdAndUpdatedDocuments;
            }

            // Cancel unused ShopCustomerDebtLists
            /**
             * @type {string[]}
             */
            const filterUsedIds = shopCustomerDebtLists.reduce((prev, curr) => {
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
                whereQuery['shop_customer_debt_doc_id'] = shop_customer_debt_doc_id;
            }
            else {
                whereQuery['shop_customer_debt_doc_id'] = shop_customer_debt_doc_id;
            }
            if (Object.keys(whereQuery).length > 0) {
                whereQuery['status'] = 1;

                const findUnusedShopCustomerDebtLists = await ShopCustomerDebtList.findAll({
                    where: whereQuery,
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findUnusedShopCustomerDebtLists.length; index++) {
                    const element = findUnusedShopCustomerDebtLists[index];

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

            // Edit or Create ShopCustomerDebtLists
            for (let index = 0; index < shopCustomerDebtLists.length; index++) {
                const shopCustomerDebtList = shopCustomerDebtLists[index];

                if (!isUUID(shopCustomerDebtList.id)) { // สร้างรายการ

                    const objToCreate = {
                        shop_id: shop_id,
                        seq_number: shopCustomerDebtList?.seq_number,
                        shop_customer_debt_doc_id: shop_customer_debt_doc_id,
                        shop_customer_debt_dn_doc_id: shopCustomerDebtList?.shop_customer_debt_dn_doc_id || null,
                        shop_customer_debt_cn_doc_id: shopCustomerDebtList?.shop_customer_debt_cn_doc_id || null,
                        shop_customer_debt_cn_doc_id_t2: shopCustomerDebtList?.shop_customer_debt_cn_doc_id_t2 || null,
                        shop_service_order_doc_id: shopCustomerDebtList?.shop_service_order_doc_id || null,
                        shop_temporary_delivery_order_doc_id: shopCustomerDebtList?.shop_temporary_delivery_order_doc_id || null,
                        shop_tax_invoice_doc_id: shopCustomerDebtList?.shop_tax_invoice_doc_id || null,
                        doc_date: shopCustomerDebtList?.doc_date || currentDateTime,
                        bus_customer_id: shopCustomerDebtList?.bus_customer_id || null,
                        per_customer_id: shopCustomerDebtList?.per_customer_id || null,
                        vehicle_customer_id: shopCustomerDebtList?.vehicle_customer_id || null,
                        tax_type_id: shopCustomerDebtList?.tax_type_id || null,
                        vat_type: shopCustomerDebtList?.vat_type || null,
                        vat_rate: shopCustomerDebtList?.vat_rate || 0,
                        price_discount_bill: shopCustomerDebtList?.price_discount_bill || 0,
                        price_discount_before_pay: shopCustomerDebtList?.price_discount_before_pay || 0,
                        price_sub_total: shopCustomerDebtList?.price_sub_total || 0,
                        price_discount_total: shopCustomerDebtList?.price_discount_total || 0,
                        price_amount_total: shopCustomerDebtList?.price_amount_total || 0,
                        price_before_vat: shopCustomerDebtList?.price_before_vat || 0,
                        price_vat: shopCustomerDebtList?.price_vat || 0,
                        price_grand_total: shopCustomerDebtList?.price_grand_total || 0,
                        debt_price_amount: shopCustomerDebtList?.debt_price_amount || 0,
                        debt_price_amount_left: shopCustomerDebtList?.debt_price_amount_left || 0,
                        debt_price_paid_adjust: shopCustomerDebtList?.debt_price_paid_adjust || 0,
                        debt_price_paid_total: shopCustomerDebtList?.debt_price_paid_total || 0,
                        details: shopCustomerDebtList?.details || {},
                        status: 1,
                        created_by: userId,
                        created_date: currentDateTime,
                        updated_by: null,
                        updated_date: null
                    };

                    if (objToCreate.hasOwnProperty('id')) {
                        delete objToCreate.id;
                    }

                    if (isUUID(shopCustomerDebtList?.shop_service_order_doc_id)) {
                        // ค้นหาเอกสารใบสั่งซ่อม/ใบสั่งขาย ที่มีสถาณะเป็นลูกหนี้การค้า
                        const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                            attributes: {
                                exclude: ['details', 'created_by', 'created_at', 'updated_by', 'updated_at']
                            },
                            where: {
                                id: shopCustomerDebtList.shop_service_order_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopServiceOrderDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย ในการสร้างข้อมูลรายการลูกหนี้การค้า: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else if (findShopServiceOrderDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติสร้างรายการลูกหนี้การค้า ที่เอกสารใบสั่งซ่อม/ใบสั่งขายถูกยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบสั่งซ่อม/ใบสั่งขาย ${findShopServiceOrderDoc.get('code_id')}`);
                        }
                        else if (findShopServiceOrderDoc.get('payment_paid_status') !== 5) {
                            throw new Error(`ข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย จะต้องมีสถาณะการชำระเงินเป็นลูกหนี้การค้า: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบสั่งซ่อม/ใบสั่งขาย ${findShopServiceOrderDoc.get('code_id')}`);
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
                                throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย ที่มีช่องทางการชำระเงินเป็นลูกหนี้การค้า: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบสั่งซ่อม/ใบสั่งขาย ${findShopServiceOrderDoc.get('code_id')}`);
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

                            objToCreate.shop_temporary_delivery_order_doc_id = findShopTemporaryDeliveryOrderDoc?.get('id') || null;
                            objToCreate.shop_tax_invoice_doc_id = findShopTaxInvoiceDoc?.get('id') || null;
                            objToCreate.bus_customer_id = findShopServiceOrderDoc.get('bus_customer_id');
                            objToCreate.per_customer_id = findShopServiceOrderDoc.get('per_customer_id');
                            objToCreate.vehicle_customer_id = findShopServiceOrderDoc.get('vehicle_customer_id');
                            objToCreate.tax_type_id = findShopServiceOrderDoc.get('tax_type_id');
                            objToCreate.vat_type = findShopServiceOrderDoc.get('vat_type');
                            objToCreate.vat_rate = findShopServiceOrderDoc.get('vat_rate');
                            objToCreate.price_discount_bill = findShopServiceOrderDoc.get('price_discount_bill');
                            objToCreate.price_discount_before_pay = findShopServiceOrderDoc.get('price_discount_before_pay');
                            objToCreate.price_sub_total = findShopServiceOrderDoc.get('price_sub_total');
                            objToCreate.price_discount_total = findShopServiceOrderDoc.get('price_discount_total');
                            objToCreate.price_amount_total = findShopServiceOrderDoc.get('price_amount_total');
                            objToCreate.price_before_vat = findShopServiceOrderDoc.get('price_before_vat');
                            objToCreate.price_vat = findShopServiceOrderDoc.get('price_vat');
                            objToCreate.price_grand_total = findShopServiceOrderDoc.get('price_grand_total');


                            objToCreate.debt_price_amount = Object.hasOwn(shopCustomerDebtList, 'debt_price_amount')
                                ? shopCustomerDebtList.debt_price_amount !== null
                                    ? shopCustomerDebtList.debt_price_amount
                                    : findShopServiceOrderDoc.get('debt_price_amount')
                                : findShopServiceOrderDoc.get('debt_price_amount');

                            objToCreate.debt_price_amount_left = Object.hasOwn(shopCustomerDebtList, 'debt_price_amount_left')
                                ? shopCustomerDebtList.debt_price_amount_left !== null
                                    ? shopCustomerDebtList.debt_price_amount_left
                                    : findShopServiceOrderDoc.get('debt_price_amount_left')
                                : findShopServiceOrderDoc.get('debt_price_amount_left');

                            objToCreate.debt_price_paid_adjust = Object.hasOwn(shopCustomerDebtList, 'debt_price_paid_adjust')
                                ? shopCustomerDebtList.debt_price_paid_adjust !== null
                                    ? shopCustomerDebtList.debt_price_paid_adjust
                                    : 0
                                : 0;

                            objToCreate.debt_price_paid_total = Object.hasOwn(shopCustomerDebtList, 'debt_price_paid_total')
                                ? shopCustomerDebtList.debt_price_paid_total !== null
                                    ? shopCustomerDebtList.debt_price_paid_total
                                    : await fnGet__debt_price_paid_total__fromShopPaymentTransaction()
                                : await fnGet__debt_price_paid_total__fromShopPaymentTransaction();
                        }
                    }

                    if (isUUID(shopCustomerDebtList?.shop_customer_debt_dn_doc_id)) { // ใบเพิ่มหนี้ลูกหนี้
                        const findShopCustomerDebtDebitNoteDoc = await ShopCustomerDebtDebitNoteDoc.findOne({
                            attributes: {
                                exclude: ['details', 'created_by', 'created_at', 'updated_by', 'updated_at']
                            },
                            where: {
                                id: shopCustomerDebtList.shop_customer_debt_dn_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopCustomerDebtDebitNoteDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า ในการสร้างข้อมูลรายการลูกหนี้การค้า: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else if (findShopCustomerDebtDebitNoteDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติสร้างรายการลูกหนี้การค้า ที่เอกสารใบเพิ่มหนี้ของลูกหนี้การค้าถูกยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบเพิ่มหนี้ของลูกหนี้การค้า ${findShopCustomerDebtDebitNoteDoc.get('code_id')}`);
                        }
                        else {
                            const findShopCustomerDebtList_UsageInList = await ShopCustomerDebtList.findOne({
                                attributes: ['id', 'seq_number', 'shop_customer_debt_doc_id'],
                                where: {
                                    shop_customer_debt_dn_doc_id: shopCustomerDebtList.shop_customer_debt_dn_doc_id,
                                    status: 1
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (findShopCustomerDebtList_UsageInList) {
                                const findShopCustomerDebtDoc_UsageInList = await ShopCustomerDebtDoc.findOne({
                                    attributes: ['id', 'code_id'],
                                    where: {
                                        id: findShopCustomerDebtList_UsageInList.get('shop_customer_debt_doc_id'),
                                        status: 1
                                    },
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                });
                                if (findShopCustomerDebtDoc_UsageInList) {
                                    throw new Error(`ไม่อนุญาติสร้างรายการลูกหนี้การค้า เนื่องจากมีเอกสารลูกนี้การค้าใช้รายการใบเพิ่มหนี้ของลูกหนี้การค้าอยู่: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, [เลขที่เอกสารของลูกหนี้การค้า ${findShopCustomerDebtDoc_UsageInList.get('code_id')}, รายการที่ (${findShopCustomerDebtList_UsageInList.get('seq_number')})]`);
                                }
                            }

                            objToCreate.doc_date = findShopCustomerDebtDebitNoteDoc.get('doc_date');
                            objToCreate.bus_customer_id = findShopCustomerDebtDebitNoteDoc.get('bus_customer_id');
                            objToCreate.per_customer_id = findShopCustomerDebtDebitNoteDoc.get('per_customer_id');
                            objToCreate.tax_type_id = findShopCustomerDebtDebitNoteDoc.get('tax_type_id');
                            objToCreate.vat_type = findShopCustomerDebtDebitNoteDoc.get('vat_type');
                            objToCreate.vat_rate = findShopCustomerDebtDebitNoteDoc.get('vat_rate');
                            objToCreate.price_sub_total = findShopCustomerDebtDebitNoteDoc.get('price_sub_total');
                            objToCreate.price_before_vat = findShopCustomerDebtDebitNoteDoc.get('price_before_vat');
                            objToCreate.price_vat = findShopCustomerDebtDebitNoteDoc.get('price_vat');
                            objToCreate.price_grand_total = findShopCustomerDebtDebitNoteDoc.get('price_grand_total');
                        }
                    }

                    if (isUUID(shopCustomerDebtList?.shop_customer_debt_cn_doc_id)) { // ใบลดหนี้ลูกหนี้
                        const findShopCustomerDebtCreditNoteDoc = await ShopCustomerDebtCreditNoteDoc.findOne({
                            attributes: {
                                exclude: ['details', 'created_by', 'created_at', 'updated_by', 'updated_at']
                            },
                            where: {
                                id: shopCustomerDebtList.shop_customer_debt_cn_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopCustomerDebtCreditNoteDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า ในการสร้างข้อมูลรายการลูกหนี้การค้า: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else if (findShopCustomerDebtCreditNoteDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติสร้างรายการลูกหนี้การค้า ที่เอกสารใบลดหนี้ของลูกหนี้การค้าถูกยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบลดหนี้ของลูกหนี้การค้า ${findShopCustomerDebtCreditNoteDoc.get('code_id')}`);
                        }
                        else {
                            const findShopCustomerDebtList_UsageInList = await ShopCustomerDebtList.findOne({
                                attributes: ['id', 'seq_number', 'shop_customer_debt_doc_id'],
                                where: {
                                    shop_customer_debt_cn_doc_id: shopCustomerDebtList.shop_customer_debt_cn_doc_id,
                                    status: 1
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (findShopCustomerDebtList_UsageInList) {
                                const findShopCustomerDebtDoc_UsageInList = await ShopCustomerDebtDoc.findOne({
                                    attributes: ['id', 'code_id'],
                                    where: {
                                        id: findShopCustomerDebtList_UsageInList.get('shop_customer_debt_doc_id'),
                                        status: 1
                                    },
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                });
                                if (findShopCustomerDebtDoc_UsageInList) {
                                    throw new Error(`ไม่อนุญาติสร้างรายการลูกหนี้การค้า เนื่องจากมีเอกสารลูกนี้การค้าใช้รายการใบลดหนี้ของลูกหนี้การค้าอยู่: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, [เลขที่เอกสารลูกหนี้การค้า ${findShopCustomerDebtDoc_UsageInList.get('code_id')}, รายการที่ (${findShopCustomerDebtList_UsageInList.get('seq_number')})]`);
                                }
                            }

                            objToCreate.doc_date = findShopCustomerDebtCreditNoteDoc.get('doc_date');
                            objToCreate.bus_customer_id = findShopCustomerDebtCreditNoteDoc.get('bus_customer_id');
                            objToCreate.per_customer_id = findShopCustomerDebtCreditNoteDoc.get('per_customer_id');
                            objToCreate.tax_type_id = findShopCustomerDebtCreditNoteDoc.get('tax_type_id');
                            objToCreate.vat_type = findShopCustomerDebtCreditNoteDoc.get('vat_type');
                            objToCreate.vat_rate = findShopCustomerDebtCreditNoteDoc.get('vat_rate');
                            objToCreate.price_sub_total = Number(findShopCustomerDebtCreditNoteDoc.get('price_sub_total') || 0) * -1;
                            objToCreate.price_before_vat = Number(findShopCustomerDebtCreditNoteDoc.get('price_before_vat') || 0) * -1;
                            objToCreate.price_vat = Number(findShopCustomerDebtCreditNoteDoc.get('price_vat') || 0) * -1;
                            objToCreate.price_grand_total = Number(findShopCustomerDebtCreditNoteDoc.get('price_grand_total') || 0) * -1;
                        }
                    }
                    if (isUUID(shopCustomerDebtList?.shop_customer_debt_cn_doc_id_t2)) { // ใบลดหนี้ลูกหนี้ ไม่คิดภาษี
                        const findShopCustomerDebtCreditNoteDoc = await ShopCustomerDebtCreditNoteDocT2.findOne({
                            attributes: {
                                exclude: ['details', 'created_by', 'created_at', 'updated_by', 'updated_at']
                            },
                            where: {
                                id: shopCustomerDebtList.shop_customer_debt_cn_doc_id_t2
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopCustomerDebtCreditNoteDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ ไม่คิดภาษี ของลูกหนี้การค้า ในการสร้างข้อมูลรายการลูกหนี้การค้า: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else if (findShopCustomerDebtCreditNoteDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติสร้างรายการลูกหนี้การค้า ที่เอกสารใบลดหนี้ของลูกหนี้ ไม่คิดภาษี การค้าถูกยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบลดหนี้ของลูกหนี้การค้า ${findShopCustomerDebtCreditNoteDoc.get('code_id')}`);
                        }
                        else {
                            const findShopCustomerDebtList_UsageInList = await ShopCustomerDebtList.findOne({
                                attributes: ['id', 'seq_number', 'shop_customer_debt_doc_id'],
                                where: {
                                    shop_customer_debt_cn_doc_id_t2: shopCustomerDebtList.shop_customer_debt_cn_doc_id_t2,
                                    status: 1
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (findShopCustomerDebtList_UsageInList) {
                                const findShopCustomerDebtDoc_UsageInList = await ShopCustomerDebtDoc.findOne({
                                    attributes: ['id', 'code_id'],
                                    where: {
                                        id: findShopCustomerDebtList_UsageInList.get('shop_customer_debt_doc_id'),
                                        status: 1
                                    },
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                });
                                if (findShopCustomerDebtDoc_UsageInList) {
                                    throw new Error(`ไม่อนุญาติสร้างรายการลูกหนี้การค้า เนื่องจากมีเอกสารลูกนี้การค้าใช้รายการใบลดหนี้ของลูกหนี้การค้าอยู่: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, [เลขที่เอกสารลูกหนี้การค้า ${findShopCustomerDebtDoc_UsageInList.get('code_id')}, รายการที่ (${findShopCustomerDebtList_UsageInList.get('seq_number')})]`);
                                }
                            }

                            objToCreate.doc_date = findShopCustomerDebtCreditNoteDoc.get('doc_date');
                            objToCreate.bus_customer_id = findShopCustomerDebtCreditNoteDoc.get('bus_customer_id');
                            objToCreate.per_customer_id = findShopCustomerDebtCreditNoteDoc.get('per_customer_id');
                            objToCreate.tax_type_id = findShopCustomerDebtCreditNoteDoc.get('tax_type_id');
                            objToCreate.vat_type = findShopCustomerDebtCreditNoteDoc.get('vat_type');
                            objToCreate.vat_rate = findShopCustomerDebtCreditNoteDoc.get('vat_rate');
                            objToCreate.price_sub_total = Number(findShopCustomerDebtCreditNoteDoc.get('price_sub_total') || 0) * -1;
                            objToCreate.price_before_vat = Number(findShopCustomerDebtCreditNoteDoc.get('price_before_vat') || 0) * -1;
                            objToCreate.price_vat = Number(findShopCustomerDebtCreditNoteDoc.get('price_vat') || 0) * -1;
                            objToCreate.price_grand_total = Number(findShopCustomerDebtCreditNoteDoc.get('price_grand_total') || 0) * -1;
                        }
                    }

                    const createdShopCustomerDebtList = await ShopCustomerDebtList.create(
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
                else { // แก้ไขรายการ
                    if (!isUUID(shopCustomerDebtList?.id)) {
                        throw new Error(`ต้องการข้อมูลรหัสหลักรายการลูกหนี้การค้า ในการแก้ไขข้อมูลรายการลูกหนี้การค้า: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    /**
                     * รายการลูกหนี้การค้า ที่ต้องการแก้ไข
                     */
                    const findShopCustomerDebtList = await ShopCustomerDebtList.findOne({
                        where: {
                            id: shopCustomerDebtList?.id,
                            shop_customer_debt_doc_id: shop_customer_debt_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopCustomerDebtList) {
                        throw new Error(`ไม่พบข้อมูลรหัสหลักรายการลูกหนี้การค้า ในการแก้ไขข้อมูลรายการลูกหนี้การค้า: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopCustomerDebtList.previous('status') !== 1) {
                        throw new Error(`ไม่สามารถแก้ไขข้อมูลรหัสหลักรายการลูกหนี้การค้า ในการแก้ไขข้อมูลรายการลูกหนี้การค้า เนื่องจากรายการนี้อยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else {
                        const objEditData = {};

                        if (shopCustomerDebtList.hasOwnProperty('seq_number')) {
                            objEditData.seq_number = shopCustomerDebtList.seq_number;
                        }
                        if (shopCustomerDebtList.hasOwnProperty('shop_service_order_doc_id')) {
                            objEditData.shop_service_order_doc_id = shopCustomerDebtList.shop_service_order_doc_id;
                        }
                        if (shopCustomerDebtList.hasOwnProperty('debt_price_paid_adjust')) {
                            objEditData.debt_price_paid_adjust = shopCustomerDebtList.debt_price_paid_adjust;
                        }
                        if (shopCustomerDebtList.hasOwnProperty('debt_price_paid_total')) {
                            objEditData.debt_price_paid_total = shopCustomerDebtList.debt_price_paid_total;
                        }
                        if (shopCustomerDebtList.hasOwnProperty('details')) {
                            objEditData.details = shopCustomerDebtList.details;
                        }
                        if (shopCustomerDebtList.hasOwnProperty('status')) {
                            objEditData.status = shopCustomerDebtList.status;
                        }

                        if (Object.keys(objEditData).length === 0) {
                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: false,
                                previousData: findShopCustomerDebtList.toJSON(),
                                currentData: findShopCustomerDebtList
                            });
                        }
                        else {
                            objEditData.updated_by = userId;
                            objEditData.updated_date = currentDateTime;

                            const findShopCustomerDebtList__previousData = findShopCustomerDebtList.toJSON();

                            findShopCustomerDebtList.set(objEditData);
                            await findShopCustomerDebtList.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: true,
                                previousData: findShopCustomerDebtList__previousData,
                                currentData: findShopCustomerDebtList
                            });
                        }
                    }
                }
            }

            return createdAndUpdatedDocuments;
        }
    }

    ShopCustomerDebtList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการลูกหนี้การค้า`,
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
            shop_customer_debt_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารลูกหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopCustomerDebtDoc,
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
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_discount_before_pay: {
                comment: `ส่วนลดก่อนชำระเงิน`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_sub_total: {
                comment: `รวมเป็นเงิน`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_discount_total: {
                comment: `ส่วนลดรวม`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_amount_total: {
                comment: `ราคาหลังหักส่วนลด`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_before_vat: {
                comment: `ราคาก่อนรวมภาษี`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_vat: {
                comment: `ภาษีมูลค่าเพิ่ม`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_grand_total: {
                comment: `จำนวนเงินรวมทั้งสิ้น`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            debt_due_date: {
                comment: `วันครบกำหนดชำระหนี้`,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            debt_price_amount: {
                comment: `จำนวนเงินลูกหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_amount_left: {
                comment: `จำนวนเงินลูกหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_paid_adjust: {
                comment: `จำนวนเงินสำหรับปรับปรุงส่วนต่างของยอดเงินที่จะชำระลูกหนี้ โดยจะเอาไปใช้เป็นการบวกเพิ่มหลังจากยอดที่จะชำระ (ส่วนต่างยอดชำระ)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_paid_total: {
                comment: `จำนวนเงินชำระลูกหนี้การค้ารวมทั้งสิ้น (ยอดชำระ)`,
                type: DataTypes.DECIMAL(20, 2),
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
            modelName: 'ShopCustomerDebtList',
            tableName: `dat_${table_name}_customer_debt_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการลูกหนี้การค้า',
            indexes: [
                {
                    name: `idx_${table_name}_ccd_list_shop_id`,
                    fields: ['shop_id']
                },
                {
                    name: `idx_${table_name}_ccd_list_shop_customer_debt_doc_id`,
                    fields: ['shop_customer_debt_doc_id']
                },
                {
                    name: `idx_${table_name}_ccd_list_ccn_doc_id`,
                    fields: ['shop_customer_debt_cn_doc_id']
                },
                {
                    name: `idx_${table_name}_ccd_list_shop_service_order_doc_id`,
                    fields: ['shop_service_order_doc_id']
                },
                {
                    name: `idx_${table_name}_ccd_list_tmp_doc_id`,
                    fields: ['shop_temporary_delivery_order_doc_id']
                },
                {
                    name: `idx_${table_name}_ccd_list_inv_doc_id`,
                    fields: ['shop_tax_invoice_doc_id']
                },
                {
                    name: `idx_${table_name}_ccd_list_tax_type_id`,
                    fields: ['tax_type_id']
                }
            ]
        }
    );

    ShopCustomerDebtList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopCustomerDebtList.belongsTo(ShopCustomerDebtDoc, { foreignKey: 'shop_customer_debt_doc_id', as: 'ShopCustomerDebtDoc' });
    ShopCustomerDebtList.belongsTo(ShopCustomerDebtDebitNoteDoc, { foreignKey: 'shop_customer_debt_dn_doc_id', as: 'ShopCustomerDebtDebitNoteDoc' });
    ShopCustomerDebtList.belongsTo(ShopCustomerDebtCreditNoteDoc, { foreignKey: 'shop_customer_debt_cn_doc_id', as: 'ShopCustomerDebtCreditNoteDoc' });
    ShopCustomerDebtList.belongsTo(ShopCustomerDebtCreditNoteDocT2, { foreignKey: 'shop_customer_debt_cn_doc_id_t2', as: 'ShopCustomerDebtCreditNoteDocT2' });
    ShopCustomerDebtList.belongsTo(ShopServiceOrderDoc, { foreignKey: 'shop_service_order_doc_id', as: 'ShopServiceOrderDoc' });
    ShopCustomerDebtList.belongsTo(ShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_temporary_delivery_order_doc_id', as: 'ShopTemporaryDeliveryOrderDoc' });
    ShopCustomerDebtList.belongsTo(ShopTaxInvoiceDoc, { foreignKey: 'shop_tax_invoice_doc_id', as: 'ShopTaxInvoiceDoc' });
    ShopCustomerDebtList.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopCustomerDebtList.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopCustomerDebtList.belongsTo(ShopVehicleCustomer, { foreignKey: 'vehicle_customer_id', as: 'ShopVehicleCustomer' });
    ShopCustomerDebtList.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopCustomerDebtList.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopCustomerDebtList.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopCustomerDebtList,
            ShopServiceOrderDoc,
            ShopTemporaryDeliveryOrderDoc,
            ShopTaxInvoiceDoc,
            ShopCustomerDebtCreditNoteDoc
        } = ShopModels;

        /**
         * @param {ShopCustomerDebtList} instance
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
         * ตรวจสอบฟิวส์ต่าง ๆ ก่อน Save
         * @param {ShopCustomerDebtList} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const hookBeforeSave_validateFields = (instance, options) => {
            if (Number(instance.get('debt_price_paid_adjust') || 0) !== 0) {
                const debt_price_paid_grand_total = Number(instance.get('debt_price_paid_total')) + Number(instance.get('debt_price_paid_adjust'));
                if (debt_price_paid_grand_total > Number(instance.get('debt_price_amount_left'))) {
                    throw new Error(`จํานวนเงินที่ต้องชําระต้องหน้อยกว่าหรือเท่ากับยอดเงินคงเหลือ: รายการที่ (${instance.get('seq_number')}), จำนวนที่จะชำระ (${instance.get('debt_price_paid_total')} + ${instance.get('debt_price_paid_adjust')} = ${debt_price_paid_grand_total}), ยอดเงินคงเหลือ (${instance.get('debt_price_amount_left')})`);
                }
            }
        };

        /**
         * Mutation ฟิวส์ details.meta_data
         * @param {ShopCustomerDebtList} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const hookBeforeSave_mutationField_details__meta_data = async (instance, options) => {
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') !== 1) { return; }

            const transaction = options?.transaction || null;

            /**
             * @return {Promise<{ShopCustomerDebtDebitNoteDoc: ShopCustomerDebtDebitNoteDoc}|{ShopCustomerDebtDebitNoteDoc: null}>}
             */
            const findShopCustomerDebtDebitNoteDoc = async () => instance.get('shop_customer_debt_dn_doc_id')
                ? {
                    ShopCustomerDebtDebitNoteDoc: await ShopCustomerDebtDebitNoteDoc.findOne({
                        where: {
                            id: instance.get('shop_customer_debt_dn_doc_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopCustomerDebtDebitNoteDoc: null
                };

            /**
             * @return {Promise<{ShopCustomerDebtCreditNoteDoc: ShopCustomerDebtCreditNoteDoc}|{ShopCustomerDebtCreditNoteDoc: null}>}
             */
            const findShopCustomerDebtCreditNoteDoc = async () => instance.get('shop_customer_debt_cn_doc_id')
                ? {
                    ShopCustomerDebtCreditNoteDoc: await ShopCustomerDebtCreditNoteDoc.findOne({
                        where: {
                            id: instance.get('shop_customer_debt_cn_doc_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopCustomerDebtCreditNoteDoc: null
                };


            /**
            * @return {Promise<{ShopCustomerDebtCreditNoteDocT2: ShopCustomerDebtCreditNoteDocT2}|{ShopCustomerDebtCreditNoteDocT2: null}>}
            */
            const findShopCustomerDebtCreditNoteDocT2 = async () => instance.get('shop_customer_debt_cn_doc_id_t2')
                ? {
                    ShopCustomerDebtCreditNoteDoc: await ShopCustomerDebtCreditNoteDocT2.findOne({
                        where: {
                            id: instance.get('shop_customer_debt_cn_doc_id_t2')
                        },
                        transaction
                    })
                }
                : {
                    ShopCustomerDebtCreditNoteDocT2: null
                };
            /**
             * @return {Promise<{ShopServiceOrderDoc: ShopServiceOrderDoc}|{ShopServiceOrderDoc: null}>}
             */
            const findShopServiceOrderDoc = async () => instance.get('shop_service_order_doc_id')
                ? {
                    ShopServiceOrderDoc: await ShopServiceOrderDoc.findOne({
                        where: {
                            id: instance.get('shop_service_order_doc_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopServiceOrderDoc: null
                };

            /**
             * @return {Promise<{ShopTemporaryDeliveryOrderDoc: ShopTemporaryDeliveryOrderDoc}|{ShopTemporaryDeliveryOrderDoc: null}>}
             */
            const findShopTemporaryDeliveryOrderDoc = async () => instance.get('shop_temporary_delivery_order_doc_id')
                ? {
                    ShopTemporaryDeliveryOrderDoc: await ShopTemporaryDeliveryOrderDoc.findOne({
                        where: {
                            id: instance.get('shop_temporary_delivery_order_doc_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopTemporaryDeliveryOrderDoc: null
                };

            /**
             * @return {Promise<{ShopTaxInvoiceDoc: ShopTaxInvoiceDoc}|{ShopTaxInvoiceDoc: null}>}
             */
            const findShopTaxInvoiceDoc = async () => instance.get('shop_tax_invoice_doc_id')
                ? {
                    ShopTaxInvoiceDoc: await ShopTaxInvoiceDoc.findOne({
                        where: {
                            id: instance.get('shop_tax_invoice_doc_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopTaxInvoiceDoc: null
                };

            /**
             * @return {Promise<{ShopBusinessCustomer: ShopBusinessCustomers}|{ShopBusinessCustomer: null}>}
             */
            const findShopBusinessCustomer = async () => instance.get('bus_customer_id')
                ? {
                    ShopBusinessCustomer: await ShopBusinessCustomer.findOne({
                        where: {
                            id: instance.get('bus_customer_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopBusinessCustomer: null
                };

            /**
             * @return {Promise<{ShopPersonalCustomer: ShopPersonalCustomers}|{ShopPersonalCustomer: null}>}
             */
            const findShopPersonalCustomer = async () => instance.get('per_customer_id')
                ? {
                    ShopPersonalCustomer: await ShopPersonalCustomer.findOne({
                        where: {
                            id: instance.get('per_customer_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopPersonalCustomer: null
                };

            /**
             * @return {Promise<{ShopVehicleCustomer: ShopVehicleCustomer}|{ShopVehicleCustomer: null}>}
             */
            const findShopVehicleCustomer = async () => instance.get('vehicle_customer_id')
                ? {
                    ShopVehicleCustomer: await ShopVehicleCustomer.findOne({
                        where: {
                            id: instance.get('vehicle_customer_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopVehicleCustomer: null
                };

            /**
             * @return {Promise<{TaxType: TaxType}|{TaxType: null}>}
             */
            const findTaxType = async () => instance.get('tax_type_id')
                ? {
                    TaxType: await TaxType.findOne({
                        where: {
                            id: instance.get('tax_type_id')
                        },
                        transaction
                    })
                }
                : {
                    TaxType: null
                };

            if (instance.isNewRecord) {
                const meta_data = await Promise.all([
                    findShopCustomerDebtDebitNoteDoc(),
                    findShopCustomerDebtCreditNoteDoc(),
                    findShopCustomerDebtCreditNoteDocT2(),
                    findShopServiceOrderDoc(),
                    findShopTemporaryDeliveryOrderDoc(),
                    findShopTaxInvoiceDoc(),
                    findShopBusinessCustomer(),
                    findShopPersonalCustomer(),
                    findShopVehicleCustomer(),
                    findTaxType()
                ]);
                instance.set('details', {
                    ...(instance.get('details') || {}),
                    meta_data: {
                        ...(instance.get('details')?.meta_data || {}),
                        ...(meta_data.reduce((prev, curr) => ({ ...prev, ...curr }), {}))
                    }
                });
            }

            if (!instance.isNewRecord && instance.changed()) {
                const createFnGetMetaDatas = [];
                if (instance.changed('shop_customer_debt_dn_doc_id')) { createFnGetMetaDatas.push(findShopCustomerDebtDebitNoteDoc()); }
                if (instance.changed('shop_customer_debt_cn_doc_id')) { createFnGetMetaDatas.push(findShopCustomerDebtCreditNoteDoc()); }
                if (instance.changed('shop_customer_debt_cn_doc_id_t2')) { createFnGetMetaDatas.push(findShopCustomerDebtCreditNoteDocT2()); }
                if (instance.changed('shop_service_order_doc_id')) { createFnGetMetaDatas.push(findShopServiceOrderDoc()); }
                if (instance.changed('shop_temporary_delivery_order_doc_id')) { createFnGetMetaDatas.push(findShopTemporaryDeliveryOrderDoc()); }
                if (instance.changed('shop_tax_invoice_doc_id')) { createFnGetMetaDatas.push(findShopTaxInvoiceDoc()); }
                if (instance.changed('bus_customer_id')) { createFnGetMetaDatas.push(findShopBusinessCustomer()); }
                if (instance.changed('per_customer_id')) { createFnGetMetaDatas.push(findShopPersonalCustomer()); }
                if (instance.changed('vehicle_customer_id')) { createFnGetMetaDatas.push(findShopVehicleCustomer()); }
                if (instance.changed('tax_type_id')) { createFnGetMetaDatas.push(findTaxType()); }

                const meta_data = await Promise.all(createFnGetMetaDatas);
                instance.set('details', {
                    ...(instance.get('details') || {}),
                    meta_data: {
                        ...(instance.get('details')?.meta_data || {}),
                        ...(meta_data.reduce((prev, curr) => ({ ...prev, ...curr }), {}))
                    }
                });
            }
        }

        /**
         * ค้นหาข้อมูลและค่าต่าง ๆ จาก Ref Id ต่าง ๆ จากใบสั่งซ่อม/ใบสั่งขาย มาใส่ในเอกสาร
         * @param {ShopCustomerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>} options
         */
        const hookBeforeSave_mutationFieldsReferencesFromShopServiceOrderDoc = async (instance, options) => {
            if (!instance.get('shop_service_order_doc_id')) { return; }

            const transaction = options?.transaction || null;

            const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                attributes: [
                    'id',
                    'code_id',
                    'bus_customer_id',
                    'per_customer_id',
                    'vehicle_customer_id',
                    'tax_type_id',
                    'vat_type',
                    'vat_rate',
                    'price_discount_bill',
                    'price_discount_before_pay',
                    'price_sub_total',
                    'price_discount_total',
                    'price_amount_total',
                    'price_before_vat',
                    'price_vat',
                    'price_grand_total',
                    'debt_price_amount',
                    'debt_price_amount_left',
                    'status'
                ],
                where: {
                    id: instance.get('shop_service_order_doc_id')
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findShopServiceOrderDoc) {
                throw new Error(`ไม่พบข้อมูลใบสั่งซ่อม/ใบสั่งขายที่ถูกบนทึกเป็นลูกหนี้การค้า: รายการที่: ${instance.get('seq_number')}, ${instance.get('shop_service_order_doc_id')}`);
            }
            else {
                instance.set({
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
                });

                const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                    attributes: ['id'],
                    where: {
                        shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (findShopTemporaryDeliveryOrderDoc) {
                    instance.set('shop_temporary_delivery_order_doc_id', findShopTemporaryDeliveryOrderDoc.get('id'));
                }

                const findShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                    attributes: ['id'],
                    where: {
                        shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (findShopTaxInvoiceDoc) {
                    instance.set('shop_tax_invoice_doc_id', findShopTaxInvoiceDoc.get('id'));
                }

                const debt_price_paid_grand_total = Number(instance.get('debt_price_paid_total')) + Number(instance.get('debt_price_paid_adjust') || 0);
                // ปรับปรุงจำนวนหนี้คงเหลือในเอกสารใบสั่งซ่อม/ใบสั่งขาย
                if (instance.isNewRecord && instance.get('status') === 1) { // สร้างเอกสาร
                    const new__debt_price_amount_left = Number(findShopServiceOrderDoc.get('debt_price_amount_left')) - debt_price_paid_grand_total;
                    if (new__debt_price_amount_left < 0) { throw new Error(`ไม่สามารถสร้างรายการลูกหนี้การค้าได้ เนื่องจากจำนวนเงินที่ชำระเกินจำนวนเงินที่ต้องชำระ: รายการลูกหนี้การค้าที่ ${instance.get('seq_number')}, เลขที่ใบสั่งซ่อม/ใบสั่งขาย ${findShopServiceOrderDoc.get('code_id')}, จำนวนหนี้คงเหลือ ${findShopServiceOrderDoc.get('debt_price_amount_left')}, จำนวนที่จะชำระ ${instance.get('debt_price_paid_total')}`); }
                    findShopServiceOrderDoc.set('debt_price_amount_left', new__debt_price_amount_left);
                }
                if (!instance.isNewRecord && instance.get('status') === 1 && instance.previous('status') === 1 && (instance.changed('debt_price_paid_total') || instance.changed('debt_price_paid_adjust'))) { // แก้ไขเอกสาร
                    const prevPayDebt = Number(instance.get('debt_price_paid_total')) + Number(instance.get('debt_price_paid_adjust') || 0);
                    const currPayDebt = debt_price_paid_grand_total;
                    const new__debt_price_amount_left = Number(findShopServiceOrderDoc.get('debt_price_amount_left')) + (prevPayDebt - currPayDebt);
                    findShopServiceOrderDoc.set('debt_price_amount_left', new__debt_price_amount_left);
                }
                if (!instance.isNewRecord && instance.get('status') === 0 && instance.previous('status') === 1) { // ยกเลิกเอกสาร
                    const new__debt_price_amount_left = Number(findShopServiceOrderDoc.get('debt_price_amount_left')) + debt_price_paid_grand_total;
                    findShopServiceOrderDoc.set('debt_price_amount_left', new__debt_price_amount_left);
                }
                if (findShopServiceOrderDoc.changed()) {
                    await findShopServiceOrderDoc.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                }
            }
        };

        /**
         * ตรวจสอบการซ้ำกันของใบเพิ่มหนี้ในรายการลูกหนี้การค้า
         * @param {ShopCustomerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtDebitNoteDocs = async (instance, options) => {
            if (!instance.get('shop_customer_debt_dn_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopCustomerDebtList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_customer_debt_doc_id: instance.get('shop_customer_debt_doc_id'),
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
         * @param {ShopCustomerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocs = async (instance, options) => {
            if (!instance.get('shop_customer_debt_cn_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopCustomerDebtList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_customer_debt_doc_id: instance.get('shop_customer_debt_doc_id'),
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
        * ตรวจสอบการซ้ำกันของใบลดหนี้ในรายการลูกหนี้การค้า ไม่คิดภาษี
        * @param {ShopCustomerDebtList} instance
        * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>} options
        */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocsT2 = async (instance, options) => {
            if (!instance.get('shop_customer_debt_cn_doc_id_t2')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopCustomerDebtList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_customer_debt_doc_id: instance.get('shop_customer_debt_doc_id'),
                    shop_customer_debt_cn_doc_id_t2: instance.get('shop_customer_debt_cn_doc_id_t2'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findLists.length > 1) {
                throw new Error(`ไม่สามารถบันทึกรายการลูกหนี้การค้า ไม่คิดภาษี ซ้ำกันได้: รายการที่ (${findLists.map(w => w.get('seq_number'))})`);
            }
        };

        /**
         * ตรวจสอบการซ้ำกันของใบสั่งซ่อม/ใบสั่งขายในรายการลูกหนี้การค้า
         * @param {ShopCustomerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopServiceOrderDocs = async (instance, options) => {
            if (!instance.get('shop_service_order_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopCustomerDebtList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_customer_debt_doc_id: instance.get('shop_customer_debt_doc_id'),
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

        /**
         * ตรวจสอบหนี้ที่เหลือหามติดลบ
         * @param {ShopCustomerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtList>} options
         */
        const hookAfterSave_validatorShopServiceOrderDocDebtLeft = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                attributes: ['id', 'debt_price_amount_left'],
                where: {
                    id: instance.get('shop_service_order_doc_id')
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findServiceOrderDoc) {
                throw new Error(`ไม่พบข้อมูลใบสั่งซ่อม/ใบสั่งขายที่ถูกบนทึกเป็นลูกหนี้การค้า: รายการที่: ${instance.get('seq_number')}`);
            }
            if (Number(findServiceOrderDoc.get('debt_price_amount_left')) < 0) {
                throw new Error(`หนี้ที่เหลือจะต้องไม่ติดลบ: รายการที่: ${instance.get('seq_number')}}`);
            }
        };

        return {
            hookBeforeValidate_validateListSelectOnlyOne,
            hookBeforeSave_mutationFieldsReferencesFromShopServiceOrderDoc,
            hookBeforeSave_validateFields,
            hookBeforeSave_mutationField_details__meta_data,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopServiceOrderDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtDebitNoteDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocsT2
        };
    };

    ShopCustomerDebtList.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_validateListSelectOnlyOne(instance, options);
    });

    ShopCustomerDebtList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_validateFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationFieldsReferencesFromShopServiceOrderDoc(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField_details__meta_data(instance, options);
    });

    ShopCustomerDebtList.afterSave(async (instance, options) => {
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtDebitNoteDocs(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocs(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopCustomerDebtCreditNoteDocsT2(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopServiceOrderDocs(instance, options);

        // await instance.myHookFunctions.hookAfterSave_validatorShopServiceOrderDocDebtLeft(instance, options);
    });

    return ShopCustomerDebtList;
};


module.exports = ShopCustomerDebtList;