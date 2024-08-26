const _ = require("lodash");
const moment = require("moment");
const XLSX = require('xlsx-js-style');
const { Op, QueryTypes } = require("sequelize");
const { v4: uuid4 } = require("uuid");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const sequelize = require('../db');
const Product = require("../models/model").Product;
const modelShopProduct = require('../models/model').ShopProduct;
const modelShopInventory = require("../models/model").ShopInventory;
const modelShopBusinessPartners = require("../models/model").ShopBusinessPartners
const modelShopInventoryTransaction = require("../models/model").ShopInventoryTransaction;


const fnStringTimeThaiToDateTimeBangkok = (inputString = '') => {
    const momentFormat = 'YYYY-MM-DD';

    if (moment(inputString, momentFormat).isValid()) {
        return moment(`${inputString}T00:00:00+07:00`).toDate();
    }

    return moment().toDate();
};


/**
 * @returns {Promise<string|Awaited<import("../types/type.Handler.ShopReportSaleOut.Function.serviceShopReportInventory").IserviceShopReportInventory>[]>}
 */
const serviceShopReportInventory = async (request, table_name = '') => {
    if (!_.isArray(table_name) && !_.isString(table_name)) { throw Error('Require parameter @table_name'); }
    _.isString(table_name) ? table_name = [table_name] : [];


    const search = request.query.search;
    const split_shop_business_partner_ids = request.query.filter_shop_business_partner_ids
        ? request.query.filter_shop_business_partner_ids
            .replace(/\s/g, '')
            .split(',')
        : [];
    const filter_shop_business_partner_ids = _.isArray(split_shop_business_partner_ids)
        ? split_shop_business_partner_ids.length > 0
            ? split_shop_business_partner_ids
            : []
        : [];
    let sort = request.query.sort;
    let order = request.query.order;
    const start_date = request.query.start_date || '2000-01-01';
    const end_date = request.query.end_date || '3000-12-31';
    const export_format = request.query.export_format;
    let doc_type_id = request.query.doc_type_id || 'ad06eaab-6c5a-4649-aef8-767b745fab47'
    const shop_product_id = request.query?.shop_product_id || null;

    let doc_id_arr = [
        {
            id: 'c0a7ac25-24db-44fd-ac78-8b6a3edcbcad',
            name: 'ใบส่งคืนสินค้า',
            field: 'ผู้จำหน่าย',
            query: `"ShopBusinessPartners".partner_name->>'th'`
        },
        {
            id: 'dfa5a7ed-4f01-41bd-894f-cd28d1068ad0',
            name: 'ใบรับคืนสินค้า',
            field: 'ลูกต้า',
            query: `
                 case
                    when "ShopInventoryTransaction".details->>'customer_type' = 'personal'
                    then (
                            select concat(customer_name->'first_name'->>'th',' ',customer_name->'last_name'->>'th') 
                            from app_shops_datas.dat_01hq0010_personal_customers 
                            where id = ("ShopInventoryTransaction".details->>'customer_id')::uuid
                        )
                    else (
                            select customer_name->>'th' 
                            from app_shops_datas.dat_01hq0010_business_customers 
                            where id = ("ShopInventoryTransaction".details->>'customer_id')::uuid
                        )
                end
                    `
        },
        {
            id: '53e7cbcc-3443-40e5-962f-d9512aba2b5a',
            name: 'ใบโอนสินค้าระหว่างสาขา',
            field: 'สาขาปลายทาง',
            query: `
                    select shop_name->>'th' 
                    from app_datas.dat_shops_profiles
                    where id = ("ShopInventoryTransaction".details->>'destination_branch')::uuid
                `
        },
        {
            id: '4979e859-92d1-4485-9243-45cdd505adb8',
            name: 'ใบรับโอนสินค้าระหว่างสาขา',
            field: 'สาขาต้นทาง',
            query: `
                    select shop_name->>'th' 
                    from app_datas.dat_shops_profiles
                    where id = ("ShopInventoryTransaction".details->>'shop_sender_id')::uuid
                `
        }
    ]

    let query_dynamic = null
    if (request.query.doc_type_id) {
        query_dynamic = doc_id_arr.filter(el => { return el.id == doc_type_id })
        if (query_dynamic.length > 0) {
            query_dynamic = query_dynamic[0]
        } else {
            query_dynamic = null
        }

    }

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



    let sqlQuery = `
        WITH
            ${table_name.reduce((prev, curr, idx) => {
        if (idx > 0) {
            prev = prev + `,`;
        }
        return prev + `
                CTE_01hq0010 AS (
                    select 
                        coalesce("ShopProfile".shop_name->>'shop_local_name',"ShopProfile".shop_name->>'th') "สาขา",
                        "ShopInventoryTransaction".code_id "เลขที่เอกสาร",
                        row_number() OVER (ORDER BY "ShopInventory".created_date desc)  "RunningNo",
                        cast("ShopInventoryTransaction".doc_date as date) "วันที่อ้างอิง",
                        "ShopInventoryTransaction".details->>'References_doc' "เอกสารอ้างอิง",
                        ${(query_dynamic) ? `(${query_dynamic.query}) "${query_dynamic.field}",` :
                `"ShopBusinessPartners".partner_name->>'th' "ชื่อผู้จำหน่าย",`}
                        "Product".master_path_code_id  "รหัสสินค้า",
                        "Product".product_name->>'th' "สินค้า",
                        "ShopInventory".warehouse_detail->0->'shelf'->>'dot_mfd' "DOT",
                        cast(amount as int) "จำนวน'",
                        (select type_name->>'th' from master_lookup.mas_tax_types where id = ("ShopInventoryTransaction".details->>'tax_type')::uuid ) "ประเภทภาษี",
                        cast("ShopInventory".details->>'discount_thb' as float) "ส่วนลด",
                        ( 
                            CASE
                                WHEN ("ShopInventory".details->>'discount_thb' IS NULL OR "ShopInventory".details->>'discount_thb' = '' OR "ShopInventory".details->>'discount_thb' = 'null' ) THEN 0
                                ELSE cast("ShopInventory".details->>'discount_thb' as float)
                            END ) "ส่วนลด",
                        (
                            CASE
                                WHEN ("ShopInventory".details->>'price' IS NULL OR "ShopInventory".details->>'price' = '' OR "ShopInventory".details->>'price' = 'null' ) THEN 0
                                ELSE ("ShopInventory".details->>'price')::float
                            END ) "ราคาต่อชิ้น",
                       ( 
                            CASE
                                WHEN ("ShopInventory".details->>'total_price' IS NULL OR "ShopInventory".details->>'total_price' = '' OR "ShopInventory".details->>'total_price' = 'null' ) THEN 0
                                ELSE cast("ShopInventory".details->>'total_price' as float)
                            END ) "ราคาสุทธิ",
                       (
                            CASE
                                WHEN "ShopInventoryTransaction".details->>'net_price' IS NOT NULL  THEN cast("ShopInventoryTransaction".details->>'net_price' as float)
                                ELSE  cast("ShopInventoryTransaction".details->>'price_grand_total' as float)
                            END ) "ยอดบิล",
                        "ShopInventoryTransaction".details->>'note' "หมายเหตุ",
                        "ShopInventoryTransaction".created_date "วันที่สร้างเอกสาร",
                        (case 
                            when "ShopInventoryTransaction".status != 0 then 'ใช้งาน'
                            else 'ยกเลิก'
                        end ) "สถานะเอกสาร"
                    from app_shops_datas.dat_01hq0010_inventory_management_logs "ShopInventory"
                    left join app_shops_datas.dat_01hq0010_inventory_transaction_doc "ShopInventoryTransaction" on "ShopInventoryTransaction".id = "ShopInventory".doc_inventory_id
                    left join app_shops_datas.dat_01hq0010_products "ShopProduct" on "ShopProduct".id =  "ShopInventory".product_id
                    left join app_datas.dat_products "Product" on "ShopProduct".product_id =  "Product".id
                    left join app_shops_datas.dat_01hq0010_business_partners "ShopBusinessPartners" on "ShopBusinessPartners".id = "ShopInventoryTransaction".bus_partner_id
                    left join app_datas.dat_shops_profiles "ShopProfile" on "ShopProfile".id = "ShopInventoryTransaction".shop_id
                    where 
                        "ShopInventory".status != 0 and
                        ( 
                            "ShopInventoryTransaction".doc_date between '${start_date}' and '${end_date}'
                        ) and
                        ( 
                            "ShopInventoryTransaction".doc_type_id  = '${doc_type_id}'
                        ) and
                        (
                            "ShopInventoryTransaction".code_id ilike '%${search}%' or
                            "Product".product_name->>'th' ilike '%${search}%' or
                            "Product".master_path_code_id ilike '%${search}%' or
                            "ShopBusinessPartners".partner_name->>'th' ilike '%${search}%' or
                            "ShopInventoryTransaction".details->>'References_doc' ilike '%${search}%'
                        )
                        ${(filter_shop_business_partner_ids.length > 0) ? `and "ShopBusinessPartners".id in (${filter_shop_business_partner_ids.map(el => "'" + el + "'")})` : ``}
                        ${(shop_product_id) ? `and "ShopProduct".id = '${shop_product_id}'` : ``}
                                    
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


    const results = await db.query(
        sqlQuery + `
        SELECT *
        FROM CTE_UNION
        ORDER BY CTE_UNION."${sort}" ${order}
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
        `.replace(/(\s)+/ig, ' '),
        {
            type: QueryTypes.SELECT
        }
    );


    if (export_format === 'xlsx') {
        const data = results.map(el => { return el });

        let ws = await XLSX.utils.json_to_sheet(data, { origin: 0 });

        for (let objectI in ws) {
            if (typeof (ws[objectI]) != "object") continue;
            let cell = XLSX.utils.decode_cell(objectI);
            ws[objectI].s = { // styling for all cells
                font: {
                    name: "TH SarabunPSK",
                    sz: 16,
                }
            }
            if ([11, 12, 13, 14].includes(cell.c)) {
                ws[objectI].z = '##,##,##0.00'
                ws[objectI].s = {
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16
                    },
                    alignment: {
                        horizontal: "right",
                    },
                }
            }
            if (cell.r === 0) {
                ws[objectI].s = { // styling for all cells
                    font: {
                        name: "TH SarabunPSK",
                        sz: 16,
                        bold: true
                    }
                }
            }
        }

        ws["!ref"] = `A1:S${results.length + 2}`

        ws[`K${results.length + 2}`] = {
            t: 's',
            v: 'รวม ',
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
        const Col_H = 'L';
        ws[`${Col_H}${results.length + 2}`] = {
            t: 'n',
            z: '##,##,##0.00',
            v: 0,
            f: `=SUM(${Col_H}2:${Col_H}${(parseInt(results.length) + 1)})`,
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
        const Col_I = 'M';
        ws[`${Col_I}${results.length + 2}`] = {
            t: 'n',
            z: '##,##,##0.00',
            v: 0,
            f: `=SUM(${Col_I}2:${Col_I}${(parseInt(results.length) + 1)})`,
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
        const Col_J = 'N';
        ws[`${Col_J}${results.length + 2}`] = {
            t: 'n',
            z: '##,##,##0.00',
            v: 0,
            f: `=SUM(${Col_J}2:${Col_J}${(parseInt(results.length) + 1)})`,
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
        const Col_N = 'O';
        ws[`${Col_N}${results.length + 2}`] = {
            t: 'n',
            z: '##,##,##0.00',
            v: 0,
            f: `=SUM(${Col_N}2:${Col_N}${(parseInt(results.length) + 1)})`,
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
            { width: 22 }, // K
            { width: 23 }, // A
            { width: 17 }, // B
            { width: 17 }, // B
            { width: 23 }, // C
            { width: 30 }, // D
            { width: 17 }, // B
            { width: 40 }, // E
            { width: 20 }, // F
            { width: 15 }, // G
            { width: 17 }, // H
            { width: 22 }, // I
            { width: 22 }, // J
            { width: 22 }, // K
            { width: 22 }, // K
            { width: 22 }, // K
            { width: 22 }, // K
            { width: 22 }, // K
            { width: 22 }, // K

        ];

        ws['!cols'] = wscols;


        if (query_dynamic) {
            file_name_str = query_dynamic.name
        } else {
            file_name_str = 'การซื้อ'
        }

        const file_name = uuid4() + '___รายงาน' + file_name_str;

        let wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

        await handleSaveLog(request, [['get ShopReportsInventory report' + ' - report ', '', file_name], ''])

        return file_name + '.xlsx';
    }


    let length_data = await db.query(
        sqlQuery + `
        SELECT count(*)
        FROM CTE_UNION
        `.replace(/(\s)+/ig, ' '),
        {
            type: QueryTypes.SELECT
        }
    );

    length_data = length_data[0].count

    const pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: results.length,
        totalCount: +(length_data),
        data: results
    };

    return pag;
};


const handlerShopReportsInventory = async (request, reply) => {
    const handlerName = 'get ShopReportsInventory report';

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

        const result = await serviceShopReportInventory(request, table_name);

        await handleSaveLog(request, [[handlerName], '']);

        return utilSetFastifyResponseJson('success', result);
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopReportsInventory;
