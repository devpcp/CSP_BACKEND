const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");


class User extends Model { }

User.init({
    // Model attributes are defined here
    user_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    e_mail: {
        type: DataTypes.STRING
    },
    note: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    last_login: {
        type: DataTypes.DATE
    },
    token_date: {
        type: DataTypes.DATE
    },
    token_set: {
        type: DataTypes.JSON
    },
    login_status: {
        type: DataTypes.SMALLINT
    },
    activate: {
        type: DataTypes.SMALLINT
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
    }
}, {
    sequelize: db,
    modelName: 'User',
    schema: 'systems',
    tableName: 'sysm_users'
});


module.exports = User;