/**
 * A function do dynamics table of model ShopPartnerDebtList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_partner_debt_list"
 */
const ShopPartnerDebtList = (table_name) => {
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
    const ShopPartnerDebtDoc = __model.ShopPartnerDebtDoc(table_name);
    const ShopPartnerDebtDebitNoteDoc = __model.ShopPartnerDebtDebitNoteDoc(table_name);
    const ShopPartnerDebtCreditNoteDoc = __model.ShopPartnerDebtCreditNoteDoc(table_name);

    class ShopPartnerDebtList extends Model {
        static async createOrEditShopPartnerDebt_Lists(shop_id, userId, shop_partner_debt_doc_id, shopPartnerDebtLists = [], options = {}) {
            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopInventoryImportDoc,
                ShopPartnerDebtDoc,
                ShopPartnerDebtList,
                ShopPaymentTransaction,
                ShopPartnerDebtDebitNoteDoc,
                ShopPartnerDebtCreditNoteDoc
            } = ShopModels;

            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(shop_partner_debt_doc_id)) {
                throw new Error(`Require parameter 'shop_partner_debt_doc_id' as UUID`);
            }
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }
            if (!Array.isArray(shopPartnerDebtLists)) {
                throw new Error(`Require parameter 'shopPartnerDebtLists' as Array`);
            }

            /**
             * @type {{
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: Object<string, *> | null;
             *  currentData: ShopPartnerDebtList;
             * }[]};
             */
            const createdAndUpdatedDocuments = [];

            // ถ้าเป็นการยกเลิกเอกสาร แล้วไม่ได้ส่งการแก้ไขรายการนั้น จะต้องทำให้รายการไม่ถูกแก้ไข
            if (options?.isCancelStatus_Doc === true) {
                const findShopPartnerDebtLists = await ShopPartnerDebtList.findAll({
                    where: {
                        shop_partner_debt_doc_id: shop_partner_debt_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findShopPartnerDebtLists.length; index++) {
                    const findShopPartnerDebtList = findShopPartnerDebtLists[index];
                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: false,
                        previousData: findShopPartnerDebtList.toJSON(),
                        currentData: findShopPartnerDebtList
                    });
                }
                return createdAndUpdatedDocuments;
            }

            // Cancel unused ShopPartnerDebtLists
            /**
             * @type {string[]}
             */
            const filterUsedIds = shopPartnerDebtLists.reduce((prev, curr) => {
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
                whereQuery['shop_partner_debt_doc_id'] = shop_partner_debt_doc_id;
            }
            else {
                whereQuery['shop_partner_debt_doc_id'] = shop_partner_debt_doc_id;
            }
            if (Object.keys(whereQuery).length > 0) {
                whereQuery['status'] = 1;

                const findUnusedShopPartnerDebtLists = await ShopPartnerDebtList.findAll({
                    where: whereQuery,
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findUnusedShopPartnerDebtLists.length; index++) {
                    const element = findUnusedShopPartnerDebtLists[index];

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

            // Edit or Create ShopPartnerDebtLists
            for (let index = 0; index < shopPartnerDebtLists.length; index++) {
                const shopPartnerDebtList = shopPartnerDebtLists[index];

                if (!isUUID(shopPartnerDebtList.id)) { // สร้างรายการ

                    const objToCreate = {
                        shop_id: shop_id,
                        seq_number: shopPartnerDebtList?.seq_number,
                        shop_partner_debt_doc_id: shop_partner_debt_doc_id,
                        shop_partner_debt_dn_doc_id: shopPartnerDebtList?.shop_partner_debt_dn_doc_id || null,
                        shop_partner_debt_cn_doc_id: shopPartnerDebtList?.shop_partner_debt_cn_doc_id || null,
                        shop_inventory_transaction_id: shopPartnerDebtList?.shop_inventory_transaction_id || null,
                        doc_date: shopPartnerDebtList?.doc_date || currentDateTime,
                        bus_partner_id: shopPartnerDebtList?.bus_partner_id || null,
                        tax_type_id: shopPartnerDebtList?.tax_type_id || null,
                        price_discount_bill: shopPartnerDebtList?.price_discount_bill || 0,
                        price_discount_before_pay: shopPartnerDebtList?.price_discount_before_pay || 0,
                        price_sub_total: shopPartnerDebtList?.price_sub_total || 0,
                        price_discount_total: shopPartnerDebtList?.price_discount_total || 0,
                        price_amount_total: shopPartnerDebtList?.price_amount_total || 0,
                        price_before_vat: shopPartnerDebtList?.price_before_vat || 0,
                        price_vat: shopPartnerDebtList?.price_vat || 0,
                        price_grand_total: shopPartnerDebtList?.price_grand_total || 0,
                        debt_price_amount: shopPartnerDebtList?.debt_price_amount || 0,
                        debt_price_amount_left: shopPartnerDebtList?.debt_price_amount_left || 0,
                        debt_price_paid_adjust: shopPartnerDebtList?.debt_price_paid_adjust || 0,
                        debt_price_paid_total: shopPartnerDebtList?.debt_price_paid_total || 0,
                        details: shopPartnerDebtList?.details || {},
                        status: 1,
                        created_by: userId,
                        created_date: currentDateTime,
                        updated_by: null,
                        updated_date: null
                    };

                    if (objToCreate.hasOwnProperty('id')) {
                        delete objToCreate.id;
                    }

                    if (isUUID(shopPartnerDebtList?.shop_inventory_transaction_id)) {
                        // ค้นหาเอกสารใบนำเข้า ที่มีสถาณะเป็นเจ้าหนี้การค้า
                        const findShopInventoryImportDoc = await ShopInventoryImportDoc.findOne({
                            attributes: {
                                exclude: ['created_by', 'created_at', 'updated_by', 'updated_at']
                            },
                            where: {
                                id: shopPartnerDebtList.shop_inventory_transaction_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopInventoryImportDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า ในการสร้างข้อมูลรายการเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else if (findShopInventoryImportDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติสร้างรายการเจ้าหนี้การค้า ที่เอกสารใบนำเข้าถูกยกเลิกไปแล้ว: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบนำเข้า ${findShopInventoryImportDoc.get('code_id')}`);
                        }
                        else if (findShopInventoryImportDoc.get('payment_paid_status') !== 6) {
                            throw new Error(`ข้อมูลเอกสารใบนำเข้า จะต้องมีสถาณะการชำระเงินเป็นเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบนำเข้า ${findShopInventoryImportDoc.get('code_id')}`);
                        }
                        else {
                            // ค้นหารายการชำระเงินจากใบนำเข้า จะต้องมีการชำระเงินเป็นบันทึกหนี้มาก่อน
                            const findShopInventoryImportDoc_isPaymentMethod_isPartnerDebt = await ShopPaymentTransaction.findOne({
                                attributes: ['id', 'code_id'],
                                where: {
                                    shop_inventory_transaction_id: findShopInventoryImportDoc.get('id'),
                                    payment_method: 6,
                                    canceled_payment_by: null,
                                    canceled_payment_date: null
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (!findShopInventoryImportDoc_isPaymentMethod_isPartnerDebt) {
                                throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า ที่มีช่องทางการชำระเงินเป็นเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบนำเข้า ${findShopInventoryImportDoc.get('code_id')}`);
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
                                        shop_inventory_transaction_id: findShopInventoryImportDoc.get('id'),
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
                                const shopInventoryImportDoc__price_grand_total = Number(findShopInventoryImportDoc.get('price_grand_total'));
                                /**
                                 * จำนวนเงินรวมทั้งสิ้น ที่จ่ายเงินไปกินเอกสารใบนำเข้า ไปแล้ว
                                 * @type {number}
                                 */
                                const shopPaymentTransaction__payment_price_paid = findShopPaymentTransaction.reduce((sum, current) => sum + Number(current.get('payment_price_paid')), 0);

                                return shopInventoryImportDoc__price_grand_total - shopPaymentTransaction__payment_price_paid;
                            };

                            objToCreate.bus_partner_id = findShopInventoryImportDoc.get('bus_partner_id');
                            objToCreate.tax_type_id = findShopInventoryImportDoc.details.tax_type;
                            objToCreate.price_discount_bill = findShopInventoryImportDoc.details.tailgate_discount;
                            objToCreate.price_discount_before_pay = '0.00';
                            objToCreate.price_sub_total = findShopInventoryImportDoc.details.total_price_all;
                            objToCreate.price_discount_total = findShopInventoryImportDoc.details.total_discount;
                            objToCreate.price_amount_total = findShopInventoryImportDoc.details.total_price_all_after_discount;
                            objToCreate.price_before_vat = findShopInventoryImportDoc.details.price_before_vat;
                            objToCreate.price_vat = findShopInventoryImportDoc.details.vat;
                            objToCreate.price_grand_total = findShopInventoryImportDoc.get('price_grand_total');


                            objToCreate.debt_price_amount = Object.hasOwn(shopPartnerDebtList, 'debt_price_amount')
                                ? shopPartnerDebtList.debt_price_amount !== null
                                    ? shopPartnerDebtList.debt_price_amount
                                    : findShopInventoryImportDoc.get('debt_price_amount')
                                : findShopInventoryImportDoc.get('debt_price_amount');

                            objToCreate.debt_price_amount_left = Object.hasOwn(shopPartnerDebtList, 'debt_price_amount_left')
                                ? shopPartnerDebtList.debt_price_amount_left !== null
                                    ? shopPartnerDebtList.debt_price_amount_left
                                    : findShopInventoryImportDoc.get('debt_price_amount_left')
                                : findShopInventoryImportDoc.get('debt_price_amount_left');

                            objToCreate.debt_price_paid_adjust = Object.hasOwn(shopPartnerDebtList, 'debt_price_paid_adjust')
                                ? shopPartnerDebtList.debt_price_paid_adjust !== null
                                    ? shopPartnerDebtList.debt_price_paid_adjust
                                    : 0
                                : 0;

                            objToCreate.debt_price_paid_total = Object.hasOwn(shopPartnerDebtList, 'debt_price_paid_total')
                                ? shopPartnerDebtList.debt_price_paid_total !== null
                                    ? shopPartnerDebtList.debt_price_paid_total
                                    : await fnGet__debt_price_paid_total__fromShopPaymentTransaction()
                                : await fnGet__debt_price_paid_total__fromShopPaymentTransaction();
                        }
                    }

                    if (isUUID(shopPartnerDebtList?.shop_partner_debt_dn_doc_id)) { // ใบเพิ่มหนี้เจ้าหนี้
                        const findShopPartnerDebtDebitNoteDoc = await ShopPartnerDebtDebitNoteDoc.findOne({
                            attributes: {
                                exclude: ['details', 'created_by', 'created_at', 'updated_by', 'updated_at']
                            },
                            where: {
                                id: shopPartnerDebtList.shop_partner_debt_dn_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopPartnerDebtDebitNoteDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้า ในการสร้างข้อมูลรายการเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else if (findShopPartnerDebtDebitNoteDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติสร้างรายการเจ้าหนี้การค้า ที่เอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้าถูกยกเลิกไปแล้ว: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้า ${findShopPartnerDebtDebitNoteDoc.get('code_id')}`);
                        }
                        else {
                            const findShopPartnerDebtList_UsageInList = await ShopPartnerDebtList.findOne({
                                attributes: ['id', 'seq_number', 'shop_partner_debt_doc_id'],
                                where: {
                                    shop_partner_debt_dn_doc_id: shopPartnerDebtList.shop_partner_debt_dn_doc_id,
                                    status: 1
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (findShopPartnerDebtList_UsageInList) {
                                const findShopPartnerDebtDoc_UsageInList = await ShopPartnerDebtDoc.findOne({
                                    attributes: ['id', 'code_id'],
                                    where: {
                                        id: findShopPartnerDebtList_UsageInList.get('shop_partner_debt_doc_id'),
                                        status: 1
                                    },
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                });
                                if (findShopPartnerDebtDoc_UsageInList) {
                                    throw new Error(`ไม่อนุญาติสร้างรายการเจ้าหนี้การค้า เนื่องจากมีเอกสารเจ้านี้การค้าใช้รายการใบเพิ่มหนี้ของเจ้าหนี้การค้าอยู่: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, [เลขที่เอกสารของเจ้าหนี้การค้า ${findShopPartnerDebtDoc_UsageInList.get('code_id')}, รายการที่ (${findShopPartnerDebtList_UsageInList.get('seq_number')})]`);
                                }
                            }

                            objToCreate.doc_date = findShopPartnerDebtDebitNoteDoc.get('doc_date');
                            objToCreate.bus_partner_id = findShopPartnerDebtDebitNoteDoc.get('bus_partner_id');
                            objToCreate.tax_type_id = findShopPartnerDebtDebitNoteDoc.get('tax_type_id');
                            objToCreate.vat_type = findShopPartnerDebtDebitNoteDoc.get('vat_type');
                            objToCreate.vat_rate = findShopPartnerDebtDebitNoteDoc.get('vat_rate');
                            objToCreate.price_sub_total = findShopPartnerDebtDebitNoteDoc.get('price_sub_total');
                            objToCreate.price_before_vat = findShopPartnerDebtDebitNoteDoc.get('price_before_vat');
                            objToCreate.price_vat = findShopPartnerDebtDebitNoteDoc.get('price_vat');
                            objToCreate.price_grand_total = findShopPartnerDebtDebitNoteDoc.get('price_grand_total');
                        }
                    }

                    if (isUUID(shopPartnerDebtList?.shop_partner_debt_cn_doc_id)) { // ใบลดหนี้เจ้าหนี้
                        const findShopPartnerDebtCreditNoteDoc = await ShopPartnerDebtCreditNoteDoc.findOne({
                            attributes: {
                                exclude: ['details', 'created_by', 'created_at', 'updated_by', 'updated_at']
                            },
                            where: {
                                id: shopPartnerDebtList.shop_partner_debt_cn_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopPartnerDebtCreditNoteDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้า ในการสร้างข้อมูลรายการเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else if (findShopPartnerDebtCreditNoteDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติสร้างรายการเจ้าหนี้การค้า ที่เอกสารใบลดหนี้ของเจ้าหนี้การค้าถูกยกเลิกไปแล้ว: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, เลขที่เอกสารใบลดหนี้ของเจ้าหนี้การค้า ${findShopPartnerDebtCreditNoteDoc.get('code_id')}`);
                        }
                        else {
                            const findShopPartnerDebtList_UsageInList = await ShopPartnerDebtList.findOne({
                                attributes: ['id', 'seq_number', 'shop_partner_debt_doc_id'],
                                where: {
                                    shop_partner_debt_cn_doc_id: shopPartnerDebtList.shop_partner_debt_cn_doc_id,
                                    status: 1
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (findShopPartnerDebtList_UsageInList) {
                                const findShopPartnerDebtDoc_UsageInList = await ShopPartnerDebtDoc.findOne({
                                    attributes: ['id', 'code_id'],
                                    where: {
                                        id: findShopPartnerDebtList_UsageInList.get('shop_partner_debt_doc_id'),
                                        status: 1
                                    },
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                });
                                if (findShopPartnerDebtDoc_UsageInList) {
                                    throw new Error(`ไม่อนุญาติสร้างรายการเจ้าหนี้การค้า เนื่องจากมีเอกสารเจ้านี้การค้าใช้รายการใบลดหนี้ของเจ้าหนี้การค้าอยู่: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}, [เลขที่เอกสารเจ้าหนี้การค้า ${findShopPartnerDebtDoc_UsageInList.get('code_id')}, รายการที่ (${findShopPartnerDebtList_UsageInList.get('seq_number')})]`);
                                }
                            }

                            objToCreate.doc_date = findShopPartnerDebtCreditNoteDoc.get('doc_date');
                            objToCreate.bus_partner_id = findShopPartnerDebtCreditNoteDoc.get('bus_partner_id');
                            objToCreate.tax_type_id = findShopPartnerDebtCreditNoteDoc.get('tax_type_id');
                            objToCreate.vat_type = findShopPartnerDebtCreditNoteDoc.get('vat_type');
                            objToCreate.vat_rate = findShopPartnerDebtCreditNoteDoc.get('vat_rate');
                            objToCreate.price_sub_total = Number(findShopPartnerDebtCreditNoteDoc.get('price_sub_total') || 0) * -1;
                            objToCreate.price_before_vat = Number(findShopPartnerDebtCreditNoteDoc.get('price_before_vat') || 0) * -1;
                            objToCreate.price_vat = Number(findShopPartnerDebtCreditNoteDoc.get('price_vat') || 0) * -1;
                            objToCreate.price_grand_total = Number(findShopPartnerDebtCreditNoteDoc.get('price_grand_total') || 0) * -1;
                        }
                    }

                    const createdShopPartnerDebtList = await ShopPartnerDebtList.create(
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
                else { // แก้ไขรายการ
                    if (!isUUID(shopPartnerDebtList?.id)) {
                        throw new Error(`ต้องการข้อมูลรหัสหลักรายการเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    /**
                     * รายการเจ้าหนี้การค้า ที่ต้องการแก้ไข
                     */
                    const findShopPartnerDebtList = await ShopPartnerDebtList.findOne({
                        where: {
                            id: shopPartnerDebtList?.id,
                            shop_partner_debt_doc_id: shop_partner_debt_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopPartnerDebtList) {
                        throw new Error(`ไม่พบข้อมูลรหัสหลักรายการเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopPartnerDebtList.previous('status') !== 1) {
                        throw new Error(`ไม่สามารถแก้ไขข้อมูลรหัสหลักรายการเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการเจ้าหนี้การค้า เนื่องจากรายการนี้อยกเลิกไปแล้ว: รายการที่ ${shopPartnerDebtList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else {
                        const objEditData = {};

                        if (shopPartnerDebtList.hasOwnProperty('seq_number')) {
                            objEditData.seq_number = shopPartnerDebtList.seq_number;
                        }
                        if (shopPartnerDebtList.hasOwnProperty('shop_inventory_transaction_id')) {
                            objEditData.shop_inventory_transaction_id = shopPartnerDebtList.shop_inventory_transaction_id;
                        }
                        if (shopPartnerDebtList.hasOwnProperty('debt_price_paid_adjust')) {
                            objEditData.debt_price_paid_adjust = shopPartnerDebtList.debt_price_paid_adjust;
                        }
                        if (shopPartnerDebtList.hasOwnProperty('debt_price_paid_total')) {
                            objEditData.debt_price_paid_total = shopPartnerDebtList.debt_price_paid_total;
                        }
                        if (shopPartnerDebtList.hasOwnProperty('details')) {
                            objEditData.details = shopPartnerDebtList.details;
                        }
                        if (shopPartnerDebtList.hasOwnProperty('status')) {
                            objEditData.status = shopPartnerDebtList.status;
                        }

                        if (Object.keys(objEditData).length === 0) {
                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: false,
                                previousData: findShopPartnerDebtList.toJSON(),
                                currentData: findShopPartnerDebtList
                            });
                        }
                        else {
                            objEditData.updated_by = userId;
                            objEditData.updated_date = currentDateTime;

                            const findShopPartnerDebtList__previousData = findShopPartnerDebtList.toJSON();

                            findShopPartnerDebtList.set(objEditData);
                            await findShopPartnerDebtList.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: true,
                                previousData: findShopPartnerDebtList__previousData,
                                currentData: findShopPartnerDebtList
                            });
                        }
                    }
                }
            }

            return createdAndUpdatedDocuments;
        }
    }

    ShopPartnerDebtList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการเจ้าหนี้การค้า`,
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
            shop_partner_debt_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารเจ้าหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopPartnerDebtDoc,
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
                comment: `รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม`,
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
                comment: `รหัสตารางข้อมูลผู้จำหน่าย`,
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
                comment: `จำนวนเงินเจ้าหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_amount_left: {
                comment: `จำนวนเงินเจ้าหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_paid_adjust: {
                comment: `จำนวนเงินสำหรับปรับปรุงส่วนต่างของยอดเงินที่จะชำระเจ้าหนี้ โดยจะเอาไปใช้เป็นการบวกเพิ่มหลังจากยอดที่จะชำระ (ส่วนต่างยอดชำระ)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_paid_total: {
                comment: `จำนวนเงินชำระเจ้าหนี้การค้ารวมทั้งสิ้น (ยอดชำระ)`,
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
            modelName: 'ShopPartnerDebtList',
            tableName: `dat_${table_name}_partner_debt_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการเจ้าหนี้การค้า',
            indexes: [
                {
                    name: `idx_${table_name}_partner_list_shop_id`,
                    fields: ['shop_id']
                },
                {
                    name: `idx_${table_name}_partner_list_shop_partner_debt_doc_id`,
                    fields: ['shop_partner_debt_doc_id']
                },
                {
                    name: `idx_${table_name}_partner_list_ccn_doc_id`,
                    fields: ['shop_partner_debt_cn_doc_id']
                },
                {
                    name: `idx_${table_name}_partner_list_shop_inventory_transaction_id`,
                    fields: ['shop_inventory_transaction_id']
                },
                {
                    name: `idx_${table_name}_inventory_transac_id`,
                    fields: ['shop_inventory_transaction_id']
                },
                {
                    name: `idx_${table_name}_partner_list_tax_type_id`,
                    fields: ['tax_type_id']
                }
            ]
        }
    );

    ShopPartnerDebtList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopPartnerDebtList.belongsTo(ShopPartnerDebtDoc, { foreignKey: 'shop_partner_debt_doc_id', as: 'ShopPartnerDebtDoc' });
    ShopPartnerDebtList.belongsTo(ShopPartnerDebtDebitNoteDoc, { foreignKey: 'shop_partner_debt_dn_doc_id', as: 'ShopPartnerDebtDebitNoteDoc' });
    ShopPartnerDebtList.belongsTo(ShopPartnerDebtCreditNoteDoc, { foreignKey: 'shop_partner_debt_cn_doc_id', as: 'ShopPartnerDebtCreditNoteDoc' });
    ShopPartnerDebtList.belongsTo(ShopInventoryTransaction, { foreignKey: 'shop_inventory_transaction_id', as: 'ShopInventoryTransaction' });
    ShopPartnerDebtList.belongsTo(ShopBusinessPartner, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartner' });
    ShopPartnerDebtList.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopPartnerDebtList.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopPartnerDebtList.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopPartnerDebtList,
            ShopInventoryImportDoc,
            ShopPartnerDebtCreditNoteDoc
        } = ShopModels;

        /**
         * @param {ShopPartnerDebtList} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validateListSelectOnlyOne = async (instance, options) => {
            let existsCount = 0;
            if (isUUID(instance.get('shop_partner_debt_dn_doc_id'))) { existsCount += 1; }
            if (isUUID(instance.get('shop_partner_debt_cn_doc_id'))) { existsCount += 1; }
            if (isUUID(instance.get('shop_inventory_transaction_id'))) { existsCount += 1; }
            if (existsCount !== 1) {
                throw new Error(`กรุณาเลือกเอกสารต้นทางอย่างใดอย่างหนึ่ง (ใบนำเข้า, ใบเพิ่มหนี้เจ้าหนี้การค้า, ใบลดหนี้เจ้าหนี้การค้า): รายการที่ ${instance.get('seq_number')}`);
            }
        };

        /**
         * ตรวจสอบฟิวส์ต่าง ๆ ก่อน Save
         * @param {ShopPartnerDebtList} instance
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
         * @param {ShopPartnerDebtList} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const hookBeforeSave_mutationField_details__meta_data = async (instance, options) => {
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') !== 1) { return; }

            const transaction = options?.transaction || null;

            /**
             * @return {Promise<{ShopPartnerDebtDebitNoteDoc: ShopPartnerDebtDebitNoteDoc}|{ShopPartnerDebtDebitNoteDoc: null}>}
             */
            const findShopPartnerDebtDebitNoteDoc = async () => instance.get('shop_partner_debt_dn_doc_id')
                ? {
                    ShopPartnerDebtDebitNoteDoc: await ShopPartnerDebtDebitNoteDoc.findOne({
                        where: {
                            id: instance.get('shop_partner_debt_dn_doc_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopPartnerDebtDebitNoteDoc: null
                };

            /**
             * @return {Promise<{ShopPartnerDebtCreditNoteDoc: ShopPartnerDebtCreditNoteDoc}|{ShopPartnerDebtCreditNoteDoc: null}>}
             */
            const findShopPartnerDebtCreditNoteDoc = async () => instance.get('shop_partner_debt_cn_doc_id')
                ? {
                    ShopPartnerDebtCreditNoteDoc: await ShopPartnerDebtCreditNoteDoc.findOne({
                        where: {
                            id: instance.get('shop_partner_debt_cn_doc_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopPartnerDebtCreditNoteDoc: null
                };

            /**
             * @return {Promise<{ShopInventoryTransaction: ShopInventoryTransaction}|{ShopInventoryTransaction: null}>}
             */
            const findShopInventoryImportDoc = async () => instance.get('shop_inventory_transaction_id')
                ? {
                    ShopInventoryTransaction: await ShopInventoryImportDoc.findOne({
                        where: {
                            id: instance.get('shop_inventory_transaction_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopInventoryTransaction: null
                };


            /**
             * @return {Promise<{ShopBusinessPartner: ShopBusinessPartners}|{ShopBusinessPartner: null}>}
             */
            const findShopBusinessPartner = async () => instance.get('bus_partner_id')
                ? {
                    ShopBusinessPartner: await ShopBusinessPartner.findOne({
                        where: {
                            id: instance.get('bus_partner_id')
                        },
                        transaction
                    })
                }
                : {
                    ShopBusinessPartner: null
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
                    findShopPartnerDebtDebitNoteDoc(),
                    findShopPartnerDebtCreditNoteDoc(),
                    findShopInventoryImportDoc(),
                    findShopBusinessPartner(),
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
                if (instance.changed('shop_partner_debt_dn_doc_id')) { createFnGetMetaDatas.push(findShopPartnerDebtDebitNoteDoc()); }
                if (instance.changed('shop_partner_debt_cn_doc_id')) { createFnGetMetaDatas.push(findShopPartnerDebtCreditNoteDoc()); }
                if (instance.changed('shop_inventory_transaction_id')) { createFnGetMetaDatas.push(findShopInventoryImportDoc()); }
                if (instance.changed('bus_partner_id')) { createFnGetMetaDatas.push(findShopBusinessPartner()); }
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
         * ค้นหาข้อมูลและค่าต่าง ๆ จาก Ref Id ต่าง ๆ จากใบนำเข้า มาใส่ในเอกสาร
         * @param {ShopPartnerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>} options
         */
        const hookBeforeSave_mutationFieldsReferencesFromShopInventoryImportDoc = async (instance, options) => {
            if (!instance.get('shop_inventory_transaction_id')) { return; }

            const transaction = options?.transaction || null;

            const findShopInventoryImportDoc = await ShopInventoryTransaction.findOne({
                where: {
                    id: instance.get('shop_inventory_transaction_id')
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findShopInventoryImportDoc) {
                throw new Error(`ไม่พบข้อมูลใบนำเข้าที่ถูกบนทึกเป็นเจ้าหนี้การค้า: รายการที่: ${instance.get('seq_number')}, ${instance.get('shop_inventory_transaction_id')}`);
            }
            else {

                instance.set({
                    bus_partner_id: findShopInventoryImportDoc.get('bus_partner_id'),
                    tax_type_id: findShopInventoryImportDoc.details.tax_type,
                    price_discount_bill: findShopInventoryImportDoc.details.tailgate_discount,
                    price_discount_before_pay: '0.00',
                    price_sub_total: findShopInventoryImportDoc.details.total_price_all,
                    price_discount_total: findShopInventoryImportDoc.details.total_discount,
                    price_amount_total: findShopInventoryImportDoc.details.total_price_all_after_discount,
                    price_before_vat: findShopInventoryImportDoc.details.price_before_vat,
                    price_vat: findShopInventoryImportDoc.details.vat,
                    price_grand_total: findShopInventoryImportDoc.get('price_grand_total'),
                });


                const debt_price_paid_grand_total = Number(instance.get('debt_price_paid_total')) + Number(instance.get('debt_price_paid_adjust') || 0);
                // ปรับปรุงจำนวนหนี้คงเหลือในเอกสารใบนำเข้า
                if (instance.isNewRecord && instance.get('status') === 1) { // สร้างเอกสาร
                    const new__debt_price_amount_left = Number(findShopInventoryImportDoc.get('debt_price_amount_left')) - debt_price_paid_grand_total;
                    if (new__debt_price_amount_left < 0) { throw new Error(`ไม่สามารถสร้างรายการเจ้าหนี้การค้าได้ เนื่องจากจำนวนเงินที่ชำระเกินจำนวนเงินที่ต้องชำระ: รายการเจ้าหนี้การค้าที่ ${instance.get('seq_number')}, เลขที่ใบนำเข้า ${findShopInventoryImportDoc.get('code_id')}, จำนวนหนี้คงเหลือ ${findShopInventoryImportDoc.get('debt_price_amount_left')}, จำนวนที่จะชำระ ${instance.get('debt_price_paid_total')}`); }
                    findShopInventoryImportDoc.set('debt_price_amount_left', new__debt_price_amount_left);
                }
                if (!instance.isNewRecord && instance.get('status') === 1 && instance.previous('status') === 1 && (instance.changed('debt_price_paid_total') || instance.changed('debt_price_paid_adjust'))) { // แก้ไขเอกสาร
                    const prevPayDebt = Number(instance.get('debt_price_paid_total')) + Number(instance.get('debt_price_paid_adjust') || 0);
                    const currPayDebt = debt_price_paid_grand_total;
                    const new__debt_price_amount_left = Number(findShopInventoryImportDoc.get('debt_price_amount_left')) + (prevPayDebt - currPayDebt);
                    findShopInventoryImportDoc.set('debt_price_amount_left', new__debt_price_amount_left);
                }
                if (!instance.isNewRecord && instance.get('status') === 0 && instance.previous('status') === 1) { // ยกเลิกเอกสาร
                    const new__debt_price_amount_left = Number(findShopInventoryImportDoc.get('debt_price_amount_left')) + debt_price_paid_grand_total;
                    findShopInventoryImportDoc.set('debt_price_amount_left', new__debt_price_amount_left);
                }
                if (findShopInventoryImportDoc.changed()) {
                    await findShopInventoryImportDoc.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                }
            }
        };

        /**
         * ตรวจสอบการซ้ำกันของใบเพิ่มหนี้ในรายการเจ้าหนี้การค้า
         * @param {ShopPartnerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtDebitNoteDocs = async (instance, options) => {
            if (!instance.get('shop_partner_debt_dn_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopPartnerDebtList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_partner_debt_doc_id: instance.get('shop_partner_debt_doc_id'),
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
         * @param {ShopPartnerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtCreditNoteDocs = async (instance, options) => {
            if (!instance.get('shop_partner_debt_cn_doc_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopPartnerDebtList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_partner_debt_doc_id: instance.get('shop_partner_debt_doc_id'),
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
         * @param {ShopPartnerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>} options
         */
        const hookAfterSave_validatorNotAllowToHaveDuplicationOfShopInventoryImportDocs = async (instance, options) => {
            if (!instance.get('shop_inventory_transaction_id')) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findLists = await ShopPartnerDebtList.findAll({
                attributes: ['id', 'seq_number'],
                where: {
                    shop_partner_debt_doc_id: instance.get('shop_partner_debt_doc_id'),
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
         * ตรวจสอบหนี้ที่เหลือหามติดลบ
         * @param {ShopPartnerDebtList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>} options
         */
        const hookAfterSave_validatorShopInventoryImportDocDebtLeft = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const findServiceOrderDoc = await ShopInventoryTransaction.findOne({
                attributes: ['id', 'debt_price_amount_left'],
                where: {
                    id: instance.get('shop_inventory_transaction_id')
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findServiceOrderDoc) {
                throw new Error(`ไม่พบข้อมูลใบนำเข้าที่ถูกบนทึกเป็นเจ้าหนี้การค้า: รายการที่: ${instance.get('seq_number')}`);
            }
            if (Number(findServiceOrderDoc.get('debt_price_amount_left')) < 0) {
                throw new Error(`หนี้ที่เหลือจะต้องไม่ติดลบ: รายการที่: ${instance.get('seq_number')}}`);
            }
        };

        /**
         * @param {ShopPartnerDebtList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtList>) & { isCancelStatus_Doc?: boolean }} options
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
            hookBeforeSave_mutationFieldsReferencesFromShopInventoryImportDoc,
            hookBeforeSave_validateFields,
            hookBeforeSave_mutationField_details__meta_data,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopInventoryImportDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtDebitNoteDocs,
            hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtCreditNoteDocs,
            hookBeforeSave_mutationField__vat_type
        };
    };

    ShopPartnerDebtList.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_validateListSelectOnlyOne(instance, options);
    });

    ShopPartnerDebtList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_validateFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationFieldsReferencesFromShopInventoryImportDoc(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__vat_type(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField_details__meta_data(instance, options);
    });

    ShopPartnerDebtList.afterSave(async (instance, options) => {
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtDebitNoteDocs(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopPartnerDebtCreditNoteDocs(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorNotAllowToHaveDuplicationOfShopInventoryImportDocs(instance, options);

        // await instance.myHookFunctions.hookAfterSave_validatorShopInventoryImportDocDebtLeft(instance, options);
    });

    return ShopPartnerDebtList;
};


module.exports = ShopPartnerDebtList;