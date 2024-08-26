const _ = require("lodash");
const { Op, QueryTypes, DataTypes } = require("sequelize");
const { isUUID } = require("../utils/generate");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");
const ShopsProfiles = require("../models/model").ShopsProfiles;

const handlerShopReportsInventoryMovements_v3 = async (request) => {
    const handlerName = 'get ShopReportsSalesOut report v2';

    try {
        const fnAccept_isNull_isUUID = (value, defaultValue = '') => {
            return (_.isNull(value)) || isUUID(value)
                ? value
                : defaultValue
        };
        const fnAccept_isNull_isString = (value, defaultValue = '') => {
            return (_.isNull(value) || value === 'null') || (_.isString(value) && value.length > 0)
                ? value === 'null'
                    ? null
                    : value
                : defaultValue
        };
        const fnGetShopTable = async () => {
            const reqQuery_shop_ids = (_.get(request, 'query.shop_ids', ''))
                .split(',')
                .filter(w => isUUID(w));
            if (reqQuery_shop_ids.length > 0) {
                const findShopBranches = await ShopsProfiles.findAll({
                    where: {
                        id: {
                            [Op.in]: reqQuery_shop_ids
                        }
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
                return findShopBranches;
            }
            else {
                return await utilCheckShopTableName(request)
                    .then(r => _.isArray(r) ? r : [r]);
            }
        };

        const shop_tables = await fnGetShopTable();

        /**
         * @type {number}
         */
        const limit = request.query.limit || 10;
        /**
         * @type {number}
         */
        const page = request.query.page || 1;
        /**
         * @type {string}
         */
        const filter_by_shop_id = isUUID(request.query.shop_id) ? request.query.shop_id : '';
        /**
         * @type {string}
         */
        const filter_by_shop_product_id = isUUID(request.query.shop_product_id) ? request.query.shop_product_id : '';
        /**
         * @type {string}
         */
        const filter_by_product_id = isUUID(request.query.product_id) ? request.query.product_id : '';
        /**
         * @type {null|string}
         */
        const filter_by_product_group_id = fnAccept_isNull_isUUID(request.query.product_group_id);
        /**
         * @type {null|string}
         */
        const filter_by_product_type_id = fnAccept_isNull_isUUID(request.query.product_type_id);
        /**
         * @type {null|string}
         */
        const filter_by_product_brand_id = fnAccept_isNull_isUUID(request.query.product_brand_id);
        /**
         * @type {null|string}
         */
        const filter_by_product_model_id = fnAccept_isNull_isUUID(request.query.product_model_id);
        /**
         * @type {null|string}
         */
        const filter_by_product_complete_size_id = fnAccept_isNull_isUUID(request.query.complete_size_id);
        /**
         * @type {string}
         */
        const filter_by_warehouseId = isUUID(request.query.warehouse_id) ? request.query.warehouse_id : '';
        /**
         * @type {string}
         */
        const filter_by_warehouseItemId = _.isString(request.query.warehouse_item_id) ? request.query.warehouse_item_id : '';
        /**
         * @type {null|string}
         */
        const filter_by_purchaseUnitId = fnAccept_isNull_isUUID(request.query.purchase_unit_id);
        /**
         * @type {null|string}
         */
        const filter_by_DOT = fnAccept_isNull_isString(request.query.dot_mfd);
        /**
         * @type {Date|null}
         */
        const filter_by_startDate = /^((19|20)\d\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])$/.test(request.query.start_date || '')
            ? new Date(`${request.query.start_date} 00:00:00`)
            : null;
        /**
         * @type {Date|null}
         */
        const filter_by_endDate = /^((19|20)\d\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])$/.test(request.query.end_date || '')
            ? new Date(`${request.query.end_date} 23:59:59:999`)
            : null;

        const fnGenerateQuery_ShopMovement_WhereFilter = () => {
            const whereData = [];

            // "ShopInventoryMovementLog".shop_id
            if (filter_by_shop_id) {
                whereData.push(`("ShopInventoryMovementLog".shop_id = '${filter_by_shop_id}')`);
            }
            // "ShopInventoryMovementLog".product_id
            if (filter_by_shop_product_id) {
                whereData.push(`("ShopInventoryMovementLog".product_id = '${filter_by_shop_product_id}')`);
            }
            // "Product".id
            if (filter_by_product_id) {
                whereData.push(`("Product".id = '${filter_by_product_id}')`);
            }
            // "ProductType".id
            if (filter_by_product_type_id) {
                if (_.isNull(filter_by_product_type_id)) {
                    whereData.push(`("ProductType".id IS NULL)`);
                }
                if (isUUID(filter_by_product_type_id)) {
                    whereData.push(`("ProductType".id = '${filter_by_product_type_id}')`);
                }
            }
            // "ProductTypeGroup".id
            if (filter_by_product_group_id) {
                if (_.isNull(filter_by_product_group_id)) {
                    whereData.push(`("ProductTypeGroup".id IS NULL)`);
                }
                if (isUUID(filter_by_product_group_id)) {
                    whereData.push(`("ProductTypeGroup".id = '${filter_by_product_group_id}')`);
                }
            }
            // "ProductBrand".id
            if (filter_by_product_brand_id) {
                if (_.isNull(filter_by_product_brand_id)) {
                    whereData.push(`("ProductBrand".id IS NULL)`);
                }
                if (isUUID(filter_by_product_brand_id)) {
                    whereData.push(`("ProductBrand".id = '${filter_by_product_brand_id}')`);
                }
            }
            // "ProductModelType".id
            if (filter_by_product_model_id) {
                if (_.isNull(filter_by_product_model_id)) {
                    whereData.push(`"ProductModelType".id IS NULL`);
                }
                if (isUUID(filter_by_product_model_id)) {
                    whereData.push(`("ProductModelType".id = '${filter_by_product_model_id}')`);
                }
            }
            // "ProductCompleteSize".id
            if (filter_by_product_complete_size_id) {
                if (_.isNull(filter_by_product_complete_size_id)) {
                    whereData.push(`("ProductCompleteSize".id IS NULL)`);
                }
                if (isUUID(filter_by_product_complete_size_id)) {
                    whereData.push(`("ProductCompleteSize".id = '${filter_by_product_complete_size_id}')`);
                }
            }
            // "ShopInventoryMovementLog".warehouse_id
            if (filter_by_warehouseId) {
                whereData.push(`("ShopInventoryMovementLog".warehouse_id = '${filter_by_warehouseId}')`);
            }
            // "ShopInventoryMovementLog".warehouse_item_id
            if (filter_by_warehouseItemId) {
                whereData.push(`("ShopInventoryMovementLog".warehouse_item_id = '${filter_by_warehouseItemId}')`);
            }
            // "ShopInventoryMovementLog".purchase_unit_id
            if (_.isNull(filter_by_purchaseUnitId) || isUUID(filter_by_purchaseUnitId)) {
                if (_.isNull(filter_by_purchaseUnitId)) {
                    whereData.push(`("ShopInventoryMovementLog".purchase_unit_id IS NULL)`);
                }
                if (isUUID(filter_by_purchaseUnitId)) {
                    whereData.push(`("ShopInventoryMovementLog".purchase_unit_id = '${filter_by_purchaseUnitId}')`);
                }
            }
            // "ShopInventoryMovementLog".dot_mfd
            if ((_.isNull(filter_by_DOT)) || (_.isString(filter_by_DOT) && filter_by_DOT.length > 0)) {
                if (_.isNull(filter_by_DOT)) {
                    whereData.push(`("ShopInventoryMovementLog".dot_mfd IS NULL)`);
                }
                if (_.isString(filter_by_DOT) && filter_by_DOT.length > 0) {
                    whereData.push(`("ShopInventoryMovementLog".dot_mfd = '${filter_by_DOT}')`);
                }
            }

            // "ShopInventoryMovementLog".created_date
            if (_.isDate(filter_by_startDate) && _.isDate(filter_by_endDate)) {
                whereData.push(`("ShopInventoryMovementLog".created_date BETWEEN '${filter_by_startDate.toISOString()}' AND '${filter_by_endDate.toISOString()}')`);
            }
            else {
                if (_.isDate(filter_by_startDate) && _.isNull(filter_by_endDate)) {
                    whereData.push(`("ShopInventoryMovementLog".created_date >= '${filter_by_startDate.toISOString()}')`);
                }
                if (_.isNull(filter_by_startDate) && _.isDate(filter_by_endDate)) {
                    whereData.push(`("ShopInventoryMovementLog".created_date <= '${filter_by_endDate.toISOString()}')`);
                }
            }

            if (whereData.length > 0) {
                return `WHERE ${whereData.join(' AND ')}`;
            }
            else {
                return ``;
            }
        };

        const fnGenerateQuery_ShopMovement_SelectBranch = (table_name) => {
            const queryTableName = table_name.toLowerCase();
            return `
                SELECT
                    "ShopInventoryMovementLog".id AS "id",
                    "ShopInventoryMovementLog".run_no AS "run_no",
                    "ShopInventoryMovementLog".shop_id AS "shop_id",
                    "ShopInventoryMovementLog".product_id AS "product_id",
                    "ShopInventoryMovementLog".doc_inventory_id AS "doc_inventory_id",
                    "ShopInventoryMovementLog".doc_inventory_log_id AS "doc_inventory_log_id",
                    "ShopInventoryMovementLog".doc_sale_id AS "doc_sale_id",
                    "ShopInventoryMovementLog".doc_sale_log_id AS "doc_sale_log_id",
                    "ShopInventoryMovementLog".doc_wyz_auto_id AS "doc_wyz_auto_id",
                    "ShopInventoryMovementLog".stock_id AS "stock_id",
                    "ShopInventoryMovementLog".warehouse_id AS "warehouse_id",
                    "ShopInventoryMovementLog".warehouse_item_id AS "warehouse_item_id",
                    "ShopInventoryMovementLog".purchase_unit_id AS "purchase_unit_id",
                    "ShopInventoryMovementLog".dot_mfd AS "dot_mfd",
                    "ShopInventoryMovementLog".count_previous_stock AS "count_previous_stock",
                    "ShopInventoryMovementLog".count_adjust_stock AS "count_adjust_stock",
                    "ShopInventoryMovementLog".count_current_stock AS "count_current_stock",
                    "ShopInventoryMovementLog".details AS "details",
                    (SELECT user_name FROM systems.sysm_users WHERE id = "ShopInventoryMovementLog".created_by) AS "created_by",
                    "ShopInventoryMovementLog".created_date AS "created_date",
                    (SELECT user_name FROM systems.sysm_users WHERE id = "ShopInventoryMovementLog".updated_by) AS "updated_by",
                    "ShopInventoryMovementLog".updated_date AS "updated_date",

                    "ShopProduct".id AS "ShopProduct.id",
                    "ShopProduct".product_id AS "ShopProduct.product_id",
                    "ShopProduct".product_bar_code AS "ShopProduct.product_bar_code",
                    "ShopProduct".isuse AS "ShopProduct.status",
                    "ShopProduct".created_date AS "ShopProduct.created_date",
                    "ShopProduct".updated_date AS "ShopProduct.updated_date",

                    "Product".id AS "Product.id",
                    "Product".product_code AS "Product.product_code",
                    "Product".master_path_code_id AS "Product.master_path_code_id",
                    "Product".custom_path_code_id AS "Product.custom_path_code_id",
                    "Product".wyz_code AS "Product.wyz_code",
                    "Product".product_name->>'th' AS "Product.product_name",
                    "Product".product_type_id AS "Product.product_type_id",
                    "Product".product_brand_id AS "Product.product_brand_id",
                    "Product".product_model_id AS "Product.product_model_id",
                    "Product".complete_size_id AS "Product.complete_size_id",
                    "Product".isuse AS "Product.isuse",
                    "Product".created_date AS "Product.created_date",
                    "Product".updated_date AS "Product.updated_date",

                    "ProductType".id AS "ProductType.id",
                    "ProductType".code_id AS "ProductType.code_id",
                    "ProductType".type_name->>'th' AS "ProductType.type_name",
                    "ProductType".type_group_id AS "ProductType.type_group_id",

                    "ProductTypeGroup".id AS "ProductType.ProductTypeGroup.id",
                    "ProductTypeGroup".code_id AS "ProductType.ProductTypeGroup.code_id",
                    "ProductTypeGroup".internal_code_id AS "ProductType.ProductTypeGroup.internal_code_id",
                    "ProductTypeGroup".group_type_name->>'th' AS "ProductType.ProductTypeGroup.group_type_name",

                    "ProductBrand".id AS "ProductBrand.id",
                    "ProductBrand".code_id AS "ProductBrand.code_id",
                    "ProductBrand".brand_name->>'th' AS "ProductBrand.brand_name",

                    "ProductModelType".id AS "ProductModelType.id",
                    "ProductModelType".code_id AS "ProductModelType.code_id",
                    "ProductModelType".model_name->>'th' AS "ProductModelType.model_name",

                    "ProductCompleteSize".id AS "ProductCompleteSize.id",
                    "ProductCompleteSize".code_id AS "ProductCompleteSize.code_id",
                    "ProductCompleteSize".complete_size_name->>'th' AS "ProductCompleteSize.complete_size_name",

                    "ShopInventoryTransactionDoc".id AS "ShopInventoryTransactionDoc.id",
                    "ShopInventoryTransactionDoc".run_no AS "ShopInventoryTransactionDoc.run_no",
                    "ShopInventoryTransactionDoc".code_id AS "ShopInventoryTransactionDoc.code_id",
                    "ShopInventoryTransactionDoc".bus_partner_id AS "ShopInventoryTransactionDoc.bus_partner_id",
                    "ShopInventoryTransactionDoc".doc_date AS "ShopInventoryTransactionDoc.doc_date",
                    "ShopInventoryTransactionDoc".doc_type_id AS "ShopInventoryTransactionDoc.doc_type_id",
                    "ShopInventoryTransactionDoc".status AS "ShopInventoryTransactionDoc.status",
                    "ShopInventoryTransactionDoc".created_date AS "ShopInventoryTransactionDoc.created_date",
                    "ShopInventoryTransactionDoc".updated_date AS "ShopInventoryTransactionDoc.updated_date",
                    "ShopInventoryTransactionDoc.ShopBusinessPartner".id AS "ShopInventoryTransactionDoc.ShopBusinessPartner.id",
                    "ShopInventoryTransactionDoc.ShopBusinessPartner".code_id AS "ShopInventoryTransactionDoc.ShopBusinessPartner.code_id",
                    "ShopInventoryTransactionDoc.ShopBusinessPartner".partner_name->>'th' AS "ShopInventoryTransactionDoc.ShopBusinessPartner.partner_name",
                    "ShopInventoryTransactionDoc.DocumentType".id AS "ShopInventoryTransactionDoc.DocumentType.id",
                    "ShopInventoryTransactionDoc.DocumentType".internal_code_id AS "ShopInventoryTransactionDoc.DocumentType.internal_code_id",
                    "ShopInventoryTransactionDoc.DocumentType".type_name->>'th' AS "ShopInventoryTransactionDoc.DocumentType.type_name",

                    "ShopSalesTransactionDoc".id AS "STD.id",
                    "ShopSalesTransactionDoc".run_no AS "STD.run_no",
                    "ShopSalesTransactionDoc".code_id AS "STD.code_id",
                    "ShopSalesTransactionDoc".bus_customer_id AS "STD.bus_customer_id",
                    "ShopSalesTransactionDoc".per_customer_id AS "STD.per_customer_id",
                    "ShopSalesTransactionDoc".doc_date AS "STD.doc_date",
                    "ShopSalesTransactionDoc".doc_type_id AS "STD.doc_type_id",
                    "ShopSalesTransactionDoc".sale_type AS "STD.sale_type",
                    "ShopSalesTransactionDoc".purchase_status AS "STD.purchase_status",
                    "ShopSalesTransactionDoc".status AS "STD.status",
                    "ShopSalesTransactionDoc".created_date AS "STD.created_date",
                    "ShopSalesTransactionDoc".updated_date AS "STD.updated_date",
                
                    "ShopSalesTransactionDoc.ShopBusinessCustomer".id AS "STD.ShopBusinessCustomer.id",
                    "ShopSalesTransactionDoc.ShopBusinessCustomer".master_customer_code_id AS "STD.ShopBusinessCustomer.master_customer_code_id",
                    "ShopSalesTransactionDoc.ShopBusinessCustomer".customer_name->>'th' AS "STD.ShopBusinessCustomer.customer_name",
                    "ShopSalesTransactionDoc.ShopPersonalCustomer".id AS "STD.ShopPersonalCustomer.id",
                    "ShopSalesTransactionDoc.ShopPersonalCustomer".master_customer_code_id AS "STD.ShopPersonalCustomer.master_customer_code_id",
                    (
                        ("ShopSalesTransactionDoc.ShopPersonalCustomer".customer_name->'first_name'->>'th')
                        || ' ' ||
                        ("ShopSalesTransactionDoc.ShopPersonalCustomer".customer_name->'last_name'->>'th')
                    ) AS "STD.ShopPersonalCustomer.customer_name",
                    "ShopSalesTransactionDoc.DocumentType".id AS "STD.DocumentType.id",
                    "ShopSalesTransactionDoc.DocumentType".internal_code_id AS "STD.DocumentType.internal_code_id",
                    "ShopSalesTransactionDoc.DocumentType".type_name->>'th' AS "STD.DocumentType.type_name",

                    "ShopProductsHoldWYZAuto".id AS "ShopWYZAuto.id",
                    "ShopProductsHoldWYZAuto".product_id AS "ShopWYZAuto.product_id",
                    "ShopProductsHoldWYZAuto".start_date AS "ShopWYZAuto.start_date",
                    "ShopProductsHoldWYZAuto".end_date AS "ShopWYZAuto.end_date",
                    "ShopProductsHoldWYZAuto".isuse AS "ShopWYZAuto.status",
                    "ShopProductsHoldWYZAuto".created_by AS "ShopWYZAuto.created_by",
                    "ShopProductsHoldWYZAuto".created_date AS "ShopWYZAuto.created_date",
                    "ShopProductsHoldWYZAuto".updated_by AS "ShopWYZAuto.updated_by",
                    "ShopProductsHoldWYZAuto".updated_date AS "ShopWYZAuto.updated_date"

                FROM app_shops_datas.dat_${queryTableName}_inventory_movement_logs AS "ShopInventoryMovementLog"
                    JOIN app_shops_datas.dat_${queryTableName}_products AS "ShopProduct" ON "ShopProduct".id = "ShopInventoryMovementLog".product_id
                    JOIN app_datas.dat_products AS "Product" ON "Product".id = "ShopProduct".product_id
                    LEFT JOIN master_lookup.mas_product_types AS "ProductType" ON "ProductType".id = "Product".product_type_id
                    LEFT JOIN master_lookup.mas_product_type_groups AS "ProductTypeGroup" ON "ProductTypeGroup".id = "ProductType".type_group_id
                    LEFT JOIN master_lookup.mas_product_brands AS "ProductBrand" ON "ProductBrand".id = "Product".product_brand_id
                    LEFT JOIN master_lookup.mas_product_complete_sizes AS "ProductCompleteSize" ON "ProductCompleteSize".id = "Product".complete_size_id
                    LEFT JOIN master_lookup.mas_product_model_types AS "ProductModelType" ON "ProductModelType".id = "Product".product_model_id
                    LEFT JOIN app_shops_datas.dat_${queryTableName}_inventory_transaction_doc AS "ShopInventoryTransactionDoc" ON "ShopInventoryTransactionDoc".id = "ShopInventoryMovementLog".doc_inventory_id
                    LEFT JOIN master_lookup.mas_document_types AS "ShopInventoryTransactionDoc.DocumentType" ON  "ShopInventoryTransactionDoc.DocumentType".id = "ShopInventoryTransactionDoc".doc_type_id
                    LEFT JOIN app_shops_datas.dat_${queryTableName}_business_partners AS "ShopInventoryTransactionDoc.ShopBusinessPartner" ON "ShopInventoryTransactionDoc.ShopBusinessPartner".id = "ShopInventoryTransactionDoc".bus_partner_id
                    LEFT JOIN app_shops_datas.dat_${queryTableName}_sales_transaction_doc AS "ShopSalesTransactionDoc" ON "ShopSalesTransactionDoc".id = "ShopInventoryMovementLog".doc_sale_id
                    LEFT JOIN master_lookup.mas_document_types AS "ShopSalesTransactionDoc.DocumentType" ON  "ShopSalesTransactionDoc.DocumentType".id = "ShopSalesTransactionDoc".doc_type_id
                    LEFT JOIN app_shops_datas.dat_${queryTableName}_business_customers AS "ShopSalesTransactionDoc.ShopBusinessCustomer" ON "ShopSalesTransactionDoc.ShopBusinessCustomer".id = "ShopSalesTransactionDoc".bus_customer_id
                    LEFT JOIN app_shops_datas.dat_${queryTableName}_personal_customers AS "ShopSalesTransactionDoc.ShopPersonalCustomer" ON "ShopSalesTransactionDoc.ShopPersonalCustomer".id = "ShopSalesTransactionDoc".per_customer_id
                    LEFT JOIN app_shops_datas.dat_${queryTableName}_products_hold_wyzauto AS "ShopProductsHoldWYZAuto" ON "ShopProductsHoldWYZAuto".product_id = "ShopInventoryMovementLog".id
                        
                ${fnGenerateQuery_ShopMovement_WhereFilter()}
            `;
        };

        const fnGenerateQuery_ShopMovement_UnionBranch = (shop_tables) => {
            const queryInCTE = shop_tables.reduce((previousValue, currentValue, currentIndex) => {
                if (currentIndex === 0) {
                    return `(${fnGenerateQuery_ShopMovement_SelectBranch(currentValue.shop_code_id)})`;
                }
                else {
                    return `${previousValue} UNION ALL (${fnGenerateQuery_ShopMovement_SelectBranch(currentValue.shop_code_id)})`;
                }
            }, '');

            return `WITH CTE_ShopInventoryMovment AS ( ${queryInCTE} )`
        };

        const fnGenerateModel_ShopInventoryMovement_v3 = () => {
            const attrModel = {
                "id": {
                    type: DataTypes.UUID,
                    primaryKey: true,
                },
                "run_no": {
                    type: DataTypes.INTEGER,
                },
                "shop_id": {
                    type: DataTypes.UUID,
                },
                "product_id": {
                    type: DataTypes.UUID,
                },
                "doc_inventory_id": {
                    type: DataTypes.UUID,
                },
                "doc_inventory_log_id": {
                    type: DataTypes.UUID,
                },
                "doc_sale_id": {
                    type: DataTypes.UUID,
                },
                "doc_sale_log_id": {
                    type: DataTypes.UUID,
                },
                "doc_wyz_auto_id": {
                    type: DataTypes.UUID,
                },
                "stock_id": {
                    type: DataTypes.UUID,
                },
                "warehouse_id": {
                    type: DataTypes.UUID,
                },
                "warehouse_item_id": {
                    type: DataTypes.STRING,
                },
                "purchase_unit_id": {
                    type: DataTypes.UUID,
                },
                "dot_mfd": {
                    type: DataTypes.STRING,
                },
                "count_previous_stock": {
                    type: DataTypes.BIGINT,
                },
                "count_adjust_stock": {
                    type: DataTypes.BIGINT,
                },
                "count_current_stock": {
                    type: DataTypes.BIGINT,
                },
                "ShopProduct.id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.product_id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.product_bar_code": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.status": {
                    type: DataTypes.BIGINT,
                },
                "ShopProduct.created_date": {
                    type: DataTypes.DATE,
                },
                "ShopProduct.updated_date": {
                    type: DataTypes.DATE,
                },
                "ShopProduct.Product.id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.product_code": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.master_path_code_id": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.custom_path_code_id": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.wyz_code": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.product_name": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.product_type_id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.product_brand_id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.product_model_id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.complete_size_id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.isuse": {
                    type: DataTypes.SMALLINT,
                },
                "ShopProduct.Product.created_date": {
                    type: DataTypes.DATE,
                },
                "ShopProduct.Product.updated_date": {
                    type: DataTypes.DATE,
                },
                "ShopProduct.Product.ProductType.id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.ProductType.code_id": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductType.type_name": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductType.type_group_id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.ProductType.ProductTypeGroup.id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.ProductType.ProductTypeGroup.code_id": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductType.ProductTypeGroup.internal_code_id": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductType.ProductTypeGroup.group_type_name": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductBrand.id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.ProductBrand.code_id": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductBrand.brand_name": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductModelType.id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.ProductModelType.code_id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.ProductModelType.model_name": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductCompleteSize.id": {
                    type: DataTypes.UUID,
                },
                "ShopProduct.Product.ProductCompleteSize.code_id": {
                    type: DataTypes.STRING,
                },
                "ShopProduct.Product.ProductCompleteSize.complete_size_name": {
                    type: DataTypes.STRING,
                },
                "ShopInventoryTransactionDoc.id": {
                    type: DataTypes.UUID,
                },
                "ShopInventoryTransactionDoc.run_no": {
                    type: DataTypes.INTEGER,
                },
                "ShopInventoryTransactionDoc.code_id": {
                    type: DataTypes.STRING,
                },
                "ShopInventoryTransactionDoc.bus_partner_id": {
                    type: DataTypes.UUID,
                },
                "ShopInventoryTransactionDoc.doc_date": {
                    type: DataTypes.DATEONLY,
                },
                "ShopInventoryTransactionDoc.doc_type_id": {
                    type: DataTypes.UUID,
                },
                "ShopInventoryTransactionDoc.status": {
                    type: DataTypes.SMALLINT,
                },
                "ShopInventoryTransactionDoc.created_date": {
                    type: DataTypes.DATE,
                },
                "ShopInventoryTransactionDoc.updated_date": {
                    type: DataTypes.DATE,
                },
                "ShopInventoryTransactionDoc.ShopBusinessPartner.id": {
                    type: DataTypes.UUID,
                },
                "ShopInventoryTransactionDoc.ShopBusinessPartner.code_id": {
                    type: DataTypes.STRING,
                },
                "ShopInventoryTransactionDoc.ShopBusinessPartner.partner_name": {
                    type: DataTypes.STRING,
                },
                "ShopInventoryTransactionDoc.DocumentType.id": {
                    type: DataTypes.UUID,
                },
                "ShopInventoryTransactionDoc.DocumentType.internal_code_id": {
                    type: DataTypes.STRING,
                },
                "ShopInventoryTransactionDoc.DocumentType.type_name": {
                    type: DataTypes.STRING,
                },

                "ShopSalesTransactionDoc.id": {
                    type: DataTypes.UUID,
                },
                "ShopSalesTransactionDoc.run_no": {
                    type: DataTypes.INTEGER,
                },
                "ShopSalesTransactionDoc.code_id": {
                    type: DataTypes.STRING,
                },
                "ShopSalesTransactionDoc.bus_customer_id": {
                    type: DataTypes.UUID,
                },
                "ShopSalesTransactionDoc.per_customer_id": {
                    type: DataTypes.UUID,
                },
                "ShopSalesTransactionDoc.doc_date": {
                    type: DataTypes.DATEONLY,
                },
                "ShopSalesTransactionDoc.doc_type_id": {
                    type: DataTypes.UUID,
                },
                "ShopSalesTransactionDoc.sale_type": {
                    type: DataTypes.BOOLEAN,
                },
                "ShopSalesTransactionDoc.purchase_status": {
                    type: DataTypes.BOOLEAN,
                },
                "ShopSalesTransactionDoc.status": {
                    type: DataTypes.SMALLINT,
                },
                "ShopSalesTransactionDoc.created_date": {
                    type: DataTypes.DATE,
                },
                "ShopSalesTransactionDoc.updated_date": {
                    type: DataTypes.DATE,
                },

                "ShopSalesTransactionDoc.ShopBusinessCustomer.id": {
                    type: DataTypes.UUID,
                },
                "ShopSalesTransactionDoc.ShopBusinessCustomer.master_customer_code_id": {
                    type: DataTypes.STRING,
                },
                "ShopSalesTransactionDoc.ShopBusinessCustomer.customer_name": {
                    type: DataTypes.STRING,
                },
                "ShopSalesTransactionDoc.ShopPersonalCustomer.id": {
                    type: DataTypes.UUID,
                },
                "ShopSalesTransactionDoc.ShopPersonalCustomer.master_customer_code_id": {
                    type: DataTypes.STRING,
                },
                "ShopSalesTransactionDoc.ShopPersonalCustomer.customer_name": {
                    type: DataTypes.STRING,
                },
                "ShopSalesTransactionDoc.DocumentType.id": {
                    type: DataTypes.UUID,
                },
                "ShopSalesTransactionDoc.DocumentType.internal_code_id": {
                    type: DataTypes.STRING,
                },
                "ShopSalesTransactionDoc.DocumentType.type_name": {
                    type: DataTypes.STRING,
                },

                "ShopProductsHoldWYZAuto.id": {
                    type: DataTypes.UUID,
                },
                "ShopProductsHoldWYZAuto.product_id": {
                    type: DataTypes.UUID,
                },
                "ShopProductsHoldWYZAuto.start_date": {
                    type: DataTypes.DATE,
                },
                "ShopProductsHoldWYZAuto.end_date": {
                    type: DataTypes.DATE,
                },
                "ShopProductsHoldWYZAuto.status": {
                    type: DataTypes.SMALLINT,
                },
                "ShopProductsHoldWYZAuto.created_by": {
                    type: DataTypes.UUID,
                },
                "ShopProductsHoldWYZAuto.created_date": {
                    type: DataTypes.DATE,
                },
                "ShopProductsHoldWYZAuto.updated_by": {
                    type: DataTypes.UUID,
                },
                "ShopProductsHoldWYZAuto.updated_date": {
                    type: DataTypes.DATE,
                }
            };
            _.keys(attrModel).forEach((key, index) => {
                if (!(attrModel[key].__skipField)) {
                    attrModel[key].field = `_${index}`;
                }
            });
            return attrModel;
        };

        const modelShopInventoryMovement_v3 = fnGenerateModel_ShopInventoryMovement_v3();

        const modelQuery = db.define("ShopInventoryMovement_v3", modelShopInventoryMovement_v3);

        /**
         * @type {import("sequelize").BindOrReplacements}
         */
        const whereQuery = {
            offset: (page - 1) * limit,
            limit: limit,
        };

        const fnDataResult = async () => await db.query(
            `
                ${fnGenerateQuery_ShopMovement_UnionBranch(shop_tables)}
                SELECT
                    id AS "_0",
                    run_no AS "_1",
                    shop_id AS "_2",
                    product_id AS "_3",
                    doc_inventory_id AS "_4",
                    doc_inventory_log_id AS "_5",
                    doc_sale_id AS "_6",
                    doc_sale_log_id AS "_7",
                    doc_wyz_auto_id AS "_8",
                    stock_id AS "_9",
                    warehouse_id AS "_10",
                    warehouse_item_id AS "_11",
                    purchase_unit_id AS "_12",
                    dot_mfd AS "_13",
                    count_previous_stock AS "_14",
                    count_adjust_stock AS "_15",
                    count_current_stock AS "_16",
                    
                    "ShopProduct.id" AS "_17",
                    "ShopProduct.product_id" AS "_18",
                    "ShopProduct.product_bar_code" AS "_19",
                    "ShopProduct.status" AS "_20",
                    "ShopProduct.created_date" AS "_21",
                    "ShopProduct.updated_date" AS "_22",
                    
                    "Product.id" AS "_23",
                    "Product.product_code" AS "_24",
                    "Product.master_path_code_id" AS "_25",
                    "Product.custom_path_code_id" AS "_26",
                    "Product.wyz_code" AS "_27",
                    "Product.product_name" AS "_28",
                    "Product.product_type_id" AS "_29",
                    "Product.product_brand_id" AS "_30",
                    "Product.product_model_id" AS "_31",
                    "Product.complete_size_id" AS "_32",
                    "Product.isuse" AS "_33",
                    "Product.created_date" AS "_34",
                    "Product.updated_date" AS "_35",
                    "ProductType.id" AS "_36",
                    "ProductType.code_id" AS "_37",
                    "ProductType.type_name" AS "_38",
                    "ProductType.type_group_id" AS "_39",
                    "ProductType.ProductTypeGroup.id" AS "_40",
                    "ProductType.ProductTypeGroup.code_id" AS "_41",
                    "ProductType.ProductTypeGroup.internal_code_id" AS "_42",
                    "ProductType.ProductTypeGroup.group_type_name" AS "_43",
                    "ProductBrand.id" AS "_44",
                    "ProductBrand.code_id" AS "_45",
                    "ProductBrand.brand_name" AS "_46",
                    "ProductModelType.id" AS "_47",
                    "ProductModelType.code_id" AS "_48",
                    "ProductModelType.model_name" AS "_49",
                    "ProductCompleteSize.id" AS "_50",
                    "ProductCompleteSize.code_id" AS "_51",
                    "ProductCompleteSize.complete_size_name" AS "_52",

                    "ShopInventoryTransactionDoc.id" AS "_53",
                    "ShopInventoryTransactionDoc.run_no" AS "_54",
                    "ShopInventoryTransactionDoc.code_id" AS "_55",
                    "ShopInventoryTransactionDoc.bus_partner_id" AS "_56",
                    "ShopInventoryTransactionDoc.doc_date" AS "_57",
                    "ShopInventoryTransactionDoc.doc_type_id" AS "_58",
                    "ShopInventoryTransactionDoc.status" AS "_59",
                    "ShopInventoryTransactionDoc.created_date" AS "_60",
                    "ShopInventoryTransactionDoc.updated_date" AS "_61",
                    "ShopInventoryTransactionDoc.ShopBusinessPartner.id" AS "_62",
                    "ShopInventoryTransactionDoc.ShopBusinessPartner.code_id" AS "_63",
                    "ShopInventoryTransactionDoc.ShopBusinessPartner.partner_name" AS "_64",
                    "ShopInventoryTransactionDoc.DocumentType.id" AS "_65",
                    "ShopInventoryTransactionDoc.DocumentType.internal_code_id" AS "_66",
                    "ShopInventoryTransactionDoc.DocumentType.type_name" AS "_67",

                    "STD.id" AS "_68",
                    "STD.run_no" AS "_69",
                    "STD.code_id" AS "_70",
                    "STD.bus_customer_id" AS "_71",
                    "STD.per_customer_id" AS "_72",
                    "STD.doc_date" AS "_73",
                    "STD.doc_type_id" AS "_74",
                    "STD.sale_type" AS "_75",
                    "STD.purchase_status" AS "_76",
                    "STD.status" AS "_77",
                    "STD.created_date" AS "_78",
                    "STD.updated_date" AS "_79",

                    "STD.ShopBusinessCustomer.id" AS "_80",
                    "STD.ShopBusinessCustomer.master_customer_code_id" AS "_81",
                    "STD.ShopBusinessCustomer.customer_name" AS "_82",
                    "STD.ShopPersonalCustomer.id" AS "_83",
                    "STD.ShopPersonalCustomer.master_customer_code_id" AS "_84",
                    "STD.ShopPersonalCustomer.customer_name" AS "_85",
                    "STD.DocumentType.id" AS "_86",
                    "STD.DocumentType.internal_code_id" AS "_87",
                    "STD.DocumentType.type_name" AS "_88",

                    "ShopWYZAuto.id" AS "_89",
                    "ShopWYZAuto.product_id" AS "_90",
                    "ShopWYZAuto.start_date" AS "_91",
                    "ShopWYZAuto.end_date" AS "_92",
                    "ShopWYZAuto.status" AS "_93",
                    "ShopWYZAuto.created_by" AS "_94",
                    "ShopWYZAuto.created_date" AS "_95",
                    "ShopWYZAuto.updated_by" AS "_96",
                    "ShopWYZAuto.updated_date" AS "_97"

                FROM CTE_ShopInventoryMovment
                    
                OFFSET :offset
                LIMIT :limit;
            `,
            {
                type: QueryTypes.SELECT,
                model: modelQuery,
                mapToModel: true,
                raw: true,
                nest: true,
                replacements: whereQuery
            }
        ).then(r => {
                // Assign to Null when nested object data 'id' is Null
                r.forEach(element => {
                    if (!(_.get(element, 'ShopProduct.id'))) {
                        element.ShopProduct = null;
                    }
                    else {
                        if (!(_.get(element, 'ShopProduct.Product.id'))) {
                            element.ShopProduct.Product = null;
                        }
                        else {
                            if (!(_.get(element, 'ShopProduct.Product.ProductType.id'))) {
                                element.ShopProduct.Product.ProductType = null;
                            }

                            if (!(_.get(element, 'ShopProduct.Product.ProductBrand.id'))) {
                                element.ShopProduct.Product.ProductBrand = null;
                            }
                            if (!(_.get(element, 'ShopProduct.Product.ProductModelType.id'))) {
                                element.ShopProduct.Product.ProductModelType = null;
                            }
                            if (!(_.get(element, 'ShopProduct.Product.ProductCompleteSize.id'))) {
                                element.ShopProduct.Product.ProductCompleteSize = null;
                            }
                        }
                    }

                    if (!(_.get(element, 'ShopInventoryTransactionDoc.id'))) {
                        element.ShopInventoryTransactionDoc = null;
                    }

                    if (!(_.get(element, 'ShopSalesTransactionDoc.id'))) {
                        element.ShopSalesTransactionDoc = null;
                    }

                    if (!(_.get(element, 'ShopProductsHoldWYZAuto.id'))) {
                        element.ShopSalesTransactionDoc = null;
                    }
                })
                return r;
            });

        const fnCountResult = async () => await db.query(
            `
                ${fnGenerateQuery_ShopMovement_UnionBranch(shop_tables)}
                SELECT COUNT(*) AS "countData"

                FROM CTE_ShopInventoryMovment
                    
                OFFSET :offset
                LIMIT :limit;
            `,
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: whereQuery
            }
        ).then(r => Number(r[0].countData));

        const [DataResult, CountResult] = await Promise.all([fnDataResult(), fnCountResult()]);

        const responseData = {
            currentPage: page,
            pages: Math.ceil(CountResult / limit),
            currentCount: DataResult.length,
            totalCount: CountResult,
            data: DataResult
        };

        await handleSaveLog(request, [[handlerName, '', request.query], '']);

        return utilSetFastifyResponseJson("success", responseData);
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], error]);

        throw error;
    }
};


module.exports = handlerShopReportsInventoryMovements_v3;
