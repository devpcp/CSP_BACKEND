const _ = require("lodash");
const { Transaction, Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilGetFastifyRequestShopCodeId = require("../utils/util.GetFastifyRequestShopCodeId");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilSetShopStockProductBalance = require("../utils/util.SetShopStockProductBalance");
const utilSetShopInventoryMovementLog = require("../utils/util.SetShopInventoryMovementLog");
const utilGetCurrentProductShopStock = require("../utils/util.GetCurrentProductShopStock");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const {
    config_document_type_ids_no_modify_product_stock,
} = require('../config');

const db = require("../db");
const modelShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;


const subService_isWarehouseModified = async (request, tableName, transaction) => {
    if (!_.isPlainObject(_.get(request.body, "warehouse_detail", null))) {
        return false;
    }
    else {
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = await utilGetFastifyRequestShopCodeId(request);

        /**
         * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
         */
        const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

        const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
            where: { id: request.params.id },
            transaction: transaction
        });

        const reqWarehouse = _.get(request.body, "warehouse_detail", null);
        const dbWarehouse = _.get(findDocumentSOPL, "warehouse_detail", null);

        if (!_.isPlainObject(reqWarehouse)) {
            throw Error(`reqWarehouse must be PlainObject`);
        }
        else if (!_.isPlainObject(dbWarehouse)) {
            throw Error(`dbWarehouse must be PlainObject`);
        }
        else {
            if (reqWarehouse.warehouse !== dbWarehouse.warehouse) {
                return true;
            }
            else {
                const reqShelf = _.get(request.body, "warehouse_detail.shelf", null);
                const dbShelf = _.get(findDocumentSOPL, "warehouse_detail.shelf", null);

                if (!_.isArray(reqShelf)) {
                    throw Error(`reqShelf must be PlainObject`);
                }
                else if (!_.isArray(dbShelf)) {
                    throw Error(`dbShelf must be PlainObject`);
                }
                else {
                    if (_.isEqual(reqShelf, dbShelf)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            }
        }
    }
};

const subService_doAddHoldingStock = async (request, tableName, transaction, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const option_movementLog_details = _.get(options,'movementLog_details', {});
    options.movementLog_details = option_movementLog_details;

    const option_movementLog_doc_sale_id = _.get(options, 'movementLog_doc_sale_id', null)
    if (!isUUID(option_movementLog_doc_sale_id)) {
        throw Error('Variable options.movementLog_doc_sale_id must be String UUID type')
    }

    const option_movementLog_doc_sale_log_id = _.get(options, 'movementLog_doc_sale_log_id', null)
    if (!isUUID(option_movementLog_doc_sale_log_id)) {
        throw Error('Variable options.movementLog_doc_sale_log_id must be String UUID type')
    }

    const findShop = await utilCheckShopTableName(request);

    /**
     * A name for create dynamics table
     * @type {string}
     */
    const table_name = findShop.shop_code_id;

    /**
     * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
     */
    const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

    const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
        where: { id: request.params.id },
        transaction: transaction
    });

    const dbDocProductId = findDocumentSOPL.product_id;
    const newDocWarehouseId = request.body.warehouse_detail.warehouse;
    const newDocWarehouseShelf = request.body.warehouse_detail.shelf;

    for (let index = 0; index < newDocWarehouseShelf.length; index++) {
        const element = newDocWarehouseShelf[index];

        const currentProductShopStock = await utilGetCurrentProductShopStock(
            table_name,
            {
                transaction: transaction,
                findShopProductId: dbDocProductId,
                findShopWarehouseId: newDocWarehouseId,
                findShopWarehouseItemId: element.item,
                findPurchaseUnitId: element.purchase_unit_id,
                findDotMfd: element.dot_mfd
            }
        );
        if (currentProductShopStock.length !== 1) {
            throw Error('Variable currentProductShopStock.length must return 1');
        }

        await utilSetShopStockProductBalance(
            table_name,
            dbDocProductId,
            newDocWarehouseId,
            element.item,
            element.purchase_unit_id,
            element.dot_mfd,
            "add_holding_product",
            element.amount,
            {
                transaction: transaction,
                updated_by: request.id
            }
        );

        await utilSetShopInventoryMovementLog(
            'SO',
            {
                shop_id: findShop.get('id'),
                product_id: dbDocProductId,
                doc_sale_id: option_movementLog_doc_sale_id,
                doc_sale_log_id: option_movementLog_doc_sale_log_id,
                stock_id: currentProductShopStock[0].id,
                warehouse_id: newDocWarehouseId,
                warehouse_item_id: element.item,
                dot_mfd: element.dot_mfd || null,
                purchase_unit_id: element.purchase_unit_id || null,
                count_previous_stock: currentProductShopStock[0].balance,
                count_adjust_stock: (Math.abs(+(element.amount))) * -1,
                details: { documentType: 'SO', reasons: 'Add holding stock', ...option_movementLog_details},
                created_by: request.id,
                created_date: currentDateTime
            },
            {
                transaction: transaction,
                currentDateTime: currentDateTime
            }
        );
    }

    await findDocumentSOPL.reload({ transaction: transaction });

    return findDocumentSOPL;
};

