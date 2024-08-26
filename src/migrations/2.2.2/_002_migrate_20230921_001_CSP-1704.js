require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction } = require("sequelize");
const db = require("../../db");

const migrateAddMissingId__MapUserGroup = async ({ transaction }) => {
    console.time('Migration-Run');
    const {
        User,
        Group,
        MapUserGroup
    } = require("../../models/model");

    const transactionResults = await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await MapUserGroup.sync({
                alter: {
                    drop: false
                },
                transaction: transaction
            })
        }
    );

    console.timeEnd('Migration-Run');
    return transactionResults;
};

migrateAddMissingId__MapUserGroup({ transaction: null });

module.exports = migrateAddMissingId__MapUserGroup;