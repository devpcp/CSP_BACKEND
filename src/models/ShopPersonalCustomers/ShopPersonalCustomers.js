/**
 * A function do dynamics table of model ShopPersonalCustomers
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_personal_customers"
 */
const ShopPersonalCustomers = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        /**
         * @type {import("sequelize").Model<import("../../types/type.Model.ShopPersonalCustomers").IModelShopPersonalCustomersAttributes, import("../../types/type.Model.ShopPersonalCustomers").IModelShopPersonalCustomersCreationAttributes>}
         */
        const Model = require("sequelize").Model;
        const { DataTypes, literal } = require("sequelize");

        const db = require("../../db");

        const ShopsProfiles = require("../model").ShopsProfiles;
        const NameTitle = require("../model").NameTitle;
        const SubDistrict = require("../model").SubDistrict;
        const District = require("../model").District;
        const Province = require("../model").Province;

        class ShopPersonalCustomers extends Model { }

        ShopPersonalCustomers.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: literal('uuid_generate_v4()'),
                allowNull: false,
                primaryKey: true,
                comment: `รหัสหลักตารางข้อมูลลูกค้าบุคคลทั่วไปภายใต้ร้านค้า`
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: {
                        schema: 'app_datas',
                        tableName: 'dat_shops_profiles'
                    },
                    key: 'id'
                },
                comment: `รหัสร้านค้า`
            },
            master_customer_code_id: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: true,
                comment: `รหัสลูกค้า`
            },
            id_card_number: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: true,
                comment: `รหัสประจำตัวบัตรประชาชน`
            },
            name_title_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: {
                        schema: 'master_lookup',
                        tableName: 'mas_name_titles'
                    },
                    key: 'id'
                },
                comment: `รหัสคำนำหน้าชื่อ`
            },
            customer_name: {
                type: DataTypes.JSON,
                allowNull: false,
                comment: `ชื่อลูกค้า เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "first_name": { "th": "ข้อมูล", "en": "ข้อมูล" }, "last_name": { "th": "data", "en": "data" } }`
            },
            tel_no: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: `เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data", "variable_2" : "data", .....}`
            },
            mobile_no: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: `เบอร์โทรศัพท์มือถือ เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data", "variable_2" : "data", .....}`
            },
            e_mail: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: `e-mail`
            },
            address: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: `ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }`
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
                defaultValue: 1,
                comment: `สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)`
            },
            other_details: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: `รายละเอียดอื่นๆ เพิ่มเติมเก็บเป็น Json`
            },
            run_no: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: `เลขลำดับลูกค้า run อัตโนมัติ`
            },
            tags: {
                type: DataTypes.ARRAY(DataTypes.UUID),
                allowNull: true,
                comment: `array ของ id tags`,
                default: []
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: {
                        schema: 'systems',
                        tableName: 'sysm_users'
                    },
                    key: 'id'
                },
                comment: `สร้างข้อมูลโดย`
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Date.now(),
                comment: `สร้างข้อมูลวันที่`
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: {
                        schema: 'systems',
                        tableName: 'sysm_users'
                    },
                    key: 'id'
                },
                comment: `ปรับปรุงข้อมูลโดย`
            },
            updated_date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
                comment: `ปรับปรุงข้อมูลวันที่`
            },
        }, {
            sequelize: db,
            modelName: 'ShopPersonalCustomers',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_personal_customers`,
            comment: 'ตารางลูกค้าบุคคลทั่วไปภายใต้ร้านค้า'
        });

        ShopPersonalCustomers.belongsTo(ShopsProfiles, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
        ShopPersonalCustomers.belongsTo(NameTitle, { foreignKey: 'name_title_id', as: 'NameTitle' });
        ShopPersonalCustomers.belongsTo(SubDistrict, { foreignKey: 'subdistrict_id', as: 'SubDistrict' });
        ShopPersonalCustomers.belongsTo(District, { foreignKey: 'district_id', as: 'District' });
        ShopPersonalCustomers.belongsTo(Province, { foreignKey: 'province_id', as: 'Province' });

        return ShopPersonalCustomers;
    }
};

module.exports = ShopPersonalCustomers;