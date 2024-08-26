const _ = require("lodash");
const { Transaction, Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");
const modelShopPurchaseOrderDoc = require("../models/model").ShopPurchaseOrderDoc;
const modelShopPurchaseOrderList = require("../models/model").ShopPurchaseOrderList;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault || {}} options
 */
const handlerShopPurchaseOrderDocPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopPurchaseOrderDoc.Put';

    try {
        const currentDateTime = _.get(options, "currentDateTime", new Date());
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

        const instanceModelShopPurchaseOrderDoc = modelShopPurchaseOrderDoc(table_name);
        const instanceModelShopPurchaseOrderList = modelShopPurchaseOrderList(table_name);

        const findShopPurchaseOrderDocDocument = await instanceModelShopPurchaseOrderDoc.findOne({
            where: {
                id: request.params.id
            },
            transaction: request.transaction || null
        });

        if (!findShopPurchaseOrderDocDocument) {
            throw Error(`ShopPurchaseOrderDoc with is not found`);
        }

        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (t) => {
                if (!request.transaction) {
                    request.transaction = t;
                }

                const beforeUpdateShopPurchaseOrderDocDocument = await instanceModelShopPurchaseOrderDoc.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: t
                });

                const afterUpdateShopPurchaseOrderDocDocument = await instanceModelShopPurchaseOrderDoc.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: t
                });
                afterUpdateShopPurchaseOrderDocDocument.set({
                    ...request.body,
                    details: {
                        ...(beforeUpdateShopPurchaseOrderDocDocument.get('details') || {}),
                        ...(_.get(request.body, 'details', {}))
                    },
                    shopPurchaseOrderLists: undefined,
                    updated_by: request.id,
                    updated_date: currentDateTime
                });
                await afterUpdateShopPurchaseOrderDocDocument.save({ transaction: t, validate: true });
                await afterUpdateShopPurchaseOrderDocDocument.reload({ transaction: t });

                const beforeUpdateShopPurchaseOrderListDocuments = [];
                const afterUpdateShopPurchaseOrderListDocuments = [];
                const createShopPurchaseOrderListDocuments = [];
                const changedUpdatedShopPurchaseOrderListDocumentIds = [];
                if (_.isArray(request.body.shopPurchaseOrderLists)) {
                    for (let index = 0; index < request.body.shopPurchaseOrderLists.length; index++) {
                        const shopPurchaseOrderList = request.body.shopPurchaseOrderLists[index];
                        if (isUUID(shopPurchaseOrderList.id)) { // Update data ShopPurchaseOrderList
                            const preUpdateShopPurchaseOrderListDocument = await instanceModelShopPurchaseOrderList.findOne({
                                where: {
                                    id: shopPurchaseOrderList.id
                                },
                                transaction: t
                            });
                            if (!preUpdateShopPurchaseOrderListDocument) {
                                throw Error(`ShopPurchaseOrderList is not found with id: ${shopPurchaseOrderList.id}`);
                            }

                            const updatedDocument = await instanceModelShopPurchaseOrderList.findOne({
                                where: {
                                    id: shopPurchaseOrderList.id
                                },
                                transaction: t
                            });
                            updatedDocument.set({
                                ...shopPurchaseOrderList,
                                doc_purchase_order_id: findShopPurchaseOrderDocDocument.get('id'),
                                dot_mfd: !shopPurchaseOrderList.dot_mfd ? null : shopPurchaseOrderList.dot_mfd,
                                details: {
                                    ...(preUpdateShopPurchaseOrderListDocument.get('details') || {}),
                                    ...(_.get(shopPurchaseOrderList, 'details', {}))
                                },
                                updated_by: request.id,
                                updated_date: currentDateTime
                            });
                            await updatedDocument.save({ transaction: t, validate: true });

                            const postUpdateShopPurchaseOrderListDocument = await instanceModelShopPurchaseOrderList.findOne({
                                where: {
                                    id: shopPurchaseOrderList.id
                                },
                                transaction: t
                            });
                            beforeUpdateShopPurchaseOrderListDocuments.push(preUpdateShopPurchaseOrderListDocument);
                            afterUpdateShopPurchaseOrderListDocuments.push(postUpdateShopPurchaseOrderListDocument);
                            changedUpdatedShopPurchaseOrderListDocumentIds.push(postUpdateShopPurchaseOrderListDocument.get('id'));
                        }
                        else { // Create data ShopQuotationList
                            const createdShopQuotationListDocument = await instanceModelShopPurchaseOrderList.create(
                                {
                                    ...shopPurchaseOrderList,
                                    shop_id: findShopPurchaseOrderDocDocument.get('shop_id'),
                                    doc_purchase_order_id: findShopPurchaseOrderDocDocument.get('id'),
                                    dot_mfd: !shopPurchaseOrderList.dot_mfd ? null : shopPurchaseOrderList.dot_mfd,
                                    details: {
                                        ...(_.get(shopPurchaseOrderList, 'details', {}))
                                    },
                                    created_by: request.id,
                                    created_date: currentDateTime
                                },
                                {
                                    transaction: t,
                                    validate: true
                                }
                            );
                            createShopPurchaseOrderListDocuments.push(createdShopQuotationListDocument);
                            changedUpdatedShopPurchaseOrderListDocumentIds.push(createdShopQuotationListDocument.get('id'));
                        }
                    }
                    // removeTrashShopPurchaseOrderListDocuments
                    await instanceModelShopPurchaseOrderList.update(
                        {
                            status: 0
                        },
                        {
                            where: {
                                doc_purchase_order_id: findShopPurchaseOrderDocDocument.get('id'),
                                id: {
                                    [Op.notIn]: changedUpdatedShopPurchaseOrderListDocumentIds
                                }
                            }
                        }
                    );
                }

                await afterUpdateShopPurchaseOrderDocDocument.reload({ transaction: t });

                return {
                    beforeUpdateShopPurchaseOrderDocDocument,
                    afterUpdateShopPurchaseOrderDocDocument,
                    beforeUpdateShopPurchaseOrderListDocuments,
                    afterUpdateShopPurchaseOrderListDocuments,
                    createShopPurchaseOrderListDocuments
                };
            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.beforeUpdateShopPurchaseOrderDocDocument], '']);

        for (let i = 0; i < transactionResult.afterUpdateShopPurchaseOrderListDocuments.length; i++) {
            await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.afterUpdateShopPurchaseOrderListDocuments[i]], '']);
        }

        for (let i = 0; i < transactionResult.createShopPurchaseOrderListDocuments.length; i++) {
            await handleSaveLog(request, [[action + '.Add', request.params.id, request.body, transactionResult.createShopPurchaseOrderListDocuments[i]], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action, request.params.id, request.body], error]);
        console.log(error.stack)
        throw Error(`Error with logId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopPurchaseOrderDocPut;