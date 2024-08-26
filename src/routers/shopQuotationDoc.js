const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopQuotationDoc/Model.Schema.ShopQuotationDoc');
const handlerShopQuotationDocAdd = require('../handlers/handler.ShopQuotationDoc.Add');
const handlerShopQuotationDocAll = require('../handlers/handler.ShopQuotationDoc.All');
const handlerShopQuotationDocById = require('../handlers/handler.ShopQuotationDoc.ById');
const handlerShopQuotationDocPut = require('../handlers/handler.ShopQuotationDoc.Put');
const handlerShopQuotationDocDelete = require('../handlers/handler.ShopQuotationDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopQuotationDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopQuotationDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopQuotationDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopQuotationDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopQuotationDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopQuotationDocDelete
    });
};


module.exports = shopQuotationDocRouters;