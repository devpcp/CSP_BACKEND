const moment = require("moment");
const { QueryTypes } = require("sequelize");
const { handleSaveLog } = require('./log');
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const db = require('../db');

const spares_id = '7874b76c-2255-454c-901e-598995391d37';
const tire_id = 'da791822-401c-471b-9b62-038c671404ab';

const toNumberCurrencyFormat = (value = 0) => {
    return Number(Number(value).toFixed(2));
};

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */

let month_en = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const config = async (request = {}, reply = {}, options = {}) => {
    const action = 'dashboard brand sales'
    try {
        const shop_table = await utilCheckShopTableName(request);

        const data = [
            { api: 'api/dashboard/brandSales', name: 'สัดส่วนยอดขายแบรนด์สินค้า', status: true },
            { api: 'api/dashboard/brandSalesOnlyTire', name: 'สัดส่วนยอดขายแบรนด์สินค้าเฉพาะยาง', status: true },
            { api: 'api/dashboard/brandSalesOnlySpare', name: 'สัดส่วนยอดขายแบรนด์สินค้าเฉพาะอะไหล่', status: true },
            { api: 'api/dashboard/dailyInfo', name: 'ข้อมูลประจำวันนี้', status: true },
            { api: 'api/dashboard/compareMonthlySales', name: 'เปรียบเทียบยอดขายรายเดือน', status: true },
            { api: 'api/dashboard/compareSalesTarget', name: 'เปรียบเทียบยอดขายกับเป้าการขาย', status: false },
            { api: 'api/dashboard/numberOfUserThisMonth', name: 'จำนวนลูกค้าที่เข้ามาใช้บริการประจำเดือนนี้', status: true },
            { api: 'api/dashboard/typeSales', name: 'สัดส่วนยอดขายประเภทสินค้า', status: true },
            { api: 'api/dashboard/dailyFinanceInfo', name: 'ข้อมูลการเงินประจำวันนี้', status: true },
            { api: 'api/dashboard/numberOfIncomeThisMonth', name: 'จำนวนเงินประจำเดือนนี้', status: true },
            { api: 'api/dashboard/numberOfSalesTireAmountByDateRange', name: 'จำนวนยางที่ขายวันนี้', status: true },
            { api: 'api/dashboard/compareYearlySalesTireAmount', name: 'เปรียบเทียบจำนวนขายยางรายเดือน', status: true },
            { api: 'api/dashboard/compareYearlySalesSpareAmount', name: 'เปรียบเทียบจำนวนขายอะไหล่รายเดือน', status: true },
            { api: 'api/dashboard/numberOfSalesTireAmountByMonth', name: 'จำนวนยางที่ขายประจำเดือนนี้', status: true },
            { api: 'api/dashboard/numberOfSalesSpareAmountByMonth', name: 'จำนวนอะไหล่ที่ขายประจำเดือนนี้', status: true },
            { api: 'api/dashboard/topSizeSales', name: 'Top ไซต์ยาง นับจาก จำนวนสินค้าที่ขาย', status: true },
            { api: 'api/dashboard/topType/tire', name: 'Top ยาง นับจาก จำนวนสินค้าที่ขาย', status: true },
            { api: 'api/dashboard/topType/spaire', name: 'Top อะไหล่ นับจาก จำนวนสินค้าที่ขาย', status: true },
            { api: 'api/dashboard/topType/service', name: 'Top บริการ นับจาก จำนวนสินค้าที่ขาย', status: true },
            { api: 'api/dashboard/topCustomer', name: 'Top ลูกค้า นับจาก ใบที่ชำระแล้ว เป็นครั้ง', status: true },

        ];

        return utilSetFastifyResponseJson("success", data)

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
};


const fnGetDateOnlyFromRequest = (value = '') => {
    const inputDate = moment(value, 'YYYY-MM-DD', true);
    if (inputDate.isValid()) {
        return inputDate.format('YYYY-MM-DD');
    }
    else {
        throw Error('รูปแบบข้อมูลวันที่ส่งเข้ามาไม่ถูกต้อง');
    }
};

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const brandSales = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET dashboard brand sales';

    try {


        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        // const is_multibranch = request.query?.is_multibranch || false;
        // const shop_table = is_multibranch
        //     ? await utilCheckShopTableName(request, 'select_shop_ids')
        //     : await utilCheckShopTableName(request, 'default');
        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];
        // const date = new Date()
        //     , y = date.getFullYear()
        //     , m = date.getMonth();
        // const this_year = new Date().getFullYear();
        // const this_month = ('0' + (m + 1)).slice(-2);
        // const this_day = new Date().getDate();
        // const first_date_this_month = new Date().getFullYear()
        //     + '-'
        //     + ('0' + (new Date().getMonth() + 1)).slice(-2)
        //     + '-01';
        const type_group_id = request.query.type_group_id || null;
        /**
         * @type {string}
         */
        const start_date = request.query.start_date ? fnGetDateOnlyFromRequest(request.query.start_date) : moment().startOf('month').format('YYYY-MM-DD');
        /**
         * @type {string}
         */
        const end_date = request.query.end_date ? fnGetDateOnlyFromRequest(request.query.end_date) : moment().endOf('month').format('YYYY-MM-DD');


        const data_new = await db.query(
            `
                WITH
                ${table_name.reduce((prev, curr) => {
                return prev + `
                    CTE_${curr} AS (
                        SELECT *,
                               (SELECT "Product".id FROM app_datas.dat_products AS "Product" WHERE (((SELECT "ShopProduct".product_id FROM app_shops_datas.dat_${curr}_products AS "ShopProduct" WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id)) = "Product".id) ) AS product_id,
                               (SELECT "Product".product_brand_id FROM app_datas.dat_products AS "Product" WHERE (((SELECT "ShopProduct".product_id FROM app_shops_datas.dat_${curr}_products AS "ShopProduct" WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id)) = "Product".id) ) AS product_brand_id
                        FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                        WHERE "ShopServiceOrderList".status = 1
                          AND ((SELECT "ShopServiceOrderDoc".status
                                FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                AND "ShopServiceOrderDoc".status = 1
                                AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                AND "PaymentTransaction".canceled_payment_date IS NULL
                                AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                ORDER BY "PaymentTransaction".created_date desc
                                LIMIT 1
                                )
                            = 1)
                          AND ((SELECT "ShopProduct".id
                                FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                  AND ((SELECT "Product".id
                                        FROM app_datas.dat_products AS "Product"
                                        WHERE "Product".id = "ShopProduct".product_id
                                          AND ((SELECT "ProductType".id
                                                FROM master_lookup.mas_product_types AS "ProductType"
                                                WHERE "ProductType".id = "Product".product_type_id
                                                  AND ((SELECT "ProductTypeGroup".id
                                                        FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                        WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                          ${type_group_id ? `AND "ProductTypeGroup".id = :type_group_id` : ''})
                                                    = "ProductType".type_group_id))
                                            = "Product".product_type_id))
                                    = "ShopProduct".product_id)
                            ) = "ShopServiceOrderList".shop_product_id)
                    ),
                    `;
            }, ``)}
                CTE_UNION AS (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_${curr})
                            `;
                }
            }, ``)}
                ),
                CTE_SalesBrand AS (
                    SELECT row_number() OVER (ORDER BY CTE_UNION_T.sales DESC) AS no,
                    CTE_UNION_T.product_brand_id,
                    (SELECT "ProductBrand".brand_name->>'th' FROM master_lookup.mas_product_brands AS "ProductBrand" WHERE "ProductBrand".id = CTE_UNION_T.product_brand_id) AS brand_name,
                    (CTE_UNION_T.sales)::float AS sales
                        FROM (
                            SELECT CTE_UNION.product_brand_id, sum(CTE_UNION.price_grand_total - CTE_UNION.proportion_discount_price) AS sales
                            FROM CTE_UNION
                            GROUP BY CTE_UNION.product_brand_id
                            ORDER BY sum(CTE_UNION.price_grand_total - CTE_UNION.proportion_discount_price) DESC
                        LIMIT 10
                    ) AS CTE_UNION_T
                )
                SELECT
                    t1.no AS no,
                    t1.product_brand_id AS product_brand_id,
                    CASE WHEN t1.brand_name IS NULL THEN 'ไม่ทราบชื่อแบรนด์สินค้า' ELSE t1.brand_name END AS brand_name,
                    t1.sales AS sales,
                    "color"->>'color' AS color
                FROM CTE_SalesBrand AS t1
                    LEFT JOIN unnest(
                        ARRAY [
                            json_build_object('no',1,'color','#04afe3'),
                            json_build_object('no',2,'color','#a441d8'),
                            json_build_object('no',3,'color','#25d646'),
                            json_build_object('no',4,'color','#eadc2d'),
                            json_build_object('no',5,'color','#ed3e3e'),
                            json_build_object('no',6,'color','#9403fc'),
                            json_build_object('no',7,'color','#2329db'),
                            json_build_object('no',8,'color','#ed1ad8'),
                            json_build_object('no',9,'color','#ed1a56'),
                            json_build_object('no',10,'color','#ed1a59')
                        ]
                    ) AS "color" ON t1.no::text = "color"->>'no';
            `,
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    type_group_id: type_group_id,
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        let percent = data_new.reduce(
            (accumulator, currentValue) => accumulator + parseFloat(currentValue.sales),
            0,
        );


        return utilSetFastifyResponseJson("success", data_new.reduce((previousValue, currentValue, index) => {
            if (index <= 4) {
                currentValue.sales = toNumberCurrencyFormat(currentValue.sales);
                currentValue.percent = toNumberCurrencyFormat(currentValue.sales * 100 / percent)
                previousValue.push(currentValue);
            }

            return previousValue;
        }, []));

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

const brandSalesOnlyTire = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET dashboard brand sales only tire';

    try {


        request.query.type_group_id = tire_id
        return await brandSales(request)

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

const brandSalesOnlySpare = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET dashboard brand sales only spare';

    try {
        request.query.type_group_id = spares_id
        return await brandSales(request)

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}



/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const dailyInfo = async (request = {}, reply = {}, options = {}) => {
    const action = 'dashboard daily info'
    try {

        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        const spares_id = '7874b76c-2255-454c-901e-598995391d37';
        const tire_id = 'da791822-401c-471b-9b62-038c671404ab';
        /**
       * @type {string}
       */
        const start_date = request.query.start_date ? fnGetDateOnlyFromRequest(request.query.start_date) : moment().startOf('month').format('YYYY-MM-DD');
        /**
         * @type {string}
         */
        const end_date = request.query.end_date ? fnGetDateOnlyFromRequest(request.query.end_date) : moment().endOf('month').format('YYYY-MM-DD');

        const start_year_month_date = moment(start_date).format('YYYY-MM');

        const end_year_month_date = moment(end_date).format('YYYY-MM');


        const queryResult = await db.query(
            `
            SELECT
                (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx !== 0) {
                    prev = prev + `+`;
                }

                return prev + `
                                (SELECT coalesce(sum("ShopServiceOrderList".amount),0)::int
                                    FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                                    WHERE "ShopServiceOrderList".status = 1
                                      AND ((SELECT "ShopServiceOrderDoc".status
                                            FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                            JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                            WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                            AND "ShopServiceOrderDoc".status = 1
                                            AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                            AND "PaymentTransaction".canceled_payment_date IS NULL
                                            AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                            ORDER BY "PaymentTransaction".created_date desc
                                            LIMIT 1
                                            )
                                        = 1)
                                      AND ((SELECT "ShopProduct".id
                                            FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                            WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                                AND ((SELECT "Product".id
                                                      FROM app_datas.dat_products AS "Product"
                                                      WHERE "Product".id = "ShopProduct".product_id
                                                        AND ((SELECT "ProductType".id
                                                              FROM master_lookup.mas_product_types AS "ProductType"
                                                              WHERE "ProductType".id = "Product".product_type_id
                                                                AND ((SELECT "ProductTypeGroup".id
                                                                      FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                                      WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                                        AND "ProductTypeGroup".id = :tire_id)
                                                                    = "ProductType".type_group_id))
                                                            = "Product".product_type_id))
                                                     = "ShopProduct".product_id)
                                        ) = "ShopServiceOrderList".shop_product_id))
                            `;
            }, ``)}
                ) AS "tire",
                (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx !== 0) {
                    prev = prev + `+`;
                }

                return prev + `
                                (SELECT coalesce(sum("ShopServiceOrderList".amount),0)::int
                                    FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                                    WHERE "ShopServiceOrderList".status = 1
                                      AND ((SELECT "ShopServiceOrderDoc".status
                                            FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                            JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                            WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                            AND "ShopServiceOrderDoc".status = 1
                                            AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                            AND "PaymentTransaction".canceled_payment_date IS NULL
                                            AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                            ORDER BY "PaymentTransaction".created_date desc
                                            LIMIT 1
                                            )
                                        = 1)
                                      AND ((SELECT "ShopProduct".id
                                            FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                            WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                                AND ((SELECT "Product".id
                                                      FROM app_datas.dat_products AS "Product"
                                                      WHERE "Product".id = "ShopProduct".product_id
                                                        AND ((SELECT "ProductType".id
                                                              FROM master_lookup.mas_product_types AS "ProductType"
                                                              WHERE "ProductType".id = "Product".product_type_id
                                                                AND ((SELECT "ProductTypeGroup".id
                                                                      FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                                      WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                                        AND "ProductTypeGroup".id = :spares_id)
                                                                    = "ProductType".type_group_id))
                                                            = "Product".product_type_id))
                                                     = "ShopProduct".product_id)
                                        ) = "ShopServiceOrderList".shop_product_id))
                            `;
            }, ``)}
                ) AS "spare",
                (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx !== 0) {
                    prev = prev + `+`;
                }

                return prev + `
                                (
                                    SELECT count(*)::int
                                    FROM (
                                        SELECT "ShopServiceOrderDoc".per_customer_id
                                        FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                        WHERE "ShopServiceOrderDoc".status = 1
                                            AND "ShopServiceOrderDoc".per_customer_id IS NOT NULL
                                            AND  to_char("ShopServiceOrderDoc".created_date,'YYYY-MM-DD') BEtWEEN :start_date AND :end_date
                                        GROUP BY "ShopServiceOrderDoc".per_customer_id
                                    ) AS "PersonalCustomer"
                                ) +
                                (
                                    SELECT count(*)::int
                                    FROM (
                                        SELECT "ShopServiceOrderDoc".bus_customer_id
                                        FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                        WHERE "ShopServiceOrderDoc".status = 1
                                            AND "ShopServiceOrderDoc".bus_customer_id IS NOT NULL
                                            AND to_char("ShopServiceOrderDoc".created_date,'YYYY-MM-DD') BETWEEN :start_date AND :end_date
                                        GROUP BY "ShopServiceOrderDoc".bus_customer_id
                                    ) AS "BusinessCustomer"
                                )
                            `;
            }, ``)}
                ) AS "customer_visit",
                (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx !== 0) {
                    prev = prev + `+`;
                }

                return prev + `
                                        (
                                            SELECT count(*)::int
                                            FROM (
                                                SELECT "ShopServiceOrderDoc".per_customer_id
                                                FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                                WHERE "ShopServiceOrderDoc".status = 1
                                                    AND "ShopServiceOrderDoc".per_customer_id IS NOT NULL
                                                    AND to_char("ShopServiceOrderDoc".created_date,'YYYY-MM') BETWEEN :start_year_month_date AND :end_year_month_date 
                                                GROUP BY "ShopServiceOrderDoc".per_customer_id
                                                HAVING count("ShopServiceOrderDoc".per_customer_id) > 1
                                            ) AS "PersonalCustomer"
                                        ) +
                                        (
                                            SELECT count(*)::int
                                            FROM (
                                                SELECT "ShopServiceOrderDoc".bus_customer_id
                                                FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                                WHERE "ShopServiceOrderDoc".status = 1
                                                    AND "ShopServiceOrderDoc".bus_customer_id IS NOT NULL
                                                    AND to_char("ShopServiceOrderDoc".created_date,'YYYY-MM') BETWEEN :start_year_month_date AND :end_year_month_date 
                                                GROUP BY "ShopServiceOrderDoc".bus_customer_id
                                                HAVING count("ShopServiceOrderDoc".bus_customer_id) > 1
                                            ) AS "BusinessCustomer"
                                        )
                                    `;
            }, ``)}
                ) AS "customer_revisit";
            `,
            {
                type: QueryTypes.SELECT,
                transaction: request?.transaction || options?.transaction || null,
                raw: true,
                replacements: {
                    tire_id: tire_id,
                    spares_id: spares_id,
                    start_date: start_date,
                    end_date: end_date,
                    start_year_month_date: start_year_month_date,
                    end_year_month_date: end_year_month_date
                }
            }
        );

        const data = {
            tire: queryResult[0].tire || 0,// data[0].tire,
            spares: queryResult[0].spare || 0,// data[0].spares,
            customer: queryResult[0].customer_visit || 0,
            customer_return: queryResult[0].customer_revisit || 0,
        }

        return utilSetFastifyResponseJson("success", data);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */


const compareMonthlySales = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET dashboard brand sales';

    try {

        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        /**
        * @type {string[]}
        */
        const req_start_year = request.query.start_year ? request.query.start_year : moment(new Date()).format('YYYY');

        const req_end_year = request.query.end_year ? request.query.end_year : moment(new Date()).format('YYYY');

        let req_arr_year = []
        for (let index = req_start_year; index <= req_end_year; index++) {
            req_arr_year.push(parseInt(index))
        }

        req_arr_year.forEach(ele => {
            if (!moment(ele, 'YYYY', true).isValid()) {
                throw Error('รูปแบบข้อมูลปี YYYY ไม่ถูกต้อง');
            }
        });



        const data_new = await db.query(
            `
                WITH
                ${table_name.reduce((prev, curr) => {
                return prev + `
                    CTE_${curr} AS (
                        SELECT *,
                        date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') AS "PaymentDate"
                        FROM app_shops_datas.dat_${curr}_service_order_doc as "ShopServiceOrderDoc"
                        WHERE status = 1
                        AND payment_paid_status IN (3,4,5)
                    ),
                    `;
            }, ``)}
                CTE_UNION AS (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_${curr})
                            `;
                }
            }, ``)}
                )
                SELECT 
                   ARRAY ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] AS "labels",
                   ARRAY(
                           SELECT (
                               SELECT json_build_object (
                                   'total_qty', coalesce(sum(price_grand_total), 0)::NUMERIC(10, 2),
                                   'label', "year",
                                   -- 'borderColor', "color" ->> 'color',
                                   -- 'backgroundColor', "color" ->> 'color',
                                   'borderColor', '#80e2ff',
                                   'backgroundColor', '#80e2ff',
                                   'data', ARRAY (
                                       SELECT (
                                            SELECT coalesce(sum(price_grand_total), 0)::NUMERIC(10, 2) AS net_total from CTE_UNION
                                            WHERE EXTRACT(YEAR FROM "PaymentDate") = "year"
                                            AND EXTRACT(MONTH FROM "PaymentDate") = "month"
                                       )
                                       FROM unnest(ARRAY [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) AS "month"
                                   )
                               )
                               FROM CTE_UNION AS "sale_doc"
                                WHERE EXTRACT(YEAR FROM "sale_doc"."PaymentDate") = "year"
                           )
                           FROM unnest(ARRAY [${req_arr_year}]) AS "year"
                                -- LEFT JOIN unnest(
                                --    ARRAY [
                                --       json_build_object('year', :this_year, 'color', '#80e2ff'),
                                --       json_build_object('year', :year_before, 'color', '#04afe3')
                                --    ]
                                -- ) AS color ON cast(color ->> 'year' AS int) = "year"
                   ) AS "datasets";
                
            `,
            {
                type: QueryTypes.SELECT,
                raw: true,
            }
        );


        return utilSetFastifyResponseJson('success', data_new[0]);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);
        throw error;
    }
};
/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const compareSalesTarget = async (request = {}, reply = {}, options = {}) => {
    return utilSetFastifyResponseJson("success", []);
};


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const numberOfUserThisMonth = async (request = {}, reply = {}, options = {}) => {
    const action = 'dashboard number of user this month';

    try {


        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        const date = new Date()
            , y = date.getFullYear()
            , m = date.getMonth();
        const this_year = new Date().getFullYear();
        const this_month = ('0' + (m + 1)).slice(-2);

        /**
         * @type {string}
         */
        const req_start_year_month = request.query.start_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_start_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }

        const req_end_year_month = request.query.end_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_end_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }


        const moment_start_date = moment(req_start_year_month, 'YYYY-MM', true).startOf('month');
        const start_date = moment_start_date.format('YYYY-MM-DD');

        const moment_end_date = moment(req_end_year_month, 'YYYY-MM', true).endOf('month');
        const end_date = moment_end_date.format('YYYY-MM-DD');

        const day = [];
        for (let index = 1; index <= 31; index++) {
            day.push(index);
        }

        const labelYears = [];
        for (let year = moment(req_start_year_month).year(); year <= moment(req_end_year_month).year(); year++) {
            labelYears.push(year);
        }



        const data_new = await db.query(
            `
                WITH
                ${table_name.reduce((prev, curr) => {
                return prev + `
                    CTE_${curr} AS (
                        SELECT  *
                        FROM app_shops_datas.dat_${curr}_service_order_doc  AS "doc"
                        WHERE status = 1
                    ),
                    `;
            }, ``)}
                CTE_UNION AS (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_${curr})
                            `;
                }
            }, ``)}
                )
                SELECT 
                ARRAY[${day}] as "labels",
                ARRAY(
                    SELECT(
                        SELECT json_build_object(
                            'total_qty',count("doc".per_customer_id) + count("doc".bus_customer_id) ,
                            'label','จำนวนลูกค้า (คน)',
                            'labels', concat("Year",'-',  TO_CHAR("Month", 'fm00')),
                            'borderColor', '#04afe3',
                            'backgroundColor', '#04afe3',
                            'type','line',
                            'data',ARRAY(
                                SELECT (
                                    SELECT count(per_customer_id) + count(bus_customer_id) AS total_qty 
                                    FROM (
                                        SELECT  *
                                        FROM CTE_UNION
                                        WHERE EXTRACT(YEAR FROM "doc_date") = "Year"
                                        AND EXTRACT(MONTH FROM "doc_date") = "Month"
                                        AND EXTRACT(DAY FROM "doc_date") = "day"
                                    ) AS "doc"
                                ) FROM unnest(ARRAY[${day}]) "day"
                                ))
                            FROM CTE_UNION  AS "doc"
                            WHERE EXTRACT(YEAR FROM "doc"."doc_date") = "Year"
                            AND EXTRACT(MONTH FROM "doc"."doc_date") = "Month" 
                        )
                    FROM unnest(ARRAY [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) AS "Month"
                    JOIN unnest(ARRAY [${labelYears}]) AS "Year" ON 1=1
                    WHERE date(concat("Year",'-',"Month",'-01')) BETWEEN '${start_date}' AND '${end_date}'
                ) as "datasets";
                
            `,
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    this_year: this_year,
                    this_month: this_month
                }
            }
        );



        return utilSetFastifyResponseJson("success", data_new[0]);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
};


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const typeSales = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET dashboard type sales';

    try {

        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');


        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        /**
         * @type {string}
         */
        const start_date = request.query.start_date ? fnGetDateOnlyFromRequest(request.query.start_date) : moment().startOf('month').format('YYYY-MM-DD');
        /**
         * @type {string}
         */
        const end_date = request.query.end_date ? fnGetDateOnlyFromRequest(request.query.end_date) : moment().endOf('month').format('YYYY-MM-DD');

        const data_new = await db.query(
            `
                WITH
                ${table_name.reduce((prev, curr) => {
                return prev + `
                    CTE_${curr} AS (
                        SELECT *,
                               (SELECT to_char(updated_date,'YYYY-MM-DD') FROM app_shops_datas.dat_${curr}_service_order_doc WHERE id = "ShopServiceOrderList".shop_service_order_doc_id) as "service_doc_updated_date",
                               (SELECT "Product".id FROM app_datas.dat_products AS "Product" WHERE (((SELECT "ShopProduct".product_id FROM app_shops_datas.dat_${curr}_products AS "ShopProduct" WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id)) = "Product".id) ) AS product_id,
                               (SELECT "Product".product_type_id FROM app_datas.dat_products AS "Product" WHERE (((SELECT "ShopProduct".product_id FROM app_shops_datas.dat_${curr}_products AS "ShopProduct" WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id)) = "Product".id) ) AS product_type_id
                        FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                        WHERE "ShopServiceOrderList".status = 1
                          AND ((SELECT "ShopServiceOrderDoc".status
                                FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                AND "ShopServiceOrderDoc".status = 1
                                AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                AND "PaymentTransaction".canceled_payment_date IS NULL
                                AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                ORDER BY "PaymentTransaction".created_date desc
                                LIMIT 1
                                )
                            = 1)
                          AND ((SELECT "ShopProduct".id
                                FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                  AND ((SELECT "Product".id
                                        FROM app_datas.dat_products AS "Product"
                                        WHERE "Product".id = "ShopProduct".product_id
                                          AND ((SELECT "ProductType".id
                                                FROM master_lookup.mas_product_types AS "ProductType"
                                                WHERE "ProductType".id = "Product".product_type_id
                                                  AND ((SELECT "ProductTypeGroup".id
                                                        FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                        WHERE "ProductTypeGroup".id = "ProductType".type_group_id)
                                                    = "ProductType".type_group_id))
                                            = "Product".product_type_id))
                                    = "ShopProduct".product_id)
                            ) = "ShopServiceOrderList".shop_product_id)
                    ),
                    `;
            }, ``)}
                CTE_UNION AS (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_${curr})
                            `;
                }
            }, ``)}
                ),
                CTE_SalesType AS (
                    SELECT row_number() OVER (ORDER BY CTE_UNION_T.sales DESC) AS no,
                    CTE_UNION_T.product_type_id,
                    (SELECT "ProductType".type_name->>'th' FROM master_lookup.mas_product_types AS "ProductType" WHERE "ProductType".id = CTE_UNION_T.product_type_id) AS type_name,
                    (CTE_UNION_T.sales)::float AS sales
                        FROM (
                            SELECT CTE_UNION.product_type_id, sum(CTE_UNION.price_grand_total - CTE_UNION.proportion_discount_price) AS sales
                            FROM CTE_UNION
                            GROUP BY CTE_UNION.product_type_id
                            ORDER BY sum(CTE_UNION.price_grand_total - CTE_UNION.proportion_discount_price) DESC
                        LIMIT 10
                    ) AS CTE_UNION_T
                )
                SELECT
                    t1.no AS no,
                    t1.product_type_id AS product_type_id,
                    CASE WHEN t1.type_name IS NULL THEN 'ไม่ทราบชื่อประเภทสินค้า' ELSE t1.type_name END AS type_name,
                    t1.sales AS sales,
                    "color"->>'color' AS color
                FROM CTE_SalesType AS t1
                    LEFT JOIN unnest(
                        ARRAY [
                            json_build_object('no',1,'color','#04afe3'),
                            json_build_object('no',2,'color','#a441d8'),
                            json_build_object('no',3,'color','#25d646'),
                            json_build_object('no',4,'color','#eadc2d'),
                            json_build_object('no',5,'color','#ed3e3e'),
                            json_build_object('no',6,'color','#9403fc'),
                            json_build_object('no',7,'color','#2329db'),
                            json_build_object('no',8,'color','#ed1ad8'),
                            json_build_object('no',9,'color','#ed1a56'),
                            json_build_object('no',10,'color','#ed1a59')
                        ]
                    ) AS "color" ON t1.no::text = "color"->>'no';
            `,
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        let percent = data_new.reduce(
            (accumulator, currentValue) => accumulator + parseFloat(currentValue.sales),
            0,
        );


        return utilSetFastifyResponseJson("success", data_new.reduce((previousValue, currentValue, index) => {
            if (index <= 4) {
                currentValue.sales = toNumberCurrencyFormat(currentValue.sales);
                currentValue.percent = toNumberCurrencyFormat(currentValue.sales * 100 / percent)
                previousValue.push(currentValue);
            }

            return previousValue;
        }, []));

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

const dailyFinanceInfo = async (request = {}, reply = {}, options = {}) => {
    const action = 'dashboard daily info'
    try {

        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');


        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        /**
         * @type {string}
         */
        const start_date = request.query.start_date ? fnGetDateOnlyFromRequest(request.query.start_date) : moment().startOf('month').format('YYYY-MM-DD');
        /**
         * @type {string}
         */
        const end_date = request.query.end_date ? fnGetDateOnlyFromRequest(request.query.end_date) : moment().endOf('month').format('YYYY-MM-DD');


        const data_product_sales = await db.query(
            `
                WITH
                    ${table_name.reduce((prev, curr) => {
                return prev + `
                        CTE_${curr} AS (
                            SELECT *,
                            (SELECT tax_type_id  FROM app_shops_datas.dat_${curr}_service_order_doc where  id = "ShopServiceOrderList".shop_service_order_doc_id ) tax_type_id
                            FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                            WHERE "ShopServiceOrderList".status = 1
                              AND ((SELECT "ShopServiceOrderDoc".status
                                    FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                    JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                    WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                    AND "ShopServiceOrderDoc".status = 1
                                    AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                    AND "PaymentTransaction".canceled_payment_date IS NULL
                                    AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                    ORDER BY "PaymentTransaction".created_date desc
                                    LIMIT 1
                                    )
                                = 1)
                              AND ((SELECT "ShopProduct".id
                                    FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                    WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                        AND ((SELECT "Product".id
                                              FROM app_datas.dat_products AS "Product"
                                              WHERE "Product".id = "ShopProduct".product_id
                                                AND ((SELECT "ProductType".id
                                                      FROM master_lookup.mas_product_types AS "ProductType"
                                                      WHERE "ProductType".id = "Product".product_type_id
                                                        AND ((SELECT "ProductTypeGroup".id
                                                              FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                              WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                                AND "ProductTypeGroup".isstock = true
                                                                AND "ProductTypeGroup".id != 'a613cd37-8725-4c0e-ba5f-2ea021846dc7')
                                                            = "ProductType".type_group_id))
                                                    = "Product".product_type_id))
                                             = "ShopProduct".product_id)
                                ) = "ShopServiceOrderList".shop_product_id)
                        ),
                        `;
            }, ``)}
                    CTE_UNION AS (
                        ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                    (SELECT *
                                    FROM CTE_${curr})
                                `;
                }
                else {
                    return prev + `
                                    UNION ALL
                                    (SELECT *
                                        FROM CTE_${curr})
                                `;
                }
            }, ``)}
                    )
               -- SELECT sum(coalesce((CTE_UNION.details->>'price_grand_total_add_vat')::numeric(20,2),CTE_UNION.price_grand_total) - CTE_UNION.proportion_discount_price)::float AS "product_sales"
                SELECT
                CASE
                 WHEN CTE_UNION.tax_type_id = '8c73e506-31b5-44c7-a21b-3819bb712321' THEN sum(CTE_UNION.price_grand_total)::float
                 WHEN CTE_UNION.tax_type_id = '52b5a676-c331-4d03-b650-69fc5e591d2c' THEN sum(CTE_UNION.price_grand_total)::float
                 WHEN CTE_UNION.tax_type_id = 'fafa3667-55d8-49d1-b06c-759c6e9ab064' THEN sum(CTE_UNION.price_grand_total * 107/100)::float 
                END  "product_sales"
                FROM CTE_UNION
                GROUP BY CTE_UNION.tax_type_id
            `.replace(/(--.*\n)/ig, ' ').replace(/\s+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        const data_product_cost = await db.query(
            `
                WITH
                    ${table_name.reduce((prev, curr) => {
                return prev + `
                        CTE_${curr} AS (
                            SELECT *,
                            (
                                SELECT avg(coalesce(X.product_cost,0))::numeric(20,2) AS product_cost_average
                                FROM ( 
                                    SELECT (
                                        coalesce( "ShopInventoryImportLog".details->>'price_grand_total',
                                                 (
                                                     ((coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                      - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                     )::float
                                                 )::text
                                                )::numeric(20,2) / "ShopInventoryImportLog".amount
                                    )::numeric(20,2) product_cost
                                    FROM app_shops_datas.dat_${curr}_inventory_management_logs AS "ShopInventoryImportLog"
                                        CROSS JOIN json_array_elements(warehouse_detail) AS "ShopWarehouseDetail"
                                    WHERE "ShopInventoryImportLog".status = 1
                                      AND "ShopInventoryImportLog".amount > 0
                                      AND ((SELECT "ShopInventoryImportDoc".status
                                            FROM app_shops_datas.dat_${curr}_inventory_transaction_doc AS "ShopInventoryImportDoc"
                                            WHERE "ShopInventoryImportDoc".id = "ShopInventoryImportLog".doc_inventory_id)
                                           = 1)
                                      AND (coalesce(
                                            "ShopInventoryImportLog".details->>'price_grand_total',
                                            (
                                                (
                                                    (coalesce(("ShopInventoryImportLog".details->>'total_price'), '0'))::float
                                                        - (coalesce(("ShopInventoryImportLog".details->>'discount_thb'), '0'))::float
                                                )::float
                                            )::text
                                        )::numeric(20,2) > 0)
                                     AND product_id = "ShopServiceOrderList".shop_product_id
                                ) as X
                            ) product_cost_average
                            FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                            WHERE "ShopServiceOrderList".status = 1
                              AND ((SELECT "ShopServiceOrderDoc".status
                                    FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                    JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                    WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                    AND "ShopServiceOrderDoc".status = 1
                                    AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                    AND "PaymentTransaction".canceled_payment_date IS NULL
                                    AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                    ORDER BY "PaymentTransaction".created_date desc
                                    LIMIT 1
                                    )
                                = 1)
                              AND ((SELECT "ShopProduct".id
                                    FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                    WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                        AND ((SELECT "Product".id
                                              FROM app_datas.dat_products AS "Product"
                                              WHERE "Product".id = "ShopProduct".product_id
                                                AND ((SELECT "ProductType".id
                                                      FROM master_lookup.mas_product_types AS "ProductType"
                                                      WHERE "ProductType".id = "Product".product_type_id
                                                        AND ((SELECT "ProductTypeGroup".id
                                                              FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                              WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                                AND "ProductTypeGroup".isstock = true
                                                                AND "ProductTypeGroup".id != 'a613cd37-8725-4c0e-ba5f-2ea021846dc7')
                                                            = "ProductType".type_group_id))
                                                    = "Product".product_type_id))
                                             = "ShopProduct".product_id)
                                ) = "ShopServiceOrderList".shop_product_id)
                        ),
                        `;
            }, ``)}
                    CTE_UNION AS (
                        ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                    (SELECT *
                                    FROM CTE_${curr})
                                `;
                }
                else {
                    return prev + `
                                    UNION ALL
                                    (SELECT *
                                        FROM CTE_${curr})
                                `;
                }
            }, ``)}
                    )
                SELECT sum(CTE_UNION.product_cost_average * CTE_UNION.amount)::float AS "product_cost"
                FROM CTE_UNION
            `.replace(/(--.*\n)/ig, ' ').replace(/\s+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        const data_service_fee = await db.query(
            `
                WITH
                    ${table_name.reduce((prev, curr) => {
                return prev + `
                        CTE_${curr} AS (
                            SELECT *
                            FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                            WHERE "ShopServiceOrderList".status = 1
                              AND ((SELECT "ShopServiceOrderDoc".status
                                    FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                    JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                    WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                    AND "ShopServiceOrderDoc".status = 1
                                    AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                    AND "PaymentTransaction".canceled_payment_date IS NULL
                                    AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                    ORDER BY "PaymentTransaction".created_date desc
                                    LIMIT 1
                                    )
                                = 1)
                              AND ((SELECT "ShopProduct".id
                                    FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                    WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                        AND ((SELECT "Product".id
                                              FROM app_datas.dat_products AS "Product"
                                              WHERE "Product".id = "ShopProduct".product_id
                                                AND ((SELECT "ProductType".id
                                                      FROM master_lookup.mas_product_types AS "ProductType"
                                                      WHERE "ProductType".id = "Product".product_type_id
                                                        AND ((SELECT "ProductTypeGroup".id
                                                              FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                              WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                                AND "ProductTypeGroup".isstock = false
                                                                AND "ProductTypeGroup".id = 'a613cd37-8725-4c0e-ba5f-2ea021846dc7')
                                                            = "ProductType".type_group_id))
                                                    = "Product".product_type_id))
                                             = "ShopProduct".product_id)
                                ) = "ShopServiceOrderList".shop_product_id)
                        ),
                        `;
            }, ``)}
                    CTE_UNION AS (
                        ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                    (SELECT *
                                    FROM CTE_${curr})
                                `;
                }
                else {
                    return prev + `
                                    UNION ALL
                                    (SELECT *
                                        FROM CTE_${curr})
                                `;
                }
            }, ``)}
                    )
                SELECT sum(CTE_UNION.price_grand_total - CTE_UNION.proportion_discount_price)::float AS "service_fee"
                FROM CTE_UNION
            `.replace(/(--.*\n)/ig, ' ').replace(/\s+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        const data_total_income = await db.query(
            `
                WITH
                    ${table_name.reduce((prev, curr) => {
                return prev + `
                        CTE_${curr} AS (
                            SELECT * 
                            FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc_"
                            WHERE "ShopServiceOrderDoc_".status = 1
                            AND ((SELECT "ShopServiceOrderDoc".status
                                  FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                  JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                  WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderDoc_".id
                                  AND "ShopServiceOrderDoc".status = 1
                                  AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                  AND "PaymentTransaction".canceled_payment_date IS NULL
                                  AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                  ORDER BY "PaymentTransaction".created_date desc
                                  LIMIT 1
                                  )
                              = 1)
                        ),
                        `;
            }, ``)}
                    CTE_UNION AS (
                        ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                    (SELECT *
                                    FROM CTE_${curr})
                                `;
                }
                else {
                    return prev + `
                                    UNION ALL
                                    (SELECT *
                                        FROM CTE_${curr})
                                `;
                }
            }, ``)}
                    )
                SELECT sum(CTE_UNION.price_grand_total)::float AS "total_income"
                FROM CTE_UNION
            `.replace(/(--.*\n)/ig, ' ').replace(/\s+/ig, ' '),
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        const sumOf_product_sales = data_product_sales.reduce((p, c) => p + c.product_sales, 0);
        const sumOf_product_cost = data_product_cost.reduce((p, c) => p + c.product_cost, 0);
        const sumOf_service_fee = data_service_fee.reduce((p, c) => p + c.service_fee, 0);
        const sumOf_total_income = data_total_income.reduce((p, c) => p + c.total_income, 0);

        const data = {
            product_sales: toNumberCurrencyFormat(sumOf_product_sales),
            product_cost: toNumberCurrencyFormat(sumOf_product_cost),
            product_profit: toNumberCurrencyFormat(sumOf_product_sales - sumOf_product_cost),
            product_profit_percent: toNumberCurrencyFormat(
                Number(
                    (
                        (sumOf_product_sales - sumOf_product_cost)
                        / sumOf_product_cost
                    ) * 100
                )
                || 0
            ),
            service_fee: toNumberCurrencyFormat(sumOf_service_fee),
            total_income: toNumberCurrencyFormat(sumOf_total_income),
        };

        return utilSetFastifyResponseJson("success", data);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}


const numberOfIncomeThisMonth = async (request = {}, reply = {}, options = {}) => {
    const action = 'dashboard number of user this month';

    try {

        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];


        const date = new Date()
            , y = date.getFullYear()
            , m = date.getMonth();
        const this_year = new Date().getFullYear();
        const this_month = ('0' + (m + 1)).slice(-2);

        /**
       * @type {string}
       */
        const req_start_year_month = request.query.start_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_start_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }

        const req_end_year_month = request.query.end_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_end_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }


        const moment_start_date = moment(req_start_year_month, 'YYYY-MM', true).startOf('month');
        const start_date = moment_start_date.format('YYYY-MM-DD');

        const moment_end_date = moment(req_end_year_month, 'YYYY-MM', true).endOf('month');
        const end_date = moment_end_date.format('YYYY-MM-DD');

        const day = [];
        for (let index = 1; index <= 31; index++) {
            day.push(index);
        }

        const labelYears = [];
        for (let year = moment(req_start_year_month).year(); year <= moment(req_end_year_month).year(); year++) {
            labelYears.push(year);
        }



        const data_new = await db.query(
            `
                WITH
                ${table_name.reduce((prev, curr) => {
                return prev + `
                    CTE_${curr} AS (
                        SELECT "ShopServiceOrderList".price_grand_total as price_grand_total,
                        date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') AS "PaymentDate"
                        FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                        JOIN app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                            ON "ShopServiceOrderDoc".id =  "ShopServiceOrderList".shop_service_order_doc_id
                            AND "ShopServiceOrderDoc".status = 1
                            AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                        WHERE "ShopServiceOrderList".status = 1
                        AND date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')
                        BETWEEN '${start_date}' AND '${end_date}'
                       
                    ),
                    `;
            }, ``)}
                CTE_UNION AS (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_${curr})
                            `;
                }
            }, ``)}
                )
                SELECT 
                ARRAY[${day}] as "labels",
                ARRAY(
                    SELECT(
                        SELECT json_build_object(
                            'total_qty', coalesce(sum("ShopServiceOrderDoc".price_grand_total), 0)::float,
                            'label','จำนวนเงิน (บาท)',
                            'labels', concat("Year",'-',  TO_CHAR("Month", 'fm00')),
                            'borderColor', '#ffcc00',
                            'backgroundColor', '#ffcc00',
                            'type','line',
                            'data',ARRAY(
                                    SELECT (
                                        SELECT coalesce(sum("ShopServiceOrderDoc".price_grand_total), 0)::float AS total_qty
                                        FROM CTE_UNION as "ShopServiceOrderDoc"
                                        WHERE EXTRACT(YEAR FROM "ShopServiceOrderDoc"."PaymentDate") = "Year"
                                        AND EXTRACT(MONTH FROM "ShopServiceOrderDoc"."PaymentDate") = "Month"
                                        AND EXTRACT(DAY FROM "ShopServiceOrderDoc"."PaymentDate") = "day"
                                    ) 
                                    FROM unnest(ARRAY[${day}]) "day"
                                   )
                            )
                        FROM CTE_UNION AS "ShopServiceOrderDoc"
                        WHERE EXTRACT(YEAR FROM "ShopServiceOrderDoc"."PaymentDate") = "Year"
                        AND EXTRACT(MONTH FROM "ShopServiceOrderDoc"."PaymentDate") = "Month"
                        )
                    FROM unnest(ARRAY [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) AS "Month"
                    JOIN unnest(ARRAY [${labelYears}]) AS "Year" ON 1=1
                    WHERE date(concat("Year",'-',"Month",'-01')) BETWEEN '${start_date}' AND '${end_date}'
                ) as "datasets";
                
            `,
            {
                type: QueryTypes.SELECT,
                raw: true
            }
        );


        return utilSetFastifyResponseJson("success", data_new[0]);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
};


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const numberOfSalesTireAmountByDateRange = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET Dashboard numberOfSalesTireAmountDateRange';

    try {


        let data_from_another_fun = await dailyInfo(request)

        let data_ = {
            number_of_sales_tire_amount_by_date_range: data_from_another_fun.data?.tire || 0,
        };

        return utilSetFastifyResponseJson("success", data_);


        //     const shop_table = await utilCheckShopTableName(request);
        //     const table_name = shop_table.shop_code_id;
        //     const shop_ids = [table_name.toLowerCase()];

        //     /**
        //      * @param value {string}
        //      * @return {string}
        //      */
        //     const fnGetDateOnlyFromRequest = (value = '') => {
        //         const inputDate = moment(value, 'YYYY-MM-DD', true);
        //         if (inputDate.isValid()) {
        //             return inputDate.format('YYYY-MM-DD');
        //         }
        //         else {
        //             throw Error('รูปแบบข้อมูลวันที่ส่งเข้ามาไม่ถูกต้อง');
        //         }
        //     };

        //     /**
        //      * @type {string}
        //      */
        //     const start_date = request.query.start_date ? fnGetDateOnlyFromRequest(request.query.start_date) : moment().startOf('month').format('YYYY-MM-DD');
        //     /**
        //      * @type {string}
        //      */
        //     const end_date = request.query.end_date ? fnGetDateOnlyFromRequest(request.query.end_date) : moment().endOf('month').format('YYYY-MM-DD');

        //     /**
        //      * @return {string}
        //      */
        //     const fnGenerateCTEShop = () => {
        //         const sqlCTEShops = shop_ids.reduce((prev, curr, idx) => {
        //             const sqlBaseString =
        //                 `
        //                     SELECT
        //                         "ShopServiceOrderList".shop_id AS "ShopId",
        //                         "ShopServiceOrderList".id AS "ShopServiceOrderList",
        //                         "ShopServiceOrderList".amount AS "Amount",
        //                         date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${table_name}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') AS "PaymentDate"
        //                     FROM app_shops_datas.dat_${table_name}_service_order_list AS "ShopServiceOrderList"
        //                         JOIN app_shops_datas.dat_${table_name}_service_order_doc AS "ShopServiceOrderDoc"
        //                     ON "ShopServiceOrderDoc".id =  "ShopServiceOrderList".shop_service_order_doc_id
        //                         AND "ShopServiceOrderDoc".status = 1
        //                         AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
        //                     WHERE "ShopServiceOrderList".status = 1
        //                       AND "ShopServiceOrderDoc".status = 1
        //                       AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
        //                       AND ((SELECT "ShopProduct".id
        //                             FROM app_shops_datas.dat_${table_name}_products AS "ShopProduct"
        //                             WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
        //                               AND ((SELECT "Product".id
        //                                     FROM app_datas.dat_products AS "Product"
        //                                     WHERE "Product".id = "ShopProduct".product_id
        //                                       AND ((SELECT "ProductType".id
        //                                             FROM master_lookup.mas_product_types AS "ProductType"
        //                                             WHERE "ProductType".id = "Product".product_type_id
        //                                               AND ((SELECT "ProductTypeGroup".id
        //                                                     FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
        //                                                     WHERE "ProductTypeGroup".id = "ProductType".type_group_id
        //                                                       AND "ProductTypeGroup".id = 'da791822-401c-471b-9b62-038c671404ab')
        //                                             = "ProductType".type_group_id))
        //                                     = "Product".product_type_id))
        //                                     = "ShopProduct".product_id)
        //                             ) = "ShopServiceOrderList".shop_product_id)
        //                       AND date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${table_name}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')
        //                         BETWEEN :start_date AND :end_date
        //                 `;
        //             if (idx === 0) {
        //                 return `
        //                     CTE_Shop_${shop_ids[idx].toLowerCase()} AS (
        //                             ${sqlBaseString.replace(/(_${table_name}_)/g, `_${shop_ids[idx].toLowerCase()}_`)}
        //                     )
        //                 `;
        //             }
        //             else {
        //                 return `
        //                     ${prev},
        //                     CTE_Shop_${shop_ids[idx].toLowerCase()} AS (
        //                         ${sqlBaseString.replace(/(_${table_name}_)/g, `_${shop_ids[idx].toLowerCase()}_`)}
        //                     )
        //                 `;
        //             }
        //         }, ``);
        //         const sqlCTEShopAll = shop_ids.reduce((prev, curr, idx) => {
        //             if (idx === 0) {
        //                 return `,CTE_Shop_All AS (SELECT * FROM CTE_Shop_${shop_ids[idx].toLowerCase()})`;
        //             }
        //             else {
        //                 return `
        //                     (${prev})
        //                     UNION ALL
        //                     (SELECT * FROM CTE_Shop_${shop_ids[idx].toLowerCase()})
        //                 `;
        //             }
        //         }, ``);
        //         const sqlQuery = `
        //             WITH
        //             ${sqlCTEShops}
        //             ${sqlCTEShopAll}
        //             SELECT sum("Amount") AS "Amount"
        //             FROM CTE_Shop_All;
        //         `;

        //         return sqlQuery;
        //     };

        //     const sqlCommand = fnGenerateCTEShop();
        //     const queryResult = await db.query(
        //         sqlCommand,
        //         {
        //             type: QueryTypes.SELECT,
        //             replacements: {
        //                 start_date: start_date,
        //                 end_date: end_date
        //             }
        //         }
        //     );

        //     /**
        //      * @type {{tire_sales_amount_by_date_range: number}}
        //      */
        //     const data = {
        //         number_of_sales_tire_amount_by_date_range: Number(queryResult[0].Amount) || 0,
        //     };

        //     return utilSetFastifyResponseJson("success", data);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);
        return utilSetFastifyResponseJson("failed", error.toString());
    }
};



