const { Op, literal, where } = require("sequelize");
const { isUUID, paginate } = require("../utils/generate");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilIsErrorDynamicsTableNotFound = require("../utils/util.IsErrorDynamicsTableNotFound");

const Product = require("../models/model").Product;
const ShopSalesQuotationsLogs = require("../models/model").ShopSalesQuotationsLogs;
const ShopProduct = require("../models/model").ShopProduct;


const handlerShopSalesQuotationsLogsAll = async (request) => {
    const action = "get shopSalesQuotationsLogs all"

    try {
        /**
         * An user id from request
         * @type {string}
         */
        const user_id = request.id;

        if (!isUUID(user_id)) {
            const instanceError = new Error(`Unauthorized`);
            await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("failed", instanceError.message);
        }
        else {
            // Init data as requested
            const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
            const search = request.query.search || "";
            const status = +request.query.status || 1;
            const sort = request.query.sort || "id";
            const order = request.query.order || "asc";
            const limit = +request.query.limit || 10;
            const page = +request.query.page || 1;

            /**
             * A result of find data to see what ShopProfile's id whereby this user's request
             */
            const findShopsProfile = await utilCheckShopTableName(request);

            if (!findShopsProfile) {
                const instanceError = new Error(`Variable "findShopsProfile" return not found`);
                await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
                return utilSetFastifyResponseJson("success", paginate([], limit, page));
            }
            else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
                const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
                await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
                return utilSetFastifyResponseJson("success", paginate([], limit, page));
            }
            else {
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

                const findDocuments = await instanceModelShopSalesQuotationsLogs.findAll(
                    {
                        attributes: {
                            include: [
                                [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopSalesQuotationsLogs"."created_by" )`), `created_by`],
                                [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopSalesQuotationsLogs"."updated_by" )`), `updated_by`]
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
                        order: [[sort, order]],
                        where: {
                            [Op.and]: [{ status: status }],
                            [Op.or]: [
                                where(
                                    literal(`"ShopProducts".product_bar_code`),
                                    Op.iLike,
                                    `%${search}%`
                                ),
                                ...pageLang.map(w => {
                                    return where(
                                        literal(`"ShopProducts->Product".product_name->>'${w}'`),
                                        Op.iLike,
                                        `%${search}%`
                                    )
                                }),
                            ]
                        }
                    }
                ).catch((error) => {
                    if (utilIsErrorDynamicsTableNotFound(error)) {
                        return [];
                    } else {
                        throw error;
                    }
                });

                await handleSaveLog(request, [[action], ""]);

                return utilSetFastifyResponseJson("success", paginate(findDocuments, limit, page));
            }
        }
    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error}`]);

        return utilSetFastifyResponseJson("failed", String(error));
    }
}


module.exports = handlerShopSalesQuotationsLogsAll;