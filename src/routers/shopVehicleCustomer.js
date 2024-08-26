// import { FastifyInstance } from 'fastify'
const { handlerShopVehicleCustomersAddByFile, handleShopVehicleCustomerAll, handleShopVehicleCustomerAdd, handleShopVehicleCustomerById, handleShopVehicleCustomerPut } = require('../handlers/shopVehicleCustomer')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { add_by_file, all, add, byid, put } = require('../models/ShopVehicleCustomer/schema')
const shopVehicleCustomerRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/addByFile",
        schema: add_by_file,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopVehicleCustomersAddByFile
    })

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopVehicleCustomerAdd
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopVehicleCustomerAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopVehicleCustomerById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopVehicleCustomerPut
    })

}

module.exports = shopVehicleCustomerRouters 