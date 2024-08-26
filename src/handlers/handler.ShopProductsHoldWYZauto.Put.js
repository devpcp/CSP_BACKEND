const _ = require("lodash");
const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilSequelizeCreateTableIfNotExistsFromModel = require("../utils/util.Sequelize.CreateTableIfNotExistsFromModel");
const utilServiceWYZautoFunctionPostProducts = require("../utils/util.Service.WYZauto.Function.PostProducts");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");

const handlerShopProductsHoldWYZautoPut = async (request) => {
    const action = 'put ShopProductsHoldWYZauto put';

    const currentDateTime = new Date();

    try {
        const user_id = request.id;

        const request_id = request.params.id;

        const { stock } = request.body;
        if (
            (_.isFinite(stock) && !_.isSafeInteger(stock))
            || stock !== 0
        ) { throw Error('stock currently require 0 only'); }

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        if (!findShopsProfile) {
            throw Error(`Variable "findShopsProfile" return not found`);
        } else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            throw Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
        } else {
            /**
             * A name for create dynamics table
             * @type {string}
             */
            const table_name = findShopsProfile.shop_code_id;

            const modelShopProductsHoldWYZauto = require("../models/model").ShopProductsHoldWYZauto(table_name);

            const transactionResult = await db.transaction(
                {
                    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                },
                async (transaction) => {
                    const updateResult = {
                        csp: null,
                        wyzAuto: null
                    };

                    const findDocument = await modelShopProductsHoldWYZauto.findOne({
                        where: {
                            id: request_id
                        }
                    });

                    if (!findDocument) { throw Error('document is not found'); }
                    else {
                        const productWYZAuto = {
                            wyz_code: findDocument.get('details')['wyz_code'],
                            dot: findDocument.get('details')['dot'],
                            price: findDocument.get('details')['price'],
                            hold_amount_stock: findDocument.get('details')['hold_amount_stock'],
                            real_hold_amount_stock: findDocument.get('details')['real_hold_amount_stock'],
                            wyzauto_balance_check_stock: findDocument.get('details')['wyzauto_balance_check_stock'],
                            warehouse_details: findDocument.get('details')['warehouse_details'],
                        };

                        if (stock === 0) {
                            productWYZAuto.stock = 0;

                            const wyzResult = await utilServiceWYZautoFunctionPostProducts(
                                {
                                    products: [productWYZAuto],
                                    shop_id: findShopsProfile.get('id'),
                                    shop_code: table_name,
                                    user_id: user_id,
                                    currentDateTime: currentDateTime
                                },
                                {
                                    transaction: transaction
                                }
                            );

                            await findDocument.reload({ transaction: transaction });

                            updateResult.wyzAuto = wyzResult;
                            updateResult.csp = findDocument;
                        }

                        return {
                            CSP: updateResult.csp,
                            WYZAuto: updateResult.wyzAuto
                        };
                    }
                }
            );

            await handleSaveLog(request, [[action], '']);

            return utilSetFastifyResponseJson('success', transactionResult);
        }
    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw new Error(`Request is error LogId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopProductsHoldWYZautoPut;