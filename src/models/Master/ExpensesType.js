const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class ExpensesType extends Model { }

ExpensesType.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    code_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    internal_code_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type_name: {
        type: DataTypes.JSON
    },
    type_group_id: {
        type: DataTypes.UUID,
        allowNull: false
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
    modelName: 'ExpensesType',
    schema: 'master_lookup',
    tableName: 'mas_expenses_type',
    timestamps: false,
});
module.exports = ExpensesType;