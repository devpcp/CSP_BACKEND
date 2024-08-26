require("./api.Login.test");

const axios = require('axios');
const { isArray, isSafeInteger, isString, isEqual, isPlainObject } = require("lodash");
const { isUUID } = require("../utils/generate");
const { Op } = require("sequelize");

const testAxiosHeader = {
    'User-Agent': '',
    'Authorization': '',
    'Content-Type': 'application/json'
};

let table_name = '';
let modelShopWarehouse = null;

describe(`API Test: Scenario 2:`, () => {
    /**
     * A sequelize's transactions
     * @type {import("sequelize").Transaction}
     */
    let transaction = null;

    beforeAll(async () => {
        expect(__AXIOS_USER_AGENT.length > 0).toBe(true);
        expect(__AXIOS_AUTHORIZATION.length > 0).toBe(true);
        testAxiosHeader["User-Agent"] = __AXIOS_USER_AGENT;
        testAxiosHeader["Authorization"] = __AXIOS_AUTHORIZATION;

        expect(isString(__ShopCodeId)).toBe(true);
        expect(__ShopCodeId.length > 0).toBe(true);
        table_name = __ShopCodeId;
        modelShopWarehouse = require("../models/ShopWarehouses/ShopWarehouses")(table_name)
    });

    afterAll(async () => {
        await modelShopWarehouse.destroy({
            where: {
                id: {
                    [Op.ne]: '4acc8e3d-79b6-4513-a807-a8afff5df3cd'
                }
            }
        })
    });

    test("ShopWarehouses Add", async () => {
        const dataBody = JSON.stringify({
            "code_id": "WH002_B",
            "name": { "th": "คลังสินค้า B 002", "en": "Warehouse Store B 002" },
            "shelf": [{
                "code": "SH001BX",
                "name": { "th": "ชั้นสินค้า BX 001", "en": "Shelf Store BX 001" },
                "item": 1
            }]
        });
        const configAxios = {
            method: 'post',
            url: 'http://localhost:5001/api/shopWarehouses/add',
            headers: {
                ...testAxiosHeader
            },
            data: dataBody
        };
        const response = await axios(configAxios);

        expect(response.data).toMatchObject({ status: "success", data: "successful" });
    });

    test("ShopWarehouses All", async () => {
        const configAxios = {
            method: 'get',
            url: 'http://localhost:5001/api/shopWarehouses/all',
            headers: {
                ...testAxiosHeader
            }
        };
        const response = await axios(configAxios);

        expect(response.data).toHaveProperty("status");
        expect(response.data.status).toBe("success");

        // {
        //     "currentPage": 1,
        //     "pages": 1,
        //     "currentCount": 4,
        //     "totalCount": 4,
        //     "data": [ ]
        // }
        expect(response.data).toHaveProperty("data");
        expect(isPlainObject(response.data)).toBe(true);
        expect(response.data.data).toHaveProperty("currentPage");
        expect(isSafeInteger(response.data.data.currentPage)).toBe(true);
        expect(response.data.data).toHaveProperty("pages");
        expect(isSafeInteger(response.data.data.pages)).toBe(true);
        expect(response.data.data).toHaveProperty("currentCount");
        expect(isSafeInteger(response.data.data.currentCount)).toBe(true);
        expect(response.data.data).toHaveProperty("totalCount");
        expect(isSafeInteger(response.data.data.totalCount)).toBe(true);
        expect(response.data.data).toHaveProperty("data");
        expect(isArray(response.data.data.data)).toBe(true);
    });

    test("ShopWarehouses ById", async () => {

    });
});