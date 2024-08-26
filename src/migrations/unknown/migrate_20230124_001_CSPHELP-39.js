const { Transaction } = require("sequelize");
const config = require('../../config');
const db = require("../../db");
const User = require('../../models/Users/User');
const ShopsProfiles = require('../../models/ShopsProfiles/ShopsProfiles');
const UsersProfiles = require('../../models/UsersProfiles/UsersProfiles');

const bindUserToShop = async () => {
    return await db.transaction(
        {
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            const data = [
                {
                    "user_name": "APA002",
                    "shop_code_id": "01HQ0007"
                },
                {
                    "user_name": "APA003",
                    "shop_code_id": "01HQ0007"
                },
                {
                    "user_name": "APA004",
                    "shop_code_id": "01HQ0007"
                },
                {
                    "user_name": "APA005",
                    "shop_code_id": "01HQ0007"
                }
            ];

            const [user_all, shop_all] = await Promise.all([
                User.findAll({ transaction: transaction }),
                ShopsProfiles.findAll({ transaction: transaction })
            ]);

            const data_create = []

            for (const el of data) {
                const [check_user, check_shop] = await Promise.all([
                    user_all.filter(el1 => { return el1.user_name === el.user_name }),
                    shop_all.filter(el1 => { return el1.shop_code_id === el.shop_code_id })
                ]);

                data_create.push({
                    user_id: check_user[0].id,
                    name_title: '7a0168ef-fad6-4857-9116-44aa4ca60d0b',
                    fname: { th: check_user[0].user_name },
                    lname: { th: '-' },
                    id_code: null,
                    tel: null,
                    mobile: null,
                    address: null,
                    subdistrict_id: null,
                    district_id: null,
                    province_id: null,
                    shop_id: check_shop[0].id,
                    isuse: 1,
                    created_by: '90f5a0a9-a111-49ee-94df-c5623811b6cc',
                    created_date: new Date(),
                    updated_by: null,
                    updated_date: null,
                    department_id: null
                });
            }

            return await UsersProfiles.bulkCreate(data_create, { transaction: transaction });
        }
    );
}

bindUserToShop()
    .then(r => r)
    .catch(e => {
        throw(e)
    });