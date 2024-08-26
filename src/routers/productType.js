// import { FastifyInstance } from 'fastify'
const { handleAll, handlePut, handleAdd, handleById } = require('../handlers/productType')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, byid, add, put } = require('../models/ProductType/schema')
const productTypeRouters = async (app) => {

    app.route({
        method: "GET",
        url: "/productType",
        schema: all,
        preHandler: [verifyAccessToken],
        handler: handleAll
    })
    app.route({
        method: "GET",
        url: "/productType/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAll
    })
    app.route({
        method: "GET",
        url: "/productType/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleById
    })

    app.route({
        method: "POST",
        url: "/productType/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAdd
    })

    app.route({
        method: "PUT",
        url: "/productType/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlePut
    })




}

module.exports = productTypeRouters 