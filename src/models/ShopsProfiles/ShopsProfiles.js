const _ = require("lodash");
/**
 * @type {import("sequelize").Model<IModelShopsProfilesAttributes, IModelShopsProfilesCreationAttributes>}
 */
const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");
const { configShopProfile_ShopConfig_DefaultConfig } = require("../../config");

class ShopsProfiles extends Model { }

ShopsProfiles.init(
    {
        id: {
            comment: 'รหัสหลักตารางข้อมูลตัวแทนจำหน่าย',
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true
        },
        shop_code_id: {
            comment: "รหัส Code ประจำร้าน แยกประเภทร้าน\nอักษรตัวที่ 1 ประเภทร้าน\nอักษรตัวที่ 2และ3 บอกร้านสาขาหลักหรือสาขาย่อย สาขาหลัก 'HQ', สาขาย่อย 'SQ'\nเลข 4 ตัวสุดท้าย Run Number",
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: null,
        },
        tax_code_id: {
            comment: 'รหัสประจำตัวผู้เสียภาษี',
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        bus_type_id: {
            comment: 'รหัสประเภทธุรกิจ',
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        shop_name: {
            comment: 'ชื่อตัวแทนจำหน่าย เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
            type: DataTypes.JSON,
            allowNull: false,
        },
        tel_no: {
            comment: 'เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        mobile_no: {
            comment: 'เบอร์โทรศัพท์มือถือ  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        e_mail: {
            comment: 'e-mail',
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        address: {
            comment: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        subdistrict_id: {
            comment: 'รหัสตำบล',
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        district_id: {
            comment: 'รหัสอำเภอ',
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        province_id: {
            comment: 'รหัสจังหวัด',
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        isuse: {
            comment: 'สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)',
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1,
        },
        created_by: {
            comment: 'สร้างข้อมูลโดย',
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        created_date: {
            comment: 'สร้างข้อมูลวันที่',
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        updated_by: {
            comment: 'ปรับปรุงข้อมูลโดย',
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        updated_date: {
            comment: 'ปรับปรุงข้อมูลวันที่',
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        parent_id: {
            comment: 'รหัสร้านแม่',
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null
        },
        seq: {
            comment: 'Run Code Number',
            type: DataTypes.BIGINT,
            allowNull: false
        },
        domain_name: {
            comment: 'เก็บชื่อ Domain และ SubDomain เป็น JSON\n{\n  "sub_domain_name":"sub-domain-name",\n  "changed":"0",\n  "domain_name":"domain-name.com"\n}\nความหมายของค่าใน changed มึความหมายดังนี้ (0=อนุญาติให้แก้ไขได้, 1=ไม่อนุญาติให้แก้ไข)',
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        },
        sync_api_config: {
            comment: 'ตั้งค่าเชื่อมต่อ API เพื่อส่งข้อมูลขึ้นต่างระบบ เก็บเป็น JSON Format',
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        },
        shop_config: {
            comment: 'ตั้งค่าร้านค้า',
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        }
    },
    {
        sequelize: db,
        modelName: 'ShopsProfiles',
        schema: 'app_datas',
        tableName: 'dat_shops_profiles',
        comment: 'ตารางข้อมูลร้านค้าผู้ใช้ระบบ POS',
    }
);

ShopsProfiles.beforeCreate((instance, options) => {
    /**
     * @type {Object}
     */
    const shop_config = instance.get('shop_config');
    for (const shopConfigKey in configShopProfile_ShopConfig_DefaultConfig) {
        if (!_.isBoolean(shop_config[shopConfigKey])) {
            shop_config[shopConfigKey] = configShopProfile_ShopConfig_DefaultConfig[shopConfigKey];
        }
    }
    instance.set('shop_config', shop_config);
});


module.exports = ShopsProfiles;