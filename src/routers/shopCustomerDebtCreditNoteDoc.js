const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopCustomerDebtCreditNoteDoc/Model.Schema.ShopCustomerDebtCreditNoteDoc');
const handlerShopCustomerDebtCreditNoteDocAdd = require('../handlers/handler.ShopCustomerDebtCreditNoteDoc.Add');
const handlerShopCustomerDebtCreditNoteDocAll = require('../handlers/handler.ShopCustomerDebtCreditNoteDoc.All');
const handlerShopCustomerDebtCreditNoteDocById = require('../handlers/handler.ShopCustomerDebtCreditNoteDoc.ById');
const handlerShopCustomerDebtCreditNoteDocPut = require('../handlers/handler.ShopCustomerDebtCreditNoteDoc.Put');
const handlerShopCustomerDebtCreditNoteDocDelete = require('../handlers/handler.ShopCustomerDebtCreditNoteDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopCustomerDebtCreditNoteDocRouters = async (app) => {
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


module.exports = shopCustomerDebtCreditNoteDocRouters;