require('dotenv').config() // Load ".env" file

const config = require('../../config');
const xSequelize = require("../../db");
const { Transaction, QueryTypes } = require("sequelize");
const { ShopsProfiles } = require('../../models/model');

const migrate_ShopProduct_HaveTag = async () => {
    const transactionResults = await xSequelize.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {

            let get_all_shop = await ShopsProfiles.findAll()

            // console.log(get_all_shop)

            for (let index = 0; index < get_all_shop.length; index++) {
                const element = get_all_shop[index];


                console.log(element.shop_code_id)
                await xSequelize.query(
                    `ALTER TABLE app_shops_datas.dat_${element.shop_code_id.toLowerCase()}_products ADD COLUMN IF NOT EXISTS tags uuid[] NULL;`,
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );

                await xSequelize.query(
                    `COMMENT ON COLUMN app_shops_datas.dat_${element.shop_code_id.toLowerCase()}_products.tags IS 'array ของ id tags';`,
                    {
                        type: QueryTypes.RAW,
                        transaction: transaction
                    }
                );

                // console.log(element)


            }



            return true;
        }
    )
};


module.exports = migrate_ShopProduct_HaveTag;

migrate_ShopProduct_HaveTag()
