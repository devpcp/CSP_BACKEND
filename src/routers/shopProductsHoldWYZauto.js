const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const shopProductsHoldWYZauto = async (app) => {

    app.route({
        method: 'POST',
        url: '/add',
        schema: require('../models/ShopProductsHoldWYZauto/Model.Schema.ShopProductsHoldWYZauto').add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/handler.ShopProductsHoldWYZauto.Add')
    });

    app.route({
        method: 'GET',
        url: '/all',
        schema: require('../models/ShopProductsHoldWYZauto/Model.Schema.ShopProductsHoldWYZauto').all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/handler.ShopProductsHoldWYZauto.All')
    });

    app.route({
        method: 'GET',
        url: '/byid/:id',
        schema: require('../models/ShopProductsHoldWYZauto/Model.Schema.ShopProductsHoldWYZauto').byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/handler.ShopProductsHoldWYZauto.ById')
    });

    app.route({
        method: 'PUT',
        url: '/put/:id',
        schema: require('../models/ShopProductsHoldWYZauto/Model.Schema.ShopProductsHoldWYZauto').put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: require('../handlers/handler.ShopProductsHoldWYZauto.Put')
    });

};

module.exports = shopProductsHoldWYZauto;