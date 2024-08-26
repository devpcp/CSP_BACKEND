const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class District extends Model { }

District.init({
    dit_id: {
        type: DataTypes.CHAR
    },
    dit_code: {
        type: DataTypes.CHAR
    },
    name_th: {
        type: DataTypes.TEXT
    },
    name_en: {
        type: DataTypes.TEXT
    },
    prov_code: {
        type: DataTypes.CHAR
    },
    province_id: {
        type: DataTypes.UUID
    },
}, {
    sequelize: db,
    modelName: 'District',
    schema: 'master_lookup',
    tableName: 'mas_district',
    timestamps: false,
});


module.exports = District;