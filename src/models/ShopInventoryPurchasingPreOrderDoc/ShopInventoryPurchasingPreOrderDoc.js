/**
 * A function do dynamics table of model ShopInventoryPurchasingPreOrderDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_inventory_purchasing_pre_order_doc"
 * @return An instance of model ShopInventoryPurchasingPreOrderDoc by sequelize
 */
const ShopInventoryPurchasingPreOrderDoc = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const modelShopsProfiles = require("../model").ShopsProfiles;
    const modelUser = require("../model").User;
    const modelDocumentTypes = require("../model").DocumentTypes;
    const modelShopBusinessPartners = require("../model").ShopBusinessPartners(table_name);

    class ShopInventoryPurchasingPreOrderDoc extends Model { }

    ShopInventoryPurchasingPreOrderDoc.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลเอกสารสั่งซื้อ`
        },
        code_id: {
            type: DataTypes.STRING,
            description: `รหัสโค้ดเอกสารสั่งซื้อ`
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
            comment: `รหัสตารางข้อมูลร้านค้าจากส่วนกลาง`
        },
        doc_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: `เอกสารวันที่`
        },
        details: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON\n' +
                'Ex.\n' +
                '{\n' +
                ' "data01":"data"\n' +
                ' "data02":int\n' +
                ' "data03":{"value01":"data", "value02":int}\n' +
                '}'
        },
        doc_type_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: {
                    schema: 'master_lookup',
                    tableName: 'mas_document_types'
                },
                key: 'id'
            },
            comment: `รหัสข้อมูลตารางข้อมูลประเภทเอกสาร จาก Master Lookup`
        },
        bus_partner_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: {
                    schema: 'app_shops_datas',
                    tableName: `${modelShopBusinessPartners.tableName}`
                },
                key: 'id'
            },
            comment: `รหัสข้อมูลตารางข้อมูลคู่ค้า`
        },
        run_no: {
            type: DataTypes.INTEGER,
            comment: `Runing Number`
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                isIn: [[0, 1, 2, 3, 4]]
            },
            defaultValue: literal(`1`),
            comment: `สถานะการดำเนินงานของเอกสาร (0=ยกเลิก, 1=รอดำเนินการ, 2=อยู่ระหว่างดำเนินการ, 3=อนุมัติ, 4=ไม่อนุมัติ)`
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
            defaultValue: literal('now()'),
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
        modelName: 'ShopInventoryPurchasingPreOrderDoc',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_inventory_purchasing_pre_order_doc`,
        comment: 'ตารางข้อมูลเอกสารสั่งซื้อ',
        timestamps: false
    });

    ShopInventoryPurchasingPreOrderDoc.belongsTo(modelShopsProfiles, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
    ShopInventoryPurchasingPreOrderDoc.belongsTo(modelShopBusinessPartners, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartners' });
    ShopInventoryPurchasingPreOrderDoc.belongsTo(modelDocumentTypes, { foreignKey: 'doc_type_id', as: 'DocumentTypes' });
    ShopInventoryPurchasingPreOrderDoc.belongsTo(modelUser, { foreignKey: 'created_by' });
    ShopInventoryPurchasingPreOrderDoc.belongsTo(modelUser, { foreignKey: 'updated_by' });

    return ShopInventoryPurchasingPreOrderDoc;
};


module.exports = ShopInventoryPurchasingPreOrderDoc;