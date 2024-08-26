// import { FastifyInstance } from 'fastify'
const { handleAll, handleById, handleAdd, handlePut } = require('../handlers/productBrand')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, byid, add, put } = require('../models/ProductBrand/schema')
const productBrandRouters = async (app) => {


    app.route({
        method: "GET",
        url: '/productBrand',
        schema: all,
        preHandler: [verifyAccessToken],
        handler: handleAll
    })


    app.route({
        method: "GET",
        url: "/productBrand/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAll
    })


    app.route({
        method: "GET",
        url: "/productBrand/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleById
    })



    app.route({
        method: "POST",
        url: "/productBrand/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAdd
    })



    app.route({
        method: "PUT",
        url: "/productBrand/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlePut
    })

}

module.exports = productBrandRouters 