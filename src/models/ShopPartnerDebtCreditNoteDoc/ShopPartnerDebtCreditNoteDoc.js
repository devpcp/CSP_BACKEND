/**
 * A function do dynamics table of model ShopPartnerDebtCreditNoteDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_partner_debt_cn_doc"
 */
const ShopPartnerDebtCreditNoteDoc = (table_name) => {
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

    const default_doc_type_code_id = 'PCN';

    class ShopPartnerDebtCreditNoteDoc extends Model {
        static async createShopPartnerDebtCreditNoteDoc_Doc (shopId = null, userId = null, shopPartnerDebtCreditNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopPartnerDebtCreditNoteDoc) { throw new Error(`Require parameter shopPartnerDebtCreditNoteDoc must be object`); }

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
                ShopPartnerDebtCreditNoteDoc
            } = ShopModels;

            const objToCreate = {
                ...shopPartnerDebtCreditNoteDoc,
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

            const createdDocument = ShopPartnerDebtCreditNoteDoc.create(
                objToCreate,
                {
                    validate: true,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            return createdDocument;
        }

        static async updateShopPartnerDebtCreditNote_Doc (shopId = null, userId = null, shopPartnerDebtCreditNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopPartnerDebtCreditNoteDoc) { throw new Error(`Require parameter shopPartnerDebtCreditNoteDoc must be object`); }

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
                ShopPartnerDebtCreditNoteDoc
            } = ShopModels;

            const findDocument = await ShopPartnerDebtCreditNoteDoc.findOne({
                where: {
                    id: shopPartnerDebtCreditNoteDoc.id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findDocument) { throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้าจากการแก้ไขเอกสาร`); }
            else {
                const prevData = findDocument.toJSON();

                let objToUpdate = {
                    updated_by: userId,
                    updated_date: currentDateTime
                };

                if (findDocument.previous('status') === 1 && (shopPartnerDebtCreditNoteDoc?.status === 0 || shopPartnerDebtCreditNoteDoc?.status === 2)) {
                    return await ShopPartnerDebtCreditNoteDoc.cancelShopPartnerDebtCreditNote_Doc(
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
                        ...shopPartnerDebtCreditNoteDoc,
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

        static async cancelShopPartnerDebtCreditNote_Doc (shopId = null, userId = null, shop_partner_debt_cn_doc_id = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!isUUID(shop_partner_debt_cn_doc_id)) { throw new Error(`Require parameter shop_partner_debt_cn_doc_id must be UUID`); }

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
                ShopPartnerDebtCreditNoteDoc
            } = ShopModels;

            const findDocument = await ShopPartnerDebtCreditNoteDoc.findOne({
                where: {
                    id: shop_partner_debt_cn_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findDocument) { throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้าจากการยกเลิกเอกสาร`); }
            else if (findDocument.get('status') !== 1) {
                throw new Error(`ไม่สามารถยกเลิกเอกสารใบลดหนี้ของลูกหนี้การค้าได้เนื่องจากได้ยกเลิกไปก่อนแล้ว`);
            }
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

        static async createOrUpdateShopPartnerDebtCreditNote_Doc_Lists (shopId = null, userId = null, shopPartnerDebtCreditNoteDoc = null, shopPartnerDebtCreditNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopPartnerDebtCreditNoteDoc) { throw new Error(`Require parameter userId must be object`); }
            if (!Array.isArray(shopPartnerDebtCreditNoteLists)) { throw new Error(`Require parameter userId must be array`); }

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
                ShopPartnerDebtCreditNoteDoc,
                ShopPartnerDebtCreditNoteList
            } = ShopModels;

            /**
             * @type {
             * null |
             * {
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: ShopPartnerDebtCreditNoteDoc | null;
             *  currentData: ShopPartnerDebtCreditNoteDoc;
             * }
             * }
             */
            let shopPartnerDebtCreditNoteDoc__Data = null;
            if (!shopPartnerDebtCreditNoteDoc?.id) {
                const createdDocument = await ShopPartnerDebtCreditNoteDoc.createShopPartnerDebtCreditNoteDoc_Doc(
                    shopId,
                    userId,
                    shopPartnerDebtCreditNoteDoc,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                shopPartnerDebtCreditNoteDoc__Data = {
                    isCreated: true,
                    isUpdated: false,
                    previousData: null,
                    currentData: createdDocument
                };
            }
            else if (isUUID(shopPartnerDebtCreditNoteDoc.id)) {
                const updatedDocument = await ShopPartnerDebtCreditNoteDoc.updateShopPartnerDebtCreditNote_Doc(
                    shopId,
                    userId,
                    shopPartnerDebtCreditNoteDoc,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                shopPartnerDebtCreditNoteDoc__Data = {
                    isCreated: false,
                    isUpdated: true,
                    previousData: updatedDocument.previousData,
                    currentData: updatedDocument.currentData
                };

                if (shopPartnerDebtCreditNoteDoc__Data.isUpdated && shopPartnerDebtCreditNoteDoc__Data.currentData.get('status') !== 1) {
                    return {
                        ShopPartnerDebtCreditNoteDoc: shopPartnerDebtCreditNoteDoc__Data,
                        ShopPartnerDebtCreditNoteLists: (await ShopPartnerDebtCreditNoteList.findAll({
                            where: {
                                shop_partner_debt_cn_doc_id: shopPartnerDebtCreditNoteDoc__Data.currentData.get('id'),
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
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้าได้เนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            let shopPartnerDebtCreditNoteLists__Data = null;
            if (shopPartnerDebtCreditNoteDoc__Data?.isCreated === true && shopPartnerDebtCreditNoteDoc__Data?.isUpdated === false) {
                shopPartnerDebtCreditNoteLists__Data = await ShopPartnerDebtCreditNoteList.createOrUpdateShopPartnerDebtCreditNote_Lists(
                    shopId,
                    userId,
                    shopPartnerDebtCreditNoteDoc__Data.currentData.get('id'),
                    shopPartnerDebtCreditNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else if (shopPartnerDebtCreditNoteDoc__Data?.isCreated === false && shopPartnerDebtCreditNoteDoc__Data?.isUpdated === true) {
                shopPartnerDebtCreditNoteLists__Data = await ShopPartnerDebtCreditNoteList.createOrUpdateShopPartnerDebtCreditNote_Lists(
                    shopId,
                    userId,
                    shopPartnerDebtCreditNoteDoc__Data.currentData.get('id'),
                    shopPartnerDebtCreditNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้าเนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            return {
                ShopPartnerDebtCreditNoteDoc: shopPartnerDebtCreditNoteDoc__Data,
                ShopPartnerDebtCreditNoteLists: shopPartnerDebtCreditNoteLists__Data
            }
        }
    }

    ShopPartnerDebtCreditNoteDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า`,
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
            debt_credit_note_type: {
                comment: 'ประเภทใบลดหนี้' +
                    '\n0 = ไม่ทราบ' +
                    '\n1 = ใบลดหนี้ (CN)' +
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
            modelName: 'ShopPartnerDebtCreditNoteDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_partner_debt_cn_doc`,
            comment: 'ตารางข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้า',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_pcn_doc_code_id`,
                    fields: ['code_id']
                },
                {
                    name: `idx_${table_name}_pcn_doc_type_id`,
                    fields: ['doc_type_id']
                },
                {
                    name: `idx_${table_name}_pcn_bus_partner_id`,
                    fields: ['bus_partner_id']
                },
                {
                    name: `idx_${table_name}_pcn_ini_doc_id`,
                    fields: ['shop_inventory_import_doc_id']
                },
                {
                    name: `idx_${table_name}_pcn_tax_type_id`,
                    fields: ['tax_type_id']
                }
            ]
        }
    );

    ShopPartnerDebtCreditNoteDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopPartnerDebtCreditNoteDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopPartnerDebtCreditNoteDoc.belongsTo(ShopBusinessPartner, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartner' });
    ShopPartnerDebtCreditNoteDoc.belongsTo(ShopInventoryImportDoc, { foreignKey: 'shop_inventory_import_doc_id', as: 'ShopInventoryImportDoc' });
    ShopPartnerDebtCreditNoteDoc.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopPartnerDebtCreditNoteDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopPartnerDebtCreditNoteDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    /**
     * @param {{
     *     ShopModels?: Object;
     * }} options
     */
    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopBusinessPartner,
            ShopInventoryImportDoc,
            ShopPartnerDebtCreditNoteDoc
        } = ShopModels;

        /**
         * @param {ShopPartnerDebtCreditNoteDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDocRunNumber = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            if (instance.isNewRecord) {
                instance.set({ code_id: `${default_doc_type_code_id}-XXXXXXXXX` });
            }
        };

        /**
         * Setter พารามิเตอร์ options.isCancelStatus_Doc ถ้ามีการยกเลิกเอกสาร
         * @param {ShopPartnerDebtCreditNoteDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtCreditNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtCreditNoteDoc>} options
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
         * @param {ShopPartnerDebtCreditNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtCreditNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtCreditNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel = async (instance, options) => {
            // if ((!instance.isNewRecord && instance.changed()) || options?.isCancelStatus_Doc === true) {
            //     // const transaction = options?.transaction || null;
            //     //
            //     // const findShopCustomerDebtList = await ShopCustomerDebtList.findOne({
            //     //     attributes: ['id', 'seq_number', 'shop_customer_debt_doc_id'],
            //     //     where: {
            //     //         shop_customer_debt_cn_doc_id: instance.get('id'),
            //     //         status: 1
            //     //     },
            //     //     transaction: transaction
            //     // });
            //     // if (findShopCustomerDebtList) {
            //     //     const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
            //     //         attributes: ['id', 'code_id'],
            //     //         where: {
            //     //             id: findShopCustomerDebtList.get('shop_customer_debt_doc_id'),
            //     //             status: 1
            //     //         },
            //     //         transaction: transaction
            //     //     });
            //     //     if (findShopCustomerDebtDoc) {
            //     //         throw new Error(`ไม่สามารถแก้ไขหรือยกเลิกเอกสารใบลดหนี้ลูกหนี้ของลูกหนี้การค้าได้ กรุณายกเลิกเอกสารลูกหนี้การค้าก่อน: เลขที่เอกสารลูกหนี้การค้า (${findShopCustomerDebtDoc.get('code_id')}), รายการที่ (${findShopCustomerDebtList.get('seq_number')})`);
            //     //     }
            //     // }
            // }
        };

        /**
         * @param {ShopPartnerDebtCreditNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtCreditNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtCreditNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_checkFields = async (instance, options) => {
            if (!instance.isNewRecord && instance.previous('status') !== 1) { throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารใบลดหนี้ลูกหนี้ของลูกหนี้การค้าที่ยกเลิกหรือลบไปก่อนหน้านี้แล้วได้`); }
        };

        /**
         * @param {ShopPartnerDebtCreditNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtCreditNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtCreditNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
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
         * @param {ShopPartnerDebtCreditNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtCreditNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtCreditNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
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
         * @param {ShopPartnerDebtCreditNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtCreditNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtCreditNoteDoc>) & { isCancelStatus_Doc?: boolean }} options
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

    ShopPartnerDebtCreditNoteDoc.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
    });

    ShopPartnerDebtCreditNoteDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkUsingThisDocumentIfThisDocumentSetToCancel(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__vat_type(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__details(instance, options);
    });


    return ShopPartnerDebtCreditNoteDoc;
};


module.exports = ShopPartnerDebtCreditNoteDoc;