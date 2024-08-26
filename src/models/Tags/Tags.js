const Model = require("sequelize").Model;
const { DataTypes, Transaction } = require("sequelize");
const db = require("../../db");


class Tags extends Model { }

Tags.init({
    id: {
        comment: 'รหัสหลักตารางของ Tags',
        type: DataTypes.UUID,
        defaultValue: db.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    tag_name: {
        comment: 'ชื่อของ Tags',
        type: DataTypes.JSONB,
        allowNull: false
    },
    tag_type: {
        comment: 'ประเภทของ tags\n0=ใช้ได้ทั้งหมด\n 1=สินค้า\n 2=ลูกค้า',
        type: DataTypes.SMALLINT,
        allowNull: false,
        enum: [0, 1, 2]
    },
    run_no: {
        comment: 'ลำดับรายการ',
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    details: {
        comment: 'ข้อมูลรายละเอียดเก็บเป็น JSONB',
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: `สถานะการใช้งานข้อมูล 0=ยกเลิก, 1=ใช้งาน, 2=ลบลงถังขยะ`
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
        defaultValue: db.literal('now()'),
        allowNull: false
    },
    updated_by: {
        comment: 'ปรับปรุงข้อมูลโดย',
        type: DataTypes.UUID,
        references: {
            model: {
                schema: 'systems',
                tableName: 'sysm_users',
            },
            key: 'id'
        },
        allowNull: true,
        defaultValue: null,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    updated_date: {
        comment: 'ปรับปรุงข้อมูลวันที่',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    sequelize: db,
    modelName: 'Tags',
    schema: 'app_datas',
    tableName: 'dat_tags',
    timestamps: false,
    comment: 'ตารางข้อมูลเก็บข้อมูลของ Tags',
});

Tags.sync()

module.exports = Tags;