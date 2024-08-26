/**
 * A function do dynamics table of model ShopTaxInvoiceDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_tax_invoice_doc"
 */
const ShopTaxInvoiceDoc = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Op } = require("sequelize");

    const db = require("../../db");

    const User = require("../Users/User");
    const ShopProfile = require("../model").ShopsProfiles;
    const DocumentType = require("../model").DocumentTypes;
    const TaxType = require("../model").TaxTypes;
    const ShopDocumentCode = require("../model").ShopDocumentCode(table_name);
    const ShopBusinessCustomer = require("../model").ShopBusinessCustomers(table_name);
    const ShopPersonalCustomer = require("../model").ShopPersonalCustomers(table_name);
    const ShopVehicleCustomer = require("../model").ShopVehicleCustomer(table_name);
    const ShopServiceOrderDoc = require("../model").ShopServiceOrderDoc(table_name);

    class ShopTaxInvoiceDoc extends Model {
        /**
         * สร้างเอกสารใบกำกับภาษี
         * @param shop_service_order_doc_id {string} รหัสหลักตารางข้อมูลเอกสารใบกำกับภาษี
         * @param options {{
         *  abb_doc_type_id?: string;
         *  abb_doc_date?: Date | string;
         *  is_abb?: boolean;
         *  inv_doc_type_id?: string;
         *  inv_doc_date?: Date | string;
         *  is_inv?: boolean;
         *  doc_date?: Date | string;
         *  created_by?: string;
         *  created_date?: Date;
         *  currentDateTime?: Date;
         *  ShopModels?: Object;
         *  transaction?: import("sequelize").Transaction
         * }}
         * @return {Promise<{ ShopTaxInvoiceDoc: ShopTaxInvoiceDoc; ShopTaxInvoiceLists: Array<ShopTaxInvoiceList>; }>}
         */
        static async createFromShopServiceOrderDoc(shop_service_order_doc_id, options = {}) {
            if (!shop_service_order_doc_id) { throw new Error(`Require parameter 'shop_tax_invoice_doc_id'`); }

            const currentDateTime = options?.currentDateTime || new Date();
            const transaction = options?.transaction || null;
            const ShopModels = options?.ShopModels || require("../model").initShopModel(table_name);

            const {
                ShopServiceOrderDoc,
                ShopTaxInvoiceDoc,
                ShopTaxInvoiceList
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
                throw new Error(`ไม่อนุญาตให้สร้างใบกำกับภาษีเนื่องจากเอกสารใบสั่งซ่อมได้ถูกยกเลิกหรือลบไปแล้ว`);
            }

            const findShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                where: {
                    shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findShopTaxInvoiceDoc) {
                throw new Error(`ไม่อนุญาตให้สร้างใบกำกับภาษีเนื่องจากเอกสารใบกำกับภาษีได้สร้างไว้ก่อนหน้านี้แล้ว`);
            }

            const createdShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.create(
                {
                    shop_id: findShopServiceOrderDoc.get('shop_id'),
                    abb_doc_type_id: options?.abb_doc_type_id || null,
                    abb_doc_date: options?.doc_date || null,
                    is_abb: options?.is_abb || false,
                    inv_doc_type_id: options?.inv_doc_type_id || null,
                    inv_doc_date: options?.doc_date || null,
                    is_inv: options?.is_inv || false,
                    shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
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
                    created_by: options?.created_by || findShopServiceOrderDoc.get('created_by'),
                    created_date: options?.created_date || currentDateTime,
                },
                {
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            const createdShopTaxInvoiceLists = await ShopTaxInvoiceList.createFromShopTaxInvoiceDoc(
                createdShopTaxInvoiceDoc.get('id'),
                {
                    created_by: options?.created_by || findShopServiceOrderDoc.get('created_by'),
                    created_date: options?.created_date || currentDateTime,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            return {
                ShopTaxInvoiceDoc: createdShopTaxInvoiceDoc,
                ShopTaxInvoiceLists: createdShopTaxInvoiceLists
            };
        }
    }

    ShopTaxInvoiceDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบกำกับภาษี`,
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
            abb_code_id: {
                comment: `รหัสเลขที่เอกสารใบกำกับภาษีอย่างย่อ`,
                type: DataTypes.STRING,
                allowNull: true
            },
            abb_code_id_prefix: {
                comment: `รหัสนำหน้าเลขที่เอกสารใบกำกับภาษีอย่างย่อ`,
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'ABB'
            },
            abb_doc_type_code_id: {
                comment: 'รหัสประเภทเอกสารใบกำกับภาษีอย่างย่อ',
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'ABB'
            },
            abb_doc_type_id: {
                comment: `รหัสตารางข้อมูลประเภทเอกสารของเอกสารใบกำกับภาษีอย่างย่อ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: DocumentType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            abb_doc_date: {
                comment: `วันที่เอกสารใบกำกับภาษีอย่างย่อ`,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            is_abb: {
                comment: `เอกสารนี้เป็นใบกำกับภาษีอย่างย่อหรือไม่`,
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            inv_code_id: {
                comment: `รหัสเลขที่เอกสารใบกำกับภาษีเต็มรูป`,
                type: DataTypes.STRING,
                allowNull: true
            },
            inv_code_id_prefix: {
                comment: `รหัสนำหน้าเลขที่เอกสารใบกำกับภาษีเต็มรูป`,
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'INV'
            },
            inv_doc_type_code_id: {
                comment: `รหัสประเภทเอกสารใบกำกับภาษีเต็มรูป`,
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'INV'
            },
            inv_doc_type_id: {
                comment: `รหัสตารางข้อมูลประเภทเอกสารของเอกสารใบกำกับภาษีเต็มรูป`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: DocumentType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            inv_doc_date: {
                comment: `วันที่เอกสารใบกำกับภาษีเต็มรูป`,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            is_inv: {
                comment: `เอกสารนี้เป็นใบกำกับภาษีเต็มรูปหรือไม่`,
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    ref_doc: '',
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
            modelName: 'ShopTaxInvoiceDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_tax_invoice_doc`,
            comment: 'ตารางข้อมูลเอกสารใบกำกับภาษี',
            timestamps: false
        }
    );

    ShopTaxInvoiceDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopTaxInvoiceDoc.belongsTo(DocumentType, { foreignKey: 'abb_doc_type_id', as: 'DocumentTypeABB' });
    ShopTaxInvoiceDoc.belongsTo(DocumentType, { foreignKey: 'inv_doc_type_id', as: 'DocumentTypeINV' });
    ShopTaxInvoiceDoc.belongsTo(ShopServiceOrderDoc, { foreignKey: 'shop_service_order_doc_id', as: 'ShopServiceOrderDoc' });
    ShopTaxInvoiceDoc.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopTaxInvoiceDoc.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopTaxInvoiceDoc.belongsTo(ShopVehicleCustomer, { foreignKey: 'vehicle_customer_id', as: 'ShopVehicleCustomer' });
    ShopTaxInvoiceDoc.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopTaxInvoiceDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopTaxInvoiceDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (ShopModels = null) => {
        const {
            ShopServiceOrderDoc,
            ShopPaymentTransaction,
        } = ShopModels || require("../model").initShopModel(table_name);

        /**
         * @param {ShopTaxInvoiceDoc} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const hookBeforeSave_mutationDocRunNumber = async (instance, options) => {
            const transaction = options?.transaction || null;

            if (instance.isNewRecord) {
                if (instance.get('is_abb') === true) {
                    const objPrefixDocCode = await utilGetDocumentTypePrefix(
                        instance.get('abb_doc_type_id') || null,
                        {
                            transaction: transaction,
                            defaultPrefix: instance.get('abb_code_id_prefix')
                        }
                    );
                    instance.set('abb_code_id_prefix', objPrefixDocCode.prefix);

                    const createdShopDocumentCode = await ShopDocumentCode.create(
                        {
                            shop_id: instance.get('shop_id'),
                            doc_type_code: instance.get('abb_code_id_prefix')
                        },
                        {
                            transaction: transaction
                        }
                    );
                    instance.set('abb_code_id', createdShopDocumentCode.get('code_id'));

                    if (!instance.get('abb_doc_date')) {
                        instance.set('abb_doc_date', new Date());
                    }
                }

                if (instance.get('is_inv') === true) {
                    const objPrefixDocCode = await utilGetDocumentTypePrefix(
                        instance.get('inv_doc_type_id') || null,
                        {
                            transaction: transaction,
                            defaultPrefix: instance.get('inv_code_id_prefix')
                        }
                    );
                    instance.set('inv_code_id_prefix', objPrefixDocCode.prefix);

                    const createdShopDocumentCode = await ShopDocumentCode.create(
                        {
                            shop_id: instance.get('shop_id'),
                            doc_type_code: instance.get('inv_code_id_prefix'),
                        },
                        {
                            transaction: transaction
                        }
                    );
                    instance.set('inv_code_id', createdShopDocumentCode.get('code_id'));

                    if (!instance.get('inv_doc_date')) {
                        instance.set('inv_doc_date', new Date());
                    }
                }
            }
            else {
                if (instance.changed('is_abb') === true
                    && instance.previous('is_abb') === false
                    && instance.get('is_abb') === true
                ) {
                    const objPrefixDocCode = await utilGetDocumentTypePrefix(
                        instance.get('abb_doc_type_id') || null,
                        {
                            transaction: transaction,
                            defaultPrefix: instance.get('abb_code_id_prefix')
                        }
                    );
                    instance.set('abb_code_id_prefix', objPrefixDocCode.prefix);

                    const createdShopDocumentCode = await ShopDocumentCode.create(
                        {
                            shop_id: instance.get('shop_id'),
                            doc_type_code: instance.get('abb_code_id_prefix'),
                        },
                        {
                            transaction: transaction
                        }
                    );
                    instance.set('abb_code_id', createdShopDocumentCode.get('code_id'));

                    if (!instance.get('abb_doc_date')) {
                        instance.set('abb_doc_date', new Date());
                    }
                }

                if (instance.changed('is_inv') === true
                    && instance.previous('is_inv') === false
                    && instance.get('is_inv') === true
                ) {
                    const objPrefixDocCode = await utilGetDocumentTypePrefix(
                        instance.get('inv_doc_type_id') || null,
                        {
                            transaction: transaction,
                            defaultPrefix: instance.get('inv_code_id_prefix')
                        }
                    );
                    instance.set('inv_code_id_prefix', objPrefixDocCode.prefix);

                    const createdShopDocumentCode = await ShopDocumentCode.create(
                        {
                            shop_id: instance.get('shop_id'),
                            doc_type_code: instance.get('inv_code_id_prefix'),
                        },
                        {
                            transaction: transaction
                        }
                    );
                    instance.set('inv_code_id', createdShopDocumentCode.get('code_id'));

                    if (!instance.get('inv_doc_date')) {
                        instance.set('inv_doc_date', new Date());
                    }
                }
            }
        };

        /**
         * @param {ShopTaxInvoiceDoc} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const hookBeforeSave_mutationFromModelShopServiceOrderDocField__details = async (instance, options) => {
            if (instance.isNewRecord) {
                const transaction = options?.transaction || null;

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: instance.get('shop_service_order_doc_id')
                    },
                    transaction: transaction
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาตแก้ไข Meta data ของเอกสารใบกำกับภาษีเนื่องจากเอกสารใบสั่งซ่อมได้ถูกยกเลิกหรือลบไปแล้ว`);
                }

                const objDetails = {
                    ...(instance.get('details') || {}),
                    ...(findShopServiceOrderDoc.get('details') || {})
                };

                instance.set({
                    details: objDetails
                });
            }
        };

        /**
         * @param {ShopTaxInvoiceDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopTaxInvoiceDoc> | import("sequelize/types/model").SaveOptions<ShopTaxInvoiceDoc>} options
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
                        shop_tax_invoice_doc_id: instance.get('id'),
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
                            canceled_payment_reasons: 'ยกเลิกเอกสารใบกำกับภาษี',
                        },
                        updated_by: instance.get('updated_by'),
                        updated_date: instance.get('updated_date')
                    });
                    await element.save({ transaction: transaction });
                }
            }
        };

        return {
            hookBeforeSave_mutationDocRunNumber,
            hookBeforeSave_mutationFromModelShopServiceOrderDocField__details,
            hookBeforeSave_mutationWhenThisDocumentSetToCancel
        };
    };

    ShopTaxInvoiceDoc.beforeValidate((instance, options) => {
        instance.myHookFunctions = hookFunctions(options?.ShopModels);
    });

    ShopTaxInvoiceDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationFromModelShopServiceOrderDocField__details(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationWhenThisDocumentSetToCancel(instance, options);
    });

    return ShopTaxInvoiceDoc;
};


module.exports = ShopTaxInvoiceDoc;