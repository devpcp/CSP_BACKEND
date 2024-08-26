// import { FastifyInstance } from 'fastify'
const { handleAddFile, handleAddJson, handleExportProduct } = require('../handlers/mapProduct')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { json, file, export_product } = require('../models/Product/schema')
const matchProduct = async (app) => {

    app.route({
        method: "POST",
        url: "/byfile",
        schema: file,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAddFile
    })
    app.route({
        method: "POST",
        url: "/byjson",
        schema: json,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAddJson
    })

    app.route({
        method: "GET",
        url: "/exportProduct",
        schema: export_product,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleExportProduct
    })



}

module.exports = matchProduct 