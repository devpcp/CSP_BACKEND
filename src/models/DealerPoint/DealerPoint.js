const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class DealerPoint extends Model { }

DealerPoint.init({
    dealer_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    activity_point_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    point: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    point_received_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    point_expire_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    activity_point_option_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    upline_level: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    is_use: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    use_point: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    invoice_no: {
        type: DataTypes.CHAR,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    other_details: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'DealerPoint',
    schema: 'app_datas',
    tableName: 'dat_dealers_points',
});


module.exports = DealerPoint