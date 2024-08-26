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

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T> || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault || {}} options
 */
const handlerShopTaxInvoiceDocById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopTaxInvoiceDoc.ById';

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
            ShopTaxInvoiceDoc,
            ShopTaxInvoiceList,
            ShopServiceOrderDoc,
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopVehicleCustomer,
            ShopTemporaryDeliveryOrderDoc,
            ShopPaymentTransaction
        } = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);

        const transaction = request?.transaction || options?.transaction || null;

        const findDocument = await ShopTaxInvoiceDoc.findOne({
            include: [
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
                    required: false,
                    include: [
                        {
                            model: ShopTemporaryDeliveryOrderDoc,
                            required: false,
                            where: {
                                status: 1
                            }
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
            ],
            where: {
                id: request.params.id
            },
            transaction: transaction
        });

        await handleSaveLog(request, [[action, request.params.id], '']);

        return utilSetFastifyResponseJson('success', findDocument);

    } catch (error) {
        await handleSaveLog(request, [[action, request.params.id], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopTaxInvoiceDocById;