// import { FastifyInstance } from 'fastify'
const { handleShopWarehousesAll, handleShopWarehousesAdd, handleShopWarehousesById, handleShopWarehousesPut } = require('../handlers/shopWarehouse')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, add, byid, put } = require('../models/ShopWarehouses/schema')
const shopWarehousesRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopWarehousesAdd
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopWarehousesAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopWarehousesById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopWarehousesPut
    })

}

module.exports = shopWarehousesRouters 