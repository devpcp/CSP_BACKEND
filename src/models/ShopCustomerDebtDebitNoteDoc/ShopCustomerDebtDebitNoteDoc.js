/**
 * A function do dynamics table of model ShopCustomerDebtDebitNoteDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_customer_debt_dn_doc"
 */
const ShopCustomerDebtDebitNoteDoc = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const { isUUID } = require("../../utils/generate");
    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");
    const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const __model = require("../model");
    const User = __model.User;
    const ShopProfile = __model.ShopsProfiles;
    const DocumentType = __model.DocumentTypes;
    const ShopDocumentCode = __model.ShopDocumentCode(table_name);
    const ShopBusinessCustomer = __model.ShopBusinessCustomers(table_name);
    const ShopPersonalCustomer = __model.ShopPersonalCustomers(table_name);
    const ShopTemporaryDeliveryOrderDoc = __model.ShopTemporaryDeliveryOrderDoc(table_name);
    const TaxType = __model.TaxTypes;

    const default_doc_type_code_id = 'CDN';

    class ShopCustomerDebtDebitNoteDoc extends Model {
        static async createShopCustomerDebtDebitNote_Doc (shopId = null, userId = null, shopCustomerDebtDebitNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopCustomerDebtDebitNoteDoc) { throw new Error(`Require parameter shopCustomerDebtDebitNoteDoc must be object`); }

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
                ShopCustomerDebtDebitNoteDoc
            } = ShopModels;

            const objToCreate = {
                ...shopCustomerDebtDebitNoteDoc,
                shop_id: shopId,
                status: 1,
                created_by: userId,
                created_date: currentDateTime,
                updated_by: null,
                updated_date: null
            };

            delete objToCreate.id;
            delete objToCreate.code_id;
            delete objToCreate.code_id_prefix;
            delete objToCreate.doc_type_code_id;

            const createdDocument = ShopCustomerDebtDebitNoteDoc.create(
                objToCreate,
                {
                    validate: true,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            return createdDocument;
        }

        static async updateShopCustomerDebtDebitNote_Doc (shopId = null, userId = null, shopCustomerDebtDebitNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopCustomerDebtDebitNoteDoc) { throw new Error(`Require parameter shopCustomerDebtDebitNoteDoc must be object`); }

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
                ShopCustomerDebtDebitNoteDoc
            } = ShopModels;

            const findDocument = await ShopCustomerDebtDebitNoteDoc.findOne({
                where: {
                    id: shopCustomerDebtDebitNoteDoc.id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findDocument) { throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้าจากการแก้ไขเอกสาร`); }
            else {
                const prevData = findDocument.toJSON();

                let objToUpdate = {
                    updated_by: userId,
                    updated_date: currentDateTime
                };

                if (findDocument.previous('status') === 1 && (shopCustomerDebtDebitNoteDoc?.status === 0 || shopCustomerDebtDebitNoteDoc?.status === 2)) {
                    return await ShopCustomerDebtDebitNoteDoc.cancelShopCustomerDebtDebitNote_Doc(
                        shopId,
                        userId,
                        findDocument.get('id'),
                        {
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );
                }
                else {
                    objToUpdate = {
                        ...shopCustomerDebtDebitNoteDoc,
                        updated_by: userId,
                        updated_date: currentDateTime
                    };
                    delete objToUpdate.id;
                    delete objToUpdate.shop_id;
                    delete objToUpdate.code_id;
                    delete objToUpdate.code_id_prefix;
                    delete objToUpdate.doc_type_id;
                    delete objToUpdate.doc_type_code_id;
                    delete objToUpdate.created_by;
                    delete objToUpdate.created_date;
                }

                findDocument.set(objToUpdate);

                await findDocument.save({
                    validate: true,
                    transaction: transaction,
                    ShopModels: ShopModels
                });

                return {
                    previousData: prevData,
                    currentData: await findDocument.reload({ transaction: transaction, ShopModels: ShopModels })
                };
            }
        }

        static async cancelShopCustomerDebtDebitNote_Doc (shopId = null, userId = null, shop_customer_debt_dn_doc_id = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!isUUID(shop_customer_debt_dn_doc_id)) { throw new Error(`Require parameter shop_customer_debt_dn_doc_id must be UUID`); }

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
                ShopCustomerDebtDebitNoteDoc
            } = ShopModels;

            const findDocument = await ShopCustomerDebtDebitNoteDoc.findOne({
                where: {
                    id: shop_customer_debt_dn_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findDocument) { throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้าจากการยกเลิก`); }
            else {
                if (findDocument.get('status') !== 1) { throw new Error(`ไม่สามารถยกเลิกเอกสารใบเพิ่มหนี้ของลูกหนี้การค้าได้เนื่องจากได้ยกเลิกไปก่อนแล้ว`); }

                const prevData = findDocument.toJSON();

                let objToUpdate = {
                    status: 2,
                    updated_by: userId,
                    updated_date: currentDateTime
                };

                findDocument.set(objToUpdate);

                await findDocument.save({
                    validate: true,
                    transaction: transaction,
                    ShopModels: ShopModels,
                    isCancelStatus_Doc: true
                });

                return {
                    previousData: prevData,
                    currentData: await findDocument.reload({ transaction: transaction, ShopModels: ShopModels })
                };
            }
        }

        static async createOrUpdateShopCustomerDebtDebitNote_Doc_Lists (shopId = null, userId = null, shopCustomerDebtDebitNoteDoc = null, shopCustomerDebtDebitNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopCustomerDebtDebitNoteDoc) { throw new Error(`Require parameter shopCustomerDebtDebitNoteDoc must be object`); }
            if (!Array.isArray(shopCustomerDebtDebitNoteLists)) { throw new Error(`Require parameter shopCustomerDebtDebitNoteDoc must be array`); }

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
                ShopCustomerDebtDebitNoteDoc,
                ShopCustomerDebtDebitNoteList
            } = ShopModels;

            /**
             * @type {
             * null |
             * {
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: ShopCustomerDebtDebitNoteDoc | null;
             *  currentData: ShopCustomerDebtDebitNoteDoc;
             * }
             * }
             */
            let shopCustomerDebtDebitNoteDoc__Data = null;
            if (!shopCustomerDebtDebitNoteDoc?.id) {
                const createdDocument = await ShopCustomerDebtDebitNoteDoc.createShopCustomerDebtDebitNote_Doc(
                    shopId,
                    userId,
                    shopCustomerDebtDebitNoteDoc,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                shopCustomerDebtDebitNoteDoc__Data = {
                    isCreated: true,
                    isUpdated: false,
                    previousData: null,
                    currentData: createdDocument
                };
            }
            else if (isUUID(shopCustomerDebtDebitNoteDoc.id)) {
                if (!isUUID(shopCustomerDebtDebitNoteDoc.id)) {
                    throw new Error(`Require parameter shopCustomerDebtCreditNoteDoc.id must be UUID`);
                }
                else {
                    const updatedDocument = await ShopCustomerDebtDebitNoteDoc.updateShopCustomerDebtDebitNote_Doc(
                        shopId,
                        userId,
                        shopCustomerDebtDebitNoteDoc,
                        {
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    shopCustomerDebtDebitNoteDoc__Data = {
                        isCreated: false,
                        isUpdated: true,
                        previousData: updatedDocument.previousData,
                        currentData: updatedDocument.currentData
                    };

                    if (shopCustomerDebtDebitNoteDoc__Data.isUpdated && shopCustomerDebtDebitNoteDoc__Data.currentData.get('status') !== 1) {
                        return {
                            ShopCustomerDebtDebitNoteDoc: shopCustomerDebtDebitNoteDoc__Data,
                            ShopCustomerDebtDebitNoteLists: (await ShopCustomerDebtDebitNoteList.findAll({
                                where: {
                                    shop_customer_debt_dn_doc_id: shopCustomerDebtDebitNoteDoc__Data.currentData.get('id'),
                                    status: 1
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            })).map(element => ({
                                isCreated: false,
                                isUpdated: false,
                                previousData: element.toJSON(),
                                currentData: element
                            }))
                        };
                    }
                }
            }
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้าได้เนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            let shopCustomerDebtDebitNoteLists__Data = null;
            if (shopCustomerDebtDebitNoteDoc__Data?.isCreated === true && shopCustomerDebtDebitNoteDoc__Data?.isUpdated === false) {
                shopCustomerDebtDebitNoteLists__Data = await ShopCustomerDebtDebitNoteList.createOrUpdateShopCustomerDebtDebitNote_Lists(
                    shopId,
                    userId,
                    shopCustomerDebtDebitNoteDoc__Data.currentData.get('id'),
                    shopCustomerDebtDebitNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else if (shopCustomerDebtDebitNoteDoc__Data?.isCreated === false && shopCustomerDebtDebitNoteDoc__Data?.isUpdated === true) {
                shopCustomerDebtDebitNoteLists__Data = await ShopCustomerDebtDebitNoteList.createOrUpdateShopCustomerDebtDebitNote_Lists(
                    shopId,
                    userId,
                    shopCustomerDebtDebitNoteDoc__Data.currentData.get('id'),
                    shopCustomerDebtDebitNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้าเนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            return {
                ShopCustomerDebtDebitNoteDoc: shopCustomerDebtDebitNoteDoc__Data,
                ShopCustomerDebtDebitNoteLists: shopCustomerDebtDebitNoteLists__Data
            }
        }
    }

    ShopCustomerDebtDebitNoteDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า`,
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
                onDelete: 'NO ACTION'
            },
            doc_type_code_id: {
                comment: 'รหัสประเภทเอกสาร',
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: default_doc_type_code_id
            },
            debt_debit_note_type: {
                comment: 'ประเภทใบเพิ่มหนี้' +
                    '\n0 = ไม่ทราบ' +
                    '\n1 = ใบเพิ่มหนี้ (DN)' +
                    '\n2 = ส่วนลด (Rebate)',
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
            customer_credit_debt_unpaid_balance: {
                comment: `จำนวนหนี้ค้างชำระ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            customer_credit_debt_current_balance: {
                comment: `วงเงินหนี้คงเหลือ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            customer_credit_debt_approval_balance: {
                comment: `วงเงินหนี้อนุมัติ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
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
                defaultValue: 0,
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
            price_sub_total: {
                comment: `รวมเป็นเงิน`,
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
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    ref_doc: '',
                    ref_date: '',
                    meta_data: {
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
            modelName: 'ShopCustomerDebtDebitNoteDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_customer_debt_dn_doc`,
            comment: 'ตารางข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_cdn_doc_code_id`,
                    fields: ['code_id']
                },
                {
                    name: `idx_${table_name}_cdn_doc_type_id`,
                    fields: ['doc_type_id']
                },
                {
                    name: `idx_${table_name}_cdn_bus_customer_id`,
                    fields: ['bus_customer_id']
                },
                {
                    name: `idx_${table_name}_cdn_per_customer_id`,
                    fields: ['per_customer_id']
                },
                {
                    name: `idx_${table_name}_cdn_tmp_doc_id`,
                    fields: ['shop_temporary_delivery_order_doc_id']
                },
                {
                    name: `idx_${table_name}_cdn_tax_type_id`,
                    fields: ['tax_type_id']
                }
            ]
        }
    );

    ShopCustomerDebtDebitNoteDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopCustomerDebtDebitNoteDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopCustomerDebtDebitNoteDoc.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopCustomerDebtDebitNoteDoc.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopCustomerDebtDebitNoteDoc.belongsTo(ShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_temporary_delivery_order_doc_id', as: 'ShopTemporaryDeliveryOrderDoc' });
    ShopCustomerDebtDebitNoteDoc.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopCustomerDebtDebitNoteDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopCustomerDebtDebitNoteDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    /**
     * @param {{
     *     ShopModels?: Object;
     * }} options
     */
    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || require("../model").initShopModel(table_name);
        const {
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopTemporaryDeliveryOrderDoc,
            ShopCustomerDebtList,
            ShopCustomerDebtDoc
        } = ShopModels;

        /**
         * @param {ShopCustomerDebtDebitNoteDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeValidate_serializerDocRunNumber = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            if (instance.isNewRecord) {
                instance.set({ code_id: `${default_doc_type_code_id}-XXXXXXXXX` });
            }
        };

        /**
         * Setter พารามิเตอร์ options.isCancelStatus_Doc ถ้ามีการยกเลิกเอกสาร
         * @param {ShopCustomerDebtDebitNoteDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDebitNoteDoc>} options
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
         * @param {ShopCustomerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel = async (instance, options) => {
            if ((!instance.isNewRecord && instance.changed()) || options?.isCancelStatus_Doc === true) {
                const transaction = options?.transaction || null;

                const findShopCustomerDebtList = await ShopCustomerDebtList.findOne({
                    attributes: ['id', 'seq_number', 'shop_customer_debt_doc_id'],
                    where: {
                        shop_customer_debt_dn_doc_id: instance.get('id'),
                        status: 1
                    },
                    transaction: transaction
                });
                if (findShopCustomerDebtList) {
                    const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                        attributes: ['id', 'code_id'],
                        where: {
                            id: findShopCustomerDebtList.get('shop_customer_debt_doc_id'),
                            status: 1
                        },
                        transaction: transaction
                    });
                    if (findShopCustomerDebtDoc) {
                        throw new Error(`ไม่สามารถแก้ไขหรือยกเลิกเอกสารใบเพิ่มหนี้ลูกหนี้ของลูกหนี้การค้าได้ กรุณายกเลิกเอกสารลูกหนี้การค้าก่อน: เลขที่เอกสารลูกหนี้การค้า (${findShopCustomerDebtDoc.get('code_id')}), รายการที่ (${findShopCustomerDebtList.get('seq_number')})`);
                    }
                }
            }
        };

        /**
         * @param {ShopCustomerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_checkFields = async (instance, options) => {
            if (!instance.isNewRecord && instance.previous('status') !== 1) { throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารใบเพิ่มหนี้ลูกหนี้ของลูกหนี้การค้าที่ยกเลิกหรือลบไปก่อนหน้านี้แล้วได้`); }
            if (!isUUID(instance.get('bus_customer_id')) && !isUUID(instance.get('per_customer_id'))) { throw new Error(`ต้องการข้อมูลลูกค้าธุรกิจหรือบุคคลธรรมดา`); }
            if (isUUID(instance.get('bus_customer_id')) && isUUID(instance.get('per_customer_id'))) { throw new Error(`ไม่สามารถใส่ข้อมูลลูกค้าธุรกิจและบุคคลธรรมดาพร้อมกันได้`); }
        };

        /**
         * @param {ShopCustomerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_mutationDocRunNumber = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (instance.isNewRecord) { // กรณีสร้างเอกสารใหม่
                const objPrefixDocCode = await utilGetDocumentTypePrefix(
                    instance.get('doc_type_id') || null,
                    {
                        transaction: transaction,
                        defaultPrefix: default_doc_type_code_id
                    }
                );
                instance.set('code_id_prefix', objPrefixDocCode.prefix);

                const createdShopDocumentCode = await ShopDocumentCode.create(
                    {
                        shop_id: instance.get('shop_id'),
                        doc_type_code: instance.get('code_id_prefix'),
                    },
                    {
                        transaction: transaction
                    }
                );
                instance.set('code_id', createdShopDocumentCode.get('code_id'));
            }
        };

        /**
         * @param {ShopCustomerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
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
                switch (instance.get('tax_type_id')) {
                    // 8c73e506-31b5-44c7-a21b-3819bb712321 = รวม Vat (1)
                    case vatTypeId["IncludeVat"]: {
                        instance.set('vat_type', vatType["IncludeVat"]);
                        break;
                    }
                    // fafa3667-55d8-49d1-b06c-759c6e9ab064 = ไม่รวม Vat (2)
                    case vatTypeId["ExcludeVat"]: {
                        instance.set('vat_type', vatType["ExcludeVat"]);
                        break;
                    }
                    // 52b5a676-c331-4d03-b650-69fc5e591d2c = ไม่คิด Vat (3)
                    case vatTypeId["NoVat"]: {
                        instance.set('vat_type', vatType["NoVat"]);
                        break;
                    }
                    default: {
                        instance.set('vat_type', vatType["UnknownVat"]);
                        break;
                    }
                }
            }
        };

        /**
         * @param {ShopCustomerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_mutationField__details = async (instance, options) => {
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
                (instance.isNewRecord || (!instance.isNewRecord && instance.previous('status') === 1))
                &&
                (
                    instance.changed('bus_customer_id')
                    || instance.changed('per_customer_id')
                    || instance.changed('shop_temporary_delivery_order_doc_id')
                    || instance.changed('tax_type_id')
                )
            ) {
                await Promise.all([
                    (async () => {
                        if (isUUID(instance.get('bus_customer_id'))) {
                            const findShopBusinessCustomer = await ShopBusinessCustomer.findOne({
                                where: {
                                    id: instance.get('bus_customer_id')
                                },
                                transaction: transaction
                            });
                            if (findShopBusinessCustomer) {
                                details.meta_data.ShopBusinessCustomer = findShopBusinessCustomer?.toJSON();
                            }
                            else {
                                details.meta_data.ShopBusinessCustomer = null;
                            }
                        }
                        else {
                            details.meta_data.ShopBusinessCustomer = null;
                        }
                    })(),
                    (async () => {
                        if (isUUID(instance.get('per_customer_id'))) {
                            const findShopPersonalCustomer = await ShopPersonalCustomer.findOne({
                                where: {
                                    id: instance.get('per_customer_id')
                                },
                                transaction: transaction
                            });
                            if (findShopPersonalCustomer) {
                                details.meta_data.ShopPersonalCustomer = findShopPersonalCustomer?.toJSON();
                            }
                            else {
                                details.meta_data.ShopPersonalCustomer = null;
                            }
                        }
                        else {
                            details.meta_data.ShopPersonalCustomer = null;
                        }
                    })(),
                    (async () => {
                        if (isUUID(instance.get('shop_temporary_delivery_order_doc_id'))) {
                            const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                                where: {
                                    id: instance.get('shop_temporary_delivery_order_doc_id')
                                },
                                transaction: transaction
                            });
                            if (findShopTemporaryDeliveryOrderDoc) {
                                details.meta_data.ShopTemporaryDeliveryOrderDoc = findShopTemporaryDeliveryOrderDoc?.toJSON();
                            }
                            else {
                                details.meta_data.ShopTemporaryDeliveryOrderDoc = null;
                            }
                        }
                        else {
                            details.meta_data.ShopTemporaryDeliveryOrderDoc = null;
                        }
                    })(),
                    (async () => {
                        if (isUUID(instance.get('tax_type_id'))) {
                            const findTaxType = await TaxType.findOne({
                                where: {
                                    id: instance.get('tax_type_id')
                                },
                                transaction: transaction
                            });
                            if (findTaxType) {
                                details.meta_data.TaxType = findTaxType?.toJSON();
                            }
                            else {
                                details.meta_data.TaxType = null;
                            }
                        }
                        else {
                            details.meta_data.TaxType = null;
                        }
                    })()
                ]);
            }

            instance.set('details', details);
        };


        return {
            hookBeforeValidate_serializerDocRunNumber,
            hookBeforeSave_setOptionsDocumentIsCancelStatus,
            hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel,
            hookBeforeSave_checkFields,
            hookBeforeSave_mutationDocRunNumber,
            hookBeforeSave_mutationField__vat_type,
            hookBeforeSave_mutationField__details
        };
    };

    ShopCustomerDebtDebitNoteDoc.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
    });

    ShopCustomerDebtDebitNoteDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__vat_type(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__details(instance, options);
    });


    return ShopCustomerDebtDebitNoteDoc;
};


module.exports = ShopCustomerDebtDebitNoteDoc;