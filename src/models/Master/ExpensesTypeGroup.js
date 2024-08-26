const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require('../../db');

class ExpensesTypeGroup extends Model { }

ExpensesTypeGroup.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    code_id: {
        type: DataTypes.STRING
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
        type: DataTypes.INTEGER
    }
}, {
    sequelize: db,
    modelName: 'ExpensesTypeGroup',
    schema: 'master_lookup',
    tableName: 'mas_expenses_type_group',
    timestamps: false,
});

module.exports = ExpensesTypeGroup;