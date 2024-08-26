/**
 * A function do dynamics table of model ShopSalesTransactionDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_sales_transaction_doc"
 */
const ShopSalesTransactionDoc = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const modelShopProfiles = require("../model").ShopsProfiles;
    const modelShopBusinessCustomers = require("../model").ShopBusinessCustomers(table_name);
    const modelShopPersonalCustomers = require("../model").ShopPersonalCustomers(table_name);
    const modelShopVehicleCustomers = require("../model").ShopVehicleCustomer(table_name);
    const modelDocumentTypes = require("../model").DocumentTypes;
    const modelUser = require("../model").User;


    class ShopSalesTransactionDoc extends Model { }

    ShopSalesTransactionDoc.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: literal('uuid_generate_v4()'),
                allowNull: false,
                primaryKey: true,
                comment: `รหัสหลักตารางข้อมูลเอกสารการขาย`
            },
            run_no: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: `เลขที่ run เอกสาร`
            },
            code_id: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: `รหัสเลขที่เอกสาร`
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfiles,
                    key: 'id'
                },
                comment: `รหัสข้อมูลร้านค้า`
            },
            bus_customer_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopBusinessCustomers,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลลูกค้าธุรกิจ`
            },
            per_customer_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopPersonalCustomers,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา`
            },
            doc_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                comment: `วันที่เอกสาร`
            },
            details: {
                type: DataTypes.JSON,
                allowNull: false,
                comment: 'รายละเอียดข้อมูลเอกสารการขาย\n' +
                    'Ex.\n' +
                    '{\n' +
                    '  "data":"xxx",\n' +
                    '  "data_2":{"th":"xxx", "en":"xxx"},\n' +
                    '  "data_3":"xxx",\n' +
                    '  "data_4":"xxx"\n' +
                    '}'
            },
            vehicles_customers_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopVehicleCustomers,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลยานพาหนะ`
            },
            doc_type_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelDocumentTypes,
                    key: 'id'
                },
                comment: `ประเภทเอกสาร`
            },
            sale_type: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: `ประเภทการขาย (true=ขายส่ง, false=ขายปลีก)`
            },
            purchase_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: `สถานะการจ่าย (false=ยังไม่จ่าย, true=จ่ายแล้ว)`
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                validate: {
                    isIn: [[0, 1, 2, 3, 4]]
                },
                comment: `สถานะเอกสาร 0 = ยกเลิก, 1 = อยู่ระหว่างดำเนินการ, 2 = ดำเนินการเรียบร้อย, 3 = ออกบิลอย่างย่อ, 4 = ออกบิลเต็มรูป`
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelUser,
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
                    model: modelUser,
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
        },
        {
            sequelize: db,
            modelName: 'ShopSalesTransactionDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_sales_transaction_doc`,
            comment: 'ตารางข้อมูลเอกสารการขาย',
            timestamps: false
        }
    );

    ShopSalesTransactionDoc.belongsTo(modelShopProfiles, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
    ShopSalesTransactionDoc.belongsTo(modelShopBusinessCustomers, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomers' });
    ShopSalesTransactionDoc.belongsTo(modelShopPersonalCustomers, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomers' });
    ShopSalesTransactionDoc.belongsTo(modelShopVehicleCustomers, { foreignKey: 'vehicles_customers_id', as: 'ShopVehicleCustomers' });
    ShopSalesTransactionDoc.belongsTo(modelDocumentTypes, { foreignKey: 'doc_type_id', as: 'DocumentTypes' });
    ShopSalesTransactionDoc.belongsTo(modelUser, { foreignKey: 'created_by' });
    ShopSalesTransactionDoc.belongsTo(modelUser, { foreignKey: 'updated_by' });

    return ShopSalesTransactionDoc;
};


module.exports = ShopSalesTransactionDoc;