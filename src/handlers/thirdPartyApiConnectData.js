const { Op } = require("sequelize");
const config = require('../config');
const { handleSaveLog } = require('./log')
const { generateHashPassword, isNull } = require('../utils/generate')
const { getToken } = require('../utils/utill.SendSaleToMichelin');

const sequelize = require('../db');
const ThirdPartyApiConnectData = require('../models/model').ThirdPartyApiConnectData;
const ShopsProfiles = require('../models/model').ShopsProfiles;
const ThirdPartyApi = require('../models/model').ThirdPartyApi;

const handleAllRaw = async (request) => {

    var search = request.query.search;
    var sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;

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


    if (sort == 'shop_name.th') {
        sort = sequelize.literal(`\"ShopsProfiles\".shop_name->>'th'  ${order}`)

    } else if (sort == 'shop_name.en') {
        sort = sequelize.literal(`\"ShopsProfiles\".shop_name->>'en'  ${order}`)

    } else {
        sort = [sort, order]

    }

    var where_q = {
        [Op.and]: [
            { isuse: isuse }],
        [Op.or]: [
            { auth_username: { [Op.like]: '%' + search + '%' } },
            sequelize.literal(`\"ShopsProfiles\".shop_name->>'th' LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ThirdPartyApi\".third_party_api_name LIKE '%'||:search||'%'`)
        ]
    }


    var inc = [
        { model: ShopsProfiles, as: 'ShopsProfiles' },
        { model: ThirdPartyApi }
    ]

    var data = await ThirdPartyApiConnectData.findAll({
        where: where_q,
        include: inc,
        replacements: { search: search },
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApiConnectData\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApiConnectData\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        order: [sort]
    })


    await handleSaveLog(request, [['get ThirdPartyApiConnectData all raw'], ''])
    return ({ status: "successful", data: data })

}


const handleAll = async (request) => {
    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    var sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;

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


    if (sort == 'shop_name.th') {
        sort = sequelize.literal(`\"ShopsProfiles\".shop_name->>'th'  ${order}`)

    } else if (sort == 'shop_name.en') {
        sort = sequelize.literal(`\"ShopsProfiles\".shop_name->>'en'  ${order}`)

    } else {
        sort = [sort, order]

    }


    var where_q = {
        [Op.and]: [
            { isuse: isuse }],
        [Op.or]: [
            { auth_username: { [Op.like]: '%' + search + '%' } },
            sequelize.literal(`"ShopsProfiles".shop_name->>'th' iLIKE '%${search}%'`),
            sequelize.literal(`"ThirdPartyApi".third_party_api_name iLIKE '%${search}%'`)
        ]
    }

    var inc = [
        { model: ShopsProfiles, as: 'ShopsProfiles' },
        { model: ThirdPartyApi }
    ]

    var data = await ThirdPartyApiConnectData.findAll({
        where: where_q,
        include: inc,
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApiConnectData\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApiConnectData\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        order: [sort],
        limit: limit,
        offset: (page - 1) * limit,
    })

    var length_data = await ThirdPartyApiConnectData.count({
        include: inc,
        where: where_q,
    })

    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: data.length,
        totalCount: length_data,
        data: data

    }

    await handleSaveLog(request, [['get ThirdPartyApiConnectData all'], ''])
    return ({ status: "successful", data: pag })

}

const handleById = async (req) => {
    var id = req.params.id
    var data = await ThirdPartyApiConnectData.findOne({
        where: {
            id: id
        },
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApiConnectData\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ThirdPartyApiConnectData\".\"updated_by\" )"), 'updated_by'],
            ]
        }
    })
    if (data) {
        await handleSaveLog(req, [['get ThirdPartyApiConnectData by id'], ''])
        return ({ status: "successful", data: data })
    } else {
        await handleSaveLog(req, [['get ThirdPartyApiConnectData by id'], 'ThirdPartyApiConnectData not found'])
        return ({ status: "failed", data: "ThirdPartyApiConnectData not found" })
    }
}

const handleAdd = async (request) => {
    var action = 'add ThirdPartyApiConnectData'
    try {
        var { shop_id, third_party_sys_id, auth_password } = request.body
        const isuse = 1

        var check = await ShopsProfiles.findOne({
            where: { id: shop_id }
        })
        if (!check) {
            await handleSaveLog(request, [[action, '', request.body], 'shop_id not found'])
            return ({ status: "failed", data: 'shop_id not found' })
        }
        if (!isNull(third_party_sys_id)) {
            var check = await ThirdPartyApi.findOne({
                where: { id: third_party_sys_id }
            })
            if (!check) {
                await handleSaveLog(request, [[action, '', request.body], 'third_party_sys_id not found'])
                return ({ status: "failed", data: 'third_party_sys_id not found' })
            }
        }


        if (!isNull(auth_password)) {
            auth_password = generateHashPassword(auth_password)
        }


        var create = await ThirdPartyApiConnectData.create({
            ...request.body,
            shop_id: shop_id,
            third_party_sys_id: third_party_sys_id,
            auth_password: auth_password,
            isuse: isuse,
            created_by: request.id,
            created_date: Date.now()
        })

        await handleSaveLog(request, [[action, create.id, request.body], ''])
        return ({ status: "successful", data: create })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handlePut = async (request) => {
    var action = 'put ThirdPartyApiConnectData'

    try {
        var { shop_id, api_key, auth_username, auth_password, auth_oauth, third_party_sys_id } = request.body
        var status = request.body.status

        var data = {}
        var id = request.params.id

        const find = await ThirdPartyApiConnectData.findAll({ where: { id: id } });
        if (!find[0]) {
            await handleSaveLog(request, [[action], 'ThirdPartyApiConnectData not found'])
            return ({ status: "failed", data: "ThirdPartyApiConnectData not found" })
        }

        if (!isNull(shop_id)) {
            var check = await ShopsProfiles.findOne({
                where: { id: shop_id }
            })
            if (!check) {
                await handleSaveLog(request, [[action, '', request.body], 'shop_id not found'])
                return ({ status: "failed", data: 'shop_id not found' })
            } else {
                data.shop_id = shop_id

            }
        }

        if (!isNull(api_key)) {
            data.api_key = api_key
        }

        if (!isNull(auth_username)) {
            data.auth_username = auth_username
        }

        if (!isNull(auth_password)) {
            data.auth_password = generateHashPassword(auth_password)
        }
        if (!isNull(auth_oauth)) {
            data.auth_oauth = auth_oauth
        }

        if (third_party_sys_id == false || third_party_sys_id == 'false') {
            data.third_party_sys_id = null
        } else {
            if (!isNull(third_party_sys_id)) {
                var check = await ThirdPartyApi.findOne({
                    where: { id: third_party_sys_id }
                })
                if (!check) {
                    await handleSaveLog(request, [[action, '', request.body], 'third_party_sys_id not found'])
                    return ({ status: "failed", data: 'third_party_sys_id not found' })
                } else {
                    data.third_party_sys_id = third_party_sys_id

                }
            }

        }


        if (!isNull(status)) {
            if (status == 'delete') {
                data.isuse = 2
            } else if (status == 'active') {
                data.isuse = 1
            } else if (status == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }

        data.updated_by = request.id
        data.updated_date = Date.now()

        var before_update = await ThirdPartyApiConnectData.findOne({
            where: {
                id: id
            }
        });

        await ThirdPartyApiConnectData.update(data, {
            where: {
                id: id
            }
        });

        var put = await ThirdPartyApiConnectData.findOne({
            where: { id: id }
        })

        await handleSaveLog(request, [[action, id, request.body, before_update], ''])
        return ({ status: "successful", data: put })
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }

}

const handleTestConnect = async (request, res) => {

    var action = 'test ThirdPartyApiConnectData '
    try {

        var id = request.params.id
        var check = await ThirdPartyApiConnectData.findOne({
            include: [
                { model: ThirdPartyApi }
            ],
            where: { id: id }
        })

        if (!check) {
            await handleSaveLog(request, [[action, '', request.body], 'id not found'])
            return ({ status: "failed", data: 'id not found' })
        }

        var url = 'http://' + config.host + ':' + config.port
        var endpoint = check.ThirdPartyApi.url_api_link

        var [shop_id, token, url, err, endpoint] = await getToken(id, url, endpoint)

        var data = []
        data[0] = {
            test_name: 'call_token',
            endpoint: '',
            status: 'success',
            message: 'successful'
        }

        if (token) {
            data[0].endpoint = endpoint
        } else {
            data[0].status = 'failed'
            data[0].message = err
            data[0].endpoint = endpoint
        }

        await handleSaveLog(request, [[action], ''])
        return ({ status: "success", data: data })


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })

    }


}
module.exports = {
    handleAllRaw,
    handleAll,
    handleById,
    handleAdd,
    handlePut,
    handleTestConnect
}