const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");
const { initShopModel } = require("../models/model");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { Transaction } = require("sequelize");
const db = require("../db");

/**
 * - Route [PUT] => /api/shopCustomerDebtDebitNoteDoc/put/:id
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtDebitNoteDocPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopCustomerDebtDebitNoteDoc.Put';

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
            ShopCustomerDebtDebitNoteDoc
        } = ShopModels;

        const findShopCustomerDebtDebitNoteDoc = await ShopCustomerDebtDebitNoteDoc.findOne({
            where: {
                id: request.params.id
            },
            ShopModels: ShopModels
        });

        if (!findShopCustomerDebtDebitNoteDoc) {
            throw new Error(`ไม่พบข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า`);
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

                    const created_and_updated_doc_lists = await ShopCustomerDebtDebitNoteDoc.createOrUpdateShopCustomerDebtDebitNote_Doc_Lists(
                        findShopCustomerDebtDebitNoteDoc.get('shop_id'),
                        request.id,
                        { id: findShopCustomerDebtDebitNoteDoc.get('id'), ...request.body },
                        request.body?.shopCustomerDebtDebitNoteLists || [],
                        {
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    return created_and_updated_doc_lists;
                }
            );

            await handleSaveLog(request, [[action, transactionResult.ShopCustomerDebtDebitNoteDoc.currentData.get('id'), request.body, transactionResult.ShopCustomerDebtDebitNoteDoc], '']);
            for (let i = 0; i < transactionResult.ShopCustomerDebtDebitNoteLists.length; i++) {
                const element = transactionResult.ShopCustomerDebtDebitNoteLists[i];

                await handleSaveLog(request, [[action, element.currentData.get('id'), request.body, element], '']);
            }

            return utilSetFastifyResponseJson('success', transactionResult);
        }
    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopCustomerDebtDebitNoteDocPut;