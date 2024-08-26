// import { FastifyInstance } from 'fastify'
const { handleShopTransactionOutAll, handleShopTransactionOutAdd, handleShopTransactionOutById, handleShopTransactionOutPut } = require('../handlers/shopSalesTransactionOut')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, add, byid, put } = require('../models/ShopSalesTransactionOut/schema')
const shopSalesTransactionOutRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopTransactionOutAdd
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopTransactionOutAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopTransactionOutById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopTransactionOutPut
    })

}

module.exports = shopSalesTransactionOutRouters 