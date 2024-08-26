/**
 * A function do dynamics table of model ShopBusinessPartners
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_business_partners"
 * @return An instance of model ShopBusinessPartners by sequelize
 */
const ShopBusinessPartners = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const modelUsers = require("../model").User;
    const modelShopProfiles = require("../model").ShopsProfiles;
    const modelTaxType = require("../model").TaxTypes;
    const modelBusinessType = require("../model").BusinessType;
    const modelSubDistrict = require("../model").SubDistrict;
    const modelDistrict = require("../model").District;
    const modelProvince = require("../model").Province;

    class ShopBusinessPartners extends Model { }

    ShopBusinessPartners.init({
        id: {
            comment: `รหัสหลักตารางข้อมูลธุรกิจคู่ค้า`,
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true
        },
        shop_id: {
            comment: `รหัสข้อมูลร้านค้า`,
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: {
                    schema: 'app_datas',
                    tableName: 'dat_shops_profiles'
                },
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        code_id: {
            comment: `รหัสคู่ค้า`,
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        tax_type_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: modelTaxType,
                key: 'id'
            },
            comment: `ประเภทภาษี\n`
                + `Foreign key: master_lookup.mas_tax_types.id`,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        tax_id: {
            comment: `รหัสภาษีธุรกิจ`,
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        bus_type_id: {
            comment: `รหัสประเภทธุรกิจ`,
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
            references: {
                model: modelBusinessType,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        partner_name: {
            comment: `ชื่อคู่ค้า เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }`,
            type: DataTypes.JSON,
            allowNull: false
        },
        tel_no: {
            comment: `เบอร์โทรศัพท์พื้นฐาน  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}`,
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        mobile_no: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
            comment: `เบอร์โทรศัพท์มือถือ  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}`
        },
        e_mail: {
            comment: `e-mail`,
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        address: {
            comment: `ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }`,
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        subdistrict_id: {
            comment: `รหัสตำบล`,
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
            references: {
                model: modelSubDistrict,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        district_id: {
            comment: `รหัสอำเภอ`,
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
            references: {
                model: modelDistrict,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        province_id: {
            comment: `รหัสจังหวัด`,
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
            references: {
                model: modelProvince,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
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
            validate: {
                isIn: [[0, 1, 2]]
            },
            comment: `สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)`
        },
        run_no: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: `เลขลำดับคู่ค้า run อัตโนมัติ`
        },
        created_by: {
            comment: `สร้างข้อมูลโดย`,
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: modelUsers,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: db.Sequelize.literal('now()'),
            comment: `สร้างข้อมูลวันที่`
        },
        updated_by: {
            comment: `ปรับปรุงข้อมูลโดย`,
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
            references: {
                model: modelUsers,
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
        },
    }, {
        sequelize: db,
        modelName: 'ShopBusinessPartners',
        tableName: `dat_${table_name}_business_partners`,
        schema: 'app_shops_datas',
        comment: 'ตารางธุรกิจคู่ค้า',
        timestamps: false,
        updated_date: false,
        updated_by: false,
    });

    ShopBusinessPartners.belongsTo(modelShopProfiles, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
    ShopBusinessPartners.belongsTo(modelBusinessType, { foreignKey: 'bus_type_id', as: 'BusinessType' });
    ShopBusinessPartners.belongsTo(modelSubDistrict, { foreignKey: 'subdistrict_id', as: 'SubDistrict' });
    ShopBusinessPartners.belongsTo(modelDistrict, { foreignKey: 'district_id', as: 'District' });
    ShopBusinessPartners.belongsTo(modelProvince, { foreignKey: 'province_id', as: 'Province' });

    return ShopBusinessPartners;
};

module.exports = ShopBusinessPartners;