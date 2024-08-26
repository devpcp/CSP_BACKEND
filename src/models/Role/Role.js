const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");

class Role extends Model { }

Role.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    application_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    create: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    read: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    update_: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        field: 'update'
    },
    delete: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    group_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'Role',
    schema: 'systems',
    tableName: 'sysm_role',
});

module.exports = Role;