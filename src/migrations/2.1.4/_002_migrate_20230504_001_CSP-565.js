const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const xSequelize = require("../../db");
const modelUser = require("../../models/Users/User");
const modelUsersProfiles = require("../../models/UsersProfiles/UsersProfiles");
const modelShopProfile = require("../../models/ShopsProfiles/ShopsProfiles");
const modelBankNameList = require("../../models/Master/BankNameList");
const createTable_BankNameList = async ({ transaction }) => {
    const transactionResults = await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await modelBankNameList.sync({
                force: true,
                transaction: transaction
            });
        }
    );

    return transactionResults;
};

createTable_BankNameList({ transaction: null });
// module.exports = createTable_BankNameList;