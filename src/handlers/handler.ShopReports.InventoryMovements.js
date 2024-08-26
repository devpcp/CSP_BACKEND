const _ = require("lodash");
const { QueryTypes, DataTypes } = require("sequelize");
const { paginate, isUUID } = require("../utils/generate");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");

const handlerShopReportsInventoryMovements = async (request) => {
    const handlerName = 'get ShopReportsSalesOut report';

    try {
        const limit = request.query.limit || 10;
        const page = request.query.page || 1;

        const filter_by_productId = request.query.product_id || ''; // 1f73713b-8f34-4add-8d14-f1566d4410be
        const filter_by_warehouseId = isUUID(request.query.warehouse_id) ? request.query.warehouse_id : '';
        const filter_by_warehouseItemId = _.isString(request.query.warehouse_item_id) ? request.query.warehouse_item_id : '';
        const filter_by_DOT = _.isString(request.query.dot_mfd) ? request.query.dot_mfd : '';
        const filter_by_purchaseUnitId = isUUID(request.query.purchase_unit_id) ? request.query.purchase_unit_id : '';
        const filter_by_documentTypeId = isUUID(request.query.doc_type_id) ? request.query.doc_type_id : '';

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const ModelProductMovementLog_INI = db.define('ProductMovementLog', {
            "id": {
                field: '_0',
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false
            },
            "doc_inventory_id": {
                field: '_1',
                type: DataTypes.UUID,
                allowNull: false
            },
            "product_id": {
                field: '_2',
                type: DataTypes.UUID,
                allowNull: false
            },
            "warehouse_id": {
                field: '_3',
                type: DataTypes.UUID,
                allowNull: false
            },
            "warehouse_item_id": {
                field: '_4',
                type: DataTypes.STRING,
                allowNull: false
            },
            "dot_mfd": {
                field: '_5',
                type: DataTypes.CHAR(4),
                allowNull: true
            },
            "purchase_unit_id": {
                field: '_6',
                type: DataTypes.UUID,
                allowNull: true
            },
            "amount": {
                field: '_7',
                type: DataTypes.BIGINT,
                allowNull: false
            },
            "status": {
                field: '_8',
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            "created_date": {
                field: '_9',
                type: DataTypes.DATE,
                allowNull: false
            },
            "created_by": {
                field: '_10',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopInventoryTransaction.id": {
                field: '_11',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopInventoryTransaction.code_id": {
                field: '_12',
                type: DataTypes.STRING,
                allowNull: false
            },
            "ShopInventoryTransaction.doc_date": {
                field: '_13',
                type: DataTypes.DATE,
                allowNull: true
            },
            "ShopInventoryTransaction.doc_type_id": {
                field: '_14',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopInventoryTransaction.bus_partner_id": {
                field: '_15',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopInventoryTransaction.created_date": {
                field: '_16',
                type: DataTypes.DATE,
                allowNull: false
            },
            "ShopInventoryTransaction.created_by": {
                field: '_17',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopInventoryTransaction.updated_date": {
                field: '_18',
                type: DataTypes.DATE,
                allowNull: true
            },
            "ShopInventoryTransaction.updated_by": {
                field: '_19',
                type: DataTypes.UUID,
                allowNull: true
            },
            "ShopInventoryTransaction.DocumentType.id": {
                field: '_20',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopInventoryTransaction.DocumentType.internal_code_id": {
                field: '_21',
                type: DataTypes.STRING,
                allowNull: false
            },
            "ShopInventoryTransaction.DocumentType.type_name": {
                field: '_22',
                type: DataTypes.STRING,
                allowNull: true
            },
            "ShopInventoryTransaction.ShopBusinessPartner.id": {
                field: '_23',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopInventoryTransaction.ShopBusinessPartner.code_id": {
                field: '_24',
                type: DataTypes.STRING,
                allowNull: false
            },
            "ShopInventoryTransaction.ShopBusinessPartner.partner_name": {
                field: '_25',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.partner_name": {
                field: '_25',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.id": {
                field: '_26',
                type: DataTypes.UUID,
                allowNull: false
            },
            "Product.master_path_code_id": {
                field: '_27',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.custom_path_code_id": {
                field: '_28',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.product_name": {
                field: '_29',
                type: DataTypes.STRING,
                allowNull: true
            }
        });

        const ModelProductMovementLog_SO = db.define('ProductMovementLog', {
            "id": {
                field: '_0',
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false
            },
            "doc_sale_id": {
                field: '_1',
                type: DataTypes.UUID,
                allowNull: false
            },
            "product_id": {
                field: '_2',
                type: DataTypes.UUID,
                allowNull: false
            },
            "warehouse_id": {
                field: '_3',
                type: DataTypes.UUID,
                allowNull: false
            },
            "warehouse_item_id": {
                field: '_4',
                type: DataTypes.STRING,
                allowNull: false
            },
            "dot_mfd": {
                field: '_5',
                type: DataTypes.CHAR(4),
                allowNull: true
            },
            "purchase_unit_id": {
                field: '_6',
                type: DataTypes.UUID,
                allowNull: true
            },
            "amount": {
                field: '_7',
                type: DataTypes.BIGINT,
                allowNull: false
            },
            "status": {
                field: '_8',
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            "created_date": {
                field: '_9',
                type: DataTypes.DATE,
                allowNull: false
            },
            "created_by": {
                field: '_10',
                type: DataTypes.UUID,
                allowNull: false
            },
            "updated_date": {
                field: '_11',
                type: DataTypes.DATE,
                allowNull: true
            },
            "updated_by": {
                field: '_12',
                type: DataTypes.UUID,
                allowNull: true
            },

            "ShopSalesTransactionDoc.id": {
                field: '_13',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopSalesTransactionDoc.code_id": {
                field: '_14',
                type: DataTypes.STRING,
                allowNull: false
            },
            "ShopSalesTransactionDoc.doc_date": {
                field: '_15',
                type: DataTypes.DATE,
                allowNull: true
            },
            "ShopSalesTransactionDoc.doc_type_id": {
                field: '_16',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopSalesTransactionDoc.per_customer_id": {
                field: '_17',
                type: DataTypes.UUID,
                allowNull: true
            },
            "ShopSalesTransactionDoc.bus_customer_id": {
                field: '_18',
                type: DataTypes.UUID,
                allowNull: true
            },
            "ShopSalesTransactionDoc.created_date": {
                field: '_19',
                type: DataTypes.DATE,
                allowNull: false
            },
            "ShopSalesTransactionDoc.created_by": {
                field: '_20',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopSalesTransactionDoc.updated_date": {
                field: '_21',
                type: DataTypes.DATE,
                allowNull: true
            },
            "ShopSalesTransactionDoc.updated_by": {
                field: '_22',
                type: DataTypes.UUID,
                allowNull: true
            },
            "ShopSalesTransactionDoc.DocumentType.id": {
                field: '_23',
                type: DataTypes.UUID,
                allowNull: false
            },
            "ShopSalesTransactionDoc.DocumentType.internal_code_id": {
                field: '_24',
                type: DataTypes.STRING,
                allowNull: false
            },
            "ShopSalesTransactionDoc.DocumentType.type_name": {
                field: '_25',
                type: DataTypes.STRING,
                allowNull: true
            },
            "ShopSalesTransactionDoc.ShopPersonalCustomer.id": {
                field: '_26',
                type: DataTypes.UUID,
                allowNull: true
            },
            "ShopSalesTransactionDoc.ShopPersonalCustomer.master_customer_code_id": {
                field: '_27',
                type: DataTypes.STRING,
                allowNull: true
            },
            "ShopSalesTransactionDoc.ShopPersonalCustomer.customer_name": {
                field: '_28',
                type: DataTypes.STRING,
                allowNull: true
            },
            "ShopSalesTransactionDoc.ShopBusinessCustomer.id": {
                field: '_29',
                type: DataTypes.UUID,
                allowNull: true
            },
            "ShopSalesTransactionDoc.ShopBusinessCustomer.master_customer_code_id": {
                field: '_30',
                type: DataTypes.STRING,
                allowNull: true
            },
            "ShopSalesTransactionDoc.ShopBusinessCustomer.customer_name": {
                field: '_31',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.id": {
                field: '_32',
                type: DataTypes.UUID,
                allowNull: false
            },
            "Product.master_path_code_id": {
                field: '_33',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.custom_path_code_id": {
                field: '_34',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.product_name": {
                field: '_35',
                type: DataTypes.STRING,
                allowNull: true
            }
        });

        const ModelProductMovementLog_WYZAuto = db.define('ProductMovementLog', {
            "id": {
                field: '_0',
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false
            },
            "product_id": {
                field: '_1',
                type: DataTypes.UUID,
                allowNull: false
            },
            "warehouse_id": {
                field: '_2',
                type: DataTypes.UUID,
                allowNull: false
            },
            "warehouse_item_id": {
                field: '_3',
                type: DataTypes.STRING,
                allowNull: false
            },
            "dot_mfd": {
                field: '_4',
                type: DataTypes.CHAR(4),
                allowNull: true
            },
            "purchase_unit_id": {
                field: '_5',
                type: DataTypes.UUID,
                allowNull: true
            },
            "amount": {
                field: '_6',
                type: DataTypes.BIGINT,
                allowNull: false
            },
            "status": {
                field: '_7',
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            "start_date": {
                field: '_8',
                type: DataTypes.DATE,
                allowNull: false
            },
            "end_date": {
                field: '_9',
                type: DataTypes.DATE,
                allowNull: false
            },
            "created_date": {
                field: '_10',
                type: DataTypes.DATE,
                allowNull: false
            },
            "created_by": {
                field: '_11',
                type: DataTypes.UUID,
                allowNull: false
            },
            "updated_date": {
                field: '_12',
                type: DataTypes.DATE,
                allowNull: true
            },
            "updated_by": {
                field: '_13',
                type: DataTypes.UUID,
                allowNull: true
            },
            "Product.id": {
                field: '_14',
                type: DataTypes.UUID,
                allowNull: false
            },
            "Product.master_path_code_id": {
                field: '_15',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.custom_path_code_id": {
                field: '_16',
                type: DataTypes.STRING,
                allowNull: true
            },
            "Product.wyz_code": {
                field: '_17',
                type: DataTypes.UUID,
                allowNull: false
            },
            "Product.product_name": {
                field: '_18',
                type: DataTypes.STRING,
                allowNull: true
            }
        });

        /**
         * @returns {Promise<import('../types/type.Handler.ShopReports.InventoryMovements').IInventoryMovement[]>}
         */
        const fnQueryResult = async () => {
            return _.concat(
                ...(await Promise.all([
                    db.query(
                        `
                        SELECT
                            logs.id AS "_0",
                            logs.doc_inventory_id AS "_1",
                            logs.product_id AS "_2",
                            (stock_warehouse->>'warehouse')::uuid AS "_3",
                            (stock_warehouse->'shelf'->>'item')::Varchar AS "_4",
                            (stock_warehouse->'shelf'->>'dot_mfd')::Char(4) AS "_5",
                            (stock_warehouse->'shelf'->>'purchase_unit_id')::uuid AS "_6",
                            (stock_warehouse->'shelf'->>'amount')::BIGINT AS "_7",
                            logs.status AS "_8",
                            logs.created_date AS "_9",
                            logs.created_by AS "_10",
                            
                            shop_transaction_doc.id AS "_11",
                            shop_transaction_doc.code_id AS "_12",
                            shop_transaction_doc.doc_date AS "_13",
                            shop_transaction_doc.doc_type_id AS "_14",
                            shop_transaction_doc.bus_partner_id AS "_15",
                            shop_transaction_doc.created_date AS "_16",
                            shop_transaction_doc.created_by AS "_17",
                            shop_transaction_doc.updated_date AS "_18",
                            shop_transaction_doc.updated_by AS "_19",
                            
                            mas_document_types.id AS "_20",
                            mas_document_types.internal_code_id AS "_21",
                            mas_document_types.type_name->>'th' AS "_22",
                        
                            shop_business_partner.id AS "_23",
                            shop_business_partner.code_id AS "_24",
                            shop_business_partner.partner_name->>'th' AS "_25",

                            hq_product.id AS "_26",
                            hq_product.master_path_code_id AS "_27",
                            hq_product.custom_path_code_id AS "_28",
                            hq_product.product_name->>'th' AS "_29"
                        
                        FROM app_shops_datas.dat_${table_name}_inventory_management_logs AS logs
                            CROSS JOIN LATERAL json_array_elements(logs.warehouse_detail) AS stock_warehouse
                            JOIN app_shops_datas.dat_${table_name}_inventory_transaction_doc AS shop_transaction_doc ON logs.doc_inventory_id = shop_transaction_doc.id
                            JOIN master_lookup.mas_document_types AS mas_document_types ON mas_document_types.id = shop_transaction_doc.doc_type_id
                            JOIN app_shops_datas.dat_${table_name}_business_partners AS shop_business_partner ON shop_transaction_doc.bus_partner_id = shop_business_partner.id
                            JOIN app_shops_datas.dat_${table_name}_products AS shop_product ON logs.product_id = shop_product.id
                            JOIN app_datas.dat_products AS hq_product ON shop_product.product_id = hq_product.id
                        WHERE logs.status = 1
                            ${!isUUID(filter_by_productId) ? '' : `AND logs.product_id = '${filter_by_productId}'`}
                            ${!filter_by_warehouseId ? '' : `AND (stock_warehouse->>'warehouse')::uuid = '${filter_by_warehouseId}'`}
                            ${!filter_by_warehouseItemId ? '' : `AND (stock_warehouse->'shelf'->>'item')::Varchar = '${filter_by_warehouseItemId}'`}
                            ${!filter_by_DOT ? '' : `AND (stock_warehouse->'shelf'->>'dot_mfd')::Char(4) = '${filter_by_DOT}'`}
                            ${!filter_by_purchaseUnitId ? '' : `AND (stock_warehouse->'shelf'->>'purchase_unit_id')::uuid = '${filter_by_purchaseUnitId}'`}
                        `,
                        {
                            type: QueryTypes.SELECT,
                            model: ModelProductMovementLog_INI,
                            mapToModel: true,
                            raw: true,
                            nest: true
                        }
                    ),
                    db.query(
                        `
                        SELECT
                            logs.id AS "_0",
                            logs.doc_sale_id AS "_1",
                            logs.product_id AS "_2",
                            (logs.warehouse_detail->>'warehouse')::uuid AS "_3",
                            (stock_warehouse->>'item')::Varchar AS "_4",
                            (stock_warehouse->>'dot_mfd')::Char(4) AS "_5",
                            (stock_warehouse->>'purchase_unit_id')::uuid AS "_6",
                            ((stock_warehouse->>'amount')::BIGINT * -1) AS "_7",
                            logs.status AS "_8",
                            logs.created_date AS "_9",
                            logs.created_by AS "_10",
                            logs.updated_date AS "_11",
                            logs.updated_by AS "_12",
                            
                            shop_sales_transaction_doc.id AS "_13",
                            shop_sales_transaction_doc.code_id AS "_14",
                            shop_sales_transaction_doc.doc_date AS "_15",
                            shop_sales_transaction_doc.doc_type_id AS "_16",
                            shop_sales_transaction_doc.per_customer_id AS "_17",
                            shop_sales_transaction_doc.bus_customer_id AS "_18",
                            shop_sales_transaction_doc.created_date AS "_19",
                            shop_sales_transaction_doc.created_by AS "_20",
                            shop_sales_transaction_doc.updated_date AS "_21",
                            shop_sales_transaction_doc.updated_by AS "_22",
                            
                            mas_document_types.id AS "_23",
                            mas_document_types.internal_code_id AS "_24",
                            mas_document_types.type_name->>'th' AS "_25",
                            
                            shop_personal_customer.id AS "_26",
                            shop_personal_customer.master_customer_code_id AS "_27",
                            (shop_personal_customer.customer_name->'first_name'->>'th') || ' ' || (shop_personal_customer.customer_name->'last_name'->>'th') AS "_28",
                            
                            shop_business_customer.id AS "_29",
                            shop_business_customer.master_customer_code_id AS "_30",
                            (shop_business_customer.customer_name->>'th') AS "_31",
                        
                            hq_product.id AS "_32",
                            hq_product.master_path_code_id AS "_33",
                            hq_product.custom_path_code_id AS "_34",
                            hq_product.product_name->>'th' AS "_35"
        
                        FROM app_shops_datas.dat_${table_name}_sales_order_plan_logs AS logs
                            CROSS JOIN LATERAL json_array_elements(logs.warehouse_detail->'shelf') AS stock_warehouse
                            JOIN app_shops_datas.dat_${table_name}_sales_transaction_doc AS shop_sales_transaction_doc ON logs.doc_sale_id = shop_sales_transaction_doc.id
                            JOIN master_lookup.mas_document_types AS mas_document_types ON mas_document_types.id = shop_sales_transaction_doc.doc_type_id
                            LEFT JOIN app_shops_datas.dat_${table_name}_personal_customers AS shop_personal_customer ON shop_sales_transaction_doc.per_customer_id = shop_personal_customer.id
                            LEFT JOIN app_shops_datas.dat_${table_name}_business_customers AS shop_business_customer ON shop_sales_transaction_doc.bus_customer_id = shop_business_customer.id
                            JOIN app_shops_datas.dat_${table_name}_products AS shop_product ON logs.product_id = shop_product.id
                            JOIN app_datas.dat_products AS hq_product ON shop_product.product_id = hq_product.id
                        WHERE logs.status = 1
                            ${!isUUID(filter_by_productId) ? '' : `AND logs.product_id = '${filter_by_productId}'`}
                            ${!filter_by_warehouseId ? '' : `AND (logs.warehouse_detail->>'warehouse')::uuid = '${filter_by_warehouseId}'`}
                            ${!filter_by_warehouseItemId ? '' : `AND (stock_warehouse->>'item')::Varchar = '${filter_by_warehouseItemId}'`}
                            ${!filter_by_DOT ? '' : `AND (stock_warehouse->>'dot_mfd')::Char(4) = '${filter_by_DOT}'`}
                            ${!filter_by_purchaseUnitId ? '' : `AND (stock_warehouse->>'purchase_unit_id')::uuid = '${filter_by_purchaseUnitId}'`}
                    `,
                        {
                            type: QueryTypes.SELECT,
                            model: ModelProductMovementLog_SO,
                            mapToModel: true,
                            raw: true,
                            nest: true
                        }
                    ),
                    db.query(
                        `
                        WITH 
                            CTE_1 (row_id, wyz_log_id, product_id, warehouse_id, warehouse_item_id, dot_mfd, purchase_unit_id, amount, status, start_date, end_date, created_date, created_by, updated_date, updated_by) AS
                            (
                                SELECT
                                    ROW_NUMBER() OVER(ORDER BY wyz_log.created_date ASC) AS row_id,
                                    wyz_log.id AS wyz_log_id,
                                    wyz_log.product_id AS product_id,
                                    (stock_warehouse->>'warehouse_id'):: UUID AS warehouse_id,
                                    stock_warehouse->>'shelfItem_id' AS warehouse_item_id,
                                    (wyz_log.details ->> 'dot'):: Char(4) AS dot_mfd,
                                    ('103790b2-e9ab-411b-91cf-a22dbf624cbc')::UUID AS purchase_unit_id,
                                    (stock_warehouse ->> 'holding_product'):: BIGINT * -1 AS amount,
                                    wyz_log.isuse,
                                    wyz_log.start_date,
                                    wyz_log.end_date,
                                    wyz_log.created_date,
                                    wyz_log.created_by,
                                    wyz_log.updated_date,
                                    wyz_log.updated_by
                                FROM app_shops_datas.dat_01hq0002_products_hold_wyzauto AS wyz_log
                                CROSS
                                JOIN LATERAL json_array_elements(wyz_log.details -> 'warehouse_details') AS stock_warehouse
                                ORDER BY wyz_log.created_date ASC
                            ),
                            CTE_2 AS
                            (
                                SELECT *,
                                    1 AS seq
                                FROM CTE_1 AS AA
                                UNION ALL
                                (
                                    SELECT 
                                        row_id,
                                        wyz_log_id,
                                        product_id,
                                        warehouse_id,
                                        warehouse_item_id,
                                        dot_mfd,
                                        purchase_unit_id,
                                        ((amount) * (-1)) AS amount,
                                        status,
                                        start_date,
                                        end_date,
                                        created_date,
                                        created_by,
                                        updated_date + INTERVAL '2 mins',
                                        updated_by,
                                        2 AS seq
                                    FROM CTE_1
                                    WHERE CTE_1.end_date NOTNULL
                                )
                            ),
                            CTE_3 AS
                            (
                                SELECT ROW_NUMBER() OVER(ORDER BY AA.row_id ASC, AA.seq ASC) AS row_id_2nd, *
                                FROM CTE_2 AS AA
                                ORDER BY AA.row_id ASC, AA.seq ASC
                            )
                            SELECT
                                   AA.wyz_log_id AS "_0",
                                   AA.product_id AS "_1",
                                   AA.warehouse_id AS "_2",
                                   AA.warehouse_item_id AS "_3",
                                   AA.dot_mfd AS "_4",
                                   AA.purchase_unit_id AS "_5",
                                   AA.amount AS "_6",
                                   AA.status AS "_7",
                                   AA.start_date AS "_8",
                                   AA.end_date AS "_9",
                                   AA.created_date AS "_10",
                                   AA.created_by AS "_11",
                                   AA.updated_date AS "_12",
                                   AA.updated_by AS "_13",
                                   hq_product.id AS "_14",
                                   hq_product.master_path_code_id AS "_15",
                                   hq_product.custom_path_code_id AS "_16",
                                   hq_product.wyz_code AS "_17",
                                   hq_product.product_name->>'th' AS "_18"
                            FROM CTE_3 AS AA
                            JOIN app_shops_datas.dat_${table_name}_products AS shop_product ON AA.product_id = shop_product.id
                            JOIN app_datas.dat_products AS hq_product ON shop_product.product_id = hq_product.id
                            WHERE AA.status = 1
                            ${!isUUID(filter_by_productId) ? '' : `AND AA.product_id = '${filter_by_productId}'`}
                            ${!filter_by_warehouseId ? '' : `AND AA.warehouse_id = '${filter_by_warehouseId}'`}
                            ${!filter_by_warehouseItemId ? '' : `AND AA.warehouse_item_id = '${filter_by_warehouseItemId}'`}
                            ${!filter_by_DOT ? '' : `AND AA.dot_mfd = '${filter_by_DOT}'`}
                            ${!filter_by_purchaseUnitId ? '' : `AND AA.purchase_unit_id = '${filter_by_purchaseUnitId}'`}
                            ORDER BY AA.row_id_2nd DESC;
                        `,
                        {
                            type: QueryTypes.SELECT,
                            model: ModelProductMovementLog_WYZAuto,
                            mapToModel: true,
                            raw: true,
                            nest: true
                        }
                    )
                ]))
            )
        }

        /**
         * @returns {Promise<import('../types/type.Handler.ShopReports.InventoryMovements').IInventoryMovement[]>}
         */
        const fnSortQueryResult = async () => {
            return _.orderBy(
                await fnQueryResult(),
                (w) => {
                    return [new Date(w.created_date).valueOf(), new Date(w.updated_date || 0).valueOf()]
                },
                ['asc', 'desc']
            )
        };

        /**
         * @returns {Promise<import('../types/type.Handler.ShopReports.InventoryMovements').IInventoryMovement[]>}
         */
        const fnReduceMovement = async () => (await fnSortQueryResult()).reduce((previousValue, currentValue) => {
            const findLatestUpdateMovement = _.findLastIndex(
                previousValue,
                (w) => {
                    return currentValue.product_id === w.product_id
                        && currentValue.warehouse_id === w.warehouse_id
                        && currentValue.warehouse_item_id === w.warehouse_item_id
                        && currentValue.purchase_unit_id === w.purchase_unit_id
                        && currentValue.dot_mfd === w.dot_mfd
                }
            );

            if (findLatestUpdateMovement < 0) {
                currentValue.previousStockAmount = Number(currentValue.amount);
                currentValue.currentStockAmount = Number(currentValue.amount);
            }

            if (findLatestUpdateMovement >= 0) {
                currentValue.previousStockAmount = Number(previousValue[findLatestUpdateMovement].currentStockAmount);
                currentValue.currentStockAmount = currentValue.previousStockAmount + Number(currentValue.amount);
            }

            previousValue.push(currentValue);

            return previousValue;
        },
            /**
             * @type {import('../types/type.Handler.ShopReports.InventoryMovements').IInventoryMovement[]}
             */
            []
        );

        /**
         * @returns {Promise<import('../types/type.Handler.ShopReports.InventoryMovements').IInventoryMovement[]>}
         */
        const fnSortResult = async () => {
            return _.orderBy(
                await fnReduceMovement(),
                (w) => {
                    return [new Date(w.created_date).valueOf(), new Date(w.updated_date || 0).valueOf()]
                },
                ['desc', 'desc']
            )
        };

        const fnFilterResult = async () => {
            const filterRules = {};

            // if (filter_by_warehouseId) { filterRules['warehouse_id'] = filter_by_warehouseId  }

            // if (filter_by_warehouseItem) { filterRules['warehouse_item_id'] = filter_by_warehouseItem  }
            //
            // if (filter_by_DOT) { filterRules['dot_mfd'] = filter_by_DOT  }
            //
            // if (filter_by_purchaseUnitId) { filterRules['purchase_unit_id'] = filter_by_purchaseUnitId  }
            //
            // if (filter_by_documentTypeId) { filterRules['ShopSalesTransactionDoc.DocumentType.id'] = filter_by_documentTypeId  }

            if (_.keys(filterRules).length === 0) {
                return await fnSortResult();
            }
            else {
                return _.filter(await fnSortResult(), filterRules);
            }
        };

        const result = await fnSortResult();

        await handleSaveLog(request, [[handlerName], '']);

        return utilSetFastifyResponseJson('success', paginate(result, limit, page));
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopReportsInventoryMovements;
