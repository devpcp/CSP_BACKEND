/**
 * A function do dynamics table of model ShopQuotationList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_quotation_list"
 * @return An instance of model ShopQuotationList by sequelize
 */
const ShopQuotationList = (table_name = "") => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        const Model = require("sequelize").Model;
        const { DataTypes, literal } = require("sequelize");

        const db = require("../../db");

        const modelUsers = require("../model").User;
        const modelShopProfile = require("../model").ShopsProfiles;
        const modelProductPurchaseUnitType = require("../model").ProductPurchaseUnitTypes;
        const modelShopProduct = require("../model").ShopProduct(table_name);
        const modelShopQuotationDoc = require("../model").ShopQuotationDoc(table_name);

        class ShopQuotationList extends Model { }

        ShopQuotationList.init(
            {
                id: {
                    comment: `รหัสหลักตารางข้อมูลรายการใบเสนอราคา`,
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
                        model: modelShopProfile,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                doc_quotation_id: {
                    comment: `รหัสหลักตารางข้อมูลเอกสารใบเสนอราคา`,
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: modelShopQuotationDoc,
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
                product_id: {
                    comment: `รหัสตารางข้อมูลสินค้า`,
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: modelShopProduct,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'NO ACTION'
                },
                purchase_unit_id: {
                    comment: `รหัสตารางข้อมูลหน่วยนับสินค้า`,
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: modelProductPurchaseUnitType,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'NO ACTION'
                },
                dot_mfd: {
                    comment: `รหัสวันที่ผลิต (DOT)`,
                    type: DataTypes.CHAR(4),
                    allowNull: true
                },
                amount: {
                    comment: `จำนวนสินค้า`,
                    type: DataTypes.BIGINT,
                    allowNull: false,
                    defaultValue: 0
                },
                price_unit: {
                    comment: `ราคาต่อหน่วย`,
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    defaultValue: 0
                },
                price_discount: {
                    comment: `ส่วนลด (บาท)`,
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    defaultValue: 0
                },
                price_discount_percent: {
                    comment: `ส่วนลด (%)`,
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
                details: {
                    comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                    type: DataTypes.JSONB,
                    allowNull: false
                },
                status: {
                    comment: `สถานะรายการ 0 = ลบรายการ, 1 = ใช้งานรายการ`,
                    type: DataTypes.SMALLINT,
                    allowNull: false,
                    defaultValue: literal(`1`),
                    validate: {
                        isIn: [[0, 1]]
                    }
                },
                created_by: {
                    comment: `สร้างข้อมูลโดย`,
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: modelUsers,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'NO ACTION'
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
                        model: modelUsers,
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
                },
            },
            {
                sequelize: db,
                modelName: 'ShopQuotationList',
                tableName: `dat_${table_name}_quotation_list`,
                schema: 'app_shops_datas',
                timestamps: false,
                comment: 'ตารางข้อมูลรายการใบเสนอราคา'
            }
        );

        ShopQuotationList.belongsTo(modelShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
        ShopQuotationList.belongsTo(modelShopQuotationDoc, { foreignKey: 'doc_quotation_id', as: 'ShopQuotationDoc' });
        ShopQuotationList.belongsTo(modelShopProduct, { foreignKey: 'product_id', as: 'ShopProduct' });
        ShopQuotationList.belongsTo(modelProductPurchaseUnitType, { foreignKey: 'purchase_unit_id', as: 'ProductPurchaseUnitType' });
        ShopQuotationList.belongsTo(modelUsers, { foreignKey: 'created_by', as: 'CreatedBy' });
        ShopQuotationList.belongsTo(modelUsers, { foreignKey: 'updated_by', as: 'UpdatedBy' });

        return ShopQuotationList;
    }
};

module.exports = ShopQuotationList;