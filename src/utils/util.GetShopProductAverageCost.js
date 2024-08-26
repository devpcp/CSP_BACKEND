const { QueryTypes } = require("sequelize");
const db = require("../db");

/**
 * @param table_name {string}
 * @param param0 {{
 *     shop_product_id: string;
 *     shop_warehouse_id: string;
 *     shop_warehouse_shelf_item_id: string;
 *     dot_mfd: string|null;
 *     purchase_unit_id: string;
 * }}
 * @param options {{
 *     transaction: import("sequelize").Transaction
 * }}
 * @return {Promise<{shop_inventory_management_log_id: string, inventory_transaction_doc_id: string, shop_product_id: string, shop_warehouse_id: string, shop_warehouse_shelf_item_id: string, dot_mfd: (string|null), purchase_unit_id: (string|null), product_cost_average: string, product_cost_latest: string, import_date_latest: Date}>}
 */
const utilGetShopProductAverageCost = async (table_name, { shop_product_id, shop_warehouse_id, shop_warehouse_shelf_item_id, dot_mfd, purchase_unit_id } = {}, options = {}) => {

    const sqlCommand = `
        WITH
        CTE_ShopInventoryImport AS (
            SELECT
                "ShopInventoryImportLog".shop_id AS shop_id,
                "ShopInventoryImportLog".product_id AS shop_product_id,
                ("ShopWarehouseDetail".value->>'warehouse')::uuid AS shop_warehouse_id,
                ("ShopWarehouseDetail".value->'shelf'->>'item')::varchar AS shop_warehouse_shelf_item_id,
                ("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')::varchar AS dot_mfd,
                ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid AS purchase_unit_id,
                coalesce(
                        "ShopInventoryImportLog".details->>'price_grand_total',
                        (
                            (
                                (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                    - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                            )::float
                        )::text
                )::float AS total_price,
                coalesce(
                        "ShopInventoryImportLog".details->>'price_grand_total',
                        (
                            (
                                (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                    - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                            )::float
                        )::text
                )::float / "ShopInventoryImportLog".amount AS product_cost,
                coalesce((
                     SELECT "ShopStock".balance
                     FROM (
                         SELECT
                            "ShopStock".id,
                            "ShopStock".shop_id,
                            "ShopStock".product_id AS shop_product_id,
                            ("ShopWarehouse".value->>'warehouse')::uuid AS shop_warehouse_id,
                            ("ShopWarehouseSelfItem".value->>'item') AS shop_warehouse_shelf_item_id,
                            ("ShopWarehouseSelfItem".value->>'dot_mfd') AS dot_mfd,
                            ("ShopWarehouseSelfItem".value->>'purchase_unit_id')::uuid AS purchase_unit_id,
                            coalesce(("ShopWarehouseSelfItem".value->>'balance'), '0')::bigint AS balance
                        FROM app_shops_datas.dat_01hq0010_stock_products_balances AS "ShopStock"
                            CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouse"
                            CROSS JOIN json_array_elements("ShopWarehouse".value->'shelf') AS "ShopWarehouseSelfItem"
                        WHERE "ShopStock".product_id = "ShopInventoryImportLog".product_id
                    ) AS "ShopStock"
                    WHERE "ShopStock".shop_id = "ShopInventoryImportLog".shop_id
                        AND "ShopStock".shop_product_id = "ShopInventoryImportLog".product_id
                        AND "ShopStock".shop_warehouse_id = ("ShopWarehouseDetail".value ->> 'warehouse')::uuid
                        AND ("ShopStock".shop_warehouse_shelf_item_id)::varchar = ("ShopWarehouseDetail".value->'shelf'->>'item')::varchar
                        AND ("ShopStock".dot_mfd)::varchar = ("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')::varchar
                        AND "ShopStock".purchase_unit_id = ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid
                ), 0)::BIGINT AS shop_stock_amount,
                "ShopInventoryImportLog".amount AS amount,
                "ShopInventoryImportLog".import_date AS import_date,
                "ShopInventoryImportLog".created_date
            FROM app_shops_datas.dat_01hq0010_inventory_management_logs AS "ShopInventoryImportLog"
                CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouseDetail"
            WHERE "ShopInventoryImportLog".status = 1
              AND "ShopInventoryImportLog".amount > 0
              AND (coalesce(
                        "ShopInventoryImportLog".details->>'price_grand_total',
                        (
                            (
                                (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                    - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                            )::float
                        )::text
                )::float > 0)
              AND ((SELECT "ShopInventoryImportDoc".status
                    FROM app_shops_datas.dat_01hq0010_inventory_transaction_doc AS "ShopInventoryImportDoc"
                    WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id) 
                   = 1)
        ),
        CTE_AVG AS (
            SELECT
                shop_id,
                shop_product_id,
                shop_warehouse_id,
                shop_warehouse_shelf_item_id,
                dot_mfd,
                purchase_unit_id,
                avg(product_cost)::float AS product_cost_average,
                (sum(shop_stock_amount) * avg(product_cost))::float AS product_cost_average_grand_total,
                sum(amount) AS amount,
                sum(shop_stock_amount) AS shop_stock_amount
            FROM CTE_ShopInventoryImport
            GROUP BY shop_id, shop_product_id, shop_warehouse_id, shop_warehouse_shelf_item_id, dot_mfd, purchase_unit_id
        )
        SELECT 
            shop_id,
            shop_product_id,
            shop_warehouse_id,
            shop_warehouse_shelf_item_id,
            dot_mfd,
            purchase_unit_id,
            (amount)::bigint AS amount,
            (shop_stock_amount)::bigint AS shop_stock_amount,
            (product_cost_average)::numeric(20,2) AS product_cost_average,
            (product_cost_average_grand_total)::numeric(20,2) AS product_cost_average_grand_total,
            (coalesce((
                SELECT (CTE_ShopInventoryImport.total_price / CTE_ShopInventoryImport.amount)
                FROM CTE_ShopInventoryImport
                WHERE CTE_ShopInventoryImport.shop_id = CTE_AVG.shop_id
                    AND CTE_ShopInventoryImport.shop_product_id = CTE_AVG.shop_product_id
                    AND CTE_ShopInventoryImport.shop_warehouse_id = CTE_AVG.shop_warehouse_id
                    AND CTE_ShopInventoryImport.shop_warehouse_shelf_item_id = CTE_AVG.shop_warehouse_shelf_item_id
                    AND coalesce(CTE_ShopInventoryImport.dot_mfd, '') = coalesce(CTE_AVG.dot_mfd, '')
                    AND CTE_ShopInventoryImport.purchase_unit_id = CTE_AVG.purchase_unit_id
                    AND ((CTE_ShopInventoryImport.total_price / CTE_ShopInventoryImport.amount) > 0)
                ORDER BY CTE_ShopInventoryImport.import_date DESC, CTE_ShopInventoryImport.created_date DESC
                LIMIT 1
            ), 0))::numeric(20,2) AS product_cost_latest,
            (
                SELECT max(CTE_ShopInventoryImport.import_date)
                FROM CTE_ShopInventoryImport
                WHERE CTE_ShopInventoryImport.shop_id = CTE_AVG.shop_id
                    AND CTE_ShopInventoryImport.shop_product_id = CTE_AVG.shop_product_id
                    AND CTE_ShopInventoryImport.shop_warehouse_id = CTE_AVG.shop_warehouse_id
                    AND CTE_ShopInventoryImport.shop_warehouse_shelf_item_id = CTE_AVG.shop_warehouse_shelf_item_id
                    AND coalesce(CTE_ShopInventoryImport.dot_mfd, '') = coalesce(CTE_AVG.dot_mfd, '')
                    AND CTE_ShopInventoryImport.purchase_unit_id = CTE_AVG.purchase_unit_id
                    AND ((CTE_ShopInventoryImport.total_price / CTE_ShopInventoryImport.amount) > 0)
            ) AS import_date_latest
        FROM CTE_AVG
        WHERE 
            shop_product_id = '${shop_product_id}'
            AND shop_warehouse_id = '${shop_warehouse_id}'
            AND shop_warehouse_shelf_item_id = '${shop_warehouse_shelf_item_id}'
            AND nullif(dot_mfd, '') ${dot_mfd ? `= '${dot_mfd}'` : `IS NULL`}
            AND purchase_unit_id ${purchase_unit_id ? `= '${purchase_unit_id}'` : `IS NULL`}
    `.replace(/(dat_01hq0010_)/ig, `dat_${table_name}_`.toLowerCase());

    /**
     * @type {Array<{
     *  shop_inventory_management_log_id: string;
     *  inventory_transaction_doc_id: string;
     *  shop_product_id: string;
     *  shop_warehouse_id: string;
     *  shop_warehouse_shelf_item_id: string;
     *  dot_mfd: string|null;
     *  purchase_unit_id: string|null;
     *  amount: string;
     *  shop_stock_amount: string;
     *  product_cost_average: string;
     *  product_cost_average_grand_total: string;
     *  product_cost_latest: string;
     *  import_date_latest: Date;
     * }>}
     */
    const queryResult = await db.query(
        sqlCommand.replace(/(\s)+/ig, ' '),
        {
            type: QueryTypes.SELECT,
            transaction: options?.transaction,
        }
    );

    return queryResult[0];
};


module.exports = utilGetShopProductAverageCost;