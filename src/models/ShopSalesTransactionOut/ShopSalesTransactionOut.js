/**
 * A function do dynamics table of model ShopSalesTransactionOut
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_sales_transaction_out"
 * @return An instance of model ShopSalesTransactionOut by sequelize
 */
const ShopSalesTransactionOut = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const User = require("../model").User;
    const ShopsProfiles = require("../model").ShopsProfiles;
    const modelShopProduct = require("../model").ShopProduct(table_name);
    const modelShopSalesTransactionDoc = require("../model").ShopSalesTransactionDoc(table_name);

    class ShopSalesTransactionOut extends Model { }

    ShopSalesTransactionOut.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลการออกบิลขาย`
        },
        doc_sale_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลเอกสารกำกับการขาย`
        },
        full_invoice_doc_sale_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `รหัสตารางข้อมูลเอกสารกำกับการขาย ชนิดเอกสารการออกบิลเต็มรูปแบบ`
        },
        ref_doc_sale_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลเอกสารกำกับการขาย เป็นข้อมูลเอกสารอ้างอิงที่ใช้ออกบิล ชนิดเอกสารใบสั่งซ่อม`
        },
        shop_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลร้านค้า`
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `ข้อมูลสินค้าใน Invoice`
        },
        item_no: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: `ลำดับสินค้าที่อยู่ใน Invoice`
        },
        qty: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: `จำนวนสินค้าใน Invoice`
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: `สถานะการใช้ข้อมูลในการออกบิล (0=ยกเลิก, 1=บิลอย่างย่อย, 2=บิลอย่างย่อย+บิลเต็มรูปแบบ)`
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
            comment: `แก้ไขข้อมูลโดย`
        },
        updated_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: `แก้ไขข้อมูลวันที่`
        }
    }, {
        sequelize: db,
        modelName: 'ShopSalesTransactionOut',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_sales_transaction_out`,
        comment: 'ตารางเก็บข้อมูลการออกบิลขาย',
        timestamps: false,
        updated_date: false,
        updated_by: false,
    });

    modelShopSalesTransactionDoc.hasOne(ShopSalesTransactionOut, { foreignKey: 'doc_sale_id', as: 'SalesTransactionDocSale' })
    ShopSalesTransactionOut.belongsTo(modelShopSalesTransactionDoc, { foreignKey: 'doc_sale_id', as: 'SalesTransactionDocSale' })

    modelShopSalesTransactionDoc.hasOne(ShopSalesTransactionOut, { foreignKey: 'full_invoice_doc_sale_id', as: 'SalesTransactionDocFullInvoice' })
    ShopSalesTransactionOut.belongsTo(modelShopSalesTransactionDoc, { foreignKey: 'full_invoice_doc_sale_id', as: 'SalesTransactionDocFullInvoice' })

    modelShopProduct.hasOne(ShopSalesTransactionOut, { foreignKey: 'product_id' })
    ShopSalesTransactionOut.belongsTo(modelShopProduct, { foreignKey: 'product_id' })

    modelShopSalesTransactionDoc.hasOne(ShopSalesTransactionOut, { foreignKey: 'ref_doc_sale_id', as: 'SalesTransactionDocRefDoc' })
    ShopSalesTransactionOut.belongsTo(modelShopSalesTransactionDoc, { foreignKey: 'ref_doc_sale_id', as: 'SalesTransactionDocRefDoc' })

    ShopsProfiles.hasOne(ShopSalesTransactionOut, { foreignKey: 'shop_id' })
    ShopSalesTransactionOut.belongsTo(ShopsProfiles, { foreignKey: 'shop_id' })

    ShopSalesTransactionOut.belongsTo(User, { foreignKey: 'created_by', as: 'User_create' });
    ShopSalesTransactionOut.belongsTo(User, { foreignKey: 'updated_by', as: 'User_update' });

    return ShopSalesTransactionOut;
}


module.exports = ShopSalesTransactionOut;