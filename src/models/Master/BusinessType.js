const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class BusinessType extends Model { }

BusinessType.init({
    code_id: {
        type: DataTypes.CHAR
    },
    business_type_name: {
        type: DataTypes.JSON
    },
    initial_business_type: {
        type: DataTypes.JSON
    },
    order_by: {
        type: DataTypes.SMALLINT
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
    modelName: 'BusinessType',
    schema: 'master_lookup',
    tableName: 'mas_business_types',
    timestamps: false,
});


module.exports = BusinessType;