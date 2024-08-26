/**
 * A function do dynamics table of model ShopProductsHoldWYZauto
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_products_hold_wyzauto"
 * @return An instance of model ShopProductsHoldWYZauto by sequelize
 */
const ShopProductsHoldWYZauto = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        const Model = require("sequelize").Model;
        const { DataTypes, literal } = require("sequelize");

        const db = require("../../db");

        const ShopProduct = require("../model").ShopProduct(table_name);
        const ShopStock = require("../model").ShopStock(table_name);
        const User = require("../model").User;

        class ShopProductsHoldWYZauto extends Model { }

        ShopProductsHoldWYZauto.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
                allowNull: false,
                primaryKey: true,
                comment: 'รหัสหลักตารางข้อมูลสินค้าภายในร้านที่ส่งไปจัดจำหน่ายบน WYZAuto'
            },
            product_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopProduct,
                    key: 'id'
                },
                comment: 'รหัสตารางข้อมูลสินค้า'
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'วันที่เริ่มต้นใช้ข้อมูล'
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'วันที่สินสุดการใช้ข้อมูล'
            },
            details: {
                type: DataTypes.JSON,
                allowNull: false,
                comment: 'ข้อมูลรายละเอียดเก็บเป็น JSON \n' +
                    'Ex.\n' +
                    '{   \n' +
                    '   "price":3500, \n' +
                    '   "dot":"0122",\n' +
                    '   "hold_amount_stock":15,\n' +
                    '   "real_hold_amount_stock":15,\n' +
                    '   "wyzauto_balance_check_stock":5\n' +
                    '}\n' +
                    '  price = ราคาที่จำหน่ายบน WYZAuto \n' +
                    '  dot = Dot ยางที่จำหน่ายบน WYZAuto\n' +
                    '  hold_amount_stock = จำนวนที่ส่งขึ้นไป WYZAuto แรกเริ่มครั้งนั้น ของราคาและ Dot นั้นๆ\n' +
                    '  real_hold_amount_stock = จำนวนที่ขายออกไปหลังหัก Stock ที่เปิดบิลขายสำหรับ WYZAuto\n' +
                    '  wyzauto_balance_check_stock = ข้อมูลรายการสินค้าคงเหลือบน WYZAuto จริง ไว้ตรวจสอบเปรียบเทียบข้อมูล'
            },
            isuse: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: literal(`1`),
                validate: {
                    isIn: [[0, 1, 2]]
                },
                comment: 'สถานะการใช้งานข้อมูล 0=ยกเลิก, 1=ใช้งาน, 2=ลบลงถังขยะ'
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
                defaultValue: literal(`now()`),
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
        }, {
            sequelize: db,
            modelName: 'ShopProductsHoldWYZauto',
            tableName: `dat_${table_name}_products_hold_wyzauto`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการสินค้าและราคาของร้านค้าแต่ละร้านที่จัดจำหน่ายบน WYZAuto'
        });

        ShopProductsHoldWYZauto.belongsTo(ShopProduct, { foreignKey: 'product_id', as: 'ShopProducts' });
        ShopProductsHoldWYZauto.belongsTo(User, { foreignKey: 'created_by' });
        ShopProductsHoldWYZauto.belongsTo(User, { foreignKey: 'updated_by' });

        ShopProductsHoldWYZauto.belongsTo(ShopStock, { targetKey: 'product_id', foreignKey: 'product_id', as: 'ShopStock' });

        return ShopProductsHoldWYZauto;
    }
};

module.exports = ShopProductsHoldWYZauto;