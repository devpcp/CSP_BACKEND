// const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

/**
 * A function do dynamics table of model ShopVehicleCustomer
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_vehicles_customers"
 */
const ShopVehicleCustomer = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const User = require("../model").User;
    const VehicleBrand = require("../model").VehicleBrand;
    const VehicleModelType = require("../model").VehicleModelType;
    const VehicleType = require("../model").VehicleType;
    const ShopBusinessCustomers = require("../model").ShopBusinessCustomers(table_name);
    const ShopPersonalCustomers = require("../model").ShopPersonalCustomers(table_name);

    class ShopVehicleCustomer extends Model { }

    ShopVehicleCustomer.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลรายระเอียดยานพาหนะ`
        },
        code_id: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'รหัสเลขที่ยานพาหนะภายในระบบ'
        },
        shop_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสข้อมูลร้านค้า`
        },
        bus_customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `รหัสตารางข้อมูลลูกค้าธุรกิจ`
        },
        per_customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา`
        },
        details: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: `รายละเอียดข้อมูลยานพาหนะ
            Ex.
            {
              "data":"xxx",
              "data_2":{"th":"xxx", "en":"xxx"},
              "data_3":"xxx",
              "data_4":"xxx"
            }`
        },
        vehicle_type_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `ประเภทยานพาหนะ`
        },
        vehicle_brand_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลยี่ห้อยานพาหนะ`
        },
        vehicle_model_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลรุ่นยานพาหนะ`
        },
        isuse: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: `สถานะการใช้งานข้อมูล 0 = ยกเลิก, 1 = ใช้งาน, 2 = ลบอยู่ในถังขยะ`
        },
        run_no: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: `เลขที่ run ข้อมูลยาพาหนะ`
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `สร้างข้อมูลโดย`
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: `สร้างข้อมูลวันที่`
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: `ปรับปรุงข้อมูลโดย`
        },
        updated_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: `ปรับปรุงข้อมูลวันที่`
        }
    }, {
        sequelize: db,
        modelName: 'ShopVehicleCustomer',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_vehicles_customers`
    });

    ShopVehicleCustomer.belongsTo(ShopBusinessCustomers, { foreignKey: 'bus_customer_id' });

    ShopVehicleCustomer.belongsTo(ShopPersonalCustomers, { foreignKey: 'per_customer_id' });

    VehicleType.hasMany(ShopVehicleCustomer, { foreignKey: 'vehicle_type_id' });
    ShopVehicleCustomer.belongsTo(VehicleType, { foreignKey: 'vehicle_type_id' });

    VehicleBrand.hasMany(ShopVehicleCustomer, { foreignKey: 'vehicle_brand_id' });
    ShopVehicleCustomer.belongsTo(VehicleBrand, { foreignKey: 'vehicle_brand_id' });

    VehicleModelType.hasMany(ShopVehicleCustomer, { foreignKey: 'vehicle_model_id' });
    ShopVehicleCustomer.belongsTo(VehicleModelType, { foreignKey: 'vehicle_model_id' });

    ShopVehicleCustomer.belongsTo(User, { foreignKey: 'created_by' });
    ShopVehicleCustomer.belongsTo(User, { foreignKey: 'updated_by' });

    const hookFunctions = (options = {}) => {
        // const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name)?.ShopModels || require("../model").initShopModel(table_name);
        // const {
        //     ShopServiceOrderDoc,
        //     ShopCustomerDebtList
        // } = ShopModels;

        /**
         * @param {ShopVehicleCustomer} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopVehicleCustomer> | import("sequelize/types/model").SaveOptions<ShopVehicleCustomer>} options
         */
        const hookBeforeSave_mutationDetails = async (instance, options) => {
            if (instance.isNewRecord) {
                let isChanged__details = false;

                const details = instance.get('details') || {};

                if (details.hasOwnProperty('mileage_first') === false) {
                    details.mileage_first = "0";
                    isChanged__details = true;
                }
                if (details.hasOwnProperty('mileage') === false) {
                    details.mileage = "0";
                    isChanged__details = true;
                }

                if (isChanged__details) {
                    instance.set('details', details);
                }
            }
        };

        return {
            hookBeforeSave_mutationDetails
        };
    };

    ShopVehicleCustomer.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });
    });

    ShopVehicleCustomer.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_mutationDetails(instance, options);
    });

    return ShopVehicleCustomer;
}


module.exports = ShopVehicleCustomer;