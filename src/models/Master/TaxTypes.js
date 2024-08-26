const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class TaxTypes extends Model { }

TaxTypes.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    code_id: {
        type: DataTypes.CHAR
    },
    type_name: {
        type: DataTypes.JSON
    },
    detail: {
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
    modelName: 'TaxTypes',
    schema: 'master_lookup',
    tableName: 'mas_tax_types',
    timestamps: false,
});


module.exports = TaxTypes;