const _ = require("lodash");
const { Op, literal } = require("sequelize");
const { isUUID } = require("../utils/generate");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelDocumentTypes = require("../models/model").DocumentTypes;
const modelProduct = require("../models/model").Product;
const ProductType = require("../models/model").ProductType;
const ProductBrand = require("../models/model").ProductBrand;
const ProductModelType = require("../models/model").ProductModelType;
const ProductTypeGroup = require("../models/model").ProductTypeGroup;
const ProductCompleteSize = require("../models/model").ProductCompleteSize;
const ShopsProfiles = require("../models/model").ShopsProfiles;
const modelShopProduct = require("../models/model").ShopProduct;
const modelShopBusinessPartners = require("../models/model").ShopBusinessPartners;
const modelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers;
const modelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers;
const modelShopInventoryTransaction = require("../models/model").ShopInventoryTransaction;
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;
const modelShopProductsHoldWYZAuto = require("../models/model").ShopProductsHoldWYZauto;
const modelShopServiceOrderDoc = require("../models/model").ShopServiceOrderDoc;
const modelShopServiceOrderList = require("../models/model").ShopServiceOrderList;
const modelShopInventoryMovementLogs = require("../models/model").ShopInventoryMovementLog;

const handlerShopReportsInventoryMovements_v2 = async (request) => {
    const handlerName = 'get ShopReportsSalesOut report v2';

    try {
        const limit = request.query.limit || 10;
        const page = request.query.page || 1;

        const filter_by_productId = isUUID(request.query.product_id) ? request.query.product_id : '';
        const filter_product_group_id = isUUID(request.query.product_group_id) ? request.query.product_group_id : '';
        const filter_product_type_id = isUUID(request.query.product_type_id) ? request.query.product_type_id : '';
        const filter_product_brand_id = isUUID(request.query.product_brand_id) ? request.query.product_brand_id : '';
        const filter_product_model_id = isUUID(request.query.product_model_id) ? request.query.product_model_id : '';
        const filter_product_complete_size_id = isUUID(request.query.complete_size_id) ? request.query.complete_size_id : '';
        const filter_by_warehouseId = isUUID(request.query.warehouse_id) ? request.query.warehouse_id : '';
        const filter_by_warehouseItemId = _.isString(request.query.warehouse_item_id) ? request.query.warehouse_item_id : '';
        const filter_by_DOT = _.isString(request.query.dot_mfd) ? request.query.dot_mfd : '';
        const filter_by_purchaseUnitId = isUUID(request.query.purchase_unit_id) ? request.query.purchase_unit_id : '';
        const filter_by_startDate = /^((19|20)\d\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])$/.test(request.query.start_date || '')
            ? new Date(`${request.query.start_date} 00:00:00`)
            : null;
        const filter_by_endDate = /^((19|20)\d\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])$/.test(request.query.end_date || '')
            ? new Date(`${request.query.end_date} 23:59:59:999`)
            : null;

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = !isUUID(request.query.shop_id)
            ? findShopsProfile.shop_code_id
            : await ShopsProfiles.findOne({
                where: {
                    id: request.query.shop_id
                }
            }).then(result => result.shop_code_id.toLowerCase());

        const instanceShopProduct = modelShopProduct(table_name);
        const instanceShopBusinessPartners = modelShopBusinessPartners(table_name);
        const instanceShopInventoryTransaction = modelShopInventoryTransaction(table_name);
        const instanceShopSalesTransactionDoc = modelShopSalesTransactionDoc(table_name);
        const instanceShopServiceOrderDoc = modelShopServiceOrderDoc(table_name);
        const instanceShopServiceOrderList = modelShopServiceOrderList(table_name);
        const instanceShopProductsHoldWYZAuto = modelShopProductsHoldWYZAuto(table_name);
        const instanceShopInventoryMovementLogs = modelShopInventoryMovementLogs(table_name);
        const instanceShopBusinessCustomers = modelShopBusinessCustomers(table_name);
        const instanceShopPersonalCustomers = modelShopPersonalCustomers(table_name);

        instanceShopSalesTransactionDoc.belongsTo(modelDocumentTypes, { foreignKey: 'doc_type_id', as: 'DocumentType' });
        instanceShopInventoryTransaction.belongsTo(modelDocumentTypes, { foreignKey: 'doc_type_id', as: 'DocumentType' });

        instanceShopInventoryTransaction.belongsTo(instanceShopBusinessPartners, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartner' });
        instanceShopSalesTransactionDoc.belongsTo(instanceShopBusinessCustomers, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
        instanceShopSalesTransactionDoc.belongsTo(instanceShopPersonalCustomers, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });

        const queryObjectWhere = () => {
            const queryResult = {};
            const queryOp_AND = [];
            if (filter_by_productId && isUUID(filter_by_productId)) {
                queryOp_AND.push({
                    product_id: filter_by_productId
                });
            }
            if (filter_product_group_id && isUUID(filter_product_group_id)) {
                queryOp_AND.push({
                    '$"ShopProduct->Product->ProductType"."type_group_id"$': filter_product_group_id
                });
            }
            if (filter_product_type_id && isUUID(filter_product_type_id)) {
                queryOp_AND.push({
                    '$"ShopProduct->Product"."product_type_id"$': filter_product_type_id
                });
            }
            if (filter_product_brand_id && isUUID(filter_product_brand_id)) {
                queryOp_AND.push({
                    '$"ShopProduct->Product"."product_brand_id"$': filter_product_brand_id
                });
            }
            if (filter_product_model_id && isUUID(filter_product_model_id)) {
                queryOp_AND.push({
                    '$"ShopProduct->Product"."product_model_id"$': filter_product_model_id
                });
            }
            if (filter_product_complete_size_id && isUUID(filter_product_complete_size_id)) {
                queryOp_AND.push({
                    '$"ShopProduct->Product"."complete_size_id"$': filter_product_complete_size_id
                });
            }
            if (filter_by_warehouseId && isUUID(filter_by_warehouseId)) {
                queryOp_AND.push({
                    warehouse_id: filter_by_warehouseId
                });
            }
            if (filter_by_warehouseItemId && _.isString(filter_by_warehouseItemId)) {
                queryOp_AND.push({
                    warehouse_item_id: filter_by_warehouseItemId
                });
            }
            if (filter_by_DOT && _.isString(filter_by_DOT)) {
                queryOp_AND.push({
                    dot_mfd: filter_by_DOT
                });
            }
            if (filter_by_purchaseUnitId && isUUID(filter_by_purchaseUnitId)) {
                queryOp_AND.push({
                    purchase_unit_id: filter_by_purchaseUnitId
                });
            }

            if (_.isDate(filter_by_startDate) && _.isDate(filter_by_endDate)) {
                queryOp_AND.push({
                    created_date: {
                        [Op.between]: [filter_by_startDate, filter_by_endDate]
                    }
                });
            }
            else {
                if (_.isDate(filter_by_startDate) && _.isNull(filter_by_endDate)) {
                    queryOp_AND.push({
                        created_date: {
                            [Op.gte]: filter_by_startDate
                        }
                    });
                }
                if (_.isNull(filter_by_startDate) && _.isDate(filter_by_endDate)) {
                    queryOp_AND.push({
                        created_date: {
                            [Op.lte]: filter_by_endDate
                        }
                    });
                }
            }

            if (queryOp_AND.length > 0) {
                queryResult[Op.and] = _.concat(queryResult[Op.and] || [], queryOp_AND);
            }

            return queryResult;
        };

        const queryWhere = queryObjectWhere();
        /**
         * @type {import("sequelize/types/model").FindAttributeOptions}
         */
        const queryAttributes = {
            include: [
                [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE "id" = "ShopInventoryMovementLog"."created_by")`), 'created_by'],
                [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE "id" = "ShopInventoryMovementLog"."updated_by")`), 'updated_by'],
            ]
        };
        /**
         * @type {import("sequelize/types/model").Includeable | import("sequelize/types/model").Includeable[]}
         */
        const queryInclude = [
            {
                model: instanceShopProduct,
                as: 'ShopProduct',
                required: false,
                attributes: [
                    'id',
                    'product_id',
                    'product_bar_code',
                    ['isuse', 'status'],
                    'created_date',
                    'updated_date'
                ],
                include: [
                    {
                        model: modelProduct,
                        required: true,
                        attributes: [
                            'id',
                            'product_code',
                            'master_path_code_id',
                            'custom_path_code_id',
                            'wyz_code',
                            [`"product_name"->>'th'`, 'product_name'],
                            'product_type_id',
                            'product_brand_id',
                            'product_model_id',
                            'complete_size_id',
                            ['isuse', 'status'],
                            'created_date',
                            'updated_date'
                        ],
                        include: [
                            {
                                model: ProductType,
                                required: false,
                                attributes: [
                                    'id',
                                    'code_id',
                                    [`"type_name"->>'th'`, 'type_name'],
                                    'type_group_id'
                                ],
                                include: [
                                    {
                                        model: ProductTypeGroup,
                                        required: false,
                                        attributes: [
                                            'id',
                                            'code_id',
                                            'internal_code_id',
                                            [`"group_type_name"->>'th'`, 'group_type_name']
                                        ]
                                    }
                                ]
                            },
                            {
                                model: ProductBrand,
                                required: false,
                                attributes: [
                                    'id',
                                    'code_id',
                                    [`"brand_name"->>'th'`, 'brand_name'],
                                ],
                            },
                            {
                                model: ProductModelType,
                                required: false,
                                attributes: [
                                    'id',
                                    'code_id',
                                    [`"model_name"->>'th'`, 'model_name']
                                ],
                            },
                            {
                                model: ProductCompleteSize,
                                required: false,
                                attributes: [
                                    'id',
                                    'code_id',
                                    [`"complete_size_name"->>'th'`, 'complete_size_name']
                                ],
                            }
                        ]
                    },
                ]
            },
            {
                model: instanceShopInventoryTransaction,
                as: 'ShopInventoryTransactionDoc',
                required: false,
                attributes: [
                    'id',
                    'run_no',
                    'code_id',
                    'bus_partner_id',
                    'doc_date',
                    'doc_type_id',
                    'status',
                    'created_date',
                    'updated_date'
                ],
                include: [
                    {
                        model: instanceShopBusinessPartners,
                        as: 'ShopBusinessPartner',
                        required: false,
                        attributes: [
                            'id',
                            'code_id',
                            [`"partner_name"->>'th'`, 'partner_name']
                        ]
                    },
                    {
                        model: modelDocumentTypes,
                        as: 'DocumentType',
                        required: false,
                        attributes: [
                            'id',
                            'internal_code_id',
                            [`"type_name"->>'th'`, 'type_name']
                        ]
                    }
                ]
            },
            {
                model: instanceShopSalesTransactionDoc,
                as: 'ShopSalesTransactionDoc',
                required: false,
                attributes: [
                    'id',
                    'run_no',
                    'code_id',
                    'bus_customer_id',
                    'per_customer_id',
                    'doc_date',
                    'doc_type_id',
                    'sale_type',
                    'purchase_status',
                    'status',
                    'created_date',
                    'updated_date'
                ],
                include: [
                    {
                        model: instanceShopBusinessCustomers,
                        as: 'ShopBusinessCustomer',
                        required: false,
                        attributes: [
                            'id',
                            'master_customer_code_id',
                            [`"customer_name"->>'th'`, 'customer_name']
                        ]
                    },
                    {
                        model: instanceShopPersonalCustomers,
                        as: 'ShopPersonalCustomer',
                        required: false,
                        attributes: [
                            'id',
                            'master_customer_code_id',
                            [literal(`coalesce(coalesce("ShopSalesTransactionDoc->ShopPersonalCustomer"."customer_name"->'first_name'->>'th', '') || coalesce(' ' || ("ShopSalesTransactionDoc->ShopPersonalCustomer"."customer_name"->'last_name'->>'th'), ''), '')`), 'customer_name']
                        ]
                    },
                    {
                        model: modelDocumentTypes,
                        as: 'DocumentType',
                        required: false,
                        attributes: [
                            'id',
                            'internal_code_id',
                            [`"type_name"->>'th'`, 'type_name']
                        ]
                    }
                ]
            },
            {
                model: instanceShopServiceOrderDoc,
                as: 'ShopServiceOrderDoc',
                required: false,
                attributes: [
                    'id',
                    'code_id',
                    'bus_customer_id',
                    'per_customer_id',
                    'doc_date',
                    'doc_type_id',
                    'doc_sales_type',
                    'payment_paid_status',
                    'status',
                    'created_date',
                    'updated_date'
                ],
                include: [
                    {
                        model: instanceShopBusinessCustomers,
                        as: 'ShopBusinessCustomer',
                        required: false,
                        attributes: [
                            'id',
                            'master_customer_code_id',
                            [`"customer_name"->>'th'`, 'customer_name']
                        ]
                    },
                    {
                        model: instanceShopPersonalCustomers,
                        as: 'ShopPersonalCustomer',
                        required: false,
                        attributes: [
                            'id',
                            'master_customer_code_id',
                            [literal(`coalesce(coalesce("ShopServiceOrderDoc->ShopPersonalCustomer"."customer_name"->'first_name'->>'th', '') || coalesce(' ' || ("ShopServiceOrderDoc->ShopPersonalCustomer"."customer_name"->'last_name'->>'th'), ''), '')`), 'customer_name']
                        ]
                    },
                    {
                        model: modelDocumentTypes,
                        as: 'DocumentType',
                        required: false,
                        attributes: [
                            'id',
                            'internal_code_id',
                            [`"type_name"->>'th'`, 'type_name']
                        ]
                    }
                ]
            },
            {
                model: instanceShopProductsHoldWYZAuto,
                as: 'ShopProductsHoldWYZAuto',
                required: false,
                attributes: [
                    'id',
                    'product_id',
                    'start_date',
                    'end_date',
                    ['isuse', 'status'],
                    'created_by',
                    'created_date',
                    'updated_by',
                    'updated_date',
                ]
            }
        ];

        const fnFindResult = async () => await instanceShopInventoryMovementLogs.findAll({
            attributes: queryAttributes,
            include: queryInclude,
            where: queryWhere,
            order: [['created_date', 'DESC'], ['run_no', 'DESC']],
            limit: limit,
            offset: (page - 1) * limit
        });

        const fnLengthFindResult = async () => await instanceShopInventoryMovementLogs.count({
            attributes: queryAttributes,
            include: queryInclude,
            where: queryWhere,
        });

        const [findResult, lengthFindResult] = await Promise.all([fnFindResult(), fnLengthFindResult()])

        const result = {
            currentPage: +page,
            pages: Math.ceil(lengthFindResult / limit),
            currentCount: findResult.length,
            totalCount: lengthFindResult,
            data: findResult
        };

        await handleSaveLog(request, [[handlerName, '', request.query], '']);

        return utilSetFastifyResponseJson("success", result);
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], error]);

        throw error;
    }
};


module.exports = handlerShopReportsInventoryMovements_v2;
