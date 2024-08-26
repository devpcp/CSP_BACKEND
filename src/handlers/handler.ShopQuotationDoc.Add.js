const _ = require("lodash");

const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
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
const handlerShopQuotationDocAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST ShopQuotationDoc.Add';

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
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


        const transactionResult = await db.transaction(
            {
                transaction: options.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (t) => {
                if (!request.transaction) {
                    request.transaction = t;
                }

                const instanceModelShopQuotationDoc = modelShopQuotationDoc(table_name);
                const createShopQuotationDocDocument = await instanceModelShopQuotationDoc.create(
                    {
                        ...request.body,
                        created_by: request.id,
                        created_date: currentDateTime
                    },
                    {
                        transaction: t,
                        validate: true
                    }
                );

                const instanceModelShopQuotationList = modelShopQuotationList(table_name);
                const createShopQuotationListDocuments = await instanceModelShopQuotationList.bulkCreate(
                    request.body.shopQuotationLists.map(w => {
                        return {
                            ...w,
                            dot_mfd: !w.dot_mfd ? null : w.dot_mfd,
                            shop_id: request.body.shop_id,
                            doc_quotation_id: createShopQuotationDocDocument.get('id'),
                            created_by: request.id,
                            created_date: currentDateTime
                        }
                    }),
                    {
                        transaction: t,
                        validate: true
                    }
                );

                return {
                    ShopQuotationDoc: createShopQuotationDocDocument,
                    ShopQuotationLists: createShopQuotationListDocuments
                };
            }
        );

        await handleSaveLog(request, [[action, transactionResult.ShopQuotationDoc.id], '']);
        for (let i = 0; i < transactionResult.ShopQuotationLists.length; i++) {
            const element = transactionResult.ShopQuotationLists[i];
            await handleSaveLog(request, [[action, element.id], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);

    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopQuotationDocAdd;