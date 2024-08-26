const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopPartnerDebtBillingNoteDoc/Model.Schema.ShopPartnerDebtBillingNoteDoc');
const handlerShopPartnerDebtBillingNoteDocAdd = require('../handlers/handler.ShopPartnerDebtBillingNoteDoc.Add');
const handlerShopPartnerDebtBillingNoteDocAll = require('../handlers/handler.ShopPartnerDebtBillingNoteDoc.All');
const handlerShopPartnerDebtBillingNoteDocById = require('../handlers/handler.ShopPartnerDebtBillingNoteDoc.ById');
const handlerShopPartnerDebtBillingNoteDocPut = require('../handlers/handler.ShopPartnerDebtBillingNoteDoc.Put');
const handlerShopPartnerDebtBillingNoteDocDelete = require('../handlers/handler.ShopPartnerDebtBillingNoteDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopPartnerDebtBillingNoteDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtBillingNoteDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtBillingNoteDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtBillingNoteDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtBillingNoteDocPut
    });

    app.route({
        method: 'DELETE',
        url: '/delete/:id',
        schema: del,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtBillingNoteDocDelete
    });
};


module.exports = shopPartnerDebtBillingNoteDocRouters;