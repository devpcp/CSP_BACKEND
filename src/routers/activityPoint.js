// import { FastifyInstance } from 'fastify'
const { ActivityPointAdd, ActivityPointAll, ActivityPointById, ActivityPointPut } = require('../handlers/activityPoint')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { add, all, byid, put } = require('../models/ActivityPoint/schema')
const ActivityPointRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken],
        handler: ActivityPointAdd
    })


    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: ActivityPointAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: ActivityPointById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: ActivityPointPut
    })




}

module.exports = ActivityPointRouters 