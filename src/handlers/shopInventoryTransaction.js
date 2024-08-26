const _ = require("lodash");
const fs = require('fs')
const XLSX = require('xlsx');
const { isUUID } = require('../utils/generate')
const { Op, Transaction, QueryTypes, literal } = require("sequelize");
const { handleSaveLog } = require('./log')
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson')
const utilCheckShopTableName = require('../utils/util.CheckShopTableName')
const utilIsDateYYYYMMDDWithDash = require("../utils/util.IsDateYYYYMMDDWithDash");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilIsErrorDynamicsTableNotFound = require("../utils/util.IsErrorDynamicsTableNotFound");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const utilSequelizeCreateTableIfNotExistsFromModel = require("../utils/util.Sequelize.CreateTableIfNotExistsFromModel");
const utilSetShopStockProductBalance = require("../utils/util.SetShopStockProductBalance");
const utilGetCurrentProductShopStock = require("../utils/util.GetCurrentProductShopStock");
const utilSetShopInventoryMovementLog = require("../utils/util.SetShopInventoryMovementLog");
const { config_run_number_shop_inventory_transaction_prefix } = require("../config");

const db = require('../db');
const { ShopStock } = require("../models/model");
const ShopsProfiles = require('../models/model').ShopsProfiles
const modelDocumentTypes = require('../models/model').DocumentTypes
const DocumentTypeGroups = require("../models/model").DocumentTypeGroups;
const Product = require("../models/model").Product;
const ProductPurchaseUnitTypes = require("../models/model").ProductPurchaseUnitTypes;
const ProductType = require("../models/model").ProductType;
const modelShopInventoryManagementLogs = require("../models/model").ShopInventory;
const modelShopInventoryTransaction = require('../models/model').ShopInventoryTransaction;
const ShopWarehouses = require("../models/model").ShopWarehouse;
const ShopBusinessPartners = require("../models/model").ShopBusinessPartners;
const ShopProduct = require("../models/model").ShopProduct;
const {
    initShopModel,
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

const handleShopInventoryTransactionAddByFile = async (request) => {
    try {


        const file = await request.body.file

        await fs.writeFileSync('src/assets/' + file.filename, await file.toBuffer());
        const wb = XLSX.readFile('src/assets/' + file.filename);
        await fs.unlinkSync('src/assets/' + file.filename)


        let check_data = request.query.check_data
        let adjust_balance = request.query.adjust_balance

        const header_first = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]
        let data_first = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])[0]

        let range = XLSX.utils.decode_range(wb.Sheets[wb.SheetNames[0]]['!ref']);
        range.s.c = 0; // 0 == XLSX.utils.decode_col("A")
        range.e.c = 12; // 6 == XLSX.utils.decode_col("G")
        range.s.r = 2;
        const new_range = XLSX.utils.encode_range(range);

        const header_second = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: new_range })[0]
        let data_second = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: new_range })

        let header_first_ = [
            "รหัสผู้จำหน่าย",
            "ชื่อผู้จำหน่าย",
            "เลขใบสั่งซื้อสินค้า",
            "เอกสารอ้างอิง",
            "ประเภทภาษี",
            "วันที่อ้างอิง",
            "หมายเหตุ"
        ]

        let header_second_ = [
            "รหัสสินค้า",
            "ชื่อสินค้า",
            "จำนวนทั้งหมด",
            "ราคา/หน่วย",
            "หน่วยซื้อ",
            "ลด 1",
            "ลด 2",
            "ลด 3",
            "คลังสินค้า",
            "ชั้นสินค้า",
            "Dot",
            "หน่วยซื้อ",
            "จำนวน"
        ]

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

        let check_header_first = areEqual(header_first_, header_first)
        let check_header_second = areEqual(header_second_, header_second)

        if (check_header_first[0] == false) {
            return ({ status: 'failed', data: check_header_first[1] })
        }
        if (check_header_second[0] == false) {
            return ({ status: 'failed', data: check_header_second[1] })
        }


        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        let bus_partner_id = await ShopBusinessPartners(table_name).findOne({
            where: {
                [Op.or]: [
                    { code_id: data_first["รหัสผู้จำหน่าย"] },
                    { partner_name: { th: data_first["ชื่อผู้จำหน่าย"] } }
                ]
            }
        })
        if (!bus_partner_id) {
            return ({ status: 'failed', data: 'รหัสผู้จำหน่าย หรือ ชื่อผู้จำหน่าย ไม่พบ' })
        }

        /**
         * default ไม่รวม vat
         */
        let tax_type_id = 'fafa3667-55d8-49d1-b06c-759c6e9ab064'

        /**
        * ใบนำเข้า
        */
        let doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47'


        let product_all = await ShopProduct(table_name).findAll({
            include: [{
                model: Product,
                include: [{
                    model: ProductType
                }]
            }],
            attributes: ['id',
                [db.literal(`"Product".product_name->'th'`), 'product_name'],
                [db.literal(`"Product".master_path_code_id`), 'master_path_code_id'],
                [db.literal(`"Product".product_code`), 'product_code']
            ]
        })

        let error = []
        let add_row_index = 4

        if (check_data == true) {

            for (let index = 0; index < data_second.length; index++) {
                const element = data_second[index];


                let check_product = product_all.filter(el => { return el.dataValues.master_path_code_id == element['รหัสสินค้า'] || el.dataValues.product_code == element['รหัสสินค้า'] })

                if (check_product.length > 1) {
                    check_product = await check_product.filter(el => { return el.dataValues.product_name.replace(/\s/g, '') == element['ชื่อสินค้า'].replace(/\s/g, '') })
                }



                if (check_product.length == 0) {
                    error.push({ index: index + add_row_index, cases: 'product not found' })
                } else if (check_product.length > 1) {
                    error.push({ index: index + add_row_index, cases: 'product more than one' })
                }

            }

            return utilSetFastifyResponseJson("success", error);

        }
        if (adjust_balance == true) {

            let stock = await ShopStock(table_name).findAll()
            let add_balance = []
            let reduce_balance = []
            for (let index = 0; index < data_second.length; index++) {
                const element = data_second[index];


                let check_product = product_all.filter(el => { return el.dataValues.master_path_code_id == element['รหัสสินค้า'] || el.dataValues.product_code == element['รหัสสินค้า'] })

                if (check_product.length > 1) {
                    check_product = await check_product.filter(el => { return el.dataValues.product_name.replace(/\s/g, '') == element['ชื่อสินค้า'].replace(/\s/g, '') })
                }


                let check = stock.filter(el => { return el.product_id == check_product[0].id })

                if (check.length == 0) {
                    if (element['จำนวนทั้งหมด'] > 0) {
                        add_balance.push({ product_id: check_product[0].id, master_path_code_id: element["รหัสสินค้า"], amount: element['จำนวนทั้งหมด'] })
                    }

                } else {
                    if (element['จำนวนทั้งหมด'] > check[0].balance) {
                        add_balance.push({ product_id: check_product[0].id, master_path_code_id: element["รหัสสินค้า"], amount: element['จำนวนทั้งหมด'] })
                    } else if (element['จำนวนทั้งหมด'] < check[0].balance) {
                        reduce_balance.push({ product_id: check_product[0].id, master_path_code_id: element["รหัสสินค้า"], amount: element['จำนวนทั้งหมด'] })
                    }

                }






            }

            return utilSetFastifyResponseJson("success", { add_balance: add_balance, reduce_balance: reduce_balance });

        }


        let warehouse_all = await ShopWarehouses(table_name).findAll({})

        let purchase_unit_all = await ProductPurchaseUnitTypes.findAll()

        var product_array = [[]]
        for (let index = 0; index < data_second.length; index++) {
            const element = data_second[index];
            if (product_array[parseInt((index) / 20)] == null) {
                product_array[parseInt((index) / 20)] = [element]
            } else {
                product_array[parseInt((index) / 20)].push(element)
            }

        }


        for (let index = 0; index < product_array.length; index++) {
            const element1 = product_array[index];

            let error = []
            let add_row_index = 4
            let product_list = []
            let pricr_all = 0
            let purchase_unit_id = ''


            for (let index = 0; index < element1.length; index++) {
                const element = element1[index];

                pricr_all = pricr_all + parseInt(element["ราคา/หน่วย"])
                purchase_unit_id = ''

                let check_product = product_all.filter(el => { return el.dataValues.master_path_code_id == element['รหัสสินค้า'] || el.dataValues.product_code == element['รหัสสินค้า'] })

                if (check_product.length > 1) {
                    check_product = await check_product.filter(el => { return el.dataValues.product_name.replace(/\s/g, '') == element['ชื่อสินค้า'].replace(/\s/g, '') })
                }


                if (check_product.length == 0) {
                    error.push({ index: index + add_row_index, cases: 'product not found' })
                } else if (check_product.length == 1) {
                    if (check_product[0].Product.ProductType?.type_group_id) {
                        purchase_unit_id = await purchase_unit_all.filter(el => { return el.type_name.th === element["หน่วยซื้อ"] && el.type_group_id === check_product[0].Product.ProductType.type_group_id })
                        if (purchase_unit_id.length > 0) {
                            purchase_unit_id = purchase_unit_id[0].id
                        }
                    }


                    if (purchase_unit_id == '') {
                        error.push({ index: index + add_row_index, cases: 'purchase_unit_id not found' })
                    }

                    let check_warehouse = warehouse_all.filter(el1 => { return el1.name.th == element["คลังสินค้า"] })
                    if (check_warehouse.length == 0) {
                        error.push({ index: index + add_row_index, cases: 'check_warehouse not found' })
                    } else if (check_warehouse.length == 1) {

                        let item = check_warehouse[0].shelf.filter(el2 => { return el2.name.th == element["ชั้นสินค้า"] })
                        let price = element["ราคา/หน่วย"]
                        if (price == '') {
                            price = 0
                        }
                        if (item.length == 0) {
                            error.push({ index: index + add_row_index, cases: 'shelf not found' })
                        } else {
                            product_list.push({
                                product_id: check_product[0].id,
                                warehouse_detail: [
                                    {
                                        warehouse: check_warehouse[0].id,
                                        shelf: {
                                            item: item[0].code || null,
                                            amount: parseInt(element["จำนวน"]),
                                            "dot_mfd": (element["Dot"]) ? element["Dot"].toString() : undefined,
                                            "purchase_unit_id": purchase_unit_id
                                        }
                                    }
                                ],
                                amount_all: parseInt(element["จำนวนทั้งหมด"]),
                                details: {
                                    "price": parseInt(element["ราคา/หน่วย"]),
                                    "price_text": element["ราคา/หน่วย"].toString(),
                                    "discount_percentage_1": 0,
                                    "discount_percentage_1_text": "0",
                                    "discount_percentage_2": 0,
                                    "discount_percentage_2_text": "0",
                                    "discount_3": null,
                                    "discount_3_text": null,
                                    "discount_3_type": "bath",
                                    "discount_thb": null,
                                    "discount_thb_text": "0.00",
                                    "total_price": parseInt(element["ราคา/หน่วย"]) * parseInt(element["จำนวนทั้งหมด"]),
                                    "total_price_text": (parseInt(element["ราคา/หน่วย"]) * parseInt(element["จำนวนทั้งหมด"])).toFixed(2).toString(),
                                    "unit": purchase_unit_id
                                },
                            })
                        }

                    } else {
                        error.push({ index: index + add_row_index, cases: 'check_warehouse more than one' })
                    }


                } else {
                    error.push({ index: index + add_row_index, cases: 'product more than one' })
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

                // await handleSaveLog(request, [[action], error_str])
                throw Error(error_str)
                return ({ status: 'failed', data: error_str })
            }



            let details = {
                "tax_type": tax_type_id,
                "total_discount": 0.00,
                "total_discount_text": "0.00",
                "total_price_all": pricr_all,
                "total_price_all_text": pricr_all.toFixed(2).toString(),
                "total_price_all_after_discount": pricr_all,
                "total_price_all_after_discount_text": pricr_all.toFixed(2).toString(),
                "vat": 0.00,
                "vat_text": "0.00",
                "net_price": pricr_all,
                "net_price_text": pricr_all.toFixed(2).toString(),
                "user_id": request.id
            }



            const reqHandleShopInventoryDocAdd = {
                ...request,
                headers: {
                    ...request.headers,
                    'HTTP_X_REAL_IP': request.headers['HTTP_X_REAL_IP'] || request.socket.remoteAddress || '127.0.0.1'
                }
            };
            reqHandleShopInventoryDocAdd.body = {
                shop_id: shop_table.id,
                bus_partner_id: bus_partner_id.id,
                doc_date: new Date(Math.round((data_first["วันที่อ้างอิง"] - 25569) * 86400 * 1000)).toISOString().split('T')[0],
                details: details,
                price_grand_total: pricr_all,
                status: 1,
                use_stock: true,
                doc_type_id: doc_type_id,
                ShopInventory_Add: {
                    product_list: product_list,
                    import_date: new Date(Math.round((data_first["วันที่อ้างอิง"] - 25569) * 86400 * 1000))
                }
            }

            await handleSaveLog(request, [['post ShopInventoryTransaction add by file'], ''])
            await handleShopInventoryTransactionAdd(reqHandleShopInventoryDocAdd).catch(error => {
                console.log(error)
                throw Error(error)
            });

        }



        return ({ status: "success", data: "success" })

    }
    catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['post ShopInventoryTransaction add by file'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleShopInventoryTransactionAdd = async (request, reply, options = {}) => {
    try {
        const { handleShopInventoryAddByJson } = require("./shopInventory");

        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        const requestUserId = request.id;

        const {
            shop_id,
            bus_partner_id,
            doc_date,
            price_grand_total,
            details,
            status,
            doc_type_id,
            use_stock
        } = request.body;

        if (!isUUID(shop_id)) { throw (`@shop_id is required from request`); }
        else {
            const findShopId = await ShopsProfiles.findByPk(shop_id);
            if (!findShopId) { throw (`@shop_id is not found`); }
        }

        if (!utilIsDateYYYYMMDDWithDash(doc_date)) { throw (`@doc_date is required from request`); }

        if (![0, 1, 2, 3].includes(status)) { throw (`@status is required from request`); }

        if (!_.isPlainObject(details)) { throw (`@details is required from request`); }

        if (!isUUID(doc_type_id)) { throw (`@doc_type_id is required from request`); }
        else {
            const findDocTypeId = await modelDocumentTypes.findByPk(doc_type_id);
            if (!findDocTypeId) { throw (`@doc_type_id is not found`); }
        }

        const modelShopInventoryTransactionInstance = modelShopInventoryTransaction(table_name);
        await utilSequelizeCreateTableIfNotExistsFromModel(modelShopInventoryTransactionInstance);

        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                const createRunNumber = await utilGetRunNumberFromModel(
                    modelShopInventoryTransactionInstance,
                    "run_no",
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_shop_inventory_transaction_prefix,
                                transaction: transaction
                            }
                        ).then(r => r.prefix),
                        whereQuery: {
                            ...(
                                _.get(shop_table, 'shop_config.separate_ShopInventoryTransaction_DocType_doc_code', false)
                                    ? {
                                        doc_type_id: _.get(request.body, 'doc_type_id', null)
                                    }
                                    : {}
                            )
                        },
                        transaction: transaction
                    }
                );

                const createdDocument = await modelShopInventoryTransactionInstance.create(
                    {
                        run_no: createRunNumber.runNumber,
                        code_id: createRunNumber.runString,
                        shop_id: shop_id,
                        bus_partner_id: bus_partner_id,
                        doc_date: doc_date,
                        price_grand_total: price_grand_total,
                        details: details,
                        status: status,
                        doc_type_id: doc_type_id,
                        created_by: requestUserId,
                        created_date: currentDateTime,
                        updated_by: null,
                        updated_date: null
                    },
                    {
                        validate: true,
                        transaction: transaction
                    }
                );

                if (_.isPlainObject(request.body.ShopInventory_Add)) {
                    const requestShopInventory = request.body.ShopInventory_Add;
                    if (_.isArray(requestShopInventory.product_list)) {
                        const reqHandleShopInventoryDocAdd = {
                            ...request,
                            transaction: transaction,
                            headers: {
                                ...request.headers,
                                'HTTP_X_REAL_IP': request.headers['HTTP_X_REAL_IP'] || request.socket.remoteAddress || '127.0.0.1'
                            }
                        };
                        reqHandleShopInventoryDocAdd.body = {
                            doc_inventory_id: createdDocument.get('id'),
                            import_date: requestShopInventory.import_date || '',
                            product_list: requestShopInventory.product_list,
                            status: status,
                            use_stock: use_stock
                        }
                        options.movementLog_details = { documentType: 'INI', reasons: 'Create' };
                        if (status === 2 || status === 3) {
                            options.movementLog_details = { documentType: 'ADJ', reasons: 'Create' };
                        }
                        options.movementLog_doc_inventory_id = createdDocument.get('id');
                        await handleShopInventoryAddByJson(reqHandleShopInventoryDocAdd, reply, options);
                    }
                }

                return createdDocument;
            }
        );

        await handleSaveLog(request, [['post ShopInventoryTransaction add', transactionResult.id, request.body], '']);

        return utilSetFastifyResponseJson("success", transactionResult);
    }
    catch (error) {
        await handleSaveLog(request, [['post ShopInventoryTransaction add'], `error : ${error}`]);
        return utilSetFastifyResponseJson("failed", error);
    }
};


const handleShopInventoryTransactionAll = async (request) => {
    try {

        const acceptLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        const shop_table = await utilCheckShopTableName(request, 'select_shop_ids');
        const table_name = shop_table[0].shop_code_id;

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopInventoryImportDoc,
            ShopPaymentTransaction
        } = ShopModels;

        const search = request.query.search;
        const limit = request.query.limit || 10;
        const page = request.query.page || 1;
        const sort = request.query.sort;
        const order = request.query.order;
        const status = ['0', '1'].includes(request.query.status) ? { status: Number(request.query.status) } : { status: { [Op.ne]: 0 } };
        const doc_type_id = isUUID(request.query.doc_type_id) ? { doc_type_id: request.query.doc_type_id } : {};
        const product_id = (request.query.product_id) ? [db.literal(`(
            select count(*)  FROM app_shops_datas.dat_${table_name}_inventory_management_logs logs
            where logs.product_id = :product_id
            and logs.doc_inventory_id = "ShopInventoryTransaction".id
        ) > 0`)] : {};
        const select_destination_id = request.query.select_destination_id || null

        /**
       * @type {number|null}
       */
        let payment_paid_status = Number.isSafeInteger(request.query?.payment_paid_status)
            ? request.query.payment_paid_status
            : null;

        const filter__debt_price_amount_left = request.query?.filter__debt_price_amount_left || false;


        let = select_destination_id_where = {}
        if (select_destination_id != null) {
            select_destination_id_where = { details: { destination_branch: select_destination_id } }
        }

        let payment_paid_status_ = {}
        if (Number.isSafeInteger(payment_paid_status)) {
            payment_paid_status_[Op.and] = [];

            payment_paid_status_[Op.and].push(literal(`
                ((
                    CASE
                        WHEN "ShopInventoryTransaction".payment_paid_status = 6
                        THEN (CASE WHEN
                                "ShopInventoryTransaction".debt_price_amount -
                                coalesce((
                                    SELECT debt_price_paid_grand_total
                                    FROM (
                                            SELECT
                                                shop_inventory_transaction_id,
                                                sum(debt_price_paid_total + debt_price_paid_adjust)::numeric(20,2) AS debt_price_paid_grand_total
                                            FROM app_shops_datas.dat_01hq0004_partner_debt_list AS "ShopPartDebtList"
                                            WHERE "ShopPartDebtList".shop_partner_debt_doc_id = (SELECT x.id FROM app_shops_datas.dat_01hq0004_partner_debt_doc AS x WHERE x.id = "ShopPartDebtList".shop_partner_debt_doc_id AND x.status = 1 AND x.payment_paid_status = 3)
                                            GROUP BY shop_inventory_transaction_id
                                         ) AS u
                                    WHERE u.shop_inventory_transaction_id = "ShopInventoryTransaction".id
                                ),0) = 0
                                THEN 3
                                ELSE "ShopInventoryTransaction".payment_paid_status
                            END)
                        ELSE "ShopInventoryTransaction".payment_paid_status
                    END
                ) = ${payment_paid_status})
            `.replace(/(01hq0004)+/ig, table_name).replace(/\s+/ig, ' ')));
        }

        let debt_price_amount_left = {}
        if (filter__debt_price_amount_left) {
            debt_price_amount_left = {
                debt_price_amount_left: {
                    [Op.gt]: 0
                }
            }
        }

        const where_q = {
            ...status,
            ...doc_type_id,
            ...product_id,
            ...payment_paid_status_,
            ...debt_price_amount_left,
            ...select_destination_id_where,
            [Op.or]: [
                {
                    code_id: {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    details: {
                        References_doc: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                },
                {
                    details: {
                        purchase_order_number: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                },
                db.Sequelize.literal(`"ShopsProfiles"."shop_code_id" iLIKE '%${search}%'`),
                db.Sequelize.literal(`"ShopsProfiles"."tax_code_id" iLIKE '%${search}%'`),
                db.Sequelize.literal(`"DocumentTypes"."code_id" iLIKE '%${search}%'`),
                db.Sequelize.literal(`"ShopBusinessPartners"."partner_name"->>'th' iLIKE '%${search}%'`),
                ...acceptLang.map(wLang => db.Sequelize.literal(`"ShopsProfiles"."shop_name"->>'${wLang.toLowerCase()}' iLIKE '%${search}%'`)),
                ...acceptLang.map(wLang => db.Sequelize.literal(`"DocumentTypes"."type_name"->>'${wLang.toLowerCase()}' iLIKE '%${search}%'`)),
            ]
        };



        const findShopInventoryTxn = await ShopInventoryImportDoc.findAll({
            order: [[sort, order]],
            include: [
                { model: ShopsProfiles, as: 'ShopsProfiles', attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name'] },
                { model: modelDocumentTypes, as: 'DocumentTypes', attributes: ['id', 'code_id', 'type_name', 'type_group_id'], include: [{ model: DocumentTypeGroups }] },
                { model: ShopBusinessPartners(table_name), as: 'ShopBusinessPartners' },
                {
                    model: ShopPaymentTransaction, separate: true
                }
            ],
            attributes: {
                include: [
                    [db.Sequelize.literal(`(SELECT CAST(COUNT(*) AS INT) FROM app_shops_datas.dat_${table_name}_inventory_management_logs  WHERE status = 1 AND doc_inventory_id = \"ShopInventoryTransaction\".\"id\" )`), 'product_count'],
                    [db.Sequelize.literal(`(SELECT CAST(SUM(amount) AS INT) FROM app_shops_datas.dat_${table_name}_inventory_management_logs  WHERE status = 1 AND doc_inventory_id = \"ShopInventoryTransaction\".\"id\" )`), 'product_amount'],
                    [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopInventoryTransaction\".\"created_by\" )"), 'created_by'],
                    [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopInventoryTransaction\".\"updated_by\" )"), 'updated_by'],
                ]
            },
            required: false,
            where: where_q,
            limit: limit,
            offset: (page - 1) * limit,
            replacements: { product_id: request.query.product_id }
        }).catch(e => {
            if (utilIsErrorDynamicsTableNotFound(e)) {
                return [];
            }
            else {
                throw e;
            }
        });

        const findLengthData = findShopInventoryTxn.length === 0 ? 0 : await ShopInventoryImportDoc.count({
            include: [
                { model: ShopsProfiles, as: 'ShopsProfiles', attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name'] },
                { model: modelDocumentTypes, as: 'DocumentTypes', attributes: ['id', 'code_id', 'type_name', 'type_group_id'] },
                { model: ShopBusinessPartners(table_name), as: 'ShopBusinessPartners' },
                {
                    model: ShopPaymentTransaction, separate: true
                }
            ],
            where: where_q,
            replacements: { product_id: request.query.product_id }
        }).catch(e => {
            if (utilIsErrorDynamicsTableNotFound(e)) {
                return 0;
            }
            else {
                throw e;
            }
        });

        const pag = {
            currentPage: page,
            pages: Math.ceil(findLengthData / limit),
            currentCount: findShopInventoryTxn.length,
            totalCount: findLengthData,
            data: findShopInventoryTxn
        };

        await handleSaveLog(request, [['get ShopInventoryTransaction all'], '']);

        return utilSetFastifyResponseJson("success", pag);
    } catch (error) {
        await handleSaveLog(request, [['get ShopInventoryTransaction all'], `error : ${error}`]);

        throw error;
    }
};


const handleShopInventoryTransactionById = async (request) => {
    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = isUUID(request?.query?.shop_id || '')
            ? findShopProfiles.filter(w => w.id === request.query.shop_id)[0]?.shop_code_id
            : findShopProfiles[0].shop_code_id;
        if (!table_name) {
            throw new Error(`Shop is not found`);
        }

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopInventoryImportDoc,
            ShopPaymentTransaction
        } = ShopModels;


        if (!isUUID(request.params.id)) { throw Error(`@params.id is required from request`); }
        else {
            const findShopInventoryTxnById = await ShopInventoryImportDoc.findByPk(
                request.params.id,
                {
                    include: [
                        { model: ShopsProfiles, as: 'ShopsProfiles', attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name'] },
                        { model: modelDocumentTypes, as: 'DocumentTypes', attributes: ['id', 'code_id', 'type_name', 'type_group_id'], include: [{ model: DocumentTypeGroups }] },
                        { model: ShopBusinessPartners(table_name), as: 'ShopBusinessPartners' },
                        { model: ShopPaymentTransaction, separate: true }
                    ],
                    attributes: {
                        include: [
                            [db.Sequelize.literal(`(SELECT CAST(COUNT(*) AS INT) FROM app_shops_datas.dat_${table_name}_inventory_management_logs  WHERE doc_inventory_id = \"ShopInventoryTransaction\".\"id\" )`), 'product_count'],
                            [db.Sequelize.literal(`(SELECT CAST(SUM(amount) AS INT) FROM app_shops_datas.dat_${table_name}_inventory_management_logs  WHERE doc_inventory_id = \"ShopInventoryTransaction\".\"id\" )`), 'product_amount'],
                            [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopInventoryTransaction\".\"created_by\" )"), 'created_by'],
                            [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopInventoryTransaction\".\"updated_by\" )"), 'updated_by'],
                        ]
                    },
                }
            ).catch(e => {
                if (utilIsErrorDynamicsTableNotFound(e)) {
                    return null;
                }
                else {
                    throw e;
                }
            });

            await handleSaveLog(request, [['get ShopInventoryTransaction byid'], '']);

            return utilSetFastifyResponseJson("success", findShopInventoryTxnById);
        }
    }
    catch (error) {
        await handleSaveLog(request, [['get ShopInventoryTransaction byid'], `error : ${error}`]);

        throw error;
    }
}


const handleShopInventoryTransactionPut = async (request, reply, options = {}) => {
    const action = 'put ShopInventoryTransaction put';

    try {
        const { handleShopInventoryDocPut } = require("./shopInventory");

        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        return await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                let shop_table = await utilCheckShopTableName(request, 'select_shop_ids');
                shop_table = shop_table[0]

                const table_name = shop_table.shop_code_id;
                const getStatus = [0, 1, 2, 3].includes(request.body.status) ? { status: request.body.status } : {};
                const use_stock = request.body.use_stock


                if (!isUUID(request.params.id)) { throw Error(`@params.id is required from request`); }
                else {
                    const findShopInventoryTransaction = await modelShopInventoryTransaction(table_name).findOne({
                        where: {
                            id: request.params.id,
                            status: [1, 2, 3]
                        },
                        transaction: transaction
                    });
                    if (!findShopInventoryTransaction) {
                        throw Error(`Variable findShopInventoryTransaction return not found`);
                    }

                    // ยกเลิกใบรับสินค้า
                    if (getStatus.status === 0) {
                        // To cancel product import, it will do this condition
                        const findShopInventoryManagementLogs_IN = await modelShopInventoryManagementLogs(table_name).findAll({
                            where: {
                                doc_inventory_id: findShopInventoryTransaction.get('id'),
                                status: [1, 2, 3]
                            },
                            transaction: transaction
                        });
                        if (findShopInventoryManagementLogs_IN.length > 0) {
                            for (let index = 0; index < findShopInventoryManagementLogs_IN.length; index++) {
                                const elementLog = findShopInventoryManagementLogs_IN[index];
                                for (let idx = 0; idx < elementLog.warehouse_detail.length; idx++) {
                                    /** @typedef {object} IElementWarehouseDetail
                                     * @property {string} warehouse
                                     * @property {object} shelf
                                     * @property {string} shelf.item
                                     * @property {number} shelf.amount
                                     * @property {string|null} shelf.dot_mfd
                                     * @property {string|null} shelf.purchase_unit_id
                                     */
                                    /**
                                     * @type {IElementWarehouseDetail}
                                     */
                                    const elementWarehouseDetail = elementLog.warehouse_detail[idx];
                                    const findPreStockAdjust = await utilGetCurrentProductShopStock(
                                        table_name,
                                        {
                                            transaction: transaction,
                                            findShopProductId: elementLog.product_id,
                                            findShopWarehouseId: elementWarehouseDetail.warehouse,
                                            findShopWarehouseItemId: elementWarehouseDetail.shelf.item,
                                            findPurchaseUnitId: elementWarehouseDetail.shelf.purchase_unit_id || null,
                                            findDotMfd: elementWarehouseDetail.shelf.dot_mfd || null
                                        }
                                    );
                                    if (findPreStockAdjust.length !== 1) {
                                        throw Error(`Variable findPreStockAdjust.length must be 1`);
                                    }
                                    if (_.isNull(_.get(findPreStockAdjust[0], 'balance', null))) {
                                        throw Error(`Variable findPreStockAdjust[0].balance is not found`);
                                    }
                                    if ([1, 2].includes(elementLog.status)) {
                                        await utilSetShopStockProductBalance(
                                            table_name,
                                            elementLog.product_id,
                                            elementWarehouseDetail.warehouse,
                                            elementWarehouseDetail.shelf.item,
                                            elementWarehouseDetail.shelf.purchase_unit_id,
                                            elementWarehouseDetail.shelf.dot_mfd,
                                            "remove_balance_product",
                                            elementWarehouseDetail.shelf.amount,
                                            {
                                                transaction: transaction,
                                                updated_by: request.id
                                            }
                                        );
                                        await utilSetShopInventoryMovementLog(
                                            'INI',
                                            {
                                                shop_id: shop_table.id,
                                                product_id: elementLog.product_id,
                                                doc_inventory_id: findShopInventoryTransaction.get('id'),
                                                doc_inventory_log_id: findShopInventoryManagementLogs_IN[index].get('id'),
                                                stock_id: findPreStockAdjust[0].id,
                                                warehouse_id: elementWarehouseDetail.warehouse,
                                                warehouse_item_id: elementWarehouseDetail.shelf.item,
                                                purchase_unit_id: elementWarehouseDetail.shelf.purchase_unit_id || null,
                                                dot_mfd: elementWarehouseDetail.shelf.dot_mfd || null,
                                                count_previous_stock: +(findPreStockAdjust[0].balance),
                                                count_adjust_stock: Math.abs(+(elementWarehouseDetail.shelf.amount)) * -1,
                                                details: { documentType: 'INI', reasons: 'Delete' },
                                                created_by: request.id,
                                                created_date: currentDateTime
                                            },
                                            {
                                                transaction: transaction
                                            }
                                        );
                                    } else {
                                        await utilSetShopStockProductBalance(
                                            table_name,
                                            elementLog.product_id,
                                            elementWarehouseDetail.warehouse,
                                            elementWarehouseDetail.shelf.item,
                                            elementWarehouseDetail.shelf.purchase_unit_id,
                                            elementWarehouseDetail.shelf.dot_mfd,
                                            "add_balance_product",
                                            elementWarehouseDetail.shelf.amount,
                                            {
                                                transaction: transaction,
                                                updated_by: request.id
                                            }
                                        );
                                        await utilSetShopInventoryMovementLog(
                                            'INI',
                                            {
                                                shop_id: shop_table.id,
                                                product_id: elementLog.product_id,
                                                doc_inventory_id: findShopInventoryTransaction.get('id'),
                                                doc_inventory_log_id: findShopInventoryManagementLogs_IN[index].get('id'),
                                                stock_id: findPreStockAdjust[0].id,
                                                warehouse_id: elementWarehouseDetail.warehouse,
                                                warehouse_item_id: elementWarehouseDetail.shelf.item,
                                                purchase_unit_id: elementWarehouseDetail.shelf.purchase_unit_id || null,
                                                dot_mfd: elementWarehouseDetail.shelf.dot_mfd || null,
                                                count_previous_stock: +(findPreStockAdjust[0].balance),
                                                count_adjust_stock: Math.abs(+(elementWarehouseDetail.shelf.amount)) * 1,
                                                details: { documentType: 'INI', reasons: 'Delete' },
                                                created_by: request.id,
                                                created_date: currentDateTime
                                            },
                                            {
                                                transaction: transaction
                                            }
                                        );
                                    }

                                }
                            }
                            await modelShopInventoryManagementLogs(table_name).update(
                                {
                                    status: 0
                                },
                                {
                                    where: {
                                        doc_inventory_id: findShopInventoryTransaction.get('id'),
                                        status: 1
                                    },
                                    transaction: transaction
                                }
                            );
                        }

                        // To cancel product transfer, it will do this condition
                        const findShopInventoryManagementLogs_TRN = await modelShopInventoryManagementLogs(table_name).findAll({
                            where: {
                                doc_inventory_id: findShopInventoryTransaction.get('id'),
                                status: 4
                            },
                            transaction: transaction
                        });
                        if (findShopInventoryManagementLogs_TRN.length > 0) {
                            for (let index = 0; index < findShopInventoryManagementLogs_TRN.length; index++) {
                                const element = findShopInventoryManagementLogs_TRN[index];
                                for (let idxWH = 0; idxWH < element.warehouse_detail.length; idxWH++) {
                                    if (idxWH % 2 === 0) {
                                        const eleWHSrc = element.warehouse_detail[idxWH + 1];
                                        const eleWHDest = element.warehouse_detail[idxWH];

                                        if (eleWHDest && eleWHSrc) {
                                            await utilSetShopStockProductBalance(
                                                table_name,
                                                element.product_id,
                                                eleWHSrc.warehouse,
                                                eleWHSrc.shelf.item,
                                                eleWHSrc.shelf.purchase_unit_id,
                                                eleWHSrc.shelf.dot_mfd,
                                                "remove_balance_product",
                                                eleWHSrc.shelf.amount,
                                                {
                                                    transaction: transaction,
                                                    updated_by: request.id
                                                }
                                            );
                                            await utilSetShopStockProductBalance(
                                                table_name,
                                                element.product_id,
                                                eleWHDest.warehouse,
                                                eleWHDest.shelf.item,
                                                eleWHDest.shelf.purchase_unit_id,
                                                eleWHDest.shelf.dot_mfd,
                                                "add_balance_product",
                                                eleWHDest.shelf.amount,
                                                {
                                                    transaction: transaction,
                                                    updated_by: request.id
                                                }
                                            );
                                        }
                                    }
                                }
                            }
                            await modelShopInventoryManagementLogs(table_name).update(
                                {
                                    status: 0
                                },
                                {
                                    where: {
                                        doc_inventory_id: findShopInventoryTransaction.get('id'),
                                        status: 4
                                    },
                                    transaction: transaction
                                }
                            )
                        }

                    }

                    // แก้ไขใบรับสินค้า
                    if ((_.keys(getStatus).length === 0 || [1, 2, 3].includes(getStatus.status)) && _.isPlainObject(request.body.ShopInventory_Put)) {

                        const requestShopInventory = request.body.ShopInventory_Put;
                        if (_.isArray(requestShopInventory.product_list)) {
                            const reqHandleShopInventoryDocPut = {
                                ...request,
                                transaction: transaction,
                                headers: {
                                    ...request.headers,
                                    'HTTP_X_REAL_IP': request.headers['HTTP_X_REAL_IP'] || request.socket.remoteAddress || '127.0.0.1'
                                }
                            };
                            reqHandleShopInventoryDocPut.body = {
                                product_list: requestShopInventory.product_list,
                                import_date: requestShopInventory.import_date || '',
                                status: getStatus.status || 1,
                                use_stock: use_stock,
                            }
                            options.movementLog_doc_inventory_id = findShopInventoryTransaction.get('id');
                            options.movementLog_details = { documentType: 'INI', reasons: 'Edit' };
                            await handleShopInventoryDocPut(reqHandleShopInventoryDocPut, reply, options);
                        }
                    }

                    const before_update = await modelShopInventoryTransaction(table_name).findOne(
                        {
                            where: {
                                id: request.params.id
                            },
                            transaction: transaction
                        }
                    );

                    const updateDocument = await modelShopInventoryTransaction(table_name).update(
                        {
                            ...request.body,
                            ...getStatus,
                            updated_by: request.id,
                            updated_date: currentDateTime
                        },
                        {
                            where: {
                                id: request.params.id
                            },
                            transaction: transaction
                        }
                    );

                    await handleSaveLog(request, [[action, request.params.id, request.body, before_update], '']);

                    return utilSetFastifyResponseJson("success", updateDocument);
                }
            }
        );

    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        throw error;
    }
};


