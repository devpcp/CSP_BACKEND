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
const { Op, where, literal } = require("sequelize");

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T> || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault || {}} options
 */
const handlerShopServiceOrderDocById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopServiceOrderDoc.ById';

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

        const findDocument = await ShopServiceOrderDoc.findOne({
            include: [
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
                    attributes: {
                        include: [
                            [literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopPersonalCustomer\".\"tags\"))`), 'tags']
                        ]
                    },
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
            transaction: request?.transaction || options?.transaction || null
        });

        await handleSaveLog(request, [[action, request.params.id], '']);

        return utilSetFastifyResponseJson('success', findDocument);

    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action, request.params.id], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};


module.exports = handlerShopServiceOrderDocById;