const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");
const { initShopModel } = require("../models/model");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { Transaction } = require("sequelize");
const db = require("../db");

/**
 * - Route [PUT] => /api/shopCustomerDebtBillingNoteDoc/add
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtBillingNoteDocPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopCustomerDebtBillingNoteDoc.Put';

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
            ShopCustomerDebtBillingNoteDoc
        } = ShopModels;

        const findShopCustomerDebtBillingNoteDoc = await ShopCustomerDebtBillingNoteDoc.findOne({
            where: {
                id: request.params.id
            },
            ShopModels: ShopModels
        });

        if (!findShopCustomerDebtBillingNoteDoc) {
            throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้การค้า`);
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

                    const created_and_updated_doc_lists = await ShopCustomerDebtBillingNoteDoc.createOrUpdateShopCustomerDebtBillingNote_Doc_Lists(
                        findShopCustomerDebtBillingNoteDoc.get('shop_id'),
                        request.id,
                        { id: findShopCustomerDebtBillingNoteDoc.get('id'), ...request.body },
                        request.body?.shopCustomerDebtBillingNoteLists || [],
                        {
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    return created_and_updated_doc_lists;
                }
            );

            return utilSetFastifyResponseJson('success', transactionResult);
        }
    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopCustomerDebtBillingNoteDocPut;