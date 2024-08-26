const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class ProductBrand extends Model { }

ProductBrand.init({
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
    brand_name: {
        type: DataTypes.JSON,
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
    }
}, {
    sequelize: db,
    modelName: 'ProductBrand',
    schema: 'master_lookup',
    tableName: 'mas_product_brands',
    timestamps: false,
});


module.exports = ProductBrand;