// import { FastifyInstance } from 'fastify'
const { handleAllRaw, handleAll, handleById, handleAdd, handlePut, handleTestConnect } = require('../handlers/thirdPartyApiConnectData')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all_raw, all, byid, add, put, test_connect } = require('../models/ThirdPartyApiConnectData/schema')
const thirdPartyApiConnectDataRouters = async (app) => {


    app.route({
        method: "GET",
        url: '/thirdPartyApiConnectData',
        schema: all_raw,
        preHandler: [verifyAccessToken],
        handler: handleAllRaw
    })


    app.route({
        method: "GET",
        url: "/thirdPartyApiConnectData/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAll
    })


    app.route({
        method: "GET",
        url: "/thirdPartyApiConnectData/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleById
    })



    app.route({
        method: "POST",
        url: "/thirdPartyApiConnectData/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAdd
    })



    app.route({
        method: "PUT",
        url: "/thirdPartyApiConnectData/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlePut
    })


    app.route({
        method: "GET",
        url: "/thirdPartyApiConnectData/testconnect/:id",
        schema: test_connect,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleTestConnect
    })


}

module.exports = thirdPartyApiConnectDataRouters 