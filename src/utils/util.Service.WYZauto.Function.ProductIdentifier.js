const { isUUID } = require("./generate");
const _ = require("lodash");
const modelProduct = require("../models/model").Product;
const db = require("../db");
const sequelize = require("sequelize");


/**
 * @param {{wyz_code: string; dot: string;}} product
 * @param {object} param1
 * @param {string} param1.shop_code
 * @param {string} [param1.warehouseId]
 * @param {string} [param1.shelfItemId]
 * @param {import("sequelize/types").Transaction?} param1.transaction
 * @return {Promise<{
 *      Product: import("sequelize/types").Model;
 *      ShopProduct: import("sequelize/types").Model;
 *      ShopStock: import("sequelize/types").Model || null;
 *      errors: null;
 * } || {errors: {findProduct: string; findShopProduct: string; findShopStock: string;}}>}
 */
const utilServiceWYZautoFunctionProductIdentifier = async (product, { shop_code, warehouseId, shelfItemId, transaction }) => {
    const modelShopProduct = require("../models/model").ShopProduct(shop_code);

    const modelShopStock = require("../models/model").ShopStock(shop_code);

    const errors = {
        findProduct: '',
        findShopProduct: '',
        findShopStock: ''
    };
    const findProduct = await modelProduct.findOne({
        where: {
            wyz_code: product.wyz_code
        },
        transaction: transaction
    });
    if (!findProduct) {
        errors.findProduct = 'Product is not found by sku';
        return { errors };
    }
    const findShopProduct = await modelShopProduct.findOne({
        where: {
            product_id: findProduct.id
        },
        transaction: transaction
    });
    if (!findShopProduct) {
        errors.findShopProduct = 'ShopProduct is not found by Product id';
        return { errors };
    }
    const findShopStock = isUUID(warehouseId) && _.isString(shelfItemId)
     ?  await db.query(
            `
                SELECT ShopStockProduct.*,
                       (ShopWarehouseOrdinality.ordinality - 1)::int      AS ShopWarehouse_Index,
                       ShopWarehouse,
                       (ShopWarehouseShelfOrdinality.ordinality - 1)::int AS ShopWarehouseShelf_Index,
                       ShopWarehouseShelf
                FROM app_shops_datas."${modelShopStock.tableName}" AS ShopStockProduct,
                     json_array_elements(ShopStockProduct.warehouse_detail) AS ShopWarehouse,
                     json_array_elements(ShopWarehouse->'shelf') AS ShopWarehouseShelf
                         CROSS JOIN json_array_elements_text(ShopStockProduct.warehouse_detail) WITH ordinality AS ShopWarehouseOrdinality
                         CROSS JOIN json_array_elements_text(ShopWarehouse->'shelf') WITH ordinality AS ShopWarehouseShelfOrdinality
                WHERE ShopStockProduct.product_id = :product_id
                  AND ShopWarehouse->>'warehouse' = :warehouse
                  AND ShopWarehouseShelf->>'dot_mfd' = :dot_mfd
                  AND ShopWarehouseShelf->>'item' = :item
                  AND ShopWarehouseShelf->>'purchase_unit_id' = :purchase_unit_id
                  AND ShopWarehouseOrdinality.value::json->>'warehouse' = :warehouse
                  AND ShopWarehouseShelfOrdinality.value::json->>'dot_mfd' = :dot_mfd
                  AND ShopWarehouseShelfOrdinality.value::json->>'item' = :item;
            `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    product_id: findShopProduct.id,
                    dot_mfd: product.dot,
                    warehouse: warehouseId,
                    item: shelfItemId,
                    purchase_unit_id: '103790b2-e9ab-411b-91cf-a22dbf624cbc'
                },
                nest: true,
                model: modelShopStock,
                mapToModel: true,
                transaction: transaction
            }
        )
     : [];
    if (![0, 1].includes(findShopStock.length)) {
        errors.findShopStock = 'ShopStock is return more than one data';
        return { errors };
    }
    if (findShopStock.length === 1) {
        if (!isUUID(findShopStock[0].get('shopwarehouseshelf')['purchase_unit_id'])) {
            throw Error('ShopStock is require purchase_unit_id');
        }
        if (findShopStock[0].get('shopwarehouseshelf')['purchase_unit_id'] !== '103790b2-e9ab-411b-91cf-a22dbf624cbc') {
            throw Error('ShopStock purchase_unit_id is not match of rule Tire types');
        }
    }

    return {
        Product: findProduct,
        ShopProduct: findShopProduct,
        ShopStock: findShopStock.length === 0 ? null : findShopStock[0],
        errors: null
    };
};


module.exports = utilServiceWYZautoFunctionProductIdentifier;