const { Op, literal } = require("sequelize");
const { paginate } = require('../utils/generate');
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('../handlers/log');
const User = require('../models/model').User;
const BusinessType = require('../models/model').BusinessType;
const SubDistrict = require('../models/model').SubDistrict;
const District = require('../models/model').District;
const Province = require('../models/model').Province;
const Dealers = require('../models/model').Dealers;

const dealersAll = async (request, res) => {

    var action = 'get dealer all'
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
        user_id_where = { user_id: request.id }

    } else {
        await handleSaveLog(request, [[action], 'which only allow michelin data, my data '])
        return ({ status: "failed", data: "which not match" })
    }

    var dealers = await Dealers.findAll({
        order: [[sort, order]],
        include: [{ model: BusinessType, attributes: ['id', 'code_id', 'business_type_name'] },
        { model: SubDistrict, attributes: ['id', 'zip_code', 'name_th', 'name_en'] },
        { model: District, attributes: ['id', 'name_th', 'name_en'] },
        { model: Province, attributes: ['id', 'prov_name_th', 'prov_name_en'] }],
        required: false,
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Dealers\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Dealers\".\"updated_by\" )"), 'updated_by']
            ]
        },
        where: {
            [Op.and]: [{ isuse: isuse }, user_id_where],
            [Op.or]: [
                {
                    dealer_name: {
                        [Op.or]: [
                            { th: { [Op.like]: '%' + search + '%' } },
                            { en: { [Op.like]: '%' + search + '%' } }
                        ]
                    }
                },
                { master_dealer_code_id: { [Op.like]: '%' + search + '%' } },
                { dealer_code_id: { [Op.like]: '%' + search + '%' } },
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

            ],

        },
    })

    if (dealers.length == 0 && which == 'my data') {
        await handleSaveLog(request, [[action], ''])
        return ({ status: 'success', data: 'data not found' })

    }
    await handleSaveLog(request, [[action], ''])
    return ({ status: 'success', data: paginate(dealers, limit, page) })

}


const dealersAdd = async (request, res) => {
    var action = 'add dealer'
    try {
        var { master_dealer_code_id, dealer_code_id, bus_type_id, dealer_name, tel_no, mobile_no,
            e_mail, address, subdistrict_id, district_id, province_id, sync_api_config, user_id } = request.body
        const isuse = 1

        if (isNull(dealer_name)) {
            await handleSaveLog(request, [[action], 'dealer_name null'])
            return ({ status: "failed", data: "dealer_name can not null" })
        }

        // const dealer_duplicate = await Access.findAll({ where: { access_name: access_name } });
        // if (access_duplicate[0]) {
        //     return ({ status: "failed", data: "access_name already" })
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

        if (user_id) {
            user = await User.findAll({ where: { id: user_id } })
            if (!user[0]) {
                await handleSaveLog(request, [[action], 'user_id not found'])
                return ({ status: "failed", data: "user_id not found" })
            }
        }


        var creat = await Dealers.create({
            master_dealer_code_id: master_dealer_code_id,
            dealer_code_id: dealer_code_id,
            bus_type_id: bus_type_id,
            dealer_name: dealer_name,
            tel_no: tel_no,
            mobile_no: mobile_no,
            e_mail: e_mail,
            address: address,
            subdistrict_id: subdistrict_id,
            district_id: district_id,
            province_id: province_id,
            isuse: isuse,
            sync_api_config: sync_api_config,
            user_id: user_id,
            created_date: Date.now(),
            created_by: request.id
        })

        await handleSaveLog(request, [[action, creat.id, request.body], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const dealersById = async (request, res) => {
    try {

        // let str = 'TUlDSEVMSU4xMjM0U09NUE9M';
        // let buff = new Buffer(str, 'base64');
        // let base64ToStringNew = buff.toString('ascii');
        // return base64ToStringNew
        var dealers_id = request.params.id

        var find_dealers = await Dealers.findAll({
            include: [{ model: BusinessType },
            { model: SubDistrict },
            { model: District },
            { model: Province }],
            required: false,
            where: {
                id: dealers_id
            },
        });

        await handleSaveLog(request, [['get dealer by id'], ''])
        return ({ status: "successful", data: [find_dealers[0]] })


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['get dealer by id'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const dealersPut = async (request, res) => {

    var action = 'put dealer'
    try {

        var { master_dealer_code_id, dealer_code_id, bus_type_id, dealer_name, tel_no, mobile_no,
            e_mail, address, subdistrict_id, district_id, province_id, sync_api_config, user_id } = request.body
        var isuse = request.body.status

        var dealers_id = request.params.id
        var data = {}


        const find_dealers = await Dealers.findAll({ where: { id: dealers_id } });
        if (!find_dealers[0]) {
            await handleSaveLog(request, [[action], 'dealer not found'])
            return ({ status: "failed", data: "dealer not found" })
        }
        if (!isNull(dealer_name)) {
            data.dealer_name = dealer_name
        }
        if (!isNull(master_dealer_code_id)) {
            data.master_dealer_code_id = master_dealer_code_id
        }
        if (!isNull(dealer_code_id)) {
            data.dealer_code_id = dealer_code_id
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
        if (!isNull(sync_api_config)) {
            data.sync_api_config = sync_api_config
        }
        if (!isNull(user_id)) {
            user = await User.findAll({ where: { id: user_id } })
            if (!user[0]) {
                await handleSaveLog(request, [[action], 'user_id not found'])
                return ({ status: "failed", data: "user_id not found" })
            } else {
                data.user_id = user_id
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

        data.updated_by = request.id
        data.updated_date = new Date()

        // data.updated_date = new Date().toLocaleString('th-TH', {
        //     timeZone: 'Asia/Bangkok'
        // });

        var before_update = await Dealers.findOne({
            where: {
                id: dealers_id
            }
        });


        await Dealers.update(data, {
            where: {
                id: dealers_id
            }
        });

        await handleSaveLog(request, [[action, dealers_id, request.body, before_update], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    dealersAll,
    dealersAdd,
    dealersById,
    dealersPut
}