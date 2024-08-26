// import { FastifyInstance } from 'fastify'
const { handleShopProductAll, handleShopProductAdd, handleShopProductById, handleShopProductPut, handleShopProductAddByFile,
    handleAddImage, handleShopProductDotPriceAddByFile, handleShopProductDotPriceReport, handleShopProductPriceArrAddByFile,
    handleShopProductPriceArrReport,
    handleShopProductPriceBaseAddByFile,
    handleShopProductPriceBaseReport } = require('../handlers/shopProduct')
const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { all, add, byid, put, filterCategories, addByFile, add_img_arr, addPriceDotByFile, priceDotReport, priceReport, addPriceBaseByFile, priceBaseReport, addPriceArrByFile, priceArrReport } = require('../models/ShopProduct/schema')
const handlerShopProductFilterCategories = require("../handlers/handler.ShopProduct.Filter.Categories");
const shopProductsRouters = async (app) => {

    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductAdd
    })

    app.route({
        method: "POST",
        url: "/addByFile",
        schema: addByFile,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductAddByFile
    })


    app.route({
        method: "POST",
        url: "/addPriceDotByFile",
        schema: addPriceDotByFile,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductDotPriceAddByFile
    })

    app.route({
        method: "GET",
        url: "/priceDotReport",
        schema: priceDotReport,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductDotPriceReport
    })

    app.route({
        method: "POST",
        url: "/addPriceBaseByFile",
        schema: addPriceBaseByFile,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductPriceBaseAddByFile
    })

    app.route({
        method: "GET",
        url: "/priceBaseReport",
        schema: priceBaseReport,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductPriceBaseReport
    })


    app.route({
        method: "POST",
        url: "/addPriceArrByFile",
        schema: addPriceArrByFile,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductPriceArrAddByFile
    })

    app.route({
        method: "GET",
        url: "/priceArrReport",
        schema: priceArrReport,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductPriceArrReport
    })

    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductAll
    })

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductById
    })

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopProductPut
    })

    app.route({
        method: "GET",
        url: "/filter/categories",
        schema: filterCategories,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopProductFilterCategories
    })

    app.route({
        method: "POST",
        url: "/addimgarr/:id",
        schema: add_img_arr,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleAddImage
    })
}

module.exports = shopProductsRouters 