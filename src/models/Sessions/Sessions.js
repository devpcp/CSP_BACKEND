const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class Sessions extends Model { }

Sessions.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    session_type: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    created_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expiration_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    detail: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'Session',
    schema: 'systems',
    tableName: 'sysm_session',
    createdAt: false,
    updatedAt: false
});

module.exports = Sessions;