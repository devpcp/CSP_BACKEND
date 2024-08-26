// import { FastifyInstance } from 'fastify'
const { handleAllRaw, handleAll, handlePut, handleAdd, handleById, handleByTypeBrandAll, handleByTypeBrand } = require('../handlers/productModelType')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all_raw, all, byid, add, put, bytypebrandall, bytypebrand } = require('../models/ProductModelType/schema')
const productModelTypeRouters = async (app) => {



    app.route({
        method: "GET",
        url: "/productModelType",
        schema: all_raw,
        preHandler: [verifyAccessToken],
        handler: handleAllRaw
    })

    app.route({
        method: "GET",
        url: "/productModelType/all",
        schema: all,
        preHandler: [verifyAccessToken],
        handler: handleAll
    })

    app.route({
        method: "GET",
        url: "/productModelType/byTypeBrand/all",
        schema: bytypebrandall,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleByTypeBrandAll
    })
    app.route({
        method: "GET",
        url: "/productModelType/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleById
    })


    app.route({
        method: "GET",
        url: "/productModelType/byTypeBrand/:product_brand_id",
        schema: bytypebrand,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleByTypeBrand
    })

    app.route({
        method: "POST",
        url: "/productModelType/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAdd
    })

    app.route({
        method: "PUT",
        url: "/productModelType/byTypeBrand/:product_brand_id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlePut
    })




}

module.exports = productModelTypeRouters 