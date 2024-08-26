const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class VehicleColor extends Model { }

VehicleColor.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    run_no: {
        type: DataTypes.INTEGER
    },
    code_id: {
        type: DataTypes.TEXT
    },
    internal_code_id: {
        type: DataTypes.TEXT
    },
    vehicle_color_name: {
        type: DataTypes.JSON
    },
    order_by: {
        type: DataTypes.SMALLINT
    },
    isuse: {
        type: DataTypes.SMALLINT
    },
    created_by: {
        type: DataTypes.UUID
    },
    created_date: {
        type: DataTypes.DATE
    },
    updated_by: {
        type: DataTypes.UUID
    },
    updated_date: {
        type: DataTypes.DATE
    }
}, {
    sequelize: db,
    modelName: 'VehicleColor',
    schema: 'master_lookup',
    tableName: 'mas_vehicle_color',
    timestamps: false,
});

module.exports = VehicleColor;