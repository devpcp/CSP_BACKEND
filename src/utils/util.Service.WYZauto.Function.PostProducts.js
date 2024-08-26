const {
    config_sys_third_party_api_enable_send_to_wyzauto,
} = require("../config");
const _ = require("lodash");
const db = require("../db");
const sequelize = require("sequelize");
const utilSequelizeCreateTableIfNotExistsFromModel = require("./util.Sequelize.CreateTableIfNotExistsFromModel");
const utilServiceFunctionWIZautoProductIdentifier = require("./util.Service.WYZauto.Function.ProductIdentifier");
const { Op } = require("sequelize");
const utilSetShopStockProductBalance = require("./util.SetShopStockProductBalance");
// const utilServiceWIZAutoFunctionProductsSerializer = require("./util.Service.WYZauto.Function.ProductsSerializer");
const utilServiceAPIWIZautoPostProducts = require("./util.Service.WYZauto.API.PostProducts");
const { handleSaveLog } = require("../handlers/log");
const utilServiceWYZautoAPIConfigs = require("./util.Service.WYZauto.API.Configs");
const utilGetCurrentProductShopStock = require("./util.GetCurrentProductShopStock");
const utilSetShopInventoryMovementLog = require("./util.SetShopInventoryMovementLog");

/**
 * @template T
 * > A service function help you call save log without promise
 * @param {object} param0
 * @param {string} param0.action
 * @param {(import("../types/type.Util.Service.WYZauto.API").IWYZautoProduct|Array<import("../types/type.Util.Service.WYZauto.API").IWYZautoProduct>)?} param0.reqProduct
 * @param {any} param0.dataBeforeUpdate
 * @param {Error} param0.error
 * @param {(function(error: Error): T)?} callbackError
 */
const serviceFunctionCallbackSaveLogWithoutWait = ({ action, reqProduct, dataBeforeUpdate, error }, callbackError = (error) => {}) => {
    /**
     * @type {(function(Error): T)|(function(error: Error): void)}
     */
    const callbackErrorFunction = _.isFunction(callbackError)
        ? callbackError
        : (error) => { };

    handleSaveLog({
        "id": "",
        "headers": {
            "User-Agent": '',
            "HTTP_X_REAL_IP": '127.0.0.1',
        }},
        [
            [action, '', reqProduct, dataBeforeUpdate],
            error
        ]
    )
        .then()
        .catch(error =>
            callbackErrorFunction(error)
        );
};


/**
 * > A function that will be used to update the stock of the product in the WYZauto.
 *
 * **WYZauto will reject**
 * - Wrong format
 * - SKU not exists in WYZauto
 *
 * **WYZauto will create**
 * - SKU exists but DOT is not exists in WYZauto
 *
 * **WYZauto will update**
 * - SKU and DOT exists in WYZauto but one or both of 'price' and 'stock'
 *
 * **This function do**
 * - Serializers, reduce and validate 'product' parameter
 * - If some product is says 'error' from WYZAuto, it will report error to logs and rollback transaction that product only
 *
 * @param {object} param0
 * @param {Array<import("../types/type.Util.Service.WYZauto.API").ICSPWYZautoProduct>} param0.products
 * @param {string} param0.shop_id - The Shop id
 * @param {string} param0.shop_code - The Shop code says 'table_name' on shop
 * @param {string} param0.user_id - An UUID from user who is call this function
 * @param {Date} [param0.currentDateTime] - Current date time
 * @param {object} param1
 * @param {import("sequelize/types").Transaction?} param1.transaction - Sequelize's transaction when you need, you don't fill it if you don't want
 */
