/**
 * A function do dynamics table of model ShopAppointment
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_appointment"
 * @return An instance of model ShopAppointment by sequelize
 */
const ShopAppointment = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");

    const db = require("../../db");

    const __model = require("../model");
    const ShopProfile = __model.ShopsProfiles;
    const ShopBusinessCustomer = __model.ShopBusinessCustomers(table_name);
    const ShopPersonalCustomer = __model.ShopPersonalCustomers(table_name);
    const ShopVehicleCustomer = __model.ShopVehicleCustomer(table_name);
    const User = __model.User;

    class ShopAppointment extends Model { }

    ShopAppointment.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: literal('uuid_generate_v4()'),
                allowNull: false,
                primaryKey: true,
                comment: `รหัสหลักตารางข้อมูลการนัดหมาย`
            },
            run_no: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: `เลขที่ run เอกสาร`
            },
            code_id: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: `รหัสเลขที่เอกสาร`
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopProfile,
                    key: 'id'
                },
                comment: `รหัสข้อมูลร้านค้า`
            },
            bus_customer_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopBusinessCustomer,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลลูกค้าธุรกิจ`
            },
            per_customer_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopPersonalCustomer,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา`
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: `วันที่เริ่มนัดมหาย`
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: `วันที่สิ้นสุดนัดหาย`
            },
            details: {
                type: DataTypes.JSON,
                allowNull: false,
                comment: 'รายละเอียดข้อมูลการนัดหมาย\n' +
                    'Ex.\n' +
                    '{\n' +
                    '  "data":"xxx",\n' +
                    '  "data_2":{"th":"xxx", "en":"xxx"},\n' +
                    '  "data_3":"xxx",\n' +
                    '  "data_4":"xxx"\n' +
                    '}'
            },
            vehicles_customers_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopVehicleCustomer,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลยานพาหนะ`
            },
            appointment_status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[0, 1, 2]]
                },
                comment: `สถานะการนัดหมาย 0 = รอยืนยีนการนัดหมาย, 1 = ยืนยันการนัดหมาย, 2=ยกเลิกการนัดหมาย`
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2]]
                },
                comment: `สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)`
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: User,
                    key: 'id'
                },
                comment: `สร้างข้อมูลโดย`
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal('now()'),
                comment: `สร้างข้อมูลวันที่`
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: User,
                    key: 'id'
                },
                comment: `ปรับปรุงข้อมูลโดย`
            },
            updated_date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
                comment: `ปรับปรุงข้อมูลวันที่`
            },
        },
        {
            sequelize: db,
            modelName: 'ShopAppointment',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_appointment`,
            comment: 'ตารางข้อมูลการนัดหมาย',
            timestamps: false
        }
    );

    ShopAppointment.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfiles' });
    ShopAppointment.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomers' });
    ShopAppointment.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomers' });
    ShopAppointment.belongsTo(ShopVehicleCustomer, { foreignKey: 'vehicles_customers_id', as: 'ShopVehicleCustomers' });
    ShopAppointment.belongsTo(User, { foreignKey: 'created_by' });
    ShopAppointment.belongsTo(User, { foreignKey: 'updated_by' });

    return ShopAppointment;
};


module.exports = ShopAppointment;