// import { FastifyInstance } from 'fastify'
const { handleAddFile, handleAddJson } = require('../handlers/mapCustomer')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { file, json } = require('../models/MatchCustomerDealer/schema')
const matchCustomer = async (app) => {

    app.route({
        method: "POST",
        url: "/addbyfile",
        schema: file,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAddFile
    })
    app.route({
        method: "POST",
        url: "/addbyjson",
        schema: json,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAddJson
    })



}

module.exports = matchCustomer 