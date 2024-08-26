const _ = require("lodash");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilSequelizeCreateTableIfNotExistsFromModel = require("../utils/util.Sequelize.CreateTableIfNotExistsFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const { config_run_number_shop_business_partners_prefix } = require("../config");
const modelShopBusinessPartners = require("../models/model").ShopBusinessPartners;



/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<{}>} request
 * @returns {Promise<IUtilFastifyResponseJson<ShopBusinessPartners>>}
 */
const handlerShopBusinessPartnersAdd = async (request) => {
    try {
        const currentDateTime = Date.now();
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
         * A class's dynamics instance of model "ShopBusinessPartners"
         */
        const instanceModelShopBusinessPartners = modelShopBusinessPartners(table_name);
        // Create table in database if not exists
        await utilSequelizeCreateTableIfNotExistsFromModel(instanceModelShopBusinessPartners)

        const additionalPrefix = (findShopsProfileArray.length > 1) ? 'HQ' : ''

        const createRunNumber = await utilGetRunNumberFromModel(
            instanceModelShopBusinessPartners,
            'run_no',
            {
                prefix_config: await utilGetDocumentTypePrefix(
                    _.get(request.body, 'doc_type_id', ''),
                    config_run_number_shop_business_partners_prefix + additionalPrefix
                ).then(r => r.prefix)
            }
        );

        const tempInsertData = {
            ...request.body,
            shop_id: findShopsProfile.id,
            code_id: createRunNumber.runString,
            run_no: createRunNumber.runNumber,
            created_by: request.id,
            created_date: currentDateTime,
            updated_by: null,
            updated_date: null,
        };

        delete tempInsertData.id;


        const createdDocument = await instanceModelShopBusinessPartners.create(tempInsertData);

        for (let index = 0; index < findShopsProfileArray.length; index++) {
            const element = findShopsProfileArray[index];
            if (element.shop_code_id !== table_name) {
                await modelShopBusinessPartners(element.shop_code_id).create({ ...createdDocument.dataValues, ...{ shop_id: element.id } }).then()
                    .catch((err) => {
                        console.log(err)
                    })
            }

        }

        await handleSaveLog(request, [["post shopBusinessPartners add", createdDocument.id, request.body], ""]);

        return utilSetFastifyResponseJson("success", createdDocument);

    } catch (error) {
        await handleSaveLog(request, [["post shopBusinessPartners add"], `error : ${error}`]);
        throw error;
    }
};

module.exports = handlerShopBusinessPartnersAdd;