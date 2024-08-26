const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const {
    initShopModel
} = require("../models/model");
const { Op, literal } = require("sequelize");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

const fnGetQueryWhereStatusFromRequest = (status = status || 'default') => {
    switch (status.toLowerCase()) {
        case 'active': {
            return [1];
        }
        case 'block': {
            return [2];
        }
        case 'delete': {
            return [0];
        }
        case 'all': {
            return [0, 1, 2];
        }
        default: {
            return [1, 2];
        }
    }
};

/**
 * - Route [GET] => /api/shopCustomerDebtDoc/byId/:id
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtDocAll = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopCustomerDebtDoc.All';

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

        let search = request.query.search || '';
        if (search.length > 0) {
            search = search.replace(/(\s)+/ig, ' ');
            search = search.replace(/(\s)+/ig, '%');
        }

        const status = request.query.status || 'default';
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'DESC';

        const doc_date_startDate = request.query?.doc_date_startDate || '';
        const doc_date_endDate = request.query?.doc_date_endDate || '';

        const debt_due_date_startDate = request.query?.debt_due_date_startDate || '';
        const debt_due_date_endDate = request.query?.debt_due_date_endDate || '';

        const filter__debt_price_amount_left = request.query?.filter__debt_price_amount_left || false;

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopCustomerDebtDoc,
            ShopCustomerDebtList,
            ShopServiceOrderDoc,
            ShopPaymentTransaction,
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopCustomerDebtDebitNoteDoc,
            ShopCustomerDebtCreditNoteDoc,
            ShopCustomerDebtCreditNoteDocT2
        } = ShopModels;

        /**
         * @type {import("sequelize").Includeable[]}
         */
        const includeQuery = [
            {
                model: ShopCustomerDebtList,
                required: true,
                separate: true,
                attributes: {
                    exclude: ['details']
                },
                where: {
                    status: 1
                },
                include: [
                    {
                        model: ShopServiceOrderDoc,
                        as: 'ShopServiceOrderDoc',
                        required: false,
                        attributes: {
                            exclude: ['details']
                        },
                        where: {
                            ...(
                                !filter__debt_price_amount_left
                                    ? {}
                                    : { debt_price_amount_left: { [Op.gt]: 0 } }
                            )
                        }
                    },
                    {
                        model: ShopCustomerDebtDebitNoteDoc,
                        as: 'ShopCustomerDebtDebitNoteDoc',
                        required: false,
                        attributes: {
                            exclude: ['details']
                        }
                    },
                    {
                        model: ShopCustomerDebtCreditNoteDoc,
                        as: 'ShopCustomerDebtCreditNoteDoc',
                        required: false,
                        attributes: {
                            exclude: ['details']
                        }
                    },
                    {
                        model: ShopCustomerDebtCreditNoteDocT2,
                        as: 'ShopCustomerDebtCreditNoteDocT2',
                        required: false,
                        attributes: {
                            exclude: ['details']
                        }
                    }
                ]
            },
            {
                model: ShopBusinessCustomer,
                as: 'ShopBusinessCustomer',
                required: false
            },
            {
                model: ShopPersonalCustomer,
                as: 'ShopPersonalCustomer',
                required: false
            },
            {
                model: ShopPaymentTransaction,
                required: true,
                separate: true,
                attributes: {
                    exclude: ['details']
                },
                where: {
                    canceled_payment_by: null,
                    canceled_payment_date: null
                }
            }
        ];

        /**
         * @type {import("sequelize").WhereOptions}
         */
        const whereQuery = !search
            ? {
                status: {
                    [Op.in]: fnGetQueryWhereStatusFromRequest(status)
                },

            }
            : {
                status: {
                    [Op.in]: fnGetQueryWhereStatusFromRequest(status)
                },
                [Op.or]: [
                    {
                        code_id: {
                            [Op.iLike]: `%${search}%`
                        },
                    },
                    literal(`
                        ((
                            SELECT DISTINCT X.shop_customer_debt_doc_id
                            FROM ${ShopCustomerDebtList.options.schema}.${ShopCustomerDebtList.options.tableName} AS X
                            WHERE (
                                (
                                    SELECT id
                                    FROM ${ShopServiceOrderDoc.options.schema}.${ShopServiceOrderDoc.options.tableName} AS Y
                                    WHERE Y.id = X.shop_service_order_doc_id
                                        AND Y.code_id iLIKE '%${search}%'
                                ) = X.shop_service_order_doc_id
                            )
                            AND X.status = 1
                            AND X.shop_customer_debt_doc_id = "ShopCustomerDebtDoc".id
                        ) = "ShopCustomerDebtDoc".id)
                    `.replace(/(\s)+/g, ' ')),
                    {
                        '$"ShopPersonalCustomer".master_customer_code_id$': {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    literal(`"ShopPersonalCustomer".customer_name->'first_name'->>'th' iLIKE '%${search}%'`),
                    literal(`"ShopPersonalCustomer".customer_name->'last_name'->>'th' iLIKE '%${search}%'`),
                    literal(`"ShopPersonalCustomer".other_details->>'contact_name' iLIKE '%${search}%'`),
                    literal(`"ShopPersonalCustomer".other_details->>'code_from_old_system' iLIKE '%${search}%'`),
                    {
                        '$"ShopBusinessCustomer".master_customer_code_id$': {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    literal(`"ShopBusinessCustomer".customer_name->>'th' iLIKE '%${search}%'`),
                    literal(`"ShopBusinessCustomer".other_details->>'contact_name' iLIKE '%${search}%'`),
                    literal(`"ShopBusinessCustomer".other_details->>'code_from_old_system' iLIKE '%${search}%'`),
                ]
            };

        const fnSet_whereDateString_intoWhereQuery = (fieldName, startDate, endDate) => {
            if (startDate && endDate) {
                whereQuery[fieldName] = {
                    [Op.between]: [startDate, endDate]
                };
            }
            else {
                if (startDate && !endDate) {
                    whereQuery[fieldName] = {
                        [Op.gte]: startDate
                    };
                }
                if (!startDate && endDate) {
                    whereQuery[fieldName] = {
                        [Op.lte]: endDate
                    };
                }
            }
        };
        fnSet_whereDateString_intoWhereQuery('doc_date', doc_date_startDate, doc_date_endDate);
        fnSet_whereDateString_intoWhereQuery('debt_due_date', debt_due_date_startDate, debt_due_date_endDate);

        const fnFindDocuments = async () => await ShopCustomerDebtDoc.findAll({
            attributes: {
                include: [
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopCustomerDebtDoc"."created_by" )`), 'created_by'],
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopCustomerDebtDoc"."updated_by" )`), 'updated_by'],
                ]
            },
            include: includeQuery,
            where: whereQuery,
            transaction: request?.transaction || options?.transaction || null,
            ShopModels: ShopModels,
            limit: limit,
            offset: (page - 1) * limit,
            subQuery: false, // ต้องทำ "subQuery: false" เพราะติด Error จากการใช้งานของ limit และ offset,
            order: [[sort, order]],
        });

        const fnFindDocuments_Count = async () => await ShopCustomerDebtDoc.count({
            include: includeQuery,
            where: whereQuery,
            transaction: request?.transaction || options?.transaction || null,
            ShopModels: ShopModels
        });

        const [
            findDocuments,
            findDocuments_Count,
        ] = await Promise.all([
            fnFindDocuments(),
            fnFindDocuments_Count(),
        ]);

        const findResults = {
            currentPage: page,
            pages: Math.ceil(findDocuments_Count / limit),
            currentCount: findDocuments.length,
            totalCount: findDocuments_Count,
            data: findDocuments
        };

        await handleSaveLog(request, [[action, request.params.id], '']);

        return utilSetFastifyResponseJson('success', findResults);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopCustomerDebtDocAll;