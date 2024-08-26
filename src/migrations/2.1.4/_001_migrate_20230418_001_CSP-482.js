const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const xSequelize = require("../../db");
const modelUser = require("../../models/Users/User");
const modelUsersProfiles = require("../../models/UsersProfiles/UsersProfiles");
const modelShopProfile = require("../../models/ShopsProfiles/ShopsProfiles");
const modelShopPurchaseOrderDoc = require("../../models/ShopPurchaseOrderDoc/ShopPurchaseOrderDoc");
const modelShopPurchaseOrderList = require("../../models/ShopPurchaseOrderList/ShopPurchaseOrderList");
const _001_migrate_20230418_001_CSP_482 = async ({ transaction }) => {
    const transactionResults = await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const findShopProfiles = await modelShopProfile.findAll({
                attributes: ['shop_code_id'],
                order: [['seq', 'ASC']],
                transaction: transaction
            });
            const shop_code_ids = findShopProfiles.map(w => w.shop_code_id.toLowerCase());
            for (let index = 0; index < shop_code_ids.length; index++) {
                const element_shop_code_id = shop_code_ids[index];
                const instanceShopPurchaseOrderDoc = modelShopPurchaseOrderDoc(element_shop_code_id);
                await instanceShopPurchaseOrderDoc.sync({
                    alter: false,
                    force: true,
                    transaction: transaction
                });
                const instanceShopPurchaseOrderList = modelShopPurchaseOrderList(element_shop_code_id);
                await instanceShopPurchaseOrderList.sync({
                    alter: false,
                    force: true,
                    transaction: transaction
                });
            }
        }
    );

    return transactionResults;
};


module.exports = _001_migrate_20230418_001_CSP_482;