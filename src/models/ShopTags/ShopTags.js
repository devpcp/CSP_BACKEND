
/**
 * A function do dynamics table of model ShopTags
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_tags"
 */
const ShopTags = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const Product = require("../model").Product;
    const User = require("../model").User;

    class ShopTags extends Model { }

    ShopTags.init({
        id: {
            comment: 'รหัสหลักตารางของ Tags',
            type: DataTypes.UUID,
            defaultValue: db.literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true
        },
        tag_name: {
            comment: 'ชื่อของ Tags',
            type: DataTypes.JSONB,
            allowNull: false
        },
        tag_type: {
            comment: 'ประเภทของ tags\n0=ใช้ได้ทั้งหมด\n 1=สินค้า\n 2=ลูกค้า',
            type: DataTypes.SMALLINT,
            allowNull: false,
            enum: [0, 1, 2]
        },
        run_no: {
            comment: 'ลำดับรายการ',
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        details: {
            comment: 'ข้อมูลรายละเอียดเก็บเป็น JSONB',
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
    }, {
        sequelize: db,
        modelName: 'ShopTags',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_tags`
    });

    ShopTags.belongsTo(User, { foreignKey: 'created_by', as: 'User_create' });
    ShopTags.belongsTo(User, { foreignKey: 'updated_by', as: 'User_update' });

    ShopTags.sync()

    return ShopTags;
};


module.exports = ShopTags;