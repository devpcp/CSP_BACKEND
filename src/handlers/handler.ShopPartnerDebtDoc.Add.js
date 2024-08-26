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
 * A handler to add new by id shopPartnerDebtDoc and shopPartnerDebtLists into database
 * - Route [PUT] => /api/shopPartnerDebtDoc/add
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopPartnerDebtDocAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST ShopPartnerDebtDoc.Add';

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
        const table_shop_id = findShopsProfile?.id;
        if (request.body?.shop_id) {
            if (request.body.shop_id !== table_shop_id) {
                throw new Error(`ไม่อนุญาตให้ผู้ใช้งานใช้งานข้ามร้าน`);
            }
        }

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopPartnerDebtDoc,
            ShopPartnerDebtList
        } = ShopModels;

        const reqShopPartnerDebtDoc = request?.body || {};
        const reqShopPartnerDebtLists = request?.body?.shopPartnerDebtLists || [];

        /**
         * @type {{ShopPartnerDebtDoc: {isCreated: boolean, isUpdated: boolean, currentData: ShopPartnerDebtDoc, previousData: null}; ShopPartnerDebtLists: {isCreated: boolean, isUpdated: boolean, previousData: null, currentData: ShopPartnerDebtList}[];}}
         */
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

                const createdShopPartnerDebt = await ShopPartnerDebtDoc.createShopPartnerDebt_Doc_Lists(
                    table_shop_id,
                    request.id,
                    reqShopPartnerDebtDoc,
                    reqShopPartnerDebtLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                return createdShopPartnerDebt;
            }
        );

        await handleSaveLog(request, [[action, transactionResult.ShopPartnerDebtDoc.currentData.get('id')], '']);
        for (let i = 0; i < transactionResult.ShopPartnerDebtLists.length; i++) {
            const element = transactionResult.ShopPartnerDebtLists[i];

            await handleSaveLog(request, [[action, element.currentData.get('id')], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopPartnerDebtDocAdd;