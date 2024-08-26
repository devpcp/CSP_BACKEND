const _ = require("lodash")
const { Transaction, Op } = require("sequelize");
const { isUUID } = require("./generate");
const db = require("../db");
const ShopProfile = require("../models/model").ShopsProfiles;
const ShopInventoryMovementLog = require("../models/model").ShopInventoryMovementLog;
const ShopsProfiles = require("../models/model").ShopsProfiles;


/**
 * @param {IDocumentType} [documentType='']
 * @param {{doc_sale_log_id: (string|null), warehouse_item_id: string, doc_sale_id: (string|null), purchase_unit_id: string, created_by: string, count_adjust_stock: number, shop_id: string, doc_inventory_log_id: (string|null), count_previous_stock: number, product_id: string, updated_by: (string|null), details: (T|{}), created_date: (Date|number), updated_date: (Date|number|null), dot_mfd: string, doc_wyz_auto_id: (string|null), doc_inventory_id: (string|null), warehouse_id: string}} [objectCreateMovementLog={}]
 * @param options
 */
const fnValidateInputObjectCreateMovementLog = async (documentType = '', objectCreateMovementLog = {}, options = {}) => {
    const functionName = fnValidateInputObjectCreateMovementLog.name;

    if (!isUUID(objectCreateMovementLog.shop_id)) {
        if (_.isNull(objectCreateMovementLog.shop_id)) {
            const option_shop_code = (_.get(options, 'shop_code', '')).toUpperCase();
            if (option_shop_code.length <= 0) {
                throw Error(`${functionName}: options.shop_code must be String type and not Empty`);
            }
            else {
                const findShop = await ShopsProfiles.findAll({
                    where: {
                        shop_code_id: option_shop_code
                    },
                    transaction: _.get(options, 'transaction', null)
                });
                if (findShop.length !== 1) {
                    throw Error('Variable findShop return not found');
                }
                else {
                    objectCreateMovementLog.shop_id = findShop[0].get('id');
                    if (!isUUID(objectCreateMovementLog.shop_id)) {
                        throw Error('Variable objectCreateMovementLog.shop_id return not found');
                    }
                }
            }
        }
        else {
            throw Error(`${functionName}: objectCreateMovementLog.shop_id must be String UUID`);
        }
    }
    if (!isUUID(objectCreateMovementLog.product_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.product_id must be String UUID`);
    }
    if (!_.isNull(objectCreateMovementLog.doc_inventory_id) && !isUUID(objectCreateMovementLog.doc_inventory_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.doc_inventory_id must be String UUID or Null`);
    }
    if (!_.isNull(objectCreateMovementLog.doc_inventory_log_id) && !isUUID(objectCreateMovementLog.doc_inventory_log_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.doc_inventory_log_id must be String UUID or Null`);
    }
    if (!_.isNull(objectCreateMovementLog.doc_sale_id) && !isUUID(objectCreateMovementLog.doc_sale_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.doc_sale_id must be String UUID or Null`);
    }
    if (!_.isNull(objectCreateMovementLog.doc_sale_log_id) && !isUUID(objectCreateMovementLog.doc_sale_log_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.doc_sale_log_id must be String UUID or Null`);
    }
    if (!_.isNull(objectCreateMovementLog.doc_wyz_auto_id) && !isUUID(objectCreateMovementLog.doc_wyz_auto_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.doc_wyz_auto_id must be String UUID or Null`);
    }
    if (!isUUID(objectCreateMovementLog.warehouse_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.warehouse_id must be String UUID`);
    }
    if (!_.isString(objectCreateMovementLog.warehouse_item_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.warehouse_item_id must be String`);
    }
    if (objectCreateMovementLog.warehouse_item_id.length < 1) {
        throw Error(`${functionName}: objectCreateMovementLog.warehouse_item_id must be Not empty`);
    }
    if (objectCreateMovementLog.warehouse_item_id.replace(/[\s\t\n\r]+/ig, '').length < 1) {
        throw Error(`${functionName}: objectCreateMovementLog.warehouse_item_id must be Not empty data`);
    }
    if (!_.isNull(objectCreateMovementLog.dot_mfd) && !_.isString(objectCreateMovementLog.dot_mfd)) {
        throw Error(`${functionName}: objectCreateMovementLog.dot_mfd must be String or Null`);
    }
    if (_.isString(objectCreateMovementLog.dot_mfd) && objectCreateMovementLog.dot_mfd.length === 0) {
        throw Error(`${functionName}: objectCreateMovementLog.dot_mfd is String value must not empty`);
    }
    if (_.isString(objectCreateMovementLog.dot_mfd) && (/^[0-9]{1,4}$/g).test(objectCreateMovementLog.dot_mfd) === false) {
        throw Error(`${functionName}: objectCreateMovementLog.dot_mfd is wrong format due from is String`);
    }
    if (!_.isNull(objectCreateMovementLog.purchase_unit_id) && !isUUID(objectCreateMovementLog.purchase_unit_id)) {
        throw Error(`${functionName}: objectCreateMovementLog.purchase_unit_id must be String UUID or Null`);
    }
    if (!_.isSafeInteger(objectCreateMovementLog.count_previous_stock)) {
        throw Error(`${functionName}: objectCreateMovementLog.count_previous_stock must be Number SafeInteger`);
    }
    if (objectCreateMovementLog.count_previous_stock < 0) {
        throw Error(`${functionName}: objectCreateMovementLog.count_previous_stock must be more than 0`);
    }
    if (!_.isSafeInteger(objectCreateMovementLog.count_adjust_stock)) {
        throw Error(`${functionName}: objectCreateMovementLog.count_adjust_stock must be Number SafeInteger`);
    }
    if (objectCreateMovementLog.count_previous_stock + objectCreateMovementLog.count_adjust_stock < 0) {
        throw Error(`${functionName}: objectCreateMovementLog sum of count_previous_stock and count_adjust_stock must not lower than 0`);
    }
    if (!isUUID(objectCreateMovementLog.created_by)) {
        throw Error(`${functionName}: objectCreateMovementLog.created_by must be String UUID`);
    }
    if (!_.isDate(objectCreateMovementLog.created_date) && !_.isSafeInteger(objectCreateMovementLog.created_date)) {
        throw Error(`${functionName}: objectCreateMovementLog.created_date must be Date or Number Date`);
    }
    if (!_.isNull(objectCreateMovementLog.updated_by) && !isUUID(objectCreateMovementLog.updated_by)) {
        throw Error(`${functionName}: objectCreateMovementLog.updated_by must be String UUID or Null`);
    }
    if (!_.isNull(objectCreateMovementLog.updated_date) && !_.isDate(objectCreateMovementLog.updated_date) && !_.isSafeInteger(objectCreateMovementLog.updated_date)) {
        throw Error(`${functionName}: objectCreateMovementLog.updated_date must be Date or Number Date or Null`);
    }

    switch (documentType) {
        case 'INI': {
            if (!isUUID(objectCreateMovementLog.doc_inventory_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_inventory_id must be String UUID due from documentType is INI`);
            }
            if (!isUUID(objectCreateMovementLog.doc_inventory_log_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_inventory_log_id must be String UUID due from documentType is INI`);
            }
            if (!_.isNull(objectCreateMovementLog.doc_sale_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_sale_id must be Null from documentType is INI`);
            }
            if (!_.isNull(objectCreateMovementLog.doc_sale_log_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_sale_log_id must be Null from documentType is INI`);
            }
            if (!_.isNull(objectCreateMovementLog.doc_wyz_auto_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_wyz_auto_id must be Null from documentType is INI`);
            }
            break;
        }
        case 'SO': {
            if (!_.isNull(objectCreateMovementLog.doc_inventory_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_inventory_id must be Null from documentType is SO`);
            }
            if (!_.isNull(objectCreateMovementLog.doc_inventory_log_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_inventory_log_id must be Null from documentType is SO`);
            }
            if (!isUUID(objectCreateMovementLog.doc_sale_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_sale_id must be String UUID due from documentType is SO`);
            }
            if (!isUUID(objectCreateMovementLog.doc_sale_log_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_sale_id must be String UUID due from documentType is SO`);
            }
            if (!_.isNull(objectCreateMovementLog.doc_wyz_auto_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_wyz_auto_id must be Null from documentType is SO`);
            }
            break;
        }
        case 'WYZAuto': {
            if (!_.isNull(objectCreateMovementLog.doc_inventory_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_inventory_id must be Null from documentType is WYZAuto`);
            }
            if (!_.isNull(objectCreateMovementLog.doc_inventory_log_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_inventory_log_id must be Null from documentType is WYZAuto`);
            }
            if (!_.isNull(objectCreateMovementLog.doc_sale_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_sale_id must be Null from documentType is WYZAuto`);
            }
            if (!_.isNull(objectCreateMovementLog.doc_sale_log_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_sale_log_id must be Null from documentType is WYZAuto`);
            }
            if (!isUUID(objectCreateMovementLog.doc_wyz_auto_id)) {
                throw Error(`${functionName}: objectCreateMovementLog.doc_wyz_auto_id must be String UUID due from documentType is WYZAuto`);
            }
            break;
        }
        default: {
            throw Error(`${functionName}: Parameter documentType is not match in rule set`)
        }
    }

    return objectCreateMovementLog;
};

