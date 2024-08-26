/**
 * A function do dynamics table of model ShopInventoryMovementLog
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_products_movement_logs"
 */
const ShopInventoryMovementLog = (table_name = "") => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        /**
         * @type {import("lodash")}
         */
        const _ = require("lodash");
        const { isUUID } = require("../../utils/generate");

        const Model = require("sequelize").Model;
        const { DataTypes, literal, Transaction, QueryTypes } = require("sequelize");

        const db = require('../../db');

        const modelUser = require("../model").User;
        const modelShopProfile = require("../model").ShopsProfiles;
        const modelShopProduct = require("../model").ShopProduct(table_name);
        const modelProductPurchaseUnitTypes = require("../model").ProductPurchaseUnitTypes;
        const modelShopInventoryTransaction = require("../model").ShopInventoryTransaction(table_name);
        const modelShopInventory = require("../model").ShopInventory(table_name);
        const modelShopSalesTransactionDoc = require("../model").ShopSalesTransactionDoc(table_name);
        const modelShopSalesOrderPlanLog = require("../model").ShopSalesOrderPlanLogs(table_name);
        const modelShopProductsHoldWYZAuto = require("../model").ShopProductsHoldWYZauto(table_name);
        const modelShopStock = require("../model").ShopStock(table_name);
        const modelShopWarehouse = require("../model").ShopWarehouse(table_name);
        const modelShopServiceOrderDoc = require("../model").ShopServiceOrderDoc(table_name);
        const modelShopServiceOrderList = require("../model").ShopServiceOrderList(table_name);
        const modelShopTemporaryDeliveryOrderDoc = require("../model").ShopTemporaryDeliveryOrderDoc(table_name);
        const modelShopTemporaryDeliveryOrderList = require("../model").ShopTemporaryDeliveryOrderList(table_name);

        class ShopInventoryMovementLog extends Model {
            /**
             * @param shop_id {string}
             * @param documentData {{
             *     document_inventory_import?: {
             *         doc_inventory_id: string;
             *         doc_inventory_log_id: string;
             *     };
             *     document_sales?: {
             *         doc_sales_id: string;
             *         doc_sales_log_id: string;
             *     };
             *     document_temporary_delivery_order?: {
             *         shop_temporary_delivery_order_doc_id: string;
             *         shop_temporary_delivery_order_list_id: string;
             *     };
             *     document_service_order?: {
             *         shop_service_order_doc_id: string;
             *         shop_service_order_list_id: string;
             *     }
             *     document_wyz_auto?: {
             *         doc_wyz_auto_id: string;
             *     };
             * }}
             * @param stockData {{
             *     shop_product_id: string;
             *     shop_stock_id: string;
             *     shop_warehouse_id: string;
             *     shop_warehouse_shelf_item_id: string;
             *     purchase_unit_id: string | null;
             *     dot_mfd: string | null;
             *     count_previous_stock: number | string;
             *     count_adjust_stock: number | string;
             *     count_current_stock: number | string;
             * }}
             * @param userData {{
             *     created_by: string;
             *     created_date?: Date;
             * }}
             * @param detailsData {{
             *     reasons?: string;
             *     documentType?: string;
             * }}
             * @param options {{
             *     currentDateTime?: Date;
             *     transaction?: import("sequelize").Transaction;
             *     ShopModels?: Object;
             * }}
             */
            static async createInventoryMovementLog (shop_id, documentData = {}, stockData = {}, userData = {}, detailsData = {}, options = {}) {
                const currentDateTime = options?.currentDateTime || new Date();

                if (!isUUID(shop_id)) {
                    throw new Error(`Require parameter 'shop_id'`);
                }

                const documentInventoryImport = documentData?.document_inventory_import || null;
                if (documentInventoryImport) {
                    if (!isUUID( documentInventoryImport?.doc_inventory_id)) {
                        throw new Error(`Require parameter 'doc_inventory_id'`);
                    }
                    if (!isUUID( documentInventoryImport?.doc_inventory_log_id)) {
                        throw new Error(`Require parameter 'doc_inventory_log_id'`);
                    }
                }
                const documentDocumentSales = documentData?.document_sales || null;
                if (documentDocumentSales) {
                    if (!isUUID( documentDocumentSales?.doc_sales_id)) {
                        throw new Error(`Require parameter 'doc_sales_id'`);
                    }
                    if (!isUUID( documentDocumentSales?.doc_sales_log_id)) {
                        throw new Error(`Require parameter 'doc_sale_log_id'`);
                    }
                }
                const documentServiceOrder = documentData?.document_service_order || null;
                if (documentServiceOrder) {
                    if (!isUUID( documentServiceOrder?.shop_service_order_doc_id)) {
                        throw new Error(`Require parameter 'shop_service_order_doc_id'`);
                    }
                    if (!isUUID( documentServiceOrder?.shop_service_order_list_id)) {
                        throw new Error(`Require parameter 'shop_service_order_list_id'`);
                    }
                }
                const documentTemporaryDeliveryOrder = documentData?.document_temporary_delivery_order || null;
                if (documentTemporaryDeliveryOrder) {
                    if (!isUUID( documentTemporaryDeliveryOrder?.shop_temporary_delivery_order_doc_id)) {
                        throw new Error(`Require parameter 'shop_temporary_delivery_order_doc_id'`);
                    }
                    if (!isUUID( documentTemporaryDeliveryOrder?.shop_temporary_delivery_order_list_id)) {
                        throw new Error(`Require parameter 'shop_temporary_delivery_order_list_id'`);
                    }
                }
                const documentWYZAuto = documentData?.document_wyz_auto || null;
                if (documentWYZAuto) {
                    if (!isUUID( documentDocumentSales?.doc_wyz_auto_id)) {
                        throw new Error(`Require parameter 'doc_sales_id'`);
                    }
                }
                if (!documentInventoryImport && !documentDocumentSales && !documentServiceOrder && !documentWYZAuto) {
                    throw new Error(`Require parameter one of 'documentInventoryImport', 'documentDocumentSales', 'documentServiceOrder', 'documentWYZAuto'`);
                }
                if ([documentInventoryImport, documentDocumentSales, documentServiceOrder, documentWYZAuto].filter(w => w !== null).length !== 1) {
                    throw new Error(`Require parameter one of 'documentInventoryImport', 'documentDocumentSales', 'documentServiceOrder', 'documentWYZAuto'`);
                }

                const shopProductId = stockData?.shop_product_id || null;
                if (!isUUID(shopProductId)) {
                    throw new Error(`Require parameter 'shop_product_id'`);
                }
                const shopStockId = stockData?.shop_stock_id || null;
                if (!isUUID(shopStockId)) {
                    throw new Error(`Require parameter 'shop_stock_id'`);
                }
                const shopWarehouseId = stockData?.shop_warehouse_id || null;
                if (!isUUID(shopWarehouseId)) {
                    throw new Error(`Require parameter 'shop_warehouse_id'`);
                }
                const shopWarehouseShelfItemId = stockData?.shop_warehouse_shelf_item_id || null;
                if (!_.isString(shopWarehouseShelfItemId)) {
                    throw new Error(`Require parameter 'shop_warehouse_item_id'`);
                }
                const purchaseUnitId = stockData?.purchase_unit_id || null;
                if (!isUUID(purchaseUnitId) && !_.isNull(purchaseUnitId)) {
                    throw new Error(`Require parameter 'purchase_unit_id'`);
                }
                const dotMFD = stockData?.dot_mfd || null;
                if (!_.isString(dotMFD) && !_.isNull(dotMFD)) {
                    throw new Error(`Require parameter 'dot_mfd'`);
                }
                const stockCountTypeSerializer = (value) => _.isSafeInteger(Number(value)) ? Number(value) : undefined;
                const countPreviousStock = stockCountTypeSerializer(stockData?.count_previous_stock);
                if (!_.isSafeInteger(Number(countPreviousStock))) {
                    throw new Error(`Require parameter 'count_previous_stock'`);
                }
                const countAdjustStock = stockCountTypeSerializer(stockData?.count_adjust_stock);
                if (!_.isSafeInteger(Number(countAdjustStock))) {
                    throw new Error(`Require parameter 'count_adjust_stock'`);
                }
                const countCurrentStock = stockCountTypeSerializer(stockData?.count_current_stock);
                if (!_.isSafeInteger(Number(countCurrentStock))) {
                    throw new Error(`Require parameter 'count_current_stock'`);
                }
                if (Number(countPreviousStock) + Number(countAdjustStock) !== Number(countCurrentStock)) {
                    throw new Error(`Summarize of count stock is not valid`);
                }

                const createdBy = userData?.created_by || null;
                if (!isUUID(createdBy)) {
                    throw new Error(`Require parameter 'created_by'`);
                }

                return await ShopInventoryMovementLog.create(
                    {
                        shop_id: shop_id,
                        product_id: shopProductId,
                        doc_inventory_id: documentInventoryImport?.doc_inventory_id || null,
                        doc_inventory_log_id: documentInventoryImport?.doc_inventory_log_id || null,
                        doc_sale_id: documentDocumentSales?.doc_sales_id || null,
                        doc_sale_log_id: documentDocumentSales?.doc_sales_log_id || null,
                        shop_service_order_doc_id: documentServiceOrder?.shop_service_order_doc_id || null,
                        shop_service_order_list_id: documentServiceOrder?.shop_service_order_list_id || null,
                        shop_temporary_delivery_order_doc_id: documentTemporaryDeliveryOrder?.shop_temporary_delivery_order_doc_id || null,
                        shop_temporary_delivery_order_list_id: documentTemporaryDeliveryOrder?.shop_temporary_delivery_order_list_id || null,
                        doc_wyz_auto_id: documentWYZAuto?.doc_wyz_auto_id || null,
                        stock_id: shopStockId,
                        warehouse_id: shopWarehouseId,
                        warehouse_item_id: shopWarehouseShelfItemId,
                        purchase_unit_id: purchaseUnitId,
                        dot_mfd: dotMFD,
                        count_previous_stock: countPreviousStock,
                        count_adjust_stock: countAdjustStock,
                        count_current_stock: countCurrentStock,
                        details: detailsData || {},
                        created_by: createdBy,
                        created_date: userData?.created_date || currentDateTime,
                        is_migrate: false
                    },
                    {
                        validate: true,
                        transaction: options?.transaction || null,
                        ShopModels: options?.ShopModels
                    }
                );
            }

            /**
             * @param {string} shop_id - shopId or tableName
             * @param {string} shop_product_id
             * @param {string} shop_warehouse_id
             * @param {string} shop_warehouse_shelf_item_id
             * @param {string|null} purchase_unit_id
             * @param {string|null} dot_mfd
             * @param {{transaction?: import("sequelize/types/transaction").Transaction}} options
             * @returns {Promise<{shop_stock_id: string, shop_product_id: string, shop_warehouse_id: string, shop_warehouse_shelf_item_id: string, purchase_unit_id?: string, dot_mfd?: string, balance: number, balance_date: string, created_date: string, created_by: string, updated_date: string, updated_by: string}>}
             */
            static async findCurrentShopStock(shop_id, shop_product_id, shop_warehouse_id, shop_warehouse_shelf_item_id, purchase_unit_id, dot_mfd, options = {}) {
                if (shop_id && isUUID(shop_id)) {
                    const findShopTableName = await modelShopProfile.findOne({
                        attributes: ['id', 'shop_code_id'],
                        where: {
                            id: shop_id
                        },
                        transaction: options?.transaction
                    });
                    if (!findShopTableName) { throw new Error(`ไม่พบข้อมูลร้านค้า`); }
                    else {
                        shop_id = findShopTableName.shop_code_id?.toLowerCase();
                    }
                }

                const table_name = shop_id;
                const whereProductId = `shop_product_id = '${shop_product_id}'`;
                const whereWarehouseId = `shop_warehouse_id = '${shop_warehouse_id}'`;
                const whereWarehouseShelfItemId = `shop_warehouse_shelf_item_id = '${shop_warehouse_shelf_item_id}'`;
                const wherePurchaseUnitId = (() => {
                    if (!purchase_unit_id) {
                        return `purchase_unit_id IS NULL`;
                    }
                    else {
                        return `purchase_unit_id = '${purchase_unit_id}'`;
                    }
                })();
                const whereDotMfd = (() => {
                    if (!dot_mfd) {
                        return `dot_mfd IS NULL`;
                    }
                    else {
                        return `dot_mfd = '${dot_mfd}'`;
                    }
                })();

                /**
                 * @type {
                 * {
                 *   shop_stock_id: string;
                 *   shop_product_id: string;
                 *   shop_warehouse_id: string;
                 *   shop_warehouse_shelf_item_id: string;
                 *   purchase_unit_id?: string;
                 *   dot_mfd?: string;
                 *   balance: number;
                 *   balance_date: string;
                 *   created_date: string;
                 *   created_by: string;
                 *   updated_date: string;
                 *   updated_by: string;
                 * }[]
                 * }
                 */
                const findStock = await db.query(
                    `
                        WITH ShopStock AS (
                            SELECT
                                ShopStock.id AS shop_stock_id,
                                ShopStock.product_id AS shop_product_id,
                                (ShopStockWarehouse->>'warehouse')::UUID AS shop_warehouse_id,
                                (nullif(trim((ShopStockWarehouseShelf->>'item')), ''))::varchar AS shop_warehouse_shelf_item_id,
                                (nullif(trim((ShopStockWarehouseShelf->>'purchase_unit_id')), ''))::UUID AS purchase_unit_id,
                                (nullif(trim((ShopStockWarehouseShelf->>'dot_mfd')), ''))::varchar AS dot_mfd,
                                (ShopStockWarehouseShelf->>'balance')::BIGINT AS balance,
                                ShopStock.balance_date AS balance_date,
                                ShopStock.created_date AS created_date,
                                ShopStock.created_by AS created_by,
                                ShopStock.updated_date AS updated_date,
                                ShopStock.updated_by AS updated_by
                            FROM app_shops_datas.dat_01hq0011_stock_products_balances AS ShopStock
                                CROSS JOIN LATERAL json_array_elements(ShopStock.warehouse_detail) AS ShopStockWarehouse
                                CROSS JOIN LATERAL json_array_elements(ShopStockWarehouse.value->'shelf') AS ShopStockWarehouseShelf
                        )
                        SELECT * FROM ShopStock
                        WHERE
                            ${whereProductId}
                            AND ${whereWarehouseId}
                            AND ${whereWarehouseShelfItemId}
                            AND ${wherePurchaseUnitId}
                            AND ${whereDotMfd}
                    `.replace(/(\.dat_01hq0011_)/g, `.dat_${table_name}_`),
                    {
                        type: QueryTypes.SELECT,
                        transaction: options?.transaction
                    }
                );

                if (findStock.length !== 1) {
                    throw new Error(`ไม่พบข้อมูลสต็อกสินค้าหรืออาจจะระบบสต็อกสินค้าทำงานผิดพลาด`);
                }
                else {
                    return findStock[0];
                }
            }
        }

        ShopInventoryMovementLog.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
                allowNull: false,
                primaryKey: true,
                comment: 'รหัสหลักตารางข้อมูลการเคลื่อนไหวสินค้าภายในร้าน'
            },
            run_no: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                comment: 'เลข Running number'
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfile,
                    key: 'id'
                },
                comment: `รหัสข้อมูลร้านค้า`
            },
            product_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProduct,
                    key: 'id'
                },
                comment: 'รหัสตารางข้อมูลสินค้าภายในร้าน (Shop Product Id)'
            },
            doc_inventory_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopInventoryTransaction,
                    key: 'id'
                },
                comment: `Ref.Id รหัสหลักตารางใบรับเข้า (dat_${table_name}_inventory_transaction_doc)`
            },
            doc_inventory_log_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopInventory,
                    key: 'id'
                },
                comment: `Ref.Id รหัสหลักตารางรายละเอียดสินค้าของใบรับเข้า (dat_${table_name}_inventory_management_logs)`
            },
            doc_sale_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopSalesTransactionDoc,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลเอกสารการขาย (dat_${table_name}_sales_transaction_doc)`
            },
            doc_sale_log_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopSalesOrderPlanLog,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลรายละเอียดสินค้าของเอกสารการขาย (dat_${table_name}_sales_order_plan_logs)`
            },
            shop_service_order_doc_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopServiceOrderDoc,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลเอกสารใบสั่งซ่อม (dat_${table_name}_service_order_doc)`
            },
            shop_service_order_list_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopServiceOrderList,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลรายการใบสั่งซ่อม (dat_${table_name}_service_order_list)`
            },
            shop_temporary_delivery_order_doc_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopTemporaryDeliveryOrderDoc,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว (dat_${table_name}_temporary_delivery_order_doc)`
            },
            shop_temporary_delivery_order_list_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopTemporaryDeliveryOrderList,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลรายการใบส่งสินค้าชั่วคราว (dat_${table_name}_temporary_delivery_order_list)`
            },
            doc_wyz_auto_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopProductsHoldWYZAuto,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลรายละเอียดสินค้าของเอกสารการขาย WYZAuto (dat_${table_name}_products_hold_wyzauto)`
            },
            stock_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopStock,
                    key: 'id'
                },
                comment: `Ref.Id ตารางข้อมูลสินค้าคงเหลือในคลังสินค้า (dat_${table_name}_stock_products_balances)`
            },
            warehouse_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopWarehouse,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลคลังสินค้า (dat_${table_name}_warehouses)`
            },
            warehouse_item_id: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: `Ref. Id รหัสของชั้นวาง (Item) ในตารางข้อมูลคลังสินค้า (dat_${table_name}_warehouses.shelf[].code)`
            },
            purchase_unit_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelProductPurchaseUnitTypes,
                    key: 'id'
                },
                comment: `Ref.Id รหัสตารางข้อมูลประเภทหน่วยซื้อ (master_lookup.mas_product_purchase_unit_types)`
            },
            dot_mfd: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: `รหัสวันที่ผลิต (DOT)`
            },
            count_previous_stock: {
                type: DataTypes.BIGINT,
                allowNull: false,
                comment: `Stock ยอดยกมา`
            },
            count_adjust_stock: {
                type: DataTypes.BIGINT,
                allowNull: false,
                comment: `Stock ยอดปรับปรุง`
            },
            count_current_stock: {
                type: DataTypes.BIGINT,
                allowNull: false,
                comment: `Stock ยอดคงเหลือ`
            },
            details: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {},
                comment: 'ข้อมูลรายละเอียดเก็บเป็น JSON'
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelUser,
                    key: 'id'
                },
                comment: `สร้างข้อมูลโดย`
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal(`now()`),
                comment: `สร้างข้อมูลวันที่`
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelUser,
                    key: 'id'
                },
                comment: `ปรับปรุงข้อมูลโดย`
            },
            updated_date: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: `ปรับปรุงข้อมูลวันที่`
            },
            is_migrated: {
                comment: 'เอกสารนี้มาจากการ Migration หรือไม่',
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {
            sequelize: db,
            modelName: 'ShopInventoryMovementLog',
            tableName: `dat_${table_name}_inventory_movement_logs`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลการเคลื่อนไหวสินค้า',
        });

        ShopInventoryMovementLog.belongsTo(modelShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });

        ShopInventoryMovementLog.belongsTo(modelShopProduct, { foreignKey: 'product_id', as: 'ShopProduct' });

        ShopInventoryMovementLog.belongsTo(modelShopInventoryTransaction, { foreignKey: 'doc_inventory_id', as: 'ShopInventoryTransactionDoc' });
        ShopInventoryMovementLog.belongsTo(modelShopInventory, { foreignKey: 'doc_inventory_log_id', as: 'ShopInventoryTransactionLog' });

        ShopInventoryMovementLog.belongsTo(modelShopSalesTransactionDoc, { foreignKey: 'doc_sale_id', as: 'ShopSalesTransactionDoc' });
        ShopInventoryMovementLog.belongsTo(modelShopSalesOrderPlanLog, { foreignKey: 'doc_sale_log_id', as: 'ShopSalesOrderPlanLog' });

        ShopInventoryMovementLog.belongsTo(modelShopProductsHoldWYZAuto, { foreignKey: 'doc_wyz_auto_id', as: 'ShopProductsHoldWYZAuto' });

        ShopInventoryMovementLog.belongsTo(modelShopWarehouse, { foreignKey: 'warehouse_id', as: 'ShopWarehouse' });

        ShopInventoryMovementLog.belongsTo(modelUser, { foreignKey: 'created_by', as: 'CreatedByUser' });
        ShopInventoryMovementLog.belongsTo(modelUser, { foreignKey: 'updated_by', as: 'UpdatedByUser' });

        ShopInventoryMovementLog.belongsTo(modelShopServiceOrderDoc, { foreignKey: 'shop_service_order_doc_id', as: 'ShopServiceOrderDoc' });
        ShopInventoryMovementLog.belongsTo(modelShopServiceOrderList, { foreignKey: 'shop_service_order_list_id', as: 'ServiceOrderList' });

        ShopInventoryMovementLog.belongsTo(modelShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_temporary_delivery_order_doc_id', as: 'ShopTemporaryDeliveryOrderDoc' });
        ShopInventoryMovementLog.belongsTo(modelShopTemporaryDeliveryOrderList, { foreignKey: 'shop_temporary_delivery_order_list_id', as: 'ShopTemporaryDeliveryOrderList' });


        const validateCountStock = async (instance, options) => {
            const count_previous_stock = +(instance.count_previous_stock);
            const count_adjust_stock = +(instance.count_adjust_stock);
            const count_current_stock = +(instance.count_current_stock)
            if (count_previous_stock < 0) {
                throw Error(`instance.count_previous_stock must more than or equal 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (count_current_stock < 0) {
                throw Error(`instance.count_current_stock must more than or equal 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (count_previous_stock + count_adjust_stock < 0) {
                throw Error(`instance Summarize of count stock must not lower than 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (count_previous_stock + count_adjust_stock !== count_current_stock) {
                throw Error(`instance Summarize of count stock is not valid, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
        };

        const serializeCountStock = async (instance, options) => {
            if (!_.isSafeInteger(+(instance.count_previous_stock))) {
                throw Error(`count_previous_stock must be Safe Integer, instanceData: ${JSON.stringify(JSON.stringify(instance.toJSON()))}`);
            }
            if ((+(instance.count_previous_stock)) < 0) {
                throw Error(`count_previous_stock must more than or equal 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }

            if (!_.isSafeInteger(+(instance.count_adjust_stock))) {
                throw Error(`count_adjust_stock must be Safe Integer, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }

            if (!_.isSafeInteger(+(instance.count_current_stock))) {
                const count_previous_stock = +(instance.count_previous_stock);
                const count_adjust_stock = +(instance.count_adjust_stock);
                const count_current_stock = +(instance.count_current_stock)
                if ((count_previous_stock + count_adjust_stock) !== count_current_stock) {
                    throw Error(`Summarize of count stock is not valid, instanceData: ${JSON.stringify(instance.toJSON())}`);
                }
            }
            else {
                let count_current_stock = +(instance.count_current_stock);
                if (!_.isSafeInteger(count_current_stock)) {
                    const count_previous_stock = +(instance.count_previous_stock);
                    const count_adjust_stock = +(instance.count_adjust_stock);
                    count_current_stock = count_previous_stock + count_adjust_stock;
                    instance.count_current_stock = count_current_stock;
                }
            }

            instance.count_previous_stock = String(instance.count_previous_stock);
            instance.count_adjust_stock = String(instance.count_adjust_stock);
            instance.count_current_stock = String(instance.count_current_stock);

            await validateCountStock(instance, options);
        };

        const validateDOT = async (instance, options) => {
            if (!_.isString(instance.dot_mfd) && !_.isNull(instance.dot_mfd)) {
                throw Error(`Require instance.dot_mfd is String DOT type or Null, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (_.isString(instance.dot_mfd)) {
                if ((/^[0-9]{1,4}$/).test(instance.dot_mfd) === false) {
                    throw Error(`Require instance.dot_mfd is String DOT type, instanceData: ${JSON.stringify(instance.toJSON())}`);
                }
            }
        };

        const serializeDOT = async (instance, options) => {
            if (_.isString(instance.dot_mfd)) {
                instance.dot_mfd = (String(instance.dot_mfd)).replace(/(\s)*/g, '');
            }
            if (instance.dot_mfd === '') {
                instance.dot_mfd = null;
            }

            await validateDOT(instance, options);
        };

        const checkShopWarehouseAndShopWarehouseShelfExists = async (instance, options) => {
            if (!isUUID(instance.warehouse_id)) { throw Error(`Require instance.warehouse_id is UUID type, instanceData: ${JSON.stringify(instance.toJSON())}`); }
            if (!_.isString(instance.warehouse_item_id) || !instance.warehouse_item_id) { throw Error(`Require instance.warehouse_item_id is String type, instanceData: ${JSON.stringify(instance.toJSON())}`); }
            const findWarehouse = await modelShopWarehouse.findOne({
                where: {
                    id: instance.warehouse_id
                },
                transaction: options.transaction
            });
            if (!findWarehouse) { throw Error(`Warehouse is not found, instanceData: ${JSON.stringify(instance.toJSON())}`); }
            else {
                /**
                 * @type {import("../../types/type.Model.ShopInventoryMovementLogs.Functions").IHookFunction_WarehouseShelf[]}
                 */
                const shelf = findWarehouse.get('shelf');
                if (!_.isArray(shelf)) { throw Error(`Attribute shelf in warehouse is not Array types, instanceData: ${JSON.stringify(instance.toJSON())}`); }
                else {
                    const findIndexOfShelfItemCode = shelf.findIndex(w => w.code === instance.warehouse_item_id);
                    if (findIndexOfShelfItemCode < 0 && instance.warehouse_item_id !== '001') {
                        throw Error(`Property instance.warehouse_item_id is not found from warehouse data, instanceData: ${JSON.stringify(instance.toJSON())}`);
                    }
                }
            }
        };

        const checkShopStockExists = async (instance, options) => {
            const findStockResult = await db.query(
                `
                    WITH CTE_1 AS (
                        SELECT
                            ShopStock.id AS id,
                            ShopStock.product_id AS product_id,
                            (ShopStockWarehouse->>'warehouse')::UUID AS warehouse_id,
                            (ShopStockWarehouseShelf->>'item')::Varchar AS warehouse_item_id,
                            (ShopStockWarehouseShelf->>'purchase_unit_id')::UUID AS purchase_unit_id,
                            (NULLIF(REPLACE((ShopStockWarehouseShelf ->>'dot_mfd'), '\s', ''), ''))::Char(4) AS dot_mfd,
                            (ShopStockWarehouseShelf->>'balance')::BIGINT AS balance,
                            ShopStock.balance_date AS balance_date,
                            ShopStock.created_date AS created_date,
                            ShopStock.created_by AS created_by,
                            ShopStock.updated_date AS updated_date,
                            ShopStock.updated_by AS updated_by
                        FROM app_shops_datas.dat_${table_name}_stock_products_balances AS ShopStock
                                 CROSS JOIN LATERAL json_array_elements(ShopStock.warehouse_detail) AS ShopStockWarehouse
                        CROSS JOIN LATERAL json_array_elements(ShopStockWarehouse.value->'shelf') AS ShopStockWarehouseShelf
                    ORDER BY
                        ShopStock.id ASC
                    )

                    SELECT id FROM CTE_1
                        WHERE id = $stock_id
                            AND product_id = $product_id
                            AND warehouse_id = $warehouse_id
                            AND warehouse_item_id = $warehouse_item_id
                            AND purchase_unit_id ${!instance.purchase_unit_id ? `ISNULL` : `= $purchase_unit_id`}
                            AND dot_mfd ${!instance.dot_mfd ? `ISNULL` : `= $dot_mfd`};
                    `,
                {
                    transaction: options.transaction,
                    type: QueryTypes.SELECT,
                    raw: true,
                    bind: {
                        stock_id: instance.stock_id,
                        product_id: instance.product_id,
                        warehouse_id: instance.warehouse_id,
                        warehouse_item_id: instance.warehouse_item_id,
                        purchase_unit_id: instance.purchase_unit_id,
                        dot_mfd: instance.dot_mfd
                    }
                }
            );
            if (findStockResult.length !== 1) {
                throw Error(`Stock is not found, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
        };

        const createRunNumber = async (instance, options) => {
            if (instance.isNewRecord) {
                await db.transaction(
                    {
                        transaction: options.transaction || null,
                        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                    },
                    async (transaction) => {
                        const currentRunNumber = await ShopInventoryMovementLog.count({ transaction: transaction });
                        instance.set({
                            run_no: (Number(currentRunNumber) + 1) + (options?.initNumber || 0)
                        });
                    }
                );
            }
        };

        ShopInventoryMovementLog.beforeValidate(async (instance, options) => {
            if (instance.isNewRecord && instance.get('is_migrated')) {
                return;
            }
            if (instance.isNewRecord && !instance.get('run_no')) {
                instance.set({
                    run_no: 0
                });
            }
            await serializeCountStock(instance, options);
            await serializeDOT(instance, options);
            await checkShopWarehouseAndShopWarehouseShelfExists(instance, options);
            await checkShopStockExists(instance, options);
        });

        ShopInventoryMovementLog.beforeCreate(async (instance, options) => {
            if (instance.isNewRecord && instance.get('is_migrated')) {
                return;
            }
            await serializeCountStock(instance, options);
            await serializeDOT(instance, options);
            await checkShopWarehouseAndShopWarehouseShelfExists(instance, options);
            await checkShopStockExists(instance, options)
            await createRunNumber(instance, options);
        });

        ShopInventoryMovementLog.beforeBulkCreate(async (instances, options) => {
            for (let i = 0; i < instances.length; i++) {
                if (instances[i].isNewRecord && instances[i].get('is_migrated')) {
                    continue;
                }
                await serializeCountStock(instances[i], options);
                await serializeDOT(instances[i], options);
                await checkShopWarehouseAndShopWarehouseShelfExists(instances[i], options);
                await checkShopStockExists(instances[i], options)
                options.initNumber = i;
                await createRunNumber(instances[i], options);
            }
        });

        ShopInventoryMovementLog.beforeUpdate(async (instance, options) => {
            if (instance.isNewRecord && instance.get('is_migrated')) {
                return;
            }
            await serializeCountStock(instance, options);
            await checkShopWarehouseAndShopWarehouseShelfExists(instance, options);
            await serializeDOT(instance, options);
        });

        return ShopInventoryMovementLog;
    }
};

module.exports = ShopInventoryMovementLog;