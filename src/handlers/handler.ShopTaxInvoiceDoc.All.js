const { Op, where, literal } = require("sequelize");
const { handleSaveLog } = require("./log");
const { paginate } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const fnGetQueryWhereStatusFromRequest = (status = status || 'default') => {
    switch (status) {
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
const {
    initShopModel,
    VehicleBrand,
    VehicleModelType,
    VehicleType,
    Province,
    District,
    SubDistrict
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopTaxInvoiceDocAll = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopTaxInvoiceDoc.All';

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
        const status = request.query.status || 'default';
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'DESC';

        const doc_date_startDate = request.query.doc_date_startDate || '';
        const doc_date_endDate = request.query.doc_date_endDate || '';

        const ShopServiceOrderDoc__doc_sales_type = request.query?.ShopServiceOrderDoc__doc_sales_type || 1;
        const obj_ShopServiceOrderDoc__is_draft = (() => {
            let objFilter = {};
            switch (request.query?.ShopServiceOrderDoc__is_draft.toLowerCase()) {
                case 'is_draft': {
                    objFilter = { is_draft: true };
                    break;
                }
                case 'not_draft': {
                    objFilter = { is_draft: false };
                    break;
                }
                default: {
                    break;
                }
            }
            return objFilter;
        })();
        const obj_ShopServiceOrderDoc__payment_paid_status = (() => {
            const ShopServiceOrderDoc__payment_paid_status = request.query?.ShopServiceOrderDoc__payment_paid_status;
            return Number.isSafeInteger(ShopServiceOrderDoc__payment_paid_status) && ShopServiceOrderDoc__payment_paid_status >= 0
                ? {
                    [Op.and]: [
                        literal(`
                            ((
                                CASE
                                    WHEN "ShopServiceOrderDoc".payment_paid_status = 5
                                    THEN (CASE WHEN
                                            "ShopServiceOrderDoc".debt_price_amount -
                                            coalesce((
                                                SELECT debt_price_paid_grand_total
                                                FROM (
                                                        SELECT
                                                            shop_service_order_doc_id,
                                                            sum(debt_price_paid_total + debt_price_paid_adjust)::numeric(20,2) AS debt_price_paid_grand_total
                                                        FROM app_shops_datas.dat_01hq0004_customer_debt_list AS "ShopCustDebtList"
                                                        WHERE "ShopCustDebtList".shop_customer_debt_doc_id = (SELECT x.id FROM app_shops_datas.dat_01hq0004_customer_debt_doc AS x WHERE x.id = "ShopCustDebtList".shop_customer_debt_doc_id AND x.status = 1 AND x.payment_paid_status = 3)
                                                        GROUP BY shop_service_order_doc_id
                                                     ) AS u
                                                WHERE u.shop_service_order_doc_id = "ShopServiceOrderDoc".id
                                            ),0) = 0
                                            THEN 3
                                            ELSE "ShopServiceOrderDoc".payment_paid_status
                                        END)
                                    ELSE "ShopServiceOrderDoc".payment_paid_status
                                END
                            ) = ${ShopServiceOrderDoc__payment_paid_status})
                        `.replace(/(01hq0004)+/ig, table_name).replace(/\s+/ig, ' '))
                    ]
                }
                : {}
        })();

        const {
            ShopTaxInvoiceDoc,
            ShopTaxInvoiceList,
            ShopServiceOrderDoc,
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopVehicleCustomer,
            ShopTemporaryDeliveryOrderDoc,
            ShopPaymentTransaction
        } = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);

        /**
         * @type {import("sequelize/types").WhereOptions}
         */
        const queryWhere = ((search = '') => {
            const renderSearchTele = (whereFieldName, whereAttributeName) => (
                /[0-9]+/.test(search) === false
                    ? []
                    : ([1,2,3].map(w => (
                        where( // `"ShopBusinessCustomer"."mobile_no"->>'mobile_no_${w}'`
                            literal(`"${whereFieldName}"."${whereAttributeName}"->>'${whereAttributeName}_${w}'`),
                            Op.iLike,
                            `%${search}%`
                        )
                    )))
            );

            /**
             * @type {import("sequelize/types").WhereOptions}
             */
            const whereData = search.length <= 0
                ? {}
                : {
                    [Op.or]: [
                        {
                            abb_code_id: {
                                [Op.iLike]: `%${search}%`
                            }
                        },
                        {
                            inv_code_id: {
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
                        },
                        where(
                            literal(`"ShopBusinessCustomer"."customer_name"->>'th'`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        ...renderSearchTele(`ShopBusinessCustomer`, `tel_no`),
                        ...renderSearchTele(`ShopBusinessCustomer`, `mobile_no`),
                        where(
                            literal(`"ShopPersonalCustomer"."customer_name"->>'first_name'`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopPersonalCustomer"."customer_name"->>'last_name'`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        ...renderSearchTele(`ShopPersonalCustomer`, `tel_no`),
                        ...renderSearchTele(`ShopPersonalCustomer`, `mobile_no`),
                        where(
                            literal(`"ShopVehicleCustomer"."details"->>'province_name'`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopVehicleCustomer"."details"->>'registration'`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopServiceOrderDoc"."code_id"`),
                            Op.iLike,
                            `%${search}%`
                        )
                    ]
                };

            // Filter by doc_date date range
            if (doc_date_startDate && doc_date_endDate) {
                if (!whereData[Op.and]) { whereData[Op.and] = []; }
                whereData[Op.and].push({
                    [Op.or]: [
                        {
                            abb_doc_date: {
                                [Op.between]: [doc_date_startDate, doc_date_endDate]
                            },
                        },
                        {
                            inv_doc_date: {
                                [Op.between]: [doc_date_startDate, doc_date_endDate]
                            }
                        }
                    ],
                });
            }
            else {
                if (doc_date_startDate && !doc_date_endDate) {
                    if (!whereData[Op.and]) { whereData[Op.and] = []; }
                    whereData[Op.and].push({
                        [Op.or]: [
                            {
                                abb_doc_date: {
                                    [Op.gte]: doc_date_startDate
                                },
                            },
                            {
                                inv_doc_date: {
                                    [Op.gte]: doc_date_startDate
                                }
                            }
                        ],
                    });
                }
                if (!doc_date_startDate && doc_date_endDate) {
                    if (!whereData[Op.and]) { whereData[Op.and] = []; }
                    whereData[Op.and].push({
                        [Op.or]: [
                            {
                                abb_doc_date: {
                                    [Op.lte]: doc_date_endDate
                                },
                            },
                            {
                                inv_doc_date: {
                                    [Op.lte]: doc_date_endDate
                                }
                            }
                        ],
                    })
                }
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
                    model: ShopTaxInvoiceList,
                    separate: true,
                    where: {
                        status: 1
                    },
                    order: [
                        ['seq_number', 'asc']
                    ]
                },
                {
                    model: ShopServiceOrderDoc,
                    as: 'ShopServiceOrderDoc',
                    required: true,
                    attributes: {
                        include: [
                            [literal(`
                                (CASE
                                    WHEN "ShopServiceOrderDoc".payment_paid_status = 5
                                    THEN (CASE WHEN
                                            "ShopServiceOrderDoc".debt_price_amount -
                                            coalesce((
                                                SELECT debt_price_paid_grand_total
                                                FROM (
                                                        SELECT
                                                            shop_service_order_doc_id,
                                                            sum(debt_price_paid_total + debt_price_paid_adjust)::numeric(20,2) AS debt_price_paid_grand_total
                                                        FROM app_shops_datas.dat_01hq0004_customer_debt_list AS "ShopCustDebtList"
                                                        WHERE "ShopCustDebtList".shop_customer_debt_doc_id = (SELECT x.id FROM app_shops_datas.dat_01hq0004_customer_debt_doc AS x WHERE x.id = "ShopCustDebtList".shop_customer_debt_doc_id AND x.status = 1 AND x.payment_paid_status = 3)
                                                        GROUP BY shop_service_order_doc_id
                                                     ) AS u
                                                WHERE u.shop_service_order_doc_id = "ShopServiceOrderDoc".id
                                            ),0) = 0
                                            THEN 3
                                            ELSE "ShopServiceOrderDoc".payment_paid_status
                                        END)
                                    ELSE "ShopServiceOrderDoc".payment_paid_status
                                END)
                            `.replace(/(01hq0004)+/ig, table_name).replace(/\s+/ig, ' ')), 'payment_paid_status']
                        ]
                    },
                    where: {
                        doc_sales_type: ShopServiceOrderDoc__doc_sales_type,
                        ...obj_ShopServiceOrderDoc__is_draft,
                        ...obj_ShopServiceOrderDoc__payment_paid_status,
                    },
                    include: [
                        {
                            model: ShopTemporaryDeliveryOrderDoc,
                            required: false,
                            where: {
                                status: 1
                            },
                        },
                        {
                            model: ShopPaymentTransaction,
                            separate: true
                        },
                    ]
                },
                {
                    model: ShopBusinessCustomer,
                    as: 'ShopBusinessCustomer',
                    required: false,
                    include: [
                        {
                            model: Province,
                            as: 'Province',
                            required: false
                        },
                        {
                            model: District,
                            as: 'District',
                            required: false
                        },
                        {
                            model: SubDistrict,
                            as: 'SubDistrict',
                            required: false
                        }
                    ]
                },
                {
                    model: ShopPersonalCustomer,
                    as: 'ShopPersonalCustomer',
                    required: false,
                    include: [
                        {
                            model: Province,
                            as: 'Province',
                            required: false
                        },
                        {
                            model: District,
                            as: 'District',
                            required: false
                        },
                        {
                            model: SubDistrict,
                            as: 'SubDistrict',
                            required: false
                        }
                    ]
                },
                {
                    model: ShopVehicleCustomer,
                    as: 'ShopVehicleCustomer',
                    required: false,
                    include: [
                        {
                            model: VehicleBrand,
                            required: false
                        },
                        {
                            model: VehicleModelType,
                            required: false
                        },
                        {
                            model: VehicleType,
                            required: false
                        }
                    ]
                }
            ];

            return includeData;
        })();

        const transaction = request?.transaction || options?.transaction || null;

        const findDocument = await ShopTaxInvoiceDoc.findAll({
            attributes: {
                include: [
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopTaxInvoiceDoc"."created_by" )`), 'created_by'],
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopTaxInvoiceDoc"."updated_by" )`), 'updated_by'],
                ]
            },
            include: queryInclude,
            where: {
                ...queryWhere,
                status: {
                    [Op.in]: fnGetQueryWhereStatusFromRequest(status)
                }
            },
            order: [[sort, order], ['created_date', 'desc']],
            transaction: transaction
        });

        await handleSaveLog(request, [[action, request.query], '']);

        return utilSetFastifyResponseJson('success', paginate(findDocument, limit, page));

    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};


module.exports = handlerShopTaxInvoiceDocAll;