const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class Group extends Model { }

Group.init({
    parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    group_name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true

    },
    sort_order: {
        type: DataTypes.SMALLINT,
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
    modelName: 'Group',
    schema: 'systems',
    tableName: 'sysm_user_groups',
});


module.exports = Group