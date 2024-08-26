const XLSX = require('xlsx-js-style');
const { QueryTypes } = require("sequelize");
const { v4: uuid4 } = require("uuid");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require('../db');
const { isUUID } = require("../utils/generate");


const handlerShopReportsInventory = async (request, reply, options = {}) => {
    const handlerName = 'GET ShopReports.Inventory';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request, 'select_shop_ids');
        /**
         * @type {string[]}
         */
        const table_names = findShopsProfile.map(element => (element.shop_code_id));
        /**
         * @type {string[]}
         */
        const select_shop_ids = findShopsProfile.map(element => (element.id));

        const search = request.query?.search || '';
        const limit = request.query?.limit || 10;
        const page = request.query?.page || 1;
        const sort = request.query?.sort || 'code_id';
        const order = request.query?.order || 'asc';

        const export_format = request.query?.export_format || 'json';

        const doc_date_startDate = request.query?.doc_date_startDate || null;
        const doc_date_endDate = request.query?.doc_date_endDate || null;

        const shop_product_id = request.query?.shop_product_id || null;


        const arrStrFilter__status = [1];

        const arrStrFilter__shop_business_partner_id = (request.query?.arrStrFilter__shop_business_partner_id || '')
            .replace(/\s/ig, '')
            .split(',')
            .filter(w => isUUID(w));

        const queryShops = table_names.map(table_name => {
            let whereQueryDocDate_ShopInventoryImportDoc = ``;
            if (doc_date_startDate && doc_date_endDate) {
                whereQueryDocDate_ShopInventoryImportDoc += `
                    AND (z.doc_date BETWEEN :doc_date_startDate AND :doc_date_endDate)
                `;
            }

            let whereQueryBusPartner_ShopInventoryImportDoc = ``;
            if (arrStrFilter__shop_business_partner_id.length > 0) {
                whereQueryBusPartner_ShopInventoryImportDoc += `
                    AND (z.bus_partner_id IN (:arrStrFilter__shop_business_partner_id))
                `;
            }

            let whereQueryProduct_id = ``;
            if (shop_product_id) {
                whereQueryProduct_id += `
                    AND ("ShopInventoryImportList".product_id = :shop_product_id)
                `;
            }

            return `
                CTE_ShopInventoryImportDoc_01hq0017 AS (
                    SELECT
                        "ShopInventoryImportDoc".shop_id,
                        "ShopInventoryImportList".id AS doc_inventory_import_list_id,
                        "ShopInventoryImportList".doc_inventory_id AS doc_inventory_import_doc_id,
                        "ShopInventoryImportDoc".bus_partner_id,
                        "ShopInventoryImportList".product_id AS shop_product_id,
                        (SELECT x.product_id FROM app_shops_datas.dat_01hq0017_products AS x WHERE x.id = "ShopInventoryImportList".product_id) AS product_id,
                        "ShopInventoryImportDoc".shop_name,
                        "ShopInventoryImportDoc".code_id,
                        "ShopInventoryImportDoc".doc_date,
                        "ShopInventoryImportDoc".ref_doc,
                        "ShopInventoryImportDoc".partner_name,
                        "ShopInventoryImportDoc".tax_type_name,
                        (SELECT x.master_path_code_id FROM app_datas.dat_products AS x WHERE x.id = (SELECT y.product_id FROM app_shops_datas.dat_01hq0017_products AS y WHERE y.id = "ShopInventoryImportList".product_id)) AS master_path_code_id,
                        (SELECT x.product_name->>'th' FROM app_datas.dat_products AS x WHERE x.id = (SELECT y.product_id FROM app_shops_datas.dat_01hq0017_products AS y WHERE y.id = "ShopInventoryImportList".product_id)) AS product_name,
                        "ShopInventoryImportList".amount,
                        (coalesce(nullif(nullif(nullif("ShopInventoryImportList".details->>'discount_thb', ''), 'undefined'), 'null'), '0'))::numeric(20,2) AS price_discount_total,
                        (coalesce(nullif(nullif(nullif("ShopInventoryImportList".details->>'price', ''), 'undefined'), 'null'), '0'))::numeric(20,2) AS price_unit,
                        (coalesce(nullif(nullif(nullif("ShopInventoryImportList".details->>'total_price', ''), 'undefined'), 'null'), '0'))::numeric(20,2) AS price_grand_total,
                        (coalesce(
                            "ShopInventoryImportList".details->>'price_grand_total',
                            (
                                (
                                    (coalesce(("ShopInventoryImportList".details->>'total_price'), '0'))::float
                                        - (coalesce(("ShopInventoryImportList".details->>'discount_thb'), '0'))::float
                                )::float
                            )::text
                    )::numeric(20,2) / "ShopInventoryImportList".amount)::numeric(20,2) product_cost,
                        "ShopInventoryImportDoc".status
                    FROM app_shops_datas.dat_01hq0017_inventory_management_logs AS "ShopInventoryImportList"
                        JOIN (
                            SELECT
                                z.shop_id,
                                z.id,
                                z.code_id,
                                z.doc_date,
                                nullif(nullif(z.details->>'References_doc', 'undefined'), 'null') AS ref_doc,
                                z.bus_partner_id,
                                (SELECT x.partner_name->>'th' FROM app_shops_datas.dat_01hq0017_business_partners AS x WHERE x.id = z.bus_partner_id) AS partner_name,
                                (SELECT x.type_name->>'th' FROM master_lookup.mas_tax_types AS x WHERE x.id = (z.details->>'tax_type')::uuid) AS tax_type_name,
                                (SELECT coalesce(shop_name->>'shop_local_name', shop_name->>'th') FROM app_datas.dat_shops_profiles AS x WHERE x.id = z.shop_id) AS shop_name,
                                z.status
                            FROM app_shops_datas.dat_01hq0017_inventory_transaction_doc AS z
                            WHERE z.doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47'
                                AND z.status = 1
                                ${whereQueryBusPartner_ShopInventoryImportDoc}
                                ${whereQueryDocDate_ShopInventoryImportDoc}
                        ) AS "ShopInventoryImportDoc" ON "ShopInventoryImportDoc".id = "ShopInventoryImportList".doc_inventory_id
                    WHERE "ShopInventoryImportList".status = 1
                    ${whereQueryProduct_id}
                )
            `.replace(/(01hq0017)/ig, table_name)
        });

        const queryString = `
            WITH
                ${queryShops},
                CTE_UNION AS (
                    ${table_names.reduce((prev, curr, idx) => {
            if (idx > 0) {
                prev = prev + `
                                UNION ALL
                            `;
            }
            return prev + `
                            (
                                SELECT * FROM CTE_ShopInventoryImportDoc_01hq0017
                                ${!search
                    ? ``
                    : `
                                        WHERE (
                                            code_id LIKE :search
                                            OR ref_doc LIKE :search
                                            OR partner_name LIKE :search
                                            OR product_name LIKE :search
                                            OR master_path_code_id LIKE :search
                                        )
                                    `
                }
                            )
                        `.replace(/(01hq0017)/ig, curr);
        }, '')}
                )
        `;

        const queryResult__Data = await db.query(`
                ${queryString}
                SELECT CTE_UNION.* 
                FROM CTE_UNION
                ORDER BY 
                    ${select_shop_ids.map(ele => (`shop_id = '${ele}' DESC`))},
                    ${sort} ${order}
                ${export_format === 'xlsx' ? '' : 'LIMIT :limit OFFSET :offset'}
                ;
            `.replace(/\s+/g, ' '),
            {
                type: QueryTypes.SELECT,
                nest: true,
                replacements: {
                    search: `%${search}%`.replace(/\s/ig, ' ').replace(/\s/ig, '%').replace(/%+/ig, '%'),
                    doc_date_startDate,
                    doc_date_endDate,
                    arrStrFilter__shop_business_partner_id,
                    limit,
                    shop_product_id: shop_product_id,
                    offset: limit * (page - 1)
                }
            }
        );

        if (export_format === 'xlsx') {
            const results = queryResult__Data;
            const data = [];
            if (results.length === 0) {
                data.push({
                    'ชื่อร้านภายใน': null,
                    'เลขที่เอกสาร': null,
                    'วันที่อ้างอิง': null,
                    'เอกสารอ้างอิง': null,
                    'ชื่อผู้จำหน่าย': null,
                    'รหัสสินค้า': null,
                    'ชื่อสินค้า': null,
                    'จำนวน': null,
                    'ประเภทภาษี': null,
                    'ส่วนลด': null,
                    'ราคาต่อชิ้น': null,
                    'ราคาสุทธิ': null
                });
            } else {
                for (let index = 0; index < results.length; index++) {
                    const element = results[index];
                    data.push({
                        'ชื่อร้านภายใน': element?.shop_name || '',
                        'เลขที่เอกสาร': element?.code_id || '',
                        'วันที่อ้างอิง': element?.doc_date || '',
                        'เอกสารอ้างอิง': element?.ref_doc || '',
                        'ชื่อผู้จำหน่าย': element?.partner_name || '',
                        'รหัสสินค้า': element?.master_path_code_id || '',
                        'ชื่อสินค้า': element?.product_name || '',
                        'จำนวน': Number(element?.amount || '0.00'),
                        'ประเภทภาษี': element?.tax_type_name || '',
                        'ส่วนลด': Number(element?.price_discount_total || '0.00'),
                        'ราคาต่อชิ้น': Number(element?.price_unit || '0.00'),
                        'ราคาสุทธิ': Number(element?.price_grand_total || '0.00')
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
                if ([9, 10, 11].includes(cell.c)) {
                    ws[objectI].z = '##,##,##0.00'
                }
                // Set Column to Number of Currency
                if ([7].includes(cell.c)) {
                    ws[objectI].z = '##,##,##0'
                }
            }

            ws["!ref"] = `A1:L${results.length + 2}`

            if (results.length > 0) {
                // Foot Column: TEXT(รวม)
                const footColumn_SUMtext = 'G';
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
                // Foot Column: SUM(จำนวน)
                const footColumn_SUM_H = 'H';
                ws[`${footColumn_SUM_H}${results.length + 2}`] = {
                    t: 'n', z: '##,##,##0', v: 0,
                    // f: `=SUM(${footColumn_SUM_priceBeforeVat}1:${footColumn_SUM_priceBeforeVat}${(parseInt(results.length) + 1)})`,
                    f: arrStrFilter__status.length === 1
                        ? `=SUM(${footColumn_SUM_H}1:${footColumn_SUM_H}${(parseInt(results.length) + 1)})`
                        : `=SUMIF(K1:K${(parseInt(results.length) + 1)},"<>ยกเลิกเอกสาร",${footColumn_SUM_H}1:${footColumn_SUM_H}${(parseInt(results.length) + 1)})`,
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
                // Foot Column: SUM(ส่วนลด)
                const footColumn_SUM_J = 'J';
                ws[`${footColumn_SUM_J}${results.length + 2}`] = {
                    t: 'n', z: '##,##,##0.00', v: 0,
                    // f: `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 1)})`,
                    f: arrStrFilter__status.length === 1
                        ? `=SUM(${footColumn_SUM_J}1:${footColumn_SUM_J}${(parseInt(results.length) + 1)})`
                        : `=SUMIF(K1:K${(parseInt(results.length) + 1)},"<>ยกเลิกเอกสาร",${footColumn_SUM_J}1:${footColumn_SUM_J}${(parseInt(results.length) + 1)})`,
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
                // Foot Column: SUM(ราคาต่อชิ้น)
                const footColumn_SUM_K = 'K';
                ws[`${footColumn_SUM_K}${results.length + 2}`] = {
                    t: 'n', z: '##,##,##0.00', v: 0,
                    // f: `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 1)})`,
                    f: arrStrFilter__status.length === 1
                        ? `=SUM(${footColumn_SUM_K}1:${footColumn_SUM_K}${(parseInt(results.length) + 1)})`
                        : `=SUMIF(K1:K${(parseInt(results.length) + 1)},"<>ยกเลิกเอกสาร",${footColumn_SUM_K}1:${footColumn_SUM_K}${(parseInt(results.length) + 1)})`,
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
                // Foot Column: SUM(ราคาสุทธิ)
                const footColumn_SUM_L = 'L';
                ws[`${footColumn_SUM_L}${results.length + 2}`] = {
                    t: 'n', z: '##,##,##0.00', v: 0,
                    // f: `=SUM(${footColumn_SUM_grandTotal}1:${footColumn_SUM_grandTotal}${(parseInt(results.length) + 1)})`,
                    f: arrStrFilter__status.length === 1
                        ? `=SUM(${footColumn_SUM_L}1:${footColumn_SUM_L}${(parseInt(results.length) + 1)})`
                        : `=SUMIF(K1:K${(parseInt(results.length) + 1)},"<>ยกเลิกเอกสาร",${footColumn_SUM_L}1:${footColumn_SUM_L}${(parseInt(results.length) + 1)})`,
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
            }

            let wscols = [
                { width: 20 }, // Col: A
                { width: 20 }, // Col: B
                { width: 20 }, // Col: C
                { width: 20 }, // Col: D
                { width: 20 }, // Col: E
                { width: 20 }, // Col: F
                { width: 20 }, // Col: G
                { width: 20 }, // Col: H
                { width: 20 }, // Col: I
                { width: 20 }, // Col: J
                { width: 20 }, // Col: K
                { width: 20 }, // Col: L
            ];

            ws['!cols'] = wscols;

            const file_name = uuid4() + '___รายงานการซื้อ';

            let wb = await XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

            await handleSaveLog(request, [['get ShopReportsSalesOut report' + ' - report ', '', file_name], ''])

            return utilSetFastifyResponseJson('success', file_name + '.xlsx');
        }

        /**
         * @type {number}
         */
        const queryResult__Count = await db.query(`
                ${queryString}
                SELECT COUNT(*) 
                FROM CTE_UNION;
            `.replace(/\s+/g, ' '),
            {
                type: QueryTypes.SELECT,
                nest: false,
                raw: true,
                replacements: {
                    search: `%${search}%`.replace(/\s/ig, ' ').replace(/\s/ig, '%').replace(/%+/ig, '%'),
                    doc_date_startDate,
                    doc_date_endDate,
                    shop_product_id: shop_product_id,
                    arrStrFilter__shop_business_partner_id: arrStrFilter__shop_business_partner_id
                }
            }
        ).then(r => Number(r[0].count) || 0);

        const pag = {
            currentPage: page,
            pages: Math.ceil(queryResult__Count / limit),
            currentCount: queryResult__Data.length,
            totalCount: queryResult__Count,
            data: queryResult__Data
        };

        await handleSaveLog(request, [[handlerName], '']);

        return utilSetFastifyResponseJson('success', pag);
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], error]);

        throw error;
    }
};


module.exports = handlerShopReportsInventory;
