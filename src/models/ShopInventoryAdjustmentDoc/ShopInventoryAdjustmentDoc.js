/**
 * A function do dynamics table of model ShopInventoryAdjustmentDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_inventory_adjustment_doc"
 * @return An instance of model ShopInventoryAdjustmentDoc by sequelize
 */
const ShopInventoryAdjustmentDoc = (table_name = "") => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        const Model = require("sequelize").Model;
        const { DataTypes, literal } = require("sequelize");

        const db = require("../../db");

        const modelUser = require("../model").User;
        const modelShopProfile = require("../model").ShopsProfiles;
        const modelDocumentType = require("../model").DocumentTypes;
        const modelTaxType = require("../model").TaxTypes;
        const modelShopBusinessCustomer = require("../model").ShopBusinessCustomers(table_name);
        const modelShopPersonalCustomer = require("../model").ShopPersonalCustomers(table_name);
        const modelShopBusinessPartner = require("../model").ShopBusinessCustomers(table_name);

        class ShopInventoryAdjustmentDoc extends Model { }

        ShopInventoryAdjustmentDoc.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
                allowNull: false,
                primaryKey: true,
                comment: `รหัสหลักตารางข้อมูลเอกสารใบปรับปรุงสินค้า InventoryAdjustment Document (ADJ Doc)`
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfile,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลร้านค้า\n`
                    + `Foreign key: app_datas.dat_shops_profiles.id`
            },
            doc_type_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelDocumentType,
                    key: 'id'
                },
                comment: `รหัสประเภทเอกสาร\n`
                    + `Foreign key: master_lookup.mas_document_types.id`
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

            doc_purchase_order_id: {
                comment: `รหัสตารางเอกสารใบสั่งซื้อสินค้า`,
                type: DataTypes.UUID,
                allowNull: false
            },

            doc_invenotry_import_id: {
                comment: `รหัสตารางใบรับเข้าสินค้า`,
                type: DataTypes.UUID,
                allowNull: false
            },

            doc_inventory_adjust_user_id: {
                comment: `รหัสตารางผู้ใช้งาน ผู้ปรับปรุงสินค้า`,
                type: DataTypes.UUID,
                allowNull: false
            },

            approve_status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[1, 2, 3, 4]]
                },
                comment: `สถานะอนุมัติ`
                    + `\n1 = รอพิจารณา`
                    + `\n2 = อนุมัติ`
                    + `\n3 = ไม่อนุมัติ`
                    + `\n4 = อนุมัติอัตโนมัติ`
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
                    + `Foreign key: systems.sysm_users.id`
            },
            details: {
                type: DataTypes.JSONB,
                allowNull: false,
                comment: 'รายละเอียดเพิ่มเติมของเอกสาร แต่จะมี Key ที่สำคัญ ๆ ดังนี้\n'
                    + '{\n' +
                    '    "ref_doc": "เลขที่เอกสารอ้างอิง, เก็บเป็น string"\n' +
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
                comment: `สร้างข้อมูลโดย`
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
                comment: `ปรับปรุงข้อมูลโดย`
            },
        }, {
            sequelize: db,
            modelName: 'ShopInventoryAdjustmentDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_inventory_adjustment_doc`,
            comment: 'ตารางข้อมูลเอกสารใบปรับปรุงสินค้า InventoryAdjustment Document (ADJ Doc)',
            timestamps: false,
        });

        ShopInventoryAdjustmentDoc.belongsTo(modelShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
        ShopInventoryAdjustmentDoc.belongsTo(modelDocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
        ShopInventoryAdjustmentDoc.belongsTo(modelShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
        ShopInventoryAdjustmentDoc.belongsTo(modelShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
        ShopInventoryAdjustmentDoc.belongsTo(modelShopBusinessPartner, { foreignKey: 'business_partner_id', as: 'ShopBusinessPartner' });
        ShopInventoryAdjustmentDoc.belongsTo(modelTaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
        ShopInventoryAdjustmentDoc.belongsTo(modelUser, { foreignKey: 'approve_user_id', as: 'ApproveUser' });
        ShopInventoryAdjustmentDoc.belongsTo(modelUser, { foreignKey: 'created_by', as: 'CreatedByUser' });
        ShopInventoryAdjustmentDoc.belongsTo(modelUser, { foreignKey: 'updated_by', as: 'UpdatedByUser' });

        /**
         * @param {ShopInventoryAdjustmentDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const createRunNumber = async (instance, options) => {
            const currentRunNumber = await ShopInventoryAdjustmentDoc.max('run_no', { transaction: options.transaction });
            instance.set('run_no', currentRunNumber + 1 + (options.initNumber || 0));
        };

        ShopInventoryAdjustmentDoc.beforeValidate(async (instance, options) => {
            await priceSerializer(instance, options);
            if (instance.isNewRecord) {
                instance.set('run_no', -1);
                instance.set('code_id', -1);
            }
        });

        ShopInventoryAdjustmentDoc.beforeCreate(async (instance, options) => {
            await validatorInstanceField_Price(instance, options);
            await validateInstanceField_Price_validateCalculation(instance, options);
            await createRunNumber(instance, options);
            await createCodeId(instance, options);
        });

        ShopInventoryAdjustmentDoc.beforeSave(async (instance, options) => {
            if (!instance.isNewRecord) {
                await validateReqChangeInstanceField(instance, options);
            }
        });

        ShopInventoryAdjustmentDoc.beforeUpdate(async (instance, options) => {
            if (!instance.isNewRecord) {
                await validateReqChangeInstanceField(instance, options);
            }
        });

        return ShopInventoryAdjustmentDoc;
    }
};

module.exports = ShopInventoryAdjustmentDoc;