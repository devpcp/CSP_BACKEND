const _ = require("lodash");
const { Op, Transaction } = require("sequelize");
const { paginate, isUUID } = require('../utils/generate');
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('../handlers/log');
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const db = require('../db');
const User = require('../models/model').User;
const Group = require('../models/model').Group;


let cache__handleGroupAll = [];


const handleGroupAll = async (request = {}, response = {}, options = {}) => {

    const page = request.query?.page || 1;
    const limit = request.query?.limit || 10;
    const search = request.query?.search || '';
    const sort = request.query?.sort || 'sort_order';
    const order = request.query?.order || 'asc';
    const status = request.query?.status || 'active';

    let isuse = [];
    if (status == 'delete') {
        isuse = [2]
    } else if (status == 'active') {
        isuse = [1]
    } else if (status == 'block') {
        isuse = [0]
    } else {
        isuse = [1, 0]
    }

    const findCache = cache__handleGroupAll.findIndex(where =>
        where.search === search
        && where.sort === where.sort
        && where.order === where.order
        && where.status === where.status
    );
    let is_cached = false;
    let group = [];
    if (findCache >= 0) {
        if (Date.now() - cache__handleGroupAll[findCache].createdDate < (365 * 24 * 60 * 60000)) { // Days * Hours * Minutes * Seconds * Milliseconds
            group = cache__handleGroupAll[findCache].data;
            is_cached = true;
        }
    }

    if (!is_cached) {
        group = (await Group.findAll({
            include: [
                // {
                //     model: User, required: false, attributes: ['id', 'user_name'], through: { attributes: [] },
                // },
                {
                    model: Group,
                    as: 'children',
                    where: { isuse: isuse },
                    order: [[sort, order]],
                    required: false,
                    include: [
                        // {
                        //     model: User, required: false, attributes: ['id', 'user_name'], through: { attributes: [] },
                        // },
                        {
                            model: Group,
                            as: 'children',
                            where: { isuse: isuse },
                            order: [[sort, order]],
                            required: false,
                            include: [
                                // {
                                //     model: User, required: false, attributes: ['id', 'user_name'], through: { attributes: [] },
                                // },
                                {
                                    model: Group,
                                    as: 'children',
                                    order: [[sort, order]],
                                    include: [
                                        // {
                                        //     model: User, required: false, attributes: ['id', 'user_name'], through: { attributes: [] },
                                        // },
                                        {
                                            model: Group,
                                            as: 'children',
                                            order: [[sort, order]],
                                        }
                                    ]
                                }],
                        }]
                }
            ],
            order: [[sort, order]],
            required: false,
            where: {
                [Op.and]: [{ isuse: isuse }, { parent_id: null }],
                [Op.or]: [
                    { group_name: { [Op.like]: '%' + search + '%' } }
                ]
            }
        })).map(i => i.toJSON());
        if (findCache >= 0) {
            cache__handleGroupAll[findCache].data = group;
            cache__handleGroupAll[findCache].createdDate = Date.now();
        }
        else {
            cache__handleGroupAll.push({
                search: search,
                sort: sort,
                order: order,
                status: status,
                data: group,
                createdDate: Date.now()
            });
        }
    }

    if (!options?.is_skipSaveLog) {
        await handleSaveLog(request, [['get group all'], ''])
    }
    return ({ status: 'success', data: paginate(group, limit, page) })

}
// handleGroupAll({ request: { query: {} } }, {}, { is_skipSaveLog: true })

const handleGroupAllRaw = async (request, res) => {

    const sort = request.query.sort || 'sort_order';
    const order = request.query.order || 'desc';

    var group = await Group.findAll({
        order: [[sort, order]]
    })

    await handleSaveLog(request, [['get group all raw'], ''])
    return ({ status: 'success', data: group })
}

