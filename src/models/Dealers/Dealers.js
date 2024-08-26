const Model = require("sequelize").Model;
const { DataTypes } = require("sequelize");
const db = require("../../db");

class Dealers extends Model { }

Dealers.init({
    master_dealer_code_id: {
        type: DataTypes.CHAR,
        allowNull: true,
    },
    dealer_code_id: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    bus_type_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    dealer_name: {
        type: DataTypes.JSON,
        allowNull: false
    },
    tel_no: {
        type: DataTypes.JSON,
        allowNull: true
    },
    mobile_no: {
        type: DataTypes.JSON,
        allowNull: true
    },
    e_mail: {
        type: DataTypes.CHAR,
        allowNull: true
    },
    address: {
        type: DataTypes.JSON,
        allowNull: true
    },
    subdistrict_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    district_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    province_id: {
        type: DataTypes.UUID,
        allowNull: true
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
    created_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    sync_api_config: {
        type: DataTypes.JSON,
        allowNull: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'Dealers',
    schema: 'app_datas',
    tableName: 'dat_dealers',
});


module.exports = Dealers;