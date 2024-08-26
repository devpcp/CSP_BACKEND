const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class SubmitSales extends Model { }

SubmitSales.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    dealer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    doc_type: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    invoice_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    invoice_no: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    item_no: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    qty: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'SubmitSales',
    schema: 'app_datas',
    tableName: 'dat_submit_sales_detail_to_michelin',
    timestamps: false,
});


module.exports = SubmitSales;