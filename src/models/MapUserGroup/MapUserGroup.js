const { DataTypes, Model, literal } = require("sequelize");
const db = require("../../db");

class MapUserGroup extends Model { }

MapUserGroup.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    group_id: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    sequelize: db,
    modelName: 'MapUserGroup',
    schema: 'systems',
    tableName: 'sysm_maptb_user_group',
    timestamps: false,
});

module.exports = MapUserGroup;