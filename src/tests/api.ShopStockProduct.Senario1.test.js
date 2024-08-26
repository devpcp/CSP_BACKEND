const apiTestLogin = require("./api.Login.test");

const axios = require('axios');
const { isArray, isSafeInteger, isString, isEqual, isPlainObject } = require("lodash");
const { isUUID } = require("../utils/generate");

const testAxiosHeader = {
    'User-Agent': '',
    'Authorization': '',
    'Content-Type': 'application/json'
};

const testDataShopCode = "01hq0002";

const modelShopStockProductBalances = require("../models/ShopStock/ShopStock")(testDataShopCode);
const modelShopSalesOrderPlanLogs = require("../models/ShopSalesOrderPlanLogs/ShopSalesOrderPlanLogs")(testDataShopCode);

describe(`API Test: Scenario 1: Add and Cancel document of ShopStockProduct`, () => {
    const testDataBody = {
        shop_id: "7ea722cf-2b76-461a-a46e-dcb5aca56e64",
        product_id: "9e94f422-8d0b-4b05-94da-c1edc943893c",
        warehouse_detail: {
            warehouse: "51657d6e-a03b-4021-8494-723854f2f5b6",
            shelf: [
                {
                    item: "SHX001",
                    amount: "2"
                },
                {
                    item: "SHX002",
                    amount: "1"
                }
            ]
        },
        amount: "3",
        doc_sale_id: "13562643-e471-4d38-aaf3-3a2c17982d5b",
        details: {
            price: "1000",
            discount_percentage_1: "2",
            discount_percentage_2: "0",
            discount_thb: "980"
        }
    };

    const variablePreTest_ShopStockProduct = {
        warehouse_detail: {
            warehouse: '',
            shelf: [{
                item: '',
                balance: ''
            }]
        },
        balance: ''
    };

    const variablePreTest_ShopStockProduct_Add = {};
    const variableTest_ShopStockProduct_Add = {
        warehouse_detail: {
            warehouse: '',
            shelf: [{
                item: '',
                balance: ''
            }]
        },
        balance: ''
    };
    const variablePostTest_ShopStockProduct_Add = {
        id: ''
    };

    beforeAll(async () => {
        testAxiosHeader["User-Agent"] = __AXIOS_USER_AGENT;
        testAxiosHeader["Authorization"] = __AXIOS_AUTHORIZATION;

        const findProductStockBalance = await modelShopStockProductBalances.findAll({ where: { product_id: testDataBody.product_id } });
        expect(isArray(findProductStockBalance))
            .toEqual(true);
        expect(findProductStockBalance.length)
            .toEqual(1);
        expect(findProductStockBalance[0])
            .toHaveProperty("balance");
        expect(isString(findProductStockBalance[0].balance))
            .toEqual(true);
        expect(isSafeInteger(+findProductStockBalance[0].balance))
            .toEqual(true);
        variablePreTest_ShopStockProduct.balance = findProductStockBalance[0].balance;
        expect(findProductStockBalance[0])
            .toHaveProperty("warehouse_detail");
        expect(isArray(findProductStockBalance[0].warehouse_detail))
            .toEqual(true);
        const findWarehouse = findProductStockBalance[0].warehouse_detail.filter(w => w.warehouse === testDataBody.warehouse_detail.warehouse);
        expect(findWarehouse.length)
            .toEqual(1);
        variablePreTest_ShopStockProduct.warehouse_detail.warehouse = findWarehouse[0].warehouse;
        expect(findWarehouse[0])
            .toHaveProperty("shelf");
        expect(isArray(findWarehouse[0].shelf))
            .toEqual(true);
        const findShelf = findWarehouse[0].shelf.map(w => {
            const findItem = testDataBody.warehouse_detail.shelf.filter(wA => wA.item === w.item);
            if (findItem.length === 1) {
                return w;
            }
        });
        expect(findShelf.length)
            .toEqual(testDataBody.warehouse_detail.shelf.length);
        variablePreTest_ShopStockProduct.warehouse_detail.shelf = findShelf;
        expect(variablePreTest_ShopStockProduct.warehouse_detail.shelf.reduce((prev, curr) => prev + (+curr.balance), 0))
            .toBeLessThanOrEqual((+variablePreTest_ShopStockProduct.balance))
    });



    test(`Add ShopStockProduct document`, async () => {
        const dataBody = JSON.stringify({
            "shop_id": testDataBody.shop_id,
            "product_id": testDataBody.product_id,
            "warehouse_detail": testDataBody.warehouse_detail,
            "amount": testDataBody.amount,
            "doc_sale_id": testDataBody.doc_sale_id,
            "details": testDataBody.details
        });

        const configAxios = {
            method: 'post',
            url: 'http://localhost:5001/api/shopSalesOrderPlanLogs/add',
            headers: {
                ...testAxiosHeader
            },
            data: dataBody
        };

        const response = await axios(configAxios);

        const unitTestShopStockAdd_Response = async () => {
            expect(response)
                .toBeDefined();
            expect(response.status)
                .toEqual(200);

            expect(response.data)
                .toHaveProperty("status");
            expect(response.data)
                .toHaveProperty("status", "success");

            expect(response.data)
                .toHaveProperty("data");
            expect(isPlainObject(response.data))
                .toBe(true);

            expect(response.data)
                .toHaveProperty("data.id");
            expect(isUUID(response.data.data.id))
                .toBe(true);
            variablePostTest_ShopStockProduct_Add.id = response.data.data.id;

            expect(response.data.data)
                .toHaveProperty("shop_id");
            expect(isUUID(response.data.data.shop_id))
                .toBe(true);
            expect(isEqual(response.data.data.shop_id, testDataBody.shop_id))
                .toBe(true);

            expect(response.data.data)
                .toHaveProperty("product_id");
            expect(isUUID(response.data.data.product_id))
                .toBe(true);
            expect(isEqual(response.data.data.product_id, testDataBody.product_id))
                .toBe(true);

            expect(response.data.data)
                .toHaveProperty("warehouse_detail");
            expect(isEqual(testDataBody.warehouse_detail, response.data.data.warehouse_detail))
                .toBe(true);

            expect(response.data.data)
                .toHaveProperty("amount");
            expect(isEqual(testDataBody.amount, response.data.data.amount))
                .toBe(true);

            expect(response.data.data)
                .toHaveProperty("doc_sale_id");
            expect(isUUID(response.data.data.doc_sale_id))
                .toBe(true);
            expect(isEqual(response.data.data.doc_sale_id, testDataBody.doc_sale_id))
                .toBe(true);

            expect(response.data.data)
                .toHaveProperty("details");
            expect(isEqual(testDataBody.details, response.data.data.details))
                .toBe(true);

            expect(response.data.data)
                .toHaveProperty("status");
            expect(response.data.data.status)
                .toEqual(1);
        };
        await unitTestShopStockAdd_Response();

        const unitTestShopStockAdd_ValidateData = async () => {
            const findProductStockBalance = await modelShopStockProductBalances.findAll({ where: { product_id: testDataBody.product_id } });
            expect(isArray(findProductStockBalance))
                .toEqual(true);
            expect(findProductStockBalance.length)
                .toEqual(1);
            expect(findProductStockBalance[0])
                .toHaveProperty("balance");
            expect(isString(findProductStockBalance[0].balance))
                .toEqual(true);
            expect(isSafeInteger(+findProductStockBalance[0].balance))
                .toEqual(true);
            variableTest_ShopStockProduct_Add.balance = findProductStockBalance[0].balance;
            expect(findProductStockBalance[0])
                .toHaveProperty("warehouse_detail");
            expect(isArray(findProductStockBalance[0].warehouse_detail))
                .toEqual(true);
            const findWarehouse = findProductStockBalance[0].warehouse_detail.filter(w => w.warehouse === testDataBody.warehouse_detail.warehouse);
            expect(findWarehouse.length)
                .toEqual(1);
            variableTest_ShopStockProduct_Add.warehouse_detail.warehouse = findWarehouse[0].warehouse;
            expect(findWarehouse[0])
                .toHaveProperty("shelf");
            expect(isArray(findWarehouse[0].shelf))
                .toEqual(true);
            const findShelf = findWarehouse[0].shelf.map(w => {
                const findItem = testDataBody.warehouse_detail.shelf.filter(wA => wA.item === w.item);
                if (findItem.length === 1) {
                    return w;
                }
            });
            expect(findShelf.length)
                .toEqual(testDataBody.warehouse_detail.shelf.length);
            variableTest_ShopStockProduct_Add.warehouse_detail.shelf = findShelf;

            for (let i = 0; i < testDataBody.warehouse_detail.shelf; i++) {
                const element = testDataBody.warehouse_detail.shelf[i];
                const findData = variableTest_ShopStockProduct_Add.warehouse_detail.shelf.filter(w => w.item === element.item);
                expect(findData.length)
                    .toBe(1);
                expect((+findData[0].balance))
                    .toBeGreaterThanOrEqual(element.amount)
            }
        };
        await unitTestShopStockAdd_ValidateData();
    });

    test(`Cancel ShopStockProduct document`, async () => {
        const dataBody = JSON.stringify({
            "status": 0
        });

        const configAxios = {
            method: 'put',
            url: `http://localhost:5001/api/shopSalesOrderPlanLogs/put/${variablePostTest_ShopStockProduct_Add.id}`,
            headers: {
                ...testAxiosHeader
            },
            data: dataBody
        };

        const response = await axios(configAxios);

        const unitTestShopStockCancel_Response = async () => {
            expect(response)
                .toBeDefined();
            expect(response.status)
                .toEqual(200);

            expect(response.data)
                .toHaveProperty("status");
            expect(response.data)
                .toHaveProperty("status", "success");

            expect(response.data)
                .toHaveProperty("data");
            expect(response.data)
                .toHaveProperty("data.id");
        };
        await unitTestShopStockCancel_Response();

        const unitTestShopStockCancel_ValidateData = async () => {
            const findShopSalesOrderPlanLogs = await modelShopSalesOrderPlanLogs.findAll({ where: { id: variablePostTest_ShopStockProduct_Add.id } });
            expect(isArray(findShopSalesOrderPlanLogs))
                .toBe(true);
            expect(findShopSalesOrderPlanLogs.length)
                .toBe(0);
        };
        await unitTestShopStockCancel_ValidateData();

    });
});
