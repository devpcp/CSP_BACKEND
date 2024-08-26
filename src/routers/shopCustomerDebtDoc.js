const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopCustomerDebtDoc/Model.Schema.ShopCustomerDebtDoc');
const handlerShopCustomerDebtDocAdd = require('../handlers/handler.ShopCustomerDebtDoc.Add');
const handlerShopCustomerDebtDocAll = require('../handlers/handler.ShopCustomerDebtDoc.All');
const handlerShopCustomerDebtDocById = require('../handlers/handler.ShopCustomerDebtDoc.ById');
const handlerShopCustomerDebtDocPut = require('../handlers/handler.ShopCustomerDebtDoc.Put');
const handlerShopCustomerDebtDocDelete = require('../handlers/handler.ShopCustomerDebtDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopCustomerDebtDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDocDelete
    });
};


module.exports = shopCustomerDebtDocRouters;