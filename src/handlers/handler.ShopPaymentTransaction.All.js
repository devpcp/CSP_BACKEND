/**
 * @type {import("lodash")}
 */
const _ = require("lodash");
const { literal, Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { paginate, isUUID } = require("../utils/generate");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopPaymentTransactionAll = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopPaymentTransaction.All';

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

        const search = request.query.search || '';
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'DESC';

        const shop_service_order_doc_id = request.query.shop_service_order_doc_id || '';
        const shop_temporary_delivery_order_doc_id = request.query.shop_temporary_delivery_order_doc_id || '';
        const shop_tax_invoice_doc_id = request.query.shop_tax_invoice_doc_id || '';

        const doc_date_startDate = request.query.doc_date_startDate || '';
        const doc_date_endDate = request.query.doc_date_endDate || '';

        const payment_paid_date_startDate = request.query.payment_paid_date_startDate || '';
        const payment_paid_date_endDate = request.query.payment_paid_date_endDate || '';

        const canceled_payment_date_startDate = request.query.canceled_payment_date_startDate || '';
        const canceled_payment_date_endDate = request.query.canceled_payment_date_endDate || '';

        const filterInPaymentMethod = _.uniq(
            (request.query.filterInPaymentMethod || '') === ''
            ? []
            : (request.query.filterInPaymentMethod)
                .split(',')
                .map(w => Number(w))
        );

        const filterInPaymentStatus = _.uniq(
            (request.query.filterInPaymentStatus || '') === ''
                ? []
                : (request.query.filterInPaymentStatus)
                    .split(',')
                    .map(w => Number(w))
        );

        const filterShowOnlyNonCanceledPayment = request.query.filterShowOnlyNonCanceledPayment || false;

        const {
            initShopModel,
            User,
            UsersProfiles
        } = utilGetModelsAndShopModels(table_name).Models || require("../models/model");
        const {
            ShopPaymentTransaction
        } = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);

        /**
         * @type {import("sequelize/types").WhereOptions}
         */
        const queryWhere = ((search = '') => {
            /**
             * @type {import("sequelize/types").WhereOptions}
             */
            const whereData = search.length <= 0
                ? {}
                : {
                    [Op.or]: [
                        {
                            code_id: {
                                [Op.iLike]: `%${search}%`
                            }
                        },
                        {
                            details: {
                                [Op.or]: [
                                    {
                                        ref_doc: {
                                            [Op.iLike]: `%${search}%`
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                };

            if (isUUID(shop_service_order_doc_id)) {
                whereData['shop_service_order_doc_id'] = shop_service_order_doc_id
            }
            if (isUUID(shop_temporary_delivery_order_doc_id)) {
                whereData['shop_temporary_delivery_order_doc_id'] = shop_temporary_delivery_order_doc_id;
            }
            if (isUUID(shop_tax_invoice_doc_id)) {
                whereData['shop_tax_invoice_doc_id'] = shop_tax_invoice_doc_id;
            }

            const addFilterDateRange = (whereFieldName = '', startDate = '', endDate = '') => {
                if (whereFieldName) { // Filter by doc_date date range
                    if (startDate && endDate) {
                        whereData[whereFieldName] = {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                    else {
                        if (startDate && !endDate) {
                            whereData[whereFieldName] = {
                                [Op.gte]: startDate
                            }
                        }
                        if (!startDate && endDate) {
                            whereData[whereFieldName] = {
                                [Op.lte]: endDate
                            }
                        }
                    }
                }
            };
            addFilterDateRange('doc_date', doc_date_startDate, doc_date_endDate);
            addFilterDateRange('payment_paid_date', payment_paid_date_startDate, payment_paid_date_endDate);
            addFilterDateRange('canceled_payment_date', canceled_payment_date_startDate, canceled_payment_date_endDate);

            if (filterInPaymentMethod.length > 0) {
                whereData['payment_method'] = {
                    [Op.in]: filterInPaymentMethod
                }
            }

            if (filterInPaymentStatus.length > 0) {
                whereData['payment_status'] = {
                    [Op.in]: filterInPaymentStatus
                }
            }

            if (filterShowOnlyNonCanceledPayment) {
                whereData['canceled_payment_date'] = null;
            }

            return whereData;
        })(search);

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

        const findDocuments = await ShopPaymentTransaction.findAll({
            attributes: {
                include: [
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopPaymentTransaction"."created_by" )`), 'created_by'],
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopPaymentTransaction"."updated_by" )`), 'updated_by'],
                ]
            },
            include: queryInclude,
            where: queryWhere,
            order: [[sort, order]],
            transaction: transaction
        });

        await handleSaveLog(request, [[action, request.query], '']);

        return utilSetFastifyResponseJson('success', paginate(findDocuments, limit, page));
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopPaymentTransactionAll;