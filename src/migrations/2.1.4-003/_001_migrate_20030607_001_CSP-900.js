const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const xSequelize = require("../../db");
const modelUser = require("../../models/Users/User");
const modelUsersProfiles = require("../../models/UsersProfiles/UsersProfiles");
const modelShopProfile = require("../../models/ShopsProfiles/ShopsProfiles");
const modelShopDocumentCode = require("../../models/ShopDocumentCode/ShopDocumentCode");
const migrateCreateTableShopDocumentCode = async ({ transaction }) => {
    const transactionResults = await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const findShopProfiles = await modelShopProfile.findAll({
                attributes: ['id', 'shop_code_id'],
                order: [['seq', 'ASC']],
                transaction: transaction
            });
            const shop_code_ids = findShopProfiles.map(w => w.shop_code_id.toLowerCase());
            for (let index = 0; index < shop_code_ids.length; index++) {
                const element_shop_code_id = shop_code_ids[index];
                const instanceShopDocumentCode = modelShopDocumentCode(element_shop_code_id);
                await instanceShopDocumentCode.sync({
                    alter: false,
                    force: true,
                    transaction: transaction
                });

            }
        }
    );

    const testData = async () => await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const findShopProfiles = await modelShopProfile.findAll({
                attributes: ['id', 'shop_code_id'],
                order: [['seq', 'ASC']],
                transaction: transaction
            });
            const shop_code_ids = findShopProfiles.map(w => w.shop_code_id.toLowerCase());
            for (let index = 0; index < shop_code_ids.length; index++) {
                const element_shop_code_id = shop_code_ids[index];
                const instanceShopDocumentCode = modelShopDocumentCode(element_shop_code_id);
                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_code: 'INI',
                    transaction: transaction
                });
                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_code: 'INI',
                    transaction: transaction
                });
                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_code: 'INI',
                    transaction: transaction
                });

                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_code: 'SO',
                    transaction: transaction
                });
                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_code: 'SO',
                    transaction: transaction
                });
                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_code: 'INI',
                    transaction: transaction
                });


                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_id: '40501ce1-c7f0-4f6a-96a0-7cd804a2f531',
                    transaction: transaction
                });
                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_id: "7ef3840f-3d7f-43de-89ea-dce215703c16",
                    transaction: transaction
                });
                await instanceShopDocumentCode.create({
                    shop_id: findShopProfiles[index].id,
                    doc_type_id: '40501ce1-c7f0-4f6a-96a0-7cd804a2f531',
                    transaction: transaction
                });
            }
        }
    );

    return transactionResults;
};

migrateCreateTableShopDocumentCode({ transaction: null });

module.exports = migrateCreateTableShopDocumentCode;