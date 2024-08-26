const XLSX = require('xlsx');
const fs = require('fs');
const config = require('./../config');
const { Op, QueryTypes } = require("sequelize");
const { similar } = require('../utils/generate');
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const { DealerPointAdd } = require('../handlers/dealerPoint');

const sequelize = require('../db')
const Dealers = require('../models/model').Dealers;
const Customer = require('../models/model').Customer;
const Product = require('../models/model').Product;
const SubmitSales = require('../models/model').SubmitSales;
const StockBalance = require('../models/model').StockBalance;
const ProductModelType = require('../models/model').ProductModelType;

const handleGetSubmitSales = async (request, reply, app) => {

    var action = 'get submit sales all'
    const id = request.id
    var date = new Date();

    // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    // var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

    var page = request.query.page || 1;
    var limit = request.query.limit || 10;
    const search = request.query.search;
    const search_dealer = request.query.search_dealer;
    const search_product = request.query.search_product;
    const search_customer = request.query.search_customer;
    // var sort = request.query.sort;
    // var order = request.query.order;
    var start_date = request.query.start_date || '1000-01-01';
    var end_date = request.query.end_date || '9999-12-31';
    const dealer_id = request.query.dealer_id;
    var which = request.query.which || 'michelin data'




    var dealer_id_where
    var dealer_id_where_raw

    if (which == 'michelin data') {
        dealer_id_where = {}
        dealer_id_where_raw = ` `
    } else if (which == 'my data') {

        dealer = await Dealers.findAll({ where: { user_id: request.id } })

        if (!dealer[0]) {
            // return ({ status: 'success', data: paginate([], limit, page) })
            await handleSaveLog(request, [[action], ''])
            return ({ status: 'success', data: 'data not found' })
        }

        var dealer_ = dealer.map(el => { return el.id })

        dealer_id_where = { dealer_id: dealer_ }
        dealer_id_where_raw = ` AND cte.dealer_id IN (${dealer.map(el => { return "'" + el.id + "'" })})`

    } else {
        await handleSaveLog(request, [[action], 'which only allow michelin data, my data '])
        return ({ status: "failed", data: "which not match" })
    }



    var from = `
        (
            SELECT *,
            ROW_NUMBER() OVER (PARTITION BY dealer_id, customer_id, product_id, doc_type, invoice_date, invoice_no, item_no  ORDER BY created_date desc) AS rnk
            FROM app_datas.dat_submit_sales_detail_to_michelin
        )
    `

    var inc = `
        app_datas.dat_dealers dea ON dea.id = cte.dealer_id
        JOIN app_datas.dat_customers_under_dealers cus ON cus.id = cte.customer_id
        LEFT JOIN master_lookup.mas_provinces prov ON prov.id = cus.province_id
        JOIN app_datas.dat_products prod ON prod.id = cte.product_id
        LEFT JOIN master_lookup.mas_product_model_types model ON model.id = prod.product_model_id
    `

    var where_q = `
        rnk = 1
        ${dealer_id_where_raw}
        AND cte.invoice_date BETWEEN :start_date AND :end_date 
        AND (
            master_dealer_code_id LIKE :search OR
            dealer_name->>'th' LIKE :search OR
            master_customer_code_id LIKE :search OR
            customer_name->>'th' LIKE :search OR
            cte.invoice_no LIKE :search OR
            product_name->>'th' LIKE :search OR
            doc_type LIKE :search
            )
        AND dealer_name->>'th' LIKE :search_dealer
        AND customer_name->>'th' LIKE :search_customer 
        AND product_name->>'th' LIKE :search_product

        `
    var submitsales = await sequelize.query(
        `
            SELECT cte.id FROM ${from} as cte
            JOIN ${inc}
            WHERE ${where_q}
            ORDER BY cte.invoice_no desc , cte.item_no desc
            LIMIT :limit OFFSET :offset
        `,
        {
            type: QueryTypes.SELECT,
            replacements: {
                search: '%' + search + '%', limit: limit, offset: (page - 1) * limit,
                start_date: start_date, end_date: end_date || new Date(),
                search_dealer: '%' + search_dealer + '%', search_product: '%' + search_product + '%',
                search_customer: '%' + search_customer + '%'
            }
        }
    ).then(async (res) => {

        res = res.map(el => el.id)
        submitsales = await SubmitSales.findAll({
            attributes: {
                include: [
                    [sequelize.literal(`(select user_name from systems.sysm_users where id = \"SubmitSales\".created_by )`), 'created_by'],
                    [sequelize.literal(`(select user_name from systems.sysm_users where id = \"SubmitSales\".updated_by )`), 'updated_by']
                ]
            },
            order: [['invoice_no', 'desc'], ['item_no', 'desc']],
            where: { id: res },
            include: [
                {
                    model: Dealers, as: "Dealers",
                    attributes: ['id', 'master_dealer_code_id', 'dealer_name']
                },
                {
                    model: Customer, as: "Customer",
                    attributes: ['id', 'master_customer_code_id', 'customer_name']
                },
                {
                    model: Product, as: "Product",
                    attributes: ['id', 'master_path_code_id', 'product_name'],
                    include: {
                        model: ProductModelType,
                        attributes: ['id', 'code_id', 'model_name'],

                    }
                }
            ],
        })
        return submitsales

    })



    var length_data = await sequelize.query(
        `
            SELECT CAST(count(*) AS INT) from (SELECT cte.id FROM ${from} as cte
            JOIN ${inc}
            WHERE ${where_q}
            ORDER BY cte.invoice_no desc , cte.item_no desc ) as count
        `,
        {
            type: QueryTypes.SELECT,
            replacements: {
                search: '%' + search + '%', limit: limit, offset: (page - 1) * limit,
                start_date: start_date, end_date: end_date || new Date(),
                search_dealer: '%' + search_dealer + '%', search_product: '%' + search_product + '%',
                search_customer: '%' + search_customer + '%'
            }
        }
    )


    length_data = length_data[0].count

    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: submitsales.length,
        totalCount: length_data,
        data: submitsales

    }


    // return submitsales;

    await handleSaveLog(request, [[action], ''])
    return ({ status: 'success', data: pag })
}

const handleGetStockBalance = async (request, reply, app) => {

    var action = 'get stock balance all'
    const id = request.id

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    const search = request.query.search;
    const search_dealer = request.query.search_dealer;
    const search_product = request.query.search_product;
    var sort = request.query.sort;
    var order = request.query.order;
    const start_date = request.query.start_date;
    const end_date = request.query.end_date;
    const dealer_id = request.query.dealer_id;
    const which = request.query.which || 'michelin data'



    var dealer_id_where
    if (which == 'michelin data') {
        dealer_id_where = {}
    } else if (which == 'my data') {

        dealer = await Dealers.findAll({ where: { user_id: request.id } })

        if (!dealer[0]) {
            // await handleSaveLog(request, [[action], ''])
            // return ({ status: 'success', data: paginate([], limit, page) })

            await handleSaveLog(request, [[action], ''])
            return ({ status: 'success', data: 'data not found' })
        }

        var dealer_ = dealer.map(el => { return el.id })

        dealer_id_where = { dealer_id: dealer_ }

    } else {
        await handleSaveLog(request, [[action], 'which only allow michelin data, my data '])
        return ({ status: "failed", data: "which not match" })
    }

    var search_product_ = {}
    if (!isNull(search_product)) {
        search_product_ = {
            product_name: {
                [Op.or]: [
                    { th: { [Op.like]: '%' + search_product + '%' } },
                    { en: { [Op.like]: '%' + search_product + '%' } }
                ]
            }
        }
    }

    var search_dealer_ = {}
    if (!isNull(search_dealer)) {
        search_dealer_ = {
            dealer_name: {
                [Op.or]: [
                    { th: { [Op.like]: '%' + search_dealer + '%' } },
                    { en: { [Op.like]: '%' + search_dealer + '%' } }
                ]
            }
        }
    }

    var dealer_id_ = {}
    if (!isNull(dealer_id)) {
        dealer_id_ = {
            id: {
                dealer_id
            }
        }
    }
    var between = {}
    if (!isNull(start_date)) {
        between = {
            balance_date: {
                [Op.between]: [new Date(start_date), new Date(end_date || Date.now())]
            }
        }
    }

    var where_q = {
        [Op.and]: [dealer_id_where, between, dealer_id_where],
        [Op.or]: [

            sequelize.literal("master_dealer_code_id LIKE '%" + search + "%'"),
            sequelize.literal("dealer_name->>'th' LIKE '%" + search + "%'"),
            sequelize.literal("master_path_code_id LIKE '%" + search + "%'"),
            sequelize.literal("product_name->>'th' LIKE '%" + search + "%'"),
        ]
    }



    var submitsales = await StockBalance.findAll({
        include: [
            {
                model: Dealers,
                attributes: ['id', 'master_dealer_code_id', 'dealer_name'],
                required: true,
                where: search_dealer_, dealer_id_
            },
            {
                model: Product,
                attributes: ['id', 'master_path_code_id', 'product_name'],
                required: true,
                include: {
                    model: ProductModelType,
                    attributes: ['id', 'code_id', 'model_name'],

                },
                where: search_product_
            }
        ],
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"StockBalance\".\"created_by\" )"), 'created_by'],
                // [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"StockBalance\".\"updated_by\" )"), 'updated_by']
            ]
        },
        where: where_q,
        order: [['created_date', 'desc'], [Product, 'master_path_code_id', 'desc']],
        limit: limit,
        offset: (page - 1) * limit
    })


    var length_data = await StockBalance.count({
        include: [
            {
                model: Dealers,
                required: true,
                where: search_dealer_, dealer_id_

            },
            {
                model: Product,
                required: true,
                where: search_product_
            }
        ],

        where: where_q
    })

    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: submitsales.length,
        totalCount: length_data,
        data: submitsales

    }

    await handleSaveLog(request, [[action], ''])
    return ({ status: 'success', data: pag })
}


const handleGet = async (request, reply, app) => {

    var action = 'get sales detail from webmax'

    try {
        // var RDBusinessRegNo = request.query.RDBusinessRegNo

        // request.id = 'cf1b6fd6-e2c9-4ca3-a57c-ea3d02b03212'
        // request.id = '0fa8e2bc-22d5-473c-a583-ae9492ca61f5'
        var dealer_id = request.query.dealer_id || null

        var check_dealer = await Dealers.findAll({
            where: {
                user_id: request.id, isuse: 1
            }
        })

        var filter = null

        if (!check_dealer[0]) {
            filter = await Dealers.findAll({
                where: {
                    isuse: 1
                }
            })
            if (dealer_id == null) {

                await handleSaveLog(request, [[action], ''])
                return ({ status: 'success', data: { filter: filter, data: [] } })
            } else if (dealer_id != null) {
                check_dealer = await Dealers.findAll({
                    where: {
                        id: dealer_id, isuse: 1
                    }
                })
            }
        }



        var user_name = check_dealer[0].sync_api_config.username
        var password = check_dealer[0].sync_api_config.password
        let buff = new Buffer(password, 'base64');
        password = buff.toString('ascii');


        const { data, status } = await app.axios.get(config.web_max + '/SalesDetail/GetSalesDetail', {
            params: {
                RDBusinessRegNo: check_dealer[0].master_dealer_code_id,
                RDSubCode: request.query.RDSubCode,
                TransMonth: request.query.TransMonth
            },
            auth: {
                username: user_name,
                password: password
            }
        })
        await handleSaveLog(request, [[action], ''])
        return ({ status: 'success', data: { filter: filter, data: data } })
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], error])
        return ({ status: 'failed', data: error })
    }

}

// const handlePutSalesByJson = async (request, res, app) => {



//     var action = 'put sale by json'
//     var RDBusinessRegNo = request.query.RDBusinessRegNo
//     var check_dealer = await Dealers.findAll({
//         where: {
//             master_dealer_code_id: RDBusinessRegNo.toString(), isuse: 1
//         }
//     })

//     if (!check_dealer[0]) {
//         return ({ status: "failed", data: "RDBusinessRegNo not found in DB Dealer" })
//     }

//     return handlePutSales(request, request.body, check_dealer, app, action)

// }

const handlePutSalesByJson = async (request, res, app) => {

    var action = 'put sale by json'
    // var dealer_id = request.query.dealer_id
    var check_dealer = await Dealers.findAll({
        where: {
            user_id: request.id, isuse: 1
        }
    })

    if (!check_dealer[0]) {
        await handleSaveLog(request, [[action], 'this user in not dealer'])
        return ({ status: "failed", data: "this user in not dealer" })
    }

    request.query.RDBusinessRegNo = check_dealer[0].master_dealer_code_id

    return handlePutSales(request, request.body, check_dealer, app, action, 0)

}



const handlePutSalesByFile = async (request, res, app) => {

    var action = 'put sale by file'

    const data = await request.body.file

    await fs.writeFileSync('src/assets/customer/' + data.filename, await data.toBuffer());
    const wb = XLSX.readFile('src/assets/customer/' + data.filename);
    await fs.unlinkSync('src/assets/customer/' + data.filename)


    var rdcode = Object.keys(await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])[0])[1]

    var data_json = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 1 })

    const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 1 })[0]

    var create_err = []

    if (!(header[0] == 'วันที่' && header[1] == 'เลขที่' && header[2] == 'ADCode' && header[3] == 'ผู้เกี่ยวข้อง' &&
        header[4] == 'CAI' && header[5] == 'รายการ' && header[6] == 'จำนวน')) {
        return ({ status: 'failed', data: 'header incorrect' })
    }

    var check_rdcode = await Dealers.findAll({
        where: { master_dealer_code_id: rdcode.toString(), isuse: 1 }
    })

    if (!check_rdcode[0]) {
        await handleSaveLog(request, [[action], 'rdcode not found in dealer'])
        return ({ status: 'failed', data: 'rdcode not found in dealer' })
    }



    data_json = data_json.map(element => {
        return {
            ADRegNo: element.ADCode,
            ADCustomerName: element.ผู้เกี่ยวข้อง,
            DocType: element.hasOwnProperty("DocType") ? element.DocType : null,
            InvoiceDate: new Date(Math.round((element.วันที่ - 25569) * 86400 * 1000)).toISOString(),
            InvoiceNo: element.hasOwnProperty("เลขที่") ? element.เลขที่ : null,
            ItemNo: element.hasOwnProperty("ItemNo") ? element.ItemNo : null,
            PartNumber: element.hasOwnProperty("PartNumber") ? element.PartNumber : null,
            PartDesc: element.รายการ,
            CAI: element.CAI,
            Qty: element.จำนวน,

        }
    })

    return handlePutSales(request, data_json, check_rdcode, app, action, 3)


    // } catch (error) {
    //     return ({ status: 'failed', data: error })
    // }
}


