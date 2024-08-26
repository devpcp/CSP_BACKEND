const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopServiceOrderDoc/Model.Schema.ShopServiceOrderDoc');
const handlerShopServiceOrderDocAdd = require('../handlers/handler.ShopServiceOrderDoc.Add');
const handlerShopServiceOrderDocAll = require('../handlers/handler.ShopServiceOrderDoc.All');
const handlerShopServiceOrderDocById = require('../handlers/handler.ShopServiceOrderDoc.ById');
const handleShopServiceOrderDocPut = require('../handlers/handler.ShopServiceOrderDoc.Put');
// const handlerShopQuotationDocDelete = require('../handlers/handler.ShopQuotationDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopQuotationDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopServiceOrderDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopServiceOrderDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopServiceOrderDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopServiceOrderDocPut
    });

    // app.route({
    //     method: 'DELETE',
    //     url: '/delete/:id',
    //     schema: del,
    //     preHandler: [verifyAccessToken, verifyAccessPermission],
    //     handler: handlerShopQuotationDocDelete
    // });
};


module.exports = shopQuotationDocRouters;