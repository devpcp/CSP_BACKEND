const { Op, literal } = require("sequelize");
const { paginate } = require('../utils/generate')
const { handleSaveLog } = require('./log');
const XLSX = require('xlsx');
const db = require('../db');
const DealerPoint = require("../models/model").DealerPoint;
const Dealers = require("../models/model").Dealers;
const Product = require("../models/model").Product;
const ActivityPointOption = require("../models/model").ActivityPointOption;
const ActivityPoint = require("../models/model").ActivityPoint;
const DealerPointBalance = require("../models/model").DealerPointBalance;
const Customer = require("../models/model").Customer;
const MatchCustomerDealer = require("../models/model").MatchCustomerDealer;

const DealerPointAll = async (request, res) => {

    var action = 'get dealer point all'

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    // const status = request.query.status;
    const which = request.query.which || 'michelin data'

    var user_id_where
    if (which == 'michelin data') {
        user_id_where = {}
    } else if (which == 'my data') {

        dealer = await Dealers.findAll({ where: { user_id: request.id } })

        if (!dealer[0]) {
            await handleSaveLog(request, [[action], ''])
            return ({ status: 'success', data: 'data not found' })
        }

        dealer_id_arr = dealer.map((el) => { return el.id })

        match = await MatchCustomerDealer.findAll({ where: { dealer_id: dealer_id_arr } })

        // if (!match[0]) {
        //     await handleSaveLog(request, ['get customer all', ''])
        //     return ({ status: 'success', data: paginate([], limit, page) })
        // }

        cus_id_arr = match.map((el) => { return el.customer_id })

        user_id_where = { customer_id: cus_id_arr }

        // user_id_where = { user_id: request.id }

    } else {
        await handleSaveLog(request, [[action], 'which only allow michelin data, my data '])
        return ({ status: "failed", data: "which not match" })
    }

    var activity = await DealerPointBalance.findAll({
        order: [[Customer, sort, order]],
        include: [{
            model: Dealers, required: true, attributes: ['id', 'master_dealer_code_id', 'dealer_code_id', 'dealer_name'],
        },
        {
            model: DealerPoint, required: true, attributes: ['id', 'point', 'point_received_date', 'point_expire_date', 'activity_point_id'],
            include: { model: ActivityPoint, required: true, attributes: ['id', 'code', 'name', 'activity_points_options_id'] }
        },
        {
            model: Customer, required: true, attributes: ['id', 'master_customer_code_id', 'dealer_customer_code_id', 'customer_name'],
        },
        ],
        where: {
            [Op.and]: [user_id_where],
            [Op.or]: [
                literal("dealer_name->>'th' LIKE '%" + search + "%'"),
                literal("customer_name->>'th' LIKE '%" + search + "%'"),
                literal("name->>'th' LIKE '%" + search + "%'"),
            ]
        },
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"DealerPointBalance\".\"created_by\" )"), 'created_by'],
            ]
        },
    })

    await handleSaveLog(request, [[action], ''])
    return ({ status: 'success', data: paginate(activity, limit, page) })

}


const DealerPointAdd = async (request, dealer_id, customer_id, doc_type, product_id, invoice_no, item_no, qty) => {
    try {


        var check_model = await Product.findAll({
            where: {
                id: product_id
            }

        })

        if (check_model[0].product_model_id == null) {
            return
        }

        var check_activity_option = await ActivityPointOption.findAll({
            where: {
                config: {
                    product_model_id: { [Op.like]: '%' + check_model[0].product_model_id + '%' }
                }
            },
        })

        if (check_activity_option.length == 0) {
            return
        }
        // return check_activity_option

        var check_activity_option_arr = check_activity_option.map(el => { return el.id })

        if (doc_type == 'IV') {

            await new Promise(async (resolve1, reject1) => {
                await check_activity_option_arr.forEach(async (element1, index1, array1) => {
                    var check_activity = await ActivityPoint.findAll({
                        where: {
                            activity_points_options_id: { [Op.contains]: [element1] }
                        }
                    })
                    await DealerPoint.create({
                        dealer_id: dealer_id,
                        activity_point_id: check_activity[0].id,
                        point: check_activity[0].point * qty,
                        point_received_date: Date.now(),
                        // point_expire_date:
                        activity_point_option_id: element1,
                        upline_level: check_activity_option[index1].upline_levels_add_point,
                        is_use: 1,
                        created_by: request.id,
                        created_date: Date.now(),
                        invoice_no: invoice_no,
                        customer_id: customer_id,
                        other_details: {
                            invoice_item_line_no: item_no,
                            apo_product_model_id: check_model[0].product_model_id
                        }

                    }).then(async function (item) {

                        var check_point_ = await DealerPointBalance.findAll({
                            order: [['created_date', 'DESC']],
                            limit: 1,
                            where: { customer_id: customer_id }
                        });
                        if (check_point_.length > 0) {
                            check_point = check_point_[0].balance_point

                        } else {
                            check_point = 0
                        }

                        await DealerPointBalance.create({
                            dealer_id: dealer_id,
                            balance_point: Number(check_point) + Number(check_activity[0].point * qty),
                            dealer_point_id: item.id,
                            balance_date: Date.now(),
                            // point_expire_date:
                            created_by: request.id,
                            created_date: Date.now(),
                            customer_id: customer_id

                        }).then(async function (item1) {

                        }).catch(function (err1) {

                            console.log(err1)

                        });


                    }).catch(function (err) {

                        console.log(err)

                    });


                    if (index1 === array1.length - 1) resolve1();
                });
            })
        } else if (doc_type == 'CN') {

            var check = await DealerPoint.findAll({
                where: {
                    [Op.and]: [{
                        dealer_id: dealer_id,
                        customer_id: customer_id,
                        invoice_no: invoice_no,
                        other_details: {
                            invoice_item_line_no: item_no,
                            apo_product_model_id: check_model[0].product_model_id
                        }
                    }
                    ],

                }
            })

            if (check.length > 0) {


                await DealerPoint.create({
                    dealer_id: check[0].dealer_id,
                    activity_point_id: check[0].activity_point_id,
                    point: check[0].point * (-1),
                    point_received_date: Date.now(),
                    // point_expire_date:
                    activity_point_option_id: check[0].activity_point_option_id,
                    upline_level: check[0].upline_level,
                    is_use: 1,
                    created_by: request.id,
                    created_date: Date.now(),
                    invoice_no: check[0].invoice_no,
                    customer_id: check[0].customer_id,
                    other_details: {
                        invoice_item_line_no: check[0].other_details.invoice_item_line_no,
                        apo_product_model_id: check[0].other_details.apo_product_model_id
                    }

                }).then(async function (item) {

                    // var check_point = await DealerPointBalance.max('balance_point', { where: { customer_id: customer_id } });
                    var check_point_ = await DealerPointBalance.findAll({
                        order: [['created_date', 'DESC']],
                        limit: 1,
                        where: { customer_id: customer_id }
                    });
                    if (check_point_.length > 0) {
                        check_point = check_point_[0].balance_point

                    } else {
                        check_point = 0
                    }

                    await DealerPointBalance.create({
                        dealer_id: check[0].dealer_id,
                        balance_point: Number(check_point) - Number(check[0].point),
                        dealer_point_id: item.id,
                        balance_date: Date.now(),
                        // point_expire_date:
                        created_by: request.id,
                        created_date: Date.now(),
                        customer_id: check[0].customer_id,

                    }).then(async function (item1) {

                    }).catch(function (err1) {

                        console.log(err1)

                    });


                }).catch(function (err) {

                    console.log(err)

                });

            } else {
                return
            }


        } else {
            return
        }









        await handleSaveLog(request, [['add dealer point'], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['add dealer point'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}




const DealerPointExport = async (request, reply) => {

    var name_as = [
        { id: '5478b392-d210-489e-bf05-a03f83c3df3e', name: 'M35' },
        { id: '7fd197c1-16da-4211-8788-96e22fe13ecf', name: 'M45' },
        { id: '9aa18f81-05ae-41e2-8f31-ed0d68015a5c', name: 'CITY PRO' },

    ];
    // var 


    var sub_query = ''
    await new Promise((resolve, reject) => {
        name_as.forEach((element, index, array) => {
            sub_query = sub_query + `, COALESCE((
                SELECT SUM(dssdtm.qty)
                    FROM app_datas.dat_submit_sales_detail_to_michelin dssdtm
                    INNER JOIN app_datas.dat_products dp ON dssdtm.product_id = dp.id
                    INNER JOIN master_lookup.mas_product_model_types mpmt ON dp.product_model_id = mpmt.id
                    WHERE EXTRACT(MONTH FROM dssdtm.invoice_date) = 8
                    AND dssdtm.created_date >= '2021-11-05'
                    AND mpmt.id = '`+ element.id + `'::uuid
                    AND dssdtm.customer_id = cud.id
                    GROUP BY dssdtm.customer_id
                LIMIT 1
            ), 0) AS "`+ element.name + `" \n`

            if (index == array.length - 1) {
                resolve()
            }
        });
    })


    // return sub_query

    var data_raw = await db.query(`SELECT d.dealer_name->>'th' AS "Dist"
    , cud.master_customer_code_id AS "AD Code"
    , cud.customer_name->>'th' AS "Name (Thai)"
    , mp.prov_name_th AS "City"
    , 'null' AS "Target 2020"
    , 'null' AS "OEM Target+Civid Revised"
    , 'null' AS "Covid Revised"
    , 'null' AS "YTD"
    , 'null' AS "Contact link"
    , 'null' AS "Contact No."
    , 'null' AS "November"

        FROM app_datas.dat_customers_under_dealers cud
        LEFT JOIN app_datas.match_customer_to_dealer mctd ON cud.id = mctd.customer_id
        LEFT JOIN app_datas.dat_dealers d ON mctd.dealer_id = d.id
        LEFT JOIN master_lookup.mas_provinces mp ON cud.province_id = mp.id
        ORDER BY cud.master_customer_code_id ASC;
    `);

    // return data[0];


    // var data = [
    //     {
    //         0: "",
    //         1: "",
    //         2: "",
    //         3: "",
    //         "Check Target From Signed Contract": "",
    //         "Referred to OEM and K.Nett discussion": "",
    //         "Minimum Target 2021": "",
    //         7: "",
    //         8: "",
    //         9: "",
    //     },
    //     {
    //         0: "Dist",
    //         1: "AD Code",
    //         2: "Name (Thai)",
    //         3: "City",
    //         "Check Target From Signed Contract": "Target 2020",
    //         "Referred to OEM and K.Nett discussion": "OEM Target+Civid Revised",
    //         "Minimum Target 2021": "Covid Revised",
    //         7: "YTD",
    //         8: "Contact link",
    //         9: "Contact No.",
    //     },
    // ];

    var data = []
    await new Promise((resolve, reject) => {
        data_raw[0].forEach((element, index, array) => {
            // data.push({
            //     0: element['Dist'],
            //     1: element['AD Code'],
            //     2: element["Name (Thai)"],
            //     3: element["City"],
            //     "Check Target From Signed Contract": element["Target 2020"],
            //     "Referred to OEM and K.Nett discussion": element["OEM Target+Civid Revised"],
            //     "Minimum Target 2021": element["Covid Revised"],
            //     7: element["YTD"],
            //     8: element["Contact link"],
            //     9: element["Contact No."],
            // })


            data.push(element)

            data_raw[0][index].November = { id: 'test' }
            if (index == array.length - 1) {
                resolve()
            }
        });
    })



    // return data;

    /* this line is only needed if you are not adding a script tag reference */
    if (typeof XLSX == 'undefined') XLSX = require('xlsx');

    /* make the worksheet */
    var ws = await XLSX.utils.json_to_sheet(data);

    // return ws

    /* add to workbook */
    var wb = await XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");

    // var buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }); // generate a nodejs buffer
    // var str = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' }); // generate a binary string in web browser

    /* generate an XLSX file */
    var file_name = new Date().getTime().toString();

    await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx');

    // await XLSX.writeFile({
    //     SheetNames: ["Sheet1"],
    //     Sheets: {
    //         Sheet1: {
    //             // "!ref": "A1:B2",
    //             // A1: { t: 's', v: "A1:A2" },
    //             // B1: { t: 'n', v: 1 },
    //             // B2: { t: 'b', v: true },
    //             "!merges": [
    //                 { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } } /* A1:A2 */
    //             ]
    //         }
    //     }
    // }, "src/assets/" + file_name + '.xlsx');

    return ({ status: "successful", data: file_name })




}

const DealerPointDownload = async (request, reply) => {

    var file_name = request.params.file_name
    return await reply.download(file_name + '.xlsx', file_name + '.xlsx')
}



module.exports = {
    DealerPointAll,
    DealerPointAdd,
    DealerPointDownload,
    DealerPointExport
}