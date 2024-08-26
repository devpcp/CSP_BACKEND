const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopCustomerDebtDebitNoteDoc/Model.Schema.ShopCustomerDebtDebitNoteDoc');
const handlerShopCustomerDebtDebitNoteDocAdd = require('../handlers/handler.ShopCustomerDebtDebitNoteDoc.Add');
const handlerShopCustomerDebtDebitNoteDocAll = require('../handlers/handler.ShopCustomerDebtDebitNoteDoc.All');
const handlerShopCustomerDebtDebitNoteDocById = require('../handlers/handler.ShopCustomerDebtDebitNoteDoc.ById');
const handlerShopCustomerDebtDebitNoteDocPut = require('../handlers/handler.ShopCustomerDebtDebitNoteDoc.Put');
const handlerShopCustomerDebtDebitNoteDocDelete = require('../handlers/handler.ShopCustomerDebtDebitNoteDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopCustomerDebtDebitNoteDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDebitNoteDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDebitNoteDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDebitNoteDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDebitNoteDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopCustomerDebtDebitNoteDocDelete
    });
};


module.exports = shopCustomerDebtDebitNoteDocRouters;