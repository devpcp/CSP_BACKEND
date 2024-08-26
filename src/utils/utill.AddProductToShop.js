require('dotenv').config() // Load ".env" file

const config = require("../config")

const Product = require("../models/Product/Product")
const ShopInventoryTransaction = require("../models/ShopInventoryTransaction/ShopInventoryTransaction")
const ShopsProfiles = require("../models/ShopsProfiles/ShopsProfiles")
const ShopProduct = require("../models/ShopProduct/ShopProduct")
const ShopInventory = require("../models/ShopInventory/ShopInventory")
const UsersProfiles = require("../models/UsersProfiles/UsersProfiles")
const sequelize = require("../db")
const { Op, QueryTypes, where } = require("sequelize");
const ShopStock = require("../models/ShopStock/ShopStock")

const addProductToShop = async () => {

    // 01HQ0006 -> 01HQ0010


    // let product_from = await ShopProduct('01HQ0010').findAll()
    // product_from = product_from.map(el => { return el.product_id })

    let limit = 100000
    let page = 1
    let table_name = '01HQ0014'
    let product = await Product.findAll({
        where: { [Op.or]: [{ created_date: { [Op.gt]: '2023-08-28 08:00' } }, { updated_date: { [Op.gt]: '2023-08-28 08:00' } }] },
        // where: { master_path_code_id: { [Op.in]: master_path.map(el => { return el["รหัสจากโรงงาน"] }) } },

        // where: { id: { [Op.in]: product_from } },
        order: [['id', 'asc']],
        limit: limit,
        offset: (page - 1) * limit
    })



    let data3 = []
    for (let index = 0; index < product.length; index++) {
        const element = product[index];

        data3.push({
            product_id: element.id,
            product_bar_code: null,
            start_date: new Date(),
            price: element.other_details.central_price || 0,
            // price: {
            //     "suggasted_re_sell_price": {
            //         "retail": null,
            //         "wholesale": null
            //     },
            //     "b2b_price": {
            //         "retail": null,
            //         "wholesale": null
            //     },
            //     "suggested_online_price": {
            //         "retail": null,
            //         "wholesale": null
            //     },
            //     "credit_30_price": {
            //         "retail": null,
            //         "wholesale": null
            //     },
            //     "credit_45_price": {
            //         "retail": null,
            //         "wholesale": null
            //     }
            // },
            isuse: 1,
            created_by: '90f5a0a9-a111-49ee-94df-c5623811b6cc',
            created_date: new Date()
        })

    }

    await ShopProduct(table_name).bulkCreate(data3)




    // 
    // console.log(shop)


}

addProductToShop()



