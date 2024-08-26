const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class ThirdPartyApiConnectData extends Model { }

ThirdPartyApiConnectData.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    shop_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: {
                schema: 'app_datas',
                tableName: 'dat_shops_profiles'
            },
            key: 'id'
        },
        comment: 'รหัสเชื่อมตารางตัวแทน'
    },
    api_key: {
        type: DataTypes.CHAR,
        allowNull: true,
        comment: "Key สำหรับเชื่อม API"
    },
    auth_username: {
        type: DataTypes.CHAR,
        allowNull: true,
        comment: "ชื่อผู้ใช้สำหรับเข้าถึง API",

    },
    auth_password: {
        type: DataTypes.CHAR,
        allowNull: true,
        comment: "รหัสผ่านสำหรับเข้าถึง API"
    },
    auth_oauth: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "เก็บข้อมูล Oauth"
    },
    third_party_sys_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'รหัสตารางข้อมูลการเชื่อนต่อ API บุคคลที่ 3'
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
        defaultValue: literal('now()'),
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
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)"
    }
}, {
    sequelize: db,
    modelName: 'ThirdPartyApiConnectData',
    schema: 'app_datas',
    tableName: 'dat_third_party_api_connect_datas',
});


module.exports = ThirdPartyApiConnectData;