/**
 * @template T
 * @param {import("../types/type.Util.SetShopInventoryMovementLog").IDocumentType} [documentType='']
 * @param {import("../types/type.Util.SetShopInventoryMovementLog").IShopInventoryMovementLog<T>} [inputShopInventoryMovementLog={}]
 * @param {{transaction?: import("sequelize/types").Transaction, currentDateTime?: Date, shop_code?: string}} [options={}]
 */
const utilSetShopInventoryMovementLog = async (documentType = '', inputShopInventoryMovementLog = {}, options = {}) => {
    const functionName = utilSetShopInventoryMovementLog.name;

    /**
     * @type {import("sequelize/types/transaction").Transaction || null}
     */
    const config_options_transaction = _.get(options, 'transaction', null);
    /**
     * @type {string}
     */
    let config_options_shop_code = _.get(options, 'shop_code', null);

    let objectCreateMovementLog = {
        shop_id: inputShopInventoryMovementLog.shop_id || null,
        product_id: inputShopInventoryMovementLog.product_id,
        doc_inventory_id: inputShopInventoryMovementLog.doc_inventory_id || null,
        doc_inventory_log_id: inputShopInventoryMovementLog.doc_inventory_log_id || null,
        doc_sale_id: inputShopInventoryMovementLog.doc_sale_id || null,
        doc_sale_log_id: inputShopInventoryMovementLog.doc_sale_log_id || null,
        doc_wyz_auto_id: inputShopInventoryMovementLog.doc_wyz_auto_id  || null,
        stock_id: inputShopInventoryMovementLog.stock_id,
        warehouse_id: inputShopInventoryMovementLog.warehouse_id,
        warehouse_item_id: inputShopInventoryMovementLog.warehouse_item_id,
        dot_mfd: inputShopInventoryMovementLog.dot_mfd,
        purchase_unit_id: inputShopInventoryMovementLog.purchase_unit_id,
        count_previous_stock: +(inputShopInventoryMovementLog.count_previous_stock),
        count_adjust_stock: +(inputShopInventoryMovementLog.count_adjust_stock),
        count_current_stock: (+(inputShopInventoryMovementLog.count_previous_stock)) + (+(inputShopInventoryMovementLog.count_adjust_stock)),
        details: inputShopInventoryMovementLog.details || {},
        created_by: inputShopInventoryMovementLog.created_by,
        created_date: inputShopInventoryMovementLog.created_date || new Date(),
        updated_by: inputShopInventoryMovementLog.updated_by || null,
        updated_date: inputShopInventoryMovementLog.updated_date || null
    };

    objectCreateMovementLog = await fnValidateInputObjectCreateMovementLog(documentType, objectCreateMovementLog, options);

    if (!_.isString(config_options_shop_code) && !_.isNull(config_options_shop_code)) {
        throw Error(`${functionName}: Parameter options.shop_code is wrong input type`);
    }
    if (_.isString(config_options_shop_code)) {
        if (!isUUID(objectCreateMovementLog.shop_id)) {
            throw Error(`${functionName}: Variable objectCreateMovementLog.shop_id must be String UUID`);
        }

        const findShopCode = await ShopProfile.findOne({
            attributes: ['id', 'shop_code_id'],
            where: {
                shop_code_id: {
                    [Op.eq]: config_options_shop_code.toUpperCase()
                }
            },
            transaction: config_options_transaction
        });

        config_options_shop_code = (findShopCode.get('shop_code_id')).toLowerCase();
        objectCreateMovementLog.shop_id = findShopCode.get('id');
    }
    if (_.isNull(config_options_shop_code)) {
        if (!isUUID(objectCreateMovementLog.shop_id)) {
            throw Error(`${functionName}: Variable objectCreateMovementLog.shop_id must be String UUID`);
        }

        const findShopCode = await ShopProfile.findOne({
            attributes: ['id', 'shop_code_id'],
            where: {
                id: objectCreateMovementLog.shop_id,
                shop_code_id: {
                    [Op.ne]: null
                }
            },
            transaction: config_options_transaction
        });

        config_options_shop_code = (findShopCode.get('shop_code_id')).toLowerCase();
        objectCreateMovementLog.shop_id = findShopCode.get('id');
    }

    const transactionResult = await db.transaction(
        {
            transaction: config_options_transaction,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (t) => {
            const instanceShopInventoryMovementLog = ShopInventoryMovementLog(config_options_shop_code);

            const createShopInventoryMovementLogDocument = await instanceShopInventoryMovementLog.create(
                objectCreateMovementLog,
                {
                    transaction: t,
                    validate: false
                }
            );

            return createShopInventoryMovementLogDocument;
        }
    );

    return transactionResult;
};


module.exports = utilSetShopInventoryMovementLog;