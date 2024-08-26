// const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

/**
 * A function do dynamics table of model ShopShipAddressCustomer
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_ship_address_customers"
 */
const ShopShipAddressCustomer = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const User = require("../model").User;
    const Province = require("../model").Province;
    const District = require("../model").District;
    const SubDistrict = require("../model").SubDistrict;
    const ShopBusinessCustomers = require("../model").ShopBusinessCustomers(table_name);
    const ShopPersonalCustomers = require("../model").ShopPersonalCustomers(table_name);
    const ShopBusinessPartners = require("../model").ShopBusinessPartners(table_name);

    class ShopShipAddressCustomer extends Model { }

    ShopShipAddressCustomer.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลรายระเอียดยานพาหนะ`
        },
        address_name: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'ชื่อสถานที่'
        },
        address: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'ที่อยู่'
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
        subdistrict_id: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
            references: {
                model: {
                    schema: 'master_lookup',
                    tableName: 'mas_subdistrict'
                },
                key: 'id'
            },
            comment: `รหัสตำบล`
        },
        district_id: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
            references: {
                model: {
                    schema: 'master_lookup',
                    tableName: 'mas_district'
                },
                key: 'id'
            },
            comment: `รหัสอำเภอ`
        },
        province_id: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
            references: {
                model: {
                    schema: 'master_lookup',
                    tableName: 'mas_provinces'
                },
                key: 'id'
            },
            comment: `รหัสจังหวัด`
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
        modelName: 'ShopShipAddressCustomer',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_ship_address_customers`
    });

    ShopShipAddressCustomer.belongsTo(ShopBusinessCustomers, { foreignKey: 'bus_customer_id' });

    ShopShipAddressCustomer.belongsTo(ShopPersonalCustomers, { foreignKey: 'per_customer_id' });

    ShopShipAddressCustomer.belongsTo(ShopBusinessPartners, { foreignKey: 'bus_partner_id' });


    Province.hasMany(ShopShipAddressCustomer, { foreignKey: 'province_id' });
    ShopShipAddressCustomer.belongsTo(Province, { foreignKey: 'province_id' });

    District.hasMany(ShopShipAddressCustomer, { foreignKey: 'district_id' });
    ShopShipAddressCustomer.belongsTo(District, { foreignKey: 'district_id' });

    SubDistrict.hasMany(ShopShipAddressCustomer, { foreignKey: 'subdistrict_id' });
    ShopShipAddressCustomer.belongsTo(SubDistrict, { foreignKey: 'subdistrict_id' });

    ShopShipAddressCustomer.belongsTo(User, { foreignKey: 'created_by' });
    ShopShipAddressCustomer.belongsTo(User, { foreignKey: 'updated_by' });

    ShopShipAddressCustomer.sync()

    return ShopShipAddressCustomer;
}


module.exports = ShopShipAddressCustomer;