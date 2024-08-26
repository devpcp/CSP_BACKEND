
/**
 * A function do dynamics table of model ShopBank
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_bank"
 */
const ShopBank = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const { BankNameList } = require("../model");
    const User = require("../model").User;

    class ShopBank extends Model { }

    ShopBank.init({
        id: {
            comment: 'รหัสหลักตารางของ Bank',
            type: DataTypes.UUID,
            defaultValue: db.literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true
        },
        account_name: {
            comment: 'ชื่อบัญชี',
            type: DataTypes.JSONB,
            allowNull: false
        },
        account_no: {
            comment: 'เลขบัญชี',
            type: DataTypes.TEXT,
            allowNull: false
        },
        bank_id: {
            comment: 'id ของธนาคาร',
            type: DataTypes.UUID,
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
        modelName: 'ShopBank',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_bank`
    });

    ShopBank.belongsTo(User, { foreignKey: 'created_by', as: 'User_create' });
    ShopBank.belongsTo(User, { foreignKey: 'updated_by', as: 'User_update' });

    ShopBank.belongsTo(BankNameList, { foreignKey: 'bank_id' });


    // ShopBank.sync()

    return ShopBank;
};


module.exports = ShopBank;