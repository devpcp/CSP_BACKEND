// const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

/**
 * A function do dynamics table of model ShopContactCustomer
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_ship_address_customers"
 */
const ShopContactCustomer = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");
    const User = require("../model").User;

    const ShopBusinessCustomers = require("../model").ShopBusinessCustomers(table_name);
    const ShopPersonalCustomers = require("../model").ShopPersonalCustomers(table_name);
    const ShopBusinessPartners = require("../model").ShopBusinessPartners(table_name);

    class ShopContactCustomer extends Model { }

    ShopContactCustomer.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลรายระเอียดยานพาหนะ`
        },
        contact_name: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'ชื่อติดต่อ'
        },
        tel_no: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: `เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data", "variable_2" : "data", .....}`
        },
        department: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'ชื่อแผนก'
        },
        position: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'ชื่อตำแหน่ง'
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
        bus_partner_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `รหัสตารางข้อมูลผู้จำหน่าย`
        },

        details: {
            type: DataTypes.JSON,
            allowNull: true,
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
        modelName: 'ShopContactCustomer',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_contact_customers`
    });

    ShopContactCustomer.belongsTo(ShopBusinessCustomers, { foreignKey: 'bus_customer_id' });

    ShopContactCustomer.belongsTo(ShopPersonalCustomers, { foreignKey: 'per_customer_id' });

    ShopContactCustomer.belongsTo(ShopBusinessPartners, { foreignKey: 'bus_partner_id' });


    ShopContactCustomer.belongsTo(User, { foreignKey: 'created_by' });
    ShopContactCustomer.belongsTo(User, { foreignKey: 'updated_by' });

    ShopContactCustomer.sync()

    return ShopContactCustomer;
}


module.exports = ShopContactCustomer;