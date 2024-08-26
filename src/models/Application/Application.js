const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class Application extends Model { }

Application.init({
    application_name_old: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    access: {
        type: DataTypes.UUID,
        allowNull: true
    },
    use_menu: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    parent_menu: {
        type: DataTypes.UUID,
        allowNull: true
    },
    func_status: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    application_config: {
        type: DataTypes.JSON,
        allowNull: true
    },
    sort_order: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    application_name: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: "สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)"
    }
}, {
    sequelize: db,
    modelName: 'Application',
    schema: 'systems',
    tableName: 'sysm_application',
});


module.exports = Application;