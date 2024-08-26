const _ = require("lodash");
const XLSX = require('xlsx');
const fs = require('fs');
const { Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const { config_run_number_shop_personal_customers_prefix } = require("../config");

const Province = require("../models/model").Province;
const District = require("../models/model").District;
const SubDistrict = require("../models/model").SubDistrict;
const NameTitle = require("../models/model").NameTitle;
const modelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers;
const ShopTags = require("../models/ShopTags/ShopTags");

/**
 * A handler to add new shopPersonal into database
 * - Route [POST] => /api/shopPersonalCustomers/add
 * @param {import("../types/type.Handler.ShopPersonalCustomers").IHandlerShopPersonalCustomerAddRequest} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopPersonalCustomers>>}
 */
const handlerShopPersonalCustomersAddByFile = async (request) => {

    const action = "add shopPersonalCustomers by file";
    try {
        const currentDateTime = new Date();
        const user_id = request.id;

        const data = await request.body.file

        await fs.writeFileSync('src/assets/' + data.filename, await data.toBuffer());
        const wb = XLSX.readFile('src/assets/' + data.filename);
        await fs.unlinkSync('src/assets/' + data.filename)


        var data_json = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 0 })

        const header = await XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, range: 0 })[0]

        var create_err = []

        let data_create_id_arr = []
        var header_check = [
            "รหัสลูกค้าจากระบบเดิม",
            "หมายเลขประจำตัวผู้เสียภาษี",
            "คำนำหน้าชื่อ",
            "ชื่อ",
            "สกุล",
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
            "เครดิตเทอม",
            "วงเงินเครดิต",
            "หนี้สิน",
            "หมายเหตุ",
            "แท๊ก"
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
         * A class's dynamics instance of model "ShopPersonalCustomers"
         */
        const instanceModelShopPersonalCustomers = modelShopPersonalCustomers(table_name);

        var province_all = await Province.findAll()
        var district_all = await District.findAll()
        var subdistrict_all = await SubDistrict.findAll()
        var name_title_all = await NameTitle.findAll()
        let customer_all = await instanceModelShopPersonalCustomers.findAll()
        let tag_all = await ShopTags(table_name).findAll()

        let id_card_number_arr = customer_all.map(el => { return el.id_card_number })

        var data_create = []
        var error = []
        const findLatestRowNumber = await instanceModelShopPersonalCustomers.max(
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

            if (!element.hasOwnProperty("ชื่อ")) {
                error_check = error_check + 1
                error.push({ index: index + 2, cases: 'ชื่อ is required' })
            }

            name_title_id = null
            if (element.hasOwnProperty("คำนำหน้าชื่อ")) {
                name_title_id = name_title_all.filter(el => { return el.name_title.th.includes(element.คำนำหน้าชื่อ) })
                if (name_title_id.length > 0) {
                    name_title_id = name_title_id[0].id
                } else {
                    name_title_id = null
                }
            }


            var tel_no = {}
            if (element.hasOwnProperty("หมายเลขโทรศัพท์")) {
                tel_no_ = element.หมายเลขโทรศัพท์.split(',')
                for (let index1 = 0; index1 < tel_no_.length; index1++) {
                    tel_no['tel_no_' + (index1 + 1)] = tel_no_[index1]
                }
            }

            let mobile_no = {}
            if (element.hasOwnProperty("เบอร์มือถือ")) {
                mobile_no_ = element.เบอร์มือถือ.split(',')
                for (let index1 = 0; index1 < mobile_no_.length; index1++) {
                    mobile_no['mobile_no_' + (index1 + 1)] = mobile_no_[index1]
                }
            }

            province_id = null
            if (element.hasOwnProperty("จังหวัด")) {
                province_id = province_all.filter(el => { return el.prov_name_th.includes(element["จังหวัด"].replace(' ', '')) })

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

                district_id = district_all.filter(el => { return el.name_th.includes(element["เขต/อำเภอ"].replace(' ', '')) && el.province_id == province_id })

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
                subdistrict_id = subdistrict_all.filter(el => { return el.name_th.includes(element["แขวง/ตำบล"].replace(' ', '')) && el.district_id == district_id })

                if (subdistrict_id.length > 0) {
                    subdistrict_id = subdistrict_id[0].id
                } else {
                    subdistrict_id = null
                    error_check = error_check + 1
                    error.push({ index: index + 2, cases: 'แขวง/ตำบล not found' })
                }
            }


            other_details = {}
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

            if (element.hasOwnProperty("เครดิตเทอม")) {
                other_details.credit_term = element["เครดิตเทอม"]
            }

            if (element.hasOwnProperty("วงเงินเครดิต")) {
                other_details.credit_limit = element["วงเงินเครดิต"]
            }

            if (element.hasOwnProperty("หนี้สิน")) {
                other_details.debt = element["หนี้สิน"]
            }

            if (element.hasOwnProperty("หมายเหตุ")) {
                other_details.note = element["หมายเหตุ"]
            }


            let tags = []

            if (element.hasOwnProperty("แท๊ก")) {
                let tag_arr = element["แท๊ก"].split(',')

                for (let index = 0; index < tag_arr.length; index++) {
                    const element = tag_arr[index];

                    let check = tag_all.filter(el => { return el.tag_name.th.replace(' ', '').toLowerCase() == element.replace(' ', '').toLowerCase() })
                    if (check.length > 0) {
                        tags.push(check[0].id)
                    }
                }


            }

            let id_card_number = null

            if (element.hasOwnProperty("หมายเลขประจำตัวผู้เสียภาษี")) {
                if (!id_card_number_arr.includes(element["หมายเลขประจำตัวผู้เสียภาษี"])) {
                    id_card_number = element["หมายเลขประจำตัวผู้เสียภาษี"]
                    id_card_number_arr.push(element["หมายเลขประจำตัวผู้เสียภาษี"])
                }
            }



            let check_existing = customer_all.filter(el => {
                return el.other_details.code_from_old_system === element["รหัสลูกค้าจากระบบเดิม"] &&
                    element["รหัสลูกค้าจากระบบเดิม"] &&
                    el.customer_name.first_name.th === element.ชื่อ &&
                    el.customer_name.last_name.th === element.สกุล


                if (element["รหัสลูกค้าจากระบบเดิม"]) {
                    return el.other_details.code_from_old_system === element["รหัสลูกค้าจากระบบเดิม"] &&
                        el.customer_name.first_name.th === element.ชื่อ &&
                        el.customer_name.last_name.th === element.สกุล
                } else {
                    return el.customer_name.first_name.th === element.ชื่อ &&
                        el.customer_name.last_name.th === element.สกุล &&
                        el.id_card_number === id_card_number
                }
            })
            if (check_existing.length > 0) {

                await instanceModelShopPersonalCustomers.update({
                    id_card_number: id_card_number,
                    name_title_id: name_title_id,
                    customer_name: { "first_name": { "th": element.ชื่อ }, "last_name": { "th": element.สกุล || null } },
                    tel_no: tel_no,
                    mobile_no: mobile_no,
                    e_mail: (element.hasOwnProperty("อีเมล")) ? element["อีเมล"] : undefined,
                    address: (element.hasOwnProperty("ที่อยู่")) ? { th: element["ที่อยู่"], en: '' } : {},
                    subdistrict_id: subdistrict_id,
                    district_id: district_id,
                    province_id: province_id,
                    other_details: other_details,
                    updated_by: user_id,
                    updated_date: currentDateTime,
                    tags: tags
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
                let concatStringRunNumber = `${config_run_number_shop_personal_customers_prefix + additionalPrefix}${newStringYear}${newStringRowNumber}`;

                createRunNumber.runNumber = findLatestRowNumber + index
                createRunNumber.runString = concatStringRunNumber

                // if (error_check == 0) {
                data_create.push({
                    shop_id: findShopsProfile.id,
                    master_customer_code_id: createRunNumber.runString,
                    id_card_number: id_card_number,
                    name_title_id: name_title_id,
                    customer_name: { "first_name": { "th": element.ชื่อ }, "last_name": { "th": element.สกุล || null } },
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
                    tags: tags
                })
                // }
            }



        }

        var error_str = ''

        if (error.length > 0) {

            const groupByCases = error.reduce((group, product) => {
                const { cases } = product;
                group[cases] = group[cases] ?? [];
                group[cases].push(product.index);
                return group;
            }, {});
            `   `
            var error_str = JSON.stringify(groupByCases)

            // await handleSaveLog(request, [[action], error_str])
            // return ({ status: 'failed', data: error_str })
        }

        let data_create_id_arr_ = await instanceModelShopPersonalCustomers.bulkCreate(data_create);

        //HQ

        data_create_id_arr_ = data_create_id_arr_.map(el => { return el.id })
        data_create_id_arr.push(...[...data_create_id_arr_])

        let customer_from_hq = await instanceModelShopPersonalCustomers.findAll({
            where: {
                id: { [Op.in]: data_create_id_arr }
            }
        })


        for (let index = 0; index < findShopsProfileArray.length; index++) {
            const element = findShopsProfileArray[index];
            if (element.shop_code_id !== table_name) {


                let customer_all = await modelShopPersonalCustomers(element.shop_code_id).findAll()
                let data_create1 = []
                for (let index1 = 0; index1 < customer_from_hq.length; index1++) {
                    const element1 = customer_from_hq[index1];

                    let check_existing = customer_all.filter(el => {
                        return el.other_details.code_from_old_system === element1.other_details.code_from_old_system &&
                            element1.other_details.code_from_old_system &&
                            el.customer_name.first_name.th === element1.customer_name.first_name.th &&
                            el.customer_name.last_name.th === element1.customer_name.last_name.th

                    })

                    let check_id_card_number = customer_all.filter(el => {
                        return el.id_card_number === element1.id_card_number
                    })

                    let id_card_number = null
                    if (check_id_card_number.length == 0) {
                        id_card_number = element1.id_card_number
                    }

                    if (check_existing.length == 0) {
                        data_create1.push({ ...element1.dataValues, ...{ shop_id: element.id }, ...{ id_card_number: id_card_number } })
                    }


                }

                await modelShopPersonalCustomers(element.shop_code_id).bulkCreate(data_create1).then().catch(error => { console.log(error) })

            }

        }
        await handleSaveLog(request, [[action, findShopsProfile.id], ""]);
        return utilSetFastifyResponseJson("success", "successful " + error_str);

    } catch (error) {
        error = error
        await handleSaveLog(request, [[action], `error : ${error}`]);
        return utilSetFastifyResponseJson("failed", error.toString());
    }
};

module.exports = handlerShopPersonalCustomersAddByFile;