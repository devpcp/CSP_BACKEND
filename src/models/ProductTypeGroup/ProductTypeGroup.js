const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class ProductTypeGroup extends Model { }

ProductTypeGroup.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    code_id: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    group_type_name: {
        type: DataTypes.JSON,
        allowNull: false
    },
    isstock: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    run_no: {
        type: DataTypes.INTEGER
    },
    internal_code_id: {
        type: DataTypes.CHAR
    }
}, {
    sequelize: db,
    modelName: 'ProductTypeGroup',
    schema: 'master_lookup',
    tableName: 'mas_product_type_groups',
    comment: 'ตารางเก็บกลุ่มประเภทสินค้า',
    timestamps: false,
});


module.exports = ProductTypeGroup;