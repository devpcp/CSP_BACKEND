const _ = require("lodash");
const { Op, Transaction } = require("sequelize");
const { handleSaveLog } = require('./log');
const { isNull, generateSearchOpFromKeys } = require('../utils/generate');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilGetFastifyRequestHeaderAcceptLanguage = require('../utils/util.GetFastifyRequestHeaderAcceptLanguage')
const utilGetIsUse = require('../utils/util.GetIsUse');

const sequelize = require('../db');
const ShopHq = require('../models/model').ShopHq;
const User = require("../models/model").User;
const UsersProfiles = require("../models/model").UsersProfiles;
const MapUserGroup = require("../models/model").MapUserGroup;
const ShopsProfiles = require("../models/model").ShopsProfiles;
const MatchShopHq = require("../models/model").MatchShopHq;

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault | {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const handleAllRaw = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'get shop hq  all raw';

    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        const sort = request.query.sort;
        const order = request.query.order;
        const search = request.query.search;
        const status = utilGetIsUse(_.get(request, 'query.status', 'default'));

        /**
         * @type {import("sequelize").FindAttributeOptions}
         */
        const attr = {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopHq\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopHq\".\"updated_by\" )"), 'updated_by'],
            ]
        };

        /**
         * @type {import("sequelize").WhereOptions}
         */
        const where_q = {
            [Op.and]: [
                {
                    ...status,
                    [Op.or]:
                    {
                        hq_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        },
                        internal_code_id: { [Op.like]: '%' + search + '%' },
                        code_id: { [Op.iLike]: '%' + search + '%' }
                    }
                }
            ],
        };

        const data = await ShopHq.findAll({
            attributes: attr,
            where: where_q,
            order: [[sort, order]]
        });

        await handleSaveLog(request, [[handlerName], ""]);
        return utilSetFastifyResponseJson("success", data);
    } catch (error) {
        await handleSaveLog(request, [[handlerName], error]);
        throw error;
    }
};


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault | {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const handleAll = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'get shop hq  all';

    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const sort = request.query.sort;
        const order = request.query.order;
        const search = request.query.search;
        const status = utilGetIsUse(_.get(request, 'query.status', 'default'));

        /**
         * @type {import("sequelize").FindAttributeOptions}
         */
        const attr = {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopHq\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopHq\".\"updated_by\" )"), 'updated_by'],
            ]
        }

        /**
         * @type {import("sequelize").WhereOptions}
         */
        const where_q = {
            [Op.and]: [
                {
                    ...status,
                    [Op.or]:
                    {
                        hq_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        },
                        internal_code_id: { [Op.like]: '%' + search + '%' },
                        code_id: { [Op.iLike]: '%' + search + '%' }
                    }
                }],

        }

        await UsersProfiles.hasOne(User, { foreignKey: 'id', sourceKey: 'user_id' })

        const fn1 = async () => await ShopHq.findAll({
            include: [
                {
                    model: UsersProfiles, attributes: ['user_id'],
                    include: [{ model: User, attributes: ['user_name'] }]
                },
                {
                    model: ShopsProfiles, attributes: ['id', 'shop_name', 'shop_code_id'], through: { attributes: ['is_hq'] }
                }
            ],
            attributes: attr,
            where: where_q,
            order: [[sort, order]],
            limit: limit,
            offset: (page - 1) * limit
        })

        const fn2 = async () => await ShopHq.count({
            attributes: attr,
            where: where_q
        });

        const [data, length_data] = await Promise.all([fn1(), fn2()]);

        const pag = {
            currentPage: page,
            pages: Math.ceil(length_data / limit),
            currentCount: data.length,
            totalCount: length_data,
            data: data
        };

        await handleSaveLog(request, [[handlerName], ""]);
        return utilSetFastifyResponseJson("success", pag);
    } catch (error) {
        await handleSaveLog(request, [[handlerName], error]);
        throw error;
    }
};


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault | {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const handleById = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'get shop hq  byid';

    try {
        const id = request.params.id;

        await UsersProfiles.hasOne(User, { foreignKey: 'id', sourceKey: 'user_id' })

        const data = await ShopHq.findOne({
            include: [
                {
                    model: UsersProfiles, attributes: ['user_id'],
                    include: [{ model: User, attributes: ['user_name'] }]
                },
                {
                    model: ShopsProfiles, attributes: ['id', 'shop_name', 'shop_code_id'], through: { attributes: ['is_hq'] }
                }
            ],
            attributes: {
                include: [
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopHq\".\"created_by\" )"), 'created_by'],
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopHq\".\"updated_by\" )"), 'updated_by'],
                ]
            },
            where: {
                id: id
            }
        });

        if (!data) {
            await handleSaveLog(request, [[handlerName], 'shop hq not found']);
            return utilSetFastifyResponseJson("failed", "shop hq not found");
        }
        else {
            await handleSaveLog(request, [[handlerName], ""]);
            return utilSetFastifyResponseJson("success", data);
        }
    }
    catch (error) {
        await handleSaveLog(request, [[handlerName], error]);
        throw error;
    }
};


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault | {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const handleAdd = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'add shop hq ';

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        const transactionResult = await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                const { internal_code_id, hq_name, user_id, shop_id } = request.body;
                const check_order = await ShopHq.max('order_by', { transaction: transaction }) || 0;

                if (internal_code_id) {
                    const findShopHqInternalCodeId_exists = await ShopHq.findOne({
                        where: { internal_code_id: internal_code_id },
                        transaction: transaction
                    });

                    if (findShopHqInternalCodeId_exists) {
                        await handleSaveLog(request, [[handlerName], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }


                const findHqName_exists = await ShopHq.findOne({
                    where: {
                        hq_name: {
                            [Op.or]: [
                                { th: hq_name.th },
                                (hq_name.en) ? { en: hq_name.en } : {}
                            ]
                        }
                    },
                    transaction: transaction
                });

                if (findHqName_exists) {
                    await handleSaveLog(request, [[handlerName], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                    throw 'ชื่อนี้ถูกใช้ไปแล้ว';
                }

                // const createRunNumber = await utilGetRunNumberFromModel(
                //     ShopHq,
                //     'run_no',
                //     {
                //         prefix_config: await utilGetDocumentTypePrefix(
                //             _.get(request.body, 'doc_type_id', ''),
                //             {
                //                 defaultPrefix: config_run_number_shop_hq_prefix
                //             }
                //         ).then(r => r.prefix),
                //         transaction: transaction
                //     }
                // );

                const createdDocument = await ShopHq.create(
                    {
                        ...request.body,
                        // code_id: createRunNumber.runString,
                        // run_no: createRunNumber.runNumber,
                        isuse: 1,
                        order_by: check_order + 1,
                        created_by: request.id,
                        created_date: currentDateTime
                    },
                    {
                        validate: true,
                        transaction: transaction
                    }
                );

                if (user_id.length > 0) {

                    for (let index = 0; index < user_id.length; index++) {
                        const element = user_id[index];

                        let check_user = await User.findOne({
                            where: { id: element }
                        })

                        let check_userprofile = await UsersProfiles.findOne({
                            where: { user_id: element }
                        })
                        if (check_userprofile) {
                            await UsersProfiles.update(
                                {
                                    hq_id: createdDocument.id,
                                    // shop_id: null
                                },
                                {
                                    where: { user_id: element },
                                    transaction: transaction
                                }
                            )
                        } else {
                            await UsersProfiles.create(
                                {
                                    hq_id: createdDocument.id,
                                    // shop_id: null,
                                    fname: { th: check_user.user_name, en: check_user.user_name },
                                    lname: { th: '', en: '' },
                                    isuse: 1,
                                    created_by: request.id,
                                    created_date: new Date()
                                },
                                {
                                    transaction: transaction
                                }
                            )
                        }

                        await MapUserGroup.bulkCreate(
                            [
                                { user_id: element, group_id: 'bcd65e1f-38a4-4cd0-9aca-b4b2f68f9c9e' }
                            ],
                            {
                                transaction: transaction
                            })

                    }

                }

                if (shop_id.length > 0) {


                    for (let index = 0; index < shop_id.length; index++) {
                        const element = shop_id[index];

                        let is_hq = false;
                        if (index === 0) {
                            is_hq = true;
                        }

                        await MatchShopHq.create(
                            {
                                hq_id: createdDocument.id,
                                shop_id: element,
                                is_hq: is_hq,
                                created_by: request.id,
                                created_date: new Date()
                            },
                            {
                                transaction: transaction
                            }
                        )


                    }

                }


                return createdDocument;
            }
        );

        await handleSaveLog(request, [[handlerName, transactionResult.id, request.body], ""]);

        return utilSetFastifyResponseJson("success", transactionResult);

    } catch (error) {
        if (_.isError(error)) {
            await handleSaveLog(request, [[handlerName], error]);
            throw error;
        }
        else {
            await handleSaveLog(request, [[handlerName], `error : ${error.toString()}`]);
            return utilSetFastifyResponseJson("failed", error.toString());
        }
    }
};


/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault | {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const handlePut = async (request = {}, reply = {}, options = {}) => {
    const handlerName = 'put shop hq ';

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        const transactionResult = await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                // Convert Status
                switch (request.body.status) {
                    case 'block': {
                        request.body.isuse = 0;
                        break;
                    }
                    case 'active': {
                        request.body.isuse = 1;
                        break;
                    }
                    case 'delete': {
                        request.body.isuse = 2;
                        break;
                    }
                    default: {
                        delete request.body.status;
                        delete request.body.isuse;
                    }
                }

                const { internal_code_id, hq_name, user_id, shop_id } = request.body;

                const beforeUpdateDocument = await ShopHq.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                });

                if (!beforeUpdateDocument) {
                    await handleSaveLog(request, [[handlerName], "id not found"]);
                    throw 'id not found';
                }

                if (!isNull(internal_code_id)) {
                    const findShopHqInternalCodeId_exists = await ShopHq.findOne({
                        where: {
                            internal_code_id: internal_code_id,
                            id: { [Op.ne]: request.params.id }
                        },
                        transaction: transaction
                    });

                    if (findShopHqInternalCodeId_exists) {
                        await handleSaveLog(request, [[handlerName], 'รหัสนี้ถูกใช้ไปแล้ว'])
                        throw 'รหัสนี้ถูกใช้ไปแล้ว';
                    }
                }

                if (!isNull(hq_name)) {
                    const findHqName_exists = await ShopHq.findOne({
                        where: {
                            hq_name: {
                                [Op.or]: [
                                    { th: hq_name.th },
                                    (hq_name.en) ? { en: hq_name.en } : {}
                                ]
                            },
                            id: { [Op.ne]: request.params.id }
                        },
                        transaction: transaction
                    });

                    if (findHqName_exists) {
                        await handleSaveLog(request, [[handlerName], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                        throw 'ชื่อนี้ถูกใช้ไปแล้ว';
                    }
                }

                const updatedDocument = await ShopHq.findOne(
                    {
                        where: {
                            id: request.params.id
                        },
                        transaction: transaction
                    }
                );
                updatedDocument.set({
                    ...request.body,
                    details: {
                        ...(updatedDocument.get('details') || {}),
                        ...(_.get(request, 'body.details', {}))
                    },
                    updated_by: request.id,
                    updated_date: currentDateTime
                });
                await updatedDocument.save({ transaction: transaction, validate: true });

                if (user_id) {


                    let user_before = await UsersProfiles.findAll(
                        {
                            where: { hq_id: request.params.id }
                        }
                    )

                    await MapUserGroup.destroy(
                        {
                            where: { user_id: { [Op.in]: user_before.map(el => { return el.user_id }) }, group_id: 'bcd65e1f-38a4-4cd0-9aca-b4b2f68f9c9e' }
                        },
                        {
                            transaction: transaction
                        })


                    await UsersProfiles.update({
                        hq_id: null
                    }, {
                        where: { hq_id: request.params.id }
                    }, {
                        transaction: transaction
                    }
                    )

                    for (let index = 0; index < user_id.length; index++) {
                        const element = user_id[index];

                        let check_user = await User.findOne({
                            where: { id: element }
                        })

                        let check_userprofile = await UsersProfiles.findOne({
                            where: { user_id: element }
                        })
                        if (check_userprofile) {
                            await UsersProfiles.update(
                                {
                                    hq_id: request.params.id,
                                    // shop_id: null
                                },
                                {
                                    where: { user_id: element }
                                },
                                {
                                    transaction: transaction
                                }
                            )
                        } else {
                            await UsersProfiles.create(
                                {
                                    hq_id: request.params.id,
                                    // shop_id: null,
                                    fname: { th: check_user.user_name, en: check_user.user_name },
                                    lname: { th: '', en: '' },
                                    isuse: 1,
                                    created_by: request.id,
                                    created_date: new Date()
                                },
                                {
                                    transaction: transaction
                                }
                            )
                        }

                        await MapUserGroup.bulkCreate(
                            [
                                { user_id: element, group_id: 'bcd65e1f-38a4-4cd0-9aca-b4b2f68f9c9e' }
                            ],
                            {
                                transaction: transaction
                            })

                    }

                }
                if (shop_id) {

                    await MatchShopHq.destroy({
                        where: { hq_id: request.params.id }
                    })

                    for (let index = 0; index < shop_id.length; index++) {
                        const element = shop_id[index];

                        let is_hq = false;
                        if (index === 0) {
                            is_hq = true;
                        }

                        await MatchShopHq.create(
                            {
                                hq_id: request.params.id,
                                shop_id: element,
                                is_hq: is_hq,
                                created_by: request.id,
                                created_date: new Date()
                            },
                            {
                                transaction: transaction
                            }
                        )


                    }

                }


                const afterUpdateDocument = await ShopHq.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction
                });

                return {
                    beforeUpdateDocument: beforeUpdateDocument,
                    afterUpdateDocument: afterUpdateDocument
                };
            }
        );

        await handleSaveLog(request, [[handlerName, request.params.id, request.body, transactionResult.beforeUpdateDocument], ''])

        return utilSetFastifyResponseJson('success', transactionResult.afterUpdateDocument);

    } catch (error) {
        if (_.isError(error)) {
            await handleSaveLog(request, [[handlerName], error]);
            throw error;
        }
        else {
            await handleSaveLog(request, [[handlerName], `error : ${error.toString()}`]);
            return utilSetFastifyResponseJson("failed", error.toString());
        }
    }
};


module.exports = {
    handleAllRaw,
    handleAll,
    handleById,
    handleAdd,
    handlePut
}