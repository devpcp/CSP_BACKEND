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
 * A handler to add new by id shopServiceOrder into database
 * - Route [PUT] => /api/shopServiceOrder/add
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopServiceOrderDocAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST ShopServiceOrderDoc.Add';

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
            ShopServiceOrderDoc,
            ShopServiceOrderList
        } = ShopModels;

        const reqShopServiceOrderDoc = request?.body || {};
        const reqShopServiceOrderLists = request?.body?.shopServiceOrderLists || [];

        /**
         * @type {{ShopServiceOrderDoc: ShopServiceOrderDoc, ShopServiceOrderLists: ShopServiceOrderList[]}}
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

                const createdShopServiceOrderDoc = await ShopServiceOrderDoc.create(
                    {
                        ...reqShopServiceOrderDoc,
                        is_draft: undefined, // ไม่อนุญาตให้ยืนยันการบันทึกร่างในการสร้างเอกสารใบสั่งซ่อม
                        created_by: request.id,
                        created_date: currentDateTime
                    },
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                /**
                 * @type {ShopServiceOrderList[]}
                 */
                const createdShopServiceOrderLists = [];
                for (let index = 0; index < reqShopServiceOrderLists.length; index++) {
                    const element = reqShopServiceOrderLists[index];
                    const createdShopServiceOrderList = await ShopServiceOrderList.create(
                        {
                            ...element,
                            shop_id: createdShopServiceOrderDoc.get('shop_id'),
                            shop_service_order_doc_id: createdShopServiceOrderDoc.get('id'),
                            created_by: request.id,
                            created_date: currentDateTime
                        },
                        {
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );
                    createdShopServiceOrderLists.push(createdShopServiceOrderList);
                }

                await ShopServiceOrderList.mutationFields__ProportionDiscount(
                    createdShopServiceOrderDoc.get('id'),
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                return {
                    ShopServiceOrderDoc: createdShopServiceOrderDoc,
                    ShopServiceOrderLists: createdShopServiceOrderLists
                };
            }
        );

        await handleSaveLog(request, [[action, transactionResult.ShopServiceOrderDoc.get('id')], '']);
        for (let i = 0; i < transactionResult.ShopServiceOrderLists.length; i++) {
            const element = transactionResult.ShopServiceOrderLists[i];
            await handleSaveLog(request, [[action, element.get('id')], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopServiceOrderDocAdd;