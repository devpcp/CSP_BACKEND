const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del
} = require('../models/ShopTaxInvoiceDoc/Model.Schema.ShopTaxInvoiceDoc');
const handlerShopTaxInvoiceDocAdd = require('../handlers/handler.ShopTaxInvoiceDoc.Add');
const handlerShopTaxInvoiceDocAll = require('../handlers/handler.ShopTaxInvoiceDoc.All');
const handlerShopTaxInvoiceDocById = require('../handlers/handler.ShopTaxInvoiceDoc.ById');
const handlerShopTaxInvoiceDocPut = require('../handlers/handler.ShopTaxInvoiceDoc.Put');
// const handlerShopQuotationDocDelete = require('../handlers/handler.ShopQuotationDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopTaxInvoiceDocRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopTaxInvoiceDocAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopTaxInvoiceDocAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopTaxInvoiceDocById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopTaxInvoiceDocPut
    });

    // app.route({
    //     method: 'DELETE',
    //     url: '/delete/:id',
    //     schema: del,
    //     preHandler: [verifyAccessToken, verifyAccessPermission],
    //     handler: handlerShopQuotationDocDelete
    // });
};


module.exports = shopTaxInvoiceDocRouters;