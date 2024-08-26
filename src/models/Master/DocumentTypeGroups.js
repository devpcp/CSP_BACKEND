const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require('../../db');

class DocumentTypeGroups extends Model { }

DocumentTypeGroups.init({
    code_id: {
        type: DataTypes.CHAR
    },
    group_type_name: {
        type: DataTypes.JSON,
        allowNull: false
    },
    isuse: {
        type: DataTypes.SMALLINT,
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
    },
    run_no: {
        type: DataTypes.NUMBER
    }
}, {
    sequelize: db,
    modelName: 'DocumentTypeGroups',
    schema: 'master_lookup',
    tableName: 'mas_document_type_groups',
    timestamps: false,
});


module.exports = DocumentTypeGroups;