const _ = require("lodash");
const { Op, literal } = require("sequelize");
const { handleSaveLog } = require("./log");
const {
    generateSearchOpFromKeys,
    paginate,
    isUUID,
} = require("../utils/generate");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");

const modelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers;
const modelShopsProfiles = require("../models/model").ShopsProfiles;
const modelBusinessType = require("../models/model").BusinessType;
const modelSubDistrict = require("../models/model").SubDistrict;
const modelDistrict = require("../models/model").District;
const modelProvince = require("../models/model").Province;
const XLSX = require('xlsx-js-style');
const { v4: uuid4 } = require("uuid");

/**
 * A handler to list shopBusiness from database
 * - Route [GET] => /api/shopBusinessCustomers/all
 * @param {import("../types/type.Handler.ShopBusinessCustomers").IHandlerShopBusinessCustomerAllRequest} request
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopBusinessCustomers[]>>}
 */
const handlerShopBusinessCustomersAll = async (request) => {
    const action = "GET ShopBusinessCustomers.All";

    try {
        /**
         * An user id from request
         * @type {string}
         */
        const user_id = request.id;

        if (!isUUID(user_id)) {
            throw new Error(`Unauthorized`);
        } else {
            /**
             * A function to generate "isuse" from request
             * @param status
             * @return {number[]}
             */
            const setIsUse = (status = request.query.status) => {
                let isuse;
                if (status === 'delete') {
                    isuse = [2];
                } else if (status === 'active') {
                    isuse = [1];
                } else if (status === 'block') {
                    isuse = [0];
                } else {
                    isuse = [1, 0];
                }
                return isuse;
            };

            /**
             * A function to generate JSON filter in postgres where is contains dynamic JSON keys
             * @param jsonFieldReq
             * @returns {string[]}
             */
            const setJsonField = (jsonFieldReq = "") => {
                if (!_.isString(jsonFieldReq) || !jsonFieldReq) {
                    return [];
                } else {
                    const extractData = jsonFieldReq.split(",")
                        .map(where => {
                            const refactorInput = where.replace(/\s/, "");
                            if (refactorInput !== "") {
                                return refactorInput;
                            }
                        });
                    return extractData;
                }
            };

            // Init data as requested
            const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
            const search = request.query.search || "";
            const status = setIsUse(request.query.status);
            const sort = request.query.sort || "id";
            const order = request.query.order || "asc";
            let limit = +request.query.limit || 10;
            let page = +request.query.page || 1;
            const dropdown = request.query.dropdown
            let tags = request.query.tags
            const jsonField = {
                tel_no: setJsonField(_.get(request.query, "jsonField.tel_no", "")),
                mobile_no: setJsonField(_.get(request.query, "jsonField.mobile_no", "")),
                other_details: setJsonField(_.get(request.query, "jsonField.other_details", "")),
            };
            const export_format = request.query.export_format

            if (export_format === 'xlsx') {
                page = 1;
                limit = 10000000;
            }

            /**
             * A result of find data to see what ShopProfile's id whereby this user's request
             */
            const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');

            if (!findShopProfiles) {
                const instanceError = new Error(`Variable "findShopsProfile" return not found`);
                await handleSaveLog(request, [[action], instanceError]);
                return utilSetFastifyResponseJson("success", paginate([], limit, page));
            }
            else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopProfiles[0]?.shop_code_id)) {
                const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
                await handleSaveLog(request, [[action], instanceError]);
                return utilSetFastifyResponseJson("success", paginate([], limit, page));
            }
            else {
                /**
                 * A name for dynamics table
                 * @type {string}
                 */
                const table_name = findShopProfiles[0].shop_code_id;

                /**
                 * A class's dynamics instance of model "ShopBusinessCustomers"
                 */
                const instanceModelShopBusinessCustomers = modelShopBusinessCustomers(table_name);

                let inc_attr = (dropdown) ? { attributes: [] } : {}
                let select_attr = (dropdown) ? ['id', 'master_customer_code_id', 'customer_name'] : {
                    include: [
                        [literal(`(
                            SELECT 
                                SUM(CASE
                                    WHEN (details->'calculate_result'->>'net_total' IS NULL OR details->'calculate_result'->>'net_total' = '') THEN 0
                                    ELSE cast(details->'calculate_result'->>'net_total' as float)
                                END)
                            FROM app_shops_datas.dat_${table_name}_sales_transaction_doc doc
                            where bus_customer_id = "ShopBusinessCustomers".id
                            and purchase_status = false
                            and (select count(*) FROM app_shops_datas.dat_${table_name}_sales_order_plan_logs lo where lo.doc_sale_id = doc.id ) > 0
                        )`), 'debt'],
                        [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopBusinessCustomers"."created_by" )`), `created_by`],
                        [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopBusinessCustomers"."updated_by" )`), `updated_by`],
                        [literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopBusinessCustomers\".\"tags\"))`), 'tags'],
                    ]
                }

                let inc = [
                    { model: modelShopsProfiles, as: 'ShopsProfiles', ...inc_attr },
                    { model: modelBusinessType, as: 'BusinessType', ...inc_attr },
                    { model: modelSubDistrict, as: 'SubDistrict', ...inc_attr },
                    { model: modelDistrict, as: 'District', ...inc_attr },
                    { model: modelProvince, as: 'Province', ...inc_attr }
                ]

                if (tags) {
                    tags = tags.split(',')
                }

                let whereQuery = {
                    [Op.and]: [
                        { isuse: status },
                        (tags) ? { [Op.or]: tags.map(el => { return { tags: { [Op.contains]: [el] } } }) } : {},
                    ],
                    [Op.or]: [
                        {
                            master_customer_code_id: { [Op.iLike]: `%${search}%` },
                        },
                        {
                            tax_id: { [Op.iLike]: `%${search}%` },
                        },
                        {
                            customer_name: {
                                [Op.or]: [
                                    ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                                ]
                            }
                        },
                        {
                            tel_no: {
                                [Op.or]: [
                                    ...generateSearchOpFromKeys(jsonField.tel_no, Op.iLike, `%${search}%`)
                                ]
                            }
                        },
                        {
                            mobile_no: {
                                [Op.or]: [
                                    ...generateSearchOpFromKeys(jsonField.mobile_no, Op.iLike, `%${search}%`)
                                ]
                            }
                        },
                        {
                            e_mail: { [Op.iLike]: `%${search}%` },
                        },
                        {
                            address: {
                                [Op.or]: [
                                    ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                                ]
                            }
                        },
                        {
                            other_details: {
                                [Op.or]: [
                                    ...generateSearchOpFromKeys(jsonField.other_details, Op.iLike, `%${search}%`)
                                ]
                            }
                        }

                    ]
                }

                const data = await instanceModelShopBusinessCustomers.findAll(
                    {
                        attributes: select_attr,
                        include: inc,
                        order: [[sort, order]],
                        where: whereQuery,
                        limit: limit,
                        offset: (page - 1) * limit
                    }
                ).catch(
                    (error) => {
                        const regexDatabaseNotFound = /((SequelizeDatabaseError){1}\:\s{1}(relation){1}\s{1}\"{1}.*\"{1}\s{1}(does){1}\s{1}(not){1}\s{1}(exist){1}){1}/g;
                        if (regexDatabaseNotFound.test(new Error(error).message)) {
                            return [];
                        } else {
                            throw error;
                        }
                    }
                );


                if (export_format === 'xlsx') {
                    let data_header = {
                        'รหัส': null,
                        'ชื่อธุรกิจ': null,
                        'หมายเลขโทรศัพท์': null,
                        'ชื่อผู้ติดต่อ': null,
                        'เบอร์มือถือ': null,
                        'ประเภทกิจการ': null,
                        'หมายเลขประจำตัวผู้เสียภาษี': null,
                        'สถานะเป็นสมาชิก': null
                    }
                    let data_ = [];
                    if (data.length === 0) {
                        data.push(data_header);
                    } else {

                        data_ = data.map(el => {
                            let tel = ``
                            if (_.hasIn(el, 'tel_no.tel_no_1') && el.tel_no.tel_no_1 != '') {
                                tel = `${el.tel_no.tel_no_1} ${(_.hasIn(el, 'tel_no.tel_no_2') ? ',' + el.tel_no.tel_no_2 : '')} ${(_.hasIn(el, 'tel_no.tel_no_3') ? ',' + el.tel_no.tel_no_3 : '')}`
                            }
                            let mobile = ``
                            if (_.hasIn(el, 'mobile_no.mobile_no_1') && el.mobile_no.mobile_no_1 != '') {
                                mobile = `${el.mobile_no.mobile_no_1} ${(_.hasIn(el, 'mobile_no.mobile_no_2') ? ',' + el.mobile_no.mobile_no_2 : '')} ${(_.hasIn(el, 'mobile_no.mobile_no_3') ? ',' + el.mobile_no.mobile_no_3 : '')}`
                            }
                            return {
                                'รหัส': el.master_customer_code_id || '',
                                'ชื่อธุรกิจ': el.customer_name?.th || '',
                                'หมายเลขโทรศัพท์': tel,
                                'ชื่อผู้ติดต่อ': el.other_details.contact_name || '',
                                'เบอร์มือถือ': mobile,
                                'ประเภทกิจการ': el.BusinessType?.business_type_name?.th || '',
                                'หมายเลขประจำตัวผู้เสียภาษี': el.tax_id || '',
                                'สถานะเป็นสมาชิก': ((/true/i).test(el.other_details.is_member) == true) ? 'ใช่' : 'ไม่ใช่'
                            }
                        })
                    }


                    let ws = await XLSX.utils.json_to_sheet(data_, { origin: 0 });

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

                    ws["!ref"] = `A1:V${data_.length + 2}`

                    let wscols = [
                        { width: 24 }, // Col: A
                        { width: 44 }, // Col: B
                        { width: 24 }, // Col: C
                        { width: 24 }, // Col: D
                        { width: 30 }, // Col: E
                        { width: 20 },
                        { width: 24 }
                    ];

                    ws['!cols'] = wscols;

                    const file_name = uuid4() + '___รายงานลูกค้าธุรกิจ';

                    let wb = await XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

                    await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });

                    await handleSaveLog(request, [['get product report' + ' - report ', '', file_name], ''])

                    return ({ status: 'success', data: file_name + '.xlsx' });


                }



                var length_data = await instanceModelShopBusinessCustomers.count({
                    include: inc,
                    where: whereQuery
                })



                var pag = {
                    currentPage: page,
                    pages: Math.ceil(length_data / limit),
                    currentCount: data.length,
                    totalCount: length_data,
                    data: data

                }

                await handleSaveLog(request, [[action], ""]);

                return utilSetFastifyResponseJson("success", pag);
            }
        }

    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};


module.exports = handlerShopBusinessCustomersAll;