// import { FastifyInstance } from 'fastify'
const { handleAllRaw, handleAll, handleById, handleAdd, handlePut } = require('../handlers/thirdPartyApi')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all_raw, all, byid, add, put } = require('../models/ThirdPartyApi/schema')
const thirdPartyApiRouters = async (app) => {


    app.route({
        method: "GET",
        url: '/thirdPartyApi',
        schema: all_raw,
        preHandler: [verifyAccessToken],
        handler: handleAllRaw
    })


    app.route({
        method: "GET",
        url: "/thirdPartyApi/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAll
    })


    app.route({
        method: "GET",
        url: "/thirdPartyApi/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleById
    })



    app.route({
        method: "POST",
        url: "/thirdPartyApi/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAdd
    })



    app.route({
        method: "PUT",
        url: "/thirdPartyApi/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlePut
    })

}

module.exports = thirdPartyApiRouters 