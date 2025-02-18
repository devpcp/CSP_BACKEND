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
 * - Route [GET] => /api/shopCustomerDebtCreditNoteDoc/all
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtCreditNoteDocAll = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopCustomerDebtCreditNoteDoc.All';

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
            search = search.replace(/(\s|%)+/ig, '%');
        }

        const status = request.query.status || 'default';
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'DESC';

        const doc_date_startDate = request.query?.doc_date_startDate || '';
        const doc_date_endDate = request.query?.doc_date_endDate || '';

        const filter__unUsed__shop_customer_debt_cn_doc_id = request.query?.filter__unUsed__shop_customer_debt_cn_doc_id || false;

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopTemporaryDeliveryOrderDoc,
            ShopCustomerDebtCreditNoteDoc,
            ShopCustomerDebtCreditNoteList,
            ShopCustomerDebtList,
            ShopCustomerDebtDoc
        } = ShopModels;

        /**
         * @type {import("sequelize").Includeable[]}
         */
        const includeQuery = [
                {
                    model: ShopCustomerDebtCreditNoteList,
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
                            model: ShopTemporaryDeliveryOrderDoc,
                            as: 'ShopTemporaryDeliveryOrderDoc',
                            required: false,
                            attributes: {
                                exclude: ['details']
                            }
                        },
                        {
                            model: ShopCustomerDebtList,
                            required: false,
                            separate: true,
                            attributes: {
                                exclude: ['details']
                            },
                            where: {
                                status: 1
                            },
                            include: [
                                {
                                    model: ShopCustomerDebtDoc,
                                    as: 'ShopCustomerDebtDoc',
                                    required: true,
                                    attributes: {
                                        exclude: ['details']
                                    },
                                    where: {
                                        status: 1
                                    }
                                }
                            ]
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
                    {
                        '$"ShopPersonalCustomer".master_customer_code_id$': {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    literal(`"ShopPersonalCustomer".customer_name->'first_name'->>'th' iLIKE '%${search}%'`),
                    literal(`"ShopPersonalCustomer".customer_name->'last_name'->>'th' iLIKE '%${search}%'`),
                    literal(`"ShopPersonalCustomer".other_details->>'contact_name' iLIKE '%${search}%'`),
                    literal(`"ShopPersonalCustomer".other_details->>'code_from_old_system' iLIKE '%${search}%'`),
                    literal(`coalesce(nullif((coalesce("ShopPersonalCustomer".customer_name->'first_name'->>'th', '') || ' ' || coalesce("ShopPersonalCustomer".customer_name->'last_name'->>'th', '')), '')) iLIKE '%${search}%'`),
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

        if (filter__unUsed__shop_customer_debt_cn_doc_id === true) {
            const queryData = literal(
                `
                    ("ShopCustomerDebtCreditNoteDoc".id NOT IN 
                        (
                            SELECT "CCN_Doc".id
                            FROM app_shops_datas.dat_01hq0004_customer_debt_cn_doc AS "CCN_Doc"
                            WHERE "CCN_Doc".status = 1
                            AND ("CCN_Doc".id IN (
                                SELECT "CCN_List".shop_customer_debt_cn_doc_id
                                FROM app_shops_datas.dat_01hq0004_customer_debt_cn_list AS "CCN_List"
                                WHERE "CCN_List".shop_customer_debt_cn_doc_id = "CCN_Doc".id
                                    AND "CCN_List".status = 1
                                    AND ("CCN_List".shop_customer_debt_cn_doc_id IN (
                                        SELECT "CDX_List".shop_customer_debt_cn_doc_id
                                        FROM app_shops_datas.dat_01hq0004_customer_debt_list AS "CDX_List"
                                        WHERE "CDX_List".shop_customer_debt_cn_doc_id = "CCN_List".shop_customer_debt_cn_doc_id
                                            AND "CDX_List".status = 1
                                            AND ("CDX_List".shop_customer_debt_doc_id = (
                                                SELECT "CDX_Doc".id
                                                FROM app_shops_datas.dat_01hq0004_customer_debt_doc AS "CDX_Doc"
                                                WHERE "CDX_Doc".id = "CDX_List".shop_customer_debt_doc_id
                                                    AND "CDX_Doc".status = 1
                                            ))
                                    ))
                            ))
                        )
                    )
                `.replace(/(01hq0004)/g, table_name)
                    .replace(/(\s)+/g, ' ')
            );
            if (Array.isArray(search[Op.and])) {
                whereQuery[Op.and].push(queryData);
            }
            else {
                whereQuery[Op.and] = [queryData];
            }
        }

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

        const fnFindDocuments = async () => await ShopCustomerDebtCreditNoteDoc.findAll({
            attributes: {
                include: [
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopCustomerDebtCreditNoteDoc"."created_by" )`), 'created_by'],
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopCustomerDebtCreditNoteDoc"."updated_by" )`), 'updated_by'],
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

        const fnFindDocuments_Count = async () => await ShopCustomerDebtCreditNoteDoc.count({
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


module.exports = handlerShopCustomerDebtCreditNoteDocAll;