// # Tools สำหรับ Map Data ของ WYZAuto กับของ CSP ว่ามีอันไหนตรงกันบ้าง

const config = require("../../config");
const _ = require("lodash")
const path = require("path");
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");



const add_detail_column_user_profile = async () => {
    const transactionResults = await xSequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async () => {

            await xSequelize.query(
                `
                ALTER TABLE app_datas.dat_users_profiles ADD details json DEFAULT '{}';
                `,
                {
                    type: QueryTypes.RAW,
                }
            );
            await xSequelize.query(
                `
                COMMENT ON COLUMN app_datas.dat_users_profiles.details IS 'ข้อมูลรายละเอียด JSON \n {\n "code":0011,\n "data1":"...."\n }' ;
                `,
                {
                    type: QueryTypes.RAW,
                }
            );


            return true;
        }
    )

    console.log("success")
    return
};

add_detail_column_user_profile()