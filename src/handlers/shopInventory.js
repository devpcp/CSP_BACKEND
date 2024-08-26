const XLSX = require('xlsx');
const fs = require('fs');
const _ = require("lodash");
const { Op, Transaction } = require("sequelize");
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilCheckShopTableName = require('../utils/util.CheckShopTableName')
const { handleShopStockAdd } = require('./shopStock');

const sequelize = require('../db');
const ShopsProfiles = require('../models/model').ShopsProfiles;
const Product = require('../models/model').Product;
const ProductType = require('../models/model').ProductType;
const ProductPurchaseUnitTypes = require('../models/model').ProductPurchaseUnitTypes;
const ProductBrand = require('../models/model').ProductBrand;
const ProductCompleteSize = require('../models/model').ProductCompleteSize;
const ProductModelType = require('../models/model').ProductModelType;
const ShopProduct = require('../models/model').ShopProduct;
const ShopStock = require('../models/model').ShopStock;
const ShopInventory = require('../models/model').ShopInventory;
const ShopWarehouse = require('../models/model').ShopWarehouse;
const ShopInventoryTransaction = require('../models/model').ShopInventoryTransaction;
const { v4: uuid4 } = require("uuid");
const QRCode = require('qrcode');
const PDFDocument = require("pdfkit-table");
const { isUUID } = require("../utils/generate");

const handleShopInventoryAll = async (request, res) => {


    // request.id = '232bbbd7-5a70-46da-8af3-a71a7503b564'

    const shop_table = await utilCheckShopTableName(request, 'select_shop_ids');
    const table_name = shop_table[0].shop_code_id;


    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    var product_id = (request.query.product_id) ? { product_id: request.query.product_id } : {};

    var where_q = {
        [Op.or]: [
            sequelize.Sequelize.literal("\"ShopsProfile\".\"shop_name\"->>'th' LIKE '%" + search + "%'"),
            sequelize.Sequelize.literal("\"ShopsProfile\".\"shop_name\"->>'en' LIKE '%" + search + "%'"),
            sequelize.Sequelize.literal("\"ShopsProfile\".\"shop_code_id\" LIKE '%" + search + "%'"),
            sequelize.Sequelize.literal("\"ShopsProfile\".\"tax_code_id\" LIKE '%" + search + "%'"),

            sequelize.Sequelize.literal("\"product_name\"->>'th' LIKE '%" + search + "%'"),
            sequelize.Sequelize.literal("\"product_name\"->>'en' LIKE '%" + search + "%'"),
            sequelize.Sequelize.literal("\"master_path_code_id\" LIKE '%" + search + "%'")

        ]
    }


    var shop_inventory = await ShopInventory(table_name).findAll({
        order: [[sort, order]],
        include: [
            {
                model: ShopsProfiles, attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name']
            },
            {
                model: ShopProduct(table_name),
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'master_path_code_id', 'product_name', 'product_type_id', 'product_brand_id', 'product_model_id'],
                        include: [
                            {
                                model: ProductType,
                                attributes: ['id', 'code_id', 'type_name', 'type_group_id'],
                                include: [{
                                    model: ProductPurchaseUnitTypes, attributes: ['id', 'code_id', 'type_name'],
                                    separate: true,
                                }]
                            },
                            { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
                            { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
                            { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }
                        ],
                    }
                ]
            },
            {
                model: ShopInventoryTransaction(table_name)
            }
        ],
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopInventory\".\"created_by\" )"), 'created_by'],
            ]
        },
        required: false,
        where: where_q,
        limit: limit,
        offset: (page - 1) * limit
    })

    var length_data = await ShopInventory(table_name).count({
        include: [
            { model: ShopsProfiles, attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name'] },
            {
                model: ShopProduct(table_name),
                include: [
                    { model: Product, attributes: ['id', 'master_path_code_id', 'product_name', 'product_type_id', 'product_brand_id', 'product_model_id'] }
                ]
            }
        ],
        where: where_q
    })

    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: shop_inventory.length,
        totalCount: length_data,
        data: shop_inventory

    }


    await handleSaveLog(request, [['get ShopInventoryLog all'], ''])
    return ({ status: 'success', data: pag })

}


const handleShopInventoryAddByJson = async (request, reply, options) => {

    // request.id = '90f5a0a9-a111-49ee-94df-c5623811b6cc'
    const transactionResult = await sequelize.transaction(
        {
            transaction: request.transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            if (!request.transaction) {
                request.transaction = transaction;
            }
            return await handleShopInventoryAdd(request, reply, options);
        }
    );

    return transactionResult;
}


const handleShopInventoryAddByFile = async (request, res) => {

    // request.id = '90f5a0a9-a111-49ee-94df-c5623811b6cc'
    var shop_table = await utilCheckShopTableName(request)
    var table_name = shop_table.shop_code_id

    // return table_name
    const fileUploadParser = await request.body.fileUpload;

    if (!_.isPlainObject(fileUploadParser)) {
        throw Error('Request not fulfilled');
    }
    else if (!_.isEqual(_.keys(fileUploadParser), ["fieldname", "filename", "encoding", "mimetype", "file", "fields", "_buf", "toBuffer"])) { // Check instance of upload file
        throw Error('Request not fulfilled');
    }
    else {

        await fs.writeFileSync('src/assets/' + fileUploadParser.filename, await fileUploadParser.toBuffer());

        const wb = XLSX.readFile('src/assets/' + fileUploadParser.filename);
        await fs.unlinkSync('src/assets/' + fileUploadParser.filename)


        const data_json = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 0 })

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]


        if (!(header[0] == 'master_path_code_id' && header[1] == 'product_name' && header[2] == 'warehouse_code_id' &&
            header[3] == 'warehouse_name' && header[4] == 'shelf_item' && header[5] == 'amount' && header[6] == 'import_date' &&
            header[7] == 'status' && header[8] == 'doc_inventory_id')) {
            return ({ status: 'failed', data: 'header incorrect' })
        }

        var data = []
        var error_product = []

        for (let index = 0; index < data_json.length; index++) {


            var check_product = []
            var check_warehouse = []
            if (!(data_json[index].master_path_code_id == null || data_json[index].master_path_code_id == '')) {
                check_product = await Product.findAll({
                    where: {
                        [Op.or]: [
                            { master_path_code_id: data_json[index].master_path_code_id.toString() },
                        ]
                    }
                })
            } else if (data_json[index].master_path_code_id == null || check_product.length == 0) {
                check_product = await Product.findAll({
                    where: {
                        product_name: {
                            [Op.or]: [
                                { th: { [Op.like]: '%' + data_json[index].product_name + '%' } },
                                // { en: { [Op.like]: '%' + data_json[index].product_name + '%' } },
                                { name_from_dealer: { [Op.like]: '%' + data_json[index].product_name + '%' } },
                            ]
                        }
                    }
                })

            }

            if (check_product.length == 0) {
                var product_all = await Product.findAll({})
                await new Promise(async (resolve, reject) => {
                    await product_all.forEach(async (element1, index1, array1) => {
                        if (similar(data_json[index].product_name, element1.product_name.th) > 74) {
                            check_product.push(element1)
                        }
                        if (index1 === array1.length - 1) resolve();
                    })
                })
            }
            if (check_product.length == 0) {
                var product_all = await Product.findAll({})
                await new Promise(async (resolve, reject) => {
                    await product_all.forEach(async (element1, index1, array1) => {
                        if (similar(data_json[index].สินค้า, element1.product_name.name_from_dealer) > 74) {
                            check_product.push(element1)
                        }
                        if (index1 === array1.length - 1) resolve();
                    })
                })
            }



            if (!(data_json[index].warehouse_code_id == null || data_json[index].warehouse_code_id == '')) {
                check_warehouse = await ShopWarehouse(table_name).findAll({
                    where: {
                        [Op.or]: [
                            { code_id: data_json[index].warehouse_code_id.toString() },
                        ]
                    }
                })
            } else if (data_json[index].warehouse_code_id == null || check_product.length == 0) {
                check_warehouse = await Product.findAll({
                    where: {
                        name: {
                            [Op.or]: [
                                { th: { [Op.like]: '%' + data_json[index].warehouse_name + '%' } },
                                // { en: { [Op.like]: '%' + data_json[index].product_name + '%' } },
                                // { name_from_dealer: { [Op.like]: '%' + data_json[index].product_name + '%' } },
                            ]
                        }
                    }
                })

            }

            if (check_warehouse.length == 0) {
                var warehouse_all = await ShopWarehouse(table_name).findAll({})
                await new Promise(async (resolve, reject) => {
                    await warehouse_all.forEach(async (element1, index1, array1) => {
                        if (similar(data_json[index].warehouse_name, element1.name.th) > 74) {
                            check_warehouse.push(element1)
                        }
                        if (index1 === array1.length - 1) resolve();
                    })
                })
            }

            if (check_product.length == 0 || check_warehouse.length == 0) {
                error_product.push(index)

                // return reject('index ' + index + ' is not found customer')
            } else {

                var index_data = data.findIndex((element) => element.product_id == check_product[0].id)
                if (index_data != -1) {
                    data[index_data].warehouse_detail.shelf.push({
                        item: data_json[index].shelf_item,
                        amount: data_json[index].amount
                    })

                } else {
                    data.push({
                        product_id: check_product[0].id,
                        warehouse_detail: {
                            warehouse: check_warehouse[0].id,
                            shelf: [{
                                item: data_json[index].shelf_item,
                                amount: data_json[index].amount
                            }]
                        },
                        import_date: data_json[index].import_date,
                        status: data_json[index].status,
                        doc_inventory_id: data_json[index].doc_inventory_id
                    })
                }

            }

        }

        request.body = data

        return handleShopInventoryAdd(request)
    }


}

