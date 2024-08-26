const { Op, where, literal } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
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


/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopServiceOrderDocAll = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopServiceOrderDoc.All';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopProfiles[0].shop_code_id;

        let search = request.query.search || '';
        if (search.length > 0) {
            search = search.replace(/(\s)+/ig, ' ');
            search = search.replace(/(\s)+/ig, '%');
        }

        const status = request.query.status || 'default';
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        let sort = request.query.sort || 'created_date';
        const order = request.query.order || 'DESC';

        if (sort === 'job_code_id') {
            sort = literal(`"ShopServiceOrderDoc".code_id`);
        }
        if (sort === 'trn_code_id') {
            sort = literal(`(SELECT a.code_id FROM "app_shops_datas"."dat_${table_name}_temporary_delivery_order_doc" AS a WHERE a.status = 1 AND a.shop_service_order_doc_id = "ShopServiceOrderDoc".id ORDER BY a.code_id DESC LIMIT 1)`);
        }
        if (sort === 'inv_code_id') {
            sort = literal(`(SELECT coalesce(a.inv_code_id, a.abb_code_id) FROM "app_shops_datas"."dat_${table_name}_tax_invoice_doc" AS a WHERE a.status = 1 AND a.shop_service_order_doc_id = "ShopServiceOrderDoc".id ORDER BY coalesce(a.inv_code_id, a.abb_code_id) DESC LIMIT 1)`);
        }

        const doc_date_startDate = request.query.doc_date_startDate || '';
        const doc_date_endDate = request.query.doc_date_endDate || '';

        /**
         * @type {number|null}
         */
        const payment_paid_status = Number.isSafeInteger(request.query?.payment_paid_status)
            ? request.query.payment_paid_status
            : null;

        const is_draft = request.query.is_draft || null;

        const filter__debt_price_amount_left = request.query?.filter__debt_price_amount_left || false;

        /**
         * ประเภทการขาย
         * - 1 = ใบสั่งซ่อม
         * - 2 = ใบสั่งขาย
         * @type {number|null}
         */
        const doc_sales_type = request.query.doc_sales_type || null;

        const bus_customer_id = request.query.bus_customer_id || null;

        const per_customer_id = request.query.per_customer_id || null;

        const created_by = request.query.created_by || null;

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopServiceOrderDoc,
            ShopServiceOrderList,
            ShopTemporaryDeliveryOrderDoc,
            ShopTaxInvoiceDoc,
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopVehicleCustomer,
            ShopPaymentTransaction
        } = ShopModels;

        /**
         * @type {import("sequelize/types").WhereOptions}
         */
        const queryWhere = ((search = '') => {
            const renderSearchTele = (whereFieldName, whereAttributeName) => (
                /[0-9]+/.test(search) === false
                    ? []
                    : ([1, 2, 3].map(w => (
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
                        where(
                            literal(`(coalesce("ShopPersonalCustomer"."customer_name"->>'first_name' ,'') || coalesce("ShopPersonalCustomer"."customer_name"->>'last_name' ,''))`),
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
                        )
                    ]
                };

            // Filter by doc_date date range
            if (doc_date_startDate && doc_date_endDate) {
                whereData.doc_date = {
                    [Op.between]: [doc_date_startDate, doc_date_endDate]
                }
            }
            else {
                if (doc_date_startDate && !doc_date_endDate) {
                    whereData.doc_date = {
                        [Op.gte]: doc_date_startDate
                    }
                }
                if (!doc_date_startDate && doc_date_endDate) {
                    whereData.doc_date = {
                        [Op.lte]: doc_date_endDate
                    }
                }
            }

            if (Number.isSafeInteger(doc_sales_type)) {
                whereData.doc_sales_type = doc_sales_type;
            }

            if (Number.isSafeInteger(payment_paid_status)) {
                // whereData.payment_paid_status = payment_paid_status;
                if (!whereData?.[Op.and]) {
                    whereData[Op.and] = [];
                }
                whereData[Op.and].push(literal(`
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
                    ) = ${payment_paid_status})
                `.replace(/(01hq0004)+/ig, table_name).replace(/\s+/ig, ' ')));
            }

            if (is_draft) {
                if (is_draft === 'is_draft') {
                    whereData.is_draft = true;
                }
                if (is_draft === 'not_draft') {
                    whereData.is_draft = false;
                }
            }

            if (filter__debt_price_amount_left) {
                whereData.debt_price_amount_left = {
                    [Op.gt]: 0
                }
            }
            if (bus_customer_id) {
                whereData.bus_customer_id = bus_customer_id
            }
            if (per_customer_id) {
                whereData.per_customer_id = per_customer_id
            }
            if (created_by) {
                whereData.created_by = created_by
            }

            whereData.status = {
                [Op.in]: fnGetQueryWhereStatusFromRequest(status)
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
            const includeData = [
                {
                    model: ShopServiceOrderList,
                    separate: true,
                    where: {
                        status: 1
                    },
                    order: [
                        ['seq_number', 'asc']
                    ]
                },
                {
                    model: ShopPaymentTransaction,
                    separate: true
                },
                {
                    model: ShopTemporaryDeliveryOrderDoc,
                    separate: true
                },
                {
                    model: ShopTaxInvoiceDoc,
                    separate: true
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

        const fnFindDocuments = async () => await ShopServiceOrderDoc.findAll({
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
                    `.replace(/(01hq0004)+/ig, table_name).replace(/\s+/ig, ' ')), 'payment_paid_status'],
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopServiceOrderDoc"."created_by" )`), 'created_by'],
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopServiceOrderDoc"."updated_by" )`), 'updated_by'],
                ]
            },
            include: queryInclude,
            where: queryWhere,
            order: [[sort, order], ['created_date', 'desc'], ['code_id', 'desc']],
            transaction: request?.transaction || options?.transaction || null,
            limit: limit,
            offset: (page - 1) * limit,
            subQuery: false // ต้องทำ "subQuery: false" เพราะติด Error จากการใช้งานของ limit และ offset
        });
        const fnFindDocuments_Count = async () => await ShopServiceOrderDoc.count({
            include: queryInclude,
            where: queryWhere,
            order: [[sort, order], ['created_date', 'desc'], ['code_id', 'desc']],
            transaction: request?.transaction || options?.transaction || null
        });
        const [findDocuments, findDocuments_Count] = await Promise.all([fnFindDocuments(), fnFindDocuments_Count()]);

        await handleSaveLog(request, [[action, request.query], '']);

        const findResults = {
            currentPage: page,
            pages: Math.ceil(findDocuments_Count / limit),
            currentCount: findDocuments.length,
            totalCount: findDocuments_Count,
            data: findDocuments
        };

        return utilSetFastifyResponseJson('success', findResults);
    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};


module.exports = handlerShopServiceOrderDocAll;