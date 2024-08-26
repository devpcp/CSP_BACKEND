const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const db = require("../db");
const { QueryTypes } = require("sequelize");
const { isUUID } = require("../utils/generate");
const { ShopsProfiles: ShopProfile } = require("../models/model");
const moment = require("moment");

/**
 * @type{import("lodash")}
 */
const _ = require("lodash");
const XLSX = require("xlsx-js-style");
const { v4: uuid4 } = require("uuid");

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault | {}} request
 * @param {Array<string>} table_names
 * @param options
 */
const fnReportTaxType__sales_tax = async (request, table_names, options = {}) => {
    const search = request.query.search || '';
    const limit = request.query.limit || 10;
    const page = request.query.page || 1;
    const sort = request.query.sort || 'code_id';
    const order = request.query.order || 'desc';

    const export_format = request.query.export_format || 'json';

    const doc_date_startDate = request.query.doc_date_startDate || '';
    const doc_date_endDate = request.query.doc_date_endDate || '';

    let bolFilter__is_inv = !!request.query?.bolFilter__is_inv;
    let bolFilter__is_abb = !!request.query?.bolFilter__is_abb;
    if (!bolFilter__is_inv && !bolFilter__is_abb) { bolFilter__is_inv = true; }

    // let arrStrFilter__status = request.query?.arrStrFilter__status || [1, 2];
    let arrStrFilter__status = request.query?.arrStrFilter__status || [0, 1, 3];
    if (!Array.isArray(arrStrFilter__status)) {
        arrStrFilter__status = arrStrFilter__status.split(',').filter(w => Number.isSafeInteger(Number(w))).map(w => Number(w));
        if (arrStrFilter__status.length === 0) {
            arrStrFilter__status = [0, 1, 3];
        }
    }

    let arrStrFilter__tax_type_id = request.query?.arrStrFilter__tax_type_id || ['fafa3667-55d8-49d1-b06c-759c6e9ab064', '8c73e506-31b5-44c7-a21b-3819bb712321'];
    if (!Array.isArray(arrStrFilter__tax_type_id)) {
        arrStrFilter__tax_type_id = arrStrFilter__tax_type_id.split(',').filter(w => isUUID(w));
        if (arrStrFilter__tax_type_id.length === 0) {
            arrStrFilter__tax_type_id = ['fafa3667-55d8-49d1-b06c-759c6e9ab064', '8c73e506-31b5-44c7-a21b-3819bb712321'];
        }
    }
    arrStrFilter__tax_type_id = arrStrFilter__tax_type_id.map(w => `'${w}'`);

    let arrStrFilter__payment_paid_status = request.query?.arrStrFilter__payment_paid_status || [];
    if (!Array.isArray(arrStrFilter__payment_paid_status)) {
        arrStrFilter__payment_paid_status = arrStrFilter__payment_paid_status.split(',').filter(w => Number.isSafeInteger(Number(w)));
        if (arrStrFilter__payment_paid_status.length === 0) {
            arrStrFilter__payment_paid_status = [];
        }
    }
    arrStrFilter__payment_paid_status = arrStrFilter__payment_paid_status.map(w => `${Number(w)}`);

    const bolFilter_show_zero_vat = !!request.query?.bolFilter_show_zero_vat;

    let querySearchString__ShopTaxInvoiceDoc = ``;
    let querySearchString__ShopCustomerDebtDebitNoteDoc = ``;
    let querySearchString__ShopCustomerDebtCreditNoteDoc = ``;

    if (arrStrFilter__tax_type_id.length > 0) {
        querySearchString__ShopTaxInvoiceDoc += `\nAND "ShopTaxInvoiceDoc".tax_type_id IN (${arrStrFilter__tax_type_id}) `;
        querySearchString__ShopCustomerDebtDebitNoteDoc += `\nAND "ShopCustomerDebtDebitNoteDoc".tax_type_id IN (${arrStrFilter__tax_type_id}) `;
        querySearchString__ShopCustomerDebtCreditNoteDoc += `\nAND "ShopCustomerDebtCreditNoteDoc".tax_type_id IN (${arrStrFilter__tax_type_id}) `;
    }
    if (arrStrFilter__payment_paid_status.length > 0) {
        querySearchString__ShopTaxInvoiceDoc += `\nAND "ServiceOrderDoc".payment_paid_status IN (${arrStrFilter__payment_paid_status}) `;

        // querySearchString__ShopCustomerDebtDebitNoteDoc += `\nAND
        //     (
        //         SELECT "ShopCustomerDebtDoc".payment_paid_status
        //         FROM app_shops_datas.dat_01hq0010_customer_debt_doc AS "ShopCustomerDebtDoc"
        //         WHERE ("ShopCustomerDebtDoc".id = (
        //                 SELECT "ShopCustomerDebtList".shop_customer_debt_doc_id
        //                 FROM app_shops_datas.dat_01hq0010_customer_debt_list AS "ShopCustomerDebtList"
        //                 WHERE "ShopCustomerDebtList".status = 1
        //                     AND "ShopCustomerDebtList".shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
        //                     AND "ShopCustomerDebtList".shop_customer_debt_dn_doc_id = "ShopCustomerDebtDebitNoteDoc".id
        //             ))
        //         ORDER BY
        //             "ShopCustomerDebtDoc".status = 1 DESC,
        //             "ShopCustomerDebtDoc".code_id DESC
        //         LIMIT 1
        //     )
        //  IN (${arrStrFilter__payment_paid_status}) `;

        // querySearchString__ShopCustomerDebtCreditNoteDoc += `\nAND
        //     (
        //         SELECT "ShopCustomerDebtDoc".payment_paid_status
        //         FROM app_shops_datas.dat_01hq0010_customer_debt_doc AS "ShopCustomerDebtDoc"
        //         WHERE ("ShopCustomerDebtDoc".id = (
        //                 SELECT "ShopCustomerDebtList".shop_customer_debt_doc_id
        //                 FROM app_shops_datas.dat_01hq0010_customer_debt_list AS "ShopCustomerDebtList"
        //                 WHERE "ShopCustomerDebtList".status = 1
        //                     AND "ShopCustomerDebtList".shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
        //                     AND "ShopCustomerDebtList".shop_customer_debt_cn_doc_id = "ShopCustomerDebtCreditNoteDoc".id
        //             ))
        //         ORDER BY
        //             "ShopCustomerDebtDoc".status = 1 DESC,
        //             "ShopCustomerDebtDoc".code_id DESC
        //         LIMIT 1
        //     )
        //  IN (${arrStrFilter__payment_paid_status}) `;
    }
    if (bolFilter__is_inv) {
        querySearchString__ShopTaxInvoiceDoc += `\nAND "ShopTaxInvoiceDoc".is_inv = True `;
    }
    if (bolFilter__is_abb) {
        querySearchString__ShopTaxInvoiceDoc += `\nAND "ShopTaxInvoiceDoc".is_abb = True `;
    }

    if (doc_date_startDate && doc_date_endDate) {
        querySearchString__ShopTaxInvoiceDoc += `\nAND coalesce("ShopTaxInvoiceDoc".inv_doc_date, "ShopTaxInvoiceDoc".abb_doc_date) BETWEEN '${doc_date_startDate}' AND '${doc_date_endDate}' `;
        querySearchString__ShopCustomerDebtDebitNoteDoc += `\nAND "ShopCustomerDebtDebitNoteDoc".doc_date BETWEEN '${doc_date_startDate}' AND '${doc_date_endDate}' `;
        querySearchString__ShopCustomerDebtCreditNoteDoc += `\nAND "ShopCustomerDebtCreditNoteDoc".doc_date BETWEEN '${doc_date_startDate}' AND '${doc_date_endDate}' `;
    }
    if (doc_date_startDate && !doc_date_endDate) {
        querySearchString__ShopTaxInvoiceDoc += `\nAND coalesce("ShopTaxInvoiceDoc".inv_doc_date, "ShopTaxInvoiceDoc".abb_doc_date) >= '${doc_date_startDate}' `;
        querySearchString__ShopCustomerDebtDebitNoteDoc += `\nAND "ShopCustomerDebtDebitNoteDoc".doc_date >= '${doc_date_startDate}' `;
        querySearchString__ShopCustomerDebtCreditNoteDoc += `\nAND "ShopCustomerDebtCreditNoteDoc".doc_date >= '${doc_date_startDate}' `;
    }
    if (!doc_date_startDate && doc_date_endDate) {
        querySearchString__ShopTaxInvoiceDoc += `\nAND coalesce("ShopTaxInvoiceDoc".inv_doc_date, "ShopTaxInvoiceDoc".abb_doc_date) <= '${doc_date_endDate}' `;
        querySearchString__ShopCustomerDebtDebitNoteDoc += `\nAND "ShopCustomerDebtDebitNoteDoc".doc_date <= '${doc_date_endDate}' `;
        querySearchString__ShopCustomerDebtCreditNoteDoc += `\nAND "ShopCustomerDebtCreditNoteDoc".doc_date <= '${doc_date_endDate}' `;
    }

    if (!bolFilter_show_zero_vat) {
        querySearchString__ShopTaxInvoiceDoc += `\nAND ("ShopTaxInvoiceDoc".price_vat)::numeric(20,2) > 0 `;
        querySearchString__ShopCustomerDebtDebitNoteDoc += `\nAND ("ShopCustomerDebtDebitNoteDoc".price_vat)::numeric(20,2) > 0 `;
        querySearchString__ShopCustomerDebtCreditNoteDoc += `\nAND ("ShopCustomerDebtCreditNoteDoc".price_vat)::numeric(20,2) > 0 `;
    }

    if (search) {
        const repl_search = search
            .replace(/^(\s|%)+/ig, ``)
            .replace(/(\s|%)+$/ig, ``)
            .replace(/(\s|%)+/ig, `%`);

        querySearchString__ShopTaxInvoiceDoc += `AND (
            coalesce(coalesce("ShopTaxInvoiceDoc".inv_code_id, "ShopTaxInvoiceDoc".abb_code_id), '') ILIKE '%${repl_search}%'
            OR coalesce("ShopTaxInvoiceDoc".details->>'ref_doc', '') ILIKE '%${repl_search}%'
            OR (coalesce("ShopBusinessCustomer".master_customer_code_id, '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopBusinessCustomer".tax_id), '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopBusinessCustomer".customer_name->>'th'), '') ILIKE '%${repl_search}%')
            OR (coalesce("ShopPersonalCustomer".master_customer_code_id, '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopPersonalCustomer".id_card_number), '') ILIKE '%${repl_search}%')
            OR (coalesce(nullif(coalesce("ShopPersonalCustomer".customer_name->'first_name'->>'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name->'last_name'->>'th', ''), ' '), '') ILIKE '%${repl_search}%')
        )`;

        querySearchString__ShopCustomerDebtDebitNoteDoc += `AND (
            "ShopCustomerDebtDebitNoteDoc".code_id ILIKE '%${repl_search}%'
            OR coalesce("ShopCustomerDebtDebitNoteDoc".details->>'ref_doc', '') ILIKE '%${repl_search}%'
            OR (coalesce("ShopBusinessCustomer".master_customer_code_id, '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopBusinessCustomer".tax_id), '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopBusinessCustomer".customer_name->>'th'), '') ILIKE '%${repl_search}%')
            OR (coalesce("ShopPersonalCustomer".master_customer_code_id, '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopPersonalCustomer".id_card_number), '') ILIKE '%${repl_search}%')
            OR (coalesce(nullif(coalesce("ShopPersonalCustomer".customer_name->'first_name'->>'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name->'last_name'->>'th', ''), ' '), '') ILIKE '%${repl_search}%')
        )`;

        querySearchString__ShopCustomerDebtCreditNoteDoc += `AND (
            "ShopCustomerDebtCreditNoteDoc".code_id ILIKE '%${repl_search}%'
            OR coalesce("ShopCustomerDebtCreditNoteDoc".details->>'ref_doc', '') ILIKE '%${repl_search}%'
            OR (coalesce("ShopBusinessCustomer".master_customer_code_id, '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopBusinessCustomer".tax_id), '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopBusinessCustomer".customer_name->>'th'), '') ILIKE '%${repl_search}%')
            OR (coalesce("ShopPersonalCustomer".master_customer_code_id, '') ILIKE '%${repl_search}%')
            OR (coalesce(btrim("ShopPersonalCustomer".id_card_number), '') ILIKE '%${repl_search}%')
            OR (coalesce(nullif(coalesce("ShopPersonalCustomer".customer_name->'first_name'->>'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name->'last_name'->>'th', ''), ' '), '') ILIKE '%${repl_search}%')
        )`;
    }

    const queryString = table_names.reduce((prev, curr, currIdx) => {
        if (currIdx !== 0) {
            prev += ` UNION ALL `;
        }

        prev += `
            (
            SELECT
                "ShopTaxInvoiceDoc".shop_id,
                "ShopTaxInvoiceDoc".id,
                coalesce("ShopTaxInvoiceDoc".inv_code_id, "ShopTaxInvoiceDoc".abb_code_id) AS code_id,
                "ShopTaxInvoiceDoc".status,
                coalesce("ShopTaxInvoiceDoc".inv_doc_date, "ShopTaxInvoiceDoc".abb_doc_date) AS doc_date,
                nullif("ShopTaxInvoiceDoc".details->>'ref_doc', '') AS ref_doc,
                "ShopTaxInvoiceDoc".tax_type_id,
                (CASE WHEN "ShopTaxInvoiceDoc".tax_type_id = 'fafa3667-55d8-49d1-b06c-759c6e9ab064' THEN "ShopTaxInvoiceDoc".price_amount_total ELSE "ShopTaxInvoiceDoc".price_before_vat END)::numeric(20,2) AS price_before_vat,
                ("ShopTaxInvoiceDoc".price_vat)::numeric(20,2),
                ("ShopTaxInvoiceDoc".price_grand_total)::numeric(20,2),
            
                (
                    SELECT jsonb_build_object(
                           'id', "ShopProfile".id,
                           'shop_name', "ShopProfile".shop_name->>'th',
                           'shop_local_name', "ShopProfile".shop_name->>'shop_local_name'
                    )
                    FROM app_datas.dat_shops_profiles AS "ShopProfile"
                    WHERE "ShopProfile".id = "ShopTaxInvoiceDoc".shop_id
                ) AS "ShopProfile",
                
                (
                   SELECT jsonb_build_object(
                          'id', "TaxType".id,
                          'type_name', "TaxType".type_name->>'th'
                   )
                   FROM master_lookup.mas_tax_types AS "TaxType"
                   WHERE "TaxType".id = "ShopTaxInvoiceDoc".tax_type_id
                ) AS "TaxType",
                
                jsonb_build_object(
                    'shop_id', "ServiceOrderDoc".shop_id,
                    'id', "ServiceOrderDoc".id,
                    'code_id', "ServiceOrderDoc".code_id,
                    'payment_paid_status', "ServiceOrderDoc".payment_paid_status
                ) AS "ServiceOrderDoc",
                
                (null)::jsonb AS "ShopTemporaryDeliveryOrderDoc",
                
                (null)::jsonb AS "ShopTemporaryDeliveryOrderDoc",
                
                CASE WHEN "ShopBusinessCustomer".id IS NOT NULL THEN
                    jsonb_build_object(
                        'shop_id', "ShopBusinessCustomer".shop_id,
                        'id', "ShopBusinessCustomer".id,
                        'master_customer_code_id', "ShopBusinessCustomer".master_customer_code_id,
                        'tax_id', btrim("ShopBusinessCustomer".tax_id),
                        'customer_name', nullif("ShopBusinessCustomer".customer_name->>'th', ''),
                        'branch_name', CASE WHEN coalesce("ShopBusinessCustomer".other_details->>'branch', 'office') = 'office'
                                            THEN 'สำนักงานใหญ่'
                                            ELSE 'สาขา' || btrim(' ' || coalesce("ShopBusinessCustomer".other_details->>'branch_code', ''))
                                       END
                    )
                    ELSE null
                END AS "ShopBusinessCustomer",
            
                CASE WHEN "ShopPersonalCustomer".id IS NOT NULL THEN
                    jsonb_build_object(
                        'shop_id', "ShopPersonalCustomer".shop_id,
                        'id', "ShopPersonalCustomer".id,
                        'master_customer_code_id', "ShopPersonalCustomer".master_customer_code_id,
                        'id_card_number', nullif(btrim("ShopPersonalCustomer".id_card_number), ''),
                        'customer_name', nullif(coalesce("ShopPersonalCustomer".customer_name->'first_name'->>'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name->'last_name'->>'th', ''), ' ')
                    )
                    ELSE null
                END AS "ShopPersonalCustomer"
            FROM app_shops_datas.dat_01hq0010_tax_invoice_doc AS "ShopTaxInvoiceDoc"
                JOIN app_shops_datas.dat_01hq0010_service_order_doc AS "ServiceOrderDoc" ON "ServiceOrderDoc".id = "ShopTaxInvoiceDoc".shop_service_order_doc_id
                LEFT JOIN app_shops_datas.dat_01hq0010_business_customers AS "ShopBusinessCustomer" ON "ShopBusinessCustomer".id = "ShopTaxInvoiceDoc".bus_customer_id
                LEFT JOIN app_shops_datas.dat_01hq0010_personal_customers AS "ShopPersonalCustomer" ON "ShopPersonalCustomer".id = "ShopTaxInvoiceDoc".per_customer_id
            WHERE "ShopTaxInvoiceDoc".status IN (${arrStrFilter__status})
                ${querySearchString__ShopTaxInvoiceDoc}
            )
            UNION ALL
            (
            SELECT
                "ShopCustomerDebtDebitNoteDoc".shop_id,
                "ShopCustomerDebtDebitNoteDoc".id,
                "ShopCustomerDebtDebitNoteDoc".code_id,
                "ShopCustomerDebtDebitNoteDoc".status,
                "ShopCustomerDebtDebitNoteDoc".doc_date,
                nullif("ShopCustomerDebtDebitNoteDoc".details->>'ref_doc', '') AS ref_doc,
                "ShopCustomerDebtDebitNoteDoc".tax_type_id,
                "ShopCustomerDebtDebitNoteDoc".price_before_vat,
                "ShopCustomerDebtDebitNoteDoc".price_vat,
                "ShopCustomerDebtDebitNoteDoc".price_grand_total,
                (
                    SELECT
                        jsonb_build_object(
                                'id', "ShopProfile".id,
                                'shop_name', "ShopProfile".shop_name->>'th',
                                'shop_local_name', "ShopProfile".shop_name->>'shop_local_name'
                        )
                            FROM app_datas.dat_shops_profiles AS "ShopProfile"
                            WHERE "ShopProfile".id = "ShopCustomerDebtDebitNoteDoc".shop_id
                ) AS "ShopProfile",
                (
                    SELECT jsonb_build_object('id', "TaxType".id, 'type_name', "TaxType".type_name->>'th')
                    FROM master_lookup.mas_tax_types AS "TaxType"
                    WHERE "TaxType".id = "ShopCustomerDebtDebitNoteDoc".tax_type_id
                ) AS "TaxType",
                (null)::jsonb AS "ServiceOrderDoc",
                (
                    CASE
                        WHEN "ShopCustomerDebtDebitNoteDoc".shop_temporary_delivery_order_doc_id IS NOT NULL
                        THEN jsonb_build_object(
                                'shop_id', "ShopTemporaryDeliveryOrderDoc".shop_id,
                                'id', "ShopTemporaryDeliveryOrderDoc".id,
                                'code_id', "ShopTemporaryDeliveryOrderDoc".code_id
                            )
                        ELSE null
                    END
                ) AS "ShopTemporaryDeliveryOrderDoc",
                (
                    CASE
                        WHEN "ShopCustomerDebtDebitNoteDoc".id IS NOT NULL
                        THEN (
                                SELECT jsonb_build_object(
                                            'shop_id', "ShopCustomerDebtDoc".shop_id,
                                            'id', "ShopCustomerDebtDoc".id,
                                            'code_id', "ShopCustomerDebtDoc".code_id,
                                            'payment_paid_status', "ShopCustomerDebtDoc".payment_paid_status
                                       )
                                FROM app_shops_datas.dat_01hq0010_customer_debt_doc AS "ShopCustomerDebtDoc"
                                WHERE ("ShopCustomerDebtDoc".id = (
                                        SELECT "ShopCustomerDebtList".shop_customer_debt_doc_id
                                        FROM app_shops_datas.dat_01hq0010_customer_debt_list AS "ShopCustomerDebtList"
                                        WHERE "ShopCustomerDebtList".status = 1
                                            AND "ShopCustomerDebtList".shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
                                            AND "ShopCustomerDebtList".shop_customer_debt_dn_doc_id = "ShopCustomerDebtDebitNoteDoc".id
                                    ))
                                ORDER BY
                                    "ShopCustomerDebtDoc".status = 1 DESC,
                                    "ShopCustomerDebtDoc".code_id DESC
                                LIMIT 1
                            )
                        ELSE null
                    END
                ) AS "ShopCustomerDebtDoc",
                (
                    CASE
                        WHEN "ShopBusinessCustomer".id IS NOT NULL
                            THEN jsonb_build_object(
                                    'shop_id', "ShopBusinessCustomer".shop_id,
                                    'id', "ShopBusinessCustomer".id,
                                    'master_customer_code_id', "ShopBusinessCustomer".master_customer_code_id,
                                    'tax_id', btrim("ShopBusinessCustomer".tax_id),
                                    'customer_name', nullif("ShopBusinessCustomer".customer_name->>'th', ''),
                                    'branch_name', (CASE
                                                        WHEN coalesce("ShopBusinessCustomer".other_details->>'branch', 'office') = 'office'
                                                            THEN 'สำนักงานใหญ่'
                                                            ELSE 'สาขา' || btrim(' ' || coalesce("ShopBusinessCustomer".other_details->>'branch_code', ''))
                                                   END)
                                 )
                            ELSE null
                    END
                ) AS "ShopBusinessCustomer",
                (
                    CASE
                        WHEN "ShopPersonalCustomer".id IS NOT NULL
                            THEN jsonb_build_object(
                                    'shop_id', "ShopPersonalCustomer".shop_id,
                                    'id', "ShopPersonalCustomer".id,
                                    'master_customer_code_id', "ShopPersonalCustomer".master_customer_code_id,
                                    'id_card_number', nullif(btrim("ShopPersonalCustomer".id_card_number), ''),
                                    'customer_name', nullif(coalesce("ShopPersonalCustomer".customer_name->'first_name'->>'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name->'last_name'->>'th',''),' '))
                            ELSE null
                    END
                ) AS "ShopPersonalCustomer"
            FROM app_shops_datas.dat_01hq0010_customer_debt_dn_doc AS "ShopCustomerDebtDebitNoteDoc"
                LEFT JOIN app_shops_datas.dat_01hq0010_temporary_delivery_order_doc AS  "ShopTemporaryDeliveryOrderDoc"
                    ON "ShopTemporaryDeliveryOrderDoc".id = "ShopCustomerDebtDebitNoteDoc".shop_temporary_delivery_order_doc_id
                LEFT JOIN app_shops_datas.dat_01hq0010_business_customers AS "ShopBusinessCustomer"
                   ON "ShopBusinessCustomer".id = "ShopCustomerDebtDebitNoteDoc".bus_customer_id
                LEFT JOIN app_shops_datas.dat_01hq0010_personal_customers AS "ShopPersonalCustomer"
                   ON "ShopPersonalCustomer".id = "ShopCustomerDebtDebitNoteDoc".per_customer_id
            WHERE "ShopCustomerDebtDebitNoteDoc".status IN (${arrStrFilter__status})
                ${querySearchString__ShopCustomerDebtDebitNoteDoc}
            )
            UNION ALL
            (
            SELECT
                "ShopCustomerDebtCreditNoteDoc".shop_id,
                "ShopCustomerDebtCreditNoteDoc".id,
                "ShopCustomerDebtCreditNoteDoc".code_id,
                "ShopCustomerDebtCreditNoteDoc".status,
                "ShopCustomerDebtCreditNoteDoc".doc_date,
                nullif("ShopCustomerDebtCreditNoteDoc".details->>'ref_doc', '') AS ref_doc,
                "ShopCustomerDebtCreditNoteDoc".tax_type_id,
                (("ShopCustomerDebtCreditNoteDoc".price_before_vat) * -1)::numeric(20,2) AS price_before_vat,
                (("ShopCustomerDebtCreditNoteDoc".price_vat) * -1)::numeric(20,2) AS price_vat,
                (("ShopCustomerDebtCreditNoteDoc".price_grand_total) * -1)::numeric(20,2) AS price_grand_total,
                (
                    SELECT
                        jsonb_build_object(
                                'id', "ShopProfile".id,
                                'shop_name', "ShopProfile".shop_name->>'th',
                                'shop_local_name', "ShopProfile".shop_name->>'shop_local_name'
                        )
                            FROM app_datas.dat_shops_profiles AS "ShopProfile"
                            WHERE "ShopProfile".id = "ShopCustomerDebtCreditNoteDoc".shop_id
                )                                                                         AS "ShopProfile",
                (
                    SELECT jsonb_build_object('id', "TaxType".id, 'type_name', "TaxType".type_name->>'th')
                    FROM master_lookup.mas_tax_types AS "TaxType"
                    WHERE "TaxType".id = "ShopCustomerDebtCreditNoteDoc".tax_type_id
                )                                                                         AS "TaxType",
                (null)::jsonb AS "ServiceOrderDoc",
                (
                    CASE
                        WHEN "ShopCustomerDebtCreditNoteDoc".shop_temporary_delivery_order_doc_id IS NOT NULL
                        THEN jsonb_build_object(
                                'shop_id', "ShopTemporaryDeliveryOrderDoc".shop_id,
                                'id', "ShopTemporaryDeliveryOrderDoc".id,
                                'code_id', "ShopTemporaryDeliveryOrderDoc".code_id
                            )
                        ELSE null
                    END
                ) AS "ShopTemporaryDeliveryOrderDoc",
                (
                    CASE
                        WHEN "ShopCustomerDebtCreditNoteDoc".id IS NOT NULL
                        THEN (
                                SELECT jsonb_build_object(
                                            'shop_id', "ShopCustomerDebtDoc".shop_id,
                                            'id', "ShopCustomerDebtDoc".id,
                                            'code_id', "ShopCustomerDebtDoc".code_id,
                                            'payment_paid_status', "ShopCustomerDebtDoc".payment_paid_status
                                       )
                                FROM app_shops_datas.dat_01hq0010_customer_debt_doc AS "ShopCustomerDebtDoc"
                                WHERE ("ShopCustomerDebtDoc".id = (
                                        SELECT "ShopCustomerDebtList".shop_customer_debt_doc_id
                                        FROM app_shops_datas.dat_01hq0010_customer_debt_list AS "ShopCustomerDebtList"
                                        WHERE "ShopCustomerDebtList".status = 1
                                            AND "ShopCustomerDebtList".shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
                                            AND "ShopCustomerDebtList".shop_customer_debt_cn_doc_id = "ShopCustomerDebtCreditNoteDoc".id
                                    ))
                                ORDER BY
                                    "ShopCustomerDebtDoc".status = 1 DESC,
                                    "ShopCustomerDebtDoc".code_id DESC
                                LIMIT 1
                            )
                        ELSE null
                    END
                ) AS "ShopCustomerDebtDoc",
                (
                    CASE
                        WHEN "ShopBusinessCustomer".id IS NOT NULL
                            THEN jsonb_build_object(
                                'shop_id', "ShopBusinessCustomer".shop_id,
                                'id', "ShopBusinessCustomer".id,
                                'master_customer_code_id', "ShopBusinessCustomer".master_customer_code_id,
                                'tax_id', btrim("ShopBusinessCustomer".tax_id),
                                'customer_name', nullif("ShopBusinessCustomer".customer_name->>'th', ''),
                                'branch_name', (CASE
                                                        WHEN coalesce("ShopBusinessCustomer".other_details->>'branch', 'office') = 'office'
                                                            THEN 'สำนักงานใหญ่'
                                                            ELSE 'สาขา' || btrim(' ' || coalesce("ShopBusinessCustomer".other_details->>'branch_code', ''))
                                                   END)
                                 )
                            ELSE null
                    END
                ) AS "ShopBusinessCustomer",
                (
                    CASE
                        WHEN "ShopPersonalCustomer".id IS NOT NULL
                            THEN jsonb_build_object(
                                    'shop_id', "ShopPersonalCustomer".shop_id,
                                    'id', "ShopPersonalCustomer".id,
                                    'master_customer_code_id', "ShopPersonalCustomer".master_customer_code_id,
                                    'id_card_number', nullif(btrim("ShopPersonalCustomer".id_card_number), ''),
                                    'customer_name', nullif(coalesce("ShopPersonalCustomer".customer_name->'first_name'->>'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name->'last_name'->>'th',''),' '))
                            ELSE null
                    END
                ) AS "ShopPersonalCustomer"
            FROM app_shops_datas.dat_01hq0010_customer_debt_cn_doc AS "ShopCustomerDebtCreditNoteDoc"
            LEFT JOIN app_shops_datas.dat_01hq0010_temporary_delivery_order_doc AS  "ShopTemporaryDeliveryOrderDoc"
                ON "ShopTemporaryDeliveryOrderDoc".id = "ShopCustomerDebtCreditNoteDoc".shop_temporary_delivery_order_doc_id
            LEFT JOIN app_shops_datas.dat_01hq0010_business_customers AS "ShopBusinessCustomer"
               ON "ShopBusinessCustomer".id = "ShopCustomerDebtCreditNoteDoc".bus_customer_id
            LEFT JOIN app_shops_datas.dat_01hq0010_personal_customers AS "ShopPersonalCustomer"
               ON "ShopPersonalCustomer".id = "ShopCustomerDebtCreditNoteDoc".per_customer_id
            WHERE "ShopCustomerDebtCreditNoteDoc".status IN (${arrStrFilter__status})
                ${querySearchString__ShopCustomerDebtCreditNoteDoc}
            )
        `.replace(/(_01hq0010)/ig, `_${curr}`);

        return prev;

    }, ``);

    const queryResult__Data = await db.query(
        `
            SELECT "SalesTax".* 
            FROM (${queryString}) AS "SalesTax" 
            ORDER BY "SalesTax".${sort} ${order}, doc_date DESC, code_id DESC
            ${export_format === 'xlsx'
                ? ``
                : `
                        LIMIT ${limit} 
                        OFFSET ${limit * (page - 1)}
                    `
            }
            ;
        `.replace(/\s+/g, ' '),
        {
            type: QueryTypes.SELECT,
            nest: true
        }
    );

    if (export_format === 'xlsx' && table_names.length <= 1) {
        const results = queryResult__Data;
        const data = [];
        if (results.length === 0) {
            data.push({
                'วันที่เอกสาร': null,
                'เลขที่เอกสาร': null,
                'เอกสารอ้างอิง': null,
                'ชื่อลูกค้า': null,
                'เลขที่ผู้เสียภาษี': null,
                'สาขา': null,
                'มูลค่า': null,
                'ภาษีมูลค่าเพิ่ม': null,
                'จำนวนเงินรวมทั้งสิ้น': null,
                'สถาณะเอกสาร': null
            });
        } else {
            for (let index = 0; index < results.length; index++) {
                const element = results[index];
                let multiple = 1
                if (element.status == 2 || element?.code_id.includes('PCN')) {
                    multiple = -1
                }
                data.push({
                    'วันที่เอกสาร': element?.doc_date || '',
                    'เลขที่เอกสาร': element?.code_id || '',
                    'เอกสารอ้างอิง': element?.ref_doc || '',
                    'ชื่อลูกค้า': element?.ShopBusinessCustomer?.customer_name || element?.ShopPersonalCustomer?.customer_name || '',
                    'เลขที่ผู้เสียภาษี': element?.ShopBusinessCustomer?.tax_id || element?.ShopPersonalCustomer?.id_card_number || '',
                    'สาขา': element?.ShopBusinessCustomer?.branch_name || '', //element?.ShopProfile?.shop_local_name || element?.ShopProfile?.shop_name || '',
                    'มูลค่า': Number(element?.price_before_vat) * multiple || 0,
                    'ภาษีมูลค่าเพิ่ม': Number(element?.price_vat) * multiple || 0,
                    'จำนวนเงินรวมทั้งสิ้น': Number(element?.price_grand_total * multiple || 0),
                    'สถาณะเอกสาร': {
                        '0': '',
                        '1': 'ใช้งานเอกสาร',
                        '2': 'ยกเลิกเอกสาร',
                    }[String(element?.status || 0)] || ''
                });
            }
        }


        let ws = await XLSX.utils.json_to_sheet(data, { origin: 2 });

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
            if (cell.r === 2) {
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
            if ([6, 7, 8].includes(cell.c)) {
                ws[objectI].z = '##,##,##0.00'
            }
        }

        ws["!ref"] = `A1:J${results.length + 4}`

        // Foot Column: TEXT(รวม)
        const footColumn_SUMtext = 'F';
        ws[`${footColumn_SUMtext}${results.length + 4}`] = {
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
        // Foot Column: SUM(มูลค่า)
        const footColumn_SUM_priceBeforeVat = 'G';
        ws[`${footColumn_SUM_priceBeforeVat}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`
                : `=SUMIF(J1:J${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`,
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
        // Foot Column: SUM(ภาษีมูลค่าเพิ่ม)
        const footColumn_SUM_priceVat = 'H';
        ws[`${footColumn_SUM_priceVat}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`
                : `=SUMIF(J1:J${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`,
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
        // Foot Column: SUM(จำนวนเงินรวมทั้งสิ้น)
        const footColumn_SUM_grandTotal = 'I';
        ws[`${footColumn_SUM_grandTotal}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`
                : `=SUMIF(J1:J${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`,
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
            { width: 17 }, // Col: A
            { width: 17 }, // Col: B
            { width: 17 }, // Col: C
            { width: 24 }, // Col: D
            { width: 17 }, // Col: E
            { width: 24 }, // Col: F
            { width: 20 }, // Col: G
            { width: 20 }, // Col: H
            { width: 20 }, // Col: I
            { width: 20 }, // Col: J
        ];

        ws['!cols'] = wscols;



        const merge = [
            {
                s: { r: 0, c: 0 },
                e: { r: 0, c: Object.keys(data[0]).length - 1 }
            },
            {
                s: { r: 1, c: 0 },
                e: { r: 1, c: Object.keys(data[0]).length - 1 }
            }
        ];
        ws["!merges"] = merge;

        ws['!rows'] = [
            { 'hpt': 40 },// height for row 1
            { 'hpt': 40 },]; //height for row 2
        ws[`A1`] = {
            t: 's', v: 'รายงานภาษีขาย',
            s: {
                font: {
                    name: "TH SarabunPSK",
                    sz: 20,
                    bold: true,
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
            }
        }

        let minDate = ''
        let maxDate = ''
        if (doc_date_startDate) {
            minDate = doc_date_startDate
            maxDate = doc_date_endDate

        } else {
            let dateArr = results.map(el => { return new Date(el.doc_date) })
            minDate = (dateArr.length > 0) ? moment(Math.min.apply(null, dateArr)).format('YYYY-MM-DD') : '-';
            maxDate = (dateArr.length > 0) ? moment(Math.max.apply(null, dateArr)).format('YYYY-MM-DD') : '-';
        }

        ws[`A2`] = {
            t: 's', v: `ประจำวันที่ ${minDate} ถึง ${maxDate}`,
            s: {
                font: {
                    name: "TH SarabunPSK",
                    sz: 18,
                    bold: true,
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
            }
        }


        const file_name = uuid4() + '___รายงานภาษีขาย';

        let wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

        await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

        return file_name + '.xlsx';
    }

    if (export_format === 'xlsx' && table_names.length > 1) {
        const results = queryResult__Data;
        const data = [];
        if (results.length === 0) {
            data.push({
                'ชื่อร้านภายใน': null,
                'วันที่เอกสาร': null,
                'เลขที่เอกสาร': null,
                'เอกสารอ้างอิง': null,
                'ชื่อลูกค้า': null,
                'เลขที่ผู้เสียภาษี': null,
                'สาขา': null,
                'มูลค่า': null,
                'ภาษีมูลค่าเพิ่ม': null,
                'จำนวนเงินรวมทั้งสิ้น': null,
                'สถาณะเอกสาร': null
            });
        } else {
            for (let index = 0; index < results.length; index++) {
                const element = results[index];
                let multiple = 1
                if (element.status == 2 || element?.code_id.includes('PCN')) {
                    multiple = -1
                }
                data.push({
                    'ชื่อร้านภายใน': element?.ShopProfile?.shop_local_name || element?.ShopProfile?.shop_name || '',
                    'วันที่เอกสาร': element?.doc_date || '',
                    'เลขที่เอกสาร': element?.code_id || '',
                    'เอกสารอ้างอิง': element?.ref_doc || '',
                    'ชื่อลูกค้า': element?.ShopBusinessCustomer?.customer_name || element?.ShopPersonalCustomer?.customer_name || '',
                    'เลขที่ผู้เสียภาษี': element?.ShopBusinessCustomer?.tax_id || element?.ShopPersonalCustomer?.id_card_number || '',
                    'สาขา': element?.ShopBusinessCustomer?.branch_name || '', //element?.ShopProfile?.shop_local_name || element?.ShopProfile?.shop_name || '',
                    'มูลค่า': Number(element?.price_before_vat) * multiple || 0,
                    'ภาษีมูลค่าเพิ่ม': Number(element?.price_vat) * multiple || 0,
                    'จำนวนเงินรวมทั้งสิ้น': Number(element?.price_grand_total * multiple || 0),
                    'สถาณะเอกสาร': {
                        '0': '',
                        '1': 'ใช้งานเอกสาร',
                        '2': 'ยกเลิกเอกสาร',
                    }[String(element?.status || 0)] || ''
                });
            }
        }


        let ws = await XLSX.utils.json_to_sheet(data, { origin: 2 });

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
            if (cell.r === 2) {
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
            if ([7, 8, 9].includes(cell.c)) {
                ws[objectI].z = '##,##,##0.00'
            }
        }

        ws["!ref"] = `A1:K${results.length + 4}`

        // Foot Column: TEXT(รวม)
        const footColumn_SUMtext = 'G';
        ws[`${footColumn_SUMtext}${results.length + 4}`] = {
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
        // Foot Column: SUM(มูลค่า)
        const footColumn_SUM_priceBeforeVat = 'H';
        ws[`${footColumn_SUM_priceBeforeVat}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`
                : `=SUMIF(K1:K${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`,
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
        // Foot Column: SUM(ภาษีมูลค่าเพิ่ม)
        const footColumn_SUM_priceVat = 'I';
        ws[`${footColumn_SUM_priceVat}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`
                : `=SUMIF(K1:K${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`,
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
        // Foot Column: SUM(จำนวนเงินรวมทั้งสิ้น)
        const footColumn_SUM_grandTotal = 'J';
        ws[`${footColumn_SUM_grandTotal}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`
                : `=SUMIF(K1:K${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`,
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
            { width: 20 }, // Col: A
            { width: 17 }, // Col: B
            { width: 17 }, // Col: C
            { width: 17 }, // Col: D
            { width: 24 }, // Col: E
            { width: 17 }, // Col: F
            { width: 24 }, // Col: G
            { width: 20 }, // Col: H
            { width: 20 }, // Col: I
            { width: 20 }, // Col: J
            { width: 20 }, // Col: K
        ];

        ws['!cols'] = wscols;


        const merge = [
            {
                s: { r: 0, c: 0 },
                e: { r: 0, c: Object.keys(data[0]).length - 1 }
            },
            {
                s: { r: 1, c: 0 },
                e: { r: 1, c: Object.keys(data[0]).length - 1 }
            }
        ];
        ws["!merges"] = merge;

        ws['!rows'] = [
            { 'hpt': 40 },// height for row 1
            { 'hpt': 40 },]; //height for row 2
        ws[`A1`] = {
            t: 's', v: 'รายงานภาษีขาย',
            s: {
                font: {
                    name: "TH SarabunPSK",
                    sz: 20,
                    bold: true,
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
            }
        }

        let minDate = ''
        let maxDate = ''
        if (doc_date_startDate) {
            minDate = doc_date_startDate
            maxDate = doc_date_endDate

        } else {
            let dateArr = results.map(el => { return new Date(el.doc_date) })
            minDate = (dateArr.length > 0) ? moment(Math.min.apply(null, dateArr)).format('YYYY-MM-DD') : '-';
            maxDate = (dateArr.length > 0) ? moment(Math.max.apply(null, dateArr)).format('YYYY-MM-DD') : '-';
        }

        ws[`A2`] = {
            t: 's', v: `ประจำวันที่ ${minDate} ถึง ${maxDate}`,
            s: {
                font: {
                    name: "TH SarabunPSK",
                    sz: 18,
                    bold: true,
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
            }
        }

        const file_name = uuid4() + '___รายงานภาษีขาย';

        let wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

        await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

        return file_name + '.xlsx';
    }

    /**
     * @type {number}
     */
    const queryResult__Count = await db.query(
        `
            SELECT COUNT(*) 
            FROM (${queryString}) AS "SalesTax";
        `.replace(/\s+/g, ' '),
        {
            type: QueryTypes.SELECT,
            nest: false,
            raw: true
        }
    ).then(r => Number(r[0].count) || 0);

    const pag = {
        currentPage: page,
        pages: Math.ceil(queryResult__Count / limit),
        currentCount: queryResult__Data.length,
        totalCount: queryResult__Count,
        data: queryResult__Data
    };

    return pag;
};

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault | {}} request
 * @param {Array<string>} table_names
 * @param options
 */
const fnReportTaxType__purchase_tax = async (request, table_names, options = {}) => {
    const search = request.query.search || '';
    const limit = request.query.limit || 10;
    const page = request.query.page || 1;
    const sort = request.query.sort || 'code_id';
    const order = request.query.order || 'desc';

    const export_format = request.query.export_format || 'json';

    const doc_date_startDate = request.query.doc_date_startDate || '';
    const doc_date_endDate = request.query.doc_date_endDate || '';

    // let arrStrFilter__status = request.query?.arrStrFilter__status || [0, 1];
    let arrStrFilter__status = request.query?.arrStrFilter__status || [0, 1, 2];
    if (!Array.isArray(arrStrFilter__status)) {
        arrStrFilter__status = arrStrFilter__status.split(',').filter(w => Number.isSafeInteger(Number(w))).map(w => Number(w));
        if (arrStrFilter__status.length === 0) {
            arrStrFilter__status = [0, 1, 2];
        }
    }

    let arrStrFilter__tax_type_id = request.query?.arrStrFilter__tax_type_id || ['fafa3667-55d8-49d1-b06c-759c6e9ab064', '8c73e506-31b5-44c7-a21b-3819bb712321'];
    if (!Array.isArray(arrStrFilter__tax_type_id)) {
        arrStrFilter__tax_type_id = arrStrFilter__tax_type_id.split(',').filter(w => isUUID(w));
        if (arrStrFilter__tax_type_id.length === 0) {
            arrStrFilter__tax_type_id = ['fafa3667-55d8-49d1-b06c-759c6e9ab064', '8c73e506-31b5-44c7-a21b-3819bb712321'];
        }
    }
    arrStrFilter__tax_type_id = arrStrFilter__tax_type_id.map(w => `'${w}'`);

    const bolFilter_show_zero_vat = !!request.query?.bolFilter_show_zero_vat;

    let querySearchString_INI = ``;
    let querySearchString_PDD = ``;

    if (arrStrFilter__tax_type_id.length > 0) {
        querySearchString_INI += `\nAND ("ShopInventoryTransactionDoc".details->>'tax_type')::uuid IN (${arrStrFilter__tax_type_id}) `;
        querySearchString_PDD += `\nAND "ShopPartnerDebtDoc".tax_type_id IN (${arrStrFilter__tax_type_id}) `;
    }

    if (doc_date_startDate && doc_date_endDate) {
        querySearchString_INI += `\nAND "ShopInventoryTransactionDoc".doc_date BETWEEN '${doc_date_startDate}' AND '${doc_date_endDate}' `;
        querySearchString_PDD += `\nAND "ShopPartnerDebtDoc".doc_date BETWEEN '${doc_date_startDate}' AND '${doc_date_endDate}' `;
    }
    if (doc_date_startDate && !doc_date_endDate) {
        querySearchString_INI += `\nAND "ShopInventoryTransactionDoc".doc_date >= '${doc_date_startDate}' `;
        querySearchString_PDD += `\nAND "ShopPartnerDebtDoc".doc_date >= '${doc_date_startDate}' `;
    }
    if (!doc_date_startDate && doc_date_endDate) {
        querySearchString_INI += `\nAND "ShopInventoryTransactionDoc".doc_date <= '${doc_date_endDate}' `;
        querySearchString_PDD += `\nAND "ShopPartnerDebtDoc".doc_date <= '${doc_date_endDate}' `;
    }

    if (!bolFilter_show_zero_vat) {
        querySearchString_INI += `\nAND (coalesce(nullif("ShopInventoryTransactionDoc".details->>'vat', 'undefined'), '0'))::numeric(20,2) > 0 `;
        querySearchString_PDD += `\nAND "ShopPartnerDebtDoc".price_vat > 0 `;
    }

    if (search) {
        const repl_search = search
            .replace(/^(\s|%)+/ig, ``)
            .replace(/(\s|%)+$/ig, ``)
            .replace(/(\s|%)+/ig, `%`);

        querySearchString_INI += `\nAND (
            "ShopInventoryTransactionDoc".code_id ILIKE '%${repl_search}%'
            OR coalesce(nullif("ShopInventoryTransactionDoc".details->>'ref_doc', ''), nullif("ShopInventoryTransactionDoc".details->>'References_doc', '')) ILIKE '%${repl_search}%'
            OR coalesce("ShopBusinessPartner".code_id, '') ILIKE '%${repl_search}%'
            OR coalesce(btrim("ShopBusinessPartner".tax_id), '') ILIKE '%${repl_search}%'
            OR coalesce("ShopBusinessPartner".partner_name->>'th', '') ILIKE '%${repl_search}%'
        )`;

        querySearchString_PDD += `\nAND (
            "ShopPartnerDebtDoc".code_id ILIKE '%${repl_search}%'
            OR coalesce(nullif("ShopPartnerDebtDoc".details->>'ref_doc', ''), nullif("ShopPartnerDebtDoc".details->>'References_doc', '')) ILIKE '%${repl_search}%'
            OR coalesce("ShopBusinessPartner".code_id, '') ILIKE '%${repl_search}%'
            OR coalesce(btrim("ShopBusinessPartner".tax_id), '') ILIKE '%${repl_search}%'
            OR coalesce("ShopBusinessPartner".partner_name->>'th', '') ILIKE '%${repl_search}%'
        )`;
    }

    const queryString = table_names.reduce((prev, curr, currIdx) => {
        if (currIdx !== 0) {
            prev += ` UNION ALL `;
        }

        prev += `
            (SELECT
                   "ShopInventoryTransactionDoc".shop_id,
                   "ShopInventoryTransactionDoc".id,
                   "ShopInventoryTransactionDoc".code_id,
                   "ShopInventoryTransactionDoc".doc_date,
                   coalesce(nullif("ShopInventoryTransactionDoc".details->>'ref_doc', ''), nullif("ShopInventoryTransactionDoc".details->>'References_doc', '')) AS ref_doc,
                   ("ShopInventoryTransactionDoc".details->>'tax_type')::uuid AS tax_type_id,
                   (coalesce(nullif("ShopInventoryTransactionDoc".details->>'total_price_all_after_discount', 'undefined'), '0'))::numeric(20,2) AS price_before_vat,
                   (coalesce(nullif("ShopInventoryTransactionDoc".details->>'vat', 'undefined'), '0'))::numeric(20,2) AS price_vat,
                   (coalesce(nullif(coalesce("ShopInventoryTransactionDoc".details->>'net_price_text', "ShopInventoryTransactionDoc".details->>'net_price'), 'undefined'), '0'))::numeric(20,2) AS price_grand_total,
                   "ShopInventoryTransactionDoc".status,
                   
                   (
                        SELECT jsonb_build_object(
                               'id', "ShopProfile".id,
                               'shop_name', "ShopProfile".shop_name->>'th',
                               'shop_local_name', "ShopProfile".shop_name->>'shop_local_name'
                        )
                        FROM app_datas.dat_shops_profiles AS "ShopProfile"
                        WHERE "ShopProfile".id = "ShopInventoryTransactionDoc".shop_id
                   ) AS "ShopProfile",
                   
                   (
                       SELECT jsonb_build_object(
                              'id', "TaxType".id,
                              'type_name', "TaxType".type_name->>'th'
                       )
                       FROM master_lookup.mas_tax_types AS "TaxType"
                       WHERE "TaxType".id = ("ShopInventoryTransactionDoc".details->>'tax_type')::uuid
                   ) AS "TaxType",
            
                   CASE WHEN "ShopBusinessPartner".id IS NOT NULL THEN
                       jsonb_build_object(
                           'shop_id', "ShopBusinessPartner".shop_id,
                           'id', "ShopBusinessPartner".id,
                           'code_id', "ShopBusinessPartner".code_id,
                           'tax_id', nullif(btrim("ShopBusinessPartner".tax_id), ''),
                           'partner_name', nullif("ShopBusinessPartner".partner_name->>'th', ''),
                           'branch_name', CASE WHEN coalesce("ShopBusinessPartner".other_details->>'branch', 'office') = 'office'
                                               THEN 'สำนักงานใหญ่'
                                               ELSE 'สาขา' || btrim(' ' || coalesce("ShopBusinessPartner".other_details->>'branch_code', ''))
                                          END
                       )
                       ELSE null
                   END AS "ShopBusinessPartner",

                   CASE WHEN "ShopBusinessPartner".id IS NOT NULL THEN
                       jsonb_build_object(
                           'shop_id', "ShopBusinessPartner".shop_id,
                           'id', "ShopBusinessPartner".id,
                           'code_id', "ShopBusinessPartner".code_id,
                           'tax_id', nullif(btrim("ShopBusinessPartner".tax_id), ''),
                           'partner_name', nullif("ShopBusinessPartner".partner_name->>'th', ''),
                           'branch_name', CASE WHEN coalesce("ShopBusinessPartner".other_details->>'branch', 'office') = 'office'
                                               THEN 'สำนักงานใหญ่'
                                               ELSE 'สาขา' || btrim(' ' || coalesce("ShopBusinessPartner".other_details->>'branch_code', ''))
                                          END
                       )
                       WHEN "ShopInventoryTransactionDoc".details->>'destination_branch' IS NOT NULL THEN
                       jsonb_build_object(
                            'shop_id', "ShopProfile".id,
                            'id', "ShopProfile".id,
                            'code_id', "ShopProfile".shop_code_id,
                            'tax_id', nullif(btrim("ShopProfile".tax_code_id), ''),
                            'partner_name', nullif("ShopProfile".shop_name->>'th', ''),
                            'branch_name', nullif("ShopProfile".shop_name->>'shop_local_name','')
                        )
                       ELSE null
                   END AS "Partner"
            
            FROM app_shops_datas.dat_01hq0010_inventory_transaction_doc AS "ShopInventoryTransactionDoc"
            LEFT JOIN app_shops_datas.dat_01hq0010_business_partners AS "ShopBusinessPartner" ON "ShopBusinessPartner".id = "ShopInventoryTransactionDoc".bus_partner_id
            LEFT JOIN app_datas.dat_shops_profiles as "ShopProfile" ON "ShopProfile".id = ("ShopInventoryTransactionDoc".details->>'destination_branch')::uuid
            WHERE "ShopInventoryTransactionDoc".status IN (${arrStrFilter__status})
                AND "ShopInventoryTransactionDoc".doc_type_id in ('ad06eaab-6c5a-4649-aef8-767b745fab47','4979e859-92d1-4485-9243-45cdd505adb8') 
                ${querySearchString_INI}
            )
        `.replace(/(_01hq0010)/ig, `_${curr}`);

        prev += ` UNION ALL `;

        prev += `
            (SELECT
                    "ShopPartnerDebtDoc".shop_id,
                    "ShopPartnerDebtDoc".id,
                    "ShopPartnerDebtDoc".code_id,
                    "ShopPartnerDebtDoc".doc_date,
                    coalesce(nullif("ShopPartnerDebtDoc".details->>'ref_doc', ''), nullif("ShopPartnerDebtDoc".details->>'References_doc', '')) AS ref_doc,
                    "ShopPartnerDebtDoc".tax_type_id,
                    "ShopPartnerDebtDoc".price_before_vat,
                    "ShopPartnerDebtDoc".price_vat,
                    "ShopPartnerDebtDoc".price_grand_total,
                    "ShopPartnerDebtDoc".status,
                    (
                        SELECT jsonb_build_object(
                               'id', "ShopProfile".id,
                               'shop_name', "ShopProfile".shop_name->>'th',
                               'shop_local_name', "ShopProfile".shop_name->>'shop_local_name'
                        )
                        FROM app_datas.dat_shops_profiles AS "ShopProfile"
                        WHERE "ShopProfile".id = "ShopPartnerDebtDoc".shop_id
                    ) AS "ShopProfile",
                
                   (
                       SELECT jsonb_build_object(
                              'id', "TaxType".id,
                              'type_name', "TaxType".type_name->>'th'
                       )
                       FROM master_lookup.mas_tax_types AS "TaxType"
                       WHERE "TaxType".id = "ShopPartnerDebtDoc".tax_type_id
                   ) AS "TaxType",
                
                   CASE WHEN "ShopBusinessPartner".id IS NOT NULL THEN
                       jsonb_build_object(
                           'shop_id', "ShopBusinessPartner".shop_id,
                           'id', "ShopBusinessPartner".id,
                           'code_id', "ShopBusinessPartner".code_id,
                           'tax_id', nullif(btrim("ShopBusinessPartner".tax_id), ''),
                           'partner_name', nullif("ShopBusinessPartner".partner_name->>'th', ''),
                           'branch_name', CASE WHEN coalesce("ShopBusinessPartner".other_details->>'branch', 'office') = 'office'
                                               THEN 'สำนักงานใหญ่'
                                               ELSE 'สาขา' || btrim(' ' || coalesce("ShopBusinessPartner".other_details->>'branch_code', ''))
                                          END
                       )
                       ELSE null
                   END AS "ShopBusinessPartner",

                   CASE WHEN "ShopBusinessPartner".id IS NOT NULL THEN
                       jsonb_build_object(
                           'shop_id', "ShopBusinessPartner".shop_id,
                           'id', "ShopBusinessPartner".id,
                           'code_id', "ShopBusinessPartner".code_id,
                           'tax_id', nullif(btrim("ShopBusinessPartner".tax_id), ''),
                           'partner_name', nullif("ShopBusinessPartner".partner_name->>'th', ''),
                           'branch_name', CASE WHEN coalesce("ShopBusinessPartner".other_details->>'branch', 'office') = 'office'
                                               THEN 'สำนักงานใหญ่'
                                               ELSE 'สาขา' || btrim(' ' || coalesce("ShopBusinessPartner".other_details->>'branch_code', ''))
                                          END
                       )
                        ELSE null
                   END AS "Partner"

                FROM app_shops_datas.dat_01hq0010_partner_debt_cn_doc AS "ShopPartnerDebtDoc"
                    LEFT JOIN app_shops_datas.dat_01hq0010_business_partners AS "ShopBusinessPartner" ON "ShopPartnerDebtDoc".bus_partner_id = "ShopBusinessPartner".id
                WHERE "ShopPartnerDebtDoc".status IN (${arrStrFilter__status})
                    ${querySearchString_PDD}
            )
        `.replace(/(_01hq0010)/ig, `_${curr}`);

        return prev;

    }, ``);

    const queryResult__Data = await db.query(
        `
            SELECT "PurchaseTax".* 
            FROM (${queryString}) AS "PurchaseTax" 
            ORDER BY "PurchaseTax".${sort} ${order}, "PurchaseTax".doc_date DESC, "PurchaseTax".code_id DESC
            LIMIT ${limit} 
            OFFSET ${limit * (page - 1)};
        `.replace(/\s+/g, ' '),
        {
            type: QueryTypes.SELECT,
            nest: true
        }
    );

    if (export_format === 'xlsx' && table_names.length <= 1) {
        const results = queryResult__Data;
        const data = [];
        if (results.length === 0) {
            data.push({
                'วันที่อ้างอิง': null,
                'เลขที่เอกสาร': null,
                'เอกสารอ้างอิง': null,
                'ชื่อผู้จำหน่าย': null,
                'เลขที่ผู้เสียภาษี': null,
                'สาขา': null,
                'มูลค่า': null,
                'ภาษีมูลค่าเพิ่ม': null,
                'จำนวนเงินรวมทั้งสิ้น': null,
                'สถาณะเอกสาร': null
            });
        } else {
            for (let index = 0; index < results.length; index++) {
                const element = results[index];
                let multiple = 1
                if (element.status == 0 || element?.code_id.includes('PCN')) {
                    multiple = -1
                }
                data.push({
                    'วันที่อ้างอิง': element?.doc_date || '',
                    'เลขที่เอกสาร': element?.code_id || '',
                    'เอกสารอ้างอิง': element?.ref_doc || '',
                    'ชื่อผู้จำหน่าย': element?.Partner?.partner_name || '',
                    'เลขที่ผู้เสียภาษี': element?.Partner?.tax_id || '',
                    'สาขา': element?.Partner?.branch_name || '', //element?.ShopProfile?.shop_local_name || element?.ShopProfile?.shop_name || '',
                    'มูลค่า': Number(element?.price_before_vat) * multiple || 0,
                    'ภาษีมูลค่าเพิ่ม': Number(element?.price_vat) * multiple || 0,
                    'จำนวนเงินรวมทั้งสิ้น': Number(element?.price_grand_total * multiple || 0),
                    'สถาณะเอกสาร': {
                        '0': 'ยกเลิกเอกสาร',
                        '1': 'ใช้งานเอกสาร'
                    }[String(element?.status || 0)] || ''
                });
            }
        }


        let ws = await XLSX.utils.json_to_sheet(data, { origin: 2 });

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
            if (cell.r === 2) {
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
            if ([6, 7, 8].includes(cell.c)) {
                ws[objectI].z = '##,##,##0.00'
            }
        }

        ws["!ref"] = `A1:J${results.length + 4}`

        const docStatusColumnAlphabetName = 'J';

        // Foot Column: TEXT(รวม)
        const footColumn_TXT_sumaryTxt = 'F';
        ws[`${footColumn_TXT_sumaryTxt}${results.length + 4}`] = {
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
        // Foot Column: TEXT(มูลค่า)
        const footColumn_SUM_priceBeforeVat = 'G';
        ws[`${footColumn_SUM_priceBeforeVat}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`
                : `=SUMIF(${docStatusColumnAlphabetName}1:${docStatusColumnAlphabetName}${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`,
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
        // Foot Column: SUM(ภาษีมูลค่าเพิ่ม)
        const footColumn_SUM_priceVat = 'H';
        ws[`${footColumn_SUM_priceVat}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`
                : `=SUMIF(${docStatusColumnAlphabetName}1:${docStatusColumnAlphabetName}${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`,
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
        // Foot Column: SUM(จำนวนเงินรวมทั้งสิ้น)
        const footColumn_SUM_grandTotal = 'I';
        ws[`${footColumn_SUM_grandTotal}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`
                : `=SUMIF(${docStatusColumnAlphabetName}1:${docStatusColumnAlphabetName}${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`,
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
            { width: 17 }, // Col: A
            { width: 17 }, // Col: B
            { width: 17 }, // Col: C
            { width: 24 }, // Col: D
            { width: 17 }, // Col: E
            { width: 24 }, // Col: F
            { width: 20 }, // Col: G
            { width: 20 }, // Col: H
            { width: 20 }, // Col: I
            { width: 20 }, // Col: J
        ];

        ws['!cols'] = wscols;


        const merge = [
            {
                s: { r: 0, c: 0 },
                e: { r: 0, c: Object.keys(data[0]).length - 1 }
            },
            {
                s: { r: 1, c: 0 },
                e: { r: 1, c: Object.keys(data[0]).length - 1 }
            }
        ];
        ws["!merges"] = merge;

        ws['!rows'] = [
            { 'hpt': 40 },// height for row 1
            { 'hpt': 40 },]; //height for row 2
        ws[`A1`] = {
            t: 's', v: 'รายงานภาษีซื้อ',
            s: {
                font: {
                    name: "TH SarabunPSK",
                    sz: 20,
                    bold: true,
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
            }
        }

        let minDate = ''
        let maxDate = ''
        if (doc_date_startDate) {
            minDate = doc_date_startDate
            maxDate = doc_date_endDate

        } else {
            let dateArr = results.map(el => { return new Date(el.doc_date) })
            minDate = (dateArr.length > 0) ? moment(Math.min.apply(null, dateArr)).format('YYYY-MM-DD') : '-';
            maxDate = (dateArr.length > 0) ? moment(Math.max.apply(null, dateArr)).format('YYYY-MM-DD') : '-';
        }

        ws[`A2`] = {
            t: 's', v: `ประจำวันที่ ${minDate} ถึง ${maxDate}`,
            s: {
                font: {
                    name: "TH SarabunPSK",
                    sz: 18,
                    bold: true,
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
            }
        }

        const file_name = uuid4() + '___รายงานภาษีซื้อ';

        let wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

        await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

        return file_name + '.xlsx';
    }

    if (export_format === 'xlsx' && table_names.length > 1) {
        const results = queryResult__Data;
        const data = [];
        if (results.length === 0) {
            data.push({
                'ชื่อร้านภายใน': null,
                'วันที่เอกสาร': null,
                'เลขที่เอกสาร': null,
                'เอกสารอ้างอิง': null,
                'ชื่อผู้จำหน่าย': null,
                'เลขที่ผู้เสียภาษี': null,
                'สาขา': null,
                'มูลค่า': null,
                'ภาษีมูลค่าเพิ่ม': null,
                'จำนวนเงินรวมทั้งสิ้น': null,
                'สถาณะเอกสาร': null
            });
        } else {
            for (let index = 0; index < results.length; index++) {
                const element = results[index];
                let multiple = 1
                if (element.status == 0 || element?.code_id.includes('PCN')) {
                    multiple = -1
                }
                data.push({
                    'ชื่อร้านภายใน': element?.ShopProfile?.shop_local_name || element?.ShopProfile?.shop_name || '',
                    'วันที่เอกสาร': element?.doc_date || '',
                    'เลขที่เอกสาร': element?.code_id || '',
                    'เอกสารอ้างอิง': element?.ref_doc || '',
                    'ชื่อผู้จำหน่าย': element?.Partner?.partner_name || '',
                    'เลขที่ผู้เสียภาษี': element?.Partner?.tax_id || '',
                    'สาขา': element?.Partner?.branch_name || '', //element?.ShopProfile?.shop_local_name || element?.ShopProfile?.shop_name || '',
                    'มูลค่า': Number(element?.price_before_vat) * multiple || 0,
                    'ภาษีมูลค่าเพิ่ม': Number(element?.price_vat) * multiple || 0,
                    'จำนวนเงินรวมทั้งสิ้น': Number(element?.price_grand_total * multiple || 0),
                    'สถาณะเอกสาร': {
                        '0': 'ยกเลิกเอกสาร',
                        '1': 'ใช้งานเอกสาร',
                    }[String(element?.status || 0)] || ''
                });
            }
        }


        let ws = await XLSX.utils.json_to_sheet(data, { origin: 2 });

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
            if (cell.r === 2) {
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
            if ([7, 8, 9].includes(cell.c)) {
                ws[objectI].z = '##,##,##0.00'
            }
        }

        ws["!ref"] = `A1:K${results.length + 4}`;

        const docStatusColumnAlphabetName = 'K';

        // Foot Column: TEXT(รวม)
        const footColumn_TXT_sumaryTxt = 'G';
        ws[`${footColumn_TXT_sumaryTxt}${results.length + 4}`] = {
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
        // Foot Column: TEXT(มูลค่า)
        const footColumn_SUM_priceBeforeVat = 'H';
        ws[`${footColumn_SUM_priceBeforeVat}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`
                : `=SUMIF(${docStatusColumnAlphabetName}1:${docStatusColumnAlphabetName}${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 3)})`,
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
        // Foot Column: SUM(ภาษีมูลค่าเพิ่ม)
        const footColumn_SUM_priceVat = 'I';
        ws[`${footColumn_SUM_priceVat}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`
                : `=SUMIF(${docStatusColumnAlphabetName}1:${docStatusColumnAlphabetName}${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_priceVat}1:${footColumn_SUM_priceVat}${(parseInt(results.length) + 3)})`,
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
        // Foot Column: SUM(จำนวนเงินรวมทั้งสิ้น)
        const footColumn_SUM_grandTotal = 'J';
        ws[`${footColumn_SUM_grandTotal}${results.length + 4}`] = {
            t: 'n', z: '##,##,##0.00', v: 0,
            // f: `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`,
            f: arrStrFilter__status.length === 1
                ? `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`
                : `=SUMIF(${docStatusColumnAlphabetName}1:${docStatusColumnAlphabetName}${(parseInt(results.length) + 3)},"<>ยกเลิกเอกสาร",${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 3)})`,
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
            { width: 20 }, // Col: A
            { width: 17 }, // Col: B
            { width: 17 }, // Col: C
            { width: 17 }, // Col: D
            { width: 24 }, // Col: E
            { width: 17 }, // Col: F
            { width: 24 }, // Col: G
            { width: 20 }, // Col: H
            { width: 20 }, // Col: I
            { width: 20 }, // Col: J
            { width: 20 }, // Col: K
        ];

        ws['!cols'] = wscols;

        const merge = [
            {
                s: { r: 0, c: 0 },
                e: { r: 0, c: Object.keys(data[0]).length - 1 }
            },
            {
                s: { r: 1, c: 0 },
                e: { r: 1, c: Object.keys(data[0]).length - 1 }
            }
        ];
        ws["!merges"] = merge;

        ws['!rows'] = [
            { 'hpt': 40 },// height for row 1
            { 'hpt': 40 },]; //height for row 2
        ws[`A1`] = {
            t: 's', v: 'รายงานภาษีซื้อ',
            s: {
                font: {
                    name: "TH SarabunPSK",
                    sz: 20,
                    bold: true,
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
            }
        }

        let minDate = ''
        let maxDate = ''
        if (doc_date_startDate) {
            minDate = doc_date_startDate
            maxDate = doc_date_endDate

        } else {
            let dateArr = results.map(el => { return new Date(el.doc_date) })
            minDate = (dateArr.length > 0) ? moment(Math.min.apply(null, dateArr)).format('YYYY-MM-DD') : '-';
            maxDate = (dateArr.length > 0) ? moment(Math.max.apply(null, dateArr)).format('YYYY-MM-DD') : '-';
        }

        ws[`A2`] = {
            t: 's', v: `ประจำวันที่ ${minDate} ถึง ${maxDate}`,
            s: {
                font: {
                    name: "TH SarabunPSK",
                    sz: 18,
                    bold: true,
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
            }
        }

        const file_name = uuid4() + '___รายงานภาษีซื้อ';

        let wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

        await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

        return file_name + '.xlsx';
    }

    /**
     * @type {number}
     */
    const queryResult__Count = await db.query(
        `
            SELECT COUNT(*)
            FROM (${queryString}) AS "PurchaseTax";
        ` .replace(/\s+/g, ' '),
        {
            type: QueryTypes.SELECT,
            nest: false,
            raw: true
        }
    ).then(r => Number(r[0].count) || 0);

    const pag = {
        currentPage: page,
        pages: Math.ceil(queryResult__Count / limit),
        currentCount: queryResult__Data.length,
        totalCount: queryResult__Count,
        data: queryResult__Data
    };

    return pag;
};

const handlerShopReportsSalesTax = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'GET ShopReports.SalesTax';

    try {

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfiles = await utilCheckShopTableName(request, 'select_shop_ids');

        /**
         * A name for create dynamics table
         */
        const table_names = request.query?.select_shop_ids && request.query?.select_shop_ids !== 'all'
            ? await ShopProfile.findAll({
                attributes: ['shop_code_id'],
                where: {
                    id: request.query?.select_shop_ids.split(',').map(w => w.toLowerCase())
                },
                transaction: options?.transaction || request?.transaction
            }).then(r => r.map(w => w.shop_code_id.toLowerCase()))
            : findShopsProfiles.map(w => w.shop_code_id.toLowerCase());
        if (table_names.length === 0) {
            throw new Error('ไม่พบสาขาที่ต้องการ');
        }

        /**
         * ประเภทรายงานภาษี
         * - sales_tax = ภาษีขาย
         * - purchase_tax = ภาษีซื้อ
         * @type {'sales_tax' | 'purchase_tax'}
         */
        const report_tax_type = request.query?.report_tax_type || 'sales_tax';

        const result = report_tax_type === 'sales_tax'
            ? await fnReportTaxType__sales_tax(request, table_names)
            : await fnReportTaxType__purchase_tax(request, table_names);

        await handleSaveLog(request, [[handlerName], '']);

        return utilSetFastifyResponseJson('success', result);
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], error]);

        throw error;
    }
};


module.exports = handlerShopReportsSalesTax;