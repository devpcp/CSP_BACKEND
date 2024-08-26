const config = require('../../config');
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");

const migrate_AlterTableProduct_ColumnWYZCode = async (transaction = null) => {
    const transactionResults = await xSequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
            transaction: transaction
        },
        async (transaction) => {
            await xSequelize.query(
                `DROP INDEX IF EXISTS app_datas.dat_products_wyz_code_idx;`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            return true;
        }
    )
};


// module.exports = migrate_AlterTableProduct_ColumnWYZCode;
migrate_AlterTableProduct_ColumnWYZCode()