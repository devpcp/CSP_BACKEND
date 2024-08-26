const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class Log extends Model { }

Log.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    action: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ip: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    mac_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    device: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    browser: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    os: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sysm_type: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'Log',
    schema: 'systems',
    tableName: 'logs',
    timestamps: false,
});


module.exports = Log;