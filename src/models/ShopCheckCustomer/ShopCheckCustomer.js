// const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");


/**
 * A function do dynamics table of model ShopCheckCustomer
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_check_customer"
 */
const ShopCheckCustomer = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const User = require("../model").User;

    const ShopBusinessCustomers = require("../model").ShopBusinessCustomers(table_name);
    const ShopPersonalCustomers = require("../model").ShopPersonalCustomers(table_name);
    const ShopBank = require("../model").ShopBank(table_name);

    const { BankNameList } = require("../model");

    class ShopCheckCustomer extends Model { }

    ShopCheckCustomer.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลรายระเอียดยานพาหนะ`
        },
        shop_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสข้อมูลร้านค้า`
        },
        bus_customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `รหัสตารางข้อมูลลูกค้าธุรกิจ`
        },
        per_customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา`
        },
        bank_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `รหัสตารางข้อมูลธนาคาร`
        },
        check_no: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: `เลขที่เช็ค`
        },
        check_branch: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: `สาขา`
        },
        check_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: `วันที่หน้าเช็ค`
        },
        check_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: `จำนวนเงินหน้าเช็ค`
        },
        shop_bank_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `บัญชีที่รับเช็ค`
        },
        check_receive_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: `รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา`
        },
        check_status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: `สถานะการขึ้นเงิน 0=รอเคลียร์เช็ค 1=ขึ้นเช็คแล้ว 2=เช็คเด้ง`,
            defaultValue: 0,
            enum: [0, 1, 2]
        },
        details: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: `รายละเอียดข้อมูลยานพาหนะ
            Ex.
            {
              "data":"xxx",
              "data_2":{"th":"xxx", "en":"xxx"},
              "data_3":"xxx",
              "data_4":"xxx"
            }`
        },
        isuse: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: `สถานะการใช้งานข้อมูล 0 = ยกเลิก, 1 = ใช้งาน, 2 = ลบอยู่ในถังขยะ`
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
        modelName: 'ShopCheckCustomer',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_check_customer`
    });

    ShopCheckCustomer.belongsTo(ShopBusinessCustomers, { foreignKey: 'bus_customer_id' });

    ShopCheckCustomer.belongsTo(ShopPersonalCustomers, { foreignKey: 'per_customer_id' });

    ShopCheckCustomer.belongsTo(BankNameList, { foreignKey: 'bank_id' });

    ShopCheckCustomer.belongsTo(ShopBank, { foreignKey: 'shop_bank_id' });

    ShopCheckCustomer.belongsTo(User, { foreignKey: 'created_by' });
    ShopCheckCustomer.belongsTo(User, { foreignKey: 'updated_by' });

    // ShopCheckCustomer.sync()

    return ShopCheckCustomer;
}


module.exports = ShopCheckCustomer;