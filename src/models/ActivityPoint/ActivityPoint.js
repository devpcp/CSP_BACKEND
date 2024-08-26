const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class ActivityPoint extends Model { }

ActivityPoint.init({
    code: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    name: {
        type: DataTypes.JSON,
        allowNull: false
    },
    point: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    multiplier: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    activity_points_options_id: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true
    },
    start_activity_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_activity_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isuse: {
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
    modelName: 'ActivityPoint',
    schema: 'app_datas',
    tableName: 'dat_activity_points',
    timestamps: false,
});


module.exports = ActivityPoint;