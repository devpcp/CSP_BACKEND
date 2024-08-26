const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const { QueryTypes } = require("sequelize");
const db = require("../db");
const XLSX = require("xlsx-js-style");
const { v4: uuid4 } = require("uuid");

const fnGetQueryWhereStatusFromRequest = (status = status || 'default') => {
    switch (status.toLowerCase()) {
        case 'active': {
            return [1];
        }
        case 'block': {
            return [2];
        }
        case 'delete': {
            return [0];
        }
        case 'all': {
            return [0, 1, 2];
        }
        default: {
            return [1, 2];
        }
    }
};

/**
 * A handler to get customer debt report
 * - Route [GET] => /api/shopReports/customerDebt
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopReportsCustomerDebt = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopReports.CustomerDebt';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request, 'select_shop_ids');

        /**
         * A name for create dynamics table
         * @type {string[]}
         */
        const table_names = findShopsProfile.map(w => w.shop_code_id);

        const search = request.query?.search || '';
        const status = request.query?.status || 'default';
        const page = request.query?.page || 1;
        const limit = request.query?.limit || 10;
        const sort = request.query?.sort || 'created_date';
        const order = request.query?.order || 'DESC';

        const export_format = request.query?.export_format?.toLowerCase() || 'json';

        const doc_date_startDate = request.query?.doc_date_startDate || '';
        const doc_date_endDate = request.query?.doc_date_endDate || '';

        const debt_due_date_startDate = request.query?.debt_due_date_startDate || '';
        const debt_due_date_endDate = request.query?.debt_due_date_endDate || '';

        /**
         * @type {number[]|string}
         */
        let payment_paid_status = request.query?.payment_paid_status || '';
        if (Number.isSafeInteger(payment_paid_status)) {
            payment_paid_status = [Number(payment_paid_status)];
        }
        else {
            if (payment_paid_status.length > 0) {
                payment_paid_status = payment_paid_status.replace(/(\s)+/ig, '').split(',').map(w => Number(w));
            }
        }

        /**
         * @param {string[]} shop_ids
         */
        const fnSqlQuery = (shop_ids = []) => {
            return shop_ids.reduce((prev, curr, currIdx) => {
                if (currIdx > 0) {
                    prev = prev + `\nUNION ALL\n`;
                }
                return prev +
                    `
                    (
                    SELECT
                        "ShopCustomerDebtDoc".id AS "id",
                        "ShopCustomerDebtDoc".shop_id AS "shop_id",
                        "ShopCustomerDebtDoc".code_id AS "code_id",
                        "ShopCustomerDebtDoc".doc_date AS "doc_date",
                        "ShopCustomerDebtDoc".bus_customer_id AS "bus_customer_id",
                        "ShopCustomerDebtDoc".per_customer_id AS "per_customer_id",
                        "ShopCustomerDebtDoc".debt_due_date AS "debt_due_date",
                        "ShopCustomerDebtDoc".price_grand_total AS "price_grand_total",
                        "ShopCustomerDebtDoc".debt_price_paid_total AS "debt_price_paid_total",
                        "ShopCustomerDebtDoc".payment_paid_status AS "payment_paid_status",
                        "ShopCustomerDebtDoc".status AS "status",
                        "ShopCustomerDebtDoc".created_date AS "created_date",
                        "ShopCustomerDebtDoc".created_by AS "created_by",
                        "ShopCustomerDebtDoc".updated_date AS "updated_date",
                        "ShopCustomerDebtDoc".updated_by AS "updated_by",
                        coalesce((
                            SELECT jsonb_build_object (
                                       'is_partial_payment', (CASE WHEN count("ShopPaymentTransaction".*) > 1 THEN True ELSE False END),
                                       'payment_method',
                                            coalesce((CASE WHEN count("ShopPaymentTransaction".*) > 1
                                                THEN 999
                                                ELSE (
                                                   SELECT "AX".payment_method
                                                   FROM app_shops_datas.dat_01hq0013_payment_transaction AS "AX"
                                                   WHERE "AX".shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
                                                     AND (canceled_payment_date IS NULL AND canceled_payment_by IS NULL AND payment_status = 1)
                                                   ORDER BY "AX".payment_paid_date DESC
                                                   LIMIT 1
                                                )
                                           END),0),
                                       'payment_price_paid', coalesce(sum("ShopPaymentTransaction".payment_price_paid),0)
                                   )
                            FROM app_shops_datas.dat_01hq0013_payment_transaction AS "ShopPaymentTransaction"
                            WHERE "ShopPaymentTransaction".shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
                                AND (canceled_payment_date IS NULL AND canceled_payment_by IS NULL AND payment_status = 1)
                        ), '{}'::jsonb) AS "PaymentInfo",
                        "ShopBusinessCustomer".id AS "ShopBusinessCustomer.id",
                        "ShopBusinessCustomer".master_customer_code_id AS "ShopBusinessCustomer.master_customer_code_id",
                        nullif(trim("ShopBusinessCustomer".customer_name->>'th'), '') AS "ShopBusinessCustomer.customer_name",
                        "ShopPersonalCustomer".id AS "ShopPersonalCustomer.id",
                        "ShopPersonalCustomer".master_customer_code_id AS "ShopPersonalCustomer.master_customer_code_id",
                        nullif(trim(coalesce("ShopPersonalCustomer".customer_name-> 'first_name'->> 'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name-> 'last_name'->> 'th', '')), '') AS "ShopPersonalCustomer.customer_name",
                        nullif(trim("ShopPersonalCustomer".customer_name->'first_name'->>'th'), '') AS "ShopPersonalCustomer.first_name",
                        nullif(trim("ShopPersonalCustomer".customer_name->'last_name'->>'th'), '') AS "ShopPersonalCustomer.last_name",
                        coalesce((SELECT jsonb_build_object('id', "x".id, 'user_name', "x".user_name) FROM systems.sysm_users AS "x" WHERE "x".id = "ShopCustomerDebtDoc".created_by), '{}'::jsonb) AS "CreatedBy",
                        coalesce((SELECT jsonb_build_object('id', "x".id, 'user_name', "x".user_name) FROM systems.sysm_users AS "x" WHERE "x".id = "ShopCustomerDebtDoc".updated_by), '{}'::jsonb) AS "UpdatedBy"
                    FROM app_shops_datas.dat_01hq0013_customer_debt_doc AS "ShopCustomerDebtDoc"
                    LEFT JOIN app_shops_datas.dat_01hq0013_business_customers AS "ShopBusinessCustomer" ON "ShopBusinessCustomer".id = "ShopCustomerDebtDoc".bus_customer_id
                    LEFT JOIN app_shops_datas.dat_01hq0013_personal_customers AS "ShopPersonalCustomer" ON "ShopPersonalCustomer".id = "ShopCustomerDebtDoc".per_customer_id
                        ${
                            (() => {
                                let queryWhereData = '';

                                // Filter by doc_date date range
                                if (doc_date_startDate && doc_date_endDate) {
                                    queryWhereData += `${queryWhereData.length > 0 ? 'AND': ''} ("ShopCustomerDebtDoc".doc_date BETWEEN '${doc_date_startDate}' AND '${doc_date_endDate}')`;
                                }
                                else {
                                    if (doc_date_startDate && !doc_date_endDate) {
                                        queryWhereData += `${queryWhereData.length > 0 ? 'AND': ''} ("ShopCustomerDebtDoc".doc_date >= '${doc_date_startDate}')`;
                                    }
                                    if (!doc_date_startDate && doc_date_endDate) {
                                        queryWhereData += `${queryWhereData.length > 0 ? 'AND': ''} ("ShopCustomerDebtDoc".doc_date <= '${doc_date_endDate}')`;
                                    }
                                }

                                // Filter by debt_due_date date range
                                if (debt_due_date_startDate && debt_due_date_endDate) {
                                    queryWhereData += `${queryWhereData.length > 0 ? 'AND': ''} ("ShopCustomerDebtDoc".debt_due_date BETWEEN '${debt_due_date_startDate}' AND '${debt_due_date_endDate}')`;
                                }
                                else {
                                    if (debt_due_date_startDate && !debt_due_date_endDate) {
                                        queryWhereData += `${queryWhereData.length > 0 ? 'AND': ''} ("ShopCustomerDebtDoc".debt_due_date >= '${debt_due_date_startDate}')`;
                                    }
                                    if (!debt_due_date_startDate && debt_due_date_endDate) {
                                        queryWhereData += `${queryWhereData.length > 0 ? 'AND': ''} ("ShopCustomerDebtDoc".debt_due_date <= '${debt_due_date_endDate}')`;
                                    }
                                }
                                
                                if (status) {
                                    queryWhereData += `${queryWhereData.length > 0 ? 'AND': ''} ("ShopCustomerDebtDoc".status IN (${fnGetQueryWhereStatusFromRequest(status)}))`;
                                }

                                if (payment_paid_status.length > 0) {
                                    queryWhereData += `${queryWhereData.length > 0 ? 'AND': ''} ("ShopCustomerDebtDoc".payment_paid_status IN (${payment_paid_status}))`;
                                }

                                // Filter by search text
                                if (search) {
                                    const searchRep = search.replace(/(\s|%)+/ig, '%');
                                    let queryWhereDataOR = '';
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''} "ShopCustomerDebtDoc".code_id iLIKE '${searchRep}'`;
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''} "ShopBusinessCustomer".master_customer_code_id iLIKE '${search}'`;
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''} nullif(trim("ShopBusinessCustomer".customer_name->>'th'), '') iLIKE '%${searchRep}%'`;
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''} "ShopPersonalCustomer".master_customer_code_id iLIKE '${searchRep}'`;
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''} nullif(trim(coalesce("ShopPersonalCustomer".customer_name-> 'first_name'->> 'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name-> 'last_name'->> 'th', '')), '') iLIKE '${searchRep}'`;
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''} nullif(trim("ShopPersonalCustomer".customer_name->'first_name'->>'th'), '') iLIKE '${searchRep}'`;
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''} nullif(trim("ShopPersonalCustomer".customer_name->'last_name'->>'th'), '') iLIKE '${searchRep}'`;
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''}
                                        "ShopCustomerDebtDoc".id IN (
                                            SELECT "ShopCustomerDebtList".shop_customer_debt_doc_id FROM app_shops_datas.dat_01hq0013_customer_debt_list AS "ShopCustomerDebtList"
                                            WHERE "ShopCustomerDebtList".shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
                                                AND ("ShopCustomerDebtList".shop_service_order_doc_id IN (
                                                        SELECT "ServiceOrderDoc".id
                                                        FROM app_shops_datas.dat_01hq0013_service_order_doc AS "ServiceOrderDoc"
                                                        WHERE "ServiceOrderDoc".id = "ShopCustomerDebtList".shop_service_order_doc_id
                                                          AND "ServiceOrderDoc".code_id iLIKE '%${searchRep}%'
                                                    ))
                                        )
                                    `;
                                    queryWhereDataOR += `${queryWhereDataOR.length > 0 ? 'OR': ''}
                                        "ShopCustomerDebtDoc".id IN (
                                            SELECT "ShopCustomerDebtList".shop_customer_debt_doc_id FROM app_shops_datas.dat_01hq0013_customer_debt_list AS "ShopCustomerDebtList"
                                            WHERE "ShopCustomerDebtList".shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
                                                AND ("ShopCustomerDebtList".shop_temporary_delivery_order_doc_id IN (
                                                        SELECT "TemporaryDeliveryOrderDoc".id
                                                        FROM app_shops_datas.dat_01hq0013_temporary_delivery_order_doc AS "TemporaryDeliveryOrderDoc"
                                                        WHERE "TemporaryDeliveryOrderDoc".id = "ShopCustomerDebtList".shop_temporary_delivery_order_doc_id
                                                          AND "TemporaryDeliveryOrderDoc".code_id iLIKE '%${searchRep}%'
                                                    ))
                                        )
                                    `;

                                    if (queryWhereDataOR.length > 0) {
                                        queryWhereData += ` AND (${queryWhereDataOR}) `;
                                    }
                                }
                                
                                if (queryWhereData.length > 0) {
                                    queryWhereData = 'WHERE' + queryWhereData;
                                }
                                
                                return queryWhereData;
                            })()
                        }
                    )
                    `
                        .replace(/(01hq0013)+/ig, curr)
                        .replace(/(\s)+/ig, ' ');
            }, ``);
        };
        const sqlQuery  = fnSqlQuery(table_names);
        const sqlQueryCount = `
            SELECT COUNT(*) AS "count"
            FROM (${sqlQuery}) AS "Doc"
        `;

        /** @typedef {object} IFindDocuments_ShopReportsCustomerDebt
         * @property {string} id
         * @property {string} shop_id
         * @property {string} code_id
         * @property {string} doc_date
         * @property {string|null} bus_customer_id
         * @property {string|null} per_customer_id
         * @property {null} debt_due_date
         * @property {number} price_grand_total
         * @property {string} debt_price_paid_total
         * @property {number} payment_paid_status
         * @property {number} status
         * @property {string} created_date
         * @property {string} created_by
         * @property {string|null} updated_date
         * @property {string|null} updated_by
         * @property {object?} PaymentInfo
         * @property {number} PaymentInfo.payment_method
         * @property {boolean} PaymentInfo.is_partial_payment
         * @property {number} PaymentInfo.payment_price_paid
         * @property {object?} ShopBusinessCustomer
         * @property {string|null} ShopBusinessCustomer.id
         * @property {string|null} ShopBusinessCustomer.master_customer_code_id
         * @property {string|null} ShopBusinessCustomer.customer_name
         * @property {object?} ShopPersonalCustomer
         * @property {string|null} ShopPersonalCustomer.id
         * @property {string|null} ShopPersonalCustomer.master_customer_code_id
         * @property {string|null} ShopPersonalCustomer.customer_name
         * @property {string|null} ShopPersonalCustomer.first_name
         * @property {string|null} ShopPersonalCustomer.last_name
         * @property {object} CreatedBy
         * @property {string} CreatedBy.id
         * @property {string} CreatedBy.user_name
         * @property {object?} UpdatedBy
         * @property {string|null} UpdatedBy.id
         * @property {string|null} UpdatedBy.user_name
         */

        /**
         * @type {IFindDocuments_ShopReportsCustomerDebt[]}
         */
        const findDocuments = await db.query(
            sqlQuery
            + ` ORDER BY ${sort} ${order}`
            + ` OFFSET ${(page - 1) * limit} LIMIT ${limit}`,
            {
                transaction: request?.transaction || options?.transaction || null,
                type: QueryTypes.SELECT,
                nest: true
            }
        );

        if (export_format === 'json') {
            /**
             * A number of count
             * @type {number}
             */
            const findDocuments_Count = Number((
                await db.query(
                    sqlQueryCount,
                    {
                        transaction: request?.transaction || options?.transaction || null,
                        type: QueryTypes.SELECT,
                        nest: true
                    }
                )
            )[0]?.count);

            const findResults = {
                currentPage: page,
                pages: Math.ceil(findDocuments_Count / limit),
                currentCount: findDocuments.length,
                totalCount: findDocuments_Count,
                data: findDocuments
            };

            await handleSaveLog(request, [[`${action} - ${export_format.toUpperCase()}`], '']);
            return utilSetFastifyResponseJson('success', findResults);
        }
        else if (export_format === 'xlsx') {
            const results = findDocuments;
            const data = [];
            if (results.length === 0) {
                data.push({
                    'เลขที่เอกสาร': null,
                    'วันที่เอกสาร': null,
                    'ชื่อลูกค้า': null,
                    'จำนวนหนี้ทั้งหมด': null,
                    'จำนวนหนี้ชำระแล้ว': null,
                    'จำนวนหนี้คงเหลือ': null,
                    'สถานะชำระเงิน': null,
                    'ประเภทการชำระ': null
                });
            }
            else {
                for (let index = 0; index < results.length; index++) {
                    const element = results[index];
                    data.push({
                        'เลขที่เอกสาร': element?.code_id || '',
                        'วันที่เอกสาร': element?.doc_date || '',
                        'ชื่อลูกค้า': element.ShopBusinessCustomer?.customer_name
                            || element.ShopPersonalCustomer?.customer_name
                            || '',
                        'จำนวนหนี้ทั้งหมด': Number(element?.price_grand_total),
                        'จำนวนหนี้ที่ต้องชำระ': Number(element?.debt_price_paid_total),
                        'จำนวนหนี้ชำระแล้ว': element.payment_paid_status === 0 ? 0 : Number(element?.PaymentInfo.payment_price_paid),
                        'จำนวนหนี้คงเหลือ': element.payment_paid_status === 0 ? 0 : Number(element?.debt_price_paid_total) - Number(element?.PaymentInfo.payment_price_paid),
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
                                                :'ไม่ทราบสถานะชำระเงิน',
                        'ประเภทการชำระ': {'0': '', '1': 'เงินสด', '2': 'บัตรเครดิต', '3': 'เงินโอน', '999': 'Partial Payment' }[element?.PaymentInfo?.payment_method || '0'],
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
                        top:{
                            style: "thin",
                            color: "000000"
                        },
                        bottom:{
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
                            top:{
                                style: "thin",
                                color: "000000"
                            },
                            bottom:{
                                style: "thin",
                                color: "000000"
                            }
                        }
                    }
                }
                // Set Column to Number of Currency
                if ([3, 4, 5, 6].includes(cell.c)) {
                    ws[objectI].z = '##,##,##0.00'
                }
            }

            ws["!ref"] = `A1:H${results.length + 2}`

            // Foot Column: TEXT(รวม)
            const footColumn_SUMtext = 'C';
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
            const footColumn_SUMmoney = 'D';
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
            const footColumn_SUMdiscount = 'E';
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
            const footColumn_SUMamount = 'F';
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
            // Foot Column: SUM(ราคาสุทธิ)
            const footColumn_SUMamount_2 = 'G';
            ws[`${footColumn_SUMamount_2}${results.length + 2}`] = {
                t: 'n', z: '##,##,##0.00', v: 0, f: `=SUM(${footColumn_SUMamount_2}1:${footColumn_SUMamount_2}${(parseInt(results.length) + 1)})`, s: {
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

            ws['!cols'] = [
                { width: 24 }, // Col: A
                { width: 20 }, // Col: B
                { width: 17 }, // Col: C
                { width: 20 }, // Col: D
                { width: 20 }, // Col: E
                { width: 20 }, // Col: F
                { width: 20 }, // Col: G
                { width: 22 }, // Col: H
            ];

            const file_name = uuid4() + '___รายงานลูกหนี้การค้า';

            let wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

            await handleSaveLog(request, [[`${action} - ${export_format.toUpperCase()}`, '', `${file_name}.xlsx`], '']);

            return utilSetFastifyResponseJson('success', `${file_name}.xlsx`);
        }
        else {
            await handleSaveLog(request, [[`${action} - ${export_format?.toUpperCase()}`], '']);
            return utilSetFastifyResponseJson('success', 'ok');
        }

    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);
        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopReportsCustomerDebt;