/**
 * A function do dynamics table of model ShopCustomerDebtInvoiceDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_customer_debt_invoice_doc"
 */
const ShopCustomerDebtBillingNoteDoc = (table_name) => {
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
    const ShopBusinessCustomer = __model.ShopBusinessCustomers(table_name);
    const ShopPersonalCustomer = __model.ShopPersonalCustomers(table_name);

    const default_doc_type_code_id = 'CBN';

    class ShopCustomerDebtBillingNoteDoc extends Model {
        static async createShopCustomerDebtBillingNote_Doc (shopId = null, userId = null, shopCustomerDebtBillingNoteDoc = null, options = {}) {
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
                ShopCustomerDebtBillingNoteDoc
            } = ShopModels;

            const objToCreate = {
                ...shopCustomerDebtBillingNoteDoc,

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

            const createdDocument = ShopCustomerDebtBillingNoteDoc.create(
                objToCreate,
                {
                    validate: true,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            return createdDocument;
        }

        static async updateShopCustomerDebtBillingNote_Doc (shopId = null, userId = null, shopCustomerDebtBillingNoteDoc = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!shopCustomerDebtBillingNoteDoc) { throw new Error(`Require parameter shopCustomerDebtBillingNoteDoc must be object`); }

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
                ShopCustomerDebtBillingNoteDoc
            } = ShopModels;

            const findDocument = await ShopCustomerDebtBillingNoteDoc.findOne({
                where: {
                    id: shopCustomerDebtBillingNoteDoc.id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findDocument) { throw new Error(`ไม่พบเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้าจากการแก้ไขเอกสาร`); }
            else {
                const prevData = findDocument.toJSON();

                let objToUpdate = {
                    updated_by: userId,
                    updated_date: currentDateTime
                };

                if (findDocument.previous('status') === 1 && (shopCustomerDebtBillingNoteDoc?.status === 0 || shopCustomerDebtBillingNoteDoc?.status === 2)) {
                    objToUpdate.status = shopCustomerDebtBillingNoteDoc.status;
                }
                else {
                    objToUpdate = {
                        ...shopCustomerDebtBillingNoteDoc,
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

        static async createOrUpdateShopCustomerDebtBillingNote_Doc_Lists (shopId = null, userId = null, shopCustomerDebtBillingNoteDoc = null, shopCustomerDebtBillingNoteLists = null, options = {}) {
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
                ShopCustomerDebtBillingNoteDoc,
                ShopCustomerDebtBillingNoteList
            } = ShopModels;

            /**
             * @type {null | { isCreated: boolean; isUpdated: boolean; previousData: ShopCustomerDebtBillingNoteDoc | null; currentData: ShopCustomerDebtBillingNoteDoc }}
             */
            let shopCustomerDebtBillingNoteDoc__Data = null;
            if (!shopCustomerDebtBillingNoteDoc?.id) {
                const createdDocument = await ShopCustomerDebtBillingNoteDoc.createShopCustomerDebtBillingNote_Doc(
                    shopId,
                    userId,
                    shopCustomerDebtBillingNoteDoc,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                shopCustomerDebtBillingNoteDoc__Data = {
                    isCreated: true,
                    isUpdated: false,
                    previousData: null,
                    currentData: createdDocument
                };
            }
            else if (isUUID(shopCustomerDebtBillingNoteDoc.id)) {
                if (!isUUID(shopCustomerDebtBillingNoteDoc.id)) {
                    throw new Error(`Require parameter shopCustomerDebtBillingNoteDoc.id must be UUID`);
                }
                else {
                    const updatedDocument = await ShopCustomerDebtBillingNoteDoc.updateShopCustomerDebtBillingNote_Doc(
                        shopId,
                        userId,
                        shopCustomerDebtBillingNoteDoc,
                        {
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    shopCustomerDebtBillingNoteDoc__Data = {
                        isCreated: false,
                        isUpdated: true,
                        previousData: updatedDocument.previousData,
                        currentData: updatedDocument.currentData
                    };

                    if (shopCustomerDebtBillingNoteDoc__Data.isUpdated && shopCustomerDebtBillingNoteDoc__Data.currentData.get('status') !== 1) {
                        return {
                            ShopCustomerDebtBillingNoteDoc: shopCustomerDebtBillingNoteDoc__Data,
                            ShopCustomerDebtBillingNoteLists: (await ShopCustomerDebtBillingNoteList.findAll({
                                where: {
                                    shop_customer_debt_bn_doc_id: shopCustomerDebtBillingNoteDoc__Data.currentData.get('id'),
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
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้าได้เนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            let shopCustomerDebtBillingNoteLists__Data = null;
            if (shopCustomerDebtBillingNoteDoc__Data?.isCreated === true && shopCustomerDebtBillingNoteDoc__Data?.isUpdated === false) {
                shopCustomerDebtBillingNoteLists__Data = await ShopCustomerDebtBillingNoteList.createOrUpdateShopCustomerDebtBillingNote_Lists(
                    shopId,
                    userId,
                    shopCustomerDebtBillingNoteDoc__Data.currentData.get('id'),
                    shopCustomerDebtBillingNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else if (shopCustomerDebtBillingNoteDoc__Data?.isCreated === false && shopCustomerDebtBillingNoteDoc__Data?.isUpdated === true) {
                shopCustomerDebtBillingNoteLists__Data = await ShopCustomerDebtBillingNoteList.createOrUpdateShopCustomerDebtBillingNote_Lists(
                    shopId,
                    userId,
                    shopCustomerDebtBillingNoteDoc__Data.currentData.get('id'),
                    shopCustomerDebtBillingNoteLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            else { throw new Error(`ไม่สร้างมารถสร้างหรือแก้ไขข้อมูลรายการใบวางบิลลูกหนี้ของลูกหนี้การค้าได้เนื่องจากการส่งชุดข้อมูลฟิวส์ไม่ตรงตามเงื่อนไข`); }

            const [
                reduce_SUM_ShopCustomerDebtLists__price_discount_bill,
                reduce_SUM_ShopCustomerDebtLists__price_discount_before_pay,
                reduce_SUM_ShopCustomerDebtLists__price_sub_total,
                reduce_SUM_ShopCustomerDebtLists__price_discount_total,
                reduce_SUM_ShopCustomerDebtLists__price_amount_total,
                reduce_SUM_ShopCustomerDebtLists__price_before_vat,
                reduce_SUM_ShopCustomerDebtLists__price_vat,
                reduce_SUM_ShopCustomerDebtLists__price_grand_total,
                reduce_SUM_ShopCustomerDebtLists__price_debt_grand_total,
                reduce_SUM_ShopCustomerDebtLists__debt_price_paid_total
            ] = await Promise.all([
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_bill'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_before_pay'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_sub_total'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_total'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_amount_total'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_before_vat'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_vat'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_grand_total'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_debt_grand_total'));
                    }
                }, 0),
                shopCustomerDebtBillingNoteLists__Data.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_amount_left'));
                    }
                }, 0),
            ]);

            shopCustomerDebtBillingNoteDoc__Data.currentData.set({
                price_discount_bill: reduce_SUM_ShopCustomerDebtLists__price_discount_bill,
                price_discount_before_pay: reduce_SUM_ShopCustomerDebtLists__price_discount_before_pay,
                price_sub_total: reduce_SUM_ShopCustomerDebtLists__price_sub_total,
                price_discount_total: reduce_SUM_ShopCustomerDebtLists__price_discount_total,
                price_amount_total: reduce_SUM_ShopCustomerDebtLists__price_amount_total,
                price_before_vat: reduce_SUM_ShopCustomerDebtLists__price_before_vat,
                price_vat: reduce_SUM_ShopCustomerDebtLists__price_vat,
                price_grand_total: reduce_SUM_ShopCustomerDebtLists__price_grand_total,
                price_debt_grand_total: Object.hasOwn(shopCustomerDebtBillingNoteDoc, 'price_debt_grand_total')
                    ? shopCustomerDebtBillingNoteDoc.price_debt_grand_total !== null
                        ? shopCustomerDebtBillingNoteDoc.price_debt_grand_total
                        : reduce_SUM_ShopCustomerDebtLists__price_debt_grand_total
                    : reduce_SUM_ShopCustomerDebtLists__price_debt_grand_total,
                debt_price_paid_total: Object.hasOwn(shopCustomerDebtBillingNoteDoc, 'debt_price_paid_total')
                    ? shopCustomerDebtBillingNoteDoc.debt_price_paid_total !== null
                        ? shopCustomerDebtBillingNoteDoc.debt_price_paid_total
                        : reduce_SUM_ShopCustomerDebtLists__debt_price_paid_total
                    : reduce_SUM_ShopCustomerDebtLists__debt_price_paid_total
            });
            await shopCustomerDebtBillingNoteDoc__Data.currentData.save({ transaction: transaction, ShopModels: ShopModels });
            await shopCustomerDebtBillingNoteDoc__Data.currentData.reload({ transaction: transaction, ShopModels: ShopModels });

            return {
                ShopCustomerDebtBillingNoteDoc: shopCustomerDebtBillingNoteDoc__Data,
                ShopCustomerDebtBillingNoteLists: shopCustomerDebtBillingNoteLists__Data
            }
        }
    }

    ShopCustomerDebtBillingNoteDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้า`,
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
            customer_credit_debt_payment_period: {
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
                comment: `จำนวนเงินชำระลูกหนี้การค้ารวมทั้งสิ้น (ยอดชำระ)`,
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
                    meta_data: { }
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
            modelName: 'ShopCustomerDebtBillingNoteDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_customer_debt_bn_doc`,
            comment: 'ตารางข้อมูลเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้า',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_cbn_doc_code_id`,
                    fields: ['code_id']
                }
            ]
        }
    );

    ShopCustomerDebtBillingNoteDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopCustomerDebtBillingNoteDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopCustomerDebtBillingNoteDoc.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopCustomerDebtBillingNoteDoc.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopCustomerDebtBillingNoteDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopCustomerDebtBillingNoteDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopBusinessCustomer,
            ShopPersonalCustomer
        } = ShopModels;


        /**
         * @param {ShopCustomerDebtBillingNoteDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDocRunNumber = async (instance, options) => {
            if (instance.isNewRecord) {
                instance.set({ code_id: `${default_doc_type_code_id}-XXXXXXXXX` });
            }
        };

        /**
         * @param {ShopCustomerDebtBillingNoteDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtBillingNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtBillingNoteDoc>} options
         */
        const hookBeforeSave_setOptionsDocumentIsCancelStatus = async (instance, options) => {
            if (instance.isNewRecord) {
                return;
            }
            else if (!instance.isNewRecord && instance.previous('status') !== 1) {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้าได้ เนื่องจากเคยยกเลิกไปแล้ว`);
            }
            else if (!instance.isNewRecord && instance.changed() && instance.previous('status') === 1 && instance.get('status') === 1) {
                return;
            }
            else if (!instance.isNewRecord && instance.changed('status') && instance.previous('status') === 1 && instance.get('status') === 2) {
                options.isCancelStatus_Doc = true;
                return;
            }
            else {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้าได้ เนื่องจากเกิดข้อผิดพลาดอื่น ๆ`);
            }
        };

        /**
         * @param {ShopCustomerDebtBillingNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtBillingNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtBillingNoteDoc>) & { isCancelStatus_Doc?: boolean; }} options
         */
        const hookBeforeSave_checkFields = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (!isUUID(instance.get('bus_customer_id')) && !isUUID(instance.get('per_customer_id'))) { throw new Error(`ต้องการข้อมูลลูกค้าธุรกิจหรือบุคคลธรรมดา`); }
            if (isUUID(instance.get('bus_customer_id')) && isUUID(instance.get('per_customer_id'))) { throw new Error(`ไม่สามารถใส่ข้อมูลลูกค้าธุรกิจและบุคคลธรรมดาพร้อมกันได้`); }

            if (isUUID(instance.get('doc_type_id'))) {
                const findDoc = await DocumentType.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('doc_type_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลประเภทเอกสาร จากการสร้างหรือแก้ไขเอกสารใบวางบิลลูกหนี้ของลูกหนี้การค้า: รายการที่ ${instance.get('seq_number')}`); }
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
        };

        /**
         * @param {ShopCustomerDebtBillingNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtBillingNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtBillingNoteDoc>) & { isCancelStatus_Doc?: boolean; }} options
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
         * @param {ShopCustomerDebtBillingNoteDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtBillingNoteDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtBillingNoteDoc>) & { isCancelStatus_Doc?: boolean; }} options
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
                        || instance.changed('bus_customer_id')
                        || instance.changed('per_customer_id')
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

    ShopCustomerDebtBillingNoteDoc.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
    });

    ShopCustomerDebtBillingNoteDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField_details__meta_data(instance, options);
    });

    return ShopCustomerDebtBillingNoteDoc;
};


module.exports = ShopCustomerDebtBillingNoteDoc;