const handleShopInventoryTransactionImportHistory = async (request, reply, options = {}) => {
    const action = 'GET ShopInventoryTransaction.ImportHistory';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const search = request.query.search?.replace(/(\s|%)+/, '%') || '';
        const limit = request.query.limit || 10;
        const page = request.query.page || 1;
        const sort = request.query.sort || 'code_id';
        const order = request.query.order || 'ASC';
        const status = request.query.status === '0'
            ? [0]
            : request.query.status === '1'
                ? [1]
                : [0, 1];

        const doc_inventory_id = request.query.doc_inventory_id;
        const tax_type_id = request.query.tax_type_id;
        const bus_partner_id = request.query.bus_partner_id;
        const doc_date__startDate = request.query.doc_date__startDate || '';
        const doc_date__endDate = request.query.doc_date_endDate || '';
        let doc_date = '';
        if (doc_date__startDate && doc_date__endDate) {
            doc_date = `(INIDoc.doc_date BETWEEN '${doc_date__startDate}' AND '${doc_date__endDate}')`;
        }
        else {
            if (doc_date__startDate && !doc_date__endDate) {
                doc_date = `(INIDoc.doc_date >= '${doc_date__startDate}')`;
            }
            if (!doc_date__startDate && doc_date__endDate) {
                doc_date = `(INIDoc.doc_date <= '${doc_date__endDate}')`;
            }
        }

        const product_id = request.query.product_id;
        const shop_product_id = request.query.shop_product_id;

        const queryString = `
            WITH
                CTE_INI_List_BASE AS (
                    SELECT
                        INIList.id,
                        INIList.shop_id,
                        INIList.doc_inventory_id,
                        (SELECT P.id FROM app_datas.dat_products AS P WHERE P.id = (SELECT SP.product_id FROM app_shops_datas.dat_01hq0013_products AS SP WHERE SP.id = INIList.product_id)) AS product_id,
                        INIList.product_id AS shop_product_id,
                        (nullif(nullif(INIList.details->>'unit_id', 'undefined'), 'null'))::uuid AS product_purchase_unit_type_id,
                        INIList.amount,
                        (coalesce(nullif(nullif(INIList.details->>'price_text', 'undefined'), 'null'), '0.00'))::numeric(20,2) AS price_per_unit,
                        (coalesce(nullif(nullif(INIList.details->>'total_price_text', 'undefined'), 'null'), '0.00'))::numeric(20,2) AS total_price,
                        (coalesce(nullif(nullif(INIList.details->>'discount_thb', 'undefined'), 'null'), '0.00'))::numeric(20,2) AS total_list_discount_price,
                        (
                            SELECT
                            (
                                (CASE WHEN (coalesce(nullif(nullif(INIDoc.details->>'tailgate_discount', 'undefined'), 'null'), '0.00'))::numeric(20,2) = 0
                                              OR (
                                                    (coalesce(nullif(nullif(INIList.details->>'total_price', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                                    -
                                                    (coalesce(nullif(nullif(INIList.details->>'discount_thb_text', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                              )::numeric(20,2) <= 0
                                              OR (
                                                  (
                                                      (coalesce(nullif(nullif(INIDoc.details->>'total_price_all_text', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                                      -
                                                      (
                                                          (coalesce(nullif(nullif(INIDoc.details->>'total_discount_text', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                                          -
                                                          (coalesce(nullif(nullif(INIDoc.details->>'tailgate_discount', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                                      )
                                                  )::numeric(20,2)
                                              )::numeric(20,2) <= 0
                                     THEN 0
                                     ELSE (
                                         (
                                            (coalesce(nullif(nullif(INIList.details->>'total_price', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                            -
                                            (coalesce(nullif(nullif(INIList.details->>'discount_thb_text', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                         )::numeric(20,2)
                                         /
                                         (
                                            (coalesce(nullif(nullif(INIDoc.details->>'total_price_all_text', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                            -
                                            (
                                                (coalesce(nullif(nullif(INIDoc.details->>'total_discount_text', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                                -
                                                (coalesce(nullif(nullif(INIDoc.details->>'tailgate_discount', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                                            )
                                        )::numeric(20,2)
                                     )
                                END)
                                * (coalesce(nullif(nullif(INIDoc.details->>'tailgate_discount', 'undefined'), 'null'), '0.00'))::numeric(20,2)
                            )
                            FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS INIDoc WHERE INIDoc.id = INIList.doc_inventory_id
                        )::numeric(20,2) AS proportion_list_discount_price
                FROM app_shops_datas.dat_01hq0013_inventory_management_logs AS INIList
                WHERE INIList.status = 1
                    AND ((SELECT INIDoc.id FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS INIDoc WHERE INIDoc.id = INIList.doc_inventory_id AND INIDoc.doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47') = INIList.doc_inventory_id)
                    ${!product_id ? `` : `AND (
                        (
                            SELECT SP.id FROM app_shops_datas.dat_01hq0013_products AS SP
                            WHERE SP.id = INIList.product_id 
                                AND SP.product_id = '${product_id}'
                        ) = INIList.product_id 
                    )`}
                    ${!shop_product_id ? `` : `AND (INIList.product_id = '${shop_product_id}')`}
                ),
                CTE_INI_List_REFACTOR AS (
                    SELECT
                        INIList.id,
                        INIList.shop_id,
                        INIList.doc_inventory_id,
                        INIList.product_id,
                        INIList.shop_product_id,
                        INIList.price_per_unit,
                        INIList.total_price,
                        INIList.total_list_discount_price,
                        INIList.proportion_list_discount_price,
                        (INIList.total_list_discount_price + INIList.proportion_list_discount_price)::numeric(20,2) AS total_discount_price,
                        (INIList.total_price - (INIList.total_list_discount_price + INIList.proportion_list_discount_price))::numeric(20,2) AS grand_total_price
                    FROM CTE_INI_List_BASE AS INIList
                ),
                CTE_INI_Doc_BASE AS (
                    SELECT
                       INIDoc.id,
                       INIDoc.code_id,
                       INIDoc.shop_id,
                       INIDoc.bus_partner_id,
                       INIDoc.doc_date,
                       INIDoc.status,
                       (nullif(INIDoc.details->>'tax_type', 'undefined'))::uuid AS tax_type_id,
                       (
                           SELECT CASE WHEN INIDoc.bus_partner_id IS NULL
                                  THEN NULL
                                  ELSE jsonb_build_object(
                                            'id', BPartner.id,
                                            'partner_name', BPartner.partner_name->>'th',
                                            'contact_name', BPartner.other_details->>'contact_name'
                                       )
                                  END
                           FROM app_shops_datas.dat_01hq0013_business_partners AS BPartner
                           WHERE BPartner.id = INIDoc.bus_partner_id
                       ) AS "BusinessPartner",
                       (
                           SELECT CASE WHEN (nullif(INIDoc.details->>'tax_type', 'undefined'))::uuid IS NULL
                                  THEN NULL
                                  ELSE jsonb_build_object(
                                            'id', MTaxType.id,
                                            'name', MTaxType.type_name->>'th'
                                       )
                                  END
                           FROM master_lookup.mas_tax_types AS MTaxType
                           WHERE MTaxType.id = (nullif(nullif(INIDoc.details->>'tax_type', 'undefined'), 'null'))::uuid
                       ) AS "TaxType"
                   FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS INIDoc
                   WHERE INIDoc.status IN (${status})
                        ${!doc_inventory_id ? `` : `AND (INIDoc.id = '${doc_inventory_id}')`}
                        ${!bus_partner_id ? `` : `AND (INIDoc.bus_partner_id = '${bus_partner_id}')`}
                        ${!doc_date ? `` : `AND (${doc_date})`}
                )
            SELECT
                CTE_INI_List_REFACTOR.*,
                (
                    SELECT jsonb_build_object(
                                'id', A.id,
                                'code_id', A.code_id,
                                'bus_partner_id', A.bus_partner_id,
                                'doc_date', A.doc_date,
                                'status', A.status,
                                'tax_type_id', A.tax_type_id,
                                'BusinessPartner', A."BusinessPartner",
                                'TaxType', A."TaxType"
                           )
                    FROM CTE_INI_Doc_BASE AS A
                    WHERE A.id = CTE_INI_List_REFACTOR.doc_inventory_id
                ) AS "INI_Doc"
            FROM CTE_INI_List_REFACTOR
            WHERE
                ((
                    SELECT B.id
                    FROM  CTE_INI_Doc_BASE AS B
                    WHERE B.id = CTE_INI_List_REFACTOR.doc_inventory_id
                        ${!search ? `` : `
                        AND (
                            B.code_id iLIKE '%${search}%'
                            OR
                            coalesce(B."BusinessPartner"#>>'{partner_name}', '') iLIKE '%${search}%'
                            OR
                            coalesce(B."BusinessPartner"#>>'{contact_name}', '') iLIKE '%${search}%'
                        )
                        `}
                ) = CTE_INI_List_REFACTOR.doc_inventory_id)
            `
            .replace(/(01hq0013)/g, table_name)
            .replace(/(\s+)/g, ' ')

        const queryResult__Data = await db.query(
            `
                ${queryString}
                ORDER BY
                    ${(() => {
                    if (sort === 'code_id') {
                        return `
                                    (SELECT X.code_id FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS X WHERE X.id = CTE_INI_List_REFACTOR.doc_inventory_id) ${order},
                                    (SELECT X.doc_date FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS X WHERE X.id = CTE_INI_List_REFACTOR.doc_inventory_id) ASC,
                                `;
                    }
                    if (sort === 'doc_date') {
                        return `
                                    (SELECT X.doc_date FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS X WHERE X.id = CTE_INI_List_REFACTOR.doc_inventory_id) ${order},
                                    (SELECT X.code_id FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS X WHERE X.id = CTE_INI_List_REFACTOR.doc_inventory_id) ASC,
                                `;
                    }
                })()}
                    (SELECT X.created_date FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS X WHERE X.id = CTE_INI_List_REFACTOR.doc_inventory_id) ASC,
                    CTE_INI_List_REFACTOR.id ASC
                LIMIT ${limit}
                OFFSET ${(page - 1) * limit}
            `
                .replace(/(01hq0013)/g, table_name)
                .replace(/(\s+)/g, ' '),
            {
                type: QueryTypes.SELECT,
                transaction: request?.transaction || options?.transaction || null,
                nest: true,
                raw: true
            }
        );

        const queryResult__Count = await db.query(
            `SELECT COUNT(xCount.*) FROM (${queryString}) AS xCount`
                .replace(/(\s+)/g, ' '),
            {
                type: QueryTypes.SELECT,
                transaction: request?.transaction || options?.transaction || null
            }
        )


        const pag = {
            currentPage: page,
            pages: Math.ceil(queryResult__Count[0].count / limit),
            currentCount: queryResult__Data.length,
            totalCount: +(queryResult__Count[0].count),
            data: queryResult__Data
        };

        return utilSetFastifyResponseJson('success', pag);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = {
    handleShopInventoryTransactionAdd,
    handleShopInventoryTransactionAddByFile,
    handleShopInventoryTransactionAll,
    handleShopInventoryTransactionById,
    handleShopInventoryTransactionPut,
    handleShopInventoryTransactionImportHistory
}