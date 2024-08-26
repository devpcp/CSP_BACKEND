/**
 * A function do dynamics table of model ShopStock
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_stock_products_balances"
 */
const ShopStock = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal, QueryTypes } = require("sequelize");

    const db = require("../../db");

    const ShopsProfiles = require("../model").ShopsProfiles;
    const User = require("../model").User;
    const ShopProduct = require("../model").ShopProduct(table_name);

    class ShopStock extends Model {
        static async createMaterializedShopStock_v1 (shop_code_id = table_name, options = {}) {
            const transaction = options?.transaction || null;
            await db.query(
                `
                drop materialized view if exists app_shops_datas.materialized_shop_stock_v1_01hq0011;

                create materialized view if not exists app_shops_datas.materialized_shop_stock_v1_01hq0011 as
                WITH shopstock AS (SELECT shopstock_1.id                                                                             AS shop_stock_id,
                                          shopstock_1.product_id                                                                     AS shop_product_id,
                                          (shopstockwarehouse.value ->> 'warehouse'::text)::uuid                                     AS shop_warehouse_id,
                                          NULLIF(btrim(shopstockwarehouseshelf.value ->> 'item'::text),
                                                 ''::text)::character varying                                                        AS shop_warehouse_shelf_item_id,
                                          NULLIF(btrim(shopstockwarehouseshelf.value ->> 'purchase_unit_id'::text),
                                                 ''::text)::uuid                                                                     AS purchase_unit_id,
                                          NULLIF(btrim(shopstockwarehouseshelf.value ->> 'dot_mfd'::text),
                                                 ''::text)::character varying                                                        AS dot_mfd,
                                          (shopstockwarehouseshelf.value ->> 'balance'::text)::bigint                                AS balance,
                                          shopstock_1.balance_date,
                                          shopstock_1.created_date,
                                          shopstock_1.created_by,
                                          shopstock_1.updated_date,
                                          shopstock_1.updated_by
                                   FROM app_shops_datas.dat_01hq0011_stock_products_balances shopstock_1
                                            CROSS JOIN LATERAL json_array_elements(shopstock_1.warehouse_detail) shopstockwarehouse(value)
                                            CROSS JOIN LATERAL json_array_elements(shopstockwarehouse.value -> 'shelf'::text) shopstockwarehouseshelf(value))
                SELECT shopstock.shop_stock_id,
                       shopstock.shop_product_id,
                       shopstock.shop_warehouse_id,
                       shopstock.shop_warehouse_shelf_item_id,
                       shopstock.purchase_unit_id,
                       shopstock.dot_mfd,
                       shopstock.balance,
                       shopstock.balance_date,
                       shopstock.created_date,
                       shopstock.created_by,
                       shopstock.updated_date,
                       shopstock.updated_by
                FROM shopstock;
                
                create index if not exists materialized_shop_stock_01hq0011_shop_stock_id_index
                    on app_shops_datas.materialized_shop_stock_v1_01hq0011 (shop_stock_id);
                
                create index if not exists materialized_shop_stock_01hq0011_shop_product_id_index
                    on app_shops_datas.materialized_shop_stock_v1_01hq0011 (shop_product_id);
                
                create index if not exists materialized_shop_stock_01hq0011_shop_warehouse_id_index
                    on app_shops_datas.materialized_shop_stock_v1_01hq0011 (shop_warehouse_id);
                
                create index if not exists materialized_shop_stock_01hq0011_purchase_unit_id_index
                    on app_shops_datas.materialized_shop_stock_v1_01hq0011 (purchase_unit_id);
                
                create index if not exists materialized_shop_stock_01hq0011_shelf_item_id_index
                    on app_shops_datas.materialized_shop_stock_v1_01hq0011 (shop_warehouse_shelf_item_id);
                
                create index if not exists materialized_shop_stock_01hq00111_shop_dot_mfd_index
                    on app_shops_datas.materialized_shop_stock_v1_01hq0011 (dot_mfd);
                `.replace(/(01hq0011)/g, shop_code_id.toLowerCase()),
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );
        }
    }

    ShopStock.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: true,
            primaryKey: true,
            comment: `รหัสหลักตารางข้อมูลสมดุลสินค้าคงคลัง`
        },
        shop_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลร้านค้า`
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: `รหัสตารางข้อมูลสินค้า`
        },
        warehouse_detail: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'คลังสินค้าเก็บเป็น JSON\n' +
                '{\n' +
                ' "warehouse":"uuid",\n' +
                ' "shelf":[{"item":"num shelf 1", "balance":"จำนวนสินค้าคงเหลือ", "holding_product":"จำนวนของที่จองไว้", "dot_mfd":"วันที่ผลิตหรือสัปดาห์การผลิต","purchase_unit_id":"UUID ของหน่อยซื้อ"},{"item":"num shelf 2", "balance":"จำนวนสินค้าคงเหลือ", "holding_product":"จำนวนของที่จองไว้", "dot_mfd":"วันที่ผลิตหรือสัปดาห์การผลิต","purchase_unit_id":"UUID ของหน่อยซื้อ"}]\n' +
                '}'
        },
        balance: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: `ยอดดุลสินค้าคงคลัง`
        },
        balance_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: `วันเวลาปรับดุลคงคลัง`
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
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
            comment: `ปรับปรุงข้อมูลโดย`
        },
        updated_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: `ปรับปรุงข้อมูลวันที่`
        }
    }, {
        sequelize: db,
        modelName: 'ShopStock',
        schema: 'app_shops_datas',
        tableName: `dat_${table_name}_stock_products_balances`,
        comment: 'ตารางข้อมูลสินค้าคงเหลือในคลังสินค้าของแต่ละร้านแยกตามร้าน',
        indexes: [
            {
                fields: ['product_id'],
                unique: true
            },
            {
                name: `dat_${table_name}_stock_products_balances_balance_desc`,
                fields: ['balance'],
                operator: 'desc'
            }
        ]
    });

    ShopsProfiles.hasOne(ShopStock, { foreignKey: 'shop_id' })
    ShopStock.belongsTo(ShopsProfiles, { foreignKey: 'shop_id' })

    ShopProduct.hasOne(ShopStock, { foreignKey: 'product_id' })
    ShopStock.belongsTo(ShopProduct, { foreignKey: 'product_id' })

    ShopStock.belongsTo(User, { foreignKey: 'created_by' });
    ShopStock.belongsTo(User, { foreignKey: 'updated_by' });

    ShopStock.afterSync(async (options) => {
        const transaction = options?.transaction || null;
        await ShopStock.createMaterializedShopStock_v1(table_name, { transaction: transaction });
    });

    return ShopStock;
}

module.exports = ShopStock;