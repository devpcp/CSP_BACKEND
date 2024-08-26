const axios = require('axios');
const { isString } = require("lodash");

describe("API Test: Login", () => {

    test(`Check Pre global variable requirements`, () => {
        expect(__AXIOS_AUTHORIZATION).toBeDefined();
        expect(typeof __AXIOS_AUTHORIZATION).toBe("string");
        expect(__AXIOS_USER_AGENT).toBeDefined();
        expect(typeof __AXIOS_USER_AGENT).toBe("string");
        expect(__AXIOS_USER_AGENT).toBe("Postman");
    });

    test(`Login`, async () => {
        const dataLogin = JSON.stringify({
            "user_name": "demoshop",
            "password": "P@ssw0rd"
        });

        const configAxois = {
            method: 'post',
            url: 'http://localhost:5001/api/login',
            headers: {
                'User-Agent': __AXIOS_USER_AGENT,
                'Content-Type': 'application/json'
            },
            data : dataLogin
        };

        const response = await axios(configAxois);

        expect(response)
            .toBeDefined();
        expect(response.status)
            .toEqual(200);
        expect(response.data)
            .toHaveProperty("status");
        expect(response.data)
            .toHaveProperty("status", "success");
        expect(response.data)
            .toHaveProperty("data")
        expect(response.data)
            .toHaveProperty("data.access_token")
        expect(response.data.data.access_token)
            .not
            .toBeNull();
        expect(response.data)
            .toHaveProperty("data.token_type")
        expect(response.data.data.token_type)
            .toBe("Bearer")

        __AXIOS_AUTHORIZATION = `${response.data.data.token_type} ${response.data.data.access_token}`;
    });

    test(`Check global variables requirement "Axios"`, () => {
        expect(__AXIOS_AUTHORIZATION).toBeDefined();
        expect(typeof __AXIOS_AUTHORIZATION).toBe("string");
        expect(__AXIOS_AUTHORIZATION.length).toBeGreaterThan(100);
        expect(__AXIOS_USER_AGENT).toBeDefined();
        expect(typeof __AXIOS_USER_AGENT).toBe("string");
        expect(__AXIOS_USER_AGENT).toBe("Postman");
    });

    test(`API GET: mydata`, async () => {
        const axiosHeader = {
            'User-Agent': __AXIOS_USER_AGENT,
            'Authorization': __AXIOS_AUTHORIZATION,
            'Content-Type': 'application/json'
        };
        const axiosConfig = {
            method: 'get',
            url: 'http://localhost:5001/api/user/mydata',
            headers: {
                ...axiosHeader
            }
        };
        const response = await axios(axiosConfig);

        expect(response).toHaveProperty("data");
        expect(response.data).toMatchObject({ status: "success" });
        expect(response.data).toHaveProperty("data");
        expect(response.data.data).toHaveProperty("UsersProfile.ShopsProfile.shop_code_id");
        expect(isString(response.data.data.UsersProfile.ShopsProfile.shop_code_id)).toBe(true);
        expect(response.data.data.UsersProfile.ShopsProfile.shop_code_id.length > 0).toBe(true);
        __ShopCodeId = response.data.data.UsersProfile.ShopsProfile.shop_code_id;
    });

    test("Check additional global variables", () => {
        expect(isString(__ShopCodeId)).toBe(true);
        expect(__ShopCodeId.length > 0).toBe(true);
    });
});