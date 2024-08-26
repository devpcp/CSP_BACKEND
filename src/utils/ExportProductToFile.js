const config = require('../config');
const { Transaction, QueryTypes, Op } = require("sequelize");
const sequelize = require('../db');
const Product = require('../models/model').Product;
const XLSX = require('xlsx-js-style');
const ProductType = require('../models/model').ProductType;
const ProductBrand = require('../models/model').ProductBrand;
const ProductModelType = require('../models/model').ProductModelType;
const User = require('../models/model').User;
const ProductTypeGroup = require('../models/model').ProductTypeGroup;
const ProductCompleteSize = require('../models/model').ProductCompleteSize;
const ShopProduct = require('../models/model').ShopProduct;

const ExportProductToFile = async () => {


    var table_name = '01HQ0006'

    var shop_product = await ShopProduct(table_name).findAll()

    try {
        var data = await Product.findAll({
            where: {
                [Op.and]: [
                    {
                        id: { [Op.in]: shop_product.map(el => { return el.product_id }) }
                    },
                    {
                        product_type_id: '50d794dd-5b4a-46b1-b876-446f6b00b539'
                    }
                ]
            },
            attributes:
                [

                    [sequelize.literal(`master_path_code_id`), 'รหัสจากโรงงาน'],
                    [sequelize.literal(`wyz_code`), 'Wyz Code'],
                    [sequelize.literal(`product_name->>'th'`), 'ชื่อสินค้า'],
                    [sequelize.literal(`"ProductType->ProductTypeGroup".group_type_name->>'th'`), 'กลุ่มสินค้า'],
                    [sequelize.literal(`"ProductType".type_name->>'th'`), 'ประเภท'],
                    [sequelize.literal(`"ProductBrand".brand_name->>'th'`), 'ยี่ห้อ'],
                    [sequelize.literal(`"ProductModelType".model_name->>'th'`), 'รุ่น'],
                    [sequelize.literal(`rim_size`), 'ความกว้างจากขอบยาง'],
                    [sequelize.literal(`width`), 'ความกว้าง'],
                    [sequelize.literal(`hight`), 'ความสูง'],
                    [sequelize.literal(`series`), 'ความสูงแก้มยาง'],
                    [sequelize.literal(`load_index`), 'ดัชนีน้ำหนักสินค้า'],
                    [sequelize.literal(`speed_index`), 'ดัชนีความเร็ว'],
                    [sequelize.literal(`"ProductCompleteSize".complete_size_name->>'th'`), 'ขนาดไซส์'],
                    [sequelize.literal(`other_details->'central_price'->'suggasted_re_sell_price'->>'retail'`), 'ราคาหน้าร้าน(ปลีก)'],
                    [sequelize.literal(`other_details->'central_price'->'suggasted_re_sell_price'->>'wholesale'`), 'ราคาหน้าร้าน(ส่ง)'],
                    [sequelize.literal(`other_details->'central_price'->'b2b_price'->>'retail'`), 'ราคาส่ง(ปลีก)'],
                    [sequelize.literal(`other_details->'central_price'->'b2b_price'->>'wholesale'`), 'ราคาส่ง(ส่ง)'],
                    [sequelize.literal(`other_details->'central_price'->'suggested_online_price'->>'retail'`), 'ราคาออนไลน์(ปลีก)'],
                    [sequelize.literal(`other_details->'central_price'->'suggested_online_price'->>'wholesale'`), 'ราคาออนไลน์(ส่ง)'],
                    [sequelize.literal(`other_details->'central_price'->'credit_30_price'->>'retail'`), 'ราคาเชื่อ 30 วัน(ปลีก)'],
                    [sequelize.literal(`other_details->'central_price'->'credit_30_price'->>'wholesale'`), 'ราคาเชื่อ 30 วัน(ส่ง)'],
                    [sequelize.literal(`other_details->'central_price'->'credit_45_price'->>'retail'`), 'ราคาเชื่อ 45 วัน(ปลีก)'],
                    [sequelize.literal(`other_details->'central_price'->'credit_45_price'->>'wholesale'`), 'ราคาเชื่อ 45 วัน(ส่ง)'],
                    [sequelize.literal(`other_details->'others_tire_detail'->'remark_others_tire_detail'->>'th'`), 'หมายเหตุ'],
                    [sequelize.literal(`other_details->'oe_tire'->>'status'`), 'OE'],
                    [sequelize.literal(`other_details->'oe_tire'->'remark_oe_tire'->>'th'`), 'หมายเหตุ OE'],
                    [sequelize.literal(`other_details->'runflat_tire'->>'status'`), 'Runflat'],
                    [sequelize.literal(`other_details->'runflat_tire'->'remark_runflat_tire'->>'th'`), 'หมายเหตุ Runflat']
                ]
            ,
            include: [
                { model: ProductType, attributes: [], include: [{ model: ProductTypeGroup }] },
                { model: ProductBrand, attributes: [] },
                { model: ProductModelType, attributes: [] },
                { model: ProductCompleteSize, attributes: [] }
            ],
            order: [['master_path_code_id', 'asc']]
        })

        data = data.map(el => { return el.dataValues })

        var ws = await XLSX.utils.json_to_sheet(data, { origin: 1 });
        for (i in ws) {
            if (typeof (ws[i]) != "object") continue;
            let cell = XLSX.utils.decode_cell(i);
            ws[i].s = { // styling for all cells
                font: {
                    name: "TH SarabunPSK",
                    sz: 16,
                }
            }
        }


        var file_name = 'product'

        var wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + file_name + '.xlsx', { cellStyles: true });


    } catch (error) {
        console.log(error)
    }



};


// module.exports = ExportProductToFile;

ExportProductToFile()