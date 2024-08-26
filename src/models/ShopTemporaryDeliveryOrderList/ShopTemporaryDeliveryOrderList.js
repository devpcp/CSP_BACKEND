/**
 * A function do dynamics table of model ShopServiceOrderList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_service_order_list"
 */
const ShopTemporaryDeliveryOrderList = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const { isUUID } = require("../../utils/generate");
    const utilProportionDiscountCalculator = require("../../utils/util.ProportionDiscountCalculator");

    /**
     * @type {import("lodash")}
     */
    const _ = require("lodash");

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Transaction, Op } = require("sequelize");

    const db = require("../../db");

    const {
        User: Users,
        ShopsProfiles: ShopProfile,
        ProductPurchaseUnitTypes: ProductPurchaseUnitType
    } = require("../model");
    const ShopProduct = require("../model").ShopProduct(table_name);
    const ShopWarehouse = require("../model").ShopWarehouse(table_name);
    const ShopStock = require("../model").ShopStock(table_name);
    const ShopTemporaryDeliveryOrderDoc = require("../model").ShopTemporaryDeliveryOrderDoc(table_name);
    const ShopServiceOrderList = require("../model").ShopServiceOrderList(table_name);

    class ShopTemporaryDeliveryOrderList extends Model {
        /**
         * Create ShopTemporaryDeliveryOrderList from ShopTemporaryDeliveryOrderDoc สร้างรายการใบส่งสินค้าชั่วคราวจากใบส่งสินค้าชั่วคราว
         * @param shop_temporary_delivery_order_doc_id {string}
         * @param options {{ created_by?: string; created_date?: string | Date; ShopModels?: Object; transaction?: Transaction; }}
         * @returns {Promise<Array<ShopTemporaryDeliveryOrderList>>}
         */
        static async createFromShopTemporaryDeliveryOrderDoc(shop_temporary_delivery_order_doc_id = '', options) {
            if (!shop_temporary_delivery_order_doc_id) { throw new Error(`Require parameter 'shop_temporary_delivery_order_doc_id'`); }
            else {
                const ShopModels = options?.ShopModels || require("../model").initShopModel(table_name);

                const {
                    ShopServiceOrderDoc,
                    ShopServiceOrderList,
                    ShopTemporaryDeliveryOrderDoc,
                    ShopTemporaryDeliveryOrderList
                } = ShopModels;

                return await db.transaction(
                    {
                        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
                        transaction: options.transaction
                    },
                    async (transaction) => {
                        const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                            where: {
                                id: shop_temporary_delivery_order_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopTemporaryDeliveryOrderDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบส่งสินค้าชั่วคราว`);
                        }
                        if (findShopTemporaryDeliveryOrderDoc.get('status') !== 1) {
                            throw new Error(`ไม่อณุญาตให้สร้างข้อมูลรายการเอกสารใบส่งสินค้าชั่วคราวเนื่องจากใบส่งสินค้าชั่วคราวได้ยกเลิกหรือลบไปแล้ว`);
                        }
                        if (!isUUID(findShopTemporaryDeliveryOrderDoc.get('shop_service_order_doc_id'))) {
                            throw new Error(`รหัสอ้างอิงเอกสารใบสั่งซ่อมของใบส่งสินค้าชั่วคราวไม่ถูกต้อง`);
                        }

                        const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                            where: {
                                id: findShopTemporaryDeliveryOrderDoc.get('shop_service_order_doc_id')
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        })
                        if (!findShopServiceOrderDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                        }
                        if (findShopServiceOrderDoc.get('status') !== 1) {
                            throw new Error(`ไม่อณุญาตให้สร้างข้อมูลรายการเอกสารใบส่งสินค้าชั่วคราวเนื่องจากใบสั่งซ่อมได้ยกเลิกหรือลบไปแล้ว`);
                        }

                        const findShopServiceOrderList = await ShopServiceOrderList.findAll({
                            where: {
                                shop_service_order_doc_id: findShopTemporaryDeliveryOrderDoc.get('shop_service_order_doc_id'),
                                status: 1
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        /**
                         * @type {Array<ShopTemporaryDeliveryOrderList>}
                         */
                        const arrCreatedShopTemporaryDeliveryOrderLists = [];
                        for (let index = 0; index < findShopServiceOrderList.length; index++) {
                            const element = findShopServiceOrderList[index];
                            const createdShopServiceOrderList = await ShopTemporaryDeliveryOrderList.create(
                                {
                                    shop_id: findShopTemporaryDeliveryOrderDoc.get('shop_id'),
                                    shop_temporary_delivery_order_doc_id: findShopTemporaryDeliveryOrderDoc.get('id'),
                                    shop_service_order_list_id: element.get('id'),
                                    seq_number: element.get('seq_number'),
                                    shop_product_id: element.get('shop_product_id'),
                                    shop_stock_id: element.get('shop_stock_id'),
                                    shop_warehouse_id: element.get('shop_warehouse_id'),
                                    shop_warehouse_shelf_item_id: element.get('shop_warehouse_shelf_item_id'),
                                    purchase_unit_id: element.get('purchase_unit_id'),
                                    dot_mfd: element.get('dot_mfd'),
                                    amount: element.get('amount'),
                                    cost_unit: element.get('cost_unit'),
                                    price_unit: element.get('price_unit'),
                                    price_discount: element.get('price_discount'),
                                    price_discount_percent: element.get('price_discount_percent'),
                                    price_grand_total: element.get('price_grand_total'),
                                    details: element.get('details'),
                                    created_by: options?.created_by || element.get('created_by'),
                                    created_date: options?.created_date || element.get('created_date') || Date.now(),
                                },
                                {
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                }
                            );
                            arrCreatedShopTemporaryDeliveryOrderLists.push(createdShopServiceOrderList);
                        }

                        return arrCreatedShopTemporaryDeliveryOrderLists;
                    }
                );
            }
        }
        /**
         * @param shop_service_order_list_id {string}
         * @param options {{ currentDateTime: Date; created_by?: string; created_date?: string | Date; ShopModels?: Object; transaction?: Transaction; }}
         * @returns {Promise<ShopTemporaryDeliveryOrderList>}
         */
        static async createFromShopTemporaryDeliveryOrderList(shop_service_order_list_id = '', options) {
            if (!shop_service_order_list_id) { throw new Error(`Require parameter 'shop_temporary_delivery_order_doc_id'`); }
            else {
                const currentDateTime = options?.currentDateTime || new Date();
                const transaction = options?.transaction || null;
                const ShopModels = options?.ShopModels || require("../model").initShopModel(table_name);

                const {
                    ShopServiceOrderDoc,
                    ShopServiceOrderList,
                    ShopTemporaryDeliveryOrderDoc,
                    ShopTemporaryDeliveryOrderList
                } = ShopModels;

                const findShopServiceOrderList = await ShopServiceOrderList.findOne({
                    where: {
                        id: shop_service_order_list_id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderList) {
                    throw new Error(`ไม่พบข้อมูลรายการใบสั่งซ่อม`);
                }
                if (findShopServiceOrderList.get('status') !== 1) {
                    throw new Error(`ไม่อณุญาตให้สร้างข้อมูลรายการใบส่งสินค้าชั่วคราวเนื่องจากรายการใบสั่งซ่อมได้ยกเลิกหรือลบไปแล้ว`);
                }

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: findShopServiceOrderList.get('shop_service_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อณุญาตให้สร้างข้อมูลรายการใบส่งสินค้าชั่วคราวเนื่องจากเอกสารใบสั่งซ่อมได้ยกเลิกหรือลบไปแล้ว`);
                }

                const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                    where: {
                        shop_service_order_doc_id: findShopServiceOrderDoc.get('shop_service_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopTemporaryDeliveryOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบส่งสินค้าชั่วคราว`);
                }
                if (findShopTemporaryDeliveryOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อณุญาตให้สร้างข้อมูลรายการใบส่งสินค้าชั่วคราวเนื่องจากเอกสารใบส่งสินค้าชั่วคราวได้ยกเลิกหรือลบไปแล้ว`);
                }

                return await ShopTemporaryDeliveryOrderList.create(
                    {
                        shop_id: findShopTemporaryDeliveryOrderDoc.get('shop_id'),
                        shop_temporary_delivery_order_doc_id: findShopTemporaryDeliveryOrderDoc.get('id'),
                        shop_service_order_list_id: findShopServiceOrderList.get('id'),
                        seq_number: findShopServiceOrderList.get('seq_number'),
                        shop_product_id: findShopServiceOrderList.get('shop_product_id'),
                        shop_stock_id: findShopServiceOrderList.get('shop_stock_id'),
                        shop_warehouse_id: findShopServiceOrderList.get('shop_warehouse_id'),
                        shop_warehouse_shelf_item_id: findShopServiceOrderList.get('shop_warehouse_shelf_item_id'),
                        purchase_unit_id: findShopServiceOrderList.get('purchase_unit_id'),
                        dot_mfd: findShopServiceOrderList.get('dot_mfd'),
                        amount: findShopServiceOrderList.get('amount'),
                        cost_unit: findShopServiceOrderList.get('cost_unit'),
                        price_unit: findShopServiceOrderList.get('price_unit'),
                        price_discount: findShopServiceOrderList.get('price_discount'),
                        price_discount_percent: findShopServiceOrderList.get('price_discount_percent'),
                        price_grand_total: findShopServiceOrderList.get('price_grand_total'),
                        details: findShopServiceOrderList.get('details'),
                        created_by: options?.created_by || findShopServiceOrderList.get('created_by'),
                        created_date: options?.created_date || findShopServiceOrderList.get('created_date') || currentDateTime,
                    },
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
        }
        /**
         *
         * @param shop_temporary_delivery_order_doc_id {string}
         * @param dataToUpdateOrCreate {Array<Object<string, *>>}
         * @param updatedBy {string}
         * @param options {{ currentDateTime: Date; ShopModels?: Object; transaction?: Transaction; }}
         * @return {Promise<{
         * createdDocs: Array<{
         *     ShopTemporaryDeliveryOrderList: {
         *          previous: Object<string, *>;
         *          current: ShopTemporaryDeliveryOrderList;
         *          changed: boolean;
         *     },
         *     ShopServiceOrderList: {
         *          previous: Object<string, *>;
         *          current: ShopServiceOrderList;
         *          changed: boolean;
         *     }
         * }>;
         * updatedDocs: Array<{
         *     ShopTemporaryDeliveryOrderList: {
         *          previous: Object<string, *>;
         *          current: ShopTemporaryDeliveryOrderList;
         *          changed: boolean;
         *     },
         *     ShopServiceOrderList: {
         *          previous: Object<string, *>;
         *          current: ShopServiceOrderList;
         *          changed: boolean;
         *     }
         * }>;
         * }>}
         */
        static async updateOrCreateShopTemporaryDeliveryOrderList(shop_temporary_delivery_order_doc_id, dataToUpdateOrCreate, updatedBy, options = {}) {
            if (!isUUID(shop_temporary_delivery_order_doc_id)) { throw new Error(`Require parameter 'shop_temporary_delivery_order_doc_id'`);}
            else if (!_.isArray(dataToUpdateOrCreate)) { throw new Error(`Require parameter 'dataToUpdateOrCreate'`);}
            else if (!isUUID(updatedBy)) { throw new Error(`Require parameter 'updatedBy'`); }
            else {
                const currentDateTime = options?.currentDateTime || new Date();
                const transaction = options?.transaction || null;
                const ShopModels = options?.ShopModels || require("../model").initShopModel(table_name);

                const {
                    ShopServiceOrderDoc,
                    ShopServiceOrderList,
                    ShopTemporaryDeliveryOrderDoc,
                    ShopTemporaryDeliveryOrderList,
                    ShopInventoryMovementLog
                } = ShopModels;

                const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                    where: {
                        id: shop_temporary_delivery_order_doc_id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopTemporaryDeliveryOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบส่งสินค้าชั่วคราว`);
                }
                if (findShopTemporaryDeliveryOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาตให้แก้ไขรายการใบสั่งสินค้าชั่วคราวเนื่องจากเอกสารใบสั่งสินค้าถูกยกเลิกหรือลบไปแล้ว`);
                }

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: findShopTemporaryDeliveryOrderDoc.get('shop_service_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบส่งสินค้าชั่วคราว`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาตให้แก้ไขรายการใบสั่งสินค้าชั่วคราวเนื่องจากเอกสารใบสั่งซ่อม/ใบสั่งขายถูกยกเลิกหรือลบไปแล้ว`);
                }

                const createdDocs = [];
                const updatedDocs = [];
                for (let index = 0; index < dataToUpdateOrCreate.length; index++) {
                    const element = dataToUpdateOrCreate[index];

                    if (!isUUID(element?.id)) {
                        const createdDoc__ShopServiceOrderList = await ShopServiceOrderList.create(
                            {
                                shop_id: findShopServiceOrderDoc.get('shop_id'),
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                seq_number: element.seq_number,
                                shop_product_id: element.shop_product_id,
                                shop_stock_id: element.shop_stock_id,
                                shop_warehouse_id: element.shop_warehouse_id,
                                shop_warehouse_shelf_item_id: element.shop_warehouse_shelf_item_id,
                                purchase_unit_id: element.purchase_unit_id,
                                dot_mfd: element.dot_mfd,
                                amount: element.amount,
                                cost_unit: element.cost_unit,
                                price_unit: element.price_unit,
                                price_discount: element.price_discount,
                                price_discount_percent: element.price_discount_percent,
                                price_grand_total: element.price_grand_total,
                                details: element.details,
                                status: 1,
                                created_by: updatedBy,
                                created_date: currentDateTime,
                                updated_by: null,
                                updated_date: null,
                                is_migrated: false
                            },
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );
                        await createdDoc__ShopServiceOrderList.reload({ transaction: transaction, ShopModels: ShopModels });

                        const createdDoc__ShopTemporaryDeliveryOrderList = await ShopTemporaryDeliveryOrderList.create(
                            {
                                shop_id: createdDoc__ShopServiceOrderList.get('shop_id'),
                                shop_temporary_delivery_order_doc_id: findShopTemporaryDeliveryOrderDoc.get('id'),
                                shop_service_order_list_id: createdDoc__ShopServiceOrderList.get('id'),
                                seq_number: createdDoc__ShopServiceOrderList.get('seq_number'),
                                shop_product_id: createdDoc__ShopServiceOrderList.get('shop_product_id'),
                                shop_stock_id: createdDoc__ShopServiceOrderList.get('shop_stock_id'),
                                shop_warehouse_id: createdDoc__ShopServiceOrderList.get('shop_warehouse_id'),
                                shop_warehouse_shelf_item_id: createdDoc__ShopServiceOrderList.get('shop_warehouse_shelf_item_id'),
                                purchase_unit_id: createdDoc__ShopServiceOrderList.get('purchase_unit_id'),
                                dot_mfd: createdDoc__ShopServiceOrderList.get('dot_mfd'),
                                amount: createdDoc__ShopServiceOrderList.get('amount'),
                                cost_unit: createdDoc__ShopServiceOrderList.get('cost_unit'),
                                price_unit: createdDoc__ShopServiceOrderList.get('price_unit'),
                                price_discount: createdDoc__ShopServiceOrderList.get('price_discount'),
                                price_discount_percent: createdDoc__ShopServiceOrderList.get('price_discount_percent'),
                                price_grand_total: createdDoc__ShopServiceOrderList.get('price_grand_total'),
                                details: createdDoc__ShopServiceOrderList.get('details'),
                                created_by: createdDoc__ShopServiceOrderList.get('created_by'),
                                created_date: createdDoc__ShopServiceOrderList.get('created_date'),
                                updated_by: createdDoc__ShopServiceOrderList.get('updated_by'),
                                updated_date: createdDoc__ShopServiceOrderList.get('updated_date')
                            },
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );
                        await createdDoc__ShopTemporaryDeliveryOrderList.reload({ transaction: transaction, ShopModels: ShopModels });

                        if (Array.isArray(createdDoc__ShopServiceOrderList?.createdDocument__ShopInventoryMovementLogs) && createdDoc__ShopServiceOrderList?.createdDocument__ShopInventoryMovementLogs?.length > 0) {
                            for (let index = 0; index < createdDoc__ShopServiceOrderList.createdDocument__ShopInventoryMovementLogs.length; index++) {
                                /**
                                 * @type {ShopInventoryMovementLog}
                                 */
                                const createdDocumentShopInventoryMovementLog = createdDoc__ShopServiceOrderList.createdDocument__ShopInventoryMovementLogs[index];
                                createdDocumentShopInventoryMovementLog.set({
                                    shop_temporary_delivery_order_doc_id: createdDoc__ShopTemporaryDeliveryOrderList.get('shop_temporary_delivery_order_doc_id'),
                                    shop_temporary_delivery_order_list_id: createdDoc__ShopTemporaryDeliveryOrderList.get('id'),
                                    details: {
                                        ...createdDocumentShopInventoryMovementLog.get('details'),
                                        documentType: 'TRN'
                                    }
                                });
                                await createdDocumentShopInventoryMovementLog.save({ transaction: transaction, ShopModels: ShopModels });
                            }
                        }

                        createdDocs.push({
                            ShopTemporaryDeliveryOrderList: {
                                previous: null,
                                current: createdDoc__ShopTemporaryDeliveryOrderList,
                                changed: true
                            },
                            ShopServiceOrderList: {
                                previous: null,
                                current: createdDoc__ShopServiceOrderList,
                                changed: true
                            }
                        });
                    }
                    else {
                        const findShopTemporaryDeliveryOrderList = await ShopTemporaryDeliveryOrderList.findOne({
                            where: {
                                id: element.id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopTemporaryDeliveryOrderList) {
                            throw new Error(`ไม่พบข้อมูลรายการใบส่งสินค้าชั่วคราว`);
                        }
                        if (findShopTemporaryDeliveryOrderList.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาตให้แก้ไขรายการใบส่งสินค้าชั่วคราวเนื่องจากใบส่งสินค้าชั่วคราวถูกยกเลิกหรือลบไปแล้ว`);
                        }
                        const previousDataValues__findShopTemporaryDeliveryOrderList = findShopTemporaryDeliveryOrderList.toJSON();

                        const findShopServiceOrderList = await ShopServiceOrderList.findOne({
                            where: {
                                id: findShopTemporaryDeliveryOrderList.get('shop_service_order_list_id')
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopServiceOrderList) {
                            throw new Error(`ไม่พบข้อมูลรายการใบสั่งซ่อม/ใบสั่งขาย`);
                        }
                        if (findShopServiceOrderList.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาตให้แก้ไขรายการใบส่งสินค้าชั่วคราวเนื่องจากใบสั่งซ่อม/ใบสั่งขายถูกยกเลิกหรือลบไปแล้ว`);
                        }
                        const previousDataValues__findShopServiceOrderList = findShopServiceOrderList.toJSON();

                        if (!_.isUndefined(element?.status)) {
                            if (Number(element.status) === 0 || Number(element.status) === 2) {
                                findShopServiceOrderList.set({
                                    status: element.status,
                                    updated_by: updatedBy,
                                    updated_date: currentDateTime
                                });
                                const updatedDoc__ShopServiceOrderList = await findShopServiceOrderList.save({ transaction: transaction, ShopModels: ShopModels });
                                await findShopServiceOrderList.reload({ transaction: transaction, ShopModels: ShopModels });

                                findShopTemporaryDeliveryOrderList.set({
                                    status: findShopServiceOrderList.get('status'),
                                    updated_by: findShopServiceOrderList.get('updated_by'),
                                    updated_date: findShopServiceOrderList.get('updated_date')
                                });
                                const updatedDoc__ShopTemporaryDeliveryOrderList = await findShopTemporaryDeliveryOrderList.save({ transaction: transaction, ShopModels: ShopModels });
                                await findShopTemporaryDeliveryOrderList.reload({ transaction: transaction, ShopModels: ShopModels });

                                if (Array.isArray(updatedDoc__ShopServiceOrderList?.createdDocument__ShopInventoryMovementLogs) && updatedDoc__ShopServiceOrderList?.createdDocument__ShopInventoryMovementLogs?.length > 0) {
                                    for (let index = 0; index < updatedDoc__ShopServiceOrderList.createdDocument__ShopInventoryMovementLogs.length; index++) {
                                        /**
                                         * @type {ShopInventoryMovementLog}
                                         */
                                        const createdDocumentShopInventoryMovementLog = updatedDoc__ShopServiceOrderList.createdDocument__ShopInventoryMovementLogs[index];
                                        createdDocumentShopInventoryMovementLog.set({
                                            shop_temporary_delivery_order_doc_id: updatedDoc__ShopTemporaryDeliveryOrderList.get('shop_temporary_delivery_order_doc_id'),
                                            shop_temporary_delivery_order_list_id: updatedDoc__ShopTemporaryDeliveryOrderList.get('id'),
                                            details: {
                                                ...createdDocumentShopInventoryMovementLog.get('details'),
                                                documentType: 'TRN'
                                            }
                                        });
                                        await createdDocumentShopInventoryMovementLog.save({ transaction: transaction, ShopModels: ShopModels });
                                    }
                                }

                                updatedDocs.push({
                                    ShopTemporaryDeliveryOrderList: {
                                        previous: previousDataValues__findShopTemporaryDeliveryOrderList,
                                        current: await findShopTemporaryDeliveryOrderList.reload({ transaction: transaction, ShopModels: ShopModels }),
                                        changed: true
                                    },
                                    ShopServiceOrderList: {
                                        previous: previousDataValues__findShopServiceOrderList,
                                        current: await findShopServiceOrderList.reload({ transaction: transaction, ShopModels: ShopModels }),
                                        changed: true
                                    }
                                });
                                continue;
                            }
                        }

                        /**
                         * @type {Object<string, *>}
                         */
                        const newDataToUpdate__ShopServiceOrderList = {};
                        if (!_.isUndefined(element?.seq_number)) {
                            newDataToUpdate__ShopServiceOrderList.seq_number = element.seq_number;
                        }
                        if (!_.isUndefined(element?.shop_product_id)) {
                            newDataToUpdate__ShopServiceOrderList.shop_product_id = element.shop_product_id;
                        }
                        if (!_.isUndefined(element?.shop_stock_id)) {
                            newDataToUpdate__ShopServiceOrderList.shop_stock_id = element.shop_stock_id;
                        }
                        if (!_.isUndefined(element?.shop_warehouse_id)) {
                            newDataToUpdate__ShopServiceOrderList.shop_warehouse_id = element.shop_warehouse_id;
                        }
                        if (!_.isUndefined(element?.shop_warehouse_shelf_item_id)) {
                            newDataToUpdate__ShopServiceOrderList.shop_warehouse_shelf_item_id = element.shop_warehouse_shelf_item_id;
                        }
                        if (!_.isUndefined(element?.purchase_unit_id)) {
                            newDataToUpdate__ShopServiceOrderList.purchase_unit_id = element.purchase_unit_id;
                        }
                        if (!_.isUndefined(element?.dot_mfd)) {
                            newDataToUpdate__ShopServiceOrderList.dot_mfd = element.dot_mfd;
                        }
                        if (!_.isUndefined(element?.amount)) {
                            newDataToUpdate__ShopServiceOrderList.amount = element.amount;
                        }
                        if (!_.isUndefined(element?.cost_unit)) {
                            newDataToUpdate__ShopServiceOrderList.cost_unit = element.cost_unit;
                        }
                        if (!_.isUndefined(element?.price_unit)) {
                            newDataToUpdate__ShopServiceOrderList.price_unit = element.price_unit;
                        }
                        if (!_.isUndefined(element?.price_discount)) {
                            newDataToUpdate__ShopServiceOrderList.price_discount = element.price_discount;
                        }
                        if (!_.isUndefined(element?.price_discount_percent)) {
                            newDataToUpdate__ShopServiceOrderList.price_discount_percent = element.price_discount_percent;
                        }
                        if (!_.isUndefined(element?.price_grand_total)) {
                            newDataToUpdate__ShopServiceOrderList.price_grand_total = element.price_grand_total;
                        }
                        if (!_.isUndefined(element?.details)) {
                            newDataToUpdate__ShopServiceOrderList.details = element.details;
                        }

                        if (_.keys(newDataToUpdate__ShopServiceOrderList).length > 0) {
                            newDataToUpdate__ShopServiceOrderList.updated_by = updatedBy;
                            newDataToUpdate__ShopServiceOrderList.updated_date = currentDateTime;

                            findShopServiceOrderList.set(newDataToUpdate__ShopServiceOrderList);
                            const updatedDoc__ShopServiceOrderList = await findShopServiceOrderList.save({ transaction: transaction, ShopModels: ShopModels });
                            await findShopServiceOrderList.reload({ transaction: transaction, ShopModels: ShopModels });

                            /**
                             * @type {Object<string, *>}
                             */
                            const newDataToUpdate__ShopTemporaryDeliveryOrderList = {};
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.seq_number = findShopServiceOrderList.get('seq_number');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.shop_product_id = findShopServiceOrderList.get('shop_product_id');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.shop_stock_id = findShopServiceOrderList.get('shop_stock_id');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.shop_warehouse_id = findShopServiceOrderList.get('shop_warehouse_id');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.shop_warehouse_shelf_item_id = findShopServiceOrderList.get('shop_warehouse_shelf_item_id');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.purchase_unit_id = findShopServiceOrderList.get('purchase_unit_id');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.dot_mfd = findShopServiceOrderList.get('dot_mfd');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.amount = findShopServiceOrderList.get('amount');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.cost_unit = findShopServiceOrderList.get('cost_unit');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.price_unit = findShopServiceOrderList.get('price_unit');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.price_discount = findShopServiceOrderList.get('price_discount');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.price_discount_percent = findShopServiceOrderList.get('price_discount_percent');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.price_grand_total = findShopServiceOrderList.get('price_grand_total');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.details = findShopServiceOrderList.get('details');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.updated_by = findShopServiceOrderList.get('updated_by');
                            newDataToUpdate__ShopTemporaryDeliveryOrderList.updated_date = findShopServiceOrderList.get('updated_date');

                            findShopTemporaryDeliveryOrderList.set(newDataToUpdate__ShopTemporaryDeliveryOrderList);
                            const updatedDoc__ShopTemporaryDeliveryOrderList = await findShopTemporaryDeliveryOrderList.save({ transaction: transaction, ShopModels: ShopModels });
                            await findShopTemporaryDeliveryOrderList.reload({ transaction: transaction, ShopModels: ShopModels });

                            if (Array.isArray(updatedDoc__ShopServiceOrderList?.createdDocument__ShopInventoryMovementLogs) && updatedDoc__ShopServiceOrderList?.createdDocument__ShopInventoryMovementLogs?.length > 0) {
                                for (let index = 0; index < updatedDoc__ShopServiceOrderList.createdDocument__ShopInventoryMovementLogs.length; index++) {
                                    /**
                                     * @type {ShopInventoryMovementLog}
                                     */
                                    const createdDocumentShopInventoryMovementLog = updatedDoc__ShopServiceOrderList.createdDocument__ShopInventoryMovementLogs[index];
                                    createdDocumentShopInventoryMovementLog.set({
                                        shop_temporary_delivery_order_doc_id: updatedDoc__ShopTemporaryDeliveryOrderList.get('shop_temporary_delivery_order_doc_id'),
                                        shop_temporary_delivery_order_list_id: updatedDoc__ShopTemporaryDeliveryOrderList.get('id'),
                                        details: {
                                            ...createdDocumentShopInventoryMovementLog.get('details'),
                                            documentType: 'TRN'
                                        }
                                    });
                                    await createdDocumentShopInventoryMovementLog.save({ transaction: transaction, ShopModels: ShopModels });
                                }
                            }

                            updatedDocs.push({
                                ShopTemporaryDeliveryOrderList: {
                                    previous: previousDataValues__findShopTemporaryDeliveryOrderList,
                                    current: await findShopTemporaryDeliveryOrderList.reload({ transaction: transaction, ShopModels: ShopModels }),
                                    changed: true
                                },
                                ShopServiceOrderList: {
                                    previous: previousDataValues__findShopServiceOrderList,
                                    current: await findShopServiceOrderList.reload({ transaction: transaction, ShopModels: ShopModels }),
                                    changed: true
                                }
                            });
                            continue;
                        }
                        else {
                            updatedDocs.push({
                                ShopTemporaryDeliveryOrderList: {
                                    previous: findShopTemporaryDeliveryOrderList.toJSON(),
                                    current: await findShopTemporaryDeliveryOrderList.reload({ transaction: transaction, ShopModels: ShopModels }),
                                    changed: false
                                },
                                ShopServiceOrderList: {
                                    previous: findShopServiceOrderList.toJSON(),
                                    current: await findShopServiceOrderList.reload({ transaction: transaction, ShopModels: ShopModels }),
                                    changed: false
                                }
                            });
                            continue;
                        }
                    }
                }

                return {
                    createdDocs: createdDocs,
                    updatedDocs: updatedDocs
                };
            }
        }
        /**
         * ปรับปรุงขฟิวส้อมูลส่วนลดตามสัดส่วน
         * @param shop_temporary_delivery_order_doc_id {string}
         * @param options {{ ShopModels: Object; transaction: import("sequelize").Transaction; }}
         */
        static async mutationFields__ProportionDiscount (shop_temporary_delivery_order_doc_id, options = {}) {
            if (!shop_temporary_delivery_order_doc_id) { throw new Error(`Require parameter 'shop_service_order_doc_id'`); }

            const transaction = options.transaction || null;
            const ShopModels = options?.ShopModels || require("../model").initShopModel(table_name);
            const {
                ShopTemporaryDeliveryOrderDoc,
                ShopTemporaryDeliveryOrderList
            } = ShopModels;

            const findDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                where: {
                    id: shop_temporary_delivery_order_doc_id
                },
                transaction:transaction,
                ShopModels: ShopModels
            });
            if (findDoc) {
                const price_bill_discount_total = (Number(findDoc.get('price_discount_bill') || 0) + Number(findDoc.get('price_discount_before_pay') || 0)).toFixed(2);

                const findLists = await ShopTemporaryDeliveryOrderList.findAll({
                    where: {
                        shop_temporary_delivery_order_doc_id: shop_temporary_delivery_order_doc_id,
                        price_grand_total: { [Op.gte]: 0 },
                        status: 1
                    },
                    order: [['seq_number', 'ASC']],
                    transaction: transaction,
                    ShopModels: ShopModels
                });

                /**
                 * @type {{lists: {seq_number: string, proportion_discount_price: string, proportion_discount_ratio: string, objModel: ShopTemporaryDeliveryOrderList, price_grand_total: string}[], price_bill_discount: string}}
                 */
                const objBillAndLists = {
                    price_bill_discount: price_bill_discount_total,
                    lists: findLists.map(element => ({
                        seq_number: String(element.get('seq_number')),
                        price_grand_total: String(element.get('price_grand_total')),
                        proportion_discount_ratio: '0.00',
                        proportion_discount_price: '0.00',
                        objModel: element
                    }))
                };

                const calProportionDiscount = utilProportionDiscountCalculator(objBillAndLists, { toFixed: 2 });

                for (let index = 0; index < calProportionDiscount.lists.length; index++) {
                    const element = calProportionDiscount.lists[index];
                    element.objModel.set({
                        proportion_discount_ratio: element.proportion_discount_ratio,
                        proportion_discount_price: element.proportion_discount_price
                    });
                    await element.objModel.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                }
            }
        }
    }

    ShopTemporaryDeliveryOrderList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบส่งสินค้าชั่วคราว`,
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
            shop_temporary_delivery_order_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopTemporaryDeliveryOrderDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            shop_service_order_list_id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบสั่งซ่อม`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopServiceOrderList,
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
            shop_product_id: {
                comment: `รหัสตารางข้อมูลสินค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopProduct,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            shop_stock_id: {
                comment: 'รหัสหลักตารางข้อมูลสต๊อกสินค้า',
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopStock,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            shop_warehouse_id: {
                comment: 'รหัสหลักตารางข้อมูลคลังสินค้า',
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopWarehouse,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            shop_warehouse_shelf_item_id: {
                comment: 'รหัสหลักตารางข้อมูลชั้นวางในคลังสินค้า',
                type: DataTypes.STRING,
                allowNull: true
            },
            purchase_unit_id: {
                comment: `รหัสตารางข้อมูลหน่วยนับสินค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ProductPurchaseUnitType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            dot_mfd: {
                comment: `รหัสวันที่ผลิต (DOT)`,
                type: DataTypes.STRING(4),
                allowNull: true
            },
            amount: {
                comment: `จำนวนสินค้า`,
                type: DataTypes.BIGINT,
                allowNull: false,
                defaultValue: 0
            },
            cost_unit: {
                comment: `ราคาทุน/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_unit: {
                comment: `ราคาขาย/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            price_discount: {
                comment: `ส่วนลด (บาท)/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            price_discount_percent: {
                comment: `ส่วนลด (%)/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            price_grand_total: {
                comment: `จำนวนเงินสุทธิ`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            proportion_discount_ratio: {
                comment: `อัตราส่วนของส่วนลดตามสัดส่วน`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            proportion_discount_price: {
                comment: `จำนวนเงินส่วนลดตามสัดส่วน`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    meta_data: { }
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
                    model: Users,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            created_date: {
                comment: `สร้างข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal(`now()`)
            },
            updated_by: {
                comment: `ปรับปรุงข้อมูลโดย`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: Users,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
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
            modelName: 'ShopTemporaryDeliveryOrderList',
            tableName: `dat_${table_name}_temporary_delivery_order_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการใบส่งสินค้าชั่วคราว'
        }
    );

    ShopTemporaryDeliveryOrderList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopTemporaryDeliveryOrderList.belongsTo(ShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_temporary_delivery_order_doc_id', as: 'ShopTemporaryDeliveryOrderDoc' });
    ShopTemporaryDeliveryOrderList.belongsTo(ShopProduct, { foreignKey: 'shop_product_id', as: 'ShopProduct' });
    ShopTemporaryDeliveryOrderList.belongsTo(ShopWarehouse, { foreignKey: 'shop_stock_id', as: 'ShopStock' });
    ShopTemporaryDeliveryOrderList.belongsTo(ShopWarehouse, { foreignKey: 'shop_warehouse_id', as: 'ShopWarehouse' });
    ShopTemporaryDeliveryOrderList.belongsTo(ProductPurchaseUnitType, { foreignKey: 'purchase_unit_id', as: 'ProductPurchaseUnitType' });
    ShopTemporaryDeliveryOrderList.belongsTo(Users, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopTemporaryDeliveryOrderList.belongsTo(Users, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        /**
         * @param {ShopTemporaryDeliveryOrderList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopTemporaryDeliveryOrderList> | import("sequelize/types/model").SaveOptions<ShopTemporaryDeliveryOrderList>} options
         * @return {Promise<void>}
         */
        const hookBeforeSave_validatorFieldsNotAllowToEdit = async (instance, options) => {
            if (!instance.isNewRecord) {
                const fields = [
                    'id',
                    'shop_id',
                    'shop_temporary_delivery_order_doc_id',
                    'shop_service_order_list_id',
                    'created_by',
                    'created_date'
                ];
                for (let index = 0; index < fields.length; index++) {
                    const field = fields[index];
                    if (instance.changed(field)) {
                        throw new Error(`ไม่อนุญาตให้แก้ไขฟิวส์ '${field}' ได้`);
                    }
                }
            }
        };

        return {
            hookBeforeSave_validatorFieldsNotAllowToEdit
        };
    };

    ShopTemporaryDeliveryOrderList.beforeValidate((instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });
    });

    ShopTemporaryDeliveryOrderList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_validatorFieldsNotAllowToEdit(instance, options);
    });

    return ShopTemporaryDeliveryOrderList;
};


module.exports = ShopTemporaryDeliveryOrderList;