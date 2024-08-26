/**
 * A function do dynamics table of model ShopBusinessCustomers
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_business_customers"
 */
const ShopBusinessCustomers = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        /**
         * @type {import("sequelize").Model<import("../../types/type.Model.ShopBusinessCustomers").IModelShopBusinessCustomersAttributes, import("../../types/type.Model.ShopBusinessCustomers").IModelShopBusinessCustomersCreationAttributes>}
         */
        const Model = require("sequelize").Model;
        const { DataTypes, literal } = require("sequelize");

        const db = require("../../db");

        const ShopProfiles = require("../model").ShopsProfiles;
        const BusinessType = require("../model").BusinessType;
        const SubDistrict = require("../model").SubDistrict;
        const District = require("../model").District;
        const Province = require("../model").Province;
        const User = require("../Users/User");

        class ShopBusinessCustomers extends Model { }

        ShopBusinessCustomers.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: literal('uuid_generate_v4()'),
                    allowNull: false,
                    primaryKey: true,
                    comment: `รหัสหลักตารางข้อมูลลูกค้าของตัวแทนจำหน่าย`
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
                tax_id: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    comment: `รหัสภาษีธุรกิจ`
                },
                bus_type_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: {
                            schema: 'master_lookup',
                            tableName: 'mas_business_types'
                        },
                        key: 'id'
                    },
                    comment: `รหัสประเภทธุรกิจ`,
                },
                customer_name: {
                    type: DataTypes.JSON,
                    allowNull: false,
                    comment: `ชื่อลูกค้า เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }`
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
                other_details: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    comment: `รายละเอียดอื่นๆ เพิ่มเติมเก็บเป็น Json`
                },
                isuse: {
                    type: DataTypes.SMALLINT,
                    allowNull: false,
                    defaultValue: 1,
                    comment: `สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)`
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
                    comment: `สร้างข้อมูลโดย`,
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: User,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'NO ACTION'
                },
                created_date: {
                    comment: `สร้างข้อมูลวันที่`,
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: literal('now()')
                },
                updated_by: {
                    comment: `ปรับปรุงข้อมูลโดย`,
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: User,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                updated_date: {
                    comment: `ปรับปรุงข้อมูลวันที่`,
                    type: DataTypes.DATE,
                    allowNull: true,
                    defaultValue: null
                }
            },
            {
                sequelize: db,
                modelName: 'ShopBusinessCustomers',
                schema: 'app_shops_datas',
                tableName: `dat_${table_name}_business_customers`,
                comment: 'ตารางลูกค้าภายใต้ร้านค้า'
            }
        );

        ShopBusinessCustomers.belongsTo(ShopProfiles, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
        ShopBusinessCustomers.belongsTo(BusinessType, { foreignKey: 'bus_type_id', as: 'BusinessType' });
        ShopBusinessCustomers.belongsTo(SubDistrict, { foreignKey: 'subdistrict_id', as: 'SubDistrict' });
        ShopBusinessCustomers.belongsTo(District, { foreignKey: 'district_id', as: 'District' });
        ShopBusinessCustomers.belongsTo(Province, { foreignKey: 'province_id', as: 'Province' });
        ShopBusinessCustomers.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
        ShopBusinessCustomers.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

        return ShopBusinessCustomers;
    }
};

module.exports = ShopBusinessCustomers;