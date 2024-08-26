const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class DealerPointBalance extends Model { }

DealerPointBalance.init({
    dealer_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    balance_point: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    reward_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    reward_use_point: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    expire_point: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    dealer_point_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    balance_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
}, {
    sequelize: db,
    modelName: 'DealerPointBalance',
    schema: 'app_datas',
    tableName: 'dat_dealers_points_balance',
    timestamps: false,
});

DealerPointBalance.removeAttribute('updated_date');


module.exports = DealerPointBalance