const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const xSequelize = require("../../db");
const modelUser = require("../../models/Users/User");
const modelUsersProfiles = require("../../models/UsersProfiles/UsersProfiles");
const modelShopProfile = require("../../models/ShopsProfiles/ShopsProfiles");
const modelShopInventoryMovementLogs = require("../../models/ShopInventoryMovementLog/ShopInventoryMovementLog");
const modelShopStock = require("../../models/ShopStock/ShopStock");

const config_createdBy = '90f5a0a9-a111-49ee-94df-c5623811b6cc';
const config_createdDate = Date.now();

const migrate_InsertShopInventoryMovementLogs = async ({ transaction }) => {
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

                const instanceShopInventoryMovementLogs = modelShopInventoryMovementLogs(element_shop_code_id.shop_code_id);
                const instanceShopStock = modelShopStock(element_shop_code_id.shop_code_id);
                const shopStockData = await instanceShopStock.findAll({ transaction: transaction});
                const prepareDataToCreate = [];

                for (let idx = 0; idx < shopStockData.length; idx++) {
                    const element_shopStock = shopStockData[idx];
                    /**
                     * @type {import("../../types/type.Handler.ShopReports.InventoryMovements").IMigration_ShopStock_WarehouseDetail[]}
                     */
                    const element_shopStock_WarehouseDetails = element_shopStock.get('warehouse_detail');
                    for (let i = 0; i < element_shopStock_WarehouseDetails.length; i++) {
                        const ele_shopStock_WarehouseDetail = element_shopStock_WarehouseDetails[i];
                        for (let k = 0; k < ele_shopStock_WarehouseDetail.shelf.length; k++) {
                            const ele_shopStock_WarehouseDetail_Shelf = ele_shopStock_WarehouseDetail.shelf[k];
                            /**
                             * @type {import("../../types/type.Handler.ShopReports.InventoryMovements").IMigrationInventoryMovementToCreate}
                             */
                            const dataToCreate = {
                                shop_id: element_shop_code_id.shop_id,
                                product_id: element_shopStock.get('product_id'),
                                doc_inventory_id: null,
                                doc_inventory_log_id: null,
                                doc_sale_id: null,
                                doc_sale_log_id: null,
                                doc_wyz_auto_id: null,
                                stock_id: element_shopStock.get('id'),
                                warehouse_id: ele_shopStock_WarehouseDetail.warehouse,
                                warehouse_item_id: ele_shopStock_WarehouseDetail_Shelf.item,
                                dot_mfd: !ele_shopStock_WarehouseDetail_Shelf.dot_mfd ? null : ele_shopStock_WarehouseDetail_Shelf.dot_mfd,
                                purchase_unit_id: !ele_shopStock_WarehouseDetail_Shelf.purchase_unit_id ? null : ele_shopStock_WarehouseDetail_Shelf.purchase_unit_id,
                                count_previous_stock: 0,
                                count_adjust_stock: ele_shopStock_WarehouseDetail_Shelf.balance,
                                count_current_stock: ele_shopStock_WarehouseDetail_Shelf.balance,
                                details: {
                                    reasons: 'Rebalance'
                                },
                                created_by: config_createdBy,
                                created_date: config_createdDate,
                                updated_by: null,
                                updated_date: null
                            };

                            prepareDataToCreate.push(dataToCreate);
                        }
                    }
                }

                await instanceShopInventoryMovementLogs.bulkCreate(
                    prepareDataToCreate,
                    {
                        transaction: transaction
                    }
                );
            }
        }
    );

    return transactionResults;
};

module.exports = migrate_InsertShopInventoryMovementLogs;