const subService_doCommitStock = async (request, tableName, transaction, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const findShop = await utilCheckShopTableName(request);

    /**
     * A name for create dynamics table
     * @type {string}
     */
    const table_name = findShop.shop_code_id;

    /**
     * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
     */
    const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

    const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
        where: { id: request.params.id },
        transaction: transaction
    });

    const dbDocProductId = findDocumentSOPL.product_id;
    const dbDocWarehouseId = findDocumentSOPL.warehouse_detail.warehouse;
    const dbDocWarehouseShelf = findDocumentSOPL.warehouse_detail.shelf;

    for (let index = 0; index < dbDocWarehouseShelf.length; index++) {
        const element = dbDocWarehouseShelf[index];

        await utilSetShopStockProductBalance(
            table_name,
            dbDocProductId,
            dbDocWarehouseId,
            element.item,
            element.purchase_unit_id,
            element.dot_mfd,
            "commit_holding_product",
            element.amount,
            {
                transaction: transaction,
                updated_by: request.id
            }
        );
    }

    await findDocumentSOPL.reload();

    return findDocumentSOPL;
};

const subService_doRemoveHoldingStock = async (request, tableName, transaction, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const option_movementLog_details = _.get(options,'movementLog_details', {});

    const option_movementLog_doc_sale_id = _.get(options, 'movementLog_doc_sale_id', null)
    if (!isUUID(option_movementLog_doc_sale_id)) {
        throw Error('Variable options.movementLog_doc_sale_id must be String UUID type')
    }

    const option_movementLog_doc_sale_log_id = _.get(options, 'movementLog_doc_sale_log_id', null)
    if (!isUUID(option_movementLog_doc_sale_log_id)) {
        throw Error('Variable options.movementLog_doc_sale_log_id must be String UUID type')
    }

    const findShop = await utilCheckShopTableName(request);

    /**
     * A name for create dynamics table
     * @type {string}
     */
    const table_name = findShop.shop_code_id;

    /**
     * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
     */
    const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

    const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
        where: { id: request.params.id },
        transaction: transaction
    });

    const dbDocProductId = findDocumentSOPL.product_id;
    const dbDocWarehouseId = findDocumentSOPL.warehouse_detail.warehouse;
    const dbDocWarehouseShelf = findDocumentSOPL.warehouse_detail.shelf;

    for (let index = 0; index < dbDocWarehouseShelf.length; index++) {
        const element = dbDocWarehouseShelf[index];

        const currentProductShopStock = await utilGetCurrentProductShopStock(
            table_name,
            {
                transaction: transaction,
                findShopProductId: dbDocProductId,
                findShopWarehouseId: dbDocWarehouseId,
                findShopWarehouseItemId: element.item,
                findPurchaseUnitId: element.purchase_unit_id,
                findDotMfd: element.dot_mfd
            }
        );
        if (currentProductShopStock.length !== 1) {
            throw Error('Variable currentProductShopStock.length must return 1');
        }

        await utilSetShopStockProductBalance(
            table_name,
            dbDocProductId,
            dbDocWarehouseId,
            element.item,
            element.purchase_unit_id,
            element.dot_mfd,
            "remove_holding_product",
            element.amount,
            {
                transaction: transaction,
                updated_by: request.id
            }
        );

        await utilSetShopInventoryMovementLog(
            'SO',
            {
                shop_id: findShop.get('id'),
                product_id: dbDocProductId,
                doc_sale_id: option_movementLog_doc_sale_id,
                doc_sale_log_id: option_movementLog_doc_sale_log_id,
                stock_id: currentProductShopStock[0].id,
                warehouse_id: dbDocWarehouseId,
                warehouse_item_id: element.item,
                dot_mfd: element.dot_mfd || null,
                purchase_unit_id: element.purchase_unit_id || null,
                count_previous_stock: currentProductShopStock[0].balance,
                count_adjust_stock: (Math.abs(+(element.amount))),
                details: { documentType: 'SO', reasons: 'Remove holding stock', ...option_movementLog_details},
                created_by: request.id,
                created_date: currentDateTime
            },
            {
                transaction: transaction,
                currentDateTime: currentDateTime
            }
        );
    }

    await findDocumentSOPL.reload();

    return findDocumentSOPL;
};

const subService_doRevertStock = async (request, tableName, transaction, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const option_movementLog_details = _.get(options,'movementLog_details', {});

    const option_movementLog_doc_sale_id = _.get(options, 'movementLog_doc_sale_id', null)
    if (!isUUID(option_movementLog_doc_sale_id)) {
        throw Error('Variable options.movementLog_doc_sale_id must be String UUID type')
    }

    const option_movementLog_doc_sale_log_id = _.get(options, 'movementLog_doc_sale_log_id', null)
    if (!isUUID(option_movementLog_doc_sale_log_id)) {
        throw Error('Variable options.movementLog_doc_sale_log_id must be String UUID type')
    }

    const findShop = await utilCheckShopTableName(request);

    /**
     * A name for create dynamics table
     * @type {string}
     */
    const table_name = findShop.shop_code_id;

    /**
     * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
     */
    const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

    const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
        where: { id: request.params.id },
        transaction: transaction
    });

    const docProductId = findDocumentSOPL.product_id;
    const docWarehouseId = findDocumentSOPL.warehouse_detail.warehouse;
    const docWarehouseShelf = findDocumentSOPL.warehouse_detail.shelf;

    for (let index = 0; index < docWarehouseShelf.length; index++) {
        const element = docWarehouseShelf[index];

        const currentProductShopStock = await utilGetCurrentProductShopStock(
            table_name,
            {
                transaction: transaction,
                findShopProductId: docProductId,
                findShopWarehouseId: docWarehouseId,
                findShopWarehouseItemId: element.item,
                findPurchaseUnitId: element.purchase_unit_id,
                findDotMfd: element.dot_mfd
            }
        );
        if (currentProductShopStock.length !== 1) {
            throw Error('Variable currentProductShopStock.length must return 1');
        }

        await utilSetShopStockProductBalance(
            table_name,
            docProductId,
            docWarehouseId,
            element.item,
            element.purchase_unit_id,
            element.dot_mfd,
            "revert_used_product",
            element.amount,
            {
                transaction: transaction,
                updated_by: request.id
            }
        );

        await utilSetShopInventoryMovementLog(
            'SO',
            {
                shop_id: findShop.get('id'),
                product_id: docProductId,
                doc_sale_id: option_movementLog_doc_sale_id,
                doc_sale_log_id: option_movementLog_doc_sale_log_id,
                stock_id: currentProductShopStock[0].id,
                warehouse_id: docWarehouseId,
                warehouse_item_id: element.item,
                dot_mfd: element.dot_mfd || null,
                purchase_unit_id: element.purchase_unit_id || null,
                count_previous_stock: currentProductShopStock[0].balance,
                count_adjust_stock: (Math.abs(+(element.amount))),
                details: { documentType: 'SO', reasons: 'Revert used stock', ...option_movementLog_details},
                created_by: request.id,
                created_date: currentDateTime
            },
            {
                transaction: transaction,
                currentDateTime: currentDateTime
            }
        );
    }

    await findDocumentSOPL.reload({ transaction: transaction });

    return findDocumentSOPL;
};


/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("sequelize").Transaction} transaction
 * @param {boolean} modifyProductStock - if true it's will do modifying product stock
 * @param options
 * @returns {Promise<ShopSalesOrderPlanLogs>}
 */
const serviceShopSalesOrderPlanLogsPut_statusDocumentCancel = async (request, transaction, modifyProductStock, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const option_movementLog_details = _.get(options,'movementLog_details', {});

    const option_movementLog_doc_sale_id = _.get(options, 'movementLog_doc_sale_id', null)
    if (!isUUID(option_movementLog_doc_sale_id)) {
        throw Error('Variable options.movementLog_doc_sale_id must be String UUID type')
    }

    /**
     * A name for create dynamics table
     * @type {string}
     */
    const table_name = await utilGetFastifyRequestShopCodeId(request);

    /**
     * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
     */
    const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

    const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
        where: {
            id: request.params.id,
            status: {
                [Op.ne]: 0
            }
        },
        transaction: transaction
    });

    if (!findDocumentSOPL) {
        throw Error(`findDocumentSOPL return not found`);
    }
    else {
        options.movementLog_doc_sale_log_id = findDocumentSOPL.get('id');

        // ลบสินค้า ที่มีการขายอยู่ในขั้นตอน กำลังดำเนินการ
        if (findDocumentSOPL.status === 1) {
            options.movementLog_details = { documentType: 'SO', reasons: 'Edit', ...option_movementLog_details };
            if (modifyProductStock) await subService_doRemoveHoldingStock(request, table_name, transaction, options);
        }
        // ลบสินค้า ที่มีการขายอยู่ในขั้นตอน ดำเนินการเรียบร้อย
        else if (findDocumentSOPL.status === 2) {
            options.movementLog_details = { documentType: 'SO', reasons: 'Delete', ...option_movementLog_details };
            if (modifyProductStock) await subService_doRevertStock(request, table_name, transaction, options);
        }
        else {
            throw Error('Variable findDocumentSOPL.status is no equal 1 or 2');
        }

        await instanceModelShopSalesOrderPlanLogs.update(
            {
                status: 0,
                updated_by: request.id,
                updated_date: currentDateTime
            },
            {
                where: {
                    id: request.params.id
                },
                transaction: transaction
            }
        );

        await findDocumentSOPL.reload({ transaction: transaction });

        return findDocumentSOPL;
    }
};

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("sequelize").Transaction} transaction
 * @param {boolean} modifyProductStock - if true it's will do modifying product stock
 * @param options
 * @returns {Promise<ShopSalesOrderPlanLogs>}
 */
const serviceShopSalesOrderPlanLogsPut_statusDocumentInProgress = async (request, transaction, modifyProductStock, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const option_movementLog_details = _.get(options,'movementLog_details', {});
    options.movementLog_details = option_movementLog_details;

    const option_movementLog_doc_sale_id = _.get(options, 'movementLog_doc_sale_id', null);
    if (!isUUID(option_movementLog_doc_sale_id)) {
        throw Error('Variable options.movementLog_doc_sale_id must be String UUID type')
    }

    /**
     * A name for create dynamics table
     * @type {string}
     */
    const table_name = await utilGetFastifyRequestShopCodeId(request);

    /**
     * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
     */
    const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

    const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
        where: { id: request.params.id },
        transaction: transaction
    });

    if (!findDocumentSOPL) {
        throw Error(`findDocumentSOPL return not found`);
    }
    else {
        options.movementLog_doc_sale_log_id = findDocumentSOPL.get('id');

        const status = [0, 1, 2].includes(request.body.status) ? { status: request.body.status } : { status: findDocumentSOPL.status };

        const checkIsWarehouseModified = await subService_isWarehouseModified(request, table_name, transaction);

        if (!checkIsWarehouseModified && findDocumentSOPL.status === 1 && status.status === 1) {
            // Update ShopSalesOrderPlanLogs document
            await instanceModelShopSalesOrderPlanLogs.update(
                {
                    ...request.body,
                    ...{
                        warehouse_detail: findDocumentSOPL.warehouse_detail
                    },
                    ...status,
                    updated_by: request.id,
                    updated_date: currentDateTime
                },
                {
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                }
            );
        }

        if (checkIsWarehouseModified && findDocumentSOPL.status === 1 && status.status === 1) {
            if (modifyProductStock) {
                await subService_doRemoveHoldingStock(request, table_name, transaction, options);
                await subService_doAddHoldingStock(request, table_name, transaction, options);
            }

            // Update ShopSalesOrderPlanLogs document
            await instanceModelShopSalesOrderPlanLogs.update(
                {
                    ...request.body,
                    ...{
                        warehouse_detail: request.body.warehouse_detail
                    },
                    ...status,
                    updated_by: request.id,
                    updated_date: currentDateTime
                },
                {
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                }
            );
        }

        await findDocumentSOPL.reload({ transaction: transaction });

        return findDocumentSOPL;
    }
};

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("sequelize").Transaction} transaction
 * @param {boolean} modifyProductStock - if true it's will do modifying product stock
 * @param options
 * @returns {Promise<ShopSalesOrderPlanLogs>}
 */
