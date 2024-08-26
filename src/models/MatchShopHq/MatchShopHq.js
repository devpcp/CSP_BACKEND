const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");
class MatchShopHq extends Model { }

MatchShopHq.init({
    id: {
        comment: 'รหัสหลักตารางของตารางเก็บข้อมูล Multi Branch',
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
    shop_id: {
        comment: 'รหัสหลักตารางของ ShopProfile (Id ของ app_datas.dat_shops_profiles)',
        type: DataTypes.UUID,
        references: {
            model: {
                schema: 'app_datas',
                tableName: 'dat_shops_profiles',
            },
            key: 'id'
        },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    is_hq: {
        comment: 'สถานะไว้บอกว่า shop_id ไหน เป็น HQ',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    modelName: 'MatchShopHq',
    schema: 'app_datas',
    tableName: 'match_shop_to_hq',
    comment: 'ตารางเก็บข้อมูล Multi Branch, โดย ShopProfile Id นั้น ๆ อยู่ใน HQ ตัวไหนบ้าง',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['hq_id', 'shop_id']
        }
    ]
});


module.exports = MatchShopHq;