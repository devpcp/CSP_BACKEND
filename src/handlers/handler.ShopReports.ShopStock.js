const _ = require("lodash");
const XLSX = require('xlsx-js-style');
const { v4: uuid4 } = require("uuid");
const { QueryTypes } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const { isUUID } = require("../utils/generate");

const db = require("../db");
const utilGetShopProductAverageCost = require("../utils/util.GetShopProductAverageCost");
const sequelize = require("../db");
const ProductModelType = require("../models/model").ProductModelType;
const ProductTypeGroup = require('../models/model').ProductTypeGroup;
const ProductBrand = require("../models/model").ProductBrand;
const ProductType = require("../models/model").ProductType;
const Product = require("../models/model").Product;
const ShopStock = require("../models/model").ShopStock;
const ShopProduct = require("../models/model").ShopProduct;


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault | {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault | {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const handlerShopReportsShopStock = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'GET ShopReports.ShopStock';

    try {
        const shop_table = await utilCheckShopTableName(request, 'select_shop_ids');

        // const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        let page = Number(_.get(request, 'query.page', 1));
        let limit = Number(_.get(request, 'query.limit', 10));
        const search = _.get(request, 'query.search', '');
        // const sort = request.query.sort || 'updated_date';
        // const order = request.query.order || 'desc';
        // const status = utilGetIsUse(request.query.status);
        const type_group_id = request.query.type_group_id || '';
        const product_type_id = request.query.product_type_id || '';
        const product_brand_id = request.query.product_brand_id || '';
        const product_model_id = request.query.product_model_id || '';
        const export_format = request.query.export_format;
        const gen_qr_code = request.query.gen_qr_code

        if (export_format === 'xlsx') {
            page = 1;
            limit = 1000000;
        }

        const min_balance = Number(_.get(request, 'query.min_balance', -1));
        const max_balance = Number(_.get(request, 'query.max_balance', -1));

        const fnFieldGenerate = (model, tableFieldName, aliasFieldName) =>
            _.keys(model.getAttributes())
                .map((w) => `${tableFieldName}.${w} AS "${aliasFieldName}.${w}"`);

        const selectField_Product = fnFieldGenerate(Product, 'Product', `Product`);
        const selectField_ProductBrand = fnFieldGenerate(ProductBrand, 'ProductBrand', `Product.ProductBrand`);
        const selectField_ProductModel = fnFieldGenerate(ProductModelType, 'ProductModel', 'Product.ProductModel');
        const selectField_ProductType = fnFieldGenerate(ProductType, 'ProductType', 'Product.ProductType');
        const selectField_ProductTypeGroup = fnFieldGenerate(ProductTypeGroup, 'ProductTypeGroup', 'Product.ProductType.ProductTypeGroup');


        const Query_CTE_Branch_ShopStock = shop_table.map(w => (`
            CTE_ShopStock_${w.shop_code_id} (shop_id, product_id, balance, balance_date, updated_date) AS (
                SELECT A.shop_id AS shop_id, B.product_id AS product_id, A.balance, A.balance_date AS balance_date, A.updated_date AS updated_date
                FROM app_shops_datas.dat_${w.shop_code_id}_stock_products_balances AS A
                         JOIN app_shops_datas.dat_${w.shop_code_id}_products AS B ON B.id = A.product_id
            )
        `));

        const Query_CTE_ShopStock = `
            CTE_ShopStock (shop_id, product_id, balance, balance_date, updated_date) AS (
                SELECT 
                    CTE_ShopStock_${shop_table[0].shop_code_id}.shop_id, 
                    CTE_ShopStock_${shop_table[0].shop_code_id}.product_id, 
                    CTE_ShopStock_${shop_table[0].shop_code_id}.balance, 
                    CTE_ShopStock_${shop_table[0].shop_code_id}.balance_date, 
                    CTE_ShopStock_${shop_table[0].shop_code_id}.updated_date
                FROM CTE_ShopStock_${shop_table[0].shop_code_id}
    
                ${shop_table.reduce((prev, curr, currIdx) => {
            if (currIdx > 0) {
                return prev + `
                            UNION ALL (
                                SELECT 
                                    CTE_ShopStock_${curr.shop_code_id}.shop_id, 
                                    CTE_ShopStock_${curr.shop_code_id}.product_id, 
                                    CTE_ShopStock_${curr.shop_code_id}.balance, 
                                    CTE_ShopStock_${curr.shop_code_id}.balance_date, 
                                    CTE_ShopStock_${curr.shop_code_id}.updated_date
                                FROM CTE_ShopStock_${curr.shop_code_id}
                            )
                        `;
            }
            return prev;
        }, '')}
            )
        `;

        const Query_CTE_CTE_StockBalance = `
            CTE_StockBalance (product_id, balance, balance_date, updated_date) AS (
                SELECT product_id AS product_id, sum(balance) AS balance, max(balance_date) AS balance_date, max(updated_date) AS updated_date
                FROM CTE_ShopStock
                GROUP BY product_id
            )
        `;

        const fnQuery_Filter = () => {
            const fnQueryFilterByUUID = () => {
                const filterByUUIDs = [];
                if (isUUID(type_group_id)) {
                    filterByUUIDs.push(`ProductTypeGroup.id = :type_group_id`);
                }
                if (isUUID(product_type_id)) {
                    filterByUUIDs.push(`ProductType.id = :product_type_id`);
                }
                if (isUUID(product_brand_id)) {
                    filterByUUIDs.push(`ProductBrand.id = :product_brand_id`);
                }
                if (isUUID(product_model_id)) {
                    filterByUUIDs.push(`ProductModel.id = :product_model_id`);
                }

                return filterByUUIDs.length === 0
                    ? ``
                    : `
                    (${filterByUUIDs.reduce((prev, curr, currIdx) => {
                        if (currIdx === 0) {
                            return prev + ` ${curr} `;
                        }
                        else {
                            return prev + ` AND ${curr} `;
                        }
                    }, ``)
                    })
                `;
            };

            const fnQueryFilterByBalance = () => {
                if (min_balance >= 0 && max_balance >= 0) {
                    return `
                        (balance BETWEEN :min_balance AND :max_balance)
                    `;
                }
                else if (min_balance >= 0 && max_balance < 0) {
                    return `
                        (balance >= :min_balance)
                    `;
                }
                else if (min_balance < 0 && max_balance >= 0) {
                    return `
                        (balance <= :max_balance)
                    `;
                }
                else {
                    return ``;
                }
            };

            const fnQueryFilterBySearch = () => {
                const filterBySearches = [];
                if (search) {
                    filterBySearches.push(`Product.product_code ILIKE :search`);
                    filterBySearches.push(`Product.master_path_code_id ILIKE :search`);
                    filterBySearches.push(`Product.custom_path_code_id ILIKE :search`);
                    filterBySearches.push(`Product.wyz_code ILIKE :search`);
                    filterBySearches.push(`Product.product_code ILIKE :search`);
                    filterBySearches.push(`Product.product_name->>'th' ILIKE :search`);
                    filterBySearches.push(`REGEXP_REPLACE(Product.product_name->>'th', '[^0-9]', '', 'g') ILIKE :search`);
                    filterBySearches.push(`ProductBrand.brand_name->>'th' ILIKE :search`);
                }

                return filterBySearches.length === 0
                    ? ``
                    : `
                    (${filterBySearches.reduce((prev, curr, currIdx) => {
                        if (currIdx === 0) {
                            return prev + ` ${curr} `;
                        }
                        else {
                            return prev + ` OR ${curr} `;
                        }
                    }, ``)
                    })
                `;
            };

            const queryFilterData = ['(1 = 1)'];

            const queryFilterByUUID = fnQueryFilterByUUID();
            if (queryFilterByUUID.length > 0) {
                queryFilterData.push(queryFilterByUUID);
            }

            const queryFilterByBalance = fnQueryFilterByBalance();
            if (queryFilterByBalance.length > 0) {
                queryFilterData.push(queryFilterByBalance);
            }

            const queryFilterBySearch = fnQueryFilterBySearch();
            if (queryFilterBySearch.length > 0) {
                queryFilterData.push(queryFilterBySearch);
            }

            return queryFilterData.length === 1
                ? ``
                : queryFilterData.reduce((prev, curr, currIdx) => {
                    if (currIdx === 0) {
                        return prev + ` ${curr} `
                    }
                    else {
                        return prev + ` AND ${curr}`
                    }
                }, ``);
        };

        const Query_Filter = fnQuery_Filter();

        /**
         * @type {import("sequelize").BindOrReplacements}
         */
        const Query_Obj_Replacement = {
            offset: (page - 1) * limit,
            limit: limit,

            search: `%${search}%`
                .replace(/(\s|\t|\n|\r)+/ig, '%')
                .replace(/(%){2,}/ig, '%'),

            type_group_id: type_group_id,
            product_type_id: product_type_id,
            product_brand_id: product_brand_id,
            product_model_id: product_model_id,

            min_balance: min_balance,
            max_balance: max_balance
        };

        const fnDataResult = async () => await db.query(
            `
                WITH
                    ${Query_CTE_Branch_ShopStock},
                    ${Query_CTE_ShopStock},
                    ${Query_CTE_CTE_StockBalance}

                SELECT StockBalance.* AS StockBalance,
                       ${selectField_Product},
                       ${selectField_ProductBrand},
                       ${selectField_ProductModel},
                       ${selectField_ProductType},
                       ${selectField_ProductTypeGroup}
                
                FROM CTE_StockBalance AS StockBalance
                    JOIN app_datas.dat_products AS Product ON Product.id = StockBalance.product_id
                    LEFT JOIN master_lookup.mas_product_brands ProductBrand ON ProductBrand.id = Product.product_brand_id
                    LEFT JOIN master_lookup.mas_product_model_types ProductModel ON ProductModel.id = Product.product_model_id
                    LEFT JOIN master_lookup.mas_product_types ProductType ON ProductType.id = Product.product_type_id
                    LEFT JOIN master_lookup.mas_product_type_groups ProductTypeGroup ON ProductTypeGroup.id = ProductType.type_group_id
                
                ${Query_Filter ? `WHERE ${Query_Filter}` : ``}
                
                ORDER BY 
                    ${Query_Filter ? `((${Query_Filter}) = True) DESC,` : ``}
                    StockBalance.balance_date DESC, 
                    StockBalance.updated_date DESC
                    
                OFFSET :offset
                LIMIT :limit;
            `.replace(/(\s)+/g, ' '),
            {
                type: QueryTypes.SELECT,
                replacements: Query_Obj_Replacement,
                nest: true
            }
        )
            .then(async (DataResult) => {
                for (let i = 0; i < DataResult.length; i++) {
                    DataResult[i].ShopProfiles = await Promise.all(shop_table.map(async (whereShopProfile) => ({
                        id: whereShopProfile.id,
                        shop_code_id: whereShopProfile.shop_code_id,
                        tax_code_id: whereShopProfile.tax_code_id,
                        bus_type_id: whereShopProfile.bus_type_id,
                        shop_name: whereShopProfile.shop_name,
                        ShopProduct: await ShopProduct(whereShopProfile.shop_code_id)
                            .findOne({
                                attributes: {
                                    include: [
                                        [sequelize.Sequelize.literal(`
                                            (coalesce((
                                                SELECT
                                                    X.product_cost AS product_cost_latest
                                                FROM (
                                                    SELECT
                                                        "ShopInventoryImportLog".shop_id AS shop_id,
                                                        "ShopInventoryImportLog".product_id AS shop_product_id,
                                                        ("ShopWarehouseDetail".value->>'warehouse')::uuid AS shop_warehouse_id,
                                                        ("ShopWarehouseDetail".value->'shelf'->>'item') AS shop_warehouse_shelf_item_id,
                                                        nullif(btrim(("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')), '') AS dot_mfd,
                                                        ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                                        (coalesce(
                                                                "ShopInventoryImportLog".details->>'price_grand_total',
                                                                (
                                                                    (
                                                                        (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                                            - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                                    )::float
                                                                )::text
                                                        )::numeric(20,2) / "ShopInventoryImportLog".amount)::numeric(20,2) product_cost,
                                                        "ShopInventoryImportLog".amount,
                                                        (SELECT H.doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS H WHERE H.id = "ShopInventoryImportLog".doc_inventory_id) AS doc_date,
                                                        "ShopInventoryImportLog".import_date,
                                                        "ShopInventoryImportLog".created_date
                                                    FROM app_shops_datas.dat_01hq0004_inventory_management_logs AS "ShopInventoryImportLog"
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
                                                      )::numeric(20,2) > 0)
                                                      AND ((SELECT "ShopInventoryImportDoc".status
                                                            FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc"
                                                            WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id)
                                                           = 1)
                                                    ORDER BY
                                                        (SELECT "ShopInventoryImportDoc".doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc" WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id) DESC,
                                                        "ShopInventoryImportLog".import_date DESC,
                                                        "ShopInventoryImportLog".created_date DESC
                                                ) AS X
                                                WHERE X.shop_product_id = "ShopProduct".id
                                                LIMIT 1
                                            ),0)::numeric(20,2))
                                        `.replace(/(01hq0004)/ig, whereShopProfile.shop_code_id).replace(/(\s)+/ig, ' ')), 'product_cost'],
                                        [sequelize.Sequelize.literal(`
                                            (coalesce((
                                                SELECT
                                                    avg(coalesce(X.product_cost,0))::numeric(20,2) AS product_cost_average
                                                FROM (
                                                    SELECT
                                                        "ShopInventoryImportLog".shop_id AS shop_id,
                                                        "ShopInventoryImportLog".product_id AS shop_product_id,
                                                        ("ShopWarehouseDetail".value->>'warehouse')::uuid AS shop_warehouse_id,
                                                        ("ShopWarehouseDetail".value->'shelf'->>'item') AS shop_warehouse_shelf_item_id,
                                                        nullif(btrim(("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')), '') AS dot_mfd,
                                                        ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                                        (coalesce(
                                                                "ShopInventoryImportLog".details->>'price_grand_total',
                                                                (
                                                                    (
                                                                        (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                                            - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                                    )::float
                                                                )::text
                                                        )::numeric(20,2) / "ShopInventoryImportLog".amount)::numeric(20,2) product_cost,
                                                        "ShopInventoryImportLog".amount,
                                                        (SELECT H.doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS H WHERE H.id = "ShopInventoryImportLog".doc_inventory_id) AS doc_date,
                                                        "ShopInventoryImportLog".import_date,
                                                        "ShopInventoryImportLog".created_date
                                                    FROM app_shops_datas.dat_01hq0004_inventory_management_logs AS "ShopInventoryImportLog"
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
                                                      )::numeric(20,2) > 0)
                                                      AND ((SELECT "ShopInventoryImportDoc".status
                                                            FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc"
                                                            WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id)
                                                           = 1)
                                                    ORDER BY
                                                        (SELECT "ShopInventoryImportDoc".doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc" WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id) DESC,
                                                        "ShopInventoryImportLog".import_date DESC,
                                                        "ShopInventoryImportLog".created_date DESC
                                                ) AS X
                                                WHERE  X.shop_product_id = "ShopProduct".id
                                                GROUP BY X.shop_id, X.shop_product_id
                                            ),0)::numeric(20,2))
                                        `.replace(/(01hq0004)/ig, whereShopProfile.shop_code_id).replace(/(\s)+/ig, ' ')), 'product_cost_average'],
                                        [sequelize.Sequelize.literal(`
                                            (coalesce((
                                                SELECT
                                                    (sum(coalesce(X.shop_stock_amount,0)) * avg(coalesce(X.product_cost,0)))::numeric(20,2)
                                                FROM (
                                                    SELECT
                                                        "ShopInventoryImportLog".shop_id AS shop_id,
                                                        "ShopInventoryImportLog".product_id AS shop_product_id,
                                                        ("ShopWarehouseDetail".value->>'warehouse')::uuid AS shop_warehouse_id,
                                                        ("ShopWarehouseDetail".value->'shelf'->>'item') AS shop_warehouse_shelf_item_id,
                                                        nullif(btrim(("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')), '') AS dot_mfd,
                                                        ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                                        (coalesce(
                                                                "ShopInventoryImportLog".details->>'price_grand_total',
                                                                (
                                                                    (
                                                                        (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                                            - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                                    )::float
                                                                )::text
                                                        )::numeric(20,2) / "ShopInventoryImportLog".amount)::numeric(20,2) product_cost,
                                                        coalesce((
                                                             SELECT "ShopStock".balance
                                                             FROM (
                                                                 SELECT
                                                                    "ShopStock".id,
                                                                    "ShopStock".shop_id,
                                                                    "ShopStock".product_id AS shop_product_id,
                                                                    ("ShopWarehouse".value->>'warehouse')::uuid AS shop_warehouse_id,
                                                                    ("ShopWarehouseSelfItem".value->>'item') AS shop_warehouse_shelf_item_id,
                                                                    nullif(btrim(("ShopWarehouseSelfItem".value->>'dot_mfd')),'') AS dot_mfd,
                                                                    ("ShopWarehouseSelfItem".value->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                                                    coalesce(("ShopWarehouseSelfItem".value->>'balance'), '0')::bigint AS balance
                                                                FROM app_shops_datas.dat_01hq0004_stock_products_balances AS "ShopStock"
                                                                    CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouse"
                                                                    CROSS JOIN json_array_elements("ShopWarehouse".value->'shelf') AS "ShopWarehouseSelfItem"
                                                                WHERE "ShopStock".product_id = "ShopInventoryImportLog".product_id
                                                            ) AS "ShopStock"
                                                            WHERE "ShopStock".shop_id = "ShopInventoryImportLog".shop_id
                                                                AND "ShopStock".shop_product_id = "ShopInventoryImportLog".product_id
                                                                AND "ShopStock".shop_warehouse_id = ("ShopWarehouseDetail".value->>'warehouse')::uuid
                                                                AND ("ShopStock".shop_warehouse_shelf_item_id)::varchar = (("ShopWarehouseDetail".value->'shelf'->>'item'))::varchar
                                                                AND ("ShopStock".dot_mfd)::varchar = (nullif(btrim(("ShopWarehouseDetail".value->'shelf' ->> 'dot_mfd')),''))::varchar
                                                                AND "ShopStock".purchase_unit_id = ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid
                                                        ), 0)::BIGINT AS shop_stock_amount,
                                                        "ShopInventoryImportLog".amount,
                                                        (SELECT H.doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS H WHERE H.id = "ShopInventoryImportLog".doc_inventory_id) AS doc_date,
                                                        "ShopInventoryImportLog".import_date,
                                                        "ShopInventoryImportLog".created_date
                                                    FROM app_shops_datas.dat_01hq0004_inventory_management_logs AS "ShopInventoryImportLog"
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
                                                      )::numeric(20,2) > 0)
                                                      AND ((SELECT "ShopInventoryImportDoc".status
                                                            FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc"
                                                            WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id)
                                                           = 1)
                                                    ORDER BY
                                                        (SELECT "ShopInventoryImportDoc".doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc" WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id) DESC,
                                                        "ShopInventoryImportLog".import_date DESC,
                                                        "ShopInventoryImportLog".created_date DESC
                                                ) AS X
                                                WHERE  X.shop_product_id = "ShopProduct".id
                                                GROUP BY X.shop_id, X.shop_product_id
                                            ),0)::numeric(20,2))
                                        `.replace(/(01hq0004)/ig, whereShopProfile.shop_code_id).replace(/(\s)+/ig, ' ')), 'product_cost_average_grand_total'],
                                        [sequelize.Sequelize.literal(`
                                            (coalesce((
                                                SELECT 
                                                    (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'retail', '0'))::numeric(20,2)  AS product_price_latest
                                                FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product 
                                                WHERE sq_shop_product.id = "ShopProduct".id
                                            ),0)::numeric(20,2))
                                        `.replace(/(01hq0004)/ig, whereShopProfile.shop_code_id).replace(/(\s)+/ig, ' ')), 'product_price'],
                                        [sequelize.Sequelize.literal(`
                                            (coalesce((
                                                SELECT 
                                                    (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'retail', '0'))::numeric(20,2)
                                                FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product 
                                                WHERE sq_shop_product.id = "ShopProduct".id
                                            ),0)::numeric(20,2))
                                        `.replace(/(01hq0004)/ig, whereShopProfile.shop_code_id).replace(/(\s)+/ig, ' ')), 'latest_product_price_retail'],
                                        [sequelize.Sequelize.literal(`
                                            (coalesce((
                                                SELECT 
                                                    (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'wholesale', '0'))::numeric(20,2)
                                                FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product 
                                                WHERE sq_shop_product.id = "ShopProduct".id
                                            ),0)::numeric(20,2))
                                        `.replace(/(01hq0004)/ig, whereShopProfile.shop_code_id).replace(/(\s)+/ig, ' ')), 'latest_product_price_wholesale'],
                                    ]
                                },
                                where: {
                                    product_id: DataResult[i].product_id,
                                    isuse: 1
                                }
                            })
                            .then(async (rShopProduct) => {
                                if (!rShopProduct) {
                                    return rShopProduct
                                }
                                rShopProduct.dataValues.ShopStocks = await ShopStock(whereShopProfile.shop_code_id)
                                    .findAll({
                                        where: {
                                            product_id: rShopProduct.id
                                        }
                                    });

                                return rShopProduct;
                            })
                    })));
                }

                return DataResult
            });

        const fnCountResult = async () => await db.query(
            `
                WITH
                    ${Query_CTE_Branch_ShopStock},
                    ${Query_CTE_ShopStock},
                    ${Query_CTE_CTE_StockBalance}

                SELECT COUNT(*)
                
                FROM CTE_StockBalance AS StockBalance
                    JOIN app_datas.dat_products AS Product ON Product.id = StockBalance.product_id
                    LEFT JOIN master_lookup.mas_product_brands ProductBrand ON ProductBrand.id = Product.product_brand_id
                    LEFT JOIN master_lookup.mas_product_model_types ProductModel ON ProductModel.id = Product.product_model_id
                    LEFT JOIN master_lookup.mas_product_types ProductType ON ProductType.id = Product.product_type_id
                    LEFT JOIN master_lookup.mas_product_type_groups ProductTypeGroup ON ProductTypeGroup.id = ProductType.type_group_id
                
                ${Query_Filter ? `WHERE ${Query_Filter}` : ``}
            `.replace(/(\s)+/g, ' '),
            {
                type: QueryTypes.SELECT,
                replacements: Query_Obj_Replacement,
                nest: true
            }
        )
            .then(r => Number(r[0].count));

        const [DataResult, CountResult] = await Promise.all([fnDataResult(), fnCountResult()])

        if (gen_qr_code === true) {

            const Bold = "src/assets/fonts/THSarabunNew/THSarabunNewBold.ttf";
            const Regular = "src/assets/fonts/THSarabunNew/THSarabunNew.ttf";

            const QRCode = require('qrcode');
            const PDFDocument = require("pdfkit-table");
            const fs = require('fs');

            var doc = new PDFDocument({
                margins: { top: 0, left: 0, right: 0, bottom: 0 },
                size: 'A4',
                bufferPages: true
            });


            for (let index = 0; index < DataResult.length; index++) {
                const element = DataResult[index];

                await QRCode.toFile('src/assets/printouts/' + element.product_id + '.png', element.product_id, {
                    errorCorrectionLevel: 'H'
                });

            }


            let inches = 71.72
            let row = 0
            let column = 0
            for (let index = 0; index < DataResult.length; index++) {
                const element = DataResult[index];
                let row_now = 2.08 * inches
                let col_now = 2.34 * inches

                let logo = 'src/assets/printouts/' + element.product_id + '.png'
                doc.image(logo, row * row_now + 14, column * col_now + 7, { height: 1.7 * inches, align: 'center', width: 1.7 * inches });
                doc.moveTo(row * row_now, column * col_now).lineTo(row * row_now + row_now, column * col_now).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
                doc.moveTo(row * row_now + row_now, column * col_now).lineTo(row * row_now + row_now, column * col_now + col_now).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
                doc.moveTo(row * row_now + row_now, column * col_now + col_now).lineTo(row * row_now, column * col_now + col_now).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

                doc.font(Bold).fillColor('black').fontSize(12).text(element.Product.master_path_code_id, row * row_now, column * col_now + col_now - 40, { align: 'center', width: row_now });
                doc.font(Regular).fontSize(8).text(element.Product.product_name.th, row * row_now, column * col_now + col_now - 25, { align: 'center', width: row_now });

                fs.unlinkSync('src/assets/printouts/' + element.product_id + '.png')

                if (row == 3) {
                    row = 0
                    if (column == 4) {
                        doc.addPage()
                        column = 0
                    } else {
                        column = column + 1
                    }
                } else {
                    row = row + 1
                }

            }




            let uuid = uuid4()

            await doc.pipe(fs.createWriteStream('src/assets/printouts/' + uuid + '.pdf'));
            doc.end();

            return ({ status: "success", data: 'src/assets/printouts/' + uuid + '.pdf' })
        }


        if (export_format === 'xlsx') {
            const header = {
                'ลำดับ': null,
                'รหัส': null,
                'ชื่อสินค้า': null,
                'ยี่ห้อสินค้า': null,
                'รุ่น': null
            };
            const select_shop_ids = request.query.select_shop_ids;
            let shop_id_search = [];
            if (request.query.select_shop_ids && request.query.select_shop_ids !== 'all') {
                shop_id_search = select_shop_ids.split(',')
                shop_id_search = shop_table.filter(el => { return shop_id_search.includes(el.id) })
            } else {
                shop_id_search = shop_table
            }

            for (let index = 0; index < shop_id_search.length; index++) {
                const el = shop_id_search[index];
                // header[el.shop_name.th] = null;
                header['จำนวนสินค้าคงเหลือ ' + el.shop_name?.shop_local_name || el.shop_name?.th || index] = null;
                header['ราคาทุน/หน่วย ' + el.shop_name?.shop_local_name || el.shop_name?.th || index] = null;
                header['ราคาทุนเฉลี่ย/หน่วย ' + el.shop_name?.shop_local_name || el.shop_name?.th || index] = null;
                header['ราคาทุนเฉลี่ยสุทธิ ' + el.shop_name?.shop_local_name || el.shop_name?.th || index] = null;
                header['ราคาขายปลีก/หน่วย ' + el.shop_name?.shop_local_name || el.shop_name?.th || index] = null;
                header['ราคาขายส่ง/หน่วย ' + el.shop_name?.shop_local_name || el.shop_name?.th || index] = null;
            }


            const data = [];
            if (DataResult.length === 0) {
                data.push(header);
            }
            else {
                for (let index = 0; index < DataResult.length; index++) {
                    const element = DataResult[index];

                    const data_ = {
                        'ลำดับ': index + 1,
                        'รหัส': element.Product.master_path_code_id || '',
                        'ชื่อสินค้า': element.Product.product_name.th || '',
                        'ยี่ห้อสินค้า': element.Product.ProductBrand?.brand_name?.th || '',
                        'รุ่น': element.Product.ProductModel?.model_name?.th || ''
                    };

                    for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                        const el = shop_id_search[index1];
                        let balance = 0;
                        let check = element.ShopProfiles.filter(el1 => { return el1.id == el.id })
                        if (check.length > 0 && check[0].ShopProduct?.dataValues.ShopStocks.length > 0) {
                            balance = parseInt(check[0].ShopProduct.dataValues.ShopStocks[0].balance);
                        }
                        data_['จำนวนสินค้าคงเหลือ ' + el.shop_name?.shop_local_name || el.shop_name?.th || index1] = balance;
                    }
                    for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                        const el = shop_id_search[index1];
                        let product_cost = 0;
                        let check = element.ShopProfiles.filter(el1 => { return el1.id == el.id })
                        if (check.length > 0 && check[0].ShopProduct?.dataValues.ShopStocks.length > 0) {
                            product_cost = parseFloat(check[0].ShopProduct.dataValues.product_cost);
                        }
                        data_['ราคาทุน/หน่วย ' + el.shop_name?.shop_local_name || el.shop_name?.th || index1] = product_cost;
                    }
                    for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                        const el = shop_id_search[index1];
                        let product_cost_average = 0;
                        let check = element.ShopProfiles.filter(el1 => { return el1.id == el.id })
                        if (check.length > 0 && check[0].ShopProduct?.dataValues.ShopStocks.length > 0) {
                            product_cost_average = parseFloat(check[0].ShopProduct.dataValues.product_cost_average);
                        }
                        data_['ราคาทุนเฉลี่ย/หน่วย ' + el.shop_name?.shop_local_name || el.shop_name?.th || index1] = product_cost_average;
                    }
                    for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                        const el = shop_id_search[index1];
                        let product_cost_average_grand_total = 0;
                        let check = element.ShopProfiles.filter(el1 => { return el1.id == el.id })
                        if (check.length > 0 && check[0].ShopProduct?.dataValues.ShopStocks.length > 0) {
                            product_cost_average_grand_total = parseFloat(check[0].ShopProduct.dataValues.product_cost_average_grand_total);
                        }
                        data_['ราคาทุนเฉลี่ยสุทธิ ' + el.shop_name?.shop_local_name || el.shop_name?.th || index1] = product_cost_average_grand_total;
                    }
                    for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                        const el = shop_id_search[index1];
                        let latest_product_price_retail = 0;
                        let check = element.ShopProfiles.filter(el1 => { return el1.id == el.id })
                        if (check.length > 0 && check[0].ShopProduct?.dataValues.ShopStocks.length > 0) {
                            latest_product_price_retail = parseFloat(check[0].ShopProduct.dataValues.latest_product_price_retail);
                        }
                        data_['ราคาขายปลีก/หน่วย ' + el.shop_name?.shop_local_name || el.shop_name?.th || index1] = latest_product_price_retail;
                    }
                    for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                        const el = shop_id_search[index1];
                        let latest_product_price_wholesale = 0;
                        let check = element.ShopProfiles.filter(el1 => { return el1.id == el.id })
                        if (check.length > 0 && check[0].ShopProduct?.dataValues.ShopStocks.length > 0) {
                            latest_product_price_wholesale = parseFloat(check[0].ShopProduct.dataValues.latest_product_price_wholesale);
                        }
                        data_['ราคาขายส่ง/หน่วย ' + el.shop_name?.shop_local_name || el.shop_name?.th || index1] = latest_product_price_wholesale;
                    }

                    data.push(data_);
                }
            }

            let ws = await XLSX.utils.json_to_sheet(data, {
                origin: 2,
                skipHeader: true
            });

            for (let objectI in ws) {
                if (typeof (ws[objectI]) != "object") continue;
                let cell = XLSX.utils.decode_cell(objectI);
                ws[objectI].s = { // styling for all cells
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                    }
                }
                if (cell.r === 0) {
                    ws[objectI].s = { // styling for all cells
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    }
                }

                const colNext1 = 5;
                if (cell.c >= colNext1 && cell.c <= colNext1 + shop_id_search.length) {
                    ws[objectI].z = '##,##,##0'
                }

                const colNext2 = colNext1 + shop_id_search.length;
                if (cell.c >= colNext2 && cell.c <= ((colNext2 + shop_id_search.length) - 1)) {
                    ws[objectI].z = '##,##,##0.00'
                }

                const colNext3 = colNext2 + shop_id_search.length;
                if (cell.c >= colNext3 && cell.c <= ((colNext3 + shop_id_search.length) - 1)) {
                    ws[objectI].z = '##,##,##0.00'
                }

                const colNext4 = colNext3 + shop_id_search.length;
                if (cell.c >= colNext4 && cell.c <= ((colNext4 + shop_id_search.length) - 1)) {
                    ws[objectI].z = '##,##,##0.00'
                }

                const colNext5 = colNext4 + shop_id_search.length;
                if (cell.c >= colNext5 && cell.c <= ((colNext5 + shop_id_search.length) - 1)) {
                    ws[objectI].z = '##,##,##0.00'
                }

                const colNext6 = colNext5 + shop_id_search.length;
                if (cell.c >= colNext6 && cell.c <= ((colNext6 + shop_id_search.length) - 1)) {
                    ws[objectI].z = '##,##,##0.00'
                }
            }

            const cellAlphabet = [
                'A',
                'B',
                'C',
                'D',
                'E',
                'F',
                'G',
                'H',
                'I',
                'J',
                'K',
                'L',
                'M',
                'N',
                'O',
                'P',
                'Q',
                'R',
                'S',
                'T',
                'U',
                'V',
                'W',
                'X',
                'Y',
                'Z'
            ];
            for (let i = 0; i < (26 - 1); i++) {
                cellAlphabet.push(`${cellAlphabet[0]}${cellAlphabet[i + 1]}`);
            }


            ws[`${cellAlphabet[0]}2`] = {
                ...(ws[`${cellAlphabet[0]}2`] || {}),
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    }
                },
                t: 's',
                v: 'ลำดับ'
            };
            ws[`${cellAlphabet[1]}2`] = {
                ...(ws[`${cellAlphabet[0]}2`] || {}),
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    }
                },
                t: 's',
                v: 'รหัส'
            };
            ws[`${cellAlphabet[2]}2`] = {
                ...(ws[`${cellAlphabet[0]}2`] || {}),
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    }
                },
                t: 's',
                v: 'ชื่อสินค้า'
            };
            ws[`${cellAlphabet[3]}2`] = {
                ...(ws[`${cellAlphabet[0]}2`] || {}),
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    }
                },
                t: 's',
                v: 'ยี่ห้อสินค้า'
            };
            ws[`${cellAlphabet[4]}2`] = {
                ...(ws[`${cellAlphabet[0]}2`] || {}),
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    }
                },
                t: 's',
                v: 'รุ่น'
            };

            const colNext1 = 5;
            ws[`${cellAlphabet[colNext1]}1`] = {
                t: 's', v: 'จำนวนสินค้าคงเหลือ', s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 18,
                        bold: true,
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "center",
                    },

                }
            };
            for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                const el = shop_id_search[index1];
                ws[`${cellAlphabet[colNext1 + index1]}2`] = {
                    ...(ws[`${cellAlphabet[0]}2`] || {}),
                    s: {
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    },
                    t: 's',
                    v: el.shop_name?.shop_local_name || el.shop_name?.th || index1
                };
            }

            const colNext2 = colNext1 + shop_id_search.length;
            ws[`${cellAlphabet[colNext2]}1`] = {
                t: 's', v: 'ราคาทุน/หน่วย', s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 18,
                        bold: true,
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "center",
                    },

                }
            };
            for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                const el = shop_id_search[index1];
                ws[`${cellAlphabet[colNext2 + index1]}2`] = {
                    ...(ws[`${cellAlphabet[0]}2`] || {}),
                    s: {
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    },
                    t: 's',
                    v: el.shop_name?.shop_local_name || el.shop_name?.th || index1
                };
            }

            const colNext3 = colNext2 + shop_id_search.length;
            ws[`${cellAlphabet[colNext3]}1`] = {
                t: 's', v: 'ราคาทุนเฉลี่ย/หน่วย', s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 18,
                        bold: true,
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "center",
                    },

                }
            };
            for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                const el = shop_id_search[index1];
                ws[`${cellAlphabet[colNext3 + index1]}2`] = {
                    ...(ws[`${cellAlphabet[0]}2`] || {}),
                    s: {
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    },
                    t: 's',
                    v: el.shop_name?.shop_local_name || el.shop_name?.th || index1
                };
            }

            const colNext4 = colNext3 + shop_id_search.length;
            ws[`${cellAlphabet[colNext4]}1`] = {
                t: 's', v: 'ราคาทุนเฉลี่ยสุทธิ', s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 18,
                        bold: true,
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "center",
                    },

                }
            };
            for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                const el = shop_id_search[index1];
                ws[`${cellAlphabet[colNext4 + index1]}2`] = {
                    ...(ws[`${cellAlphabet[0]}2`] || {}),
                    s: {
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    },
                    t: 's',
                    v: el.shop_name?.shop_local_name || el.shop_name?.th || index1
                };
            }

            const colNext5 = colNext4 + shop_id_search.length;
            ws[`${cellAlphabet[colNext5]}1`] = {
                t: 's', v: 'ราคาขายปลีก/หน่วย', s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 18,
                        bold: true,
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "center",
                    },

                }
            };
            for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                const el = shop_id_search[index1];
                ws[`${cellAlphabet[colNext5 + index1]}2`] = {
                    ...(ws[`${cellAlphabet[0]}2`] || {}),
                    s: {
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    },
                    t: 's',
                    v: el.shop_name?.shop_local_name || el.shop_name?.th || index1
                };
            }

            const colNext6 = colNext5 + shop_id_search.length;
            ws[`${cellAlphabet[colNext6]}1`] = {
                t: 's', v: 'ราคาขายส่ง/หน่วย', s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 18,
                        bold: true,
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "center",
                    },

                }
            };
            for (let index1 = 0; index1 < shop_id_search.length; index1++) {
                const el = shop_id_search[index1];
                ws[`${cellAlphabet[colNext6 + index1]}2`] = {
                    ...(ws[`${cellAlphabet[0]}2`] || {}),
                    s: {
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    },
                    t: 's',
                    v: el.shop_name?.shop_local_name || el.shop_name?.th || index1
                };
            }

            const merge = [
                {
                    s: { r: 0, c: colNext1 },
                    e: { r: 0, c: 4 + shop_id_search.length }
                },
                {
                    s: { r: 0, c: colNext2 },
                    e: { r: 0, c: (colNext2 + shop_id_search.length) - 1 }
                },
                {
                    s: { r: 0, c: colNext3 },
                    e: { r: 0, c: (colNext3 + shop_id_search.length) - 1 }
                },
                {
                    s: { r: 0, c: colNext4 },
                    e: { r: 0, c: (colNext4 + shop_id_search.length) - 1 }
                },
                {
                    s: { r: 0, c: colNext5 },
                    e: { r: 0, c: (colNext5 + shop_id_search.length) - 1 }
                },
                {
                    s: { r: 0, c: colNext6 },
                    e: { r: 0, c: (colNext6 + shop_id_search.length) - 1 }
                }
            ];
            ws["!merges"] = merge;

            const wscols = [
                { width: 10 }, // Col: A
                { width: 20 }, // Col: B
                { width: 30 }, // Col: C
                { width: 30 }, // Col: D
                { width: 30 }, // Col: E
            ];
            for (let i = 0; i < shop_id_search.length * merge.length; i++) {
                wscols.push({ width: 30 });
            }

            ws['!cols'] = wscols;

            const file_name = uuid4() + '___รายงานสินค้าคงคลัง';

            let wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

            await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

            return utilSetFastifyResponseJson("success", file_name + '.xlsx');

        }

        const responseData = {
            currentPage: page,
            pages: Math.ceil(CountResult / limit),
            currentCount: DataResult.length,
            totalCount: CountResult,
            data: DataResult
        };

        return utilSetFastifyResponseJson("success", responseData);
    }
    catch (error) {
        if (_.isError(error)) {
            await handleSaveLog(request, [[handlerName], error]);
            throw error;
        }
        else {
            await handleSaveLog(request, [[handlerName], `error : ${error}`]);
            return utilSetFastifyResponseJson("success", error.toString());
        }
    }
};


module.exports = handlerShopReportsShopStock;