const fastify = require('fastify')
const config = require('./config')
const userRouters = require('./routers/user')
const authRouters = require('./routers/auth')
const groupRouters = require('./routers/group')
const accessRouters = require('./routers/access')
const applicationRouters = require('./routers/application')
const masterRouters = require('./routers/master')
const dealersRouters = require('./routers/dealers')
const customerRouters = require('./routers/customer')
const productRouters = require('./routers/product')
const productBrandRouters = require('./routers/productBrand')
const productTypeGroupRouters = require('./routers/productTypeGroup')
const productTypeRouters = require('./routers/productType')
const productCompleteSizeRouters = require('./routers/productCompleteSize')
const productModelTypeRouters = require('./routers/productModelType')
const matchCustomer = require('./routers/mapCustomer')
const matchProduct = require('./routers/mapProduct')
const webMaxRouters = require('./routers/webMax')
const activityPointOptionRouters = require('./routers/activityPointOption')
const activityPointRouters = require('./routers/activityPoint')
const dealerPointRouters = require('./routers/dealerPoint')
const shopsProfilesRouters = require("./routers/shopsProfiles");
const path = require('path')
const routerUpload = require("./routers/upload");
const shopWarehousesRouters = require('./routers/shopWarehouses')
const shopInventoryRouters = require('./routers/shopInventory')
const shopStockRouters = require('./routers/shopStock')
const shopBusinessCustomersRouters = require("./routers/shopBusinessCustomers");
const shopPersonalCustomersRouters = require("./routers/shopPersonalCustomers");
const shopProductsRouters = require('./routers/shopProducts')
const shopInventoryTransactionRouters = require('./routers/shopInventoryTransaction')
const shopBusinessPartnersRouters = require("./routers/shopBusinessPartners");
const shopSalesTransactionDoc = require("./routers/shopSalesTransactionDoc");
const validatorsRouters = require('./routers/validators');
const shopSalesOrderPlanLogsRouters = require("./routers/shopSalesOrderPlanLogs");
const shopVehicleCustomerRouters = require('./routers/shopVehicleCustomer')
const shopSalesTransactionOutRouters = require('./routers/shopSalesTransactionOut')
const thirdPartyApiRouters = require('./routers/thirdpartyapi')
const thirdPartyApiConnectDataRouters = require('./routers/thirdpartyapiconnectdata')
const shopInventoryPurchasingPreOrderDocRouters = require('./routers/shopInventoryPurchasingPreOrderDoc');
const shopInventoryPurchasingPreOrderProductListRouters = require('./routers/shopInventoryPurchasingPreOrderProductList');
const shopProductsHoldWYZauto = require('./routers/shopProductsHoldWYZauto');
const shopUserRouters = require('./routers/shopUser')
const shopShopSalesQuotationsLogsRouters = require("./routers/shopSalesQuotationsLogs");
const PrintOutRouters = require('./routers/printOut')
const { deletePrintOutFile } = require('./utils/utill.ScheduleDeleteFile')
const shopReportsRouters = require('./routers/shopReports');
const downloadRouter = require('./routers/download')
const shopHqRouters = require('./routers/shopHq')
const shopPurchaseOrderDocRouters = require('./routers/shopPurchaseOrderDoc');
const shopPurchaseOrderListRouters = require('./routers/shopPurchaseOrderList');
const shopQuotationDocRouters = require('./routers/shopQuotationDoc');
const shopQuotationListRouters = require('./routers/shopQuotationList');
const DashboardRouters = require('./routers/dashboard')
const shopAppointmentRouters = require('./routers/shopAppointment')
const shopLegacySalesOutRouters = require('./routers/shopLegacySalesOut');
const shopServiceOrderDocRouters = require('./routers/shopServiceOrderDoc');
const shopTemporaryDeliveryOrderDocRouters = require('./routers/shopTemporaryDeliveryOrderDoc');
const shopTaxInvoiceDocRouters = require('./routers/shopTaxInvoiceDoc');
const shopPaymentTransactionRouters = require('./routers/shopPaymentTransaction');
const shopCustomerDebtDocRouters = require('./routers/shopCustomerDebtDoc');
const shopCustomerDebtBillingNoteDoc = require('./routers/shopCustomerDebtBillingNoteDoc');
const shopCustomerDebtDebitNoteDocRouters = require('./routers/shopCustomerDebtDebitNoteDoc');
const shopCustomerDebtCreditNoteDocRouters = require('./routers/shopCustomerDebtCreditNoteDoc');
const shopCustomerDebtCreditNoteDocT2Routers = require('./routers/shopCustomerDebtCreditNoteDocT2');
const shopPartnerDebtDebitNoteDocRouters = require('./routers/shopPartnerDebtDebitNoteDoc');
const shopPartnerDebtCreditNoteDocRouters = require('./routers/shopPartnerDebtCreditNoteDoc');
const tagsRouters = require('./routers/tags')
const shopShipAddressCustomerRouters = require('./routers/shopShipAddressCustomer')
const shopContactCustomerRouters = require('./routers/shopContactCustomer')
const shopTagsRouters = require('./routers/shopTags')
const shopBankRouters = require('./routers/shopBank')
const shopCheckCustomer = require('./routers/shopCheckCustomer')
const shopPartnerDebtDocRouters = require('./routers/shopPartnerDebtDoc')
const shopPartnerDebtBillingNoteDocRouters = require('./routers/shopPartnerDebtBillingNoteDoc')


