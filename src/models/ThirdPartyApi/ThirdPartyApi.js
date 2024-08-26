const Model = require("sequelize").Model;
const { DataTypes, literal, fn } = require("sequelize");
const db = require("../../db");

class ThirdPartyApi extends Model { }

ThirdPartyApi.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    third_party_api_name: {
        type: DataTypes.CHAR,
        allowNull: false,
        comment: "ชื่อเรียก API บุคคลที่สามที่ต้องการเชื่อมต่อ"
    },
    url_api_link: {
        type: DataTypes.CHAR,
        allowNull: false,
        unique: {
            args: true,
            msg: 'url_api_link is unique',
        },
        comment: "ลิ้งค์ที่อยู่ของ api บุคคลที่สาม",
    },
    detail: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "รายละเอียดข้อมูลของ api"
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: "90f5a0a9-a111-49ee-94df-c5623811b6cc",
        comment: "สร้างข้อมูลโดย",
        references: {
            model: 'sysm_users',
            key: 'id'
        }
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: fn('now'),
        comment: "สร้างข้อมูลวันที่"
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "ปรับปรุงข้อมูลโดย",
        references: {
            model: 'sysm_users',
            key: 'id'
        }
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "ปรับปรุงข้อมูลวันที่"
    },
    sort_order: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        comment: "ใช้สำหรับจัดเรียง"
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)"
    }
}, {
    sequelize: db,
    modelName: 'ThirdPartyApi',
    schema: 'systems',
    tableName: 'sysm_third_party_api',
});


module.exports = ThirdPartyApi;