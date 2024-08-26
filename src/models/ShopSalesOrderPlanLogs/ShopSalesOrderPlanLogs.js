/**
 * A function do dynamics table of model ShopSalesOrderPlanLogs
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_sales_order_plan_logs"
 */
const ShopSalesOrderPlanLogs = (table_name = "") => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        const Model = require("sequelize").Model;
        const { DataTypes, literal } = require("sequelize");

        const db = require("../../db");

        const modelUsers = require("../model").User;
        const modelShopProfiles = require("../model").ShopsProfiles;
        const modelShopProducts = require("../model").ShopProduct(table_name);
        const modelShopSalesTransactionDoc = require("../model").ShopSalesTransactionDoc(table_name);

        class ShopSalesOrderPlanLogs extends Model { }

        ShopSalesOrderPlanLogs.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
                allowNull: false,
                primaryKey: true,
                comment: `รหัสหลักตารางข้อมูลการจัดการสินค้าในคลัง`
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfiles,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลร้านค้า`
            },
            product_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProducts,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลสินค้า`
            },
            warehouse_detail: {
                type: DataTypes.JSON,
                allowNull: false,
                comment: 'ระบบการจองสินค้าจากคลังสินค้าเก็บเป็น JSON\n' +
                    '{\n' +
                    ' "warehouse":"uuid",\n' +
                    ' "shelf":[{"item":"num shelf 1", "amount":"จำนวนสินค้า"},{"item":"num shelf 2", "amount":"จำนวนสินค้า", "dot_mfd":"วันที่ผลิตหรือสัปดาห์การผลิต","purchase_unit_id":"UUID ของหน่อยซื้อ"}]\n' +
                    '}'
            },
            amount: {
                type: DataTypes.BIGINT,
                allowNull: false,
                comment: `จำนวนนับรวมสินค้าที่จะเบิก`
            },
            doc_sale_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopSalesTransactionDoc,
                    key: 'id'
                },
                comment: `รหัสหลักตารางข้อมูลเอกสาร`
            },
            details: {
                type: DataTypes.JSON,
                allowNull: false,
                comment: 'รายละเอียดข้อมูลสินค้าในการซ่อมครั้งนั้นๆ\n' +
                    'Ex.\n' +
                    '{\n' +
                    '  "price":"1000",\n' +
                    '  "discount_percentage_1":"2",\n' +
                    '  "discount_percentage_2":"0",\n' +
                    '  "discount_thb":"980"\n' +
                    '}'
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: literal(`1`),
                validate: {
                    isIn: [[0, 1, 2]]
                },
                comment: `สถานะเอกสาร 0 = ยกเลิก, 1 = อยู่ระหว่างดำเนินการ, 2 = ดำเนินการเรียบร้อย`
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelUsers,
                    key: 'id'
                },
                comment: `สร้างข้อมูลโดย`
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal(`now()`),
                comment: `สร้างข้อมูลวันที่`
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelUsers,
                    key: 'id'
                },
                comment: `ปรับปรุงข้อมูลโดย`
            },
            updated_date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
                comment: `ปรับปรุงข้อมูลวันที่`
            },
        }, {
            sequelize: db,
            modelName: 'ShopSalesOrderPlanLogs',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_sales_order_plan_logs`,
            comment: 'ตารางข้อมูลการจัดการสินค้าในคลัง บันทึกเป็น Logs',
            timestamps: false,
        });

        ShopSalesOrderPlanLogs.belongsTo(modelShopProfiles, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
        ShopSalesOrderPlanLogs.belongsTo(modelShopProducts, { foreignKey: 'product_id', as: 'ShopProducts' });
        ShopSalesOrderPlanLogs.belongsTo(modelShopSalesTransactionDoc, { foreignKey: 'doc_sale_id', as: 'ShopSalesTransactionDoc' });
        ShopSalesOrderPlanLogs.belongsTo(modelUsers, { foreignKey: 'created_by' });
        ShopSalesOrderPlanLogs.belongsTo(modelUsers, { foreignKey: 'updated_by' });

        return ShopSalesOrderPlanLogs;
    }
};

module.exports = ShopSalesOrderPlanLogs;