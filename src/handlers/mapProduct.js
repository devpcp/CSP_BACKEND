const XLSX = require('xlsx');
const fs = require('fs');
const { Op, QueryTypes } = require("sequelize");
const { handleSaveLog } = require('./log');

const db = require('../db');
const Dealers = require('../models/model').Dealers;
const Product = require('../models/model').Product;
const ProductType = require('../models/model').ProductType
const ProductBrand = require('../models/model').ProductBrand;
const ProductModelType = require('../models/model').ProductModelType;
const ProductCompleteSize = require('../models/model').ProductCompleteSize;
const ProductTypeGroup = require('../models/model').ProductTypeGroup;

const handleAddJson = async (request, res) => {

    try {

        const rdcode = request.query.rdcode

        const data_json = request.body

        var create_err = []
        var check_rdcode = await Dealers.findAll({
            where: { master_dealer_code_id: { [Op.like]: '%' + rdcode } }
        })

        if (!check_rdcode[0]) {
            return ({ status: 'failed', data: 'rdcode not found in dealer' })
        }


        await new Promise(async (resolve, reject) => {
            await data_json.forEach(async (element, index, array) => {

                try {
                    if (!(element.hasOwnProperty('สินค้า') && element.hasOwnProperty('IDML'))) {
                        reject("required IDML if IDML null can set ''")
                    }
                    if (element.สินค้า != null) {
                        // element.สินค้า
                        var check_product = []
                        if (element.IDML != null) {
                            check_product = await Product.findAll({
                                where: {
                                    [Op.or]: [
                                        { master_path_code_id: element.IDML.toString() },
                                    ]
                                }
                            })
                        } else if (element.IDML == null || check_product.length == 0) {
                            check_product = await db.query(`select * from app_datas.dat_products where  REPLACE( product_name->>'th',' ','') LIKE  REPLACE( :product_name_th,' ','')`, {
                                type: QueryTypes.SELECT,
                                replacements: { product_name_th: '%' + element.สินค้า + '%' },
                            })

                            // check_product = await Customer.findAll({
                            //     where: {
                            //         product_name: {
                            //             th: { [Op.like]: '%' + element.สินค้า + '%' }
                            //         }
                            //     }
                            // })

                        }

                        if (check_product.length == 0) {
                            var product_all = await Product.findAll({})
                            await new Promise(async (resolve, reject) => {
                                await product_all.forEach(async (element1, index1, array1) => {
                                    if (similar(element.สินค้า, element1.product_name.th) > 74) {
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
                                    if (similar(element.สินค้า, element1.product_name.name_from_dealer) > 74) {
                                        check_product.push(element1)
                                    }
                                    if (index1 === array1.length - 1) resolve();
                                })
                            })
                        }

                        var brand = []
                        if (element.brand != null) {
                            brand = await ProductBrand.findAll({
                                where: {
                                    brand_name: {
                                        th: { [Op.like]: '%' + element.brand + '%' }
                                    }
                                }
                            })
                        }


                        if (check_product.length > 0) {
                            create_err.push(["index " + index + "already then update instead"])

                            await Product.update({
                                product_name: { th: check_product[0].product_name.th, en: check_product[0].product_name.en, name_from_dealer: element.สินค้า },
                                product_brand_id: (brand.length > 0) ? brand[0].id : null,
                                // master_path_code_id: (element.IDML.toString() != null) ? element.IDML.toString() : null,
                                updated_by: request.id,
                                updated_date: new Date()

                            }, {
                                where: {
                                    id: check_product[0].id
                                }
                            }).then(function (item) {
                            }).catch(function (err) {
                                console.log(err)
                                create_err.push(["index " + index + " error :" + err.errors[0].message])
                            });

                            // product_id = check_product[0].id
                        }
                        else {


                            // var check_uniq = []
                            // if (element.hasOwnProperty("IDML")) {
                            //     await Product.findAll({
                            //         where: {
                            //             master_path_code_id: element.IDML.toString()
                            //         }
                            //     }).then(function (item) {
                            //         check_uniq = item
                            //     }).catch(function (err) {
                            //         console.log(err)
                            //     });
                            // }

                            // if (check_uniq.length > 0) {
                            //     create_err.push(index)
                            // } else {

                            await Product.create({
                                product_name: { th: element.สินค้า, en: '', name_from_dealer: element.สินค้า },
                                product_brand_id: (brand.length > 0) ? brand[0].id : null,
                                master_path_code_id: (element.IDML != null) ? element.IDML.toString() : null,
                                isuse: 1,
                                created_by: request.id,
                                created_date: new Date()
                            }).then(function (item) {
                            }).catch(function (err) {
                                console.log(err)
                                create_err.push(["index " + index + " error :" + err.errors[0].message])
                            });

                            // }



                        }

                    }

                    if (index === array.length - 1) resolve();
                } catch (error) {
                    reject(error)
                }

            });
        });

        var err_str = ''
        if (create_err.length > 0) {
            err_str = ' but index ' + create_err.toString() + ' have something uniqe '
        }


        await handleSaveLog(request, [['Match product by json'], err_str])
        return ({ status: "successful", data: "success" + err_str })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['Match product by json'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }


}




const handleAddFile = async (request, res) => {

    try {


        const file = await request.body.file

        await fs.writeFileSync('src/assets/' + file.filename, await file.toBuffer());
        const wb = XLSX.readFile('src/assets/' + file.filename);
        await fs.unlinkSync('src/assets/' + file.filename)

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]
        var data = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 0 })

        var header_ = [
            "รหัสจากโรงงาน",
            "Wyz Code",
            "ชื่อสินค้า",
            "กลุ่มสินค้า",
            "ประเภท",
            "ยี่ห้อ",
            "รุ่น",
            "หน้ายาง",
            "แก้มยาง",
            "ขอบยาง",
            "ความสูง",
            "ความสูงแก้มยาง",
            "ดัชนีน้ำหนักสินค้า",
            "ดัชนีความเร็ว",
            "ขนาดไซส์",
            "ราคาหน้าร้าน(ปลีก)",
            "ราคาหน้าร้าน(ส่ง)",
            "ราคาส่ง(ปลีก)",
            "ราคาส่ง(ส่ง)",
            "ราคาออนไลน์(ปลีก)",
            "ราคาออนไลน์(ส่ง)",
            "ราคาเชื่อ 30 วัน(ปลีก)",
            "ราคาเชื่อ 30 วัน(ส่ง)",
            "ราคาเชื่อ 45 วัน(ปลีก)",
            "ราคาเชื่อ 45 วัน(ส่ง)",
            "หมายเหตุ",
            "OE",
            "หมายเหตุ OE",
            "Runflat",
            "หมายเหตุ Runflat"
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

        var check_header = areEqual(header_, header)

        if (check_header[0] == false) {
            // await handleSaveLog(request, [['put stock by file'], check_header[1]])
            return ({ status: 'failed', data: check_header[1] })
        }

        data.map(el => {
            var data = {}
            header.map(el1 => {
                return data[el1] = (el[el1] ? el[el1] : null)
            })
            return data
        })

        // check exist by master_path_code_id
        // var product = await Product.destroy({
        //     where: { master_path_code_id: data.map(el => { return el.รหัสจากโรงงาน.toString() }) }
        // })
        // return product.length

        var group_type_name_all = await ProductTypeGroup.findAll({})

        var type_name_all = await ProductType.findAll({})

        var brand_name_all = await ProductBrand.findAll()

        var complete_size_name_all = await ProductCompleteSize.findAll()

        var model_name_all = await ProductModelType.findAll({
            include: [{ model: ProductType }, { model: ProductBrand }]
        })

        var product_all = await Product.findAll()


        var error = []
        var data_create = []
        var model_create = []
        //673
        for (let index = 0; index < data.length; index++) {
            const element = data[index];



            var data2 = {}
            var product_type_id = []
            var product_brand_id = []
            var complete_size_id = []
            var product_model_id = []

            if (element['กลุ่มสินค้า']) {
                type_group_id = group_type_name_all.filter(el => { return el.group_type_name.th.toLowerCase().replace(/ /g, "") == element['กลุ่มสินค้า'].toLowerCase().replace(/ /g, "") })

                if (type_group_id.length == 0) {
                    // error.push({ index: element['รหัสจากโรงงาน'] + ' ประเภท ไม่เจอ' })
                    type_group_id = await ProductTypeGroup.create(
                        {
                            code_id: element['กลุ่มสินค้า'].toUpperCase().replace(/ /g, ""),
                            group_type_name: { th: element['กลุ่มสินค้า'], en: element['กลุ่มสินค้า'] },
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    group_type_name_all.push({ ...type_group_id.dataValues })
                    type_group_id = [type_group_id.dataValues]
                }
            }

            if (element['ประเภท']) {
                product_type_id = type_name_all.filter(el => { return el.type_name.th.toLowerCase().replace(/ /g, "") == element['ประเภท'].toLowerCase().replace(/ /g, "") })

                if (product_type_id.length == 0) {
                    // error.push({ index: element['รหัสจากโรงงาน'] + ' ประเภท ไม่เจอ' })
                    product_type_id = await ProductType.create(
                        {
                            code_id: element['ประเภท'].toUpperCase().replace(/ /g, ""),
                            type_name: { th: element['ประเภท'], en: element['ประเภท'] },
                            type_group_id: type_group_id[0].id,
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    type_name_all.push({ ...product_type_id.dataValues })
                    product_type_id = [product_type_id.dataValues]
                }
            }

            if (element['ยี่ห้อ'] && element['ยี่ห้อ'] != '') {
                product_brand_id = brand_name_all.filter(el => { return el.brand_name.th.toString().toLowerCase().replace(/ /g, "") == element['ยี่ห้อ'].toString().toLowerCase().replace(/ /g, "") })

                if (product_brand_id.length == 0) {
                    // error.push({ index: element['รหัสจากโรงงาน'] + ' ยี่ห้อ ไม่เจอ' })

                    product_brand_id = await ProductBrand.create(
                        {
                            code_id: element['ยี่ห้อ'].toString().toUpperCase().replace(/ /g, ""),
                            brand_name: { th: element['ยี่ห้อ'], en: element['ยี่ห้อ'] },
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    brand_name_all.push({ ...product_brand_id.dataValues })
                    product_brand_id = [product_brand_id.dataValues]
                }
            }

            if (element['ขนาดไซส์']) {
                complete_size_id = complete_size_name_all.filter(el => { return el.complete_size_name.th.toLowerCase().replace(/ /g, "") == element['ขนาดไซส์'].toLowerCase().replace(/ /g, "") })

                if (complete_size_id.length == 0) {
                    error.push({ index: element['รหัสจากโรงงาน'] + ' ขนาดไซส์ ไม่เจอ' })
                }
            }

            if (element['รุ่น'] && element['รุ่น'] != '' && element['ยี่ห้อ'] && element['ยี่ห้อ'] != '') {
                product_model_id = model_name_all.filter(el => {
                    return el.model_name.th.toLowerCase().replace(/ /g, "") == element['รุ่น'].toString().toLowerCase().replace(/ /g, "") &&
                        el.ProductType.type_name.th.toLowerCase().replace(/ /g, "") == element['ประเภท'].toLowerCase().replace(/ /g, "") &&
                        el.ProductBrand.brand_name.th.toString().toLowerCase().replace(/ /g, "") == element['ยี่ห้อ'].toString().toLowerCase().replace(/ /g, "")
                })

                if (product_model_id.length == 0) {
                    product_model_id = await ProductModelType.create(
                        {
                            code_id: element['รุ่น'].toString().toUpperCase().replace(/ /g, ""),
                            model_name: { th: element['รุ่น'].toString(), en: element['รุ่น'].toString() },
                            product_type_id: product_type_id[0].id,
                            product_brand_id: product_brand_id[0].id,
                            created_by: request.id,
                            created_date: new Date()
                        }
                    )
                    model_name_all.push({ ...product_model_id.dataValues, ProductType: product_type_id[0], ProductBrand: product_brand_id[0] })
                    product_model_id = [product_model_id.dataValues]
                }
                else if (product_model_id.length > 1) {
                    error.push({ index: element['รหัสจากโรงงาน'] + ' รุ่น มากกว่า 1' })
                }

                product_type_id = [{ id: product_model_id[0].product_type_id }]
                product_brand_id = [{ id: product_model_id[0].product_brand_id }]

            }


            product_type_id = (product_type_id.length > 0) ? product_type_id[0].id : null
            product_brand_id = (product_brand_id.length > 0) ? product_brand_id[0].id : null
            product_model_id = (product_model_id.length > 0) ? product_model_id[0].id : null
            complete_size_id = (complete_size_id.length > 0) ? complete_size_id[0].id : null



            /**
             * check duplicate in db
             */
            var check_duplicate = product_all.filter(el => {
                // return el.master_path_code_id == element['รหัสจากโรงงาน'] && el.product_name.th.includes(element['ชื่อสินค้า']) &&
                //     el.product_type_id == product_type_id &&
                //     el.product_brand_id == product_brand_id &&
                //     el.product_model_id == product_model_id
                return el.product_code == element['รหัสจากโรงงาน']
            })

            data2.master_path_code_id = element['รหัสจากโรงงาน']
            data2.product_code = element['รหัสจากโรงงาน']
            data2.wyz_code = element['Wyz Code']
            data2.product_name = { th: element['ชื่อสินค้า'], en: element['ชื่อสินค้า'] }
            data2.product_type_id = product_type_id
            data2.product_brand_id = product_brand_id
            data2.product_model_id = product_model_id
            data2.rim_size = parseFloat(element['ขอบยาง']) || null
            data2.width = parseFloat(element['หน้ายาง']) || null
            data2.hight = parseFloat(element['ความสูง']) || null
            data2.series = parseFloat(element['แก้มยาง']) || null
            data2.load_index = element['ดัชนีน้ำหนักสินค้า']
            data2.speed_index = element['ดัชนีความเร็ว']
            data2.complete_size_id = complete_size_id
            data2.isuse = 1
            data2.created_by = request.id
            data2.created_date = new Date()
            data2.other_details = {
                central_price: {
                    "suggasted_re_sell_price": {
                        "retail": parseFloat(element['ราคาหน้าร้าน(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาหน้าร้าน(ส่ง)'])
                    },
                    "b2b_price": {
                        "retail": parseFloat(element['ราคาส่ง(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาส่ง(ส่ง)'])
                    },
                    "suggested_online_price": {
                        "retail": parseFloat(element['ราคาออนไลน์(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาออนไลน์(ส่ง)'])
                    },
                    "credit_30_price": {
                        "retail": parseFloat(element['ราคาเชื่อ 30 วัน(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาเชื่อ 30 วัน(ส่ง)'])
                    },
                    "credit_45_price": {
                        "retail": parseFloat(element['ราคาเชื่อ 45 วัน(ปลีก)']),
                        "wholesale": parseFloat(element['ราคาเชื่อ 45 วัน(ส่ง)'])
                    }
                },
                others_tire_detail: {
                    remark_others_tire_detail: { th: element['หมายเหตุ'] },
                    status: (element['หมายเหตุ'] != null) ? true : false
                },
                oe_tire: {
                    remark_oe_tire: { th: element['หมายเหตุ OE'] },
                    status: (element['OE'] != null) ? true : false
                },
                runflat_tire: {
                    remark_runflat_tire: { th: element['หมายเหตุ Runflat'] },
                    status: (element['Runflat'] != null) ? true : false
                },
                "based_price": null,
                "suggested_promote_price": null,
                "normal_price": null,
                "benchmark_price": null,
                "include_vat_price": null,
                "exclude_vat_price": null,
                "other_shops": [
                    {
                        "prohand_price": null,
                        "ezyFit_price": null,
                        "wyz_price": null,
                        "auto_one_price": null,
                        "ycc_price": null
                    }
                ]
            }

            if (check_duplicate.length == 0) {
                data_create.push(data2)
            } else if (check_duplicate.length == 1) {

                delete data2.created_by
                delete data2.created_date

                data2.updated_by = request.id
                data2.updated_date = new Date()

                await Product.update(data2, { where: { id: check_duplicate[0].id } }).catch(err => {
                    console.log(err)
                })

            }


        }


        var product_create = await Product.bulkCreate(data_create)


        if (error.length > 0) {
            throw error
        }


        await handleSaveLog(request, [['Match product file'], ''])
        return ({ status: "success", data: "success" })

    }
    catch (error) {
        console.log(error)
        error = error
        await handleSaveLog(request, [['Match product file'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }




}



const handleExportProduct = async (request, res) => {

    try {

        var type_group_id = request.query.type_group_id


        var data = await Product.findAll({
            attributes: [
                [db.literal("master_path_code_id"), 'รหัสจากโรงงาน'],
                [db.literal("(select null )"), 'รหัสจากบาร์โคด'],
                [db.literal("product_name->>'th'"), 'ชื่อสินค้า'],
                [db.literal(`"ProductType->ProductTypeGroup".group_type_name->>'th'`), 'กลุ่มสินค้า'],
                [db.literal(`"ProductType".type_name->>'th'`), 'ประเภท'],
                [db.literal(`"ProductBrand".brand_name->>'th'`), 'ยี่ห้อ'],
                [db.literal(`"ProductModelType".model_name->>'th'`), 'รุ่น']
            ],
            include: [
                {
                    model: ProductType, include: [
                        { model: ProductTypeGroup }
                    ]
                },
                { model: ProductBrand },
                { model: ProductModelType }


            ],
            where: {
                [Op.and]: [db.literal(`"ProductType->ProductTypeGroup".id = :type_group_id`)]
            },
            replacements: { type_group_id: type_group_id }
        })


        data = data.map(el => {
            return el.dataValues
        })
        // var header_ = [
        //     "รหัสจากโรงงาน",
        //     "รหัสจากบาร์โคด",
        //     "ชื่อสินค้า",
        //     "กลุ่มสินค้า",
        //     "ประเภท",
        //     "ยี่ห้อ",
        //     "รุ่น",
        //     "ความกว้างจากขอบยาง",
        //     "ความกว้าง",
        //     "ความสูง",
        //     "ความสูงแก้มยาง",
        //     "ดัชนีน้ำหนักสินค้า",
        //     "ดัชนีความเร็ว",
        //     "ขนาดไซส์",
        //     "ราคาหน้าร้าน(ปลีก)",
        //     "ราคาหน้าร้าน(ส่ง)",
        //     "ราคาส่ง(ปลีก)",
        //     "ราคาส่ง(ส่ง)",
        //     "ราคาออนไลน์(ปลีก)",
        //     "ราคาออนไลน์(ส่ง)",
        //     "ราคาเชื่อ 30 วัน(ปลีก)",
        //     "ราคาเชื่อ 30 วัน(ส่ง)",
        //     "ราคาเชื่อ 45 วัน(ปลีก)",
        //     "ราคาเชื่อ 45 วัน(ส่ง)",
        //     "หมายเหตุ",
        //     "OE",
        //     "หมายเหตุ OE",
        //     "Runflat",
        //     "หมายเหตุ Runflat"
        // ]


        var ws = await XLSX.utils.json_to_sheet(data, { origin: 0 });
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

        var wb = await XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        await XLSX.writeFile(wb, "src/assets/" + 'export_product' + '.xlsx', { cellStyles: true });

        return ({ status: "success", data: 'export_product' + '.xlsx' })

    }
    catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['Match product file'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }




}

module.exports = {
    handleAddFile,
    handleAddJson,
    handleExportProduct
}