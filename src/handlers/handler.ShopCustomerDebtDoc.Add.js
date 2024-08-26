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
 * A handler to add new by id shopCustomerDebtDoc and shopCustomerDebtLists into database
 * - Route [PUT] => /api/shopCustomerDebtDoc/add
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopCustomerDebtDocAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST ShopCustomerDebtDoc.Add';

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
            ShopCustomerDebtDoc,
            ShopCustomerDebtList
        } = ShopModels;

        const reqShopCustomerDebtDoc = request?.body || {};
        const reqShopCustomerDebtLists = request?.body?.shopCustomerDebtLists || [];

        /**
         * @type {{ShopCustomerDebtDoc: {isCreated: boolean, isUpdated: boolean, currentData: ShopCustomerDebtDoc, previousData: null}; ShopCustomerDebtLists: {isCreated: boolean, isUpdated: boolean, previousData: null, currentData: ShopCustomerDebtList}[];}}
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

                const createdShopCustomerDebt = await ShopCustomerDebtDoc.createShopCustomerDebt_Doc_Lists(
                    table_shop_id,
                    request.id,
                    reqShopCustomerDebtDoc,
                    reqShopCustomerDebtLists,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                return createdShopCustomerDebt;
            }
        );

        await handleSaveLog(request, [[action, transactionResult.ShopCustomerDebtDoc.currentData.get('id')], '']);
        for (let i = 0; i < transactionResult.ShopCustomerDebtLists.length; i++) {
            const element = transactionResult.ShopCustomerDebtLists[i];

            await handleSaveLog(request, [[action, element.currentData.get('id')], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopCustomerDebtDocAdd;