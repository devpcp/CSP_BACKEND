const config = require('../../config');
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");

const migrate_Product_HaveColumn_ProductCode = async () => {
    const transactionResults = await xSequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await xSequelize.query(
                `ALTER TABLE app_datas.dat_products ADD product_code varchar;`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `COMMENT ON COLUMN app_datas.dat_products.product_code IS 'รหัสสินค้า';`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `ALTER TABLE app_datas.dat_products ADD CONSTRAINT unique_product_code UNIQUE (product_code);`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            return true;
        }
    )
};


module.exports = migrate_Product_HaveColumn_ProductCode;
