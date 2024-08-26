const { Transaction, QueryTypes } = require("sequelize");
const config = require('../../config');
const db = require("../../db");
const User = require('../../models/Users/User');
const ShopsProfiles = require('../../models/ShopsProfiles/ShopsProfiles');
const UsersProfiles = require('../../models/UsersProfiles/UsersProfiles');
const ShopHq = require("../../models/ShopHq/ShopHq");
const MatchShopHq = require("../../models/MatchShopHq/MatchShopHq");
const ProductOwner = require("../../models/ProductOwner/ProductOwner");

const migrateHq = async ({ transaction }) => {
    return await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await db.query(
                `
                    ALTER TABLE "app_datas"."dat_users_profiles" 
                        DROP COLUMN IF EXISTS "hq_id";
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );
            await ShopHq.sync({
                alter: false,
                force: true,
                transaction: transaction
            });
            await MatchShopHq.sync({
                alter: false,
                force: true,
                transaction: transaction
            });
            await ProductOwner.sync({
                alter: false,
                force: true,
                transaction: transaction
            });
            await db.query(
                `
                    ALTER TABLE "app_datas"."dat_users_profiles" 
                        ADD COLUMN "hq_id" UUID DEFAULT NULL 
                            REFERENCES "app_datas"."dat_shop_hq" ("id") 
                                ON DELETE SET NULL 
                                ON UPDATE CASCADE; 
                    COMMENT ON COLUMN "app_datas"."dat_users_profiles"."hq_id" IS '${UsersProfiles.getAttributes().hq_id.comment}';
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );
        }
    );
};

migrateHq({ transaction: null});


module.exports = migrateHq;
