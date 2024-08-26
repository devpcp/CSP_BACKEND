const User = require("../Users/User");
/**
 * A function do dynamics table of model MatchShopServOrderAndTempDeliveryOrder
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_match_service_order_and_temporary_delivery_order_doc"
 * @return An instance of model MatchShopServOrderAndTempDeliveryOrder by sequelize
 */
const MatchShopServOrderAndTempDeliveryOrder = (table_name) => {
    if (!table_name) { throw Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal } = require("sequelize");
    const db = require("../../db");

    const User = require("../Users/User");
    const ShopServiceOrderDoc = require("../model").ShopServiceOrderDoc(table_name);
    const ShopTemporaryDeliveryOrderDoc = require("../model").ShopTemporaryDeliveryOrderDoc(table_name);

    class MatchShopServOrderAndTempDeliveryOrder extends Model { }

    MatchShopServOrderAndTempDeliveryOrder.init({
        id: {
            comment: 'รหัสหลักตารางของตารางข้อมูลเก็บความสัมพันธ์ของใบสั่งซ่อมและใบส่งของชั่วคราว',
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true
        },
        shop_service_order_doc_id: {
            comment: `รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม (app_shops_datas.dat_${table_name}_service_order_doc.id)`,
            type: DataTypes.UUID,
            references: {
                model: ShopServiceOrderDoc,
                key: 'id'
            },
            allowNull: false,
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        shop_temporary_delivery_order_doc_id: {
            comment: `รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว (app_shops_datas.dat_${table_name}_temporary_delivery_order_doc.id)`,
            type: DataTypes.UUID,
            references: ShopTemporaryDeliveryOrderDoc,
            allowNull: false,
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        created_by: {
            comment: `สร้างข้อมูลโดย`,
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        created_date: {
            comment: `สร้างข้อมูลวันที่`,
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: literal('now()')
        },
        updated_by: {
            comment: `ปรับปรุงข้อมูลโดย`,
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: User,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        updated_date: {
            comment: `ปรับปรุงข้อมูลวันที่`,
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        }
    }, {
        sequelize: db,
        modelName: 'MatchShopServOrderAndTempDeliveryOrder',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_match_service_order_and_temporary_delivery_order_doc`,
        comment: 'ตารางข้อมูลเก็บความสัมพันธ์ของใบสั่งซ่อมและใบส่งของชั่วคราว',
        timestamps: false
    });


    ShopTemporaryDeliveryOrderDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopTemporaryDeliveryOrderDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    return MatchShopServOrderAndTempDeliveryOrder;
};


module.exports = MatchShopServOrderAndTempDeliveryOrder;