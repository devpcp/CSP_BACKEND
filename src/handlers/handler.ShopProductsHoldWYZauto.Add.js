const _ = require("lodash");
const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilServiceWYZautoFunctionPostProducts = require("../utils/util.Service.WYZauto.Function.PostProducts");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilServiceFunctionWIZautoProductsSchemaValidator = require("../utils/util.Service.WYZauto.Function.ProductsSchemaValidator");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");

const handlerShopProductsHoldWYZautoAdd = async (request) => {
    const action = 'POST ShopProductsHoldWYZauto.Add';

    const currentDateTime = new Date();

    try {
        const user_id = request.id;

        const {products} = request.body;

        await Promise.all([
            (async () => {
                for (let index = 0; index < products.length; index++) {
                    const element = products[index];
                    if (products.filter(w => w.wyz_code === element.wyz_code && w.dot === element.dot).length !== 1) {
                        throw Error('Some of wyz_code is duplicated from your request');
                    }
                }
            }).apply({}),
            (async () => {
                if (products.filter(w => w.price <= 0 || !_.isFinite(w.price)).length > 0) {
                    throw Error('Some of price must more than zero from your request');
                }
            }).apply({}),
            (async () => {
                if (products.filter(w => w.stock <= 0 || !_.isSafeInteger(w.stock)).length > 0) {
                    throw Error('Some of stock must more than zero from your request');
                }
            }).apply({}),
            await utilServiceFunctionWIZautoProductsSchemaValidator(products, 'wyz_code')
        ]);

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

            const transactionResult = await db.transaction(
                {
                    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                },
                async (transaction) => {
                    const wyzResult = await utilServiceWYZautoFunctionPostProducts(
                        {
                            products: products,
                            shop_id: findShopsProfile.get('id'),
                            shop_code: table_name,
                            user_id: user_id,
                            currentDateTime: currentDateTime
                        },
                        {
                            transaction: transaction
                        }
                    );

                    return wyzResult;
                }
            );

            await handleSaveLog(request, [[action], '']);

            return utilSetFastifyResponseJson(
                'success',
                {
                    documentResult: transactionResult.documentResult.map(
                        w => ({ ...w, transactionError: _.get(w.transactionError, 'message', null)})
                    ),
                    postWYZAutoResult: transactionResult.postWYZauto,
                }
            );
        }
    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw new Error(`Request is error LogId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopProductsHoldWYZautoAdd;