require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction } = require("sequelize");
const db = require("../../db");
const Region = require("../../models/model").Region;
const MapRegProv = require("../../models/model").MapRegProv;

const migrateAddColumnAndRefactorShopProfile = async ({ transaction }) => {
    const transactionResults = await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await Region.sync({
                force: false,
                alter: {
                    drop: false
                },
                transaction: transaction
            });
            await MapRegProv.sync({
                force: false,
                alter: {
                    drop: false
                },
                transaction: transaction
            });
        }
    );

    return transactionResults;
};

migrateAddColumnAndRefactorShopProfile({ transaction: null });

module.exports = migrateAddColumnAndRefactorShopProfile;