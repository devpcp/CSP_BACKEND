// import { FastifyInstance } from 'fastify'
const { handleShopInventoryAll, handleShopInventoryById, handleShopInventoryDocPut,
    handleShopInventoryAddByJson, handleShopInventoryAddByFile, handleShopInventoryByDocId } = require('../handlers/shopInventory')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, add_json, byid, add_file, put } = require('../models/ShopInventory/schema')
const shopInventoryRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add/byjson",
        schema: add_json,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryAddByJson
    })

    app.route({
        method: "POST",
        url: "/add/byfile",
        schema: add_file,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryAddByFile
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryAll
    })



    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryById
    })



    app.route({
        method: "GET",
        url: "/bydocinventoryid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryByDocId
    })


    app.route({
        method: "PUT",
        url: "/putbydocinventoryid/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryDocPut
    })

}

module.exports = shopInventoryRouters 