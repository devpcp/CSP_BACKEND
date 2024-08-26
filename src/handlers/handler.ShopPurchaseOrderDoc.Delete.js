const _ = require("lodash");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelShopPurchaseOrderDoc = require("../models/model").ShopPurchaseOrderDoc;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {{}} options
 */
const handlerShopPurchaseOrderDocDelete = async (request = {}, reply = {}, options = {}) => {
    const action = 'DELETE ShopPurchaseOrderDoc.Delete';

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

        const findShopPurchaseOrderDocDocument = await instanceModelShopPurchaseOrderDoc.findOne({
            where: {
                id: request.params.id
            },
            transaction: request.transaction || null
        });

        if (findShopPurchaseOrderDocDocument) {
            findShopPurchaseOrderDocDocument.set({
                status: 0,
                updated_by: request.id,
                updated_date: currentDateTime
            });
            await findShopPurchaseOrderDocDocument.save({ transaction: request.transaction || null });

            await handleSaveLog(request, [[action, request.params.id, findShopPurchaseOrderDocDocument.previous()], '']);
        }

        return utilSetFastifyResponseJson('success', 'ok');
    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action, request.params.id], error]);

        throw Error(`Error with logId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopPurchaseOrderDocDelete;