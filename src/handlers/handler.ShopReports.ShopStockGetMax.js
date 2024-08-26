const _ = require("lodash");
const { v4: uuid4 } = require("uuid");
const { QueryTypes } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const db = require("../db");


const handlerShopReportsShopStock = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'GET shopReportShopStock get max';

    try {
        const shop_table = await utilCheckShopTableName(request, 'select_shop_ids');
        const filter_product_isstock = request.query?.filter_product_isstock || false;

        let shop_raw = ``;

        for (let index = 0; index < shop_table.length; index++) {
            const element = shop_table[index];
            const shop_code_id = element.shop_code_id;
            if (!shop_code_id) { throw new Error(`shop_code_id not found`); }

            if (index === 0) {
                shop_raw = shop_raw + `
                SELECT (
                        SELECT product_id
                        FROM app_shops_datas.dat_01hq0013_products AS ShopProduct
                        WHERE ShopProduct.id = ShopStockBalance.product_id
                       ) AS product_id,
                       shop_id,
                       sum(balance) AS balance
                FROM app_shops_datas.dat_01hq0013_stock_products_balances AS ShopStockBalance
                GROUP BY product_id, shop_id
                `.replace(/(01hq0013)+/g, shop_code_id);

            }
            else {
                shop_raw = shop_raw + `
                UNION ALL
                SELECT (
                        SELECT product_id
                        FROM app_shops_datas.dat_01hq0013_products AS ShopProduct
                        WHERE ShopProduct.id = ShopStockBalance.product_id
                       ) AS product_id,
                       shop_id,
                       sum(balance) AS balance
                FROM app_shops_datas.dat_01hq0013_stock_products_balances AS ShopStockBalance
                GROUP BY product_id, shop_id
                `.replace(/(01hq0013)+/g, shop_code_id);
            }
        }

        let responseData = await db.query(
            `
            WITH
            CTE_ShopStock_UNION (product_id, shop_id, balance) AS (
                ${shop_raw}
            ),
            CTE_ShopStock_SUM_Product AS (
                SELECT product_id, sum(balance) AS balance
                FROM CTE_ShopStock_UNION
                GROUP BY product_id
            )
            SELECT max(balance) AS balance
            FROM CTE_ShopStock_SUM_Product
            ${!filter_product_isstock ? ``: `
            WHERE (
                SELECT MasterProduct.id
                FROM app_datas.dat_products AS MasterProduct
                WHERE MasterProduct.id = product_id
                    AND (
                            SELECT MasterProductType.id
                            FROM master_lookup.mas_product_types AS MasterProductType
                            WHERE MasterProductType.id = MasterProduct.product_type_id
                                AND (
                                        SELECT MasterProductTypeGroup.id
                                        FROM master_lookup.mas_product_type_groups AS MasterProductTypeGroup
                                        WHERE MasterProductTypeGroup.id = MasterProductType.type_group_id
                                            AND MasterProductTypeGroup.isstock = true
                                    ) = MasterProductType.type_group_id
                        ) = MasterProduct.product_type_id
            ) = product_id
            `}
            `.replace(/(\s)+/g, ' '),
            {
                type: QueryTypes.SELECT,
                nest: true
            }
        );

        if (responseData.length === 1) {
            responseData = parseInt(responseData[0].balance)
        } else {
            responseData = null
        }


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