const handlePutSales = async (request, data_raw, check_dealer, app, action, add_row_index) => {

    try {

        var TransDate_year = request.query.TransDate.slice(0, 4)
        var TransDate_month = request.query.TransDate.slice(4, 6)
        var TransDate_day = request.query.TransDate.slice(6, 8)

        var data_year = []
        var data_month = []



        var error_check = 0
        var error = []
        var data_to_webmax = []
        var data_create = []
        var data_update = []

        for (let index = 0; index < data_raw.length; index++) {
            var element = data_raw[index]
            var data_year_ = new Date(element.InvoiceDate).getFullYear()
            if (data_year.includes(data_year_) == false) {
                data_year.push(data_year_)
            }
            var data_month_ = String("0" + parseInt(new Date(element.InvoiceDate).getMonth() + 1)).slice(-2)
            if (data_month.includes(data_month_) == false) {
                data_month.push(data_month_)
            }
        }


        var customer_all = await Customer.findAll({ where: { isuse: 1 } })
        var product_all = await Product.findAll({ where: { isuse: 1 } })
        var submit_sale = await SubmitSales.findAll({
            where: {
                [Op.and]: [
                    sequelize.literal(`EXTRACT(MONTH FROM invoice_date) IN ( :data_month )`),
                    sequelize.literal(`EXTRACT(YEAR FROM invoice_date) IN ( :data_year )`)
                ]
            },
            replacements: { data_month: data_month.map(el => { return el }), data_year: data_year.map(el => { return el }) }
        })


        // const arr1 = submit_sale.map(el => { return { invoice_date: el.invoice_date, invoice_no: el.invoice_no, item_no: el.item_no, qty: el.qty } })
        // const arr2 = data_raw.map(el => { return { invoice_date: el.InvoiceDate.split('T')[0], invoice_no: el.InvoiceNo, item_no: el.ItemNo, qty: el.Qty } });

        // function getDifference(array1, array2) {
        //     return array1.filter(object1 => {
        //         return !array2.some(object2 => {
        //             return object1.invoice_no == object2.invoice_no && object1.item_no == object2.item_no && object1.qty == object2.qty;
        //         });
        //     });
        // }

        // // 👇️ [{id: 2, name: 'John'}]
        // return getDifference(arr1, arr2).length
        // return getDifference(arr1, arr2).reduce(function (acc, obj) { return acc + parseInt(obj.qty); }, 0)

        var invoice_no_auto = 0

        for (let index = 0; index < data_raw.length; index++) {

            var element = data_raw[index]

            var check_customer = []
            if (element.customer_id) {
                check_customer = customer_all.filter(el => { return el.id == element.customer_id })
            }
            else if (element.ADRegNo != null) {
                check_customer = customer_all.filter(el => { return el.master_customer_code_id == element.ADRegNo.toString() })
            }
            else if (element.ADRegNo == null || check_customer.length == 0) {
                check_customer = await Customer.findAll({
                    where: {
                        isuse: 1,
                        customer_name: {
                            th: { [Op.like]: '%' + element.ADCustomerName + '%' }
                        }
                    }
                })

            }

            if (check_customer.length == 0 && !element.customer_id) {
                for (let index1 = 0; index1 < customer_all.length; index1++) {
                    const element1 = customer_all[index1];
                    if (element.ADCustomerName) {
                        if (similar(element.ADCustomerName, element1.customer_name.th) > 74) {
                            check_customer.push(element1)
                        }
                    }
                }

            }


            var check_product = []
            if (element.product_id) {
                check_product = product_all.filter(el => { return el.id == element.product_id })

            }
            else if (!(element.CAI == null || element.CAI == '')) {
                check_product = product_all.filter(el => { return el.master_path_code_id == element.CAI.toString() })

            }
            else if (element.CAI == null || check_product.length == 0) {
                check_product = await Product.findAll({
                    where: {
                        isuse: 1,
                        product_name: {
                            [Op.or]: [
                                { th: { [Op.like]: '%' + element.PartDesc + '%' } },
                                // { en: { [Op.like]: '%' + element.PartDesc + '%' } },
                                { name_from_dealer: { [Op.like]: '%' + element.PartDesc + '%' } },
                            ]
                        }
                    }
                })

            }

            if (check_product.length == 0 && !element.product_id) {
                for (let index1 = 0; index1 < product_all.length; index1++) {
                    const element1 = product_all[index1];
                    if (element.PartDesc) {
                        if (similar(element.PartDesc, element1.product_name.th) > 74) {
                            check_product.push(element1)
                        }
                    }
                }

            }
            if (check_product.length == 0 && !element.product_id) {

                for (let index1 = 0; index1 < product_all.length; index1++) {
                    const element1 = product_all[index1];
                    if (element.PartDesc && element1.product_name.name_from_dealer) {
                        if (similar(element.PartDesc, element1.product_name.name_from_dealer) > 74) {
                            check_product.push(element1)
                        }
                    }
                }
            }

            error_check = 0
            if (check_product.length == 0) {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'product not found' })
            }
            if (check_customer.length == 0) {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'customer not found' })
            }
            if (element.DocType != 'IV' && element.DocType != 'CN') {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'DocType not allow' })
            }
            if (element.Qty < 0) {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'Qty must be positive integer' })
            }

            if (error_check == 0) {

                if (!element.InvoiceNo) {

                    invoice_no_auto = invoice_no_auto + 1

                    if (check_dealer[0].sync_api_config.inv_run_prefix) {
                        element.InvoiceNo = check_dealer[0].sync_api_config.inv_run_prefix + '-' + (new Date().getTime() + invoice_no_auto)
                    } else {
                        element.InvoiceNo = 'INV-' + (new Date().getTime() + invoice_no_auto)
                    }


                }

                var chek_duplicate = submit_sale.filter(el => {
                    return el.dealer_id == check_dealer[0].id &&
                        el.customer_id == check_customer[0].id &&
                        el.doc_type == element.DocType &&
                        el.product_id == check_product[0].id &&
                        el.invoice_no == element.InvoiceNo &&
                        el.invoice_date == element.InvoiceDate.split('T')[0] &&
                        el.item_no == element.ItemNo
                })

                if (chek_duplicate.length < 1) {

                    if (isNull(element.ADRegNo)) {
                        element.ADRegNo = check_customer[0].master_customer_code_id
                    }
                    if (isNull(element.ADCustomerName)) {
                        element.ADCustomerName = check_customer[0].customer_name.th
                    }
                    if (isNull(element.PartDesc)) {
                        element.PartDesc = check_product[0].product_name.th
                    }
                    if (isNull(element.CAI)) {
                        element.CAI = check_product[0].master_path_code_id
                    }

                    data_create.push({
                        dealer_id: check_dealer[0].id,
                        customer_id: check_customer[0].id,
                        product_id: check_product[0].id,
                        product_model_id: check_product[0].product_model_id,
                        doc_type: element.DocType,
                        invoice_date: element.InvoiceDate,
                        invoice_no: element.InvoiceNo,
                        item_no: element.ItemNo,
                        qty: element.Qty,
                        created_by: request.id,
                        created_date: Date.now()
                    })


                } else {
                    if (element.Qty != chek_duplicate[0].qty) {

                        data_update.push(
                            [
                                chek_duplicate[0].id,
                                {
                                    qty: element.Qty,
                                    product_model_id: check_product[0].product_model_id,
                                    created_date: Date.now(),
                                    updated_date: Date.now(),
                                    updated_by: request.id,

                                },
                                { ...chek_duplicate[0].dataValues, ...{ product_model_id: check_product[0].product_model_id } }
                            ]
                        )
                    }

                }

            }

        }







        if (error.length > 0) {

            const groupByCases = error.reduce((group, product) => {
                const { cases } = product;
                group[cases] = group[cases] ?? [];
                group[cases].push(product.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)

            await handleSaveLog(request, [[action], error_str])
            return ({ status: 'failed', data: error_str })
        }

        var test = []

        if (data_update.length > 0) {
            for (let index = 0; index < data_update.length; index++) {
                const element = data_update[index];

                await SubmitSales.update(
                    element[1], {
                    where:
                        { id: element[0] }
                })

                await DealerPointAdd(request, [{ ...element[2], ...{ qty: element[2].qty, doc_type: 'CN' } }])
                await DealerPointAdd(request, [{ ...element[2], ...{ qty: element[1].qty, doc_type: 'IV' } }])

            }
        }


        var create
        await SubmitSales.bulkCreate(data_create, { returning: true })
            .then(function (item) {
                create = item
            }).catch(function (err) {
                console.log(err)
            });


        await handleSaveLog(request, [[action, '', create], ''])


        await DealerPointAdd(request, data_create)


        var data_in_month = await SubmitSales.findAll({
            where: {
                [Op.and]: [
                    sequelize.literal(` EXTRACT(MONTH FROM invoice_date) in  (:data_month) `),
                    sequelize.literal(` EXTRACT(YEAR FROM invoice_date) in (:data_year) `)
                ]
            },
            replacements: { data_month: data_month.map(el => { return el }), data_year: data_year.map(el => { return el }) },
            attributes: [
                [sequelize.literal(`master_customer_code_id`), 'ADRegNo'],
                [sequelize.literal(`customer_name->>'th'`), 'ADCustomerName'],
                ['doc_type', 'DocType'],
                [sequelize.literal(` to_char(invoice_date, 'YYYYMMDD')`), 'InvoiceDate'],
                ['invoice_no', 'InvoiceNo'],
                ['item_no', 'ItemNo'],
                [sequelize.literal(`master_path_code_id`), 'PartNumber'],
                [sequelize.literal(`product_name->>'th'`), 'PartDesc'],
                [sequelize.literal(`master_path_code_id`), 'CAI'],
                ['qty', 'Qty'],

            ],
            include: [
                { model: Customer, as: 'Customer', attributes: [] },
                { model: Product, as: 'Product', attributes: [] }]
        })

        // data_to_webmax = { ...data_in_month }
        // data_to_webmax = data_to_webmax.concat(data_in_month)

        data_to_webmax = data_in_month


        var user_name = check_dealer[0].sync_api_config.username
        var password = check_dealer[0].sync_api_config.password

        if (!(user_name || password)) {
            await handleSaveLog(request, [[action], 'user_name password in sync_api_config not found in dealer'])
            return ({ status: 'failed', data: 'user_name password in sync_api_config not found in dealer' })
        }
        let buff = new Buffer(password, 'base64');
        password = buff.toString('ascii');

        await app.axios.put(config.web_max + '/SalesDetail/SubmitSalesDetail',
            data_to_webmax

            , {
                params: {
                    RDBusinessRegNo: request.query.RDBusinessRegNo,
                    RDSubCode: request.query.RDSubCode,
                    TransDate: request.query.TransDate
                },
                auth: {
                    username: user_name,
                    password: password
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(async function (item) {
                test[0] = true
                test[1] = item.data
                await handleSaveLog(request, [[action + ' - sending to webmax', '', data_to_webmax], ''])


            }).catch(function (err) {
                test[0] = false
                test[1] = (err.response.data) ? err.response.data : JSON.stringify(err.response)
                console.log(err)
            });

        if (test[0] == false) {
            await handleSaveLog(request, [[action], test[1]])
            return ({ status: 'failed', data: test[1] })
        }


        return ({ status: 'success', data: 'successfull' })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], error])
        return ({ status: 'failed', data: error })
    }
}


const handlePutStockByJson = async (request, res, app) => {

    try {


        var RDBusinessRegNo = request.query.RDBusinessRegNo
        var check_dealer = await Dealers.findAll({
            where: {
                master_dealer_code_id: RDBusinessRegNo.toString(), isuse: 1
            }
        })

        if (!check_dealer[0]) {
            await handleSaveLog(request, [['put stock by json'], 'RDBusinessRegNo not found in DB Dealer'])
            return ({ status: "failed", data: "RDBusinessRegNo not found in DB Dealer" })
        }

        var user_name = check_dealer[0].sync_api_config.username
        var password = check_dealer[0].sync_api_config.password
        let buff = new Buffer(password, 'base64');
        password = buff.toString('ascii');

        var trans_date = request.query.TransDate
        var year = trans_date[0] + trans_date[1] + trans_date[2] + trans_date[3]
        var month = parseInt(trans_date[4] + trans_date[5], 10)
        var day = trans_date[6] + trans_date[7]
        var hour = trans_date[9] + trans_date[10]
        var minute = trans_date[11] + trans_date[12]
        var sec = trans_date[13] + trans_date[14]
        var balance_date = new Date(year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + sec)

        if (balance_date == 'Invalid Date') {
            await handleSaveLog(request, [['put stock by file'], 'TransDate invalid format'])
            return ({ status: 'failed', data: 'TransDate invalid format' })
        }

        balance_date = balance_date.getTime()

        var data_raw = request.body
        var error = []
        var add_row_index = 0
        var data_to_webmax = []
        var data_create = []
        var error_check = 0
        for (let index = 0; index < data_raw.length; index++) {
            const element = data_raw[index];
            var check_product = []
            if (!(element.CAI == null || element.CAI == '')) {
                check_product = await Product.findAll({
                    where: [
                        { isuse: 1 },
                        {
                            [Op.or]: [
                                { master_path_code_id: element.CAI.toString() },
                            ]
                        }]
                })
            }

            error_check = 0

            if (check_product.length == 0) {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'product not found' })
            }

            if (element.hasOwnProperty("WarehouseCode") == false) {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'WarehouseCode is required' })
            }



            if (error_check == 0) {

                data_to_webmax.push(element)

                //data to DB

                data_create.push({
                    dealer_id: check_dealer[0].id,
                    product_id: check_product[0].id,
                    balance: element.Qty,
                    // balance_date: new Date(year, month, day).getTime(),
                    balance_date: balance_date,

                    created_by: request.id,
                    created_date: Date.now(),
                    webmax_warehouse_code: element.WarehouseCode

                })

            }

        }

        if (error.length > 0) {

            const groupByCases = error.reduce((group, product) => {
                const { cases } = product;
                group[cases] = group[cases] ?? [];
                group[cases].push(product.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)

            await handleSaveLog(request, [['put stock by json'], error_str])
            return ({ status: 'failed', data: error_str })
        }



        var test = []
        await app.axios.put(config.web_max + '/Stock/SubmitStockDetail',
            data_to_webmax

            , {
                params: {
                    RDBusinessRegNo: request.query.RDBusinessRegNo,
                    RDFileCode: request.query.RDFileCode,
                    TransDate: request.query.TransDate
                },
                auth: {
                    username: user_name,
                    password: password
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (item) {
                test[0] = true
                test[1] = item.data


            }).catch(function (err) {
                test[0] = false
                test[1] = err.response.data
                console.log(err)

                // return ({ status: 'failed', data: err.response.data })
                // create_err.push(["index " + index + " error :" + err.errors[0].message])
            });

        if (test[0] == false) {
            await handleSaveLog(request, [['put stock by json'], test[1]])
            return ({ status: 'failed', data: test[1] })
        }


        var create
        await StockBalance.bulkCreate(data_create)
            .then(function (item) {
                create = item
            }).catch(function (err) {
                console.log(err)
            });


        await handleSaveLog(request, [['put stock by json', '', create], ''])
        return ({ status: 'success', data: 'successfull' })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['put stock by json'], error])
        return ({ status: 'failed', data: error })
    }
}

const handlePutStockByFile = async (request, res, app) => {


    try {

        const data = await request.body.file

        await fs.writeFileSync('src/assets/customer/' + data.filename, await data.toBuffer());
        const wb = XLSX.readFile('src/assets/customer/' + data.filename);
        await fs.unlinkSync('src/assets/customer/' + data.filename)


        var rdcode = Object.keys(await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])[0])[1]

        const data_json = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 1 })

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 1 })[0]



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

        const header_check = ['CAI', 'ชื่อสินค้า', 'ยอดคงเหลือ', 'WarehouseCode', 'Remarks'];

        var check_header = areEqual(header_check, header)
        if (check_header[0] == false) {
            await handleSaveLog(request, [['put stock by file'], check_header[1]])
            return ({ status: 'failed', data: check_header[1] })
        }

        var check_rdcode = await Dealers.findAll({
            where: { master_dealer_code_id: rdcode.toString(), isuse: 1 }
        })

        if (!check_rdcode[0]) {

            await handleSaveLog(request, [['put stock by file'], 'rdcode not found in dealer'])
            return ({ status: 'failed', data: 'rdcode not found in dealer' })
        }


        var user_name = check_rdcode[0].sync_api_config.username
        var password = check_rdcode[0].sync_api_config.password
        let buff = new Buffer(password, 'base64');
        password = buff.toString('ascii');

        var trans_date = request.query.TransDate
        var year = trans_date[0] + trans_date[1] + trans_date[2] + trans_date[3]
        var month = parseInt(trans_date[4] + trans_date[5], 10)
        var day = trans_date[6] + trans_date[7]
        var hour = trans_date[9] + trans_date[10]
        var minute = trans_date[11] + trans_date[12]
        var sec = trans_date[13] + trans_date[14]
        var balance_date = new Date(year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + sec)

        if (balance_date == 'Invalid Date') {
            await handleSaveLog(request, [['put stock by file'], 'TransDate invalid format'])
            return ({ status: 'failed', data: 'TransDate invalid format' })
        }

        balance_date = balance_date.getTime()

        var data_raw = data_json
        var error_check = 0
        var data_to_webmax = []
        var data_create = []
        var check_product = []
        var error = []
        var add_row_index = 3

        for (let index = 0; index < data_raw.length; index++) {
            const element = data_raw[index];
            check_product = []
            if (element.hasOwnProperty("CAI")) {
                check_product = await Product.findAll({
                    where: [{
                        isuse: 1
                    }, {
                        [Op.or]: [
                            {
                                master_path_code_id: element.CAI.toString()
                            },
                        ]
                    }]
                })
            }
            if (!element.hasOwnProperty("CAI") || check_product.length == 0) {
                check_product = await Product.findAll({
                    where: {
                        product_name: {
                            [Op.or]: [
                                { th: { [Op.like]: '%' + element.ชื่อสินค้า + '%' } },
                                // { en: { [Op.like]: '%' + element.PartDesc + '%' } },
                                { name_from_dealer: { [Op.like]: '%' + element.ชื่อสินค้า + '%' } },
                            ]
                        }
                    }
                })

            }

            if (check_product.length == 0) {
                var product_all = await Product.findAll({ where: { isuse: 1 } })
                await new Promise(async (resolve, reject) => {
                    await product_all.forEach(async (element1, index1, array1) => {
                        if (similar(element.ชื่อสินค้า, element1.product_name.th) > 74) {
                            check_product.push(element1)
                        }
                        if (index1 === array1.length - 1) resolve();
                    })
                })
            }
            if (check_product.length == 0) {
                var product_all = await Product.findAll({ where: { isuse: 1 } })
                await new Promise(async (resolve, reject) => {
                    await product_all.forEach(async (element1, index1, array1) => {
                        if (element1.product_name.hasOwnProperty("name_from_dealer")) {
                            if (similar(element.ชื่อสินค้า, element1.product_name.name_from_dealer) > 74) {
                                check_product.push(element1)
                            }
                        }

                        if (index1 === array1.length - 1) resolve();
                    })
                })
            }

            error_check = 0

            if (check_product.length == 0) {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'product not found' })
            }

            if (element.hasOwnProperty("ยอดคงเหลือ") == false) {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'ยอดคงเหลือ is required' })
            }

            if (element.hasOwnProperty("WarehouseCode") == false) {
                error_check = error_check + 1
                error.push({ index: index + add_row_index, cases: 'WarehouseCode is required' })
            }

            if (error_check == 0) {


                data_to_webmax.push({
                    CAI: check_product[0].master_path_code_id,
                    Qty: element.ยอดคงเหลือ,
                    WarehouseCode: element.WarehouseCode,
                    Remarks: element.hasOwnProperty("Remarks") ? element.Remarks : ''
                })

                //data to DB

                data_create.push({
                    dealer_id: check_rdcode[0].id,
                    product_id: check_product[0].id,
                    balance: element.ยอดคงเหลือ,
                    // balance_date: new Date(year, month, day).getTime(),
                    balance_date: balance_date,

                    created_by: request.id,
                    created_date: Date.now(),
                    webmax_warehouse_code: element.WarehouseCode
                })

            }
        }



        if (error.length > 0) {

            const groupByCases = error.reduce((group, product) => {
                const { cases } = product;
                group[cases] = group[cases] ?? [];
                group[cases].push(product.index);
                return group;
            }, {});

            var error_str = JSON.stringify(groupByCases)

            await handleSaveLog(request, [['put stock by file'], error_str])
            return ({ status: 'failed', data: error_str })
        }

        var test = []

        await app.axios.put(config.web_max + '/Stock/SubmitStockDetail',
            data_to_webmax

            , {
                params: {
                    RDBusinessRegNo: request.query.RDBusinessRegNo,
                    RDFileCode: request.query.RDFileCode,
                    TransDate: request.query.TransDate
                },
                auth: {
                    username: user_name,
                    password: password
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (item) {
                test[0] = true
                test[1] = item.data


            }).catch(function (err) {
                test[0] = false
                test[1] = err.response.data
                console.log(err)

                // return ({ status: 'failed', data: err.response.data })
                // create_err.push(["index " + index + " error :" + err.errors[0].message])
            });

        if (test[0] == false) {
            await handleSaveLog(request, [['put stock by file'], test[1]])
            return ({ status: 'failed', data: test[1] })
        }


        var create
        await StockBalance.bulkCreate(data_create)
            .then(function (item) {
                create = item
            }).catch(function (err) {
                console.log(err)
            });



        await handleSaveLog(request, [['put stock by file', '', create], ''])
        return ({ status: 'success', data: 'successfull' })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['put stock by file'], error])
        return ({ status: 'failed', data: error })
    }
}

const handePutEditStockUnit = async (request, res, app) => {
    try {

        var before_update = await StockBalance.findOne(
            { where: { id: request.body.id } }
        )

        await StockBalance.update(
            { balance: request.body.balance },
            { where: { id: request.body.id } }
        ).then(r => r).catch(e => {
            console.log(e);
        });

        await handleSaveLog(request, [['put edit stock unit', request.body.id, request.body, before_update], ''])
        return ({ status: 'success', data: 'successfull' });

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['put edit stock unit'], error])
        return ({ status: 'success', data: 'successfull' });
    }

}

// module.exports = (app) => {
//     return handleGet(app)
// }


module.exports = (app, crud) => {
    return async (req, reply) => {
        if (crud == 'handleGet') {
            return handleGet(req, reply, app)

        }
        else if (crud == 'handlePutSalesByJson') {
            return handlePutSalesByJson(req, reply, app)
        }
        else if (crud == 'handlePutSalesByFile') {
            return handlePutSalesByFile(req, reply, app)
        }
        else if (crud == 'handleGetSubmitSales') {
            return handleGetSubmitSales(req, reply, app)
        }
        else if (crud == 'handlePutStockByJson') {
            return handlePutStockByJson(req, reply, app)
        }
        else if (crud == 'handlePutStockByFile') {
            return handlePutStockByFile(req, reply, app)
        }
        else if (crud == 'handleGetStockBalance') {
            return handleGetStockBalance(req, reply, app)
        }
        else if (crud == 'handePutEditStockUnit') {
            return handePutEditStockUnit(req, reply, app);
        }

    }
}
