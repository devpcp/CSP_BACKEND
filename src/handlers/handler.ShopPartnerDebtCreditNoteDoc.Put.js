const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");
const { initShopModel } = require("../models/model");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { Transaction } = require("sequelize");
const db = require("../db");

/**
 * - Route [PUT] => /api/shopPartnerDebtCreditNoteDoc/put/:id
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopPartnerDebtCreditNoteDocPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopPartnerDebtCreditNoteDoc.Put';

    try {
        const currentDateTime = options?.currentDateTime || new Date();
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
            ShopPartnerDebtCreditNoteDoc
        } = ShopModels;

        const findShopPartnerDebtCreditNoteDoc = await ShopPartnerDebtCreditNoteDoc.findOne({
            where: {
                id: request.params.id
            },
            ShopModels: ShopModels
        });

        if (!findShopPartnerDebtCreditNoteDoc) {
            throw new Error(`ไม่พบข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า`);
        }
        else {
            const transactionResult = await db.transaction(
                {
                    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
                    transaction: request?.transaction || options?.transaction || null
                },
                async (transaction) => {
                    if (!request?.transaction || !options?.transaction) {
                        request.transaction = transaction;
                        options.transaction = transaction;
                    }

                    const created_and_updated_doc_lists = await ShopPartnerDebtCreditNoteDoc.createOrUpdateShopPartnerDebtCreditNote_Doc_Lists(
                        findShopPartnerDebtCreditNoteDoc.get('shop_id'),
                        request.id,
                        { id: findShopPartnerDebtCreditNoteDoc.get('id'), ...request.body },
                        request.body?.shopPartnerDebtCreditNoteLists || [],
                        {
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    return created_and_updated_doc_lists;
                }
            );

            await handleSaveLog(request, [[action, transactionResult.ShopPartnerDebtCreditNoteDoc.currentData.get('id'), request.body, transactionResult.ShopPartnerDebtCreditNoteDoc], '']);
            for (let i = 0; i < transactionResult.ShopPartnerDebtCreditNoteLists.length; i++) {
                const element = transactionResult.ShopPartnerDebtCreditNoteLists[i];

                await handleSaveLog(request, [[action, element.currentData.get('id'), request.body, element], '']);
            }

            return utilSetFastifyResponseJson('success', transactionResult);
        }
    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopPartnerDebtCreditNoteDocPut;