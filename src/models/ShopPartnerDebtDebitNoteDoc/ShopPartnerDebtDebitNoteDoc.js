/**
 * A function do dynamics table of model ShopPartnerDebtDebitNoteDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_partner_debt_dn_doc"
 */
const ShopPartnerDebtDebitNoteDoc = (table_name) => {
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
    const ShopBusinessPartner = __model.ShopBusinessPartners(table_name);
    const ShopInventoryImportDoc = __model.ShopInventoryTransaction(table_name);
    const TaxType = __model.TaxTypes;

    const default_doc_type_code_id = 'PDN';

    class ShopPartnerDebtDebitNoteDoc extends Model {
        static async createShopPartnerDebtDebitNote_Doc(shopId = null, userId = null, shopPartnerDebtDebitNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopPartnerDebtDebitNoteDoc) { throw new Error(`Require parameter shopPartnerDebtDebitNoteDoc must be object`); }

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
                ShopPartnerDebtDebitNoteDoc
            } = ShopModels;

            const objToCreate = {
                ...shopPartnerDebtDebitNoteDoc,
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

            const createdDocument = ShopPartnerDebtDebitNoteDoc.create(
                objToCreate,
                {
                    validate: true,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            return createdDocument;
        }

        static async updateShopPartnerDebtDebitNote_Doc(shopId = null, userId = null, shopPartnerDebtDebitNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopPartnerDebtDebitNoteDoc) { throw new Error(`Require parameter shopPartnerDebtDebitNoteDoc must be object`); }

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
                ShopPartnerDebtDebitNoteDoc
            } = ShopModels;

            const findDocument = await ShopPartnerDebtDebitNoteDoc.findOne({
                where: {
                    id: shopPartnerDebtDebitNoteDoc.id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findDocument) { throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้าจากการแก้ไขเอกสาร`); }
            else {
                const prevData = findDocument.toJSON();

                let objToUpdate = {
                    updated_by: userId,
                    updated_date: currentDateTime
                };

                if (findDocument.previous('status') === 1 && (shopPartnerDebtDebitNoteDoc?.status === 0 || shopPartnerDebtDebitNoteDoc?.status === 2)) {
                    return await ShopPartnerDebtDebitNoteDoc.cancelShopPartnerDebtDebitNote_Doc(
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
                        ...shopPartnerDebtDebitNoteDoc,
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

        static async cancelShopPartnerDebtDebitNote_Doc(shopId = null, userId = null, shop_partner_debt_dn_doc_id = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!isUUID(shop_partner_debt_dn_doc_id)) { throw new Error(`Require parameter shop_partner_debt_dn_doc_id must be UUID`); }

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
                ShopPartnerDebtDebitNoteDoc
            } = ShopModels;

            const findDocument = await ShopPartnerDebtDebitNoteDoc.findOne({
                where: {
                    id: shop_partner_debt_dn_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findDocument) { throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้าจากการยกเลิก`); }
            else if (findDocument.get('status') !== 1) { throw new Error(`ไม่สามารถยกเลิกเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้าได้เนื่องจากได้ยกเลิกไปก่อนแล้ว`); }
            else {
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

        static async createOrUpdateShopPartnerDebtDebitNote_Doc_Lists(shopId = null, userId = null, shopPartnerDebtDebitNoteDoc = null, shopPartnerDebtDebitNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopPartnerDebtDebitNoteDoc) { throw new Error(`Require parameter shopPartnerDebtDebitNoteDoc must be object`); }
            if (!Array.isArray(shopPartnerDebtDebitNoteLists)) { throw new Error(`Require parameter shopPartnerDebtDebitNoteLists must be array`); }

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
                ShopPartnerDebtDebitNoteDoc,
                ShopPartnerDebtDebitNoteList
            } = ShopModels;

            /**
             * @type {
             * null |
             * {
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: ShopPartnerDebtDebitNoteDoc | null;
             *  currentData: ShopPartnerDebtDebitNoteDoc;
             * }
             * }
             */
            let shopPartnerDebtDebitNoteDoc__Data = null;
            if (!shopPartnerDebtDebitNoteDoc?.id) {
                const createdDocument = await ShopPartnerDebtDebitNoteDoc.createShopPartnerDebtDebitNote_Doc(
                    shopId,
                    userId,
                    shopPartnerDebtDebitNoteDoc,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                shopPartnerDebtDebitNoteDoc__Data = {
                    isCreated: true,
                    isUpdated: false,
                    previousData: null,
                    currentData: createdDocument
                };
            }
            else if (isUUID(shopPartnerDebtDebitNoteDoc.id)) {
                const updatedDocument = await ShopPartnerDebtDebitNoteDoc.updateShopPartnerDebtDebitNote_Doc(
                    shopId,
                    userId,
                    shopPartnerDebtDebitNoteDoc,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                shopPartnerDebtDebitNoteDoc__Data = {
                    isCreated: false,
                    isUpdated: true,
                    previousData: updatedDocument.previousData,
                    currentData: updatedDocument.currentData
                };

                if (shopPartnerDebtDebitNoteDoc__Data.isUpdated && shopPartnerDebtDebitNoteDoc__Data.currentData.get('status') !== 1) {
                    return {
                        ShopPartnerDebtDebitNoteDoc: shopPartnerDebtDebitNoteDoc__Data,
                        ShopPartnerDebtDebitNoteLists: (await ShopPartnerDebtDebitNoteList.findAll({
                            where: {
                                shop_partner_debt_dn_doc_id: shopPartnerDebtDebitNoteDoc__Data.currentData.get('id'),
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
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้าได้เนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            let shopPartnerDebtDebitNoteLists__Data = null;
            if (shopPartnerDebtDebitNoteDoc__Data?.isCreated === true && shopPartnerDebtDebitNoteDoc__Data?.isUpdated === false) {
                shopPartnerDebtDebitNoteLists__Data = await ShopPartnerDebtDebitNoteList.createOrUpdateShopPartnerDebtDebitNote_Lists(
                    shopId,
                    userId,
                    shopPartnerDebtDebitNoteDoc__Data.currentData.get('id'),
                    shopPartnerDebtDebitNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else if (shopPartnerDebtDebitNoteDoc__Data?.isCreated === false && shopPartnerDebtDebitNoteDoc__Data?.isUpdated === true) {
                shopPartnerDebtDebitNoteLists__Data = await ShopPartnerDebtDebitNoteList.createOrUpdateShopPartnerDebtDebitNote_Lists(
                    shopId,
                    userId,
                    shopPartnerDebtDebitNoteDoc__Data.currentData.get('id'),
                    shopPartnerDebtDebitNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้าเนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            return {
                ShopPartnerDebtDebitNoteDoc: shopPartnerDebtDebitNoteDoc__Data,
                ShopPartnerDebtDebitNoteLists: shopPartnerDebtDebitNoteLists__Data
            }
        }
    }

    ShopPartnerDebtDebitNoteDoc.init(
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
            bus_partner_id: {
                comment: `รหัสตารางข้อมูลคู่ค้าธุรกิจ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopBusinessPartner,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_inventory_import_doc_id: {
                comment: `รหัสหลักตารางข้อมูลใบรับเข้าสินค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopInventoryImportDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            partner_credit_debt_unpaid_balance: {
                comment: `จำนวนหนี้ค้างชำระ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            partner_credit_debt_current_balance: {
                comment: `วงเงินหนี้คงเหลือ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            partner_credit_debt_approval_balance: {
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
                    isIn: [[1, 2]]
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
            modelName: 'ShopPartnerDebtDebitNoteDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_partner_debt_dn_doc`,
            comment: 'ตารางข้อมูลเอกสารใบเพิ่มหนี้ของเจ้าหนี้การค้า',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_pdn_doc_code_id`,
                    fields: ['code_id']
                },
                {
                    name: `idx_${table_name}_pdn_doc_type_id`,
                    fields: ['doc_type_id']
                },
                {
                    name: `idx_${table_name}_pdn_bus_partner_id`,
                    fields: ['bus_partner_id']
                },
                {
                    name: `idx_${table_name}_pdn_ini_doc_id`,
                    fields: ['shop_inventory_import_doc_id']
                },
                {
                    name: `idx_${table_name}_pdn_tax_type_id`,
                    fields: ['tax_type_id']
                }
            ]
        }
    );

    ShopPartnerDebtDebitNoteDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopPartnerDebtDebitNoteDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopPartnerDebtDebitNoteDoc.belongsTo(ShopBusinessPartner, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartner' });
    ShopPartnerDebtDebitNoteDoc.belongsTo(ShopInventoryImportDoc, { foreignKey: 'shop_inventory_import_doc_id', as: 'ShopInventoryImportDoc' });
    ShopPartnerDebtDebitNoteDoc.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopPartnerDebtDebitNoteDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopPartnerDebtDebitNoteDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    /**
     * @param {{
     *     ShopModels?: Object;
     * }} options
     */
    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || require("../model").initShopModel(table_name);
        const {
            ShopInventoryImportDoc,
            ShopBusinessPartner
        } = ShopModels;

        /**
         * @param {ShopPartnerDebtDebitNoteDoc} instance
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
         * @param {ShopPartnerDebtDebitNoteDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtDebitNoteDoc>} options
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
         * @param {ShopPartnerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel = async (instance, options) => {
            // if ((!instance.isNewRecord && instance.changed()) || options?.isCancelStatus_Doc === true) {
            //     const transaction = options?.transaction || null;
            //
            //     const findShopCustomerDebtList = await ShopCustomerDebtList.findOne({
            //         attributes: ['id', 'seq_number', 'shop_customer_debt_doc_id'],
            //         where: {
            //             shop_customer_debt_dn_doc_id: instance.get('id'),
            //             status: 1
            //         },
            //         transaction: transaction
            //     });
            //     if (findShopCustomerDebtList) {
            //         const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
            //             attributes: ['id', 'code_id'],
            //             where: {
            //                 id: findShopCustomerDebtList.get('shop_customer_debt_doc_id'),
            //                 status: 1
            //             },
            //             transaction: transaction
            //         });
            //         if (findShopCustomerDebtDoc) {
            //             throw new Error(`ไม่สามารถแก้ไขหรือยกเลิกเอกสารใบเพิ่มหนี้ลูกหนี้ของลูกหนี้การค้าได้ กรุณายกเลิกเอกสารลูกหนี้การค้าก่อน: เลขที่เอกสารลูกหนี้การค้า (${findShopCustomerDebtDoc.get('code_id')}), รายการที่ (${findShopCustomerDebtList.get('seq_number')})`);
            //         }
            //     }
            // }
        };

        /**
         * @param {ShopPartnerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_checkFields = async (instance, options) => {
            if (!instance.isNewRecord && instance.previous('status') !== 1) { throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารใบเพิ่มหนี้เจ้าหนี้ของลูกหนี้การค้าที่ยกเลิกหรือลบไปก่อนหน้านี้แล้วได้`); }
        };

        /**
         * @param {ShopPartnerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
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
         * @param {ShopPartnerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
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
         * @param {ShopPartnerDebtDebitNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtDebitNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtDebitNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
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
                (instance.isNewRecord)
                ||
                (
                    (!instance.isNewRecord && instance.previous('status') === 1)
                    &&
                    (
                        instance.changed('doc_type_id')
                        || instance.changed('bus_partner_id')
                        || instance.changed('shop_inventory_import_doc_id')
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
                        'doc_type_id',
                        'DocumentType',
                        DocumentType,
                        {
                            id: instance.get('doc_type_id')
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
                        'shop_inventory_import_doc_id',
                        'ShopInventoryImportDoc',
                        ShopInventoryImportDoc,
                        {
                            id: instance.get('shop_inventory_import_doc_id')
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
                    )
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

    ShopPartnerDebtDebitNoteDoc.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
    });

    ShopPartnerDebtDebitNoteDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__vat_type(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__details(instance, options);
    });


    return ShopPartnerDebtDebitNoteDoc;
};


module.exports = ShopPartnerDebtDebitNoteDoc;