const serviceShopSalesOrderPlanLogsPut_statusDocumentDone = async (request, transaction, modifyProductStock, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const option_movementLog_details = _.get(options,'movementLog_details', {});
    options.movementLog_details = option_movementLog_details;

    const option_movementLog_doc_sale_id = _.get(options, 'movementLog_doc_sale_id', null)
    if (!isUUID(option_movementLog_doc_sale_id)) {
        throw Error('Variable options.movementLog_doc_sale_id must be String UUID type')
    }

    /**
     * A name for create dynamics table
     * @type {string}
     */
    const table_name = await utilGetFastifyRequestShopCodeId(request);

    /**
     * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
     */
    const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

    const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
        where: { id: request.params.id },
        transaction: transaction
    });

    if (!findDocumentSOPL) {
        throw Error(`findDocumentSOPL return not found`);
    }
    else {
        options.movementLog_doc_sale_log_id = findDocumentSOPL.get('id');

        const status = [0, 1, 2].includes(request.body.status) ? { status: request.body.status } : { status: findDocumentSOPL.status };

        const checkIsWarehouseModified = await subService_isWarehouseModified(request, table_name, transaction);

        if (!checkIsWarehouseModified && findDocumentSOPL.status === 1 && status.status === 2) {
            await instanceModelShopSalesOrderPlanLogs.update(
                {
                    ...request.body,
                    ...{
                        warehouse_detail: findDocumentSOPL.warehouse_detail
                    },
                    ...status,
                    updated_by: request.id,
                    updated_date: currentDateTime
                },
                {
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                }
            );

            await subService_doCommitStock(request, table_name, transaction, options);
        }

        if (checkIsWarehouseModified && findDocumentSOPL.status === 1 && status.status === 2) {
            if (modifyProductStock) {
                await subService_doRemoveHoldingStock(request, table_name, transaction, options);
                await subService_doAddHoldingStock(request, table_name, transaction, options);
            }

            // Update ShopSalesOrderPlanLogs document
            await instanceModelShopSalesOrderPlanLogs.update(
                {
                    ...request.body,
                    ...{
                        warehouse_detail: request.body.warehouse_detail
                    },
                    ...status,
                    updated_by: request.id,
                    updated_date: Date.now()
                },
                {
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                }
            );

            await subService_doCommitStock(request, table_name, transaction);
        }

        if (!checkIsWarehouseModified && findDocumentSOPL.status === 2 && status.status === 2) {
            // Update ShopSalesOrderPlanLogs document
            await instanceModelShopSalesOrderPlanLogs.update(
                {
                    ...request.body,
                    ...{
                        warehouse_detail: request.body.warehouse_detail
                    },
                    ...status,
                    updated_by: request.id,
                    updated_date: currentDateTime
                },
                {
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                }
            );
        }

        if (checkIsWarehouseModified && findDocumentSOPL.status === 2 && status.status === 2) {
            if (modifyProductStock) {
                await subService_doRevertStock(request, table_name, transaction, options);
                await subService_doAddHoldingStock(request, table_name, transaction, options);
            }

            // Update ShopSalesOrderPlanLogs document
            await instanceModelShopSalesOrderPlanLogs.update(
                {
                    ...request.body,
                    ...{
                        warehouse_detail: request.body.warehouse_detail
                    },
                    ...status,
                    updated_by: request.id,
                    updated_date: currentDateTime
                },
                {
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                }
            );

            await subService_doCommitStock(request, table_name, transaction, options);
        }

        await findDocumentSOPL.reload({ transaction: transaction });

        return findDocumentSOPL;
    }
};


/**
 * A handler to edit by id shopSalesOrderPlanLogs from database
 * - Route [PUT] => /api/shopSalesOrderPlanLogs/put/:id
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param options
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopSalesOrderPlanLogs>>}
 */
const handlerShopSalesOrderPlanLogsPut = async (request, reply = {}, options = {}) => {
    const handlerName = "put shopSalesOrderPlanLogs put";

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        const option_movementLog_details = _.get(options,'movementLog_details', {});
        options.movementLog_details = option_movementLog_details;

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = await utilGetFastifyRequestShopCodeId(request);

        return await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                /**
                 * A class's dynamics instance of model "ShopSalesTransactionDoc"
                 */
                const instanceModelShopSalesTransactionDoc = modelShopSalesTransactionDoc(table_name);
                /**
                 * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
                 */
                const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

                const findDocumentSOPL = await instanceModelShopSalesOrderPlanLogs.findOne({
                    include: [
                        {
                            model: instanceModelShopSalesTransactionDoc,
                            as: 'ShopSalesTransactionDoc'
                        }
                    ],
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                });

                if (!findDocumentSOPL) {
                    throw Error(`findDocumentSOPL return not found`);
                }
                else {
                    const status = [0, 1, 2].includes(request.body.status) ? { status: request.body.status } : { status: findDocumentSOPL.status };
                    const modifyProductStock =  !(config_document_type_ids_no_modify_product_stock.includes(findDocumentSOPL.ShopSalesTransactionDoc.doc_type_id));

                    const option_movementLog_doc_sale_id = findDocumentSOPL.ShopSalesTransactionDoc.id;
                    if (!isUUID(option_movementLog_doc_sale_id)) {
                        throw Error('Variable findDocumentSOPL.ShopSalesTransactionDoc return not found');
                    }
                    options.movementLog_doc_sale_id = option_movementLog_doc_sale_id;

                    if (![0, 1, 2].includes(status.status)) {
                        throw Error(`status currently not supported`);
                    }
                    else {
                        /**
                         * @type {ShopSalesOrderPlanLogs|null}
                         */
                        let resolver = null;

                        // Document: Cancel
                        if (status.status === 0) {
                            options.movementLog_details = { documentType: 'SO', reasons: 'Delete', ...option_movementLog_details };
                            resolver = await serviceShopSalesOrderPlanLogsPut_statusDocumentCancel(request, transaction, modifyProductStock, options);
                        }

                        // Document: InProgress
                        if (status.status === 1) {
                            options.movementLog_details = { documentType: 'SO', reasons: 'Edit', ...option_movementLog_details };
                            resolver = await serviceShopSalesOrderPlanLogsPut_statusDocumentInProgress(request, transaction, modifyProductStock, options);
                        }

                        // Document: Done
                        if (status.status === 2) {
                            // options.movementLog_details = { documentType: 'SO', reasons: 'Commit', ...option_movementLog_details };
                            resolver = await serviceShopSalesOrderPlanLogsPut_statusDocumentDone(request, transaction, modifyProductStock, options);
                        }

                        if (_.isNull(_.get(status, 'status', null))) {
                            throw Error(`Out of status action`);
                        }
                        else {
                            await handleSaveLog(request, [[handlerName, request.params.id, request.body], '']);

                            return utilSetFastifyResponseJson('success', resolver);
                        }
                    }
                }
            }
        );
    } catch (error) {
        await handleSaveLog(request, [[handlerName, request.params.id, request.body], error]);

        throw error;
    }
};


module.exports = handlerShopSalesOrderPlanLogsPut;