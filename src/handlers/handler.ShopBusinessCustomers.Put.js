const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");

const db = require("../db");
const modelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers;


/**
 * A handler to edit by id shopBusiness from database
 * - Route [PUT] => /api/shopBusinessCustomers/put/:id
 * @param {import("../types/type.Handler.ShopBusinessCustomers").IHandlerShopBusinessCustomerPutRequest} request
 */
const handlerShopBusinessCustomersPut = async (request) => {
    var action = "put shopBusinessCustomers put"
    try {
        const currentDateTime = Date.now();

        /**
         * A user's id where from user's request
         * - type: string<uuid>
         * @type {string}
         */
        const user_id = request.id;
        const request_pk_id = request.params.id;

        /**
         * A function to generate "isuse" key object with value from request
         * @param status
         * @return {{isuse: number} | {}}
         */
        const setIsUse = (status = request.body.status) => {
            if (status === 'block') {
                return { isuse: 0 };
            } else if (status === 'active') {
                return { isuse: 1 };
            } else if (status === 'delete') {
                return { isuse: 2 };
            } else {
                return {};
            }
        };

        const isUse = setIsUse(request.body.status);

        if (!user_id) {
            throw Error(`Unauthorized`);
        } else if (!isUUID(request_pk_id)) {
            throw Error(`Require params "id" from your request`);
        } else {
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
                 * A name for dynamics table
                 * @type {string}
                 */
                const table_name = findShopsProfile.shop_code_id;

                /**
                 * A class's dynamics instance of model "ShopBusinessCustomers"
                 */
                const instanceModelShopBusinessCustomers = modelShopBusinessCustomers(table_name);

                /**
                 * A function update ShopBusinessCustomers Document in database "app_shops_datas"."dat_${TABLE_CODE}_business_customers"
                 * @param {import("sequelize").Transaction} seqTransaction - A defined sequelize's session transaction
                 */
                const fnUpdateShopBusinessCustomersDocument = async (seqTransaction) => {
                    try {
                        if (!seqTransaction) {
                            throw Error(`Require parameter "seqTransaction"`)
                        } else {
                            const findShopBusinessCustomers = await instanceModelShopBusinessCustomers.findOne({
                                where: { id: request_pk_id },
                                transaction: seqTransaction
                            });

                            if (!findShopBusinessCustomers) {
                                throw Error(`@findShopBusinessCustomers return not found`);
                            } else {
                                findShopBusinessCustomers.set({
                                    ...request.body,
                                    ...isUse,
                                    updated_by: user_id,
                                    updated_date: currentDateTime
                                });

                                // Validate new values before save on this document
                                await findShopBusinessCustomers.validate();
                                // Save new values on this document
                                const updatedShopBusinessCustomers = await findShopBusinessCustomers.save({ validate: true, transaction: seqTransaction });
                                // Save transaction changes

                                for (let index = 0; index < findShopsProfileArray.length; index++) {
                                    const element = findShopsProfileArray[index];
                                    if (element.shop_code_id !== table_name) {

                                        let findShopBusinessCustomersHq = await modelShopBusinessCustomers(element.shop_code_id).findOne({
                                            where: { id: request_pk_id },
                                            transaction: seqTransaction
                                        });

                                        if (findShopBusinessCustomersHq) {
                                            findShopBusinessCustomersHq.set({
                                                ...request.body,
                                                ...isUse,
                                                ...{ shop_id: element.id },
                                                updated_by: user_id,
                                                updated_date: currentDateTime
                                            });

                                            // Validate new values before save on this document
                                            await findShopBusinessCustomersHq.validate();
                                            // Save new values on this document
                                            await findShopBusinessCustomersHq.save({ validate: true, transaction: seqTransaction });
                                        }

                                    }

                                }

                                await seqTransaction.commit();

                                return updatedShopBusinessCustomers;
                            }
                        }
                    } catch (error) {
                        // Revert transaction changes
                        await seqTransaction.rollback();

                        throw error;
                    }
                };

                /**
                 * A defined sequelize's session transaction
                 */
                const t = await db.transaction();

                const updateShopBusinessCustomersDocument = await fnUpdateShopBusinessCustomersDocument(t);

                await handleSaveLog(request, [[action, request_pk_id, request.body], ""]);

                return utilSetFastifyResponseJson("success", updateShopBusinessCustomersDocument);
            }
        }
    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopBusinessCustomersPut;