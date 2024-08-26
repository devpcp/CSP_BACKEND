const config = require("../../config");
const _ = require("lodash")
const path = require("path");
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");

const add_detail_column_user_profile = async ({ transaction }) => {
    const transactionResults = await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async () => {

            await xSequelize.query(
                `
                ALTER TABLE app_datas.dat_users_profiles ADD details jsonb DEFAULT '{}';
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


module.exports = add_detail_column_user_profile;