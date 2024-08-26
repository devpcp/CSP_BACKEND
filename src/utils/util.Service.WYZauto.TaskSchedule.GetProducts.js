const _ = require("lodash");
const utilServiceAPIWIZautoGetProducts = require("./util.Service.WYZauto.API.GetProducts");
const utilSequelizeCreateTableIfNotExistsFromModel = require("./util.Sequelize.CreateTableIfNotExistsFromModel");
const { Op, Transaction } = require("sequelize");
const utilServiceFunctionWIZautoProductsSchemaValidator = require("./util.Service.WYZauto.Function.ProductsSchemaValidator");
const utilServiceFunctionWIZautoProductIdentifier = require("./util.Service.WYZauto.Function.ProductIdentifier");
const db = require("../db");
const { handleSaveLog } = require("../handlers/log");
const utilServiceWYZautoAPIConfigs = require("./util.Service.WYZauto.API.Configs");


const utilServiceWYZautoTaskScheduleGetProducts = async (user_id, shop_id, shop_code, currentDateTime, transaction) => {
    const action = 'utilServiceWYZautoTaskScheduleGetProducts';

    currentDateTime = _.isDate(currentDateTime) ? currentDateTime : new Date();

    const modelShopProduct = require("../models/model").ShopProduct(shop_code);
    await utilSequelizeCreateTableIfNotExistsFromModel(modelShopProduct);

    const modelShopStock = require("../models/model").ShopStock(shop_code);
    await utilSequelizeCreateTableIfNotExistsFromModel(modelShopStock);

    const modelShopProductsHoldWYZauto = require("../models/model").ShopProductsHoldWYZauto(shop_code);
    await utilSequelizeCreateTableIfNotExistsFromModel(modelShopProductsHoldWYZauto);

    const { api_wyzauto_action_get_products } = await utilServiceWYZautoAPIConfigs(shop_id);
    if (!api_wyzauto_action_get_products) { throw Error(`api_wyzauto_action_get_products return null`); }

    const transactionResult = await db.transaction(
        transaction
            ? { transaction: transaction }
            : { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE }
        ,
        async (transaction) => {
            const getWIZautoPorudcts = await utilServiceAPIWIZautoGetProducts(api_wyzauto_action_get_products.url, api_wyzauto_action_get_products.authorization);
            const [dataWIZautoPorudcts_Active, dataWIZautoPorudcts_Disabled] = await Promise.all([
                utilServiceFunctionWIZautoProductsSchemaValidator(getWIZautoPorudcts.data.active.products),
                utilServiceFunctionWIZautoProductsSchemaValidator(getWIZautoPorudcts.data.disabled.products)
            ]);

            const dataResult = {
                created: [],
                updated: [],
                error: []
            };

            const findCSPTransactionWYZAuto_Actives = await modelShopProductsHoldWYZauto.findAll({
                where: {
                    start_date: {
                        [Op.not]: null
                    },
                    end_date: {
                        [Op.is]: null
                    },
                    isuse: {
                        [Op.eq]: 1
                    }
                },
                transaction: transaction
            });

            for (let index = 0; index < findCSPTransactionWYZAuto_Actives.length; index++) {
                const element = findCSPTransactionWYZAuto_Actives[index];
                const [isActiveIndex, isDisabledIndex] = await Promise.all([
                    dataWIZautoPorudcts_Active.findIndex(
                        w => w.sku === element.get('details')['wyz_code']
                            && w.dot === element.get('details')['dot']
                    ),
                    dataWIZautoPorudcts_Disabled.findIndex(
                        w => w.sku === element.get('details')['wyz_code']
                            && w.dot === element.get('details')['dot']
                    )
                ]);

                if (isActiveIndex >= 0 && isDisabledIndex >= 0) {
                    throw Error('SKU:wyz_code/DOT is not possible have status same time');
                }

                // Product move into activated
                if (isActiveIndex >= 0 && element.get('details')['wyzauto_balance_check_stock'] !== dataWIZautoPorudcts_Active[isActiveIndex].stock) {
                    const prevDocument = JSON.parse(JSON.stringify(_(element._previousDataValues).toJSON()));
                    element.set('details', {
                        ...(element.get('details')),
                        wyzauto_balance_check_stock: dataWIZautoPorudcts_Active[isActiveIndex].stock
                    });
                    await element.save({ transaction: transaction });
                    await handleSaveLog({
                        "id": user_id,
                        "headers": {
                            "User-Agent": '',
                            "HTTP_X_REAL_IP": '127.0.0.1',
                        }
                    }, [[action + '-> Update', element.get('id'), element.toJSON(), prevDocument]]);
                }

                // Product move into disabled
                if (isActiveIndex === -1 && isDisabledIndex > 0) {
                    const prevDocument = JSON.parse(JSON.stringify(_(element._previousDataValues).toJSON()));
                    element.set('details', {
                        ...(element.get('details')),
                        wyzauto_balance_check_stock: dataWIZautoPorudcts_Disabled[isDisabledIndex].stock
                    });
                    await element.save({ transaction: transaction });
                    await handleSaveLog({
                        "id": user_id,
                        "headers": {
                            "User-Agent": '',
                            "HTTP_X_REAL_IP": '127.0.0.1',
                        }
                    }, [[action + '-> Update', element.get('id'), element.toJSON(), prevDocument]]);
                }

                // Is active but not show data: says it is sold to zero from WYZAuto
                if (isActiveIndex === -1 && isDisabledIndex === -1) {
                    const prevDocument = JSON.parse(JSON.stringify(_(element._previousDataValues).toJSON()));
                    element.set('details', {
                        ...(element.get('details')),
                        wyzauto_balance_check_stock: 0
                    });
                    await element.save({ transaction: transaction });
                    await handleSaveLog({
                        "id": user_id,
                        "headers": {
                            "User-Agent": '',
                            "HTTP_X_REAL_IP": '127.0.0.1',
                        }
                    }, [[action + '-> Update', element.get('id'), element.toJSON(), prevDocument]]);
                }
            }
        }
    );

    await handleSaveLog({
        "id": user_id,
        "headers": {
            "User-Agent": '',
            "HTTP_X_REAL_IP": '127.0.0.1',
        }
    }, [[action], ""]);

    return transactionResult;
};


module.exports = utilServiceWYZautoTaskScheduleGetProducts;