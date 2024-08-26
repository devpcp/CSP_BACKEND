// import { FastifyInstance } from 'fastify'
const { ActivityPointOptionAdd, ActivityPointOptionAll, ActivityPointOptionById, ActivityPointOptionPut } = require('../handlers/activityPointOption')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { add, all, byid, put } = require('../models/ActivityPointOption/schema')
const activityPointOptionRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken],
        handler: ActivityPointOptionAdd
    })


    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: ActivityPointOptionAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: ActivityPointOptionById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: ActivityPointOptionPut
    })




}

module.exports = activityPointOptionRouters 