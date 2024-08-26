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
const { ShopServiceOrderDoc, ShopServiceOrderList, ShopTaxInvoiceDoc, ShopTaxInvoiceList, ShopTemporaryDeliveryOrderDoc, ShopTemporaryDeliveryOrderList, ShopCustomerDebtDoc, ShopCustomerDebtList, ShopCustomerDebtBillingNoteDoc, ShopCustomerDebtBillingNoteList, ShopPaymentTransaction, VehicleColor, MapRegProv, ShopCustomerDebtDebitNoteList, ShopCustomerDebtCreditNoteList, initShopModel } = require('../models/model');
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
const { printOutTemplate_rungthai } = require('./printOutTemplate_rungthai');
const { printOutTemplate_stv } = require('./printOutTemplate_stv');
const utilGetModelsAndShopModels = require('../utils/util.GetModelsAndShopModels');

let margin_left = 8;
const Bold = "src/assets/fonts/THSarabunNew/THSarabunNewBold.ttf";
const Regular = "src/assets/fonts/THSarabunNew/THSarabunNew.ttf";




const printOutPdf = async (request, reply, app) => {

    var action = 'test pdf'

    try {




        let shop_table = await utilCheckShopTableName(request)
        let table_name = shop_table.shop_code_id


        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const ShopCustomerDebtCreditNoteDoc_ = ShopModels.ShopCustomerDebtCreditNoteDoc
        const ShopTemporaryDeliveryOrderDoc_ = ShopModels.ShopTemporaryDeliveryOrderDoc
        const ShopServiceOrderDoc_ = ShopModels.ShopServiceOrderDoc
        const ShopTaxInvoiceDoc_ = ShopModels.ShopTaxInvoiceDoc
        const ShopCustomerDebtDebitNoteDoc_ = ShopModels.ShopCustomerDebtDebitNoteDoc
        const ShopPaymentTransaction_ = ShopModels.ShopPaymentTransaction
        const ShopCustomerDebtDoc_ = ShopModels.ShopCustomerDebtDoc
        const ShopPartnerDebtDoc_ = ShopModels.ShopPartnerDebtDoc
        const ShopPartnerDebtList_ = ShopModels.ShopPartnerDebtList
        const ShopInventoryImportDoc_ = ShopModels.ShopInventoryImportDoc
        const ShopPartnerDebtDebitNoteDoc_ = ShopModels.ShopPartnerDebtDebitNoteDoc
        const ShopPartnerDebtCreditNoteDoc_ = ShopModels.ShopPartnerDebtCreditNoteDoc
        const ShopPartnerDebtCreditNoteList_ = ShopModels.ShopPartnerDebtCreditNoteList
        const ShopPartnerDebtDebitNoteList_ = ShopModels.ShopPartnerDebtDebitNoteList



        let config_pdf = shop_table.shop_config?.config_pdf || {}
        // let check_config_pdf = ShopProfilePdfConfig.filter(el => { return el.shop_code_id.toUpperCase() == table_name.toUpperCase() })
        // if (check_config_pdf.length > 0) {
        //     config_pdf = check_config_pdf[0].shop_config.config_pdf
        // }



        let font_primary_color = config_pdf.font_primary_color || '#169EDC'
        let header_table_color = config_pdf.header_table_color || '#169EDC'
        /**
        *  1 = ขาย ,2 = นำเข้า ,3 = ใบเสนอราคา, 4=  ใบรับชำระ ,5 = ใบวางบิล,6 = ใบลดหนี้ ,7 = ใบเพิ่มหนี้, 8 = ใบรับชำระเจ้าหนี้
        */
        let which = 0
        /**
        *  1 = ใบสั่งซ่อม/ใบสั่งขาย ,2 = ใบส่งสินค้า ,3 = ใบเสร็จ
        */
        let which_step = 0
        /**
         * ใบสั่งซ่อม
         */

        let repare_doc = '7ef3840f-3d7f-43de-89ea-dce215703c16'
        /**
         * ใบสั่งขาย
         */
        let sale_doc = '67c45df3-4f84-45a8-8efc-de22fef31978'

        /**
         * ใบเสร็จอย่างย่อ
         */
        let bill_doc = 'b39bcb5d-6c72-4979-8725-c384c80a66c3'


        /**
         * price_use == false ใบเบิก
         */
        let price_use = (request.query.price_use) ? request.query.price_use : 'true'

        var user_profile = await UsersProfiles.findOne({ where: { user_id: request.id } })
        var shop_profile = await ShopsProfiles.findOne(
            {
                where: { id: user_profile.shop_id },
                include: [
                    { model: Province },
                    { model: District }, { model: SubDistrict }]
            }
        )


        //หมวดขาย
        const tran_doc1 = async () => {

            let tran_doc = await ShopServiceOrderDoc(table_name).findOne({
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
                tran_doc = tran_doc.dataValues
                tran_doc.which = 1
                tran_doc.which_step = 1
                tran_doc.doc_type_name = 'ใบสั่งซ่อม'
                let paymentInfo = await ShopPaymentTransaction(table_name).findOne({
                    where: { shop_service_order_doc_id: tran_doc.id },
                    order: [['created_date', 'desc']]
                })
                tran_doc.paymentInfo = paymentInfo

                if (tran_doc.doc_sales_type == 2) {
                    tran_doc.doc_type_name = 'ใบขาย'
                }
            }


            return tran_doc

        }

        const tran_doc2 = async () => {
            let tran_doc = await ShopInventoryTransaction(table_name).findOne({
                where: { id: request.params.id },
                include: [
                    {
                        model: ShopBusinessPartners(table_name),
                        as: 'ShopBusinessPartners',
                        include: [
                            { model: Province, as: "Province" },
                            { model: District, as: "District" },
                            { model: SubDistrict, as: "SubDistrict" }
                        ]
                    },
                    {
                        model: DocumentTypes, as: 'DocumentTypes'
                    }
                ]
            })

            if (tran_doc) {
                tran_doc = tran_doc.dataValues
                tran_doc.which = 2
                tran_doc.doc_type_name = tran_doc.DocumentTypes?.type_name?.th || 'ใบนำเข้าสินค้า'
                tran_doc.price_use = 'true'

                //ใบโอนระหว่างสาขา
                if (tran_doc.doc_type_id == '53e7cbcc-3443-40e5-962f-d9512aba2b5a' && tran_doc.details?.destination_branch) {
                    let destination_branch = await ShopsProfiles.findOne(
                        {
                            attributes: { include: [['shop_name', 'partner_name']] },
                            where: { id: tran_doc.details.destination_branch },
                            include: [
                                { model: Province },
                                { model: District }, { model: SubDistrict }]
                        }
                    )
                    tran_doc.ShopBusinessPartners = destination_branch.dataValues
                    tran_doc.seller_title = 'สาขาปลายทาง'

                } else if (tran_doc.doc_type_id == '4979e859-92d1-4485-9243-45cdd505adb8' && tran_doc.details?.shop_sender_id) {
                    let shop_sender_id = await ShopsProfiles.findOne(
                        {
                            attributes: { include: [['shop_name', 'partner_name']] },
                            where: { id: tran_doc.details.shop_sender_id },
                            include: [
                                { model: Province },
                                { model: District }, { model: SubDistrict }]
                        }
                    )
                    tran_doc.ShopBusinessPartners = shop_sender_id.dataValues
                    tran_doc.seller_title = 'สาขาที่โอน'
                }
            }


            return tran_doc

        }

        const tran_doc1_2 = async () => {
            let tran_doc = await ShopTemporaryDeliveryOrderDoc(table_name).findOne({
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
                tran_doc = tran_doc.dataValues
                tran_doc.which = 1
                tran_doc.which_step = 2
                tran_doc.doc_type_name = 'ใบส่งสินค้าชั่วคราว'
                tran_doc.price_use = 'true'
            }

            return tran_doc
        }

        const tran_doc1_1 = async () => {
            let tran_doc = await ShopTaxInvoiceDoc(table_name).findOne({
                where: { id: request.params.id },
                include: [
                    { model: ShopServiceOrderDoc(table_name), as: 'ShopServiceOrderDoc' },
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
                tran_doc = tran_doc.dataValues
                tran_doc.which = 1
                tran_doc.which_step = 3

                if (tran_doc.is_abb == true && tran_doc.is_inv == false) {
                    tran_doc.doc_type_name = 'ใบกำกับภาษีอย่างย่อ'
                    tran_doc.doc_date = tran_doc.abb_doc_date
                    tran_doc.code_id = tran_doc.abb_code_id
                    tran_doc.config_pdf = config_pdf
                    tran_doc.user_profile = user_profile
                    tran_doc.shop_profile = shop_profile
                    tran_doc.table_name = table_name

                    return await printOutTemplate2(request, tran_doc)

                }
                else if (tran_doc.is_inv == true) {
                    tran_doc.doc_type_name = 'ใบกำกับภาษีเต็มรูป'
                    tran_doc.doc_date = tran_doc.inv_doc_date
                    tran_doc.code_id = tran_doc.inv_code_id
                    tran_doc.price_use = 'true'

                }

            }


            return tran_doc

        }

        const tran_doc3 = async () => {
            let tran_doc = await ShopQuotationDoc(table_name).findOne({
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
                tran_doc = tran_doc.dataValues
                tran_doc.which = 3
                tran_doc.doc_type_name = 'ใบเสนอราคา'
                tran_doc.price_use = 'true'
            }


            return tran_doc
        }

        const tran_doc4 = async () => {
            let tran_doc = await ShopCustomerDebtDoc_.findOne({
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
                        model: ShopPaymentTransaction_,
                        required: true,
                        separate: true,
                        attributes: {
                            exclude: ['details']
                        },
                        where: {
                            canceled_payment_by: null,
                            canceled_payment_date: null
                        }
                    }
                ]
            })

            if (tran_doc) {
                tran_doc = tran_doc.dataValues
                tran_doc.which = 4
                tran_doc.doc_type_name = 'ใบวางบิล/ใบแจ้งหนี้'
            }

            return tran_doc
        }

        const tran_doc5 = async () => {
            let tran_doc = await ShopCustomerDebtBillingNoteDoc(table_name).findOne({
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
                    }
                ]
            })

            if (tran_doc) {
                tran_doc = tran_doc.dataValues
                tran_doc.which = 5
                tran_doc.doc_type_name = 'ใบวางบิลลูกหนี้'
            }

            return tran_doc
        }

        const tran_doc6 = async () => {
            let tran_doc = await ShopCustomerDebtCreditNoteDoc_.findOne({
                where: { id: request.params.id },
                ShopModels: ShopModels,
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
                        model: ShopTemporaryDeliveryOrderDoc_, as: 'ShopTemporaryDeliveryOrderDoc',
                        include: [{
                            model: ShopServiceOrderDoc_, as: 'ShopServiceOrderDoc',
                            include: [
                                {
                                    model: ShopTaxInvoiceDoc_,
                                    order: [['created_date', 'desc']],

                                }
                            ]
                        }]
                    }
                ]
            })

            if (tran_doc) {
                tran_doc = tran_doc.dataValues
                tran_doc.which = 6
                tran_doc.doc_type_name = 'ใบลดหนี้ / Credit Note'
                tran_doc.price_use = 'true'
            }

            return tran_doc

        }

        const tran_doc7 = async () => {
            let tran_doc = await ShopCustomerDebtDebitNoteDoc_.findOne({
                where: { id: request.params.id },
                ShopModels: ShopModels,
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
                        model: ShopTemporaryDeliveryOrderDoc_, as: 'ShopTemporaryDeliveryOrderDoc',
                        include: [{
                            model: ShopServiceOrderDoc_, as: 'ShopServiceOrderDoc',
                            include: [
                                {
                                    model: ShopTaxInvoiceDoc_,
                                    order: [['created_date', 'desc']],

                                }
                            ]
                        }]
                    }
                ]
            })

            if (tran_doc) {
                tran_doc = tran_doc.dataValues
                tran_doc.which = 7
                tran_doc.doc_type_name = 'ใบเพิ่มหนี้ / Debit Note'
                tran_doc.price_use = 'true'
            }

            return tran_doc
        }

        const tran_doc8 = async () => {

            let tran_doc = await ShopPartnerDebtDoc_.findOne({
                where: { id: request.params.id },
                include: [
                    {
                        model: ShopBusinessPartners(table_name),
                        as: 'ShopBusinessPartner',
                        include: [
                            { model: Province, as: "Province" },
                            { model: District, as: "District" },
                            { model: SubDistrict, as: "SubDistrict" }
                        ]
                    },
                    {
                        model: ShopPaymentTransaction_,
                        required: true,
                        separate: true,
                        attributes: {
                            exclude: ['details']
                        },
                        where: {
                            canceled_payment_by: null,
                            canceled_payment_date: null
                        }
                    }
                ]
            })

            if (tran_doc) {
                tran_doc = tran_doc.dataValues
                tran_doc.which = 8
                tran_doc.doc_type_name = 'ใบจ่ายชำระเจ้าหนี้'
            }

            return tran_doc
        }

        const tran_doc9 = async () => {
            let tran_doc = await ShopPartnerDebtCreditNoteDoc_.findOne({
                where: { id: request.params.id },
                ShopModels: ShopModels,
                include: [
                    {
                        model: ShopBusinessPartners(table_name),
                        as: 'ShopBusinessPartner',
                        include: [
                            { model: Province, as: "Province" },
                            { model: District, as: "District" },
                            { model: SubDistrict, as: "SubDistrict" }
                        ]
                    },
                    {
                        model: ShopInventoryImportDoc_, as: 'ShopInventoryImportDoc',
                    }
                ]
            })

            if (tran_doc) {
                tran_doc = tran_doc.dataValues
                tran_doc.which = 9
                tran_doc.doc_type_name = 'ใบลดหนี้เจ้าหนี้ / Credit Note'
                tran_doc.price_use = 'true'
            }


            return tran_doc
        }

        const tran_doc10 = async () => {
            let tran_doc = await ShopPartnerDebtDebitNoteDoc_.findOne({
                where: { id: request.params.id },
                ShopModels: ShopModels,
                include: [

                    {
                        model: ShopBusinessPartners(table_name),
                        as: 'ShopBusinessPartner',
                        include: [
                            { model: Province, as: "Province" },
                            { model: District, as: "District" },
                            { model: SubDistrict, as: "SubDistrict" }
                        ]
                    },
                    {
                        model: ShopInventoryImportDoc_, as: 'ShopInventoryImportDoc',

                    }
                ]
            })
            if (tran_doc) {
                tran_doc = tran_doc.dataValues
                tran_doc.which = 10
                tran_doc.doc_type_name = 'ใบเพิ่มหนี้เจ้าหนี้ / Debit Note'
                tran_doc.price_use = 'true'
            }

            return tran_doc
        }


        let doc_type_id = request.query.doc_type_id || null


        const random = async () => {
            tran_doc = await tran_doc1()

            if (tran_doc == null) {
                tran_doc = await tran_doc2()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc3()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc1_1()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc1_2()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc4()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc5()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc6()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc8()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc8()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc9()
            }
            if (tran_doc == null) {
                tran_doc = await tran_doc10()
            }

            return tran_doc
        }

        let tran_doc = null
        if (doc_type_id) {
            switch (doc_type_id) {
                //ใบโอนระหว่างสาขา
                case '53e7cbcc-3443-40e5-962f-d9512aba2b5a':
                    tran_doc = await tran_doc2()
                    break;
                //ใบเสร็จเต็มรูป
                case 'e67f4a64-52dd-4008-9ef0-0121e7a65d48':
                    tran_doc = await tran_doc1_1()
                    break;
                default:
                    break;
            }

            if (tran_doc == null) {
                tran_doc = await random()
            }

        } else {
            tran_doc = await random()
        }

        tran_doc.shop_profile = shop_profile

        if (tran_doc.which === 0) {
            await handleSaveLog(request, [[action], 'doc not found'])
            return ({ status: 'failed', data: 'doc not found' })
        }

        if (!tran_doc.price_use) {
            tran_doc.price_use = price_use
        }

        if (request.query.doc_type_name && request.query.doc_type_name != '') {
            tran_doc.doc_type_name = request.query.doc_type_name
        }

        if (!tran_doc.doc_type_name) {
            tran_doc.doc_type_name = ''
        }


        // รุ่งไทย
        if (tran_doc.which == 1 &&
            config_pdf.repair_doc?.use_template?.value == true &&
            config_pdf.repair_doc?.use_template?.which_templte_number?.value == 3) {
            tran_doc.config_pdf = config_pdf
            tran_doc.user_profile = user_profile
            tran_doc.shop_profile = shop_profile
            tran_doc.table_name = table_name

            return await printOutTemplate_rungthai(request, tran_doc)
        }
        // STV
        else if (tran_doc.which == 1 && [3].includes(tran_doc.which_step) &&
            config_pdf.repair_doc?.use_template?.value == true &&
            config_pdf.repair_doc?.use_template?.which_templte_number?.value == 4) {
            tran_doc.config_pdf = config_pdf
            tran_doc.user_profile = user_profile
            tran_doc.shop_profile = shop_profile
            tran_doc.table_name = table_name

            let paymentInfo = await ShopPaymentTransaction(table_name).findOne({
                where: { shop_tax_invoice_doc_id: tran_doc.id },
                order: [['created_date', 'desc']]
            })

            tran_doc.paymentInfo = paymentInfo

            return await printOutTemplate_stv(request, tran_doc)

        }


        var logo = `src/assets/shops/${shop_table.id}/${shop_table.id}.jpeg`


        var addr_replare = await replace_addr(shop_profile)


        let tel = ``
        if (_.hasIn(shop_profile, 'tel_no.tel_no_1') && shop_profile.tel_no.tel_no_1 != '') {
            tel = `\nโทร. ${shop_profile.tel_no.tel_no_1} ${(_.hasIn(shop_profile, 'tel_no.tel_no_2') ? ',' + shop_profile.tel_no.tel_no_2 : '')} ${(_.hasIn(shop_profile, 'tel_no.tel_no_3') ? ',' + shop_profile.tel_no.tel_no_3 : '')}`
        }

        let mobile = ``
        if (_.hasIn(shop_profile, 'mobile_no.mobile_no_1') && shop_profile.mobile_no.mobile_no_1 != '') {
            mobile = `\nเบอร์มือถือ  ${shop_profile.mobile_no.mobile_no_1} ${(_.hasIn(shop_profile, 'mobile_no.mobile_no_2') ? ',' + shop_profile.mobile_no.mobile_no_2 : '')} ${(_.hasIn(shop_profile, 'mobile_no.mobile_no_3') ? ',' + shop_profile.mobile_no.mobile_no_3 : '')}`
        }

        let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

        let long_addr = (shop_profile.address?.th) ? shop_profile.address.th + ' ' : ''
        long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
        long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
        long_addr = long_addr + province + ` `
        long_addr = long_addr + `${(shop_profile.SubDistrict) ? shop_profile.SubDistrict.zip_code : ' '}`

        let addr_split = long_addr.split(/[ \n]+/)


        let count_ = 0
        long_addr = ''
        for (let index = 0; index < addr_split.length; index++) {
            const element = addr_split[index];
            if (element.length + count_ <= 27) {
                long_addr = long_addr + element + ' '
                count_ = count_ + element.length
            } else {
                long_addr = long_addr + '\n' + element + ' '
                count_ = 0
            }

        }

        var addr = `${shop_profile.shop_name.th} `

        let branch_ = shop_profile.shop_config || {}
        if (shop_profile.shop_config.branch == 'office') {
            addr = addr + ` (สำนักงานใหญ่)`

        } else if (shop_profile.shop_config.branch == 'branch') {
            if (config_pdf.branch_code?.isuse == true) {
                addr = addr + ` (สาขา` + branch_.branch_code + `)`
            } else {
                addr = addr + ` (สาขา` + branch_.branch_name + `)`
            }
        }

        addr = addr + '\n'

        addr = addr + long_addr

        // copy front 
        //ไม่รวม vat// รวม vat
        if (['fafa3667-55d8-49d1-b06c-759c6e9ab064', '8c73e506-31b5-44c7-a21b-3819bb712321'].includes(tran_doc.tax_type_id)) {
            addr = addr + `\nเลขประจำตัวผู้เสียภาษี ${(shop_profile.tax_code_id) ? shop_profile.tax_code_id.split('(')[0] : ' - '} `
        } else {
            if (config_pdf.show_tax?.isuse == true) {
                addr = addr + `\nเลขประจำตัวผู้เสียภาษี ${(shop_profile.tax_code_id) ? shop_profile.tax_code_id.split('(')[0] : ' - '} `
            }
        }

        addr = addr + tel
        addr = addr + mobile
        addr = addr + `${(shop_profile.e_mail) ? `\n${shop_profile.e_mail}` : ''} `
        // addr = addr + '\n '

        var seller = {}
        var send = {}

        // "header_table_color": "#169EDC",
        //     "header_font_color": "black"

        if (tran_doc.price_use == 'true') {
            var header1 = []

            if (config_pdf.product_transfer_branch?.template?.value == 1 && tran_doc.doc_type_id == '53e7cbcc-3443-40e5-962f-d9512aba2b5a') {
                header1 = [
                    { "label": '#', "property": '#', "width": 40, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": ((config_pdf.import_stock?.dot_show?.value == true && tran_doc.which == 2) ? 210 : 240) - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" }

                ]
                if (config_pdf.import_stock?.dot_show?.value == true && tran_doc.which == 2) {
                    header1.push({ "label": 'DOT', "property": 'DOT', "width": 70, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" })
                }

                header1 = header1.concat([
                    { "label": 'จำนวน', "property": 'จำนวน', "width": (config_pdf.import_stock?.dot_show?.value == true && tran_doc.which == 2) ? 60 : 70, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'หน่วย', "property": 'หน่วย', "width": 85, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ราคารวม', "property": 'ราคารวม', "width": 85, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" }
                ])

            } else {

                header1 = [
                    { "label": '#', "property": '#', "width": 30, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": ((config_pdf.import_stock?.dot_show?.value == true && tran_doc.which == 2) ? 170 : 200) - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" }

                ]
                if (config_pdf.import_stock?.dot_show?.value == true && tran_doc.which == 2) {
                    header1.push({ "label": 'DOT', "property": 'DOT', "width": 40, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" })
                }

                header1 = header1.concat([
                    { "label": 'จำนวน', "property": 'จำนวน', "width": (config_pdf.import_stock?.dot_show?.value == true && tran_doc.which == 2) ? 40 : 50, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'หน่วย', "property": 'หน่วย', "width": 65, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 75, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right", "padding": 10 },
                    { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 65, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right", "padding": 10 },
                    { "label": 'ราคารวม', "property": 'ราคารวม', "width": 65, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" }
                ])

            }



            //ร้าน Supachai
            if ((config_pdf.delivery_doc?.dot_show?.value == true && tran_doc.which_step == 2) ||
                config_pdf.full_tax_invoice?.dot_show?.value == true && tran_doc.which_step == 3 ||
                config_pdf.repair_doc?.dot_show?.value == true && tran_doc.which_step == 1) {
                header1 = [
                    { "label": '#', "property": '#', "width": 20, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 160 - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                    { "label": 'คลังที่อยู่', "property": 'คลังที่อยู่', "width": 60, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'DOT', "property": 'DOT', "width": 40, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'จำนวน', "property": 'จำนวน', "width": 50, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'หน่วย', "property": 'หน่วย', "width": 50, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 60, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right", "padding": 10 },
                    { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 50, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right", "padding": 10 },
                    { "label": 'ราคารวม', "property": 'ราคารวม', "width": 60, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" }
                ]

            }

        } else {

            //ใบเบิก
            var header1 = [
                { "label": '#', "property": '#', "width": 30, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                // { "label": 'รหัสสินค้า', "property": 'รหัสสินค้า', "width": 70, "headerColor": "#169EDC", "headerOpacity": 1, "headerAlign": "center" },
                { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 200 - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                { "label": 'DOT/MFD', "property": 'DOT/MFD', "width": 70, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'จำนวน', "property": 'จำนวน', "width": 40, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'หน่วย', "property": 'หน่วย', "width": 65, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'คลังที่อยู่', "property": 'คลังที่อยู่', "width": 75, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                { "label": 'ชั้นวางสินค้า', "property": 'ชั้นวางสินค้า', "width": 70, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },

            ]


        }

        if (tran_doc.which == 1) {

            let bank = false

            if (config_pdf.bank_show?.isuse == true) {
                bank = true
            }

            let name = [request.query.foot_sign_left || 'ผู้จ่ายเงิน', request.query.foot_sign_right || 'ผู้รับเงิน']

            if (tran_doc.doc_type_id == repare_doc) {

                name = [request.query.foot_sign_left || 'ผู้แจ้งเงิน', request.query.foot_sign_right || 'ผู้รับซ่อม']
            }
            else if (tran_doc.doc_type_id == sale_doc) {

                name = [request.query.foot_sign_left || 'ผู้ซื้อ', request.query.foot_sign_right || 'ผู้ขาย']

            }

            if (tran_doc.price_use == 'false') {
                name = [request.query.foot_sign_left || 'ผู้อนุมัติเบิก', request.query.foot_sign_right || 'ผู้ขอเบิก']
            }

            if (tran_doc.doc_type_name.includes('กำกับภาษี')) {
                if (config_pdf.bank_show?.when_doc_type_name_include_keyword_1?.isuse == true) {
                    bank = true
                } else {
                    bank = false
                }
                name = [request.query.foot_sign_left || 'ผู้จ่ายเงิน', request.query.foot_sign_right || 'ผู้รับเงิน']
            }

            let product_all = []

            if (tran_doc.which_step == 1) {

                product_all = await ShopServiceOrderList(table_name).findAll({
                    where: { shop_service_order_doc_id: request.params.id, status: 1 },
                    include: [{
                        model: ShopProduct(table_name), as: 'ShopProduct', include: [
                            { model: Product }
                        ]
                    }],
                    order: [['seq_number', 'ASC']]
                })

            } else if (tran_doc.which_step == 2) {
                product_all = await ShopTemporaryDeliveryOrderList(table_name).findAll({
                    where: { shop_temporary_delivery_order_doc_id: request.params.id, status: 1 },
                    include: [{
                        model: ShopProduct(table_name), as: 'ShopProduct', include: [
                            { model: Product }
                        ]
                    }],
                    order: [['seq_number', 'ASC']]
                })
            } else if (tran_doc.which_step == 3) {
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

            // var data = [{ '#': '' }]
            var data = []

            for (let index = 0; index < product_all.length; index++) {
                const element = product_all[index];
                if (+(element.amount) <= 0 || !element.purchase_unit_id) { continue; }

                var unit = await ProductPurchaseUnitTypes.findOne({ where: { id: element.purchase_unit_id } })

                if (tran_doc.price_use == 'false' ||
                    config_pdf.delivery_doc?.warehouse_show?.value == true ||
                    config_pdf.full_tax_invoice?.warehouse_show?.value == true ||
                    config_pdf.repair_doc?.warehouse_show?.value == true) {
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

                // let product = product_all.filter(el => { return el.ShopProducts.id == element.product_id })

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

                    ... (tran_doc.price_use == 'false' || config_pdf.template?.value == 2 ||
                        config_pdf.delivery_doc?.warehouse_show?.value == true ||
                        config_pdf.full_tax_invoice?.warehouse_show?.value == true ||
                        config_pdf.repair_doc?.warehouse_show?.value == true) ? { 'คลังที่อยู่': warehouse_name } : {},
                    ... (tran_doc.price_use == 'false') ? { 'ชั้นวางสินค้า': shelf_name } : {},
                    ... (tran_doc.price_use == 'false') ? { 'DOT/MFD': (element.dot_mfd) ? element.dot_mfd : ' ' } : {},
                    ... (config_pdf.template?.value == 2) ? { 'DOT': (element.dot_mfd) ? element.dot_mfd.slice(-2) : ' ' } : {},
                    ... (config_pdf.delivery_doc?.dot_show?.value == true && tran_doc.which_step == 2) ? { 'DOT': (element.dot_mfd) ? element.dot_mfd : ' ' } : {},
                    ... (config_pdf.full_tax_invoice?.dot_show?.value == true && tran_doc.which_step == 3) ? { 'DOT': (element.dot_mfd) ? element.dot_mfd : ' ' } : {},
                    ... (config_pdf.repair_doc?.dot_show?.value == true && tran_doc.which_step == 1) ? { 'DOT': (element.dot_mfd) ? element.dot_mfd : ' ' } : {}

                })


            }



            if (tran_doc.price_use == 'true') {

                let customer = null
                if (tran_doc.ShopBusinessCustomer) {
                    customer = tran_doc.ShopBusinessCustomer
                } else {
                    customer = tran_doc.ShopPersonalCustomer
                    customer.tax_id = tran_doc.ShopPersonalCustomer.id_card_number
                }


                var addr_replare = await replace_addr(customer)


                addr1 = ``
                if (customer.customer_name.first_name) {
                    addr1 = `${customer.customer_name.first_name.th} ${customer.customer_name.last_name.th}`
                } else {
                    addr1 = `${customer.customer_name.th}`
                }
                // if (config_pdf.template?.value == 1) {

                let branch_ = customer.other_details || {}
                if (customer.other_details.branch == 'office') {
                    addr1 = addr1 + ` (สำนักงานใหญ่)`

                } else if (customer.other_details.branch == 'branch') {
                    if (config_pdf.branch_code?.isuse == true) {
                        addr1 = addr1 + ` (สาขา` + branch_.branch_code + `)`
                    } else {
                        addr1 = addr1 + ` (สาขา` + branch_.branch_name + `)`
                    }

                }
                // }
                addr1 = addr1 + ` \n`

                let tel = ``
                if (_.hasIn(customer, 'tel_no.tel_no_1') && customer.tel_no.tel_no_1 != '') {
                    tel = `\nโทร.${customer.tel_no.tel_no_1} ${(_.hasIn(customer, 'tel_no.tel_no_2') ? ',' + customer.tel_no.tel_no_2 : '')} ${(_.hasIn(customer, 'tel_no.tel_no_3') ? ',' + customer.tel_no.tel_no_3 : '')} `
                }

                let mobile = ``
                if (_.hasIn(customer, 'mobile_no.mobile_no_1') && customer.mobile_no.mobile_no_1 != '') {
                    mobile = `\nเบอร์มือถือ  ${customer.mobile_no.mobile_no_1} ${(_.hasIn(customer, 'mobile_no.mobile_no_2') ? ',' + customer.mobile_no.mobile_no_2 : '')} ${(_.hasIn(customer, 'mobile_no.mobile_no_3') ? ',' + customer.mobile_no.mobile_no_3 : '')} `
                }

                let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

                let long_addr = (customer.address?.th) ? customer.address.th + ' ' : ''
                long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
                long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
                long_addr = long_addr + province + ` `
                long_addr = long_addr + `${(customer.SubDistrict) ? customer.SubDistrict.zip_code : ' '}`



                if (config_pdf.template?.value == 1) {
                    addr_split = long_addr.split(/[ \n]+/)

                    count_ = 0
                    long_addr = ''
                    for (let index = 0; index < addr_split.length; index++) {
                        const element = addr_split[index];
                        if (element.length + count_ <= 60) {
                            long_addr = long_addr + element + ' '
                            count_ = count_ + element.length
                        } else {
                            long_addr = long_addr + '\n' + element + ' '
                            count_ = 0
                        }

                    }

                    addr1 = addr1 + long_addr

                    if (mobile.split('\n').length > 1) {
                        mobile = mobile.split('\n')[1]
                    } else {
                        mobile = ''
                    }

                    addr1 = addr1 + tel + ' ' + mobile


                } else {



                    addr_split = long_addr.split(/[ \n]+/)

                    count_ = 0
                    long_addr = ''
                    for (let index = 0; index < addr_split.length; index++) {
                        const element = addr_split[index];
                        if (element.length + count_ <= 27) {
                            long_addr = long_addr + element + ' '
                            count_ = count_ + element.length
                        } else {
                            long_addr = long_addr + '\n' + element + ' '
                            count_ = 0
                        }

                    }

                    addr1 = addr1 + long_addr

                    if (config_pdf.customer_tel?.isuse != false) {
                        addr1 = addr1 + tel
                    }

                    addr1 = addr1 + mobile

                }




                if (config_pdf.show_tax?.isuse == true) {

                    if (tran_doc.doc_type_name.includes('กำกับภาษี')) {
                        addr1 = addr1 + `\nเลขประจำตัวผู้เสียภาษี ${(customer.tax_id) ? customer.tax_id : ' - '} `
                    }
                }
                // addr1 = addr1 + `\n${ (customer.e_mail) ? customer.e_mail : '' } `

                if (tran_doc.which == 1 && tran_doc.ShopVehicleCustomer != null) {


                    /// config_pdf.vehicle_right
                    if (config_pdf.vehicle_right?.isuse == true) {

                        let vehicle = tran_doc.ShopVehicleCustomer
                        let brand = (_.isObject(vehicle.VehicleBrand) == true) ? vehicle.VehicleBrand.brand_name.th : `- `
                        let model = (_.isObject(vehicle.VehicleModelType) == true) ? vehicle.VehicleModelType.model_name.th : `- `
                        let mileage = (tran_doc.details.hasOwnProperty('current_mileage') && tran_doc.details.current_mileage != '') ? tran_doc.details.current_mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : `- `
                        let chassis_number = (vehicle.details.hasOwnProperty('chassis_number') && vehicle.details.chassis_number != '') ? vehicle.details.chassis_number : `- `
                        let registration = (vehicle.details.hasOwnProperty('registration') && vehicle.details.registration != '') ? vehicle.details.registration : `- `

                        if (config_pdf.template?.value == 1) {

                            let registration_ = registration + ` ${_.get(vehicle, 'details.province_name', '')} `
                            if (registration_.length > 10) {
                                registration_ = registration + `\n${_.get(vehicle, 'details.province_name', '')} `
                            }

                            send = {
                                registration: registration_,
                                mileage: mileage,
                                brand: brand,
                                model: model
                            }

                        } else {


                            let data = `ยี่ห้อ ` + brand + `\n`
                            data = data + `รุ่น ` + model + `\n`
                            data = data + `ทะเบียนรถ ` + registration + ` ${_.get(vehicle, 'details.province_name', '')} ` + `\n`
                            if (config_pdf.vehicle_right.chassis_number_show?.isuse != false) {
                                data = data + `เลขตัวถัง ` + chassis_number + `\n`
                            }

                            data = data + `เลขกิโลเมตรปัจจุบัน ` + mileage

                            if (config_pdf.vehicle_right.color?.isuse == true && vehicle.details.color) {
                                let color = vehicle.details.color
                                color = await VehicleColor.findOne({ id: color })

                                data = data + `\nสี ` + color.vehicle_color_name?.th
                            }
                            send = { title: 'ข้อมูลรถ', data: data }

                            if (send.data.split("\n").length > addr1.split("\n").length) {
                                let add_n = send.data.split("\n").length - addr1.split("\n").length

                                for (let index = 0; index < add_n; index++) {
                                    addr1 = addr1 + '\n'
                                }
                            }
                        }



                    } else {

                        let vehicle = tran_doc.ShopVehicleCustomer
                        addr1 = addr1 + `\nทะเบียนรถ ` + vehicle.details.registration + ` `
                        if (config_pdf.repair_doc?.mileage_show?.value == true && tran_doc.which_step == 1) {
                            let mileage = (tran_doc.details.hasOwnProperty('current_mileage') && tran_doc.details.current_mileage != '') ? tran_doc.details.current_mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : `- `
                            addr1 = addr1 + `\nเลขไมล์ ` + mileage + ` `
                        }
                    }

                }


                seller = { title: 'ข้อมูลลูกค้า', data: addr1 }

            }


            var header_right = addr

            let repair_man = tran_doc.details.hasOwnProperty('repair_man') ? tran_doc.details.repair_man : []

            if (repair_man.length > 0) {

                // let repair_all = await UsersProfiles.findAll({ where: { user_id: { [Op.in]: repair_man } } })
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


            var header_left = [
                { 'เลขที่เอกสาร': tran_doc.code_id },
                { 'วันที่เอกสาร': moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY") },
                // { 'เลขที่เอกสารอ้างอิง': tran_doc.details?.References_doc },
                // { 'ประเภทภาษี': await get_tax_name(tran_doc.tax_type_id) }
            ]

            let customer = null
            if (tran_doc.ShopBusinessCustomer) {
                customer = tran_doc.ShopBusinessCustomer
            } else {
                customer = tran_doc.ShopPersonalCustomer
                customer.tax_id = tran_doc.ShopPersonalCustomer.id_card_number
            }


            if ((config_pdf.template?.value == 2 && tran_doc.doc_sales_type === 2) ||
                (config_pdf.delivery_doc?.due_date_show?.value == true && tran_doc.which_step == 2) ||
                (config_pdf.full_tax_invoice?.due_date_show?.value == true && tran_doc.which_step == 3)
            ) {

                credit_term = customer?.other_details.credit_term || 0
                let doc_date_credit_term_ = new Date(tran_doc.doc_date)

                doc_date_credit_term = doc_date_credit_term_.setDate(doc_date_credit_term_.getDate() + parseInt(credit_term));
                doc_date_credit_term = moment(new Date(doc_date_credit_term)).format('DD/MM/YYYY')

                header_left.push({ 'วันครบกำหนด': doc_date_credit_term })

            }

            if (config_pdf.seller_show?.isuse != false) {
                if (config_pdf.all?.sales_man == true) {
                    let sales_man = await UsersProfiles.findAll({ where: { user_id: tran_doc.details?.sales_man } })
                    header_left.push({ 'พนักงานขาย': sales_man.map(el => { return el.fname.th + ' ' + el.lname.th }) })
                } else {
                    header_left.push({ 'พนักงานขาย': user_profile.fname.th + ' ' + user_profile.lname.th })
                }
            }
            // if (config_pdf.template?.value == 2) {

            //     let reg = ''
            //     if (customer.Province?.id) {
            //         reg = await MapRegProv.findOne({ where: { prov_id: customer.Province?.id } })

            //     }


            //     return reg
            //     header_left.push({ 'เขต': user_profile.fname.th + ' ' + user_profile.lname.th })
            // }
            if (config_pdf.repair_man_show?.isuse != false) {

                if (config_pdf.template?.value == 2 && tran_doc.doc_sales_type == 2) {

                } else {
                    header_left.push({ 'ช่างซ่อม': repair_man })
                }
            }

            if (config_pdf.repair_doc?.payment_show?.value == true && tran_doc.which_step == 1) {

                if (config_pdf.repair_doc?.created_by?.value == false) {

                } else {
                    let do_doc = await UsersProfiles.findOne({ where: { user_id: tran_doc.details?.user_id } })
                    header_left.push({ 'ผู้ทำเอกสาร': do_doc.fname.th + ' ' + do_doc.lname.th })
                }


                tran_doc.payment_show = true
                // if (tran_doc.doc_sales_type == 1) {
                let payment_method = ''
                if (tran_doc.paymentInfo) {
                    let payment_method_str = ['เงินสด', 'บัตรเครดิต', 'เงินโอน', 'เช็คเงินสด', 'ลูกหนี้การค้า']
                    payment_method = parseInt(tran_doc.paymentInfo.payment_method)
                    payment_method = payment_method_str[payment_method - 1]


                }
                tran_doc.payment_method = payment_method
                // }
            }

            const ws = {
                "headers": header1,
                "datas": data
            }

            price = [
                { 'รวมเป็นเงิน': tran_doc.price_sub_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' },
                { 'ส่วนลดรวม': tran_doc.price_discount_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' },
                { 'ราคาหลังหักส่วนลด': tran_doc.price_amount_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' },

            ]

            // copy front 
            if (tran_doc.tax_type_id == 'fafa3667-55d8-49d1-b06c-759c6e9ab064') {
                //ไม่รวม vat
                price.push({ 'ราคาก่อนรวมภาษี': (tran_doc.price_before_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            } else if (tran_doc.tax_type_id == '8c73e506-31b5-44c7-a21b-3819bb712321') {
                // รวม vat
                price.push({ 'ราคาก่อนรวมภาษี': (tran_doc.price_before_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            } else {
                // ไม่คิดภาษี
                if (config_pdf.show_tax?.isuse == true) {
                    price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                }
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            }


            if (config_pdf.template?.value == 2 && tran_doc.doc_sales_type == 2) {
                price = price.filter(el => Object.keys(el) != 'ส่วนลดรวม');
                price = price.filter(el => Object.keys(el) != 'ราคาก่อนรวมภาษี');
                price = price.filter(el => Object.keys(el) != 'ภาษีมูลค่าเพิ่ม 7%');

            }

            var note = tran_doc.details.remark

            var name2 = ''
            if (_.isObject(tran_doc.ShopPersonalCustomer)) {
                name2 = tran_doc.ShopPersonalCustomer.customer_name.first_name.th + ' ' + tran_doc.ShopPersonalCustomer.customer_name.last_name.th
            } else if (_.isObject(tran_doc.ShopBusinessCustomer)) {
                name2 = tran_doc.ShopBusinessCustomer.customer_name.th
            }


            var in_name = ['ในนาม ' + name2, 'ในนาม ' + shop_profile.shop_name.th]
            in_name = ['', '']

            let sign_date = [request.query.foot_date_left || 'วันที่', request.query.foot_date_right || 'วันที่']

            let use_sign_date = [false, false]
            if (tran_doc.doc_type_name.includes('ใบแจ้งหนี้')) {
                use_sign_date = [true, false]
            }


            if (shop_table.id === '1a523ad4-682e-4db2-af49-d54f176a84ad') {
                //สมไช
                in_name = ['', '']
                bank = false
                let tax_name = await get_tax_name(tran_doc.tax_type_id)
                header_left.push({ 'ประเภทภาษี': (tax_name === 'ไม่คิดภาษี') ? ' - ' : tax_name })
                name = [request.query.foot_sign_left || 'ผู้รับสินค้า', request.query.foot_sign_right || 'ผู้ส่งสินค้า']

            } else if (shop_table.id === 'bdc9345d-00c2-4ed8-8cf8-72258c1611cf') {
                // proconsult
                in_name = ['ในนาม ' + name2, 'ในนาม ' + shop_profile.shop_name.th]
                bank = true
                let tax_name = await get_tax_name(tran_doc.tax_type_id)
                header_left.push({ 'ประเภทภาษี': (tax_name === 'ไม่คิดภาษี') ? ' - ' : tax_name })
                name = [request.query.foot_sign_left || 'ผู้รับสินค้า', request.query.foot_sign_right || 'ผู้ส่งสินค้า']
            }

            if (config_pdf.use_sign_date) {
                use_sign_date = config_pdf.use_sign_date.map(el => { return el.isuse })
            }

            if (tran_doc.which_step == 1) {
                if (config_pdf.repair_doc?.foot1) {
                    name[0] = config_pdf.repair_doc?.foot1.value
                }
                if (config_pdf.repair_doc?.foot2) {
                    sign_date[0] = config_pdf.repair_doc?.foot2.value
                    use_sign_date[0] = true
                }
                if (config_pdf.repair_doc?.foot3) {
                    name[1] = config_pdf.repair_doc?.foot3.value
                }
                if (config_pdf.repair_doc?.foot4) {
                    sign_date[1] = config_pdf.repair_doc?.foot4.value
                    use_sign_date[1] = true
                }

            }

            if (tran_doc.which_step == 2) {
                if (config_pdf.delivery_doc?.foot1) {
                    name[0] = config_pdf.delivery_doc?.foot1.value
                }
                if (config_pdf.delivery_doc?.foot2) {
                    sign_date[0] = config_pdf.delivery_doc?.foot2.value
                }
                if (config_pdf.delivery_doc?.foot3) {
                    name[1] = config_pdf.delivery_doc?.foot3.value
                }
                if (config_pdf.delivery_doc?.foot4) {
                    sign_date[1] = config_pdf.delivery_doc?.foot4.value
                    use_sign_date[1] = true
                }

            }
            if (tran_doc.which_step == 3) {
                if (config_pdf.full_tax_invoice?.foot1) {
                    name[0] = config_pdf.full_tax_invoice?.foot1.value
                }
                if (config_pdf.full_tax_invoice?.foot2) {
                    sign_date[0] = config_pdf.full_tax_invoice?.foot2.value
                    use_sign_date[0] = true
                }
                if (config_pdf.full_tax_invoice?.foot3) {
                    name[1] = config_pdf.full_tax_invoice?.foot3.value
                }
                if (config_pdf.full_tax_invoice?.foot4) {
                    sign_date[1] = config_pdf.full_tax_invoice?.foot4.value
                    use_sign_date[1] = true
                }

            }


            return await pdfGen(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

        } else if (tran_doc.which == 2) {

            var data = await ShopInventory(table_name).findAll({
                where: { doc_inventory_id: tran_doc.id, status: { [Op.ne]: 0 } },
                include: [{
                    model: ShopProduct(table_name), include: [
                        { model: Product }
                    ]
                }]
            })
                .then(async el => {
                    var data = []
                    for (let index = 0; index < el.length; index++) {
                        let element = el[index];
                        if (element.warehouse_detail[0].other_details) {
                            let other_details = element.warehouse_detail[0].other_details
                            element.details = element.warehouse_detail[0].other_details
                            element.details.price = other_details.price_unit
                            element.details.discount_thb = other_details.price_discount
                        }

                        var unit = await ProductPurchaseUnitTypes.findOne({ where: { id: element.warehouse_detail[0].shelf.purchase_unit_id } })

                        var all_price = (parseFloat(element.details.price || 0) * parseInt(element.amount || 0)) - parseFloat(element.details.discount_thb || 0)
                        data.push({
                            '#': index + 1,
                            'รหัสสินค้า': element.ShopProduct.Product.master_path_code_id || '-',
                            'ชื่อสินค้า': element.ShopProduct.Product.product_name.th,
                            ... (config_pdf.import_stock?.dot_show?.value == true) ? { 'DOT': (element.warehouse_detail[0].shelf.dot_mfd) ? element.warehouse_detail[0].shelf.dot_mfd : ' ' } : {},
                            'จำนวน': parseInt(element.amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            'หน่วย': (unit) ? unit.type_name.th : '',
                            'ราคา/หน่วย': parseFloat(element.details.price || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            '_ราคา/หน่วย': (element.details.price || 0) * (element.amount || 0),
                            'ส่วนลด': (parseFloat(element.details.discount_thb || 0) * parseInt(element.amount || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            '_ส่วนลด': parseFloat(element.details.discount_thb || 0),
                            // 'สุทธิต่อหน่วย': parseFloat((element.details.price || 0) - (element.details.discount_thb || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            'ราคารวม': parseFloat(all_price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            'all_price': all_price,
                        })

                    }
                    return data
                })



            let partner = tran_doc.ShopBusinessPartners

            var addr_replare = await replace_addr(partner)

            let tel = ``
            if (_.hasIn(partner, 'tel_no.tel_no_1') && partner.tel_no.tel_no_1 != '') {
                tel = `\nโทร.${partner.tel_no.tel_no_1} ${(_.hasIn(partner, 'tel_no.tel_no_2') ? ',' + partner.tel_no.tel_no_2 : '')} ${(_.hasIn(partner, 'tel_no.tel_no_3') ? ',' + partner.tel_no.tel_no_3 : '')} `
            }

            let mobile = ``
            if (_.hasIn(partner, 'mobile_no.mobile_no_1') && partner.mobile_no.mobile_no_1 != '') {
                mobile = `\nเบอร์มือถือ ${partner.mobile_no.mobile_no_1} ${(_.hasIn(partner, 'mobile_no.mobile_no_2') ? ',' + partner.mobile_no.mobile_no_2 : '')} ${(_.hasIn(partner, 'mobile_no.mobile_no_3') ? ',' + partner.mobile_no.mobile_no_3 : '')} `
            }


            var addr1 = `${partner.partner_name.th} \n`

            let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

            let long_addr = (partner.address?.th) ? partner.address.th + ' ' : ''
            long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
            long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
            long_addr = long_addr + province + ` `
            long_addr = long_addr + `${(partner.SubDistrict) ? partner.SubDistrict.zip_code : ' '}`

            addr_split = long_addr.split(/[ \n]+/)

            count_ = 0
            long_addr = ''
            for (let index = 0; index < addr_split.length; index++) {
                const element = addr_split[index];
                if (element.length + count_ <= 27) {
                    long_addr = long_addr + element + ' '
                    count_ = count_ + element.length
                } else {
                    long_addr = long_addr + '\n' + element + ' '
                    count_ = 0
                }

            }

            addr1 = addr1 + long_addr
            addr1 = addr1 + `\nเลขประจำตัวผู้เสียภาษี ${(partner.tax_id) ? partner.tax_id : ' - '} `
            addr1 = addr1 + tel
            addr1 = addr1 + mobile
            addr1 = addr1 + `\n${(partner.e_mail) ? partner.e_mail : ''} `

            var header_right = addr
            var header_left = [
                { 'เลขที่เอกสาร': tran_doc.code_id },
                { 'วันที่เอกสาร': moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY") },
                { 'วันครบกำหนดชำระ': '' },
                { 'ผู้สั่งซื้อ': user_profile.fname.th + ' ' + user_profile.lname.th }
            ]

            if (config_pdf.product_transfer_branch?.template?.value == 1) {

            } else {
                header_left.push({ 'เลขที่ใบสั่งซื้อสินค้า': tran_doc.details?.purchase_order_number })
                header_left.push({ 'เลขที่เอกสารอ้างอิง': tran_doc.details?.References_doc })
            }


            seller = { title: (tran_doc.seller_title) ? tran_doc.seller_title : 'ผู้จัดจำหน่าย', data: addr1 }

            const ws = {
                "headers": header1,
                "datas": data
            }

            // copy front 
            price_after = null
            if (tran_doc.details.tax_type == 'fafa3667-55d8-49d1-b06c-759c6e9ab064') {
                price_after = 'ราคาหลังหักส่วนลด'
            } else if (tran_doc.details.tax_type == '8c73e506-31b5-44c7-a21b-3819bb712321') {
                price_after = 'ราคาหลังหักภาษี'
            }

            var price = [
                { 'รวมเป็นเงิน': (parseFloat(tran_doc.details.total_price_all) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' },
                { 'ส่วนลดรวม': (parseFloat(tran_doc.details.total_discount) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' },
            ]

            if (price_after) {
                var test = {}
                test[price_after] = parseFloat(tran_doc.details.total_price_all_after_discount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท'
                price.push(test)
            }

            if (!tran_doc.details.net_price) {
                tran_doc.details.net_price = tran_doc.details.price_grand_total
            }
            price.push({ 'ภาษีมูลค่าเพิ่ม 7%': parseFloat(tran_doc.details.vat).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
            price.push({ 'จำนวนเงินรวมทั้งสิ้น': parseFloat(tran_doc.details.net_price) })


            var note = tran_doc.details.note
            var name2 = ''
            if (_.isObject(partner)) {
                name2 = partner.partner_name.th
            }

            var in_name = ['ในนาม ' + name2, 'ในนาม ' + shop_profile.shop_name.th]


            var name = [request.query.foot_sign_left || 'ผู้ส่งสินค้า', request.query.foot_sign_right || 'ผู้รับสินค้า']

            let sign_date = [request.query.foot_date_left || 'วันที่', request.query.foot_date_right || 'วันที่']

            let bank = false
            let use_sign_date = [true, true]
            return await pdfGen(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

        }
        else if (tran_doc.which == 3) {

            let bank = false
            let name = [request.query.foot_sign_left || 'ผู้สั่งซื้อสินค้า', request.query.foot_sign_right || 'ผู้เสนอราคา']


            var data = await ShopQuotationList(table_name).findAll({
                where: { doc_quotation_id: request.params.id, status: 1 },
                include: [{
                    model: ShopProduct(table_name), as: 'ShopProduct', include: [
                        { model: Product }
                    ]
                }],
                separate: true,
                order: [['seq_number', 'ASC']]
            })
                .then(async el => {
                    var data = []
                    for (let index = 0; index < el.length; index++) {
                        const element = el[index];
                        if (+(element.amount) <= 0) { continue; }

                        var unit = await ProductPurchaseUnitTypes.findOne({ where: { id: element.purchase_unit_id } })

                        // var all_price = (parseFloat(element.price_unit || 0) * parseInt(element.amount || 0)) - parseFloat(element.details.discount || 0)

                        var all_price = (element.price_grand_total != null) ? element.price_grand_total : 0

                        let discount = (element.price_discount != null) ? element.price_discount : 0

                        data.push({
                            ...{
                                '#': index + 1,
                                'ชื่อสินค้า': (element.details.changed_name_status == true) ? element.details.changed_product_name : element.ShopProduct.Product.product_name.th,
                                'จำนวน': parseInt(element.amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                                'หน่วย': (unit) ? unit.type_name.th : ''
                            },
                            ... (tran_doc.price_use == 'true') ? { 'ราคา/หน่วย': parseFloat(element.price_unit || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                            ... (tran_doc.price_use == 'true') ? { '_ราคา/หน่วย': (element.price_unit || 0) * (element.amount || 0) } : {},
                            ... (tran_doc.price_use == 'true') ? { 'ส่วนลด': (parseFloat(discount || 0) * parseInt(element.amount || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                            ... (tran_doc.price_use == 'true') ? { '_ส่วนลด': parseFloat(discount || 0) } : {},
                            ... (tran_doc.price_use == 'true') ? { 'ราคารวม': parseFloat(all_price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } : {},
                            ... (tran_doc.price_use == 'true') ? { 'all_price': all_price } : {},

                        })

                    }
                    return data
                })

            let customer = null
            if (tran_doc.ShopBusinessCustomer) {
                customer = tran_doc.ShopBusinessCustomer
            } else {
                customer = tran_doc.ShopPersonalCustomer
                customer.tax_id = tran_doc.ShopPersonalCustomer.id_card_number
            }


            if (tran_doc.price_use == 'true') {



                if (!customer) {
                    return ({ status: 'failed', data: 'customer not found' })
                }

                var addr_replare = await replace_addr(customer)

                addr1 = ``
                if (customer.customer_name.first_name) {
                    addr1 = `${customer.customer_name.first_name.th} ${customer.customer_name.last_name.th} \n`
                } else {
                    addr1 = `${customer.customer_name.th} \n`
                }

                let tel = ``
                if (_.hasIn(customer, 'tel_no.tel_no_1') && customer.tel_no.tel_no_1 != '') {
                    tel = `\nโทร.${customer.tel_no.tel_no_1} ${(_.hasIn(customer, 'tel_no.tel_no_2') ? ',' + customer.tel_no.tel_no_2 : '')} ${(_.hasIn(customer, 'tel_no.tel_no_3') ? ',' + customer.tel_no.tel_no_3 : '')} `
                }

                let mobile = ``
                if (_.hasIn(customer, 'mobile_no.mobile_no_1') && customer.mobile_no.mobile_no_1 != '') {
                    mobile = `\nเบอร์มือถือ  ${customer.mobile_no.mobile_no_1} ${(_.hasIn(customer, 'mobile_no.mobile_no_2') ? ',' + customer.mobile_no.mobile_no_2 : '')} ${(_.hasIn(customer, 'mobile_no.mobile_no_3') ? ',' + customer.mobile_no.mobile_no_3 : '')} `
                }

                let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

                let long_addr = (customer.address?.th) ? customer.address.th + ' ' : ''
                long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
                long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
                long_addr = long_addr + province + ` `
                long_addr = long_addr + `${(customer.SubDistrict) ? customer.SubDistrict.zip_code : ' '}`

                addr_split = long_addr.split(/[ \n]+/)

                count_ = 0
                long_addr = ''
                for (let index = 0; index < addr_split.length; index++) {
                    const element = addr_split[index];
                    if (element.length + count_ <= 27) {
                        long_addr = long_addr + element + ' '
                        count_ = count_ + element.length
                    } else {
                        long_addr = long_addr + '\n' + element + ' '
                        count_ = 0
                    }

                }

                addr1 = addr1 + long_addr
                addr1 = addr1 + tel
                addr1 = addr1 + mobile

                // addr1 = addr1 + `\nเลขประจำตัวผู้เสียภาษี ${ (customer.tax_id) ? customer.tax_id : ' - ' } `
                // addr1 = addr1 + `\n${ (customer.e_mail) ? customer.e_mail : '' } `


                seller = { title: 'ข้อมูลลูกค้า', data: addr1 }


                if (tran_doc.ShopVehicleCustomer) {
                    let vehicle = tran_doc.ShopVehicleCustomer
                    let brand = (_.isObject(vehicle.VehicleBrand) == true) ? vehicle.VehicleBrand.brand_name.th : `- `
                    let model = (_.isObject(vehicle.VehicleModelType) == true) ? vehicle.VehicleModelType.model_name.th : `- `
                    let mileage = (vehicle.details.hasOwnProperty('current_mileage') && vehicle.details.current_mileage != '') ? vehicle.details.current_mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : `- `
                    let chassis_number = (vehicle.details.hasOwnProperty('chassis_number') && vehicle.details.chassis_number != '') ? vehicle.details.chassis_number : `- `
                    let registration = (vehicle.details.hasOwnProperty('registration') && vehicle.details.registration != '') ? vehicle.details.registration : `- `

                    let data = `ยี่ห้อ ` + brand + `\n`
                    data = data + `รุ่น ` + model + `\n`
                    data = data + `ทะเบียนรถ ` + registration + `\n`
                    data = data + `เลขตัวถัง ` + chassis_number + `\n`
                    data = data + `เลขกิโลเมตรปัจจุบัน ` + mileage + `\n`

                    send = { title: 'ข้อมูลรถ', data: data }

                    if (send.data.split("\n").length > seller.data.split("\n").length) {
                        let add_n = send.data.split("\n").length - seller.data.split("\n").length

                        for (let index = 0; index < add_n; index++) {
                            seller.data = seller.data + '\n'
                        }
                    }
                }





            }



            var header_right = addr


            var header_left = [
                { 'เลขที่เอกสาร': tran_doc.code_id },
                { 'วันที่เอกสาร': moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY") },
                // { 'เลขที่เอกสารอ้างอิง': tran_doc.details?.References_doc },
                // { 'ประเภทภาษี': await get_tax_name(tran_doc.tax_type_id) }
            ]

            if (config_pdf.seller_show?.isuse != false) {
                if (config_pdf.all?.sales_man == true) {
                    let sales_man = await UsersProfiles.findAll({ where: { user_id: tran_doc.details?.sales_man } })
                    header_left.push({ 'พนักงานขาย': sales_man.map(el => { return el.fname.th + ' ' + el.lname.th }) })
                } else {
                    header_left.push({ 'พนักงานขาย': user_profile.fname.th + ' ' + user_profile.lname.th })
                }
            }

            header_left.push({ 'ยืนราคาภายใน': (tran_doc.details.effective_days) ? tran_doc.details.effective_days + ' วัน' : ' -' })

            if (config_pdf.quotation_doc?.due_date_amount_show?.value == true) {
                credit_term = customer?.other_details.credit_term || 0
                header_left.push({ 'เงื่อนไขการชำระ': credit_term + ' วัน' })
            }

            const ws = {
                "headers": header1,
                "datas": data
            }

            price = [
                { 'รวมเป็นเงิน': tran_doc.price_sub_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' },
                { 'ส่วนลดรวม': tran_doc.price_discount_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' },
                { 'ราคาหลังหักส่วนลด': tran_doc.price_amount_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' },

            ]

            // copy front 
            if (tran_doc.tax_type_id == 'fafa3667-55d8-49d1-b06c-759c6e9ab064') {
                //ไม่รวม vat
                // price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (tran_doc.price_vat || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (parseFloat(tran_doc.price_vat) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (parseFloat(tran_doc.price_grand_total) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            } else if (tran_doc.tax_type_id == '8c73e506-31b5-44c7-a21b-3819bb712321') {
                // รวม vat
                price.push({ 'ราคาก่อนรวมภาษี': (parseFloat(tran_doc.price_before_vat) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (parseFloat(tran_doc.price_vat) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (parseFloat(tran_doc.price_grand_total) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            } else {
                // ไม่คิดภาษี
                if (config_pdf.show_tax?.isuse == true) {
                    price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (parseFloat(tran_doc.price_vat) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                }
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (parseFloat(tran_doc.price_grand_total) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            }


            var note = tran_doc.details.remark


            var in_name = ['', '']

            let sign_date = [request.query.foot_date_left || 'วันที่', request.query.foot_date_right || 'วันที่']

            let use_sign_date = [true, true]
            if (config_pdf.quotation_doc?.foot1) {
                name[0] = config_pdf.quotation_doc?.foot1.value
            }
            if (config_pdf.quotation_doc?.foot2) {
                sign_date[0] = config_pdf.quotation_doc?.foot2.value
                use_sign_date[0] = true
            }
            if (config_pdf.quotation_doc?.foot3) {
                name[1] = config_pdf.quotation_doc?.foot3.value
            }
            if (config_pdf.quotation_doc?.foot4) {
                sign_date[1] = config_pdf.quotation_doc?.foot4.value
                use_sign_date[1] = true
            }




            return await pdfGen(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

        }
        else if (tran_doc.which == 4) {

            let bank = false
            let name = [request.query.foot_sign_left || 'ผู้รับวางบิล', request.query.foot_sign_right || 'ผู้วางบิล']


            var data = await ShopCustomerDebtList(table_name).findAll({
                where: { shop_customer_debt_doc_id: request.params.id, status: 1 },
                include: [
                    {
                        model: ShopTemporaryDeliveryOrderDoc(table_name), as: 'ShopTemporaryDeliveryOrderDoc'
                    },
                    {
                        model: ShopTaxInvoiceDoc(table_name), as: 'ShopTaxInvoiceDoc'
                    },
                    {
                        model: ShopCustomerDebtCreditNoteDoc_, as: "ShopCustomerDebtCreditNoteDoc"
                    },
                    {
                        model: ShopCustomerDebtDebitNoteDoc_, as: "ShopCustomerDebtDebitNoteDoc"
                    }
                ],
                separate: true,
                order: [['seq_number', 'ASC']]
            })
                .then(async el => {
                    var data = []
                    for (let index = 0; index < el.length; index++) {
                        const element = el[index];
                        let list_name = ''
                        let price_grand_total = ''
                        price_grand_total = element.price_grand_total

                        if (element.ShopTaxInvoiceDoc) {
                            list_name = element.ShopTaxInvoiceDoc.inv_code_id
                        } else {
                            if (element.ShopTemporaryDeliveryOrderDoc) {
                                list_name = element.ShopTemporaryDeliveryOrderDoc.code_id
                            } else {
                                if (element.ShopCustomerDebtCreditNoteDoc) {
                                    list_name = element.ShopCustomerDebtCreditNoteDoc.code_id
                                    if (price_grand_total > 0) {
                                        price_grand_total = price_grand_total * -1
                                    }
                                } else {
                                    list_name = element.ShopCustomerDebtDebitNoteDoc.code_id

                                }
                            }

                        }

                        price_grand_total = price_grand_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        data.push({
                            ...{
                                '#': index + 1,
                                'ชื่อรายการ': list_name,
                                'วันที่เอกสาร': moment(new Date(element.doc_date)).format("DD/MM/YYYY"),
                                'จำนวน': 1,
                                'จำนวนเงิน': price_grand_total
                            }

                        })

                    }
                    return data
                })





            let customer = null
            if (tran_doc.ShopBusinessCustomer) {
                customer = tran_doc.ShopBusinessCustomer
            } else {
                customer = tran_doc.ShopPersonalCustomer
                customer.tax_id = tran_doc.ShopPersonalCustomer.id_card_number
            }


            if (!customer) {
                return ({ status: 'failed', data: 'customer not found' })
            }

            var addr_replare = await replace_addr(customer)

            addr1 = ``
            if (customer.customer_name.first_name) {
                addr1 = `${customer.customer_name.first_name.th} ${customer.customer_name.last_name.th} \n`
            } else {
                addr1 = `${customer.customer_name.th} \n`
            }

            let tel = ``
            if (_.hasIn(customer, 'tel_no.tel_no_1') && customer.tel_no.tel_no_1 != '') {
                tel = `\nโทร.${customer.tel_no.tel_no_1} ${(_.hasIn(customer, 'tel_no.tel_no_2') ? ',' + customer.tel_no.tel_no_2 : '')} ${(_.hasIn(customer, 'tel_no.tel_no_3') ? ',' + customer.tel_no.tel_no_3 : '')} `
            }

            let mobile = ``
            if (_.hasIn(customer, 'mobile_no.mobile_no_1') && customer.mobile_no.mobile_no_1 != '') {
                mobile = `\nเบอร์มือถือ  ${customer.mobile_no.mobile_no_1} ${(_.hasIn(customer, 'mobile_no.mobile_no_2') ? ',' + customer.mobile_no.mobile_no_2 : '')} ${(_.hasIn(customer, 'mobile_no.mobile_no_3') ? ',' + customer.mobile_no.mobile_no_3 : '')} `
            }


            let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

            let long_addr = (customer.address?.th) ? customer.address.th + ' ' : ''
            long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
            long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
            long_addr = long_addr + province + ` `
            long_addr = long_addr + `${(customer.SubDistrict) ? customer.SubDistrict.zip_code : ' '}`

            addr_split = long_addr.split(/[ \n]+/)

            count_ = 0
            long_addr = ''
            for (let index = 0; index < addr_split.length; index++) {
                const element = addr_split[index];
                if (element.length + count_ <= 27) {
                    long_addr = long_addr + element + ' '
                    count_ = count_ + element.length
                } else {
                    long_addr = long_addr + '\n' + element + ' '
                    count_ = 0
                }

            }

            addr1 = addr1 + long_addr
            addr1 = addr1 + tel
            addr1 = addr1 + mobile


            seller = { title: 'ข้อมูลลูกค้า', data: addr1 }




            var header_right = addr


            var header_left = [
                { 'เลขที่เอกสาร': tran_doc.code_id },
                { 'วันที่เอกสาร': moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY") },
                // { 'เลขที่เอกสารอ้างอิง': tran_doc.details?.References_doc },
                // { 'ประเภทภาษี': await get_tax_name(tran_doc.tax_type_id) }
            ]

            if (config_pdf.seller_show?.isuse != false) {
                if (config_pdf.all?.sales_man == true) {
                    let sales_man = await UsersProfiles.findAll({ where: { user_id: tran_doc.details?.sales_man } })
                    header_left.push({ 'พนักงานขาย': sales_man.map(el => { return el.fname.th + ' ' + el.lname.th }) })
                } else {
                    header_left.push({ 'พนักงานขาย': user_profile.fname.th + ' ' + user_profile.lname.th })
                }
            }
            header_left.push({ 'เครดิต': (customer.other_details.credit_term) ? customer.other_details.credit_term + ' วัน' : ' -' })

            header_left.push({ 'กำหนดชำระภายใน': (tran_doc.debt_due_date) ? moment(new Date(tran_doc.debt_due_date)).format("DD/MM/YYYY") : ' -' })

            const ws = {
                "headers": [
                    { "label": '#', "property": '#', "width": 60, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ชื่อรายการ', "property": 'ชื่อรายการ', "width": 200 - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                    { "label": 'วันที่เอกสาร', "property": 'วันที่เอกสาร', "width": 110, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'จำนวน', "property": 'จำนวน', "width": 80, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" },
                    { "label": 'จำนวนเงิน', "property": 'จำนวนเงิน', "width": 100, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" },
                ],
                "datas": data
            }

            price = []
            price.push({ 'จำนวนเงินรวมทั้งสิ้น': (parseFloat(tran_doc.debt_price_paid_total) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") })


            var note = tran_doc.details.remark


            var name2 = ''
            if (_.isObject(tran_doc.ShopPersonalCustomer)) {
                name2 = tran_doc.ShopPersonalCustomer.customer_name.first_name.th + ' ' + tran_doc.ShopPersonalCustomer.customer_name.last_name.th
            } else if (_.isObject(tran_doc.ShopBusinessCustomer)) {
                name2 = tran_doc.ShopBusinessCustomer.customer_name.th
            }


            var in_name = ['ในนาม ' + name2, 'ในนาม ' + shop_profile.shop_name.th]

            let sign_date = [request.query.foot_date_left || 'วันที่', request.query.foot_date_right || 'วันที่']

            let use_sign_date = [true, true]


            return await pdfGen(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

        }
        else if (tran_doc.which == 5) {

            let bank = false
            let name = [request.query.foot_sign_left || 'ผู้รับวางบิล', request.query.foot_sign_right || 'ผู้วางบิล']

            var data = await ShopCustomerDebtBillingNoteList(table_name).findAll({
                where: { shop_customer_debt_bn_doc_id: request.params.id, status: 1 },
                include: [
                    {
                        model: ShopTemporaryDeliveryOrderDoc(table_name), as: 'ShopTemporaryDeliveryOrderDoc'
                    }, {
                        model: ShopTaxInvoiceDoc(table_name), as: 'ShopTaxInvoiceDoc'
                    },
                    {
                        model: ShopCustomerDebtCreditNoteDoc_, as: "ShopCustomerDebtCreditNoteDoc"
                    },
                    {
                        model: ShopCustomerDebtDebitNoteDoc_, as: "ShopCustomerDebtDebitNoteDoc"
                    }
                ],
                separate: true,
                order: [['seq_number', 'ASC']]
            })
                .then(async el => {
                    var data = []
                    for (let index = 0; index < el.length; index++) {
                        const element = el[index];

                        let list_name = ''
                        let price_grand_total = ''
                        price_grand_total = element.price_grand_total

                        if (element.ShopTaxInvoiceDoc) {
                            list_name = element.ShopTaxInvoiceDoc.inv_code_id
                        } else {
                            if (element.ShopTemporaryDeliveryOrderDoc) {
                                list_name = element.ShopTemporaryDeliveryOrderDoc.code_id
                            } else {
                                if (element.ShopCustomerDebtCreditNoteDoc) {
                                    list_name = element.ShopCustomerDebtCreditNoteDoc.code_id
                                    price_grand_total = price_grand_total * -1
                                } else {
                                    list_name = element.ShopCustomerDebtDebitNoteDoc.code_id
                                }
                            }

                        }

                        price_grand_total = price_grand_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        data.push({
                            ...{
                                '#': index + 1,
                                'ชื่อรายการ': list_name,
                                'วันที่เอกสาร': moment(new Date(element.doc_date)).format("DD/MM/YYYY"),
                                'จำนวน': 1,
                                'จำนวนเงิน': price_grand_total
                            }

                        })

                    }
                    return data
                })



            let customer = null
            if (tran_doc.ShopBusinessCustomer) {
                customer = tran_doc.ShopBusinessCustomer
            } else {
                customer = tran_doc.ShopPersonalCustomer
                customer.tax_id = tran_doc.ShopPersonalCustomer.id_card_number
            }


            if (!customer) {
                return ({ status: 'failed', data: 'customer not found' })
            }

            var addr_replare = await replace_addr(customer)

            addr1 = ``
            if (customer.customer_name.first_name) {
                addr1 = `${customer.customer_name.first_name.th} ${customer.customer_name.last_name.th} \n`
            } else {
                addr1 = `${customer.customer_name.th} \n`
            }

            let tel = ``
            if (_.hasIn(customer, 'tel_no.tel_no_1') && customer.tel_no.tel_no_1 != '') {
                tel = `\nโทร.${customer.tel_no.tel_no_1} ${(_.hasIn(customer, 'tel_no.tel_no_2') ? ',' + customer.tel_no.tel_no_2 : '')} ${(_.hasIn(customer, 'tel_no.tel_no_3') ? ',' + customer.tel_no.tel_no_3 : '')} `
            }

            let mobile = ``
            if (_.hasIn(customer, 'mobile_no.mobile_no_1') && customer.mobile_no.mobile_no_1 != '') {
                mobile = `\nเบอร์มือถือ  ${customer.mobile_no.mobile_no_1} ${(_.hasIn(customer, 'mobile_no.mobile_no_2') ? ',' + customer.mobile_no.mobile_no_2 : '')} ${(_.hasIn(customer, 'mobile_no.mobile_no_3') ? ',' + customer.mobile_no.mobile_no_3 : '')} `
            }


            let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

            let long_addr = (customer.address?.th) ? customer.address.th + ' ' : ''
            long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
            long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
            long_addr = long_addr + province + ` `
            long_addr = long_addr + `${(customer.SubDistrict) ? customer.SubDistrict.zip_code : ' '}`

            addr_split = long_addr.split(/[ \n]+/)

            count_ = 0
            long_addr = ''
            for (let index = 0; index < addr_split.length; index++) {
                const element = addr_split[index];
                if (element.length + count_ <= 27) {
                    long_addr = long_addr + element + ' '
                    count_ = count_ + element.length
                } else {
                    long_addr = long_addr + '\n' + element + ' '
                    count_ = 0
                }

            }

            addr1 = addr1 + long_addr
            addr1 = addr1 + tel
            addr1 = addr1 + mobile


            seller = { title: 'ข้อมูลลูกค้า', data: addr1 }




            var header_right = addr


            var header_left = [
                { 'เลขที่เอกสาร': tran_doc.code_id },
                { 'วันที่เอกสาร': moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY") },
                // { 'เลขที่เอกสารอ้างอิง': tran_doc.details?.References_doc },
                // { 'ประเภทภาษี': await get_tax_name(tran_doc.tax_type_id) }
            ]

            if (config_pdf.seller_show?.isuse != false) {
                if (config_pdf.all?.sales_man == true) {
                    let sales_man = await UsersProfiles.findAll({ where: { user_id: tran_doc.details?.sales_man } })
                    header_left.push({ 'พนักงานขาย': sales_man.map(el => { return el.fname.th + ' ' + el.lname.th }) })
                } else {
                    header_left.push({ 'พนักงานขาย': user_profile.fname.th + ' ' + user_profile.lname.th })
                }
            }
            header_left.push({ 'เครดิต': (customer.other_details.credit_term) ? customer.other_details.credit_term + ' วัน' : ' -' })

            header_left.push({ 'กำหนดชำระภายใน': (tran_doc.debt_due_date) ? moment(new Date(tran_doc.debt_due_date)).format("DD/MM/YYYY") : ' -' })

            const ws = {
                "headers": [
                    { "label": '#', "property": '#', "width": 60, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ชื่อรายการ', "property": 'ชื่อรายการ', "width": 200 - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                    { "label": 'วันที่เอกสาร', "property": 'วันที่เอกสาร', "width": 110, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'จำนวน', "property": 'จำนวน', "width": 80, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" },
                    { "label": 'จำนวนเงิน', "property": 'จำนวนเงิน', "width": 100, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" },
                ],
                "datas": data
            }

            price = []
            price.push({ 'จำนวนเงินรวมทั้งสิ้น': (parseFloat(tran_doc.debt_price_paid_total) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") })


            var note = tran_doc.details.remark


            var name2 = ''
            if (_.isObject(tran_doc.ShopPersonalCustomer)) {
                name2 = tran_doc.ShopPersonalCustomer.customer_name.first_name.th + ' ' + tran_doc.ShopPersonalCustomer.customer_name.last_name.th
            } else if (_.isObject(tran_doc.ShopBusinessCustomer)) {
                name2 = tran_doc.ShopBusinessCustomer.customer_name.th
            }


            var in_name = ['ในนาม ' + name2, 'ในนาม ' + shop_profile.shop_name.th]

            let sign_date = [request.query.foot_date_left || 'วันที่', request.query.foot_date_right || 'วันที่']

            let use_sign_date = [true, true]


            return await pdfGen(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

        }
        else if (tran_doc.which == 6 || tran_doc.which == 7) {

            let data_list = []
            if (tran_doc.which == 6) {
                data_list = await ShopCustomerDebtCreditNoteList(table_name).findAll({
                    where: { shop_customer_debt_cn_doc_id: request.params.id, status: 1 },
                    include: [{
                        model: ShopTemporaryDeliveryOrderDoc(table_name), as: 'ShopTemporaryDeliveryOrderDoc',
                    },
                    { model: ShopProduct(table_name), as: 'ShopProduct', include: [{ model: Product }] }],
                    separate: true,
                    order: [['seq_number', 'ASC']]
                })

            } else {
                data_list = await ShopCustomerDebtDebitNoteList(table_name).findAll({
                    where: { shop_customer_debt_dn_doc_id: request.params.id, status: 1 },
                    include: [{
                        model: ShopTemporaryDeliveryOrderDoc(table_name), as: 'ShopTemporaryDeliveryOrderDoc',
                    },
                    { model: ShopProduct(table_name), as: 'ShopProduct', include: [{ model: Product }] }],
                    separate: true,
                    order: [['seq_number', 'ASC']]
                })
            }

            let data = []

            for (let index = 0; index < data_list.length; index++) {

                const element = data_list[index];

                let product = element.ShopProduct
                let unit = null

                if (product) {

                    product = product.Product
                    if (product.other_details?.purchase_unit) {
                        unit = await ProductPurchaseUnitTypes.findOne({ where: { id: product.other_details.purchase_unit } })
                    }


                } else {

                    product = {}
                    product.master_path_code_id = element.list_id
                    product.product_name = { th: element.list_name }
                    unit = { type_name: { th: 'รายการ' } }

                }

                let all_price = (element.price_grand_total != null) ? element.price_grand_total : null

                let discount = (element.price_discount != null) ? element.price_discount : 0

                data.push({
                    ...{
                        '#': index + 1,
                        'รหัสสินค้า': product.master_path_code_id || '-',
                        'ชื่อสินค้า': (element.details.change_name_status == true) ? element.details.changed_name : product.product_name.th,
                        'จำนวน': parseInt(element.amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        'หน่วย': (unit) ? unit.type_name.th : '',
                        'ราคา/หน่วย': parseFloat(element.price_unit || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        '_ราคา/หน่วย': (element.price_unit || 0) * (element.amount || 0),
                        'ส่วนลด': (parseFloat(discount || 0) * parseInt(element.amount || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        '_ส่วนลด': parseFloat(discount || 0),
                        'ราคารวม': parseFloat(all_price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        'all_price': all_price
                    },



                })



            }




            let customer = null
            if (tran_doc.ShopBusinessCustomer) {
                customer = tran_doc.ShopBusinessCustomer
            } else {
                customer = tran_doc.ShopPersonalCustomer
                customer.tax_id = tran_doc.ShopPersonalCustomer.id_card_number
            }



            var addr_replare = await replace_addr(customer)


            addr1 = ``
            if (customer.customer_name.first_name) {
                addr1 = `${customer.customer_name.first_name.th} ${customer.customer_name.last_name.th}`
            } else {
                addr1 = `${customer.customer_name.th}`
            }

            let branch_ = customer.other_details || {}
            if (customer.other_details.branch == 'office') {
                addr1 = addr1 + ` (สำนักงานใหญ่)`

            } else if (customer.other_details.branch == 'branch') {
                if (config_pdf.branch_code?.isuse == true) {
                    addr1 = addr1 + ` (สาขา` + branch_.branch_code + `)`
                } else {
                    addr1 = addr1 + ` (สาขา` + branch_.branch_name + `)`
                }

            }
            addr1 = addr1 + ` \n`

            let tel = ``
            if (_.hasIn(customer, 'tel_no.tel_no_1') && customer.tel_no.tel_no_1 != '') {
                tel = `\nโทร.${customer.tel_no.tel_no_1} ${(_.hasIn(customer, 'tel_no.tel_no_2') ? ',' + customer.tel_no.tel_no_2 : '')} ${(_.hasIn(customer, 'tel_no.tel_no_3') ? ',' + customer.tel_no.tel_no_3 : '')} `
            }

            let mobile = ``
            if (_.hasIn(customer, 'mobile_no.mobile_no_1') && customer.mobile_no.mobile_no_1 != '') {
                mobile = `\nเบอร์มือถือ  ${customer.mobile_no.mobile_no_1} ${(_.hasIn(customer, 'mobile_no.mobile_no_2') ? ',' + customer.mobile_no.mobile_no_2 : '')} ${(_.hasIn(customer, 'mobile_no.mobile_no_3') ? ',' + customer.mobile_no.mobile_no_3 : '')} `
            }

            let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

            let long_addr = (customer.address?.th) ? customer.address.th + ' ' : ''
            long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
            long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
            long_addr = long_addr + province + ` `
            long_addr = long_addr + `${(customer.SubDistrict) ? customer.SubDistrict.zip_code : ' '}`



            addr_split = long_addr.split(/[ \n]+/)

            count_ = 0
            long_addr = ''
            for (let index = 0; index < addr_split.length; index++) {
                const element = addr_split[index];
                if (element.length + count_ <= 27) {
                    long_addr = long_addr + element + ' '
                    count_ = count_ + element.length
                } else {
                    long_addr = long_addr + '\n' + element + ' '
                    count_ = 0
                }

            }

            addr1 = addr1 + long_addr
            addr1 = addr1 + tel
            addr1 = addr1 + mobile

            addr1 = addr1 + `\nเลขประจำตัวผู้เสียภาษี ${(customer.tax_id) ? customer.tax_id : ' - '} `


            seller = { title: 'ข้อมูลลูกค้า', data: addr1 }

            let header_right = addr
            let repair_man = ''


            var header_left = [
                { 'เลขที่เอกสาร': tran_doc.code_id },
            ]
            if (tran_doc.ShopTemporaryDeliveryOrderDoc) {


                if (tran_doc.ShopTemporaryDeliveryOrderDoc.ShopServiceOrderDoc?.ShopTaxInvoiceDocs?.length > 0) {
                    header_left.push({ 'เลขที่เอกสารอ้างอิง': tran_doc.ShopTemporaryDeliveryOrderDoc.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0].inv_code_id })

                } else {
                    header_left.push({ 'เลขที่เอกสารอ้างอิง': tran_doc.ShopTemporaryDeliveryOrderDoc.code_id })
                }

                repair_man = tran_doc.ShopTemporaryDeliveryOrderDoc.details.hasOwnProperty('repair_man') ? tran_doc.ShopTemporaryDeliveryOrderDoc.details.repair_man : []

                if (repair_man.length > 0) {
                    let repair_all = await UsersProfiles.findAll({ where: { user_id: { [Op.in]: [repair_man[0]] } } })
                    repair_man = ''
                    for (let index = 0; index < repair_all.length; index++) {
                        const element = repair_all[index];

                        if (index == 0) {
                            repair_man = element.fname.th + ' ' + element.lname.th
                        }
                    }
                }


            }

            header_left.push({ 'วันที่เอกสาร': moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY") })
            if (config_pdf.all?.sales_man == true) {
                let sales_man = await UsersProfiles.findAll({ where: { user_id: tran_doc.details?.sales_man } })
                header_left.push({ 'พนักงานขาย': sales_man.map(el => { return el.fname.th + ' ' + el.lname.th }) })
            } else {
                header_left.push({ 'พนักงานขาย': user_profile.fname.th + ' ' + user_profile.lname.th })
            }
            header_left.push({ 'ช่างซ่อม': repair_man })

            const ws = {
                "headers": header1,
                "datas": data
            }

            price = [
                { 'ราคาก่อนรวมภาษี': tran_doc.price_before_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' }

            ]

            // copy front 
            if (tran_doc.tax_type_id == 'fafa3667-55d8-49d1-b06c-759c6e9ab064') {
                //ไม่รวม vat
                price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            } else if (tran_doc.tax_type_id == '8c73e506-31b5-44c7-a21b-3819bb712321') {
                // รวม vat
                price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            } else {
                // ไม่คิดภาษี
                price.push({ 'ภาษีมูลค่าเพิ่ม 0%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            }

            var note = tran_doc.details.remark

            in_name = []

            let sign_date = []

            let use_sign_date = [false, false]

            let bank = false
            let name = []

            return await pdfGen(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

        }
        else if (tran_doc.which == 8) {

            let bank = false
            let name = [request.query.foot_sign_left || 'ผู้รับวางบิล', request.query.foot_sign_right || 'ผู้วางบิล']


            var data = await ShopPartnerDebtList_.findAll({
                where: { shop_partner_debt_doc_id: request.params.id, status: 1 },
                include: [
                    {
                        model: ShopInventoryImportDoc_, as: 'ShopInventoryTransaction'
                    },
                    {
                        model: ShopPartnerDebtCreditNoteDoc_, as: "ShopPartnerDebtCreditNoteDoc"
                    },
                    {
                        model: ShopPartnerDebtDebitNoteDoc_, as: "ShopPartnerDebtDebitNoteDoc"
                    }
                ],
                separate: true,
                order: [['seq_number', 'ASC']]
            })

                .then(async el => {
                    var data = []
                    for (let index = 0; index < el.length; index++) {
                        const element = el[index];
                        let list_name = ''
                        let price_grand_total = ''
                        price_grand_total = element.price_grand_total

                        if (element.ShopInventoryTransaction) {
                            list_name = element.ShopInventoryTransaction.code_id
                        } else {
                            if (element.ShopPartnerDebtDebitNoteDoc) {
                                list_name = element.ShopPartnerDebtDebitNoteDoc.code_id
                            } else {
                                if (element.ShopPartnerDebtCreditNoteDoc) {
                                    list_name = element.ShopPartnerDebtCreditNoteDoc.code_id
                                    // price_grand_total = price_grand_total * -1
                                } else {
                                    list_name = element.ShopCustomerDebtDebitNoteDoc.code_id

                                }
                            }

                        }

                        price_grand_total = price_grand_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        data.push({
                            ...{
                                '#': index + 1,
                                'ชื่อรายการ': list_name,
                                'วันที่เอกสาร': moment(new Date(element.doc_date)).format("DD/MM/YYYY"),
                                'จำนวน': 1,
                                'จำนวนเงิน': price_grand_total
                            }

                        })

                    }
                    return data
                })



            let customer = null
            customer = tran_doc.ShopBusinessPartner


            if (!customer) {
                return ({ status: 'failed', data: 'partner not found' })
            }

            var addr_replare = await replace_addr(customer)

            addr1 = ``

            addr1 = `${customer.partner_name.th} \n`


            let tel = ``
            if (_.hasIn(customer, 'tel_no.tel_no_1') && customer.tel_no.tel_no_1 != '') {
                tel = `\nโทร.${customer.tel_no.tel_no_1} ${(_.hasIn(customer, 'tel_no.tel_no_2') ? ',' + customer.tel_no.tel_no_2 : '')} ${(_.hasIn(customer, 'tel_no.tel_no_3') ? ',' + customer.tel_no.tel_no_3 : '')} `
            }

            let mobile = ``
            if (_.hasIn(customer, 'mobile_no.mobile_no_1') && customer.mobile_no.mobile_no_1 != '') {
                mobile = `\nเบอร์มือถือ  ${customer.mobile_no.mobile_no_1} ${(_.hasIn(customer, 'mobile_no.mobile_no_2') ? ',' + customer.mobile_no.mobile_no_2 : '')} ${(_.hasIn(customer, 'mobile_no.mobile_no_3') ? ',' + customer.mobile_no.mobile_no_3 : '')} `
            }


            let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

            let long_addr = (customer.address?.th) ? customer.address.th + ' ' : ''
            long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
            long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
            long_addr = long_addr + province + ` `
            long_addr = long_addr + `${(customer.SubDistrict) ? customer.SubDistrict.zip_code : ' '}`

            addr_split = long_addr.split(/[ \n]+/)

            count_ = 0
            long_addr = ''
            for (let index = 0; index < addr_split.length; index++) {
                const element = addr_split[index];
                if (element.length + count_ <= 27) {
                    long_addr = long_addr + element + ' '
                    count_ = count_ + element.length
                } else {
                    long_addr = long_addr + '\n' + element + ' '
                    count_ = 0
                }

            }

            addr1 = addr1 + long_addr
            addr1 = addr1 + tel
            addr1 = addr1 + mobile


            seller = { title: 'ข้อมูลผู้จำหน่าย', data: addr1 }



            var header_right = addr


            var header_left = [
                { 'เลขที่เอกสาร': tran_doc.code_id },
                { 'วันที่เอกสาร': moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY") },
                // { 'เลขที่เอกสารอ้างอิง': tran_doc.details?.References_doc },
                // { 'ประเภทภาษี': await get_tax_name(tran_doc.tax_type_id) }
            ]

            if (config_pdf.seller_show?.isuse != false) {
                if (config_pdf.all?.sales_man == true) {
                    let sales_man = await UsersProfiles.findAll({ where: { user_id: tran_doc.details?.sales_man } })
                    header_left.push({ 'พนักงานขาย': sales_man.map(el => { return el.fname.th + ' ' + el.lname.th }) })
                } else {
                    header_left.push({ 'พนักงานขาย': user_profile.fname.th + ' ' + user_profile.lname.th })
                }
            }
            header_left.push({ 'เครดิต': (customer.other_details.credit_term) ? customer.other_details.credit_term + ' วัน' : ' -' })

            header_left.push({ 'กำหนดชำระภายใน': (tran_doc.debt_due_date) ? moment(new Date(tran_doc.debt_due_date)).format("DD/MM/YYYY") : ' -' })

            const ws = {
                "headers": [
                    { "label": '#', "property": '#', "width": 60, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'ชื่อรายการ', "property": 'ชื่อรายการ', "width": 200 - margin_left - 3, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center" },
                    { "label": 'วันที่เอกสาร', "property": 'วันที่เอกสาร', "width": 110, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "center" },
                    { "label": 'จำนวน', "property": 'จำนวน', "width": 80, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" },
                    { "label": 'จำนวนเงิน', "property": 'จำนวนเงิน', "width": 100, "headerColor": header_table_color, "headerOpacity": 1, "headerAlign": "center", align: "right" },
                ],
                "datas": data
            }

            price = []
            price.push({ 'จำนวนเงินรวมทั้งสิ้น': (parseFloat(tran_doc.debt_price_paid_total) || 0.00).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") })


            var note = tran_doc.details.remark


            var in_name = ['', '']

            let sign_date = [request.query.foot_date_left || 'วันที่', request.query.foot_date_right || 'วันที่']

            let use_sign_date = [true, true]


            return await pdfGen(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

        }
        else if (tran_doc.which == 9 || tran_doc.which == 10) {

            let data_list = []
            if (tran_doc.which == 9) {
                data_list = await ShopPartnerDebtCreditNoteList_.findAll({
                    where: { shop_partner_debt_cn_doc_id: request.params.id, status: 1 },
                    include: [
                        { model: ShopProduct(table_name), as: 'ShopProduct', include: [{ model: Product }] }],
                    separate: true,
                    order: [['seq_number', 'ASC']]
                })

            } else {
                data_list = await ShopPartnerDebtDebitNoteList_.findAll({
                    where: { shop_partner_debt_dn_doc_id: request.params.id, status: 1 },
                    include: [
                        { model: ShopProduct(table_name), as: 'ShopProduct', include: [{ model: Product }] }],
                    separate: true,
                    order: [['seq_number', 'ASC']]
                })
            }

            let data = []

            for (let index = 0; index < data_list.length; index++) {

                const element = data_list[index];

                let product = element.ShopProduct
                let unit = null

                if (product) {

                    product = product.Product
                    if (product.other_details?.purchase_unit) {
                        unit = await ProductPurchaseUnitTypes.findOne({ where: { id: product.other_details.purchase_unit } })
                    }


                } else {

                    product = {}
                    product.master_path_code_id = element.list_id
                    product.product_name = { th: element.list_name }
                    unit = { type_name: { th: 'รายการ' } }

                }

                let all_price = (element.price_grand_total != null) ? element.price_grand_total : null

                let discount = (element.price_discount != null) ? element.price_discount : 0

                data.push({
                    ...{
                        '#': index + 1,
                        'รหัสสินค้า': product.master_path_code_id || '-',
                        'ชื่อสินค้า': (element.details.change_name_status == true) ? element.details.changed_name : product.product_name.th,
                        'จำนวน': parseInt(element.amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        'หน่วย': (unit) ? unit.type_name.th : '',
                        'ราคา/หน่วย': parseFloat(element.price_unit || 0).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        '_ราคา/หน่วย': (element.price_unit || 0) * (element.amount || 0),
                        'ส่วนลด': (parseFloat(discount || 0) * parseInt(element.amount || 0)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        '_ส่วนลด': parseFloat(discount || 0),
                        'ราคารวม': parseFloat(all_price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        'all_price': all_price
                    },



                })



            }


            let customer = null
            customer = tran_doc.ShopBusinessPartner


            var addr_replare = await replace_addr(customer)

            addr1 = `${customer.partner_name.th}`


            let branch_ = customer.other_details || {}
            if (customer.other_details.branch == 'office') {
                addr1 = addr1 + ` (สำนักงานใหญ่)`

            } else if (customer.other_details.branch == 'branch') {
                if (config_pdf.branch_code?.isuse == true) {
                    addr1 = addr1 + ` (สาขา` + branch_.branch_code + `)`
                } else {
                    addr1 = addr1 + ` (สาขา` + branch_.branch_name + `)`
                }

            }
            addr1 = addr1 + ` \n`

            let tel = ``
            if (_.hasIn(customer, 'tel_no.tel_no_1') && customer.tel_no.tel_no_1 != '') {
                tel = `\nโทร.${customer.tel_no.tel_no_1} ${(_.hasIn(customer, 'tel_no.tel_no_2') ? ',' + customer.tel_no.tel_no_2 : '')} ${(_.hasIn(customer, 'tel_no.tel_no_3') ? ',' + customer.tel_no.tel_no_3 : '')} `
            }

            let mobile = ``
            if (_.hasIn(customer, 'mobile_no.mobile_no_1') && customer.mobile_no.mobile_no_1 != '') {
                mobile = `\nเบอร์มือถือ  ${customer.mobile_no.mobile_no_1} ${(_.hasIn(customer, 'mobile_no.mobile_no_2') ? ',' + customer.mobile_no.mobile_no_2 : '')} ${(_.hasIn(customer, 'mobile_no.mobile_no_3') ? ',' + customer.mobile_no.mobile_no_3 : '')} `
            }

            let province = (addr_replare[0] === ' - ') ? addr_replare[3][2] + addr_replare[0] : addr_replare[0]

            let long_addr = (customer.address?.th) ? customer.address.th + ' ' : ''
            long_addr = long_addr + addr_replare[3][0] + addr_replare[2] + ` `
            long_addr = long_addr + addr_replare[3][1] + addr_replare[1] + ` `
            long_addr = long_addr + province + ` `
            long_addr = long_addr + `${(customer.SubDistrict) ? customer.SubDistrict.zip_code : ' '}`



            addr_split = long_addr.split(/[ \n]+/)

            count_ = 0
            long_addr = ''
            for (let index = 0; index < addr_split.length; index++) {
                const element = addr_split[index];
                if (element.length + count_ <= 27) {
                    long_addr = long_addr + element + ' '
                    count_ = count_ + element.length
                } else {
                    long_addr = long_addr + '\n' + element + ' '
                    count_ = 0
                }

            }

            addr1 = addr1 + long_addr
            addr1 = addr1 + tel
            addr1 = addr1 + mobile

            addr1 = addr1 + `\nเลขประจำตัวผู้เสียภาษี ${(customer.tax_id) ? customer.tax_id : ' - '} `


            seller = { title: 'ข้อมูลลูกค้า', data: addr1 }

            let header_right = addr
            let repair_man = ''


            var header_left = [
                { 'เลขที่เอกสาร': tran_doc.code_id },
            ]
            if (tran_doc.ShopTemporaryDeliveryOrderDoc) {


                if (tran_doc.ShopTemporaryDeliveryOrderDoc.ShopServiceOrderDoc?.ShopTaxInvoiceDocs?.length > 0) {
                    header_left.push({ 'เลขที่เอกสารอ้างอิง': tran_doc.ShopTemporaryDeliveryOrderDoc.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0].inv_code_id })

                } else {
                    header_left.push({ 'เลขที่เอกสารอ้างอิง': tran_doc.ShopTemporaryDeliveryOrderDoc.code_id })
                }

                repair_man = tran_doc.ShopTemporaryDeliveryOrderDoc.details.hasOwnProperty('repair_man') ? tran_doc.ShopTemporaryDeliveryOrderDoc.details.repair_man : []

                if (repair_man.length > 0) {
                    let repair_all = await UsersProfiles.findAll({ where: { user_id: { [Op.in]: [repair_man[0]] } } })
                    repair_man = ''
                    for (let index = 0; index < repair_all.length; index++) {
                        const element = repair_all[index];

                        if (index == 0) {
                            repair_man = element.fname.th + ' ' + element.lname.th
                        }
                    }
                }


            }

            header_left.push({ 'วันที่เอกสาร': moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY") })
            if (config_pdf.all?.sales_man == true) {
                let sales_man = await UsersProfiles.findAll({ where: { user_id: tran_doc.details?.sales_man } })
                header_left.push({ 'พนักงานขาย': sales_man.map(el => { return el.fname.th + ' ' + el.lname.th }) })
            } else {
                header_left.push({ 'พนักงานขาย': user_profile.fname.th + ' ' + user_profile.lname.th })
            }
            header_left.push({ 'ช่างซ่อม': repair_man })

            const ws = {
                "headers": header1,
                "datas": data
            }

            price = [
                { 'ราคาก่อนรวมภาษี': tran_doc.price_before_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' }

            ]

            // copy front 
            if (tran_doc.tax_type_id == 'fafa3667-55d8-49d1-b06c-759c6e9ab064') {
                //ไม่รวม vat
                price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            } else if (tran_doc.tax_type_id == '8c73e506-31b5-44c7-a21b-3819bb712321') {
                // รวม vat
                price.push({ 'ภาษีมูลค่าเพิ่ม 7%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            } else {
                // ไม่คิดภาษี
                price.push({ 'ภาษีมูลค่าเพิ่ม 0%': (tran_doc.price_vat || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท' })
                price.push({ 'จำนวนเงินรวมทั้งสิ้น': (tran_doc.price_grand_total || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })
            }

            var note = tran_doc.details.remark

            in_name = []

            let sign_date = []

            let use_sign_date = [false, false]

            let bank = false
            let name = []

            return await pdfGen(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

        }
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: 'failed', data: error })
    }

}

const replace_addr = async (data) => {


    var provice = data?.Province || {}
    var district = data?.District || {}
    var subdistrict = data?.SubDistrict || {}

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

const get_tax_name = async (id) => {
    let tax_name = await TaxTypes.findOne({ where: { id: id } })
    if (tax_name) {
        tax_name = tax_name.type_name.th
    } else {
        tax_name = ''
    }

    return tax_name
}

const pdfGen = async (logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf) => {
    let doc = null

    if (config_pdf.all?.shop_local_name_show == true) {
        header_left.push({ 'สาขา': tran_doc.shop_profile.shop_name.shop_local_name })
    }

    if (config_pdf.product_transfer_branch?.template?.value == 1 && tran_doc.doc_type_id == '53e7cbcc-3443-40e5-962f-d9512aba2b5a') {
        header_left.push({ 'สาขาปลายทาง': tran_doc.ShopBusinessPartners?.shop_name?.shop_local_name || '' })
    }

    if (config_pdf.template?.value == 1 && tran_doc.which != 2) {
        doc = await template_1(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

    } else if (tran_doc.which === 4 || tran_doc.which === 5 || tran_doc.which === 8) {
        doc = await template_debt(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

    } else if (tran_doc.which === 6 || tran_doc.which === 9 || tran_doc.which === 10) {
        doc = await template_credit_debit_note(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)
    }
    else {
        doc = await template_default(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)

    }
    var file_name = uuid4();

    // await doc.pipe(fs.createWriteStream('src/assets/printouts/' + 'file_name' + '.pdf'));
    await doc.pipe(fs.createWriteStream('src/assets/printouts/' + file_name + '.pdf'));


    doc.end();

    // return ({ status: "success", data: 'printouts/' + 'file_name' + '.pdf' })
    return ({ status: "success", data: 'printouts/' + file_name + '.pdf' })

}

const template_default = async (logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf) => {
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

    let height_depen_in_name = (in_name[0] != '' || in_name[1] != '') ? 0 : 20


    let line_headert = header_right.split(/\r\n|\r|\n/).length
    if (seller.data?.split(/\r\n|\r|\n/).length || 0 >= send.data?.split(/\r\n|\r|\n/).length || 0) {
        line_headert = line_headert + (seller.data?.split(/\r\n|\r|\n/).length || 0)
    } else {
        line_headert = line_headert + (send.data?.split(/\r\n|\r|\n/).length || 0)
    }



    let top_margin = (line_headert * 18) + 105

    let button_margin = -1 * ((line_headert * 8) - 10)

    // A4 = 8.3 x 11.7 inches
    // inches = 71.72 pixel 
    // let size_width = (config_pdf.custom_page_width?.isuse === true) ? parseFloat(config_pdf.custom_page_width?.value) * 71.72 : 8.3 * 71.72
    // let size_height = (config_pdf.custom_page_height?.isuse === true) ? parseFloat(config_pdf.custom_page_height?.value) * 71.72 : 11.7 * 71.72
    let doc = new PDFDocument({

        margins: { top: top_margin, left: 30, right: 30, bottom: button_margin },
        size: 'A4',
        // size: [size_width, size_height],
        bufferPages: true
    });

    // doc.y = doc.y + top_margin

    let option = {
    }
    if (config_pdf.table_horizontal_line?.isuse == false) {
        option.divider = { horizontal: { disabled: true } }
    }
    //data




    if (tran_doc.price_use == 'true') {

        let helper = {};
        let result = ws.datas.reduce(function (r, o) {
            let key = o['ชื่อสินค้า'] + '-' + o['ราคา/หน่วย'] + '-' + o['DOT/MFD'];

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
        prepareHeader: () => doc.font(Bold).fontSize(12).fillColor((config_pdf.header_font_color) ? config_pdf.header_font_color : 'white'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font(Regular).fontSize(12).fillColor("black");
        },
    });
    //price

    if (tran_doc.price_use == 'true') {

        for (let index = 0; index < price.length; index++) {
            const element = price[index];
            if (index < price.length - 1) {

                if (index == price.length - 2 && tran_doc.payment_show == true && tran_doc.payment_method != '') {
                    wss.datas.push({ 1: 'ชำระโดย ' + tran_doc.payment_method, 2: { label: Object.keys(element), options: { color: font_primary_color } }, 3: element[Object.keys(element)] })

                } else {
                    wss.datas.push({ 1: '', 2: { label: Object.keys(element), options: { color: font_primary_color } }, 3: element[Object.keys(element)] })

                }
            }
            else {

                let wss1_ = {}

                wss1_['1'] = '(' + ArabicNumberToText(element[Object.keys(element)]) + ')'
                wss1_['2'] = { label: Object.keys(element), options: { color: font_primary_color } }
                if (config_pdf.table_horizontal_line?.isuse == false) {
                    wss1_['3'] = { label: element[Object.keys(element)].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท  ', options: { color: 'black' } }
                } else {
                    wss1_['3'] = { label: element[Object.keys(element)].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท  ', options: { color: font_primary_color } }
                }

                wss.datas.push(wss1_)

            }

        }
        if (doc.y >= 720 - height_depen_in_name) {
            doc.addPage()
        }

        await doc.table(wss, {
            hideHeader: true,
            columnsSize: 1,
            columnSpacing: 1,
            columnsSize: 1,
            divider: {
                horizontal: { disabled: true },
                header: { disabled: true }
            },
            prepareHeader: () => doc.font(Bold).fontSize(12).fillColor('white'),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font(Bold).fontSize(font_price_size).fillColor("black")
                if ([1, 2].includes(indexColumn) && indexRow == price.length - 1 && config_pdf.total_price_color_background?.isuse != false) {
                    doc.addBackground(rectCell, 'grey', 0.1)
                }
                doc.font(Bold).fontSize(font_price_size).fillColor("black")
            },
        });


    }



    // note  
    if (note && note != '') {
        doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('หมายเหตุ', 20 + margin_left, doc.y - 10)
        doc.font(Regular).fontSize(12).fillColor('black').text(note)
    }

    /**
     * if have in_name will be 0 
     */

    if (tran_doc.price_use == 'true') {
        if (bank == true) {

            if (doc.y >= 720 - height_depen_in_name) {
                doc.addPage()
            }

            if (config_pdf.bank_show.value == 2) {
                let message = ''
                if (config_pdf.bank_show?.bank_name?.isuse != false) {
                    message = message + config_pdf.bank_show?.bank_name?.value + ' '
                }
                if (config_pdf.bank_show?.account_number?.isuse != false) {
                    message = message + '[' + config_pdf.bank_show?.account_number?.value + '] '
                }
                if (config_pdf.bank_show?.account_name?.isuse != false) {
                    message = message + 'ชื่อบัญชี ' + config_pdf.bank_show?.account_name?.value + ' '
                }

                doc.font(Bold).fillColor('black').text(`ชำระโดย: `, 20 + margin_left, doc.page.height - 160 + height_depen_in_name, {});
                doc.font(Bold).fillColor('black').text(`☐ เงินสด`, 70 + margin_left, doc.page.height - 160 + height_depen_in_name, {});
                doc.font(Bold).fillColor('black').text(`☐ โอนเงิน ${message} `, 250 + margin_left, doc.page.height - 160 + height_depen_in_name, {});

                doc.font(Bold).fillColor('black').text(`☐ บัตรเครดิต / เดบิต`, 70 + margin_left, doc.page.height - 145 + height_depen_in_name, {});
                doc.font(Bold).fillColor('black').text(`☐ ผ่อนชำระ`, 250 + margin_left, doc.page.height - 145 + height_depen_in_name, {});
                doc.font(Bold).fillColor('black').text(`☐ อื่น ๆ`, 450 + margin_left, doc.page.height - 145 + height_depen_in_name, {});

                doc.font(Bold).fillColor('black').text('ข้าพเจ้าได้รับสินค้าและบริการ ดังรายการข้างต้นไว้ถูกต้องครบถ้วนและอยู่ในสภาพเรียบร้อย', 20 + margin_left, doc.page.height - 130 + height_depen_in_name, {});

                doc.moveTo(305, doc.page.height - 143 + height_depen_in_name).lineTo(420, doc.page.height - 143 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

                doc.moveTo(490, doc.page.height - 143 + height_depen_in_name).lineTo(560, doc.page.height - 143 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();


            } else {
                doc.font(Bold).fillColor('black').text(`การชำระเงินจะสมบูรณ์เมื่อบริษัทได้รับเงินเรียบร้อยแล้ว เงินสด / โอนเงิน ${((config_pdf.bank_show?.account_name?.isuse != false) ? config_pdf.bank_show?.account_name?.value + ' ' : '')} / บัตรเครดิต/เดบิต`, 20 + margin_left, doc.page.height - 160 + height_depen_in_name, {});
                doc.font(Bold).fillColor('black').text('ธนาคาร', 20 + margin_left, doc.page.height - 145 + height_depen_in_name, {});
                if (config_pdf.bank_show?.bank_name?.isuse != false) {
                    doc.font(Bold).fillColor('black').text(config_pdf.bank_show?.bank_name?.value, 55 + margin_left, doc.page.height - 146 + height_depen_in_name, {});
                }
                doc.moveTo(48 + margin_left, doc.page.height - 134 + height_depen_in_name).lineTo(200, doc.page.height - 134 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

                doc.font(Bold).fillColor('black').text('เลขที่', 200, doc.page.height - 145 + height_depen_in_name, {});
                if (config_pdf.bank_show?.account_number?.isuse != false) {
                    doc.font(Bold).fillColor('black').text(config_pdf.bank_show?.account_number?.value, 230 + margin_left, doc.page.height - 146 + height_depen_in_name, {});
                }
                doc.moveTo(220, doc.page.height - 134 + height_depen_in_name).lineTo(320, doc.page.height - 134 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
                doc.font(Bold).fillColor('black').text('วันที่', 320, doc.page.height - 145, {});
                doc.moveTo(335, doc.page.height - 134 + height_depen_in_name).lineTo(420, doc.page.height - 134 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
                doc.font(Bold).fillColor('black').text('จำนวนเงิน', 420, doc.page.height - 145, {});
                doc.moveTo(455, doc.page.height - 134 + height_depen_in_name).lineTo(566, doc.page.height - 134 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

                doc.font(Bold).fillColor('black').text('ข้าพเจ้าได้รับสินค้าและบริการ ดังรายการข้างต้นไว้ถูกต้องครบถ้วนและอยู่ในสภาพเรียบร้อย', 20 + margin_left, doc.page.height - 130 + height_depen_in_name, {});

            }


        }



        if (in_name[0] != '' || in_name[1] != '') {
            if (doc.y >= 732) {
                doc.addPage()
            }
            doc.font(Bold).fillColor('black').text(in_name[0], 20 + margin_left, doc.page.height - 115, {});
            doc.font(Bold).fillColor('black').text(in_name[1], 350, doc.page.height - 115);
        }

    }



    //page 2 
    //data
    if (config_pdf.copy_page?.isuse != false) {
        doc.addPage()

        await doc.table(ws, {
            ...option,
            prepareHeader: () => doc.font(Bold).fontSize(12).fillColor((config_pdf.header_font_color) ? config_pdf.header_font_color : 'white'),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font(Regular).fontSize(12).fillColor("black");
            },
        });
        //price

        if (tran_doc.price_use == 'true') {
            if (doc.y >= 720 - height_depen_in_name) {
                doc.addPage()
            }
            await doc.table(wss, {
                hideHeader: true,
                columnsSize: 1,
                columnSpacing: 1,
                columnsSize: 1,
                divider: {
                    horizontal: { disabled: true },
                    header: { disabled: true }
                },
                prepareHeader: () => doc.font(Bold).fontSize(12).fillColor('white'),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font(Bold).fontSize(font_price_size).fillColor("black")
                    if ([1, 2].includes(indexColumn) && indexRow == price.length - 1 && config_pdf.total_price_color_background?.isuse != false) {
                        doc.addBackground(rectCell, 'grey', 0.1)
                    }
                    doc.font(Bold).fontSize(font_price_size).fillColor("black")
                },
            });


        }



        // note  
        if (note && note != '') {
            doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('หมายเหตุ', 20 + margin_left, doc.y - 10)
            doc.font(Regular).fontSize(12).fillColor('black').text(note)
        }

        /**
         * if have in_name will be 0 
         */

        if (tran_doc.price_use == 'true') {
            if (bank == true) {

                if (doc.y >= 720 - height_depen_in_name) {
                    doc.addPage()
                }

                if (config_pdf.bank_show.value == 2) {
                    let message = ''
                    if (config_pdf.bank_show?.bank_name?.isuse != false) {
                        message = message + config_pdf.bank_show?.bank_name?.value + ' '
                    }
                    if (config_pdf.bank_show?.account_number?.isuse != false) {
                        message = message + '[' + config_pdf.bank_show?.account_number?.value + '] '
                    }
                    if (config_pdf.bank_show?.account_name?.isuse != false) {
                        message = message + 'ชื่อบัญชี ' + config_pdf.bank_show?.account_name?.value + ' '
                    }

                    doc.font(Bold).fillColor('black').text(`ชำระโดย: `, 20 + margin_left, doc.page.height - 160 + height_depen_in_name, {});
                    doc.font(Bold).fillColor('black').text(`☐ เงินสด`, 70 + margin_left, doc.page.height - 160 + height_depen_in_name, {});
                    doc.font(Bold).fillColor('black').text(`☐ โอนเงิน ${message} `, 250 + margin_left, doc.page.height - 160 + height_depen_in_name, {});

                    doc.font(Bold).fillColor('black').text(`☐ บัตรเครดิต / เดบิต`, 70 + margin_left, doc.page.height - 145 + height_depen_in_name, {});
                    doc.font(Bold).fillColor('black').text(`☐ ผ่อนชำระ`, 250 + margin_left, doc.page.height - 145 + height_depen_in_name, {});
                    doc.font(Bold).fillColor('black').text(`☐ อื่น ๆ`, 450 + margin_left, doc.page.height - 145 + height_depen_in_name, {});

                    doc.font(Bold).fillColor('black').text('ข้าพเจ้าได้รับสินค้าและบริการ ดังรายการข้างต้นไว้ถูกต้องครบถ้วนและอยู่ในสภาพเรียบร้อย', 20 + margin_left, doc.page.height - 130 + height_depen_in_name, {});

                    doc.moveTo(305, doc.page.height - 143 + height_depen_in_name).lineTo(420, doc.page.height - 143 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

                    doc.moveTo(490, doc.page.height - 143 + height_depen_in_name).lineTo(560, doc.page.height - 143 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();


                } else {
                    doc.font(Bold).fillColor('black').text(`การชำระเงินจะสมบูรณ์เมื่อบริษัทได้รับเงินเรียบร้อยแล้ว เงินสด / โอนเงิน ${((config_pdf.bank_show?.account_name?.isuse != false) ? config_pdf.bank_show?.account_name?.value + ' ' : '')} / บัตรเครดิต/เดบิต`, 20 + margin_left, doc.page.height - 160 + height_depen_in_name, {});
                    doc.font(Bold).fillColor('black').text('ธนาคาร', 20 + margin_left, doc.page.height - 145 + height_depen_in_name, {});
                    if (config_pdf.bank_show?.bank_name?.isuse != false) {
                        doc.font(Bold).fillColor('black').text(config_pdf.bank_show?.bank_name?.value, 55 + margin_left, doc.page.height - 146 + height_depen_in_name, {});
                    }
                    doc.moveTo(48 + margin_left, doc.page.height - 134 + height_depen_in_name).lineTo(200, doc.page.height - 134 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

                    doc.font(Bold).fillColor('black').text('เลขที่', 200, doc.page.height - 145 + height_depen_in_name, {});
                    if (config_pdf.bank_show?.account_number?.isuse != false) {
                        doc.font(Bold).fillColor('black').text(config_pdf.bank_show?.account_number?.value, 230 + margin_left, doc.page.height - 146 + height_depen_in_name, {});
                    }
                    doc.moveTo(220, doc.page.height - 134 + height_depen_in_name).lineTo(320, doc.page.height - 134 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
                    doc.font(Bold).fillColor('black').text('วันที่', 320, doc.page.height - 145, {});
                    doc.moveTo(335, doc.page.height - 134 + height_depen_in_name).lineTo(420, doc.page.height - 134 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
                    doc.font(Bold).fillColor('black').text('จำนวนเงิน', 420, doc.page.height - 145, {});
                    doc.moveTo(455, doc.page.height - 134 + height_depen_in_name).lineTo(566, doc.page.height - 134 + height_depen_in_name).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

                    doc.font(Bold).fillColor('black').text('ข้าพเจ้าได้รับสินค้าและบริการ ดังรายการข้างต้นไว้ถูกต้องครบถ้วนและอยู่ในสภาพเรียบร้อย', 20 + margin_left, doc.page.height - 130 + height_depen_in_name, {});

                }


            }



            if (in_name[0] != '' || in_name[1] != '') {
                if (doc.y >= 732) {
                    doc.addPage()
                }
                doc.font(Bold).fillColor('black').text(in_name[0], 20 + margin_left, doc.page.height - 115, {});
                doc.font(Bold).fillColor('black').text(in_name[1], 350, doc.page.height - 115);
            }

        }

    }


    //Global Edits to All Pages (Header/Footer, etc)
    var pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        let height = 0

        ///page 1
        try {
            doc.image(logo, 20 + margin_left, 15, { height: 65 });

        } catch (error) {

        }
        //header left
        doc.font(Bold).fontSize(18).fillColor(font_primary_color).text(tran_doc.doc_type_name, 340, 25, { align: 'center' })

        if (config_pdf.under_title?.isuse != false) {
            if (i + 1 > pages.count / 2) {
                doc.font(Bold).fontSize(10).fillColor(font_primary_color).text('สำเนา (เอกสารออกเป็นชุด)', 340, 50, { align: 'center' })
            } else {
                doc.font(Bold).fontSize(10).fillColor(font_primary_color).text('ต้นฉบับ (เอกสารออกเป็นชุด)', 340, 50, { align: 'center' })
            }

        }
        doc.moveTo(340, 70).lineTo(570, 70).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

        for (let index = 0; index < header_left.length; index++) {
            const element = header_left[index];
            doc.font(Bold).fontSize(12).fillColor(font_primary_color).text(Object.keys(element), 350, 80 + (15 * index))
            doc.font(Bold).fontSize(12).fillColor('black').text((element[Object.keys(element)] == '' || element[Object.keys(element)] == null) ? ' ' : element[Object.keys(element)], 430, 80 + (15 * index))
        }

        height = doc.y
        let height_line_header_left = header_left.length + 2
        doc.moveTo(340, height + height_line_header_left).lineTo(570, height + height_line_header_left).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
        // doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('ชื่องาน', 350, height + 30)
        doc.font(Bold).fontSize(12).fillColor('black').text('', 420, height + 30)

        //header right
        doc.font(Bold).fontSize(12).fillColor('black').text(header_right, 20 + margin_left, 80, { width: 210 })



        height = doc.y + 8
        if (Object.keys(send).length > 0) {
            doc.font(Bold).fontSize(font_vehicle_size).fillColor(font_primary_color).text(send.title, 350, height)
            doc.font(Bold).fontSize(font_vehicle_size).fillColor('black').text(send.data)
        }
        //seller
        if (Object.keys(seller).length > 0) {
            doc.font(Bold).fontSize(font_customer_size).fillColor(font_primary_color).text(seller.title, 20 + margin_left, height)
            doc.font(Bold).fontSize(font_customer_size).fillColor('black').text(seller.data, { width: 210 })
        }


        //ผู้รับสินค้า
        if (name[0]) {
            doc.moveTo(20 + margin_left, doc.page.height - 55).lineTo(124, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(name[0], 20 + margin_left, doc.page.height - 50, { align: 'center', width: 104 });
        }

        //วันที่
        if (use_sign_date[0]) {
            // doc.font(Bold).fillColor('black').text(moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY"), 134, doc.page.height - 80, { align: 'center', width: 104 });
            doc.moveTo(134, doc.page.height - 55).lineTo(238, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(sign_date[0], 134, doc.page.height - 50, { align: 'center', width: 104 });

        }

        //ผู้ส่งสินค้า
        if (use_sign_date[1] == false) {
            doc.moveTo(456, doc.page.height - 55).lineTo(560, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(name[1], 406, doc.page.height - 50, { align: 'center', width: 204 });

        } else {
            doc.moveTo(342, doc.page.height - 55).lineTo(446, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(name[1], 342, doc.page.height - 50, { align: 'center', width: 104 });

        }

        //วันที่
        if (use_sign_date[1]) {
            // doc.font(Bold).fillColor('black').text(moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY"), 456, doc.page.height - 80, { align: 'center', width: 104 });
            doc.moveTo(456, doc.page.height - 55).lineTo(560, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(sign_date[1], 456, doc.page.height - 50, { align: 'center', width: 104 });

        }


        // if (config_pdf.page_number?.isuse != false) {
        //     if (config_pdf.copy_page?.isuse != false) {
        //         if (i + 1 > pages.count / 2) {
        //             doc.font(Regular).fillColor('black').text(`หน้าที่ ${i + 1 - pages.count / 2} /${pages.count / 2
        //                 } `, 20 + margin_left, doc.page.height - 30);
        //         } else {
        //             doc.font(Regular).fillColor('black').text(`หน้าที่ ${i + 1} /${pages.count / 2
        //                 } `, 20 + margin_left, doc.page.height - 30);
        //         }
        //     } else {

        //         if (pages.count > 1) {
        //             if (i + 1 > pages.count) {
        //                 doc.font(Regular).fillColor('black').text(`หน้าที่ ${i + 1 - pages.count} /${pages.count
        //                     } `, 20 + margin_left, doc.page.height - 35);
        //             } else {
        //                 doc.font(Regular).fillColor('black').text(`หน้าที่ ${i + 1} /${pages.count
        //                     } `, 20 + margin_left, doc.page.height - 35);
        //             }
        //         }

        //     }

        // }

    }

    return doc

}
const template_credit_debit_note = async (logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf) => {
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

    let height_depen_in_name = (in_name[0] != '' || in_name[1] != '') ? 0 : 20


    let line_headert = header_right.split(/\r\n|\r|\n/).length
    if (seller.data?.split(/\r\n|\r|\n/).length || 0 >= send.data?.split(/\r\n|\r|\n/).length || 0) {
        line_headert = line_headert + (seller.data?.split(/\r\n|\r|\n/).length || 0)
    } else {
        line_headert = line_headert + (send.data?.split(/\r\n|\r|\n/).length || 0)
    }



    let top_margin = (line_headert * 18) + 105

    let button_margin = -1 * ((line_headert * 8) - 10)

    let doc = new PDFDocument({

        margins: { top: top_margin, left: 30, right: 30, bottom: button_margin },
        size: 'A4',
        bufferPages: true
    });

    // doc.y = doc.y + top_margin

    let option = {
    }
    if (config_pdf.table_horizontal_line?.isuse == false) {
        option.divider = { horizontal: { disabled: true } }
    }
    //data





    let helper = {};
    let result = ws.datas.reduce(function (r, o) {
        let key = o['ชื่อสินค้า'] + '-' + o['ราคา/หน่วย'] + '-' + o['DOT/MFD'];

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


    await doc.table(ws, {
        ...option,
        prepareHeader: () => doc.font(Bold).fontSize(12).fillColor((config_pdf.header_font_color) ? config_pdf.header_font_color : 'white'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font(Regular).fontSize(12).fillColor("black");
        },
    });
    //price


    for (let index = 0; index < price.length; index++) {
        const element = price[index];
        if (index < price.length - 1) {
            wss.datas.push({ 1: '', 2: { label: Object.keys(element), options: { color: font_primary_color } }, 3: element[Object.keys(element)] })
        }
        else {

            let wss1_ = {}

            wss1_['1'] = '(' + ArabicNumberToText(element[Object.keys(element)]) + ')'
            wss1_['2'] = { label: Object.keys(element), options: { color: font_primary_color } }
            if (config_pdf.table_horizontal_line?.isuse == false) {
                wss1_['3'] = { label: element[Object.keys(element)].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท  ', options: { color: 'black' } }
            } else {
                wss1_['3'] = { label: element[Object.keys(element)].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท  ', options: { color: font_primary_color } }
            }

            wss.datas.push(wss1_)

        }

    }
    if (doc.y >= 720 - height_depen_in_name) {
        doc.addPage()
    }

    await doc.table(wss, {
        hideHeader: true,
        columnsSize: 1,
        columnSpacing: 1,
        columnsSize: 1,
        divider: {
            horizontal: { disabled: true },
            header: { disabled: true }
        },
        prepareHeader: () => doc.font(Bold).fontSize(12).fillColor('white'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font(Bold).fontSize(font_price_size).fillColor("black")
            if ([1, 2].includes(indexColumn) && indexRow == price.length - 1 && config_pdf.total_price_color_background?.isuse != false) {
                doc.addBackground(rectCell, 'grey', 0.1)
            }
            doc.font(Bold).fontSize(font_price_size).fillColor("black")
        },
    });



    // note  
    if (note && note != '') {
        doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('หมายเหตุ', 20 + margin_left, doc.y - 10)
        doc.font(Regular).fontSize(12).fillColor('black').text(note)
    }



    //page 2 
    //data
    if (config_pdf.copy_page?.isuse != false) {
        doc.addPage()

        await doc.table(ws, {
            ...option,
            prepareHeader: () => doc.font(Bold).fontSize(12).fillColor((config_pdf.header_font_color) ? config_pdf.header_font_color : 'white'),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font(Regular).fontSize(12).fillColor("black");
            },
        });
        //price

        if (tran_doc.price_use == 'true') {
            if (doc.y >= 720 - height_depen_in_name) {
                doc.addPage()
            }
            await doc.table(wss, {
                hideHeader: true,
                columnsSize: 1,
                columnSpacing: 1,
                columnsSize: 1,
                divider: {
                    horizontal: { disabled: true },
                    header: { disabled: true }
                },
                prepareHeader: () => doc.font(Bold).fontSize(12).fillColor('white'),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font(Bold).fontSize(font_price_size).fillColor("black")
                    if ([1, 2].includes(indexColumn) && indexRow == price.length - 1 && config_pdf.total_price_color_background?.isuse != false) {
                        doc.addBackground(rectCell, 'grey', 0.1)
                    }
                    doc.font(Bold).fontSize(font_price_size).fillColor("black")
                },
            });


        }



        // note  
        if (note && note != '') {
            doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('หมายเหตุ', 20 + margin_left, doc.y - 10)
            doc.font(Regular).fontSize(12).fillColor('black').text(note)
        }



    }


    //Global Edits to All Pages (Header/Footer, etc)
    var pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        let height = 0

        ///page 1
        try {
            doc.image(logo, 20 + margin_left, 15, { height: 65 });

        } catch (error) {

        }
        //header left
        doc.font(Bold).fontSize(18).fillColor(font_primary_color).text(tran_doc.doc_type_name, 340, 25, { align: 'center' })

        if (config_pdf.under_title?.isuse != false) {
            if (i + 1 > pages.count / 2) {
                doc.font(Bold).fontSize(10).fillColor(font_primary_color).text('สำเนา (เอกสารออกเป็นชุด)', 340, 50, { align: 'center' })
            } else {
                doc.font(Bold).fontSize(10).fillColor(font_primary_color).text('ต้นฉบับ (เอกสารออกเป็นชุด)', 340, 50, { align: 'center' })
            }

        }
        doc.moveTo(340, 70).lineTo(570, 70).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

        for (let index = 0; index < header_left.length; index++) {
            const element = header_left[index];
            doc.font(Bold).fontSize(12).fillColor(font_primary_color).text(Object.keys(element), 350, 80 + (15 * index))
            doc.font(Bold).fontSize(12).fillColor('black').text((element[Object.keys(element)] == '' || element[Object.keys(element)] == null) ? ' ' : element[Object.keys(element)], 430, 80 + (15 * index))
        }

        height = doc.y
        let height_line_header_left = header_left.length + 2
        doc.moveTo(340, height + height_line_header_left).lineTo(570, height + height_line_header_left).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
        // doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('ชื่องาน', 350, height + 30)
        doc.font(Bold).fontSize(12).fillColor('black').text('', 420, height + 30)

        //header right
        doc.font(Bold).fontSize(12).fillColor('black').text(header_right, 20 + margin_left, 80, { width: 210 })



        height = doc.y + 8
        //seller
        if (Object.keys(seller).length > 0) {
            doc.font(Bold).fontSize(font_customer_size).fillColor(font_primary_color).text(seller.title, 20 + margin_left, height)
            doc.font(Bold).fontSize(font_customer_size).fillColor('black').text(seller.data, { width: 210 })
        }



        // stv
        if (config_pdf.credit_debit_note?.use_template?.which_templte_number?.value == 1) {
            doc.moveTo(50, doc.page.height - 85).lineTo(207, doc.page.height - 85).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text('ลายมือชื่อผู้มีอำนาจ / Authorized Signature', 50, doc.page.height - 80);
        } else {
            doc.moveTo(456, doc.page.height - 55).lineTo(560, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text('ลายมือชื่อผู้มีอำนาจ', 406, doc.page.height - 50, { align: 'center', width: 204 });
        }





    }

    return doc

}


const template_debt = async (logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf) => {
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

    let height_depen_in_name = (in_name[0] != '' || in_name[1] != '') ? 0 : 20

    let line_headert = header_right.split(/\r\n|\r|\n/).length
    if (seller.data?.split(/\r\n|\r|\n/).length || 0 >= send.data?.split(/\r\n|\r|\n/).length || 0) {
        line_headert = line_headert + (seller.data?.split(/\r\n|\r|\n/).length || 0)
    } else {
        line_headert = line_headert + (send.data?.split(/\r\n|\r|\n/).length || 0)
    }

    let bank_margin = 0
    if (tran_doc.shop_id == "db945efe-17c8-4c43-a437-31204fe3b8af" && tran_doc.which == 4) {
        bank_margin = 60
    }


    let top_margin = (line_headert * 18.5) + 105

    let button_margin = -1 * ((line_headert * 8) - 45)

    let doc = new PDFDocument({

        margins: { top: top_margin, left: 30, right: 30, bottom: button_margin },
        size: 'A4',
        bufferPages: true
    });

    // doc.y = doc.y + top_margin

    let option = {
    }
    if (config_pdf.table_horizontal_line?.isuse == false) {
        option.divider = { horizontal: { disabled: true } }
    }
    //data



    await doc.table(ws, {
        ...option,
        prepareHeader: () => doc.font(Bold).fontSize(12).fillColor((config_pdf.header_font_color) ? config_pdf.header_font_color : 'white'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font(Regular).fontSize(12).fillColor("black");
        },
    });
    //price

    if (tran_doc.price_use == 'true') {

        for (let index = 0; index < price.length; index++) {
            const element = price[index];
            if (index < price.length - 1) {
                wss.datas.push({ 1: '', 2: { label: Object.keys(element), options: { color: font_primary_color } }, 3: element[Object.keys(element)] })
            } else {

                let wss1_ = {}
                wss1_['1'] = '(' + ArabicNumberToText(element[Object.keys(element)]) + ')'
                wss1_['2'] = { label: Object.keys(element), options: { color: font_primary_color } }
                if (config_pdf.table_horizontal_line?.isuse == false) {
                    wss1_['3'] = { label: element[Object.keys(element)].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท  ', options: { color: 'black' } }
                } else {
                    wss1_['3'] = { label: element[Object.keys(element)].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' บาท  ', options: { color: font_primary_color } }
                }

                wss.datas.push(wss1_)

            }

        }
        if (doc.y >= 720 - height_depen_in_name - bank_margin) {
            doc.addPage()
        }

        await doc.table(wss, {
            hideHeader: true,
            columnsSize: 1,
            columnSpacing: 1,
            columnsSize: 1,
            divider: {
                horizontal: { disabled: true },
                header: { disabled: true }
            },
            prepareHeader: () => doc.font(Bold).fontSize(12).fillColor('white'),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font(Bold).fontSize(font_price_size).fillColor("black")
                if ([1, 2].includes(indexColumn) && indexRow == price.length - 1 && config_pdf.total_price_color_background?.isuse != false) {
                    doc.addBackground(rectCell, 'grey', 0.1)
                }
                doc.font(Bold).fontSize(font_price_size).fillColor("black")
            },
        });


    }



    // note  
    if (note && note != '') {
        doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('หมายเหตุ', 20 + margin_left, doc.y - 10)
        doc.font(Regular).fontSize(12).fillColor('black').text(note)
    }

    /**
     * if have in_name will be 0 
     */


    if (doc.y >= 720 - height_depen_in_name) {
        doc.addPage()
    }

    if (tran_doc.shop_id == "db945efe-17c8-4c43-a437-31204fe3b8af" && tran_doc.which == 4) {

        doc.moveTo(330, 665).lineTo(565, 665).lineWidth(2).fillAndStroke('black').stroke();
        doc.moveTo(565, 665).lineTo(565, 732).lineWidth(2).fillAndStroke('black').stroke();
        doc.moveTo(330, 665).lineTo(330, 732).lineWidth(2).fillAndStroke('black').stroke();
        doc.moveTo(330, 732).lineTo(565, 732).lineWidth(2).fillAndStroke('black').stroke();


        doc.font(Bold).fillColor('black').fontSize(11).text(`1 ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์ต่อเมื่อปรากฏรายมือชื่อผู้รับเงินและเช็ค/ดร๊าฟ/`, 20 + margin_left, doc.page.height - 165 + height_depen_in_name);
        doc.font(Bold).fillColor('black').fontSize(11).text(`   การโอนเงินของท่านเรียกเก็บเงินจากธนาคารได้ครบถ้วนแล้ว`, 20 + margin_left, doc.page.height - 152 + height_depen_in_name);
        doc.font(Bold).fillColor('black').fontSize(11).text(`2 บริษัทฯ จะคิดค่าชำระเงินล่าช้าในอัตราไม่เกิน 2% ต่อเดือน`, 20 + margin_left, doc.page.height - 135 + height_depen_in_name, {});

        doc.font(Bold).fillColor('black').fontSize(11).text(`☐ เงินสด จำนวน  ______________ บาท`, 340 + margin_left, doc.page.height - 165 + height_depen_in_name, {});
        doc.font(Bold).fillColor('black').fontSize(11).text(`☐ เช็ค ธนาคาร    ______________  สาขา  _____________ `, 340 + margin_left, doc.page.height - 153 + height_depen_in_name, {});
        doc.font(Bold).fillColor('black').fontSize(11).text(`เลขที่เช็ค   ______________ ลงวันที่ _____________ `, 365 + margin_left, doc.page.height - 141 + height_depen_in_name, {});
        doc.font(Bold).fillColor('black').fontSize(11).text(`จำนวนเงิน ______________ บาท`, 365 + margin_left, doc.page.height - 129 + height_depen_in_name, {});

        // doc.font(Bold).fillColor('black').fontSize(12).text(`☐ โอนเงิน`, 340 + margin_left, doc.page.height - 130 + height_depen_in_name, {});
        // doc.font(Bold).fillColor('black').text(`☐ บัตรเครดิต`, 340 + margin_left, doc.page.height - 115 + height_depen_in_name, {});

    }
    if (in_name[0] != '' || in_name[1] != '') {
        if (doc.y >= 732) {
            doc.addPage()
        }
        doc.font(Bold).fillColor('black').fontSize(12).text(in_name[0], 20 + margin_left, doc.page.height - 105, {});
        doc.font(Bold).fillColor('black').text(in_name[1], 350, doc.page.height - 105);
    }





    //page 2 
    //data
    if (config_pdf.copy_page?.isuse != false) {
        doc.addPage()

        await doc.table(ws, {
            ...option,
            prepareHeader: () => doc.font(Bold).fontSize(12).fillColor((config_pdf.header_font_color) ? config_pdf.header_font_color : 'white'),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font(Regular).fontSize(12).fillColor("black");
            },
        });
        //price

        if (tran_doc.price_use == 'true') {
            if (doc.y >= 720 - height_depen_in_name - bank_margin) {
                doc.addPage()
            }
            await doc.table(wss, {
                hideHeader: true,
                columnsSize: 1,
                columnSpacing: 1,
                columnsSize: 1,
                divider: {
                    horizontal: { disabled: true },
                    header: { disabled: true }
                },
                prepareHeader: () => doc.font(Bold).fontSize(12).fillColor('white'),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font(Bold).fontSize(font_price_size).fillColor("black")
                    if ([1, 2].includes(indexColumn) && indexRow == price.length - 1 && config_pdf.total_price_color_background?.isuse != false) {
                        doc.addBackground(rectCell, 'grey', 0.1)
                    }
                    doc.font(Bold).fontSize(font_price_size).fillColor("black")
                },
            });


        }



        // note  
        if (note && note != '') {
            doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('หมายเหตุ', 20 + margin_left, doc.y - 10)
            doc.font(Regular).fontSize(12).fillColor('black').text(note)
        }

        /**
         * if have in_name will be 0 
         */

        if (tran_doc.shop_id == "db945efe-17c8-4c43-a437-31204fe3b8af" && tran_doc.which == 4) {

            doc.moveTo(330, 665).lineTo(565, 665).lineWidth(2).fillAndStroke('black').stroke();
            doc.moveTo(565, 665).lineTo(565, 732).lineWidth(2).fillAndStroke('black').stroke();
            doc.moveTo(330, 665).lineTo(330, 732).lineWidth(2).fillAndStroke('black').stroke();
            doc.moveTo(330, 732).lineTo(565, 732).lineWidth(2).fillAndStroke('black').stroke();


            doc.font(Bold).fillColor('black').fontSize(11).text(`1 ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์ต่อเมื่อปรากฏรายมือชื่อผู้รับเงินและเช็ค/ดร๊าฟ/`, 20 + margin_left, doc.page.height - 165 + height_depen_in_name);
            doc.font(Bold).fillColor('black').fontSize(11).text(`   การโอนเงินของท่านเรียกเก็บเงินจากธนาคารได้ครบถ้วนแล้ว`, 20 + margin_left, doc.page.height - 152 + height_depen_in_name);
            doc.font(Bold).fillColor('black').fontSize(11).text(`2 บริษัทฯ จะคิดค่าชำระเงินล่าช้าในอัตราไม่เกิน 2% ต่อเดือน`, 20 + margin_left, doc.page.height - 135 + height_depen_in_name, {});

            doc.font(Bold).fillColor('black').fontSize(11).text(`☐ เงินสด จำนวน  ______________ บาท`, 340 + margin_left, doc.page.height - 165 + height_depen_in_name, {});
            doc.font(Bold).fillColor('black').fontSize(11).text(`☐ เช็ค ธนาคาร    ______________  สาขา  _____________ `, 340 + margin_left, doc.page.height - 153 + height_depen_in_name, {});
            doc.font(Bold).fillColor('black').fontSize(11).text(`เลขที่เช็ค   ______________ ลงวันที่ _____________ `, 365 + margin_left, doc.page.height - 141 + height_depen_in_name, {});
            doc.font(Bold).fillColor('black').fontSize(11).text(`จำนวนเงิน ______________ บาท`, 365 + margin_left, doc.page.height - 129 + height_depen_in_name, {});

            // doc.font(Bold).fillColor('black').fontSize(12).text(`☐ โอนเงิน`, 340 + margin_left, doc.page.height - 130 + height_depen_in_name, {});
            // doc.font(Bold).fillColor('black').text(`☐ บัตรเครดิต`, 340 + margin_left, doc.page.height - 115 + height_depen_in_name, {});

        }

        if (in_name[0] != '' || in_name[1] != '') {
            if (doc.y >= 732) {
                doc.addPage()
            }
            doc.font(Bold).fillColor('black').text(in_name[0], 20 + margin_left, doc.page.height - 105, {});
            doc.font(Bold).fillColor('black').text(in_name[1], 350, doc.page.height - 105);
        }



    }


    //Global Edits to All Pages (Header/Footer, etc)
    var pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        let height = 0

        ///page 1
        try {
            doc.image(logo, 20 + margin_left, 15, { height: 65 });

        } catch (error) {

        }
        //header left
        doc.font(Bold).fontSize(18).fillColor(font_primary_color).text(tran_doc.doc_type_name, 340, 25, { align: 'center' })

        if (config_pdf.under_title?.isuse != false) {
            if (i + 1 > pages.count / 2) {
                doc.font(Bold).fontSize(10).fillColor(font_primary_color).text('สำเนา (เอกสารออกเป็นชุด)', 340, 50, { align: 'center' })
            } else {
                doc.font(Bold).fontSize(10).fillColor(font_primary_color).text('ต้นฉบับ (เอกสารออกเป็นชุด)', 340, 50, { align: 'center' })
            }

        }
        doc.moveTo(340, 70).lineTo(570, 70).lineWidth(1).fillAndStroke('#D7D7D7').stroke();

        for (let index = 0; index < header_left.length; index++) {
            const element = header_left[index];
            doc.font(Bold).fontSize(12).fillColor(font_primary_color).text(Object.keys(element), 350, 80 + (15 * index))
            doc.font(Bold).fontSize(12).fillColor('black').text((element[Object.keys(element)] == '' || element[Object.keys(element)] == null) ? ' ' : element[Object.keys(element)], 430, 80 + (15 * index))
        }

        height = doc.y
        let height_line_header_left = header_left.length + 2
        doc.moveTo(340, height + height_line_header_left).lineTo(570, height + height_line_header_left).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
        // doc.font(Bold).fontSize(12).fillColor(font_primary_color).text('ชื่องาน', 350, height + 30)
        doc.font(Bold).fontSize(12).fillColor('black').text('', 420, height + 30)

        //header right
        doc.font(Bold).fontSize(12).fillColor('black').text(header_right, 20 + margin_left, 80, { width: 210 })



        height = doc.y + 8
        if (Object.keys(send).length > 0) {
            doc.font(Bold).fontSize(font_vehicle_size).fillColor(font_primary_color).text(send.title, 350, height)
            doc.font(Bold).fontSize(font_vehicle_size).fillColor('black').text(send.data)
        }
        //seller
        if (Object.keys(seller).length > 0) {
            doc.font(Bold).fontSize(font_customer_size).fillColor(font_primary_color).text(seller.title, 20 + margin_left, height)
            doc.font(Bold).fontSize(font_customer_size).fillColor('black').text(seller.data, { width: 210 })
        }


        //ผู้รับสินค้า
        if (name[0]) {
            doc.moveTo(20 + margin_left, doc.page.height - 55).lineTo(124, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(name[0], 20 + margin_left, doc.page.height - 50, { align: 'center', width: 104 });
        }

        //วันที่
        if (use_sign_date[0]) {
            // doc.font(Bold).fillColor('black').text(moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY"), 134, doc.page.height - 80, { align: 'center', width: 104 });
            doc.moveTo(134, doc.page.height - 55).lineTo(238, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(sign_date[0], 134, doc.page.height - 50, { align: 'center', width: 104 });

        }

        //ผู้ส่งสินค้า
        if (use_sign_date[1] == false) {
            doc.moveTo(456, doc.page.height - 55).lineTo(560, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(name[1], 456, doc.page.height - 50, { align: 'center', width: 104 });

        } else {
            doc.moveTo(342, doc.page.height - 55).lineTo(446, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(name[1], 342, doc.page.height - 50, { align: 'center', width: 104 });

        }

        //วันที่
        if (use_sign_date[1]) {
            // doc.font(Bold).fillColor('black').text(moment(new Date(tran_doc.doc_date)).format("DD/MM/YYYY"), 456, doc.page.height - 80, { align: 'center', width: 104 });
            doc.moveTo(456, doc.page.height - 55).lineTo(560, doc.page.height - 55).lineWidth(1).fillAndStroke('#D7D7D7').stroke();
            doc.font(Bold).fillColor('black').text(sign_date[1], 456, doc.page.height - 50, { align: 'center', width: 104 });

        }

        if (pages.count / 2 > 1) {
            if (i + 1 > pages.count / 2) {
                doc.font(Regular).fillColor('black').text(`หน้าที่ ${i + 1 - pages.count / 2} /${pages.count / 2
                    } `, 20 + margin_left, doc.page.height - 30);
            } else {
                doc.font(Regular).fillColor('black').text(`หน้าที่ ${i + 1} /${pages.count / 2
                    } `, 20 + margin_left, doc.page.height - 30);
            }
        }

    }

    return doc

}
const template_1 = async (logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf) => {

    if (tran_doc.doc_type_name.includes("ใบเบิก") && tran_doc.price_use == 'false') {
        return await template_default(logo, header_right, header_left, seller, send, ws, price, note, in_name, name, sign_date, bank, use_sign_date, tran_doc, shop_table, config_pdf)
    }
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
        // margins: { top: 9 * px, left: 10, right: 7, bottom: 2 * px },
        margins: { top: 9.2 * px, left: 1.8, right: 1.8, bottom: 2 * px },
        size: [20.3 * px, 27.8 * px],
        bufferPages: true
    });


    let option = {
        divider: {
            horizontal: { disabled: true }
        },
        hideHeader: true
    }

    ws.headers = [
        { "label": 'รหัสสินค้า', "property": 'รหัสสินค้า', "width": 2.5 * px, "padding": { left: 0.4 * px } },
        { "label": 'ชื่อสินค้า', "property": 'ชื่อสินค้า', "width": 7.7 * px, },
        { "label": 'จำนวน', "property": 'จำนวน', "width": 1.5 * px, align: "center" },
        { "label": 'ราคา/หน่วย', "property": 'ราคา/หน่วย', "width": 2.4 * px, align: "right", "padding": { right: 0.2 * px } },
        { "label": 'ส่วนลด', "property": 'ส่วนลด', "width": 1.8 * px, align: "right", "padding": { right: 0.2 * px } },
        { "label": 'ราคารวม', "property": 'ราคารวม', "width": 3.6 * px, align: "right", "padding": { right: 0.2 * px } }

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

    // for (let index = 0; index < 20; index++) {
    //     result.push(result[index])
    // }


    await doc.table(ws, {
        ...option,
        prepareHeader: () => doc.font(Bold).fontSize(12).fillColor((config_pdf.header_font_color) ? config_pdf.header_font_color : 'white'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font(Regular).fontSize(12).fillColor("black");

        },
    });
    //price

    if (tran_doc.price_use == 'true') {

        if (doc.y > 21.5 * px) {
            doc.addPage()
        }

        let pric_before_vat = price.filter(el => { return Object.keys(el) == 'ราคาก่อนรวมภาษี' })
        if (pric_before_vat.length > 0) {
            pric_before_vat = pric_before_vat[0]['ราคาก่อนรวมภาษี']
        } else {
            pric_before_vat = price.filter(el => { return Object.keys(el) == 'รวมเป็นเงิน' })
            if (pric_before_vat.length > 0) {
                pric_before_vat = pric_before_vat[0]['รวมเป็นเงิน']
            } else {
                pric_before_vat = ''
            }
        }

        let pric_vat = price.filter(el => { return Object.keys(el) == 'ภาษีมูลค่าเพิ่ม 7%' })
        if (pric_vat.length > 0) {
            pric_vat = pric_vat[0]['ภาษีมูลค่าเพิ่ม 7%']
        } else {
            pric_vat = ''
        }

        let pric_all = price.filter(el => { return Object.keys(el) == 'จำนวนเงินรวมทั้งสิ้น' })
        if (pric_all.length > 0) {
            pric_all = pric_all[0]['จำนวนเงินรวมทั้งสิ้น']
        } else {
            pric_all = ''
        }

        doc.font(Regular).fontSize(font_customer_size).text(note, 10, 22 * px, { width: 14 * px });


        if (tran_doc.doc_type_name.includes('กำกับภาษี')) {
            doc.font(Bold).fontSize(font_customer_size).text(pric_before_vat?.replace(' บาท', ''), 0, 21.7 * px, { align: 'right', width: 19.8 * px });

            doc.font(Bold).fontSize(font_customer_size).text(pric_vat?.replace(' บาท', ''), 0, 22.6 * px, { align: 'right', width: 19.8 * px });
        }


        doc.font(Bold).fontSize(font_customer_size).text(pric_all?.toString().replace(' บาท', ''), 0, 23.5 * px, { align: 'right', width: 19.8 * px });

        doc.font(Bold).fontSize(font_customer_size).text(ArabicNumberToText(pric_all), 3 * px, 23.5 * px);


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
            let customer = null
            if (tran_doc.ShopBusinessCustomer) {
                customer = tran_doc.ShopBusinessCustomer
            } else {
                customer = tran_doc.ShopPersonalCustomer
                customer.tax_id = tran_doc.ShopPersonalCustomer.id_card_number
            }


            credit_term = customer?.other_details.credit_term || 0
            let doc_date_credit_term_ = new Date(tran_doc.doc_date)

            doc_date_credit_term = doc_date_credit_term_.setDate(doc_date_credit_term_.getDate() + parseInt(credit_term));
            doc_date_credit_term = moment(new Date(doc_date_credit_term)).format('DD/MM/YYYY')
        }



        doc.font(Bold).fontSize(12).fillColor('black').text(doc_no, 13.5 * px, 2.7 * px)
        doc.font(Bold).fontSize(12).fillColor('black').text(doc_date, 13.5 * px, 3.5 * px)



        doc.font(Bold).fontSize(12).fillColor('black').text(credit_term + '   วัน', 15.4 * px, 4.2 * px)

        doc.font(Bold).fontSize(12).fillColor('black').text(doc_date_credit_term, 15.4 * px, 5 * px)


        if (send?.registration?.includes('\n')) {
            doc.font(Bold).fontSize(12).fillColor('black').text(send.registration.split('\n')[0], 2.1 * px, 7.5 * px)
            doc.font(Bold).fontSize(12).fillColor('black').text(send.registration.split('\n')[1], 2.1 * px, 7.9 * px)


        } else {
            doc.font(Bold).fontSize(12).fillColor('black').text(send.registration, 2.1 * px, 7.7 * px)

        }

        doc.font(Bold).fontSize(12).fillColor('black').text(send.mileage, 5.5 * px, 7.7 * px)
        doc.font(Bold).fontSize(12).fillColor('black').text(send.brand, 8.3 * px, 7.7 * px)
        doc.font(Bold).fontSize(12).fillColor('black').text(send.model, 11.7 * px, 7.7 * px)

        if (Object.keys(seller).length > 0) {
            doc.font(Bold).fontSize(font_customer_size).fillColor('black').text(seller.data, 0.7 * px, 3.6 * px)
        }
        if (config_pdf.check_mark?.isuse == true) {
            doc.font(Bold).fontSize(14).fillColor('black').text('/', 0.3 * px, 2.3 * px)
        }


        doc.font(Regular).fillColor('black').text(i + 1, 17.5 * px, 3.4 * px);
    }

    return doc

}

const gen_file_name = async (start_date, end_date, file_name) => {

    return uuid4() + '___' + start_date + '_' + end_date;
}



const Download = async (request, reply) => {
    const fs = require('fs')

    var file_name = request.params.file_name
    var file_name_cut = file_name.split("___")[1]
    data = await reply.download(file_name, file_name_cut)
    fs.unlinkSync("src/assets/printouts/" + file_name)

    return data
}


module.exports = {
    Download,
    printOutPdf,
    pdfGen
}