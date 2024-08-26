const _ = require("lodash");
const {
    get,
    isSafeInteger,
    isArray,
    isString,
    isPlainObject,
} = require("lodash");

const {
    isUUID,
} = require("./generate");

const {
    Transaction,
} = require("sequelize");

const db = require("../db");

const modelProduct = require("../models/model").Product;
const modelProductType = require("../models/model").ProductType;
const modelProductTypeGroup = require("../models/model").ProductTypeGroup;
const modelShopProfiles = require("../models/model").ShopsProfiles;
const initShopModel = require("../models/model").initShopModel;

/**
 * A function help to check is type of Balance
 * @param value
 * @returns {boolean}
 */
const isBalanceTypes = (value) => {
    if (!isSafeInteger((+value)) || (+value) < 0) {
        return false;
    }
    else {
        return true;
    }
};

/**
 * A function help to validate document of ShopStockProduct by balance
 * @param {ShopStock} shopStockProductDocument
 * @returns {Promise<void>}
 */
const validateShopStockProduct = async (shopStockProductDocument) => {
    if (!isBalanceTypes(shopStockProductDocument.balance)) {
        throw Error(`shopStockProductDocument.balance is not type of balance`);
    }
    else {
        if (!isArray(shopStockProductDocument.warehouse_detail)) {
            throw Error(`shopStockProductDocument.warehouse_detail is not type of array`);
        }
        else {
            const sumShopStockBalance = shopStockProductDocument.warehouse_detail.reduce(
                (prevWD, currWD) => {
                    const sumShelfBalance = currWD.shelf.reduce(
                        (prevSH, currSH) => {
                            if (!isBalanceTypes(get(currSH, "balance", NaN))) {
                                throw Error(`currSH.balance is not type of balance`);
                            }
                            else {
                                if (!isString(currSH.holding_product)) {
                                    return prevSH + (+currSH.balance);
                                }
                                else {
                                    if (!isBalanceTypes(get(currSH, "holding_product", NaN))) {
                                        throw Error(`currSH.holding_product is not type of balance`);
                                    }
                                    else {
                                        return prevSH + (+currSH.balance);
                                    }
                                }
                            }
                        },
                        0
                    );

                    return prevWD + sumShelfBalance;
                },
                0
            );

            if (sumShopStockBalance !== (+shopStockProductDocument.balance)) {
                throw Error(`sumShopStockBalance must equal shopStockProductDocument.balance`);
            }
        }
    }
};

/**
 * An object contains function to help calculate balance
 */