const handleShopInventoryAdd = async (request, reply, options = {}) => {
    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    options.currentDateTime = currentDateTime;

    const transactionResult = await sequelize.transaction(
        {
            transaction: request.transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            if (!request.transaction) {
                request.transaction = transaction;
            }

            const shop_table = await utilCheckShopTableName(request);
            const table_name = shop_table.shop_code_id;

            const import_date = request.body.import_date;
            const product_list = request.body.product_list;
            const doc_inventory_id = request.body.doc_inventory_id;
            const status = request.body.status;
            const use_stock = request.body.use_stock

            let error_msg = '';

            for (let index = 0; index < product_list.length; index++) {

                const { product_id, warehouse_detail } = product_list[index];

                const amount = warehouse_detail.map(el => { return el.shelf.amount })
                    .reduce((a, b, index) => {
                        if (status === 4) {
                            if (index % 2 === 0) {
                                return parseInt(a) + parseInt(b);
                            }
                            return parseInt(a);
                        }
                        else {
                            return parseInt(a) + parseInt(b);
                        }
                    }, 0);
                const amount_all = parseInt(product_list[index].amount_all);

                if (status !== 4 && amount_all != amount) {
                    error_msg = error_msg + ' index ' + index + ' amonut_all not equal sum all '
                } else {
                    const createShopInventoryLogs = await ShopInventory(table_name).create(
                        {
                            shop_id: shop_table.id,
                            product_id: product_list[index].product_id,
                            warehouse_detail: product_list[index].warehouse_detail,
                            amount: amount,
                            import_date: import_date,
                            doc_inventory_id: doc_inventory_id,
                            details: product_list[index].details,
                            status: status,
                            created_by: request.id,
                            created_date: currentDateTime
                        },
                        {
                            transaction: transaction
                        }
                    )
                    options.movementLog_doc_inventory_log_id = createShopInventoryLogs.get('id');
                    if (use_stock == true) {
                        await handleShopStockAdd(request, reply, options, product_list[index])
                    }
                }

            }

            await handleSaveLog(request, [['add ShopInventory', '', request.body], '']);

            return utilSetFastifyResponseJson((error_msg != '') ? "failed" : "success", (error_msg != '') ? error_msg : "successful");
        }
    );

    return transactionResult;
}




const handleShopInventoryById = async (request, res) => {

    // request.id = '232bbbd7-5a70-46da-8af3-a71a7503b564'

    const shop_table = await utilCheckShopTableName(request, 'select_shop_ids');
    const table_name = shop_table[0].shop_code_id;

    var ShopInventory_id = request.params.id


    var shop_inventory = await ShopInventory(table_name).findAll({
        where: {
            id: ShopInventory_id
        },
        include: [
            { model: ShopsProfiles, attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name'] },
            {
                model: ShopProduct(table_name),
                include: [
                    {
                        model: Product, attributes: ['id', 'master_path_code_id', 'product_name', 'product_type_id', 'product_brand_id', 'product_model_id'],
                        include: [
                            {
                                model: ProductType, attributes: ['id', 'code_id', 'type_name', 'type_group_id'],
                                include: {
                                    model: ProductPurchaseUnitTypes, attributes: ['id', 'code_id', 'type_name'],
                                    separate: true,
                                }
                            },
                            { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
                            { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
                            { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }],
                    }
                ]
            },
            { model: ShopInventoryTransaction(table_name) }
        ],
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopInventory\".\"created_by\" )"), 'created_by'],
            ]
        },
        required: false
    })


    await handleSaveLog(request, [['get ShopInventoryLog byid'], ''])
    return utilSetFastifyResponseJson("success", shop_inventory)
}


