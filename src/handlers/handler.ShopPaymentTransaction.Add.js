/**
 * @type {import("lodash")}
 */
const _ = require("lodash");
const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const db = require("../db");
const { initShopModel, ShopInventoryTransaction } = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T>|{}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault|{}} options
 */
const handlerShopPaymentTransactionAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST ShopPaymentTransaction.Add';

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
            ShopPaymentTransaction,
            ShopPartnerDebtDoc
        } = ShopModels;

        const transaction = request?.transaction || options?.transaction || null;

        /**
         * @type {ShopPaymentTransaction | ShopPaymentTransaction[]}
         */
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


                /**
                 * รหัสตารางข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย
                 * @type {string}
                 */
                const shop_service_order_doc_id = request.body.shop_service_order_doc_id;
                /**
                 * รหัสตารางข้อมูลเอกสารลูกหนี้การค้า
                 */
                const shop_customer_debt_doc_id = request.body.shop_customer_debt_doc_id;
                /**
                * รหัสตารางข้อมูลเอกสารเจ้าหนี้การค้า
                */
                const shop_inventory_transaction_id = request.body.shop_inventory_transaction_id
                /**
                * รหัสตารางข้อมูลเอกสารเจ้าหนี้การค้า
                */
                const shop_partner_debt_doc_id = request.body.shop_partner_debt_doc_id;

                if (!_.isArray(request.body?.shopPaymentTransactions)) {
                    // เอกสารใบสั่งซ่อม/ใบสั่งขาย
                    if (shop_service_order_doc_id) {
                        const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                            where: {
                                id: shop_service_order_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopServiceOrderDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย`);
                        }
                        if (findShopServiceOrderDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติให้สร้างการชำระเงินเนื่องจากเอกสารใบสั่งซ่อม/ใบสั่งขายได้ถูกยกเลิกหรือลบไปแล้ว`);
                        }

                        /**
                         * @type {{
                         *     shop_id: string;
                         *     shop_service_order_doc_id: string;
                         *     bank_name_list_id: string || null;
                         *     payment_method: 1 || 2 || 3;
                         *     payment_price_paid: number;
                         *     is_partial_payment: boolean;
                         *     created_date: Date;
                         *     created_by: string;
                         * }}
                         */
                        const objToCreate = {
                            shop_id: request.body.shop_id || findShopServiceOrderDoc.get('shop_id'),
                            shop_service_order_doc_id: shop_service_order_doc_id,
                            doc_date: request.body.doc_date || currentDateTime,
                            bank_name_list_id: request.body.bank_name_list_id || null,
                            payment_method: request.body.payment_method,
                            payment_price_paid: Number(request.body.payment_price_paid),
                            is_partial_payment: request.body.is_partial_payment || false,
                            payment_paid_date: request.body?.payment_paid_date || currentDateTime,
                            payment_payee_by: request.body?.payment_payee_by || request.id,
                            details: request.body?.details || {},
                            created_date: currentDateTime,
                            created_by: request.id
                        };

                        /**
                         * @type {ShopPaymentTransaction}
                         */
                        const createdDocument = await ShopPaymentTransaction.create(
                            objToCreate,
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );

                        return createdDocument;
                    }
                    // เอกสารลูกหนี้การค้า
                    else if (shop_customer_debt_doc_id) {
                        const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                            where: {
                                id: shop_customer_debt_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopCustomerDebtDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้`);
                        }
                        if (findShopCustomerDebtDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติให้สร้างการชำระเงินเนื่องจากเอกสารลูกหนี้การค้าได้ถูกยกเลิกหรือลบไปแล้ว`);
                        }

                        /**
                         * @type {{
                         *     shop_id: string;
                         *     shop_customer_debt_doc_id: string;
                         *     bank_name_list_id: string || null;
                         *     payment_method: 1 || 2 || 3;
                         *     payment_price_paid: number;
                         *     is_partial_payment: boolean;
                         *     created_date: Date;
                         *     created_by: string;
                         * }}
                         */
                        const objToCreate = {
                            shop_id: request.body.shop_id || findShopCustomerDebtDoc.get('shop_id'),
                            shop_customer_debt_doc_id: shop_customer_debt_doc_id,
                            doc_date: request.body.doc_date || currentDateTime,
                            bank_name_list_id: request.body.bank_name_list_id || null,
                            payment_method: request.body.payment_method,
                            payment_price_paid: Number(request.body.payment_price_paid),
                            is_partial_payment: request.body.is_partial_payment || false,
                            payment_paid_date: request.body?.payment_paid_date || currentDateTime,
                            payment_payee_by: request.body?.payment_payee_by || request.id,
                            details: request.body?.details || {},
                            created_date: currentDateTime,
                            created_by: request.id
                        };

                        /**
                         * @type {ShopPaymentTransaction}
                         */
                        const createdDocument = await ShopPaymentTransaction.create(
                            objToCreate,
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );

                        return createdDocument;
                    }
                    // เอกสารใบนำเข้า
                    else if (shop_inventory_transaction_id) {
                        const findShopInventoryTransaction = await ShopInventoryTransaction(table_name).findOne({
                            where: {
                                id: shop_inventory_transaction_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });

                        if (!findShopInventoryTransaction) {
                            throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า`);
                        }
                        if (findShopInventoryTransaction.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติให้สร้างการชำระเงินเนื่องจากเอกสารใบนำเข้าได้ถูกยกเลิกหรือลบไปแล้ว`);
                        }

                        /**
                         * @type {{
                         *     shop_id: string;
                         *     shop_inventory_transaction_id: string;
                         *     bank_name_list_id: null;
                         *     payment_method: 6;
                         *     payment_price_paid: number;
                         *     is_partial_payment: boolean;
                         *     created_date: Date;
                         *     created_by: string;
                         * }}
                         */
                        const objToCreate = {
                            shop_id: request.body.shop_id || findShopInventoryTransaction.get('shop_id'),
                            shop_inventory_transaction_id: shop_inventory_transaction_id,
                            doc_date: request.body.doc_date || currentDateTime,
                            bank_name_list_id: request.body.bank_name_list_id || null,
                            payment_method: request.body.payment_method || 6,
                            payment_price_paid: Number(request.body.payment_price_paid),
                            is_partial_payment: false,
                            payment_paid_date: request.body?.payment_paid_date || currentDateTime,
                            payment_payee_by: request.body?.payment_payee_by || request.id,
                            details: request.body?.details || {},
                            created_date: currentDateTime,
                            created_by: request.id
                        };

                        /**
                         * @type {ShopPaymentTransaction}
                         */
                        const createdDocument = await ShopPaymentTransaction.create(
                            objToCreate,
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );

                        return createdDocument;
                    }
                    //เอกสารเจ้าหนี้การค้า
                    else if (shop_partner_debt_doc_id) {
                        const findShopPartnerDebtDoc = await ShopPartnerDebtDoc.findOne({
                            where: {
                                id: shop_partner_debt_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopPartnerDebtDoc) {
                            throw new Error(`ไม่พบข้อมูลเอกสารเจ้าหนี้`);
                        }
                        if (findShopPartnerDebtDoc.get('status') !== 1) {
                            throw new Error(`ไม่อนุญาติให้สร้างการชำระเงินเนื่องจากเอกสารเจ้าหนี้การค้าได้ถูกยกเลิกหรือลบไปแล้ว`);
                        }

                        /**
                         * @type {{
                         *     shop_id: string;
                         *     shop_partner_debt_doc_id: string;
                         *     bank_name_list_id: string || null;
                         *     payment_method: 1 || 2 || 3;
                         *     payment_price_paid: number;
                         *     is_partial_payment: boolean;
                         *     created_date: Date;
                         *     created_by: string;
                         * }}
                         */
                        const objToCreate = {
                            shop_id: request.body.shop_id || findShopPartnerDebtDoc.get('shop_id'),
                            shop_partner_debt_doc_id: shop_partner_debt_doc_id,
                            doc_date: request.body.doc_date || currentDateTime,
                            bank_name_list_id: request.body.bank_name_list_id || null,
                            payment_method: request.body.payment_method,
                            payment_price_paid: Number(request.body.payment_price_paid),
                            is_partial_payment: request.body.is_partial_payment || false,
                            payment_paid_date: request.body?.payment_paid_date || currentDateTime,
                            payment_payee_by: request.body?.payment_payee_by || request.id,
                            details: request.body?.details || {},
                            created_date: currentDateTime,
                            created_by: request.id
                        };

                        /**
                         * @type {ShopPaymentTransaction}
                         */
                        const createdDocument = await ShopPaymentTransaction.create(
                            objToCreate,
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );

                        return createdDocument;
                    }
                }
                else { // สำหรับ Partial Payment
                    /**
                     * @type {ShopPaymentTransaction[]}
                     */
                    const arrCreatedDocuments = [];
                    for (let index = 0; index < request.body.shopPaymentTransactions.length; index++) {
                        const element = request.body.shopPaymentTransactions[index];

                        if (shop_service_order_doc_id) {
                            const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                                where: {
                                    id: shop_service_order_doc_id
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (!findShopServiceOrderDoc) {
                                throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                            }
                            if (findShopServiceOrderDoc.get('status') !== 1) {
                                throw new Error(`ไม่อนุญาติให้สร้างการชำระเงินเนื่องจากเอกสารใบสั่งซ่อมได้ถูกยกเลิกหรือลบไปแล้ว`);
                            }

                            /**
                             * @type {{
                             *     shop_id: string;
                             *     shop_service_order_doc_id: string;
                             *     bank_name_list_id: string || null;
                             *     payment_method: 1 || 2 || 3;
                             *     payment_price_paid: number;
                             *     is_partial_payment: boolean;
                             *     created_date: Date;
                             *     created_by: string;
                             * }}
                             */
                            const objToCreate = {
                                shop_id: element.shop_id || findShopServiceOrderDoc.get('shop_id'),
                                shop_service_order_doc_id: shop_service_order_doc_id,
                                doc_date: element.doc_date || currentDateTime,
                                bank_name_list_id: element.bank_name_list_id || null,
                                payment_method: element.payment_method,
                                payment_price_paid: Number(element.payment_price_paid),
                                is_partial_payment: true,
                                payment_paid_date: element?.payment_paid_date || currentDateTime,
                                payment_payee_by: element?.payment_payee_by || request.id,
                                details: element?.details || {},
                                created_date: currentDateTime,
                                created_by: request.id
                            };

                            const createdDocument = await ShopPaymentTransaction.create(
                                objToCreate,
                                {
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                }
                            );

                            arrCreatedDocuments.push(createdDocument);
                        }

                        if (shop_customer_debt_doc_id) {
                            const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                                where: {
                                    id: shop_customer_debt_doc_id
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (!findShopCustomerDebtDoc) {
                                throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้การค้า`);
                            }
                            if (findShopCustomerDebtDoc.get('status') !== 1) {
                                throw new Error(`ไม่อนุญาติให้สร้างการชำระเงินเนื่องจากเอกสารลูกหนี้การค้าได้ถูกยกเลิกหรือลบไปแล้ว`);
                            }

                            /**
                             * @type {{
                             *     shop_id: string;
                             *     shop_customer_debt_doc_id: string;
                             *     bank_name_list_id: string || null;
                             *     payment_method: 1 || 2 || 3;
                             *     payment_price_paid: number;
                             *     is_partial_payment: boolean;
                             *     created_date: Date;
                             *     created_by: string;
                             * }}
                             */
                            const objToCreate = {
                                shop_id: element.shop_id || findShopCustomerDebtDoc.get('shop_id'),
                                shop_customer_debt_doc_id: shop_customer_debt_doc_id,
                                doc_date: element.doc_date || currentDateTime,
                                bank_name_list_id: element.bank_name_list_id || null,
                                payment_method: element.payment_method,
                                payment_price_paid: Number(element.payment_price_paid),
                                is_partial_payment: true,
                                payment_paid_date: element?.payment_paid_date || currentDateTime,
                                payment_payee_by: element?.payment_payee_by || request.id,
                                details: element?.details || {},
                                created_date: currentDateTime,
                                created_by: request.id
                            };

                            const createdDocument = await ShopPaymentTransaction.create(
                                objToCreate,
                                {
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                }
                            );

                            arrCreatedDocuments.push(createdDocument);
                        }
                    }

                    return arrCreatedDocuments;
                }

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


module.exports = handlerShopPaymentTransactionAdd;