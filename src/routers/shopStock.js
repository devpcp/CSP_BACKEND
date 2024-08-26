// import { FastifyInstance } from 'fastify'
const { handleShopStockAll, handleShopStockById, handleShopStockReportAllStock } = require('../handlers/shopStock')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, byid, reportAllStockExportExcel } = require('../models/ShopStock/schema')
const shopStockRouters = async (app) => {

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopStockAll
    });

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopStockById
    });

    app.route({
        method: "GET",
        url: "/report/allStock",
        schema: reportAllStockExportExcel,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopStockReportAllStock
    });
}

module.exports = shopStockRouters 