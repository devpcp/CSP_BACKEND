const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class VehicleBrand extends Model { }

VehicleBrand.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    run_no: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    code_id: {
        type: DataTypes.CHAR,
        allowNull: false
    },
    internal_code_id: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    brand_name: {
        type: DataTypes.JSON
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
    modelName: 'VehicleBrand',
    schema: 'master_lookup',
    tableName: 'mas_vehicles_brands',
    timestamps: false,
});


module.exports = VehicleBrand;