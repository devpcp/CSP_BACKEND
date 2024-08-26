const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopCustomerDebtBillingNoteDoc/Model.Schema.ShopCustomerDebtBillingNoteDoc');
const handlerShopCustomerDebtBillingNoteDocAdd = require('../handlers/handler.ShopCustomerDebtBillingNoteDoc.Add');
const handlerShopCustomerDebtBillingNoteDocAll = require('../handlers/handler.ShopCustomerDebtBillingNoteDoc.All');
const handlerShopCustomerDebtBillingNoteDocById = require('../handlers/handler.ShopCustomerDebtBillingNoteDoc.ById');
const handlerShopCustomerDebtBillingNoteDocPut = require('../handlers/handler.ShopCustomerDebtBillingNoteDoc.Put');
const handlerShopCustomerDebtBillingNoteDocDelete = require('../handlers/handler.ShopCustomerDebtBillingNoteDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopCustomerDebtBillingNoteDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtBillingNoteDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtBillingNoteDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtBillingNoteDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtBillingNoteDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtBillingNoteDocDelete
    });
};


module.exports = shopCustomerDebtBillingNoteDocRouters;