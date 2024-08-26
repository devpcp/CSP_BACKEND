/**
 * A function do dynamics table of model ShopPurchaseOrderDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_purchase_order_doc"
 * @return An instance of model ShopPurchaseOrderDoc by sequelize
 */
const ShopPurchaseOrderDoc = (table_name = "") => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        const Model = require("sequelize").Model;
        const { DataTypes, literal, Transaction } = require("sequelize");

        const db = require("../../db");

        const _ = require("lodash");
        const utilGetRunNumberFromModel = require("../../utils/util.GetRunNumberFromModel");
        const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");

        const modelShopProfile = require("../model").ShopsProfiles;
        const modelUser = require("../model").User;
        const modelDocumentType = require("../model").DocumentTypes;
        const modelTaxType = require("../model").TaxTypes;
        const modelShopBusinessCustomer = require("../model").ShopBusinessCustomers(table_name);
        const modelShopPersonalCustomer = require("../model").ShopPersonalCustomers(table_name);
        const modelShopBusinessPartner = require("../model").ShopBusinessPartners(table_name);

        const { config_run_number_shop_purchase_order_prefix: defaultPrefixDoc } = require("../../config");

        class ShopPurchaseOrderDoc extends Model { }

        ShopPurchaseOrderDoc.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
                allowNull: false,
                primaryKey: true,
                comment: `รหัสหลักตารางข้อมูลเอกสารใบสั่งซื้อ PurchaseOrder Document (PO Doc)`
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfile,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลร้านค้า\n`
                    + `Foreign key: app_datas.dat_shops_profiles.id`,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            doc_type_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelDocumentType,
                    key: 'id'
                },
                comment: `รหัสประเภทเอกสาร\n`
                    + `Foreign key: master_lookup.mas_document_types.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            run_no: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: `เลขที่ Running number ของเอกสาร`
            },
            code_id: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: `รหัสเลขที่เอกสาร`
            },
            doc_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                comment: `วันที่เอกสาร`
            },
            purchase_requisition_id: {
                type: DataTypes.UUID,
                allowNull: true,
                comment: `รหัสตารางข้อมูลใบขอซื้อ\n`
                    + `Foreign key: app_shops_datas.dat_${table_name}_purchase_requisition_doc.id`
            },
            per_customer_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopPersonalCustomer,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา\n`
                    + `Foreign key: app_shops_datas.dat_${table_name}_personal_customers.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            bus_customer_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopBusinessCustomer,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลลูกค้าธุรกิจ\n`
                    + `Foreign key: app_shops_datas.dat_${table_name}_business_customers.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            business_partner_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopBusinessPartner,
                    key: 'id'
                },
                comment: `รหัสตารางธุรกิจคู่ค้า\n`
                    + `Foreign key: app_shops_datas.dat_${table_name}_business_partners.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            tax_type_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelTaxType,
                    key: 'id'
                },
                comment: `ประเภทภาษี\n`
                    + `Foreign key: master_lookup.mas_tax_types.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            vat_type: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[1, 2, 3]]
                },
                comment: `ประเภทภาษีมูลค่าเพิ่ม (Vat types)`
                    + `\n1 = รวมภาษีมูลค่าเพิ่ม`
                    + `\n2 = ไม่รวมภาษีมูลค่าเพิ่ม`
                    + `\n3 = ไม่คิดภาษีมูลค่าเพิ่ม`
            },
            vat_value: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: `อัตราภาษีมูลค่าเพิ่ม`
            },
            price_discount_bill: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: `ส่วนลดท้ายบิล`
            },
            price_sub_total: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: `รวมเป็นเงิน`
            },
            price_discount_total: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: `ส่วนลดรวม`
            },
            price_amount_total: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: `ราคาหลังหักส่วนลด`
            },
            price_before_vat: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: `ราคาก่อนรวมภาษี`
            },
            price_vat: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: `ภาษีมูลค่าเพิ่ม`
            },
            price_grand_total: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: `จำนวนเงินรวมทั้งสิ้น`
            },
            approve_status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: literal(`1`),
                validate: {
                    isIn: [[0, 1, 2, 3]]
                },
                comment: `สถานะอนุมัติ`
                    + `\n1 = รอพิจารณา`
                    + `\n2 = อนุมัติ`
                    + `\n3 = ไม่อนุมัติ`
            },
            approve_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                comment: `วันที่อนุมัติ`
            },
            approve_user_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelUser,
                    key: 'id'
                },
                comment: `ผู้อนุมัติ\n`
                    + `Foreign key: systems.sysm_users.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            details: {
                type: DataTypes.JSONB,
                allowNull: false,
                comment: 'รายละเอียดเพิ่มเติมของเอกสาร แต่จะมี Key ที่สำคัญ ๆ ดังนี้\n'
                    + '{\n' +
                    '    "ref_doc": "เลขที่เอกสารอ้างอิง, เก็บเป็น string"\n' +
                    '    "business_partner_name": "ธุรกิจคู่ค้า ชื่อ - เอากรณีไม่ระบุ, เก็บเป็น string"\n' +
                    '    "business_partner_address": "ธุรกิจคู่ค้า ที่อยู่ - เอากรณีไม่ระบุ, เก็บเป็น string"\n' +
                    '    "approve_name": "ผู้อนุมัติ ชื่อ - เอากรณีไม่ระบุชื่อ, เก็บเป็น string"\n' +
                    '}'
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: literal(`1`),
                validate: {
                    isIn: [[0, 1, 2]]
                },
                comment: `สถานะเอกสาร 0 = ลบเอกสาร, 1 = ใช้งานเอกสาร, 2 = ยกเลิกเอกสาร`
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal(`now()`),
                comment: `สร้างข้อมูลวันที่`
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelUser,
                    key: 'id'
                },
                comment: `สร้างข้อมูลโดย`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            updated_date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
                comment: `ปรับปรุงข้อมูลวันที่`
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelUser,
                    key: 'id'
                },
                comment: `ปรับปรุงข้อมูลโดย`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
        }, {
            sequelize: db,
            modelName: 'ShopPurchaseOrderDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_purchase_order_doc`,
            comment: 'ตารางข้อมูลเอกสารใบสั่งซื้อ PurchaseOrder Document (PO Doc)',
            timestamps: false,
        });

        ShopPurchaseOrderDoc.belongsTo(modelShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
        ShopPurchaseOrderDoc.belongsTo(modelDocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
        ShopPurchaseOrderDoc.belongsTo(modelShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
        ShopPurchaseOrderDoc.belongsTo(modelShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
        ShopPurchaseOrderDoc.belongsTo(modelShopBusinessPartner, { foreignKey: 'business_partner_id', as: 'ShopBusinessPartner' });
        ShopPurchaseOrderDoc.belongsTo(modelTaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
        ShopPurchaseOrderDoc.belongsTo(modelUser, { foreignKey: 'approve_user_id', as: 'ApproveUser' });
        ShopPurchaseOrderDoc.belongsTo(modelUser, { foreignKey: 'created_by', as: 'CreatedByUser' });
        ShopPurchaseOrderDoc.belongsTo(modelUser, { foreignKey: 'updated_by', as: 'UpdatedByUser' });

        /**
         * @param {ShopPurchaseOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const preCreateRunNumber = (instance, options) => {
            if (instance.isNewRecord) {
                instance.set('run_no', 0);
                instance.set('code_id', 'QOU');
            }
        };

        /**
         * @param {ShopPurchaseOrderDoc} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const createRunNumber = async (instance, options) => {
            if (instance.isNewRecord) {
                await db.transaction(
                    {
                        transaction: options.transaction,
                        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                    },
                    async (t) => {
                        const createRunNumber = await utilGetRunNumberFromModel(
                            ShopPurchaseOrderDoc,
                            'run_no',
                            {
                                transaction: t,
                                prefix_config: (await utilGetDocumentTypePrefix(
                                    instance.get('doc_type_id'),
                                    {
                                        transaction: t,
                                        defaultPrefix: defaultPrefixDoc
                                    }
                                )).prefix
                            }
                        );
                        instance.set('run_no', createRunNumber.runNumber);
                        instance.set('code_id', createRunNumber.runString);
                    }
                )
            }
        };

        /**
         * @param {ShopPurchaseOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const preVatTypeSerializer = (instance, options) => {
            if (instance.isNewRecord) {
                switch (instance.get('tax_type_id')) {
                    // 8c73e506-31b5-44c7-a21b-3819bb712321 = รวม Vat (1)
                    case '8c73e506-31b5-44c7-a21b-3819bb712321': {
                        instance.set('vat_type', 1);
                        break;
                    }
                    // fafa3667-55d8-49d1-b06c-759c6e9ab064 = ไม่รวม Vat (2)
                    case 'fafa3667-55d8-49d1-b06c-759c6e9ab064': {
                        instance.set('vat_type', 2);
                        break;
                    }
                    // 52b5a676-c331-4d03-b650-69fc5e591d2c = ไม่คิด Vat (3)
                    case '52b5a676-c331-4d03-b650-69fc5e591d2c': {
                        instance.set('vat_type', 3);
                        break;
                    }
                    default: {
                        instance.set('vat_type', 0);
                        break;
                    }
                }
            }
        };

        /**
         * @param {ShopPurchaseOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const priceTypeValidator = (instance, options) => {
            if (instance.isNewRecord) {
                const priceTypeData = [
                    'vat_value',
                    'price_discount_bill',
                    'price_sub_total',
                    'price_discount_total',
                    'price_amount_total',
                    'price_before_vat',
                    'price_vat',
                    'price_grand_total'
                ];

                for (let i = 0; i < priceTypeData.length; i++) {
                    if (!_.isFinite(Number(instance.get(priceTypeData[i]))) || Number(instance.get(priceTypeData[i])) < 0) {
                        throw Error(`ShopQuotationDoc: Variable 'price_type' ${priceTypeData[i]} is not a number Price`);
                    }
                }
            }
        };

        ShopPurchaseOrderDoc.beforeValidate((instance, options) => {
            preCreateRunNumber(instance, options);
            // preVatTypeSerializer(instance, options);
            // priceTypeValidator(instance, options);
        });

        ShopPurchaseOrderDoc.beforeCreate(async (instance, options) => {
            if (instance.isNewRecord) {
                instance.set('doc_quotation_code_id', 1);
            }
            await createRunNumber(instance, options);
        });

        return ShopPurchaseOrderDoc;
    }
};

module.exports = ShopPurchaseOrderDoc;