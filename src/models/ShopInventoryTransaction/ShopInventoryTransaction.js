
/**
 * A function do dynamics table of model ShopInventoryTransaction
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_inventory_transaction_doc"
 * @return An instance of model ShopInventoryTransaction by sequelize
 */
const ShopInventoryTransaction = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const modelShopBusinessPartners = require("../model").ShopBusinessPartners(table_name);
    const modelShopsProfiles = require("../model").ShopsProfiles;
    const modelUser = require("../model").User;
    const modelDocumentTypes = require("../model").DocumentTypes;

    class ShopInventoryTransaction extends Model { }

    ShopInventoryTransaction.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง`
        },
        run_no: {
            type: DataTypes.INTEGER,
            description: `เลขที่ run เอกสาร`
        },
        code_id: {
            type: DataTypes.STRING,
            description: `รหัสเลขที่เอกสาร`
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
            comment: `รหัสข้อมูลร้านค้า`
        },
        bus_partner_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: {
                    schema: 'app_shops_datas',
                    tableName: `${modelShopBusinessPartners.tableName}`
                },
                key: 'id'
            },
            comment: `รหัสตารางข้อมูลคู่ค้า`
        },
        doc_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: `วันที่เอกสาร`
        },
        details: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'รายละเอียดข้อมูลเอกสารนำเข้าสินค้า\n' +
                'Ex.\n' +
                '{\n' +
                '  "data":"xxx",\n' +
                '  "data_2":{"th":"xxx", "en":"xxx"},\n' +
                '  "data_3":"xxx",\n' +
                '  "data_4":"xxx"\n' +
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
            comment: `ประเภทเอกสาร`
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                isIn: [[0, 1, 2, 3]]
            },
            comment: `สถานะการนำเข้าสินค้าสู่คลัง 0 = ยกเลิก, 1 = นำเข้าปกติ, 2 = ปรับเพิ่ม, 3 = ปรับลด`

        },
        price_grand_total: {
            comment: `จำนวนเงินรวมทั้งสิ้น`,
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        debt_price_amount: {
            comment: `จำนวนเงินเจ้าหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)`,
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },
        debt_price_amount_left: {
            comment: `จำนวนเงินเจ้าหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)`,
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },
        payment_paid_status: {
            comment: 'สถานะการชําระเงิน' +
                '\n0 = ยกเลิกชำระ' +
                '\n1 = ยังไม่ชำระ' +
                '\n2 = ค้างชำระ' +
                '\n3 = ชําระแล้ว' +
                '\n4 = ชําระเกิน' +
                '\n6 = เจ้าหนี้การค้า',
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1,
            validate: {
                isIn: [[0, 1, 2, 3, 4, 6]]
            }
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
        modelName: 'ShopInventoryTransaction',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_inventory_transaction_doc`,
        comment: 'ตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง',
        timestamps: false,
        updated_date: false,
        updated_by: false,
    });

    ShopInventoryTransaction.belongsTo(modelShopsProfiles, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
    ShopInventoryTransaction.belongsTo(modelShopBusinessPartners, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartners' });
    ShopInventoryTransaction.belongsTo(modelDocumentTypes, { foreignKey: 'doc_type_id', as: 'DocumentTypes' });
    ShopInventoryTransaction.belongsTo(modelUser, { foreignKey: 'created_by' });
    ShopInventoryTransaction.belongsTo(modelUser, { foreignKey: 'updated_by' });



    return ShopInventoryTransaction;
};

module.exports = ShopInventoryTransaction;