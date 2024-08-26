const _ = require('lodash');
const { Op, QueryTypes } = require("sequelize");
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilCheckShopTableName = require('../utils/util.CheckShopTableName');
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const { isNull, isUUID } = require('../utils/generate');

db = require("../db");
const Product = require('../models/model').Product;
const ProductType = require('../models/model').ProductType;
const ProductBrand = require('../models/model').ProductBrand;
const ProductCompleteSize = require('../models/model').ProductCompleteSize;
const ProductModelType = require('../models/model').ProductModelType;
const ProductPurchaseUnitTypes = require('../models/model').ProductPurchaseUnitTypes;
const ShopProduct = require('../models/model').ShopProduct;
const ShopProductPriceLog = require('../models/model').ShopProductPriceLog;
const fs = require('fs');
const XLSX = require('xlsx-js-style');
const { ProductTypeGroup, ShopsProfiles } = require('../models/model');
const handleUploadFile = require('../handlers/handler.Upload.File.V2')
const ShopTags = require("../models/ShopTags/ShopTags");
const { v4: uuid4 } = require("uuid");

const handleShopProductAll = async (request, res) => {



    // request.id = '232bbbd7-5a70-46da-8af3-a71a7503b564'

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

    // var shop_table = await utilCheckShopTableName(request, 'select_shop_ids')
    var table_name = shop_table.shop_code_id

    let page = request.query.page;
    let limit = (request.query.limit);
    /**
     * @type {string}
     */
    let search = request.query.search || '';
    /**
     * @type {Array<string>}
     */
    const searchPaths = (request.query?.searchPaths || '').split(',').filter(w => w.length > 0);
    var sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;
    var type_group_id = request.query.type_group_id;
    var product_type_id = request.query.product_type_id;
    var product_brand_id = request.query.product_brand_id;
    var product_model_id = request.query.product_model_id;
    const dropdown = request.query.dropdown
    let tags = request.query.tags
    const export_format = request.query.export_format
    const center_product_id = request.query.center_product_id

    if (export_format === 'xlsx') {
        page = 1;
        limit = 10000000;
    }


    //call sync() when this table does not yet exist
    ShopTags(table_name)

    let inc_attr = (dropdown) ? { attributes: [] } : {}
    let select_attr_shop_product = (dropdown) ? ['id', 'product_id', 'product_bar_code'] : {
        include: [
            [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopProduct\".\"created_by\" )"), 'created_by'],
            [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopProduct\".\"updated_by\" )"), 'updated_by'],
            [db.Sequelize.literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopProduct\".\"tags\"))`), 'tags'],
            [db.Sequelize.literal(`
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
                    WHERE X.shop_product_id = "ShopProduct".id
                    LIMIT 1
                ),0)::numeric(20,2))
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_product_cost'],
            [db.Sequelize.literal(`
                (coalesce((
                    SELECT
                        avg(X.product_cost)::numeric(20,2) AS product_cost_average
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
                    WHERE X.shop_product_id = "ShopProduct".id
                    GROUP BY X.shop_product_id
                ),0)::numeric(20,2))
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'product_cost_average'],
            [db.Sequelize.literal(`
                (coalesce((
                    SELECT 
                        (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'retail', '0'))::numeric(20,2)  AS product_price_latest
                    FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product 
                    WHERE sq_shop_product.id = "ShopProduct".id
                ),0)::numeric(20,2))
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_product_price']
        ]
    }

    let select_attr_product = (dropdown) ? { attributes: ['id', 'product_code', 'master_path_code_id', 'product_name'] } : {}


    if (sort == 'suggested_online_price') {
        sort = db.literal("cast(price->>'suggested_online_price' as integer)")
    } else if (sort == 'suggasted_re_sell_price') {
        sort = db.literal("cast(price->>'suggasted_re_sell_price' as integer)")
    }


    var isuse = []
    if (status == 'delete') {
        isuse = [2]
    } else if (status == 'active') {
        isuse = [1]
    } else if (status == 'block') {
        isuse = [0]
    } else {
        isuse = [1, 0]
    }

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
                    storedSearchQueries.push(db.Sequelize.literal(`REGEXP_REPLACE("Product"."product_name"->>'${w}', '[^0-9]', '', 'g') LIKE '${search}%'`));
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
                storedSearchQueries.push(db.literal(`"Product"."product_name"->>'${whereLang}' iLIKE '%${extractSearch.reduce((previousValue, currentValue) => {
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
        //     storedSearchQueries.push(db.literal(`"Product"."product_code" iLIKE '%${extractSearchBrand}%'`));
        //     storedSearchQueries.push(db.literal(`"Product"."master_path_code_id" iLIKE '%${extractSearchBrand}%'`));
        //
        //     storedSearchQueries.push({
        //         [Op.and]: [
        //             {
        //                 [Op.or]: [
        //                     db.literal(`"Product->ProductBrand"."brand_name"->>'th' iLIKE '%${extractSearchBrand}%'`),
        //                     db.literal(`"Product->ProductBrand"."brand_name"->>'en' iLIKE '%${extractSearchBrand}%'`),
        //                 ]
        //             },
        //             {
        //                 [Op.or]: [
        //                     ...requestLang.reduce((previousValue, currentValue) => {
        //                         if (currentValue) {
        //                             previousValue.push(db.Sequelize.literal(`REGEXP_REPLACE("Product"."product_name"->>'${currentValue}', '[^0-9]', '', 'g') LIKE '${extractSearchNumber}%'`));
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

        storedSearchQueries.push(db.literal(`"Product"."product_code" iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
            if (currentValue.length > 0) {
                return `${previousValue}%${currentValue}`;
            }
            else {
                return previousValue;
            }
        }, '')
            }%'`));
        storedSearchQueries.push(db.literal(`"Product"."custom_path_code_id" iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
            if (currentValue.length > 0) {
                return `${previousValue}%${currentValue}`;
            }
            else {
                return previousValue;
            }
        }, '')
            }%'`));
        storedSearchQueries.push(db.literal(`"Product"."master_path_code_id" iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
            if (currentValue.length > 0) {
                return `${previousValue}%${currentValue}`;
            }
            else {
                return previousValue;
            }
        }, '')
            }%'`));
        requestLang.forEach(w => {
            storedSearchQueries.push(db.literal(`"Product"."product_name"->>'${w}' iLIKE '${extractSearch.reduce((previousValue, currentValue) => {
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
                storedSearchQueries.push(db.literal(`"Product"."master_path_code_id" iLIKE '%${extractSearch}%'`));

                storedOrderQueries.push([db.literal(`"Product"."master_path_code_id" iLIKE '${extractSearch}'`), 'DESC']);
                storedOrderQueries.push([db.literal(`"Product"."master_path_code_id" iLIKE '${extractSearch}%'`), 'DESC']);
                storedOrderQueries.push([db.literal(`"Product"."master_path_code_id" iLIKE '%${extractSearch}%'`), 'DESC']);
            }
            if (element === 'product_name') {
                storedSearchQueries.push(db.literal(`"Product"."product_name"->>'th' iLIKE '%${extractSearch}%'`));

                storedOrderQueries.push([db.literal(`"Product"."product_name"->>'th' iLIKE '${extractSearch}'`), 'DESC']);
                storedOrderQueries.push([db.literal(`"Product"."product_name"->>'th' iLIKE '${extractSearch}%'`), 'DESC']);
                storedOrderQueries.push([db.literal(`"Product"."product_name"->>'th' iLIKE '%${extractSearch}%'`), 'DESC']);
            }
        });

        return { search: storedSearchQueries, order: storedOrderQueries };
    };

    if (tags) {
        tags = tags.split(',')
    }


    var where_q = {
        [Op.and]: [
            { isuse: isuse },
            (type_group_id) ? db.literal(`"Product->ProductType"."type_group_id" = :type_group_id`) : {},
            (product_type_id) ? db.literal("\"Product\".\"product_type_id\" = :product_type_id") : {},
            (product_brand_id) ? db.literal("\"Product\".\"product_brand_id\" = :product_brand_id") : {},
            (product_model_id) ? db.literal("\"Product\".\"product_model_id\" = :product_model_id") : {},
            (center_product_id) ? db.literal("\"Product\".\"id\" = :center_product_id") : {},
            (tags) ? { [Op.or]: tags.map(el => { return { tags: { [Op.contains]: [el] } } }) } : {},
        ],
        [Op.or]: [
            ...(
                searchPaths.length === 0
                    ? [
                        ...extractSearchRule(search),
                        db.literal(`(select count(*) from app_datas.dat_tags where id = any(\"ShopProduct\".\"tags\") and  tag_name->>'th' ilike '%${search}%' ) > 0`)
                    ]
                    : extractSearchPaths(search, searchPaths).search
            )
        ]
    }


    var modelShopProductPriceLog = await ShopProductPriceLog(table_name)
    var modelShopProduct = await ShopProduct(table_name)

    modelShopProduct.hasMany(modelShopProductPriceLog, { foreignKey: 'product_id' })
    modelShopProductPriceLog.belongsTo(modelShopProduct, { foreignKey: 'product_id' })


    const inc = [
        {
            model: Product, ...select_attr_product,
            include: [
                {
                    model: ProductType, attributes: ['id', 'code_id', 'type_name', 'type_group_id'], ...inc_attr,
                    include: {
                        model: ProductPurchaseUnitTypes,
                        separate: true,
                        attributes: ['id', 'code_id', 'type_name'], ...inc_attr
                    }
                },
                { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'], ...inc_attr },
                { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'], ...inc_attr },
                { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'], ...inc_attr }],
        }

    ];

    if (dropdown == false) {
        inc.push({
            model: modelShopProductPriceLog,
            separate: true,
            attributes: ['id', 'product_id', 'start_date', 'end_date', 'price']
        })
    }

    const orderQuery = !search
        ? [
            [sort, order]
        ]
        : [
            ...(
                searchPaths.length === 0
                    ? [
                        [db.literal(`("Product"."master_path_code_id" iLIKE '%${search}%')`), 'DESC'],
                        [db.literal(`length("Product"."master_path_code_id")`), 'ASC'],
                        [sort, order]
                    ]
                    : extractSearchPaths(search, searchPaths).order
            )
        ];

    const fn1 = async () => await modelShopProduct.findAll({
        order: orderQuery,
        include: inc,
        attributes: select_attr_shop_product,
        replacements: {
            type_group_id: type_group_id, product_type_id: product_type_id,
            product_brand_id: product_brand_id, product_model_id: product_model_id,
            center_product_id: center_product_id
        },
        required: false,
        where: where_q,
        limit: limit,
        offset: (page - 1) * limit,
    })

    const fn2 = async () => await modelShopProduct.count({
        include: inc,
        where: where_q,
        replacements: {
            type_group_id: type_group_id, product_type_id: product_type_id,
            product_brand_id: product_brand_id, product_model_id: product_model_id,
            center_product_id: center_product_id
        },
    })

    const [shop_products, length_data] = await Promise.all([fn1(), fn2()]);

    if (export_format === 'xlsx') {
        let data_header = {
            'รหัสสินค้า': null,
            'รหัสบาร์โค้ด': null,
            'ชื่อสินค้า': null,
            'ประเภทสินค้า': null,
            'ยี่ห้อสินค้า': null,
            'รุ่น': null
        }

        const results = shop_products;
        let data = [];
        if (results.length === 0) {
            data.push(data_header);
        } else {

            data = results.map(el => {
                return {
                    'รหัสสินค้า': el.Product.master_path_code_id || '',
                    'รหัสบาร์โค้ด': el.product_bar_code || '',
                    'ชื่อสินค้า': el.Product.product_name.th,
                    'ประเภทสินค้า': el.Product.ProductType?.type_name.th || '',
                    'ยี่ห้อสินค้า': el.Product.ProductBrand?.brand_name.th || '',
                    'รุ่น': el.Product.ProductModelType?.model_name.th || ''
                }
            })
        }


        let ws = await XLSX.utils.json_to_sheet(data, { origin: 0 });

        for (let objectI in ws) {
            if (typeof (ws[objectI]) != "object") continue;
            let cell = XLSX.utils.decode_cell(objectI);
            ws[objectI].s = { // styling for all cells
                font: {
                    name: "TH SarabunPSK",
                    sz: 16,
                },
                border: {
                    right: {
                        style: "thin",
                        color: "000000"
                    },
                    left: {
                        style: "thin",
                        color: "000000"
                    },
                    top: {
                        style: "thin",
                        color: "000000"
                    },
                    bottom: {
                        style: "thin",
                        color: "000000"
                    }
                }
            }
            if (cell.r === 0) {
                ws[objectI].s = { // styling for all cells
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    border: {
                        right: {
                            style: "thin",
                            color: "000000"
                        },
                        left: {
                            style: "thin",
                            color: "000000"
                        },
                        top: {
                            style: "thin",
                            color: "000000"
                        },
                        bottom: {
                            style: "thin",
                            color: "000000"
                        }
                    },
                    alignment: {
                        horizontal: "center",
                    }
                }
            }
        }

        ws["!ref"] = `A1:V${results.length + 2}`

        let wscols = [
            { width: 24 }, // Col: A
            { width: 24 }, // Col: B
            { width: 44 }, // Col: C
            { width: 24 }, // Col: D
            { width: 24 }, // Col: E
            { width: 24 }
        ];

        ws['!cols'] = wscols;

        const file_name = uuid4() + '___รายงานสินค้า';

        let wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

        await handleSaveLog(request, [['get product report' + ' - report ', '', file_name], ''])

        return ({ status: 'success', data: file_name + '.xlsx' });


    }

    const pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: shop_products.length,
        totalCount: length_data,
        data: shop_products
    };

    await handleSaveLog(request, [['get ShopProduct all'], '']);

    return ({ status: 'success', data: pag });
}


const handleShopProductAdd = async (request, res) => {
    const action = 'POST ShopProduct.Add';

    try {
        const currentDateTime = new Date();

        // request.id = 'c52796d2-63eb-4aed-a802-32c91d511068'
        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const checkStartDate = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/g
        if (!checkStartDate.test(request.body.start_date) && request.body.start_date !== '') { throw Error('checkStartDate not match') }

        const checkEndDate = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/g
        if (!checkEndDate.test(request.body.end_date) && request.body.end_date !== '') { throw Error('checkEndDate not match') }

        if (request.body.start_date == '') {
            delete request.body.start_date
        } else {
            request.body.start_date = new Date(request.body.start_date)

        }
        if (request.body.end_date == '') {
            delete request.body.end_date
        } else {
            request.body.end_date = new Date(request.body.end_date)
        }

        return await db.transaction(
            {
                isolationLevel: 'SERIALIZABLE'
            },
            async (t) => {
                const check_product_id_dubplicate = await ShopProduct(table_name).findAll({
                    where: { product_id: request.body.product_id, isuse: [1] },
                    transaction: t
                });


                if (check_product_id_dubplicate.length > 0) {
                    let ShopProduct_id = check_product_id_dubplicate.map(el => { return el.id });

                    let data = { ...request.body };
                    data.updated_by = request.id;
                    data.updated_date = currentDateTime;
                    data.isuse = 1;

                    const update_product_data = async (txn = t) => {
                        const update_product = await ShopProduct(table_name).update(data,
                            {
                                transaction: txn,
                                where: {
                                    id: ShopProduct_id
                                }
                            })
                        return update_product;
                    };

                    let find_ShopProduct = await ShopProduct(table_name).findOne({
                        where: { id: ShopProduct_id },
                        attributes: {
                            include: [
                                ['id', 'product_id']
                            ]
                        },
                        transaction: t
                    });

                    delete find_ShopProduct.dataValues.id;

                    const create_product_log = async (txn = t) => {
                        const create_product = await ShopProductPriceLog(table_name).create({
                            ...find_ShopProduct.dataValues,
                            ...request.body,
                            product_id: find_ShopProduct.dataValues.product_id,
                            isuse: 1,
                            created_by: request.id,
                            created_date: currentDateTime
                        },
                            {
                                transaction: txn
                            });
                        return create_product;
                    };

                    const updated_product = await update_product_data(t);

                    const created_product_log = await create_product_log(t);



                }
                else {
                    const create_product_data = async (txn = t) => {
                        const create_product = await ShopProduct(table_name).create({
                            ...request.body,
                            isuse: 1,
                            created_by: request.id,
                            created_date: currentDateTime
                        },
                            {
                                transaction: txn
                            })
                        return create_product;
                    };

                    const create_product_log = async (txn = t, created_product_id) => {
                        const create_product = await ShopProductPriceLog(table_name).create({
                            ...request.body,
                            product_id: created_product_id,
                            isuse: 1,
                            created_by: request.id,
                            created_date: currentDateTime
                        },
                            {
                                transaction: txn
                            })
                        return create_product;
                    };

                    const created_product = await create_product_data(t);

                    const created_product_log = await create_product_log(t, created_product.getDataValue("id"));

                }


                for (let index = 0; index < findShopsProfileArray.length; index++) {
                    const element = findShopsProfileArray[index];
                    if (element.shop_code_id !== table_name) {

                        const check_product_id_dubplicate = await ShopProduct(element.shop_code_id).findAll({
                            where: { product_id: request.body.product_id, isuse: [1] },
                            transaction: t
                        });



                        if (check_product_id_dubplicate.length > 0) {
                            let ShopProduct_id = check_product_id_dubplicate.map(el => { return el.id });

                            let data = { ...request.body };
                            data.updated_by = request.id;
                            data.updated_date = currentDateTime;
                            data.isuse = 1;

                            const update_product_data = async (txn = t) => {
                                const update_product = await ShopProduct(element.shop_code_id).update(data,
                                    {
                                        transaction: txn,
                                        where: {
                                            id: ShopProduct_id
                                        }
                                    })
                                return update_product;
                            };

                            let find_ShopProduct = await ShopProduct(element.shop_code_id).findOne({
                                where: { id: ShopProduct_id },
                                attributes: {
                                    include: [
                                        ['id', 'product_id']
                                    ]
                                },
                                transaction: t
                            });

                            delete find_ShopProduct.dataValues.id;

                            const create_product_log = async (txn = t) => {
                                const create_product = await ShopProductPriceLog(element.shop_code_id).create({
                                    ...find_ShopProduct.dataValues,
                                    ...request.body,
                                    product_id: find_ShopProduct.dataValues.product_id,
                                    isuse: 1,
                                    created_by: request.id,
                                    created_date: currentDateTime
                                },
                                    {
                                        transaction: txn
                                    });
                                return create_product;
                            };

                            const updated_product = await update_product_data(t);

                            const created_product_log = await create_product_log(t);

                            const find_ShopProductx = await ShopProduct(element.shop_code_id).findOne({
                                where: { id: ShopProduct_id },
                                transaction: t
                            });

                        }
                        else {
                            const create_product_data = async (txn = t) => {
                                const create_product = await ShopProduct(element.shop_code_id).create({
                                    ...request.body,
                                    isuse: 1,
                                    created_by: request.id,
                                    created_date: currentDateTime
                                },
                                    {
                                        transaction: txn
                                    })
                                return create_product;
                            };

                            const create_product_log = async (txn = t, created_product_id) => {
                                const create_product = await ShopProductPriceLog(element.shop_code_id).create({
                                    ...request.body,
                                    product_id: created_product_id,
                                    isuse: 1,
                                    created_by: request.id,
                                    created_date: currentDateTime
                                },
                                    {
                                        transaction: txn
                                    })
                                return create_product;
                            };

                            const created_product = await create_product_data(t);

                            const created_product_log = await create_product_log(t, created_product.getDataValue("id"));

                        }
                    }

                }


                const find_ShopProductx = await ShopProduct(table_name).findOne({
                    where: { product_id: request.body.product_id },
                    transaction: t
                });

                await handleSaveLog(request, [[action], '']);

                return utilSetFastifyResponseJson("success", find_ShopProductx);
            }
        );
    } catch (error) {
        if (_.isError(error)) {
            await handleSaveLog(request, [[action], error]);
            return ({ status: "failed", data: error.toString() });
        }
        else {
            await handleSaveLog(request, [[action], error]);
            return ({ status: "failed", data: error.toString() });
        }
    }
}

const handleShopProductById = async (request, res) => {

    // request.id = '232bbbd7-5a70-46da-8af3-a71a7503b564'

    var shop_table = await utilCheckShopTableName(request)
    var table_name = shop_table.shop_code_id

    var ShopProduct_id = request.params.id

    var modelShopProductPriceLog = await ShopProductPriceLog(table_name)
    var modelShopProduct = await ShopProduct(table_name)

    modelShopProduct.hasMany(modelShopProductPriceLog, { foreignKey: 'product_id' })
    modelShopProductPriceLog.belongsTo(modelShopProduct, { foreignKey: 'product_id' })


    var find_ShopProduct = await modelShopProduct.findAll({
        where: {
            id: ShopProduct_id
        },
        include: [
            {
                model: Product,
                include: [{
                    model: ProductType, attributes: ['id', 'code_id', 'type_name', 'type_group_id'],
                    include: {
                        model: ProductPurchaseUnitTypes, attributes: ['id', 'code_id', 'type_name'],
                        separate: true,
                    }
                },
                { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
                { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
                { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }],
            },
            {
                model: modelShopProductPriceLog,
                separate: true,
                attributes: ['id', 'product_id', 'start_date', 'end_date', 'price']
            },
            // { model: User, as: 'User_create', attributes: [] },
            // { model: User, as: 'User_update', attributes: [] }
        ],
        attributes: {
            include: [
                [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopProduct\".\"created_by\" )"), 'created_by'],
                [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopProduct\".\"updated_by\" )"), 'updated_by'],
                [db.Sequelize.literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopProduct\".\"tags\"))`), 'tags'],
                [db.Sequelize.literal(`
                (SELECT "INIDoc".code_id AS latest_ini_code_id
                FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "INIDoc"
                WHERE "INIDoc".doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47'
                    AND "INIDoc".status = 1
                    AND (
                            SELECT "INILogs".doc_inventory_id
                            FROM app_shops_datas.dat_01hq0013_inventory_management_logs AS "INILogs"
                            WHERE "INILogs".doc_inventory_id = "INIDoc".id
                              AND "INILogs".product_id = "ShopProduct".id
                              AND "INILogs".status = 1
                            LIMIT 1
                        ) = "INIDoc".id
                ORDER BY "INIDoc".doc_date DESC, "INIDoc".code_id DESC, coalesce("INIDoc".updated_date, "INIDoc".created_date) DESC
                LIMIT 1)
                `.replace(/(01hq0013)+/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_ini_code_id'],
                [db.Sequelize.literal(`
                (SELECT "INIDoc".doc_date AS latest_ini_doc_date
                FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "INIDoc"
                WHERE "INIDoc".doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47'
                    AND "INIDoc".status = 1
                    AND (
                            SELECT "INILogs".doc_inventory_id
                            FROM app_shops_datas.dat_01hq0013_inventory_management_logs AS "INILogs"
                            WHERE "INILogs".doc_inventory_id = "INIDoc".id
                              AND "INILogs".product_id = "ShopProduct".id
                              AND "INILogs".status = 1
                            LIMIT 1
                        ) = "INIDoc".id
                ORDER BY "INIDoc".doc_date DESC, "INIDoc".code_id DESC, coalesce("INIDoc".updated_date, "INIDoc".created_date) DESC
                LIMIT 1)
                `.replace(/(01hq0013)+/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_ini_doc_date'],
                [db.Sequelize.literal(`
                (WITH
                    CTE_INI_ALL_Product_Price AS (
                        SELECT
                            "INILogs".id,
                            "INILogs".doc_inventory_id,
                            "INILogs".product_id,
                            (
                                ((coalesce(nullif("INILogs".details->>'total_price_text', 'undefined'), '0'))::numeric(20,2)
                                -
                                (
                                    (coalesce(nullif("INILogs".details->>'discount_thb_text', 'undefined'), '0'))::numeric(20,2)
                                    +
                                    (
                                        CASE WHEN (SELECT (coalesce(nullif("INIDoc".details ->> 'total_price_all', 'undefined'), '0'))::numeric(20, 2)
                                               FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "INIDoc"
                                               WHERE "INIDoc".doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47'
                                                 AND "INIDoc".id = "INILogs".doc_inventory_id) <= 0
                                            THEN 0
                                            ELSE
                                                (
                                                    (coalesce(nullif("INILogs".details ->> 'total_price_text', 'undefined'), '0'))::numeric(20, 2)
                                                    / (SELECT (coalesce(nullif("INIDoc".details ->> 'total_price_all', 'undefined'), '0'))::numeric(20, 2)
                                                       FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "INIDoc"
                                                       WHERE "INIDoc".doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47'
                                                         AND "INIDoc".id = "INILogs".doc_inventory_id)
                                                )
                                        END
                                        * (SELECT (coalesce(nullif("INIDoc".details ->> 'tailgate_discount', 'undefined'), '0'))::numeric(20, 2)
                                           FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "INIDoc"
                                           WHERE "INIDoc".doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47'
                                             AND "INIDoc".id = "INILogs".doc_inventory_id)
                                    )::numeric(20, 2)
                                ))
                                /
                                (CASE WHEN "INILogs".amount <= 0 THEN 1 ELSE "INILogs".amount END)
                            )::numeric(20,2) AS ini_product_price
                        FROM app_shops_datas.dat_01hq0013_inventory_management_logs AS "INILogs"
                        WHERE "INILogs".status = 1
                    ),
                    CTE_INI_Latest_Where_Proudct_Price AS (
                        SELECT
                            CTE_INI_ALL_Product_Price.doc_inventory_id,
                            CTE_INI_ALL_Product_Price.ini_product_price
                        FROM CTE_INI_ALL_Product_Price
                        WHERE CTE_INI_ALL_Product_Price.product_id = "ShopProduct".id
                            AND CTE_INI_ALL_Product_Price.ini_product_price > ('0')::numeric(20,2)
                            AND (SELECT "INIDoc".status FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "INIDoc" WHERE "INIDoc".id = CTE_INI_ALL_Product_Price.doc_inventory_id AND "INIDoc".status = 1) = 1
                        ORDER BY
                            (SELECT "INIDoc".doc_date FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "INIDoc" WHERE "INIDoc".id = CTE_INI_ALL_Product_Price.doc_inventory_id AND "INIDoc".status = 1) DESC,
                            (SELECT "INIDoc".code_id FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "INIDoc" WHERE "INIDoc".id = CTE_INI_ALL_Product_Price.doc_inventory_id AND "INIDoc".status = 1) DESC,
                            CTE_INI_ALL_Product_Price.id DESC
                    )
                SELECT
                    (CASE WHEN (SELECT COUNT(*) FROM CTE_INI_Latest_Where_Proudct_Price) = 0
                        THEN 0
                        ELSE (SELECT CTE_INI_Latest_Where_Proudct_Price.ini_product_price FROM CTE_INI_Latest_Where_Proudct_Price LIMIT 1)
                    END)::numeric(20,2) AS latest_ini_cost)
                `.replace(/(01hq0013)+/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_ini_cost'],
                [db.Sequelize.literal(`
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
                        WHERE X.shop_product_id = "ShopProduct".id
                        LIMIT 1
                    ),0)::numeric(20,2))
                `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_product_cost'],
                [db.Sequelize.literal(`
                    (coalesce((
                        SELECT
                            avg(X.product_cost)::numeric(20,2) AS product_cost_average
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
                        WHERE X.shop_product_id = "ShopProduct".id
                        GROUP BY X.shop_product_id
                    ),0)::numeric(20,2))
                `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'product_cost_average'],
                [db.Sequelize.literal(`
                    (coalesce((
                        SELECT 
                            (coalesce(sq_shop_product.price->'suggasted_re_sell_price'->>'retail', '0'))::numeric(20,2)  AS product_price_latest
                        FROM app_shops_datas.dat_01hq0004_products AS sq_shop_product 
                        WHERE sq_shop_product.id = "ShopProduct".id
                    ),0)::numeric(20,2))
                `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' ')), 'latest_product_price']
            ]
        },
    });

    await handleSaveLog(request, [['get ShopProduct byid'], ''])
    return utilSetFastifyResponseJson("success", [find_ShopProduct[0]])



}

const handleShopProductPut = async (request, res) => {
    const action = 'put ShopProduct';

    try {
        const currentDateTime = new Date();
        // request.id = '232bbbd7-5a70-46da-8af3-a71a7503b564'
        const shop_table = await utilCheckShopTableName(request)
        const table_name = shop_table.shop_code_id

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const { product_id, price, price_arr, price_dot_arr, product_bar_code, start_date, end_date, product_code, tags, details } = request.body
        const isuse = request.body.status

        const ShopProduct_id = request.params.id
        const data = {}
        const mData = {}
        const find_ShopProduct = await ShopProduct(table_name).findOne({ where: { id: ShopProduct_id } });
        if (!find_ShopProduct) {
            await handleSaveLog(request, [[action], 'ShopProduct not found'])
            return ({ status: "failed", data: "ShopProduct not found" })
        }

        const find_Product = await Product.findOne({ where: { id: find_ShopProduct.get('product_id') } });
        if (!find_Product) {
            await handleSaveLog(request, [[action], 'Product not found'])
            return ({ status: "failed", data: "Product not found" })
        }

        if (!isNull(product_code)) {
            mData.product_code = product_code
        }

        if (!isNull(price)) {
            data.price = price
        }

        if (!isNull(price_arr)) {
            data.price_arr = price_arr
        }
        if (!isNull(price_dot_arr)) {
            data.price_dot_arr = price_dot_arr
        }

        if (!isNull(product_bar_code)) {
            data.product_bar_code = product_bar_code
        }


        if (!isNull(start_date)) {
            data.start_date = new Date(start_date)
        }

        if (!isNull(end_date)) {
            data.end_date = new Date(end_date)
        }

        if (!isNull(tags)) {
            data.tags = tags
        }


        if (!isNull(details)) {
            data.details = details
        }

        if (!isNull(isuse)) {
            if (isuse == 'delete') {
                data.isuse = 2
            } else if (isuse == 'active') {
                data.isuse = 1
            } else if (isuse == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }

        data.updated_by = request.id
        data.updated_date = currentDateTime


        const t = await db.transaction();

        const transactionResult = await db.transaction(
            {
                isolationLevel: "SERIALIZABLE"
            },
            async (t) => {
                const update_product_data = async (txn = t) => {
                    if (_.keys(mData).length > 0) {
                        mData.updated_by = request.id
                        mData.updated_date = currentDateTime
                        const update_product = await Product.update(mData,
                            {
                                transaction: txn,
                                where: {
                                    id: find_Product.get('id')
                                }
                            })
                        return update_product;
                    }

                    return null;
                };

                const update_shopProduct_data = async (txn = t) => {
                    const update_shopProduct = await ShopProduct(table_name).update(data,
                        {
                            transaction: txn,
                            where: {
                                id: ShopProduct_id
                            }
                        })
                    return update_shopProduct;
                };
                const create_product_log = async (txn = t) => {

                    delete find_ShopProduct.dataValues.id

                    const create_product = await ShopProductPriceLog(table_name).create({
                        ...find_ShopProduct.dataValues,
                        ...request.body,
                        product_id: ShopProduct_id,
                        isuse: 1,
                        created_by: request.id,
                        created_date: Date.now()
                    },
                        {
                            transaction: txn
                        })
                    return create_product;
                };

                const updated_product_data = await update_product_data(t);

                const updated_product = await update_shopProduct_data(t);

                const created_product_log = await create_product_log(t);

                if (find_ShopProduct.details.img) {
                    var delete_img = find_ShopProduct.details.img.filter(el => {
                        return !details.img.map(el1 => { return el1.file_path }).includes(el.file_path)
                    })

                    if (delete_img.length > 0) {
                        for (let index = 0; index < delete_img.length; index++) {
                            const element = delete_img[index];
                            try {
                                await fs.unlinkSync('src/assets/shops/' + shop_table.id + '/product/' + ShopProduct_id + '/' + element.file_path)
                            } catch {

                            }
                        }
                    }
                }


                for (let index = 0; index < findShopsProfileArray.length; index++) {
                    const element = findShopsProfileArray[index];
                    if (element.shop_code_id !== table_name && data.isuse != 2) {

                        const find_ShopProduct_ = await ShopProduct(element.shop_code_id).findOne({ where: { product_id: find_ShopProduct.dataValues.product_id } });

                        if (find_ShopProduct_) {

                            if (find_ShopProduct_.details.img) {
                                var delete_img = find_ShopProduct_.details.img.filter(el => {
                                    return !details.img.map(el1 => { return el1.file_path }).includes(el.file_path)
                                })

                                if (delete_img.length > 0) {
                                    for (let index2 = 0; index2 < delete_img.length; index2++) {
                                        const element2 = delete_img[index2];
                                        try {
                                            await fs.unlinkSync('src/assets/shops/' + element.id + '/product/' + find_ShopProduct_.dataValues.id + '/' + element2.file_path)

                                        } catch {

                                        }
                                    }
                                }
                            }


                            const update_shopProduct_data = async (txn = t) => {
                                const update_shopProduct = await ShopProduct(element.shop_code_id).update(data,
                                    {
                                        transaction: txn,
                                        where: {
                                            id: find_ShopProduct_.dataValues.id
                                        }
                                    })
                                return update_shopProduct;
                            };
                            const create_product_log = async (txn = t) => {

                                let product_id = find_ShopProduct_.dataValues.id
                                delete find_ShopProduct_.dataValues.id

                                const create_product = await ShopProductPriceLog(element.shop_code_id).create({
                                    ...find_ShopProduct_.dataValues,
                                    ...request.body,
                                    product_id: product_id,
                                    isuse: 1,
                                    created_by: request.id,
                                    created_date: Date.now()
                                },
                                    {
                                        transaction: txn
                                    })
                                return create_product;
                            };

                            const updated_product_data = await update_product_data(t);

                            const updated_product = await update_shopProduct_data(t);

                            const created_product_log = await create_product_log(t);



                        }

                    }

                }


            }
        );

        await handleSaveLog(request, [[action, ShopProduct_id, request.body], ''])
        return utilSetFastifyResponseJson("success", "successfull");


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleShopProductAddByFile = async (request, res) => {

    try {




        const file = await request.body.file

        await fs.writeFileSync('src/assets/' + file.filename, await file.toBuffer());
        const wb = XLSX.readFile('src/assets/' + file.filename);
        await fs.unlinkSync('src/assets/' + file.filename)

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]
        var data = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 0 })

        let data_create_id_arr = []
        var header_ = [
            "รหัสจากโรงงาน",
            "รหัสจากบาร์โคด",
            "ชื่อสินค้า",
            "กลุ่มสินค้า",
            "ประเภท",
            "ยี่ห้อ",
            "รุ่น",
            "หน้ายาง",
            "แก้มยาง",
            "ขอบยาง",
            "ความสูง",
            "ความสูงแก้มยาง",
            "ดัชนีน้ำหนักสินค้า",
            "ดัชนีความเร็ว",
            "ขนาดไซส์",
            "ราคาหน้าร้าน(ปลีก)",
            "ราคาหน้าร้าน(ส่ง)",
            "ราคาส่ง(ปลีก)",
            "ราคาส่ง(ส่ง)",
            "ราคาออนไลน์(ปลีก)",
            "ราคาออนไลน์(ส่ง)",
            "ราคาเชื่อ 30 วัน(ปลีก)",
            "ราคาเชื่อ 30 วัน(ส่ง)",
            "ราคาเชื่อ 45 วัน(ปลีก)",
            "ราคาเชื่อ 45 วัน(ส่ง)",
            "หมายเหตุ",
            "OE",
            "หมายเหตุ OE",
            "Runflat",
            "หมายเหตุ Runflat",
            "ชื่อย่อร้าน",
            "สถานที่ผลิต",
            "TLTT",
            "ยางหน้าหลัง"
        ]


        const findShopsProfile = await utilCheckShopTableName(request);
        const table_name = findShopsProfile.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');


        function areEqual(start, end) {
            if (start === end) {
                return [true]; // Same memory address
            }
            if (start.length !== end.length) {
                return [false, 'Length of header do not match!'];
            }
            for (let index = 0; index < start.length; index++) {
                if (start[index] !== end[index]) {
                    return [false, ` header ${end[index]} do not match `];
                }
            }
            return [true]; // Equal!
        }

        var check_header = areEqual(header_, header)

        if (check_header[0] == false) {
            // await handleSaveLog(request, [['put stock by file'], check_header[1]])
            return ({ status: 'failed', data: check_header[1] })
        }

        data.map(el => {
            var data = {}
            header.map(el1 => {
                return data[el1] = (el[el1] ? el[el1] : null)
            })
            return data
        })



        function getUniqueListBy(arr, key) {
            return [...new Map(arr.map(item => [item[key], item])).values()]
        }
        data = getUniqueListBy(data, 'รหัสจากโรงงาน')



        var group_type_name_all = await ProductTypeGroup.findAll({})

        var type_name_all = await ProductType.findAll({})

        var brand_name_all = await ProductBrand.findAll()

        var complete_size_name_all = await ProductCompleteSize.findAll()

        var model_name_all = await ProductModelType.findAll({
            include: [{ model: ProductType }, { model: ProductBrand }]
        })

        var product_all = await Product.findAll()
        let product_bar_code_arr = []


        const process_data = async (element, add_on = '') => {


            let data2 = {}
            let product_type_id = []
            let product_brand_id = []
            let complete_size_id = []
            let product_model_id = []

            if (element['กลุ่มสินค้า']) {
                type_group_id = group_type_name_all.filter(el => { return el.group_type_name.th.toLowerCase().replace(/ /g, "") == element['กลุ่มสินค้า'].toLowerCase().replace(/ /g, "") })

                if (type_group_id.length == 0) {
                    // error.push({ index: element['รหัสจากโรงงาน'] + ' ประเภท ไม่เจอ' })
                    type_group_id = await ProductTypeGroup.create(
                        {
                            code_id: element['กลุ่มสินค้า'].toUpperCase().replace(/ /g, ""),
                            group_type_name: { th: element['กลุ่มสินค้า'], en: element['กลุ่มสินค้า'] },
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    group_type_name_all.push({ ...type_group_id.dataValues })
                    type_group_id = [type_group_id.dataValues]
                }
            }

            if (element['ประเภท']) {
                product_type_id = type_name_all.filter(el => { return el.type_name.th.toLowerCase().replace(/ /g, "") == element['ประเภท'].toLowerCase().replace(/ /g, "") })

                if (product_type_id.length == 0) {
                    // error.push({ index: element['รหัสจากโรงงาน'] + ' ประเภท ไม่เจอ' })
                    product_type_id = await ProductType.create(
                        {
                            code_id: element['ประเภท'].toUpperCase().replace(/ /g, ""),
                            type_name: { th: element['ประเภท'], en: element['ประเภท'] },
                            type_group_id: type_group_id[0].id,
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    type_name_all.push({ ...product_type_id.dataValues })
                    product_type_id = [product_type_id.dataValues]
                }
            }

            if (element['ยี่ห้อ'] && element['ยี่ห้อ'] != '') {
                product_brand_id = brand_name_all.filter(el => { return el.brand_name.th.toString().toLowerCase().replace(/ /g, "") == element['ยี่ห้อ'].toString().toLowerCase().replace(/ /g, "") })

                if (product_brand_id.length == 0) {
                    // error.push({ index: element['รหัสจากโรงงาน'] + ' ยี่ห้อ ไม่เจอ' })

                    product_brand_id = await ProductBrand.create(
                        {
                            code_id: element['ยี่ห้อ'].toString().toUpperCase().replace(/ /g, ""),
                            brand_name: { th: element['ยี่ห้อ'], en: element['ยี่ห้อ'] },
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    brand_name_all.push({ ...product_brand_id.dataValues })
                    product_brand_id = [product_brand_id.dataValues]
                }
            }

            if (element['ขนาดไซส์'] && element['ขนาดไซส์'] != '') {
                complete_size_id = complete_size_name_all.filter(el => { return el.complete_size_name.th.toLowerCase().replace(/ /g, "") == element['ขนาดไซส์'].toLowerCase().replace(/ /g, "") })

                if (complete_size_id.length == 0) {

                    complete_size_id = await ProductCompleteSize.create(
                        {
                            code_id: element['ขนาดไซส์'].toString().toUpperCase().replace(/ /g, ""),
                            complete_size_name: { th: element['ขนาดไซส์'], en: element['ขนาดไซส์'] },
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    complete_size_name_all.push({ ...complete_size_id.dataValues })
                    complete_size_id = [complete_size_id.dataValues]
                }
            }

            if (element['รุ่น'] && element['รุ่น'] != '' && element['ยี่ห้อ'] && element['ยี่ห้อ'] != '') {
                product_model_id = model_name_all.filter(el => {
                    return el.model_name.th.toLowerCase().replace(/ /g, "") == element['รุ่น'].toString().toLowerCase().replace(/ /g, "") &&
                        el.ProductType.type_name.th.toLowerCase().replace(/ /g, "") == element['ประเภท'].toLowerCase().replace(/ /g, "") &&
                        el.ProductBrand.brand_name.th.toString().toLowerCase().replace(/ /g, "") == element['ยี่ห้อ'].toString().toLowerCase().replace(/ /g, "")
                })

                if (product_model_id.length == 0) {
                    product_model_id = await ProductModelType.create(
                        {
                            code_id: element['รุ่น'].toString().toUpperCase().replace(/ /g, ""),
                            model_name: { th: element['รุ่น'].toString(), en: element['รุ่น'].toString() },
                            product_type_id: product_type_id[0].id,
                            product_brand_id: product_brand_id[0].id,
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    model_name_all.push({ ...product_model_id.dataValues, ProductType: product_type_id[0], ProductBrand: product_brand_id[0] })
                    product_model_id = [product_model_id.dataValues]
                }
                else if (product_model_id.length > 1) {
                    error.push({ index: element['รหัสจากโรงงาน'] + ' รุ่น มากกว่า 1' })
                }

                product_type_id = [{ id: product_model_id[0].product_type_id }]
                product_brand_id = [{ id: product_model_id[0].product_brand_id }]

            }


            product_type_id = (product_type_id.length > 0) ? product_type_id[0].id : null
            product_brand_id = (product_brand_id.length > 0) ? product_brand_id[0].id : null
            product_model_id = (product_model_id.length > 0) ? product_model_id[0].id : null
            complete_size_id = (complete_size_id.length > 0) ? complete_size_id[0].id : null


            data2.master_path_code_id = element['รหัสจากโรงงาน']
            data2.product_code = element['รหัสจากโรงงาน'] + add_on
            data2.wyz_code = element['Wyz Code']
            data2.product_name = { th: element['ชื่อสินค้า'], en: element['ชื่อสินค้า'] }
            data2.product_type_id = product_type_id
            data2.product_brand_id = product_brand_id
            data2.product_model_id = product_model_id
            data2.rim_size = parseFloat(element['ขอบยาง']) || null
            data2.width = parseFloat(element['หน้ายาง']) || null
            data2.hight = parseFloat(element['ความสูง']) || null
            data2.series = parseFloat(element['แก้มยาง']) || null
            data2.load_index = element['ดัชนีน้ำหนักสินค้า']
            data2.speed_index = element['ดัชนีความเร็ว']
            data2.complete_size_id = complete_size_id
            data2.isuse = 1
            data2.created_by = request.id
            data2.created_date = new Date()
            data2.other_details = {
                central_price: {
                    "suggasted_re_sell_price": {
                        "retail": parseFloat(element['ราคาหน้าร้าน(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาหน้าร้าน(ส่ง)'])
                    },
                    "b2b_price": {
                        "retail": parseFloat(element['ราคาส่ง(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาส่ง(ส่ง)'])
                    },
                    "suggested_online_price": {
                        "retail": parseFloat(element['ราคาออนไลน์(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาออนไลน์(ส่ง)'])
                    },
                    "credit_30_price": {
                        "retail": parseFloat(element['ราคาเชื่อ 30 วัน(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาเชื่อ 30 วัน(ส่ง)'])
                    },
                    "credit_45_price": {
                        "retail": parseFloat(element['ราคาเชื่อ 45 วัน(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาเชื่อ 45 วัน(ส่ง)'])
                    }
                },
                others_tire_detail: {
                    remark_others_tire_detail: { th: element['หมายเหตุ'] },
                    status: (element['หมายเหตุ'] != null) ? true : false
                },
                oe_tire: {
                    remark_oe_tire: { th: element['หมายเหตุ OE'] },
                    status: (element['OE'] != null) ? true : false
                },
                runflat_tire: {
                    remark_runflat_tire: { th: element['หมายเหตุ Runflat'] },
                    status: (element['Runflat'] != null) ? true : false
                },
                "based_price": null,
                "suggested_promote_price": null,
                "normal_price": null,
                "benchmark_price": null,
                "include_vat_price": null,
                "exclude_vat_price": null,
                "other_shops": [
                    {
                        "prohand_price": null,
                        "ezyFit_price": null,
                        "wyz_price": null,
                        "auto_one_price": null,
                        "ycc_price": null
                    }
                ],
                "made_in": element["สถานที่ผลิต"],
                "tltt": element["TLTT"],
                "front_backe_wheel": element["ยางหน้าหลัง"]
            }

            return data2
        }
        var error = []
        var data_create = []
        var model_create = []

        for (let index = 0; index < data.length; index++) {
            const element = data[index];

            product_bar_code_arr.push(element["รหัสจากบาร์โคด"])

            /**
            * check duplicate in db from center
            */
            let check_duplicate = product_all.filter(el => {
                return el.master_path_code_id == element['รหัสจากโรงงาน']
            })

            if (check_duplicate.length == 0) {
                //รหัสจากโรงงาน ไม่ซ้ำ
                let check_duplicate_product_code = product_all.filter(el => {
                    return el.product_code == element['รหัสจากโรงงาน']
                })
                if (check_duplicate_product_code.length == 0) {
                    data_create.push(await process_data(element))

                } else {
                    data_create.push(await process_data(element, element['ชื่อย่อร้าน']))

                }

            } else {
                //รหัสจากโรงงาน ซ้ำ

                if (check_duplicate[0].product_name.th.toLowerCase().replace(/\s/g, '') == element['ชื่อสินค้า'].toLowerCase().replace(/\s/g, '')) {
                    //รหัสจากโรงงาน ซ้ำ - ชื่อ ซ้ำ

                    data_create_id_arr.push({ id: check_duplicate[0].id, other_details: check_duplicate[0].other_details })
                } else if (check_duplicate[0].product_name.th.toLowerCase().replace(/\s/g, '') != element['ชื่อสินค้า'].toLowerCase().replace(/\s/g, '')) {
                    //รหัสจากโรงงาน ซ้ำ ชื่อไม่ซ้ำ

                    let map_duplicate = check_duplicate.map(el => { return el.product_code })
                    let check_map_duplicate = map_duplicate.findIndex(el => { return el == (element['รหัสจากโรงงาน'] + element["ชื่อย่อร้าน"]).toString() })


                    if (check_map_duplicate != -1) {
                        data_create_id_arr.push({ id: check_duplicate[check_map_duplicate].id, other_details: check_duplicate[check_map_duplicate].other_details })
                    } else {
                        data_create.push(await process_data(element, element['ชื่อย่อร้าน']))
                    }
                }


            }

        }

        if (error.length > 0) {
            throw error
        }



        var data_create_id_arr_ = await Product.bulkCreate(data_create)


        data_create_id_arr_ = data_create_id_arr_.map(el => { return { id: el.id, other_details: el.other_details } })
        data_create_id_arr.push(...[...data_create_id_arr_])


        let productShop = await ShopProduct(table_name).findAll()
        let data_create1 = []

        for (let index = 0; index < data_create_id_arr.length; index++) {
            const element = data_create_id_arr[index];


            let check_existing = productShop.filter(el => {
                return el.product_id == element.id
            })

            if (check_existing.length == 0) {
                data_create1.push({
                    product_id: element.id,
                    product_bar_code: product_bar_code_arr[index],
                    start_date: new Date(),
                    price: element.other_details.central_price || 0,
                    isuse: 1,
                    created_by: request.id,
                    created_date: new Date()
                })
            }


        }

        await ShopProduct(table_name).bulkCreate(data_create1)

        for (let index = 0; index < findShopsProfileArray.length; index++) {
            const element = findShopsProfileArray[index];
            if (element.shop_code_id !== table_name) {


                let productShop = await ShopProduct(element.shop_code_id).findAll()
                let data_create1 = []

                for (let index1 = 0; index1 < data_create_id_arr.length; index1++) {
                    const element1 = data_create_id_arr[index1];


                    let check_existing = productShop.filter(el => {
                        return el.product_id == element1.id
                    })

                    if (check_existing.length == 0) {
                        data_create1.push({
                            product_id: element1.id,
                            product_bar_code: product_bar_code_arr[index1],
                            start_date: new Date(),
                            price: element1.other_details.central_price || 0,
                            isuse: 1,
                            created_by: request.id,
                            created_date: new Date()
                        })
                    }


                }

                await ShopProduct(element.shop_code_id).bulkCreate(data_create1)

            }

        }


        await handleSaveLog(request, [['shop product add by file'], ''])
        return ({ status: "success", data: "success" })

    }
    catch (error) {
        console.log(error)
        error = error
        await handleSaveLog(request, [['shop product add by file'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }


}


const handleAddImage = async (request, res) => {

    var action = 'add dealer reward img'
    try {

        var id = request.params.id

        var shop_table = await utilCheckShopTableName(request)
        var table_name = shop_table.shop_code_id

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        var before_update = await ShopProduct(table_name).findOne({
            where: { id: id }
        })

        if (!before_update) {
            let msg = 'ShopProduct not found'
            await handleSaveLog(request, [[action], msg])
            throw Error(msg)
        }
        // return request.body.img

        var img_exist = before_update.details.img || []
        // var img_exist = []
        var run = (img_exist) ? img_exist.length + 1 : 1
        var img = request.body.img


        if (img.length) {
        } else {
            img = [img]
        }

        for (let index = 0; index < img.length; index++) {
            let path = shop_table.id + '/product/' + id
            const element = img[index];
            request.body.fileName = { value: run + index }
            request.body.fileType = { value: 'image' }
            request.body.fileDirectory = { value: 'shops' }
            request.body.fileDirectoryId = { value: path }
            request.body.fileUpload = element
            var file_path = await handleUploadFile(request)

            img_exist.push({
                run: run + index,
                file_path: file_path.data.path.split('/')[6]
            })

            for (let index1 = 0; index1 < findShopsProfileArray.length; index1++) {
                const element1 = findShopsProfileArray[index1];
                if (element1.shop_code_id !== table_name) {

                    const find_ShopProduct_ = await ShopProduct(element1.shop_code_id).findOne({ where: { product_id: before_update.dataValues.product_id } });

                    if (find_ShopProduct_) {

                        let path = element1.id + '/product/' + find_ShopProduct_.dataValues.id

                        request.body.fileName = { value: run + index }
                        request.body.fileType = { value: 'image' }
                        request.body.fileDirectory = { value: 'shops' }
                        request.body.fileDirectoryId = { value: path }
                        request.body.fileUpload = element
                        var file_path = await handleUploadFile(request)


                    }

                }

            }
        }



        var details = before_update.details
        details.img = img_exist

        await ShopProduct(table_name).update({
            details: details
        }, {
            where: { id: id }
        })

        var update = await ShopProduct(table_name).findOne({
            where: { id: id }
        })

        for (let index = 0; index < findShopsProfileArray.length; index++) {
            const element = findShopsProfileArray[index];
            if (element.shop_code_id !== table_name) {

                const find_ShopProduct_ = await ShopProduct(element.shop_code_id).findOne({ where: { product_id: before_update.dataValues.product_id } });

                if (find_ShopProduct_) {

                    var details = find_ShopProduct_.dataValues.details
                    details.img = img_exist

                    const update_shopProduct_data = async () => {
                        const update_shopProduct = await ShopProduct(element.shop_code_id).update({
                            details: details
                        }, {
                            where: {
                                id: find_ShopProduct_.dataValues.id
                            }
                        })
                        return update_shopProduct;
                    };

                    const updated_product = await update_shopProduct_data();

                }

            }

        }

        await handleSaveLog(request, [[action, id], ''])
        return ({ status: "success", data: update })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }

}

const handleShopProductDotPriceAddByFile = async (request, res) => {

    try {



        const file = await request.body.file

        await fs.writeFileSync('src/assets/' + file.filename, await file.toBuffer());
        const wb = XLSX.readFile('src/assets/' + file.filename);
        await fs.unlinkSync('src/assets/' + file.filename)

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]
        var data = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 0 })

        let data_create_id_arr = []
        var header_ = [
            "รหัสสินค้า",
            "ชื่อสินค้า",
            "ยี่ห้อ",
            "รุ่น",
            "ขนาดไซส์",
            "ราคาขายปลีก",
            "ราคาขายส่ง",
            "จำนวนสินค้าคงเหลือ (QTY)",
            "DOT",
            "ราคาราย DOT"
        ]

        const findShopsProfile = await utilCheckShopTableName(request);
        const table_name = findShopsProfile.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        function areEqual(start, end) {
            if (start === end) {
                return [true]; // Same memory address
            }
            if (start.length !== end.length) {
                return [false, 'Length of header do not match!'];
            }
            for (let index = 0; index < start.length; index++) {
                if (start[index] !== end[index]) {
                    return [false, ` header ${end[index]} do not match `];
                }
            }
            return [true]; // Equal!
        }

        var check_header = areEqual(header_, header)

        if (check_header[0] == false) {
            // await handleSaveLog(request, [['put stock by file'], check_header[1]])
            return ({ status: 'failed', data: check_header[1] })
        }


        let new_data = []
        for (let index = 0; index < data.length; index++) {
            const element = data[index];

            let find = new_data.findIndex(item => item.code_name == element["รหัสสินค้า"] + element["ชื่อสินค้า"])
            let dot_show = element["DOT"].toString()
            dot_show = dot_show[0] + 'X' + dot_show[2] + dot_show[3]

            let price = (element["ราคาราย DOT"]) ? element["ราคาราย DOT"].toString() : null

            if (find != -1) {

                new_data[find].price_dot_arr.push({
                    dot_name: element["DOT"].toString(),
                    price_name: element["DOT"].toString(),
                    price_value: price,
                    dot_show: dot_show.toString()
                })
            }
            else {
                new_data.push(
                    {
                        master_path_code_id: element["รหัสสินค้า"],
                        product_name: element["ชื่อสินค้า"],
                        code_name: element["รหัสสินค้า"] + element["ชื่อสินค้า"],
                        price_dot_arr: [
                            {
                                dot_name: element["DOT"].toString(),
                                price_name: element["DOT"].toString(),
                                price_value: price,
                                dot_show: dot_show.toString()
                            }
                        ]
                    }
                )
            }

        }


        let check_db = await db.query(`
            select sh.id,ms.master_path_code_id,ms.product_code,ms.product_name->>'th' product_name,sh.price_dot_arr from app_shops_datas.dat_01hq0004_products sh 
            left join app_datas.dat_products ms on ms.id = sh.product_id
            where ms.master_path_code_id in (${new_data.map(el => { return "'" + el.master_path_code_id + "'" })})
            `.replace(/(01hq0004)/ig, table_name)
            .replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                raw: false
            })



        for (let index = 0; index < new_data.length; index++) {
            const element = new_data[index];


            let check = check_db.filter(el => {
                return el.master_path_code_id == element.master_path_code_id || el.product_code == element.master_path_code_id
            })

            if (check.length > 1) {
                check = check.filter(el => {
                    return el.product_name.replace(' ', '').toLowerCase() === element.product_name.replace(' ', '').toLowerCase()
                })
            }

            if (check.length == 1) {
                new_data[index].id = check[0].id
                new_data[index].product_name = check[0].product_name

                if (check[0].price_dot_arr != null) {

                    let dot_cur = check[0].price_dot_arr

                    for (let index1 = 0; index1 < dot_cur.length; index1++) {
                        const element1 = dot_cur[index1];
                        let check1 = new_data[index].price_dot_arr.findIndex(item => item.dot_name == element1.dot_name)
                        if (check1 == -1) {
                            new_data[index].price_dot_arr.push(
                                element1
                            )
                        }
                    }

                }

            }

        }


        let sql = `
            update app_shops_datas.dat_${table_name}_products as t set
                price_dot_arr = c.price_dot_arr
            from (values
        `
        for (let index = 0; index < new_data.length; index++) {
            const element = new_data[index];

            let price_dot_arr = element.price_dot_arr.map(
                elem => `{"dot_name":"${elem.dot_name}","price_name":"${elem.price_name}","price_value":"${elem.price_value}","dot_show":"${elem.dot_show}"}`
            )
            price_dot_arr = JSON.stringify(price_dot_arr).replace('[', '{').replace(']', '}')

            if (element.id) {
                sql = sql + `('${element.id}'::uuid, '${price_dot_arr}'::jsonb[]),`
            }
        }
        sql = sql.slice(0, -1);
        sql = sql + `
        ) as c(id, price_dot_arr) 
        where c.id = t.id;
        `

        await db.query(sql)

        for (let index1 = 0; index1 < findShopsProfileArray.length; index1++) {
            const element1 = findShopsProfileArray[index1];
            if (element1.shop_code_id !== table_name) {

                let sql = `
                    update app_shops_datas.dat_${element1.shop_code_id}_products as t set
                        price_dot_arr = c.price_dot_arr
                    from (values
                `
                for (let index = 0; index < new_data.length; index++) {
                    const element = new_data[index];

                    let price_dot_arr = element.price_dot_arr.map(
                        elem => `{"dot_name":"${elem.dot_name}","price_name":"${elem.price_name}","price_value":"${elem.price_value}","dot_show":"${elem.dot_show}"}`
                    )
                    price_dot_arr = JSON.stringify(price_dot_arr).replace('[', '{').replace(']', '}')

                    if (element.id) {
                        sql = sql + `('${element.id}'::uuid, '${price_dot_arr}'::jsonb[]),`
                    }
                }
                sql = sql.slice(0, -1);
                sql = sql + `
                    ) as c(id, price_dot_arr) 
                    where c.id = t.id;
                `
                await db.query(sql)

            }

        }


        await handleSaveLog(request, [['shop product add price dot by file'], ''])
        return ({ status: "success", data: "success" })

    }
    catch (error) {
        console.log(error)
        await handleSaveLog(request, [['shop product add price dot by file'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }


}


const handleShopProductDotPriceReport = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'GET ShopReports.ShopStock';

    try {
        const shop_table = await utilCheckShopTableName(request);
        var table_name = shop_table.shop_code_id

        // const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        let page = Number(_.get(request, 'query.page', 1));
        let limit = Number(_.get(request, 'query.limit', 10));
        const search = _.get(request, 'query.search', '');
        const export_format = request.query.export_format;


        if (export_format === 'xlsx') {
            page = 1;
            limit = 1000000;
        }


        let from = `
            app_shops_datas.dat_01hq0004_stock_products_balances b
            left join app_shops_datas.dat_01hq0004_products sh on sh.id = b.product_id
            left join jsonb_array_elements((b.warehouse_detail->0->'shelf')::jsonb) AS shelf on 1=1
            left join app_datas.dat_products ms on ms.id = sh.product_id
            left join master_lookup.mas_product_brands br on br.id = ms.product_brand_id
            left join master_lookup.mas_product_model_types md on md.id = ms.product_model_id
            left join master_lookup.mas_product_complete_sizes cs on cs.id = ms.complete_size_id
            `

        let select = `
            ms.master_path_code_id "รหัสสินค้า",
            ms.product_name->>'th' "ชื่อสินค้า",
            br.brand_name->>'th' "ยี่ห้อ",
            md.model_name->>'th' "รุ่น",
            cs.complete_size_name->>'th' "ขนาดไซส์",
            sh.price->'suggasted_re_sell_price'->>'retail' 	"ราคาขายปลีก",
            sh.price->'suggasted_re_sell_price'->>'wholesale' 	"ราคาขายส่ง",
            shelf->>'balance' "จำนวนสินค้าคงเหลือ (QTY)",
            shelf->>'dot_mfd' "DOT",
            (
                select dot->>'price_value' from unnest(sh.price_dot_arr) as dot
                where coalesce(dot->>'price_name',dot->>'dot_name') =  shelf->>'dot_mfd'
                limit 1 
            ) "ราคาราย DOT"
           
        `

        let where = `
            shelf->>'dot_mfd'!= '' and (shelf->>'balance')::int != 0
            ${search ? `and ( ms.master_path_code_id ilike '%` + search + `%' or ms.product_name->>'th' ilike '%` + search + `%')` : ``}
        `
        const fnDataResult = async () => await db.query(
            `
            select ${select}
            from ${from}
            where ${where}
            ORDER BY master_path_code_id asc                
            OFFSET :offset
            LIMIT :limit;
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                replacements: { offset: (page - 1) * limit, limit: limit }
            }
        )


        const fnCountResult = async () => await db.query(
            `
            select count(*)
            from ${from}
            where ${where}
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
            }
        )
            .then(r => Number(r[0].count));

        const [DataResult, CountResult] = await Promise.all([fnDataResult(), fnCountResult()])

        if (export_format === 'xlsx') {
            const header = {
                'รหัสสินค้า': null,
                'ชื่อสินค้า': null,
                'ยี่ห้อ': null,
                'รุ่น': null,
                'ขนาดไซส์': null,
                'ราคาขายปลีก': null,
                'ราคาขายส่ง': null,
                'จำนวนสินค้าคงเหลือ (QTY)': null,
                'DOT': null,
                'ราคาราย DOT': null
            };

            let data = [];
            if (DataResult.length === 0) {
                data.push(header);
            }
            else {
                data = DataResult
            }

            let ws = await XLSX.utils.json_to_sheet(data, {
                origin: 0,
            });

            for (let objectI in ws) {
                if (typeof (ws[objectI]) != "object") continue;
                let cell = XLSX.utils.decode_cell(objectI);
                ws[objectI].s = { // styling for all cells
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                    }
                }
                if (cell.r === 0) {
                    ws[objectI].s = { // styling for all cells
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    }
                }


            }


            const wscols = [
                { width: 25 }, // Col: A
                { width: 25 }, // Col: B
                { width: 25 }, // Col: C
                { width: 25 }, // Col: D
                { width: 25 }, // Col: E
                { width: 25 },
                { width: 25 },
                { width: 25 },
                { width: 25 },
                { width: 25 }
            ];
            ws['!cols'] = wscols;

            const file_name = uuid4() + '___รายงานราคา DOT';

            let wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });


            return utilSetFastifyResponseJson("success", file_name + '.xlsx');

        }

        const responseData = {
            currentPage: page,
            pages: Math.ceil(CountResult / limit),
            currentCount: DataResult.length,
            totalCount: CountResult,
            data: DataResult
        };

        return utilSetFastifyResponseJson("success", responseData);
    }
    catch (error) {
        if (_.isError(error)) {
            await handleSaveLog(request, [[handlerName], error]);
            throw error;
        }
        else {
            await handleSaveLog(request, [[handlerName], `error : ${error}`]);
            return utilSetFastifyResponseJson("success", error.toString());
        }
    }
};

const handleShopProductPriceArrAddByFile = async (request, res) => {

    try {

        const file = await request.body.file

        await fs.writeFileSync('src/assets/' + file.filename, await file.toBuffer());
        const wb = XLSX.readFile('src/assets/' + file.filename);
        await fs.unlinkSync('src/assets/' + file.filename)

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]
        var data = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 0 })

        let data_create_id_arr = []
        var header_ = [
            "รหัสสินค้า",
            "ชื่อสินค้า",
            "ยี่ห้อ",
            "รุ่น",
            "ขนาดไซส์",
            "ราคาขายปลีก",
            "ราคาขายส่ง",
            "จำนวนสินค้าคงเหลือ (QTY)",
            "ชื่อร่องราคา",
            "ราคารายร่อง"
        ]

        const findShopsProfile = await utilCheckShopTableName(request);
        const table_name = findShopsProfile.shop_code_id;


        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        function areEqual(start, end) {
            if (start === end) {
                return [true]; // Same memory address
            }
            if (start.length !== end.length) {
                return [false, 'Length of header do not match!'];
            }
            for (let index = 0; index < start.length; index++) {
                if (start[index] !== end[index]) {
                    return [false, ` header ${end[index]} do not match `];
                }
            }
            return [true]; // Equal!
        }

        var check_header = areEqual(header_, header)

        if (check_header[0] == false) {
            // await handleSaveLog(request, [['put stock by file'], check_header[1]])
            return ({ status: 'failed', data: check_header[1] })
        }


        let new_data = []
        for (let index = 0; index < data.length; index++) {
            const element = data[index];

            let find = new_data.findIndex(item => item.code_name == element["รหัสสินค้า"] + element["ชื่อสินค้า"])


            let price = (element["ราคารายร่อง"]) ? element["ราคารายร่อง"].toString() : null

            if (find != -1) {

                new_data[find].price_arr.push({
                    price_name: element["ชื่อร่องราคา"].toString(),
                    price_value: price,
                })
            }
            else {
                new_data.push(
                    {
                        master_path_code_id: element["รหัสสินค้า"],
                        product_name: element["ชื่อสินค้า"],
                        code_name: element["รหัสสินค้า"] + element["ชื่อสินค้า"],
                        price_arr: [
                            {
                                price_name: element["ชื่อร่องราคา"].toString(),
                                price_value: price,
                            }
                        ]
                    }
                )
            }

        }


        let check_db = await db.query(`
            select sh.id,ms.master_path_code_id,ms.product_code,ms.product_name->>'th' product_name,sh.price_arr from app_shops_datas.dat_01hq0004_products sh 
            left join app_datas.dat_products ms on ms.id = sh.product_id
            where ms.master_path_code_id in (${new_data.map(el => { return "'" + el.master_path_code_id + "'" })})
            `.replace(/(01hq0004)/ig, table_name)
            .replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                raw: false
            })



        for (let index = 0; index < new_data.length; index++) {
            const element = new_data[index];


            let check = check_db.filter(el => {
                return el.master_path_code_id == element.master_path_code_id || el.product_code == element.master_path_code_id
            })

            if (check.length > 1) {
                check = check.filter(el => {
                    return el.product_name.replace(' ', '').toLowerCase() === element.product_name.replace(' ', '').toLowerCase()
                })
            }

            if (check.length == 1) {
                new_data[index].id = check[0].id
                new_data[index].product_name = check[0].product_name

                if (check[0].price_arr != null) {

                    let price_cur = check[0].price_arr

                    for (let index1 = 0; index1 < price_cur.length; index1++) {
                        const element1 = price_cur[index1];
                        let check1 = new_data[index].price_arr.findIndex(item => item.price_name == element1.price_name)
                        if (check1 == -1) {
                            new_data[index].price_arr.push(
                                element1
                            )
                        }
                    }

                }

            }

        }


        let sql = `
            update app_shops_datas.dat_${table_name}_products as t set
                price_arr = c.price_arr
            from (values
        `
        for (let index = 0; index < new_data.length; index++) {
            const element = new_data[index];

            let price_arr = element.price_arr.map(
                elem => `{"price_name":"${elem.price_name}","price_value":"${elem.price_value}"}`
            )
            price_arr = JSON.stringify(price_arr).replace('[', '{').replace(']', '}')

            if (element.id) {
                sql = sql + `('${element.id}'::uuid, '${price_arr}'::jsonb[]),`
            }
        }
        sql = sql.slice(0, -1);
        sql = sql + `
        ) as c(id, price_arr) 
        where c.id = t.id;
        `

        await db.query(sql)

        for (let index1 = 0; index1 < findShopsProfileArray.length; index1++) {
            const element1 = findShopsProfileArray[index1];
            if (element1.shop_code_id !== table_name) {

                let sql = `
                    update app_shops_datas.dat_${element1.shop_code_id}_products as t set
                        price_arr = c.price_arr
                    from (values
                `

                for (let index = 0; index < new_data.length; index++) {
                    const element = new_data[index];


                    let price_arr = element.price_arr.map(
                        elem => `{"price_name":"${elem.price_name}","price_value":"${elem.price_value}"}`
                    )
                    price_arr = JSON.stringify(price_arr).replace('[', '{').replace(']', '}')

                    if (element.id) {
                        sql = sql + `('${element.id}'::uuid, '${price_arr}'::jsonb[]),`
                    }
                }

                sql = sql.slice(0, -1);
                sql = sql + `
                    ) as c(id, price_arr) 
                    where c.id = t.id;
                `
                await db.query(sql)

            }

        }

        await handleSaveLog(request, [['shop product add price by file'], ''])
        return ({ status: "success", data: "success" })

    }
    catch (error) {
        console.log(error)
        await handleSaveLog(request, [['shop product add price by file'], 'error : ' + error])
        return ({ status: "failed", data: 'error' })
    }


}


const handleShopProductPriceArrReport = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'GET ShopReports.ShopStock';

    try {
        const shop_table = await utilCheckShopTableName(request);
        var table_name = shop_table.shop_code_id

        // const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        let page = Number(_.get(request, 'query.page', 1));
        let limit = Number(_.get(request, 'query.limit', 10));
        const search = _.get(request, 'query.search', '');
        const export_format = request.query.export_format;


        if (export_format === 'xlsx') {
            page = 1;
            limit = 1000000;
        }


        let from = `
            app_shops_datas.dat_01hq0004_products sh
            left join unnest(sh.price_arr) as pr on 1=1
            left join app_datas.dat_products ms on ms.id = sh.product_id
            left join master_lookup.mas_product_brands br on br.id = ms.product_brand_id
            left join master_lookup.mas_product_model_types md on md.id = ms.product_model_id
            left join master_lookup.mas_product_complete_sizes cs on cs.id = ms.complete_size_id
            `

        let select = `
             	ms.master_path_code_id "รหัสสินค้า",
                ms.product_name->>'th' "ชื่อสินค้า",
                br.brand_name->>'th' "ยี่ห้อ",
                md.model_name->>'th' "รุ่น",
                cs.complete_size_name->>'th' "ขนาดไซส์",
                sh.price->'suggasted_re_sell_price'->>'retail' 	"ราคาขายปลีก",
                sh.price->'suggasted_re_sell_price'->>'wholesale' 	"ราคาขายส่ง",
                (select balance from app_shops_datas.dat_01hq0004_stock_products_balances where product_id = sh.id) "จำนวนสินค้าคงเหลือ (QTY)",
                pr->>'price_name' "ชื่อร่องราคา",
                pr->>'price_value' "ราคารายร่อง"
        `

        let where = `
            pr is not null
            ${search ? `and ( ms.master_path_code_id ilike '%` + search + `%' or ms.product_name->>'th' ilike '%` + search + `%')` : ``}
        `
        const fnDataResult = async () => await db.query(
            `
            select ${select}
            from ${from}
            where ${where}
            ORDER BY master_path_code_id asc                
            OFFSET :offset
            LIMIT :limit;
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                replacements: { offset: (page - 1) * limit, limit: limit }
            }
        )


        const fnCountResult = async () => await db.query(
            `
            select count(*)
            from ${from}
            where ${where}
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
            }
        )
            .then(r => Number(r[0].count));

        const [DataResult, CountResult] = await Promise.all([fnDataResult(), fnCountResult()])

        if (export_format === 'xlsx') {
            const header = {
                'รหัสสินค้า': null,
                'ชื่อสินค้า': null,
                'ยี่ห้อ': null,
                'รุ่น': null,
                'ขนาดไซส์': null,
                'ราคาขายปลีก': null,
                'ราคาขายส่ง': null,
                'จำนวนสินค้าคงเหลือ (QTY)': null,
                'ชื่อร่องราคา': null,
                'ราคารายร่อง': null
            };

            let data = [];
            if (DataResult.length === 0) {
                data.push(header);
            }
            else {
                data = DataResult
            }

            let ws = await XLSX.utils.json_to_sheet(data, {
                origin: 0,
            });

            for (let objectI in ws) {
                if (typeof (ws[objectI]) != "object") continue;
                let cell = XLSX.utils.decode_cell(objectI);
                ws[objectI].s = { // styling for all cells
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                    }
                }
                if (cell.r === 0) {
                    ws[objectI].s = { // styling for all cells
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    }
                }


            }


            const wscols = [
                { width: 25 }, // Col: A
                { width: 25 }, // Col: B
                { width: 25 }, // Col: C
                { width: 25 }, // Col: D
                { width: 25 }, // Col: E
                { width: 25 },
                { width: 25 },
                { width: 25 },
                { width: 25 },
                { width: 25 }
            ];

            ws['!cols'] = wscols;

            const file_name = uuid4() + '___รายงานราคา DOT';

            let wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });


            return utilSetFastifyResponseJson("success", file_name + '.xlsx');

        }

        const responseData = {
            currentPage: page,
            pages: Math.ceil(CountResult / limit),
            currentCount: DataResult.length,
            totalCount: CountResult,
            data: DataResult
        };

        return utilSetFastifyResponseJson("success", responseData);
    }
    catch (error) {
        if (_.isError(error)) {
            await handleSaveLog(request, [[handlerName], error]);
            throw error;
        }
        else {
            await handleSaveLog(request, [[handlerName], `error : ${error}`]);
            return utilSetFastifyResponseJson("success", error.toString());
        }
    }
};

const handleShopProductPriceBaseAddByFile = async (request, res) => {

    try {



        const file = await request.body.file

        await fs.writeFileSync('src/assets/' + file.filename, await file.toBuffer());
        const wb = XLSX.readFile('src/assets/' + file.filename);
        await fs.unlinkSync('src/assets/' + file.filename)

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]
        var data = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 0 })

        let data_create_id_arr = []
        var header_ = [
            "รหัสสินค้า",
            "ชื่อสินค้า",
            "จำนวนคงเหลือ",
            "ยี่ห้อ",
            "รุ่น",
            "ไซส์",
            "ราคาขายปลีก",
            "ราคาขายส่ง"
        ]

        const findShopsProfile = await utilCheckShopTableName(request);
        const table_name = findShopsProfile.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        function areEqual(start, end) {
            if (start === end) {
                return [true]; // Same memory address
            }
            if (start.length !== end.length) {
                return [false, 'Length of header do not match!'];
            }
            for (let index = 0; index < start.length; index++) {
                if (start[index] !== end[index]) {
                    return [false, ` header ${end[index]} do not match `];
                }
            }
            return [true]; // Equal!
        }

        var check_header = areEqual(header_, header)

        if (check_header[0] == false) {
            // await handleSaveLog(request, [['put stock by file'], check_header[1]])
            return ({ status: 'failed', data: check_header[1] })
        }


        let new_data = []
        for (let index = 0; index < data.length; index++) {
            const element = data[index];

            new_data.push(
                {
                    master_path_code_id: element["รหัสสินค้า"],
                    product_name: element["ชื่อสินค้า"],
                    price_retail: element["ราคาขายปลีก"].toString(),
                    price_wholesale: element["ราคาขายส่ง"].toString(),
                }
            )

        }


        let check_db = await db.query(`
            select sh.id,ms.master_path_code_id,ms.product_code,ms.product_name->>'th' product_name,sh.price from app_shops_datas.dat_01hq0004_products sh 
            left join app_datas.dat_products ms on ms.id = sh.product_id
            where ms.master_path_code_id in (${new_data.map(el => { return "'" + el.master_path_code_id + "'" })})
            `.replace(/(01hq0004)/ig, table_name)
            .replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                raw: false
            })


        for (let index = 0; index < new_data.length; index++) {
            const element = new_data[index];

            let check = check_db.filter(el => {
                return el.master_path_code_id == element.master_path_code_id || el.product_code == element.master_path_code_id
            })

            if (check.length > 1) {
                check = check.filter(el => {
                    return el.product_name.replace(' ', '').toLowerCase() === element.product_name.replace(' ', '').toLowerCase()
                })
            }

            if (check.length == 1) {
                new_data[index].id = check[0].id
                new_data[index].product_name = check[0].product_name
            }

        }


        let sql = `
            update app_shops_datas.dat_${table_name}_products as t set
                price =  price::jsonb || json_build_object(
                                            'suggasted_re_sell_price',
                                            json_build_object('retail', c.price_retail,'wholesale',c.price_wholesale)
                                        )::jsonb
            from (values
        `
        for (let index = 0; index < new_data.length; index++) {
            const element = new_data[index];
            if (element.id) {
                sql = sql + `('${element.id}'::uuid, '${element.price_retail}', '${element.price_wholesale}'),`

            }


        }

        sql = sql.slice(0, -1);
        sql = sql + `
        ) as c(id, price_retail,price_wholesale) 
        where c.id = t.id;
        `

        await db.query(sql)

        for (let index1 = 0; index1 < findShopsProfileArray.length; index1++) {
            const element1 = findShopsProfileArray[index1];
            if (element1.shop_code_id !== table_name) {

                let sql = `
                    update app_shops_datas.dat_${element1.shop_code_id}_products as t set
                          price =  price::jsonb || json_build_object(
                                                        'suggasted_re_sell_price',
                                                        json_build_object('retail', c.price_retail,'wholesale',c.price_wholesale)
                                                    )::jsonb
                        from (values
                    `
                for (let index = 0; index < new_data.length; index++) {
                    const element = new_data[index];

                    if (element.id) {
                        sql = sql + `('${element.id}'::uuid, '${element.price_retail}', '${element.price_wholesale}'),`
                    }
                }

                sql = sql.slice(0, -1);
                sql = sql + `
                    ) as c(id, price_retail,price_wholesale) 
                    where c.id = t.id;
                `
                await db.query(sql)

            }

        }


        await handleSaveLog(request, [['shop product add price base by file'], ''])
        return ({ status: "success", data: "success" })

    }
    catch (error) {
        console.log(error)
        await handleSaveLog(request, [['shop product add price base by file'], 'error : ' + error])
        return ({ status: "failed", data: 'error' })
    }


}


const handleShopProductPriceBaseReport = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'GET ShopReports.ShopStock';

    try {
        const shop_table = await utilCheckShopTableName(request);
        var table_name = shop_table.shop_code_id

        // const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        let page = Number(_.get(request, 'query.page', 1));
        let limit = Number(_.get(request, 'query.limit', 10));
        const search = _.get(request, 'query.search', '');
        const export_format = request.query.export_format;


        if (export_format === 'xlsx') {
            page = 1;
            limit = 1000000;
        }


        let from = `
            app_shops_datas.dat_01hq0015_products sh
            left join app_datas.dat_products ms on ms.id = sh.product_id
            left join master_lookup.mas_product_brands br on br.id = ms.product_brand_id
            left join master_lookup.mas_product_model_types md on md.id = ms.product_model_id
            left join master_lookup.mas_product_complete_sizes cs on cs.id = ms.complete_size_id
            `
        let select = `
             		ms.master_path_code_id "รหัสสินค้า",
                    ms.product_name->>'th' "ชื่อสินค้า",
                    (select balance from app_shops_datas.dat_01hq0015_stock_products_balances where product_id = sh.id) "จำนวนคงเหลือ",
                    br.brand_name->>'th' "ยี่ห้อ",
                    md.model_name->>'th' "รุ่น",
                    cs.complete_size_name->>'th' "ไซส์",
                    sh.price->'suggasted_re_sell_price'->>'retail' 	"ราคาขายปลีก",
                    sh.price->'suggasted_re_sell_price'->>'wholesale' 	"ราคาขายส่ง"
                `

        let where = `
            1 = 1
            ${search ? `and ( ms.master_path_code_id ilike '%` + search + `%' or ms.product_name->>'th' ilike '%` + search + `%')` : ``}
        `
        const fnDataResult = async () => await db.query(
            `
            select ${select}
            from ${from}
            where ${where}
            ORDER BY master_path_code_id asc                
            OFFSET :offset
            LIMIT :limit;
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                replacements: { offset: (page - 1) * limit, limit: limit }
            }
        )


        const fnCountResult = async () => await db.query(
            `
            select count(*)
            from ${from}
            where ${where}
            `.replace(/(01hq0004)/ig, table_name).replace(/(\s)+/ig, ' '),
            {
                type: QueryTypes.SELECT,
            }
        )
            .then(r => Number(r[0].count));

        const [DataResult, CountResult] = await Promise.all([fnDataResult(), fnCountResult()])

        if (export_format === 'xlsx') {
            const header = {
                'รหัสสินค้า': null,
                'ชื่อสินค้า': null,
                'จำนวนคงเหลือ': null,
                'ยี่ห้อ': null,
                'รุ่น': null,
                'ไซส์': null,
                'ราคาขายปลีก': null,
                'ราคาขายส่ง': null

            };

            let data = [];
            if (DataResult.length === 0) {
                data.push(header);
            }
            else {
                data = DataResult
            }

            let ws = await XLSX.utils.json_to_sheet(data, {
                origin: 0,
            });

            for (let objectI in ws) {
                if (typeof (ws[objectI]) != "object") continue;
                let cell = XLSX.utils.decode_cell(objectI);
                ws[objectI].s = { // styling for all cells
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                    }
                }
                if (cell.r === 0) {
                    ws[objectI].s = { // styling for all cells
                        font: {
                            name: "TH SarabunPSK",
                            sz: 16,
                            bold: true,
                        }
                    }
                }


            }


            const wscols = [
                { width: 25 }, // Col: A
                { width: 25 }, // Col: B
                { width: 25 }, // Col: C
                { width: 25 }, // Col: D
                { width: 25 }, // Col: E
                { width: 25 },
                { width: 25 },
                { width: 25 },
                { width: 25 },
                { width: 25 }
            ];

            ws['!cols'] = wscols;

            const file_name = uuid4() + '___รายงานราคา DOT';

            let wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });


            return utilSetFastifyResponseJson("success", file_name + '.xlsx');

        }

        const responseData = {
            currentPage: page,
            pages: Math.ceil(CountResult / limit),
            currentCount: DataResult.length,
            totalCount: CountResult,
            data: DataResult
        };

        return utilSetFastifyResponseJson("success", responseData);
    }
    catch (error) {
        if (_.isError(error)) {
            await handleSaveLog(request, [[handlerName], error]);
            throw error;
        }
        else {
            await handleSaveLog(request, [[handlerName], `error : ${error}`]);
            return utilSetFastifyResponseJson("success", error.toString());
        }
    }
};




module.exports = {
    handleShopProductAll,
    handleShopProductAdd,
    handleShopProductById,
    handleShopProductPut,
    handleShopProductAddByFile,
    handleAddImage,
    handleShopProductDotPriceAddByFile,
    handleShopProductDotPriceReport,
    handleShopProductPriceArrAddByFile,
    handleShopProductPriceArrReport,
    handleShopProductPriceBaseAddByFile,
    handleShopProductPriceBaseReport,
}