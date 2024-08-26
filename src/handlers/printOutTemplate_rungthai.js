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




const printOutTemplate_rungthai = async (request, tran_doc) => {

    var action = 'pdf template 3'

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


        let user_profile = tran_doc.user_profile
        let shop_profile = tran_doc.shop_profile


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

        if (tran_doc.price_use == 'true') {

            var header1 = [
                { "label": '#', "property": '#', "width": 30, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                // { "label": 'รหัสสินค้า', "property": 'รหัสสินค้า', "width": 70, "headerColor": "#169EDC", "headerOpacity": 1, "headerAlign": "center" },
                { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 200 - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                { "label": 'จำนวน', "property": 'จำนวน', "width": 50, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'หน่วย', "property": 'หน่วย', "width": 65, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 75, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right", "padding": 10 },
                { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 65, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right", "padding": 10 },
                // { "label": 'สุทธิต่อหน่วย', "property": 'สุทธิต่อหน่วย', "width": 65, "headerColor": "#169EDC", "headerOpacity": 1, "headerAlign": "center" },
                { "label": 'ราคารวม', "property": 'ราคารวม', "width": 65, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" }

            ]

        } else {

            //ใบเบิก
            var header1 = [
                { "label": '#', "property": '#', "width": 30, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                // { "label": 'รหัสสินค้า', "property": 'รหัสสินค้า', "width": 70, "headerColor": "#169EDC", "headerOpacity": 1, "headerAlign": "center" },
                { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 200 - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                { "label": 'จำนวน', "property": 'จำนวน', "width": 40, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'หน่วย', "property": 'หน่วย', "width": 65, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'คลังที่อยู่', "property": 'คลังที่อยู่', "width": 75, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'ชั้นวางสินค้า', "property": 'ชั้นวางสินค้า', "width": 70, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'DOT/MFD', "property": 'DOT/MFD', "width": 70, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },

            ]

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

            if (tran_doc.price_use == 'false') {
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
                ... (tran_doc.price_use == 'true') ? { 'ราคา/หน่วย': parseFloat(element.price_unit || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                ... (tran_doc.price_use == 'true') ? { '_ราคา/หน่วย': (element.price_unit || 0) * (element.amount || 0) } : {},
                ... (tran_doc.price_use == 'true') ? { 'ส่วนลด': (parseFloat(discount || 0) * parseInt(element.amount || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                ... (tran_doc.price_use == 'true') ? { '_ส่วนลด': parseFloat(discount || 0) } : {},
                ... (tran_doc.price_use == 'true') ? { 'ราคารวม': parseFloat(all_price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                ... (tran_doc.price_use == 'true') ? { 'all_price': all_price } : {},

                ... (tran_doc.price_use == 'false') ? { 'คลังที่อยู่': warehouse_name } : {},
                ... (tran_doc.price_use == 'false') ? { 'ชั้นวางสินค้า': shelf_name } : {},
                ... (tran_doc.price_use == 'false') ? { 'DOT/MFD': (element.dot_mfd) ? element.dot_mfd : ' ' } : {}
            })

        }

        customer = tran_doc.ShopBusinessCustomer || tran_doc.ShopPersonalCustomer

        var addr_replare = await replace_addr(customer)

        let line1 = customer.master_customer_code_id + ` `
        if (customer.customer_name.first_name) {
            line1 = line1 + `${customer.customer_name.first_name.th} ${customer.customer_name.last_name.th}`
        } else {
            line1 = line1 + `${customer.customer_name.th}`
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
                if (index != 0) {
                    long_addr = long_addr + element + ' '
                } else {
                    long_addr = long_addr + element + ''
                }
                count_ = count_ + element.length
            } else {
                long_addr = long_addr + '\n' + element + ' '
                count_ = 0
            }

        }

        let line2 = long_addr

        let line3 = 'TAX ID : ' + `${customer.tax_id || customer.id_card_number || ''}`

        customer = { line1, line2, line3 }

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
            "headers": header1,
            "datas": data
        }

        price = {
            'รวมเป็นเงิน': tran_doc.price_sub_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ส่วนลดรวม': tran_doc.price_discount_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ราคาก่อนรวมภาษี': tran_doc.price_before_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'ภาษีมูลค่าเพิ่ม': tran_doc.price_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            'จำนวนเงินรวมทั้งสิ้น': tran_doc.price_grand_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }


        var note = tran_doc.details.remark



        let repair_man = tran_doc.details.hasOwnProperty('repair_man') ? tran_doc.details.repair_man : []

        if (repair_man.length > 0) {
            let repair_all = null
            if (repair_man[0]) {
                repair_all = await UsersProfiles.findAll({ where: { user_id: { [Op.in]: [repair_man[0]] } } })
            }

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


        return await pdfGen(customer, vehicle, ws, price, note, tran_doc, config_pdf)





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



const pdfGen = async (customer, vehicle, ws, price, note, tran_doc, config_pdf) => {
    let doc = null

    if (tran_doc.which_step == 2) {
        doc = await template_2(customer, vehicle, ws, price, note, tran_doc, config_pdf)

    } else {
        doc = await template_1(customer, vehicle, ws, price, note, tran_doc, config_pdf)
    }



    var file_name = uuid4();

    await doc.pipe(fs.createWriteStream('src/assets/printouts/' + 'file_name' + '.pdf'));
    // await doc.pipe(fs.createWriteStream('src/assets/printouts/' + file_name + '.pdf'));


    doc.end();

    return ({ status: "success", data: 'printouts/' + 'file_name' + '.pdf' })
    // return ({ status: "success", data: 'printouts/' + file_name + '.pdf' })

}



const template_1 = async (customer, vehicle, ws, price, note, tran_doc, config_pdf) => {


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

    // A4 = 8.3 x 11.7 inches
    // inches = 71.72 pixel 

    //1 cm = 28.346 px
    let px = 28.346
    let doc = new PDFDocument({
        margins: { top: 7.8 * px, left: 1.6 * px, right: 0, bottom: 0 * px },
        size: [22.86 * px, 27.94 * px],
        // dpi:300,
        bufferPages: true
    });


    let option = {
        divider: {
            horizontal: { disabled: true }
        },
        hideHeader: true
    }

    ws.headers = [
        { "label": 'รหัสสินค้า', "property": 'รหัสสินค้า', "width": 2.5 * px, "padding": 5 },
        { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 7.75 * px, "padding": 5 },
        { "label": 'จำนวน', "property": 'จำนวน', "width": 1.5 * px, align: "center" },
        { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 2.4 * px, align: "right", "padding": 5 },
        { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 2.15 * px, align: "right", "padding": 5 },
        { "label": 'ราคารวม', "property": 'ราคารวม', "width": 3.35 * px, align: "right", "padding": 5 }

    ]
    if (tran_doc.price_use == 'true') {
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
            doc.font(Regular).fontSize(11).fillColor("black");

        },
    });
    //price

    if (tran_doc.price_use == 'true') {

        if (doc.y > 22.5 * px) {
            doc.addPage()
        }


        let pric_all = price['จำนวนเงินรวมทั้งสิ้น']

        doc.font(Regular).fontSize(12).text(note, 3.8 * px, 19.5 * px);

        doc.font(Bold).fontSize(12).text('ขอบพระคุณอย่างสูงที่มาใช้บริการ'.toString(), 5 * px, 20.75 * px);


        doc.font(Bold).fontSize(12).text('โอกาสหน้าขอเชิญมาใช้บริการใหม่ค่ะ'.toString(), 5 * px, 21.75 * px);


        doc.font(Bold).fontSize(12).text((price['รวมเป็นเงิน'])?.toString(), 0, 20.75 * px, { align: 'right', width: 15.6 * px });

        doc.font(Bold).fontSize(12).text((price['ส่วนลดรวม'])?.toString(), 0, 21.75 * px, { align: 'right', width: 15.6 * px });


        doc.font(Bold).fontSize(12).text((price['ราคาก่อนรวมภาษี'] || price['รวมเป็นเงิน'])?.toString(), 0, 20.75 * px, { align: 'right', width: 21.1 * px });

        doc.font(Bold).fontSize(12).text((price['ภาษีมูลค่าเพิ่ม'])?.toString(), 0, 21.75 * px, { align: 'right', width: 21.1 * px });

        doc.font(Bold).fontSize(14).text(pric_all?.toString(), 0, 22.7 * px, { align: 'right', width: 21.1 * px });

        doc.font(Bold).fontSize(14).text(ArabicNumberToText(pric_all), 4 * px, 22.7 * px);


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



        doc.font(Bold).fontSize(10).fillColor('black').text(doc_no, 15.5 * px, 2 * px)
        doc.font(Bold).fontSize(10).fillColor('black').text(doc_date, 15.5 * px, 2.9 * px)
        doc.font(Regular).fillColor('black').text(i + 1, 19.5 * px, 2.9 * px);
        doc.font(Bold).fontSize(10).fillColor('black').text(credit_term + '   วัน', 17.5 * px, 3.8 * px)
        doc.font(Bold).fontSize(10).fillColor('black').text(doc_date_credit_term, 17.5 * px, 4.5 * px)

        if (vehicle?.registration?.includes('\n')) {
            doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.registration.split('\n')[0], 3.5 * px, 6 * px)
            doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.registration.split('\n')[1], 3.5 * px, 6.4 * px)


        } else {
            doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.registration, 2.7 * px, 6.2 * px)

        }

        doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.mileage, 7 * px, 6.2 * px)
        doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.brand, 10 * px, 6.2 * px)
        doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.model, 13.3 * px, 6.2 * px)

        if (tran_doc.repair_man != '') {
            doc.font(Regular).fontSize(11).fillColor('black').text(tran_doc.repair_man, 17.5 * px, 6.2 * px)
        }

        if (Object.keys(customer).length > 0) {
            doc.font(Regular).fontSize(12).fillColor('black').text(customer.line1, 3.5 * px, 2.8 * px)
            doc.font(Regular).fontSize(11).fillColor('black').lineGap(-2).text(customer.line2, 3.5 * px, 3.5 * px, {
            })
            doc.font(Regular).fontSize(11).fillColor('black').lineGap(1).text(customer.line3)

        }


    }

    return doc

}

const template_2 = async (customer, vehicle, ws, price, note, tran_doc, config_pdf) => {


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

    // A4 = 8.3 x 11.7 inches
    // inches = 71.72 pixel 

    //1 cm = 28.346 px
    let px = 28.346
    let doc = new PDFDocument({
        margins: { top: 8.9 * px, left: 10, right: 7, bottom: 2 * px },
        size: [22.86 * px, 27.94 * px],
        bufferPages: true
    });


    let option = {
        divider: {
            horizontal: { disabled: true }
        },
        hideHeader: true
    }

    ws.headers = [
        { "label": 'รหัสสินค้า', "property": 'รหัสสินค้า', "width": 3 * px },
        { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 8.2 * px, },
        { "label": 'จำนวน', "property": 'จำนวน', "width": 1 * px, align: "center" },
        { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 3.1 * px, align: "right", "padding": 10 },
        { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 2 * px, align: "right", "padding": 10 },
        { "label": 'ราคารวม', "property": 'ราคารวม', "width": 3.1 * px, align: "right" }

    ]
    if (tran_doc.price_use == 'true') {
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
            doc.font(Regular).fontSize(12).fillColor("black");

        },
    });
    //price

    if (tran_doc.price_use == 'true') {

        if (doc.y > 22.5 * px) {
            doc.addPage()
        }


        let pric_all = price['จำนวนเงินรวมทั้งสิ้น']

        doc.font(Regular).fontSize(12).text('Tax Invoice', 1.3 * px, 22.45 * px);

        doc.font(Regular).fontSize(12).text('Receipt', 1.3 * px, 23.3 * px);

        doc.font(Bold).fontSize(13).text(ArabicNumberToText(pric_all), 5.5 * px, 23.3 * px);

        doc.font(Bold).fontSize(13).text(pric_all?.toString(), 0, 23.3 * px, { align: 'right', width: 20.5 * px });



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



        doc.font(Bold).fontSize(12).fillColor('black').text(doc_no, 15.8 * px, 3.3 * px)
        doc.font(Bold).fontSize(12).fillColor('black').text(doc_date, 15.8 * px, 4.2 * px)
        // doc.font(Regular).fillColor('black').text(i + 1, 19.5 * px, 2.65 * px);
        // doc.font(Bold).fontSize(10).fillColor('black').text(credit_term + '   วัน', 18 * px, 3.45 * px)
        doc.font(Bold).fontSize(12).fillColor('black').text(doc_date_credit_term, 15.8 * px, 5.1 * px)

        if (vehicle?.registration?.includes('\n')) {
            doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.registration.split('\n')[0], 2.7 * px, 6.6 * px)
            doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.registration.split('\n')[1], 2.7 * px, 7 * px)


        } else {
            doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.registration, 2.7 * px, 6.8 * px)

        }

        doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.mileage, 6.3 * px, 6.8 * px)
        doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.brand, 9.5 * px, 6.8 * px)
        doc.font(Regular).fontSize(11).fillColor('black').text(vehicle.model, 12.5 * px, 6.8 * px)

        if (tran_doc.repair_man != '') {
            doc.font(Regular).fontSize(11).fillColor('black').text(tran_doc.repair_man, 18 * px, 5.9 * px)
        }

        if (Object.keys(customer).length > 0) {
            doc.font(Regular).fontSize(13).fillColor('black').text(customer.line1, 2.5 * px, 3 * px)
            doc.font(Regular).fontSize(12).fillColor('black').text(customer.line2, 2.5 * px, 3.6 * px, { lineGap: 1 })
        }


    }

    return doc

}

const gen_file_name = async (start_date, end_date, file_name) => {

    return uuid4() + '___' + start_date + '_' + end_date;
}




module.exports = {
    printOutTemplate_rungthai,
}