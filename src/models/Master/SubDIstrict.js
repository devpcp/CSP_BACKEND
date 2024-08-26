const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class SubDistrict extends Model { }

SubDistrict.init({
    subdit_code: {
        type: DataTypes.CHAR
    },
    zip_code: {
        type: DataTypes.CHAR
    },
    name_th: {
        type: DataTypes.TEXT
    },
    name_en: {
        type: DataTypes.TEXT
    },
    dit_id: {
        type: DataTypes.CHAR
    },
    district_id: {
        type: DataTypes.UUID
    }
}, {
    sequelize: db,
    modelName: 'SubDistrict',
    schema: 'master_lookup',
    tableName: 'mas_subdistrict',
    timestamps: false,
});


module.exports = SubDistrict;