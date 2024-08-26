const _ = require("lodash");
const {
    Op,
    literal,
    where
} = require("sequelize");
const {
    handleSaveLog
} = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const {
    paginate,
    generateSearchOpFromKeys,
    isUUID
} = require("../utils/generate");

const modelShopProfiles = require("../models/model").ShopsProfiles;
const modelDocumentTypes = require("../models/model").DocumentTypes;
const modelDocumentTypeGroups = require("../models/model").DocumentTypeGroups;
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;
const ShopSalesTransactionOut = require("../models/model").ShopSalesTransactionOut;
const ShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;


/**
 * A handler to list shopPersonalCustomers from database
 * - Route [GET] => /api/shopSalesTransactionDoc/all
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<{data: ShopSalesTransactionDoc[], pages: number, currentCount: number, currentPage: number, totalCount: number}>>}
 */
const handlerShopSalesTransactionDocAll = async (request) => {
    const handlerName = 'get shopSalesTransactionDoc all';

    try {
        /**
         * A function to generate JSON filter in postgres where is contains dynamic JSON keys
         * @param {string} jsonFieldReq - A input data can be multiple keys by separate with comma ","  - example: "field_1"  - example2: "field_1,field_2,field_3"
         * @returns {string[]}
         */
        const getJsonField = (jsonFieldReq = "") => {
            if (!_.isString(jsonFieldReq) || !jsonFieldReq) {
                return [];
            }
            else {
                return jsonFieldReq.split(",")
                    .map(where => {
                        const refactorInput = where.replace(/\s/, "");
                        if (refactorInput !== "") {
                            return refactorInput;
                        }
                    });
            }
        };

        // Init data as requested
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        const search = request.query.search || "";
        const status = ['0', '1', '2', '3', '4'].includes(request.query.status) ? { status: +request.query.status } : { status: { [Op.ne]: 0 } };
        const sort = request.query.sort || "created_date";
        const order = request.query.order || "asc";
        const limit = +request.query.limit || 10;
        const page = +request.query.page || 1;
        const purchase_status = _.isBoolean(request.query.purchase_status) ? { purchase_status: request.query.purchase_status } : {};
        const sale_type = _.isBoolean(request.query.sale_type) ? { sale_type: request.query.sale_type } : {};
        const jsonField = {
            details: getJsonField(_.get(request.query, "jsonField.details", "")),
        };
        const getVehiclesCustomersID = isUUID(request.query.vehicles_customers_id)
            ? { vehicles_customers_id: request.query.vehicles_customers_id }
            : {};
        const getBusinessCustomersID = isUUID(request.query.bus_customer_id)
            ? { bus_customer_id: request.query.bus_customer_id }
            : {};
        const getPersonalCustomersID = isUUID(request.query.per_customer_id)
            ? { per_customer_id: request.query.per_customer_id }
            : {};
        const getDocTypeID = isUUID(request.query.doc_type_id)
            ? { doc_type_id: request.query.doc_type_id }
            : {};
        const filter_by_prefixDocType_code_id = (request.query.filter_by_prefixDocType_code_id || 'JOB').split(',');


        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        if (!findShopsProfile) {
            const instanceError = new Error(`Variable "findShopsProfile" return not found`);
            await handleSaveLog(request, [[handlerName], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[handlerName], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else {
            /**
             * A class's dynamics instance of model "ShopBusinessCustomers"
             */
            const instanceModelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers(table_name);
            /**
             * A class's dynamics instance of model "ShopPersonalCustomers"
             */
            const instanceModelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers(table_name);
            /**
             * A class's dynamics instance of model "ShopVehicleCustomers"
             */
            const instanceModelShopVehicleCustomers = require("../models/model").ShopVehicleCustomer(table_name);
            /**
             * A class's dynamics instance of model "ShopSalesTransactionDoc"
             */
            const instanceModelShopSalesTransactionDoc = modelShopSalesTransactionDoc(table_name);
            /**
               * A class's dynamics instance of model "ShopSalesTransactionOut"
            */
            const instanceModelShopSalesTransactionOut = ShopSalesTransactionOut(table_name)
            /**
                 * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
             */
            const instanceModelShopSalesOrderPlanLogs = ShopSalesOrderPlanLogs(table_name)


            instanceModelShopSalesTransactionDoc.hasMany(instanceModelShopSalesTransactionOut, { foreignKey: 'doc_sale_id' })

            instanceModelShopSalesTransactionOut.belongsTo(instanceModelShopSalesTransactionDoc, { foreignKey: 'ref_doc_sale_id', as: 'ShopSalesTransactionDocRef' })

            instanceModelShopSalesTransactionDoc.hasOne(instanceModelShopSalesOrderPlanLogs, { foreignKey: 'doc_sale_id' })


            const findShopSalesTransaction = await instanceModelShopSalesTransactionDoc.findAll({
                attributes: {
                    include: [
                        ...utilGetCreateByAndUpdatedByFromModel(instanceModelShopSalesTransactionDoc),
                    ]
                },
                include: [
                    { model: modelShopProfiles, as: 'ShopsProfiles' },
                    { model: instanceModelShopBusinessCustomers, as: 'ShopBusinessCustomers' },
                    { model: instanceModelShopPersonalCustomers, as: 'ShopPersonalCustomers' },
                    { model: instanceModelShopVehicleCustomers, as: 'ShopVehicleCustomers' },
                    {
                        model: modelDocumentTypes,
                        as: 'DocumentTypes',
                        include: [
                            {
                                model: modelDocumentTypeGroups
                            }
                        ],
                    },
                    {
                        model: instanceModelShopSalesTransactionOut,
                        // attributes:{
                        //     include:[
                        //         sequelize.literal(`SELECT SUM()`)
                        //     ]
                        // },
                        include: {
                            model: instanceModelShopSalesTransactionDoc, as: 'ShopSalesTransactionDocRef',
                            include: { model: instanceModelShopSalesOrderPlanLogs }
                        }
                    }
                ],
                where: {
                    ...status,
                    ...purchase_status,
                    ...sale_type,
                    ...getVehiclesCustomersID,
                    ...getBusinessCustomersID,
                    ...getPersonalCustomersID,
                    ...getDocTypeID,
                    [Op.or]: [
                        ...(
                            filter_by_prefixDocType_code_id.includes('JOB') || filter_by_prefixDocType_code_id.includes('ALL')
                                ? [
                                    {
                                        code_id: { [Op.iLike]: `%${search}%` }
                                    }
                                ]
                                : []
                        ),
                        ...(
                            filter_by_prefixDocType_code_id.includes('TRN') || filter_by_prefixDocType_code_id.includes('ALL')
                                ? [
                                    where(
                                        literal(`"ShopSalesTransactionDoc".details->'ShopDocumentCode'->'TRN'->>'code_id'`),
                                        Op.iLike,
                                        `%${search}%`
                                    )
                                ]
                                : []
                        ),
                        ...(
                            filter_by_prefixDocType_code_id.includes('INV') || filter_by_prefixDocType_code_id.includes('ALL')
                                ? [
                                    where(
                                        literal(`"ShopSalesTransactionDoc".details->'ShopDocumentCode'->'INV'->>'code_id'`),
                                        Op.iLike,
                                        `%${search}%`
                                    )
                                ]
                                : []
                        ),
                        {
                            details: {
                                [Op.or]: [
                                    ...generateSearchOpFromKeys(jsonField.details, Op.iLike, `%${search}%`)
                                ]
                            }
                        },
                        where(
                            literal(`"ShopPersonalCustomers".master_customer_code_id`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopBusinessCustomers".master_customer_code_id`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopBusinessCustomers".customer_name->>'th'`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopBusinessCustomers".tel_no::text`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopBusinessCustomers".mobile_no::text`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`CONCAT("ShopPersonalCustomers".customer_name->'first_name'->>'th' ,' ',"ShopPersonalCustomers".customer_name->'last_name'->>'th' )`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopPersonalCustomers".tel_no::text`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopPersonalCustomers".mobile_no::text`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopVehicleCustomers".code_id`),
                            Op.iLike,
                            `%${search}%`
                        ),
                        where(
                            literal(`"ShopVehicleCustomers".details->>'registration'`),
                            Op.iLike,
                            `%${search}%`
                        )
                    ]
                },
                order: [[sort, order]]
            });

            await handleSaveLog(request, [[handlerName], ""]);

            return utilSetFastifyResponseJson("success", paginate(findShopSalesTransaction, limit, page));
        }
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopSalesTransactionDocAll;