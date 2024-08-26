const config = require('../../config');
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");

const migrate_bus_partner_id_to_nullable = async ({ transaction }) => {
    const transactionResults = await xSequelize.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {

            await xSequelize.query(
                `
                DO $$
                    -- START Declare User Defined --
                    DECLARE shop_code text := '%01HQ%';
                    DECLARE FFF RECORD;
                    BEGIN
                        FOR FFF IN
                            SELECT shop_code_id from app_datas.dat_shops_profiles 
                            WHERE shop_code_id LIKE shop_code
                        LOOP
                            EXECUTE '
                                ALTER TABLE app_shops_datas.dat_'||lower(FFF.shop_code_id)||'_inventory_transaction_doc ALTER COLUMN bus_partner_id DROP NOT NULL
                            ';

                            EXECUTE '
                                COMMENT ON COLUMN app_shops_datas.dat_'||lower(FFF.shop_code_id)||'_inventory_transaction_doc.status IS '||(E'\\' สถานะการนำเข้าสินค้าสู่คลัง 0 = ยกเลิก, 1 = นำเข้าปกติ, 2 = ปรับเพิ่ม, 3 = ปรับลด\\'')::text||'
                            ';
                    
                        END LOOP;
                END $$;
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


module.exports = migrate_bus_partner_id_to_nullable;
