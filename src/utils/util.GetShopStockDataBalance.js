/**
 * @type {import("lodash")._}
 */
const _ = require("lodash");
const {
    QueryTypes,
} = require("sequelize");
const { isUUID } = require("./generate");

/**
 * @param table_name {string}
 * @param {{
 *  transaction?: import("sequelize").Transaction;
 *  shop_product_id?: string;
 *  shop_warehouse_id?: string;
 *  shop_warehouse_shelf_item_id?: string;
 *  purchase_unit_id?: string;
 *  dot_mfd?: string;
 *  balance?: string;
 * }} options - if select 'balance' please fill query example more than zero '> 0'
 */
const utilGetShopStockDataBalance = async (table_name, options = {}) => {
    const db = require("../db");

    /**
     * @type {import("sequelize").Transaction}
     */
    const transaction = options?.transaction || null;

    /**
     * @type {string|undefined}
     */
    const shop_product_id = options?.shop_product_id || undefined;
    /**
     * @type {string|undefined}
     */
    const shop_warehouse_id = options?.shop_warehouse_id || undefined;
    /**
     * @type {string|null|undefined}
     */
    const shop_warehouse_shelf_item_id = options?.shop_warehouse_shelf_item_id || undefined;
    /**
     * @type {string|null|undefined}
     */
    const purchase_unit_id = options?.purchase_unit_id || undefined;
    /**
     * @type {string|null|undefined}
     */
    const dot_mfd = options?.dot_mfd || undefined;

    /**
     * @type {string|undefined}
     */
    const balance = options?.balance || undefined;

    const whereQueries = [];
    if (isUUID(shop_product_id)) {
        whereQueries.push(`shop_product_id = '${shop_product_id}'`);
    }
    if (isUUID(shop_warehouse_id)) {
        whereQueries.push(`shop_warehouse_id = '${shop_warehouse_id}'`);
    }
    if (_.isNull(shop_warehouse_shelf_item_id)) {
        whereQueries.push(`shop_warehouse_shelf_item_id IS NULL`);
    }
    if (_.isString(shop_warehouse_shelf_item_id) && shop_warehouse_shelf_item_id.length > 0) {
        whereQueries.push(`shop_warehouse_shelf_item_id = '${shop_warehouse_shelf_item_id}'`);
    }
    if (_.isNull(purchase_unit_id)) {
        whereQueries.push(`purchase_unit_id IS NULL`);
    }
    if (isUUID(purchase_unit_id)) {
        whereQueries.push(`purchase_unit_id = '${purchase_unit_id}'`);
    }
    if (_.isNull(dot_mfd)) {
        whereQueries.push(`dot_mfd IS NULL`);
    }
    if (_.isString(dot_mfd) && dot_mfd.length > 0) {
        whereQueries.push(`dot_mfd = '${dot_mfd}'`);
    }
    if (_.isString(balance) && balance.length > 0) {
        whereQueries.push(`balance ${balance}`);
    }

    /**
     * @type {
     * {
     *   shop_stock_id: string;
     *   shop_product_id: string;
     *   shop_warehouse_id: string;
     *   shop_warehouse_shelf_item_id: string;
     *   purchase_unit_id: string|null;
     *   dot_mfd: string|null;
     *   balance: number;
     *   balance_date: string;
     *   created_date: string;
     *   created_by: string;
     *   updated_date: string;
     *   updated_by: string;
     * }[]
     * }
     */
    const findStock = await db.query(
        `
        WITH ShopStock AS (
            SELECT
                ShopStock.id AS shop_stock_id,
                ShopStock.product_id AS shop_product_id,
                (ShopStockWarehouse->>'warehouse')::UUID AS shop_warehouse_id,
                (nullif(trim((ShopStockWarehouseShelf->>'item')), ''))::varchar AS shop_warehouse_shelf_item_id,
                (nullif(trim((ShopStockWarehouseShelf->>'purchase_unit_id')), ''))::UUID AS purchase_unit_id,
                (nullif(trim((ShopStockWarehouseShelf->>'dot_mfd')), ''))::varchar AS dot_mfd,
                (ShopStockWarehouseShelf->>'balance')::BIGINT AS balance,
                ShopStock.balance_date AS balance_date,
                ShopStock.created_date AS created_date,
                ShopStock.created_by AS created_by,
                ShopStock.updated_date AS updated_date,
                ShopStock.updated_by AS updated_by
            FROM app_shops_datas.dat_01hq0011_stock_products_balances AS ShopStock
                CROSS JOIN LATERAL json_array_elements(ShopStock.warehouse_detail) AS ShopStockWarehouse
                CROSS JOIN LATERAL json_array_elements(ShopStockWarehouse.value->'shelf') AS ShopStockWarehouseShelf
        )
        SELECT * FROM ShopStock
        ${
            whereQueries.length === 0
                ? ''
                : whereQueries.reduce(
                    (previousValue, currentValue, currentIndex) => {
                        if (currentIndex === 0) {
                            return `WHERE ${previousValue} ${currentValue}`;
                        }
                        else {
                            return `${previousValue} AND ${currentValue}`;
                        }
                    }, 
                    ``
                )
        }
        `.replace(/(\.dat_01hq0011_)/g, `.dat_${table_name}_`),
        {
            type: QueryTypes.SELECT,
            transaction: transaction
        }
    );

    return findStock;
};


module.exports = utilGetShopStockDataBalance;