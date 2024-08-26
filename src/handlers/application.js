const { generateSearchOpFromKeys } = require('../utils/generate')
const { isArray } = require("lodash");
const { Op, literal, Transaction } = require("sequelize");
const { paginate } = require('../utils/generate')
const { isNull } = require('../utils/generate')
const { handleSaveLog } = require('../handlers/log')
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetIsUse = require("../utils/util.GetIsUse");
const db = require('../db');
const Group = require('../models/Groups/Group');
const Access = require('../models/Access/Access');
const Application = require('../models/Application/Application');
const Role = require('../models/Role/Role');


const handleApplicationAll = async (request, res) => {

    const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;


    var isuse = []
    if (status == 'inactive') {
        isuse = [false]
    } else if (status == 'active') {
        isuse = [true]
    } else {
        isuse = [true, false]
    }

    var application = await Application.findAll({
        include: [{
            model: Access, attributes: ['id', 'access_name']
        }, {
            model: Application,
            as: 'children',
            where: { use_menu: isuse },
            order: [[sort, order]],
            required: false,
            include: [{
                model: Access, attributes: ['id', 'access_name']
            }, {
                model: Application,
                as: 'children',
                where: { use_menu: isuse },
                // order: [[sort, order]],
                required: false,
                include: [{
                    model: Access, attributes: ['id', 'access_name']
                }, {
                    model: Application,
                    as: 'children',
                    where: { use_menu: isuse },
                    // order: [[sort, order]],
                    required: false,
                    include: [{
                        model: Access, attributes: ['id', 'access_name']
                    }, {
                        model: Application,
                        as: 'children',
                        where: { use_menu: isuse },
                        // order: [[sort, order]],
                        required: false,
                        include: [{
                            model: Access, attributes: ['id', 'access_name']
                        }, {
                            model: Application,
                            as: 'children',
                            where: { use_menu: isuse },
                            // order: [[sort, order]],
                            required: false,
                        }]
                    }]
                }]
            }]

        }],
        // order: [['children', sort, order]],
        order: [['sort_order', order],
        [literal(`\"children\".sort_order ${order}`)],
        [literal(`\"children->children\".sort_order ${order}`)],
        [literal(`\"children->children->children\".sort_order ${order}`)],
        [literal(`\"children->children->children->children\".sort_order ${order}`)],
        [literal(`\"children->children->children->children->children\".sort_order ${order}`)]
        ],
        required: false,
        where: {
            [Op.and]: [{ use_menu: isuse }, { parent_menu: null }],
            [Op.or]: [
                {
                    application_name: {
                        [Op.or]: [
                            ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                        ]
                    }
                },
                { url: { [Op.like]: '%' + search + '%' } },
                { "$Access.access_name$": { [Op.like]: '%' + search + '%' } },


            ]
        },
    })
    // application.sort((a, b) => (a.sort_order > b.sort_order) ? 1 : ((b.sort_order > a.sort_order) ? -1 : 0))

    await handleSaveLog(request, [['get applicaiton all'], ''])
    return ({ status: 'success', data: paginate(application, limit, page) })

}


