const config = require('../../config');
const _ = require("lodash");
const { Transaction, QueryTypes } = require("sequelize");
const { isUUID } = require("../../utils/generate");
const xSequelize = require("../../db");
const modelUser = require("../../models/Users/User");
const modelUsersProfiles = require("../../models/UsersProfiles/UsersProfiles");
const modelShopProfile = require("../../models/ShopsProfiles/ShopsProfiles");
const modelShopStock = require("../../models/ShopStock/ShopStock");


const migrate_HotFix_RemoveDuplicatedDataInWarehouseDetails = async ({ transaction }) => {
    const transactionResults = await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (t) => {
            /**
             * @type {Array<{shop_id: string, shop_code_id: string}>}
             */
            const shopProfileLists = await modelShopProfile.findAll({
                attributes: ['id', 'shop_code_id'],
                order: [['seq', 'ASC']],
                transaction: transaction
            }).then(findShopProfiles => findShopProfiles.map(w => ({ shop_id: w.id, shop_code_id: w.shop_code_id.toLowerCase()})));

            for (let index = 0; index < shopProfileLists.length; index++) {
                const element_shop_code_id = shopProfileLists[index];

                const instanceShopStock = modelShopStock(element_shop_code_id.shop_code_id);

                const shopWarehouseDetailsDuplicatedResults = await xSequelize.query(
                    `
                    WITH CTE_1 AS (
                        SELECT
                            ShopStock.id AS id,
                            ShopStock.product_id AS product_id,
                            (ShopStockWarehouse->>'warehouse')::UUID AS warehouse_id,
                            (ShopStockWarehouseShelf->>'item')::Varchar AS warehouse_item_id,
                            (ShopStockWarehouseShelf->>'purchase_unit_id')::UUID AS purchase_unit_id,
                            (NULLIF(REPLACE((ShopStockWarehouseShelf ->>'dot_mfd'), 's', ''), ''))::Char(4) AS dot_mfd,
                            (ShopStockWarehouseShelf->>'balance')::BIGINT AS balance,
                            ShopStock.balance_date AS balance_date,
                            ShopStock.created_date AS created_date,
                            ShopStock.created_by AS created_by,
                            ShopStock.updated_date AS updated_date,
                            ShopStock.updated_by AS updated_by
                        FROM app_shops_datas.dat_${element_shop_code_id.shop_code_id}_stock_products_balances AS ShopStock
                                    CROSS JOIN LATERAL json_array_elements(ShopStock.warehouse_detail) AS ShopStockWarehouse
                        CROSS JOIN LATERAL json_array_elements(ShopStockWarehouse.value->'shelf') AS ShopStockWarehouseShelf
                        ORDER BY
                        ShopStock.balance_date DESC,
                        ShopStock.updated_date DESC
                    )
                    SELECT id, product_id, warehouse_id, warehouse_item_id, purchase_unit_id, dot_mfd, COUNT(id) AS duplicated_count FROM CTE_1
                        GROUP BY id, product_id, warehouse_id, warehouse_item_id, purchase_unit_id, dot_mfd
                        HAVING COUNT(id) > 1
                    `,
                    {
                        type: QueryTypes.SELECT,
                        raw: true,
                        transaction: t
                    }
                );

                for (let i = 0; i < shopWarehouseDetailsDuplicatedResults.length; i++) {
                    /**
                     * @type {{id: string, product_id: string, warehouse_id: string, warehouse_item_id: string, purchase_unit_id?: string | null, dot_mfd?: string | null, duplicated_count: number}}
                     */
                    const element_WHDuplicated = shopWarehouseDetailsDuplicatedResults[i];

                    const dataErrorDetail = `shop_id: ${element_shop_code_id.shop_id}, shop_code: ${element_shop_code_id.shop_code_id}, stock_id: ${element_WHDuplicated.id}`;

                    if (!isUUID(element_WHDuplicated.id)) {
                        throw Error(`ShopStock element_WHDuplicated[].id must be String UUID type, ${dataErrorDetail}`);
                    }
                    if (!isUUID(element_WHDuplicated.warehouse_id)) {
                        throw Error(`ShopStock element_WHDuplicated[].warehouse_id must be String UUID type, ${dataErrorDetail}`);
                    }
                    if (!_.isString(element_WHDuplicated.warehouse_item_id) && element_WHDuplicated.warehouse_item_id.length < 1) {
                        throw Error(`ShopStock element_WHDuplicated[].warehouse_item_id must be String UUID type, ${dataErrorDetail}`);
                    }
                    if (!isUUID(element_WHDuplicated.product_id)) {
                        throw Error(`ShopStock element_WHDuplicated[].product_id must be String UUID type, ${dataErrorDetail}`);
                    }
                    if (!isUUID(element_WHDuplicated.purchase_unit_id) && !_.isNull(element_WHDuplicated.purchase_unit_id)) {
                        throw Error(`ShopStock element_WHDuplicated[].purchase_unit_id must be String UUID or Null type, ${dataErrorDetail}`);
                    }
                    if (!_.isString(element_WHDuplicated.dot_mfd) && !_.isNull(element_WHDuplicated.dot_mfd)) {
                        throw Error(`ShopStock element_WHDuplicated[].dot_mfd must be String or Null type, ${dataErrorDetail}`);
                    }

                    await xSequelize.transaction(
                        {
                            transaction: t,
                            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                        },
                        async (t2) => {
                            const findShopStock = await instanceShopStock.findAll({
                                where: {
                                    id: element_WHDuplicated.id,
                                    product_id: element_WHDuplicated.product_id
                                },
                                transaction: t2
                            });

                            if (findShopStock.length !== 1) {
                                throw Error(`ShopStock is error from Not found or Length more than zero, ${dataErrorDetail}`);
                            }
                            else {
                                const shopStockDocument = findShopStock[0];
                                /**
                                 * @type {Array<import("../../types/type.Handler.ShopReports.InventoryMovements").IMigration_ShopStock_WarehouseDetail>}
                                 */
                                const shopStock_WarehouseDetails = shopStockDocument.get('warehouse_detail');

                                if (!_.isArray(shopStock_WarehouseDetails) || shopStock_WarehouseDetails.length > 1) {
                                    throw Error(`shopStockDocument.warehouse_detail[] must be Array and Length must more than 1, ${dataErrorDetail}`);
                                }
                                else {
                                    const shopStock_WHDetail_Index = shopStock_WarehouseDetails.findIndex(w => w.warehouse === element_WHDuplicated.warehouse_id);

                                    if (shopStock_WHDetail_Index < 0) {
                                        throw Error(`shopStockDocument.warehouse_detail[].warehouse must be String UUID type, ${dataErrorDetail}`);
                                    }

                                    const shopStock_WarehouseDetail = shopStock_WarehouseDetails[shopStock_WHDetail_Index];

                                    if (!isUUID(shopStock_WarehouseDetail.warehouse)) {
                                        throw Error(`shopStockDocument.warehouse_detail[].warehouse must be String UUID type, ${dataErrorDetail}`);
                                    }
                                    if (shopStock_WarehouseDetail.warehouse !== element_WHDuplicated.warehouse_id) {
                                        throw Error(`shopStockDocument.warehouse_detail[].warehouse is not match with duplicated warehouse, ${dataErrorDetail}`);
                                    }
                                    if (!_.isArray(shopStock_WarehouseDetail.shelf)) {
                                        throw Error(`shopStockDocument.warehouse_detail[].shelf must be Array and Length must more than 1, ${dataErrorDetail}`);
                                    }

                                    let indexStart_Claimed_Shelf = null;
                                    const filter_Claimed_Shelf = shopStock_WarehouseDetail.shelf.filter((where, index) => {
                                        if (
                                            where.item === element_WHDuplicated.warehouse_item_id
                                            && (where.purchase_unit_id || null) === (element_WHDuplicated.purchase_unit_id || null)
                                            && (where.dot_mfd || null) === (element_WHDuplicated.dot_mfd || null)
                                        ) {
                                            if (indexStart_Claimed_Shelf === null) {
                                                indexStart_Claimed_Shelf = index;
                                            }
                                            return true;
                                        }
                                        else {
                                            return false;
                                        }
                                    });
                                    if (indexStart_Claimed_Shelf === null) {
                                        throw Error(`Value of indexStart_Claimed_Shelf must not null, ${dataErrorDetail}`);
                                    }

                                    const reduceDuplicatedWHDetail = filter_Claimed_Shelf.reduce((previousValue, currentValue) => {
                                        return {
                                            ...currentValue,
                                            balance: String((+previousValue.balance || 0) + (+currentValue.balance || 0)),
                                            holding_product: String((+previousValue.holding_product || 0) + (+currentValue.holding_product || 0)),
                                        }
                                    }, {});

                                    let indexStart_UnClaimed_Shelf = null;
                                    const filter_Unclaimed_Shelf = shopStock_WarehouseDetail.shelf.filter((where, index) => {
                                        if (
                                            where.item === element_WHDuplicated.warehouse_item_id
                                            && (where.purchase_unit_id || null) === (element_WHDuplicated.purchase_unit_id || null)
                                            && (where.dot_mfd || null) === (element_WHDuplicated.dot_mfd || null)
                                        ) {
                                            return false;
                                        }
                                        else {
                                            if (indexStart_UnClaimed_Shelf === null) {
                                                indexStart_UnClaimed_Shelf = index;
                                            }
                                            return true;
                                        }
                                    });

                                    const rebuildWHDetailShelf = _.concat(filter_Unclaimed_Shelf, reduceDuplicatedWHDetail);

                                    const checkBalanceInShelf = rebuildWHDetailShelf.reduce((previousValue, currentValue) => {
                                        const balance = String((+previousValue.balance || 0) + (+currentValue.balance || 0));
                                        const holding_product = String((+previousValue.holding_product || 0) + (+currentValue.holding_product || 0));
                                        return {
                                            balance,
                                            holding_product
                                        };
                                    }, { balance: '0', holding_product: '0' });

                                    if (findShopStock[0].get('balance') !== checkBalanceInShelf.balance) {
                                        throw Error(`shopStockDocument.balance is not equal reduce balance of checkBalanceInShelf`);
                                    }

                                    shopStock_WarehouseDetails[shopStock_WHDetail_Index].shelf = rebuildWHDetailShelf;

                                    await instanceShopStock.update(
                                        {
                                            warehouse_detail: shopStock_WarehouseDetails
                                        },
                                        {
                                            where: {
                                                id: element_WHDuplicated.id,
                                                product_id: element_WHDuplicated.product_id
                                            },
                                            transaction: t2
                                        }
                                    );

                                    return true;
                                }
                            }
                        }
                    );
                }
            }
        },
    );
}


module.exports = migrate_HotFix_RemoveDuplicatedDataInWarehouseDetails;