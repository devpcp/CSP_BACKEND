const {
    literal
} = require("sequelize");
const {
    handleSaveLog
} = require("./log");
const {
    isUUID
} = require("../utils/generate");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");

const modelShopsProfiles = require("../models/model").ShopsProfiles;
const modelNameTitle = require("../models/model").NameTitle;
const modelSubDistrict = require("../models/model").SubDistrict;
const modelDistrict = require("../models/model").District;
const modelProvince = require("../models/model").Province;
const modelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers;


/**
 * A handler to list by id shopPersonalCustomers from database
 * - Route [GET] => /api/shopPersonalCustomers/byid/:id
 * @param {import("../types/type.Handler.ShopPersonalCustomers").IHandlerShopPersonalCustomersByIdRequest} request
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopPersonalCustomers|string>>}
 */
const handlerShopPersonalCustomersById = async (request) => {
    const action = "GET ShopPersonalCustomers.ById";

    try {
        /**
         * A user's id where from user's request
         * - type: string<uuid>
         * @type {string}
         */
        const user_id = request.id;
        const request_pk_id = request.params.id;

        if (!isUUID(user_id)) {
            throw Error(`Unauthorized`);
        } else if (!isUUID(request_pk_id)) {
            throw Error(`Require params "id" from your request`);
        } else {
            /**
             * A result of find data to see what ShopProfile's id whereby this user's request
             */
            const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');

            if (!findShopProfiles) {
                const instanceError = new Error(`Variable "findShopsProfile" return not found`);
                await handleSaveLog(request, [[action], instanceError]);
                return utilSetFastifyResponseJson("success", null);
            }
            else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopProfiles[0]?.shop_code_id)) {
                const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
                await handleSaveLog(request, [[action], instanceError]);
                return utilSetFastifyResponseJson("success", null);
            }
            else {
                /**
                 * A name for dynamics table
                 * @type {string}
                 */
                const table_name = findShopProfiles[0].shop_code_id;

                /**
                 * A class's dynamics instance of model "ShopPersonalCustomers"
                 */
                const instanceModelShopPersonalCustomers = modelShopPersonalCustomers(table_name);

                const findShopPersonalCustomers = await instanceModelShopPersonalCustomers.findOne(
                    {
                        attributes: {
                            include: [
                                [literal(`(
                                    SELECT 
                                        SUM(CASE
                                            WHEN (details->'calculate_result'->>'net_total' IS NULL OR details->'calculate_result'->>'net_total' = '') THEN 0
                                            ELSE cast(details->'calculate_result'->>'net_total' as float)
                                        END)
                                    FROM app_shops_datas.dat_${table_name}_sales_transaction_doc doc
                                    where per_customer_id = "ShopPersonalCustomers".id
                                    and purchase_status = false
                                    and (select count(*) FROM app_shops_datas.dat_${table_name}_sales_order_plan_logs lo where lo.doc_sale_id = doc.id ) > 0
                                )`), 'debt'],
                                [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopPersonalCustomers"."created_by" )`), `created_by`],
                                [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopPersonalCustomers"."updated_by" )`), `updated_by`],
                                [literal(`array(SELECT json_build_object('id',id,'tag_name',tag_name->>'th') from app_shops_datas.dat_${table_name}_tags where id = any(\"ShopPersonalCustomers\".\"tags\"))`), 'tags']
                            ]
                        },
                        include: [
                            { model: modelShopsProfiles, as: 'ShopsProfiles' },
                            { model: modelNameTitle, as: 'NameTitle' },
                            { model: modelSubDistrict, as: 'SubDistrict' },
                            { model: modelDistrict, as: 'District' },
                            { model: modelProvince, as: 'Province' }
                        ],
                        where: {
                            id: request_pk_id
                        }
                    }
                )
                    .catch(
                        (error) => {
                            const regexDatabaseNotFound = /((SequelizeDatabaseError){1}\:\s{1}(relation){1}\s{1}\"{1}.*\"{1}\s{1}(does){1}\s{1}(not){1}\s{1}(exist){1}){1}/g
                            if (regexDatabaseNotFound.test(new Error(error).message)) {
                                return [];
                            } else {
                                throw error;
                            }
                        }
                    );

                await handleSaveLog(request, [[action], ""]);

                return utilSetFastifyResponseJson("success", findShopPersonalCustomers);
            }
        }
    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};


module.exports = handlerShopPersonalCustomersById;