deletePrintOutFile()
function ajvPlugin(ajv, options) {
    ajv.addKeyword('isFileType', {
        compile: (schema, parent, it) => {
            // Change the schema type, as this is post validation it doesn't appear to error.
            parent.type = 'file'
            delete parent.isFileType
            return () => true
        },
    })

    return ajv
}

/**
 * A Fastify instance
 * @param {import("fastify").FastifyServerOptions} options
 * @returns {import("fastify").fastify.FastifyInstance}
 */
const buildApp = (options) => {
    /**
     * @type {import("fastify").fastify.FastifyInstance}
     */
    const app = fastify({
        ...options,
        ajv: {
            customOptions: {
                coerceTypes: 'array'
            },
            plugins: [ajvPlugin]
        }
    });

    /**
     *
     */
    if (config.config_fastify_enable_cors === true) {
        app.register(require('@fastify/cors'));
    }

    app.register(require('@fastify/multipart'), {
        attachFieldsToBody: true,
        limits: {
            fileSize: 10695475.2,  // For multipart forms, the max file size in bytes (Current: 10.2 mb)
            files: 5, // Max number of file fields
        }
    });

    app.register(require('fastify-axios'));

    app.register(require('@fastify/swagger'), {
        routePrefix: '/documentation',
        swagger: {
            info: {
                title: 'Car Service Platform API',
                description: 'CSP project with the Fastify swagger API',
                version: JSON.parse(require('fs').readFileSync('package.json')).version || '0.0.1'
            },
            securityDefinitions: {
                apiKey: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header'
                }
            },
            host: config.config_swagger_url
        },
        exposeRoute: true,
    });

    app.register(require('@fastify/static'), {
        root: path.join(__dirname, 'assets'),
        prefix: '/assets/', // optional: default '/'
    });

    app.register(authRouters, { prefix: '/api' });
    app.register(userRouters, { prefix: '/api/user' });
    app.register(groupRouters, { prefix: '/api/group' });
    app.register(accessRouters, { prefix: '/api/access' });
    app.register(applicationRouters, { prefix: '/api/application' });
    app.register(masterRouters, { prefix: '/api/master' });
    app.register(validatorsRouters, { prefix: '/api/validators' });
    app.register(dealersRouters, { prefix: '/api/dealers' });
    app.register(customerRouters, { prefix: '/api/customer' });
    app.register(productRouters, { prefix: '/api/product' });
    app.register(productBrandRouters, { prefix: '/api' });
    app.register(productTypeGroupRouters, { prefix: '/api' });
    app.register(productTypeRouters, { prefix: '/api' });
    app.register(productModelTypeRouters, { prefix: '/api' });
    app.register(productCompleteSizeRouters, { prefix: '/api' });

    app.register(matchCustomer, { prefix: '/api/matchCustomer' });
    app.register(matchProduct, { prefix: '/api/matchProduct' });

    app.register(webMaxRouters, { prefix: '/api/webMax' });

    app.register(activityPointOptionRouters, { prefix: '/api/activityPointOption' });
    app.register(activityPointRouters, { prefix: '/api/activityPoint' });

    app.register(dealerPointRouters, { prefix: '/api/dealerPoint' });

    app.register(shopsProfilesRouters, { prefix: '/api/shopsProfiles' });
    app.register(shopBusinessCustomersRouters, { prefix: 'api/shopBusinessCustomers' });
    app.register(shopBusinessPartnersRouters, { prefix: 'api/shopBusinessPartners' });
    app.register(shopPersonalCustomersRouters, { prefix: 'api/shopPersonalCustomers' });

    app.register(routerUpload, { prefix: '/api/upload' });

    app.register(shopWarehousesRouters, { prefix: '/api/shopWarehouses' });
    app.register(shopInventoryRouters, { prefix: '/api/shopInventory' });
    app.register(shopStockRouters, { prefix: '/api/shopStock' });

    app.register(shopInventoryTransactionRouters, { prefix: '/api/shopInventoryTransaction' });
    app.register(shopProductsRouters, { prefix: '/api/shopProducts' });

    app.register(shopSalesTransactionDoc, { prefix: '/api/shopSalesTransactionDoc' });
    app.register(shopSalesOrderPlanLogsRouters, { prefix: '/api/shopSalesOrderPlanLogs' });
    app.register(shopShopSalesQuotationsLogsRouters, { prefix: '/api/shopSalesQuotationsLogs' });

    app.register(shopVehicleCustomerRouters, { prefix: '/api/shopVehicleCustomer' })

    app.register(shopSalesTransactionOutRouters, { prefix: '/api/shopSalesTransactionOut' })

    app.register(shopInventoryPurchasingPreOrderDocRouters, { prefix: '/api/shopInventoryPurchasingPreOrderDoc' });
    app.register(shopInventoryPurchasingPreOrderProductListRouters, { prefix: '/api/shopInventoryPurchasingPreOrderProductList' });

    app.register(shopProductsHoldWYZauto, { prefix: '/api/shopProductsHoldWYZauto' });

    app.register(thirdPartyApiRouters, { prefix: '/api' })

    app.register(thirdPartyApiConnectDataRouters, { prefix: '/api' })

    app.register(shopUserRouters, { prefix: '/api/shopUser' })

    app.register(shopQuotationDocRouters, { prefix: '/api/shopQuotationDoc' });
    app.register(shopQuotationListRouters, { prefix: '/api/shopQuotationList' });

    app.register(shopPurchaseOrderDocRouters, { prefix: '/api/shopPurchaseOrderDoc' });
    app.register(shopPurchaseOrderListRouters, { prefix: '/api/shopPurchaseOrderList' });

    app.register(shopReportsRouters, { prefix: '/api/shopReports' });

    app.register(PrintOutRouters, { prefix: '/api/printOut' });

    app.register(shopHqRouters, { prefix: '/api/shopHq' });

    app.register(DashboardRouters, { prefix: '/api/dashboard' });

    app.register(downloadRouter, { prefix: '/api/download' })

    app.register(shopAppointmentRouters, { prefix: '/api/shopAppointment' })

    app.register(shopLegacySalesOutRouters, { prefix: '/api/shopLegacySalesOut' });

    app.register(shopServiceOrderDocRouters, { prefix: '/api/shopServiceOrderDoc' });

    app.register(shopTemporaryDeliveryOrderDocRouters, { prefix: '/api/shopTemporaryDeliveryOrderDoc' });

    app.register(shopTaxInvoiceDocRouters, { prefix: '/api/shopTaxInvoiceDoc' });

    app.register(shopPaymentTransactionRouters, { prefix: '/api/shopPaymentTransaction' });

    app.register(shopCustomerDebtDocRouters, { prefix: '/api/shopCustomerDebtDoc' });
    app.register(shopCustomerDebtBillingNoteDoc, { prefix: '/api/shopCustomerDebtBillingNoteDoc' });
    app.register(shopCustomerDebtDebitNoteDocRouters, { prefix: '/api/shopCustomerDebtDebitNoteDoc' });
    app.register(shopCustomerDebtCreditNoteDocRouters, { prefix: '/api/shopCustomerDebtCreditNoteDoc' });
    app.register(shopCustomerDebtCreditNoteDocT2Routers, { prefix: '/api/shopCustomerDebtCreditNoteDocT2' });

    app.register(shopPartnerDebtDebitNoteDocRouters, { prefix: '/api/shopPartnerDebtDebitNoteDoc' });
    app.register(shopPartnerDebtCreditNoteDocRouters, { prefix: '/api/shopPartnerDebtCreditNoteDoc' });
    app.register(shopPartnerDebtBillingNoteDocRouters, { prefix: '/api/shopPartnerDebtBillingNote' })

    app.register(shopPartnerDebtDocRouters, { prefix: '/api/shopPartnerDebtDoc' })

    app.register(tagsRouters, { prefix: '/api/tags' })

    app.register(shopShipAddressCustomerRouters, { prefix: '/api/shopShipAddressCustomer' })

    app.register(shopContactCustomerRouters, { prefix: '/api/shopContactCustomer' })

    app.register(shopTagsRouters, { prefix: '/api/shopTags' })

    app.register(shopBankRouters, { prefix: '/api/shopBank' })

    app.register(shopCheckCustomer, { prefix: '/api/shopCheckCustomer' })



    app.setErrorHandler((error, request, reply) => {
        const customError = error;

        reply
            .status(customError.statusCode || 200)
            .send({
                status: customError.status || 'failed',
                data: customError.data || customError.message
            });
    });

    app.route({
        method: "POST",
        url: "/api/post",
        handler: function (request, reply) {
            return ({ status: 'success', data: 'successful' })
        }
    });

    return app;
};


module.exports = buildApp;