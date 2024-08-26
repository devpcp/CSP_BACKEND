const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const xSequelize = require("../../db");
const modelUser = require("../../models/Users/User");
const modelUsersProfiles = require("../../models/UsersProfiles/UsersProfiles");
const modelShopProfile = require("../../models/ShopsProfiles/ShopsProfiles");

const migrateAddColumnAndRefactorShopProfile = async ({ transaction }) => {
    const transactionResults = await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const currentDateTime = new Date();
            await modelShopProfile.sync(
                {
                    alter: {
                        drop: false
                    },
                    force: false,
                    transaction: transaction
                }
            );
            const findShopProfiles = await modelShopProfile.findAll({
                transaction: transaction
            });
            for (let index = 0; index < findShopProfiles.length; index++) {
                const findShopProfile = findShopProfiles[index];
                findShopProfile.set({
                    shop_config: {
                        ...(
                            config.configShopProfile_ShopConfig_DefaultConfig
                        ),
                        ...(
                            findShopProfile.get('shop_config')
                        )
                    }
                })
                await findShopProfile.save({ transaction: transaction });
            }
        }
    );

    return transactionResults;
};

migrateAddColumnAndRefactorShopProfile({ transaction: null });

module.exports = migrateAddColumnAndRefactorShopProfile;