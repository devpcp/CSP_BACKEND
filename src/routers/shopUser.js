// import { FastifyInstance } from 'fastify'
const { handleUserAdd, handleUserAll, handleUserPut, handleUserById } = require('../handlers/shopUser')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, add, put, byid } = require('../models/ShopUsers/schema')
const shopUserRouters = async (app) => {


    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleUserAdd
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleUserAll
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleUserPut
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleUserById
    })


}

module.exports = shopUserRouters 