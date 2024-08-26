const { verifyAccessToken } = require('../hooks/auth');
const { verifyAccessPermission } = require('../hooks/permission');
const {
    all,
    put,
    add,
    addbyfile,
    byid,
    importHistory
} = require('../models/ShopInventoryTransaction/Model.Schema.ShopInventoryTransaction');

const {
    handleShopInventoryTransactionAll,
    handleShopInventoryTransactionAdd,
    handleShopInventoryTransactionAddByFile,
    handleShopInventoryTransactionById,
    handleShopInventoryTransactionPut,
    handleShopInventoryTransactionImportHistory
} = require('../handlers/shopInventoryTransaction');

const shopInventoryTransactionRouters = async (app) => {
    app.route({
        method: "POST",
        url: "/add",
        schema: add,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryTransactionAdd
    });

    app.route({
        method: "POST",
        url: "/addByFile",
        schema: addbyfile,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryTransactionAddByFile
    });


    app.route({
        method: "GET",
        url: "/all",
        schema: all,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryTransactionAll
    });

    app.route({
        method: "GET",
        url: "/byid/:id",
        schema: byid,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryTransactionById
    });

    app.route({
        method: "PUT",
        url: "/put/:id",
        schema: put,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryTransactionPut
    });

    app.route({
        method: "GET",
        url: "/importHistory",
        schema: importHistory,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handleShopInventoryTransactionImportHistory
    });

};

module.exports = shopInventoryTransactionRouters;