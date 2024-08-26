// import { FastifyInstance } from 'fastify'
const { handleAll, handleById, handleAdd, handlePut } = require('../handlers/productCompleteSize')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, byid, add, put } = require('../models/ProductCompleteSize/schema')
const productCompleteSizeRouters = async (app) => {


    app.route({
        method: "GET",
        url: "/productCompleteSize",
        schema: all,
        preHandler: [verifyAccessToken],
        handler: handleAll
    })
    app.route({
        method: "GET",
        url: "/productCompleteSize/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAll
    })


    app.route({
        method: "GET",
        url: "/productCompleteSize/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleById
    })

    app.route({
        method: "POST",
        url: "/productCompleteSize/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAdd
    })

    app.route({
        method: "PUT",
        url: "/productCompleteSize/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlePut
    })


}

module.exports = productCompleteSizeRouters 