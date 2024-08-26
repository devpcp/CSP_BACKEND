const { verifyAccessToken } = require('../hooks/auth')
const { verifyAccessPermission } = require('../hooks/permission')
const { salesOut,
    inventory,
    inventory_v2,
    inventoryMovements,
    inventoryMovements_v2,
    inventoryMovements_v3,
    shopStock,
    shopStockGetMax,
    customerDebt,
    shopSalesTax,
    partnerDebtDoc
} = require('../models/ShopReports/Model.Schema.ShopReports')
const handlerShopReportsInventory = require('../handlers/handler.ShopReports.Inventory');
const handlerShopReportsInventory_v2 = require('../handlers/handler.ShopReports.Inventory.V2');
const handlerShopReportsSalesOut = require('../handlers/handler.ShopReports.SalesOut');
const handlerShopReportsInventoryMovements = require('../handlers/handler.ShopReports.InventoryMovements');
const handlerShopReportsInventoryMovements_v2 = require('../handlers/handler.ShopReports.InventoryMovements.V2');
const handlerShopReportsInventoryMovements_v3 = require('../handlers/handler.ShopReports.InventoryMovements.V3');
const handlerShopReportsShopStock = require('../handlers/handler.ShopReports.ShopStock');
const handlerShopReportsShopStockGetMax = require('../handlers/handler.ShopReports.ShopStockGetMax');
const handlerShopReportsCustomerDebt = require('../handlers/handler.ShopReports.CustomerDebt');
const handlerShopReportsSalesTax = require('../handlers/handler.ShopReports.SalesTax');
const handlerShopPartnerDebtDoc = require('../handlers/handler.ShopReports.PartnerDebtDoc');

const shopReportsRouters = async (app) => {

    app.route({
        method: "GET",
        url: "/salesOut",
        schema: salesOut,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsSalesOut
    });

    app.route({
        method: "GET",
        url: "/salesTax",
        schema: shopSalesTax,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsSalesTax
    });

    app.route({
        method: "GET",
        url: "/inventory",
        schema: inventory,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsInventory
    });

    app.route({
        method: "GET",
        url: "/inventory/v2",
        schema: inventory_v2,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsInventory_v2
    });

    app.route({
        method: "GET",
        url: "/inventoryMovements",
        schema: inventoryMovements,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsInventoryMovements
    });

    app.route({
        method: "GET",
        url: "/inventoryMovements/v2",
        schema: inventoryMovements_v2,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsInventoryMovements_v2
    });

    app.route({
        method: "GET",
        url: "/inventoryMovements/v3",
        schema: inventoryMovements_v3,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsInventoryMovements_v3
    });

    app.route({
        method: "GET",
        url: "/shopStock",
        schema: shopStock,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsShopStock
    });

    app.route({
        method: "GET",
        url: "/shopStockGetMax",
        schema: shopStockGetMax,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsShopStockGetMax
    });

    app.route({
        method: "GET",
        url: "/customerDebt",
        schema: customerDebt,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopReportsCustomerDebt
    });

    app.route({
        method: "GET",
        url: "/partnerDebtDoc",
        schema: partnerDebtDoc,
        preHandler: [verifyAccessToken, verifyAccessPermission],
        handler: handlerShopPartnerDebtDoc
    });
};

module.exports = shopReportsRouters;
