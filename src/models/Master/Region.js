const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class Region extends Model { }

Region.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    reg_code: {
        type: DataTypes.CHAR,
        allowNull: true,
        comment: 'รหัสภูมิภาคตารางเดิม'
    },
    name_th: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'ชื่อภาษาไทย'
    },
    name_en: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'ชื่อภาษาอังกฤษ'
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1
    },
}, {
    sequelize: db,
    modelName: 'Region',
    schema: 'master_lookup',
    tableName: 'mas_region',
    timestamps: false,
});


module.exports = Region