const handleApplicationAdd = async (request, res) => {
    var action = 'add applicaiton'
    try {

        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        var { application_name, url, access, parent_menu, use_menu, func_status, application_config, Access_role } = request.body
        var sort_order = 0

        if (isNull(application_name)) {
            await handleSaveLog(request, [[action], 'application_name null'])
            return ({ status: "failed", data: "application_name can not null" })
        }
        const application_duplicate = await Application.findAll(
            {
                where: {
                    application_name: {
                        [Op.or]: [
                            { th: application_name.th },
                            { en: application_name.en },

                        ]
                    }
                }
            }
        );
        if (application_duplicate[0]) {
            await handleSaveLog(request, [[action], 'application_name already'])
            return ({ status: "failed", data: "application_name already" })
        }


        if (!isNull(access)) {
            const find_access = await Access.findAll({ where: { id: access } });
            if (!find_access[0]) {
                await handleSaveLog(request, [[action], 'access not found'])
                return ({ status: "failed", data: "access not found" })
            }
        }


        if (parent_menu == false || parent_menu == 'false') {

            parent_menu = undefined
        } else {
            if (!isNull(parent_menu)) {
                const find_parent = await Application.findAll({ where: { id: parent_menu } });
                if (!find_parent[0]) {
                    await handleSaveLog(request, [[action], 'parent_menu not found'])
                    return ({ status: "failed", data: "parent_menu not found" })
                }
            }
        }



        if (!func_status) {
            func_status = 1
        }



        sort_order = await Application.max('sort_order')

        /**
         * @typedef {object} IAccess_role
         * @property {string} Access_role.group_name
         * @property {string} Access_role.group_id
         * @property {number} Access_role.create
         * @property {number} Access_role.read
         * @property {number} Access_role.update
         * @property {number} Access_role.delete
         * @property {string} Access_role.id
         */
        /**
         * A function for create Role from parameter Access_role
         * @param {string} application_id
         * @param {IAccess_role.Access_role[]} Access_role
         * @param {import("sequelize").Transaction} transaction
         * @return {Promise<import("../models/Role/Role").Role[]>}
         */
        const fnCreateGroupDocuments = async (application_id, Access_role, transaction) => {
            const createdRoleDocuments = [];

            if (isArray(Access_role)) {
                for (let index = 0; index < Access_role.length; index++) {
                    const accessRoleElement = Access_role[index];
                    const findGroupExists = await Group.findOne(
                        {
                            where: {
                                id: accessRoleElement.group_id
                            },
                            transaction: transaction
                        }
                    );
                    if (!findGroupExists) { throw Error(`Group is not found`); }
                    else {
                        const createdRoleDocument = await Role.create(
                            {
                                application_id: application_id,
                                group_id: accessRoleElement.group_id,
                                create: accessRoleElement.create,
                                read: accessRoleElement.read,
                                update_: accessRoleElement.update,
                                delete: accessRoleElement.delete
                            },
                            {
                                transaction: transaction
                            }
                        );

                        createdRoleDocuments.push(createdRoleDocument);
                    }
                }
            }

            return createdRoleDocuments;
        };

        const createdApplicationDocument = await db.transaction(
            {
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                const createdApplicationDocument = await Application.create(
                    {
                        application_name: application_name,
                        access: access,
                        parent_menu: parent_menu,
                        use_menu: use_menu,
                        url: url,
                        func_status: func_status,
                        application_config: application_config,
                        sort_order: sort_order + 1,
                        created_by: request.id,
                        created_date: Date.now(),
                        application_name_old: application_name.th,
                        ...utilGetIsUse(request.body['isuse'])
                    },
                    {
                        transaction: transaction
                    }
                );

                await fnCreateGroupDocuments(createdApplicationDocument.id, Access_role, transaction);

                return createdApplicationDocument;
            }
        );

        await handleSaveLog(request, [[action, createdApplicationDocument.id, request.body], '']);

        return utilSetFastifyResponseJson("success", createdApplicationDocument.id);
    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return ({ status: "failed", data: error.toString() });
    }
}

const handleApplicationById = async (request, res) => {
    try {

        var application_id = request.params.id

        var find_application = await Application.findAll({
            include: [{
                model: Access, attributes: ['id', 'access_name', 'rules'], where: {
                    [Op.and]: [{ isuse: [1] }]
                },
            }],
            where: {
                [Op.and]: [
                    { use_menu: [true, false] },
                    { id: application_id }
                ]
            },
        });


        if (find_application[0]) {

            if (find_application[0].Access) {
                var group = await Group.findAll({
                    attributes: ['id', 'group_name'],
                    where: {
                        [Op.and]: [
                            { isuse: [1] },
                            { id: find_application[0].Access.rules }
                        ],
                    }
                })

                if (group.length > 0) {

                    await new Promise(async (resolve, reject) => {
                        await group.forEach(async (element, index, array) => {
                            var role = await Role.findAll({
                                where: [{ group_id: element.id }, { application_id: application_id }]
                            })

                            if (role[0]) {
                                // update = role[0].update
                                group[index].dataValues.create = role[0].create
                                group[index].dataValues.read = role[0].read
                                group[index].dataValues.update = role[0].update_
                                group[index].dataValues.delete = role[0].delete
                            } else {
                                group[index].dataValues.create = 0
                                group[index].dataValues.read = 1
                                group[index].dataValues.update = 0
                                group[index].dataValues.delete = 0
                            }

                            if (index === array.length - 1) resolve();
                        });
                    });

                    find_application[0].dataValues.Access_role = group
                }

            }
            await handleSaveLog(request, [['get applicaiton by id'], ''])
            return ({ status: "successful", data: [find_application[0]] })
        } else {
            await handleSaveLog(request, [['get applicaiton by id'], 'application not found'])
            return ({ status: "failed", data: "application not found" })
        }

    } catch (error) {
        await handleSaveLog(request, [['get applicaiton by id'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleApplicationPut = async (request, res) => {
    var action = 'put applicaiton'
    try {

        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        var { application_name, url, access, parent_menu, func_status, application_config, Access_role, sort_order } = request.body
        var status_user = request.body.status

        var application_id = request.params.id
        var data = {}
        const find_application = await Application.findAll({ where: { id: application_id } });
        if (!find_application[0]) {
            await handleSaveLog(request, [[action], 'application not found'])
            return ({ status: "failed", data: "application not found" })
        }



        if (!isNull(application_name)) {
            const application_duplicate = await Application.findAll({
                where: {
                    [Op.and]: [
                        {
                            application_name: {
                                [Op.or]: [
                                    // ...generateSearchOpFromKeys(pageLang, Op.eq, application_name)
                                    {
                                        en: {
                                            [Op.eq]: application_name.en
                                        }
                                    },
                                    {
                                        th: {
                                            [Op.eq]: application_name.th
                                        }
                                    }

                                ]
                            }

                        },
                        { [Op.not]: [{ id: application_id }] }
                    ],
                }

            });
            if (application_duplicate[0]) {
                await handleSaveLog(request, [[action], 'application already'])
                return ({ status: "failed", data: "application_name already" })
            } else {
                data.application_name = application_name
            }
        }

        if (!isNull(access)) {
            const find_access = await Access.findAll({ where: { id: access } });
            if (!find_access[0]) {
                await handleSaveLog(request, [[action], 'access not found'])
                return ({ status: "failed", data: "access not found" })
            } else {
                data.access = access
            }
        }


        if (parent_menu == false || parent_menu == 'false') {
            data.parent_menu = null
        } else {
            if (!isNull(parent_menu)) {
                const find_parent = await Application.findAll({ where: { id: parent_menu } });
                if (!find_parent[0]) {
                    await handleSaveLog(request, [[action], 'parent_menu not found'])
                    return ({ status: "failed", data: "parent_menu not found" })
                } else {
                    data.parent_menu = parent_menu
                }
            }
        }




        if (!isNull(url)) {
            data.url = url
        }
        if (!isNull(func_status)) {
            data.func_status = func_status
        }
        if (!isNull(application_config)) {
            data.application_config = application_config
        }
        if (!isNull(sort_order)) {
            data.sort_order = sort_order
        }

        if (Access_role && Access_role.length > 0) {
            await new Promise(async (resolve, reject) => {
                await Access_role.forEach(async (element, index, array) => {
                    var group = await Group.findAll({
                        where: {
                            id: element.id
                        }
                    })

                    if (!group[0]) {
                        Access_role[index].id = 'no'
                    }

                    if (index === array.length - 1) resolve();
                });
            });

        }


        if (Access_role && Access_role.filter(e => e.id == 'no').length > 0) {
            await handleSaveLog(request, [[action], 'group_id not found'])
            return ({ status: "failed", data: "group_id not found" })
        }

        if (!isNull(status_user)) {
            if (status_user == 'active') {
                data.use_menu = true
            } else if (status_user == 'inactive') {
                data.use_menu = false
            }
        }

        data.updated_by = request.id
        data.updated_date = Date.now()

        var before_update = await Application.findOne({
            where: {
                id: application_id,
            }
        });

        await Application.update({ ...data, ...utilGetIsUse(request.body["isuse"]) }, {
            where: {
                id: application_id,
            }
        });

        if (Access_role && Access_role.length > 0) {
            await new Promise(async (resolve, reject) => {
                await Access_role.forEach(async (element, index, array) => {
                    Role.destroy({
                        where: {
                            [Op.and]: [{ application_id: application_id }, { group_id: element.id }]
                        }
                    })

                    Role.create({
                        application_id: application_id,
                        group_id: element.id,
                        create: element.create,
                        read: element.read,
                        update_: element.update,
                        delete: element.delete,
                        created_by: request.id
                    })

                    if (index === array.length - 1) resolve();
                });
            });
        }
        await handleSaveLog(request, [[action, application_id, request.body, before_update], ''])
        return ({ status: "successful", data: "success" })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleApplicationSort = async (request, res) => {

    var action = 'applicaiton sort'
    try {

        var data = request.body

        if (data.length != 2) {
            await handleSaveLog(request, [[action], 'array must contain 2 item'])
            return utilSetFastifyResponseJson("failed", "array must contain 2 item");
        }

        await Application.update({ sort_order: data[0].sort_order }, { where: { id: data[0].id } })
        await Application.update({ sort_order: data[1].sort_order }, { where: { id: data[1].id } })

        await handleSaveLog(request, [[action, '', request.body], ''])
        return utilSetFastifyResponseJson("success", "success");

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], error])
        return utilSetFastifyResponseJson("failed", error);
    }

}
module.exports = {
    handleApplicationAll,
    handleApplicationAdd,
    handleApplicationById,
    handleApplicationPut,
    handleApplicationSort
}