const { Op, literal, where }  = require("sequelize");
const { handleSaveLog } = require("./log");
const { paginate } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelShopQuotationDoc = require("../models/model").ShopQuotationDoc;
const modelShopQuotationList = require("../models/model").ShopQuotationList;
const modelShopBusinessCustomer = require("../models/model").ShopBusinessCustomers;
const modelShopPersonalCustomer = require("../models/model").ShopPersonalCustomers;
const modelShopVehicleCustomer = require("../models/model").ShopVehicleCustomer;
const modelVehicleBrand = require('../models/model').VehicleBrand;
const modelVehicleModelType = require('../models/model').VehicleModelType;
const modelVehicleType = require('../models/model').VehicleType;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {{}} options
 */
const handlerShopQuotationDocById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopQuotationDoc.All';

    try {
        const search = request.query.search || '';
        const status = request.query.status || 'default';
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'DESC';

        const doc_date_startDate = request.query.doc_date_startDate || '';
        const doc_date_endDate = request.query.doc_date_endDate || '';

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const instanceModelShopBusinessCustomer = modelShopBusinessCustomer(table_name);
        const instanceModelShopPersonalCustomer = modelShopPersonalCustomer(table_name);
        const instanceModelShopVehicleCustomer = modelShopVehicleCustomer(table_name);

        const instanceModelShopQuotationDoc = modelShopQuotationDoc(table_name);
        const instanceModelShopQuotationList = modelShopQuotationList(table_name);

        instanceModelShopQuotationDoc.hasMany(instanceModelShopQuotationList, { sourceKey: 'id', foreignKey: 'doc_quotation_id', as: 'ShopQuotationLists' });

        const whereField_Status = (status = status || 'default') => {
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

        const queryInclude = (() => {
            /**
             * @type {import("sequelize/types").Includeable[]}
             */
            const includeData =  [
                {
                    model: instanceModelShopQuotationList,
                    as: "ShopQuotationLists",
                    required: false,
                    where: {
                        status: 1
                    },
                    separate: true,
                    order: [['seq_number', 'ASC']]
                },
                {
                    model: instanceModelShopBusinessCustomer,
                    as: 'ShopBusinessCustomer',
                    required: false
                },
                {
                    model: instanceModelShopPersonalCustomer,
                    as: 'ShopPersonalCustomer',
                    required: false
                },
                {
                    model: instanceModelShopVehicleCustomer,
                    as: 'ShopVehicleCustomer',
                    required: false,
                    include: [
                        {
                            model: modelVehicleBrand,
                            required: false
                        },
                        {
                            model: modelVehicleModelType,
                            required: false
                        },
                        {
                            model: modelVehicleType,
                            required: false
                        }
                    ]
                }
            ];

            return includeData;
        }).apply(null);

        const queryWhere = (() => {
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
            )
            /**
             * @type {import("sequelize/types").WhereOptions}
             */
            const whereData = search.length <= 0
                ?   {}
                :   {
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

            return whereData;
        }).apply(null);

        const findDocument = await instanceModelShopQuotationDoc.findAll({
            attributes: {
                include: [
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopQuotationDoc"."created_by" )`), 'created_by'],
                    [literal(`(SELECT user_name FROM systems.sysm_users WHERE id = "ShopQuotationDoc"."updated_by" )`), 'updated_by'],
                ]
            },
            include: queryInclude,
            where: {
                ...queryWhere,
                status: {
                    [Op.in]: whereField_Status(status)
                }
            },
            order: [[sort, order], ['created_date', 'desc'], ['code_id', 'desc']],
            transaction: request.transaction || options.transaction || null
        });

        await handleSaveLog(request, [[action, request.query], '']);

        return utilSetFastifyResponseJson('success', paginate(findDocument, limit, page));

    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action, request.params.id], error]);console.error(error)

        throw Error(`Error with logId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopQuotationDocById;