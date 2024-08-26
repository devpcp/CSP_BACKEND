
const _ = require("lodash");
const { Transaction, Op } = require("sequelize");
const {
    handleSaveLog,
} = require("./log");
const {
    isUUID,
} = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetAverageVehicleCustomerMileage = require("../utils/util.GetAverageVehicleCustomerMileage");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const { config_run_number_shop_appointment_prefix } = require("../config");

const sequelize = require("../db");
const modelShopAppointment = require("../models/model").ShopAppointment;


const handlerAll = async (request) => {
    const handlerName = 'get shopAppointment all';

    try {


        // Init data as requested
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        const search = request.query.search || "";
        // const status = ['0', '1', '2'].includes(request.query.status) ? { status: +request.query.status } : { status: { [Op.ne]: 0 } };
        const status = request.query.status;
        const sort = request.query.sort || "created_date";
        const order = request.query.order || "asc";
        const limit = +request.query.limit || 10;
        const page = +request.query.page || 1;

        const appointment_status = _.isBoolean(request.query.appointment_status) ? { appointment_status: request.query.appointment_status } : {};

        const getVehiclesCustomersID = isUUID(request.query.vehicles_customers_id)
            ? { vehicles_customers_id: request.query.vehicles_customers_id }
            : {};
        const getBusinessCustomersID = isUUID(request.query.bus_customer_id)
            ? { bus_customer_id: request.query.bus_customer_id }
            : {};
        const getPersonalCustomersID = isUUID(request.query.per_customer_id)
            ? { per_customer_id: request.query.per_customer_id }
            : {};

        const start_date = (request.query.start_date) ? { start_date: { [Op.gte]: request.query.start_date } } : {};

        const end_date = (request.query.end_date) ? { end_date: { [Op.lte]: (request.query.end_date.split(" ").length == 1) ? request.query.end_date + ' 23:59:59' : request.query.end_date } } : {};

        const customer_type_ = request.query.customer_type || []
        let customer_type = {}
        if (customer_type_.length == 1) {
            if (customer_type_[0] === 'business') {
                customer_type = { bus_customer_id: { [Op.ne]: null } }
            } else if (customer_type_[0] === 'personal') {
                customer_type = { per_customer_id: { [Op.ne]: null } }
            }

        }

        var isuse = []
        if (status == 'delete') {
            isuse = [2]
        } else if (status == 'active') {
            isuse = [1]
        } else if (status == 'block') {
            isuse = [0]
        } else {
            isuse = [1, 0]
        }


        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        if (!findShopsProfile) {
            const instanceError = new Error(`Variable "findShopsProfile" return not found`);
            await handleSaveLog(request, [[handlerName], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[handlerName], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else {
            /**
             * A class's dynamics instance of model "ShopBusinessCustomers"
             */
            const instanceModelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers(table_name);
            /**
             * A class's dynamics instance of model "ShopPersonalCustomers"
             */
            const instanceModelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers(table_name);
            /**
             * A class's dynamics instance of model "ShopVehicleCustomers"
             */
            const instanceModelShopVehicleCustomers = require("../models/model").ShopVehicleCustomer(table_name);
            /**
             * A class's dynamics instance of model "ShopAppointment"
             */
            const instanceModelShopAppointment = modelShopAppointment(table_name);


            let where_q = {
                ... { status: isuse },
                ...appointment_status,
                ...getVehiclesCustomersID,
                ...getBusinessCustomersID,
                ...getPersonalCustomersID,
                ...start_date,
                ...end_date,
                ...customer_type,
                [Op.or]: [
                    {
                        code_id: { [Op.iLike]: `%${search}%` }
                    },
                    sequelize.where(
                        sequelize.literal(`"ShopPersonalCustomers".master_customer_code_id`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopBusinessCustomers".master_customer_code_id`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopBusinessCustomers".customer_name->>'th'`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopBusinessCustomers".tel_no::text`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopBusinessCustomers".mobile_no::text`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`CONCAT("ShopPersonalCustomers".customer_name->'first_name'->>'th' ,' ',"ShopPersonalCustomers".customer_name->'last_name'->>'th' )`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopPersonalCustomers".tel_no::text`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopPersonalCustomers".mobile_no::text`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopVehicleCustomers".code_id`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopVehicleCustomers".details->>'registration'`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopAppointment".details->>'subject'`),
                        Op.iLike,
                        `%${search}%`
                    ),
                    sequelize.where(
                        sequelize.literal(`"ShopAppointment".details->>'content'`),
                        Op.iLike,
                        `%${search}%`
                    )
                ]
            }
            let inc = [
                { model: instanceModelShopBusinessCustomers, as: 'ShopBusinessCustomers' },
                { model: instanceModelShopPersonalCustomers, as: 'ShopPersonalCustomers' },
                { model: instanceModelShopVehicleCustomers, as: 'ShopVehicleCustomers' }
            ]
            let attr = {
                include: [
                    ...utilGetCreateByAndUpdatedByFromModel(instanceModelShopAppointment),
                ]
            }
            const data = await instanceModelShopAppointment.findAll({
                attributes: attr,
                include: inc,
                where: where_q,
                order: [[sort, order]],
                limit: limit,
                offset: (page - 1) * limit
            });


            var length_data = await instanceModelShopAppointment.count({
                attributes: attr,
                include: inc,
                where: where_q
            })

            var pag = {
                currentPage: page,
                pages: Math.ceil(length_data / limit),
                currentCount: data.length,
                totalCount: length_data,
                data: data

            }

            await handleSaveLog(request, [[handlerName], ""]);

            return utilSetFastifyResponseJson("success", pag);
        }
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};

const handlerById = async (request) => {
    const handlerName = 'get shopAppointment byid';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        if (!findShopsProfile) {
            const instanceError = new Error(`Variable "findShopsProfile" return not found`);
            await handleSaveLog(request, [[handlerName], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", null);
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[handlerName], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", null);
        }
        else {
            /**
             * A class's dynamics instance of model "ShopBusinessCustomers"
             */
            const instanceModelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers(table_name);
            /**
             * A class's dynamics instance of model "ShopPersonalCustomers"
             */
            const instanceModelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers(table_name);
            /**
             * A class's dynamics instance of model "ShopVehicleCustomers"
             */
            const instanceModelShopVehicleCustomers = require("../models/model").ShopVehicleCustomer(table_name);
            /**
             * A class's dynamics instance of model "ShopAppointment"
             */
            const instanceModelShopShopAppointment = modelShopAppointment(table_name);



            const findShopAppointment = await instanceModelShopShopAppointment.findOne({
                attributes: {
                    include: [
                        ...utilGetCreateByAndUpdatedByFromModel(instanceModelShopShopAppointment),
                    ]
                },
                include: [
                    { model: instanceModelShopBusinessCustomers, as: 'ShopBusinessCustomers' },
                    { model: instanceModelShopPersonalCustomers, as: 'ShopPersonalCustomers' },
                    { model: instanceModelShopVehicleCustomers, as: 'ShopVehicleCustomers' },
                ],
                where: {
                    id: request.params.id
                }
            });

            await handleSaveLog(request, [[handlerName], ""]);

            return utilSetFastifyResponseJson("success", findShopAppointment);
        }
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};

const handlerAdd = async (request, reply = {}, options = {}) => {
    const handlerName = 'post shopAppointment add';

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        if (!isUUID(request.body.bus_customer_id) && !isUUID(request.body.per_customer_id)) {
            throw Error(`Require one of ['bus_customer_id', 'per_customer_id'] contains valid data from request`);
        }

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        return await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                /**
                 * A class's dynamics instance of model "ShopSalesTransactionDoc"
                 */
                const instanceModelShopAppointment = modelShopAppointment(table_name);

                // Create database's table
                // Currently is not use, due is waste of process
                // await instanceModelShopAppointment.sync();

                const createRunNumber = await utilGetRunNumberFromModel(
                    instanceModelShopAppointment,
                    'run_no',
                    {
                        prefix_config: await utilGetDocumentTypePrefix(
                            _.get(request.body, 'doc_type_id', ''),
                            {
                                defaultPrefix: config_run_number_shop_appointment_prefix,
                                transaction: transaction
                            }
                        ).then(r => r.prefix),
                        transaction: transaction
                    }
                );

                if (isUUID(request.body.vehicles_customers_id) && _.isFinite(Number(_.get(request.body, 'details.mileage', 0)))) {
                    request.body.details.mileage_average = await utilGetAverageVehicleCustomerMileage(
                        table_name,
                        request.body.vehicles_customers_id,
                        Number(_.get(request.body, 'details.mileage', 0)),
                        {
                            transaction: transaction
                        }
                    );

                    if (_.isFinite(Number(request.body.details.mileage_average))) {
                        request.body.details.mileage_average = String(request.body.details.mileage_average)
                    }
                    else {
                        throw Error(`details.mileage_average is not Finite`);
                    }
                }

                const tempInsertData = {
                    ...request.body,
                    ...{ start_date: new Date(request.body.start_date) },
                    ...{ end_date: new Date(request.body.end_date) },
                    run_no: createRunNumber.runNumber,
                    code_id: createRunNumber.runString,
                    created_by: request.id,
                    created_date: currentDateTime,
                    updated_by: null,
                    updated_date: null,
                };

                delete tempInsertData.id;

                const createdDocument = await instanceModelShopAppointment.create(
                    tempInsertData,
                    {
                        transaction: transaction
                    }
                );

                await handleSaveLog(request, [[handlerName, createdDocument.id, request.body], '']);

                return utilSetFastifyResponseJson('success', createdDocument);
            }
        );
    } catch (error) {
        await handleSaveLog(request, [[handlerName, '', request.body], error]);

        throw error;
    }
};

const handlerPut = async (request, reply = {}, options = {}) => {
    const handlerName = "put shopAppointment put";

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        return await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
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
                // const status = [0, 1, 2].includes(request.body.status) ? { status: request.body.status } : {};
                const isuse = request.body.status || undefined

                if (isuse) {
                    if (isuse == 'delete') {
                        request.body.status = 2
                    } else if (isuse == 'active') {
                        request.body.status = 1
                    } else if (isuse == 'block') {
                        request.body.status = 0
                    } else {
                        await handleSaveLog(request, [[action], 'status not allow'])
                        return ({ status: "failed", data: "status not allow" })
                    }

                }

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
                         * A class's dynamics instance of model "ShopAppointment"
                         */
                        const instanceModelShopAppointment = modelShopAppointment(table_name);


                        const findCurrentDocument = await instanceModelShopAppointment.findOne({
                            where: {
                                id: request_pk_id
                            },
                            transaction: transaction
                        });



                        await instanceModelShopAppointment.update(
                            {
                                ...request.body,
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

                        const findUpdatedDocument = await instanceModelShopAppointment.findOne({
                            where: {
                                id: request_pk_id
                            },
                            transaction: transaction
                        });


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

module.exports = {
    handlerAll,
    handlerById,
    handlerAdd,
    handlerPut
};