const handleShopInventoryByDocId = async (request, res) => {

    const Bold = "src/assets/fonts/THSarabunNew/THSarabunNewBold.ttf";
    const Regular = "src/assets/fonts/THSarabunNew/THSarabunNew.ttf";

    const shop_table = await utilCheckShopTableName(request, 'select_shop_ids');
    const table_name = shop_table[0].shop_code_id;

    var ShopInventory_id = request.params.id

    let gen_qr_code = request.query.gen_qr_code

    let inventory_list = request.query.inventory_list

    const status = ['0', '1'].includes(request.query.status) ? { status: Number(request.query.status) } : { status: { [Op.ne]: 0 } };

    let modelShopStock = ShopStock(table_name)
    let modelShopInventory = ShopInventory(table_name)
    let modelShopProduct = ShopProduct(table_name)

    await modelShopProduct.hasOne(modelShopStock, { foreignKey: 'product_id' })


    var shop_inventory = await modelShopInventory.findAll({
        where: {
            [Op.and]: [
                { doc_inventory_id: ShopInventory_id }, { ...status }
            ]
        },
        include: [
            { model: ShopsProfiles, attributes: ['id', 'shop_code_id', 'tax_code_id', 'bus_type_id', 'shop_name'] },
            {
                model: modelShopProduct,
                include: [
                    {
                        model: Product, attributes: ['id', 'master_path_code_id', 'product_name', 'product_type_id', 'product_brand_id', 'product_model_id'],
                        include: [
                            {
                                model: ProductType, attributes: ['id', 'code_id', 'type_name', 'type_group_id'],
                                include: {
                                    model: ProductPurchaseUnitTypes, attributes: ['id', 'code_id', 'type_name'],
                                    separate: true,
                                }
                            },
                            { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
                            { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
                            { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }],
                    },
                    { model: modelShopStock },
                ]
            }
        ],
        attributes: {
            include: [
                [sequelize.Sequelize.literal("amount"), 'amount_all'],
                [sequelize.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopInventory\".\"created_by\" )"), 'created_by'],
            ]
        },
        required: false
    })


    if (gen_qr_code === true) {

        if (shop_inventory.length == 0) {

            let msg = 'inventory not found'
            await handleSaveLog(request, [['get ShopInventoryLog byid'], msg])
            throw Error(msg);

        }

        let warehouse_all = await ShopWarehouse(table_name).findAll()

        var doc = new PDFDocument({
            margins: { top: 0, left: 0, right: 0, bottom: 0 },
            size: 'A4',
            bufferPages: true
        });


        for (let index = 0; index < shop_inventory.length; index++) {
            const element = shop_inventory[index];

            if (!inventory_list.includes(element.id) && inventory_list.length != 0) {
                continue;
            }

            for (let index1 = 0; index1 < element.warehouse_detail.length; index1++) {
                const element1 = element.warehouse_detail[index1];

                let json = {
                    inventory_id: element.id,
                    warehouse_detail_index: index1,
                    // shelf: element1.shelf.item,
                    // dot_mfd: element1.shelf.dot_mfd,
                    // index: index1
                }

                await QRCode.toFile(`src/assets/printouts/${element.id}-${index1}.png`, JSON.stringify(json), {
                    errorCorrectionLevel: 'H'
                });

            }

        }


        let inches = 71.72
        let row = 0
        let column = 0
        for (let index = 0; index < shop_inventory.length; index++) {

            const element = shop_inventory[index];

            if (!inventory_list.includes(element.id) && inventory_list.length != 0) {
                continue;
            }

            for (let index1 = 0; index1 < element.warehouse_detail.length; index1++) {
                const element1 = element.warehouse_detail[index1];

                let filter_warehouse = warehouse_all.filter(re => {
                    return re.id == element1.warehouse
                })

                let filter_shelf = null

                if (filter_warehouse.length > 0) {
                    filter_shelf = filter_warehouse[0].shelf.filter(re => {
                        return re.code == element1.shelf.item
                    })
                }

                let logo = `src/assets/printouts/${element.id}-${index1}.png`


                for (let index2 = 0; index2 < element1.shelf.amount; index2++) {

                    let row_now = 2.08 * inches
                    let col_now = 2.34 * inches


                    doc.image(logo, row * row_now + 14, column * col_now + 5, { height: 1.7 * inches, align: 'center', width: 1.7 * inches });
                    doc.font(Regular).fillColor('black').fontSize(8).text(index2 + 1, row * row_now + 5, column * col_now + 2);
                    doc.moveTo(row * row_now, column * col_now).lineTo(row * row_now + row_now, column * col_now).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
                    doc.moveTo(row * row_now + row_now, column * col_now).lineTo(row * row_now + row_now, column * col_now + col_now).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
                    doc.moveTo(row * row_now + row_now, column * col_now + col_now).lineTo(row * row_now, column * col_now + col_now).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

                    doc.font(Bold).fillColor('black').fontSize(12).text(element.ShopProduct.Product.master_path_code_id, row * row_now, column * col_now + col_now - 48, { align: 'center', width: row_now });
                    doc.font(Regular).fontSize(8).text(element.ShopProduct.Product.product_name.th, row * row_now, column * col_now + col_now - 36, { align: 'center', width: row_now });

                    if (element1.shelf.dot_mfd) {
                        doc.font(Regular).fontSize(12).text(filter_warehouse[0]?.name?.th, row * row_now + 10, column * col_now + col_now - 20, { align: 'left', width: row_now - 20 });
                        doc.font(Regular).fontSize(12).text(filter_shelf[0]?.name?.th, row * row_now, column * col_now + col_now - 20, { align: 'center', width: row_now });
                        doc.font(Regular).fontSize(12).text(element1.shelf.dot_mfd, row * row_now + 10, column * col_now + col_now - 20, { align: 'right', width: row_now - 20 });
                    } else {
                        doc.font(Regular).fontSize(12).text(filter_warehouse[0]?.name?.th, row * row_now, column * col_now + col_now - 20, { align: 'center', width: row_now / 2 });
                        doc.font(Regular).fontSize(12).text(filter_shelf[0]?.name?.th, row * row_now + (row_now / 2), column * col_now + col_now - 20, { align: 'center', width: row_now / 2 });
                    }

                    if (row == 3) {
                        row = 0
                        if (column == 4) {
                            doc.addPage()
                            column = 0
                        } else {
                            column = column + 1
                        }
                    } else {
                        row = row + 1
                    }
                }

                fs.unlinkSync(logo)


            }


        }


        let uuid = uuid4()

        await doc.pipe(fs.createWriteStream('src/assets/printouts/' + uuid + '.pdf'));
        doc.end();

        return ({ status: "success", data: 'src/assets/printouts/' + uuid + '.pdf' })
    }


    for (let index = 0; index < shop_inventory.length; index++) {
        let current_amount = null
        const element = shop_inventory[index];
        if (element.warehouse_detail.length > 0) {
            for (let index1 = 0; index1 < element.warehouse_detail.length; index1++) {
                const element1 = element.warehouse_detail[index1];

                if (element.ShopProduct.ShopStock) {
                    for (let index2 = 0; index2 < element.ShopProduct.ShopStock.warehouse_detail.length; index2++) {
                        const element2 = element.ShopProduct.ShopStock.warehouse_detail[index2];

                        if (element1.warehouse == element2.warehouse) {

                            current_amount = element2.shelf.filter(el => { return el.item == element1.shelf.item && el.purchase_unit_id == element1.shelf.purchase_unit_id && el.dot_mfd == element1.shelf.dot_mfd })

                            if (current_amount.length > 0) {
                                current_amount = current_amount[0].balance
                            }
                        }

                    }
                    shop_inventory[index].warehouse_detail[index1].shelf.current_amount = current_amount
                }

            }
        }

    }

    shop_inventory = { product_list: shop_inventory }

    await handleSaveLog(request, [['get ShopInventoryLog byid'], ''])
    return utilSetFastifyResponseJson("success", shop_inventory)
}

const handleShopInventoryDocPut = async (request, reply, options = {}) => {
    const action = 'get ShopInventoryLog byid';

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                const ShopInventory_id = request.params.id;

                const shop_table = await utilCheckShopTableName(request);
                const table_name = shop_table.shop_code_id;

                const status = request.body.status;
                const use_stock = request.body.use_stock

                // Start - ลบ Stock ของ ShopInventory_id ที่เคยมีอยู่ออก
                const shop_inventory = await ShopInventory(table_name).findAll({
                    where: {
                        doc_inventory_id: ShopInventory_id,
                        status: {
                            [Op.ne]: 0
                        }
                    },
                    transaction: transaction
                });
                for (let index = 0; index < shop_inventory.length; index++) {
                    request.body.status = 0;
                    if (shop_inventory[index].status == 3) {
                        request.body.status = 2;
                    }
                    options.movementLog_doc_inventory_log_id = shop_inventory[index].get('id');
                    if (use_stock == true) {
                        await handleShopStockAdd(request, reply, options, shop_inventory[index])
                    }
                }
                await ShopInventory(table_name).update(
                    {
                        status: 0
                    },
                    {
                        where: {
                            doc_inventory_id: ShopInventory_id,
                            status: {
                                [Op.ne]: 0
                            }
                        },
                        transaction: transaction
                    }
                );
                // End - ลบ Stock ของ ShopInventory_id ที่เคยมีอยู่ออก

                // Start - เพิ่ม Stock ของ ShopInventory_id ของใหม่
                if (!request.body.import_date) {
                    request.body.import_date = shop_inventory[0].import_date;
                }
                request.body.status = status;
                request.body.doc_inventory_id = ShopInventory_id;
                request.body.use_stock = use_stock;
                await handleShopInventoryAdd(request, reply, options);
                // End - เพิ่ม Stock ของ ShopInventory_id ของใหม่
            }
        );

        await handleSaveLog(request, [[action], '']);

        return utilSetFastifyResponseJson("success", "successful");

    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        throw error;
    }
}



module.exports = {
    handleShopInventoryAll,
    handleShopInventoryAddByJson,
    handleShopInventoryAddByFile,
    handleShopInventoryById,
    handleShopInventoryByDocId,
    handleShopInventoryDocPut
}