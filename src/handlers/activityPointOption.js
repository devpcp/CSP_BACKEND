const { Op, literal } = require("sequelize");
const { paginate } = require('../utils/generate');
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const ActivityPointOption = require("../models/model").ActivityPointOption;
const ProductModelType = require("../models/model").ProductModelType;

const ActivityPointOptionAll = async (request, res) => {

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    const sort = request.query.sort;
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

    var activity = await ActivityPointOption.findAll({
        order: [[sort, order]],
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ActivityPointOption\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ActivityPointOption\".\"updated_by\" )"), 'updated_by']
            ]
        },
        where: {
            [Op.and]: [{ isuse: isuse }],
            [Op.or]: [
                {
                    name: {
                        [Op.or]: [
                            { th: { [Op.like]: '%' + search + '%' } },
                            { en: { [Op.like]: '%' + search + '%' } },
                        ]
                    }
                },
                { code: { [Op.like]: '%' + search + '%' } }
            ],


        },

    })
    await handleSaveLog(request, [['get activity point option all'], ''])
    return ({ status: 'success', data: paginate(activity, limit, page) })

}


const ActivityPointOptionAdd = async (request, res) => {
    var action = 'add activity point option'
    try {
        var { code, name, upline_levels_add_point, multiplier_conditions, config } = request.body

        if (isNull(name)) {
            await handleSaveLog(request, [[action], 'name null'])
            return ({ status: "failed", data: "name can not null" })
        }

        // const ActivityPointOption_duplicate = await Access.findAll({ where: { access_name: access_name } });
        // if (access_duplicate[0]) {
        //     return ({ status: "failed", data: "access_name already" })
        // }

        if (config) {
            if (config.product_model_id && config.product_model_id.length > 0) {

                var check_group = true
                var group_exist
                await new Promise(async (resolve, reject) => {
                    config.product_model_id.forEach(async (element, index, array) => {

                        await ProductModelType.findAll({ where: { id: element } }).then(function (item) {
                            group_exist = item
                        }).catch(function (err) {
                            console.log(err)
                            handleSaveLog(request, [[action], 'product_model_id not found'])
                            reject("product_model_id not found")
                        });

                        if (!group_exist[0]) {
                            check_group = false
                        }

                        if (index === array.length - 1) resolve();
                    });
                })


                if (check_group == false) {
                    await handleSaveLog(request, [[action], 'product_model_id not found'])
                    return ({ status: "failed", data: "product_model_id not found" })
                }

            }

        }
        var create = await ActivityPointOption.create({
            code: code,
            name: name,
            upline_levels_add_point: upline_levels_add_point,
            multiplier_conditions: multiplier_conditions,
            config: config,
            created_date: Date.now(),
            created_by: request.id,
            isuse: 1
        })

        await handleSaveLog(request, [[action, create.id, request.body], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const ActivityPointOptionById = async (request, res) => {
    var action = 'get activity point option by id'
    try {
        var ActivityPointOption_id = request.params.id

        var find_ActivityPointOption = await ActivityPointOption.findAll({
            where: {
                id: ActivityPointOption_id
            },
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ActivityPointOption\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ActivityPointOption\".\"updated_by\" )"), 'updated_by']
                ]
            },
        });

        await handleSaveLog(request, [[action], ''])
        return ({ status: "successful", data: [find_ActivityPointOption[0]] })


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const ActivityPointOptionPut = async (request, res) => {
    var action = 'put activity point option'
    try {
        var { code, name, upline_levels_add_point, multiplier_conditions, config } = request.body

        var isuse = request.body.status

        var ActivityPointOption_id = request.params.id
        var data = {}


        const find_ActivityPointOption = await ActivityPointOption.findAll({ where: { id: ActivityPointOption_id } });
        if (!find_ActivityPointOption[0]) {
            await handleSaveLog(request, [[action], 'ActivityPointOption not found'])
            return ({ status: "failed", data: "ActivityPointOption not found" })
        }
        if (!isNull(code)) {
            data.code = code
        }
        if (!isNull(name)) {
            data.name = name
        }
        if (!isNull(upline_levels_add_point)) {
            data.upline_levels_add_point = upline_levels_add_point
        }
        if (!isNull(multiplier_conditions)) {
            data.multiplier_conditions = multiplier_conditions
        }
        // if (!isNull(config)) {
        //     data.config = config
        // }

        if (!isNull(config)) {
            if (config.product_model_id && config.product_model_id.length > 0) {

                var check_group = true
                var group_exist
                await new Promise(async (resolve, reject) => {
                    config.product_model_id.forEach(async (element, index, array) => {

                        await ProductModelType.findAll({ where: { id: element } }).then(function (item) {
                            group_exist = item
                        }).catch(function (err) {
                            console.log(err)
                            handleSaveLog(request, [[action], 'product_model_id not found'])
                            reject("product_model_id not found")
                        });

                        if (!group_exist[0]) {
                            check_group = false
                        }

                        if (index === array.length - 1) resolve();
                    });
                })

                if (check_group == false) {
                    await handleSaveLog(request, [[action], 'product_model_id not found'])
                    return ({ status: "failed", data: "product_model_id not found" })
                } else {
                    data.config = config
                }

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

        var before_update = await ActivityPointOption.findOne({
            where: {
                id: ActivityPointOption_id
            }
        });

        await ActivityPointOption.update(data, {
            where: {
                id: ActivityPointOption_id
            }
        });

        await handleSaveLog(request, [[action, ActivityPointOption_id, request.body, before_update], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    ActivityPointOptionAll,
    ActivityPointOptionAdd,
    ActivityPointOptionById,
    ActivityPointOptionPut
}