/**
 * A function do dynamics table of model ShopWarehouse
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_warehouses"
 */
const ShopWarehouse = (table_name = '') => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const User = require("../model").User;

    class ShopWarehouse extends Model { }

    ShopWarehouse.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลคลัง`
        },
        code_id: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: `รหัสควบคุมคลัง`
        },
        name: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: `ชื่อคลังเก็บเป็น JSON รองรับหลายภาษา
            {
              "th":"ชื่อ",
              "en":"Name"
            }`
        },
        shelf: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: `ชั้นวางสินค้าเก็บเป็น JSON
            {
              "shelf":[{"item":"Run NO", "code":"Code เรียงแทนชื่อ", "name":[{"th":"ชื่อ", "en":"name"}]}, {"item":"Run NO", "code":"Code เรียงแทนชื่อ", "name":[{"th":"ชื่อ", "en":"name"}]}]
            }`
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
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
            comment: `ปรับปรุงข้อมูลโดย`

        },
        updated_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: `ปรับปรุงข้อมูลวันที่`
        }
    }, {
        sequelize: db,
        modelName: 'ShopWarehouse',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_warehouses`,
        comment: 'ตารางข้อมูล Warehouses เก็บของมูลคลังสินค้า'
    });

    ShopWarehouse.belongsTo(User, { foreignKey: 'created_by' });
    ShopWarehouse.belongsTo(User, { foreignKey: 'updated_by' });

    return ShopWarehouse;
};

module.exports = ShopWarehouse;