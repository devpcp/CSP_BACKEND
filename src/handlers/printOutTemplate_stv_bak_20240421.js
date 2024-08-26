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




const printOutTemplate_stv = async (request, tran_doc) => {

    var action = 'pdf template stv'

    try {


        let config_pdf = tran_doc.config_pdf
        let table_name = tran_doc.table_name
        let font_primary_color = config_pdf.font_primary_color || '#169EDC'
        let header_table_color = config_pdf.header_table_color || '#169EDC'
        /**
        *  1 = ขาย ,2 = นำเข้า ,3 = ใบเสนอราคา
        */
        let which = tran_doc.which
        /**
        *  1 = ใบสั่งซ่อม/ใบสั่งขาย ,2 = ใบส่งสินค้า ,3 = ใบเสร็จ
        */
        let which_step = tran_doc.which_step
        /**
         * ใบสั่งซ่อม
         */

        let doc_type_name = tran_doc.doc_type_name

        let user_profile = tran_doc.user_profile
        let shop_profile = tran_doc.shop_profile

        /**
         * price_use == false ใบเบิก
         */
        let price_use = (tran_doc.price_use) ? tran_doc.price_use : 'true'

        let shop_name = shop_profile.shop_name.th

        var customer = {}
        var vehicle = {}

        if (tran_doc.is_abb == true && tran_doc.is_inv == false) {
            tran_doc.doc_date = tran_doc.abb_doc_date
            tran_doc.code_id = tran_doc.abb_code_id
        }
        else if (tran_doc.is_inv == true) {
            tran_doc.doc_date = tran_doc.inv_doc_date
            tran_doc.code_id = tran_doc.inv_code_id
        }



        let product_all = []

        if (which_step == 1) {

            product_all = await ShopServiceOrderList(table_name).findAll({
                where: { shop_service_order_doc_id: request.params.id, status: 1 },
                include: [{
                    model: ShopProduct(table_name), as: 'ShopProduct', include: [
                        { model: Product }
                    ]
                }],
                order: [['seq_number', 'ASC']]
            })
        } else if (which_step == 2) {
            product_all = await ShopTemporaryDeliveryOrderList(table_name).findAll({
                where: { shop_temporary_delivery_order_doc_id: request.params.id, status: 1 },
                include: [{
                    model: ShopProduct(table_name), as: 'ShopProduct', include: [
                        { model: Product }
                    ]
                }],
                order: [['seq_number', 'ASC']]
            })
        } else if (which_step == 3) {
            product_all = await ShopTaxInvoiceList(table_name).findAll({
                where: { shop_tax_invoice_doc_id: request.params.id, status: 1 },
                include: [{
                    model: ShopProduct(table_name), as: 'ShopProduct', include: [
                        { model: Product }
                    ]
                }],
                order: [['seq_number', 'ASC']]
            })
        }

        var data = []

        for (let index = 0; index < product_all.length; index++) {
            const element = product_all[index];
            if (+(element.amount) <= 0 || !element.purchase_unit_id) { continue; }

            var unit = await ProductPurchaseUnitTypes.findOne({ where: { id: element.purchase_unit_id } })

            if (price_use == 'false') {
                try {
                    var warehouse_detail = await ShopWarehouses(table_name).findOne({
                        where: { id: element.shop_warehouse_id }
                    })
                    var shelf_name = warehouse_detail.shelf.filter(el => { return el.code == element.shop_warehouse_shelf_item_id })[0].name.th
                    var warehouse_name = warehouse_detail.name.th
                } catch (error) {
                    var shelf_name = ''
                    var warehouse_name = ''
                }

            }

            var all_price = (element.price_grand_total != null) ? element.price_grand_total : null

            let discount = (element.price_discount != null) ? element.price_discount : 0

            let product = element.ShopProduct.Product

            data.push({
                ...{
                    '#': index + 1,
                    'รหัสสินค้า': product.master_path_code_id || '-',
                    'ชื่อสินค้า': (element.details.change_name_status == true) ? element.details.changed_name : product.product_name.th,
                    'จำนวน': parseInt(element.amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    'หน่วย': (unit) ? unit.type_name.th : ''
                },
                ... (price_use == 'true') ? { 'ราคา/หน่วย': parseFloat(element.price_unit || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                ... (price_use == 'true') ? { '_ราคา/หน่วย': (element.price_unit || 0) * (element.amount || 0) } : {},
                ... (price_use == 'true') ? { 'ส่วนลด': (parseFloat(discount || 0) * parseInt(element.amount || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                ... (price_use == 'true') ? { '_ส่วนลด': parseFloat(discount || 0) } : {},
                // ... (price_use == 'true') ? { 'สุทธิต่อหน่วย': parseFloat((element.details.price || 0) - (element.details.discount || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                ... (price_use == 'true') ? { 'ราคารวม': parseFloat(all_price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                ... (price_use == 'true') ? { 'all_price': all_price } : {},

                ... (price_use == 'false') ? { 'คลังที่อยู่': warehouse_name } : {},
                ... (price_use == 'false') ? { 'ชั้นวางสินค้า': shelf_name } : {},
                ... (price_use == 'false') ? { 'DOT/MFD': (element.dot_mfd) ? element.dot_mfd : ' ' } : {}
            })

        }

        customer = tran_doc.ShopBusinessCustomer || tran_doc.ShopPersonalCustomer

        var addr_replare = await replace_addr(customer)

        let line1 = ``
        if (customer.customer_name.first_name) {
            line1 = line1 + `${customer.customer_name.first_name.th} ${customer.customer_name.last_name.th}`
        } else {
            line1 = line1 + `${customer.customer_name.th}`
        }

        let branch_code = customer.other_details.branch_code || ''
        if (customer.other_details.branch == 'office') {
            line1 = line1 + ` ( สำนักงานใหญ่` + branch_code + ' )'

        } else if (customer.other_details.branch == 'branch') {
            line1 = line1 + ` ( สาขา` + branch_code + ' )'

        }


        let long_addr = `${customer.address?.th || ''} `
        long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
        long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
        long_addr = long_addr + addr_replare[3][2] + addr_replare[0] + ` `
        long_addr = long_addr + `${(customer.SubDistrict) ? customer.SubDistrict.zip_code : ' '}`
        addr_split = long_addr.split(/[ \n]+/)
        count_ = 0
        long_addr = ''
        for (let index = 0; index < addr_split.length; index++) {
            const element = addr_split[index];
            if (element.length + count_ <= 50) {
                // if (index != 0) {
                long_addr = long_addr + element + ' '
                // } else {
                //     long_addr = long_addr + element + ''
                // }
                count_ = count_ + element.length
            } else {
                long_addr = long_addr + '\n' + element + ' '
                count_ = 0
            }

        }

        let line2 = long_addr

        let line3 = 'TAX ID : ' + `${customer.tax_id || customer.id_card_number || ''}`

        customer = { line1, line2, line3 }


        // return customer
        if (tran_doc.ShopVehicleCustomer != null) {



            vehicle = tran_doc.ShopVehicleCustomer
            let brand = (_.isObject(vehicle.VehicleBrand) == true) ? vehicle.VehicleBrand.brand_name.th : `- `
            let model = (_.isObject(vehicle.VehicleModelType) == true) ? vehicle.VehicleModelType.model_name.th : `- `
            let mileage = (tran_doc.details.hasOwnProperty('current_mileage') && tran_doc.details.current_mileage != '') ? tran_doc.details.current_mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : `- `
            let chassis_number = (vehicle.details.hasOwnProperty('chassis_number') && vehicle.details.chassis_number != '') ? vehicle.details.chassis_number : `- `
            let registration = (vehicle.details.hasOwnProperty('registration') && vehicle.details.registration != '') ? vehicle.details.registration : `- `


            let registration_ = registration + ` ${_.get(vehicle, 'details.province_name', '')} `
            if (registration_.length > 10) {
                registration_ = registration + `\n${_.get(vehicle, 'details.province_name', '')} `
            }

            vehicle = {
                registration: registration_,
                mileage: mileage,
                brand: brand,
                model: model
            }



        }



        const ws = {
            "headers": [],
            "datas": data
        }

        price = {
            'รวมเป็นเงิน': tran_doc.price_amount_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ส่วนลดรวม': tran_doc.price_discount_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ราคาก่อนรวมภาษี': tran_doc.price_before_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ภาษีมูลค่าเพิ่ม': tran_doc.price_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'จำนวนเงินรวมทั้งสิ้น': tran_doc.price_grand_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }


        var note = tran_doc.details.remark



        let repair_man = tran_doc.details.hasOwnProperty('repair_man') ? tran_doc.details.repair_man : []

        if (repair_man.length > 0) {

            let repair_all = await UsersProfiles.findAll({ where: { user_id: { [Op.in]: [repair_man[0]] } } })

            repair_man = ''
            for (let index = 0; index < repair_all.length; index++) {
                const element = repair_all[index];

                if (index == 0) {
                    repair_man = element.fname.th + ' ' + element.lname.th
                }
                // else {
                //     repair_man = repair_man + ' ,' + element.fname.th + ' ' + element.lname.th
                // }
            }
        }

        tran_doc.repair_man = repair_man


        return await pdfGen(doc_type_name, customer, vehicle, ws, price_use, price, note, tran_doc, config_pdf)





    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: 'failed', data: error })
    }

}

const replace_addr = async (data) => {


    var provice = data.Province || {}
    var district = data.District || {}
    var subdistrict = data.SubDistrict || {}

    if (provice.prov_name_th && provice.prov_name_th.match(/กรุงเทพ/g)) {
        var add_init = ['แขวง', 'เขต', 'จังหวัด']

        if (provice.prov_name_th) {
            provice.prov_name_th = provice.prov_name_th
        } else {
            provice.prov_name_th = ' - '
        }

        if (district.name_th) {
            district.name_th = district.name_th.replace("เขต", "")
        } else {
            district.name_th = ' - '
        }

        if (subdistrict.name_th) {
            subdistrict.name_th = subdistrict.name_th.replace("แขวง", "")
        } else {
            subdistrict.name_th = ' - '
        }


    } else {

        var add_init = ['ตำบล', 'อำเภอ', 'จังหวัด']

        if (provice.prov_name_th) {

            provice.prov_name_th = provice.prov_name_th
        } else {
            provice = {}
            provice.prov_name_th = ' - '
        }

        if (district.name_th) {
            district.name_th = district.name_th.replace("อ.", "")
        } else {
            district = {}
            district.name_th = ' - '
        }

        if (subdistrict.name_th) {
            subdistrict.name_th = subdistrict.name_th.replace("ต.", "")
        } else {
            subdistrict = {}
            subdistrict.name_th = ' - '
        }

    }

    return [provice.prov_name_th, district.name_th, subdistrict.name_th, add_init]
}



const pdfGen = async (doc_type_name, customer, vehicle, ws, price_use, price, note, tran_doc, config_pdf) => {
    let doc = null


    doc = await template_1(doc_type_name, customer, vehicle, ws, price_use, price, note, tran_doc, config_pdf)



    var file_name = uuid4();

    // await doc.pipe(fs.createWriteStream('src/assets/printouts/' + 'file_name' + '.pdf'));
    await doc.pipe(fs.createWriteStream('src/assets/printouts/' + file_name + '.pdf'));


    doc.end();

    // return ({ status: "success", data: 'printouts/' + 'file_name' + '.pdf' })
    return ({ status: "success", data: 'printouts/' + file_name + '.pdf' })

}



const template_1 = async (doc_type_name, customer, vehicle, ws, price_use, price, note, tran_doc, config_pdf) => {


    let wss = {
        headers: [
            { "label": '1', "property": '1', "width": 339, align: "left" },
            { "label": '2', "property": '2', "width": 100, align: "right" },
            { "label": '3', "property": '3', "width": 100, align: "right", padding: 3 },
        ],
        datas: []
    }

    let font_primary_color = config_pdf.font_primary_color || '#169EDC'

    let font_customer_size = 12
    if (config_pdf.font_customer_size?.isuse == true) {
        font_customer_size = config_pdf.font_customer_size?.value
    }

    let font_vehicle_size = 12
    if (config_pdf.font_vehicle_size?.isuse == true) {
        font_vehicle_size = config_pdf.font_vehicle_size?.value
    }

    let font_price_size = 12
    if (config_pdf.font_price_size?.isuse == true) {
        font_price_size = config_pdf.font_price_size?.value
    }

    let mt = 0
    if (tran_doc.paymentInfo && tran_doc.paymentInfo?.payment_method === 5) {
        mt = -5
    }
    // A4 = 8.3 x 11.7 inches

    //1 inch = 71.9988 px
    let px = 28.346
    let doc = new PDFDocument({
        margins: { top: 10.5 * px + mt, left: 1.8, right: 1.8, bottom: 2 * px },
        size: [20.65 * px, 27.94 * px],
        bufferPages: true
    });


    let option = {
        divider: {
            horizontal: { disabled: true }
        },
        hideHeader: true
    }

    if (tran_doc.paymentInfo && tran_doc.paymentInfo?.payment_method === 5) {
        ws.headers = [
            { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 9.3 * px, "padding": { left: 0.6 * px } },
            { "label": 'จำนวน', "property": 'จำนวน', "width": 1.45 * px, align: "center" },
            { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 2.2 * px, align: "right", "padding": { right: 0.2 * px } },
            { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 1.97 * px, align: "right", "padding": { right: 0.2 * px } },
            { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 2.25 * px, align: "right", "padding": { right: 0.2 * px } },
            { "label": 'ราคารวม', "property": 'ราคารวม', "width": 3 * px, align: "right", "padding": { right: 0.2 * px } }

        ]
    } else {
        ws.headers = [
            { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 11.68 * px, "padding": { left: 0.6 * px } },
            { "label": 'จำนวน', "property": 'จำนวน', "width": 2.4 * px, align: "center" },
            { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 2.9 * px, align: "right", "padding": { right: 0.2 * px } },
            { "label": 'ราคารวม', "property": 'ราคารวม', "width": 3.25 * px, align: "right", "padding": { right: 0.2 * px } }

        ]
    }


    if (price_use == 'true') {
        //data
        var helper = {};
        var result = ws.datas.reduce(function (r, o) {
            var key = o['ชื่อสินค้า'] + '-' + o['ราคา/หน่วย'] + '-' + o['DOT/MFD'];

            if (!helper[key]) {
                helper[key] = Object.assign({}, o); // create a copy of o
                helper[key]['จำนวน'] = 0
                helper[key]['ส่วนลด'] = 0
                helper[key]['ราคารวม'] = 0
                r.push(helper[key]);
            }
            helper[key]['จำนวน'] = helper[key]['จำนวน'] + parseFloat(o['จำนวน'].replace(',', ''));
            helper[key]['ส่วนลด'] = helper[key]['ส่วนลด'] + parseFloat(o['ส่วนลด'].replace(',', ''));
            helper[key]['ราคารวม'] = helper[key]['ราคารวม'] + parseFloat(o['ราคารวม'].replace(',', ''));

            return r;
        }, []);

        result = result.map((el, i) => {
            return {
                ...el,
                ...{ '#': i + 1 },
                ...{ 'ส่วนลด': parseFloat(el['ส่วนลด'] || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
                ...{ 'ราคารวม': parseFloat(el['ราคารวม'] || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }
            }
        })

        ws.datas = result

    }


    await doc.table(ws, {
        ...option,
        prepareHeader: () => doc.font(Bold).fontSize(12).fillColor('white'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font(Regular).fontSize(13).fillColor("black");

        },
    });
    //price

    if (price_use == 'true') {

        // if (doc.y > 22.5 * px) {
        //     doc.addPage()
        // }

        let note = tran_doc.details.remark

        let pric_all = price['จำนวนเงินรวมทั้งสิ้น']

        doc.font(Regular).fontSize(14).text(note, 1 * px, 19.2 * px + mt);

        doc.font(Bold).fontSize(16).text((price['รวมเป็นเงิน'])?.toString(), 0, 20.8 * px + mt, { align: 'right', width: 20 * px });
        if (tran_doc.paymentInfo && tran_doc.paymentInfo?.payment_method === 5) {
            doc.font(Bold).fontSize(16).text((price['ภาษีมูลค่าเพิ่ม'])?.toString(), 0, 21.85 * px + mt, { align: 'right', width: 20 * px });
            doc.font(Bold).fontSize(16).text(pric_all?.toString(), 0, 22.9 * px + mt, { align: 'right', width: 20 * px });

        } else {
            doc.font(Bold).fontSize(16).text((price['ส่วนลดรวม'])?.toString(), 0, 21.85 * px + mt, { align: 'right', width: 20 * px });
            doc.font(Bold).fontSize(16).text((price['ภาษีมูลค่าเพิ่ม'])?.toString(), 0, 22.9 * px + mt, { align: 'right', width: 20 * px });
            doc.font(Bold).fontSize(16).text(pric_all?.toString(), 0, 23.9 * px + mt, { align: 'right', width: 20 * px });


        }

        doc.font(Bold).fontSize(16).text(ArabicNumberToText(pric_all), 0.8 * px, 20.8 * px + mt);








    }

    //Global Edits to All Pages (Header/Footer, etc)
    var pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        let height = 0


        let doc_no = tran_doc.code_id
        let doc_date = moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY")
        let doc_date_credit_term = ''
        let credit_term = 0
        if (doc_date) {
            let customer = tran_doc.ShopBusinessCustomer || tran_doc.ShopPersonalCustomer

            credit_term = customer?.other_details.credit_term || 0
            let doc_date_credit_term_ = new Date(tran_doc.doc_date)

            doc_date_credit_term = doc_date_credit_term_.setDate(doc_date_credit_term_.getDate() + parseInt(credit_term));
            doc_date_credit_term = moment(new Date(doc_date_credit_term)).format('DD/MM/YYYY')
        }

        if (tran_doc.paymentInfo && tran_doc.paymentInfo?.payment_method === 5) {
            doc.font(Regular).fontSize(14).fillColor('black').text('(สำนักงานใหญ่)', 10.3 * px, 1.5 * px - 2)

        } else {
            doc.font(Regular).fontSize(14).fillColor('black').text('(สำนักงานใหญ่)', 10.3 * px, 1.5 * px)
        }



        doc.font(Regular).fontSize(16).fillColor('black').text(doc_date, 14.2 * px, 5.5 * px + mt)
        doc.font(Regular).fontSize(16).fillColor('black').text(doc_no, 14.2 * px, 6.35 * px + mt)
        // doc.font(Regular).fillColor('black').text(i + 1, 20.5 * px, 2.8 * px);
        if (tran_doc.paymentInfo && tran_doc.paymentInfo?.payment_method === 5) {
            doc.font(Regular).fontSize(16).fillColor('black').text(credit_term + '   วัน', 14.2 * px, 7.1 * px + mt)

        } else {
            doc.font(Regular).fontSize(16).fillColor('black').text('เงินสด', 14.2 * px, 7.1 * px + mt)

        }
        doc.font(Regular).fontSize(16).fillColor('black').text(doc_date_credit_term, 14.2 * px, 7.85 * px + mt)


        if (Object.keys(customer).length > 0) {
            doc.font(Regular).fontSize(14).fillColor('black').text(customer.line1, 2.7 * px, 5.5 * px + mt)
            doc.font(Regular).fontSize(14).fillColor('black').lineGap(-2).text(customer.line2, 0.6 * px, 6.2 * px + mt, {})
            doc.font(Regular).fontSize(14).fillColor('black').lineGap(1).text(customer.line3)

        }

        if (config_pdf.show_qr_code_promptpay == true) {
            let qr_code_promt_pay = `src/assets/shops/${tran_doc.shop_id}/promtpay/1.png`

            try {
                doc.image(qr_code_promt_pay, 12.3 * px, 23 * px + mt - 2, { height: 1.6 * px, width: 1.6 * px });
                doc.font(Regular).fontSize(14).fillColor('black').text('สแกนที่นี่เพื่อชำระเงิน', 0, 24.1 * px + mt - 2, { align: 'right', width: 12 * px })


            } catch (error) {

            }
        }




    }

    return doc

}



const gen_file_name = async (start_date, end_date, file_name) => {

    return uuid4() + '___' + start_date + '_' + end_date;
}




module.exports = {
    printOutTemplate_stv,
}