// import { FastifyInstance } from 'fastify'
const { handleUserMe, handleUserRegister, handleUserAdd, handleUserAll, handleUserPut, handleUserById, handleUserMe_1 } = require('../handlers/user')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { register, all, add, put, byid, mydata } = require('../models/Users/schema')
const userRouters = async (app) => {

    app.route({
        method: "GET",
        url: "/mydata",
        schema: mydata,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleUserMe
    })

    app.route({
        method: "GET",
        url: "/mydata_1",
        schema: mydata,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleUserMe_1
    })


    app.route({
        method: "POST",
        url: "/register",
        schema: register,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleUserRegister
    })

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

module.exports = userRouters 