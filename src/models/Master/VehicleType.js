const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class VehicleType extends Model { }

VehicleType.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    code_id: {
        type: DataTypes.CHAR,
        allowNull: false
    },
    internal_code_id: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    type_name: {
        type: DataTypes.JSON
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1
    },
    run_no: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    modelName: 'VehicleType',
    schema: 'master_lookup',
    tableName: 'mas_vehicle_types',
    timestamps: false,
});


module.exports = VehicleType;