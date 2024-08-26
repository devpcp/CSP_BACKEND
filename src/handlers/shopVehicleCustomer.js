const _ = require("lodash");
const XLSX = require('xlsx')
const fs = require('fs');
const { Op, Transaction } = require("sequelize");
const { isNull, isUUID } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilCheckShopTableName = require('../utils/util.CheckShopTableName');
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const {
    config_run_number_shop_vehicle_customer_prefix_prefix,
    config_run_number_master_vehicle_brand_prefix,
    config_run_number_master_vehicle_type_prefix
} = require("../config");

const sequelize = require('../db');
const VehicleType = require('../models/model').VehicleType;
const VehicleBrand = require('../models/model').VehicleBrand;
const VehicleModelType = require('../models/model').VehicleModelType;
const ShopVehicleCustomer = require('../models/model').ShopVehicleCustomer;
const ShopPersonalCustomers = require('../models/model').ShopPersonalCustomers;
const ShopBusinessCustomers = require('../models/model').ShopBusinessCustomers;
const Province = require('../models/model').Province;

/**
    * ใบสั่งซ่อม
    */
const doc_type_id = "7ef3840f-3d7f-43de-89ea-dce215703c16"


const handlerShopVehicleCustomersAddByFile = async (request) => {

    var action = "add shopVehicleCustomers by file"
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
            "รหัสลูกค้า",
            "รหัสลูกค้าจากระบบเดิม",
            "ชื่อลูกค้า",
            "ประเภทลูกค้า",
            "ประเภทยานพาหนะ",
            "ยี่ห้อ",
            "รุ่น",
            "จังหวัด",
            "ทะเบียนรถ",
            "เลขเครื่องยนต์",
            "เลขตัวถัง",
            "ขนาดเครื่องยนต์ CC",
            "สีรถ",
            "เลขไมค์ครั้งแรก",
            "เลขไมค์ครั้งล่าสุด",
            "วันที่เข้ามาใช้บริการครั้งแรก",
            "วันที่เข้ามาใช้บริการล่าสุด"
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


        const findShopsProfile = await utilCheckShopTableName(request);

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const additionalPrefix = (findShopsProfileArray.length > 1) ? 'HQ' : ''

        const table_name = findShopsProfile.shop_code_id;


        const instanceModelShopVehicleCustomer = ShopVehicleCustomer(table_name);
        // Create table in database if not exists
        // await utilSequelizeCreateTableIfNotExistsFromModel(instanceModelShopVehicleCustomer);

        let business_cus_all = await ShopBusinessCustomers(table_name).findAll()
        let personal_cus_all = await ShopPersonalCustomers(table_name).findAll({
            attributes: {
                include: [[sequelize.literal(`concat( REPLACE(customer_name->'first_name'->>'th',' ',''),REPLACE(customer_name->'last_name'->>'th',' ',''))`), 'concat_name']]
            }
        })



        let vehicle_type_all = await VehicleType.findAll()
        let vehicle_brand_all = await VehicleBrand.findAll()
        let vehicle_model_all = await VehicleModelType.findAll()

        let vehicle_all = await instanceModelShopVehicleCustomer.findAll()

        var data_create = []
        var error = []
        const findLatestRowNumber = await instanceModelShopVehicleCustomer.max(
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

            let bus_customer_id = null
            if (element["ประเภทลูกค้า"] == 'ธุรกิจ' || !element["ประเภทลูกค้า"]) {
                bus_customer_id = business_cus_all.filter(el => {
                    return el.other_details.code_from_old_system == element["รหัสลูกค้าจากระบบเดิม"] &&
                        el.customer_name.th.replace(/\s/g, '') === element.ชื่อลูกค้า.toString().replace(/\s/g, '')
                })

                if (bus_customer_id.length == 1) {
                    bus_customer_id = bus_customer_id[0].id
                } else {
                    bus_customer_id = null
                    // error_check = error_check + 1
                    // error.push({ index: index + 2, cases: 'ลูกค้าธุรกิจ not found or more than one' })
                }

            }
            let per_customer_id = null
            if (element["ประเภทลูกค้า"] == 'บุคคลธรรมดา' || !element["ประเภทลูกค้า"]) {

                per_customer_id = personal_cus_all.filter(el => {
                    return el.dataValues.other_details.code_from_old_system == element["รหัสลูกค้าจากระบบเดิม"] &&
                        ((el.dataValues.customer_name.first_name.th + el.dataValues.customer_name.last_name.th).toString().replace(/\s/g, '') === element.ชื่อลูกค้า.toString().replace(/\s/g, ''))
                })

                if (per_customer_id.length == 1) {
                    per_customer_id = per_customer_id[0].id
                } else {
                    per_customer_id = null
                    // error_check = error_check + 1
                    // error.push({ index: index + 2, cases: 'ลูกค้าธรรมดา not found or more than one' })
                }

            }

            if (bus_customer_id == null && per_customer_id == null) {
                error_check = error_check + 1
                error.push({ index: index + 2, cases: 'customer not found or more than one' })
            }

            let vehicle_type_id = null
            if (element["ประเภทยานพาหนะ"]) {
                vehicle_type_id = vehicle_type_all.filter(el => { return el.type_name.th.toString().toLowerCase().replace(/ /g, "") == element['ประเภทยานพาหนะ'].toString().toLowerCase().replace(/ /g, "") })

                if (vehicle_type_id.length == 0) {

                    var createRunNumberType = await utilGetRunNumberFromModel(
                        VehicleType,
                        'run_no',
                        {
                            prefix_config: await utilGetDocumentTypePrefix(
                                _.get(request.body, 'doc_type_id', ''),
                                {
                                    defaultPrefix: config_run_number_master_vehicle_type_prefix
                                }
                            ).then(r => r.prefix)
                        }
                    );


                    vehicle_type_id = await VehicleType.create(
                        {
                            code_id: createRunNumberType.runString,
                            run_no: createRunNumberType.runNumber,
                            internal_code_id: element['ประเภทยานพาหนะ'].toString().toUpperCase().replace(/ /g, ""),
                            type_name: { th: element['ประเภทยานพาหนะ'], en: element['ประเภทยานพาหนะ'] },
                            isuse: 1,
                            created_by: request.id,
                            created_date: new Date()
                        }
                    );
                    vehicle_type_all.push({ ...vehicle_type_id.dataValues })
                    vehicle_type_id = [vehicle_type_id.dataValues]
                    vehicle_type_id = vehicle_type_id[0].id
                } else if (vehicle_type_id.length == 1) {
                    vehicle_type_id = vehicle_type_id[0].id
                } else {
                    error.push({ index: index + 2, cases: 'vehicle type more than one' })
                }

                // if (vehicle_type_id.length == 1) {
                //     vehicle_type_id = vehicle_type_id[0].id
                // } else {
                //     vehicle_type_id = null
                //     error_check = error_check + 1
                //     error.push({ index: index + 2, cases: 'vehicle type not found or more than one' })
                // }

            }

            let vehicle_brand_id = null
            if (element["ยี่ห้อ"]) {
                vehicle_brand_id = vehicle_brand_all.filter(el => { return el.brand_name.th.toString().toLowerCase().replace(/ /g, "") == element['ยี่ห้อ'].toString().toLowerCase().replace(/ /g, "") })

                if (vehicle_brand_id.length == 0) {

                    var createRunNumberBrand = await utilGetRunNumberFromModel(
                        VehicleBrand,
                        'run_no',
                        {
                            prefix_config: await utilGetDocumentTypePrefix(
                                _.get(request.body, 'doc_type_id', ''),
                                {
                                    defaultPrefix: config_run_number_master_vehicle_brand_prefix
                                }
                            ).then(r => r.prefix)
                        }
                    );


                    vehicle_brand_id = await VehicleBrand.create(
                        {
                            code_id: createRunNumberBrand.runString,
                            run_no: createRunNumberBrand.runNumber,
                            internal_code_id: element['ยี่ห้อ'].toString().toUpperCase().replace(/ /g, ""),
                            brand_name: { th: element['ยี่ห้อ'], en: element['ยี่ห้อ'] },
                            isuse: 1,
                            created_by: request.id,
                            created_date: new Date()
                        }
                    );
                    vehicle_brand_all.push({ ...vehicle_brand_id.dataValues })
                    vehicle_brand_id = [vehicle_brand_id.dataValues]
                    vehicle_brand_id = vehicle_brand_id[0].id
                } else if (vehicle_brand_id.length == 1) {
                    vehicle_brand_id = vehicle_brand_id[0].id
                } else {
                    vehicle_brand_id = vehicle_brand_id[0].id
                    // error.push({ index: index + 2, cases: 'vehicle brand more than one' })
                }

            }

            let vehicle_model_id = null
            if (element["รุ่น"]) {
                vehicle_model_id = vehicle_model_all.filter(el => {
                    return el.model_name.th.toString().toLowerCase().replace(/ /g, "") == element['รุ่น'].toString().toLowerCase().replace(/ /g, "") &&
                        el.vehicles_brand_id == vehicle_brand_id
                })


                if (vehicle_model_id.length == 0 && vehicle_brand_id != null) {

                    vehicle_model_id = await VehicleModelType.create(
                        {
                            code_id: element['รุ่น'].toString().toUpperCase().replace(/ /g, ""),
                            model_name: { th: element['รุ่น'], en: element['รุ่น'] },
                            vehicles_brand_id: vehicle_brand_id,
                            isuse: 1,
                            created_by: request.id,
                            created_date: new Date()
                        }
                    );
                    vehicle_model_all.push({ ...vehicle_model_id.dataValues })
                    vehicle_model_id = [vehicle_model_id.dataValues]
                    vehicle_model_id = vehicle_model_id[0].id
                } else if (vehicle_model_id.length == 1) {
                    vehicle_model_id = vehicle_model_id[0].id
                } else {
                    vehicle_model_id = null
                    // error.push({ index: index + 2, cases: 'vehicle model more than one' })
                }

            }


            let details = {
                "color": "",
                "province_name": "",
                "registration": "",
                "remark": "",
                "serial_number": "",
                "chassis_number": "",
                "cc_engine_size": "",
                "mileage_first": "",
                "mileage": "",
                "service_date_first": "",
                "avg_registration_day": "",
                "service_date_last": ""
            }

            if (element.hasOwnProperty("จังหวัด")) {
                details.province_name = element.จังหวัด
            }
            if (element.hasOwnProperty("ทะเบียนรถ")) {
                details.registration = element["ทะเบียนรถ"]
            }
            if (element.hasOwnProperty("เลขเครื่องยนต์")) {
                details.serial_number = element["เลขเครื่องยนต์"]
            }
            if (element.hasOwnProperty("เลขตัวถัง")) {
                details.chassis_number = element["เลขตัวถัง"]
            }
            if (element.hasOwnProperty("ขนาดเครื่องยนต์ CC")) {
                details.cc_engine_size = element["ขนาดเครื่องยนต์ CC"]
            }
            if (element.hasOwnProperty("สีรถ")) {
                details.color = element["สีรถ"]
            }
            if (element.hasOwnProperty("เลขไมค์ครั้งแรก")) {
                details.mileage_first = element["เลขไมค์ครั้งแรก"]
            }
            if (element.hasOwnProperty("เลขไมค์ครั้งล่าสุด")) {
                details.mileage = element["เลขไมค์ครั้งล่าสุด"]
            }
            if (element.hasOwnProperty("วันที่เข้ามาใช้บริการครั้งแรก")) {
                details.service_date_first = element["วันที่เข้ามาใช้บริการครั้งแรก"]
            }
            if (element.hasOwnProperty("วันที่เข้ามาใช้บริการล่าสุด")) {
                details.service_date_last = element["วันที่เข้ามาใช้บริการล่าสุด"]
            }

            let check_existing = vehicle_all.filter(el => { return el.details.registration === element["ทะเบียนรถ"] && element["ทะเบียนรถ"] })

            if (check_existing.length > 0) {
                await instanceModelShopVehicleCustomer.update({
                    bus_customer_id: bus_customer_id,
                    per_customer_id: per_customer_id,
                    details: details,
                    vehicle_type_id: vehicle_type_id,
                    vehicle_brand_id: vehicle_brand_id,
                    vehicle_model_id: vehicle_model_id,
                    isuse: 1,
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
                let concatStringRunNumber = `${config_run_number_shop_vehicle_customer_prefix_prefix + additionalPrefix}${newStringYear}${newStringRowNumber}`;

                createRunNumber.runNumber = findLatestRowNumber + index
                createRunNumber.runString = concatStringRunNumber

                // if (error_check == 0) {
                data_create.push({
                    shop_id: findShopsProfile.id,
                    code_id: createRunNumber.runString,
                    bus_customer_id: bus_customer_id,
                    per_customer_id: per_customer_id,
                    details: details,
                    vehicle_type_id: vehicle_type_id,
                    vehicle_brand_id: vehicle_brand_id,
                    vehicle_model_id: vehicle_model_id,
                    isuse: 1,
                    run_no: createRunNumber.runNumber,
                    created_by: user_id,
                    created_date: currentDateTime,
                    updated_by: null,
                    updated_date: null

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
            return ({ status: 'failed', data: error_str })
        }

        let data_create_id_arr_ = await instanceModelShopVehicleCustomer.bulkCreate(data_create);

        //HQ

        data_create_id_arr_ = data_create_id_arr_.map(el => { return el.id })
        data_create_id_arr.push(...[...data_create_id_arr_])

        let customer_from_hq = await instanceModelShopVehicleCustomer.findAll({
            where: {
                id: { [Op.in]: data_create_id_arr }
            }
        })



        for (let index = 0; index < findShopsProfileArray.length; index++) {
            const element = findShopsProfileArray[index];
            if (element.shop_code_id !== table_name) {


                let customer_all = await ShopVehicleCustomer(element.shop_code_id).findAll()
                let data_create1 = []
                for (let index1 = 0; index1 < customer_from_hq.length; index1++) {
                    const element1 = customer_from_hq[index1];

                    let check_existing = customer_all.filter(el => {
                        return el.details.registration === element1.details.registration
                    })


                    if (check_existing.length == 0) {
                        data_create1.push({ ...element1.dataValues, ...{ shop_id: element.id } })
                    }


                }

                await ShopVehicleCustomer(element.shop_code_id).bulkCreate(data_create1).then().catch(error => { console.log(error) })

            }

        }

        await handleSaveLog(request, [[action, findShopsProfile.id], ""]);
        return utilSetFastifyResponseJson("success", "successful " + error_str);

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], `error : ${error}`]);
        return utilSetFastifyResponseJson("failed", error);
    }
};


const handleShopVehicleCustomerAdd = async (request, reply) => {
    const action = 'add ShopVehicleCustomer';

    try {
        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const { bus_customer_id, per_customer_id, details, vehicle_type_id, vehicle_brand_id, vehicle_model_id, doc_type_id } = request.body;

        if (!bus_customer_id && !per_customer_id) {
            throw Error(`กรุณาเลือกลูกค้าธุระกิจหรือบคุคลธรรมอย่างใดอย่างหนึ่ง`);
        }
        if (isUUID(bus_customer_id) && isUUID(per_customer_id)) {
            throw Error(`อนุญาติให้เพิ่มลูกค้าธุระกิจหรือบคุคลธรรมอย่างใดอย่างหนึ่งเท่านั้น`);
        }

        const transactionResult = await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction
                }

                if (details.province_name && details.registration) {
                    const findCarPlateLicense = await ShopVehicleCustomer(table_name).findOne({
                        where: {
                            details: {
                                [Op.and]: [
                                    { province_name: details.province_name },
                                    { registration: details.registration }
                                ]
                            }
                        },
                        transaction: transaction
                    });

                    if (findCarPlateLicense) {
                        throw Error('Duplicate license plates in the same province');
                    }
                }

                const additionalPrefix = (findShopsProfileArray.length > 1) ? 'HQ' : ''

                const createRunNumber = await utilGetRunNumberFromModel(
                    ShopVehicleCustomer(table_name),
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_shop_vehicle_customer_prefix_prefix + additionalPrefix
                            }
                        ).then(r => r.prefix),
                        transaction: transaction
                    }
                );

                const createDocument = await ShopVehicleCustomer(table_name).create(
                    {
                        ...request.body,
                        shop_id: shop_table.id,
                        run_no: createRunNumber.runNumber,
                        code_id: createRunNumber.runString,
                        isuse: 1,
                        created_by: request.id,
                        created_date: Date.now()
                    },
                    {
                        transaction: transaction
                    }
                );


                for (let index = 0; index < findShopsProfileArray.length; index++) {
                    const element = findShopsProfileArray[index];
                    if (element.shop_code_id !== table_name) {
                        await ShopVehicleCustomer(element.shop_code_id).create(
                            { ...createDocument.dataValues, ...{ shop_id: element.id } })
                            .then()
                            .catch((err) => {
                                console.log(err)
                            })
                    }

                }

                return createDocument;
            }
        );

        await handleSaveLog(request, [[action, transactionResult.id, request.body], '']);

        return utilSetFastifyResponseJson("success", transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handleShopVehicleCustomerAll = async (request, reply) => {
    const action = 'get ShopVehicleCustomer all';

    try {
        const search = request.query.search || '';
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'desc';
        const status = request.query.status;

        const bus_customer_id = request.query.bus_customer_id || null;
        const per_customer_id = request.query.per_customer_id || null;
        const vehicle_type_id = request.query.vehicle_type_id || null;
        const vehicle_brand_id = request.query.vehicle_brand_id || null;
        const vehicle_model_id = request.query.vehicle_model_id || null;

        let filter__details__province_name = request.query?.filter__details__province_name?.replace(/(\s|%)+/, '%') || null;
        if (isUUID(filter__details__province_name)) {
            const findProvince = await Province.findOne({
                attributes: ['id', 'prov_name_th'],
                where: {
                    id: filter__details__province_name
                }
            });
            if (!findProvince || !findProvince?.prov_name_th) {
                filter__details__province_name = null;
            }
            else {
                filter__details__province_name = findProvince.prov_name_th;
            }
        }

        const filter__details__service_date_last__startDate = request.query?.filter__details__service_date_last__startDate || null;
        const filter__details__service_date_last__endDate = request.query?.filter__details__service_date_last__endDate || null;
        const fnGetQuery__service_date_last = () => {
            let queryTo = {};
            if (filter__details__service_date_last__startDate && filter__details__service_date_last__endDate) {
                queryTo = sequelize.literal(`
                            ((CASE WHEN details->>'service_date_last' ~* '^[0-3]?[0-9]/[0-3]?[0-9]/(?:[0-9]{2})?[0-9]{2}$' = True
                                THEN (to_date(details->>'service_date_last', 'DD/MM/YYYY'))
                                ELSE
                                    CASE WHEN details->>'service_date_last' ~* '(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))' = True
                                         THEN (timezone('Asia/Bangkok', ((details->>'service_date_last')::timestamp AT TIME ZONE 'UTC')))::date
                                    ELSE NULL
                                    END
                           END) BETWEEN '${filter__details__service_date_last__startDate}' AND '${filter__details__service_date_last__endDate}')
                           `.replace(/(\s)+/ig, ' '));
            }
            else {
                if (filter__details__service_date_last__startDate && !filter__details__service_date_last__endDate) {
                    queryTo = sequelize.literal(`
                            ((CASE WHEN details->>'service_date_last' ~* '^[0-3]?[0-9]/[0-3]?[0-9]/(?:[0-9]{2})?[0-9]{2}$' = True
                                THEN (to_date(details->>'service_date_last', 'DD/MM/YYYY'))
                                ELSE
                                    CASE WHEN details->>'service_date_last' ~* '(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))' = True
                                         THEN (timezone('Asia/Bangkok', ((details->>'service_date_last')::timestamp AT TIME ZONE 'UTC')))::date
                                    ELSE NULL
                                    END
                           END) >= '${filter__details__service_date_last__startDate}')
                           `.replace(/(\s)+/ig, ' '));
                }
                if (!filter__details__service_date_last__startDate && filter__details__service_date_last__endDate) {
                    queryTo = sequelize.literal(`
                            ((CASE WHEN details->>'service_date_last' ~* '^[0-3]?[0-9]/[0-3]?[0-9]/(?:[0-9]{2})?[0-9]{2}$' = True
                                THEN (to_date(details->>'service_date_last', 'DD/MM/YYYY'))
                                ELSE
                                    CASE WHEN details->>'service_date_last' ~* '(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))' = True
                                         THEN (timezone('Asia/Bangkok', ((details->>'service_date_last')::timestamp AT TIME ZONE 'UTC')))::date
                                    ELSE NULL
                                    END
                           END) <= '${filter__details__service_date_last__startDate}')
                           `.replace(/(\s)+/ig, ' '));
                }
            }
            return queryTo;
        };


        let isuse = [];
        switch (status) {
            case 'active': {
                isuse = [1];
                break;
            }
            case 'block': {
                isuse = [0];
                break;
            }
            case 'delete': {
                isuse = [2];
                break;
            }
            default: {
                isuse = [2, 1, 0];
                break;
            }
        }

        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        const where_q = {
            [Op.and]: [
                { isuse: isuse },
                (per_customer_id) ? { per_customer_id: per_customer_id } : {},
                (bus_customer_id) ? { bus_customer_id: bus_customer_id } : {},
                (vehicle_type_id) ? { vehicle_type_id: vehicle_type_id } : {},
                (vehicle_brand_id) ? { vehicle_brand_id: vehicle_brand_id } : {},
                (vehicle_model_id) ? { vehicle_model_id: vehicle_model_id } : {},
                (filter__details__province_name) ? sequelize.literal(`details->>'province_name' iLIKE '%${filter__details__province_name}%'`) : {},
                fnGetQuery__service_date_last(),
            ],
            [Op.or]: [
                sequelize.literal(`"ShopBusinessCustomer".customer_name->>'th' ILIKE '%'||$1||'%'`),
                sequelize.literal(`"ShopPersonalCustomer".tel_no::text  ILIKE '%'||$1||'%'`),
                sequelize.literal(`CONCAT("ShopPersonalCustomer".customer_name->'first_name'->>'th' ,' ',"ShopPersonalCustomer".customer_name->'last_name'->>'th' )  ILIKE '%'||$1||'%'`),
                sequelize.literal(`details::text LIKE '%'||$1||'%'`),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopBusinessCustomer"."mobile_no"->>'mobile_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopBusinessCustomer"."tel_no"->>'tel_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopPersonalCustomer"."mobile_no"->>'mobile_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopPersonalCustomer"."tel_no"->>'tel_no_${w}' ILIKE '%'||$1||'%'`))),
            ]
        };



        const [findDocuments, length_data] = await Promise.all([
            ShopVehicleCustomer(table_name).findAll({
                order: [
                    ...(
                        !search
                            ? []
                            : [
                                [sequelize.literal(`details->>'registration' ILIKE '%'||$1||'%'`), 'DESC'],
                                [sequelize.literal(`CONCAT("ShopPersonalCustomer".customer_name->'first_name'->>'th' ,' ',"ShopPersonalCustomer".customer_name->'last_name'->>'th' )  ILIKE '%'||$1||'%'`), 'DESC'],
                            ]
                    ),
                    [sort, order]
                ],
                include: [
                    {
                        model: ShopPersonalCustomers(table_name),
                        attributes: {
                            include: [
                                [sequelize.literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopPersonalCustomer\".\"tags\"))`), 'tags'],
                            ]
                        }

                    },
                    {
                        model: ShopBusinessCustomers(table_name),
                        attributes: {
                            include: [
                                [sequelize.literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopPersonalCustomer\".\"tags\"))`), 'tags'],
                            ]
                        }
                    },
                    { model: VehicleType },
                    { model: VehicleBrand },
                    { model: VehicleModelType }
                ],
                attributes: {
                    include: [
                        // [sequelize.literal('json_array_length(shelf)'), 'shelf_total'],
                        [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopVehicleCustomer\".\"created_by\" )"), 'created_by'],
                        [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopVehicleCustomer\".\"updated_by\" )"), 'updated_by'],
                        [sequelize.literal(`
                        ( SELECT coalesce( 
                            ( 
                                SELECT doc.details->>'mileage' as last_mileage
                                FROM app_shops_datas.dat_${table_name}_service_order_doc doc
                                WHERE doc.vehicle_customer_id = \"ShopVehicleCustomer\".\"id\" 
                                AND doc.status = 1
                                order by doc.created_date desc limit 1
                                )
                            , \"ShopVehicleCustomer\".details->>'mileage')
                        )`), 'last_mileage'],
                        [sequelize.literal(`(
                            SELECT created_date FROM app_shops_datas.dat_${table_name}_service_order_doc 
                            WHERE vehicle_customer_id = \"ShopVehicleCustomer\".\"id\" 
                            AND status = 1
                            order by created_date desc limit 1
                            )`), 'last_service']
                    ]
                },
                where: where_q,
                bind: [search],
                limit: limit,
                offset: (page - 1) * limit
            }),
            ShopVehicleCustomer(table_name).count({
                include: [
                    { model: ShopPersonalCustomers(table_name) },
                    { model: ShopBusinessCustomers(table_name) },
                    { model: VehicleType },
                    { model: VehicleBrand },
                    { model: VehicleModelType }
                ],
                where: where_q,
                bind: [search]
            })
        ]);

        const pag = {
            currentPage: page,
            pages: Math.ceil(length_data / limit),
            currentCount: findDocuments.length,
            totalCount: length_data,
            data: findDocuments
        };


        await handleSaveLog(request, [[action], '']);

        return ({ status: 'success', data: pag });

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handleShopVehicleCustomerById = async (request, reply) => {
    const action = 'get ShopVehicleCustomer byid';

    try {
        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;
        const ShopVehicleCustomer_id = request.params.id;

        const findDocument = await ShopVehicleCustomer(table_name).findOne({
            where: {
                id: ShopVehicleCustomer_id
            },
            attributes: {
                include: [
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopVehicleCustomer\".\"created_by\" )"), 'created_by'],
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopVehicleCustomer\".\"updated_by\" )"), 'updated_by'],
                    [sequelize.literal(`
                    ( SELECT coalesce( 
                        ( 
                            SELECT doc.details->>'mileage' as last_mileage
                            FROM app_shops_datas.dat_${table_name}_sales_transaction_doc doc
                            WHERE doc.vehicles_customers_id = \"ShopVehicleCustomer\".\"id\" 
                            AND doc.doc_type_id = '${doc_type_id}'
                            AND doc.status in (2,3,4)
                            order by doc.created_date desc limit 1
                            )
                        , \"ShopVehicleCustomer\".details->>'mileage')
                    )`), 'last_mileage'],
                    [sequelize.literal(`(
                        SELECT created_date FROM app_shops_datas.dat_${table_name}_sales_transaction_doc 
                        WHERE vehicles_customers_id = \"ShopVehicleCustomer\".\"id\" 
                        AND doc_type_id = '${doc_type_id}'
                        AND status in (2,3,4)
                        order by created_date desc limit 1
                        )`), 'last_service']
                ]
            },
            include: [
                {
                    model: ShopPersonalCustomers(table_name),
                    attributes: {
                        include: [
                            [sequelize.literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopPersonalCustomer\".\"tags\"))`), 'tags'],
                        ]
                    }
                },
                {
                    model: ShopBusinessCustomers(table_name),
                    attributes: {
                        include: [
                            [sequelize.literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopBusinessCustomer\".\"tags\"))`), 'tags'],
                        ]
                    }
                },
                { model: VehicleType },
                { model: VehicleBrand },
                { model: VehicleModelType }
            ]
        });

        await handleSaveLog(request, [[action], '']);

        return utilSetFastifyResponseJson("success", [findDocument]);
    }
    catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handleShopVehicleCustomerPut = async (request, reply) => {
    const action = 'put ShopVehicleCustomer';

    try {
        const ShopVehicleCustomer_id = request.params.id;
        const { bus_customer_id, per_customer_id, details, vehicle_type_id, vehicle_brand_id, vehicle_model_id } = request.body;
        const isuse = request.body.status;

        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const transactionResult = await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction
                }

                let data = {};

                const find_ShopVehicleCustomer = await ShopVehicleCustomer(table_name).findAll({
                    where: { id: ShopVehicleCustomer_id },
                    transaction: transaction
                });

                if (!find_ShopVehicleCustomer[0]) {
                    throw Error('ShopVehicleCustomer not found');
                }
                if (isNull(bus_customer_id) || isUUID(bus_customer_id)) {
                    data.bus_customer_id = bus_customer_id;
                }
                if (isNull(per_customer_id) || isUUID(per_customer_id)) {
                    data.per_customer_id = per_customer_id;
                }
                if (!isNull(details)) {
                    //check
                    if (details.province_name && details.registration) {
                        const findCarPlateLicense = await ShopVehicleCustomer(table_name).findOne({
                            where: {
                                details: {
                                    [Op.and]: [
                                        { province_name: details.province_name },
                                        { registration: details.registration }
                                    ]
                                },
                                id: { [Op.ne]: ShopVehicleCustomer_id }
                            },
                            transaction: transaction
                        })
                        if (findCarPlateLicense) {
                            throw Error(`Duplicate license plates in the same province`);
                        }
                    }
                    data.details = details;
                }
                if (!isNull(vehicle_type_id)) {
                    data.vehicle_type_id = vehicle_type_id;
                }
                if (!isNull(vehicle_brand_id)) {
                    data.vehicle_brand_id = vehicle_brand_id;
                }
                if (!isNull(vehicle_model_id)) {
                    data.vehicle_model_id = vehicle_model_id;
                }
                if (!isNull(isuse)) {
                    switch (isuse) {
                        case 'active': {
                            data.isuse = 1;
                            break;
                        }
                        case 'block': {
                            data.isuse = 0;
                            break;
                        }
                        case 'delete': {
                            data.isuse = 2;
                            break;
                        }
                        default: {
                            throw Error('status not allow');
                        }
                    }
                }

                data.updated_by = request.id;

                data.updated_date = Date.now();

                const beforeUpdateDocument = await ShopVehicleCustomer(table_name).findOne({
                    where: {
                        id: ShopVehicleCustomer_id
                    },
                    transaction: transaction
                });

                const updateDocument = await ShopVehicleCustomer(table_name).update(data, {
                    where: {
                        id: ShopVehicleCustomer_id
                    },
                    transaction: transaction
                });

                for (let index = 0; index < findShopsProfileArray.length; index++) {
                    const element = findShopsProfileArray[index];
                    if (element.shop_code_id !== table_name) {

                        let findShopVehiclesCustomersHq = await ShopVehicleCustomer(element.shop_code_id).findOne({
                            where: { id: ShopVehicleCustomer_id },
                            transaction: transaction
                        });

                        if (findShopVehiclesCustomersHq) {
                            findShopVehiclesCustomersHq.set({
                                ...data,
                                ...{ shop_id: element.id },
                                updated_by: request.id,
                                updated_date: Date.now()
                            });

                            // Validate new values before save on this document
                            await findShopVehiclesCustomersHq.validate();
                            // Save new values on this document
                            await findShopVehiclesCustomersHq.save({ validate: true, transaction: transaction });
                        }

                    }

                }

                const afterUpdateDocument = await ShopVehicleCustomer(table_name).findOne({
                    where: {
                        id: ShopVehicleCustomer_id
                    },
                    transaction: transaction
                });

                return {
                    beforeUpdateDocument: beforeUpdateDocument,
                    afterUpdateDocument: afterUpdateDocument
                }
            }
        );


        await handleSaveLog(request, [[action, ShopVehicleCustomer_id, request.body, transactionResult.beforeUpdateDocument], '']);

        return utilSetFastifyResponseJson("success", transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = {
    handlerShopVehicleCustomersAddByFile,
    handleShopVehicleCustomerAdd,
    handleShopVehicleCustomerAll,
    handleShopVehicleCustomerById,
    handleShopVehicleCustomerPut
}