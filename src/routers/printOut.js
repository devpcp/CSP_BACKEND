// import { FastifyInstance } from 'fastify'
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { download, print_out_pdf, print_out_pdf_tax_invoice } = require('../models/PrintOut/schema')
const { Download, printOutPdf } = require('../handlers/printOutV1')
const { printOutPdfTaxInvoice } = require('../handlers/printOutTaxInvoice')
const PrintOutRouters = async (app) => {



    app.route({
        method: "GET",
        url: "/pdf/:id",
        schema: print_out_pdf,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: printOutPdf
    })

    app.route({
        method: "GET",
        url: "/pdf/taxInvoice/:id",
        schema: print_out_pdf_tax_invoice,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: printOutPdfTaxInvoice
    })

    app.route({
        method: "GET",
        url: "/download/:file_name",
        schema: download,
        // preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: Download
    })

}

module.exports = PrintOutRouters 