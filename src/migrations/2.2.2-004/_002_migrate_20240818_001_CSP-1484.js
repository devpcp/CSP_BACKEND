require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");
const moment = require("moment/moment");
const {
    ShopsProfiles: ShopProfile,
    initShopModel,
    ShopCustomerDebtCreditNoteDocT2,
    ShopCustomerDebtCreditNoteListT2,
    ShopCustomerDebtBillingNoteList,
    ShopCustomerDebtList

} = require("../../models/model");
const ShopProduct = require('../../models/ShopProduct/ShopProduct');

const migrateShopCustomerCreditNoteT2 = async ({ transaction }) => {
    console.time('Migration-Run');

    const currentDateTime = moment();

    const findShopProfiles = await ShopProfile.findAll({
        order: [['shop_code_id', 'ASC']]
    });
    const shop_code_ids = findShopProfiles.map(w => ({ shop_id: w.get('id'), shop_code_id: w.shop_code_id.toLowerCase() }));

    for (let index = 0; index < shop_code_ids.length; index++) {
        const element = shop_code_ids[index];
        await ShopCustomerDebtCreditNoteListT2(element.shop_code_id).sync()
        await ShopCustomerDebtCreditNoteDocT2(element.shop_code_id).sync()
        await ShopCustomerDebtBillingNoteList(element.shop_code_id).sync({ alter: true })
        await ShopCustomerDebtList(element.shop_code_id).sync({ alter: true })

    }

    console.timeEnd('Migration-Run');
    return
};

migrateShopCustomerCreditNoteT2({ transaction: null });

module.exports = migrateShopCustomerCreditNoteT2;