const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class ActivityPointOption extends Model { }

ActivityPointOption.init({
    code: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    name: {
        type: DataTypes.JSON,
        allowNull: false
    },
    upline_levels_add_point: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    multiplier_conditions: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    config: {
        type: DataTypes.JSON,
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
    },
}, {
    sequelize: db,
    modelName: 'ActivityPointOption', // We need to choose the model name
    tableName: 'dat_activity_points_options',
    schema: 'app_datas',
    timestamps: false,
});


module.exports = ActivityPointOption