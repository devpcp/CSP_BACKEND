const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const db = require("../db");
const {
    initShopModel
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * - Route [DELETE] => /api/shopCustomerDebtDoc/delete
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtDocAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'DELETE ShopCustomerDebtDoc.Delete';

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
            ShopCustomerDebtDoc
        } = ShopModels;


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

                const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopCustomerDebtDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้การค้า`);
                }
                else if (findShopCustomerDebtDoc.get('status') === 0) {
                    throw new Error(`ไม่อนุญาตให้ยกเลิกเอกสารลูกหนี้การค้า เนื่องจากถูกยกเลิกไปก่อนแล้ว`);
                }
                else {
                    const canceledDocument = await ShopCustomerDebtDoc.cancelShopCustomerDebt_Doc(
                        request.id,
                        findShopCustomerDebtDoc.get('id'),
                        {
                            ...options,
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );
                    return canceledDocument;
                }
            }
        );

        await handleSaveLog(request, [[action, transactionResult.currentData.get('id')], '']);

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopCustomerDebtDocAdd;