const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require('../../db');

class Oauth extends Model { }

Oauth.init({
    client_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    client_secret: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    site_whitelist: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    user_id: {
        type: DataTypes.UUID,
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
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
}, {
    sequelize: db,
    modelName: 'Oauth',
    schema: 'systems',
    tableName: 'sysm_oauth',
});

Oauth.removeAttribute('id');


module.exports = Oauth;