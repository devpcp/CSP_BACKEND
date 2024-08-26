// import { FastifyInstance } from 'fastify'
const { handleAll, handleAllRaw, handlePut, handleAdd, handleById } = require('../handlers/productTypeGroup')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, byid, add, put, all_raw } = require('../models/ProductTypeGroup/schema')
const productTypeGroupRouters = async (app) => {

    app.route({
        method: "GET",
        url: "/productTypeGroup",
        schema: all_raw,
        preHandler: [verifyAccessToken],
        handler: handleAllRaw
    })


    app.route({
        method: "GET",
        url: "/productTypeGroup/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAll
    })
    app.route({
        method: "GET",
        url: "/productTypeGroup/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleById
    })

    app.route({
        method: "POST",
        url: "/productTypeGroup/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAdd
    })

    app.route({
        method: "PUT",
        url: "/productTypeGroup/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlePut
    })




}

module.exports = productTypeGroupRouters 