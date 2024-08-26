const axios = require("axios").default;
const thaiAlphabet = ['ก', 'ข', 'ฃ', 'ค', 'ฅ', 'ฆ', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ',];

/**
 * It returns a random integer between 0 and max.
 * @param {number} [max=1] - The maximum number that can be returned.
 * @returns {number} A random number between 0 and max
 */
function getRandomInt (max = 1) {
    const dataRand = Math.floor(Math.random() * max);
    if (dataRand < 0) {
        return getRandomInt(max);
    }
    return dataRand;
};

/**
 * It generates a random Thai car plate number.
 * @param {number} [max=2] - The maximum number of characters to be generated.
 * @param {string[]} [dataSet] - This is an array of car plate ids that you want to avoid.
 * @param {number} [retry=5] - The number of times to retry if the generated car plate id is already in the data set.
 * @returns {string} A function that returns a random Thai car plate number.
 */
function getPrefixThaiCarPlate (max = 2, dataSet = [], retry = 5) {
    if (retry <= 0) {
        throw Error(`getPrefixThaiCarPlate is Out of retry`);
    }

    if (max !== 1 && max !== 2) {
        if (max <= 1) {
            return getPrefixThaiCarPlate(1, dataSet, retry - 1);
        }
        else {
            return getPrefixThaiCarPlate(2, dataSet, retry - 1);
        }
    }

    let collectedCarsis = '';
    for (let index = 1; index <= max; index++) {
        const randomMaxCharsis = thaiAlphabet[getRandomInt(thaiAlphabet.length - 1)];
        collectedCarsis += randomMaxCharsis;
    }

    const carPlateId = collectedCarsis + getRandomInt(9999);

    if (dataSet.length > 0 && dataSet.findIndex(w => w === carPlateId) >= 0) {
        return getPrefixThaiCarPlate(max, dataSet, retry - 1);
    }
    else {
        return carPlateId;
    }
};


((async () => {
    /**
     * @type {string[]}
     */
    const carPlateDB = [];
    /**
     * Main Line to add
     * @type {{customerId: string; setOfCustomerCarPlates: number[]}[]}
     */
    const customerPreSet = [];


    const axiosHeader = {
        'User-Agent': 'Postman',
        'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NTMzNjQzMTAyOTksImV4cCI6MTY1MzM2NzkxMDI5OSwic2NvcGUiOiJkZWZhdWx0IiwiY2xpZW50X2lkIjoiIiwiYXVkIjoiIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAxIiwic3ViIjoiZGEyYmE5ZTItZmE1Ny00ZGNjLTkyNGItNjM5N2YzZTY5NjkzIiwianRpIjoiYjMzOWE2ZDUtYWI4Yy00ODU3LTg5YTktNTkwODYzY2RkODcwIn0.C4tEg4Fv19rECElQaASd1Nxz4bwF9D0A9ib87p2qEfU'
    };

    /**
     * @type {Array<string>}
     */
    const getPersonalCustomersId = await axios({
        url: "http://localhost:5001/api/shopPersonalCustomers/all?limit=9999&page=1&sort=customer_name.th&order=desc&status=default",
        method: "GET",
        headers: {
            ...axiosHeader
        }
    }).then(r => {
        if (r.data.status !== 'success') { throw Error(`Get user failed`); }
        else {
            return r.data.data.data.map(w => w.id);
        }
    });

    for (let index = 0; index < getPersonalCustomersId.length; index++) {
        const element = getPersonalCustomersId[index];
        /**
         * @type {{customerId: string; setOfCustomerCarPlates: number[]}}
         */
        const customerPreObject = {
            customerId: element,
            setOfCustomerCarPlates: []
        };
        const customerHasCarCounts = getRandomInt(10) + 1;
        for (let x = 0; x < customerHasCarCounts; x++) {
            const customerCarPlateId = getPrefixThaiCarPlate(2, carPlateDB, 5);
            customerPreObject.setOfCustomerCarPlates.push(carPlateDB.push(customerCarPlateId))
        }
        customerPreSet.push(customerPreObject);
    }

    for (let index = 0; index < customerPreSet.length; index++) {
        const element_customerPreSet = customerPreSet[index];
        const customerId = element_customerPreSet.customerId;
        for (let x = 0; x < element_customerPreSet.setOfCustomerCarPlates.length; x++) {
            const element_x = element_customerPreSet.setOfCustomerCarPlates[x];
            const customerCarPlate = carPlateDB[element_x];
            const axiosBodyData = {
                "details": {
                    "color": "",
                    "mileage": "",
                    "mileage_old": "",
                    "mileage_first": "",
                    "avg_registration_day": "",
                    "service_date_last": "",
                    "service_date_first": "",
                    "province_name": "กรุงเทพมหานคร",
                    "registration": customerCarPlate,
                    "remark": "",
                    "serial_number": "",
                    "chassis_number": "",
                    "cc_engine_size": ""
                },
                "vehicle_type_id": "11194154-a210-4421-9cf6-048cf1f3b824",
                "vehicle_brand_id": "542cfeb7-33d3-4db9-b2cc-5c9e3bc3d4e4",
                "vehicle_model_id": "de75f2a0-34ea-4942-a46b-8a92fd8da8fd",
                "per_customer_id": customerId,
                "master_customer_code_id": ""
            };

            const apiShopVehicleCustomerAdd = await axios({
                url: "http://localhost:5001/api/shopVehicleCustomer/add",
                method: "POST",
                headers: {
                    ...axiosHeader,
                    'Content-Type': 'application/json',
                },
                data: axiosBodyData
            });

            console.log(`[${index+1}/${customerPreSet.length}] :`, `[${x + 1}/${element_customerPreSet.setOfCustomerCarPlates.length}] :`, customerPreSet[index]);
        }

        console.log(`[${index+1}/${customerPreSet.length}] :`, customerPreSet[index]);
    }
})())