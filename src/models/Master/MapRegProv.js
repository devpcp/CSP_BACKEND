const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require('../../db');

class MapRegProv extends Model { }

MapRegProv.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    reg_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'รหัสภูมิภาค'
    },
    prov_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'รหัสจังหวัด'
    }
}, {
    sequelize: db,
    modelName: 'MapRegProv',
    schema: 'master_lookup',
    tableName: 'mas_reg_map_prov',
    timestamps: false,
});

// MapRegProv.removeAttribute('id');


module.exports = MapRegProv