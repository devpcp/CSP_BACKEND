// # Tools สำหรับ Map Data ของ WYZAuto กับของ CSP ว่ามีอันไหนตรงกันบ้าง

require('dotenv').config() // Load ".env" file
const config = require("../../config");
const _ = require("lodash")
const path = require("path");
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");
const modelShopProfile = require("../../models/ShopsProfiles/ShopsProfiles");



const clear_business_type = async () => {

    const transactionResults = await xSequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {

            let shop_all = await modelShopProfile.findAll()

            let test = ``

            for (let index = 0; index < shop_all.length; index++) {
                const element = shop_all[index];

                await xSequelize.query(
                    `
                    UPDATE app_shops_datas.dat_${element.shop_code_id}_business_customers
                    SET bus_type_id = (
                        CASE 
                            WHEN bus_type_id in ('9329f5e1-44e8-4be7-b47c-b8ef11b5dbea','8df85dcb-16b1-41cc-83ab-97a065193ebd',
                                '8b915e2b-5780-4698-b971-bdc8b0cee797','60c4db32-e085-4bb8-a841-016b6a611cc1',
                                '0ac2927e-ed30-45bf-bb18-cf0b0bc0a7c0','1838ea6b-706e-4276-8b28-fa7afc03ec63',
                                'dbb75f14-fd7a-485c-94f5-a515f23b8817','963c03d3-1339-4301-9bce-a17fd9ea3c94',
                                '65a9bcd8-4be3-49d4-9a34-b9ec83a2c774','b26a466e-7879-4a38-ae06-af131b9d97fe',
                                'afa47d68-ffae-464c-915f-851f639230f8','4d7d7e47-0b1b-46c6-810a-c37bb8146af7',
                                '389436ce-5251-441d-84dd-c92e9c40e9a2','20c01ef0-7c6f-40ca-b41d-da7868e08bc9')
                            THEN '20c01ef0-7c6f-40ca-b41d-da7868e08bc9' 

                            WHEN bus_type_id in ('54e00825-47f6-4fee-84b8-959e68c03dc0','cd219bbc-5e06-4a0b-9ceb-e0a16129d391',
                                '1a04f82e-72c5-4847-972c-88a54c2fdcf4')
                            THEN '1a04f82e-72c5-4847-972c-88a54c2fdcf4'

                            WHEN bus_type_id in ('a0065cf1-2e70-4d04-b087-35f4d8b8a05a','302b8110-d6c2-448d-a205-ddcf0bead1ea',
                                'f96e4793-b230-4f29-ab22-0f1f415e1134','de2a71fd-29c8-4216-a1d2-6925fd05157c',
                                '3cbbca61-616f-4d28-97d8-66511b100f7b','692d1304-1657-4572-8f83-26af2721a0e9',
                                '3c43139c-2aa8-4264-bc7d-aa0900d3f5eb','8363865e-b316-45a9-8ca3-bed14a39d269',
                                '2e397519-6bac-420e-bd76-c909d03ec580','bb94ba3f-33dd-4be1-a232-3d82bfb1b47b')
                            THEN 'bb94ba3f-33dd-4be1-a232-3d82bfb1b47b'

                            WHEN bus_type_id in ('0c83d5da-cf29-4c3d-b5ff-15e0cfac3727','01acf1c0-8b23-445e-95d9-61e0b9c59808' )
                            THEN '01acf1c0-8b23-445e-95d9-61e0b9c59808' 

                            WHEN bus_type_id in ('a0b97eb6-b640-4e1c-9c8e-c8018c29e6bb','a25d676d-5f97-4fd5-b452-f29b8370e1b0',
                                '5111e836-2ff5-485f-8576-07263d529ef2','2fd331c5-5554-4a0b-8f94-270e3a347254',
                                '8c5e901d-dbbb-4757-87a8-6ad4b6d5c329','9e7af0ff-ae51-490c-8001-e3a02bf9720b',
                                'd3ad110d-c913-4f19-94ec-2aca0a146c84','eda0d232-3d66-4497-9df7-8c334ecb8012',
                                '08c95736-a633-4ff9-816b-d63483d0d176','fe418b35-5cef-4d16-8b5c-888014492ffa',
                                'aa7ffca5-602e-4db2-8b04-417f0f242226','df6c1d95-b889-4534-b219-71fcb46e0c89')
                            THEN 'df6c1d95-b889-4534-b219-71fcb46e0c89' 

                            WHEN bus_type_id in ('0f814610-a574-4472-8280-93962fd46544')
                            THEN '0f814610-a574-4472-8280-93962fd46544' 

                            WHEN bus_type_id in ('0808cded-4749-43cb-9ddc-638f0cc6f412')
                            THEN '0808cded-4749-43cb-9ddc-638f0cc6f412'

                            ELSE null
                        END)::uuid
                    `,
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );


                await xSequelize.query(
                    `
                    UPDATE app_shops_datas.dat_${element.shop_code_id}_business_partners
                    SET bus_type_id = (
                        CASE 
                            WHEN bus_type_id in ('9329f5e1-44e8-4be7-b47c-b8ef11b5dbea','8df85dcb-16b1-41cc-83ab-97a065193ebd',
                                '8b915e2b-5780-4698-b971-bdc8b0cee797','60c4db32-e085-4bb8-a841-016b6a611cc1',
                                '0ac2927e-ed30-45bf-bb18-cf0b0bc0a7c0','1838ea6b-706e-4276-8b28-fa7afc03ec63',
                                'dbb75f14-fd7a-485c-94f5-a515f23b8817','963c03d3-1339-4301-9bce-a17fd9ea3c94',
                                '65a9bcd8-4be3-49d4-9a34-b9ec83a2c774','b26a466e-7879-4a38-ae06-af131b9d97fe',
                                'afa47d68-ffae-464c-915f-851f639230f8','4d7d7e47-0b1b-46c6-810a-c37bb8146af7',
                                '389436ce-5251-441d-84dd-c92e9c40e9a2','20c01ef0-7c6f-40ca-b41d-da7868e08bc9' )
                            THEN '20c01ef0-7c6f-40ca-b41d-da7868e08bc9' 

                            WHEN bus_type_id in ('54e00825-47f6-4fee-84b8-959e68c03dc0','cd219bbc-5e06-4a0b-9ceb-e0a16129d391',
                                '1a04f82e-72c5-4847-972c-88a54c2fdcf4')
                            THEN '1a04f82e-72c5-4847-972c-88a54c2fdcf4'

                            WHEN bus_type_id in ('a0065cf1-2e70-4d04-b087-35f4d8b8a05a','302b8110-d6c2-448d-a205-ddcf0bead1ea',
                                'f96e4793-b230-4f29-ab22-0f1f415e1134','de2a71fd-29c8-4216-a1d2-6925fd05157c',
                                '3cbbca61-616f-4d28-97d8-66511b100f7b','692d1304-1657-4572-8f83-26af2721a0e9',
                                '3c43139c-2aa8-4264-bc7d-aa0900d3f5eb','8363865e-b316-45a9-8ca3-bed14a39d269',
                                '2e397519-6bac-420e-bd76-c909d03ec580','bb94ba3f-33dd-4be1-a232-3d82bfb1b47b')
                            THEN 'bb94ba3f-33dd-4be1-a232-3d82bfb1b47b'

                            WHEN bus_type_id in ('0c83d5da-cf29-4c3d-b5ff-15e0cfac3727','01acf1c0-8b23-445e-95d9-61e0b9c59808')
                            THEN '01acf1c0-8b23-445e-95d9-61e0b9c59808' 

                            WHEN bus_type_id in ('a0b97eb6-b640-4e1c-9c8e-c8018c29e6bb','a25d676d-5f97-4fd5-b452-f29b8370e1b0',
                                '5111e836-2ff5-485f-8576-07263d529ef2','2fd331c5-5554-4a0b-8f94-270e3a347254',
                                '8c5e901d-dbbb-4757-87a8-6ad4b6d5c329','9e7af0ff-ae51-490c-8001-e3a02bf9720b',
                                'd3ad110d-c913-4f19-94ec-2aca0a146c84','eda0d232-3d66-4497-9df7-8c334ecb8012',
                                '08c95736-a633-4ff9-816b-d63483d0d176','fe418b35-5cef-4d16-8b5c-888014492ffa',
                                'aa7ffca5-602e-4db2-8b04-417f0f242226','df6c1d95-b889-4534-b219-71fcb46e0c89')
                            THEN 'df6c1d95-b889-4534-b219-71fcb46e0c89' 

                            WHEN bus_type_id in ('0f814610-a574-4472-8280-93962fd46544')
                            THEN '0f814610-a574-4472-8280-93962fd46544' 

                            WHEN bus_type_id in ('0808cded-4749-43cb-9ddc-638f0cc6f412')
                            THEN '0808cded-4749-43cb-9ddc-638f0cc6f412'

                            ELSE null
                        END)::uuid
                    `,
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );

                if (index !== shop_all.length - 1) {
                    test = test + `
                        select bus_type_id from app_shops_datas.dat_` + element.shop_code_id + `_business_customers union
                        select bus_type_id from app_shops_datas.dat_` + element.shop_code_id + `_business_partners union
                        `
                } else {
                    test = test + `
                        select bus_type_id from app_shops_datas.dat_` + element.shop_code_id + `_business_customers union
                        select bus_type_id from app_shops_datas.dat_` + element.shop_code_id + `_business_partners
                        `
                }
            }

            await xSequelize.query(
                `
                delete from master_lookup.mas_business_types 
                where id not in (
                    select bus_type_id as id from
                    ( ${test}
                    group by bus_type_id) as t
                    where bus_type_id is not null
                )
                and id not in (
                    '0f814610-a574-4472-8280-93962fd46544',
                    'df6c1d95-b889-4534-b219-71fcb46e0c89',
                    '01acf1c0-8b23-445e-95d9-61e0b9c59808',
                    'bb94ba3f-33dd-4be1-a232-3d82bfb1b47b',
                    '1a04f82e-72c5-4847-972c-88a54c2fdcf4',
                    '20c01ef0-7c6f-40ca-b41d-da7868e08bc9',
                    '0808cded-4749-43cb-9ddc-638f0cc6f412'
                )
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );


            return true;
        }
    )

    console.log("success")
    return
};

clear_business_type()