const handleGroupAdd = async (request, res) => {

    var action = 'add group'
    try {

        var { group_name, parent_id } = request.body
        var sort_order = 0
        const isuse = 1

        if (isNull(group_name)) {
            await handleSaveLog(request, [[action], 'group_name null'])
            return ({ status: "failed", data: "group_name can not null" })
        }

        const group_duplicate = await Group.findAll({ where: { group_name: group_name } });
        if (group_duplicate[0]) {
            await handleSaveLog(request, [[action], 'group_name already'])
            return ({ status: "failed", data: "group_name already" })
        }

        if (parent_id == false || parent_id == 'false' || isNull(parent_id)) {
            parent_id = null
            sort_order = await Group.max('sort_order', { where: { parent_id: null } });
            if (!sort_order) { sort_order = 0 }

        } else {
            const group_exist = await Group.findOne({ where: { id: parent_id } });
            if (!group_exist) {
                await handleSaveLog(request, [[action], 'parent_id not found'])
                return ({ status: "failed", data: "parent_id not found" })
            }

            sort_order = await Group.max('sort_order', { where: { parent_id: parent_id } });
            if (!sort_order) { sort_order = 0 }
        }


        var create = await Group.create({
            group_name: group_name,
            parent_id: parent_id,
            isuse: isuse,
            sort_order: sort_order + 1,
            created_by: request.id,
            created_date: Date.now()
        })
        cache__handleGroupAll = [];
        await handleSaveLog(request, [[action, create.id], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleGroupById = async (request, res) => {
    try {

        var group_id = request.params.id

        var find_group = await Group.findAll({
            include: [
                {
                    model: User, attributes: ['id', 'user_name'],
                    through: { attributes: [] },
                    required: false
                }],
            where: {
                id: group_id
            },
        });


        if (find_group[0]) {

            await handleSaveLog(request, [['get group by id'], ''])
            return ({ status: "successful", data: [find_group[0]] })
        } else {
            await handleSaveLog(request, [['get group by id'], 'group not found'])
            return ({ status: "failed", data: "group not found" })
        }

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['get group by id'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleGroupPut = async (request, res) => {
    const action = 'put group';

    try {
        const { group_name, parent_id, sort_order } = request.body;
        const status_user = request.body.status;

        const group_id = request.params.id;

        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                const data = {};

                const find_group = await Group.findOne({
                    where: {
                        id: group_id
                    },
                    transaction: transaction
                });
                if (!find_group) {
                    throw Error('group is not found');
                }

                if (_.isString(group_name)) {
                    const find_group_name_duplicate = await Group.findOne({
                        where: {
                            [Op.and]: [
                                { group_name: group_name },
                                { [Op.not]: [{ id: group_id }] }
                            ],
                        },
                        transaction: transaction
                    });
                    if (find_group_name_duplicate) {
                        throw Error('group_name is already used');
                    } else {
                        data.group_name = group_name;
                    }
                }

                if (parent_id === false || parent_id === 'false') {
                    data.parent_id = null;
                }
                if (isUUID(parent_id)) {
                    const group_exist = await Group.findOne({
                        where: {
                            id: parent_id
                        },
                        transaction: transaction
                    });
                    if (!group_exist) {
                        throw Error('parent_id not is found');
                    }
                    else {
                        data.parent_id = parent_id;
                    }
                }

                if (!isNull(sort_order)) {
                    data.sort_order = sort_order;
                }

                if (!isNull(status_user)) {
                    switch (status_user) {
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
                            throw Error('status is not allow');
                        }
                    }
                }

                data.updated_by = request.id;
                data.updated_date = Date.now();

                const before_update = await Group.findOne({
                    where: {
                        id: group_id
                    },
                    transaction: transaction
                });

                await Group.update(data, {
                    where: {
                        id: group_id
                    },
                    transaction: transaction
                });

                const after_update = await Group.findOne({
                    where: {
                        id: group_id
                    },
                    transaction: transaction
                });

                return { before_update, after_update };
            }
        )

        cache__handleGroupAll = [];

        await handleSaveLog(request, [[action, group_id, request.body, transactionResult.before_update], '']);

        return utilSetFastifyResponseJson("success", transactionResult.after_update);

    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], 'error : ' + JSON.stringify({ message: error.message, stack: error.stack })]);

        throw Error(`Error with LogId: ${errorLogId.id}`);
    }
}

module.exports = {
    handleGroupAll,
    handleGroupAllRaw,
    handleGroupAdd,
    handleGroupById,
    handleGroupPut
}