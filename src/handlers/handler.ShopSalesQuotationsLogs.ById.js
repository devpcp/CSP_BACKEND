const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");

const db = require("../db");
const Product = require("../models/model").Product;
const ShopSalesQuotationsLogs = require("../models/model").ShopSalesQuotationsLogs;
const ShopProduct = require("../models/model").ShopProduct;


const handlerShopSalesQuotationsLogsById = async (request) => {
    const action = "get shopSalesQuotationsLogs byid"

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        /**
         * A name for dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        /**
         * A class's dynamics instance of model "ShopSalesQuotationsLogs"
         */
        const instanceModelShopSalesQuotationsLogs = ShopSalesQuotationsLogs(table_name);

        /**
         * A class's dynamics instance of model "ShopProduct"
         */
        const instanceModelShopProduct = ShopProduct(table_name);

        const findDocument = await instanceModelShopSalesQuotationsLogs.findOne(
            {
                attributes: {
                    include: [
                        [db.Sequelize.literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopSalesQuotationsLogs"."created_by" )`), `created_by`],
                        [db.Sequelize.literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopSalesQuotationsLogs"."updated_by" )`), `updated_by`]
                    ]
                },
                include: [
                    {
                        model: instanceModelShopProduct,
                        as: 'ShopProducts',
                        include: [
                            {
                                model: Product
                            }
                        ]
                    }
                ],
                where: {
                    id: request.params.id
                }
            }
        );

        return utilSetFastifyResponseJson("failed", findDocument);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error}`]);

        throw error;
    }
}


module.exports = handlerShopSalesQuotationsLogsById;