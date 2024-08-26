/**
 * A function do dynamics table of model ShopTemporaryDeliveryOrderDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_temporary_delivery_order_doc"
 */
const ShopTemporaryDeliveryOrderDoc = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Transaction, Op } = require("sequelize");
    const { isUUID } = require("../../utils/generate");
    /**
     * @type {import("@types/lodash")}
     */
    const _ = require("lodash");
    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");
    const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

    const db = require("../../db");

    const __model = require("../model");
    const User = __model.User;
    const ShopProfile = __model.ShopsProfiles;
    const DocumentType = __model.DocumentTypes;
    const TaxType = __model.TaxTypes;
    const ShopDocumentCode = __model.ShopDocumentCode(table_name);
    const ShopBusinessCustomer = __model.ShopBusinessCustomers(table_name);
    const ShopPersonalCustomer = __model.ShopPersonalCustomers(table_name);
    const ShopVehicleCustomer = __model.ShopVehicleCustomer(table_name);
    const ShopServiceOrderDoc = __model.ShopServiceOrderDoc(table_name);

    const defaultPrefixDoc = require("../../config").config_run_number_shop_temporary_delivery_order_prefix;
    const default_doc_type_code_id = 'TRN';

    class ShopTemporaryDeliveryOrderDoc extends Model {
        /**
         * สร้างใบส่งสินค้าชั่วคราวจากใบสั่งซ่อม
         * @param shop_service_order_doc_id {string}
         * @param options {{ currentDateTime?: Date; doc_date?: string | Date; created_by?: string; created_date?: string | Date; ShopModels?: Object; transaction?: Transaction; }}
         * @returns {Promise<ShopTemporaryDeliveryOrderDoc>}
         */
        static async createFromShopServiceOrderDoc(shop_service_order_doc_id, options = {}) {
            if (!shop_service_order_doc_id) { throw new Error(`Require parameter 'shop_service_order_doc_id'`); }
            else {
                const currentDateTime = options?.currentDateTime || new Date();
                const transaction = options.transaction || null;
                const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
                const {
                    ShopServiceOrderDoc
                } = ShopModels;

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: shop_service_order_doc_id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อณุญาตให้สร้างเอกสารใบส่งสินค้าชั่วคราวเนื่องจากใบสั่งซ่อมได้ยกเลิกหรือลบไปแล้ว`);
                }

                const objShopServiceOrderDoc = {
                    shop_id: findShopServiceOrderDoc.get('shop_id'),
                    doc_date: findShopServiceOrderDoc.get('doc_date'),
                    shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                    doc_sales_type: findShopServiceOrderDoc.get('doc_sales_type'),
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
                    details: findShopServiceOrderDoc.get('details'),
                    created_by: options?.created_by || findShopServiceOrderDoc.get('created_by'),
                    created_date: options?.created_date || findShopServiceOrderDoc.get('created_date') || currentDateTime
                };

                return await ShopTemporaryDeliveryOrderDoc.create(
                    objShopServiceOrderDoc,
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
        }

        /**
         * สร้างใบส่งสินค้าชั่วคราวจากใบสั่งซ่อมรวมไปถึงรายการด้วย
         * @param shop_service_order_doc_id {string}
         * @param options {{ currentDateTime?: Date; updated_date?: Date; ShopModels?: Object; transaction?: Transaction; }}
         * @returns {Promise<{ShopTemporaryDeliveryOrderDoc: ShopTemporaryDeliveryOrderDoc; ShopTemporaryDeliveryOrderLists: Array<ShopTemporaryDeliveryOrderList>;}>}
         */
        static async createShopTemporaryDeliveryOrderDocAndLists(shop_service_order_doc_id, options = {}) {
            if (!shop_service_order_doc_id) { throw new Error(`Require parameter 'shop_service_order_doc_id'`); }
            else {
                const currentDateTime = options?.currentDateTime || new Date();
                const transaction = options?.transaction || null;
                const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
                const {
                    ShopServiceOrderDoc,
                    ShopTemporaryDeliveryOrderList,
                    ShopTemporaryDeliveryOrderDoc
                } = ShopModels;

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: shop_service_order_doc_id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อณุญาตให้สร้างเอกสารใบส่งสินค้าชั่วคราวเนื่องจากใบสั่งซ่อมได้ยกเลิกหรือลบไปแล้ว`);
                }

                const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findAll({
                    where: {
                        shop_service_order_doc_id: shop_service_order_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (findShopTemporaryDeliveryOrderDoc.length > 0) {
                    throw new Error(`ไม่อนุญาตให้สร้างเอกสารใบส่งสินค้าชั่วคราว 1 เอกสาร, กรุณายกเลิกเอกสารใบส่งสินค้าชั่วคราวก่อนหน้านี้`);
                }

                const createdShopTemporaryDeliveryOrderDoc = await this.createFromShopServiceOrderDoc(
                    shop_service_order_doc_id,
                    {
                        created_by: options?.created_by,
                        created_date: options?.created_date || currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                const createdShopTemporaryDeliveryOrderLists = await ShopTemporaryDeliveryOrderList.createFromShopTemporaryDeliveryOrderDoc(
                    createdShopTemporaryDeliveryOrderDoc.get('id'),
                    {
                        created_by: createdShopTemporaryDeliveryOrderDoc.get('created_by'),
                        created_date: createdShopTemporaryDeliveryOrderDoc.get('created_date'),
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                return {
                    ShopTemporaryDeliveryOrderDoc: createdShopTemporaryDeliveryOrderDoc,
                    ShopTemporaryDeliveryOrderLists: createdShopTemporaryDeliveryOrderLists
                };
            }
        }

        /**
         * แก้ไขใบส่งสินค้าชั่วคราวและจะทำกับใบสั่งซ่อมด้วย
         * @param shop_temporary_delivery_order_doc_id {string}
         * @param dataToUpdate {Object<string, any>}
         * @param updatedBy {string}
         * @param options {{ currentDateTime?: Date; ShopModels?: Object; transaction?: Transaction; }}
         * @return {Promise<{
         * ShopServiceOrderDoc: {current: ShopServiceOrderDoc, previous: Object<string, *>, changed: boolean},
         * ShopTemporaryDeliveryOrderDoc: {current: ShopTemporaryDeliveryOrderDoc, previous: Object<string, *>, changed: boolean}
         * }>}
         */
        static async updateShopTemporaryDeliveryOrderDoc(shop_temporary_delivery_order_doc_id, dataToUpdate, updatedBy, options = {}) {
            if (!shop_temporary_delivery_order_doc_id) { throw new Error(`Require parameter 'shop_service_order_doc_id'`); }
            else if (!_.isPlainObject(dataToUpdate)) { throw new Error(`Require parameter 'dataToUpdate'`);}
            else if (!isUUID(updatedBy)) { throw new Error(`Require parameter 'updatedBy'`); }
            else {
                const currentDateTime = options?.currentDateTime || new Date();
                const transaction = options?.transaction || null;
                const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
                const {
                    ShopTemporaryDeliveryOrderDoc,
                    ShopServiceOrderDoc
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
                    throw new Error(`ไม่อนุญาตให้แก้ไขสถาณะเอกสารใบส่งขสินค้าชั่วคราวเนื่องจากเอกสารใบส่งสินค้าชั่วคราวได้ยกเลิกหรือลบไปแล้ว`)
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
                    throw new Error(`ไม่อนุญาตให้แก้ไขสถาณะเอกสารใบส่งขสินค้าชั่วคราวเนื่องจากเอกสารใบสั่งซ่อม/ใบส่งสินค้าได้ยกเลิกหรือลบไปแล้ว`)
                }

                /**
                 * @type {Object<string, any>}
                 */
                const newDataToUpdate__ShopServiceOrderDoc = {};
                if (!_.isUndefined(dataToUpdate?.bus_customer_id)) {
                    newDataToUpdate__ShopServiceOrderDoc.bus_customer_id = dataToUpdate.bus_customer_id;
                }
                if (!_.isUndefined(dataToUpdate?.per_customer_id)) {
                    newDataToUpdate__ShopServiceOrderDoc.per_customer_id = dataToUpdate.per_customer_id;
                }
                if (!_.isUndefined(dataToUpdate?.vehicle_customer_id)) {
                    newDataToUpdate__ShopServiceOrderDoc.vehicle_customer_id = dataToUpdate.vehicle_customer_id;
                }
                if (!_.isUndefined(dataToUpdate?.tax_type_id)) {
                    newDataToUpdate__ShopServiceOrderDoc.tax_type_id = dataToUpdate.tax_type_id;
                }
                if (!_.isUndefined(dataToUpdate?.doc_date)) {
                    newDataToUpdate__ShopServiceOrderDoc.doc_date = dataToUpdate.doc_date;
                }
                if (!_.isUndefined(dataToUpdate?.vat_rate)) {
                    newDataToUpdate__ShopServiceOrderDoc.vat_rate = dataToUpdate.vat_rate;
                }
                if (!_.isUndefined(dataToUpdate?.price_discount_bill)) {
                    newDataToUpdate__ShopServiceOrderDoc.price_discount_bill = dataToUpdate.price_discount_bill;
                }
                if (!_.isUndefined(dataToUpdate?.price_discount_before_pay)) {
                    newDataToUpdate__ShopServiceOrderDoc.price_discount_before_pay = dataToUpdate.price_discount_before_pay;
                }
                if (!_.isUndefined(dataToUpdate?.price_sub_total)) {
                    newDataToUpdate__ShopServiceOrderDoc.price_sub_total = dataToUpdate.price_sub_total;
                }
                if (!_.isUndefined(dataToUpdate?.price_discount_total)) {
                    newDataToUpdate__ShopServiceOrderDoc.price_discount_total = dataToUpdate.price_discount_total;
                }
                if (!_.isUndefined(dataToUpdate?.price_amount_total)) {
                    newDataToUpdate__ShopServiceOrderDoc.price_amount_total = dataToUpdate.price_amount_total;
                }
                if (!_.isUndefined(dataToUpdate?.price_before_vat)) {
                    newDataToUpdate__ShopServiceOrderDoc.price_before_vat = dataToUpdate.price_before_vat;
                }
                if (!_.isUndefined(dataToUpdate?.price_vat)) {
                    newDataToUpdate__ShopServiceOrderDoc.price_vat = dataToUpdate.price_vat;
                }
                if (!_.isUndefined(dataToUpdate?.price_grand_total)) {
                    newDataToUpdate__ShopServiceOrderDoc.price_grand_total = dataToUpdate.price_grand_total;
                }
                if (!_.isUndefined(dataToUpdate?.details)) {
                    newDataToUpdate__ShopServiceOrderDoc.details = dataToUpdate.details;
                }

                if (_.keys(newDataToUpdate__ShopServiceOrderDoc).length > 0) {
                    newDataToUpdate__ShopServiceOrderDoc.updated_by = updatedBy;
                    newDataToUpdate__ShopServiceOrderDoc.updated_date = currentDateTime;

                    const previousDataValues__findShopServiceOrderDoc = findShopServiceOrderDoc.toJSON();
                    findShopServiceOrderDoc.set(newDataToUpdate__ShopServiceOrderDoc);
                    await findShopServiceOrderDoc.save({ transaction: transaction, ShopModels: ShopModels });
                    await findShopServiceOrderDoc.reload({ transaction: transaction, ShopModels: ShopModels });

                    /**
                     * @type {Object<string, any>}
                     */
                    const newDataToUpdate__ShopTemporaryDeliveryOrderDoc = {};
                    if (!_.isUndefined(dataToUpdate?.is_draft)) {
                        newDataToUpdate__ShopTemporaryDeliveryOrderDoc.is_draft = dataToUpdate.is_draft;
                    }
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.bus_customer_id = findShopServiceOrderDoc.get('bus_customer_id');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.per_customer_id = findShopServiceOrderDoc.get('per_customer_id');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.vehicle_customer_id = findShopServiceOrderDoc.get('vehicle_customer_id');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.tax_type_id = findShopServiceOrderDoc.get('tax_type_id');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.doc_date = findShopServiceOrderDoc.get('doc_date');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.vat_rate = findShopServiceOrderDoc.get('vat_rate');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.price_discount_bill = findShopServiceOrderDoc.get('price_discount_bill');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.price_discount_before_pay = findShopServiceOrderDoc.get('price_discount_before_pay');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.price_sub_total = findShopServiceOrderDoc.get('price_sub_total');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.price_discount_total = findShopServiceOrderDoc.get('price_discount_total');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.price_amount_total = findShopServiceOrderDoc.get('price_amount_total');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.price_before_vat = findShopServiceOrderDoc.get('price_before_vat');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.price_vat = findShopServiceOrderDoc.get('price_vat');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.price_grand_total = findShopServiceOrderDoc.get('price_grand_total');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.details = findShopServiceOrderDoc.get('details');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.updated_by = findShopServiceOrderDoc.get('updated_by');
                    newDataToUpdate__ShopTemporaryDeliveryOrderDoc.updated_date = findShopServiceOrderDoc.get('updated_date');

                    const previousDataValues__findShopTemporaryDeliveryOrderDoc = findShopTemporaryDeliveryOrderDoc.toJSON();
                    findShopTemporaryDeliveryOrderDoc.set(newDataToUpdate__ShopTemporaryDeliveryOrderDoc);
                    await findShopTemporaryDeliveryOrderDoc.save({ transaction: transaction, ShopModels: ShopModels });
                    await findShopTemporaryDeliveryOrderDoc.reload({ transaction: transaction, ShopModels: ShopModels });

                    return {
                        ShopTemporaryDeliveryOrderDoc: {
                            previous: previousDataValues__findShopTemporaryDeliveryOrderDoc,
                            current: findShopTemporaryDeliveryOrderDoc,
                            changed: true
                        },
                        ShopServiceOrderDoc: {
                            previous: previousDataValues__findShopServiceOrderDoc,
                            current: findShopServiceOrderDoc,
                            changed: true
                        },
                    };
                }
                else {
                    return {
                        ShopTemporaryDeliveryOrderDoc: {
                            previous: findShopServiceOrderDoc.toJSON(),
                            current: findShopServiceOrderDoc,
                            changed: false
                        },
                        ShopServiceOrderDoc: {
                            previous: findShopTemporaryDeliveryOrderDoc.toJSON(),
                            current: findShopTemporaryDeliveryOrderDoc,
                            changed: false
                        },
                    };
                }
            }
        }
    }

    ShopTemporaryDeliveryOrderDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว`,
                type: DataTypes.UUID,
                defaultValue: literal('uuid_generate_v4()'),
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
            code_id: {
                comment: `รหัสเลขที่เอกสาร`,
                type: DataTypes.STRING,
                allowNull: false
            },
            code_id_prefix: {
                comment: `รหัสนำหน้าเลขที่เอกสาร`,
                type: DataTypes.STRING,
                allowNull: true
            },
            doc_type_id: {
                comment: `รหัสตารางข้อมูลประเภทเอกสาร`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: DocumentType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            doc_type_code_id: {
                comment: 'รหัสประเภทเอกสาร',
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: default_doc_type_code_id
            },
            doc_sales_type: {
                comment: 'ประเภทการขาย' +
                    '\n1 = ขายปลีก' +
                    '\n2 = ขายส่ง',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[0, 1, 2]]
                }
            },
            doc_date: {
                comment: `วันที่เอกสาร`,
                type: DataTypes.DATEONLY,
                allowNull: false
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
                onDelete: 'CASCADE'
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
                onDelete: 'SET NULL'
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
                onDelete: 'SET NULL'
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
                onDelete: 'SET NULL'
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
                onDelete: 'SET NULL'
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
            is_draft: {
                comment: 'เอกสารนี้เป็นฉบับบันทึกร่าง หรือฉบับจริง',
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    ref_doc: '',
                    meta_data: {
                        ShopBusinessCustomer: null,
                        ShopPersonalCustomer: null,
                        ShopVehicleCustomer: null,
                        customer_name: {
                            prefix_name: null,
                            first_name: null,
                            last_name: null,
                        },
                        customer_contract_name: null,
                        customer_vehicle_reg_plate: null,
                        customer_vehicle_reg_plate_province_name: null,
                        old_mileage: null,
                        new_mileage: null,
                        average_mileage: null,
                    }
                }
            },
            status: {
                comment: 'สถานะเอกสาร' +
                    '\n0 = ลบเอกสาร' +
                    '\n1 = ใช้งานเอกสาร' +
                    '\n2 = ยกเลิกเอกสาร',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2]]
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
                onDelete: 'SET NULL'
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
            modelName: 'ShopTemporaryDeliveryOrderDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_temporary_delivery_order_doc`,
            comment: 'ตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว',
            timestamps: false
        }
    );

    ShopTemporaryDeliveryOrderDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(ShopServiceOrderDoc, { foreignKey: 'shop_service_order_doc_id', as: 'ShopServiceOrderDoc' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(ShopVehicleCustomer, { foreignKey: 'vehicle_customer_id', as: 'ShopVehicleCustomer' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopServiceOrderDoc,
            ShopPaymentTransaction,
            ShopCustomerDebtDoc,
            ShopCustomerDebtList
        } = ShopModels;

        /**
         * @param {ShopTemporaryDeliveryOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validatorIsDraft = (instance, options) => {
            if (!instance.isNewRecord && instance.changed('is_draft')) {
                if (instance.previous('is_draft') === false && instance.get('is_draft') === true) {
                    throw new Error('ไม่อนุญาติให้เปลี่ยนเอกสารฉบับจริงเป็นฉบับร่าง');
                }
            }
        };

        /**
         * @param {ShopTemporaryDeliveryOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validatorNotAllowedToCancelDocFromCanceledDoc = (instance, options) => {
            if (!instance.isNewRecord && instance.changed('status')) {
                if (instance.previous('status') !== 1) {
                    throw new Error(`ไม่อนุญาตให้ยกเลิกเอกสารหรือลบใบส่งของชั่วคราวเนื่องจากถูกยกเลิกหรือลบไปแล้ว`);
                }
            }
        };

        /**
         * @param {ShopTemporaryDeliveryOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDocRunNumber = (instance, options) => {
            if (instance.isNewRecord) {
                instance.set('code_id', default_doc_type_code_id);
            }
        };

        /**
         * Setter พารามิเตอร์ options.isCancelStatus_Doc ถ้ามีการยกเลิกเอกสาร
         * @param {ShopTemporaryDeliveryOrderDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopTemporaryDeliveryOrderDoc> | import("sequelize/types/model").SaveOptions<ShopTemporaryDeliveryOrderDoc>} options
         */
        const hookBeforeSave_setOptionsDocumentIsCancelStatus = async (instance, options) => {
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') === 0) {
                options.isCancelStatus_Doc = true;
            }
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') === 2) {
                options.isCancelStatus_Doc = true;
            }
        };

        /**
         * ตรวจสอบเอกสารอื่น ๆ ที่เรียกใช้งานถ้ามีการยกเลิกเอกสารนี้
         * @param {ShopTemporaryDeliveryOrderDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopTemporaryDeliveryOrderDoc> | import("sequelize/types/model").SaveOptions<ShopTemporaryDeliveryOrderDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) {
                const transaction = options?.transaction || null;

                /**
                 * @type {string[]}
                 */
                const activeDocs = [];

                const findShopCustomerDebtLists = await ShopCustomerDebtList.findAll({
                    attributes: ['id', 'shop_customer_debt_doc_id', 'seq_number'],
                    where: {
                        shop_temporary_delivery_order_doc_id: instance.get('id'),
                        status: 1
                    },
                    transaction: transaction
                });
                if (findShopCustomerDebtLists.length > 0) {
                    for (let i = 0; i < findShopCustomerDebtLists.length; i++) {
                        const findShopCustomerDebtList = findShopCustomerDebtLists[i];
                        const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                            attributes: ['id', 'code_id'],
                            where: {
                                id: findShopCustomerDebtLists.get('shop_customer_debt_doc_id'),
                                status: 1
                            },
                            transaction: transaction
                        });
                        if (findShopCustomerDebtDoc) {
                            activeDocs.push(`[เลขที่เอกสารลูกหนี้การค้า (${findShopCustomerDebtDoc.get('code_id')}), รายการที่ (${findShopCustomerDebtList.get('seq_number')})]`);
                        }
                    }
                }

                if (activeDocs.length > 0) {
                    throw new Error(`ไม่สามารถยกเลิกเอกสารใบส่งสินค้าชั่วคราวได้ กรุณายกเลิกเอกสารเหล่านี้ก่อน: ${activeDocs}`);
                }
            }
        };

        /**
         * @param {ShopTemporaryDeliveryOrderDoc} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const hookBeforeSave_mutationDocRunNumber = async (instance, options) => {
            const transaction = options?.transaction || null;

            if (instance.isNewRecord) { // กรณีสร้างเอกสารใหม่
                const objPrefixDocCode = await utilGetDocumentTypePrefix(
                    instance.get('doc_type_id') || null,
                    {
                        transaction: transaction,
                        defaultPrefix: defaultPrefixDoc
                    }
                );
                instance.set('code_id_prefix', `0${objPrefixDocCode.prefix ? '-' + objPrefixDocCode.prefix : ''}`);

                const createdShopDocumentCode = await ShopDocumentCode.create(
                    {
                        shop_id: instance.get('shop_id'),
                        doc_type_code: instance.get('code_id_prefix')
                    },
                    {
                        transaction: transaction
                    }
                );
                instance.set('code_id', createdShopDocumentCode.get('code_id'));
                return;
            }

            if (
                !instance.isNewRecord
                && instance.changed('is_draft')
                && instance.previous('is_draft') === true
                && instance.get('is_draft') === false
            ) { // กรณีปรับเอกสารร่าง ให้เป็นเอกสารฉบับจริง
                const objPrefixDocCode = await utilGetDocumentTypePrefix(
                    instance.get('doc_type_id') || null,
                    {
                        transaction: transaction,
                        defaultPrefix: defaultPrefixDoc
                    }
                );
                instance.set('code_id_prefix', `${objPrefixDocCode.prefix ? objPrefixDocCode.prefix : ''}`);

                const createdShopDocumentCode = await ShopDocumentCode.create(
                    {
                        shop_id: instance.get('shop_id'),
                        doc_type_code: `${objPrefixDocCode.prefix ? objPrefixDocCode.prefix : ''}`,
                    },
                    {
                        transaction: transaction
                    }
                );

                instance.set({
                    details: {
                        ...(instance.get('details') || {}),
                        data_TRN: {
                            ...((instance.get('details') || {})?. data_TRN || {}),
                            ref_draft_code_id: instance.get('code_id')
                        }
                    }
                });
                instance.set('code_id', createdShopDocumentCode.get('code_id'));
                return;
            }
        };

        /**
         * @param {ShopTemporaryDeliveryOrderDoc} instance
         * @param {import("sequelize/types/model").CreateOptions<ShopTemporaryDeliveryOrderDoc>} options
         */
        const hookBeforeSave_validatorShopServiceOrderDoc = async (instance, options) => {
            const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                where: {
                    id: instance.get('shop_service_order_doc_id')
                },
                transaction: options.transaction
            });
            if (!findShopServiceOrderDoc) {
                throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
            }

            if (instance.isNewRecord) {
                if (findShopServiceOrderDoc.get('is_draft') === true) {
                    throw new Error('ไม่อนุญาติให้สร้างใบส่งสินค้าชั่วคราวในขณะที่ใบสั่งซ่อมเป็นฉบับร่าง');
                }
            }
        };

        /**
         * @param {ShopTemporaryDeliveryOrderDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopTemporaryDeliveryOrderDoc> | import("sequelize/types/model").SaveOptions<ShopTemporaryDeliveryOrderDoc>} options
         * @return {Promise<void>}
         */
        const hookBeforeSave_mutationWhenThisDocumentSetToCancel = async (instance, options) => {
            if (!instance.isNewRecord
                && instance.changed('status')
                && instance.previous('status') === 1
                && (
                    instance.get('status') === 0
                    || instance.get('status') === 2
                )
            ) {
                const transaction = options?.transaction || null;

                const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                    where: {
                        shop_temporary_delivery_order_doc_id: instance.get('id'),
                        [Op.or]: [
                            {
                                canceled_payment_by: null
                            },
                            {
                                canceled_payment_date: null
                            }
                        ]
                    },
                    transaction: transaction
                });

                for (let index = 0; index < findShopPaymentTransactions.length; index++) {
                    const element = findShopPaymentTransactions[index];
                    element.set({
                        canceled_payment_by: instance.get('updated_by'),
                        canceled_payment_date: instance.get('updated_date'),
                        details: {
                            ...(element.get('details')),
                            canceled_payment_reasons: 'ยกเลิกเอกสารใบส่งสินค้าชั่วคราว',
                        },
                        updated_by: instance.get('updated_by'),
                        updated_date: instance.get('updated_date')
                    });
                    await element.save({ transaction: transaction, ShopModels: ShopModels });
                }
            }
        };

        return {
            hookBeforeValidate_validatorIsDraft,
            hookBeforeValidate_validatorNotAllowedToCancelDocFromCanceledDoc,
            hookBeforeValidate_serializerDocRunNumber,
            hookBeforeSave_setOptionsDocumentIsCancelStatus,
            hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel,
            hookBeforeSave_mutationDocRunNumber,
            hookBeforeSave_validatorShopServiceOrderDoc,
            hookBeforeSave_mutationWhenThisDocumentSetToCancel
        };
    };

    ShopTemporaryDeliveryOrderDoc.beforeValidate((instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels || null });

        instance.myHookFunctions.hookBeforeValidate_validatorIsDraft(instance, options);
        instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
        instance.myHookFunctions.hookBeforeValidate_validatorNotAllowedToCancelDocFromCanceledDoc(instance, options);
    });

    ShopTemporaryDeliveryOrderDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel(instance, options);
        await instance.myHookFunctions.hookBeforeSave_validatorShopServiceOrderDoc(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationWhenThisDocumentSetToCancel(instance, options);
    });

    return ShopTemporaryDeliveryOrderDoc;
};


module.exports = ShopTemporaryDeliveryOrderDoc;