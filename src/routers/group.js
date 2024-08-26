// import { FastifyInstance } from 'fastify'
const { handleGroupAll, handleGroupAllRaw, handleGroupAdd, handleGroupById, handleGroupPut } = require('../handlers/group')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, add, all_raw, byid, put } = require('../models/Groups/schema')
const userRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleGroupAdd
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleGroupAll
    })

    app.route({
        method: "GET",
        url: "/all_raw",
        schema: all_raw,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleGroupAllRaw
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleGroupById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleGroupPut
    })

}

module.exports = userRouters 