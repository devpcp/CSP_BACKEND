const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const {
    initShopModel
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * - Route [GET] => /api/shopCustomerDebtDebitNoteDoc/byid/:id
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtDebitNoteDocById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopCustomerDebtDebitNoteDoc.ById';

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

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopTemporaryDeliveryOrderDoc,
            ShopCustomerDebtDebitNoteDoc,
            ShopCustomerDebtDebitNoteList,
            ShopCustomerDebtList,
            ShopCustomerDebtDoc
        } = ShopModels;

        const findDocument = await ShopCustomerDebtDebitNoteDoc.findOne({
            include: [
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
                    model: ShopCustomerDebtDebitNoteList,
                    required: true,
                    separate: true,
                    where: {
                        status: 1
                    },
                    include: [
                        {
                            model: ShopTemporaryDeliveryOrderDoc,
                            as: 'ShopTemporaryDeliveryOrderDoc',
                            required: false
                        },
                        {
                            model: ShopCustomerDebtList,
                            required: false,
                            separate: true,
                            where: {
                                status: 1
                            },
                            include: [
                                {
                                    model: ShopCustomerDebtDoc,
                                    as: 'ShopCustomerDebtDoc',
                                    required: true,
                                    where: {
                                        status: 1
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            where: {
                id: request.params.id
            },
            transaction: request?.transaction || options?.transaction || null,
            ShopModels: ShopModels
        });

        await handleSaveLog(request, [[action, request.params.id], '']);

        return utilSetFastifyResponseJson('success', findDocument);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopCustomerDebtDebitNoteDocById;