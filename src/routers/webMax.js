// import { FastifyInstance } from 'fastify'
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { get, put, put_file, get_sub, put_stock, get_stock, put_stock_file, put_edit_stock_unit } = require('../models/WebMax/schema')
// const handleGet = require('../handlers/webMax')

const webMaxRouters = async (app) => {


    app.route({
        method: "GET",
        url: "/GetSubmitSales",
        schema: get_sub,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/webMax')(app, 'handleGetSubmitSales')
    })

    app.route({
        method: "GET",
        url: "/GetStockBalance",
        schema: get_stock,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/webMax')(app, 'handleGetStockBalance')
    })

    app.route({
        method: "GET",
        url: "/GetSalesDetail",
        schema: get,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/webMax')(app, 'handleGet')
    })
    app.route({
        method: "PUT",
        url: "/SubmitSalesDetail/byjson",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/webMax')(app, 'handlePutSalesByJson')
    })
    app.route({
        method: "PUT",
        url: "/SubmitSalesDetail/byfile",
        schema: put_file,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/webMax')(app, 'handlePutSalesByFile')
    })
    app.route({
        method: "PUT",
        url: "/SubmitStockDetail/byjson",
        schema: put_stock,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/webMax')(app, 'handlePutStockByJson')
    })

    app.route({
        method: "PUT",
        url: "/SubmitStockDetail/byfile",
        schema: put_stock_file,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/webMax')(app, 'handlePutStockByFile')
    })

    app.route({
        method: "PUT",
        url: "/EditStockUnit",
        schema: put_edit_stock_unit,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/webMax')(app, 'handePutEditStockUnit')
    })

}

module.exports = webMaxRouters 