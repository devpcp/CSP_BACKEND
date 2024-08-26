const _ = require("lodash");
const { configShopProfile_ShopConfig_DefaultConfig } = require("../config");
const { Transaction } = require("sequelize");
const { Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const { paginate, generateSearchOpFromKeys, isUUID } = require("../utils/generate");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");
const ShopsProfilesModel = require("../models/model").ShopsProfiles;
const UsersModel = require("../models/model").User;
const UsersProfiles = require("../models/model").UsersProfiles;
const MatchShopHq = require("../models/model").MatchShopHq;
const ShopHq = require("../models/model").ShopHq;

/**
 * A handler to add new shopsProfiles into database
 * - Route [POST] => /api/shopsProfiles/add
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 * @return {Promise<{status: "success", data: ShopsProfiles}|{status: "failed", data: string}>}
 */
const shopsProfilesAdd = async (request, reply) => {
    try {
        /**
         * A timestamp where client as run this handler function
         * @type {number}
         */
        const currentTime = Date.now();
        /**
         * A client's user "id" as uuid from request
         * @type {string}
         */
        const userRequestId = request.id;

        /**
         * Set user "id" from request
         * @param {string?} requestedUserId
         * @return {Promise<null|string>}
         */
        const setUserId = async (requestedUserId = request.id) => {
            if (!requestedUserId) {
                throw Error("Unauthorized this method");
            } else {
                const findUser = await UsersModel.findOne(
                    {
                        where: {
                            id: requestedUserId
                        }
                    }
                );

                if (!findUser) {
                    throw Error("Unfulfilled as requested, due have error during process or missing require data");
                } else {
                    return findUser.id;
                }
            }
        };

        const [getUserId] = await Promise.all([
            setUserId(userRequestId)
        ]);

        /**
         * A function create ShopsProfiles Document in database "app_datas"."dat_shops_profiles"
         * @param {import("sequelize").Transaction} seqTransaction
         * @return {Promise<ShopsProfiles>}
         */
        const saveShopProfileDocument = async (seqTransaction) => {
            const saveDocument = await ShopsProfilesModel.create(
                {
                    ...request.body,
                    created_by: getUserId,
                    created_date: currentTime
                },
                {
                    transaction: seqTransaction
                }
            );

            await seqTransaction.commit();

            return saveDocument;
        };

        const t = await db.transaction();
        const doSaveDocument = await saveShopProfileDocument(t)
            .catch(async (error) => {
                await t.rollback();
                throw error;
            });

        await handleSaveLog(request, [['add shopsProfiles', doSaveDocument.id, request.body], '']);
        return { status: 'success', data: doSaveDocument };
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['add shopsProfiles'], 'error : ' + error]);
        return { status: 'failed', data: 'add shopsProfiles has error' };
    }
};

/**
 * A handler to get shopsProfiles by all from database
 * - Route [GET] => /api/shopsProfiles/all
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 * @return {Promise<{status: "success", data: {pages: number, data: ShopsProfiles[], currentCount: number, currentPage: number, totalCount: number}}|{status: "failed", data: string}>}
 */
const shopsProfilesAll = async (request, reply) => {
    try {
        /**
         * A function to generate "isuse" from request
         * @param status
         * @return {number[]}
         */
        const setIsUse = (status = request.query.status) => {
            let isuse;
            if (status === 'delete') {
                isuse = [2]
            } else if (status === 'active') {
                isuse = [1]
            } else if (status === 'block') {
                isuse = [0]
            } else {
                isuse = [1, 0]
            }
            return isuse;
        };

        // Init data as requested
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const search = request.query.search;
        const sort = request.query.sort;
        const order = request.query.order;
        const status = request.query.status;
        const getIsUse = setIsUse(status);
        const byHq = request.query.byHq || false

        let by_hq = {}
        if (byHq == true) {

            ShopHq.hasMany(MatchShopHq, { foreignKey: 'hq_id' })

            let check = await UsersProfiles.findOne({
                where: { user_id: request.id },
                include: [{
                    model: ShopHq, include: [
                        { model: MatchShopHq }
                    ]
                }]
            })

            if (check.ShopHq?.MatchShopHqs?.length > 0) {

                by_hq = { id: { [Op.in]: check.ShopHq.MatchShopHqs.map(el => { return el.shop_id }) } }

            } else {
                by_hq = { id: null }
            }


        }

        const findShopsProfiles = await ShopsProfilesModel.findAll({
            attributes: {
                include: [
                    [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopsProfiles\".\"created_by\" )"), 'created_by'],
                    [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopsProfiles\".\"updated_by\" )"), 'updated_by']
                ]
            },
            order: [[sort, order]],
            where: {
                [Op.and]: [{ isuse: getIsUse }, by_hq],
                [Op.or]: [
                    {
                        tax_code_id: { [Op.iLike]: `%${search}%` },
                    },
                    {
                        shop_code_id: { [Op.iLike]: `%${search}%` },
                    },
                    {
                        shop_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        }
                    },
                    {
                        e_mail: { [Op.iLike]: `%${search}%` },
                    },
                    {
                        address: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        }
                    },
                    {
                        tel_no: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(["tel_no_1", "tel_no_2"], Op.iLike, `%${search}%`)
                            ]
                        }
                    },
                    {
                        mobile_no: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(["mobile_no_1"], Op.iLike, `%${search}%`)
                            ]
                        }
                    }
                ]
            }
        });

        await handleSaveLog(request, [["get shopsProfiles all"], ""]);
        return { status: "success", data: paginate(findShopsProfiles, limit, page) };
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [["get shopsProfiles all"], `error : ${error}`]);
        return { status: "failed", data: error };
    }
};

/**
 * A handler to get shopsProfiles whereby id from database
 * - Route [GET] => /api/shopsProfiles/byid/:id
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 * @return {Promise<{status: "success", data: ShopsProfiles}|{status: "failed", data: string}>}
 */
const shopsProfilesById = async (request, reply) => {
    try {
        /**
         * A request for reference to do find ShopsProfilesModel by id
         * @type {string}
         */
        const shopProfileId = request.params.id;

        if (!isUUID(shopProfileId)) {
            throw Error("@id has error as requested");
        } else {
            const findShopProfile = await ShopsProfilesModel.findOne({
                attributes: {
                    include: [
                        [db.Sequelize.literal(`(SELECT zip_code FROM master_lookup.mas_subdistrict WHERE id = "ShopsProfiles"."subdistrict_id")`), 'zip_code'],
                        [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopsProfiles\".\"created_by\" )"), 'created_by'],
                        [db.Sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopsProfiles\".\"updated_by\" )"), 'updated_by']
                    ]
                },
                where: {
                    id: shopProfileId
                }
            });

            await handleSaveLog(request, [["get shopsProfiles byid"], ""]);
            return { status: "success", data: findShopProfile };
        }
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [["get shopsProfiles byid"], `error : ${error}`]);
        return { status: "failed", data: "get shopsProfiles byid has error" };
    }
};

/**
 * A handler to update shopsProfiles whereby id into database
 * - Route [PUT] => /api/shopsProfiles/put/:id
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const shopsProfilesPut = async (request, reply, options) => {
    const action = 'PUT ShopProfile.Put';

    try {
        /**
         * A timestamp where client as run this handler function
         * @type {Date}
         */
        const currentDateTime = _.get(request, 'currentDateTime', new Date());
        /**
         * A client's user "id" as uuid from request
         * @type {string}
         */
        const userRequestId = request.id;
        /**
         * An ShopProfile "id" as uuid from request
         * @type {string}
         */
        const shopProfileId = request.params.id;

        /**
         * Set user "id" from request
         * @param {string} requestedUserId
         * @return {Promise<null|string>}
         */
        const setUserId = async (requestedUserId = request.id) => {
            if (!requestedUserId) {
                return null;
            } else {
                const findUser = await UsersModel.findOne(
                    {
                        where: {
                            id: requestedUserId
                        }
                    }
                );

                if (!findUser) {
                    throw Error("@user has error as requested");
                } else {
                    return findUser.id;
                }
            }
        };

        /**
         * Set "isuse" from request
         * @param {"block"|"active"|"delete"|0|1|2} reqIsUse
         * @return {Promise<number|null>}
         */
        const setIsUse = async (reqIsUse = request.body.isuse) => {
            if (_.isUndefined(reqIsUse)) {
                return null;
            }
            else if (_.isString(reqIsUse)) {
                const enumIsUseString = ['block', 'active', 'delete'];
                const findData = enumIsUseString.findIndex(where => where === reqIsUse.toLowerCase());
                if (findData === -1 || findData >= enumIsUseString.length) {
                    throw Error("@isuse has error as requested");
                } else {
                    return findData;
                }
            } else if (_.isSafeInteger(reqIsUse)) {
                const enumIsUseNumber = [0, 1, 2];
                const findData = enumIsUseNumber.findIndex(where => where === reqIsUse);
                if (findData === -1 || findData >= enumIsUseNumber.length) {
                    throw Error("@isuse has error as requested");
                } else {
                    return findData;
                }
            } else {
                throw Error("@isuse has error as requested");
            }
        };

        const [getUserId, getIsuse] = await Promise.all([
            setUserId(userRequestId),
            setIsUse(request.body.isuse)
        ]);

        /**
         * A function update ShopsProfiles Document in database "app_datas"."dat_shops_profiles"
         * @param {string} id - a UUID
         * @param {import("sequelize").Transaction} seqTransaction
         */
        const updateShopProfileDocument = async (id = request.params.id, seqTransaction) => {
            const findShopProfile = await ShopsProfilesModel.findOne(
                {
                    where: {
                        id: id,
                    },
                    transaction: seqTransaction
                }
            );

            if (!findShopProfile) {
                throw Error("@id has error as requested")
            } else {
                const dataToUpdate = {
                    ...request.body,
                    updated_by: getUserId,
                    updated_date: currentDateTime,
                };
                const fnAppendJsonRequestToDataToUpdate = (keyValue = '') => {
                    if (keyValue) {
                        if (_.get(request, `body.${keyValue}`, null)) {
                            dataToUpdate[keyValue] = {
                                ...(findShopProfile.get(keyValue) || {}),
                                ...(request.body[keyValue] || {})
                            };
                        }
                    }
                };
                fnAppendJsonRequestToDataToUpdate('shop_name');
                fnAppendJsonRequestToDataToUpdate('tel_no');
                fnAppendJsonRequestToDataToUpdate('mobile_no');
                fnAppendJsonRequestToDataToUpdate('address');
                fnAppendJsonRequestToDataToUpdate('domain_name');
                fnAppendJsonRequestToDataToUpdate('sync_api_config');
                fnAppendJsonRequestToDataToUpdate('shop_config');

                // Serialize Default ShopConfig if detected
                if (dataToUpdate.shop_config) {
                    for (const configKey in configShopProfile_ShopConfig_DefaultConfig) {
                        if (!_.isBoolean(dataToUpdate.shop_config[configKey])) {
                            dataToUpdate.shop_config[configKey] = configShopProfile_ShopConfig_DefaultConfig[configKey];
                        }
                    }
                }

                findShopProfile.set(dataToUpdate);

                await findShopProfile.save({ transaction: seqTransaction });

                return findShopProfile;
            }
        };

        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                const beforeUpdateDocument = await ShopsProfilesModel.findOne(
                    {
                        where: {
                            id: shopProfileId,
                        },
                        transaction: transaction
                    }
                );

                const afterUpdateDocument = await updateShopProfileDocument(shopProfileId, transaction);

                return {
                    beforeUpdateDocument: beforeUpdateDocument.toJSON(),
                    afterUpdateDocument: afterUpdateDocument.toJSON()
                };
            }
        );

        await handleSaveLog(request, [[action, shopProfileId, request.body, transactionResult.beforeUpdateDocument], '']);

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action, request.params.id, request.body], error]);

        throw Error(error);
    }
};

module.exports = {
    shopsProfilesAdd,
    shopsProfilesAll,
    shopsProfilesById,
    shopsProfilesPut
}