const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class StockBalance extends Model { }

StockBalance.init({
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
    product_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    balance: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    balance_date: {
        type: DataTypes.DATE,
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
}, {
    sequelize: db,
    modelName: 'StockBalance',
    schema: 'app_datas',
    tableName: 'dat_dealers_stock_products_balances',
    timestamps: false,
});


module.exports = StockBalance;