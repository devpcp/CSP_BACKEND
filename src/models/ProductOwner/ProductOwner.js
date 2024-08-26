const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class ProductOwner extends Model { }

ProductOwner.init({
    id: {
        comment: 'รหัสหลักตารางของตารางเก็บข้อมูล Product Owner สำหรับ Multi Branch',
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    hq_id: {
        comment: 'รหัสหลักตารางของ Shop Hq (Id ของ app_datas.dat_shop_hq)',
        type: DataTypes.UUID,
        references: {
            model: {
                schema: 'app_datas',
                tableName: 'dat_shop_hq',
            },
            key: 'id'
        },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    product_id: {
        comment: 'รหัสหลักตารางของ Shop Hq (Id ของ app_datas.dat_shop_hq)',
        type: DataTypes.UUID,
        references: {
            model: {
                schema: 'app_datas',
                tableName: 'dat_products',
            },
            key: 'id'
        },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    created_by: {
        comment: 'สร้างข้อมูลโดย',
        type: DataTypes.UUID,
        references: {
            model: {
                schema: 'systems',
                tableName: 'sysm_users',
            },
            key: 'id'
        },
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    created_date: {
        comment: 'สร้างข้อมูลวันที่',
        type: DataTypes.DATE,
        defaultValue: literal('now()'),
        allowNull: false
    }
}, {
    sequelize: db,
    modelName: 'ProductOwner',
    tableName: 'match_product_to_hq',
    schema: 'app_datas',
    timestamps: false,
    comment: 'ตารางของตารางเก็บข้อมูล Product Owner สำหรับ Multi Branch'
});

module.exports = ProductOwner;