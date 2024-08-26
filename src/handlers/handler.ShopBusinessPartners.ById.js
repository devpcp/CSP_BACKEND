const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilIsErrorDynamicsTableNotFound = require("../utils/util.IsErrorDynamicsTableNotFound");

const db = require("../db");
const modelShopsProfiles = require("../models/model").ShopsProfiles;
const modelBusinessType = require("../models/model").BusinessType;
const modelSubDistrict = require("../models/model").SubDistrict;
const modelDistrict = require("../models/model").District;
const modelProvince = require("../models/model").Province;
const modelShopBusinessPartners = require("../models/model").ShopBusinessPartners;

const handlerShopBusinessPartnersById = async (request) => {
    const action = "GET ShopShopBusinessPartners.ById";

    try {
        if (!isUUID(request.params.id)) {
            throw new Error(`Require params "id" from your request`);
        }

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');


        if (!findShopProfiles) {
            throw new Error(`Variable "findShopsProfile" return not found`);
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopProfiles[0]?.shop_code_id)) {
            throw new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
        }
        else {
            /**
             * A name for create dynamics table
             * @type {string}
             */
            const table_name = findShopProfiles[0]?.shop_code_id;

            /**
             * A class's dynamics instance of model "ShopBusinessPartners"
             */
            const instanceModelShopBusinessPartners = modelShopBusinessPartners(table_name);

            const findShopBusinessPartners = await instanceModelShopBusinessPartners.findByPk(request.params.id, {
                attributes: {
                    include: [
                        [db.Sequelize.literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopBusinessPartners"."created_by")`), `created_by`],
                        [db.Sequelize.literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopBusinessPartners"."updated_by")`), `updated_by`]
                    ]
                },
                include: [
                    { model: modelShopsProfiles, as: 'ShopsProfiles' },
                    { model: modelBusinessType, as: 'BusinessType' },
                    { model: modelSubDistrict, as: 'SubDistrict' },
                    { model: modelDistrict, as: 'District' },
                    { model: modelProvince, as: 'Province' }
                ]
            }).catch(e => {
                if (utilIsErrorDynamicsTableNotFound(e)) {
                    handleSaveLog(request, [[action], e]).catch(e => { });

                    return null;
                }
                else {
                    throw e;
                }
            });

            await handleSaveLog(request, [[action], ""]);

            return utilSetFastifyResponseJson("success", findShopBusinessPartners);
        }
    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};


module.exports = handlerShopBusinessPartnersById;