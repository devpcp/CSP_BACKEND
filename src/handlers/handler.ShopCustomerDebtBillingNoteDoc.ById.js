const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const {
    initShopModel
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * - Route [GET] => /api/shopCustomerDebtBillingNoteDoc/all
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtBillingNoteDocById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopCustomerDebtBillingNoteDoc.ById';

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
            ShopServiceOrderDoc,
            ShopBusinessCustomer,
            ShopPersonalCustomer,
            ShopTemporaryDeliveryOrderDoc,
            ShopCustomerDebtBillingNoteDoc,
            ShopCustomerDebtBillingNoteList,
            ShopCustomerDebtDebitNoteDoc,
            ShopCustomerDebtCreditNoteDoc,
            ShopCustomerDebtCreditNoteDocT2,
            ShopTaxInvoiceDoc
        } = ShopModels;

        const findDocument = await ShopCustomerDebtBillingNoteDoc.findOne({
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
                    model: ShopCustomerDebtBillingNoteList,
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
                            model: ShopTaxInvoiceDoc,
                            as: 'ShopTaxInvoiceDoc',
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


module.exports = handlerShopCustomerDebtBillingNoteDocById;