const config = require('../../config');
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");

const migrate_VehicleBrand_HaveRunNumber = async () => {
    const transactionResults = await xSequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await xSequelize.query(
                `ALTER TABLE master_lookup.mas_vehicles_brands ADD run_no integer;`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `COMMENT ON COLUMN master_lookup.mas_vehicles_brands.run_no IS 'เลขที่ run เอกสาร';`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `ALTER TABLE master_lookup.mas_vehicles_brands ADD internal_code_id varchar NULL;`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `COMMENT ON COLUMN master_lookup.mas_vehicles_brands.code_id IS 'รหัสควบคุมประเภทยานพาหนะ (ภายใน)';`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `
                UPDATE master_lookup.mas_vehicles_brands AS A
                SET internal_code_id = B.code_id
                FROM master_lookup.mas_vehicles_brands AS B
                WHERE A.id = B.id;
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `
                DO $$
                -- START Declare User Defined --
                -- ### Doctype prefix when you wants to find, if you dont wants go to fill null
                DECLARE USERDefined_DN_ID UUID := null;
                -- ### Doctype prefix when you wants is not found, if you dont wants go to fill ''
                DECLARE USERDefined_DN_DEFAULT VARCHAR := '${config.config_run_number_master_vehicle_brand_prefix}';
                -- ### Timezone when you wants to split, if you dont wants go to fill null
                DECLARE USERDefined_Timezone VARCHAR := 'Asia/Bangkok';
                -- END Declare User Defined --
                DECLARE DN VARCHAR := COALESCE((SELECT code_id FROM master_lookup.mas_document_types WHERE id = USERDefined_DN_ID LIMIT 1), USERDefined_DN_DEFAULT);
                DECLARE SPEC_TIMEZONE VARCHAR := COALESCE(USERDefined_Timezone, 'Asia/Bangkok');
                DECLARE FFF RECORD;
                DECLARE III RECORD;
                DECLARE ROW_RUN INTEGER := 0;
                DECLARE CHECKPOINT_YEAR VARCHAR(4) := '';
                DECLARE CODEID_TO_UPDATE VARCHAR := '';
                BEGIN    
                    -- Iration #1: Group by Year
                    FOR FFF IN
                        SELECT extract(year FROM A.created_date at time zone USERDefined_Timezone)::VARCHAR(4) AS LAPPOINT_YEAR
                            FROM master_lookup.mas_vehicles_brands AS A
                            GROUP BY extract(year FROM A.created_date at time zone USERDefined_Timezone)::VARCHAR(4)
                            ORDER BY extract(year FROM A.created_date at time zone USERDefined_Timezone)::VARCHAR(4) ASC
                    LOOP
                        IF (CHECKPOINT_YEAR != FFF.LAPPOINT_YEAR) THEN
                            CHECKPOINT_YEAR = FFF.LAPPOINT_YEAR;
                            ROW_RUN = 0;
                        END IF;
                        -- Iration #2: Data extract and update rows
                        FOR III IN
                            SELECT B.id, B.created_date FROM master_lookup.mas_vehicles_brands AS B
                                WHERE extract(year FROM B.created_date at time zone USERDefined_Timezone)::VARCHAR(4) = CHECKPOINT_YEAR
                                ORDER BY B.created_date ASC
                        LOOP
                            ROW_RUN = ROW_RUN + 1;
                            CODEID_TO_UPDATE = DN || substring(CHECKPOINT_YEAR, 3, 2) || CASE WHEN LENGTH(ROW_RUN::text) <= 3 THEN LPad(ROW_RUN::text, 3, '0') ELSE LPad(ROW_RUN::text, LENGTH(ROW_RUN::text), '0') END;
                
                            RAISE NOTICE 'Id: % | Number: % | RunNuber: %', III.id,  ROW_RUN, CODEID_TO_UPDATE;
                
                            UPDATE master_lookup.mas_vehicles_brands AS AX
                                SET run_no = ROW_RUN, code_id = CODEID_TO_UPDATE
                                WHERE AX.id = III.id;
                
                            CODEID_TO_UPDATE = '';
                        END LOOP;
                    END LOOP;
                END $$;
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `ALTER TABLE master_lookup.mas_vehicles_brands ALTER COLUMN code_id SET NOT NULL;`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            await xSequelize.query(
                `ALTER TABLE master_lookup.mas_vehicles_brands ALTER COLUMN run_no SET NOT NULL;`,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );

            return true;
        }
    )
};


module.exports = migrate_VehicleBrand_HaveRunNumber;
