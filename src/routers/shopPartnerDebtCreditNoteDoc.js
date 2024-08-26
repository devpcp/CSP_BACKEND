const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopPartnerDebtCreditNoteDoc/Model.Schema.ShopPartnerDebtCreditNoteDoc');
const handlerShopPartnerDebtCreditNoteDocAdd = require('../handlers/handler.ShopPartnerDebtCreditNoteDoc.Add');
const handlerShopPartnerDebtCreditNoteDocAll = require('../handlers/handler.ShopPartnerDebtCreditNoteDoc.All');
const handlerShopPartnerDebtCreditNoteDocById = require('../handlers/handler.ShopPartnerDebtCreditNoteDoc.ById');
const handlerShopPartnerDebtCreditNoteDocPut = require('../handlers/handler.ShopPartnerDebtCreditNoteDoc.Put');
const handlerShopPartnerDebtCreditNoteDocDelete = require('../handlers/handler.ShopPartnerDebtCreditNoteDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopPartnerDebtCreditNoteDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtCreditNoteDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtCreditNoteDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtCreditNoteDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtCreditNoteDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtCreditNoteDocDelete
    });
};


module.exports = shopPartnerDebtCreditNoteDocRouters;