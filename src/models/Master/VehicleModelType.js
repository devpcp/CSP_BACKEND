const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class VehicleModelType extends Model { }

VehicleModelType.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    code_id: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    model_name: {
        type: DataTypes.JSON,
        allowNull: false
    },
    vehicles_brand_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    vehicle_type_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    isuse: {
        type: DataTypes.SMALLINT,
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
    modelName: 'VehicleModelType',
    schema: 'master_lookup',
    tableName: 'mas_vehicles_model_types',
    timestamps: false,
});


module.exports = VehicleModelType