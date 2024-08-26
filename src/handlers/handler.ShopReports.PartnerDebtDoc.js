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
const serviceShopPartnerDebtDoc = async (request = {}, table_name = []) => {
    if (!_.isArray(table_name) && !_.isString(table_name)) { throw Error('Require parameter @table_name'); }
    _.isString(table_name) ? table_name = [table_name] : [];

    const transaction = request?.transaction || null;


    const search = (request.query.search || '').replace(/\s+/g, '%');
    const start_date = request.query.start_date || '';
    const end_date = request.query.end_date || '';

    const payment_paid_status = request.query?.payment_paid_status.split(',').length > 0 ? request.query.payment_paid_status.split(',').map(w => Number(w)) : [];
    const payment_type = request.query?.payment_type?.split(',').length > 0 ? request.query.payment_type.split(',').map(w => Number(w)) : [];
    const status = request.query?.status?.split(',').length > 0 ? request.query.status.split(',').map(w => Number(w)) : [1, 2];

    const payment_paid_date__startDate = request.query?.payment_paid_date__startDate || '';
    const payment_paid_date__endDate = request.query?.payment_paid_date__endDate || '';


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

        /**
         * @type {string[]}
         */
        const whereSearch = [];
        whereSearch.push(`(CTE_UNION.code_id ILIKE :search)`);
        whereSearch.push(`(CTE_UNION.doc_date::text ILIKE :search)`);
        whereSearch.push(`(CTE_UNION.price_grand_total::text ILIKE :search)`);
        whereSearch.push(`(CTE_UNION.debt_due_date::text ILIKE :search)`);


        whereSearch.push(`(CTE_UNION."BusinessPartner"->'partner_name'->>'th' ILIKE :search)`);
        if (/^[0-9]+$/.test(search)) {
            whereSearch.push(`(REGEXP_REPLACE(CTE_UNION."BusinessPartner"->>'tax_id', '[^0-9]', '', 'g') LIKE :search)`);
        }

        whereSearch.push(`(CTE_UNION."ShopsPartnerDebtList"->>'price_grand_total' ILIKE :search)`);
        whereSearch.push(`(CTE_UNION."ShopsPartnerDebtList"->>'code_id' ILIKE :search)`);
        whereSearch.push(`(CTE_UNION."ShopsPartnerDebtList"->>'doc_date' ILIKE :search)`);


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
    if (start_date && end_date) {
        whereConditions.push(`((CTE_UNION.doc_date)::date BETWEEN :start_date AND :end_date)`);

    }
    if (payment_paid_date__startDate && payment_paid_date__endDate) {

        whereConditions.push(`((CTE_UNION.payment_paid_date)::date BETWEEN :payment_paid_date__startDate AND :payment_paid_date__endDate)`);

    }

    let sqlQuery = `
        WITH
            ${table_name.reduce((prev, curr, idx) => {
        if (idx > 0) {
            prev = prev + `,`;
        }

        return prev + `
                CTE_01hq0004 AS (
                    select 
                    doc.code_id,
                    doc.doc_date,
                    doc.created_date,
                    doc.price_grand_total,
                    doc.debt_due_date,
                    coalesce((
                        SELECT
                            CASE
                                WHEN "pay".is_partial_payment = True
                                THEN 999
                                ELSE "pay".payment_method
                            END
                        FROM app_shops_datas.dat_01hq0004_payment_transaction AS "pay"
                        WHERE "pay".shop_partner_debt_doc_id = "doc".id
                          AND ("pay".canceled_payment_by IS NULL OR "pay".canceled_payment_date IS NULL)
                        ORDER BY "pay".payment_paid_date DESC
                        LIMIT 1
                    ), 0) AS payment_type,
                     (
                        SELECT
                            "pay".payment_paid_date
                        FROM app_shops_datas.dat_01hq0004_payment_transaction AS "pay"
                        WHERE "pay".shop_partner_debt_doc_id = "doc".id
                        ORDER BY "pay".payment_paid_date DESC
                        LIMIT 1
                    ) AS payment_paid_date,
                    doc.payment_paid_status,
                    doc.details,
                    json_build_object(
                        'id',pr.id, 
                        'tax_id',pr.tax_id,
                        'partner_name',pr.partner_name
                    ) "BusinessPartner",
                    json_build_object(
                        'id',sh.id, 
                        'shop_code_id',sh.shop_code_id,
                        'shop_name',sh.shop_name
                    ) "ShopsProfile",
                        json_build_object(
                        'id',list.id, 
                        'price_grand_total',list.price_grand_total,
                        'code_id',
                            (
                                CASE
                                    when inven.id is not null then inven.code_id
                                    when cn.id is not null then cn.code_id
                                    when dn.id is not null then dn.code_id
                                END
                            ),
                        'doc_date',
                            (
                                CASE
                                    when inven.id is not null then inven.doc_date
                                    when cn.id is not null then cn.doc_date
                                    when dn.id is not null then dn.doc_date
                                END
                            )
                    ) "ShopsPartnerDebtList"
                    from app_shops_datas.dat_01hq0004_partner_debt_list list
                    left join app_shops_datas.dat_01hq0004_partner_debt_doc doc on doc.id = list.shop_partner_debt_doc_id
                    left join app_datas.dat_shops_profiles sh on sh.id = doc.shop_id
                    left join app_shops_datas.dat_01hq0004_business_partners pr on pr.id = doc.bus_partner_id
                    left join app_shops_datas.dat_01hq0004_inventory_transaction_doc inven on inven.id = list.shop_inventory_transaction_id
                    left join app_shops_datas.dat_01hq0004_partner_debt_dn_doc dn on dn.id = list.shop_partner_debt_dn_doc_id
                    left join app_shops_datas.dat_01hq0004_partner_debt_cn_doc cn on cn.id = list.shop_partner_debt_cn_doc_id
                    WHERE list.status = 1
                    AND doc.status IN (${status}) 
                    ${payment_paid_status.length > 0 ? `AND 
                            ((
                            CASE
                                WHEN doc.payment_paid_status = 5
                                THEN (CASE WHEN
                                        doc.debt_price_amount_total -
                                        coalesce((
                                            SELECT debt_price_paid_grand_total
                                            FROM (
                                                    SELECT
                                                        shop_partner_debt_doc_id,
                                                        sum(debt_price_paid_total + debt_price_paid_adjust)::numeric(20,2) AS debt_price_paid_grand_total
                                                    FROM app_shops_datas.dat_01hq0004_partner_debt_list AS list
                                                    WHERE list.shop_partner_debt_doc_id = (SELECT x.id FROM app_shops_datas.dat_01hq0004_customer_debt_doc AS x WHERE x.id = list.shop_partner_debt_doc_id AND x.status = 1 AND x.payment_paid_status = 3)
                                                    GROUP BY shop_partner_debt_doc_id
                                                    ) AS u
                                            WHERE u.shop_partner_debt_doc_id = doc.id
                                        ),0) = 0
                                        THEN 3
                                        ELSE doc.payment_paid_status
                                    END)
                                ELSE doc.payment_paid_status
                            END
                        )
                        IN (${payment_paid_status.map(w => `${w}`)}))` : ''}
                    ${payment_type.length > 0 ? `AND (
                        coalesce((
                            SELECT
                                CASE
                                    WHEN pay.is_partial_payment = True
                                    THEN 999
                                    ELSE pay.payment_method
                                END
                            FROM app_shops_datas.dat_01hq0004_payment_transaction AS pay
                            WHERE pay.shop_partner_debt_doc_id = doc.id
                                AND (pay.canceled_payment_by IS NULL OR pay.canceled_payment_date IS NULL)
                            ORDER BY pay.payment_paid_date DESC
                            LIMIT 1
                        ), 0)
                    IN (${payment_type.map(w => `${w}`)}))` : ''}
                )
                `.replace(/(_01hq0004)/ig, `_${curr}`);
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

    const queryResult__Data = await db.query(
        sqlQuery + `
        SELECT *
        FROM CTE_UNION
            ${whereConditions.reduce((prev, curr, idx, arr) => {
            if (arr.length > 0 && idx === 0) {
                prev = prev + `WHERE `;
            }
            if (idx > 0) {
                prev = prev + `\n AND `;
            }

            return prev + curr;
        }, ``)}
       
        ORDER BY 
        doc_date DESC, 
        created_date DESC, 
        code_id DESC
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




    if (export_format === 'xlsx') {

        const results = queryResult__Data;
        const data = [];
        if (results.length === 0) {
            data.push({
                'เลขที่เอกสาร': null,
                'วันที่เอกสาร': null,
                'ชื่อผู้จำหน่าย': null,
                'ยอดรวมทั้งหมด': null,
                'วันกำหนดชำระ': null,
                'วิธีรับชำระ': null,
                'วันรับชำระ': null,
                'หมายเหตุ': null,
                'หมายเหตุใน': null,
                'เลขที่เอกสารในรายการ': null,
                'วันที่เอกสารในรายการ': null,
                'ยอดรวมในรายการ': null,
            });
        } else {
            for (let index = 0; index < results.length; index++) {
                const element = results[index];
                data.push({
                    'เลขที่เอกสาร': element.code_id || '',
                    'วันที่เอกสาร': element.doc_date || '',
                    'ชื่อผู้จำหน่าย': element?.BusinessPartner?.partner_name.th || '',
                    'ยอดรวมทั้งหมด': Number(element.price_grand_total) || 0,
                    'วันกำหนดชำระ': element.debt_due_date || '',
                    'วิธีรับชำระ': { '0': '', '1': 'เงินสด', '2': 'บัตรเครดิต', '3': 'เงินโอน', '4': 'เช็คเงินสด', '5': 'บันทึกเป็นลูกหนี้การค้า', '999': 'Partial Payment' }[element?.payment_type || '0'] || '',
                    'หมายเหตุ': element.details?.remark || '',
                    'หมายเหตุใน': element.details?.remark_inside || '',
                    'เลขที่เอกสารในรายการ': element?.ShopsPartnerDebtList?.code_id,
                    'วันที่เอกสารในรายการ': element?.ShopsPartnerDebtList?.doc_date,
                    'ยอดรวมในรายการ': Number(element?.ShopsPartnerDebtList?.price_grand_total) || 0,

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
            if ([3, 10].includes(cell.c)) {
                ws[objectI].z = '##,##,##0.00'
            }
            if ([12].includes(cell.c)) {
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

        ws["!ref"] = `A1:Y${results.length + 2}`


        // Foot Column: TEXT(รวม)

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
        ];

        ws['!cols'] = wscols;

        const file_name = uuid4() + '___รายงานขาย';

        let wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

        await handleSaveLog(request, [['get ShopPartnerDebtDoc report' + ' - report ', '', file_name], ''])

        return file_name + '.xlsx';


    }

    const queryResult__Count = await db.query(
        sqlQuery + `
        SELECT count(*)
        FROM CTE_UNION
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


const handlerShopPartnerDebtDoc = async (request, reply) => {
    const handlerName = 'GET ShopPartnerDebtDoc Report';

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

        const result = await serviceShopPartnerDebtDoc(request, table_name);

        await handleSaveLog(request, [[handlerName], '']);

        return utilSetFastifyResponseJson('success', result);
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], error]);

        throw error;
    }
};


module.exports = handlerShopPartnerDebtDoc;
