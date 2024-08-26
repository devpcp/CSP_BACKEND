const config = require('../../config');
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");

const migrateCreateTypeIsStockInProductTypeGroups = async () => {
    const transactionResults = await xSequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await xSequelize.query(
                `
                ALTER TABLE master_lookup.mas_product_type_groups ADD isstock bool NOT NULL DEFAULT true;
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );
            await xSequelize.query(
                `
                COMMENT ON COLUMN master_lookup.mas_product_type_groups.isstock IS 'สถาณะการเรียกใช้เป็นระบบ Stock (false=ไม่นับว่าเป็นStock, true=นับว่าเป็นStock)';
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );
            await xSequelize.query(
                `
                UPDATE master_lookup.mas_product_type_groups
                SET isstock = false
                WHERE group_type_name->>'th' = 'บริการ';
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

migrateCreateTypeIsStockInProductTypeGroups()