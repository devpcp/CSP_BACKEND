const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopPurchaseOrderDoc/Model.Schema.ShopPurchaseOrderDoc');
const handlerShopPurchaseOrderDocAdd = require('../handlers/handler.ShopPurchaseOrderDoc.Add');
const handlerShopPurchaseOrderDocAll = require('../handlers/handler.ShopPurchaseOrderDoc.All');
const handlerShopPurchaseOrderDocById = require('../handlers/handler.ShopPurchaseOrderDoc.ById');
const handlerShopPurchaseOrderDocPut = require('../handlers/handler.ShopPurchaseOrderDoc.Put');
const handlerShopPurchaseOrderDocDelete = require('../handlers/handler.ShopPurchaseOrderDoc.Delete');

/**
 * Route => /api/shopPurchaseOrderDoc
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopPurchaseOrderDocRouters = async (app) => {
    // Route [POST] => /api/shopPurchaseOrderDoc/add
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPurchaseOrderDocAdd
    });

    // Route [GET] => /api/shopPurchaseOrderDoc/all
    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPurchaseOrderDocAll
    });

    // Route [GET] => /api/shopPurchaseOrderDoc/byId/:id
    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPurchaseOrderDocById
    });

    // Route [PUT] => /api/shopPurchaseOrderDoc/put/:id
    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPurchaseOrderDocPut
    });

    // Route [DELETE] => /api/shopPurchaseOrderDoc/delete/:id
    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPurchaseOrderDocDelete
    });
};


module.exports = shopPurchaseOrderDocRouters;