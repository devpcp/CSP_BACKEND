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
const ShopProfilePdfConfig = require("../utils/ShopProfilePdfConfig.json");
const { printOutTemplate2 } = require('./printOutTemplate2');

const Bold = "src/assets/fonts/THSarabunNew/THSarabunNewBold.ttf";
const Regular = "src/assets/fonts/THSarabunNew/THSarabunNew.ttf";




const printOutPdfTaxInvoice = async (request, reply, app) => {

    var action = 'tax invoice pdf'

    try {

        let shop_table = await utilCheckShopTableName(request)
        let table_name = shop_table.shop_code_id

        let config_pdf = shop_table.shop_config?.config_pdf || {}
        let abb_inv = request.query.abb_inv

        // let font_primary_color = config_pdf.font_primary_color || '#169EDC'
        // let header_table_color = config_pdf.header_table_color || '#169EDC'
        var user_profile = null
        if (request.id) {
            user_profile = await UsersProfiles.findOne({ where: { user_id: request.id } })
        }
        var shop_profile = await ShopsProfiles.findOne(
            {
                where: { id: user_profile.shop_id },
                include: [
                    { model: Province },
                    { model: District }, { model: SubDistrict }]
            }
        )


        let tran_doc = await ShopTaxInvoiceDoc(table_name).findOne({
            where: { id: request.params.id },
            include: [
                {
                    model: ShopPersonalCustomers(table_name),
                    as: 'ShopPersonalCustomer',
                    include: [
                        { model: Province, as: "Province" },
                        { model: District, as: "District" },
                        { model: SubDistrict, as: "SubDistrict" }
                    ]
                },
                {
                    model: ShopBusinessCustomers(table_name),
                    as: 'ShopBusinessCustomer',
                    include: [
                        { model: Province, as: "Province" },
                        { model: District, as: "District" },
                        { model: SubDistrict, as: "SubDistrict" }
                    ]
                },
                {
                    model: ShopVehicleCustomer(table_name),
                    as: "ShopVehicleCustomer",
                    include: [{ model: VehicleBrand }, { model: VehicleModelType }]
                }
            ]
        })

        if (tran_doc) {
            tran_doc.config_pdf = config_pdf

            if (abb_inv == 0) {
                tran_doc.doc_type_name = 'ใบกำกับภาษีอย่างย่อ'
                return await abb_invoice(request, tran_doc)

            }
            else if (abb_inv == 1) {
                tran_doc.doc_type_name = 'ใบกำกับภาษีเต็มรูป'
                return await inv_invoice(request, tran_doc)
            }


        } else {
            // await handleSaveLog(request, [[action], 'doc not found'])
            return ({ status: 'failed', data: 'doc not found' })
        }


    } catch (error) {
        // await handleSaveLog(request, [[action], 'error'])
        throw new Error(error)
    }
}


const abb_invoice = async (request, tran_doc) => {

    let check_template = '2'

    if (check_template == 1) {
        return await abb_template_1(request, tran_doc)
    } else if (check_template == 2) {
        return await abb_template_2(request, tran_doc)

    } else {
        return await abb_template_3(request, tran_doc)

    }

}


const inv_invoice = async (reg, tran_doc) => {
    let check_template = '1'

    if (check_template == 1) {
        return await inv_template_1(request, tran_doc)
    } else if (check_template == 2) {
        return await inv_template_2(request, tran_doc)

    } else {
        return await inv_template_3(request, tran_doc)

    }

}




const abb_template_1 = async (request, tran_doc) => {

    return 'abb_template_1'
}

const abb_template_2 = async (request) => {



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

    let data_length = request.query.data_length || 3

    ws = {}

    ws.headers = [
        { "label": 'รหัสสินค้า', "property": 'รหัสสินค้า', "width": 2.5 * px, "padding": 5, "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 7.3 * px, "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'จำนวน', "property": 'จำนวน', "width": 1.3 * px, align: "center", "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 2.3 * px, align: "right", "padding": 10, "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 1.8 * px, align: "right", "padding": 10, "headerOpacity": 1, "headerColor": "#ffffff" },
        { "label": 'ราคารวม', "property": 'ราคารวม', "width": 3.1 * px, "headerOpacity": 1, "headerAlign": "center", align: "right", "headerColor": "#ffffff", "padding": 5 }
    ]

    ws.datas = [




    ]
    for (let index = 0; index < data_length; index++) {
        ws.datas.push({ "รหัสสินค้า": index, "ชื่อสินค้า": 'xxxxxxxxx xxxxxx xxxxxxxxxxxx', "จำนวน": 2, "ราคา/หน่วย": '1,000.00', "ส่วนลด": '0.00', "ราคารวม": '2,000.00' },)
    }




    // doc.font(Regular).text('', margin_left, 4.7 * px, { lineBreak: false })

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

            doc.font(Bold).text('หกพันบาทถ้วน', 7 * px, height + 0.55 * px, { lineBreak: false })

            doc.font(Bold).text('หมายเหตุ :', margin_left, height + 0.6 * px, { lineBreak: false })
            doc.font(Regular).text('xxxxxxxxxxxxxxxxxx', 3 * px, height + 0.6 * px, { lineBreak: false })


            doc.font(Bold).text('รวมเงินทั้งสิน', 15 * px, height + 0.6 * px, { lineBreak: false })
            doc.font(Regular).text('6,000.00', 16 * px, height + 0.6 * px, { lineBreak: false, width: 3.5 * px, align: 'right' })
        } else {
            doc.options.margins.top = 2 * px
        }

        doc.lineWidth(1);
        doc.lineJoin('round')
        doc.roundedRect(13 * px, 1.2 * px, 6.5 * px, 0.9 * px, 5).fillAndStroke('#ffffff', '#000');
        doc.fill('#000000').stroke();
        doc.fontSize(14).font(Bold);
        doc.text("ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ", 13.5 * px, 1.35 * px, { lineBreak: false });

        let shop_name = "บจก.รุ่งไทยการยางและศูนย์ล้อ"

        doc.text(shop_name, margin_left, 0.8 * px, { lineBreak: false }).fontSize(11);
        doc.font(Regular).text('เลขที่ xxxxxxxx ', margin_left, 1.5 * px, { lineBreak: false }).fontSize(10);
        doc.font(Regular).text('TEL xxxxxxxxxxxxx', margin_left, 1.9 * px, { lineBreak: false }).fontSize(10);
        doc.font(Regular).text('เลขประจำตัวผู้เสียภาษี xxxxxxxx', margin_left, 2.3 * px, { lineBreak: false }).fontSize(10);

        doc.font(Bold).text('ชื่อ/ที่อยู่ของลูกค้า', margin_left, 3 * px, { lineBreak: false })
        doc.font(Regular).text('xxxxxxxxx', margin_left + 2 * px, 3 * px, { lineBreak: false })


        doc.font(Bold).text('วันที่', 13 * px, 2.5 * px, { lineBreak: false })
        doc.font(Regular).text('22/12/2022', 14 * px, 2.5 * px, { lineBreak: false })

        doc.font(Bold).text('เลขที่', 16 * px, 2.5 * px, { lineBreak: false })
        doc.font(Regular).text('xxxxxxxx', 18 * px, 2.5 * px, { lineBreak: false })


        doc.font(Bold).text('เลขที่ Job', 16 * px, 3.2 * px, { lineBreak: false })
        doc.font(Regular).text('xxxxxxxx', 18 * px, 3.2 * px, { lineBreak: false })


        doc.font(Bold).text('ผู้รับงาน', 13 * px, 3.9 * px, { lineBreak: false })
        doc.font(Regular).text('xxxxxxxx', 14 * px, 3.9 * px, { lineBreak: false })


        doc.moveTo(margin_left, 4.6 * px).lineTo(20 * px, 4.6 * px).lineWidth(1).fillAndStroke('#000000').stroke();
        doc.moveTo(margin_left, 5.19 * px).lineTo(20 * px, 5.19 * px).lineWidth(1).fillAndStroke('#000000').stroke();


        doc.moveTo(2.5 * px, 12.5 * px).lineTo(4.5 * px, 12.5 * px).dash(1, { space: 1 }).stroke();

        doc.moveTo(9.75 * px, 12.5 * px).lineTo(11.75 * px, 12.5 * px).dash(1, { space: 1 }).stroke();

        doc.moveTo(17 * px, 12.5 * px).lineTo(19 * px, 12.5 * px).dash(1, { space: 1 }).stroke();

        doc.font(Bold).text('ผู้รับสินค้า', 2.5 * px, 12.7 * px, { width: 2 * px, align: 'center' })
        doc.font(Bold).text('ผู้รับเงิน', 9.75 * px, 12.7 * px, { lineBreak: false, width: 2 * px, align: 'center' })
        doc.font(Bold).text('พนักงานขาย', 17 * px, 12.7 * px, { lineBreak: false, width: 2 * px, align: 'center' })


    }

    await doc.pipe(fs.createWriteStream('src/assets/printouts/' + 'file_name' + '.pdf'));
    // await doc.pipe(fs.createWriteStream('src/assets/printouts/' + file_name + '.pdf'));


    doc.end();

    return ({ status: "success", data: 'printouts/' + 'file_name' + '.pdf' })




}

const abb_template_3 = async (request, tran_doc) => {
    return 'abb_template_3'

}



const inv_template_1 = async (request, tran_doc) => {

    return 'inv_template_1'
}



const inv_template_2 = async (request, tran_doc) => {

    return 'inv_template_2'
}



const inv_template_3 = async (request, tran_doc) => {

    return 'inv_template_3'
}



module.exports = {
    printOutPdfTaxInvoice
}