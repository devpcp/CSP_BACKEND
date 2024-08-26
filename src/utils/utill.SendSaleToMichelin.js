const ThirdPartyApiConnectData = require("../models/model").ThirdPartyApiConnectData;
const sequelize = require('../db')
const { Op, QueryTypes } = require("sequelize");
const schedule = require('node-schedule');
const _ = require("lodash");
const { default: axios } = require("axios");
const config = require('../config')
const {
    isUUID,
} = require("../utils/generate");
const ShopsProfiles = require("../models/model").ShopsProfiles;
const ShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const ShopProduct = require("../models/model").ShopProduct;
const Product = require("../models/model").Product;
const ShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;
const ShopBusinessCustomers = require("../models/model").ShopBusinessCustomers;
const { handleSaveLog } = require("../handlers/log");
var request = {
    headers: {
        'user-agent': 'Postman',
        'HTTP_X_REAL_IP': '127.0.0.1'
    }
}
const checkConfigSendingSaleToMichelin = async (url) => {

    const job = schedule.scheduleJob('01 01 * * * *', async function () {
        var check_user_michelin = await ThirdPartyApiConnectData.findAll({
            where: {
                [Op.and]: [
                    { isuse: 1 },
                    sequelize.literal(`split_part(auth_oauth->>'time_to_send_sale',':', 1) = :hour`)
                ]
            },
            replacements: { hour: new Date().toLocaleString('en-GB').split(' ')[1].split(':')[0] }
        })


        await handleSaveLog(request, [['check config sending sale to michelin', '', check_user_michelin], ''])


        if (check_user_michelin.length > 0) {
            for (let index = 0; index < check_user_michelin.length; index++) {
                const element = check_user_michelin[index];
                var [shop_id, token, url, err, endpoint] = await getToken(element.id, url)
                if (token != '') {
                    await sendSaleToMichelin(shop_id, token, url)
                }
            }
        }
    })
}


const getToken = async (id, url, endpoint_) => {

    var oauth = await ThirdPartyApiConnectData.findOne({ where: { id: id } })
    var client_id = oauth.auth_oauth.client_id
    var secret_key = oauth.auth_oauth.secret_key

    var endpoint = endpoint_ || config.michelin_api
    //call code 
    var code = ''
    var data_to_return = []
    await axios.get(endpoint + '/oauth',
        {
            maxRedirects: 0,
            validateStatus: (status) => [302, 200].includes(status),
            params: {
                response_type: 'code',
                client_id: client_id,
                redirect_uri: url
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(async (res) => {

            if (res.headers.location) {

                code = res.headers.location.split('/?code=')[1]
                await handleSaveLog(request, [['get code token on sending sale to michelin', client_id, code], ''])
            }
            else if (res.data.data) {
                await handleSaveLog(request, [['get code token on sending sale to michelin', client_id, code], 'error : ' + res.data.data])
                data_to_return = [oauth.shop_id, '', url, res.data.data, endpoint]

            } else {
                await handleSaveLog(request, [['get code token on sending sale to michelin', client_id, code], 'error : error'])
                data_to_return = [oauth.shop_id, '', url, 'error', endpoint]
            }
        })
        .catch(async (err) => {
            await handleSaveLog(request, [['get code token on sending sale to michelin', client_id], err.toString()])
            data_to_return = [oauth.shop_id, '', url, err.toString(), endpoint]

        })


    //call token
    var token = ''
    if (isUUID(code)) {
        await axios.post(
            endpoint + '/oauth/token',
            {
                "grant_type": "authorization_code",
                "code": code,
                "client_id": client_id,
                "client_secret": secret_key
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'origin': url
                }
            }
        ).then(async (res) => {
            token = res.data.data.access_token
            await handleSaveLog(request, [['get token on sending sale to michelin', client_id, token], ''])
            data_to_return = [oauth.shop_id, token, url, '', endpoint]

        }).catch(async (err) => {
            await handleSaveLog(request, [['get token on sending sale to michelin', client_id], err.toString()])
            data_to_return = [oauth.shop_id, '', url, err.toString(), endpoint]

        })

    }
    return data_to_return

}

const sendSaleToMichelin = async (shop_id, token, url) => {

    var date = new Date().toLocaleDateString('en-GB').split('/').reverse().join('')
    var check_sale = await ShopsProfiles.findOne({
        where: { id: shop_id }
    })
    var table_name = check_sale.shop_code_id.toLowerCase()
    var sale = await ShopSalesOrderPlanLogs(table_name).findAll({
        attributes: [
            [sequelize.literal(`\"ShopProducts->Product\".master_path_code_id`), 'CAI'],
            [sequelize.literal(`(SELECT 'IV' )`), 'DocType'],
            [sequelize.literal(`\"ShopSalesTransactionDoc->ShopBusinessCustomers\".other_details->>'match_ad_michelin'`), 'ADRegNo'],

            // [sequelize.literal(`(SELECT to_char(now(), 'YYYY-MM-DD')) `), 'InvoiceDate'],
            [sequelize.literal(`\"ShopSalesTransactionDoc\".doc_date`), 'InvoiceDate'],
            [sequelize.literal(`\"ShopSalesTransactionDoc\".code_id`), 'InvoiceNo'],
            [sequelize.literal(`\"ShopSalesTransactionDoc\".run_no`), 'ItemNo'],
            [sequelize.literal(`\"ShopProducts->Product\".master_path_code_id`), 'PartNumber'],
            [sequelize.literal(`sum( cast("ShopSalesOrderPlanLogs".warehouse_detail->'shelf'->0->>'amount' AS INT))`), 'Qty']
        ],
        include: [
            {
                model: ShopSalesTransactionDoc(table_name), as: 'ShopSalesTransactionDoc', attributes: [],
                include: [
                    {
                        model: ShopBusinessCustomers(table_name), as: 'ShopBusinessCustomers', attributes: []
                    }
                ]
            },
            {
                model: ShopProduct(table_name), as: 'ShopProducts',
                attributes: [],
                include: [{
                    model: Product, attributes: [],
                }]
            }],
        where: {
            [Op.and]: [
                //get just product michelin brand
                sequelize.literal(`\"ShopProducts->Product\".product_brand_id = :product_brand_id`),
                sequelize.literal(`\"ShopSalesTransactionDoc\".bus_customer_id is not null`),
                //get just customer that have a match_ad_michelin
                sequelize.literal(`\"ShopSalesTransactionDoc->ShopBusinessCustomers\".other_details->'match_ad_michelin' is not null`),
                sequelize.literal(`\"ShopSalesOrderPlanLogs\".created_date between NOW() - INTERVAL '1 DAY' and  NOW()`),
                //เป็นใบบิลย่อย
                // sequelize.literal(`\"ShopSalesTransactionDoc\".status = 3`),

            ]
        },
        group: [
            sequelize.literal(`"ShopSalesTransactionDoc->ShopBusinessCustomers".other_details->>'match_ad_michelin'`),
            sequelize.literal(`"ShopSalesTransactionDoc".doc_date`),
            sequelize.literal(`"ShopSalesTransactionDoc".code_id`),
            sequelize.literal(`"ShopSalesTransactionDoc".run_no`),
            sequelize.literal(`"ShopProducts->Product".master_path_code_id`)
        ],
        replacements: { product_brand_id: config.michelin_brand_id }
    })



    await handleSaveLog(request, [['sale data to sending sale to michelin', shop_id, sale], ''])

    if (sale.length > 0) {

        await axios.put(
            config.michelin_api + '/webMax/SubmitSalesDetail/byjson',
            sale,
            {
                params: {
                    RDSubCode: 'A',
                    TransDate: date
                },
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'origin': url
                }
            }
        ).then(async (res) => {
            await handleSaveLog(request, [['sending sale to michelin', shop_id, res.data], ''])
        }).catch(async (err) => {
            await handleSaveLog(request, [['sending sale to michelin', shop_id], err.toString()])
        })
    }
}


module.exports = { checkConfigSendingSaleToMichelin, getToken }