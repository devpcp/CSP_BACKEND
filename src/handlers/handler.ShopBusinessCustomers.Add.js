const _ = require("lodash");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilSequelizeCreateTableIfNotExistsFromModel = require("../utils/util.Sequelize.CreateTableIfNotExistsFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const { config_run_number_shop_business_customers_prefix } = require("../config");
const modelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers;


/**
 * A handler to add new shopBusiness into database
 * - Route [POST] => /api/shopBusinessCustomers/add
 * @param {import("../types/type.Handler.ShopBusinessCustomers").IHandlerShopBusinessCustomerAddRequest} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopBusinessCustomers>>}
 */
const handlerShopBusinessCustomersAdd = async (request) => {
    try {
        const currentDateTime = Date.now();
        const user_id = request.id;

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);


        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;


        /**
         * A class's dynamics instance of model "ShopBusinessCustomers"
         */
        const instanceModelShopBusinessCustomers = modelShopBusinessCustomers(table_name);
        // Create table in database if not exists
        await utilSequelizeCreateTableIfNotExistsFromModel(instanceModelShopBusinessCustomers);

        const additionalPrefix = (findShopsProfileArray.length > 1) ? 'HQ' : ''

        const createRunNumber = await utilGetRunNumberFromModel(
            instanceModelShopBusinessCustomers,
            'run_no',
            {
                prefix_config: await utilGetDocumentTypePrefix(
                    _.get(request.body, 'doc_type_id', ''),
                    {
                        defaultPrefix: config_run_number_shop_business_customers_prefix + additionalPrefix
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

        const createdDocument = await instanceModelShopBusinessCustomers.create(tempInsertData);


        for (let index = 0; index < findShopsProfileArray.length; index++) {
            const element = findShopsProfileArray[index];
            if (element.shop_code_id !== table_name) {
                await modelShopBusinessCustomers(element.shop_code_id).create({ ...createdDocument.dataValues, ...{ shop_id: element.id } }).then()
                    .catch((err) => {
                        console.log(err)
                    })
            }

        }

        await handleSaveLog(request, [["add shopBusinessCustomers", createdDocument.id, request.body], ""]);

        return utilSetFastifyResponseJson("success", createdDocument);

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [["add shopBusinessCustomers"], `error : ${error}`]);
        return utilSetFastifyResponseJson("failed", "post shopBusinessCustomers add has error");
    }
};

module.exports = handlerShopBusinessCustomersAdd;