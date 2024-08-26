const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { literal } = require("sequelize");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopPaymentTransactionById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopPaymentTransaction.ById';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const {
            initShopModel,
            User,
            UsersProfiles
        } = utilGetModelsAndShopModels(table_name).Models || require("../models/model");
        const {
            ShopPaymentTransaction
        } = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);

        /**
         * @type {import("sequelize/types").Includeable[]}
         */
        const queryInclude = (() => {
            /**
             * @type {import("sequelize/types").Includeable[]}
             */
            const includeData =  [
                {
                    model: User,
                    as: 'CanceledPaymentBy',
                    required: false,
                    attributes: [
                        'id',
                        'user_name'
                    ],
                    include: [
                        {
                            model: UsersProfiles,
                            attributes: [
                                'id',
                                'user_id',
                                'name_title',
                                'fname',
                                'lname',
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'PaymentPayeeBy',
                    required: false,
                    attributes: [
                        'id',
                        'user_name'
                    ],
                    include: [
                        {
                            model: UsersProfiles,
                            attributes: [
                                'id',
                                'user_id',
                                'name_title',
                                'fname',
                                'lname',
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'CreatedBy',
                    required: false,
                    attributes: [
                        'id',
                        'user_name'
                    ],
                    include: [
                        {
                            model: UsersProfiles,
                            attributes: [
                                'id',
                                'user_id',
                                'name_title',
                                'fname',
                                'lname',
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'UpdatedBy',
                    required: false,
                    attributes: [
                        'id',
                        'user_name'
                    ],
                    include: [
                        {
                            model: UsersProfiles,
                            attributes: [
                                'id',
                                'user_id',
                                'name_title',
                                'fname',
                                'lname',
                            ]
                        }
                    ]
                },
            ];

            return includeData;
        })();

        const transaction = request?.transaction || options?.transaction || null;

        const findDocument = await ShopPaymentTransaction.findOne({
            attributes: {
                include: [
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopPaymentTransaction"."created_by" )`), 'created_by'],
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopPaymentTransaction"."updated_by" )`), 'updated_by'],
                ]
            },
            include: queryInclude,
            where: {
                id: request.params.id
            },
            transaction: transaction
        });

        await handleSaveLog(request, [[action, request.params.id], '']);

        return utilSetFastifyResponseJson('success', findDocument);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopPaymentTransactionById;