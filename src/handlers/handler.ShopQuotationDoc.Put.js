const _ = require("lodash");
const { Transaction, Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");
const modelShopQuotationDoc = require("../models/model").ShopQuotationDoc;
const modelShopQuotationList = require("../models/model").ShopQuotationList;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {{}} options
 */
const handlerShopQuotationDocPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopQuotationDoc.Put';

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

        const instanceModelShopQuotationDoc = modelShopQuotationDoc(table_name);
        const instanceModelShopQuotationList = modelShopQuotationList(table_name);

        const findShopQuotationDocDocument = await instanceModelShopQuotationDoc.findOne({
            where: {
                id: request.params.id
            },
            transaction: request.transaction || null
        });

        if (!findShopQuotationDocDocument) {
            throw Error(`ShopQuotationDoc with is not found`);
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

                const beforeUpdateShopQuotationDocDocument = await instanceModelShopQuotationDoc.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: t
                });

                const afterUpdateShopQuotationDocDocument = await instanceModelShopQuotationDoc.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: t
                });
                afterUpdateShopQuotationDocDocument.set({
                    ...request.body,
                    details: {
                        ...(beforeUpdateShopQuotationDocDocument.get('details') || {}),
                        ...(_.get(request.body, 'details', {}))
                    },
                    shopQuotationLists: undefined,
                    updated_by: request.id,
                    updated_date: currentDateTime
                });
                await afterUpdateShopQuotationDocDocument.save({ transaction: t, validate: true });
                await afterUpdateShopQuotationDocDocument.reload({ transaction: t });

                const beforeUpdateShopQuotationListDocuments = [];
                const afterUpdateShopQuotationListDocuments = [];
                const createShopQuotationListDocuments = [];
                const changedUpdatedShopQuotationListDocumentIds = [];
                for (let index = 0; index < request.body.shopQuotationLists.length; index++) {
                    const shopQuotationList = request.body.shopQuotationLists[index];
                    if (isUUID(shopQuotationList.id)) { // Update data ShopQuotationList
                        const preUpdateShopQuotationListDocument = await instanceModelShopQuotationList.findOne({
                            where: {
                                id: shopQuotationList.id
                            },
                            transaction: t
                        });
                        await instanceModelShopQuotationList.update(
                            {
                                ...shopQuotationList,
                                dot_mfd: !shopQuotationList.dot_mfd ? null : shopQuotationList.dot_mfd,
                                details: {
                                    ...(preUpdateShopQuotationListDocument.get('details') || {}),
                                    ...(_.get(shopQuotationList, 'details', {}))
                                },
                                updated_by: request.id,
                                updated_date: currentDateTime
                            },
                            {
                                where: {
                                    id: shopQuotationList.id
                                },
                                transaction: t
                            }
                        );
                        const postUpdateShopQuotationListDocument = await instanceModelShopQuotationList.findOne({
                            where: {
                                id: shopQuotationList.id
                            },
                            transaction: t
                        });
                        beforeUpdateShopQuotationListDocuments.push(preUpdateShopQuotationListDocument);
                        afterUpdateShopQuotationListDocuments.push(postUpdateShopQuotationListDocument);
                        changedUpdatedShopQuotationListDocumentIds.push(postUpdateShopQuotationListDocument.get('id'))
                    }
                    else { // Create data ShopQuotationList
                        const createdShopQuotationListDocument = await instanceModelShopQuotationList.create(
                            {
                                ...shopQuotationList,
                                shop_id: findShopQuotationDocDocument.get('shop_id'),
                                doc_quotation_id: findShopQuotationDocDocument.get('id'),
                                dot_mfd: !shopQuotationList.dot_mfd ? null : shopQuotationList.dot_mfd,
                                details: {
                                    ...(_.get(shopQuotationList, 'details', {}))
                                },
                                created_by: request.id,
                                created_date: currentDateTime
                            },
                            {
                                transaction: t,
                                validate: true
                            }
                        );
                        createShopQuotationListDocuments.push(createdShopQuotationListDocument);
                        changedUpdatedShopQuotationListDocumentIds.push(createdShopQuotationListDocument.get('id'))
                    }
                }

                // removeTrashShopQuotationListDocuments
                await instanceModelShopQuotationList.update(
                    {
                        status: 0
                    },
                    {
                        where: {
                            doc_quotation_id: findShopQuotationDocDocument.get('id'),
                            id: {
                                [Op.notIn]: changedUpdatedShopQuotationListDocumentIds
                            }
                        },
                        transaction: t
                    }
                );

                await afterUpdateShopQuotationDocDocument.reload({ transaction: t });

                return {
                    beforeUpdateShopQuotationDocDocument,
                    afterUpdateShopQuotationDocDocument,
                    beforeUpdateShopQuotationListDocuments,
                    afterUpdateShopQuotationListDocuments,
                    createShopQuotationListDocuments
                };
            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.beforeUpdateShopQuotationDocDocument], '']);
        for (let i = 0; i < transactionResult.afterUpdateShopQuotationListDocuments.length; i++) {
            await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.beforeUpdateShopQuotationListDocuments[i]], '']);
        }
        for (let i = 0; i < transactionResult.createShopQuotationListDocuments.length; i++) {
            await handleSaveLog(request, [[action + '.Add', request.params.id, request.body, transactionResult.createShopQuotationListDocuments[i]], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action, request.params.id, request.body], error]);
        console.log(error)
        throw Error(`Error with logId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopQuotationDocPut;