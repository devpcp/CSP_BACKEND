const _ = require("lodash");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelShopQuotationList = require("../models/model").ShopQuotationList;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {{}} options
 */
const handlerShopQuotationListDelete = async (request = {}, reply = {}, options = {}) => {
    const action = 'DELETE ShopQuotationList.Delete';

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

        const instanceModelShopQuotationList = modelShopQuotationList(table_name);

        const findShopQuotationListDocument = await instanceModelShopQuotationList.findOne({
            where: {
                id: request.params.id
            },
            transaction: request.transaction || null
        });

        if (findShopQuotationListDocument) {
            findShopQuotationListDocument.set({
                status: 0,
                updated_by: request.id,
                updated_date: currentDateTime
            });
            await findShopQuotationListDocument.save({ transaction: request.transaction || null });

            await handleSaveLog(request, [[action, request.params.id, findShopQuotationListDocument.previous()], '']);
        }

        return utilSetFastifyResponseJson('success', 'ok');
    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action, request.params.id], error]);

        throw Error(`Error with logId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopQuotationListDelete;