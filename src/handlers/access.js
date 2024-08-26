const { Op } = require("sequelize");
const { paginate } = require('../utils/generate');
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('../handlers/log');
const Group = require('../models/model').Group;
const Access = require('../models/model').Access;


const handleAccessAll = async (request, res) => {

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

    var access = await Access.findAll({
        order: [[sort, order]],
        required: false,
        where: {
            [Op.and]: [{ isuse: isuse }],
            [Op.or]: [
                { access_name: { [Op.like]: '%' + search + '%' } }
            ]
        },
    })

    if (access.length > 0) {
        await new Promise(async (resolve, reject) => {
            await access.forEach(async (element, index, array) => {
                // access[index].Groups = []
                group = await Group.findAll({
                    where: {
                        id: element.rules
                    }, attributes: ['id', 'group_name']
                })

                access[index].dataValues.Groups = group

                if (index === array.length - 1) resolve();
            });
        });
    }




    await handleSaveLog(request, [['get access all'], ''])
    return ({ status: 'success', data: paginate(access, limit, page) })

}

const handleAccessAllRaw = async (request, res) => {

    const sort = request.query.sort || 'sort_order';
    const order = request.query.order || 'desc';

    var access = await Access.findAll({
        order: [[sort, order]]
    })

    // return group
    return ({ status: 'success', data: access })

}

const handleAccessAdd = async (request, res) => {
    var action = 'add access'
    try {

        var { access_name, group_id } = request.body
        var sort_order = 0
        const isuse = 1

        if (isNull(access_name)) {
            await handleSaveLog(request, [[action], 'access_name null'])
            return ({ status: "failed", data: "access_name can not null" })
        }

        const access_duplicate = await Access.findAll({ where: { access_name: access_name } });
        if (access_duplicate[0]) {
            await handleSaveLog(request, [[action], 'access_name already'])
            return ({ status: "failed", data: "access_name already" })
        }

        if (group_id && group_id.length > 0) {
            await new Promise(async (resolve, reject) => {
                await group_id.forEach(async (element, index, array) => {
                    var group = await Group.findAll({
                        where: {
                            id: element
                        }
                    })

                    if (!group[0]) {
                        group_id[index] = 'no'
                    }

                    if (index === array.length - 1) resolve();
                });
            });
        }

        if (group_id.includes("no")) {
            await handleSaveLog(request, [[action], 'group_id not found'])
            return ({ status: "failed", data: "group_id[" + group_id.indexOf("no") + "] not found" })
        }

        sort_order = await Access.max('sort_order')

        var create = await Access.create({
            access_name: access_name,
            rules: group_id,
            isuse: isuse,
            sort_order: sort_order + 1,
            created_by: request.id,
            created_date: Date.now()
        })
        await handleSaveLog(request, [[action, create.id, request.body], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleAccessById = async (request, res) => {
    var action = 'get access by id'
    try {
        var access_id = request.params.id

        var find_access = await Access.findAll({
            where: {
                id: access_id
            },
        });


        if (find_access[0]) {
            group = await Group.findAll({
                where: {
                    id: find_access[0].rules
                }, attributes: ['id', 'group_name']
            })
            find_access[0].dataValues.Groups = group
            await handleSaveLog(request, [[action], ''])
            return ({ status: "successful", data: [find_access[0]] })
        } else {
            await handleSaveLog(request, [[action], 'access not found'])
            return ({ status: "failed", data: "access not found" })
        }
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleAccessPut = async (request, res) => {
    var action = 'put access'
    try {
        var { access_name, group_id, sort_order } = request.body
        var status_user = request.body.status

        var access_id = request.params.id
        var data = {}
        const find_access = await Access.findAll({ where: { id: access_id } });
        if (!find_access[0]) {
            await handleSaveLog(request, [[action], 'access not found'])
            return ({ status: "failed", data: "access not found" })
        }
        if (!isNull(access_name)) {
            const access_duplicate = await Access.findAll({
                where: {
                    [Op.and]: [{ access_name: access_name }, { [Op.not]: [{ id: access_id }] }],
                }
            });
            if (access_duplicate[0]) {
                await handleSaveLog(request, [[action], 'access_name already'])
                return ({ status: "failed", data: "access_name already" })
            } else {
                data.access_name = access_name
            }
        }

        if (group_id && group_id.length > 0) {
            await new Promise(async (resolve, reject) => {
                await group_id.forEach(async (element, index, array) => {
                    var group = await Group.findAll({
                        where: {
                            id: element
                        }
                    })

                    if (!group[0]) {
                        group_id[index] = 'no'
                    }

                    if (index === array.length - 1) resolve();
                });
            });

        }

        if (group_id && group_id.includes("no")) {
            await handleSaveLog(request, [[action], 'group_id not found'])
            return ({ status: "failed", data: "group_id[" + group_id.indexOf("no") + "] not found" })
        } else {
            data.rules = group_id
        }

        if (!isNull(sort_order)) {
            data.sort_order = sort_order
        }


        if (!isNull(status_user)) {
            if (status_user == 'delete') {
                data.isuse = 2
            } else if (status_user == 'active') {
                data.isuse = 1
            } else if (status_user == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }
        data.updated_by = request.id
        data.updated_date = Date.now()

        var before_update = await Access.findOne({
            where: {
                id: access_id
            }
        });

        await Access.update(data, {
            where: {
                id: access_id
            }
        });
        await handleSaveLog(request, [[action, access_id, request.boyd, before_update], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    handleAccessAll,
    handleAccessAllRaw,
    handleAccessAdd,
    handleAccessById,
    handleAccessPut
}