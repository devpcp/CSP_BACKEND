/**
 * A function do dynamics table of model ShopProductPriceLog
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_products_price_logs"
 * @return An instance of model ShopProductPriceLog by sequelize
 */
const ShopProductPriceLog = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const User = require("../model").User;
    const ShopProduct = require("../model").ShopProduct(table_name);

    class ShopProductPriceLog extends Model { }

    ShopProductPriceLog.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสข้อมูลสินค้าของร้านค้า`
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: `วันที่เริ่มต้นใช้ข้อมูลราคา`
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: `วันที่สินสุดการใช้ข้อมูลราคา`
        },
        price: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: `ข้อมูลราคาขายสินค้าเก็บเป็น JSON ใส่ข้อมูลราคาได้หายแบบ`
        },
        isuse: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: `สถานะการใช้งานข้อมูล 0=ยกเลิก, 1=ใช้งาน, 2=ลบลงถังขยะ`
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
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `ปรับปรุงข้อมูลโดย`
        },
        updated_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: `ปรับปรุงข้อมูลวันที่`
        }
    }, {
        sequelize: db,
        modelName: 'ShopProductPriceLog',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_products_price_logs`,
    });

    ShopProduct.hasMany(ShopProductPriceLog, { foreignKey: 'product_id' })
    ShopProductPriceLog.belongsTo(ShopProduct, { foreignKey: 'product_id' })

    ShopProductPriceLog.belongsTo(User, { foreignKey: 'created_by' });
    ShopProductPriceLog.belongsTo(User, { foreignKey: 'updated_by' });

    return ShopProductPriceLog;
};


module.exports = ShopProductPriceLog;