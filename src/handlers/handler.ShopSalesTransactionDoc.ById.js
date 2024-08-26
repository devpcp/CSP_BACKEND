const {
    handleSaveLog
} = require("./log");

const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelShopProfiles = require("../models/model").ShopsProfiles;
const modelDocumentTypes = require("../models/model").DocumentTypes;
const modelDocumentTypeGroups = require("../models/model").DocumentTypeGroups;
const Province = require("../models/model").Province;
const District = require("../models/model").District;
const SubDistrict = require("../models/model").SubDistrict;
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;
const modelShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const ShopSalesTransactionOut = require("../models/model").ShopSalesTransactionOut;


/**
 * A handler to list shopSalesTransactionDoc from database
 * - Route [GET] => /api/shopSalesTransactionDoc/byid/:id
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopSalesTransactionDoc>>}
 */
const handlerShopSalesTransactionDocById = async (request) => {
    const handlerName = 'get shopSalesTransactionDoc byid';

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

        if (!findShopsProfile) {
            const instanceError = new Error(`Variable "findShopsProfile" return not found`);
            await handleSaveLog(request, [[handlerName], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", null);
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[handlerName], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", null);
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
             * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
             */
            const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);
            /**
              * A class's dynamics instance of model "ShopSalesTransactionOut"
           */
            const instanceModelShopSalesTransactionOut = ShopSalesTransactionOut(table_name)

            instanceModelShopSalesTransactionDoc.hasMany(
                instanceModelShopSalesOrderPlanLogs,
                {
                    sourceKey: 'id',
                    foreignKey: 'doc_sale_id',
                    as: 'ShopSalesOrderPlanLogs'
                }
            );

            instanceModelShopSalesTransactionDoc.hasMany(instanceModelShopSalesTransactionOut, { foreignKey: 'doc_sale_id' })

            instanceModelShopSalesTransactionOut.belongsTo(instanceModelShopSalesTransactionDoc, { foreignKey: 'ref_doc_sale_id', as: 'ShopSalesTransactionDocRef' })

            instanceModelShopSalesTransactionDoc.hasOne(instanceModelShopSalesOrderPlanLogs, { foreignKey: 'doc_sale_id' })

            const findShopBusinessPartners = await instanceModelShopSalesTransactionDoc.findOne({
                attributes: {
                    include: [
                        ...utilGetCreateByAndUpdatedByFromModel(instanceModelShopSalesTransactionDoc),
                    ]
                },
                include: [
                    { model: instanceModelShopSalesOrderPlanLogs, as: 'ShopSalesOrderPlanLogs' },
                    {
                        model: modelShopProfiles, as: 'ShopsProfiles',
                        include: [
                            { model: Province },
                            { model: District },
                            { model: SubDistrict },
                        ]
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
                    },
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
                ],
                where: {
                    id: request.params.id
                }
            });

            await handleSaveLog(request, [[handlerName], ""]);

            return utilSetFastifyResponseJson("success", findShopBusinessPartners);
        }
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopSalesTransactionDocById;