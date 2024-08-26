/**
 * @type {import("sequelize").Model<import("../../types/type.Model.Master.Departments").IModelMasterDepartmentsAttributes, import("../../types/type.Model.Master.Departments").IModelMasterDepartmentsCreationAttributes>}
 */
const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class Departments extends Model { }

Departments.init({
    code_id: {
        type: DataTypes.STRING
    },
    department_name: {
        type: DataTypes.JSON
    },
    user_group_id: {
        type: DataTypes.UUID
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
    modelName: 'Departments',
    schema: 'master_lookup',
    tableName: 'mas_departments',
    timestamps: false,
});


module.exports = Departments;