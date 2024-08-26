const { Transaction, QueryTypes } = require("sequelize");
const config = require('../../config');
const db = require("../../db");
const User = require('../../models/Users/User');
const ShopsProfiles = require('../../models/ShopsProfiles/ShopsProfiles');
const UsersProfiles = require('../../models/UsersProfiles/UsersProfiles');
const ShopHq = require("../../models/ShopHq/ShopHq");
const MatchShopHq = require("../../models/MatchShopHq/MatchShopHq");

const migrateMatchShopHq = async ({ transaction }) => {
    return await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            // await UsersProfiles.sync({
            //     alter: true,
            //     force: false,
            //     transaction: transaction
            // });
            await MatchShopHq.sync({
                alter: {
                    drop: false
                },
                force: false,
                transaction: transaction
            });
        }
    );
};

migrateMatchShopHq({ transaction: null});


module.exports = migrateMatchShopHq;
