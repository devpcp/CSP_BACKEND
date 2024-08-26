/**
 * A function do dynamics table of model ShopInventory
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_inventory_management_logs"
 * @return An instance of model ShopInventory by sequelize
 */
const ShopInventory = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require('../../db');

    const modelShopsProfiles = require('../ShopsProfiles/ShopsProfiles');
    const modelUser = require('../Users/User');
    const modelShopInventoryTransaction = require('../ShopInventoryTransaction/ShopInventoryTransaction')(table_name);
    const modelShopProduct = require('../ShopProduct/ShopProduct')(table_name);

    class ShopInventory extends Model { }

    ShopInventory.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลการจัดการสินค้าในคลัง`
        },
        shop_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลร้านค้า`
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลสินค้า`
        },
        warehouse_detail: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: `คลังสินค้าเก็บเป็น JSON
            {
             "warehouse":"uuid",
             "shelf":[{"item":"num shelf 1", "amount":"จำนวนสินค้า"},{"item":"num shelf 2", "amount":"จำนวนสินค้า"}]
            }`
        },
        amount: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: `จำนวนสินค้าที่เก็บเข้าคลัง`
        },
        import_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: `วันเวลานำเข้าคลัง`
        },
        doc_inventory_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสหลักตารางข้อมูลเอกสาร`
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: `รายละเอียดข้อมูลสินค้าในการนำเข้าคลังครั้งนั้นๆ เช่นข้อมูลราคาซื้อสินค้าเข้าคลัง
            Ex.
            {
              "price":"1000",
              "discount_percentage_1":"2",
              "discount_percentage_2":"0",
              "discount_thb":"980"
            }`
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            comment: `สถานะการนำเข้าสินค้าสู่คลัง 0 = ยกเลิก, 1 = นำเข้าปกติ, 2 = ปรับเพิ่ม, 3 = ปรับลด, 4 = โอนสินค้า`
        },
        doc_num: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: `หมายเลขเอกสาร`
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `สร้างข้อมูลโดย`
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: `สร้างข้อมูลวันที่`
        }
    }, {
        sequelize: db,
        modelName: 'ShopInventory',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_inventory_management_logs`,
        comment: 'ตารางข้อมูลการจัดการสินค้าในคลัง บันทึกเป็น Logs',
        timestamps: false,
        updated_date: false,
        updated_by: false,
    });

    modelShopsProfiles.hasOne(ShopInventory, { foreignKey: 'shop_id' });
    ShopInventory.belongsTo(modelShopsProfiles, { foreignKey: 'shop_id' });

    modelShopProduct.hasOne(ShopInventory, { foreignKey: 'product_id' });
    ShopInventory.belongsTo(modelShopProduct, { foreignKey: 'product_id' });

    modelShopInventoryTransaction.hasOne(ShopInventory, { foreignKey: 'doc_inventory_id' });
    ShopInventory.belongsTo(modelShopInventoryTransaction, { foreignKey: 'doc_inventory_id' });
    ShopInventory.belongsTo(modelShopInventoryTransaction, { foreignKey: 'doc_inventory_id', as: 'ShopInventoryImportList' });

    ShopInventory.belongsTo(modelUser, { foreignKey: 'created_by' });

    return ShopInventory;
};


module.exports = ShopInventory;