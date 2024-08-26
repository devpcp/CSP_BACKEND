const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const {
    initShopModel
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * - Route [GET] => /api/shopCustomerDebtDoc/all
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtDocById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopCustomerDebtDoc.ById';

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
            ShopCustomerDebtDoc,
            ShopCustomerDebtList,
            ShopServiceOrderDoc,
            ShopPaymentTransaction,
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopTemporaryDeliveryOrderDoc,
            ShopCustomerDebtDebitNoteDoc,
            ShopCustomerDebtCreditNoteDoc,
            ShopCustomerDebtCreditNoteDocT2
        } = ShopModels;

        const findDocument = await ShopCustomerDebtDoc.findOne({
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
                    model: ShopCustomerDebtList,
                    required: true,
                    separate: true,
                    where: {
                        status: 1
                    },
                    include: [
                        {
                            model: ShopServiceOrderDoc,
                            as: 'ShopServiceOrderDoc',
                            required: false
                        },
                        {
                            model: ShopTemporaryDeliveryOrderDoc,
                            as: 'ShopTemporaryDeliveryOrderDoc',
                            required: false
                        },
                        {
                            model: ShopCustomerDebtDebitNoteDoc,
                            as: 'ShopCustomerDebtDebitNoteDoc',
                            required: false
                        },
                        {
                            model: ShopCustomerDebtCreditNoteDoc,
                            as: 'ShopCustomerDebtCreditNoteDoc',
                            required: false
                        },
                        {
                            model: ShopCustomerDebtCreditNoteDocT2,
                            as: 'ShopCustomerDebtCreditNoteDocT2',
                            required: false
                        }
                    ]
                },
                {
                    model: ShopPaymentTransaction,
                    required: true,
                    separate: true,
                    where: {
                        canceled_payment_by: null,
                        canceled_payment_date: null
                    }
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


module.exports = handlerShopCustomerDebtDocById;