const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopCustomerDebtCreditNoteDocT2/Model.Schema.ShopCustomerDebtCreditNoteDocT2');
const handlerShopCustomerDebtCreditNoteDocAdd = require('../handlers/handler.ShopCustomerDebtCreditNoteDocT2.Add');
const handlerShopCustomerDebtCreditNoteDocAll = require('../handlers/handler.ShopCustomerDebtCreditNoteDocT2.All');
const handlerShopCustomerDebtCreditNoteDocById = require('../handlers/handler.ShopCustomerDebtCreditNoteDocT2.ById');
const handlerShopCustomerDebtCreditNoteDocPut = require('../handlers/handler.ShopCustomerDebtCreditNoteDocT2.Put');
const handlerShopCustomerDebtCreditNoteDocDelete = require('../handlers/handler.ShopCustomerDebtCreditNoteDocT2.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopCustomerDebtCreditNoteDocT2Routers = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtCreditNoteDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtCreditNoteDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtCreditNoteDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtCreditNoteDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtCreditNoteDocDelete
    });
};


module.exports = shopCustomerDebtCreditNoteDocT2Routers;