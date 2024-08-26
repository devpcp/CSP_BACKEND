/**
 * @type {import("lodash")}
 */
const _ = require("lodash");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const db = require("../db");
const { Transaction } = require("sequelize");
const { isUUID } = require("../utils/generate");
const { initShopModel } = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopPaymentTransactionPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopPaymentTransaction.Put';

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
            ShopServiceOrderDoc,
            ShopCustomerDebtDoc,
            ShopPaymentTransaction
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

                const findShopPaymentTransaction = await ShopPaymentTransaction.findOne({
                    where: {
                        id: request.params.id,
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopPaymentTransaction) {
                    throw new Error(`ไม่พบข้อมูลการชำระเงิน`);
                }
                if (findShopPaymentTransaction.get('canceled_payment_date')) {
                    throw new Error(`ไม่อนุญาตแก้ไขการชำระเงินที่ยกเลิกชำระไปแล้ว`)
                }

                if (findShopPaymentTransaction.get('shop_service_order_doc_id')) {
                    const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                        where: {
                            id: findShopPaymentTransaction.get('shop_service_order_doc_id')
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopServiceOrderDoc) {
                        throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย`)
                    }
                    if (findShopServiceOrderDoc.get('status') !== 1) {
                        throw new Error(`ไม่อนุญาตให้แก้ไขรายการชำระเงินเนื่อจากเอกสารใบสั่งซ่อม/ใบสั่งขายได้ถูกยกเลิกหรือลบไปแล้ว`)
                    }
                }

                if (findShopPaymentTransaction.get('shop_customer_debt_doc_id')) {
                    const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                        where: {
                            id: findShopPaymentTransaction.get('shop_customer_debt_doc_id')
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopCustomerDebtDoc) {
                        throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้การค้า`)
                    }
                    if (findShopCustomerDebtDoc.get('status') !== 1) {
                        throw new Error(`ไม่อนุญาตให้แก้ไขรายการชำระเงินเนื่อจากเอกสารลูกหนี้การค้าได้ถูกยกเลิกหรือลบไปแล้ว`)
                    }
                }

                const previousDataValues = findShopPaymentTransaction.toJSON();

                let isDocumentChanged = false;
                const objToUpdate = {};

                const doc_date = request.body.doc_date;
                if (doc_date && _.isString(doc_date)) {
                    isDocumentChanged = true;
                    objToUpdate.doc_date = doc_date;
                }

                const canceled_payment_by = request.body.canceled_payment_by || request.id;
                const canceled_payment_date = request.body.canceled_payment_date || currentDateTime;
                if (isUUID(canceled_payment_by)) { // สำหรับยกเลิกการชำระเงิน
                    isDocumentChanged = true;
                    objToUpdate.canceled_payment_by = canceled_payment_by;
                    objToUpdate.canceled_payment_date = canceled_payment_date;
                }

                const details = request.body.details || {};
                if (_.keys(details).length > 0) {
                    isDocumentChanged = true;
                    objToUpdate.details = {
                        ...(findShopPaymentTransaction.get('details') || {}),
                        ...details,
                        meta_data: {
                            ...(findShopPaymentTransaction.get('details')?.meta_data || {})
                        }
                    };
                }

                if (isDocumentChanged) {
                    objToUpdate.updated_by = request.id;
                    objToUpdate.updated_date = currentDateTime;
                    findShopPaymentTransaction.set(objToUpdate);
                    await findShopPaymentTransaction.save({ transaction: transaction, ShopModels: ShopModels });
                }

                return {
                    previous: previousDataValues,
                    current: await findShopPaymentTransaction.reload({ transaction: transaction, ShopModels: ShopModels }),
                    changed: isDocumentChanged
                };
            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult], '']);

        return utilSetFastifyResponseJson('success', transactionResult);
    }
    catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopPaymentTransactionPut;