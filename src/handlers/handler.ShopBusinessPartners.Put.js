const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelShopBusinessPartners = require("../models/model").ShopBusinessPartners;

const handlerShopBusinessPartnersPut = async (request) => {
    try {
        /**
         * Current timestamp
         * @type {number}
         */
        const currentDateTime = Date.now();
        /**
         * A user's id where from user's request
         * - type: string<uuid>
         * @type {string}
         */
        const user_id = request.id;
        /**
         * A PK id of model, where to use for update document
         * @type {string}
         */
        const request_pk_id = request.params.id;
        /**
         * Converted field: "isuse" from request status
         */
        const isUse = utilGetIsUse(request.body.status);

        if (!user_id) {
            throw Error(`Unauthorized`);
        }
        else if (!isUUID(request_pk_id)) {
            throw Error(`Require params "id" from your request`);
        }
        else {
            /**
             * A result of find data to see what ShopProfile's id whereby this user's request
             */
            const findShopsProfile = await utilCheckShopTableName(request);

            request.query.select_shop_ids = 'all'
            const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

            if (!findShopsProfile) {
                throw Error(`Variable "findShopsProfile" return not found`);
            }
            else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
                throw Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            }
            else {
                /**
                 * A name for dynamics table
                 * @type {string}
                 */
                const table_name = findShopsProfile.shop_code_id;

                /**
                 * A class's dynamics instance of model "ShopBusinessPartners"
                 */
                const instanceModelShopBusinessPartners = modelShopBusinessPartners(table_name);

                var before_update = await instanceModelShopBusinessPartners.findOne(
                    {
                        where: {
                            id: request_pk_id
                        }
                    }
                );

                const updateDocument = await instanceModelShopBusinessPartners.update(
                    {
                        ...request.body,
                        ...isUse,
                        updated_by: user_id,
                        updated_date: currentDateTime
                    },
                    {
                        where: {
                            id: request_pk_id
                        }
                    }
                );

                for (let index = 0; index < findShopsProfileArray.length; index++) {
                    const element = findShopsProfileArray[index];
                    if (element.shop_code_id !== table_name) {

                        let findShopBusinessPartnersHq = await modelShopBusinessPartners(element.shop_code_id).findOne({
                            where: { id: request_pk_id }
                        });

                        if (findShopBusinessPartnersHq) {
                            findShopBusinessPartnersHq.set({
                                ...request.body,
                                ...isUse,
                                ...{ shop_id: element.id },
                                updated_by: user_id,
                                updated_date: currentDateTime
                            });

                            // Validate new values before save on this document
                            await findShopBusinessPartnersHq.validate();
                            // Save new values on this document
                            await findShopBusinessPartnersHq.save({ validate: true });
                        }

                    }

                }

                const findUpdatedDocument = await instanceModelShopBusinessPartners.findByPk(request_pk_id);

                await handleSaveLog(request, [["put shopBusinessPartners put", request_pk_id, request.body, before_update], ""]);

                return utilSetFastifyResponseJson("success", findUpdatedDocument);
            }
        }
    } catch (error) {
        await handleSaveLog(request, [["put shopBusinessPartners put"], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopBusinessPartnersPut;