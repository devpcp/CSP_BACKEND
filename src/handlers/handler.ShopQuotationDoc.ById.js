const { handleSaveLog } = require("./log");
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
    const action = 'GET ShopQuotationDoc.ById';

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

        const instanceModelShopBusinessCustomer = modelShopBusinessCustomer(table_name);
        const instanceModelShopPersonalCustomer = modelShopPersonalCustomer(table_name);
        const instanceModelShopVehicleCustomer = modelShopVehicleCustomer(table_name);

        const instanceModelShopQuotationDoc = modelShopQuotationDoc(table_name);
        const instanceModelShopQuotationList = modelShopQuotationList(table_name);

        instanceModelShopQuotationDoc.hasMany(instanceModelShopQuotationList, { sourceKey: 'id', foreignKey: 'doc_quotation_id', as: 'ShopQuotationLists' });

        const findDocument = await instanceModelShopQuotationDoc.findOne({
            include: [
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
            ],
            where: {
                id: request.params.id
            },
            transaction: request.transaction || options.transaction || null
        });

        await handleSaveLog(request, [[action, request.params.id], '']);

        return utilSetFastifyResponseJson('success', findDocument);

    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action, request.params.id], error]);

        throw Error(`Error with logId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopQuotationDocById;