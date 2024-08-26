const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class NameTitle extends Model { }

NameTitle.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: true,
        primaryKey: true
    },
    code_id: {
        type: DataTypes.CHAR
    },
    order_by: {
        type: DataTypes.SMALLINT
    },
    isuse: {
        type: DataTypes.SMALLINT
    },
    name_title: {
        type: DataTypes.JSON
    },
    initials: {
        type: DataTypes.JSON
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
    modelName: 'NameTitle',
    schema: 'master_lookup',
    tableName: 'mas_name_titles',
    timestamps: false,
});



module.exports = NameTitle;