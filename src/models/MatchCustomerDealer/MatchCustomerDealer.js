const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require('../../db');

class MatchCustomerDealer extends Model { }

MatchCustomerDealer.init({
    dealer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    run_no: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'MatchCustomerDealer',
    tableName: 'match_customer_to_dealer',
    schema: 'app_datas',
    timestamps: false,
});

MatchCustomerDealer.removeAttribute('id');


module.exports = MatchCustomerDealer