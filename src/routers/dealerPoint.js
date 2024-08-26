// import { FastifyInstance } from 'fastify'
const { DealerPointAdd, DealerPointAll, DealerPointExport, DealerPointDownload } = require('../handlers/dealerPoint')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { add, all, byid, put, export_ } = require('../models/DealerPoint/schema')
const DealerPointRouters = async (app) => {




    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: DealerPointAll
    })

    app.route({
        method: "GET",
        url: "/export",
        schema: export_,
        // preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: DealerPointExport
    })

    app.route({
        method: "GET",
        url: "/download/:file_name",
        // schema: export_,
        // preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: DealerPointDownload
    })
    // app.route({
    //     method: "PUT",
    //     url: "/put/:id",
    //     schema: put,
    //     preHandler: [verifyAccessToken, verifyAccessPermission],
    //     handler: DealerPointPut
    // })




}

module.exports = DealerPointRouters 