const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class Province extends Model { }

Province.init({
    prov_code: {
        type: DataTypes.CHAR
    },
    prov_text_code: {
        type: DataTypes.CHAR
    },
    prov_name_th: {
        type: DataTypes.TEXT
    },
    prov_name_en: {
        type: DataTypes.TEXT
    },
    reg_code: {
        type: DataTypes.CHAR
    },
    cwt_unig: {
        type: DataTypes.CHAR
    },
    initials: {
        type: DataTypes.CHAR
    },
}, {
    sequelize: db,
    modelName: 'Province',
    schema: 'master_lookup',
    tableName: 'mas_provinces',
    timestamps: false,
});


module.exports = Province;