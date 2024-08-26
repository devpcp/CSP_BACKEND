const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    del
} = require('../models/ShopQuotationList/Model.Schema.ShopQuotationList');
const handlerShopQuotationListDelete = require('../handlers/handler.ShopQuotationList.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopQuotationDocRouters = async (app) => {
    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopQuotationListDelete
    });
};


module.exports = shopQuotationDocRouters;