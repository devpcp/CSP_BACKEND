const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class ProductType extends Model { }

ProductType.init({
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
    type_name: {
        type: DataTypes.JSON,
        allowNull: false
    },
    type_group_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    isuse: {
        type: DataTypes.SMALLINT,
        defaultValue: 1,
        allowNull: false
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
}, {
    sequelize: db,
    modelName: 'ProductType',
    schema: 'master_lookup',
    tableName: 'mas_product_types',
    comment: 'ตารางข้อมูลประเภทสินค้า',
    timestamps: false,
});


module.exports = ProductType;