/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const compareYearlySalesAmount = async (request = {}, reply = {}, options = {}) => {
    const action = request.query.action

    try {
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const shop_ids = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        const configColorSelectors = [
            '#80e2ff',
            '#04afe3'
        ];

        /**
         * @type {string[]}
         */
        const req_start_year = request.query.start_year ? request.query.start_year : moment(new Date()).format('YYYY');

        const req_end_year = request.query.end_year ? request.query.end_year : moment(new Date()).format('YYYY');

        let req_arr_year = []
        for (let index = req_start_year; index <= req_end_year; index++) {
            req_arr_year.push(parseInt(index))
        }

        req_arr_year.forEach(ele => {
            if (!moment(ele, 'YYYY', true).isValid()) {
                throw Error('รูปแบบข้อมูลปี YYYY ไม่ถูกต้อง');
            }
        });


        /**
         * @return {string}
         */
        const fnGenerateCTEShop = () => {
            const sqlCTEShops = shop_ids.reduce((prev, curr, idx) => {
                const sqlBaseString =
                    `
                        SELECT
                            "ShopServiceOrderList".shop_id AS "ShopId",
                            "ShopServiceOrderList".id AS "ShopServiceOrderList",
                            "ShopServiceOrderList".amount AS "Amount",
                            date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') AS "PaymentDate"
                        FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                            JOIN app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                        ON "ShopServiceOrderDoc".id =  "ShopServiceOrderList".shop_service_order_doc_id
                            AND "ShopServiceOrderDoc".status = 1
                            AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                        WHERE "ShopServiceOrderList".status = 1
                          AND "ShopServiceOrderDoc".status = 1
                          AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                          AND ((SELECT "ShopProduct".id
                                FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                      AND ((SELECT "Product".id
                                            FROM app_datas.dat_products AS "Product"
                                            WHERE "Product".id = "ShopProduct".product_id
                                                  AND ((SELECT "ProductType".id
                                                        FROM master_lookup.mas_product_types AS "ProductType"
                                                        WHERE "ProductType".id = "Product".product_type_id
                                                          AND ((SELECT "ProductTypeGroup".id
                                                                FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                                WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                                  AND "ProductTypeGroup".id = :type_group_id )
                                                                    = "ProductType".type_group_id))
                                                                    = "Product".product_type_id))
                                                                    = "ShopProduct".product_id)
                                                                    ) = "ShopServiceOrderList".shop_product_id)
                        AND (
                            ${req_arr_year.reduce((prev1, curr1, idx1) => {
                        if (idx1 === 0) {
                            return `
                                        (
                                            date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')
                                                BETWEEN '${curr1}-01-01' AND '${curr1}-12-31'
                                        )
                                    `
                        }
                        else {
                            return `
                                        ${prev1}
                                        OR
                                        (
                                            date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')
                                                BETWEEN '${curr1}-01-01' AND '${curr1}-12-31'
                                        )
                                    `
                        }
                    }, ``)}
                        )
                    `;
                if (idx === 0) {
                    return `
                        CTE_Shop_${shop_ids[idx].toLowerCase()} AS (
                                ${sqlBaseString.replace(/(_${table_name}_)/g, `_${shop_ids[idx].toLowerCase()}_`)}
                        )
                    `;
                }
                else {
                    return `
                        ${prev},
                        CTE_Shop_${shop_ids[idx].toLowerCase()} AS (
                            ${sqlBaseString.replace(/(_${table_name}_)/g, `_${shop_ids[idx].toLowerCase()}_`)}
                        )
                    `;
                }
            }, ``);

            let sqlCTEShopAll = `,CTE_Shop_All AS (` + shop_ids.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_Shop_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_Shop_${curr})
                            `;
                }
            }, ``)
            sqlCTEShopAll = sqlCTEShopAll + ')'
            const sqlQuery = `
                WITH
                    ${sqlCTEShops}
                    ${sqlCTEShopAll}
                SELECT
                    ARRAY ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] AS "labels",
                    ARRAY (
                        SELECT (
                            SELECT jsonb_build_object(
                                'amount', coalesce(sum("Year_ShopsSalesDoc"."Amount"), 0),
                                'label', "Year",
                                'borderColor', "color"->>'color',
                                'backgroundColor', "color"->>'color',
                                'data', ARRAY(
                                    SELECT (
                                        SELECT coalesce(sum("Month_ShopsSalesDoc"."Amount"), 0)
                                        FROM CTE_Shop_All AS "Month_ShopsSalesDoc"
                                        WHERE EXTRACT(YEAR FROM "Month_ShopsSalesDoc"."PaymentDate") = "Year"
                                            AND EXTRACT(MONTH FROM "Month_ShopsSalesDoc"."PaymentDate") = "Month"
                                    )
                                    FROM unnest(ARRAY [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) AS "Month"
                                )
                            )
                            FROM CTE_Shop_All AS "Year_ShopsSalesDoc"
                            WHERE EXTRACT(YEAR FROM "Year_ShopsSalesDoc"."PaymentDate") = "Year"
                        )
                        FROM unnest(ARRAY [${req_arr_year}]) AS "Year"
                            LEFT JOIN unnest(
                                ARRAY [
                                   ${req_arr_year.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return `
                                           jsonb_build_object(
                                               'year', ${curr},
                                               'color', '${configColorSelectors[idx] || '#80e2ff'}'
                                           )
                                           `;
                }
                else {
                    return `
                                           ${prev},
                                           jsonb_build_object(
                                               'year', ${curr},
                                               'color', '${configColorSelectors[idx] || '#80e2ff'}'
                                           )
                                           `;
                }
            }, ``)}
                                ]
                            ) AS color ON cast(color->>'year' AS int) = "Year"
                    ) AS "datasets";
            `;

            return sqlQuery;
        };

        const sqlCommand = fnGenerateCTEShop();
        const queryResult = await db.query(
            sqlCommand,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    type_group_id: request.query.type_group_id
                }
            }
        );

        return utilSetFastifyResponseJson("success", queryResult);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);
        return utilSetFastifyResponseJson("failed", error.toString());
    }
};


const compareYearlySalesTireAmount = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET Dashboard compareYearlySalesTireAmount';

    try {
        request.query.action = action
        request.query.type_group_id = tire_id
        return await compareYearlySalesAmount(request)

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

const compareYearlySalesSpareAmount = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET Dashboard compareYearlySalesSpareAmount';

    try {
        request.query.action = action
        request.query.type_group_id = spares_id
        return await compareYearlySalesAmount(request)

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}



/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const numberOfSalesAmountByMonth = async (request = {}, reply = {}, options = {}) => {
    const action = request.query.action

    try {
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const shop_ids = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        const configLineDashboardColor = {
            borderColor: '#ffcc00',
            backgroundColor: '#ffcc00'
        };


        /**
         * @type {string}
         */
        const req_start_year_month = request.query.start_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_start_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }

        const req_end_year_month = request.query.end_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_end_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }


        const moment_start_date = moment(req_start_year_month, 'YYYY-MM', true).startOf('month');
        const start_date = moment_start_date.format('YYYY-MM-DD');

        const moment_end_date = moment(req_end_year_month, 'YYYY-MM', true).endOf('month');
        const end_date = moment_end_date.format('YYYY-MM-DD');


        /**
         * @type {string[]}
         */
        const labelDays = [];
        // const endDaysRange = moment_end_date.diff(moment_start_date, 'day') + 1;
        for (let day = 1; day <= 31; day++) {
            labelDays.push(String(day));
        }

        const labelYears = [];
        for (let year = moment(req_start_year_month).year(); year <= moment(req_end_year_month).year(); year++) {
            labelYears.push(year);
        }


        /**
         * @return {string}
         */
        const fnGenerateCTEShop = () => {
            const sqlCTEShops = shop_ids.reduce((prev, curr, idx) => {
                const sqlBaseString =
                    `
                        SELECT
                            "ShopServiceOrderList".shop_id AS "ShopId",
                            "ShopServiceOrderList".id AS "ShopServiceOrderList",
                            "ShopServiceOrderList".amount AS "Amount",
                            date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') AS "PaymentDate"
                        FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                        JOIN app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                            ON "ShopServiceOrderDoc".id =  "ShopServiceOrderList".shop_service_order_doc_id
                            AND "ShopServiceOrderDoc".status = 1
                            AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                        WHERE "ShopServiceOrderList".status = 1
                        AND ((SELECT "ShopProduct".id
                            FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                            WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                AND ((SELECT "Product".id
                                    FROM app_datas.dat_products AS "Product"
                                    WHERE "Product".id = "ShopProduct".product_id
                                        AND ((SELECT "ProductType".id
                                            FROM master_lookup.mas_product_types AS "ProductType"
                                            WHERE "ProductType".id = "Product".product_type_id
                                                AND ((SELECT "ProductTypeGroup".id
                                                    FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                    WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                        AND "ProductTypeGroup".id = :type_group_id)
                                                        = "ProductType".type_group_id))
                                                        = "Product".product_type_id))
                                                        = "ShopProduct".product_id)
                                                        ) = "ShopServiceOrderList".shop_product_id)
                        AND date((SELECT max("PaymentTransaction".payment_paid_date) FROM app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" WHERE "PaymentTransaction".shop_service_order_doc_id = "ShopServiceOrderDoc".id AND "PaymentTransaction".canceled_payment_date IS NULL)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')
                        BETWEEN '${start_date}' AND '${end_date}'
                    `;
                if (idx === 0) {
                    return `
                        CTE_Shop_${shop_ids[idx].toLowerCase()} AS (
                                ${sqlBaseString.replace(/(_${table_name}_)/g, `_${shop_ids[idx].toLowerCase()}_`)}
                        )
                    `;
                }
                else {
                    return `
                        ${prev},
                        CTE_Shop_${shop_ids[idx].toLowerCase()} AS (
                            ${sqlBaseString.replace(/(_${table_name}_)/g, `_${shop_ids[idx].toLowerCase()}_`)}
                        )
                    `;
                }
            }, ``);

            let sqlCTEShopAll = `,CTE_Shop_All AS (` + shop_ids.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_Shop_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_Shop_${curr})
                            `;
                }
            }, ``)
            sqlCTEShopAll = sqlCTEShopAll + ')'

            const sqlQuery = `
                WITH
                    ${sqlCTEShops}
                    ${sqlCTEShopAll}
                SELECT
                    ARRAY [${labelDays}] AS "labels",
                    ARRAY (
                        SELECT (
                            SELECT jsonb_build_object(
                                'amount', coalesce(sum("Year_ShopsSalesDoc"."Amount"), 0),
                                'label','จำนวนเงิน (บาท)',
                                'labels', concat("Year",'-',  TO_CHAR("Month", 'fm00')),
                                'borderColor', '${configLineDashboardColor.borderColor}',
                                'backgroundColor', '${configLineDashboardColor.backgroundColor}',
                                'type', 'line',
                                'data', ARRAY(
                                    SELECT (
                                        SELECT coalesce(sum("Month_ShopsSalesDoc"."Amount"), 0)
                                        FROM CTE_Shop_All AS "Month_ShopsSalesDoc"
                                        WHERE EXTRACT(MONTH FROM "Month_ShopsSalesDoc"."PaymentDate") = "Month"
                                        AND EXTRACT(YEAR FROM "Month_ShopsSalesDoc"."PaymentDate") = "Year"
                                        AND EXTRACT(DAY FROM "Month_ShopsSalesDoc"."PaymentDate") = "Day"
                                    )
                                    FROM unnest(ARRAY [${labelDays}]) AS "Day"
                                )
                            )
                            FROM CTE_Shop_All AS "Year_ShopsSalesDoc"
                            WHERE EXTRACT(MONTH FROM "Year_ShopsSalesDoc"."PaymentDate") = "Month"
                            AND EXTRACT(YEAR FROM "Year_ShopsSalesDoc"."PaymentDate") = "Year"
                        )
                        FROM unnest(ARRAY [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) AS "Month"
                        JOIN unnest(ARRAY [${labelYears}]) AS "Year" ON 1=1
                        WHERE date(concat("Year",'-',"Month",'-01')) BETWEEN '${start_date}' AND '${end_date}'
                        

                    ) AS "datasets";
            `;

            return sqlQuery;
        };

        const sqlCommand = fnGenerateCTEShop();
        const queryResult = await db.query(
            sqlCommand,
            {
                type: QueryTypes.SELECT,
                replacements: { type_group_id: request.query.type_group_id }
            }
        );

        return utilSetFastifyResponseJson("success", queryResult);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);
        return utilSetFastifyResponseJson("failed", error.toString());
    }
};

