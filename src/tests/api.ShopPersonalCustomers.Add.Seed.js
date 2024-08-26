const axios = require("axios").default;

const setOfPreNames = [
    "56202bab-b22e-490c-9a2c-21aa53a306ab",
    "bc3a80df-276d-4c29-ad05-01604e88f7ba",
    "4606a09d-94df-4f89-9e6c-5d0565634eed",
    "e174b323-69ac-4ed8-98f8-7a7f1d3de725",
    "4dee15d3-866f-48e9-a511-315f488e7c33",
    "f67c3d10-5e43-4d0c-8c44-47eb429abefa",
    "9f427917-cdb1-4583-8074-74e3276586b4",
    "cb833b12-0b06-44e5-8629-f70a706009b9",
    "7d0c74b6-9595-4f89-b757-b52774c30035",
    "9df16b18-43c4-478a-ba44-f1bb0615eb8a",
    "e166a170-6a3e-4821-b8bd-fee2c69e015d",
    "3615fb5f-5e4f-43ec-9115-dd14ea644c26",
    "0cddf2fd-2faa-4c5b-9df6-e13b15c81edc",
    "46803a3b-be65-4e94-b3db-f26261dd3cc1",
    "0c5afae2-7230-43d9-b10f-7dd03ae03fc7",
    "f0f0368e-76cb-48b6-8d84-a5f22a5c45c4",
    "b80a136d-7d24-4aa9-8b15-b0055a7dd01e",
    "25870462-c681-42c1-9a2a-1468ba958e19",
    "b5f50ff3-6fc6-496a-9dc8-e84ea9a7f792",
    "2edaa3b0-9a68-4c2b-b823-176201d04f5b",
    "0758c0ff-a7fd-4c65-abc9-b07700ee0501",
    "8f7f77c5-a567-4541-beb0-6680f4845d24",
    "0474457d-5615-4aa5-916e-bc178dc66ba3",
    "e54a1cfa-5a14-43ca-8ea7-5e57bab25467",
    "1985c5d3-fc51-4d18-b104-a213df8c5a07",
    "1621cf6b-1cce-44ee-b7b4-29f0866289ba",
    "a960aeee-f618-4fee-a7b2-fd7255586f9d",
    "fb49a80e-0f28-446d-ab0a-3b8c72d385aa",
    "1c4e37dc-2ecb-4278-b6e5-86918f4a3e3e",
    "f08b4de8-120e-42d5-96fb-6c6de315474f",
    "e2e6d6d1-b1a2-42ee-8f4d-cffaee77e2b3",
    "480a5fc6-907d-4e5d-84a8-4d23323414d2",
    "8c2b9788-b3b5-493c-899d-6fecda073b35",
    "8a487bbf-991e-4770-8032-5f238c80ca76",
    "f9ed2ee2-1056-4581-a834-74fae3a1b349",
    "e1c09dc2-89cb-4650-a4df-c264371f4813",
    "a78b52fc-4cb1-4e51-a7ce-5a222338e066",
    "25e5f1ab-640f-4a60-9daa-ed14c1d06011",
    "dbed5861-1f73-4111-94dc-a1dbe4880f43",
    "0c4852cb-1f08-45fe-b47e-16487b56f538",
    "7aadd5b6-ae67-4989-9fe3-a6eca3c626f7",
    "1ac1f305-ccbd-4f7e-aa02-76aa27dbee03",
    "358150a2-5032-4ec9-8c2d-2c1f130cfe7c",
    "4f06d635-0b11-4163-9d35-28222f9ffb0f",
    "474fbcd3-c8ef-4613-8cc7-ece16c34fd06",
    "ba54d4c5-3bd6-4caa-9f48-40ab37d1bf6b",
    "a8f4c04a-4442-4835-8e5e-6b5f027c956e",
    "695e221b-8322-467d-8fc1-6e15eac64d8d",
    "dff1533e-63c0-467e-8caf-9851f3b40b7d",
    "2c5f44f5-412f-40a9-bb7a-41eeada10bf5",
    "646a461e-711e-43c9-af1f-9a1194a886f9",
    "d6156948-b46e-434b-b955-58cb8b3eefbc",
    "7f3cef24-2f61-4177-8116-fc015f528c83",
    "3e428173-c872-4bc9-8073-d63e7561d3ef",
    "2d6bc671-d8d5-49fa-945b-b8c95289f03f",
    "b8d63f40-6cf0-4821-8468-2e1ed349d62c",
    "73ee6e3c-1a12-4d1e-a5d4-6cecf91f3af5",
    "3d11609e-c81e-4a48-ae9c-e343068a3812",
    "04beafba-2549-4ecd-8998-f18d69a23959",
    "aaf3335e-8bd8-4b01-a61c-f354d31ecd60",
    "5f3f0e3d-84f5-410c-b7f9-d33d220fecfb",
    "d4fdc56b-2049-45cc-a359-ee2d481c4516",
    "aa43a6bf-073a-47d4-9cf3-80521168b2bd",
    "36d19fa4-297e-4676-8a36-d3bb362d025f",
    "40a49333-3001-4d53-b44b-30b861b4171a",
    "ba2c8e86-84b8-44b0-9df5-51deacc238df",
    "84e5f4c3-fed6-4cc0-bc06-5edfaadadec3",
    "ac77aa17-f13a-4f5b-ad0d-c3f60c045d3e",
    "c0c8b166-d017-458e-9fa4-8cd3186cb87a",
    "7db47975-8534-4ac8-8818-59efd2f7e043",
    "381519fe-a0b7-484e-96e7-21b225631f12",
    "6360e50c-6f4d-480f-a590-0cc56623935f",
    "7a0168ef-fad6-4857-9116-44aa4ca60d0b",
    "49aae87a-2ead-4152-8cb9-18e7b232e2c6",
    "6b04c853-e95b-45bf-aa3d-ab4e80f104b3",
    "dcd43a15-5aaa-47ad-b818-66086297bb37",
    "f18de17c-5e3d-4dc0-93d5-1da59f4ebf8d",
    "12715a43-e300-480f-b154-85dd5bb0dee8",
    "5be11334-e24e-42a1-812f-d7452dbc253d",
];

function getRandomInt (max = 1) {
    const dataRand = Math.floor(Math.random() * max);
    if (dataRand < 0) {
        return getRandomInt(max);
    }
    return dataRand;
};

function LeftPadWithZeros(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};

function randomPhoneNumber () {
    return LeftPadWithZeros(Math.floor(100000000 + Math.random() * 900000000), 10);
};

function randomPhoneNumberSets (prefix = "mobile_no_", max = 1) {
    const randomSetOf = getRandomInt(max + 1);
    const setOfPhoneNumbers = {};
    for (let i = 0; i < randomSetOf; i++) {
        setOfPhoneNumbers[`mobile_no_${i + 1}`] = randomPhoneNumber();
    }
    return setOfPhoneNumbers;
};

((
    async () => {

        const testAxiosHeader = {
            'Content-Type': 'application/json',
            'User-Agent': 'Postman',
            'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NTMyNzM5ODgxMDcsImV4cCI6MTY1MzI3NzU4ODEwNywic2NvcGUiOiJkZWZhdWx0IiwiY2xpZW50X2lkIjoiIiwiYXVkIjoiIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAxIiwic3ViIjoiZGEyYmE5ZTItZmE1Ny00ZGNjLTkyNGItNjM5N2YzZTY5NjkzIiwianRpIjoiYmZkNGRhYmYtMzhiNi00NjU1LTgxZTItMDRkNTVkZmExOTQyIn0.ehkhpTuU9kRz-GvukPo0hLQ2GNh-CamNmn7FdMnrLgk'
        };

        const preMockPersonalData = await axios({
            url: "https://kidhaina.com/json/thainames.json"
        }).then(r => {
            return {
                firstnameMale: r.data.firstnameMale,
                firstnameFemale: r.data.firstnameFemale,
                lastname: r.data.lastname
            };
        });

        const setOfCustomers = [];
        for (let index = 0; index < preMockPersonalData.lastname.length; index++) {
            const element = preMockPersonalData.lastname[index];
            const hasFamily = getRandomInt(4);
            for (let i = 0; i < hasFamily; i++) {
                const customerName = {
                    firstname: '',
                    lastname: element,
                };
                const isMaleOrFemale = getRandomInt(2);
                if (isMaleOrFemale < 1) {
                    customerName.firstname = preMockPersonalData.firstnameMale[getRandomInt(preMockPersonalData.firstnameMale.length - 1)];
                }
                else {
                    customerName.firstname = preMockPersonalData.firstnameFemale[getRandomInt(preMockPersonalData.firstnameFemale.length - 1)];
                }
                setOfCustomers.push(customerName);
            }

        }
        for (let index = 0; index < preMockPersonalData.firstnameMale.length; index++) {
            const element = preMockPersonalData.firstnameMale[index];
            const hasFamily = getRandomInt(4);
            for (let i = 0; i < hasFamily; i++) {
                const customerName = {
                    firstname: '',
                    lastname: element,
                };
                const isMaleOrFemale = getRandomInt(2);
                if (isMaleOrFemale < 1) {
                    customerName.firstname = preMockPersonalData.firstnameMale[getRandomInt(preMockPersonalData.firstnameMale.length - 1)];
                }
                else {
                    customerName.firstname = preMockPersonalData.firstnameFemale[getRandomInt(preMockPersonalData.firstnameFemale.length - 1)];
                }
                setOfCustomers.push(customerName);
            }
        }
        for (let index = 0; index < preMockPersonalData.firstnameFemale.length; index++) {
            const element = preMockPersonalData.firstnameFemale[index];
            const hasFamily = getRandomInt(4);
            for (let i = 0; i < hasFamily; i++) {
                const customerName = {
                    firstname: '',
                    lastname: element,
                };
                const isMaleOrFemale = getRandomInt(2);
                if (isMaleOrFemale < 1) {
                    customerName.firstname = preMockPersonalData.firstnameMale[getRandomInt(preMockPersonalData.firstnameMale.length - 1)];
                }
                else {
                    customerName.firstname = preMockPersonalData.firstnameFemale[getRandomInt(preMockPersonalData.firstnameFemale.length - 1)];
                }
                setOfCustomers.push(customerName);
            }
        }

        for (let index = 0; index < setOfCustomers.length; index++) {
            const addCustomers = await axios({
                url: "http://localhost:5001/api/shopPersonalCustomers/add",
                method: "POST",
                headers: testAxiosHeader,
                data: JSON.stringify({
                    "id_card_number": LeftPadWithZeros(getRandomInt(9999999999999), 13).toString(),
                    "name_title_id": setOfPreNames[getRandomInt(setOfPreNames.length - 1)],
                    "customer_name": {
                        "first_name": {
                            "th": setOfCustomers[index].firstname.th
                        },
                        "last_name": {
                            "th": setOfCustomers[index].lastname.th
                        }
                    },
                    "tel_no": {},
                    "mobile_no": {
                        ...randomPhoneNumberSets("mobile_no_", 4)
                    },
                    "e_mail": null,
                    "subdistrict_id": null,
                    "district_id": null,
                    "province_id": null,
                    "other_details": {
                        "contact_name": null
                    },
                    "master_customer_code_id": ""
                })
            });

            console.log(`[${index+1}/${setOfCustomers.length}] :`, setOfCustomers[index].firstname.th, setOfCustomers[index].lastname.th)
        }
    }
)());