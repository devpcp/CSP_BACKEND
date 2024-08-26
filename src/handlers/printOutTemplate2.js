const _ = require('lodash');
const PDFDocument = require("pdfkit-table");
const fs = require('fs');
const moment = require('moment');
const { Op, Transaction } = require("sequelize");
const { v4: uuid4 } = require("uuid");
const { handleSaveLog } = require('./log');
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const ArabicNumberToText = require("../utils/thaibath");

const sequelize = require('../db');
const { ShopServiceOrderDoc, ShopServiceOrderList, ShopTaxInvoiceDoc, ShopTaxInvoiceList, ShopTemporaryDeliveryOrderDoc, ShopTemporaryDeliveryOrderList } = require('../models/model');
const DocumentTypes = require('../models/model').DocumentTypes;
const Province = require("../models/model").Province;
const District = require("../models/model").District;
const SubDistrict = require("../models/model").SubDistrict;
const TaxTypes = require("../models/model").TaxTypes;
const VehicleBrand = require("../models/model").VehicleBrand;
const VehicleModelType = require("../models/model").VehicleModelType;
const UsersProfiles = require("../models/model").UsersProfiles;
const ShopsProfiles = require("../models/model").ShopsProfiles;
const Product = require("../models/model").Product;
const ProductPurchaseUnitTypes = require("../models/model").ProductPurchaseUnitTypes;
const ShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;
const ShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const ShopProduct = require("../models/model").ShopProduct;
const ShopInventoryTransaction = require("../models/model").ShopInventoryTransaction;
const ShopInventory = require("../models/model").ShopInventory;
const ShopBusinessPartners = require("../models/model").ShopBusinessPartners;
const ShopWarehouses = require("../models/model").ShopWarehouse;
const ShopPersonalCustomers = require("../models/model").ShopPersonalCustomers;
const ShopBusinessCustomers = require("../models/model").ShopBusinessCustomers;
const ShopVehicleCustomer = require("../models/model").ShopVehicleCustomer;
const ShopQuotationDoc = require("../models/model").ShopQuotationDoc;
const ShopQuotationList = require("../models/model").ShopQuotationList;
const ShopDocumentCode = require("../models/model").ShopDocumentCode;
const ShopProfilePdfConfig = require("../utils/ShopProfilePdfConfig.json")

let margin_left = 8;
const Bold = "src/assets/fonts/THSarabunNew/THSarabunNewBold.ttf";
const Regular = "src/assets/fonts/THSarabunNew/THSarabunNew.ttf";



const printOutTemplate2 = async (request, tran_doc) => {

    let px = 28.346
    let margin_left = 1.7 * px

    let doc = new PDFDocument({
        margins: { top: 4.7 * px, left: margin_left, right: 0, bottom: 0 },
        size: [22.8 * px, 14 * px],
        bufferPages: true
    });


    let option = {
        divider: {
            horizontal: { disabled: true }
        },
        hideHeader: true
    }

    let table_name = tran_doc.table_name
    let price_grand_total = (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    let note = tran_doc.details.remark
    let customer = tran_doc.ShopBusinessCustomer || tran_doc.ShopPersonalCustomer
    let line1 = ``
    if (customer.customer_name.first_name) {
        line1 = line1 + `${customer.customer_name.first_name.th} ${customer.customer_name.last_name.th}`
    } else {
        line1 = line1 + `${customer.customer_name.th}`
    }
    line1 = line1 + ` (` + customer.master_customer_code_id + `)`

    let product_all = await ShopTaxInvoiceList(table_name).findAll({
        where: { shop_tax_invoice_doc_id: request.params.id, status: 1 },
        include: [{
            model: ShopProduct(table_name), as: 'ShopProduct', include: [
                { model: Product }
            ]
        }],
        order: [['seq_number', 'ASC']]
    })

    let data = []

    for (let index = 0; index < product_all.length; index++) {
        const element = product_all[index];
        if (+(element.amount) <= 0 || !element.purchase_unit_id) { continue; }


        var all_price = (element.price_grand_total != null) ? element.price_grand_total : null

        let discount = (element.price_discount != null) ? element.price_discount : 0

        let product = element.ShopProduct.Product

        data.push({

            '#': index + 1,
            'รหัสสินค้า': product.master_path_code_id || '-',
            'ชื่อสินค้า': (element.details.change_name_status == true) ? element.details.changed_name : product.product_name.th,
            'จำนวน': parseInt(element.amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ราคา/หน่วย': parseFloat(element.price_unit || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ส่วนลด': (parseFloat(discount || 0) * parseInt(element.amount || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ราคารวม': parseFloat(all_price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'all_price': all_price
        })

    }

    ws = {}

    ws.headers = [
        { "label": 'รหัสสินค้า', "property": 'รหัสสินค้า', "width": 2.5 * px, "padding": 5, "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 7.3 * px, "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'จำนวน', "property": 'จำนวน', "width": 1.3 * px, align: "center", "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 2.3 * px, align: "right", "padding": 10, "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 1.8 * px, align: "right", "padding": 10, "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'ราคารวม', "property": 'ราคารวม', "width": 3.1 * px, "headerOpacity": 1, "headerAlign": "center", align: "right", "headerColor": "#ffffff", "padding": 5 }
    ]

    ws.datas = data


    await doc.table(ws, {
        columnsSize: 1,
        columnSpacing: 1,
        columnsSize: 1,
        divider: {
            horizontal: { disabled: true },
        },
        prepareHeader: () => doc.font(Bold).fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font(Regular).fontSize(10).fillColor("black");

        },
    });







    //Global Edits to All Pages (Header/Footer, etc)
    var pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);




        if (i == pages.count - 1) {
            doc.options.margins.top = 6 * px
            let height = 9.5 * px

            doc.moveTo(margin_left, height).lineTo(20 * px, height).lineWidth(1).fillAndStroke('#000000').stroke();

            doc.moveTo(margin_left, height + 0.5 * px).lineTo(14 * px, height + 0.5 * px).lineWidth(1).fillAndStroke('#000000').stroke();

            doc.moveTo(margin_left, height + 2 * px).lineTo(20 * px, height + 2 * px).lineWidth(1).fillAndStroke('#000000').stroke();

            doc.moveTo(14 * px, height).lineTo(14 * px, height + 2 * px).lineWidth(1).fillAndStroke('#000000').stroke();

            doc.font(Bold).text(ArabicNumberToText(price_grand_total), 7 * px, height + 0.05 * px, { lineBreak: false })

            doc.font(Bold).text('หมายเหตุ :', margin_left, height + 0.6 * px, { lineBreak: false })
            doc.font(Regular).text(note || '', 3 * px, height + 0.6 * px, { lineBreak: false })


            doc.font(Bold).text('รวมเงินทั้งสิน', 15 * px, height + 0.6 * px, { lineBreak: false })
            doc.font(Regular).text(price_grand_total, 16 * px, height + 0.6 * px, { lineBreak: false, width: 3.5 * px, align: 'right' })
        } else {
            doc.options.margins.top = 2 * px
        }

        doc.lineWidth(1);
        doc.lineJoin('round')
        doc.roundedRect(13 * px, 1.2 * px, 6.5 * px, 0.9 * px, 5).fillAndStroke('#ffffff', '#000');
        doc.fill('#000000').stroke();
        doc.fontSize(14).font(Bold);
        doc.text("ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ", 13.5 * px, 1.35 * px, { lineBreak: false });

        let shop_name = tran_doc.shop_profile.shop_name.th
        let tel = tran_doc.shop_profile.tel_no.tel_no_1 || tran_doc.shop_profile.mobile_no.mobile_no_1 || '-'

        doc.text(shop_name, margin_left, 0.8 * px, { lineBreak: false }).fontSize(11);
        doc.font(Regular).text('เลขที่ ' + tran_doc.shop_profile.address.th, margin_left, 1.5 * px, { lineBreak: false }).fontSize(10);
        doc.font(Regular).text('TEL ' + tel, margin_left, 1.9 * px, { lineBreak: false }).fontSize(10);
        doc.font(Regular).text('เลขประจำตัวผู้เสียภาษี ' + tran_doc.shop_profile.tax_code_id, margin_left, 2.3 * px, { lineBreak: false }).fontSize(10);

        doc.font(Bold).text('ชื่อ/ที่อยู่ของลูกค้า', margin_left, 3 * px, { lineBreak: false })
        doc.font(Regular).text(line1, margin_left + 2 * px, 3 * px, { lineBreak: false })


        doc.font(Bold).text('วันที่', 13 * px, 2.5 * px, { lineBreak: false })
        doc.font(Regular).text(tran_doc.doc_date, 14 * px, 2.5 * px, { lineBreak: false })

        doc.font(Bold).text('เลขที่', 16 * px, 2.5 * px, { lineBreak: false })
        doc.font(Regular).text(tran_doc.code_id, 18 * px, 2.5 * px, { lineBreak: false })


        let code_id_job = tran_doc.ShopServiceOrderDoc?.code_id || ''
        doc.font(Bold).text('เลขที่ Job', 16 * px, 3.2 * px, { lineBreak: false })
        doc.font(Regular).text(code_id_job, 18 * px, 3.2 * px, { lineBreak: false })

        let admin = null
        if (request.id) {
            admin = await UsersProfiles.findOne({ where: { user_id: request.id } })
        }

        if (admin) {
            admin = admin.fname.th + ' ' + admin.lname.th

        } else {
            admin = ''
        }

        doc.font(Bold).text('ผู้รับงาน', 13 * px, 3.9 * px, { lineBreak: false })
        doc.font(Regular).text(admin, 14 * px, 3.9 * px, { lineBreak: false })


        doc.moveTo(margin_left, 4.6 * px).lineTo(20 * px, 4.6 * px).lineWidth(1).fillAndStroke('#000000').stroke();
        doc.moveTo(margin_left, 5.19 * px).lineTo(20 * px, 5.19 * px).lineWidth(1).fillAndStroke('#000000').stroke();


        doc.moveTo(2.5 * px, 12.5 * px).lineTo(4.5 * px, 12.5 * px).dash(1, { space: 1 }).stroke();

        doc.moveTo(9.75 * px, 12.5 * px).lineTo(11.75 * px, 12.5 * px).dash(1, { space: 1 }).stroke();

        doc.moveTo(17 * px, 12.5 * px).lineTo(19 * px, 12.5 * px).dash(1, { space: 1 }).stroke();

        doc.font(Bold).text('ผู้รับสินค้า', 2.5 * px, 12.7 * px, { width: 2 * px, align: 'center' })
        doc.font(Bold).text('ผู้รับเงิน', 9.75 * px, 12.7 * px, { lineBreak: false, width: 2 * px, align: 'center' })
        doc.font(Bold).text('พนักงานขาย', 17 * px, 12.7 * px, { lineBreak: false, width: 2 * px, align: 'center' })


    }

    var file_name = uuid4();

    // await doc.pipe(fs.createWriteStream('src/assets/printouts/' + 'file_name' + '.pdf'));
    await doc.pipe(fs.createWriteStream('src/assets/printouts/' + file_name + '.pdf'));


    doc.end();

    // return ({ status: "success", data: 'printouts/' + 'file_name' + '.pdf' })
    return ({ status: "success", data: 'printouts/' + file_name + '.pdf' })




}



module.exports = {
    printOutTemplate2,
}