const selfItemBalanceActionSets = {
    "ADD_HOLDING_PRODUCT": {
        calculateStock_Balance: (stockBalance = 0, changeWarehouseSelfItemBalance) => {
            const calculatedStockBalance = (+stockBalance) - (+changeWarehouseSelfItemBalance);
            if (calculatedStockBalance < 0) {
                throw Error(`calculatedStockBalance must more than or equal zero, ADD_HOLDING_PRODUCT`);
            }
            else {
                return calculatedStockBalance;
            }
        },
        calculateWarehouse_SelfItemBalance: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWareHouseSelfItemBalance = (+currentWarehouseSelfItemBalance) - (+changeWarehouseSelfItemBalance);
            if (calculatedWareHouseSelfItemBalance < 0) {
                throw Error(`calculatedWareHouseSelfItemBalance must more than or equal zero, ADD_HOLDING_PRODUCT`);
            }
            else {
                return calculatedWareHouseSelfItemBalance;
            }
        },
        calculateWarehouse_SelfItemHoldingProduct: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWarehouseSelfItemHoldingProduct = (+currentWarehouseSelfItemBalance) + Math.abs((+changeWarehouseSelfItemBalance));
            if (calculatedWarehouseSelfItemHoldingProduct < 0) {
                throw Error(`calculatedWarehouseSelfItemHoldingProduct must more than or equal zero, ADD_HOLDING_PRODUCT`);
            }
            else {
                return calculatedWarehouseSelfItemHoldingProduct;
            }
        }
    },
    "REMOVE_HOLDING_PRODUCT": {
        calculateStock_Balance: (stockBalance = 0, changeWarehouseSelfItemBalance) => {
            const calculatedStockBalance = (+stockBalance) + (+changeWarehouseSelfItemBalance);
            if (calculatedStockBalance < 0) {
                throw Error(`calculatedStockBalance must more than or equal zero, REMOVE_HOLDING_PRODUCT`);
            }
            else {
                return calculatedStockBalance;
            }
        },
        calculateWarehouse_SelfItemBalance: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWareHouseSelfItemBalance = (+currentWarehouseSelfItemBalance) + (+changeWarehouseSelfItemBalance);
            if (calculatedWareHouseSelfItemBalance < 0) {
                throw Error(`calculatedWareHouseSelfItemBalance must more than or equal zero, REMOVE_HOLDING_PRODUCT`);
            }
            else {
                return calculatedWareHouseSelfItemBalance;
            }
        },
        calculateWarehouse_SelfItemHoldingProduct: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWarehouseSelfItemHoldingProduct = (+currentWarehouseSelfItemBalance) - Math.abs((+changeWarehouseSelfItemBalance));
            if (calculatedWarehouseSelfItemHoldingProduct < 0) {
                return (+currentWarehouseSelfItemBalance);
                // throw Error(`calculatedWarehouseSelfItemHoldingProduct must more than or equal zero, REMOVE_HOLDING_PRODUCT`);
            }
            else {
                return calculatedWarehouseSelfItemHoldingProduct;
            }
        }
    },
    "COMMIT_HOLDING_PRODUCT": {
        calculateStock_Balance: (stockBalance = 0, changeWarehouseSelfItemBalance) => {
            const calculatedStockBalance = (+stockBalance);
            if (calculatedStockBalance < 0) {
                throw Error(`calculatedStockBalance must more than or equal zero, COMMIT_HOLDING_PRODUCT`);
            }
            else {
                return calculatedStockBalance;
            }
        },
        calculateWarehouse_SelfItemBalance: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWareHouseSelfItemBalance = (+currentWarehouseSelfItemBalance);
            if (calculatedWareHouseSelfItemBalance < 0) {
                throw Error(`calculatedWareHouseSelfItemBalance must more than or equal zero, COMMIT_HOLDING_PRODUCT`);
            }
            else {
                return calculatedWareHouseSelfItemBalance;
            }
        },
        calculateWarehouse_SelfItemHoldingProduct: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWarehouseSelfItemHoldingProduct = (+currentWarehouseSelfItemBalance) - Math.abs((+changeWarehouseSelfItemBalance));
            if (calculatedWarehouseSelfItemHoldingProduct < 0) {
                throw Error(`calculatedWarehouseSelfItemHoldingProduct must more than or equal zero, COMMIT_HOLDING_PRODUCT`);
            }
            else {
                return calculatedWarehouseSelfItemHoldingProduct;
            }
        }
    },
    "REVERT_USED_PRODUCT": {
        calculateStock_Balance: (stockBalance = 0, changeWarehouseSelfItemBalance) => {
            const calculatedStockBalance = (+stockBalance) + Math.abs((+changeWarehouseSelfItemBalance));
            if (calculatedStockBalance < 0) {
                throw Error(`calculatedStockBalance must more than or equal zero, REVERT_USED_PRODUCT`);
            }
            else {
                return calculatedStockBalance;
            }
        },
        calculateWarehouse_SelfItemBalance: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWareHouseSelfItemBalance = (+currentWarehouseSelfItemBalance) + Math.abs((+changeWarehouseSelfItemBalance));
            if (calculatedWareHouseSelfItemBalance < 0) {
                throw Error(`calculatedWareHouseSelfItemBalance must more than or equal zero, REVERT_USED_PRODUCT`);
            }
            else {
                return calculatedWareHouseSelfItemBalance;
            }
        },
        calculateWarehouse_SelfItemHoldingProduct: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            if (+changeWarehouseSelfItemBalance !== 0) {
                throw Error(`changeWarehouseSelfItemBalance must equal zero, REVERT_USED_PRODUCT`);
            }

            const calculatedWarehouseSelfItemHoldingProduct = (+currentWarehouseSelfItemBalance);
            if (calculatedWarehouseSelfItemHoldingProduct < 0) {
                throw Error(`calculatedWarehouseSelfItemHoldingProduct must more than or equal zero, REVERT_USED_PRODUCT`);
            }
            else {
                return calculatedWarehouseSelfItemHoldingProduct;
            }
        }
    },
    "ADD_BALANCE_PRODUCT": {
        calculateStock_Balance: (stockBalance = 0, addStockCount) => {
            const calculatedStockBalance = (+stockBalance) + (+addStockCount);
            if (!isSafeInteger(calculatedStockBalance)) {
                throw Error(`calculatedStockBalance must be type of SafeInteger, ADD_BALANCE_PRODUCT -> calculateStock_Balance`);
            }
            else if (calculatedStockBalance < 0) {
                throw Error(`calculatedStockBalance must more than or equal zero, ADD_BALANCE_PRODUCT -> calculateStock_Balance`);
            }
            else {
                return calculatedStockBalance;
            }
        },
        calculateWarehouse_SelfItemBalance: (currentWarehouseSelfItemBalance, changeWarehouseSelfItemBalance) => {
            const calculatedWareHouseSelfItemBalance = (+currentWarehouseSelfItemBalance) + (+changeWarehouseSelfItemBalance);
            if (!isSafeInteger(calculatedWareHouseSelfItemBalance)) {
                throw Error(`calculatedWareHouseSelfItemBalance must be type of SafeInteger, ADD_BALANCE_PRODUCT -> calculateWarehouse_SelfItemBalance`);
            }
            if (calculatedWareHouseSelfItemBalance < 0) {
                throw Error(`calculatedWareHouseSelfItemBalance must more than or equal zero, ADD_BALANCE_PRODUCT -> calculateWarehouse_SelfItemBalance`);
            }
            else {
                return calculatedWareHouseSelfItemBalance;
            }
        },
        calculateWarehouse_SelfItemHoldingProduct: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWarehouseSelfItemHoldingProduct = (+currentWarehouseSelfItemBalance) + Math.abs((+changeWarehouseSelfItemBalance));
            if (calculatedWarehouseSelfItemHoldingProduct < 0) {
                throw Error(`calculatedWarehouseSelfItemHoldingProduct must more than or equal zero, ADD_BALANCE_PRODUCT -> calculateWarehouse_SelfItemHoldingProduct`);
            }
            else {
                return calculatedWarehouseSelfItemHoldingProduct;
            }
        }
    },
    "REMOVE_BALANCE_PRODUCT": {
        calculateStock_Balance: (stockBalance = 0, removeStockCount) => {
            const calculatedStockBalance = (+stockBalance) - (+removeStockCount);
            if (!isSafeInteger(calculatedStockBalance)) {
                throw Error(`calculatedStockBalance must be type of SafeInteger, REMOVE_BALANCE_PRODUCT -> calculateStock_Balance`);
            }
            else if (calculatedStockBalance < 0) {
                throw Error(`calculatedStockBalance must more than or equal zero, REMOVE_BALANCE_PRODUCT -> calculateStock_Balance`);
            }
            else {
                return calculatedStockBalance;
            }
        },
        calculateWarehouse_SelfItemBalance: (currentWarehouseSelfItemBalance, changeWarehouseSelfItemBalance) => {
            const calculatedWareHouseSelfItemBalance = (+currentWarehouseSelfItemBalance) - (+changeWarehouseSelfItemBalance);
            if (!isSafeInteger(calculatedWareHouseSelfItemBalance)) {
                throw Error(`calculatedWareHouseSelfItemBalance must be type of SafeInteger, REMOVE_BALANCE_PRODUCT -> calculateWarehouse_SelfItemBalance`);
            }
            if (calculatedWareHouseSelfItemBalance < 0) {
                throw Error(`calculatedWareHouseSelfItemBalance must more than or equal zero, REMOVE_BALANCE_PRODUCT -> calculateWarehouse_SelfItemBalance`);
            }
            else {
                return calculatedWareHouseSelfItemBalance;
            }
        },
        calculateWarehouse_SelfItemHoldingProduct: (currentWarehouseSelfItemBalance = 0, changeWarehouseSelfItemBalance = 0) => {
            const calculatedWarehouseSelfItemHoldingProduct = (+currentWarehouseSelfItemBalance) + Math.abs((+changeWarehouseSelfItemBalance));
            if (calculatedWarehouseSelfItemHoldingProduct < 0) {
                throw Error(`calculatedWarehouseSelfItemHoldingProduct must more than or equal zero, REMOVE_BALANCE_PRODUCT -> calculateWarehouse_SelfItemHoldingProduct`);
            }
            else {
                return calculatedWarehouseSelfItemHoldingProduct;
            }
        }
    },
};

