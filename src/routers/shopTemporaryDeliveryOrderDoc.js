const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopTemporaryDeliveryOrderDoc/Model.Schema.ShopTemporaryDeliveryOrderDoc');
const handlerShopTemporaryDeliveryOrderDocAdd = require('../handlers/handler.ShopTemporaryDeliveryOrderDoc.Add');
const handlerShopTemporaryDeliveryOrderDocAll = require('../handlers/handler.ShopTemporaryDeliveryOrderDoc.All');
const handlerShopTemporaryDeliveryOrderDocById = require('../handlers/handler.ShopTemporaryDeliveryOrderDoc.ById');
const handlerShopTemporaryDeliveryOrderDocPut = require('../handlers/handler.ShopTemporaryDeliveryOrderDoc.Put');
// const handlerShopQuotationDocDelete = require('../handlers/handler.ShopQuotationDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopTemporaryDeliveryOrderDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopTemporaryDeliveryOrderDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopTemporaryDeliveryOrderDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopTemporaryDeliveryOrderDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopTemporaryDeliveryOrderDocPut
    });

    // app.route({
    //     method: 'DELETE',
    //     url: '/delete/:id',
    //     schema: del,
    //     preHandler: [verifyAccessToken, verifyAccessPermission],
    //     handler: handlerShopQuotationDocDelete
    // });
};


module.exports = shopTemporaryDeliveryOrderDocRouters;