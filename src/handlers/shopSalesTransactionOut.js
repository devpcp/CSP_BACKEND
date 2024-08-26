const _ = require("lodash");
const { Op, Transaction } = require("sequelize");
const { handleSaveLog } = require('./log')
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson')
const utilCheckShopTableName = require('../utils/util.CheckShopTableName')
const utilGetFastifyRequestHeaderAcceptLanguage = require('../utils/util.GetFastifyRequestHeaderAcceptLanguage')

const sequelize = require('../db');
const User = require('../models/model').User;
const ShopSalesTransactionOut = require('../models/model').ShopSalesTransactionOut;
const ShopSalesTransactionDoc = require('../models/model').ShopSalesTransactionDoc;
const ShopSalesOrderPlanLogs = require('../models/model').ShopSalesOrderPlanLogs;
const ShopVehicleCustomer = require('../models/model').ShopVehicleCustomer;
const ShopBusinessCustomers = require('../models/model').ShopBusinessCustomers;
const ShopPersonalCustomers = require('../models/model').ShopPersonalCustomers;

const handleShopTransactionOutAll = async (request, res) => {


    // request.id = '232bbbd7-5a70-46da-8af3-a71a7503b564'
    const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

    // return requestLang

    var shop_table = await utilCheckShopTableName(request)
    var table_name = shop_table.shop_code_id

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var ref_doc_sale_id = (request.query.ref_doc_sale_id) ? { ref_doc_sale_id: request.query.ref_doc_sale_id } : {}
    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;
    // [ 'ASC']
    var where_q = {
        status: status,
        ...ref_doc_sale_id,
        [Op.or]: [
            sequelize.literal("\"SalesTransactionDocSale\".code_id LIKE '%'||$1||'%'"),
            sequelize.literal("\"SalesTransactionDocSale->ShopPersonalCustomers\".master_customer_code_id LIKE '%'||$1||'%'"),
            sequelize.literal("\"SalesTransactionDocSale->ShopBusinessCustomers\".master_customer_code_id LIKE '%'||$1||'%'"),
            ...requestLang.map(w => sequelize.literal(`\"SalesTransactionDocSale->ShopPersonalCustomers\".customer_name->'first_name'->>'${w}' iLIKE '%'||$1||'%'`)),
            ...requestLang.map(w => sequelize.literal(`\"SalesTransactionDocSale->ShopBusinessCustomers\".customer_name->'first_name'->>'${w}' iLIKE '%'||$1||'%'`)),
            ...requestLang.map(w => sequelize.literal(`\"SalesTransactionDocSale->ShopPersonalCustomers\".customer_name->'last_name'->>'${w}' iLIKE '%'||$1||'%'`)),
            ...requestLang.map(w => sequelize.literal(`\"SalesTransactionDocSale->ShopBusinessCustomers\".customer_name->'last_name'->>'${w}' iLIKE '%'||$1||'%'`)),
            sequelize.literal("\"SalesTransactionDocSale->ShopSalesOrderPlanLog\".details->>'price' LIKE '%'||$1||'%'"),
        ]

    }


    const modelShopSalesTransactionDoc = await ShopSalesTransactionDoc(table_name)
    const modelShopSalesOrderPlanLogs = await ShopSalesOrderPlanLogs(table_name)

    modelShopSalesTransactionDoc.hasOne(modelShopSalesOrderPlanLogs, { foreignKey: 'doc_sale_id' })


    var include = [
        { model: User, as: 'User_create', attributes: [] },
        { model: User, as: 'User_update', attributes: [] },
        {
            model: modelShopSalesTransactionDoc, as: 'SalesTransactionDocSale',
            include: [
                { model: modelShopSalesOrderPlanLogs },
                { model: ShopPersonalCustomers(table_name), as: 'ShopPersonalCustomers' },
                { model: ShopBusinessCustomers(table_name), as: 'ShopBusinessCustomers' },
                { model: ShopVehicleCustomer(table_name), as: 'ShopVehicleCustomers' }
            ]
        },
        { model: modelShopSalesTransactionDoc, as: 'SalesTransactionDocFullInvoice' },
        { model: modelShopSalesTransactionDoc, as: 'SalesTransactionDocRefDoc' }
    ]


    var ShopSalesTransactionOuts = await ShopSalesTransactionOut(table_name).findAll({
        order: [[sort, order]],
        attributes: {
            include: [
                // [sequelize.literal('json_array_length(shelf)'), 'shelf_total'],
                [sequelize.literal("\"User_create\".\"user_name\" "), 'created_by'],
                [sequelize.literal("\"User_update\".\"user_name\" "), 'updated_by']
            ]
        },
        include: include,
        required: false,
        where: where_q,
        bind: [search],
        limit: limit,
        offset: (page - 1) * limit
    })

    var length_data = await ShopSalesTransactionOut(table_name).count({
        include: include,
        where: where_q,
        bind: [search],

    })

    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: ShopSalesTransactionOuts.length,
        totalCount: length_data,
        data: ShopSalesTransactionOuts

    }


    await handleSaveLog(request, [['get ShopSalesTransactionOut all'], ''])
    return ({ status: 'success', data: pag })

}

const handleShopTransactionOutAdd = async (request, res) => {
    const action = 'add ShopSalesTransactionOut';
    const currentDateTime = new Date();

    try {
        const transactionResult = await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                // request.id = '232bbbd7-5a70-46da-8af3-a71a7503b564'
                const shop_table = await utilCheckShopTableName(request)
                const table_name = shop_table.shop_code_id

                const modelShopSalesTransactionDoc = await ShopSalesTransactionDoc(table_name);
                const modelShopSalesOrderPlanLogs = await ShopSalesOrderPlanLogs(table_name);

                modelShopSalesTransactionDoc.hasOne(modelShopSalesOrderPlanLogs, { foreignKey: 'doc_sale_id' });


                let { doc_sale_id, full_invoice_doc_sale_id, ref_doc_sale_id, status } = request.body;

                if (status == 1) {
                    if (!ref_doc_sale_id) {
                        throw Error(`body should have required property 'ref_doc_sale_id'`);
                    }
                }
                if (!ref_doc_sale_id) {
                    ref_doc_sale_id = await ShopSalesTransactionOut(table_name).findAll({
                        where: { doc_sale_id: full_invoice_doc_sale_id },
                        transaction: transaction
                    });
                    ref_doc_sale_id = ref_doc_sale_id[0].ref_doc_sale_id;
                }

                const trans_doc = await modelShopSalesTransactionDoc.findAll({
                    where: { id: ref_doc_sale_id },
                    include: [{ model: modelShopSalesOrderPlanLogs }],
                    transaction: transaction
                });

                const createdShopSalesTransactionOutDocs = [];
                for (let index = 0; index < trans_doc.length; index++) {
                    const element = trans_doc[index];

                    const createdShopSalesTransactionOutDoc = await ShopSalesTransactionOut(table_name).create(
                        {
                            doc_sale_id: doc_sale_id,
                            full_invoice_doc_sale_id: full_invoice_doc_sale_id,
                            ref_doc_sale_id: ref_doc_sale_id,
                            shop_id: shop_table.id,
                            product_id: element.ShopSalesOrderPlanLog.product_id,
                            item_no: index + 1,
                            qty: element.ShopSalesOrderPlanLog.amount,
                            status: status,
                            created_by: request.id,
                            created_date: currentDateTime
                        },
                        { transaction: transaction }
                    );

                    createdShopSalesTransactionOutDocs.push(createdShopSalesTransactionOutDoc);
                }

                //1||3 บิลย่อย
                //2||4 บิลเต็มรูปแบบ
                if (status == 1 || status == 2) {
                    await modelShopSalesTransactionDoc.update(
                        {
                            status: (status == 1) ? 3 : 4,
                            updated_by: request.id,
                            updated_date: currentDateTime
                        }
                        ,{
                            where: { id: ref_doc_sale_id },
                            transaction: transaction
                        }
                    );
                }

                await handleSaveLog(request, [[action, _.get(createdShopSalesTransactionOutDocs[0], 'id', ''), request.body], '']);

                return createdShopSalesTransactionOutDocs;
            }
        );

        return utilSetFastifyResponseJson("success", transactionResult);

    } catch (error) {
        error = error.toString();
        await handleSaveLog(request, [[action], 'error : ' + error]);
        return ({ status: "failed", data: error });
    }
}

const handleShopTransactionOutById = async (request, res) => {

    var shop_table = await utilCheckShopTableName(request)
    var table_name = shop_table.shop_code_id

    var id = request.params.id

    const modelShopSalesTransactionDoc = await ShopSalesTransactionDoc(table_name)
    const modelShopSalesOrderPlanLogs = await ShopSalesOrderPlanLogs(table_name)

    modelShopSalesTransactionDoc.hasOne(modelShopSalesOrderPlanLogs, { foreignKey: 'doc_sale_id' })


    var include = [
        { model: User, as: 'User_create', attributes: [] },
        { model: User, as: 'User_update', attributes: [] },
        {
            model: modelShopSalesTransactionDoc, as: 'SalesTransactionDocSale',
            include: [
                { model: modelShopSalesOrderPlanLogs },
                { model: ShopPersonalCustomers(table_name), as: 'ShopPersonalCustomers' },
                { model: ShopBusinessCustomers(table_name), as: 'ShopBusinessCustomers' },
                { model: ShopVehicleCustomer(table_name), as: 'ShopVehicleCustomers' }
            ]
        },
        { model: modelShopSalesTransactionDoc, as: 'SalesTransactionDocFullInvoice' },
        { model: modelShopSalesTransactionDoc, as: 'SalesTransactionDocRefDoc' }
    ]


    var ShopSalesTransactionOuts = await ShopSalesTransactionOut(table_name).findAll({
        where: { id: id },
        attributes: {
            include: [
                // [sequelize.literal('json_array_length(shelf)'), 'shelf_total'],
                [sequelize.literal("\"User_create\".\"user_name\" "), 'created_by'],
                [sequelize.literal("\"User_update\".\"user_name\" "), 'updated_by']
            ]
        },
        include: include,
        required: false
    })

    await handleSaveLog(request, [['get ShopWarehouses byid'], ''])
    return utilSetFastifyResponseJson("success", [ShopSalesTransactionOuts[0]])



}

const handleShopTransactionOutPut = async (request, res) => {
    const action = 'put ShopSalesTransactionOut put';

    try {
        const shop_table = await utilCheckShopTableName(request);

        const table_name = shop_table.shop_code_id;

        const modelShopSalesTransactionOut = ShopSalesTransactionOut(table_name);

        const transactionResults = await sequelize.transaction(
            {
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                const findShopTransactionOutDocument = await modelShopSalesTransactionOut.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                });

                if (!findShopTransactionOutDocument) {
                    throw Error('findShopTransactionOutDocument return not found');
                }

                const beforeUpdateDocument = JSON.stringify(findShopTransactionOutDocument.toJSON());

                findShopTransactionOutDocument.set({
                    ...request.body,
                    updated_by: request.id,
                    updated_date: Date.now(),
                });

                const updateShopTransactionOutDocument = await findShopTransactionOutDocument.save({ transaction: transaction });

                const afterUpdateDocument = JSON.stringify(updateShopTransactionOutDocument.toJSON());


                return { beforeUpdateDocument, afterUpdateDocument };
            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResults.beforeUpdateDocument], '']);

        return utilSetFastifyResponseJson('success', JSON.parse(transactionResults.afterUpdateDocument));

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error}`]);

        throw error;
    }
}

module.exports = {
    handleShopTransactionOutAll,
    handleShopTransactionOutAdd,
    handleShopTransactionOutById,
    handleShopTransactionOutPut
}