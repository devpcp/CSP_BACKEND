require('dotenv').config(); // Load ".env" file
const config = require('../../config');
const { Transaction, QueryTypes } = require("sequelize");
const db = require("../../db");

const migrateModel__UserProfile = async ({ transaction }) => {
    console.time('Migration-Run');
    const {
        UsersProfiles
    } = require("../../models/model");

    const transactionResults = await db.transaction(
        {
            transaction: transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            await db.query(
                `
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_created_user_id;
                
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_department;
                
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_dist_id;
                
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_name_title_id;
                
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_prov_id;
                
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_shop_id;
                
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_subdist_id;
                
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_updated_user_id;
                
                alter table app_datas.dat_users_profiles
                    drop constraint if exists fk_dup_user_id;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_user_id_fkey;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_name_title_fkey;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_subdistrict_id_fkey;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_district_id_fkey;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_province_id_fkey;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_shop_id_fkey;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_created_by_fkey;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_updated_by_fkey;

                alter table app_datas.dat_users_profiles drop constraint if exists dat_users_profiles_hq_id_fkey;

                drop index if exists app_datas.dat_users_profiles_user_id_shop_id_unique;
                `,
                {
                    type: QueryTypes.RAW,
                    transaction: transaction
                }
            );
            await UsersProfiles.sync({
                alter: true,
                transaction: transaction
            })
        }
    );

    console.timeEnd('Migration-Run');
    return transactionResults;
};

migrateModel__UserProfile({ transaction: null });

module.exports = migrateModel__UserProfile;