const _ = require("lodash");
const moment = require("moment");
const { Transaction, Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const { isUUID } = require("../utils/generate");
const handlerShopSalesOrderPlanLogsPut = require("./handler.ShopSalesOrderPlanLogs.Put");

const db = require("../db");
const modelShopSalesTransactionDoc = require("../models/model").ShopSalesTransactionDoc;
const modelShopSalesOrderPlanLogs = require("../models/model").ShopSalesOrderPlanLogs;
const modelShopSalesTransactionOut = require("../models/model").ShopSalesTransactionOut;
const modelShopVehicleCustomer = require("../models/model").ShopVehicleCustomer;
const modelShopDocumentCode = require("../models/model").ShopDocumentCode;


/**
 * A handler to edit by id shopSalesTransactionDoc from database
 * - Route [PUT] => /api/shopSalesTransactionDoc/put/:id
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault|{}} reply
 * @param options
 * @returns {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<ShopSalesTransactionDoc>>}
 */
const handlerShopSalesTransactionDocPut = async (request, reply = {}, options = {}) => {
    const handlerName = "put shopSalesTransactionDoc put";

    try {
        /**
         * @type {Date}
         */
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        const option_movementLog_details = _.get(options,'movementLog_details', {});
        options.movementLog_details = option_movementLog_details;

        return await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if(!request.transaction) {
                    request.transaction = transaction;
                }

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
                 * Converted field: "status" from request status
                 */
                const status = [0, 1, 2, 3, 4].includes(request.body.status) ? { status: request.body.status } : {};

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
                         * A class's dynamics instance of model "ShopSalesTransactionDoc"
                         */
                        const instanceModelShopSalesTransactionDoc = modelShopSalesTransactionDoc(table_name);
                        /**
                         * A class's dynamics instance of model "ShopSalesOrderPlanLogs"
                         */
                        const instanceModelShopSalesOrderPlanLogs = modelShopSalesOrderPlanLogs(table_name);

                        const instanceModelShopSalesTransactionOut = modelShopSalesTransactionOut(table_name);

                        const findCurrentDocument = await instanceModelShopSalesTransactionDoc.findOne({
                            where: {
                                id: request_pk_id
                            },
                            transaction: transaction
                        });

                        const findUpdatedShopSalesOrderPlanLogsDocuments = await instanceModelShopSalesOrderPlanLogs.findAll({
                            where: {
                                doc_sale_id: request_pk_id,
                                status: {
                                    [Op.ne]: 0
                                }
                            },
                            transaction: transaction
                        });

                        // Shop setting check: "enable_ShopSalesTransaction_legacyStyle" is true
                        if (_.get(findShopsProfile.get('shop_config'), 'enable_ShopSalesTransaction_legacyStyle', false) === true) {
                            const fnGenerateDocumentCode = async (cfgDocTypeCode = 'JOBXXX') => {
                                const cfgObjDetailsKeyToModify = 'ShopDocumentCode';

                                // Check document code_id from cfgDocTypeCode
                                if (_.get(findCurrentDocument.get('details'), `${cfgObjDetailsKeyToModify}.${cfgDocTypeCode}.code_id`, null) !== null) {
                                    return;
                                }

                                if (!findCurrentDocument.get('details')) {
                                    findCurrentDocument.set('details', {});
                                }

                                // Do create document code_id and apply in column details Model where assign by argument "shopModel"
                                const createdDocumentCode = await modelShopDocumentCode(table_name).create(
                                    {
                                        shop_id: findCurrentDocument.get('shop_id'),
                                        doc_type_code: cfgDocTypeCode,
                                        created_by: user_id,
                                        created_date: currentDateTime
                                    },
                                    {
                                        validate: true,
                                        transaction: transaction
                                    }
                                );
                                const detailsShopDocumentCode = {
                                    ...(findCurrentDocument.get('details')[cfgObjDetailsKeyToModify] || {}),
                                };
                                detailsShopDocumentCode[cfgDocTypeCode] = {
                                    ...(detailsShopDocumentCode[cfgDocTypeCode] || {}),
                                    id: createdDocumentCode.get('id'),
                                    shop_id: createdDocumentCode.get('shop_id'),
                                    code_id: createdDocumentCode.get('code_id')
                                };

                                const columnDetails = { ...(findCurrentDocument.get('details')) };
                                columnDetails[cfgObjDetailsKeyToModify] = detailsShopDocumentCode;
                                findCurrentDocument.set('details', columnDetails);
                                await findCurrentDocument.save({ transaction: transaction });
                            };

                            // Generate TRN document code
                            if (findCurrentDocument.status === 1 && request.body.status === 2) {
                                await fnGenerateDocumentCode('TRN');
                            }

                            // Generate INV document code
                            if (findCurrentDocument.status === 2 && request.body.status === 3) {
                                // await fnGenerateDocumentCode('INV');
                            }
                        }

                        // Update to revert holding product when "status" before update is not 0 (ยกเลิกการขาย)
                        if (findCurrentDocument.status !== 0 && request.body.status === 0) {
                            for (let index = 0; index < findUpdatedShopSalesOrderPlanLogsDocuments.length; index++) {
                                const element = findUpdatedShopSalesOrderPlanLogsDocuments[index];
                                const newReq = {
                                    ...request,
                                    headers: request.headers,
                                    socket: request.socket,
                                    params: {
                                        ...request.params
                                    },
                                    query: {
                                        ...request.query
                                    },
                                    body: {
                                        ...request.body
                                    }
                                };
                                newReq.params.id = element.id;
                                await handlerShopSalesOrderPlanLogsPut(
                                    newReq,
                                    reply,
                                    {
                                        ...options,
                                        ...{ documentType: 'SO', reasons: 'Delete', ...option_movementLog_details }
                                    }
                                );
                            }
                        }

                        // Update "detail.ShopDocumentCode" data in database and replace by frontend request
                        const dataDetails_ShopDocumentCode = {
                            ...(_.get(findCurrentDocument.get('details'), 'ShopDocumentCode', {})),
                            // ...(_.get(request, 'body.details.ShopDocumentCode', {})) // Currently not modified from frontend
                        };
                        // Update "detail" data in database and replace by frontend request
                        const dataDetails = {
                            ...(findCurrentDocument.get('details') || {}),
                            ...(_.get(request, 'body.details', {})),
                            ShopDocumentCode: dataDetails_ShopDocumentCode
                        };

                        // Update "detail.payment.payment_date" if request payment incoming
                        if (findCurrentDocument.status === 2 && request.body.status === 3 && findCurrentDocument.purchase_status === false && request.body.purchase_status === true) {
                            if (!dataDetails.payment) {
                                dataDetails.payment = {};
                            }
                            if (!dataDetails.payment.payment_date) {
                                dataDetails.payment.payment_date = currentDateTime.toISOString();
                            }
                            else {
                                const objFieldPaidDate = dataDetails.payment.payment_date || null;
                                const field_paymentDate_formatVer_1 = moment(objFieldPaidDate, moment.ISO_8601, true);
                                const field_paymentDate_formatVer_2 = moment(objFieldPaidDate, 'YYYY-MM-DD HH:mm:ss', true);
                                const field_paymentDate_formatVer_3 = moment(objFieldPaidDate, 'DD-MM-YYYY HH:mm:ss', true);
                                if (field_paymentDate_formatVer_1.isValid()) {
                                    dataDetails.payment.payment_date  = field_paymentDate_formatVer_1.toISOString();
                                }
                                else if (field_paymentDate_formatVer_2.isValid()) {
                                    dataDetails.payment.payment_date  = field_paymentDate_formatVer_2.toISOString();
                                }
                                else if (field_paymentDate_formatVer_3.isValid()) {
                                    dataDetails.payment.payment_date  = field_paymentDate_formatVer_3.toISOString();
                                }
                                else {
                                    throw Error('details.payment.payment_date is invalid date format');
                                }
                            }
                        }

                        await instanceModelShopSalesTransactionDoc.update(
                            {
                                ...request.body,
                                details: dataDetails,
                                ...status,
                                updated_by: user_id,
                                updated_date: currentDateTime
                            },
                            {
                                where: {
                                    id: request_pk_id
                                },
                                transaction: transaction
                            }
                        );

                        const findUpdatedDocument = await instanceModelShopSalesTransactionDoc.findOne({
                            where: {
                                id: request_pk_id
                            },
                            transaction: transaction
                        });

                        // if status update payment success, it will update car millage
                        if (request.body.vehicles_customers_id && request.body.purchase_status === true && request.body.status === 3) {
                            if (request.body.details.mileage && isUUID(findUpdatedDocument.get('vehicles_customers_id') || null)) {
                                const findVehicleCustomer = await modelShopVehicleCustomer(table_name).findOne(
                                    {
                                        where: {
                                            id: findUpdatedDocument.get('vehicles_customers_id')
                                        },
                                        transaction: transaction
                                    }
                                );

                                const currMillage = _.get(findUpdatedDocument.get('details'), 'mileage', "0") || "0";
                                const reqMillage = request.body.details.mileage || "0";
                                const newMillage = Number(currMillage) >= Number(reqMillage)
                                    ? String(currMillage)
                                    : String(reqMillage);

                                const findVehicleCustomer_details = {
                                    ...(findVehicleCustomer.get('details') || {}),
                                    mileage: newMillage
                                };
                                findVehicleCustomer.set({ details: findVehicleCustomer_details });

                                await findVehicleCustomer.save({ transaction: transaction });
                            }
                        }

                        // if cancle doc on status 3 (tax invoice) will update ref doc to 2
                        if (findCurrentDocument.status === 3 && findUpdatedDocument.status === 0) {
                            const findTransactionOut = await instanceModelShopSalesTransactionOut.findAll({
                                where: {
                                    doc_sale_id: request_pk_id
                                },
                                transaction: transaction
                            });

                            if (findTransactionOut.length > 0) {
                                await instanceModelShopSalesTransactionDoc.update(
                                    {
                                        status: 2,
                                        updated_by: user_id,
                                        updated_date: currentDateTime
                                    },
                                    {
                                        where: {
                                            id: findTransactionOut.map(el => { return el.ref_doc_sale_id })
                                        },
                                        transaction: transaction
                                    }
                                );
                            }
                        }

                        await handleSaveLog(request, [[handlerName, request_pk_id, request.body, findCurrentDocument], '']);

                        return utilSetFastifyResponseJson('success', findUpdatedDocument);
                    }
                }
            }
        );
    } catch (error) {
        await handleSaveLog(request, [[handlerName, request.params.id, request.body], error]);

        throw error;
    }
};


module.exports = handlerShopSalesTransactionDocPut;