// import { FastifyInstance } from 'fastify'
const { handleAccessAll, handleAccessAllRaw, handleAccessAdd, handleAccessById, handleAccessPut } = require('../handlers/access')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, add, all_raw, byid, put } = require('../models/Access/schema')
const accessRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAccessAdd
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAccessAll
    })

    app.route({
        method: "GET",
        url: "/all_raw",
        schema: all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAccessAllRaw
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAccessById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAccessPut
    })

}

module.exports = accessRouters 