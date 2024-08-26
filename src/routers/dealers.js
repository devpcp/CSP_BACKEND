// import { FastifyInstance } from 'fastify'
const { dealersAdd, dealersAll, dealersById, dealersPut } = require('../handlers/dealers')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { add, all, byid, put } = require('../models/Dealers/schema')
const dealersRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken],
        handler: dealersAdd
    })


    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: dealersAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: dealersById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: dealersPut
    })




}

module.exports = dealersRouters 