const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopPartnerDebtDebitNoteDoc/Model.Schema.ShopPartnerDebtDebitNoteDoc');
const handlerShopPartnerDebtDebitNoteDocAdd = require('../handlers/handler.ShopPartnerDebtDebitNoteDoc.Add');
const handlerShopPartnerDebtDebitNoteDocAll = require('../handlers/handler.ShopPartnerDebtDebitNoteDoc.All');
const handlerShopPartnerDebtDebitNoteDocById = require('../handlers/handler.ShopPartnerDebtDebitNoteDoc.ById');
const handlerShopPartnerDebtDebitNoteDocPut = require('../handlers/handler.ShopPartnerDebtDebitNoteDoc.Put');
const handlerShopPartnerDebtDebitNoteDocDelete = require('../handlers/handler.ShopPartnerDebtDebitNoteDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopPartnerDebtDebitNoteDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDebitNoteDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDebitNoteDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDebitNoteDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDebitNoteDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDebitNoteDocDelete
    });
};


module.exports = shopPartnerDebtDebitNoteDocRouters;