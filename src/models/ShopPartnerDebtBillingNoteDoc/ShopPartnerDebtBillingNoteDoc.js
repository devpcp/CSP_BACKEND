/**
 * A function do dynamics table of model ShopPartnerDebtInvoiceDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_partner_debt_invoice_doc"
 */
const ShopPartnerDebtBillingNoteDoc = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const { isUUID } = require("../../utils/generate");
    const { initShopModel } = require("../model");
    const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");
    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const __model = require("../model");
    const User = __model.User;
    const ShopProfile = __model.ShopsProfiles;
    const DocumentType = __model.DocumentTypes;
    const ShopDocumentCode = __model.ShopDocumentCode(table_name);
    const ShopBusinessPartner = __model.ShopBusinessPartners(table_name);

    const default_doc_type_code_id = 'CBN';

    class ShopPartnerDebtBillingNoteDoc extends Model {
        static async createShopPartnerDebtBillingNote_Doc(shopId = null, userId = null, shopPartnerDebtBillingNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }

            /**
             * @type {Date}
             */
            const currentDateTime = options?.currentDateTime || new Date();

            /**
             * @type {import("sequelize").Transaction}
             */
            const transaction = options?.transaction;

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
            const {
                ShopPartnerDebtBillingNoteDoc
            } = ShopModels;

            const objToCreate = {
                ...shopPartnerDebtBillingNoteDoc,

                price_discount_bill: 0,
                price_discount_before_pay: 0,
                price_sub_total: 0,
                price_discount_total: 0,
                price_amount_total: 0,
                price_before_vat: 0,
                price_vat: 0,
                price_grand_total: 0,

                debt_price_paid_total: 0,

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

            const createdDocument = ShopPartnerDebtBillingNoteDoc.create(
                objToCreate,
                {
                    validate: true,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            return createdDocument;
        }

        static async updateShopPartnerDebtBillingNote_Doc(shopId = null, userId = null, shopPartnerDebtBillingNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopPartnerDebtBillingNoteDoc) { throw new Error(`Require parameter shopPartnerDebtBillingNoteDoc must be object`); }

            /**
             * @type {Date}
             */
            const currentDateTime = options?.currentDateTime || new Date();

            /**
             * @type {import("sequelize").Transaction}
             */
            const transaction = options?.transaction;

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
            const {
                ShopPartnerDebtBillingNoteDoc
            } = ShopModels;

            const findDocument = await ShopPartnerDebtBillingNoteDoc.findOne({
                where: {
                    id: shopPartnerDebtBillingNoteDoc.id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findDocument) { throw new Error(`ไม่พบเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้าจากการแก้ไขเอกสาร`); }
            else {
                const prevData = findDocument.toJSON();

                let objToUpdate = {
                    updated_by: userId,
                    updated_date: currentDateTime
                };

                if (findDocument.previous('status') === 1 && (shopPartnerDebtBillingNoteDoc?.status === 0 || shopPartnerDebtBillingNoteDoc?.status === 2)) {
                    objToUpdate.status = shopPartnerDebtBillingNoteDoc.status;
                }
                else {
                    objToUpdate = {
                        ...shopPartnerDebtBillingNoteDoc,
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

        static async createOrUpdateShopPartnerDebtBillingNote_Doc_Lists(shopId = null, userId = null, shopPartnerDebtBillingNoteDoc = null, shopPartnerDebtBillingNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }

            /**
             * @type {Date}
             */
            const currentDateTime = options?.currentDateTime || new Date();

            /**
             * @type {import("sequelize").Transaction}
             */
            const transaction = options?.transaction;

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
            const {
                ShopPartnerDebtBillingNoteDoc,
                ShopPartnerDebtBillingNoteList
            } = ShopModels;

            /**
             * @type {null | { isCreated: boolean; isUpdated: boolean; previousData: ShopPartnerDebtBillingNoteDoc | null; currentData: ShopPartnerDebtBillingNoteDoc }}
             */
            let shopPartnerDebtBillingNoteDoc__Data = null;
            if (!shopPartnerDebtBillingNoteDoc?.id) {
                const createdDocument = await ShopPartnerDebtBillingNoteDoc.createShopPartnerDebtBillingNote_Doc(
                    shopId,
                    userId,
                    shopPartnerDebtBillingNoteDoc,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                shopPartnerDebtBillingNoteDoc__Data = {
                    isCreated: true,
                    isUpdated: false,
                    previousData: null,
                    currentData: createdDocument
                };
            }
            else if (isUUID(shopPartnerDebtBillingNoteDoc.id)) {
                if (!isUUID(shopPartnerDebtBillingNoteDoc.id)) {
                    throw new Error(`Require parameter shopPartnerDebtBillingNoteDoc.id must be UUID`);
                }
                else {
                    const updatedDocument = await ShopPartnerDebtBillingNoteDoc.updateShopPartnerDebtBillingNote_Doc(
                        shopId,
                        userId,
                        shopPartnerDebtBillingNoteDoc,
                        {
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    shopPartnerDebtBillingNoteDoc__Data = {
                        isCreated: false,
                        isUpdated: true,
                        previousData: updatedDocument.previousData,
                        currentData: updatedDocument.currentData
                    };

                    if (shopPartnerDebtBillingNoteDoc__Data.isUpdated && shopPartnerDebtBillingNoteDoc__Data.currentData.get('status') !== 1) {
                        return {
                            ShopPartnerDebtBillingNoteDoc: shopPartnerDebtBillingNoteDoc__Data,
                            ShopPartnerDebtBillingNoteLists: (await ShopPartnerDebtBillingNoteList.findAll({
                                where: {
                                    shop_partner_debt_bn_doc_id: shopPartnerDebtBillingNoteDoc__Data.currentData.get('id'),
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
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้าได้เนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            let shopPartnerDebtBillingNoteLists__Data = null;
            if (shopPartnerDebtBillingNoteDoc__Data?.isCreated === true && shopPartnerDebtBillingNoteDoc__Data?.isUpdated === false) {
                shopPartnerDebtBillingNoteLists__Data = await ShopPartnerDebtBillingNoteList.createOrUpdateShopPartnerDebtBillingNote_Lists(
                    shopId,
                    userId,
                    shopPartnerDebtBillingNoteDoc__Data.currentData.get('id'),
                    shopPartnerDebtBillingNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else if (shopPartnerDebtBillingNoteDoc__Data?.isCreated === false && shopPartnerDebtBillingNoteDoc__Data?.isUpdated === true) {
                shopPartnerDebtBillingNoteLists__Data = await ShopPartnerDebtBillingNoteList.createOrUpdateShopPartnerDebtBillingNote_Lists(
                    shopId,
                    userId,
                    shopPartnerDebtBillingNoteDoc__Data.currentData.get('id'),
                    shopPartnerDebtBillingNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลรายการใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้าได้เนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            const [
                reduce_SUM_ShopPartnerDebtLists__price_discount_bill,
                reduce_SUM_ShopPartnerDebtLists__price_discount_before_pay,
                reduce_SUM_ShopPartnerDebtLists__price_sub_total,
                reduce_SUM_ShopPartnerDebtLists__price_discount_total,
                reduce_SUM_ShopPartnerDebtLists__price_amount_total,
                reduce_SUM_ShopPartnerDebtLists__price_before_vat,
                reduce_SUM_ShopPartnerDebtLists__price_vat,
                reduce_SUM_ShopPartnerDebtLists__price_grand_total,
                reduce_SUM_ShopPartnerDebtLists__price_debt_grand_total,
                reduce_SUM_ShopPartnerDebtLists__debt_price_paid_total
            ] = await Promise.all([
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_bill'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_before_pay'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_sub_total'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_total'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_amount_total'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_before_vat'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_vat'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_grand_total'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_debt_grand_total'));
                    }
                }, 0),
                shopPartnerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_amount_left'));
                    }
                }, 0),
            ]);

            shopPartnerDebtBillingNoteDoc__Data.currentData.set({
                price_discount_bill: reduce_SUM_ShopPartnerDebtLists__price_discount_bill,
                price_discount_before_pay: reduce_SUM_ShopPartnerDebtLists__price_discount_before_pay,
                price_sub_total: reduce_SUM_ShopPartnerDebtLists__price_sub_total,
                price_discount_total: reduce_SUM_ShopPartnerDebtLists__price_discount_total,
                price_amount_total: reduce_SUM_ShopPartnerDebtLists__price_amount_total,
                price_before_vat: reduce_SUM_ShopPartnerDebtLists__price_before_vat,
                price_vat: reduce_SUM_ShopPartnerDebtLists__price_vat,
                price_grand_total: reduce_SUM_ShopPartnerDebtLists__price_grand_total,
                price_debt_grand_total: Object.hasOwn(shopPartnerDebtBillingNoteDoc, 'price_debt_grand_total')
                    ? shopPartnerDebtBillingNoteDoc.price_debt_grand_total !== null
                        ? shopPartnerDebtBillingNoteDoc.price_debt_grand_total
                        : reduce_SUM_ShopPartnerDebtLists__price_debt_grand_total
                    : reduce_SUM_ShopPartnerDebtLists__price_debt_grand_total,
                debt_price_paid_total: Object.hasOwn(shopPartnerDebtBillingNoteDoc, 'debt_price_paid_total')
                    ? shopPartnerDebtBillingNoteDoc.debt_price_paid_total !== null
                        ? shopPartnerDebtBillingNoteDoc.debt_price_paid_total
                        : reduce_SUM_ShopPartnerDebtLists__debt_price_paid_total
                    : reduce_SUM_ShopPartnerDebtLists__debt_price_paid_total
            });
            await shopPartnerDebtBillingNoteDoc__Data.currentData.save({ transaction: transaction, ShopModels: ShopModels });
            await shopPartnerDebtBillingNoteDoc__Data.currentData.reload({ transaction: transaction, ShopModels: ShopModels });

            return {
                ShopPartnerDebtBillingNoteDoc: shopPartnerDebtBillingNoteDoc__Data,
                ShopPartnerDebtBillingNoteLists: shopPartnerDebtBillingNoteLists__Data
            }
        }
    }

    ShopPartnerDebtBillingNoteDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า`,
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
            partner_credit_debt_payment_period: {
                comment: `ระยะเวลาชำระหนี้`,
                type: DataTypes.INTEGER,
                allowNull: false
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
                type: DataTypes.DECIMAL(10, 2),
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
            debt_price_paid_total: {
                comment: `จำนวนเงินชำระเจ้าหนี้การค้ารวมทั้งสิ้น (ยอดชำระ)`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    ref_doc: '',
                    ref_date: '',
                    meta_data: {}
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
            modelName: 'ShopPartnerDebtBillingNoteDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_partner_debt_bn_doc`,
            comment: 'ตารางข้อมูลเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_partner_cbn_doc_code_id`,
                    fields: ['code_id']
                }
            ]
        }
    );

    ShopPartnerDebtBillingNoteDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopPartnerDebtBillingNoteDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopPartnerDebtBillingNoteDoc.belongsTo(ShopBusinessPartner, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartner' });
    ShopPartnerDebtBillingNoteDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopPartnerDebtBillingNoteDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopBusinessPartner
        } = ShopModels;


        /**
         * @param {ShopPartnerDebtBillingNoteDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDocRunNumber = async (instance, options) => {
            if (instance.isNewRecord) {
                instance.set({ code_id: `${default_doc_type_code_id}-XXXXXXXXX` });
            }
        };

        /**
         * @param {ShopPartnerDebtBillingNoteDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtBillingNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtBillingNoteDoc>} options
         */
        const hookBeforeSave_setOptionsDocumentIsCancelStatus = async (instance, options) => {
            if (instance.isNewRecord) {
                return;
            }
            else if (!instance.isNewRecord && instance.previous('status') !== 1) {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้าได้ เนื่องจากเคยยกเลิกไปแล้ว`);
            }
            else if (!instance.isNewRecord && instance.changed() && instance.previous('status') === 1 && instance.get('status') === 1) {
                return;
            }
            else if (!instance.isNewRecord && instance.changed('status') && instance.previous('status') === 1 && instance.get('status') === 2) {
                options.isCancelStatus_Doc = true;
                return;
            }
            else {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้าได้ เนื่องจากเกิดข้อผิดพลาดอื่น ๆ`);
            }
        };

        /**
         * @param {ShopPartnerDebtBillingNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtBillingNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtBillingNoteDoc>) & { isCancelStatus_Doc?: boolean; }} options
         */
        const hookBeforeSave_checkFields = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (!isUUID(instance.get('bus_partner_id'))) { throw new Error(`ต้องการข้อมูลผุ้จำหน่าย`); }
            if (isUUID(instance.get('doc_type_id'))) {
                const findDoc = await DocumentType.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('doc_type_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลประเภทเอกสาร จากการสร้างหรือแก้ไขเอกสารใบวางบิลเจ้าหนี้ของเจ้าหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
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
        };

        /**
         * @param {ShopPartnerDebtBillingNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtBillingNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtBillingNoteDoc>) & { isCancelStatus_Doc?: boolean; }} options
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
         * Mutation ข้อมูลฟิวส์ "details.meta_data"
         * @param {ShopPartnerDebtBillingNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtBillingNoteDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtBillingNoteDoc>) & { isCancelStatus_Doc?: boolean; }} options
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
                        instance.changed('doc_type_id')
                        || instance.changed('bus_partner_id')
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
                    )
                ]);
            }

            instance.set('details', details);
        };

        return {
            hookBeforeValidate_serializerDocRunNumber,
            hookBeforeSave_setOptionsDocumentIsCancelStatus,
            hookBeforeSave_checkFields,
            hookBeforeSave_mutationDocRunNumber,
            hookBeforeSave_mutationField_details__meta_data
        };
    };

    ShopPartnerDebtBillingNoteDoc.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
    });

    ShopPartnerDebtBillingNoteDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField_details__meta_data(instance, options);
    });

    return ShopPartnerDebtBillingNoteDoc;
};


module.exports = ShopPartnerDebtBillingNoteDoc;