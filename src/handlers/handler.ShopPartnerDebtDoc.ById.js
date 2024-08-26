const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const {
    initShopModel
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * - Route [GET] => /api/shopPartnerDebtDoc/all
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopPartnerDebtDocById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopPartnerDebtDoc.ById';

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
            ShopPartnerDebtDoc,
            ShopPartnerDebtList,
            ShopInventoryImportDoc,
            ShopPaymentTransaction,
            ShopBusinessPartner,
            ShopPartnerDebtDebitNoteDoc,
            ShopPartnerDebtCreditNoteDoc
        } = ShopModels;

        const findDocument = await ShopPartnerDebtDoc.findOne({
            include: [
                {
                    model: ShopBusinessPartner,
                    as: 'ShopBusinessPartner',
                    required: false
                },
                {
                    model: ShopPartnerDebtList,
                    required: true,
                    separate: true,
                    where: {
                        status: 1
                    },
                    include: [
                        {
                            model: ShopInventoryImportDoc,
                            as: 'ShopInventoryTransaction',
                            required: false
                        },
                        {
                            model: ShopPartnerDebtDebitNoteDoc,
                            as: 'ShopPartnerDebtDebitNoteDoc',
                            required: false
                        },
                        {
                            model: ShopPartnerDebtCreditNoteDoc,
                            as: 'ShopPartnerDebtCreditNoteDoc',
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


module.exports = handlerShopPartnerDebtDocById;