const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopPartnerDebtDoc/Model.Schema.ShopPartnerDebtDoc');
const handlerShopPartnerDebtDocAdd = require('../handlers/handler.ShopPartnerDebtDoc.Add');
const handlerShopPartnerDebtDocAll = require('../handlers/handler.ShopPartnerDebtDoc.All');
const handlerShopPartnerDebtDocById = require('../handlers/handler.ShopPartnerDebtDoc.ById');
const handlerShopPartnerDebtDocPut = require('../handlers/handler.ShopPartnerDebtDoc.Put');
const handlerShopPartnerDebtDocDelete = require('../handlers/handler.ShopPartnerDebtDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopPartnerDebtDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDocDelete
    });
};


module.exports = shopPartnerDebtDocRouters;