const numberOfSalesTireAmountByMonth = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET Dashboard numberOfSalesTireAmountByMonth';

    try {
        request.query.action = action
        request.query.type_group_id = tire_id
        return await numberOfSalesAmountByMonth(request)

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

const numberOfSalesSpareAmountByMonth = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET Dashboard numberOfSalesSpareAmountByMonth';

    try {
        request.query.action = action
        request.query.type_group_id = spares_id
        return await numberOfSalesAmountByMonth(request)

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

const topSizeSales = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET dashboard sales ' + request.params.which;


    try {


        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        const req_start_year_month = request.query.start_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_start_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }

        const req_end_year_month = request.query.end_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_end_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }


        const moment_start_date = moment(req_start_year_month, 'YYYY-MM', true).startOf('month');
        let start_date = moment_start_date.format('YYYY-MM-DD');

        const moment_end_date = moment(req_end_year_month, 'YYYY-MM', true).endOf('month');
        let end_date = moment_end_date.format('YYYY-MM-DD');

        if (request.query.start_date) {
            start_date = request.query.start_date ? fnGetDateOnlyFromRequest(request.query.start_date) : moment().startOf('month').format('YYYY-MM-DD');
        }
        if (request.query.start_date) {
            end_date = request.query.end_date ? fnGetDateOnlyFromRequest(request.query.end_date) : moment().endOf('month').format('YYYY-MM-DD');
        }


        const data_new = await db.query(
            `
                WITH
                ${table_name.reduce((prev, curr) => {
                return prev + `
                    CTE_${curr} AS (
                        SELECT sum(amount) as amount,
                        (select cast(count(*) as int) from app_shops_datas.dat_${curr}_business_customers where id in(select bus_customer_id from app_shops_datas.dat_${curr}_service_order_doc doc where doc.id = shop_service_order_doc_id)) as "amount_ad_purchased_per",
                        (select cast(count(*) as int) from app_shops_datas.dat_${curr}_personal_customers where id in(select per_customer_id from app_shops_datas.dat_${curr}_service_order_doc doc where doc.id = shop_service_order_doc_id)) as "amount_ad_purchased_bus",
                               (SELECT "Product".complete_size_id FROM app_datas.dat_products AS "Product" WHERE (((SELECT "ShopProduct".product_id FROM app_shops_datas.dat_${curr}_products AS "ShopProduct" WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id)) = "Product".id) ) AS complete_size_id
                        FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                        WHERE "ShopServiceOrderList".status = 1
                          AND ((SELECT "ShopServiceOrderDoc".status
                                FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                AND "ShopServiceOrderDoc".status = 1
                                AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                AND "PaymentTransaction".canceled_payment_date IS NULL
                                AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                ORDER BY "PaymentTransaction".created_date desc
                                LIMIT 1
                                )
                            = 1)
                          AND ((SELECT "ShopProduct".id
                                FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                  AND ((SELECT "Product".id
                                        FROM app_datas.dat_products AS "Product"
                                        WHERE "Product".id = "ShopProduct".product_id
                                          AND ((SELECT "ProductType".id
                                                FROM master_lookup.mas_product_types AS "ProductType"
                                                WHERE "ProductType".id = "Product".product_type_id
                                                  AND ((SELECT "ProductTypeGroup".id
                                                        FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                        WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                        AND "ProductTypeGroup".id = :type_group_id)
                                                    = "ProductType".type_group_id))
                                            = "Product".product_type_id))
                                    = "ShopProduct".product_id)
                            ) = "ShopServiceOrderList".shop_product_id)
                        	GROUP BY "ShopServiceOrderList".shop_product_id,"ShopServiceOrderList".shop_service_order_doc_id
                    ),
                    `;
            }, ``)}
                CTE_UNION AS (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_${curr})
                            `;
                }
            }, ``)}
                )
 
                    SELECT row_number() OVER (ORDER BY CTE_UNION_T.sales DESC) AS no,
                    CTE_UNION_T.complete_size_id,
                    (SELECT "ProductCompleteSizes".complete_size_name->>'th' FROM master_lookup.mas_product_complete_sizes AS "ProductCompleteSizes" WHERE "ProductCompleteSizes".id = CTE_UNION_T.complete_size_id) AS complete_size_name,
                    (CTE_UNION_T.sales)::float AS amount,
                    CTE_UNION_T.amount_ad_purchased
                    FROM (
                        SELECT CTE_UNION.complete_size_id, sum(CTE_UNION.amount) AS sales,sum(CTE_UNION.amount_ad_purchased_bus + CTE_UNION.amount_ad_purchased_per) AS amount_ad_purchased
                        FROM CTE_UNION
                        GROUP BY CTE_UNION.complete_size_id
                        ORDER BY sum(CTE_UNION.amount) DESC
                        LIMIT 10
                    ) AS CTE_UNION_T
                
              
                
            `,
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    type_group_id: tire_id,
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        return utilSetFastifyResponseJson("success", data_new);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

const topType = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET dashboard sales ' + request.params.which;


    try {


        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        const req_start_year_month = request.query.start_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_start_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }

        const req_end_year_month = request.query.end_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_end_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }


        const moment_start_date = moment(req_start_year_month, 'YYYY-MM', true).startOf('month');
        let start_date = moment_start_date.format('YYYY-MM-DD');

        const moment_end_date = moment(req_end_year_month, 'YYYY-MM', true).endOf('month');
        let end_date = moment_end_date.format('YYYY-MM-DD');

        if (request.query.start_date) {
            start_date = request.query.start_date ? fnGetDateOnlyFromRequest(request.query.start_date) : moment().startOf('month').format('YYYY-MM-DD');
        }
        if (request.query.start_date) {
            end_date = request.query.end_date ? fnGetDateOnlyFromRequest(request.query.end_date) : moment().endOf('month').format('YYYY-MM-DD');
        }


        const which = request.params.which

        let type_group_id = (which == 'tire') ? tire_id : (which == 'spaire') ? spares_id : 'a613cd37-8725-4c0e-ba5f-2ea021846dc7'

        const data_new = await db.query(
            `
                WITH
                ${table_name.reduce((prev, curr) => {
                return prev + `
                    CTE_${curr} AS (
                        SELECT sum(amount) as amount,
                        (select cast(count(*) as int) from app_shops_datas.dat_${curr}_business_customers where id in(select bus_customer_id from app_shops_datas.dat_${curr}_service_order_doc doc where doc.id = shop_service_order_doc_id)) as "amount_ad_purchased_per",
                        (select cast(count(*) as int) from app_shops_datas.dat_${curr}_personal_customers where id in(select per_customer_id from app_shops_datas.dat_${curr}_service_order_doc doc where doc.id = shop_service_order_doc_id)) as "amount_ad_purchased_bus",
                               (SELECT "Product".id FROM app_datas.dat_products AS "Product" WHERE (((SELECT "ShopProduct".product_id FROM app_shops_datas.dat_${curr}_products AS "ShopProduct" WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id)) = "Product".id) ) AS product_id
                        FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                        WHERE "ShopServiceOrderList".status = 1
                          AND ((SELECT "ShopServiceOrderDoc".status
                                FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                AND "ShopServiceOrderDoc".status = 1
                                AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                AND "PaymentTransaction".canceled_payment_date IS NULL
                                AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                ORDER BY "PaymentTransaction".created_date desc
                                LIMIT 1
                                )
                            = 1)
                          AND ((SELECT "ShopProduct".id
                                FROM app_shops_datas.dat_${curr}_products AS "ShopProduct"
                                WHERE "ShopProduct".id = "ShopServiceOrderList".shop_product_id
                                  AND ((SELECT "Product".id
                                        FROM app_datas.dat_products AS "Product"
                                        WHERE "Product".id = "ShopProduct".product_id
                                          AND ((SELECT "ProductType".id
                                                FROM master_lookup.mas_product_types AS "ProductType"
                                                WHERE "ProductType".id = "Product".product_type_id
                                                  AND ((SELECT "ProductTypeGroup".id
                                                        FROM master_lookup.mas_product_type_groups "ProductTypeGroup"
                                                        WHERE "ProductTypeGroup".id = "ProductType".type_group_id
                                                        AND "ProductTypeGroup".id = :type_group_id)
                                                    = "ProductType".type_group_id))
                                            = "Product".product_type_id))
                                    = "ShopProduct".product_id)
                            ) = "ShopServiceOrderList".shop_product_id)
                        	GROUP BY "ShopServiceOrderList".shop_product_id,"ShopServiceOrderList".shop_service_order_doc_id
                    ),
                    `;
            }, ``)}
                CTE_UNION AS (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_${curr})
                            `;
                }
            }, ``)}
                )
 
                    SELECT row_number() OVER (ORDER BY CTE_UNION_T.sales DESC) AS no,
                    CTE_UNION_T.product_id,
                    (SELECT "Product".product_name->>'th' FROM app_datas.dat_products AS "Product" WHERE "Product".id = CTE_UNION_T.product_id) AS product_name,
                    (SELECT "Product".product_code FROM app_datas.dat_products AS "Product" WHERE "Product".id = CTE_UNION_T.product_id) AS product_code,
                    (CTE_UNION_T.sales)::float AS amount,
                    CTE_UNION_T.amount_ad_purchased
                    FROM (
                        SELECT CTE_UNION.product_id, sum(CTE_UNION.amount) AS sales,sum(CTE_UNION.amount_ad_purchased_bus + CTE_UNION.amount_ad_purchased_per) AS amount_ad_purchased
                        FROM CTE_UNION
                        GROUP BY CTE_UNION.product_id
                        ORDER BY sum(CTE_UNION.amount) DESC
                        LIMIT 10
                    ) AS CTE_UNION_T
                
            `,
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    type_group_id: type_group_id,
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        return utilSetFastifyResponseJson("success", data_new);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}
const topCustomer = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET dashboard sales ' + request.params.which;


    try {


        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');
        request.query.select_shop_ids = 'all'
        const findShopsProfileArrayAll = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const table_name = (findShopsProfileArrayAll.length > 1)
            ? findShopsProfileArray.map(w => w.shop_code_id)
            : [await utilCheckShopTableName(request, 'default').then((res) => { return res.shop_code_id })];

        const req_start_year_month = request.query.start_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_start_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }

        const req_end_year_month = request.query.end_year_month || moment(new Date()).format('YYYY-MM');
        if (!moment(req_end_year_month, 'YYYY-MM', true).isValid()) {
            throw Error('รูปแบบข้อมูล YYYY-MM ไม่ถูกต้อง');
        }


        const moment_start_date = moment(req_start_year_month, 'YYYY-MM', true).startOf('month');
        let start_date = moment_start_date.format('YYYY-MM-DD');

        const moment_end_date = moment(req_end_year_month, 'YYYY-MM', true).endOf('month');
        let end_date = moment_end_date.format('YYYY-MM-DD');

        if (request.query.start_date) {
            start_date = request.query.start_date ? fnGetDateOnlyFromRequest(request.query.start_date) : moment().startOf('month').format('YYYY-MM-DD');
        }
        if (request.query.start_date) {
            end_date = request.query.end_date ? fnGetDateOnlyFromRequest(request.query.end_date) : moment().endOf('month').format('YYYY-MM-DD');
        }


        const data_new = await db.query(
            `
                WITH
                ${table_name.reduce((prev, curr) => {
                return prev + `
                    CTE_${curr} AS (
                        SELECT shop_service_order_doc_id,sum(price_grand_total) as price_grand_total,sum(proportion_discount_price) as proportion_discount_price,
                        (select customer_name->>'th' from app_shops_datas.dat_${curr}_business_customers where id = (select bus_customer_id from app_shops_datas.dat_${curr}_service_order_doc doc where doc.id = shop_service_order_doc_id)) as "bus_customer_name",
                        (select CONCAT(customer_name->'first_name'->>'th' ,' ',customer_name->'last_name'->>'th' ) from app_shops_datas.dat_${curr}_personal_customers where id in(select per_customer_id from app_shops_datas.dat_${curr}_service_order_doc doc where doc.id = shop_service_order_doc_id)) as "per_customer_name"
                        FROM app_shops_datas.dat_${curr}_service_order_list AS "ShopServiceOrderList"
                        WHERE "ShopServiceOrderList".status = 1
                          AND ((SELECT "ShopServiceOrderDoc".status
                                FROM app_shops_datas.dat_${curr}_service_order_doc AS "ShopServiceOrderDoc"
                                JOIN app_shops_datas.dat_${curr}_payment_transaction AS "PaymentTransaction" ON "ShopServiceOrderDoc".id = "PaymentTransaction".shop_service_order_doc_id 
                                WHERE "ShopServiceOrderDoc".id = "ShopServiceOrderList".shop_service_order_doc_id
                                AND "ShopServiceOrderDoc".status = 1
                                AND "ShopServiceOrderDoc".payment_paid_status IN (3,4,5)
                                AND "PaymentTransaction".canceled_payment_date IS NULL
                                AND date(("PaymentTransaction".payment_paid_date)::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') BETWEEN :start_date AND :end_date
                                ORDER BY "PaymentTransaction".created_date desc
                                LIMIT 1
                                )
                            = 1)
                        GROUP BY "ShopServiceOrderList".shop_service_order_doc_id

                    ),
                    `;
            }, ``)}
                CTE_UNION AS (
                    ${table_name.reduce((prev, curr, idx) => {
                if (idx === 0) {
                    return prev + `
                                (SELECT *
                                FROM CTE_${curr})
                            `;
                }
                else {
                    return prev + `
                                UNION ALL
                                (SELECT *
                                    FROM CTE_${curr})
                            `;
                }
            }, ``)}
                )
 
                    SELECT row_number() OVER (ORDER BY CTE_UNION_T.amount_ad_purchased DESC) AS no,
                    CTE_UNION_T.customer_name,
                    (CTE_UNION_T.sales)::int AS amount,
                    CTE_UNION_T.amount_ad_purchased
                    FROM (
                        SELECT 
                        CASE
                            WHEN (CTE_UNION.bus_customer_name IS NOT NULL )  THEN bus_customer_name
                            WHEN (CTE_UNION.per_customer_name IS NOT NULL )  THEN per_customer_name
                        END AS customer_name
                        , count(shop_service_order_doc_id) AS sales,sum(CTE_UNION.price_grand_total - CTE_UNION.proportion_discount_price) AS amount_ad_purchased
                        FROM CTE_UNION
                        GROUP BY  
                            CASE
                                WHEN (CTE_UNION.bus_customer_name IS NOT NULL )  THEN bus_customer_name
                                WHEN (CTE_UNION.per_customer_name IS NOT NULL )  THEN per_customer_name
                            END
                        ORDER BY sum(CTE_UNION.price_grand_total - CTE_UNION.proportion_discount_price) DESC
                        LIMIT 10
                    ) AS CTE_UNION_T
                
              
                
            `,
            {
                type: QueryTypes.SELECT,
                raw: true,
                replacements: {
                    type_group_id: tire_id,
                    start_date: start_date,
                    end_date: end_date
                }
            }
        );

        return utilSetFastifyResponseJson("success", data_new);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

module.exports = {
    config,
    brandSales, brandSalesOnlyTire, brandSalesOnlySpare,
    dailyInfo,
    dailyFinanceInfo,
    compareMonthlySales,
    compareSalesTarget,
    numberOfUserThisMonth,
    typeSales,
    numberOfIncomeThisMonth,
    numberOfSalesTireAmountByDateRange,
    compareYearlySalesTireAmount,
    compareYearlySalesSpareAmount,
    numberOfSalesTireAmountByMonth,
    numberOfSalesSpareAmountByMonth,
    topSizeSales,
    topType,
    topCustomer
};
