/**
 * A function do dynamics table of model ShopInventoryPurchasingPreOrderProductList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_inventory_purchasing_pre_order_product_list"
 * @return An instance of model ShopInventoryPurchasingPreOrderProductList by sequelize
 */
const ShopInventoryPurchasingPreOrderProductList = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        const Model = require("sequelize").Model;
        const { DataTypes, literal } = require("sequelize");
        const db = require('../../db');

        const modelShopProfiles = require("../model").ShopsProfiles;
        const modelUsers = require("../model").User;
        const modelShopProducts = require("../model").ShopProduct(table_name);
        const modelShopInventoryPurchasingPreOrderDoc = require("../model").ShopInventoryPurchasingPreOrderDoc(table_name);


        class ShopInventoryPurchasingPreOrderProductList extends Model { }

        ShopInventoryPurchasingPreOrderProductList.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
                allowNull: false,
                primaryKey: true,
                comment: `รหัสหลักตารางข้อมูลการสั่งซื้อสินค้า`
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfiles,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลร้านค้า`
            },
            product_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProducts,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลสินค้าภายในร้านค้าแต่ละร้าน`
            },
            amount: {
                type: DataTypes.BIGINT,
                allowNull: false,
                comment: `จำนวนที่สั่งซื้อ`
            },
            pre_order_date: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: `วันที่สั่งซื้อ`
            },
            doc_inventory_purchasing_pre_order_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopInventoryPurchasingPreOrderDoc,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลเอกสารการสั่งซื้อสินค้าของแต่ละร้านค้า`
            },
            ref_pr_doc_inventory_purchasing_pre_order_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopInventoryPurchasingPreOrderDoc,
                    key: 'id'
                },
                comment: `อ้างอิงเอกสารรายการขอซื้อ PR สำหรับ PO`
            },
            ref_po_doc_inventory_purchasing_pre_order_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopInventoryPurchasingPreOrderDoc,
                    key: 'id'
                },
                comment: `อ้างอิงเอกสารรายการสั่งซื้อ PO สำหรับใบส่งคืนสินค้า Return Receipt`
            },
            details: {
                type: DataTypes.JSON,
                allowNull: false,
                default: {},
                comment: `รายละเอียดข้อมูลเพิ่มเตินของสินค้านั้นๆ เก็บเป็น JSON`
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: true,
                defaultValue: literal(`1`),
                comment: `สถานะของการสั่งซื้อสินค้านั้นๆ (0=ยกเลิก, 1=สั่งซื้อสำเร็จครบถ้วน, 2=สั่งซื้อสำเร็จบางส่วน)`
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelUsers,
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
                    model: modelUsers,
                    key: 'id'
                },
                comment: `ปรับปรุงข้อมูลโดย`
            },
            updated_date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
                comment: `ปรับปรุงข้อมูลวันที่`
            }
        }, {
            sequelize: db,
            modelName: 'ShopInventoryPurchasingPreOrderProductList',
            tableName: `dat_${table_name}_inventory_purchasing_pre_order_product_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ'
        });

        ShopInventoryPurchasingPreOrderProductList.belongsTo(modelShopProfiles, { foreignKey: 'shop_id', as: 'ShopsProfile' });
        ShopInventoryPurchasingPreOrderProductList.belongsTo(modelShopProducts, { foreignKey: 'product_id', as: 'ShopProduct' });
        ShopInventoryPurchasingPreOrderProductList.belongsTo(modelShopInventoryPurchasingPreOrderDoc, { foreignKey: 'doc_inventory_purchasing_pre_order_id', as: 'ShopInventoryPurchasingPreOrderDoc' });
        ShopInventoryPurchasingPreOrderProductList.belongsTo(modelUsers, { foreignKey: 'created_by' });
        ShopInventoryPurchasingPreOrderProductList.belongsTo(modelUsers, { foreignKey: 'updated_by' });

        return ShopInventoryPurchasingPreOrderProductList;
    }
};

module.exports = ShopInventoryPurchasingPreOrderProductList;