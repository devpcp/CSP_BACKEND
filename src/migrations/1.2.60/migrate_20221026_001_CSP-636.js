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
                `ALTER TABLE app_datas.dat_products ADD wyz_code varchar NULL;`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `COMMENT ON COLUMN app_datas.dat_products.wyz_code IS 'โค้ด SKU อ้างอิง ของ WYZAuto';`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `CREATE UNIQUE INDEX dat_products_wyz_code_idx ON app_datas.dat_products (wyz_code);`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            return true;
        }
    )
};


module.exports = migrate_AlterTableProduct_ColumnWYZCode;
