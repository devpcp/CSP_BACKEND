require('dotenv').config(); // Load ".env" file
const _ = require("lodash");
const { Transaction, QueryTypes } = require("sequelize");
const config = require('../../config');
const xSequelize = require("../../db");
const modelUser = require("../../models/Users/User");
const modelUsersProfiles = require("../../models/UsersProfiles/UsersProfiles");
const modelShopProfile = require("../../models/ShopsProfiles/ShopsProfiles");
const modelShopSalesTransactionDoc = require("../../models/ShopSalesTransactionDoc/ShopSalesTransactionDoc");
const moment = require("moment");

const migrateAddColumnAndRefactorShopProfile = async ({ transaction }) => {
    const transactionResults = await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const currentDateTime = new Date();
            const findShopProfiles = await modelShopProfile.findAll({
                transaction: transaction
            });
            const shop_code_ids = findShopProfiles.map(w => w.shop_code_id.toLowerCase());
            for (let index = 0; index < shop_code_ids.length; index++) {
                const element_shop_code_id = shop_code_ids[index];
                const instanceShopTransactionDoc = modelShopSalesTransactionDoc(element_shop_code_id);
                const findShopSalesTransactionDocs = await instanceShopTransactionDoc.findAll({
                    attributes: ["id", "details", "updated_date"],
                    where: {
                        status: 3,
                        purchase_status: true
                    },
                    transaction: transaction
                });
                for (let index = 0; index < findShopSalesTransactionDocs.length; index++) {
                    const elementShopSalesTransactionDoc = findShopSalesTransactionDocs[index];
                    const objDocDetails = {
                        ...(elementShopSalesTransactionDoc.get('details') || {}),
                    };
                    if (!objDocDetails.payment) {
                        objDocDetails.payment = {};
                    }
                    /**
                     * @type {Date|import("moment").Moment}
                     */
                    let objDocUpdatedDate = elementShopSalesTransactionDoc.get('updated_date');
                    if (!_.isDate(objDocUpdatedDate)) {
                        throw Error(`ShopId:"${element_shop_code_id}",ShopSalesTrasnctionDocId:"${elementShopSalesTransactionDoc.get('id')}",Error:"field updated_date is empty"`)
                    }
                    else {
                        objDocUpdatedDate = moment(objDocUpdatedDate);
                    }
                    const objFieldPaidDate = objDocDetails.payment.payment_date || null;
                    const field_paymentDate_formatVer_1 = moment(objFieldPaidDate, 'YYYY-MM-DD HH:mm:ss', true);
                    const field_paymentDate_formatVer_2 = moment(objFieldPaidDate, 'DD-MM-YYYY HH:mm:ss', true);
                    if (field_paymentDate_formatVer_1.isValid()) {
                        objDocDetails.payment.payment_date = field_paymentDate_formatVer_1
                            // .format('DD-MM-YYYY HH:mm:ss');
                            .toDate();
                    }
                    else if (field_paymentDate_formatVer_2.isValid()) {
                        objDocDetails.payment.payment_date = field_paymentDate_formatVer_2
                            // .format('DD-MM-YYYY HH:mm:ss');
                            .toDate();
                    }
                    else {
                        objDocDetails.payment.payment_date = objDocUpdatedDate
                            // .format('DD-MM-YYYY HH:mm:ss');
                            .toDate();
                    }

                    await instanceShopTransactionDoc.update(
                        {
                            details: objDocDetails
                        },
                        {
                            where: {
                                id: elementShopSalesTransactionDoc.get('id')
                            },
                            transaction: transaction
                        }
                    );
                }
            }
        }
    );

    return transactionResults;
};

migrateAddColumnAndRefactorShopProfile({ transaction: null });

module.exports = migrateAddColumnAndRefactorShopProfile;