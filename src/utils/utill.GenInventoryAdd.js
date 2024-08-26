require("dotenv").config();
const config = require("../config")
const Product = require("../models/model").Product;
const ShopInventoryTransaction = require("../models/model").ShopInventoryTransaction;
const ShopsProfiles = require("../models/model").ShopsProfiles;
const ShopProduct = require("../models/model").ShopProduct;
const ShopInventory = require("../models/model").ShopInventory;
const UsersProfiles = require("../models/model").UsersProfiles;
const ShopStock = require("../models/model").ShopStock;
const sequelize = require("../db");
const { Op, QueryTypes, where } = require("sequelize");

const genInventoryAdd = async () => {

    var table_name = '01HQ0003'
    var code_id = 'DT2200122001'
    var bus_partner_id = 'e8f464fb-d032-44cf-8512-448fbf4516ec'
    var tax_type = '52b5a676-c331-4d03-b650-69fc5e591d2c' //ไม่คิด vat
    var doc_type_id = 'ad06eaab-6c5a-4649-aef8-767b745fab47'
    var warehose_id = 'f08bb9b4-3b5b-48fc-bfb1-8af9811816db'
    var unit_id = '103790b2-e9ab-411b-91cf-a22dbf624cbc' //เส้น
    var amount = 1000000
    var price = 100

    var shop = await UsersProfiles.findOne({
        include: [{ model: ShopsProfiles }],
        where: { [Op.and]: [sequelize.literal(`"ShopsProfile".shop_code_id = :table_name`)] },
        replacements: { table_name: table_name }

    })

    var user_id = shop.user_id
    var shop_id = shop.ShopsProfile.id



    var product_count = await ShopProduct(table_name).count()

    console.log(parseInt(product_count / 10))

    var product_shop = await ShopProduct(table_name).findAll()

    var product_array = [[]]
    for (let index = 0; index < product_shop.length; index++) {
        const element = product_shop[index];
        if (product_array[parseInt((index) / 10)] == null) {
            product_array[parseInt((index) / 10)] = [element]
        } else {
            product_array[parseInt((index) / 10)].push(element)
        }

    }



    for (let index = 0; index < product_array.length; index++) {
        const el = product_array[index];


        var create_transaction = {
            run_no: 1,
            code_id: code_id,
            shop_id: shop_id,
            bus_partner_id: bus_partner_id,
            doc_date: new Date(),
            details: {},
            doc_type_id: doc_type_id,
            status: 1,
            created_by: user_id,
            created_date: new Date()

        }


        var created_transaction = await ShopInventoryTransaction(table_name).create(create_transaction)

        var create_inventory = []
        var create_stock = []

        var amount_all = 0

        for (let index = 0; index < el.length; index++) {
            const element = el[index];

            amount_all = amount_all + (amount * price)

            create_inventory.push({
                shop_id: shop_id,
                product_id: element.id,
                warehouse_detail: [
                    {
                        "warehouse": warehose_id,
                        "shelf": {
                            "item": "001",
                            "amount": amount,
                            "dot_mfd": null,
                            "purchase_unit_id": unit_id
                        }
                    }
                ],
                amount: amount,
                import_date: new Date(),
                doc_inventory_id: created_transaction.id,
                details: {
                    "price": price,
                    "price_text": price.toFixed(2).toString(),
                    "discount_percentage_1": null,
                    "discount_percentage_1_text": null,
                    "discount_percentage_2": null,
                    "discount_percentage_2_text": null,
                    "discount_3": null,
                    "discount_3_text": null,
                    "discount_3_type": "bath",
                    "discount_thb": null,
                    "discount_thb_text": null,
                    "total_price": amount * price,
                    "total_price_text": (amount * price).toFixed(2).toString(),
                    "unit": unit_id
                },
                status: 1,
                created_by: user_id,
                created_date: new Date()

            })

            create_stock.push({
                shop_id: shop_id,
                product_id: element.id,
                warehouse_detail: [
                    {
                        "warehouse": warehose_id,
                        "shelf": [
                            {
                                "item": "001",
                                "purchase_unit_id": unit_id,
                                "balance": amount
                            }
                        ]
                    }
                ],
                balance: amount,
                balance_date: new Date(),
                created_by: user_id,
                created_date: new Date()
            })

        }

        await ShopInventory(table_name).bulkCreate(create_inventory)
        await ShopStock(table_name).bulkCreate(create_stock)

        await ShopInventoryTransaction(table_name).update(
            {
                details: {
                    "tax_type": tax_type,
                    "total_discount": null,
                    "total_discount_text": "0.00",
                    "total_price_all": amount_all,
                    "total_price_all_text": amount_all.toFixed(2).toString(),
                    "total_price_all_after_discount": amount_all,
                    "total_price_all_after_discount_text": amount_all.toFixed(2).toString(),
                    "vat": "0.00",
                    "vat_text": "0.00",
                    "net_price": amount_all,
                    "net_price_text": amount_all.toFixed(2).toString(),
                    "user_id": user_id
                }
            },
            {
                where: {
                    id: created_transaction.id
                }
            })

    }





    // 
    // console.log(shop)


}

genInventoryAdd()



