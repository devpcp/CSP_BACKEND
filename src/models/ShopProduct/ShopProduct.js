/**
 * A function do dynamics table of model ShopProduct
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_products"
 */
const ShopProduct = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const Product = require("../model").Product;
    const User = require("../model").User;

    class ShopProduct extends Model { }

    ShopProduct.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลสินค้าภายในร้าน`
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสข้อมูลสินค้าจากตารางสินค้า Master`
        },
        product_bar_code: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: `รหัส Bar code ประจำตัวสินค้า`
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
        price_arr: {
            type: DataTypes.ARRAY(DataTypes.JSON),
            allowNull: true,
            comment: `ข้อมูลราคาขายสินค้าเก็บเป็น Array`,
            default: []
        },
        price_dot_arr: {
            type: DataTypes.ARRAY(DataTypes.JSON),
            allowNull: true,
            comment: `ข้อมูลราคาขายสินค้าแต่ละ dot เก็บเป็น Array`,
            default: []
        },
        details: {
            comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
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
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            allowNull: true,
            comment: `tags`
        }
    }, {
        sequelize: db,
        modelName: 'ShopProduct',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_products`,
        indexes: [
            {
                name: `idx_${table_name}_product_product_id`,
                fields: ['product_id']
            },
            {
                name: `idx_${table_name}_product_product_bar_code`,
                fields: ['product_bar_code']
            }
        ]
    });

    Product.hasOne(ShopProduct, { foreignKey: 'product_id' })
    ShopProduct.belongsTo(Product, { foreignKey: 'product_id' })

    ShopProduct.belongsTo(User, { foreignKey: 'created_by', as: 'User_create' });
    ShopProduct.belongsTo(User, { foreignKey: 'updated_by', as: 'User_update' });

    return ShopProduct;
};


module.exports = ShopProduct;