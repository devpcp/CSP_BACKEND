const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    add,
    all,
    byId,
    put,
    del,
    addPartialPayments
} = require('../models/ShopPaymentTransaction/Model.Schema.ShopPaymentTransaction');
const handlerShopPaymentTransactionAdd = require('../handlers/handler.ShopPaymentTransaction.Add');
const handlerShopPaymentTransactionAll = require('../handlers/handler.ShopPaymentTransaction.All');
const handlerShopPaymentTransactionById = require('../handlers/handler.ShopPaymentTransaction.ById');
const handleShopPaymentTransactionPut = require('../handlers/handler.ShopPaymentTransaction.Put');
// const handlerShopQuotationDocDelete = require('../handlers/handler.ShopQuotationDoc.Delete');

/**
 * @param {import("fastify").fastify.FastifyInstance} app
 */
const shopPaymentTransactionRouters = async (app) => {
    app.route({
        method: 'POST',
        url: '/add',
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPaymentTransactionAdd
    });

    app.route({
        method: 'POST',
        url: '/addPartialPayments',
        schema: addPartialPayments,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPaymentTransactionAdd
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPaymentTransactionAll
    });

    app.route({
        method: 'GET',
        url: '/byId/:id',
        schema: byId,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPaymentTransactionById
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopPaymentTransactionPut
    });

    // app.route({
    //     method: 'DELETE',
    //     url: '/delete/:id',
    //     schema: del,
    //     preHandler: [verifyAccessToken, verifyAccessPermission],
    //     handler: handlerShopQuotationDocDelete
    // });
};


module.exports = shopPaymentTransactionRouters;