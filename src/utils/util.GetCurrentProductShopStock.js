const _ = require("lodash");
const db = require("../db");
const { Transaction, QueryTypes } = require("sequelize");
const { isUUID } = require("./generate");

const fnSerializeOptionsQueryWhere = async (options) => {
    const functionName = fnSerializeOptionsQueryWhere.name;

    /**
     * @type {string | undefined}
     */
    const option_find_StockId = _.get(options, 'findStockId', undefined);
    /**
     * @type {string | undefined}
     */
    const option_find_ShopProductId = _.get(options, 'findShopProductId', undefined);
    /**
     * @type {string | undefined}
     */
    const option_find_ShopWarehouseId = _.get(options, 'findShopWarehouseId', undefined);
    /**
     * @type {string | undefined}
     */
    const option_find_ShopWarehouseItemId = _.get(options, 'findShopWarehouseItemId', undefined);
    /**
     * @type {string | undefined}
     */
    const option_find_PurchaseUnitId = _.get(options, 'findPurchaseUnitId', undefined);
    /**
     * @type {string | undefined}
     */
    const option_find_DotMfd = _.get(options, 'findDotMfd', undefined);

    /**
     * @type {string[]}
     */
    let preQueryWhere = [];

    if (!_.isUndefined(option_find_StockId)) {
        if (isUUID(option_find_StockId)) {
            preQueryWhere.push(` id = '${option_find_StockId}' `)
        }
        else {
            throw Error(`${functionName}: options.findStockId must be UUID, due have option`);
        }
    }
    if (!_.isUndefined(option_find_ShopProductId)) {
        if (isUUID(option_find_ShopProductId)) {
            preQueryWhere.push(` product_id = '${option_find_ShopProductId}' `)
        }
        else {
            throw Error(`${functionName}: options.findShopProductId must be UUID, due have option`);
        }
    }
    if (!_.isUndefined(option_find_ShopWarehouseId)) {
        if (isUUID(option_find_ShopWarehouseId)) {
            preQueryWhere.push(` warehouse_id = '${option_find_ShopWarehouseId}' `)
        }
        else {
            throw Error(`${functionName}: options.findShopWarehouseId must be UUID, due have option`);
        }
    }
    if (!_.isUndefined(option_find_ShopWarehouseItemId)) {
        if (_.isString(option_find_ShopWarehouseItemId)) {
            preQueryWhere.push(` warehouse_item_id = '${option_find_ShopWarehouseItemId}' `)
        }
        else {
            throw Error(`${functionName}: options.findShopWarehouseItemId must be UUID, due have option`);
        }
    }
    if (!_.isUndefined(option_find_PurchaseUnitId)) {
        if (isUUID(option_find_PurchaseUnitId)) {
            preQueryWhere.push(` purchase_unit_id = '${option_find_PurchaseUnitId}' `)
        }
        else if (_.isNull(option_find_PurchaseUnitId)) {
            preQueryWhere.push(` purchase_unit_id ISNULL `)
        }
        else {
            throw Error(`${functionName}: options.findPurchaseUnitId must be UUID, due have option`);
        }
    }
    if (!_.isUndefined(option_find_DotMfd)) {
        if (_.isString(option_find_DotMfd)) {
            preQueryWhere.push(` dot_mfd = '${option_find_DotMfd}' `)
        }
        else if (_.isNull(option_find_DotMfd)) {
            preQueryWhere.push(` dot_mfd ISNULL `)
        }
        else {
            throw Error(`${functionName}: options.findDotMfd must be UUID, due have option`);
        }
    }

    preQueryWhere = preQueryWhere.reduce(
        (previousValue, currentValue) => {
            if (preQueryWhere.length > 0 && previousValue.length === 0) {
                previousValue.push(`\n WHERE 1=1 `);
            }
            previousValue.push(`\n${previousValue.length > 0  ? ' AND ':''}${currentValue}`);
            return previousValue;
        },
        /**
         * @type {string[]}
         */
        []
    );

    const queryWhere = preQueryWhere.reduce((previousValue, currentValue) => previousValue + currentValue, '');

    return queryWhere;
};

/**
 *
 * @param {string} shop_code
 * @param {import("../types/type.Util.GetCurrentProductShopStock").IUtilGetCurrentProductShopStock_Options} options
 * @returns {Promise<Array<import("../types/type.Util.GetCurrentProductShopStock").IResultCurrentProductShopStock>>}
 */
const utilGetCurrentProductShopStock = async (shop_code = '', options) => {
    // const functionName = utilGetCurrentProductShopStock.name;

    shop_code = shop_code.toLowerCase();

    const option_transaction = _.get(options, 'transaction', null);

    const queryWhere = await fnSerializeOptionsQueryWhere(options);

    const transactionResult = await db.transaction(
        {
            transaction: option_transaction,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (t) => {
            /**
             * @type {import("../types/type.Util.GetCurrentProductShopStock").IResultCurrentProductShopStock[]}
             */
            const result = await db.query(
                `
                WITH CTE_1 AS (
                    SELECT
                        ShopStock.id AS id,
                        ShopStock.product_id AS product_id,
                        (ShopStockWarehouse->>'warehouse')::UUID AS warehouse_id,
                        (ShopStockWarehouseShelf->>'item')::Varchar AS warehouse_item_id,
                        (ShopStockWarehouseShelf->>'purchase_unit_id')::UUID AS purchase_unit_id,
                        NULLIF(REGEXP_REPLACE((ShopStockWarehouseShelf ->>'dot_mfd'), '\s', ''), '')::Char(4) AS dot_mfd,
                        (ShopStockWarehouseShelf->>'balance')::BIGINT AS balance,
                        ShopStock.balance_date AS balance_date,
                        ShopStock.created_date AS created_date,
                        ShopStock.created_by AS created_by,
                        ShopStock.updated_date AS updated_date,
                        ShopStock.updated_by AS updated_by
                    FROM app_shops_datas.dat_${shop_code}_stock_products_balances AS ShopStock
                        CROSS JOIN LATERAL json_array_elements(ShopStock.warehouse_detail) AS ShopStockWarehouse
                        CROSS JOIN LATERAL json_array_elements(ShopStockWarehouse.value->'shelf') AS ShopStockWarehouseShelf
                    ORDER BY
                        ShopStock.balance_date DESC,
                        ShopStock.updated_date DESC
                )

                SELECT 
                    id,
                    product_id,
                    warehouse_id,
                    warehouse_item_id,
                    purchase_unit_id,
                    dot_mfd,
                    balance,
                    balance_date,
                    created_date,
                    created_by,
                    updated_date,
                    updated_by
                FROM CTE_1
                ${queryWhere}
                `,
                {
                    transaction: t,
                    type: QueryTypes.SELECT
                }
            );

            return result;
        }
    );

    return transactionResult;
};


module.exports = utilGetCurrentProductShopStock;