const config = require('../../config');
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");

const migrate_ReBuild_CodeId_ShopInventoryTransactionDoc = async ({ transaction }) => {
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
                            UPDATE app_shops_datas.dat_'||lower(FFF.shop_code_id)||'_inventory_transaction_doc AS z
                            SET code_id = (
                            SELECT REPLACE(x.code_id, y.code_id, y.internal_code_id)
                                FROM app_shops_datas.dat_'||lower(FFF.shop_code_id)||'_inventory_transaction_doc AS x
                                JOIN master_lookup.mas_document_types AS y ON x.doc_type_id = y.id
                                WHERE z.id = x.id
                            );
                            ';
                            EXECUTE '
                            UPDATE app_shops_datas.dat_'||lower(FFF.shop_code_id)||'_inventory_transaction_doc AS z
                            SET code_id = (
                            SELECT REPLACE(x.code_id, y.code_id, y.internal_code_id)
                                FROM app_shops_datas.dat_'||lower(FFF.shop_code_id)||'_inventory_transaction_doc AS x
                                JOIN master_lookup.mas_document_types AS y ON x.doc_type_id = y.id
                                WHERE z.id = x.id
                            );
                            ';
                            EXECUTE '
                            UPDATE app_shops_datas.dat_'||lower(FFF.shop_code_id)||'_inventory_transaction_doc AS z
                            SET code_id = (
                            SELECT REPLACE(x.code_id, '||(E'\\'XX\\'')::text||', y.internal_code_id)
                                FROM app_shops_datas.dat_'||lower(FFF.shop_code_id)||'_inventory_transaction_doc AS x
                                JOIN master_lookup.mas_document_types AS y ON x.doc_type_id = y.id
                                WHERE z.id = x.id
                            )
                            WHERE z.code_id LIKE '||(E'\\'XX\\%\\'')::text||';
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


module.exports = migrate_ReBuild_CodeId_ShopInventoryTransactionDoc;
