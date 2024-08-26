const { Op, literal } = require("sequelize");
const { paginate } = require('../utils/generate');
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const ActivityPoint = require("../models/model").ActivityPoint;
const ActivityPointOption = require("../models/model").ActivityPointOption;


const ActivityPointAll = async (request, res) => {

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

    var activity = await ActivityPoint.findAll({
        order: [[sort, order]],
        // include: { model: ActivityPointOption, required: true },
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ActivityPoint\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ActivityPoint\".\"updated_by\" )"), 'updated_by']
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
                { code: { [Op.like]: '%' + search + '%' } },
                // sequelize.literal("ActivityPointsOptions.name->>'th' LIKE '%" + search + "%'"),
            ],

        },
    })

    if (activity.length > 0) {
        await new Promise(async (resolve, reject) => {
            await activity.forEach(async (element, index, array) => {
                if (element.activity_points_options_id != null) {
                    var activityPointOption = await ActivityPointOption.findAll({
                        where: { id: element.activity_points_options_id },
                        attributes: ['id', 'code', 'name']

                    })

                    activity[index].dataValues.ActivityPointsOptions = activityPointOption

                } else {
                    activity[index].dataValues.ActivityPointsOptions = []
                }
                // access[index].Groups = []


                delete activity[index].dataValues.activity_points_options_id
                if (index === array.length - 1) resolve();
            });
        });
    }



    await handleSaveLog(request, [['get activity point all'], ''])
    return ({ status: 'success', data: paginate(activity, limit, page) })

}


const ActivityPointAdd = async (request, res) => {
    var action = 'add activity point'
    try {
        var { code, name, point, multiplier, activity_points_options_id, start_activity_date, end_activity_date } = request.body

        if (isNull(name)) {
            await handleSaveLog(request, [[action], 'name null'])
            return ({ status: "failed", data: "name can not null" })
        }

        // const ActivityPoint_duplicate = await ActivityPoint.findAll({ where: { ActivityPoint_name: ActivityPoint_name } });
        // if (ActivityPoint_duplicate[0]) {
        //     return ({ status: "failed", data: "ActivityPoint_name already" })
        // }

        if (activity_points_options_id && activity_points_options_id.length > 0) {
            await new Promise(async (resolve, reject) => {
                await activity_points_options_id.forEach(async (element, index, array) => {
                    var activity_point_option = await ActivityPointOption.findAll({
                        where: {
                            id: element
                        }
                    })

                    if (!activity_point_option[0]) {
                        activity_points_options_id[index] = 'no'
                    }

                    if (index === array.length - 1) resolve();
                });
            });

            if (activity_points_options_id.includes("no")) {
                await handleSaveLog(request, [[action], 'activity_points_options_id not found'])
                return ({ status: "failed", data: "activity_points_options_id[" + activity_points_options_id.indexOf("no") + "] not found" })
            }
        }



        start_activity_date = start_activity_date.toString()
        end_activity_date = end_activity_date.toString()

        var year = start_activity_date[0] + start_activity_date[1] + start_activity_date[2] + start_activity_date[3]
        var month = parseInt(start_activity_date[4] + start_activity_date[5], 10) - 1
        var day = start_activity_date[6] + start_activity_date[7]

        var year1 = end_activity_date[0] + end_activity_date[1] + end_activity_date[2] + end_activity_date[3]
        var month1 = parseInt(end_activity_date[4] + end_activity_date[5], 10) - 1
        var day1 = end_activity_date[6] + end_activity_date[7]

        // return new Date(year, month, day).getTime()

        var create = await ActivityPoint.create({
            code: code,
            name: name,
            point: point,
            multiplier: multiplier,
            activity_points_options_id: activity_points_options_id,
            start_activity_date: new Date(year, month, day).getTime(),
            end_activity_date: new Date(year1, month1, day1).getTime(),
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

const ActivityPointById = async (request, res) => {
    var action = 'get activity point by id'
    try {

        var ActivityPoint_id = request.params.id
        var activity = await ActivityPoint.findAll({
            // include: { model: ActivityPointOption, required: true },
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ActivityPoint\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ActivityPoint\".\"updated_by\" )"), 'updated_by']
                ]
            },
            where: {
                id: ActivityPoint_id

            },
        })

        if (activity.length > 0) {
            await new Promise(async (resolve, reject) => {
                await activity.forEach(async (element, index, array) => {
                    if (element.activity_points_options_id != null) {
                        var activityPointOption = await ActivityPointOption.findAll({
                            where: { id: element.activity_points_options_id },
                            attributes: ['id', 'code', 'name']

                        })

                        activity[index].dataValues.ActivityPointsOptions = activityPointOption

                    } else {
                        activity[index].dataValues.ActivityPointsOptions = []
                    }
                    // access[index].Groups = []


                    delete activity[index].dataValues.activity_points_options_id
                    if (index === array.length - 1) resolve();
                });
            });
        }


        await handleSaveLog(request, [[action], ''])
        return ({ status: "successful", data: [activity[0]] })


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const ActivityPointPut = async (request, res) => {

    var action = 'put activity point'

    try {
        var { code, name, point, multiplier, activity_points_options_id, start_activity_date, end_activity_date } = request.body


        var isuse = request.body.status

        var ActivityPoint_id = request.params.id
        var data = {}


        const find_ActivityPoint = await ActivityPoint.findAll({ where: { id: ActivityPoint_id } });
        if (!find_ActivityPoint[0]) {
            await handleSaveLog(request, [[action], 'ActivityPoint not found'])
            return ({ status: "failed", data: "ActivityPoint not found" })
        }

        if (activity_points_options_id && activity_points_options_id.length > 0) {
            await new Promise(async (resolve, reject) => {
                await activity_points_options_id.forEach(async (element, index, array) => {
                    var activity_point_option = await ActivityPointOption.findAll({
                        where: {
                            id: element
                        }
                    })

                    if (!activity_point_option[0]) {
                        activity_points_options_id[index] = 'no'
                    }

                    if (index === array.length - 1) resolve();
                });
            });

            if (activity_points_options_id.includes("no")) {
                await handleSaveLog(request, [[action], 'activity_points_options_id not found'])
                return ({ status: "failed", data: "activity_points_options_id[" + activity_points_options_id.indexOf("no") + "] not found" })
            } else {
                data.activity_points_options_id = activity_points_options_id
            }
        }

        if (!isNull(code)) {
            data.code = code
        }
        if (!isNull(name)) {
            data.name = name
        }
        if (!isNull(point)) {
            data.point = point
        }
        if (!isNull(multiplier)) {
            data.multiplier = multiplier
        }

        if (!isNull(start_activity_date)) {
            start_activity_date = start_activity_date.toString()
            var year = start_activity_date[0] + start_activity_date[1] + start_activity_date[2] + start_activity_date[3]
            var month = parseInt(start_activity_date[4] + start_activity_date[5], 10) - 1
            var day = start_activity_date[6] + start_activity_date[7]

            data.start_activity_date = new Date(year, month, day).getTime()
        }


        if (!isNull(end_activity_date)) {


            end_activity_date = end_activity_date.toString()
            var year1 = end_activity_date[0] + end_activity_date[1] + end_activity_date[2] + end_activity_date[3]
            var month1 = parseInt(end_activity_date[4] + end_activity_date[5], 10) - 1
            var day1 = end_activity_date[6] + end_activity_date[7]

            data.end_activity_date = new Date(year1, month1, day1).getTime()


        }
        else {
            data.end_activity_date = null
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

        var before_update = await ActivityPoint.findOne({
            where: {
                id: ActivityPoint_id
            }
        });


        await ActivityPoint.update(data, {
            where: {
                id: ActivityPoint_id
            }
        });

        await handleSaveLog(request, [[action, ActivityPoint_id, request.body, before_update], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    ActivityPointAll,
    ActivityPointAdd,
    ActivityPointById,
    ActivityPointPut
}