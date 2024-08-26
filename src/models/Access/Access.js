const { DataTypes, Model } = require("sequelize");
const db = require("../../db");

class Access extends Model { }

Access.init({
    access_name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rules: {
        type: DataTypes.ARRAY(DataTypes.UUID),
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
    modelName: 'Access',
    schema: 'systems',
    tableName: 'sysm_access_levels'
});


module.exports = Access;