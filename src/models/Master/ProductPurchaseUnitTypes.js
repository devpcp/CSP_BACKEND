const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class ProductPurchaseUnitTypes extends Model { }

ProductPurchaseUnitTypes.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true
        },
        code_id: {
            type: DataTypes.STRING
        },
        type_name: {
            type: DataTypes.JSON
        },
        type_group_id: {
            type: DataTypes.UUID
        },
        isuse: {
            type: DataTypes.SMALLINT,
            defaultValue: 1
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
        amount_per_unit: {
            type: DataTypes.SMALLINT
        },
        run_no: {
            type: DataTypes.INTEGER
        },
        internal_code_id: {
            type: DataTypes.CHAR
        }
    },
    {
        sequelize: db,
        modelName: 'ProductPurchaseUnitTypes',
        schema: 'master_lookup',
        tableName: 'mas_product_purchase_unit_types',
        timestamps: false
    }
);


module.exports = ProductPurchaseUnitTypes;