// import { FastifyInstance } from 'fastify'
const { handleApplicationAll, handleApplicationAdd, handleApplicationById, handleApplicationPut, handleApplicationSort } = require('../handlers/application')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, add, byid, put, sort } = require('../models/Application/schema')
const applicationRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleApplicationAdd
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleApplicationAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleApplicationById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleApplicationPut
    })


    app.route({
        method: "PUT",
        url: "/sort",
        schema: sort,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleApplicationSort
    })

}

module.exports = applicationRouters 