const utilSetShopStockProductBalance = require("../utils/util.SetShopStockProductBalance");
const xSequelize = require("../db");

const tableName = '01hq0007';
const shopStockProductId = '9ae442a6-f01d-414e-9d04-e20de4492132';
const shopWarehouseId = 'a7f92bf3-ec1c-419f-91f0-952f2b763e67';
const shopSelfItem = 'SX001_001';

let t;
beforeAll(async () => {
    t = await xSequelize.transaction();
});

afterAll(async () => {
    await t.rollback();
})

test('Actions: Scenario Test', async () => {
    const dataAdd = await utilSetShopStockProductBalance(
        tableName,
        shopStockProductId,
        shopWarehouseId,
        shopSelfItem,
        'add_holding_product',
        "7",
        {
            transaction: t
        }
    );
    expect(dataAdd)
        .toMatchObject({
            shopStock_balance: "10",
            shopStockWarehouse_balance: "5",
            shopStockWarehouse_holdingProduct: "7",
        });

    const dataRemove = await utilSetShopStockProductBalance(
        tableName,
        shopStockProductId,
        shopWarehouseId,
        shopSelfItem,
        'remove_holding_product',
        "2",
        {
            transaction: t
        }
    );

    expect(dataRemove)
        .toMatchObject({
            shopStock_balance: "10",
            shopStockWarehouse_balance: "5",
            shopStockWarehouse_holdingProduct: "5",
        });

    const dataCommit = await utilSetShopStockProductBalance(
        tableName,
        shopStockProductId,
        shopWarehouseId,
        shopSelfItem,
        'commit_holding_product',
        "2",
        {
            transaction: t
        }
    );

    expect(dataCommit)
        .toMatchObject({
            shopStock_balance: "8",
            shopStockWarehouse_balance: "3",
            shopStockWarehouse_holdingProduct: "3",
        });
});

test('Actions: Add', async () => {
    const dataAdd = await utilSetShopStockProductBalance(
        tableName,
        shopStockProductId,
        shopWarehouseId,
        shopSelfItem,
        'add_holding_product',
        "7",
        {
            transaction: t
        }
    );
    expect(dataAdd)
        .toMatchObject({
            shopStock_balance: "8",
            shopStockWarehouse_balance: "3",
            shopStockWarehouse_holdingProduct: "10",
        });
});

test('Actions: Commit', async () => {
    const dataAdd = await utilSetShopStockProductBalance(
        tableName,
        shopStockProductId,
        shopWarehouseId,
        shopSelfItem,
        'commit_holding_product',
        "1",
        {
            transaction: t
        }
    );
    expect(dataAdd)
        .toMatchObject({
            shopStock_balance: "7",
            shopStockWarehouse_balance: "2",
            shopStockWarehouse_holdingProduct: "9",
        });
});

test('Actions: Remove', async () => {
    const dataAdd = await utilSetShopStockProductBalance(
        tableName,
        shopStockProductId,
        shopWarehouseId,
        shopSelfItem,
        'remove_holding_product',
        "5",
        {
            transaction: t
        }
    );
    expect(dataAdd)
        .toMatchObject({
            shopStock_balance: "7",
            shopStockWarehouse_balance: "2",
            shopStockWarehouse_holdingProduct: "4",
        });
});