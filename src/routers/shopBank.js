// import { FastifyInstance } from 'fastify'
const { handleAdd, handleAll, handleById, handlePut } = require('../handlers/shopBank')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { add, all, byid, put } = require('../models/ShopBank/Model.Schema.Bank')
const shopBankRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken],
        handler: handleAdd
    })


    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlePut
    })




}

module.exports = shopBankRouters 