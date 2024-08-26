const { Transaction } = require("sequelize");
const config = require('../../config');
const db = require("../../db");
const User = require('../../models/Users/User');
const ShopsProfiles = require('../../models/ShopsProfiles/ShopsProfiles');
// const UsersProfiles = require('../../models/UsersProfiles/UsersProfiles');
const ShopHq = require("../../models/ShopHq/ShopHq");
const MatchShopHq = require("../../models/MatchShopHq/MatchShopHq");
const ProductOwner = require("../../models/ProductOwner/ProductOwner");
// const UsersProfiles1 = require("../../models/UsersProfiles1/UsersProfiles1");

const migrateHq = async ({ transaction }) => {
    return await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await ShopHq.sync({
                alter: false,
                force: true,
                transaction: transaction
            })
            await MatchShopHq.sync({
                alter: false,
                force: true,
                transaction: transaction
            })
            await ProductOwner.sync({
                alter: false,
                force: true,
                transaction: transaction
            })
        }
    );
}

const test = async () => {
    console.log(await ShopHq.findOne({ include: [{ model: User }] }))
    // await UsersProfiles1.sync()
}

test()
module.exports = migrateHq;
