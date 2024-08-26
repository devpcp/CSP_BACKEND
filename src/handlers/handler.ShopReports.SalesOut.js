const _ = require("lodash");
const XLSX = require('xlsx-js-style');
const { QueryTypes } = require("sequelize");
const { v4: uuid4 } = require("uuid");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");

/**
 * @param request {import("../types/type.Default.Fastify").FastifyRequestDefault | {}}
 * @param table_name {string | string[]}
 */
const serviceShopReportSalesOuts_V2 = async (request = {}, table_name = []) => {
    if (!_.isArray(table_name) && !_.isString(table_name)) { throw Error('Require parameter @table_name'); }
    _.isString(table_name) ? table_name = [table_name] : [];

    const transaction = request?.transaction || null;

    const report_sales_out_type = request.query?.report_sales_out_type || 'doc';

    const search = (request.query.search || '').replace(/\s+/g, '%');
    const start_date = request.query.start_date || '';
    const end_date = request.query.end_date || '';

    /**
     * 1 = จำนวนยี่ห้อที่ขายต่อลูกค้า
     * 2 = จำนวนรุ่นที่ขายต่อลูกค้า
     * 3 = จำนวนไซส์ที่ขายต่อลูกค้า
     */
    const which_export = request.query.which_export
    const which_export_name = (which_export === 1) ? 'จำนวนยี่ห้อที่ขายต่อลูกค้า' : (which_export === 2) ? 'จำนวนรุ่นที่ขายต่อลูกค้า' : (which_export === 3) ? 'จำนวนไซส์ที่ขายต่อลูกค้า' : ''



    /**
     * ใบสั่งขาย 67c45df3-4f84-45a8-8efc-de22fef31978
     * ใบสั่งซ่อม 7ef3840f-3d7f-43de-89ea-dce215703c16
     * ใบเสร็จอย่างย่อ b39bcb5d-6c72-4979-8725-c384c80a66c3
     * @type {string[]}
     */
    const doc_type_id = request.query?.doc_type_id?.split(',').length > 0 ? request.query.doc_type_id.split(',') : ['67c45df3-4f84-45a8-8efc-de22fef31978', '7ef3840f-3d7f-43de-89ea-dce215703c16'];
    const payment_paid_status = request.query?.payment_paid_status.split(',').length > 0 ? request.query.payment_paid_status.split(',').map(w => Number(w)) : [];
    const payment_type = request.query?.payment_type?.split(',').length > 0 ? request.query.payment_type.split(',').map(w => Number(w)) : [];
    const status = request.query?.status?.split(',').length > 0 ? request.query.status.split(',').map(w => Number(w)) : [1, 2];

    const payment_paid_date__startDate = request.query?.payment_paid_date__startDate || '';
    const payment_paid_date__endDate = request.query?.payment_paid_date__endDate || '';
    const per_customer_id = request.query.per_customer_id
    const bus_customer_id = request.query.bus_customer_id
    const vehicle_customer_id = request.query.vehicle_customer_id

    /**
     * @type {"json"|"xlsx"}
     */
    const export_format = request.query.export_format || 'json';

    let page = request.query.page || 1;
    if (!page || page < 1) {
        page = 1;
    }

    let limit = request.query.limit || 10;
    if (!limit || limit < 1) {
        limit = 1000000;
    }

    if (export_format === 'xlsx') {
        page = 1;
        limit = 1000000;
    }

    /**
     * @type {string[]}
     */
    const whereConditions = [];
    if (search) {
        if (report_sales_out_type === 'list') {
            /**
             * @type {string[]}
             */
            const whereSearch = [];
            whereSearch.push(`(CTE_List."ShopServiceOrderDoc"->>'code_id' ILIKE :search)`);
            whereSearch.push(`(CTE_List."ShopServiceOrderDoc"->>'abb_code_id' ILIKE :search)`);
            whereSearch.push(`(CTE_List."ShopServiceOrderDoc"->>'inv_code_id' ILIKE :search)`);
            whereSearch.push(`(CTE_List."ShopServiceOrderDoc"->>'trn_code_id' ILIKE :search)`);
            whereSearch.push(`(CTE_List."ShopServiceOrderDoc"->>'customer_code_id' ILIKE :search)`);
            whereSearch.push(`(CTE_List."ShopServiceOrderDoc"->>'customer_name' ILIKE :search)`);
            whereSearch.push(`(CTE_List."ShopServiceOrderDoc"->>'vehicle_registration' ILIKE :search)`);


            whereSearch.push(`(CTE_List."ShopProduct"->'Product'->>'product_name' ILIKE :search)`);
            if (/^[0-9]+$/.test(search)) {
                whereSearch.push(`REGEXP_REPLACE("ShopProduct"->'Product'->>'product_name', '[^0-9]', '', 'g') LIKE :search)`);
            }

            whereSearch.push(`(CTE_List."ShopProduct"->'Product'->>'complete_size_name' ILIKE :search)`);
            whereSearch.push(`(CTE_List."ShopProduct"->'Product'->>'custom_path_code_id' ILIKE :search)`);
            whereSearch.push(`(CTE_List."ShopProduct"->'Product'->>'master_path_code_id' ILIKE :search)`);

            //

            whereConditions.push(
                `(${whereSearch.reduce((prev, curr, idx) => {
                    if (idx > 0) {
                        prev = prev + ' OR ';
                    }
                    return prev + curr
                }, ``)
                })`
            );
        }
        else {
            /**
             * @type {string[]}
             */
            const whereSearch = [];
            whereSearch.push(`(code_id ILIKE :search)`);
            whereSearch.push(`(customer_name ILIKE :search)`);
            whereSearch.push(`(vehicle_registration ILIKE :search)`);
            whereConditions.push(
                `(${whereSearch.reduce((prev, curr, idx) => {
                    if (idx > 0) {
                        prev = prev + ' OR ';
                    }
                    return prev + curr
                }, ``)
                })`
            );
        }
    }
    if (start_date && end_date) {
        if (report_sales_out_type === 'list') {
            whereConditions.push(`((CTE_List."ShopServiceOrderDoc"->>'doc_date')::date BETWEEN :start_date AND :end_date)`);
        }
        else {
            whereConditions.push(`(doc_date BETWEEN :start_date AND :end_date)`);
        }
    }
    if (payment_paid_date__startDate && payment_paid_date__endDate) {
        if (report_sales_out_type === 'list') {
            whereConditions.push(`((CTE_List."ShopServiceOrderDoc"->>'payment_paid_date')::date BETWEEN :payment_paid_date__startDate AND :payment_paid_date__endDate)`);
        }
    }

    if (per_customer_id) {
        if (report_sales_out_type === 'list') {
            whereConditions.push(`CTE_List."ShopServiceOrderDoc"->>'per_customer_id' = '${per_customer_id}'`);
        } else {
            whereConditions.push(`per_customer_id = '${per_customer_id}'`);
        }
    }

    if (bus_customer_id) {
        if (report_sales_out_type === 'list') {
            whereConditions.push(`CTE_List."ShopServiceOrderDoc"->>'bus_customer_id' = '${bus_customer_id}'`);
        } else {
            whereConditions.push(`bus_customer_id = '${bus_customer_id}'`);
        }
    }


    if (vehicle_customer_id) {
        if (report_sales_out_type === 'list') {
            whereConditions.push(`CTE_List."ShopServiceOrderDoc"->>'vehicle_customer_id' = '${vehicle_customer_id}'`);
        } else {
            whereConditions.push(`vehicle_customer_id = '${vehicle_customer_id}'`);
        }
    }



    let sqlQuery = `
        WITH
            ${table_name.reduce((prev, curr, idx) => {
        if (idx > 0) {
            prev = prev + `,`;
        }
        return prev + `
                CTE_01hq0010 AS (
                    SELECT
                    "ShopServiceOrderDoc".id,
                    "ShopServiceOrderDoc".shop_id,
                    "ShopServiceOrderDoc".code_id,
                    "ShopServiceOrderDoc".doc_date,
                    "ShopServiceOrderDoc".per_customer_id,
                    "ShopServiceOrderDoc".bus_customer_id,
                    "ShopServiceOrderDoc".vehicle_customer_id,
                    "ShopServiceOrderDoc".price_sub_total,
                    "ShopServiceOrderDoc".price_discount_total,
                    "ShopServiceOrderDoc".price_vat,
                    "ShopServiceOrderDoc".price_grand_total,
                    "ShopServiceOrderDoc".status,
                    (SELECT k.type_name->>'th' FROM master_lookup.mas_tax_types AS k WHERE k.id = "ShopServiceOrderDoc".tax_type_id) AS tax_type_name,
                    (
                        CASE
                            WHEN "ShopServiceOrderDoc".payment_paid_status = 5
                            THEN (CASE WHEN
                                    "ShopServiceOrderDoc".debt_price_amount -
                                    coalesce((
                                        SELECT debt_price_paid_grand_total
                                        FROM (
                                                SELECT
                                                    shop_service_order_doc_id,
                                                    sum(debt_price_paid_total + debt_price_paid_adjust)::numeric(20,2) AS debt_price_paid_grand_total
                                                FROM app_shops_datas.dat_01hq0010_customer_debt_list AS "ShopCustDebtList"
                                                WHERE "ShopCustDebtList".shop_customer_debt_doc_id = (SELECT x.id FROM app_shops_datas.dat_01hq0010_customer_debt_doc AS x WHERE x.id = "ShopCustDebtList".shop_customer_debt_doc_id AND x.status = 1 AND x.payment_paid_status = 3)
                                                GROUP BY shop_service_order_doc_id
                                             ) AS u
                                        WHERE u.shop_service_order_doc_id = "ShopServiceOrderDoc".id
                                    ),0) = 0
                                    THEN 3
                                    ELSE "ShopServiceOrderDoc".payment_paid_status
                                END)
                            ELSE "ShopServiceOrderDoc".payment_paid_status
                        END
                    ) AS payment_paid_status,
                    (
                        CASE
                            WHEN "ShopServiceOrderDoc".per_customer_id IS NOT NULL
                            THEN (SELECT "ShopPersonalCustomer".master_customer_code_id FROM app_shops_datas.dat_01hq0010_personal_customers AS "ShopPersonalCustomer" WHERE "ShopPersonalCustomer".id = "ShopServiceOrderDoc".per_customer_id)
                            ELSE
                                (
                                    CASE
                                        WHEN "ShopServiceOrderDoc".bus_customer_id IS NOT NULL
                                        THEN (SELECT "ShopbusinessCustomer".master_customer_code_id FROM app_shops_datas.dat_01hq0010_business_customers AS "ShopbusinessCustomer" WHERE "ShopbusinessCustomer".id = "ShopServiceOrderDoc".bus_customer_id)
                                        ELSE null
                                    END
                                )
                        END
                    ) AS customer_code_id,
                    (
                        CASE
                            WHEN "ShopServiceOrderDoc".per_customer_id IS NOT NULL
                            THEN (SELECT coalesce("ShopPersonalCustomer".customer_name->'first_name'->>'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name->'last_name'->>'th', '') FROM app_shops_datas.dat_01hq0010_personal_customers AS "ShopPersonalCustomer" WHERE "ShopPersonalCustomer".id = "ShopServiceOrderDoc".per_customer_id)
                            ELSE
                                (
                                    CASE
                                        WHEN "ShopServiceOrderDoc".bus_customer_id IS NOT NULL
                                        THEN (SELECT "ShopbusinessCustomer".customer_name->>'th' FROM app_shops_datas.dat_01hq0010_business_customers AS "ShopbusinessCustomer" WHERE "ShopbusinessCustomer".id = "ShopServiceOrderDoc".bus_customer_id)
                                        ELSE ''
                                    END
                                )
                        END
                    ) AS customer_name,
                    (
                        CASE
                            WHEN "ShopServiceOrderDoc".per_customer_id IS NOT NULL
                            THEN (SELECT "ShopPersonalCustomer".other_details->>'is_member' FROM app_shops_datas.dat_01hq0010_personal_customers AS "ShopPersonalCustomer" WHERE "ShopPersonalCustomer".id = "ShopServiceOrderDoc".per_customer_id)
                            ELSE
                                (
                                    CASE
                                        WHEN "ShopServiceOrderDoc".bus_customer_id IS NOT NULL
                                        THEN (SELECT "ShopbusinessCustomer".other_details->>'is_member' FROM app_shops_datas.dat_01hq0010_business_customers AS "ShopbusinessCustomer" WHERE "ShopbusinessCustomer".id = "ShopServiceOrderDoc".bus_customer_id)
                                        ELSE ''
                                    END
                                )
                        END
                    ) AS is_member,
                    (
                        CASE
                            WHEN "ShopServiceOrderDoc".details->>'sales_man' IS NOT NULL 
                                THEN  (select concat(fname->>'th' ,' ',lname->>'th') from app_datas.dat_users_profiles
                                        where user_id = ("ShopServiceOrderDoc".details->'sales_man'->>0)::uuid)
                            ELSE null
                        END
                    ) as sales_man,
                    ${(which_export !== 0) ? `(
                        CASE
                            WHEN "ShopServiceOrderDoc".per_customer_id IS NOT NULL
                            THEN (SELECT 
                                json_build_object(
                                    'id',"ShopPersonalCustomer".id,
                                    'master_customer_code_id',"ShopPersonalCustomer".master_customer_code_id,
                                    'customer_type','ลูกค้าธรรมดา',
                                    'is_member',coalesce("ShopPersonalCustomer".other_details->>'is_member','false')::boolean
                                ) 
                                FROM app_shops_datas.dat_01hq0010_personal_customers AS "ShopPersonalCustomer" WHERE "ShopPersonalCustomer".id = "ShopServiceOrderDoc".per_customer_id)
                            ELSE
                                (
                                    CASE
                                        WHEN "ShopServiceOrderDoc".bus_customer_id IS NOT NULL
                                        THEN (SELECT 
                                            json_build_object(
                                                'id',"ShopbusinessCustomer".id,
                                                'master_customer_code_id',"ShopbusinessCustomer".master_customer_code_id,
                                                'customer_type','ลูกค้าธุรกิจ',
                                                'is_member',coalesce("ShopbusinessCustomer".other_details->>'is_member','false')::boolean
                                            ) 
                                            FROM app_shops_datas.dat_01hq0010_business_customers AS "ShopbusinessCustomer" WHERE "ShopbusinessCustomer".id = "ShopServiceOrderDoc".bus_customer_id)
                                        ELSE '{}'
                                    END
                                )
                        END
                    ) AS customer_json,`: ``}
                    (
                        CASE
                            WHEN "ShopServiceOrderDoc".vehicle_customer_id IS NOT NULL
                            THEN (SELECT
                                      CASE
                                        WHEN (CASE WHEN "ShopVehicleCuster".details->>'province_name' IS NULL THEN '' ELSE "ShopVehicleCuster".details->>'province_name' END) || (CASE WHEN "ShopVehicleCuster".details->>'registration' IS NULL THEN '' ELSE "ShopVehicleCuster".details->>'registration' END) IN ('', ' ')
                                        THEN ''
                                        ELSE (CASE WHEN "ShopVehicleCuster".details->>'province_name' IS NULL THEN '' ELSE ("ShopVehicleCuster".details->>'province_name' || ' ') END) || (CASE WHEN "ShopVehicleCuster".details->>'registration' IS NULL THEN '' ELSE "ShopVehicleCuster".details->>'registration' END)
                                      END
                                  FROM app_shops_datas.dat_01hq0010_vehicles_customers AS "ShopVehicleCuster" WHERE "ShopVehicleCuster".id = "ShopServiceOrderDoc".vehicle_customer_id)
                            ELSE ''
                        END
                    ) AS vehicle_registration,
                    "ShopServiceOrderDoc".created_date,
                    coalesce((SELECT "ShopTemporaryDeliveryDoc".code_id FROM app_shops_datas.dat_01hq0010_temporary_delivery_order_doc AS "ShopTemporaryDeliveryDoc" WHERE "ShopTemporaryDeliveryDoc".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "ShopTemporaryDeliveryDoc".status = 1 AND "ShopTemporaryDeliveryDoc".is_draft = False), '') AS trn_code_id,
                    coalesce((SELECT "ShopTaxInvoiceDoc".abb_code_id FROM app_shops_datas.dat_01hq0010_tax_invoice_doc AS "ShopTaxInvoiceDoc" WHERE "ShopTaxInvoiceDoc".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "ShopTaxInvoiceDoc".status = 1 AND "ShopTaxInvoiceDoc".is_abb = True), '') AS abb_code_id,
                    coalesce((SELECT "ShopTaxInvoiceDoc".inv_code_id FROM app_shops_datas.dat_01hq0010_tax_invoice_doc AS "ShopTaxInvoiceDoc" WHERE "ShopTaxInvoiceDoc".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "ShopTaxInvoiceDoc".status = 1 AND "ShopTaxInvoiceDoc".is_inv = True), '') AS inv_code_id,
                    coalesce((
                        SELECT
                            CASE
                                WHEN "ShopPaymentTransaction".is_partial_payment = True
                                THEN 999
                                ELSE "ShopPaymentTransaction".payment_method
                            END
                        FROM app_shops_datas.dat_01hq0010_payment_transaction AS "ShopPaymentTransaction"
                        WHERE "ShopPaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id
                          AND ("ShopPaymentTransaction".canceled_payment_by IS NULL OR "ShopPaymentTransaction".canceled_payment_date IS NULL)
                        ORDER BY "ShopPaymentTransaction".payment_paid_date DESC
                        LIMIT 1
                    ), 0) AS payment_type,
                     coalesce((
                        SELECT SUM("ShopPaymentTransaction".payment_price_paid)
                        FROM app_shops_datas.dat_01hq0010_payment_transaction AS "ShopPaymentTransaction"
                        WHERE "ShopPaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id
                          AND ("ShopPaymentTransaction".canceled_payment_by IS NULL OR "ShopPaymentTransaction".canceled_payment_date IS NULL)
                    ), 0) AS payment_price,
                    (
                        SELECT
                            "ShopPaymentTransaction".payment_paid_date
                        FROM app_shops_datas.dat_01hq0010_payment_transaction AS "ShopPaymentTransaction"
                        WHERE "ShopPaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id
                        ORDER BY "ShopPaymentTransaction".payment_paid_date DESC
                        LIMIT 1
                    ) AS payment_paid_date
                    FROM  app_shops_datas.dat_01hq0010_service_order_doc AS "ShopServiceOrderDoc"
                    WHERE "ShopServiceOrderDoc".is_draft = FALSE
                        AND "ShopServiceOrderDoc".status IN (${status}) 
                        ${doc_type_id.length > 0 ? `AND "ShopServiceOrderDoc".doc_type_id IN (${doc_type_id.map(w => `'${w}'`)})` : ''}
                        ${payment_paid_status.length > 0 ? `AND 
                             ((
                                CASE
                                    WHEN "ShopServiceOrderDoc".payment_paid_status = 5
                                    THEN (CASE WHEN
                                            "ShopServiceOrderDoc".debt_price_amount -
                                            coalesce((
                                                SELECT debt_price_paid_grand_total
                                                FROM (
                                                        SELECT
                                                            shop_service_order_doc_id,
                                                            sum(debt_price_paid_total + debt_price_paid_adjust)::numeric(20,2) AS debt_price_paid_grand_total
                                                        FROM app_shops_datas.dat_01hq0010_customer_debt_list AS "ShopCustDebtList"
                                                        WHERE "ShopCustDebtList".shop_customer_debt_doc_id = (SELECT x.id FROM app_shops_datas.dat_01hq0010_customer_debt_doc AS x WHERE x.id = "ShopCustDebtList".shop_customer_debt_doc_id AND x.status = 1 AND x.payment_paid_status = 3)
                                                        GROUP BY shop_service_order_doc_id
                                                     ) AS u
                                                WHERE u.shop_service_order_doc_id = "ShopServiceOrderDoc".id
                                            ),0) = 0
                                            THEN 3
                                            ELSE "ShopServiceOrderDoc".payment_paid_status
                                        END)
                                    ELSE "ShopServiceOrderDoc".payment_paid_status
                                END
                            )
                         IN (${payment_paid_status.map(w => `${w}`)}))` : ''}
                        ${payment_type.length > 0 ? `AND (
                            coalesce((
                                SELECT
                                    CASE
                                        WHEN "ShopPaymentTransaction".is_partial_payment = True
                                        THEN 999
                                        ELSE "ShopPaymentTransaction".payment_method
                                    END
                                FROM app_shops_datas.dat_01hq0010_payment_transaction AS "ShopPaymentTransaction"
                                WHERE "ShopPaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id
                                  AND ("ShopPaymentTransaction".canceled_payment_by IS NULL OR "ShopPaymentTransaction".canceled_payment_date IS NULL)
                                ORDER BY "ShopPaymentTransaction".payment_paid_date DESC
                                LIMIT 1
                            ), 0)
                        IN (${payment_type.map(w => `${w}`)}))` : ''}
                )
                `.replace(/(_01hq0010)/ig, `_${curr}`);
    }, ``)},
        CTE_UNION AS (
            ${table_name.reduce((prev, curr, idx) => {
        if (idx > 0) {
            prev = prev + `UNION ALL`;
        }

        return prev + `
                (SELECT * FROM CTE_${curr})
                `;
    }, ``)}
        )
    `;

    if (report_sales_out_type === 'list') {
        sqlQuery = `
            WITH
                CTE_Doc AS (
                    ${sqlQuery}
                    SELECT *
                    FROM CTE_UNION
                ),
                CTE_List_Pre AS (
                    ${table_name.reduce((prev, curr, idx) => {
            if (idx > 0) {
                prev = prev + `UNION ALL\n`;
            }

            return prev + `
                                        (
                                            SELECT
                                                "ShopServiceOrderList".id,
                                                (SELECT X.shop_id FROM app_shops_datas.dat_01hq0004_service_order_doc AS X WHERE X.id = "ShopServiceOrderList".shop_service_order_doc_id) AS shop_id,
                                                "ShopServiceOrderList".shop_service_order_doc_id,
                                                "ShopServiceOrderList".seq_number,
                                                "ShopServiceOrderList".shop_product_id,
                                                "ShopServiceOrderList".price_unit,
                                                "ShopServiceOrderList".dot_mfd,
                                                "ShopServiceOrderList".amount,
                                                "ShopServiceOrderList".price_discount,
                                                "ShopServiceOrderList".price_discount_percent,
                                                "ShopServiceOrderList".proportion_discount_ratio,
                                                "ShopServiceOrderList".proportion_discount_price,
                                                "ShopServiceOrderList".price_grand_total,
                                                (
                                                    SELECT jsonb_build_object(
                                                           'id', "ShopProduct".id,
                                                           'product_id', "ShopProduct".product_id,
                                                           'Product', (
                                                                    SELECT jsonb_build_object(
                                                                        'id', "Product".id,
                                                                        'product_name', "Product".product_name->>'th',
                                                                        'master_path_code_id', "Product".master_path_code_id,
                                                                        'custom_path_code_id', "Product".custom_path_code_id,
                                                                        'type_name', ty.type_name->>'th',
                                                                        'group_type_name', gr.group_type_name->>'th',
                                                                        'model_name', mo.model_name->>'th',
                                                                        'brand_name', br.brand_name->>'th',
                                                                        'complete_size_name', sz.complete_size_name->>'th'
                                                                    )
                                                                    FROM app_datas.dat_products AS "Product"
                                                                    left join master_lookup.mas_product_types ty on ty.id = "Product".product_type_id
                                                                    left join master_lookup.mas_product_type_groups gr on gr.id = ty.type_group_id
                                                                    left join master_lookup.mas_product_brands br on br.id = "Product".product_brand_id
                                                                    left join master_lookup.mas_product_model_types mo on mo.id = "Product".product_model_id
                                                                    left join master_lookup.mas_product_complete_sizes sz on sz.id = "Product".complete_size_id
                                                                    WHERE "Product".id = "ShopProduct".product_id
                                                               )
                                                    )
                                                    FROM app_shops_datas.dat_01hq0004_products AS "ShopProduct"
                                                    WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                                ) AS "ShopProduct"
                                            FROM app_shops_datas.dat_01hq0004_service_order_list AS "ShopServiceOrderList"
                                            WHERE "ShopServiceOrderList".status = 1
                                              AND ("ShopServiceOrderList".shop_service_order_doc_id = (SELECT X.id FROM app_shops_datas.dat_01hq0004_service_order_doc AS X WHERE X.id = "ShopServiceOrderList".shop_service_order_doc_id))
                                        )
                                    `.replace(/(_01hq0004)/ig, `_${curr}`);
        }, ``)}
                ),
                CTE_List AS (
                    SELECT
                        CTE_List_Pre.*,
                        CTE_Doc.doc_date,
                        CTE_Doc.created_date,
                        CTE_Doc.code_id,
                        (
                            SELECT jsonb_build_object(
                            'id', "ShopProfile".id,
                            'shop_name', "ShopProfile".shop_name->>'th',
                            'shop_local_name', "ShopProfile".shop_name->>'shop_local_name'
                            )
                            FROM app_datas.dat_shops_profiles AS "ShopProfile"
                            WHERE "ShopProfile".id = CTE_Doc.shop_id
                        ) AS "ShopProfile",
                        jsonb_build_object(
                            'id', CTE_Doc.id,
                            'shop_id', CTE_Doc.shop_id,
                            'code_id', CTE_Doc.code_id,
                            'doc_date', CTE_Doc.doc_date,
                            'per_customer_id', CTE_Doc.per_customer_id,
                            'bus_customer_id', CTE_Doc.bus_customer_id,
                            'vehicle_customer_id', CTE_Doc.vehicle_customer_id,
                            'tax_type_name', CTE_Doc.tax_type_name,
                            'price_sub_total', CTE_Doc.price_sub_total,
                            'price_discount_total', CTE_Doc.price_discount_total,
                            'price_vat', CTE_Doc.price_vat,
                            'price_grand_total', CTE_Doc.price_grand_total,
                            'payment_paid_status', CTE_Doc.payment_paid_status,
                            'customer_code_id', CTE_Doc.customer_code_id,
                            'customer_name', CTE_Doc.customer_name,
                            'sales_man',CTE_Doc.sales_man,
                            'is_member', CTE_Doc.is_member,
                            ${(which_export !== 0) ? `'customer_json', CTE_Doc.customer_json,` : ``}
                            'vehicle_registration', CTE_Doc.vehicle_registration,
                            'created_date', CTE_Doc.created_date,
                            'trn_code_id', CTE_Doc.trn_code_id,
                            'abb_code_id', CTE_Doc.abb_code_id,
                            'inv_code_id', CTE_Doc.inv_code_id,
                            'payment_type', CTE_Doc.payment_type,
                            'payment_price',CTE_Doc.payment_price,
                            'payment_paid_date', (CTE_Doc.payment_paid_date)::date,
                            'status',CTE_Doc.status
                        ) AS "ShopServiceOrderDoc"
                    FROM CTE_List_Pre
                    JOIN CTE_Doc ON CTE_Doc.id = CTE_List_Pre.shop_service_order_doc_id AND CTE_Doc.shop_id = CTE_List_Pre.shop_id
                    
                )
        `;
    }

    sqlQuery = sqlQuery.replace(/(\s)+/ig, ' ');

    const queryResult__Data = await db.query(
        sqlQuery + `
        SELECT 
        ${(which_export !== 0) ? `
        "ShopServiceOrderDoc"->'customer_json'->>'master_customer_code_id' as "รหัสลูกค้า",
        "ShopServiceOrderDoc"->>'customer_name' as "ชื่อลูกค้า",
        "ShopServiceOrderDoc"->>'sales_man' as "พนักงานขาย",
        "ShopServiceOrderDoc"->'customer_json'->>'customer_type' as "ประเภทลูกค้า",
        "ShopServiceOrderDoc"->'customer_json'->>'is_member' as "สถานะสมาชิก",
        ${(which_export == 1) ? ` "ShopProduct"->'Product'->>'brand_name' as "ยี่ห้อ",` : (which_export == 2) ? ` "ShopProduct"->'Product'->>'model_name' as "รุ่น",` : `"ShopProduct"->'Product'->>'complete_size_name' as "ไซส์",`}
        sum(amount) as "จำนวน"
        ` : `*`}
        FROM ${report_sales_out_type === 'list' ? 'CTE_List' : 'CTE_UNION'}
            ${whereConditions.reduce((prev, curr, idx, arr) => {
            if (arr.length > 0 && idx === 0) {
                prev = prev + `WHERE `;
            }
            if (idx > 0) {
                prev = prev + `\n AND `;
            }

            return prev + curr;
        }, ``)}
        ${(which_export !== 0) ? `
        GROUP BY 
            "ShopServiceOrderDoc"->'customer_json'->>'master_customer_code_id' ,
            "ShopServiceOrderDoc"->>'customer_code_id',
            "ShopServiceOrderDoc"->>'customer_name',
            "ShopServiceOrderDoc"->>'sales_man',
            "ShopServiceOrderDoc"->'customer_json'->>'customer_type' ,
            "ShopServiceOrderDoc"->'customer_json'->>'is_member',
            ${(which_export == 1) ? ` "ShopProduct"->'Product'->>'brand_name'` : (which_export == 2) ? ` "ShopProduct"->'Product'->>'model_name'` : `"ShopProduct"->'Product'->>'complete_size_name'`}
        ORDER BY "ShopServiceOrderDoc"->>'customer_name'` : `
        ORDER BY 
        doc_date DESC, 
        created_date DESC, 
        code_id DESC
        `}
        ${report_sales_out_type === 'list' && which_export == 0 ? ',seq_number ASC' : ''}
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
        `.replace(/(\s)+/ig, ' '),
        {
            transaction: transaction,
            type: QueryTypes.SELECT,
            replacements: {
                search: `%${search}%`,
                start_date: start_date,
                end_date: end_date,
                payment_paid_date__startDate: payment_paid_date__startDate,
                payment_paid_date__endDate: payment_paid_date__endDate,
            }
        }
    );


    if (export_format === 'xlsx' && which_export !== 0) {
        let data_header = {
            'รหัสลูกค้า': null,
            'ชื่อลูกค้า': null,
            'ประเภทลูกค้า': null,
            'สถานะสมาชิก': null,
        }
        if (which_export == 1) {
            data_header['ยี่ห้อ'] = null
        } else if (which_export == 2) {
            data_header['รุ่น'] = null
        } else {
            data_header['ไซส์'] = null
        }

        data_header['จำนวน'] = null

        const results = queryResult__Data;
        let data = [];
        if (results.length === 0) {
            data.push(data_header);
        } else {

            data = results.map(el => { return { ...el, ...{ 'จำนวน': Number(el['จำนวน']) || 0 } } })
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
            if ([5].includes(cell.c)) {
                ws[objectI].z = '#,##0';
                if (cell.r !== 0) {
                    ws[objectI].s = {
                        ...ws[objectI].s,
                        alignment: {
                            horizontal: "right",
                        }
                    }
                }
            }
        }

        ws["!ref"] = `A1:V${results.length + 2}`

        let wscols = [
            { width: 24 }, // Col: A
            { width: 44 }, // Col: B
            { width: 18 }, // Col: C
            { width: 18 }, // Col: D
            { width: 30 }, // Col: E
            { width: 18 }
        ];

        ws['!cols'] = wscols;

        const file_name = uuid4() + '___รายงานขาย' + which_export_name;

        let wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

        await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

        return file_name + '.xlsx';

    }

    if (export_format === 'xlsx') {
        if (report_sales_out_type === 'list') {
            const results = queryResult__Data;
            const data = [];
            if (results.length === 0) {
                data.push({
                    'ชื่อร้านภายใน': null,
                    'เลขที่เอกสาร': null,
                    'วันที่เอกสาร': null,
                    'ชื่อลูกค้า': null,
                    'เลขทะเบียน': null,
                    'ชื่อสินค้า': null,
                    'กลุ่ม': null,
                    'ประเภท': null,
                    'ยี่ห้อ': null,
                    'รุ่น': null,
                    'ขนาดไซส์': null,
                    'ราคาต่อหน่วย': null,
                    'DOT': null,
                    'จำนวน': null,
                    'ส่วนลดบาท': null,
                    'ส่วนลดเปอร์เซ็น': null,
                    'รวมเงิน': null,
                    'สถานะชำระเงิน': null,
                    'วิธีรับชำระ': null,
                    'วันรับชำระล่าสุด': null,
                    'เลขที่เอกสาร ใบส่งสินค้าชั่วคราว': null,
                    'เลขที่เอกสาร ใบกำกับภาษีอย่างย่อ': null,
                    'เลขที่เอกสาร ใบกำกับภาษีเต็มรูป': null,
                    // 'วันที่สร้างเอกสาร': null,
                    'รหัสลูกค้า': null,
                    'รหัสสินค้า': null,
                    'หัวบิล-ประเภทภาษี': null,
                    'หัวบิล-จำนวนเงินรวมทั้งสิ้น': null,
                    'สถานะสมาชิก': null,
                    'ยอดคงค้าง': null,
                    'พนักงานขาย': null,
                    'สถานนะบิล': null
                });
            } else {
                for (let index = 0; index < results.length; index++) {
                    const element = results[index];
                    data.push({
                        'ชื่อร้านภายใน': element?.ShopProfile?.shop_local_name || element?.ShopProfile?.shop_name || '',
                        'เลขที่เอกสาร': element.code_id || '',
                        'วันที่เอกสาร': element.doc_date || '',
                        'ชื่อลูกค้า': element?.ShopServiceOrderDoc?.customer_name || '',
                        'เลขทะเบียน': element?.ShopServiceOrderDoc?.vehicle_registration || '',
                        'ชื่อสินค้า': element?.ShopProduct?.Product?.product_name || '',
                        'กลุ่ม': element?.ShopProduct?.Product?.group_type_name || '',
                        'ประเภท': element?.ShopProduct?.Product?.type_name || '',
                        'ยี่ห้อ': element?.ShopProduct?.Product?.brand_name || '',
                        'รุ่น': element?.ShopProduct?.Product?.model_name || '',
                        'ขนาดไซส์': element?.ShopProduct?.Product?.complete_size_name || '',
                        'ราคาต่อหน่วย': Number(element.price_unit) || 0,
                        'DOT': element.dot_mfd || '',
                        'จำนวน': Number(element.amount) || 0,
                        'ส่วนลดบาท': Number(element.price_discount) || 0,
                        'ส่วนลดเปอร์เซ็น': Number(element.price_discount_percent) || 0,
                        'รวมเงิน': Number(element.price_grand_total) || 0,
                        'สถานะชำระเงิน': (element?.ShopServiceOrderDoc?.payment_paid_status === 0)
                            ? 'ยกเลิกชำระ'
                            : (element?.ShopServiceOrderDoc?.payment_paid_status === 1)
                                ? 'ยังไม่ชำระ'
                                : (element?.ShopServiceOrderDoc?.payment_paid_status === 2)
                                    ? 'ค้างชำระ'
                                    : (element?.ShopServiceOrderDoc?.payment_paid_status === 3)
                                        ? 'ชําระแล้ว'
                                        : (element?.ShopServiceOrderDoc?.payment_paid_status === 4)
                                            ? 'ชําระเกิน'
                                            : (element?.ShopServiceOrderDoc?.payment_paid_status === 5)
                                                ? 'ลูกหนี้การค้า'
                                                : 'ไม่ทราบสถานะชำระเงิน',
                        'ประเภทการชำระ': { '0': '', '1': 'เงินสด', '2': 'บัตรเครดิต', '3': 'เงินโอน', '4': 'เช็คเงินสด', '5': 'บันทึกเป็นลูกหนี้การค้า', '999': 'Partial Payment' }[element?.ShopServiceOrderDoc?.payment_type || '0'] || '',
                        'วันรับชำระล่าสุด': element?.ShopServiceOrderDoc?.payment_paid_date || '',
                        'เลขที่เอกสาร ใบส่งสินค้าชั่วคราว': _.get(element, 'ShopServiceOrderDoc.trn_code_id', ''),
                        'เลขที่เอกสาร ใบกำกับภาษีอย่างย่อ': _.get(element, 'ShopServiceOrderDoc.abb_code_id', ''),
                        'เลขที่เอกสาร ใบกำกับภาษีเต็มรูป': _.get(element, 'ShopServiceOrderDoc.inv_code_id', ''),
                        // 'วันที่สร้างเอกสาร': new Date(element.created_date)
                        'รหัสลูกค้า': element?.ShopServiceOrderDoc?.customer_code_id || '',
                        'รหัสสินค้า': element?.ShopProduct?.Product?.master_path_code_id || '',
                        'หัวบิล-ประเภทภาษี': element?.ShopServiceOrderDoc?.tax_type_name || '',
                        'หัวบิล-จำนวนเงินรวมทั้งสิ้น': Number(element?.ShopServiceOrderDoc?.price_grand_total || 0),
                        'สถานะสมาชิก': ((/true/i).test(element?.ShopServiceOrderDoc?.is_member) == true) ? 'ใช่' : 'ไม่ใช่',
                        'ยอดคงค้าง': Number(element?.ShopServiceOrderDoc?.price_grand_total || 0) - Number(element?.ShopServiceOrderDoc?.payment_price || 0),
                        'พนักงานขาย': element.ShopServiceOrderDoc.sales_man,
                        'สถานนะบิล': (element.ShopServiceOrderDoc.status == 1) ? 'ใช้งาน' : 'ยกเลิก'
                    });
                }
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
                        }
                    }
                }
                // Set Column to Number of Currency
                if ([11, 14, 15, 16, 26, 28].includes(cell.c)) {
                    ws[objectI].z = '##,##,##0.00'
                }
                if ([13].includes(cell.c)) {
                    ws[objectI].z = '#,##0';
                    if (cell.r !== 0) {
                        ws[objectI].s = {
                            ...ws[objectI].s,
                            alignment: {
                                horizontal: "right",
                            }
                        }
                    }
                }
            }

            ws["!ref"] = `A1:AE${results.length + 2}`

            const paymentStatusColumnName = 'R';

            // Foot Column: TEXT(M)
            const footColumn_SUMtext = 'M';
            ws[`${footColumn_SUMtext}${results.length + 2}`] = {
                t: 's', v: 'รวม ', s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            // Foot Column: SUM(N)
            const footColumn_SUMAmount = 'N';
            ws[`${footColumn_SUMAmount}${results.length + 2}`] = {
                t: 'n', z: '#,##0', v: 0,
                // f: `=SUM(${footColumn_SUMAmount}1:${footColumn_SUMAmount}${(parseInt(results.length) + 1)})`,
                f: payment_paid_status.length === 1
                    ? `=SUM(${footColumn_SUMAmount}1:${footColumn_SUMAmount}${(parseInt(results.length) + 1)})`
                    : `=SUMIF(${paymentStatusColumnName}1:${paymentStatusColumnName}${(parseInt(results.length) + 1)},"<>ยกเลิกชำระ",${footColumn_SUMAmount}1:${footColumn_SUMAmount}${(parseInt(results.length) + 1)})`,
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            // Foot Column: SUM(O)
            const footColumn_SUMmoney = 'O';
            ws[`${footColumn_SUMmoney}${results.length + 2}`] = {
                t: 'n', z: '##,##,##0.00', v: 0,
                // f: `=SUM(${footColumn_SUMmoney}1:${footColumn_SUMmoney}${(parseInt(results.length) + 1)})`,
                f: payment_paid_status.length === 1
                    ? `=SUM(${footColumn_SUMmoney}1:${footColumn_SUMmoney}${(parseInt(results.length) + 1)})`
                    : `=SUMIF(${paymentStatusColumnName}1:${paymentStatusColumnName}${(parseInt(results.length) + 1)},"<>ยกเลิกชำระ",${footColumn_SUMmoney}1:${footColumn_SUMmoney}${(parseInt(results.length) + 1)})`,
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            // Foot Column: SUM(P)
            const footColumn_SUMdiscount = 'P';
            ws[`${footColumn_SUMdiscount}${results.length + 2}`] = {
                t: 'n', z: '##,##,##0.00', v: 0,
                // f: `=SUM(${footColumn_SUMdiscount}1:${footColumn_SUMdiscount}${(parseInt(results.length) + 1)})`,
                f: payment_paid_status.length === 1
                    ? `=SUM(${footColumn_SUMdiscount}1:${footColumn_SUMdiscount}${(parseInt(results.length) + 1)})`
                    : `=SUMIF(${paymentStatusColumnName}1:${paymentStatusColumnName}${(parseInt(results.length) + 1)},"<>ยกเลิกชำระ",${footColumn_SUMdiscount}1:${footColumn_SUMdiscount}${(parseInt(results.length) + 1)})`,
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            // Foot Column: SUM(Q)
            const footColumn_SUMamount = 'Q';
            ws[`${footColumn_SUMamount}${results.length + 2}`] = {
                t: 'n', z: '##,##,##0.00', v: 0,
                // f: `=SUM(${footColumn_SUMamount}1:${footColumn_SUMamount}${(parseInt(results.length) + 1)})`,
                f: payment_paid_status.length === 1
                    ? `=SUM(${footColumn_SUMamount}1:${footColumn_SUMamount}${(parseInt(results.length) + 1)})`
                    : `=SUMIF(${paymentStatusColumnName}1:${paymentStatusColumnName}${(parseInt(results.length) + 1)},"<>ยกเลิกชำระ",${footColumn_SUMamount}1:${footColumn_SUMamount}${(parseInt(results.length) + 1)})`,
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            // Foot Column: SUM(AA)
            const footColumn_SUM_AA = 'AA';
            ws[`${footColumn_SUM_AA}${results.length + 2}`] = {
                t: 'n', z: '##,##,##0.00', v: 0,
                // f: `=SUM(${footColumn_SUM_AA}1:${footColumn_SUM_AA}${(parseInt(results.length) + 1)})`,
                f: payment_paid_status.length === 1
                    ? `=SUM(${footColumn_SUM_AA}1:${footColumn_SUM_AA}${(parseInt(results.length) + 1)})`
                    : `=SUMIF(${paymentStatusColumnName}1:${paymentStatusColumnName}${(parseInt(results.length) + 1)},"<>ยกเลิกชำระ",${footColumn_SUM_AA}1:${footColumn_SUM_AA}${(parseInt(results.length) + 1)})`,
                s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }

            let wscols = [
                { width: 24 }, // Col: A
                { width: 24 }, // Col: B
                { width: 24 }, // Col: C
                { width: 24 }, // Col: D
                { width: 24 }, // Col: E
                { width: 24 }, // Col: F
                { width: 24 }, // Col: G
                { width: 24 }, // Col: H
                { width: 24 }, // Col: I
                { width: 24 }, // Col: J
                { width: 24 }, // Col: K
                { width: 24 }, // Col: L
                { width: 24 }, // Col: M
                { width: 24 }, // Col: N
                { width: 24 }, // Col: O
                { width: 24 }, // Col: P
                { width: 24 }, // Col: Q
                { width: 24 }, // Col: R
                { width: 24 }, // Col: S
                { width: 24 }, // Col: T
                { width: 24 }, // Col: U
                { width: 24 }, // Col: V
                { width: 24 }, // Col: W
                { width: 24 }, // Col: X
                { width: 24 }, // Col: Y
                { width: 24 }, // Col: Z
                { width: 24 }, // Col: AA
                { width: 24 }, // Col: Y
                { width: 24 }, // Col: Z
                { width: 24 }, // Col: AA
            ];

            ws['!cols'] = wscols;

            const file_name = uuid4() + '___รายงานขาย';

            let wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

            await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

            return file_name + '.xlsx';
        }
        else {
            const results = queryResult__Data;
            const data = [];
            if (results.length === 0) {
                data.push({
                    'เลขที่เอกสาร': null,
                    'วันที่เอกสาร': null,
                    'ชื่อลูกค้า': null,
                    'เลขทะเบียน': null,
                    'รวมเงิน': null,
                    'ส่วนลด': null,
                    'ราคาสุทธิ': null,
                    'สถานะชำระเงิน': null,
                    'วิธีรับชำระ': null,
                    'เลขที่เอกสาร ใบส่งสินค้าชั่วคราว': null,
                    'เลขที่เอกสาร ใบกำกับภาษีอย่างย่อ': null,
                    'เลขที่เอกสาร ใบกำกับภาษีเต็มรูป': null,
                    // 'วันที่สร้างเอกสาร': null,
                });
            } else {
                for (let index = 0; index < results.length; index++) {
                    const element = results[index];
                    data.push({
                        'เลขที่เอกสาร': element.code_id,
                        'วันที่เอกสาร': element.doc_date,
                        'ชื่อลูกค้า': element.customer_name,
                        'เลขทะเบียน': element.vehicle_registration,
                        'รวมเงิน': Number(element.price_sub_total),
                        'ส่วนลด': Number(element.price_discount_total),
                        'ราคาสุทธิ': Number(element.price_grand_total),
                        'สถานะชำระเงิน': (element.payment_paid_status === 0)
                            ? 'ยกเลิกชำระ'
                            : (element.payment_paid_status === 1)
                                ? 'ยังไม่ชำระ'
                                : (element.payment_paid_status === 2)
                                    ? 'ค้างชำระ'
                                    : (element.payment_paid_status === 3)
                                        ? 'ชําระแล้ว'
                                        : (element.payment_paid_status === 4)
                                            ? 'ชําระเกิน'
                                            : (element.payment_paid_status === 5)
                                                ? 'ลูกหนี้การค้า'
                                                : 'ไม่ทราบสถานะชำระเงิน',
                        'ประเภทการชำระ': { '0': '', '1': 'เงินสด', '2': 'บัตรเครดิต', '3': 'เงินโอน', '4': 'เช็คเงินสด', '5': 'บันทึกเป็นลูกหนี้การค้า', '999': 'Partial Payment' }[element?.payment_type || '0'] || '',
                        'เลขที่เอกสาร ใบส่งสินค้าชั่วคราว': _.get(element, 'trn_code_id', ''),
                        'เลขที่เอกสาร ใบกำกับภาษีอย่างย่อ': _.get(element, 'abb_code_id', ''),
                        'เลขที่เอกสาร ใบกำกับภาษีเต็มรูป': _.get(element, 'inv_code_id', ''),
                        // 'วันที่สร้างเอกสาร': new Date(element.created_date)
                    });
                }
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
                        }
                    }
                }
                // Set Column to Number of Currency
                if ([4, 5, 6].includes(cell.c)) {
                    ws[objectI].z = '##,##,##0.00'
                }
            }

            ws["!ref"] = `A1:L${results.length + 2}`

            // Foot Column: TEXT(รวม)
            const footColumn_SUMtext = 'D';
            ws[`${footColumn_SUMtext}${results.length + 2}`] = {
                t: 's', v: 'รวม ', s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            // Foot Column: SUM(รวมเงิน)
            const footColumn_SUMmoney = 'E';
            ws[`${footColumn_SUMmoney}${results.length + 2}`] = {
                t: 'n', z: '##,##,##0.00', v: 0, f: `=SUM(${footColumn_SUMmoney}1:${footColumn_SUMmoney}${(parseInt(results.length) + 1)})`, s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            // Foot Column: SUM(ส่วนลด)
            const footColumn_SUMdiscount = 'F';
            ws[`${footColumn_SUMdiscount}${results.length + 2}`] = {
                t: 'n', z: '##,##,##0.00', v: 0, f: `=SUM(${footColumn_SUMdiscount}1:${footColumn_SUMdiscount}${(parseInt(results.length) + 1)})`, s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            // Foot Column: SUM(ราคาสุทธิ)
            const footColumn_SUMamount = 'G';
            ws[`${footColumn_SUMamount}${results.length + 2}`] = {
                t: 'n', z: '##,##,##0.00', v: 0, f: `=SUM(${footColumn_SUMamount}1:${footColumn_SUMamount}${(parseInt(results.length) + 1)})`, s: {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true,
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }

            let wscols = [
                { width: 24 }, // Col: A
                { width: 20 }, // Col: B
                { width: 17 }, // Col: C
                { width: 17 }, // Col: D
                { width: 17 }, // Col: E
                { width: 20 }, // Col: F
                { width: 20 }, // Col: G
                { width: 22 }, // Col: H
                { width: 22 }, // Col: I
                { width: 25 }, // Col: J
                { width: 25 }, // Col: K
                { width: 25 }, // Col: L
            ];

            ws['!cols'] = wscols;

            const file_name = uuid4() + '___รายงานขาย';

            let wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

            await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

            return file_name + '.xlsx';
        }
    }

    const queryResult__Count = await db.query(
        sqlQuery + `
        SELECT count(*)
        FROM ${report_sales_out_type === 'list' ? 'CTE_List' : 'CTE_UNION'}
            ${whereConditions.reduce((prev, curr, idx, arr) => {
            if (arr.length > 0 && idx === 0) {
                prev = prev + `WHERE `;
            }
            if (idx > 0) {
                prev = prev + `\n AND `;
            }
            return prev + curr;
        }, ``)}
        `.replace(/(\s)+/ig, ' '),
        {
            transaction: transaction,
            type: QueryTypes.SELECT,
            replacements: {
                search: `%${search}%`,
                start_date: start_date,
                end_date: end_date,
                payment_paid_date__startDate: payment_paid_date__startDate,
                payment_paid_date__endDate: payment_paid_date__endDate,
            }
        }
    );

    const pag = {
        currentPage: page,
        pages: Math.ceil(queryResult__Count[0].count / limit),
        currentCount: queryResult__Data.length,
        totalCount: +(queryResult__Count[0].count),
        data: queryResult__Data
    };

    return pag;
};


const handlerShopReportsSalesOut = async (request, reply) => {
    const handlerName = 'GET ShopReportsSalesOut Report';

    try {

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request, 'select_shop_ids');
        /**
         * A name for create dynamics table
         * @type {string[]}
         */
        const table_name = findShopsProfile.map(w => (w.shop_code_id));

        const result = await serviceShopReportSalesOuts_V2(request, table_name);

        await handleSaveLog(request, [[handlerName], '']);

        return utilSetFastifyResponseJson('success', result);
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], error]);

        throw error;
    }
};


module.exports = handlerShopReportsSalesOut;
