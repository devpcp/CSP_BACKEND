const config = require('../../config');
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");

const migrateDropDepartmentIdColumnFromUserProfile = async () => {
    const transactionResults = await xSequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await xSequelize.query(
                `
                ALTER TABLE app_datas.dat_users_profiles DROP COLUMN department_id;
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            return true;
        }
    )
};

migrateDropDepartmentIdColumnFromUserProfile()