/**
 *
 * @param {import("../types/type.Util.SetStockProductBalance").Shelf} where
 * @param {string} shopStockShelfItemName
 * @param {string} shopStockPurchaseUnitId
 * @param {string?} shopStockShelfDOTName
 */
const subServiceFindShelfItemIndexCallback = (where, shopStockShelfItemName, shopStockPurchaseUnitId, shopStockShelfDOTName) => {
    if (!isPlainObject(where)) {
        return false;
    }
    else if (!isString(shopStockShelfItemName)) {
        return false;
    }
    else {
        if ((isString(where.dot_mfd) && where.dot_mfd !== "") || (isString(shopStockShelfDOTName) && shopStockShelfDOTName !== "")) {
            return where.item === shopStockShelfItemName && where.purchase_unit_id === shopStockPurchaseUnitId && where.dot_mfd === shopStockShelfDOTName;
        }
        else {
            return (get(where, "dot_mfd", "") === "") && where.item === shopStockShelfItemName && where.purchase_unit_id === shopStockPurchaseUnitId;
        }
    }
};


/**
 * A utility help to update balance of ShopStockProduct
 * @param {string} tableName
 * @param {string} shopStockProductId
 * @param {string} shopStockWarehouseId
 * @param {string} shopStockShelfItemName
 * @param {string} shopStockPurchaseUnitId
 * @param {string} shopStockShelfDOTName
 * @param {"add_holding_product" | "remove_holding_product" | "commit_holding_product" | "revert_used_product" | "add_balance_product" | "remove_balance_product"} method
 * @param {number|string} value
 * @param {object?} options
 * @param {import("sequelize").Transaction?} options.transaction
 * @param {string?} options.updated_by
 * @param {Date?} options.currentDateTime
 * @param {Object?} options.ShopModels
 * @returns {Promise<{shopStock_balance: string|null, shopStockWarehouse_balance: string|null, shopStockWarehouse_holdingProduct: string|null}>}
 */
const utilSetShopStockProductBalance = async (tableName, shopStockProductId, shopStockWarehouseId, shopStockShelfItemName, shopStockPurchaseUnitId = "", shopStockShelfDOTName = "", method, value, options = {}) => {
    const currentDateTime = options?.currentDateTime || new Date();

    if (!_.isString(shopStockShelfDOTName)) {
        shopStockShelfDOTName = '';
    }

    const transactionResult = await db.transaction(
        {
            transaction: options?.transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const updated_by = !isUUID(get(options, 'updated_by', null)) ? {} : { updated_by: options.updated_by };
            const ShopModels = options?.ShopModels || initShopModel(tableName);
            const {
                ShopProduct: instanceModelShopProduct,
                ShopStock: instanceModelShopStopStockProductBalances,
            } =  ShopModels;
            /**
             * @type {{shopStock_balance: string, shopStockWarehouse_balance: string, shopStockWarehouse_holdingProduct: string}}
             */
            const attachResults = {
                shopStock_balance: null,
                shopStockWarehouse_balance: null,
                shopStockWarehouse_holdingProduct: null,
            };

            const findShopProduct = await instanceModelShopProduct.findOne({
                include: [{
                    model: modelProduct,
                    include: [{
                        model: modelProductType,
                        include: [{
                            model: modelProductTypeGroup
                        }]
                    }]
                }],
                where: {
                    id: shopStockProductId
                },
                transaction: transaction
            });
            if (!findShopProduct) {
                throw Error(`Cannot find ShopProduct`);
            }
            // else {
            //     const isStock = get(findShopProduct, 'Product.ProductType.ProductTypeGroup.isstock');
            //     if (isBoolean(isStock) === false) {
            //         throw Error('Product.ProductType.ProductTypeGroup.isstock must be boolean');
            //     }
            //     else {
            //         if (isStock === false) {
            //             return attachResults;
            //         }
            //     }
            // }

            let findShopStockDoc = await instanceModelShopStopStockProductBalances.findOne({
                where: {
                    product_id: shopStockProductId
                },
                transaction: transaction
            });

            if (!findShopStockDoc) {
                await instanceModelShopStopStockProductBalances.create(
                    {
                        shop_id: (await modelShopProfiles.findOne({
                            where: {
                                shop_code_id: String(tableName).toUpperCase()
                            },
                            transaction: transaction
                        })).get('id'),
                        product_id: shopStockProductId,
                        warehouse_detail: [{
                            warehouse: shopStockWarehouseId,
                            shelf: [{
                                item: shopStockShelfItemName,
                                purchase_unit_id: shopStockPurchaseUnitId || null,
                                dot_mfd: shopStockShelfDOTName || '',
                                balance: "0"
                            }]
                        }],
                        balance: 0,
                        balance_date: currentDateTime,
                        created_by: '90f5a0a9-a111-49ee-94df-c5623811b6cc',
                        created_date: currentDateTime,
                    },
                    {
                        validate: true,
                        transaction: transaction
                    }
                );

                findShopStockDoc = await instanceModelShopStopStockProductBalances.findOne({
                    where: {
                        product_id: shopStockProductId
                    },
                    transaction: transaction
                });
            }
            else {
                const warehouseDetailDTD = findShopStockDoc.get('warehouse_detail');
                const warehouseIndexFindById = warehouseDetailDTD
                    .findIndex(w => w.warehouse === shopStockWarehouseId);
                if (warehouseIndexFindById < 0) {
                    findShopStockDoc.warehouse_detail = [
                        ...warehouseDetailDTD,
                        {
                            warehouse: shopStockWarehouseId,
                            shelf: [{
                                item: shopStockShelfItemName,
                                purchase_unit_id: shopStockPurchaseUnitId || null,
                                dot_mfd: shopStockShelfDOTName || '',
                                balance: "0"
                            }]
                        }
                    ];
                    await findShopStockDoc.save({ transaction: transaction })
                }
                else {
                    const shelfItemIndexFindBy = (warehouseDetailDTD[warehouseIndexFindById].shelf)
                        .findIndex(
                            w => w.item === shopStockShelfItemName
                            && _.get(w, 'purchase_unit_id', null) === shopStockPurchaseUnitId
                            && _.get(w, 'dot_mfd', '') === shopStockShelfDOTName
                        );
                    if (shelfItemIndexFindBy < 0) {
                        findShopStockDoc.warehouse_detail[warehouseIndexFindById]
                            .shelf = [
                            ...(findShopStockDoc.warehouse_detail[warehouseIndexFindById].shelf),
                            {
                                item: shopStockShelfItemName,
                                purchase_unit_id: shopStockPurchaseUnitId || null,
                                dot_mfd: shopStockShelfDOTName || '',
                                balance: "0"
                            }
                        ];
                    }
                }

                findShopStockDoc.set('warehouse_detail', findShopStockDoc.warehouse_detail);

                findShopStockDoc = await findShopStockDoc.save({ transaction: transaction });
            }

            if (!findShopStockDoc) {
                throw Error(`Cannot find ShopStock`);
            }
            else {
                if (method === "add_holding_product") {
                    findShopStockDoc.balance = String(
                        selfItemBalanceActionSets["ADD_HOLDING_PRODUCT"].calculateStock_Balance(
                            findShopStockDoc.balance,
                            value
                        )
                    );

                    if (+findShopStockDoc.balance < 0) {
                        throw Error(`balance is lower zero`);
                    }
                    else {
                        /**
                         * @type {import("../types/type.Util.SetStockProductBalance").IShopStockProductBalanceWarehouseDetail[]}
                         */
                        const docShopStock_Warehouse = findShopStockDoc.warehouse_detail;

                        if (!isArray(docShopStock_Warehouse)) {
                            throw Error(`Warehouse is not initialized`);
                        }
                        else {
                            /**
                             * DB = "warehouse_detail[index]->warehouse"
                             * @type {number}
                             */
                            const docShopStock_WarehouseIndex = docShopStock_Warehouse.findIndex(w => w.warehouse === shopStockWarehouseId);

                            if (docShopStock_WarehouseIndex < 0) {
                                throw Error(`Warehouse is not found`);
                            }
                            else {
                                /**
                                 * DB = "warehouse_detail[]->warehouse.shelf[index]"
                                 * @type {number}
                                 */
                                const warehouse_SelfIndex = docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf.findIndex(where => subServiceFindShelfItemIndexCallback(where, shopStockShelfItemName, shopStockPurchaseUnitId, shopStockShelfDOTName));

                                if (warehouse_SelfIndex < 0) {
                                    throw Error(`warehouse_detail[]->warehouse.shelf[index].item is not found`);
                                }
                                else {
                                    docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance = String(
                                        selfItemBalanceActionSets["ADD_HOLDING_PRODUCT"].calculateWarehouse_SelfItemBalance(
                                            docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance,
                                            value
                                        )
                                    );

                                    if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance))) {
                                        throw Error(`warehouse_detail[]->warehouse.balance is types error`);
                                    }
                                    else {
                                        docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product = String(
                                            selfItemBalanceActionSets["ADD_HOLDING_PRODUCT"].calculateWarehouse_SelfItemHoldingProduct(
                                                docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product,
                                                value
                                            )
                                        );

                                        if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product))) {
                                            throw Error(`warehouse_detail[]->warehouse.holding_product is types error`);
                                        }
                                        else {
                                            attachResults.shopStock_balance = findShopStockDoc.balance;
                                            attachResults.shopStockWarehouse_balance = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance;
                                            attachResults.shopStockWarehouse_holdingProduct = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (method === "remove_holding_product") {
                    findShopStockDoc.balance = String(
                        selfItemBalanceActionSets["REMOVE_HOLDING_PRODUCT"].calculateStock_Balance(
                            findShopStockDoc.balance,
                            value
                        )
                    );

                    if (+findShopStockDoc.balance < 0) {
                        throw Error(`balance is lower zero`);
                    }
                    else {
                        /**
                         * @type {import("../types/type.Util.SetStockProductBalance").IShopStockProductBalanceWarehouseDetail[]}
                         */
                        const docShopStock_Warehouse = findShopStockDoc.warehouse_detail;

                        if (!isArray(docShopStock_Warehouse)) {
                            throw Error(`Warehouse is not initialized`);
                        }
                        else {
                            /**
                             * DB = "warehouse_detail[index]->warehouse"
                             * @type {number}
                             */
                            const docShopStock_WarehouseIndex = docShopStock_Warehouse.findIndex(w => w.warehouse === shopStockWarehouseId);

                            if (docShopStock_WarehouseIndex < 0) {
                                throw Error(`Warehouse is not found`);
                            }
                            else {
                                /**
                                 * DB = "warehouse_detail[]->warehouse.shelf[index]"
                                 * @type {number}
                                 */
                                const warehouse_SelfIndex = docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf.findIndex(where => subServiceFindShelfItemIndexCallback(where, shopStockShelfItemName, shopStockPurchaseUnitId, shopStockShelfDOTName));

                                if (warehouse_SelfIndex < 0) {
                                    throw Error(`warehouse_detail[]->warehouse.shelf[index].item is not found`);
                                }
                                else {
                                    docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance = String(
                                        selfItemBalanceActionSets["REMOVE_HOLDING_PRODUCT"].calculateWarehouse_SelfItemBalance(
                                            docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance,
                                            value
                                        )
                                    );

                                    if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance))) {
                                        throw Error(`warehouse_detail[]->warehouse.balance is types error`);
                                    }
                                    else {
                                        docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product = String(
                                            selfItemBalanceActionSets["REMOVE_HOLDING_PRODUCT"].calculateWarehouse_SelfItemHoldingProduct(
                                                docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product,
                                                value
                                            )
                                        );

                                        if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product))) {
                                            throw Error(`warehouse_detail[]->warehouse.holding_product is types error`);
                                        }
                                        else {
                                            attachResults.shopStock_balance = findShopStockDoc.balance;
                                            attachResults.shopStockWarehouse_balance = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance;
                                            attachResults.shopStockWarehouse_holdingProduct = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (method === "commit_holding_product") {
                    findShopStockDoc.balance = String(
                        selfItemBalanceActionSets["COMMIT_HOLDING_PRODUCT"].calculateStock_Balance(
                            findShopStockDoc.balance,
                            value
                        )
                    );

                    if (+findShopStockDoc.balance < 0) {
                        throw Error(`balance is lower zero`);
                    }
                    else {
                        /**
                         * @type {import("../types/type.Util.SetStockProductBalance").IShopStockProductBalanceWarehouseDetail[]}
                         */
                        const docShopStock_Warehouse = findShopStockDoc.warehouse_detail;

                        if (!isArray(docShopStock_Warehouse)) {
                            throw Error(`Warehouse is not initialized`);
                        }
                        else {
                            /**
                             * DB = "warehouse_detail[index]->warehouse"
                             * @type {number}
                             */
                            const docShopStock_WarehouseIndex = docShopStock_Warehouse.findIndex(w => w.warehouse === shopStockWarehouseId);

                            if (docShopStock_WarehouseIndex < 0) {
                                throw Error(`Warehouse is not found`);
                            }
                            else {
                                /**
                                 * DB = "warehouse_detail[]->warehouse.shelf[index]"
                                 * @type {number}
                                 */
                                const warehouse_SelfIndex = docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf.findIndex(where => subServiceFindShelfItemIndexCallback(where, shopStockShelfItemName, shopStockPurchaseUnitId, shopStockShelfDOTName));

                                if (warehouse_SelfIndex < 0) {
                                    throw Error(`warehouse_detail[]->warehouse.shelf[index].item is not found`);
                                }
                                else {
                                    docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance = String(
                                        selfItemBalanceActionSets["COMMIT_HOLDING_PRODUCT"].calculateWarehouse_SelfItemBalance(
                                            docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance,
                                            value
                                        )
                                    );

                                    if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance))) {
                                        throw Error(`warehouse_detail[]->warehouse.balance is types error`);
                                    }
                                    else {
                                        docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product = String(
                                            selfItemBalanceActionSets["COMMIT_HOLDING_PRODUCT"].calculateWarehouse_SelfItemHoldingProduct(
                                                docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product,
                                                value
                                            )
                                        );

                                        if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product))) {
                                            throw Error(`warehouse_detail[]->warehouse.holding_product is types error`);
                                        }
                                        else {
                                            attachResults.shopStock_balance = findShopStockDoc.balance;
                                            attachResults.shopStockWarehouse_balance = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance;
                                            attachResults.shopStockWarehouse_holdingProduct = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (method === "revert_used_product") {
                    findShopStockDoc.balance = String(
                        selfItemBalanceActionSets["REVERT_USED_PRODUCT"].calculateStock_Balance(
                            findShopStockDoc.balance,
                            value
                        )
                    );

                    if (+findShopStockDoc.balance < 0) {
                        throw Error(`balance is lower zero`);
                    }
                    else {
                        /**
                         * @type {import("../types/type.Util.SetStockProductBalance").IShopStockProductBalanceWarehouseDetail[]}
                         */
                        const docShopStock_Warehouse = findShopStockDoc.warehouse_detail;

                        if (!isArray(docShopStock_Warehouse)) {
                            throw Error(`Warehouse is not initialized`);
                        }
                        else {
                            /**
                             * DB = "warehouse_detail[index]->warehouse"
                             * @type {number}
                             */
                            const docShopStock_WarehouseIndex = docShopStock_Warehouse.findIndex(w => w.warehouse === shopStockWarehouseId);

                            const setDOT = isString(shopStockShelfDOTName) ? { dot_mfd: shopStockShelfDOTName } : {};

                            if (docShopStock_WarehouseIndex < 0) {
                                const warehouse_SelfIndex = findShopStockDoc.warehouse_detail.push({
                                    warehouse: shopStockWarehouseId,
                                    shelf: [{
                                        item: String(value),
                                        purchase_unit_id: shopStockPurchaseUnitId,
                                        ...setDOT,
                                        balance: String(value),
                                        holding_product: "0"
                                    }]
                                });

                                attachResults.shopStock_balance = findShopStockDoc.balance;
                                attachResults.shopStockWarehouse_balance = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance;
                                attachResults.shopStockWarehouse_holdingProduct = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product;
                            }
                            else {
                                /**
                                 * DB = "warehouse_detail[]->warehouse.shelf[index]"
                                 * @type {number}
                                 */
                                const warehouse_SelfIndex = docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf.findIndex(where => subServiceFindShelfItemIndexCallback(where, shopStockShelfItemName, shopStockPurchaseUnitId, shopStockShelfDOTName));

                                if (warehouse_SelfIndex < 0) {
                                    docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf.push({
                                        item: String(value),
                                        purchase_unit_id: shopStockPurchaseUnitId,
                                        ...setDOT,
                                        balance: String(value),
                                        holding_product: "0"
                                    });

                                    attachResults.shopStock_balance = findShopStockDoc.balance;
                                    attachResults.shopStockWarehouse_balance = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance;
                                    attachResults.shopStockWarehouse_holdingProduct = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product;
                                }
                                else {
                                    docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance = String(
                                        selfItemBalanceActionSets["REVERT_USED_PRODUCT"].calculateWarehouse_SelfItemBalance(
                                            docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance,
                                            value
                                        )
                                    );

                                    if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance))) {
                                        throw Error(`warehouse_detail[]->warehouse.balance is types error`);
                                    }
                                    else {
                                        docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product = String(
                                            selfItemBalanceActionSets["REVERT_USED_PRODUCT"].calculateWarehouse_SelfItemHoldingProduct(
                                                docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product,
                                                "0"
                                            )
                                        );

                                        if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product))) {
                                            throw Error(`warehouse_detail[]->warehouse.holding_product is types error`);
                                        }
                                        else {
                                            attachResults.shopStock_balance = findShopStockDoc.balance;
                                            attachResults.shopStockWarehouse_balance = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance;
                                            attachResults.shopStockWarehouse_holdingProduct = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (method === "add_balance_product") {
                    findShopStockDoc.balance = String(
                        selfItemBalanceActionSets["ADD_BALANCE_PRODUCT"].calculateStock_Balance(
                            findShopStockDoc.balance,
                            value
                        )
                    );

                    if (+findShopStockDoc.balance < 0) {
                        throw Error(`balance is lower zero`);
                    }
                    else {
                        /**
                         * @type {import("../types/type.Util.SetStockProductBalance").IShopStockProductBalanceWarehouseDetail[]}
                         */
                        const docShopStock_Warehouse = findShopStockDoc.warehouse_detail;

                        if (!isArray(docShopStock_Warehouse)) {
                            throw Error(`Warehouse is not initialized`);
                        }
                        else {
                            /**
                             * DB = "warehouse_detail[index]->warehouse"
                             * @type {number}
                             */
                            const docShopStock_WarehouseIndex = docShopStock_Warehouse.findIndex(w => w.warehouse === shopStockWarehouseId);

                            if (docShopStock_WarehouseIndex < 0) {
                                throw Error(`Warehouse is not found`);
                            }
                            else {
                                /**
                                 * DB = "warehouse_detail[]->warehouse.shelf[index]"
                                 * @type {number}
                                 */
                                const warehouse_SelfIndex = docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf.findIndex(where => subServiceFindShelfItemIndexCallback(where, shopStockShelfItemName, shopStockPurchaseUnitId, shopStockShelfDOTName));

                                if (warehouse_SelfIndex < 0) {
                                    throw Error(`warehouse_detail[]->warehouse.shelf[index].item is not found`);
                                }
                                else {
                                    docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance = String(
                                        selfItemBalanceActionSets["ADD_BALANCE_PRODUCT"].calculateWarehouse_SelfItemBalance(
                                            docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance,
                                            value
                                        )
                                    );

                                    if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance))) {
                                        throw Error(`warehouse_detail[]->warehouse.balance is types error`);
                                    }
                                    else {
                                        docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product = String(
                                            selfItemBalanceActionSets["ADD_BALANCE_PRODUCT"].calculateWarehouse_SelfItemHoldingProduct(
                                                docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product,
                                                0
                                            )
                                        );

                                        if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product))) {
                                            throw Error(`warehouse_detail[]->warehouse.holding_product is types error`);
                                        }
                                        else {
                                            attachResults.shopStock_balance = findShopStockDoc.balance;
                                            attachResults.shopStockWarehouse_balance = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance;
                                            attachResults.shopStockWarehouse_holdingProduct = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (method === "remove_balance_product") {
                    findShopStockDoc.balance = String(
                        selfItemBalanceActionSets["REMOVE_BALANCE_PRODUCT"].calculateStock_Balance(
                            findShopStockDoc.balance,
                            value
                        )
                    );

                    if (+findShopStockDoc.balance < 0) {
                        throw Error(`balance is lower zero`);
                    }
                    else {
                        /**
                         * @type {import("../types/type.Util.SetStockProductBalance").IShopStockProductBalanceWarehouseDetail[]}
                         */
                        const docShopStock_Warehouse = findShopStockDoc.warehouse_detail;

                        if (!isArray(docShopStock_Warehouse)) {
                            throw Error(`Warehouse is not initialized`);
                        }
                        else {
                            /**
                             * DB = "warehouse_detail[index]->warehouse"
                             * @type {number}
                             */
                            const docShopStock_WarehouseIndex = docShopStock_Warehouse.findIndex(w => w.warehouse === shopStockWarehouseId);

                            if (docShopStock_WarehouseIndex < 0) {
                                throw Error(`Warehouse is not found`);
                            }
                            else {
                                /**
                                 * DB = "warehouse_detail[]->warehouse.shelf[index]"
                                 * @type {number}
                                 */
                                const warehouse_SelfIndex = docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf.findIndex(where => subServiceFindShelfItemIndexCallback(where, shopStockShelfItemName, shopStockPurchaseUnitId, shopStockShelfDOTName));

                                if (warehouse_SelfIndex < 0) {
                                    throw Error(`warehouse_detail[]->warehouse.shelf[index].item is not found`);
                                }
                                else {
                                    docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance = String(
                                        selfItemBalanceActionSets["REMOVE_BALANCE_PRODUCT"].calculateWarehouse_SelfItemBalance(
                                            docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance,
                                            value
                                        )
                                    );

                                    if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance))) {
                                        throw Error(`warehouse_detail[]->warehouse.balance is types error`);
                                    }
                                    else {
                                        docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product = String(
                                            selfItemBalanceActionSets["REMOVE_BALANCE_PRODUCT"].calculateWarehouse_SelfItemHoldingProduct(
                                                docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product,
                                                0
                                            )
                                        );

                                        if (!isBalanceTypes((docShopStock_Warehouse[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product))) {
                                            throw Error(`warehouse_detail[]->warehouse.holding_product is types error`);
                                        }
                                        else {
                                            attachResults.shopStock_balance = findShopStockDoc.balance;
                                            attachResults.shopStockWarehouse_balance = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].balance;
                                            attachResults.shopStockWarehouse_holdingProduct = findShopStockDoc.warehouse_detail[docShopStock_WarehouseIndex].shelf[warehouse_SelfIndex].holding_product;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }


                await instanceModelShopStopStockProductBalances.update(
                    {
                        balance: findShopStockDoc.balance,
                        warehouse_detail: findShopStockDoc.warehouse_detail,
                        updated_date: currentDateTime,
                        ...updated_by
                    },
                    {
                        where: {
                            id: findShopStockDoc.id
                        },
                        transaction: transaction,
                    }
                );

                if (!isString(attachResults.shopStock_balance) || !isBalanceTypes(attachResults.shopStock_balance)) {
                    throw Error(`attachResults.shopStock_balance is not balance type`);
                }
                if (!isString(attachResults.shopStockWarehouse_balance) || !isBalanceTypes(attachResults.shopStockWarehouse_balance)) {
                    throw Error(`attachResults.shopStockWarehouse_balance is not balance type`);
                }
                if (!isString(attachResults.shopStockWarehouse_holdingProduct) || !isBalanceTypes(attachResults.shopStockWarehouse_holdingProduct)) {
                    throw Error(`attachResults.shopStockWarehouse_holdingProduct is not balance type`);
                }

                await findShopStockDoc.reload({ transaction: transaction });

                await validateShopStockProduct(findShopStockDoc);

                return attachResults;
            }
        }
    );

    return transactionResult;
};

module.exports = utilSetShopStockProductBalance;