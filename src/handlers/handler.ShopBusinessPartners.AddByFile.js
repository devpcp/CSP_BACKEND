const _ = require("lodash");
const XLSX = require('xlsx')
const fs = require('fs');
const { Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilSequelizeCreateTableIfNotExistsFromModel = require("../utils/util.Sequelize.CreateTableIfNotExistsFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const {
    config_run_number_shop_business_customers_prefix,
    config_run_number_shop_business_partners_prefix
} = require('../config');
const BusinessType = require("../models/model").BusinessType;
const Province = require("../models/model").Province;
const District = require("../models/model").District;
const SubDistrict = require("../models/model").SubDistrict;
const modelShopBusinessPartners = require("../models/model").ShopBusinessPartners;

/**
 * A handler to add new shopBusiness into database
 * - Route [POST] => /api/shopBusinessPartners/add
 * @param {import("../types/type.Handler.ShopBusinessPartners").IHandlerShopBusinessCustomerAddRequest} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopBusinessPartners>>}
 */
const handlerShopBusinessPartnersAddByFile = async (request) => {

    var action = "add shopBusinessPartners by file"
    try {
        const currentDateTime = new Date()
        const user_id = request.id;

        const data = await request.body.file

        await fs.writeFileSync('src/assets/' + data.filename, await data.toBuffer());
        const wb = XLSX.readFile('src/assets/' + data.filename);
        await fs.unlinkSync('src/assets/' + data.filename)


        var data_json = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 0 })

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]

        let data_create_id_arr = []
        var create_err = []
        var header_check = [
            "รหัสจากระบบเก่า",
            "หมายเลขประจำตัวผู้เสียภาษี",
            "ประเภทธุรกิจ",
            "ชื่อธุรกิจ",
            "หมายเลขโทรศัพท์",
            "เบอร์มือถือ",
            "อีเมล",
            "ที่อยู่",
            "จังหวัด",
            "เขต/อำเภอ",
            "แขวง/ตำบล",
            "รหัสไปรษณีย์",
            "ชื่อติดต่อ",
            "รหัส AD จาก michelin",
            "สำนักงานใหญ่/สาขา",
            "รหัสสาขา",
            "ประเภทภาษี",
            "หนี้สิน",
            "เครดิตเทอม/วัน",
            "หมายเหตุ"
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


        var check_header = areEqual(header_check, header)
        if (check_header[0] == false) {
            await handleSaveLog(request, [[action], check_header[1]])
            return ({ status: 'failed', data: check_header[1] })
        }


        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const additionalPrefix = (findShopsProfileArray.length > 1) ? 'HQ' : ''

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        /**
         * A class's dynamics instance of model "ShopBusinessPartners"
         */
        const instanceModelShopBusinessPartners = modelShopBusinessPartners(table_name);
        // Create table in database if not exists
        await utilSequelizeCreateTableIfNotExistsFromModel(instanceModelShopBusinessPartners);

        var business_all = await BusinessType.findAll()
        var province_all = await Province.findAll()
        var district_all = await District.findAll()
        var subdistrict_all = await SubDistrict.findAll()

        let partner_all = await instanceModelShopBusinessPartners.findAll();

        var data_create = []
        var error = []


        const findLatestRowNumber = await instanceModelShopBusinessPartners.max(
            'run_no',
            {
                where: {
                    ['created_date']: {
                        [Op.between]: [
                            new Date(`${currentDateTime.getFullYear()}-${_.padStart(String(1), 2, "0")}-${_.padStart(String(1), 2, "0")}T00:00:00.000+07:00`).valueOf(),
                            new Date(`${currentDateTime.getFullYear()}-${_.padStart(String(12), 2, "0")}-${_.padStart(String(31), 2, "0")}T23:59:59.999+07:00`).valueOf()
                        ]
                    }
                }
            }
        ) + 1;


        for (let index = 0; index < data_json.length; index++) {
            const element = data_json[index];
            error_check = 0

            if (!element.hasOwnProperty("ชื่อธุรกิจ")) {
                error_check = error_check + 1
                error.push({ index: index + 2, cases: 'ชื่อธุรกิจ is required' })
            }

            bus_type_id = null
            if (element.hasOwnProperty("ประเภทธุรกิจ")) {
                bus_type_id = business_all.filter(el => { return el.business_type_name.th.replace(' ', '').includes(element.ประเภทธุรกิจ.replace(' ', '')) })

                if (bus_type_id.length == 0) {

                    //     var check_order = await BusinessType.max('order_by') || 0
                    //     const createRunNumber = await utilGetRunNumberFromModel(
                    //         BusinessType,
                    //         'run_no',
                    //         {
                    //             prefix_config: await utilGetDocumentTypePrefix(
                    //                 _.get(request.body, 'doc_type_id', ''),
                    //                 {
                    //                     defaultPrefix: config_run_number_shop_business_partners_prefix
                    //                 }
                    //             ).then(r => r.prefix)
                    //         }
                    //     );
                    //     var createdDocument = await BusinessType.create(
                    //         {
                    //             business_type_name: { th: element["ประเภทธุรกิจ"], en: element["ประเภทธุรกิจ"] },
                    //             code_id: createRunNumber.runString,
                    //             run_no: createRunNumber.runNumber,
                    //             isuse: 1,
                    //             order_by: check_order + 1,
                    //             created_by: request.id,
                    //             created_date: Date.now()
                    //         }
                    //     );

                    //     business_all.push({ ...createdDocument.dataValues })

                    //     bus_type_id = [createdDocument.dataValues]
                    //     bus_type_id = bus_type_id[0].id

                    error_check = error_check + 1
                    error.push({ index: index + 2, cases: 'bus_type_id not found' })
                } else {
                    bus_type_id = bus_type_id[0].id
                }

            }


            var tel_no = {}
            if (element.hasOwnProperty("หมายเลขโทรศัพท์")) {
                tel_no_ = element.หมายเลขโทรศัพท์.split(',')
                for (let index1 = 0; index1 < tel_no_.length; index1++) {
                    tel_no['tel_no_' + (index1 + 1)] = tel_no_[index1]
                }
            }

            var mobile_no = {}
            if (element.hasOwnProperty("เบอร์มือถือ")) {
                mobile_no_ = element.เบอร์มือถือ.split(',')
                for (let index1 = 0; index1 < mobile_no_.length; index1++) {
                    mobile_no['mobile_no_' + (index1 + 1)] = mobile_no_[index1]
                }
            }

            province_id = null
            if (element.hasOwnProperty("จังหวัด")) {
                province_id = province_all.filter(el => { return el.prov_name_th.includes(element.จังหวัด) })
                if (province_id.length > 0) {
                    province_id = province_id[0].id
                } else {
                    province_id = null
                    error_check = error_check + 1
                    error.push({ index: index + 2, cases: 'จังหวัด not found' })
                }
            }

            district_id = null
            if (element.hasOwnProperty("เขต/อำเภอ")) {

                district_id = district_all.filter(el => { return el.name_th.includes(element["เขต/อำเภอ"]) && el.province_id == province_id })

                if (district_id.length > 0) {
                    district_id = district_id[0].id
                } else {
                    district_id = null
                    error_check = error_check + 1
                    error.push({ index: index + 2, cases: 'เขต/อำเภอ not found' })
                }
            }

            subdistrict_id = null
            if (element.hasOwnProperty("แขวง/ตำบล")) {

                subdistrict_id = subdistrict_all.filter(el => { return el.name_th.includes(element["แขวง/ตำบล"]) && el.district_id == district_id })

                if (subdistrict_id.length > 0) {
                    subdistrict_id = subdistrict_id[0].id

                } else {
                    subdistrict_id = null
                    error_check = error_check + 1
                    error.push({ index: index + 2, cases: 'แขวง/ตำบล not found' })
                }
            }

            let other_details = {}


            let check_existing = partner_all.filter(el => {
                if (element["รหัสลูกค้าจากระบบเดิม"]) {
                    return el.other_details.code_from_old_system === element["รหัสลูกค้าจากระบบเดิม"] &&
                        el.partner_name.th === element.ชื่อธุรกิจ
                } else {
                    return el.partner_name.th === element.ชื่อธุรกิจ && el.tax_id === element["หมายเลขประจำตัวผู้เสียภาษี"]
                }
            })

            if (check_existing.length > 0) {
                other_details = check_existing[0].other_details
            }


            if (element.hasOwnProperty("ชื่อติดต่อ")) {
                other_details.contact_name = element.ชื่อติดต่อ
            }
            if (element.hasOwnProperty("รหัส AD จาก michelin")) {
                other_details.match_ad_michelin = element["รหัส AD จาก michelin"]
            }


            if (element.hasOwnProperty("รหัสลูกค้าจากระบบเดิม")) {
                other_details.code_from_old_system = element["รหัสลูกค้าจากระบบเดิม"]
            }

            if (element.hasOwnProperty("สำนักงานใหญ่/สาขา")) {
                if (element["สำนักงานใหญ่/สาขา"] == 'สำนักงานใหญ่') {
                    other_details.branch = 'office'
                } else if (element["สำนักงานใหญ่/สาขา"] == 'สาขา') {
                    other_details.branch = 'branch'
                }
            }

            if (element.hasOwnProperty("รหัสสาขา")) {
                other_details.branch_code = element["รหัสสาขา"]
            }

            if (element.hasOwnProperty("ชื่อสาขา")) {
                other_details.branch_name = element["ชื่อสาขา"]
            }

            if (element.hasOwnProperty("ประเภทภาษี")) {
                other_details.credit_term = element["ประเภทภาษี"]
            }

            if (element.hasOwnProperty("หนี้สิน")) {
                other_details.debt = element["หนี้สิน"]
            }

            if (element.hasOwnProperty("เครดิตเทอม/วัน")) {
                other_details.credit_term = element["เครดิตเทอม/วัน"]
            }

            if (element.hasOwnProperty("หมายเหตุ")) {
                other_details.note = element["หมายเหตุ"]
            }

            if (check_existing.length > 0) {

                await instanceModelShopBusinessPartners.update({
                    tax_id: (element.hasOwnProperty("หมายเลขประจำตัวผู้เสียภาษี")) ? element["หมายเลขประจำตัวผู้เสียภาษี"] : undefined,
                    bus_type_id: bus_type_id,
                    partner_name: { "th": element.ชื่อธุรกิจ, "en": '' },
                    tel_no: tel_no,
                    mobile_no: mobile_no,
                    e_mail: (element.hasOwnProperty("อีเมล")) ? element["อีเมล"] : undefined,
                    address: (element.hasOwnProperty("ที่อยู่")) ? { th: element["ที่อยู่"], en: '' } : {},
                    subdistrict_id: subdistrict_id,
                    district_id: district_id,
                    province_id: province_id,
                    other_details: other_details,
                    updated_by: user_id,
                    updated_date: currentDateTime
                }, {
                    where: {
                        id: check_existing[0].id
                    }
                })

                data_create_id_arr.push(check_existing[0].id)

            } else {

                let createRunNumber = {}

                let newStringRowNumber = _.padStart(String(findLatestRowNumber + index), 3, "0");
                let newStringYear = _.padStart(String(currentDateTime.getFullYear()).slice(2, 4), 2, "0");
                let concatStringRunNumber = `${config_run_number_shop_business_customers_prefix + additionalPrefix}${newStringYear}${newStringRowNumber}`;

                createRunNumber.runNumber = findLatestRowNumber + index
                createRunNumber.runString = concatStringRunNumber

                // if (error_check == 0) {

                data_create.push({
                    shop_id: findShopsProfile.id,
                    code_id: createRunNumber.runString,
                    tax_id: (element.hasOwnProperty("หมายเลขประจำตัวผู้เสียภาษี")) ? element["หมายเลขประจำตัวผู้เสียภาษี"] : undefined,
                    bus_type_id: bus_type_id,
                    partner_name: { "th": element.ชื่อธุรกิจ, "en": '' },
                    tel_no: tel_no,
                    mobile_no: mobile_no,
                    e_mail: (element.hasOwnProperty("อีเมล")) ? element["อีเมล"] : undefined,
                    address: (element.hasOwnProperty("ที่อยู่")) ? { th: element["ที่อยู่"], en: '' } : {},
                    subdistrict_id: subdistrict_id,
                    district_id: district_id,
                    province_id: province_id,
                    other_details: other_details,
                    run_no: createRunNumber.runNumber,
                    created_by: user_id,
                    created_date: currentDateTime,
                    updated_by: null,
                    updated_date: null,
                })
                // }
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

            await handleSaveLog(request, [[action], error_str])
            // return ({ status: 'failed', data: error_str })
        }


        let data_create_id_arr_ = await instanceModelShopBusinessPartners.bulkCreate(data_create);

        //HQ

        data_create_id_arr_ = data_create_id_arr_.map(el => { return el.id })
        data_create_id_arr.push(...[...data_create_id_arr_])

        let customer_from_hq = await instanceModelShopBusinessPartners.findAll({
            where: {
                id: { [Op.in]: data_create_id_arr }
            }
        })



        for (let index = 0; index < findShopsProfileArray.length; index++) {
            const element = findShopsProfileArray[index];
            if (element.shop_code_id !== table_name) {


                let customer_all = await modelShopBusinessPartners(element.shop_code_id).findAll()
                let data_create1 = []
                for (let index1 = 0; index1 < customer_from_hq.length; index1++) {
                    const element1 = customer_from_hq[index1];

                    let check_existing = customer_all.filter(el => {
                        return el.other_details.code_from_old_system === element1.other_details.code_from_old_system &&
                            element1.other_details.code_from_old_system &&
                            el.partner_name.th === element1.partner_name.th
                    })

                    let check_tax = customer_all.filter(el => {
                        return el.tax_id === element1.tax_id
                    })

                    let tax_id = null
                    if (check_tax.length == 0) {
                        tax_id = element1.tax_id
                    }

                    if (check_existing.length == 0) {
                        data_create1.push({ ...element1.dataValues, ...{ shop_id: element.id }, ...{ tax_id: tax_id } })
                    }


                }

                await modelShopBusinessPartners(element.shop_code_id).bulkCreate(data_create1).then().catch(error => { console.log(error) })

            }

        }

        await handleSaveLog(request, [[action, findShopsProfile.id], ""]);
        return utilSetFastifyResponseJson("success", "successful");

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], `error : ${error}`]);
        return utilSetFastifyResponseJson("failed", error);
    }
};

module.exports = handlerShopBusinessPartnersAddByFile;