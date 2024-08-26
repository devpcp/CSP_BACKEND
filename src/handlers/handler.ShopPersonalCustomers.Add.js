const _ = require("lodash");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSequelizeCreateTableIfNotExistsFromModel = require("../utils/util.Sequelize.CreateTableIfNotExistsFromModel");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const { config_run_number_shop_personal_customers_prefix } = require("../config");

const modelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers;


/**
 * A handler to add new shopPersonalCustomers into database
 * - Route [POST] => /api/shopPersonalCustomers/add
 * @param {import("../types/type.Handler.ShopPersonalCustomers").IHandlerShopPersonalCustomersAddRequest} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopPersonalCustomers>>}
 */
const handlerShopPersonalCustomersAdd = async (request) => {
    try {
        const currentDateTime = Date.now();
        const user_id = request.id;

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        if (!findShopsProfile) {
            throw Error(`Variable "findShopsProfile" return not found`);
        } else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            throw Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
        } else {
            /**
             * A name for create dynamics table
             * @type {string}
             */
            const table_name = findShopsProfile.shop_code_id;

            /**
             * A class's dynamics instance of model "ShopProfileCustomers"
             */
            const instanceModelShopPersonalCustomers = modelShopPersonalCustomers(table_name);
            // Create table in database if not exists
            await utilSequelizeCreateTableIfNotExistsFromModel(instanceModelShopPersonalCustomers);

            const additionalPrefix = (findShopsProfileArray.length > 1) ? 'HQ' : ''

            const createRunNumber = await utilGetRunNumberFromModel(
                instanceModelShopPersonalCustomers,
                'run_no',
                {
                    prefix_config: await utilGetDocumentTypePrefix(
                        _.get(request.body, 'doc_type_id', ''),
                        {
                            defaultPrefix: config_run_number_shop_personal_customers_prefix + additionalPrefix
                        }
                    ).then(r => r.prefix)
                }
            );

            const tempInsertData = {
                ...request.body,
                shop_id: findShopsProfile.id,
                master_customer_code_id: createRunNumber.runString,
                run_no: createRunNumber.runNumber,
                created_by: user_id,
                created_date: currentDateTime,
                updated_by: null,
                updated_date: null,
            };

            delete tempInsertData.id;

            const createdDocument = await instanceModelShopPersonalCustomers.create(tempInsertData);

            for (let index = 0; index < findShopsProfileArray.length; index++) {
                const element = findShopsProfileArray[index];
                if (element.shop_code_id !== table_name) {
                    await modelShopPersonalCustomers(element.shop_code_id).create({ ...createdDocument.dataValues, ...{ shop_id: element.id } }).then()
                        .catch((err) => {
                            console.log(err)
                        })
                }

            }

            await handleSaveLog(request, [["post shopPersonalCustomers add", createdDocument.id, request.body], ""]);

            return utilSetFastifyResponseJson("success", createdDocument);
        }

    } catch (error) {
        const logId = await handleSaveLog(request, [["post shopPersonalCustomers add"], error]);

        return utilSetFastifyResponseJson("failed", `logId: ${logId.get('id')}:` + error.toString());
    }
};

module.exports = handlerShopPersonalCustomersAdd;