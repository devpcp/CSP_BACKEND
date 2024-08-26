const { isNull } = require('../utils/generate')
const { Op, literal } = require("sequelize");
const { handleSaveLog } = require('./log');
const Region = require('../models/model').Region;
const MapRegProv = require('../models/model').MapRegProv;
const Province = require('../models/model').Province;

const regionAllRaw = async (request) => {

    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search
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


    var where_q = {
        [Op.and]: [{ isuse: isuse }],
        [Op.or]: [
            { name_th: { [Op.like]: '%' + search + '%' } },
            { name_en: { [Op.like]: '%' + search + '%' } },
            { reg_code: { [Op.like]: '%' + search + '%' } },
        ]


    }

    var include = [
        {
            model: MapRegProv,
            attributes: {
                include: [
                    [literal(`prov_id`), 'id'],
                    [literal(`\"Province\".prov_code`), 'prov_code'],
                    [literal(`\"Province\".prov_text_code`), 'prov_text_code'],
                    [literal(`\"Province\".prov_name_th`), 'prov_name_th'],
                    [literal(`\"Province\".prov_name_en`), 'prov_name_en'],
                    [literal(`\"Province\".reg_code`), 'reg_code'],
                    [literal(`\"Province\".cwt_unig`), 'cwt_unig'],
                    [literal(`\"Province\".initials`), 'initials'],
                ]
            },
            include: {
                model: Province,
                attributes: []
            },
            separate: true,

        }
    ]


    var pro = await Region.findAll({
        where: where_q,
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Region\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Region\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        order: [[sort, order]],
        include: include
    })



    await handleSaveLog(request, [['get master region all raw'], ''])
    return ({ status: "success", data: pro })
}
const regionAll = async (request) => {

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search
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


    var where_q = {
        [Op.and]: [{ isuse: isuse }],
        [Op.or]: [
            { name_th: { [Op.like]: '%' + search + '%' } },
            { name_en: { [Op.like]: '%' + search + '%' } },
            { reg_code: { [Op.like]: '%' + search + '%' } },
        ]


    }

    var include = [
        {
            model: MapRegProv,
            attributes: {
                include: [
                    [literal(`prov_id`), 'id'],
                    [literal(`\"Province\".prov_code`), 'prov_code'],
                    [literal(`\"Province\".prov_text_code`), 'prov_text_code'],
                    [literal(`\"Province\".prov_name_th`), 'prov_name_th'],
                    [literal(`\"Province\".prov_name_en`), 'prov_name_en'],
                    [literal(`\"Province\".reg_code`), 'reg_code'],
                    [literal(`\"Province\".cwt_unig`), 'cwt_unig'],
                    [literal(`\"Province\".initials`), 'initials'],
                ]
            },
            include: {
                model: Province,
                attributes: []
            },
            separate: true,

        }
    ]


    var pro = await Region.findAll({
        where: where_q,
        order: [[sort, order]],
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Region\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Region\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        include: include,
        limit: limit,
        offset: (page - 1) * limit,
    })


    var length_data = await Region.count({
        include: include,
        where: where_q
    })


    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: pro.length,
        totalCount: length_data,
        data: pro

    }

    await handleSaveLog(request, [['get master region all'], ''])
    return ({ status: "success", data: pag })
}



const regionPut = async (request) => {

    var action = 'put region'
    try {
        var { reg_code, name_th, name_en, MapRegProvs } = request.body
        var isuse = request.body.status
        var id = request.params.id
        // return id

        var data = {}
        if (!isNull(reg_code)) {
            data.reg_code = reg_code
        }
        if (!isNull(name_th)) {
            data.name_th = name_th
        }
        if (!isNull(name_en)) {
            data.name_en = name_en
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

        var before_update = await Region.findOne({
            where: { id: id }
        })
        await Region.update(data, {
            where: { id: id }
        })

        if (MapRegProvs) {
            await MapRegProv.destroy({
                where: {
                    [Op.and]: [{ reg_id: id }]
                }
            })

            for (let index = 0; index < MapRegProvs.length; index++) {
                const element = MapRegProvs[index];
                await MapRegProv.create({
                    reg_id: id,
                    prov_id: element.id
                })
            }

        }

        var pro = await Region.findOne({
            where: { id: id },
            include: [
                {
                    model: MapRegProv,
                    attributes: {
                        include: [
                            [literal(`prov_id`), 'id'],
                            [literal(`\"Province\".prov_code`), 'prov_code'],
                            [literal(`\"Province\".prov_text_code`), 'prov_text_code'],
                            [literal(`\"Province\".prov_name_th`), 'prov_name_th'],
                            [literal(`\"Province\".prov_name_en`), 'prov_name_en'],
                            [literal(`\"Province\".reg_code`), 'reg_code'],
                            [literal(`\"Province\".cwt_unig`), 'cwt_unig'],
                            [literal(`\"Province\".initials`), 'initials'],
                        ]
                    },
                    include: {
                        model: Province,
                        attributes: []
                    },
                    separate: true,

                }
            ]
        })
        await handleSaveLog(request, [[action, id, request.body, before_update], ''])
        return ({ status: "success", data: pro })
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })

    }

}

const regionAdd = async (request) => {

    var action = 'add region'
    try {
        var { reg_code, name_th, name_en, MapRegProvs } = request.body
        // return id

        var create = await Region.create(
            {
                ...request.body,
                created_by: request.id,
                isuse: 1,
                updated_date: new Date()
            })

        if (MapRegProvs) {
            await MapRegProv.destroy({
                where: {
                    [Op.and]: [{ reg_id: create.id }]
                }
            })

            for (let index = 0; index < MapRegProvs.length; index++) {
                const element = MapRegProvs[index];
                await MapRegProv.create({
                    reg_id: create.id,
                    prov_id: element.id
                })
            }

        }

        var pro = await Region.findOne({
            where: { id: create.id },
            include: [
                {
                    model: MapRegProv,
                    attributes: {
                        include: [
                            [literal(`prov_id`), 'id'],
                            [literal(`\"Province\".prov_code`), 'prov_code'],
                            [literal(`\"Province\".prov_text_code`), 'prov_text_code'],
                            [literal(`\"Province\".prov_name_th`), 'prov_name_th'],
                            [literal(`\"Province\".prov_name_en`), 'prov_name_en'],
                            [literal(`\"Province\".reg_code`), 'reg_code'],
                            [literal(`\"Province\".cwt_unig`), 'cwt_unig'],
                            [literal(`\"Province\".initials`), 'initials'],
                        ]
                    },
                    include: {
                        model: Province,
                        attributes: []
                    },
                    separate: true,

                }
            ]
        })
        await handleSaveLog(request, [[action, create.id, request.body], ''])
        return ({ status: "success", data: pro })
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }

}


const regionById = async (request) => {

    var id = request.params.id

    var where_q = { id: id }

    var include = [
        {
            model: MapRegProv,
            attributes: {
                include: [
                    [literal(`prov_id`), 'id'],
                    [literal(`\"Province\".prov_code`), 'prov_code'],
                    [literal(`\"Province\".prov_text_code`), 'prov_text_code'],
                    [literal(`\"Province\".prov_name_th`), 'prov_name_th'],
                    [literal(`\"Province\".prov_name_en`), 'prov_name_en'],
                    [literal(`\"Province\".reg_code`), 'reg_code'],
                    [literal(`\"Province\".cwt_unig`), 'cwt_unig'],
                    [literal(`\"Province\".initials`), 'initials'],
                ]
            },
            include: [{
                model: Province,
                attributes: []

            }],
            separate: true,

        }
    ]

    var pro = await Region.findOne({
        where: where_q,
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Region\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Region\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        include: include,
    })

    await handleSaveLog(request, [['get region by id'], ''])
    return ({ status: "success", data: pro })
}



module.exports = {
    regionAllRaw,
    regionAll,
    regionPut,
    regionById,
    regionAdd
}