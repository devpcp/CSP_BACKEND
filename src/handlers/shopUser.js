/**
 * @type {import("lodash")}
 */
const _ = require("lodash");
const { Op, Transaction } = require("sequelize");
const { handleSaveLog } = require('./log');
const utilCheckShopTableName = require('../utils/util.CheckShopTableName');
const { generateHashPassword, isNull } = require('../utils/generate');
const db = require('../db')
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");
const { ShopDocumentCode } = require("../models/model");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetMemoryModels = require("../utils/util.GetMemoryModels");
const User = require('../models/model').User;
const Group = require('../models/model').Group;
const MapUserGroup = require('../models/model').MapUserGroup;
const Oauth = require('../models/model').Oauth;
const UsersProfiles = require('../models/model').UsersProfiles;
const Departments = require('../models/model').Departments;


/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handleUserAdd = async (request = {}, response = {}, options = {}) => {
    const action = 'POST ShopUser.Add';

    try {
        const currentDateTime = options?.currentDateTime || new Date();

        let { user_name, password, e_mail, note, user_profile_data, department_id } = request.body;

        const shop_table = await utilCheckShopTableName(request)
        const table_name = shop_table.shop_code_id;
        const ObjModels = utilGetModelsAndShopModels(table_name);
        const ShopModels = ObjModels.ShopModels;

        if (!_.isString(user_name) || user_name.length === 0) {
            throw new Error(`ข้อมูลชื่อผู้ใช้ไม่ถูกต้อง`);
        }
        if (!_.isString(password) || password.length === 0) {
            throw new Error(`ข้อมูลชื่อรหัสผ่านไม่ถูกต้อง`);
        }

        const findIsDuplicated_Username = await User.findOne({
            where: {
                user_name: user_name
            }
        });
        if (findIsDuplicated_Username) {
            throw new Error(`มีผู้ใช้งานชื่อผู้ใช้นี้แล้ว`);
        }

        if (_.isString(e_mail) && e_mail.length > 0) {
            const findIsDuplicated_Email = await User.findOne({
                where: {
                    e_mail: e_mail
                }
            });
            if (findIsDuplicated_Email) {
                throw new Error(`มีผู้ใช้งาน E-mail นี้แล้ว`);
            }
        }

        const generatedHashedPassword = generateHashPassword(password);

        /**
         * @param {import("sequelize").Transaction} transaction
         * @returns {Promise<{
         *     User: User;
         *     UserProfile: UsersProfiles;
         *     MapUserGroups: MapUserGroup[]
         * }>}
         */
        const fnCreateUser = async (transaction) => {

            const createdUser = await User.create(
                {
                    user_name: user_name,
                    password: generatedHashedPassword,
                    e_mail: e_mail,
                    note: note,
                    status: 1,
                    created_by: request.id,
                    created_date: currentDateTime
                },
                {
                    transaction: transaction
                }
            );

            const createdUserProfile = await UsersProfiles.create(
                {
                    ...user_profile_data,
                    user_id: createdUser.id,
                    shop_id: shop_table.id,
                    status: 1,
                    created_by: request.id,
                    created_date: currentDateTime
                },
                {
                    transaction: transaction
                }
            );

            const createdUserGroups = [];
            if (Array.isArray(department_id)) {
                for (let index = 0; index < department_id.length; index++) {
                    const element = department_id[index];

                    let group_id = await Departments.findOne({
                        where: {
                            id: element
                        }
                    });
                    group_id = group_id.user_group_id;

                    const createdUserGroup = await MapUserGroup.create(
                        {
                            user_id: createdUser.id,
                            group_id: group_id
                        },
                        {
                            transaction: transaction
                        }
                    );

                    createdUserGroups.push(createdUserGroup);

                    await handleSaveLog(request, [['map user with group', group_id, createdUser.id], '']);
                }
            }

            return {
                User: createdUser,
                UserProfile: createdUserProfile,
                MapUserGroups: createdUserGroups
            };
        }


        const transactionResult = await db.transaction(
            {
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
                transaction: request?.transaction || options?.transaction || null
            },
            async (transaction) => {
                if (!request?.transaction || !options?.transaction) {
                    request.transaction = transaction;
                    options.transaction = transaction;
                }

                const createdUser = await fnCreateUser(transaction);
                const createdUser_code_id = await UsersProfiles.setField_code_id(
                    table_name,
                    createdUser.UserProfile.get('id'),
                    {
                        transaction: transaction,
                        ShopDocumentCode: utilGetMemoryModels(table_name, ShopDocumentCode(table_name)),
                        findUserProfile: createdUser.UserProfile
                    }
                );

                return {
                    User: createdUser.User,
                    UserProfile: createdUser_code_id.UserProfile,
                    MapUserGroups: createdUser.MapUserGroups
                };
            }
        );

        await handleSaveLog(request, [[action, transactionResult.User.get('id'), request.body], ''])

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return utilSetFastifyResponseJson('failed', error.toString());
    }
}


const handleUserAll = async (request, res) => {
    const action = 'GET ShopUser.All';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');
        /**
         * @type {string}
         */
        const shop_table = findShopProfiles[0];

        const id = request.id

        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const search = request.query.search;
        const sort = request.query.sort;
        const order = request.query.order;
        let status = request.query.status || 'default';
        const selectInAuth = request.query.selectInAuth || false;
        let department_id = request.query.department_id || []

        if (department_id.length > 0) {
            // department_id = ` (${department_id.map(el => { return "'" + el + "'" })}) `

            department_id = await Departments.findAll({ where: { id: { [Op.in]: department_id } } })

            if (department_id.length > 0) {
                department_id = department_id.map(el => { return el.user_group_id })
            } else {
                department_id = null
            }

        } else {
            department_id = null

        }

        if (status == 'block') {
            status = [0];
        } else if (status == 'active') {
            status = [1]
        } else if (status == 'delete') {
            status = [2]
        } else {
            status = [0, 1];
        }

        let user_oauth = [];
        if (selectInAuth == true) {
            user_oauth = await Oauth.findAll()
            if (user_oauth.length > 0) {
                user_oauth = user_oauth.map(el => { return el.user_id })
            }

        }


        const where_q = {
            [Op.and]: [
                // (department_id != null) ? sequelize.literal(`\"UsersProfile\".department_id in ${department_id}`) : {},
                db.literal(`\"UsersProfile\".shop_id = :shop_id`),
                { status: status, id: { [Op.notIn]: user_oauth } }
            ]
        }
        if (search.length > 0) {
            where_q[Op.or] = [
                { user_name: { [Op.like]: '%' + search + '%' } },
                { e_mail: { [Op.like]: '%' + search + '%' } },
                db.literal(`CONCAT(\"UsersProfile\".fname->>'th',' ',\"UsersProfile\".lname->>'th') ILIKE '%${search}%'`),
                db.literal(`\"UsersProfile\".details->>'emp_code' ILIKE '%${search}%'`),
                db.literal(`\"UsersProfile\".tel ILIKE '%${search}%'`),
                db.literal(`\"UsersProfile\".mobile ILIKE '%${search}%'`),
                // db.literal(`"Groups"."group_name" ilike '%${search}%'`),
            ];
        }

        // (department_id.length > 0) ? ...{ }: {}

        /**
         * @type {import("sequelize").Includeable[]}
         */
        const inc = [
            {
                model: Group,
                attributes: ['id', 'group_name'],
                ...(department_id != null) ? { required: true } : { required: false },
                where: {
                    [Op.and]: [
                        { isuse: [1] },
                        (department_id != null) ? { id: { [Op.in]: department_id } } : {},
                    ]
                },
                include: [
                    {
                        model: Departments
                    }
                ]
            },
            {
                model: Oauth,
                required: false
            },
            {
                model: UsersProfiles,
                required: true
            },
        ]



        const data = await User.findAll({
            attributes: {
                include: [
                    [db.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"User\".\"created_by\" )"), 'created_by'],
                    [db.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"User\".\"updated_by\" )"), 'updated_by'],
                ],
                exclude: ['password', 'token_set']
            },
            include: inc,
            where: where_q,
            replacements: { shop_id: shop_table.id },
            subQuery: true,
            order: [[sort, order]],
            limit: limit,
            offset: (page - 1) * limit,
        })

        let length_data = await User.findAll({
            attributes: ['id'],
            include: inc,
            where: where_q,
            replacements: { shop_id: shop_table.id },
            subQuery: false
        });
        length_data = length_data.length;

        const pag = {
            currentPage: page,
            pages: Math.ceil(length_data / limit),
            currentCount: data.length,
            totalCount: length_data,
            data: data
        };

        await handleSaveLog(request, [[action], '']);

        return utilSetFastifyResponseJson('success', pag);
    } catch (error) {
        const errorLogId =  await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
}

const handleUserById = async (request) => {
    const action = 'GET ShopUser.ById';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopProfiles = await utilCheckShopTableName(request, 'default');

        const user_id = request.params.id;
        const find_user = await User.findOne({
            attributes: {
                include: [
                    [db.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"User\".\"created_by\" )"), 'created_by'],
                    [db.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"User\".\"updated_by\" )"), 'updated_by'],
                ],
                exclude: ['token_set']
            },
            where: {
                [Op.and]: [db.literal(`\"UsersProfile\".shop_id = :shop_id`)]
            },
            include: [
                {
                    model: Group,
                    through: { attributes: [] },
                    attributes: ['id', 'group_name'],
                    required: false,
                    where: { isuse: [1] },
                    include: [
                        {
                            model: Departments
                        }
                    ]
                },
                {
                    model: UsersProfiles
                },
            ],
            where: {
                id: user_id
            }
        });

        if (!find_user) {
            await handleSaveLog(request, [[action], 'user  not found']);
            return utilSetFastifyResponseJson('failed', 'user not found');
        } else {
            await handleSaveLog(request, [[action], '']);
            return utilSetFastifyResponseJson('success', find_user);
        }

    } catch (error) {
        const errorLogId =  await handleSaveLog(request, [[action], error]);
        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
}

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handleUserPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopUser.Put';

    try {
        const currentDateTime = options?.currentDateTime || new Date();

        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        const requestParam_id = request.params.id;

        const { user_name, password, e_mail, note, user_profile_data, department_id } = request.body;
        let status = request.body.status;
        const data = {};

        /**
         * A request for update UsersProfiles
         * @type {{} | null}
         */

        const before_update = await User.findOne({ where: { id: requestParam_id } });
        if (!before_update) {
            throw new Error(`ไม่พบข้อมูลผู้ใช้`)
        }

        if (!isNull(user_name)) {
            const findUsernameDuplicated = await User.findOne({
                where: {
                    [Op.and]: [
                        { user_name: user_name },
                        { [Op.not]: [{ id: requestParam_id }] }
                    ],
                }
            });
            if (findUsernameDuplicated) {
                throw new Error(`ชื่อผู้ใช้งานถูกใช้งานไปแล้ว`);
            } else {
                data.user_name = user_name;
            }
        }

        if (_.isString(password) && password.length > 0) {
            data.password = generateHashPassword(password);
        }

        if (_.isString(e_mail) && e_mail.length > 0) {
            const email_duplicate = await User.findOne({
                where: {
                    [Op.and]: [
                        { e_mail: e_mail },
                        { [Op.not]: [{ id: requestParam_id }] }
                    ]
                }
            });
            if (email_duplicate) {
                throw new Error(`E-mail ถูกใช้งานไปแล้ว`);
            } else {
                data.e_mail = e_mail;
            }
        }

        if (typeof note !== 'undefined') {
            data.note = note;
        }

        if (!isNull(status)) {
            if (status == 'delete') {
                data.status = 2;
            } else if (status == 'active') {
                data.status = 1;
            } else if (status == 'block') {
                data.status = 0;
            } else {
                throw new Error(`ส่งข้อมูล status ไม่ถูกต้อง`);
            }
        }

        data.updated_by = request.id;
        data.updated_date = currentDateTime;

        let get_groub_depart = await Departments.findAll({ where: { user_group_id: { [Op.ne]: null } } })
        get_groub_depart = get_groub_depart.map(el => { return el.user_group_id })

        const update = async (transaction) => {
            const user_update = await User.update(
                data,
                {
                    where: { id: requestParam_id },
                    transaction: transaction
                }
            );

            if (department_id) {

                await MapUserGroup.destroy({
                    where: {
                        [Op.and]: [
                            { user_id: requestParam_id },
                            { group_id: { [Op.in]: get_groub_depart } }
                        ]
                    },
                    transaction: transaction
                });

                if (department_id.length > 0) {
                    for (let index = 0; index < department_id.length; index++) {
                        const element = department_id[index];

                        let group_id = await Departments.findOne({ where: { id: element } });
                        group_id = group_id.user_group_id
                        await MapUserGroup.create(
                            {
                                user_id: requestParam_id,
                                group_id: group_id
                            },
                            {
                                transaction: transaction
                            }
                        );
                    }
                }
            }

            if (user_profile_data || status) {

                let data_1 = {}

                if (data.status) {
                    data_1.isuse = data.status
                }

                const old_data = await UsersProfiles.findOne({ where: { user_id: requestParam_id }, transaction: transaction })
                const profile_create = await UsersProfiles.update(
                    {
                        ...old_data,
                        ...user_profile_data,
                        ...data_1,
                        created_by: request.id,
                        created_date: currentDateTime
                    },
                    {
                        where: {
                            user_id: requestParam_id,
                        },
                        transaction: transaction
                    }
                );
            }

            return user_update;
        }

        await db.transaction(
            {
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
                transaction: request?.transaction || options?.transaction || null
            },
            async (transaction) => {
                if (!request?.transaction || !options?.transaction) {
                    request.transaction = transaction;
                    options.transaction = transaction;
                }

                const updateUser = await update(transaction);

                const findUserProfile = await UsersProfiles.findOne({
                    where: {
                        user_id: requestParam_id
                    },
                    transaction: transaction
                });
                const createdUser_code_id = await UsersProfiles.setField_code_id(
                    table_name,
                    findUserProfile.get('id'),
                    {
                        transaction: transaction,
                        ShopDocumentCode: utilGetMemoryModels(table_name, ShopDocumentCode(table_name)),
                        findUserProfile: findUserProfile
                    }
                );

                return updateUser;
            }
        );

        const data_update = await User.findOne({ where: { id: requestParam_id } });

        await handleSaveLog(request, [[action, requestParam_id, request.body, before_update], '']);

        return utilSetFastifyResponseJson('success', data_update);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);
        return utilSetFastifyResponseJson('failed', error.toString());
    }
}

module.exports = {
    handleUserAdd,
    handleUserAll,
    handleUserPut,
    handleUserById
}