


const config = require('../../config');
const Product = require('../../models/Product/Product');
const User = require('../../models/Users/User');
const ShopsProfiles = require('../../models/ShopsProfiles/ShopsProfiles');
const UsersProfiles = require('../../models/UsersProfiles/UsersProfiles');
const bindUserToShop = async () => {

    let data = [
        {
            "user_name": "DI002",
            "shop_code_id": "01HQ0006"
        },
        {
            "user_name": "DI003",
            "shop_code_id": "01HQ0006"
        },
        {
            "user_name": "DI004",
            "shop_code_id": "01HQ0006"
        },
        {
            "user_name": "DI005",
            "shop_code_id": "01HQ0006"
        }
    ]

    let user_all = await User.findAll({})
    let shop_all = await ShopsProfiles.findAll({})

    let data_create = []

    for (let el of data) {

        let check_user = user_all.filter(el1 => { return el1.user_name == el.user_name })
        let check_shop = shop_all.filter(el1 => { return el1.shop_code_id == el.shop_code_id })

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
        })



    }

    await UsersProfiles.bulkCreate(data_create)
}

bindUserToShop()