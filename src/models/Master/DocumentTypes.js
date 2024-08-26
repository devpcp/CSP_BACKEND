const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require('../../db');

class DocumentTypes extends Model { }

DocumentTypes.init({
    code_id: {
        type: DataTypes.CHAR
    },
    type_name: {
        type: DataTypes.JSON
    },
    type_group_id: {
        type: DataTypes.UUID,
        allowNull: false
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
    },
    run_no: {
        type: DataTypes.INTEGER
    },
    internal_code_id: {
        type: DataTypes.CHAR
    }
}, {
    sequelize: db,
    modelName: 'DocumentTypes',
    schema: 'master_lookup',
    tableName: 'mas_document_types',
    timestamps: false,
});


module.exports = DocumentTypes;