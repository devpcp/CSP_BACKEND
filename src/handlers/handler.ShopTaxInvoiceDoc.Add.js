/**
 * @type {import("lodash")}
 */
const _ = require("lodash");
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
const handlerShopTaxInvoiceDocAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST ShopTaxInvoiceDoc.Add';

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

        const objRequestInvoiceType = {};
        if (!_.isBoolean(request.body?.is_abb) && _.isBoolean(request.body?.is_inv)) {
            throw new Error(`ต้องสร้างเอกสารใบกับกับภาษีอย่างน้อย 1 ชนิด`);
        }
        if (request.body?.is_abb === false && request.body?.is_inv === false) {
            throw new Error(`ต้องสร้างเอกสารใบกับกับภาษีอย่างน้อย 1 ชนิด`);
        }
        if (request.body.is_abb === true) {
            objRequestInvoiceType.is_abb = true;
            objRequestInvoiceType.abb_doc_date = currentDateTime;
        }
        if (request.body.is_inv === true) {
            objRequestInvoiceType.is_inv = true;
            objRequestInvoiceType.inv_doc_date = currentDateTime;
        }

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopServiceOrderDoc,
            ShopTaxInvoiceDoc,
            ShopTaxInvoiceList
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

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: request.body.shop_service_order_doc_id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels,
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาติให้สร้างเอกสารใบกำกับภาษีเนื่องจากเอกสารใบสั่งซ่อมได้ถูกยกเลิกหรือลบไปแล้ว`);
                }

                const findShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                    where: {
                        shop_service_order_doc_id: request.body.shop_service_order_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels,
                });
                if (findShopTaxInvoiceDoc) {
                    throw new Error(`ไม่อนุญาติให้สร้างเอกสารใบกำกับภาษีเนื่องจากมีเอกสารใบกำกับภาษีสร้างไว้ก่อนหน้านี้`)
                }

                const createdDocuments = await ShopTaxInvoiceDoc.createFromShopServiceOrderDoc(
                    request.body.shop_service_order_doc_id,
                    {
                        is_abb: request.body.is_abb || false,
                        is_inv: request.body.is_inv || false,
                        ...objRequestInvoiceType,
                        created_date: currentDateTime,
                        created_by: request.id,
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                await ShopTaxInvoiceList.mutationFields__ProportionDiscount(
                    createdDocuments.ShopTaxInvoiceDoc.get('id'),
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                return createdDocuments;
            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.ShopTaxInvoiceDoc], '']);
        for (let index = 0; index < transactionResult.ShopTaxInvoiceLists.length; index++) {
            const element = transactionResult.ShopTaxInvoiceLists[index];
            await handleSaveLog(request, [[action, request.params.id, request.body, element], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopTaxInvoiceDocAdd;