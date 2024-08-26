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
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopTemporaryDeliveryOrderDocAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST ShopTemporaryDeliveryOrderDoc.Add';

    try {
        const currentDateTime = options?.currentDateTime || new Date();
        options.currentDateTime = currentDateTime;

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
            ShopTemporaryDeliveryOrderDoc,
            ShopTemporaryDeliveryOrderList,
            ShopServiceOrderDoc
        } = ShopModels;

        const transaction = request?.transaction || options?.transaction || null;

        const transactionResult = await db.transaction(
            {
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
                transaction: transaction
            },
            async (transaction) => {
                if (!request.transaction || !options?.transaction) {
                    request.transaction = transaction;
                    options.transaction = transaction;
                }

                const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                    where: {
                        shop_service_order_doc_id: request.body.shop_service_order_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (findShopTemporaryDeliveryOrderDoc) {
                    throw new Error(`ไม่อนุญาตให้สร้างใบส่งสินค้าชั่วคราว เนื่องจากมีใบส่งสินค้าชั่วคราวเปิดใช้งานอยู่`);
                }

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: request.body.shop_service_order_doc_id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาตให้สร้างใบส่งสินค้าชั่วคราว เนื่องจากใบสั่งซ่อมถูกยกเลิกหรือลบไปแล้ว`);
                }

                const createdShopTemporaryDeliveryOrder = await ShopTemporaryDeliveryOrderDoc.createShopTemporaryDeliveryOrderDocAndLists(
                    findShopServiceOrderDoc.get('id'),
                    {
                        created_by: request.id,
                        created_date: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                await ShopTemporaryDeliveryOrderList.mutationFields__ProportionDiscount(
                    createdShopTemporaryDeliveryOrder.ShopTemporaryDeliveryOrderDoc.get('id'),
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                return {
                    ShopTemporaryDeliveryOrderDoc: createdShopTemporaryDeliveryOrder.ShopTemporaryDeliveryOrderDoc,
                    ShopTemporaryDeliveryOrderLists: createdShopTemporaryDeliveryOrder.ShopTemporaryDeliveryOrderLists
                };
            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.ShopTemporaryDeliveryOrderDoc], '']);
        for (let index = 0; index < transactionResult.ShopTemporaryDeliveryOrderLists.length; index++) {
            const element = transactionResult.ShopTemporaryDeliveryOrderLists[index];
            await handleSaveLog(request, [[action, request.params.id, request.body, element], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopTemporaryDeliveryOrderDocAdd;