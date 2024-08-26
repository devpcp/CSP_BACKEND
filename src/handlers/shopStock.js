/**
 * @type {import("lodash")}
 */
const _ = require("lodash");
const XLSX = require('xlsx-js-style');
const { v4: uuid4 } = require("uuid");
const { Op, Transaction, QueryTypes } = require("sequelize");
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilCheckShopTableName = require('../utils/util.CheckShopTableName');
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilSetShopStockProductBalance = require("../utils/util.SetShopStockProductBalance");
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilGetCurrentProductShopStock = require("../utils/util.GetCurrentProductShopStock");
const utilSetShopInventoryMovementLog = require("../utils/util.SetShopInventoryMovementLog");
const { isNull, isUUID } = require('../utils/generate');
const sequelize = require('../db');
const utilGetShopProductAverageCost = require("../utils/util.GetShopProductAverageCost");
const ShopsProfiles = require('../models/model').ShopsProfiles;
const Product = require('../models/model').Product;
const ProductType = require('../models/model').ProductType;
const ProductPurchaseUnitTypes = require('../models/model').ProductPurchaseUnitTypes;
const ProductBrand = require('../models/model').ProductBrand;
const ProductCompleteSize = require('../models/model').ProductCompleteSize;
const ProductModelType = require('../models/model').ProductModelType;
const ShopProduct = require("../models/model").ShopProduct;
const ShopStock = require('../models/model').ShopStock;

const handleShopStockAdd = async (request, reply, options = {}, product_list) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());

    const option_movementLog_doc_inventory_id = _.get(options, 'movementLog_doc_inventory_id', null);
    const option_movementLog_doc_inventory_log_id = _.get(options, 'movementLog_doc_inventory_log_id', null);
    const option_movementLog_details = _.get(options, 'movementLog_details', {});

    const transactionResults = await sequelize.transaction(
        {
            transaction: request.transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            if (!request.transaction) {
                request.transaction = transaction;
            }

            const shop_table = await utilCheckShopTableName(request);
            const table_name = shop_table.shop_code_id;
            const product_id = product_list.product_id;
            const warehouse_detail = product_list.warehouse_detail
                .reduce((pre, curr) => {
                    curr.shelf.dot_mfd = _.get(curr.shelf, 'dot_mfd', '');
                    if (!_.isString(curr.shelf.dot_mfd)) {
                        curr.shelf.dot_mfd = '';
                    }
                    curr.shelf.purchase_unit_id = _.get(curr.shelf, 'purchase_unit_id', null);
                    if (_.isNull(curr.shelf.purchase_unit_id) && !isUUID(curr.shelf.purchase_unit_id)) {
                        curr.shelf.purchase_unit_id = null;
                    }
                    pre.push(curr);
                    return pre;
                }, []);
            const import_date = request.body.import_date;
            /**
             * status คือ สถานะการนำเข้าสินค้าสู่คลัง
             * * 0 = ยกเลิก
             * * 1 = นำเข้าปกติ
             * * 2 = ปรับเพิ่ม
             * * 3 = ปรับลด
             * * 4 = โอนในระหว่างคลัง
             * @type {0|1|2|3|4}
             */
            const status = request.body.status;

            /**
             * @type {boolean|null}
             */
            let condition = null;
            if (status === 1) {
                condition = true;
            }
            else if (status === 0 || status === 2 || status === 3 || status === 4) {
                condition = false;
            } else {
                throw Error('parameter "status" is out of scope');
            }

            const find_product_in_stock = await ShopStock(table_name).findAll({
                where: [
                    { product_id: product_id },
                ],
                transaction: transaction
            });
            if (find_product_in_stock.length === 0) {
                await ShopStock(table_name).create(
                    {
                        shop_id: shop_table.id,
                        product_id: product_id,
                        warehouse_detail: [],
                        balance: 0,
                        balance_date: import_date,
                        created_by: request.id,
                        created_date: currentDateTime
                    },
                    {
                        transaction: transaction
                    }
                );
            }

            // นำเข้าปกติ
            if (condition === true) {
                for (let index = 0; index < warehouse_detail.length; index++) {
                    const findPreStockAdjust = await utilGetCurrentProductShopStock(
                        table_name,
                        {
                            transaction: transaction,
                            findShopProductId: product_list.product_id,
                            findShopWarehouseId: product_list.warehouse_detail[index].warehouse,
                            findShopWarehouseItemId: product_list.warehouse_detail[index].shelf.item,
                            findPurchaseUnitId: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                            findDotMfd: product_list.warehouse_detail[index].shelf.dot_mfd || null
                        }
                    );
                    if (findPreStockAdjust.length !== 0 && findPreStockAdjust.length !== 1) {
                        throw Error(`Variable findPreStockAdjust.length is not return 0 or 1`);
                    }
                    if (findPreStockAdjust.length === 1 && _.isNull(_.get(findPreStockAdjust[0], 'balance', null))) {
                        throw Error(`Variable findPreStockAdjust[0].balance is not found`);
                    }
                    const findPreStockAdjust_count_previous_stock = _.get(findPreStockAdjust[0], 'balance', 0);

                    await utilSetShopStockProductBalance(
                        table_name,
                        product_list.product_id,
                        product_list.warehouse_detail[index].warehouse,
                        product_list.warehouse_detail[index].shelf.item,
                        product_list.warehouse_detail[index].shelf.purchase_unit_id,
                        product_list.warehouse_detail[index].shelf.dot_mfd,
                        'add_balance_product',
                        product_list.warehouse_detail[index].shelf.amount,
                        {
                            transaction: transaction,
                            updated_by: request.id
                        }
                    );

                    const findPostStockAdjust = await utilGetCurrentProductShopStock(
                        table_name,
                        {
                            transaction: transaction,
                            findShopProductId: product_list.product_id,
                            findShopWarehouseId: product_list.warehouse_detail[index].warehouse,
                            findShopWarehouseItemId: product_list.warehouse_detail[index].shelf.item,
                            findPurchaseUnitId: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                            findDotMfd: product_list.warehouse_detail[index].shelf.dot_mfd || null
                        }
                    );
                    if (findPostStockAdjust.length !== 1) {
                        throw Error(`Variable findPostStockAdjust.length is not 1, due from Document type is INI`);
                    }

                    await utilSetShopInventoryMovementLog(
                        'INI',
                        {
                            shop_id: shop_table.id,
                            product_id: product_list.product_id,
                            doc_inventory_id: option_movementLog_doc_inventory_id,
                            doc_inventory_log_id: option_movementLog_doc_inventory_log_id,
                            stock_id: findPostStockAdjust[0].id,
                            warehouse_id: product_list.warehouse_detail[index].warehouse,
                            warehouse_item_id: product_list.warehouse_detail[index].shelf.item,
                            purchase_unit_id: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                            dot_mfd: product_list.warehouse_detail[index].shelf.dot_mfd || null,
                            count_previous_stock: +(findPreStockAdjust_count_previous_stock),
                            count_adjust_stock: +(product_list.warehouse_detail[index].shelf.amount),
                            details: { documentType: 'INI', ...option_movementLog_details },
                            created_by: request.id,
                            created_date: currentDateTime
                        },
                        {
                            transaction: transaction
                        }
                    );
                }
            }

            // ยกเลิก=0, ปรับเพิ่ม=2, ปรับลด=3, โอนในระหว่างคลัง=4
            if (condition === false) {
                for (let index = 0; index < warehouse_detail.length; index++) {
                    const element = warehouse_detail[index];

                    /**
                     * objectDotMfd
                     * @type {string|null}
                     */
                    const objectDotMfd = _.get(element, 'shelf.dot_mfd', null);

                    // ปรับเพิ่ม=2
                    if ((status === 2 && _.get(product_list.warehouse_detail[index], 'status', null) === null) || _.get(product_list.warehouse_detail[index], 'status', null) === 2) {
                        const findPreStockAdjust = await utilGetCurrentProductShopStock(
                            table_name,
                            {
                                transaction: transaction,
                                findShopProductId: product_list.product_id,
                                findShopWarehouseId: product_list.warehouse_detail[index].warehouse,
                                findShopWarehouseItemId: product_list.warehouse_detail[index].shelf.item,
                                findPurchaseUnitId: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                                findDotMfd: product_list.warehouse_detail[index].shelf.dot_mfd || null
                            }
                        );
                        if (findPreStockAdjust.length !== 0 && findPreStockAdjust.length !== 1) {
                            throw Error(`Variable findPreStockAdjust.length is not return 0 or 1`);
                        }
                        if (findPreStockAdjust.length === 1 && _.isNull(_.get(findPreStockAdjust[0], 'balance', null))) {
                            throw Error(`Variable findPreStockAdjust[0].balance is not found`);
                        }
                        const findPreStockAdjust_count_previous_stock = _.get(findPreStockAdjust[0], 'balance', 0);

                        // ADJ === 2
                        await utilSetShopStockProductBalance(
                            table_name,
                            product_id,
                            element.warehouse,
                            element.shelf.item,
                            element.shelf.purchase_unit_id,
                            objectDotMfd,
                            "add_balance_product",
                            element.shelf.amount,
                            {
                                transaction: transaction,
                                updated_by: request.id
                            }
                        );

                        const findPostStockAdjust = await utilGetCurrentProductShopStock(
                            table_name,
                            {
                                transaction: transaction,
                                findShopProductId: product_list.product_id,
                                findShopWarehouseId: product_list.warehouse_detail[index].warehouse,
                                findShopWarehouseItemId: product_list.warehouse_detail[index].shelf.item,
                                findPurchaseUnitId: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                                findDotMfd: product_list.warehouse_detail[index].shelf.dot_mfd || null
                            }
                        );
                        if (findPostStockAdjust.length !== 1) {
                            throw Error(`Variable findPostStockAdjust.length is not 1, due from Document type is INI`);
                        }

                        await utilSetShopInventoryMovementLog(
                            'INI',
                            {
                                shop_id: shop_table.id,
                                product_id: product_list.product_id,
                                doc_inventory_id: option_movementLog_doc_inventory_id,
                                doc_inventory_log_id: option_movementLog_doc_inventory_log_id,
                                stock_id: findPostStockAdjust[0].id,
                                warehouse_id: product_list.warehouse_detail[index].warehouse,
                                warehouse_item_id: product_list.warehouse_detail[index].shelf.item,
                                purchase_unit_id: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                                dot_mfd: product_list.warehouse_detail[index].shelf.dot_mfd || null,
                                count_previous_stock: +(findPreStockAdjust_count_previous_stock),
                                count_adjust_stock: +(product_list.warehouse_detail[index].shelf.amount),
                                details: { documentType: 'ADJ', ...option_movementLog_details, reasons: 'ADJ-Add' },
                                created_by: request.id,
                                created_date: currentDateTime
                            },
                            {
                                transaction: transaction
                            }
                        );
                    }

                    // ปรับลด=3
                    if ((status === 3 && _.get(product_list.warehouse_detail[index], 'status', null) === null) || _.get(product_list.warehouse_detail[index], 'status', null) === 3) {
                        const findPreStockAdjust = await utilGetCurrentProductShopStock(
                            table_name,
                            {
                                transaction: transaction,
                                findShopProductId: product_list.product_id,
                                findShopWarehouseId: product_list.warehouse_detail[index].warehouse,
                                findShopWarehouseItemId: product_list.warehouse_detail[index].shelf.item,
                                findPurchaseUnitId: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                                findDotMfd: product_list.warehouse_detail[index].shelf.dot_mfd || null
                            }
                        );
                        if (findPreStockAdjust.length !== 0 && findPreStockAdjust.length !== 1) {
                            throw Error(`Variable findPreStockAdjust.length is not return 0 or 1`);
                        }
                        if (findPreStockAdjust.length === 1 && _.isNull(_.get(findPreStockAdjust[0], 'balance', null))) {
                            throw Error(`Variable findPreStockAdjust[0].balance is not found`);
                        }
                        const findPreStockAdjust_count_previous_stock = _.get(findPreStockAdjust[0], 'balance', 0);

                        // ADJ === 3
                        await utilSetShopStockProductBalance(
                            table_name,
                            product_id,
                            element.warehouse,
                            element.shelf.item,
                            element.shelf.purchase_unit_id,
                            objectDotMfd,
                            "remove_balance_product",
                            element.shelf.amount,
                            {
                                transaction: transaction,
                                updated_by: request.id
                            }
                        );

                        const findPostStockAdjust = await utilGetCurrentProductShopStock(
                            table_name,
                            {
                                transaction: transaction,
                                findShopProductId: product_list.product_id,
                                findShopWarehouseId: product_list.warehouse_detail[index].warehouse,
                                findShopWarehouseItemId: product_list.warehouse_detail[index].shelf.item,
                                findPurchaseUnitId: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                                findDotMfd: product_list.warehouse_detail[index].shelf.dot_mfd || null
                            }
                        );
                        if (findPostStockAdjust.length !== 1) {
                            throw Error(`Variable findPostStockAdjust.length is not 1, due from Document type is INI`);
                        }

                        await utilSetShopInventoryMovementLog(
                            'INI',
                            {
                                shop_id: shop_table.id,
                                product_id: product_list.product_id,
                                doc_inventory_id: option_movementLog_doc_inventory_id,
                                doc_inventory_log_id: option_movementLog_doc_inventory_log_id,
                                stock_id: findPostStockAdjust[0].id,
                                warehouse_id: product_list.warehouse_detail[index].warehouse,
                                warehouse_item_id: product_list.warehouse_detail[index].shelf.item,
                                purchase_unit_id: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                                dot_mfd: product_list.warehouse_detail[index].shelf.dot_mfd || null,
                                count_previous_stock: +(findPreStockAdjust_count_previous_stock),
                                count_adjust_stock: (+(product_list.warehouse_detail[index].shelf.amount)) * -1,
                                details: { documentType: 'ADJ', ...option_movementLog_details, reasons: 'ADJ-Remove' },
                                created_by: request.id,
                                created_date: currentDateTime
                            },
                            {
                                transaction: transaction
                            }
                        );
                    }

                    // โอนในระหว่างคลัง=4
                    if (status === 4) {
                        if (warehouse_detail.length >= 2 && warehouse_detail.length % 2 === 0 && index !== 1 && (index === 0 || index % 2 !== 0)) {
                            const src_warehouse_detail = warehouse_detail[index];
                            const dest_warehouse_detail = warehouse_detail[index + 1];

                            const find_src_shopStock = await ShopStock(table_name).findOne({
                                where: {
                                    product_id: product_id
                                },
                                transaction: transaction
                            });
                            if (!find_src_shopStock || !_.isArray(find_src_shopStock.get('warehouse_detail'))) { throw Error('Src from ShopStock is not found'); }
                            const find_src_shop_warehouse = find_src_shopStock.get('warehouse_detail').findIndex((where) => isUUID(where.warehouse) && where.warehouse === src_warehouse_detail.warehouse);
                            if (find_src_shop_warehouse < 0) { throw Error('Src from ShopStock.warehouse_detail is not found'); }
                            const find_src_shop_warehouse_shelfItem = _.get(find_src_shopStock.get('warehouse_detail')[find_src_shop_warehouse], 'shelf', []).findIndex((where) => {
                                if (where.item !== src_warehouse_detail.shelf.item) { return false; }
                                if (objectDotMfd) {
                                    if (where.dot_mfd !== objectDotMfd) { return false; }
                                }
                                if (where.purchase_unit_id !== src_warehouse_detail.shelf.purchase_unit_id) { return false; }
                                return true;
                            });
                            if (find_src_shop_warehouse_shelfItem < 0) { throw Error('Src from ShopStock.warehouse_detail[].shelf.item is not found'); }

                            await find_src_shopStock.reload({ transaction: transaction });

                            await utilSetShopStockProductBalance(
                                table_name,
                                product_id,
                                src_warehouse_detail.warehouse,
                                src_warehouse_detail.shelf.item,
                                src_warehouse_detail.shelf.purchase_unit_id,
                                objectDotMfd,
                                "remove_balance_product",
                                src_warehouse_detail.shelf.amount,
                                {
                                    transaction: transaction,
                                    updated_by: request.id
                                }
                            );

                            await find_src_shopStock.reload({ transaction: transaction });

                            const find_dest_shop_warehouseIndex = find_src_shopStock.warehouse_detail.findIndex((where) => isUUID(where.warehouse) && where.warehouse === dest_warehouse_detail.warehouse);
                            if (find_dest_shop_warehouseIndex < 0) {
                                const warehouseDetail_currentData = find_src_shopStock.get('warehouse_detail') || [];
                                warehouseDetail_currentData.push({
                                    warehouse: dest_warehouse_detail.warehouse,
                                    shelf: []
                                });
                                await ShopStock(table_name).update(
                                    {
                                        warehouse_detail: warehouseDetail_currentData
                                    },
                                    {
                                        where: {
                                            id: find_src_shopStock.get('id')
                                        },
                                        transaction: transaction
                                    }
                                );
                                await find_src_shopStock.reload({ transaction: transaction });
                            }
                            const find_dest_shop_warehouse_shelfItemIndex = _.get(find_src_shopStock.warehouse_detail[find_dest_shop_warehouseIndex], 'shelf', []).findIndex((where) => {
                                if (where.item !== dest_warehouse_detail.shelf.item) { return false; }
                                if (objectDotMfd) {
                                    if (where.dot_mfd !== objectDotMfd) { return false; }
                                }
                                if (where.purchase_unit_id !== dest_warehouse_detail.shelf.purchase_unit_id) { return false; }
                                return true;
                            });
                            if (find_dest_shop_warehouse_shelfItemIndex < 0) {
                                const shelf_currentData = _.get(find_src_shopStock.warehouse_detail[find_dest_shop_warehouseIndex], 'shelf', []);
                                shelf_currentData.push({
                                    item: dest_warehouse_detail.shelf.item,
                                    purchase_unit_id: src_warehouse_detail.shelf.purchase_unit_id,
                                    dot_mfd: objectDotMfd ? objectDotMfd : undefined,
                                    balance: 0
                                });

                                const warehouseDetail_currentData = find_src_shopStock.warehouse_detail || [];
                                warehouseDetail_currentData[find_dest_shop_warehouseIndex] = {
                                    ...warehouseDetail_currentData[find_dest_shop_warehouseIndex],
                                    shelf: shelf_currentData
                                }

                                await ShopStock(table_name).update(
                                    {
                                        warehouse_detail: warehouseDetail_currentData
                                    },
                                    {
                                        where: {
                                            id: find_src_shopStock.get('id')
                                        },
                                        transaction: transaction
                                    }
                                );
                                await find_src_shopStock.reload({ transaction: transaction })
                            }

                            await find_src_shopStock.reload({ transaction: transaction });

                            await utilSetShopStockProductBalance(
                                table_name,
                                product_id,
                                dest_warehouse_detail.warehouse,
                                dest_warehouse_detail.shelf.item,
                                src_warehouse_detail.shelf.purchase_unit_id,
                                objectDotMfd,
                                "add_balance_product",
                                src_warehouse_detail.shelf.amount,
                                {
                                    transaction: transaction,
                                    updated_by: request.id
                                }
                            );
                        }
                    }

                    // ยกเลิก=0
                    if (status === 0) {
                        const findPreStockAdjust = await utilGetCurrentProductShopStock(
                            table_name,
                            {
                                transaction: transaction,
                                findShopProductId: product_list.product_id,
                                findShopWarehouseId: product_list.warehouse_detail[index].warehouse,
                                findShopWarehouseItemId: product_list.warehouse_detail[index].shelf.item,
                                findPurchaseUnitId: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                                findDotMfd: product_list.warehouse_detail[index].shelf.dot_mfd || null
                            }
                        );
                        if (findPreStockAdjust.length !== 0 && findPreStockAdjust.length !== 1) {
                            throw Error(`Variable findPreStockAdjust.length is not return 0 or 1`);
                        }
                        if (findPreStockAdjust.length === 1 && _.isNull(_.get(findPreStockAdjust[0], 'balance', null))) {
                            throw Error(`Variable findPreStockAdjust[0].balance is not found`);
                        }
                        const findPreStockAdjust_count_previous_stock = _.get(findPreStockAdjust[0], 'balance', 0);

                        await utilSetShopStockProductBalance(
                            table_name,
                            product_id,
                            element.warehouse,
                            element.shelf.item,
                            element.shelf.purchase_unit_id,
                            objectDotMfd,
                            "remove_balance_product",
                            element.shelf.amount,
                            {
                                transaction: transaction,
                                updated_by: request.id
                            }
                        );

                        await utilSetShopInventoryMovementLog(
                            'INI',
                            {
                                shop_id: shop_table.id,
                                product_id: product_list.product_id,
                                doc_inventory_id: option_movementLog_doc_inventory_id,
                                doc_inventory_log_id: option_movementLog_doc_inventory_log_id,
                                stock_id: findPreStockAdjust[0].id,
                                warehouse_id: product_list.warehouse_detail[index].warehouse,
                                warehouse_item_id: product_list.warehouse_detail[index].shelf.item,
                                purchase_unit_id: product_list.warehouse_detail[index].shelf.purchase_unit_id || null,
                                dot_mfd: product_list.warehouse_detail[index].shelf.dot_mfd || null,
                                count_previous_stock: +(findPreStockAdjust_count_previous_stock),
                                count_adjust_stock: (Math.abs(+(product_list.warehouse_detail[index].shelf.amount))) * -1,
                                details: { documentType: 'INI', reasons: 'Delete', ...option_movementLog_details },
                                created_by: request.id,
                                created_date: currentDateTime
                            },
                            {
                                transaction: transaction
                            }
                        );
                    }
                }
            }

            return "ok";
        }
    );

    return transactionResults;
}

const handleShopStockAll = async (request, res) => {
    const fnGetShopTable = async () => {
        const reqQuery_shop_id = (_.get(request, 'query.shop_id', null))
        if (isUUID(reqQuery_shop_id)) {
            const findShopBranches = await ShopsProfiles.findAll({
                where: {
                    id: reqQuery_shop_id
                }
            })
                .then(r =>
                    r.map(
                        el => {
                            return {
                                ...el.dataValues,
                                ...{
                                    shop_code_id: el.dataValues.shop_code_id.toLowerCase()
                                }
                            }
                        }
                    )
                );
            return findShopBranches[0];
        }
        else {
            return await utilCheckShopTableName(request);
        }
    };

    // request.id = '232bbbd7-5a70-46da-8af3-a71a7503b564'

    const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

    const shop_table = await fnGetShopTable();
    const table_name = shop_table.shop_code_id;

    if (Array.isArray(shop_table)) {
        return ({ status: 'success', data: 'this user is shop hq' })
    }

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    /**
     * @type {string}
     */
    let search = request.query.search || '';
    /**
     * @type {Array<string>}
     */
    const searchPaths = (request.query?.searchPaths || '').split(',').filter(w => w.length > 0);
    const sort = request.query.sort;
    const order = request.query.order;
    const status = utilGetIsUse(request.query.status);
    const type_group_id = request.query.type_group_id || '';
    const product_type_id = request.query.product_type_id || '';
    const product_brand_id = request.query.product_brand_id || '';
    const product_model_id = request.query.product_model_id || '';
    const filter_wyz_code = request.query.filter_wyz_code || false;
    const filter_available_balance = request.query.filter_available_balance || false;
    const min_balance = request.query.min_balance || 0;
    const max_balance = request.query.max_balance || undefined;
    const product_id = request.query.product_id
    const center_product_id = request.query.center_product_id
    let tags = (request.query.tags) ? request.query.tags.split(',') : []


    /**
     * A function to render literal search by CODE
     * @param {string} search
     * @return {Array<import("sequelize").literal>}
     */
    const renderSearchCode = (search) => {
        if (/^[0-9]+$/.test(search)) {
            return [
                ...requestLang.map(w => sequelize.Sequelize.literal(`REGEXP_REPLACE("ShopProduct->Product"."product_name"->>'${w}', '\\D', '', 'g') LIKE '%${search}%'`))
            ];
        }
        else {
            return [];
        }
    }

    const extractSearchProductDetailRule = () => {
        const storedSearchQueries = [];

        if (isUUID(type_group_id)) {
            storedSearchQueries.push(sequelize.Sequelize.literal(`"ShopProduct->Product->ProductType"."type_group_id" = '${type_group_id}'`));
        }
        if (isUUID(product_type_id)) {
            storedSearchQueries.push(sequelize.Sequelize.literal(`"ShopProduct->Product"."product_type_id" = '${product_type_id}'`));
        }
        if (isUUID(product_brand_id)) {
            storedSearchQueries.push(sequelize.Sequelize.literal(`"ShopProduct->Product"."product_brand_id" = '${product_brand_id}'`));
        }
        if (isUUID(product_model_id)) {
            storedSearchQueries.push(sequelize.Sequelize.literal(`"ShopProduct->Product"."product_model_id" = '${product_model_id}'`));
        }
        if (isUUID(product_id)) {
            storedSearchQueries.push(sequelize.Sequelize.literal(`"ShopProduct"."id" = '${product_id}'`));
        }
        if (isUUID(center_product_id)) {
            storedSearchQueries.push(sequelize.Sequelize.literal(`"ShopProduct"."product_id" = '${center_product_id}'`));
        }


        return storedSearchQueries;
    };

    /**
     * A function to render literal search by ProductBrandCodeId
     * @param {string} search
     * @return {Array<import("sequelize").literal>}
     */
    const extractSearchRule = (search = '') => {
        const storedSearchQueries = [];

        /**
         * ✅ "9984"
         */
        if (/^[0-9]+$/.test(search)) {
            requestLang.forEach(w => {
                if (w.length > 0) {
                    storedSearchQueries.push(sequelize.Sequelize.literal(`REGEXP_REPLACE("ShopProduct->Product"."product_name"->>'${w}', '[^0-9]', '', 'g') LIKE '${search}%'`));
                }
            });
        }

        /**
         * ✅ "MI 9984A"
         * ✅ "MI  9984A"
         */
        if (/^[a-zA-Z]{2,}\s+.*/.test(search)) {
            /**
             * @type {string[]}
             */
            const extractSearch = search
                .split(/\s/)
                .reduce((previousValue, currentValue) => {
                    if (currentValue.length > 0) {
                        previousValue.push(currentValue)
                    }
                    return previousValue;
                }, []);

            requestLang.forEach(whereLang => {
                storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."product_name"->>'${whereLang}' iLIKE '%${extractSearch.reduce((previousValue, currentValue) => {
                    return `${previousValue}%${currentValue}`
                }, '')
                    }%'`));
            });

        }

        /**
         * ✅ "Yokohama2656018"
         * ✅ "Yoko2656018"
         * ✅ "Yo2656018"
         * ✅ "YK2656018"
         */
        // if (/^[a-zA-Z]{2,}[0-9]+$/.test(search)) {
        //     const extractSearchBrand = search
        //         .match(/^[a-zA-Z]+/)[0];
        //     const extractSearchNumber = search
        //         .match(/[0-9]+$/)[0];
        //
        //     storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."product_code" iLIKE '%${extractSearchBrand}%'`));
        //     storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."master_path_code_id" iLIKE '%${extractSearchBrand}%'`));
        //
        //     storedSearchQueries.push({
        //         [Op.and]: [
        //             {
        //                 [Op.or]: [
        //                     sequelize.literal(`"ShopProduct->Product->ProductBrand"."brand_name"->>'th' iLIKE '%${extractSearchBrand}%'`),
        //                     sequelize.literal(`"ShopProduct->Product->ProductBrand"."brand_name"->>'en' iLIKE '%${extractSearchBrand}%'`),
        //                 ]
        //             },
        //             {
        //                 [Op.or]: [
        //                     ...requestLang.reduce((previousValue, currentValue) => {
        //                         if (currentValue) {
        //                             previousValue.push(sequelize.Sequelize.literal(`REGEXP_REPLACE("ShopProduct->Product"."product_name"->>'${currentValue}', '[^0-9]', '', 'g') LIKE '${extractSearchNumber}%'`));
        //                         }
        //                         return previousValue;
        //                     }, [])
        //                 ]
        //             }
        //         ]
        //     })
        // }

        /**
         * Something Else
         * ✅ "265/60R18"
         */
        /**
         * @type {string[]}
         */
        const extractSearch = search
            .split(/\s/)
            .reduce((previousValue, currentValue) => {
                if (currentValue.length > 0) {
                    previousValue.push(currentValue)
                }
                return previousValue;
            }, []);

        storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."product_code" iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
            if (currentValue.length > 0) {
                return `${previousValue}%${currentValue}`;
            }
            else {
                return previousValue;
            }
        }, '')
            }%'`));
        storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."custom_path_code_id" iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
            if (currentValue.length > 0) {
                return `${previousValue}%${currentValue}`;
            }
            else {
                return previousValue;
            }
        }, '')
            }%'`));
        storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."master_path_code_id" iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
            if (currentValue.length > 0) {
                return `${previousValue}%${currentValue}`;
            }
            else {
                return previousValue;
            }
        }, '')
            }%'`));
        requestLang.forEach(w => {
            storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."product_name"->>'${w}' iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
                if (currentValue.length > 0) {
                    return `${previousValue}%${currentValue}`;
                }
                else {
                    return previousValue;
                }
            }, '')
                }%'`));
        });

        return storedSearchQueries;
    };

    /**
     * A function to render literal search by Paths
     * @param {string} search
     * @param {Array<string>} searchPaths
     */
    const extractSearchPaths = (search = '', searchPaths = []) => {
        const storedSearchQueries = [];
        const storedOrderQueries = [];

        if (!search) { return { search: storedSearchQueries, order: storedOrderQueries }; }

        const extractSearch = `${search}`.replace(/(\s|%)+/, '%');

        searchPaths.forEach(element => {
            if (element === 'master_path_code_id') {
                storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."master_path_code_id" iLIKE '%${extractSearch}%'`));

                storedOrderQueries.push([sequelize.literal(`"ShopProduct->Product"."master_path_code_id" iLIKE '${extractSearch}'`), 'DESC']);
                storedOrderQueries.push([sequelize.literal(`"ShopProduct->Product"."master_path_code_id" iLIKE '${extractSearch}%'`), 'DESC']);
                storedOrderQueries.push([sequelize.literal(`"ShopProduct->Product"."master_path_code_id" iLIKE '%${extractSearch}%'`), 'DESC']);
            }
            if (element === 'product_name') {
                storedSearchQueries.push(sequelize.literal(`"ShopProduct->Product"."product_name"->>'th' iLIKE '%${extractSearch}%'`));

                storedOrderQueries.push([sequelize.literal(`"ShopProduct->Product"."product_name"->>'th' iLIKE '${extractSearch}'`), 'DESC']);
                storedOrderQueries.push([sequelize.literal(`"ShopProduct->Product"."product_name"->>'th' iLIKE '${extractSearch}%'`), 'DESC']);
                storedOrderQueries.push([sequelize.literal(`"ShopProduct->Product"."product_name"->>'th' iLIKE '%${extractSearch}%'`), 'DESC']);
            }
        });

        return { search: storedSearchQueries, order: storedOrderQueries };
    };

    const queryWhereAND = [];
    if (status && status.isuse >= 0) {
        queryWhereAND.push(sequelize.literal(`"ShopProduct"."isuse" = ${status.isuse}`));
    }
    if (filter_wyz_code) {
        queryWhereAND.push(sequelize.Sequelize.literal(`"ShopProduct->Product"."wyz_code" NOTNULL`));
    }
    if (filter_available_balance === true) {
        queryWhereAND.push(sequelize.Sequelize.literal(`balance::INTEGER > 0`));
    }


    if (tags.length > 0) {
        queryWhereAND.push(
            {
                [Op.or]: tags.map(el => { return sequelize.Sequelize.literal(` '${el}'=any("ShopProduct"."tags")`) })
            }
        )
    }

    let where_q = {
        ...{
            balance: {
                [Op.gte]: min_balance, ...(max_balance) ? { [Op.lte]: max_balance } : {}
            }
        },
        [Op.and]: [
            ...queryWhereAND,
            ...extractSearchProductDetailRule()
        ],
        [Op.or]: [
            ...(
                searchPaths.length === 0
                    ? [
                        sequelize.Sequelize.literal("\"ShopsProfile\".\"shop_name\"->>'th' iLIKE '%" + search + "%'"),
                        sequelize.Sequelize.literal("\"ShopsProfile\".\"shop_name\"->>'en' iLIKE '%" + search + "%'"),
                        sequelize.Sequelize.literal("\"ShopsProfile\".\"shop_code_id\" iLIKE '%" + search + "%'"),
                        sequelize.Sequelize.literal("\"ShopsProfile\".\"tax_code_id\" iLIKE '%" + search + "%'"),
                        ...extractSearchRule(search)
                    ]
                    : extractSearchPaths(search, searchPaths).search
            )

        ]
    }


    let shop_inventory = await ShopStock(table_name).findAll({
        order: [
            ...(
                searchPaths.length === 0
                    ? [
                        ...(!search ? [] : [[sequelize.literal(`"ShopProduct->Product"."master_path_code_id" iLIKE '%${search}%'`), 'DESC']]),
                        ...(!search ? [] : [[sequelize.literal(`"ShopProduct->Product"."product_name"->>'th' iLIKE '%${search}%'`), 'DESC']]),
                    ]
                    : extractSearchPaths(search, searchPaths).order
            ),
            [sort, order]
        ],
        include: [
            {
                model: ShopsProfiles, attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name']
            },
            {
                model: ShopProduct(table_name),
                attributes: {
                    include: [
                        [sequelize.Sequelize.literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopProduct\".\"tags\"))`), 'tags'],
                        [sequelize.Sequelize.literal(`
                            (coalesce((
                                SELECT
                                    X.product_cost AS product_cost_latest
                                FROM (
                                    SELECT
                                        "ShopInventoryImportLog".shop_id AS shop_id,
                                        "ShopInventoryImportLog".product_id AS shop_product_id,
                                        ("ShopWarehouseDetail".value->>'warehouse')::uuid AS shop_warehouse_id,
                                        ("ShopWarehouseDetail".value->'shelf'->>'item') AS shop_warehouse_shelf_item_id,
                                        nullif(btrim(("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')), '') AS dot_mfd,
                                        ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                        (coalesce(
                                                "ShopInventoryImportLog".details->>'price_grand_total',
                                                (
                                                    (
                                                        (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                            - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                    )::float
                                                )::text
                                        )::numeric(20,2) / "ShopInventoryImportLog".amount)::numeric(20,2) product_cost,
                                        "ShopInventoryImportLog".amount,
                                        (SELECT H.doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS H WHERE H.id = "ShopInventoryImportLog".doc_inventory_id) AS doc_date,
                                        "ShopInventoryImportLog".import_date,
                                        "ShopInventoryImportLog".created_date
                                    FROM app_shops_datas.dat_01hq0004_inventory_management_logs AS "ShopInventoryImportLog"
                                        CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouseDetail"
                                    WHERE "ShopInventoryImportLog".status = 1
                                      AND "ShopInventoryImportLog".amount > 0
                                      AND (coalesce(
                                            "ShopInventoryImportLog".details->>'price_grand_total',
                                            (
                                                (
                                                    (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                        - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                )::float
                                            )::text
                                      )::numeric(20,2) > 0)
                                      AND ((SELECT "ShopInventoryImportDoc".status
                                            FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc"
                                            WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id)
                                           = 1)
                                    ORDER BY
                                        (SELECT "ShopInventoryImportDoc".doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc" WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id) DESC,
                                        "ShopInventoryImportLog".import_date DESC,
                                        "ShopInventoryImportLog".created_date DESC
                                ) AS X
                                WHERE X.shop_id = "ShopStock".shop_id
                                    AND X.shop_product_id = "ShopStock".product_id
                                    AND X.shop_product_id = "ShopProduct".id
                                LIMIT 1
                            ),0)::numeric(20,2))
                        `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'product_cost'],
                        [sequelize.Sequelize.literal(`
                            (coalesce((
                                SELECT
                                    avg(coalesce(X.product_cost,0))::numeric(20,2) AS product_cost_average
                                FROM (
                                    SELECT
                                        "ShopInventoryImportLog".shop_id AS shop_id,
                                        "ShopInventoryImportLog".product_id AS shop_product_id,
                                        ("ShopWarehouseDetail".value->>'warehouse')::uuid AS shop_warehouse_id,
                                        ("ShopWarehouseDetail".value->'shelf'->>'item') AS shop_warehouse_shelf_item_id,
                                        nullif(btrim(("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')), '') AS dot_mfd,
                                        ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                        (coalesce(
                                                "ShopInventoryImportLog".details->>'price_grand_total',
                                                (
                                                    (
                                                        (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                            - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                    )::float
                                                )::text
                                        )::numeric(20,2) / "ShopInventoryImportLog".amount)::numeric(20,2) product_cost,
                                        "ShopInventoryImportLog".amount,
                                        (SELECT H.doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS H WHERE H.id = "ShopInventoryImportLog".doc_inventory_id) AS doc_date,
                                        "ShopInventoryImportLog".import_date,
                                        "ShopInventoryImportLog".created_date
                                    FROM app_shops_datas.dat_01hq0004_inventory_management_logs AS "ShopInventoryImportLog"
                                        CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouseDetail"
                                    WHERE "ShopInventoryImportLog".status = 1
                                      AND "ShopInventoryImportLog".amount > 0
                                      AND (coalesce(
                                            "ShopInventoryImportLog".details->>'price_grand_total',
                                            (
                                                (
                                                    (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                        - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                )::float
                                            )::text
                                      )::numeric(20,2) > 0)
                                      AND ((SELECT "ShopInventoryImportDoc".status
                                            FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc"
                                            WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id)
                                           = 1)
                                    ORDER BY
                                        (SELECT "ShopInventoryImportDoc".doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc" WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id) DESC,
                                        "ShopInventoryImportLog".import_date DESC,
                                        "ShopInventoryImportLog".created_date DESC
                                ) AS X
                                WHERE X.shop_id = "ShopStock".shop_id
                                    AND X.shop_product_id = "ShopStock".product_id
                                    AND X.shop_product_id = "ShopProduct".id
                                GROUP BY X.shop_id, X.shop_product_id
                            ),0)::numeric(20,2))
                        `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'product_cost_average'],
                        [sequelize.Sequelize.literal(`
                            (coalesce((
                                SELECT
                                    (sum(coalesce(X.shop_stock_amount,0)) * avg(coalesce(X.product_cost,0)))::numeric(20,2)
                                FROM (
                                    SELECT
                                        "ShopInventoryImportLog".shop_id AS shop_id,
                                        "ShopInventoryImportLog".product_id AS shop_product_id,
                                        ("ShopWarehouseDetail".value->>'warehouse')::uuid AS shop_warehouse_id,
                                        ("ShopWarehouseDetail".value->'shelf'->>'item') AS shop_warehouse_shelf_item_id,
                                        nullif(btrim(("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')), '') AS dot_mfd,
                                        ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                        (coalesce(
                                                "ShopInventoryImportLog".details->>'price_grand_total',
                                                (
                                                    (
                                                        (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                            - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                    )::float
                                                )::text
                                        )::numeric(20,2) / "ShopInventoryImportLog".amount)::numeric(20,2) product_cost,
                                        coalesce((
                                             SELECT "ShopStock".balance
                                             FROM (
                                                 SELECT
                                                    "ShopStock".id,
                                                    "ShopStock".shop_id,
                                                    "ShopStock".product_id AS shop_product_id,
                                                    ("ShopWarehouse".value->>'warehouse')::uuid AS shop_warehouse_id,
                                                    ("ShopWarehouseSelfItem".value->>'item') AS shop_warehouse_shelf_item_id,
                                                    nullif(btrim(("ShopWarehouseSelfItem".value->>'dot_mfd')),'') AS dot_mfd,
                                                    ("ShopWarehouseSelfItem".value->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                                    coalesce(("ShopWarehouseSelfItem".value->>'balance'), '0')::bigint AS balance
                                                FROM app_shops_datas.dat_01hq0004_stock_products_balances AS "ShopStock"
                                                    CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouse"
                                                    CROSS JOIN json_array_elements("ShopWarehouse".value->'shelf') AS "ShopWarehouseSelfItem"
                                                WHERE "ShopStock".product_id = "ShopInventoryImportLog".product_id
                                            ) AS "ShopStock"
                                            WHERE "ShopStock".shop_id = "ShopInventoryImportLog".shop_id
                                                AND "ShopStock".shop_product_id = "ShopInventoryImportLog".product_id
                                                AND "ShopStock".shop_warehouse_id = ("ShopWarehouseDetail".value ->> 'warehouse')::uuid
                                                AND ("ShopStock".shop_warehouse_shelf_item_id)::varchar = (("ShopWarehouseDetail".value ->'shelf'->>'item'))::varchar
                                                AND ("ShopStock".dot_mfd)::varchar = (nullif(btrim(("ShopWarehouseDetail".value -> 'shelf' ->> 'dot_mfd')),''))::varchar
                                                AND "ShopStock".purchase_unit_id = ("ShopWarehouseDetail".value ->'shelf'->> 'purchase_unit_id')::uuid
                                        ), 0)::BIGINT AS shop_stock_amount,
                                        "ShopInventoryImportLog".amount,
                                        (SELECT H.doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS H WHERE H.id = "ShopInventoryImportLog".doc_inventory_id) AS doc_date,
                                        "ShopInventoryImportLog".import_date,
                                        "ShopInventoryImportLog".created_date
                                    FROM app_shops_datas.dat_01hq0004_inventory_management_logs AS "ShopInventoryImportLog"
                                        CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouseDetail"
                                    WHERE "ShopInventoryImportLog".status = 1
                                      AND "ShopInventoryImportLog".amount > 0
                                      AND (coalesce(
                                            "ShopInventoryImportLog".details->>'price_grand_total',
                                            (
                                                (
                                                    (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                        - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                )::float
                                            )::text
                                      )::numeric(20,2) > 0)
                                      AND ((SELECT "ShopInventoryImportDoc".status
                                            FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc"
                                            WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id)
                                           = 1)
                                    ORDER BY
                                        (SELECT "ShopInventoryImportDoc".doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc" WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id) DESC,
                                        "ShopInventoryImportLog".import_date DESC,
                                        "ShopInventoryImportLog".created_date DESC
                                ) AS X
                                WHERE X.shop_id = "ShopStock".shop_id
                                    AND X.shop_product_id = "ShopStock".product_id
                                    AND X.shop_product_id = "ShopProduct".id
                                GROUP BY X.shop_id, X.shop_product_id
                            ),0)::numeric(20,2))
                        `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'product_cost_average_grand_total'],
                        [sequelize.Sequelize.literal(`
                            (coalesce((
                                SELECT 
                                    (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'retail', '0'))::numeric(20,2)
                                FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product 
                                WHERE sq_shop_product.id = "ShopStock".product_id
                                    AND sq_shop_product.id = "ShopProduct".id
                            ),0)::numeric(20,2))
                        `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'product_price'],
                        [sequelize.Sequelize.literal(`
                            (coalesce((
                                SELECT 
                                    (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'retail', '0'))::numeric(20,2)
                                FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product 
                                WHERE sq_shop_product.id = "ShopStock".product_id
                                    AND sq_shop_product.id = "ShopProduct".id
                            ),0)::numeric(20,2))
                        `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_product_price_retail'],
                        [sequelize.Sequelize.literal(`
                            (coalesce((
                                SELECT 
                                    (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'wholesale', '0'))::numeric(20,2)
                                FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product 
                                WHERE sq_shop_product.id = "ShopStock".product_id
                                    AND sq_shop_product.id = "ShopProduct".id
                            ),0)::numeric(20,2))
                        `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_product_price_wholesale'],
                    ]
                },
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'master_path_code_id', 'product_name', 'product_type_id', 'product_brand_id', 'product_model_id', 'other_details', 'wyz_code'],
                        include: [
                            {
                                model: ProductType,
                                attributes: ['id', 'code_id', 'type_name', 'type_group_id'],
                                include: [
                                    {
                                        model: ProductPurchaseUnitTypes,
                                        separate: true,
                                    }
                                ]
                            },
                            { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
                            { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
                            { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }
                        ],
                    }
                ]
            }
        ],
        attributes: {
            include: [
                [sequelize.Sequelize.literal(`
                    ( SELECT details->>'price'
                    FROM app_shops_datas.dat_${table_name}_inventory_management_logs
                    where product_id = "ShopStock".product_id
                    and status = 1
                    order by created_date desc
                    limit 1)
                `.replace(/(\s)+/ig, ' ')), 'product_cost'],
                [sequelize.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopStock\".\"created_by\" )"), 'created_by'],
                [sequelize.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopStock\".\"updated_by\" )"), 'updated_by']
            ]
        },
        required: false,
        where: where_q,
        limit: limit,
        offset: (page - 1) * limit
    })

    let length_data = await ShopStock(table_name).count({
        include: [
            {
                model: ShopsProfiles, attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name']
            },
            {
                model: ShopProduct(table_name),
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'master_path_code_id', 'product_name', 'product_type_id', 'product_brand_id', 'product_model_id', 'other_details'],
                        include: [
                            {
                                model: ProductType,
                                attributes: ['id', 'code_id', 'type_name', 'type_group_id'],
                                include: [
                                    {
                                        model: ProductPurchaseUnitTypes,
                                        separate: true,
                                    }
                                ]
                            },
                            { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
                            { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
                            { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }
                        ],
                    }
                ]
            }
        ],
        where: where_q
    })

    const pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: shop_inventory.length,
        totalCount: length_data,
        data: shop_inventory.map(w => w.toJSON())
    };

    //ปรับ format warehouse ให้คล้ายตอน add inventory front จะได้ใช้ง่าย
    pag.data = await Promise.all(pag.data.map(async (el) => {
        let data = el;
        let warehouse_detail_ = [];
        let product_cost_product_stocks = [];
        for (let index = 0; index < el.warehouse_detail.length; index++) {
            for (let index1 = 0; index1 < el.warehouse_detail[index].shelf.length; index1++) {
                /**
                 * objectDotMfd
                 * @type {{dot_mfd?: string}}
                 */
                const objectDotMfd = isNull(_.get(el.warehouse_detail[index].shelf[index1], 'dot_mfd', null)) ? {} : { dot_mfd: el.warehouse_detail[index].shelf[index1].dot_mfd };

                if (filter_available_balance === true) {
                    if (+el.warehouse_detail[index].shelf[index1].balance <= 0) {
                        continue;
                    }
                }

                if (filter_wyz_code === true) {
                    if (el.warehouse_detail[index].shelf[index1].purchase_unit_id !== '103790b2-e9ab-411b-91cf-a22dbf624cbc') {
                        continue;
                    }
                }

                warehouse_detail_.push({
                    warehouse: el.warehouse_detail[index].warehouse,
                    shelf: {
                        item: el.warehouse_detail[index].shelf[index1].item,
                        purchase_unit_id: el.warehouse_detail[index].shelf[index1].purchase_unit_id,
                        ...objectDotMfd,
                        balance: el.warehouse_detail[index].shelf[index1].balance,
                    }
                })
                const product_cost_product_stock = await utilGetShopProductAverageCost(
                    table_name,
                    {
                        shop_product_id: el.ShopProduct.id,
                        shop_warehouse_id: el.warehouse_detail[index].warehouse,
                        shop_warehouse_shelf_item_id: el.warehouse_detail[index].shelf[index1].item,
                        dot_mfd: objectDotMfd?.dot_mfd || null,
                        purchase_unit_id: el.warehouse_detail[index].shelf[index1].purchase_unit_id || null,
                    }
                );
                if (product_cost_product_stock) {
                    product_cost_product_stocks.push(product_cost_product_stock)
                }

            }
        }
        data.warehouse_detail = warehouse_detail_
        data.product_cost_product_stocks = product_cost_product_stocks
        return data
    }));
    pag.data.forEach(element => {
        // data["0"].warehouse_detail["1"].shelf.dot_mfd
        if (_.isArray(element?.warehouse_detail)) {
            element.warehouse_detail = _.orderBy(
                element.warehouse_detail,
                [
                    function (o) {
                        if (o.shelf?.dot_mfd === undefined) {
                            return Number('0000');
                        }
                        return Number(o.shelf?.dot_mfd)
                    },
                    function (o) {
                        return Number(o.shelf?.balance || 0)
                    }
                ],
                [
                    'asc',
                    'asc'
                ]
            )
        }
    });

    await handleSaveLog(request, [['get ShopInventoryBalance all'], ''])
    return ({ status: 'success', data: pag })

}

const handleShopStockById = async (request, res) => {

    // request.id = '90f5a0a9-a111-49ee-94df-c5623811b6cc'

    const fnGetShopTable = async () => {
        const reqQuery_shop_id = (_.get(request, 'query.shop_id', null))
        if (isUUID(reqQuery_shop_id)) {
            const findShopBranches = await ShopsProfiles.findAll({
                where: {
                    id: reqQuery_shop_id
                }
            })
                .then(r =>
                    r.map(
                        el => {
                            return {
                                ...el.dataValues,
                                ...{
                                    shop_code_id: el.dataValues.shop_code_id.toLowerCase()
                                }
                            }
                        }
                    )
                );
            return findShopBranches[0];
        }
        else {
            return await utilCheckShopTableName(request);
        }
    };

    const filter_wyz_code = request.query.filter_wyz_code || false;

    const shop_table = await fnGetShopTable();
    let table_name = shop_table.shop_code_id

    let ShopInventory_id = request.params.id

    let shop_inventory = await ShopStock(table_name).findAll({
        where: {
            id: ShopInventory_id,
            ...(
                filter_wyz_code ?
                    {
                        [Op.and]: [
                            sequelize.Sequelize.literal(`"ShopProduct->Product"."wyz_code" NOTNULL`)
                        ]
                    }
                    : {}
            )
        },
        include: [
            {
                model: ShopsProfiles, attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name']
            },
            {
                model: ShopProduct(table_name),
                include: [
                    {
                        model: Product, attributes: ['id', 'master_path_code_id', 'product_name', 'product_type_id', 'product_brand_id', 'product_model_id', 'other_details', 'wyz_code'],
                        include: [
                            {
                                model: ProductType, attributes: ['id', 'code_id', 'type_name', 'type_group_id'],
                                include: {
                                    model: ProductPurchaseUnitTypes,
                                    separate: true,
                                }
                            },
                            { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
                            { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
                            { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }],
                    }
                ]
            }
        ],
        attributes: {
            include: [
                [sequelize.Sequelize.literal(`
                   ( SELECT details->>'price'
                    FROM app_shops_datas.dat_${table_name}_inventory_management_logs
                    where product_id = "ShopStock".product_id
                    and status = 1
                    order by created_date desc
                    limit 1)
                `.replace(/(\s)+/ig, ' ')), 'product_cost'],
                [sequelize.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopStock\".\"created_by\" )"), 'created_by'],
                [sequelize.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopStock\".\"updated_by\" )"), 'updated_by']
            ]
        },
        required: false,
    })
    shop_inventory = shop_inventory.map(element => element.toJSON());

    //ปรับ format warehouse ให้คล้ายตอน add inventory front จะได้ใช้ง่าย
    shop_inventory = await Promise.all(shop_inventory.map(async (el) => {
        let data = el
        let warehouse_detail_ = []
        let product_cost_product_stocks = []
        for (let index = 0; index < el.warehouse_detail.length; index++) {
            for (let index1 = 0; index1 < el.warehouse_detail[index].shelf.length; index1++) {
                /**
                 * objectDotMfd
                 * @type {{dot_mfd?: string}}
                 */
                const objectDotMfd = isNull(_.get(el.warehouse_detail[index].shelf[index1], 'dot_mfd', null)) ? {} : { dot_mfd: el.warehouse_detail[index].shelf[index1].dot_mfd };

                if (filter_wyz_code === true) {
                    if (el.warehouse_detail[index].shelf[index1].purchase_unit_id !== '103790b2-e9ab-411b-91cf-a22dbf624cbc') {
                        continue;
                    }
                }

                warehouse_detail_.push({
                    warehouse: el.warehouse_detail[index].warehouse,
                    shelf: {
                        item: el.warehouse_detail[index].shelf[index1].item,
                        purchase_unit_id: el.warehouse_detail[index].shelf[index1].purchase_unit_id,
                        ...objectDotMfd,
                        balance: el.warehouse_detail[index].shelf[index1].balance,
                    }
                })
                const product_cost_product_stock = await utilGetShopProductAverageCost(
                    table_name,
                    {
                        shop_product_id: el.ShopProduct.id,
                        shop_warehouse_id: el.warehouse_detail[index].warehouse,
                        shop_warehouse_shelf_item_id: el.warehouse_detail[index].shelf[index1].item,
                        dot_mfd: objectDotMfd?.dot_mfd || null,
                        purchase_unit_id: el.warehouse_detail[index].shelf[index1].purchase_unit_id || null,
                    }
                );
                if (product_cost_product_stock) {
                    product_cost_product_stocks.push(product_cost_product_stock)
                }
            }
        }
        data.warehouse_detail = warehouse_detail_
        data.product_cost_product_stocks = product_cost_product_stocks
        return data
    }));
    shop_inventory.forEach(element => {
        // shop_inventory["0"].warehouse_detail["1"].shelf.dot_mfd
        if (_.isArray(element?.warehouse_detail)) {
            element.warehouse_detail = _.orderBy(
                element.warehouse_detail,
                [
                    function (o) {
                        if (o.shelf?.dot_mfd === undefined) {
                            return Number('0000');
                        }
                        return Number(o.shelf?.dot_mfd)
                    },
                    function (o) {
                        return Number(o.shelf?.balance || 0)
                    }
                ],
                [
                    'asc',
                    'asc'
                ]
            )
        }
    });

    await handleSaveLog(request, [['get ShopInventoryBalance byid'], ''])
    return utilSetFastifyResponseJson("success", shop_inventory)

}

const handleShopStockReportAllStock = async (request, reply, options = {}) => {
    const handlerName = 'GET ShopStock.Report.AllStock';

    try {
        const fnGetShopTable = async () => {
            const reqQuery_shop_id = (_.get(request, 'query.shop_id', null))
            if (isUUID(reqQuery_shop_id)) {
                const findShopBranches = await ShopsProfiles.findAll({
                    where: {
                        id: reqQuery_shop_id
                    }
                })
                    .then(r =>
                        r.map(
                            el => {
                                return {
                                    ...el.dataValues,
                                    ...{
                                        shop_code_id: el.dataValues.shop_code_id.toLowerCase()
                                    }
                                }
                            }
                        )
                    );
                return findShopBranches[0];
            }
            else {
                return await utilCheckShopTableName(request);
            }
        };

        const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await fnGetShopTable();

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const search = request.query.search || '';

        const type_group_id = request.query.type_group_id || '';
        const product_type_id = request.query.product_type_id || '';
        const product_brand_id = request.query.product_brand_id || '';
        const product_model_id = request.query.product_model_id || '';

        /**
         * 0 = ไม่แยก dot , 1 = แยก dot
         * @type {0|1}
         */
        const split_dot = request.query.dot || 0;

        const min_balance = request.query.min_balance || 0;
        const max_balance = request.query.max_balance || null;

        /**
         * 0 = ไม่กรอง Stock ที่มี 0 ออก, 1 = กรอง Stock ที่มี 0 ออก
         * @type {0|1}
         */
        const filter_available_balance = request.query.filter_available_balance || 0;


        const extractSearchBalanceRule = () => {
            const storedSearchQueries = [];

            if (_.isSafeInteger(min_balance) && min_balance >= 0) {
                if (_.isSafeInteger(max_balance) && max_balance >= 0 && max_balance >= min_balance) {
                    return `AND stock.balance BETWEEN ${min_balance} AND ${max_balance}`;
                }
                else {
                    return `AND stock.balance >= ${min_balance}`;
                }
            }

            return '';
        };

        const extractSearchRule = (search = '') => {
            const storedSearchQueries = [];

            /**
             * Search product name
             */
            if (search && search.length > 0) {
                requestLang.forEach(whereLang => {
                    if (whereLang.length > 0) {
                        storedSearchQueries.push(`"product_center"."product_name"->>'${whereLang}' iLIKE '%${search.replace(/[\s\t\r]/ig, '%')}%'`);
                    }
                });
            }

            /**
             * ✅ "9984"
             */
            if (/^[0-9]+$/.test(search)) {
                requestLang.forEach(whereLang => {
                    if (whereLang.length > 0) {
                        storedSearchQueries.push(`REGEXP_REPLACE("product_center"."product_name"->>'${whereLang}', '[^0-9]', '', 'g') LIKE '${search}%'`);
                    }
                });
            }

            /**
             * Something Else
             * ✅ "265/60R18"
             */
            /**
             * @type {string[]}
             */
            const extractSearch = search
                .split(/\s/)
                .reduce((previousValue, currentValue) => {
                    if (currentValue.length > 0) {
                        previousValue.push(currentValue)
                    }
                    return previousValue;
                }, []);
            storedSearchQueries.push(`"product_center"."custom_path_code_id" iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
                if (currentValue.length > 0) {
                    return `${previousValue}%${currentValue}`;
                }
                else {
                    return previousValue;
                }
            }, '')
                }%'`);
            storedSearchQueries.push(`"product_center"."master_path_code_id" iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
                if (currentValue.length > 0) {
                    return `${previousValue}%${currentValue}`;
                }
                else {
                    return previousValue;
                }
            }, '')
                }%'`);

            return '(' + storedSearchQueries.reduce((previousValue, currentValue, currentIndex) => {
                if (currentIndex === 0) {
                    return previousValue + ` ${currentValue} `;
                }
                return previousValue + ` OR ${currentValue}`;
            }, '') + ')';
        };

        let data = await sequelize.query(
            `
            WITH
                CTE_ShopInventoryImport AS (
                    SELECT
                        "ShopInventoryImportLog".shop_id AS shop_id,
                        "ShopInventoryImportLog".product_id AS shop_product_id,
                        ("ShopWarehouseDetail".value->>'warehouse')::uuid AS shop_warehouse_id,
                        ("ShopWarehouseDetail".value->'shelf'->>'item') AS shop_warehouse_shelf_item_id,
                        nullif(btrim(("ShopWarehouseDetail".value->'shelf'->>'dot_mfd')), '') AS dot_mfd,
                        ("ShopWarehouseDetail".value->'shelf'->>'purchase_unit_id')::uuid AS purchase_unit_id,
                        (coalesce(
                                "ShopInventoryImportLog".details->>'price_grand_total',
                                (
                                    (
                                        (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                            - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                    )::float
                                )::text
                        )::numeric(20,2) / "ShopInventoryImportLog".amount)::numeric(20,2) product_cost,
                        coalesce((
                             SELECT "ShopStock".balance
                             FROM (
                                 SELECT
                                    "ShopStock".id,
                                    "ShopStock".shop_id,
                                    "ShopStock".product_id AS shop_product_id,
                                    ("ShopWarehouse".value->>'warehouse')::uuid AS shop_warehouse_id,
                                    ("ShopWarehouseSelfItem".value->>'item') AS shop_warehouse_shelf_item_id,
                                    nullif(btrim(("ShopWarehouseSelfItem".value->>'dot_mfd')),'') AS dot_mfd,
                                    ("ShopWarehouseSelfItem".value->>'purchase_unit_id')::uuid AS purchase_unit_id,
                                    coalesce(("ShopWarehouseSelfItem".value->>'balance'), '0')::bigint AS balance
                                FROM app_shops_datas.dat_01hq0004_stock_products_balances AS "ShopStock"
                                    CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouse"
                                    CROSS JOIN json_array_elements("ShopWarehouse".value->'shelf') AS "ShopWarehouseSelfItem"
                                WHERE "ShopStock".product_id = "ShopInventoryImportLog".product_id
                            ) AS "ShopStock"
                            WHERE "ShopStock".shop_id = "ShopInventoryImportLog".shop_id
                                AND "ShopStock".shop_product_id = "ShopInventoryImportLog".product_id
                                AND "ShopStock".shop_warehouse_id = ("ShopWarehouseDetail".value ->> 'warehouse')::uuid
                                AND ("ShopStock".shop_warehouse_shelf_item_id)::varchar = ("ShopWarehouseDetail".value ->'shelf'->>'item')::varchar
                                AND ("ShopStock".dot_mfd)::varchar = (nullif(btrim(("ShopWarehouseDetail".value -> 'shelf' ->> 'dot_mfd')),''))::varchar
                                AND "ShopStock".purchase_unit_id = ("ShopWarehouseDetail".value -> 'shelf' ->> 'purchase_unit_id')::uuid
                        ), 0)::BIGINT AS shop_stock_amount,
                        "ShopInventoryImportLog".amount,
                        (SELECT H.doc_date FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS H WHERE H.id = "ShopInventoryImportLog".doc_inventory_id) AS doc_date,
                        "ShopInventoryImportLog".import_date,
                        "ShopInventoryImportLog".created_date
                    FROM app_shops_datas.dat_01hq0004_inventory_management_logs AS "ShopInventoryImportLog"
                        CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouseDetail"
                    WHERE "ShopInventoryImportLog".status = 1
                      AND "ShopInventoryImportLog".amount > 0
                      AND (coalesce(
                                "ShopInventoryImportLog".details->>'price_grand_total',
                                (
                                    (
                                        (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                            - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                    )::float
                                )::text
                          )::numeric(20,2) > 0)
                      AND ((SELECT "ShopInventoryImportDoc".status
                            FROM app_shops_datas.dat_01hq0004_inventory_transaction_doc AS "ShopInventoryImportDoc"
                            WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id)
                           = 1)
                ),
                CTE_ShopStock AS (
                    SELECT
                        stock.shop_id,
                        stock.product_id AS shop_product_id,
                        ware.id AS shop_warehouse_id,
                        shelfs->>'code' AS shop_warehouse_shelf_item_id,
                        nullif(btrim(stock_shelf->>'dot_mfd'), '') AS dot_mfd,
                        ware.name->>'th' as shop_warehouse_name,
                        shelfs->'name'->>'th' as shop_warehouse_shelf_item_name,
                        (sum(((coalesce(nullif(nullif(stock_shelf->>'balance', 'null'), 'undefined'), '0')))::BIGINT))::BIGINT AS balance
                    FROM app_shops_datas.dat_01hq0004_stock_products_balances as stock
                    CROSS JOIN LATERAL json_array_elements(stock.warehouse_detail) AS stock_warehouse
                    INNER JOIN app_shops_datas.dat_01hq0004_warehouses ware ON (stock_warehouse->>'warehouse')::uuid = ware.id
                    CROSS JOIN LATERAL json_array_elements(stock_warehouse->'shelf') AS stock_shelf
                    INNER JOIN json_array_elements(ware.shelf) as shelfs ON stock_shelf->>'item' = shelfs->>'code'
                    GROUP BY
                        stock.shop_id,
                        stock.product_id,
                        ware.id,
                        shelfs->>'code',
                        ware.name->>'th',
                        shelfs->'name'->>'th',
                        nullif(btrim(stock_shelf->>'dot_mfd'), '')
                ),
                CTE_Have_DOT_ShopStock AS (
                    SELECT
                        X.shop_id,
                        X.shop_product_id,
                        X.shop_warehouse_id,
                        X.shop_warehouse_shelf_item_id,
                        X.dot_mfd,
                        X.shop_warehouse_name,
                        X.shop_warehouse_shelf_item_name,
                        (SELECT (avg(coalesce(Y.product_cost, 0)))::numeric(20,2) FROM CTE_ShopInventoryImport AS Y WHERE Y.shop_id = X.shop_id AND Y.shop_product_id = X.shop_product_id AND Y.shop_warehouse_id = X.shop_warehouse_id AND Y.shop_warehouse_shelf_item_id = X.shop_warehouse_shelf_item_id AND Y.dot_mfd = X.dot_mfd GROUP BY Y.shop_id, Y.shop_product_id, Y.shop_warehouse_id, Y.shop_warehouse_shelf_item_id, Y.dot_mfd) AS average_product_cost,
                        (SELECT (sum(coalesce(Y.shop_stock_amount, 0)) * avg(coalesce(Y.product_cost, 0)))::numeric(20,2) FROM CTE_ShopInventoryImport AS Y WHERE Y.shop_id = X.shop_id AND Y.shop_product_id = X.shop_product_id AND Y.shop_warehouse_id = X.shop_warehouse_id AND Y.shop_warehouse_shelf_item_id = X.shop_warehouse_shelf_item_id AND Y.dot_mfd = X.dot_mfd GROUP BY Y.shop_id, Y.shop_product_id, Y.shop_warehouse_id, Y.shop_warehouse_shelf_item_id, Y.dot_mfd) AS product_cost_average_grand_total,
                        (SELECT Y.product_cost FROM CTE_ShopInventoryImport AS Y WHERE Y.shop_id = X.shop_id AND Y.shop_product_id = X.shop_product_id AND Y.shop_warehouse_id = X.shop_warehouse_id AND Y.shop_warehouse_shelf_item_id = X.shop_warehouse_shelf_item_id AND Y.dot_mfd = X.dot_mfd ORDER BY Y.doc_date DESC, Y.import_date DESC, Y.created_date DESC LIMIT 1) AS latest_product_cost,
                        (SELECT (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'retail', '0'))::numeric(20,2) FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product WHERE sq_shop_product.id = X.shop_product_id) AS latest_product_price_retail,
                        (SELECT (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'wholesale', '0'))::numeric(20,2) FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product WHERE sq_shop_product.id = X.shop_product_id) AS latest_product_price_wholesale,
                        X.balance
                    FROM CTE_ShopStock AS X
                ),
                CTE_No_DOT_ShopStock AS (
                    SELECT
                        X.shop_id,
                        X.shop_product_id,
                        X.shop_warehouse_id,
                        X.shop_warehouse_shelf_item_id,
                        X.shop_warehouse_name,
                        X.shop_warehouse_shelf_item_name,
                        (SELECT (avg(coalesce(Y.product_cost, 0)))::numeric(20,2) FROM CTE_ShopInventoryImport AS Y WHERE Y.shop_id = X.shop_id AND Y.shop_product_id = X.shop_product_id AND Y.shop_warehouse_id = X.shop_warehouse_id AND Y.shop_warehouse_shelf_item_id = X.shop_warehouse_shelf_item_id GROUP BY Y.shop_id, Y.shop_product_id, Y.shop_warehouse_id, Y.shop_warehouse_shelf_item_id) AS average_product_cost,
                        (SELECT (sum(coalesce(Y.shop_stock_amount,0)) * avg(coalesce(Y.product_cost,0)))::numeric(20,2) FROM CTE_ShopInventoryImport AS Y WHERE Y.shop_id = X.shop_id AND Y.shop_product_id = X.shop_product_id AND Y.shop_warehouse_id = X.shop_warehouse_id AND Y.shop_warehouse_shelf_item_id = X.shop_warehouse_shelf_item_id GROUP BY Y.shop_id, Y.shop_product_id, Y.shop_warehouse_id, Y.shop_warehouse_shelf_item_id) AS product_cost_average_grand_total,
                        (SELECT Y.product_cost FROM CTE_ShopInventoryImport AS Y WHERE Y.shop_id = X.shop_id AND Y.shop_product_id = X.shop_product_id AND Y.shop_warehouse_id = X.shop_warehouse_id AND Y.shop_warehouse_shelf_item_id = X.shop_warehouse_shelf_item_id ORDER BY Y.doc_date DESC, Y.import_date DESC, Y.created_date DESC LIMIT 1) AS latest_product_cost,
                        (SELECT (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'retail', '0'))::numeric(20,2) FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product WHERE sq_shop_product.id = X.shop_product_id) AS latest_product_price_retail,
                        (SELECT (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'wholesale', '0'))::numeric(20,2) FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product WHERE sq_shop_product.id = X.shop_product_id) AS latest_product_price_wholesale,
                        (sum(X.balance))::BIGINT AS balance
                    FROM CTE_ShopStock AS X
                    GROUP BY
                        X.shop_id,
                        X.shop_product_id,
                        X.shop_warehouse_id,
                        X.shop_warehouse_shelf_item_id,
                        X.shop_warehouse_name,
                        X.shop_warehouse_shelf_item_name
                ),
                CTE_Have_DOT_ShopStock_Report AS (
                    SELECT
                        product_center.master_path_code_id AS "รหัสสินค้า",
                        product_center.product_name->>'th' AS "ชื่อสินค้า",
                        brand.brand_name->>'th' AS "ยี่ห้อสินค้า",
                        model.model_name->>'th' AS "รุ่นสินค้า",
                        stock.shop_warehouse_name AS "คลังสินค้า",
                        stock.shop_warehouse_shelf_item_name AS "ชั้นสินค้า",
                        coalesce(stock.dot_mfd, '') AS "DOT",
                        coalesce(stock.latest_product_cost,0)::numeric(20,2) AS "ราคาทุนล่าสุด/หน่วย",
                        coalesce(stock.average_product_cost,0)::numeric(20,2) AS "ราคาทุนเฉลี่ย/หน่วย",
                        coalesce(stock.product_cost_average_grand_total,0)::numeric(20,2) AS "ราคาทุนเฉลี่ยสุทธิ",
                        coalesce(stock.latest_product_price_retail,0)::numeric(20,2) AS "ราคาขายปลีก/หน่วย",
                        coalesce(stock.latest_product_price_wholesale,0)::numeric(20,2) AS "ราคาขายส่ง/หน่วย",
                        coalesce(stock.balance,0)::bigint AS "จำนวนสินค้าคงเหลือ (QTY)"
                    FROM CTE_Have_DOT_ShopStock AS stock
                        JOIN app_shops_datas.dat_01hq0004_products AS product ON product.id = stock.shop_product_id
                        JOIN app_datas.dat_products as product_center on product_center.id = product.product_id
                        LEFT JOIN master_lookup.mas_product_brands as brand on brand.id = product_center.product_brand_id
                        LEFT JOIN master_lookup.mas_product_model_types as model on model.id = product_center.product_model_id
                        LEFT JOIN master_lookup.mas_product_types as productTypeModel on productTypeModel.id = model.product_type_id
                        LEFT JOIN master_lookup.mas_product_types as productType on productType.id = product_center.product_type_id
                    WHERE 1=1
                        ${(search.length > 0) ? ` AND ${extractSearchRule(search)} ` : ``}
                        ${(!isUUID(type_group_id)) ? '' : `AND (productType.type_group_id = '${type_group_id}' OR productTypeModel.type_group_id = '${type_group_id}')`}
                        ${(!isUUID(product_type_id)) ? '' : `AND product_center.product_type_id = '${product_type_id}'`}
                        ${(!isUUID(product_brand_id)) ? '' : `AND product_center.product_brand_id = '${product_brand_id}'`}
                        ${(!isUUID(product_model_id)) ? '' : `AND product_center.product_model_id = '${product_model_id}'`}
                        ${extractSearchBalanceRule()}
                    ORDER BY product_center.master_path_code_id
                ),
                CTE_No_DOT_ShopStock_Report AS (
                    SELECT
                        product_center.master_path_code_id AS "รหัสสินค้า",
                        product_center.product_name->>'th' AS "ชื่อสินค้า",
                        brand.brand_name->>'th' AS "ยี่ห้อสินค้า",
                        model.model_name->>'th' AS "รุ่นสินค้า",
                        stock.shop_warehouse_name AS "คลังสินค้า",
                        stock.shop_warehouse_shelf_item_name AS "ชั้นสินค้า",
                        coalesce(stock.latest_product_cost,0)::numeric(20,2) AS "ราคาทุนล่าสุด/หน่วย",
                        coalesce(stock.average_product_cost,0)::numeric(20,2) AS "ราคาทุนเฉลี่ย/หน่วย",
                        coalesce(stock.product_cost_average_grand_total,0)::numeric(20,2) AS "ราคาทุนเฉลี่ยสุทธิ",
                        coalesce(stock.latest_product_price_retail,0)::numeric(20,2) AS "ราคาขายปลีก/หน่วย",
                        coalesce(stock.latest_product_price_wholesale,0)::numeric(20,2) AS "ราคาขายส่ง/หน่วย",
                        coalesce(stock.balance,0)::bigint AS "จำนวนสินค้าคงเหลือ (QTY)"
                    FROM CTE_No_DOT_ShopStock AS stock
                        JOIN app_shops_datas.dat_01hq0004_products AS product ON product.id = stock.shop_product_id
                        JOIN app_datas.dat_products as product_center on product_center.id = product.product_id
                        LEFT JOIN master_lookup.mas_product_brands as brand on brand.id = product_center.product_brand_id
                        LEFT JOIN master_lookup.mas_product_model_types as model on model.id = product_center.product_model_id
                        LEFT JOIN master_lookup.mas_product_types as productTypeModel on productTypeModel.id = model.product_type_id
                        LEFT JOIN master_lookup.mas_product_types as productType on productType.id = product_center.product_type_id
                    WHERE 1=1
                        ${(search.length > 0) ? ` AND ${extractSearchRule(search)} ` : ``}
                        ${(!isUUID(type_group_id)) ? '' : `AND (productType.type_group_id = '${type_group_id}' OR productTypeModel.type_group_id = '${type_group_id}')`}
                        ${(!isUUID(product_type_id)) ? '' : `AND product_center.product_type_id = '${product_type_id}'`}
                        ${(!isUUID(product_brand_id)) ? '' : `AND product_center.product_brand_id = '${product_brand_id}'`}
                        ${(!isUUID(product_model_id)) ? '' : `AND product_center.product_model_id = '${product_model_id}'`}
                        ${extractSearchBalanceRule()}
                    ORDER BY product_center.master_path_code_id
                )
            SELECT *
            FROM ${split_dot === 1 ? 'CTE_Have_DOT_ShopStock_Report' : 'CTE_No_DOT_ShopStock_Report'}
            `
                .replace(/(01hq0004)/ig, table_name)
                .replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                transaction: request?.transaction || options?.transaction || null,
                raw: false
            }
        );

        if (filter_available_balance === 1) {
            data = data.filter(w => w['จำนวนสินค้าคงเหลือ (QTY)'] > 0);
        }

        if (request.query.export_format === 'xlsx') {
            if (data.length === 0) {
                data = [
                    {
                        'รหัสสินค้า': null,
                        'ชื่อสินค้า': null,
                        'ยี่ห้อสินค้า': null,
                        'รุ่นสินค้า': null,
                        'คลังสินค้า': null,
                        'ชั้นสินค้า': null
                    }
                ]
                if (split_dot !== 0) {
                    data[0].DOT = null
                }
                data[0]['ราคาทุนเฉลี่ย/หน่วย'] = null
                data[0]['ราคาทุนล่าสุด/หน่วย'] = null
                data[0]['ราคาทุนเฉลี่ยสุทธิ'] = null
                data[0]['ราคาขายปลีก/หน่วย'] = null
                data[0]['ราคาขายส่ง/หน่วย'] = null
                data[0]['จำนวนสินค้าคงเหลือ (QTY)'] = null
            }
            var ws = await XLSX.utils.json_to_sheet(data, { origin: 0 });
            for (i in ws) {
                if (typeof (ws[i]) != "object") continue;
                let cell = XLSX.utils.decode_cell(i);
                ws[i].s = { // styling for all cells
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                    }
                }
                if (cell.r === 0) {
                    ws[i].s = { // styling for all cells
                        font: {
                            name: "TH SarabunPSK",
                            sz: 18,
                            bold: true
                        }
                    }
                }
            }


            var wscols = [
                { width: 20 }, // A
                { width: 40 }, // B
                { width: 20 }, // C
                { width: 20 }, // D
                { width: 20 }, // E
                { width: 20 }, // F
                { width: 20 }, // G
                { width: 20 }, // H
                { width: 20 }, // I
                { width: 20 }, // J
                { width: 20 }, // K
                { width: 20 }, // L
                { width: 20 }, // M
            ]

            ws['!cols'] = wscols

            var file_name = uuid4()
            // var file_name = 'product_stock'

            var wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

            await handleSaveLog(request, [[handlerName], ""]);

            return utilSetFastifyResponseJson("success", file_name + '.xlsx');
        }

        await handleSaveLog(request, [[handlerName], ""]);

        return utilSetFastifyResponseJson("success", data);
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = {
    handleShopStockAdd,
    handleShopStockAll,
    handleShopStockById,
    handleShopStockReportAllStock
}