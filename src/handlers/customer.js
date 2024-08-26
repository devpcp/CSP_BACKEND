const { Op, literal } = require("sequelize");
const { paginate } = require('../utils/generate');
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('../handlers/log');
const BusinessType = require('../models/model').BusinessType;
const SubDistrict = require('../models/model').SubDistrict;
const District = require('../models/model').District;
const Province = require('../models/model').Province;
const Customer = require('../models/model').Customer;
const Dealers = require('../models/model').Dealers;
const MatchCustomerDealer = require('../models/model').MatchCustomerDealer;

const customerAll = async (request, res) => {

    var action = 'get customer all'

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;
    const which = request.query.which || 'michelin data'

    var isuse = []
    if (status == 'delete') {
        isuse = [2]
    } else if (status == 'active') {
        isuse = [1]
    } else if (status == 'block') {
        isuse = [0]
    } else {
        isuse = [1, 0]
    }

    var user_id_where
    if (which == 'michelin data') {
        user_id_where = {}
    } else if (which == 'my data') {

        dealer = await Dealers.findAll({ where: { user_id: request.id } })

        if (!dealer[0]) {
            // return ({ status: 'success', data: paginate([], limit, page) })
            await handleSaveLog(request, [[action], ''])
            return ({ status: 'success', data: 'data not found' })
        }

        dealer_id_arr = dealer.map((el) => { return el.id })

        match = await MatchCustomerDealer.findAll({ where: { dealer_id: dealer_id_arr } })

        if (!match[0]) {
            await handleSaveLog(request, [[action], ''])
            return ({ status: 'success', data: paginate([], limit, page) })
        }

        cus_id_arr = match.map((el) => { return el.customer_id })

        user_id_where = { id: cus_id_arr }
        // user_id_where = { user_id: request.id }

    } else {
        await handleSaveLog(request, [[action], 'which only allow michelin data, my data '])
        return ({ status: "failed", data: "which not match" })
    }

    var customer = await Customer.findAll({
        order: [[sort, order]],
        include: [{ model: BusinessType, attributes: ['id', 'code_id', 'business_type_name'] },
        { model: SubDistrict, attributes: ['id', 'zip_code', 'name_th', 'name_en'] },
        { model: District, attributes: ['id', 'name_th', 'name_en'] },
        { model: Province, attributes: ['id', 'prov_name_th', 'prov_name_en'] },
        { model: Dealers, attributes: ['id', 'master_dealer_code_id', 'dealer_code_id', 'dealer_name'] }],
        required: false,
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Customer\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Customer\".\"updated_by\" )"), 'updated_by']
            ]
        },
        where: {
            [Op.and]: [{ isuse: isuse }, user_id_where],
            [Op.or]: [
                {
                    customer_name: {
                        [Op.or]: [
                            { th: { [Op.like]: '%' + search + '%' } },
                            { en: { [Op.like]: '%' + search + '%' } }
                        ]
                    }
                },
                { master_customer_code_id: { [Op.like]: '%' + search + '%' } },
                { dealer_customer_code_id: { [Op.like]: '%' + search + '%' } },
                literal("business_type_name->>'th' LIKE '%" + search + "%'"),
                {
                    tel_no: {
                        [Op.or]: [
                            { tel_no_1: { [Op.like]: '%' + search + '%' } },
                            { tel_no_2: { [Op.like]: '%' + search + '%' } },
                            { tel_no_3: { [Op.like]: '%' + search + '%' } },
                            { tel_no_4: { [Op.like]: '%' + search + '%' } },
                            { tel_no_5: { [Op.like]: '%' + search + '%' } }
                        ]
                    }
                },
                {
                    mobile_no: {
                        [Op.or]: [
                            { mobile_no_1: { [Op.like]: '%' + search + '%' } },
                            { mobile_no_2: { [Op.like]: '%' + search + '%' } },
                            { mobile_no_3: { [Op.like]: '%' + search + '%' } },
                            { mobile_no_4: { [Op.like]: '%' + search + '%' } },
                            { mobile_no_5: { [Op.like]: '%' + search + '%' } }
                        ]
                    }
                },
                {
                    address: {
                        [Op.or]: [
                            { th: { [Op.like]: '%' + search + '%' } },
                            { en: { [Op.like]: '%' + search + '%' } }
                        ]
                    }
                },
                { e_mail: { [Op.like]: '%' + search + '%' } },
                { "$SubDistrict.name_th$": { [Op.like]: '%' + search + '%' } },
                { "$District.name_th$": { [Op.like]: '%' + search + '%' } },
                { "$Province.prov_name_th$": { [Op.like]: '%' + search + '%' } },
                {
                    other_details: {
                        [Op.or]: [
                            { contact_name: { [Op.like]: '%' + search + '%' } },
                        ]
                    }
                },
            ]



        },
    })

    await handleSaveLog(request, [[action], ''])
    return ({ status: 'success', data: paginate(customer, limit, page) })

}


const customerAdd = async (request, res) => {
    var action = 'add customer'
    try {
        const which = request.query.which || 'michelin data'

        var { master_customer_code_id, dealer_customer_code_id, bus_type_id, customer_name, tel_no, mobile_no,
            e_mail, address, subdistrict_id, district_id, province_id, other_details, dealer_id } = request.body
        const isuse = 1

        if (isNull(customer_name)) {
            await handleSaveLog(request, [[action], 'customer_name null'])
            return ({ status: "failed", data: "customer_name can not null" })
        }

        const dealer_duplicate = await Customer.findAll({ where: { master_customer_code_id: master_customer_code_id } });
        if (dealer_duplicate[0]) {
            await handleSaveLog(request, [[action], 'master_customer_code_id already'])
            return ({ status: "failed", data: "master_customer_code_id already" })
        }

        var run_no = await Customer.max('run_no') || 0
        run_no = run_no + 1

        master_customer_code_id = 82000000 + run_no

        // if (!master_customer_code_id || master_customer_code_id == '') {

        // }

        if (bus_type_id) {
            bus = await BusinessType.findAll({ where: { id: bus_type_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'bus_type_id not found'])
                return ({ status: "failed", data: "bus_type_id not found" })
            }
        }

        if (subdistrict_id) {
            bus = await SubDistrict.findAll({ where: { id: subdistrict_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'subdistrict_id not found'])
                return ({ status: "failed", data: "subdistrict_id not found" })
            }
        }

        if (district_id) {
            bus = await District.findAll({ where: { id: district_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'district_id not found'])
                return ({ status: "failed", data: "district_id not found" })
            }
        }

        if (province_id) {
            bus = await Province.findAll({ where: { id: province_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'province_id not found'])
                return ({ status: "failed", data: "province_id not found" })
            }
        }


        if (dealer_id && dealer_id.length > 0 && which == 'michelin data') {

            var check_group = true
            var group_exist
            await new Promise(async (resolve) => {
                dealer_id.forEach(async (element, index, array) => {

                    group_exist = await Dealers.findAll({ where: { id: element } });
                    if (!group_exist[0]) {
                        check_group = false
                    }

                    if (index === array.length - 1) resolve();
                });
            })

            if (check_group == false) {
                await handleSaveLog(request, [[action], 'dealer_id not found'])
                return ({ status: "failed", data: "dealer_id not found" })
            }

        }


        var create_cus = await Customer.create({
            master_customer_code_id: master_customer_code_id,
            dealer_customer_code_id: dealer_customer_code_id,
            bus_type_id: bus_type_id,
            customer_name: customer_name,
            tel_no: tel_no,
            mobile_no: mobile_no,
            e_mail: e_mail,
            address: address,
            subdistrict_id: subdistrict_id,
            district_id: district_id,
            province_id: province_id,
            other_details: other_details,
            run_no: run_no,
            isuse: isuse,
            created_date: Date.now(),
            created_by: request.id
        })

        if (which == 'my data') {
            dealer = await Dealers.findAll({ where: { user_id: request.id } })

            if (!dealer[0]) {
                dealer_id = []
            } else {
                dealer_id = dealer.map((el) => { return el.id })
            }
        }

        if (dealer_id && dealer_id.length > 0) {
            await new Promise(async (resolve) => {
                dealer_id.forEach(async (element, index, array) => {
                    var run_no1 = await MatchCustomerDealer.max('run_no') || 0
                    await MatchCustomerDealer.create({
                        dealer_id: element,
                        customer_id: create_cus.id,
                        run_no: run_no1 + 1,
                        created_by: request.id,
                        // created_date: new Date()
                    }).then(async function (item) {
                        await handleSaveLog(request, [['map customer with dealer', create_cus.id, element], ''])

                    }).catch(async function (err) {
                        err = err.toString()
                        await handleSaveLog(request, [['map customer with dealer'], err])
                    });
                    if (index === array.length - 1) resolve();
                });

            })
        }

        await handleSaveLog(request, [[action, create_cus.id, request.body], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const customerById = async (request, res) => {
    try {

        var customer_id = request.params.id

        var find_customer = await Customer.findAll({
            include: [{ model: BusinessType, attributes: ['id', 'code_id', 'business_type_name'] },
            { model: SubDistrict, attributes: ['id', 'zip_code', 'name_th', 'name_en'] },
            { model: District, attributes: ['id', 'name_th', 'name_en'] },
            { model: Province, attributes: ['id', 'prov_name_th', 'prov_name_en'] },
            { model: Dealers, attributes: ['id', 'master_dealer_code_id', 'dealer_code_id', 'dealer_name'] }],
            required: false,
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Customer\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Customer\".\"updated_by\" )"), 'updated_by']
                ]
            },
            where: {
                id: customer_id
            },
        });
        await handleSaveLog(request, [['get customer by id'], ''])
        return ({ status: "successful", data: [find_customer[0]] })


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['get customer by id'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const customerPut = async (request, res) => {
    var action = 'put customer'
    try {
        const which = request.query.which || 'michelin data'

        var { master_customer_code_id, dealer_customer_code_id, bus_type_id, customer_name, tel_no, mobile_no,
            e_mail, address, subdistrict_id, district_id, province_id, other_details, dealer_id } = request.body
        var isuse = request.body.status

        var customer_id = request.params.id
        var data = {}


        const find_customer = await Customer.findAll({ where: { id: customer_id } });
        if (!find_customer[0]) {
            await handleSaveLog(request, [[action], 'customer not found'])
            return ({ status: "failed", data: "customer not found" })
        }

        if (!isNull(customer_name)) {
            data.customer_name = customer_name
        }
        if (!isNull(master_customer_code_id)) {

            const dealer_duplicate = await Customer.findAll({ where: { master_customer_code_id: master_customer_code_id } });
            if (dealer_duplicate[0]) {
                await handleSaveLog(request, [[action], 'master_customer_code_id already'])
                return ({ status: "failed", data: "master_customer_code_id already" })
            } else {
                data.master_customer_code_id = master_customer_code_id

            }
        }
        if (!isNull(dealer_customer_code_id)) {
            data.dealer_customer_code_id = dealer_customer_code_id
        }
        if (!isNull(tel_no)) {
            data.tel_no = tel_no
        }
        if (!isNull(mobile_no)) {
            data.mobile_no = mobile_no
        }

        if (typeof e_mail !== 'undefined') {
            data.e_mail = e_mail
        }

        if (!isNull(address)) {
            data.address = address
        }
        if (!isNull(other_details)) {
            data.other_details = other_details
        }


        if (!isNull(bus_type_id)) {
            bus = await BusinessType.findAll({ where: { id: bus_type_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'bus_type_id not found'])
                return ({ status: "failed", data: "bus_type_id not found" })
            } else {
                data.bus_type_id = bus_type_id
            }
        }

        if (!isNull(subdistrict_id)) {
            bus = await SubDistrict.findAll({ where: { id: subdistrict_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'subdistrict_id not found'])
                return ({ status: "failed", data: "subdistrict_id not found" })
            } else {
                data.subdistrict_id = subdistrict_id
            }
        }

        if (!isNull(district_id)) {
            bus = await District.findAll({ where: { id: district_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'district_id not found'])
                return ({ status: "failed", data: "district_id not found" })
            } else {
                data.district_id = district_id
            }
        }

        if (!isNull(province_id)) {
            bus = await Province.findAll({ where: { id: province_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'province_id not found'])
                return ({ status: "failed", data: "province_id not found" })
            } else {
                data.province_id = province_id
            }
        }

        if (!isNull(isuse)) {
            if (isuse == 'delete') {
                data.isuse = 2
            } else if (isuse == 'active') {
                data.isuse = 1
            } else if (isuse == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }

        if (dealer_id && which == 'michelin data') {

            var check_group = true
            var group_exist
            if (dealer_id.length > 0) {
                await new Promise(async (resolve) => {
                    dealer_id.forEach(async (element, index, array) => {

                        group_exist = await Dealers.findAll({ where: { id: element } });
                        if (!group_exist[0]) {
                            check_group = false
                        }

                        if (index === array.length - 1) resolve();
                    });
                })

            }

            if (check_group == false) {
                await handleSaveLog(request, [[action], 'dealer_id not found'])
                return ({ status: "failed", data: "dealer_id not found" })
            } else {
                await MatchCustomerDealer.destroy({
                    where: {
                        customer_id: customer_id
                    }
                })

                if (dealer_id.length > 0) {
                    await new Promise(async (resolve) => {
                        dealer_id.forEach(async (element, index, array) => {
                            var run_no1 = await MatchCustomerDealer.max('run_no') || 0
                            await MatchCustomerDealer.create({
                                dealer_id: element,
                                customer_id: customer_id,
                                run_no: run_no1 + 1,
                                created_by: request.id,
                                // created_date: new Date()
                            }).then(async function (item) {
                                await handleSaveLog(request, [['map customer to dealer', element, item], ''])

                            }).catch(async function (err) {
                                err = err.toString()
                                await handleSaveLog(request, [['map customer to dealer', element], err])
                            });
                            if (index === array.length - 1) resolve();
                        });

                    })
                }


            }

        }

        data.updated_by = request.id
        data.updated_date = new Date()

        // data.updated_date = new Date().toLocaleString('th-TH', {
        //     timeZone: 'Asia/Bangkok'
        // });

        var before_update = await Customer.findOne({
            where: {
                id: customer_id
            }
        });

        await Customer.update(data, {
            where: {
                id: customer_id
            }
        });

        await handleSaveLog(request, [[action, customer_id, request.body, before_update], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    customerAll,
    customerAdd,
    customerById,
    customerPut
}