const utilServiceWYZautoFunctionPostProducts = async ({ products, shop_id, shop_code, user_id, currentDateTime }, { transaction }) => {
    const actionUtilServiceFunction = 'utilServiceWYZautoFunctionPostProducts';
    const configSendToWYZAutoAPI = config_sys_third_party_api_enable_send_to_wyzauto;

    try {
        currentDateTime = _.isDate(currentDateTime) ? currentDateTime : new Date();

        const reducedProducts = products.reduce((previousValue, currentValue) => {
                const findIndexResult = previousValue.findIndex(w => w.dot === currentValue.dot && w.wyz_code === currentValue.wyz_code);
                if (findIndexResult >= 0) {
                    previousValue[findIndexResult].stock += currentValue.stock;
                    previousValue[findIndexResult].warehouse_details.push({
                        shelfItem_id: currentValue.shelfItem_id,
                        warehouse_id: currentValue.warehouse_id,
                        holding_product: currentValue.stock
                    });
                }
                else {
                    previousValue.push({
                        wyz_code: currentValue.wyz_code,
                        dot: currentValue.dot,
                        price: currentValue.price,
                        stock: currentValue.stock,
                        warehouse_details: [{
                            shelfItem_id: currentValue.shelfItem_id,
                            warehouse_id: currentValue.warehouse_id,
                            holding_product: currentValue.stock
                        }]
                    });
                }
                return previousValue;
            },
            /**
             * @type {Array<import("../types/type.Util.Service.WYZauto.API").ICSPWYZAutoProduct_Reduce>}
             */
            []
        );

        const modelShopProduct = require("../models/model").ShopProduct(shop_code);
        await utilSequelizeCreateTableIfNotExistsFromModel(modelShopProduct);

        const modelShopStock = require("../models/model").ShopStock(shop_code);
        await utilSequelizeCreateTableIfNotExistsFromModel(modelShopStock);

        const modelShopProductsHoldWYZauto = require("../models/model").ShopProductsHoldWYZauto(shop_code);
        await utilSequelizeCreateTableIfNotExistsFromModel(modelShopProductsHoldWYZauto);

        const { api_wyzauto_action_post_products } = await utilServiceWYZautoAPIConfigs(shop_id);
        if (configSendToWYZAutoAPI === true && !api_wyzauto_action_post_products) { throw Error(`api_wyzauto_action_post_products return null`); }

        const transactionResult = await db.transaction(
            transaction
                ? { transaction: transaction }
                : { isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE },
            async (t1) => {
                /**
                 * @type {{product: import("../types/type.Util.Service.WYZauto.API").IWYZautoProduct; result: {created: {ref: string|null, id: string|null}|null, updated: {ref: string|null, id: string|null}|null, postWYZauto: (import("../types/type.Util.Service.WYZauto.API.PostProducts").IResponseWYZautoAPIPostProduct | null)} | void; transactionError: Error|null}[]}
                 */
                const documentResult = [];
                for (let index = 0; index < reducedProducts.length; index++) {
                    const element = reducedProducts[index];
                    /**
                     * @type {Error|null}
                     */
                    let transactionError = null;
                    const transactionElement = await db.transaction(
                        t1
                            ? { transaction: t1 }
                            : { isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE },
                        async (t2) => {
                            /**
                             * @type {{created: {ref: null, id: null}, updated: {ref: null, id: null}, postWYZauto: import("../types/type.Util.Service.WYZauto.API.PostProducts").IResponseWYZautoAPIPostProduct|null;}}
                             */
                            const ShopProductStockWIZAutoResult = {
                                updated: null,
                                created: null
                            };
                            const findProductSet = await utilServiceFunctionWIZautoProductIdentifier(
                                element,
                                {
                                    shop_code,
                                    transaction: t2
                                }
                            );
                            if (findProductSet.errors) { throw Error(JSON.stringify(findProductSet.errors)); }

                            if (findProductSet.ShopProduct) {
                                /**
                                 * Data where find out to have someone these data is activated
                                 */
                                const findShopProductHoldWYZautoDocs = await modelShopProductsHoldWYZauto.findAll({
                                    where: {
                                        details: {
                                            wyz_code: {
                                                [Op.eq]: element.wyz_code
                                            },
                                            dot: {
                                                [Op.eq]: element.dot
                                            }
                                        },
                                        product_id: {
                                            [Op.eq]: findProductSet.ShopProduct.get('id')
                                        },
                                        start_date: {
                                            [Op.not]: null
                                        },
                                        end_date: {
                                            [Op.is]: null
                                        },
                                        isuse: {
                                            [Op.eq]: 1
                                        }
                                    }
                                });
                                if (![0, 1].includes(findShopProductHoldWYZautoDocs.length)) {
                                    throw Error('ShopProductHoldWYZauto is return more than one data');
                                }

                                /**
                                 * A sub function help to create document acd add holding stock balance
                                 */
                                const subFunction_createShopProductHoldWYZautoDocument = async () => {
                                    const createShopProductHoldWYZautoDocument = await modelShopProductsHoldWYZauto.create(
                                        {
                                            product_id: findProductSet.ShopProduct.id,
                                            start_date: currentDateTime,
                                            details: {
                                                wyz_code: element.wyz_code,
                                                dot: element.dot,
                                                price: element.price,
                                                hold_amount_stock: element.stock,
                                                real_hold_amount_stock: element.stock,
                                                wyzauto_balance_check_stock: element.stock,
                                                warehouse_details: element.warehouse_details
                                            },
                                            isuse: 1,
                                            created_by: user_id,
                                            created_date: currentDateTime
                                        },
                                        {
                                            transaction: t2
                                        }
                                    );

                                    /**
                                     * @type {{shopStock_balance: string, shopStockWarehouse_balance: string, shopStockWarehouse_holdingProduct: string}[]}
                                     */
                                    const addHoldingProductResult = [];
                                    for (let idx = 0; idx < element.warehouse_details.length; idx++) {
                                        const ele = element.warehouse_details[idx];

                                        const findProductSetx = await utilServiceFunctionWIZautoProductIdentifier(
                                            {
                                                wyz_code: element.wyz_code,
                                                dot: element.dot
                                            },
                                            {
                                                shop_code: shop_code,
                                                warehouseId: ele.warehouse_id,
                                                shelfItemId: ele.shelfItem_id,
                                                transaction: t2
                                            }
                                        );
                                        if (findProductSetx.errors) { throw Error(JSON.stringify(findProductSetx.errors)); }

                                        const currentProductShopStock = await utilGetCurrentProductShopStock(
                                            shop_code,
                                            {
                                                transaction: t2,
                                                findShopProductId: findProductSetx.ShopProduct.get('id'),
                                                findShopWarehouseId: ele.warehouse_id,
                                                findShopWarehouseItemId: ele.shelfItem_id,
                                                findPurchaseUnitId: findProductSetx.ShopStock.get('shopwarehouseshelf')['purchase_unit_id'] || null,
                                                findDotMfd: element.dot || null
                                            }
                                        );
                                        if (currentProductShopStock.length !== 1) {
                                            throw Error('Variable currentProductShopStock.length must return 1');
                                        }

                                        const addHoldingProductResultx = await utilSetShopStockProductBalance(
                                            shop_code,
                                            findProductSetx.ShopProduct.get('id'),
                                            ele.warehouse_id,
                                            ele.shelfItem_id,
                                            findProductSetx.ShopStock.get('shopwarehouseshelf')['purchase_unit_id'],
                                            element.dot,
                                            "add_holding_product",
                                            ele.holding_product,
                                            {
                                                updated_by: user_id,
                                                transaction: t2
                                            }
                                        );

                                        await utilSetShopInventoryMovementLog(
                                            'WYZAuto',
                                            {
                                                product_id: findProductSetx.ShopProduct.get('id'),
                                                doc_wyz_auto_id: createShopProductHoldWYZautoDocument.get('id'),
                                                stock_id: currentProductShopStock[0].id,
                                                warehouse_id: ele.warehouse_id,
                                                warehouse_item_id: ele.shelfItem_id,
                                                purchase_unit_id: findProductSetx.ShopStock.get('shopwarehouseshelf')['purchase_unit_id'] || null,
                                                dot_mfd: element.dot || null,
                                                count_previous_stock: currentProductShopStock[0].balance,
                                                count_adjust_stock: (Math.abs(+(ele.holding_product))) * -1,
                                                details: { documentType: 'WYZAuto', reasons: 'Create' },
                                                created_by: user_id,
                                                created_date: currentDateTime
                                            },
                                            {
                                                transaction: transaction,
                                                currentDateTime: currentDateTime,
                                                shop_code: shop_code
                                            }
                                        );

                                        addHoldingProductResult.push(addHoldingProductResultx)
                                    }


                                    return { createShopProductHoldWYZautoDocument, addHoldingProductResult };
                                };

                                //#region When WYZAuto document not exists
                                if (findShopProductHoldWYZautoDocs.length === 0) {
                                    //#region Create new WYZAuto document and Add holding stock, when stock is not set to 0
                                    if (element.stock !== 0) {
                                        const { createShopProductHoldWYZautoDocument } = await subFunction_createShopProductHoldWYZautoDocument();
                                        ShopProductStockWIZAutoResult.created = ({id: createShopProductHoldWYZautoDocument.get('id'), ref: null });
                                        serviceFunctionCallbackSaveLogWithoutWait({
                                            action: `${actionUtilServiceFunction}: transaction: create`,
                                            reqProduct: element,
                                            dataBeforeUpdate: null,
                                            error: null
                                        });
                                    }
                                    //#endregion Create new WYZAuto document and Add holding stock, when stock is not set to 0
                                }
                                //#endregion When WYZAuto document not exists

                                //#region When WYZAuto document exists
                                if (findShopProductHoldWYZautoDocs.length === 1) {
                                    const ShopProductHoldWYZautoDoc = findShopProductHoldWYZautoDocs[0];
                                    const ShopProductHoldWYZauto_details = ShopProductHoldWYZautoDoc.get('details');

                                    const currentHoldingProduct = ShopProductHoldWYZauto_details['real_hold_amount_stock'];
                                    if (!_.isSafeInteger(currentHoldingProduct)) {
                                        throw Error(`require details.hold_amount_stock in ShopProductHoldWYZautoDoc`);
                                    }

                                    //#region Update WYZAuto document and Revert holding stock
                                    for (let idx = 0; idx < ShopProductHoldWYZauto_details.warehouse_details.length; idx++) {
                                        const ele = ShopProductHoldWYZauto_details.warehouse_details[idx];
                                        const findProductSetx = await utilServiceFunctionWIZautoProductIdentifier(
                                            {
                                                wyz_code: element.wyz_code,
                                                dot: element.dot
                                            },
                                            {
                                                shop_code: shop_code,
                                                warehouseId: ele.warehouse_id,
                                                shelfItemId: ele.shelfItem_id,
                                                transaction: t2
                                            }
                                        );
                                        if (findProductSetx.errors) { throw Error(JSON.stringify(findProductSetx.errors)); }

                                        const currentProductShopStock = await utilGetCurrentProductShopStock(
                                            shop_code,
                                            {
                                                transaction: t2,
                                                findShopProductId: findProductSetx.ShopProduct.get('id'),
                                                findShopWarehouseId: ele.warehouse_id,
                                                findShopWarehouseItemId: ele.shelfItem_id,
                                                findPurchaseUnitId: findProductSetx.ShopStock.get('shopwarehouseshelf')['purchase_unit_id'] || null,
                                                findDotMfd: element.dot || null
                                            }
                                        );
                                        if (currentProductShopStock.length !== 1) {
                                            throw Error('Variable currentProductShopStock.length must return 1');
                                        }

                                        const revertHoldingProductResult = await utilSetShopStockProductBalance(
                                            shop_code,
                                            findProductSetx.ShopProduct.get('id'),
                                            ele.warehouse_id,
                                            ele.shelfItem_id,
                                            findProductSetx.ShopStock.get('shopwarehouseshelf')['purchase_unit_id'],
                                            element.dot,
                                            "remove_holding_product",
                                            ele.holding_product,
                                            {
                                                updated_by: user_id,
                                                transaction: t2
                                            }
                                        );

                                        await utilSetShopInventoryMovementLog(
                                            'WYZAuto',
                                            {
                                                product_id: findProductSetx.ShopProduct.get('id'),
                                                doc_wyz_auto_id: ShopProductHoldWYZautoDoc.get('id'),
                                                stock_id: currentProductShopStock[0].id,
                                                warehouse_id: ele.warehouse_id,
                                                warehouse_item_id: ele.shelfItem_id,
                                                purchase_unit_id: findProductSetx.ShopStock.get('shopwarehouseshelf')['purchase_unit_id'] || null,
                                                dot_mfd: element.dot || null,
                                                count_previous_stock: currentProductShopStock[0].balance,
                                                count_adjust_stock: (Math.abs(+(ele.holding_product))),
                                                details: { documentType: 'WYZAuto', reasons: 'Delete' },
                                                created_by: user_id,
                                                created_date: currentDateTime
                                            },
                                            {
                                                transaction: transaction,
                                                currentDateTime: currentDateTime,
                                                shop_code: shop_code
                                            }
                                        );
                                    }



                                    await ShopProductHoldWYZautoDoc.update(
                                        {
                                            details: {
                                                ...ShopProductHoldWYZauto_details,
                                                real_hold_amount_stock: 0
                                            },
                                            end_date: currentDateTime,
                                            updated_by: user_id,
                                            updated_date: currentDateTime
                                        },
                                        {
                                            transaction: t2
                                        }
                                    );
                                    serviceFunctionCallbackSaveLogWithoutWait({
                                        action: `${actionUtilServiceFunction}: transaction: update`,
                                        reqProduct: element,
                                        dataBeforeUpdate: ShopProductHoldWYZautoDoc,
                                        error: null
                                    });
                                    await ShopProductHoldWYZautoDoc.reload({ transaction: t2 });
                                    ShopProductStockWIZAutoResult.updated = ({id: ShopProductHoldWYZautoDoc.get('id'), ref: null });
                                    //#endregion Update WYZAuto document and Revert holding stock

                                    //#region Create new WYZAuto document and Add holding stock, when stock is not set to 0
                                    if (element.stock !== 0) {
                                        const { createShopProductHoldWYZautoDocument } = await subFunction_createShopProductHoldWYZautoDocument();
                                        ShopProductStockWIZAutoResult.created = ({id: createShopProductHoldWYZautoDocument.get('id'), ref: ShopProductHoldWYZautoDoc.get('id') });
                                        serviceFunctionCallbackSaveLogWithoutWait({
                                            action: `${actionUtilServiceFunction}: transaction: create`,
                                            reqProduct: element,
                                            dataBeforeUpdate: null,
                                            error: null
                                        });
                                    }
                                    //#endregion Create new WYZAuto document and Add holding stock, when stock is not set to 0
                                }
                                //#endregion When WYZAuto document exists
                            }

                            return ShopProductStockWIZAutoResult;
                        }
                    ).catch(e => {
                        transactionError = e;
                    });

                    documentResult.push({
                        product: element,
                        result: transactionElement,
                        transactionError: transactionError
                    });

                    if (transactionError) {
                        serviceFunctionCallbackSaveLogWithoutWait({
                            action: `${actionUtilServiceFunction}: transaction`,
                            reqProduct: element,
                            dataBeforeUpdate: null,
                            error: transactionError
                        });
                    }
                }

                if (documentResult.filter(w => w.transactionError).length !== 0) {
                    throw Error('Some transaction have error: ' + JSON.stringify(
                        _(documentResult.map(w => (
                                {...w, transactionError: { message: _.get(w, 'transactionError.message', ''), stack: _.get(w, 'transactionError.stack', '') }}
                            ))
                        ).toJSON()
                    ));
                }

                let postWYZauto = null;
                if (documentResult.filter(w => w.transactionError).length === 0 && (documentResult.filter(w => w.result.created).length > 0 || documentResult.filter(w => w.result.updated).length > 0)) {
                    const mapProductToSendWYZauto = reducedProducts.map(w => ({ sku: w.wyz_code, dot: w.dot, price: w.price, stock: w.stock }));
                    // Send data to WYZAuto API
                    if (configSendToWYZAutoAPI === true) {
                        postWYZauto = await utilServiceAPIWIZautoPostProducts(mapProductToSendWYZauto, api_wyzauto_action_post_products.url, api_wyzauto_action_post_products.authorization)
                            .then(async (WIZAutoResponse) => {
                                if (WIZAutoResponse.data.error.total > 0) {
                                    serviceFunctionCallbackSaveLogWithoutWait({
                                        action: `${actionUtilServiceFunction}: transaction: POST: WYZauto`,
                                        reqProduct: reducedProducts,
                                        dataBeforeUpdate: null,
                                        error: Error(JSON.stringify({reqData: mapProductToSendWYZauto, resError: WIZAutoResponse.data.error}))
                                    });
                                    throw Error(`Cannot update to WIZAuto due WIZAuto response sucess but have errors`);
                                }

                                serviceFunctionCallbackSaveLogWithoutWait({
                                    action: `${actionUtilServiceFunction}: transaction: POST: WYZauto`,
                                    reqProduct: reducedProducts,
                                    dataBeforeUpdate: null,
                                    error: null
                                });

                                return WIZAutoResponse.data;
                            });
                    }
                }

                return { documentResult, postWYZauto };
            }
        );

        return transactionResult;

    } catch (error) {
        serviceFunctionCallbackSaveLogWithoutWait({
            action: actionUtilServiceFunction,
            reqProduct: products,
            dataBeforeUpdate: null,
            error: error
        });

        throw error;
    }
};


module.exports = utilServiceWYZautoFunctionPostProducts;