const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    del
} = require('../models/ShopPurchaseOrderList/Model.Schema.ShopPurchaseOrderList');
const handlerShopPurchaseOrderListDelete = require('../handlers/handler.ShopPurchaseOrderList.Delete');

/**
 * Route => /api/shopPurchaseOrderDoc
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopPurchaseOrderListRouters = async (app) => {
    // Route [DELETE] => /api/shopPurchaseOrderList/delete/:id
    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPurchaseOrderListDelete
    });
};


module.exports = shopPurchaseOrderListRouters;