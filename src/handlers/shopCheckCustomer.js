const _ = require("lodash");
const XLSX = require('xlsx')
const fs = require('fs');
const { Op, Transaction } = require("sequelize");
const { isNull, isUUID } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilCheckShopTableName = require('../utils/util.CheckShopTableName');
const utilGetRunNumberFromModel = require("../utils/util.GetRunNumberFromModel");
const utilGetDocumentTypePrefix = require("../utils/util.GetDocumentTypePrefix");
const {
    config_run_number_shop_vehicle_customer_prefix_prefix,
    config_run_number_master_vehicle_brand_prefix,
    config_run_number_master_vehicle_type_prefix
} = require("../config");

const sequelize = require('../db');
const { ShopBank, BankNameList } = require("../models/model");
const VehicleType = require('../models/model').VehicleType;
const VehicleBrand = require('../models/model').VehicleBrand;
const VehicleModelType = require('../models/model').VehicleModelType;
const ShopCheckCustomer = require('../models/model').ShopCheckCustomer;
const ShopPersonalCustomers = require('../models/model').ShopPersonalCustomers;
const ShopBusinessCustomers = require('../models/model').ShopBusinessCustomers;
const Province = require('../models/model').Province;

/**
    * ใบสั่งซ่อม
    */
const doc_type_id = "7ef3840f-3d7f-43de-89ea-dce215703c16"




const handleAdd = async (request, reply) => {
    const action = 'add ShopCheckCustomer';

    try {
        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const { bus_customer_id, per_customer_id } = request.body;

        if (!bus_customer_id && !per_customer_id) {
            throw Error(`กรุณาเลือกลูกค้าธุระกิจหรือบคุคลธรรมอย่างใดอย่างหนึ่ง`);
        }
        if (isUUID(bus_customer_id) && isUUID(per_customer_id)) {
            throw Error(`อนุญาติให้เพิ่มลูกค้าธุระกิจหรือบคุคลธรรมอย่างใดอย่างหนึ่งเท่านั้น`);
        }

        const transactionResult = await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction
                }


                const additionalPrefix = (findShopsProfileArray.length > 1) ? 'HQ' : ''

                const createDocument = await ShopCheckCustomer(table_name).create(
                    {
                        ...request.body,
                        shop_id: shop_table.id,
                        isuse: 1,
                        created_by: request.id,
                        created_date: Date.now()
                    },
                    {
                        transaction: transaction
                    }
                );


                for (let index = 0; index < findShopsProfileArray.length; index++) {
                    const element = findShopsProfileArray[index];
                    if (element.shop_code_id !== table_name) {
                        await ShopCheckCustomer(element.shop_code_id).create(
                            { ...createDocument.dataValues, ...{ shop_id: element.id } })
                            .then()
                            .catch((err) => {
                                console.log(err)
                            })
                    }

                }

                return createDocument;
            }
        );

        await handleSaveLog(request, [[action, transactionResult.id, request.body], '']);

        return utilSetFastifyResponseJson("success", transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handleAll = async (request, reply) => {
    const action = 'get ShopCheckCustomer all';

    try {
        const search = request.query.search || '';
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'desc';
        const status = request.query.status;

        const bus_customer_id = request.query.bus_customer_id || null;
        const per_customer_id = request.query.per_customer_id || null;



        let isuse = [];
        switch (status) {
            case 'active': {
                isuse = [1];
                break;
            }
            case 'block': {
                isuse = [0];
                break;
            }
            case 'delete': {
                isuse = [2];
                break;
            }
            default: {
                isuse = [2, 1, 0];
                break;
            }
        }

        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        const where_q = {
            [Op.and]: [
                { isuse: isuse },
                (per_customer_id) ? { per_customer_id: per_customer_id } : {},
                (bus_customer_id) ? { bus_customer_id: bus_customer_id } : {}
            ],
            [Op.or]: [
                sequelize.literal(`"ShopBusinessCustomer".customer_name->>'th' ILIKE '%'||$1||'%'`),
                sequelize.literal(`"ShopPersonalCustomer".tel_no::text  ILIKE '%'||$1||'%'`),
                sequelize.literal(`CONCAT("ShopPersonalCustomer".customer_name->'first_name'->>'th' ,' ',"ShopPersonalCustomer".customer_name->'last_name'->>'th' )  ILIKE '%'||$1||'%'`),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopBusinessCustomer"."mobile_no"->>'mobile_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopBusinessCustomer"."tel_no"->>'tel_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopPersonalCustomer"."mobile_no"->>'mobile_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopPersonalCustomer"."tel_no"->>'tel_no_${w}' ILIKE '%'||$1||'%'`))),
            ]
        };



        const [findDocuments, length_data] = await Promise.all([
            ShopCheckCustomer(table_name).findAll({
                order: [
                    ...(
                        !search
                            ? []
                            : [
                                [sequelize.literal(`CONCAT("ShopPersonalCustomer".customer_name->'first_name'->>'th' ,' ',"ShopPersonalCustomer".customer_name->'last_name'->>'th' )  ILIKE '%'||$1||'%'`), 'DESC'],
                            ]
                    ),
                    [sort, order]
                ],
                include: [
                    { model: ShopPersonalCustomers(table_name) },
                    { model: ShopBusinessCustomers(table_name) },
                    { model: ShopBank(table_name) },
                    { model: BankNameList }
                ],
                attributes: {
                    include: [
                        // [sequelize.literal('json_array_length(shelf)'), 'shelf_total'],
                        [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopCheckCustomer\".\"created_by\" )"), 'created_by'],
                        [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopCheckCustomer\".\"updated_by\" )"), 'updated_by'],
                    ]
                },
                where: where_q,
                bind: [search],
                limit: limit,
                offset: (page - 1) * limit
            }),
            ShopCheckCustomer(table_name).count({
                include: [
                    { model: ShopPersonalCustomers(table_name) },
                    { model: ShopBusinessCustomers(table_name) },
                    { model: ShopBank(table_name) },
                    { model: BankNameList }
                ],
                where: where_q,
                bind: [search]
            })
        ]);

        const pag = {
            currentPage: page,
            pages: Math.ceil(length_data / limit),
            currentCount: findDocuments.length,
            totalCount: length_data,
            data: findDocuments
        };


        await handleSaveLog(request, [[action], '']);

        return ({ status: 'success', data: pag });

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handleById = async (request, reply) => {
    const action = 'get ShopCheckCustomer byid';

    try {
        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;
        const ShopCheckCustomer_id = request.params.id;

        const findDocument = await ShopCheckCustomer(table_name).findOne({
            where: {
                id: ShopCheckCustomer_id
            },
            attributes: {
                include: [
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopCheckCustomer\".\"created_by\" )"), 'created_by'],
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopCheckCustomer\".\"updated_by\" )"), 'updated_by'],
                ]
            },
            include: [
                { model: ShopPersonalCustomers(table_name) },
                { model: ShopBusinessCustomers(table_name) },
                { model: ShopBank(table_name) },
                { model: BankNameList }
            ]
        });

        await handleSaveLog(request, [[action], '']);

        return utilSetFastifyResponseJson("success", [findDocument]);
    }
    catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handlePut = async (request, reply) => {
    const action = 'put ShopCheckCustomer';

    try {
        const ShopCheckCustomer_id = request.params.id;
        const { bus_customer_id, per_customer_id, bank_id, check_no, check_branch, check_date, check_amount, shop_bank_id, check_receive_date, check_status, details } = request.body;
        const isuse = request.body.status;

        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const transactionResult = await sequelize.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction
                }

                let data = {};

                const find_ShopCheckCustomer = await ShopCheckCustomer(table_name).findAll({
                    where: { id: ShopCheckCustomer_id },
                    transaction: transaction
                });

                if (!find_ShopCheckCustomer[0]) {
                    throw Error('ShopCheckCustomer not found');
                }
                if (isNull(bus_customer_id) || isUUID(bus_customer_id)) {
                    data.bus_customer_id = bus_customer_id;
                }
                if (isNull(per_customer_id) || isUUID(per_customer_id)) {
                    data.per_customer_id = per_customer_id;
                }
                if (!isNull(bank_id)) {
                    data.bank_id = bank_id;
                }
                if (!isNull(check_no)) {
                    data.check_no = check_no;
                }
                if (!isNull(check_branch)) {
                    data.check_branch = check_branch;
                }
                if (!isNull(check_date)) {
                    data.check_date = check_date;
                }
                if (!isNull(check_amount)) {
                    data.check_amount = check_amount;
                }
                if (!isNull(shop_bank_id)) {
                    data.shop_bank_id = shop_bank_id;
                }
                if (!isNull(check_receive_date)) {
                    data.check_receive_date = check_receive_date;
                }
                if (!isNull(check_status)) {
                    data.check_status = check_status;
                }
                if (!isNull(details)) {
                    data.details = details;
                }
                if (!isNull(isuse)) {
                    switch (isuse) {
                        case 'active': {
                            data.isuse = 1;
                            break;
                        }
                        case 'block': {
                            data.isuse = 0;
                            break;
                        }
                        case 'delete': {
                            data.isuse = 2;
                            break;
                        }
                        default: {
                            throw Error('status not allow');
                        }
                    }
                }

                data.updated_by = request.id;

                data.updated_date = Date.now();

                const beforeUpdateDocument = await ShopCheckCustomer(table_name).findOne({
                    where: {
                        id: ShopCheckCustomer_id
                    },
                    transaction: transaction
                });

                const updateDocument = await ShopCheckCustomer(table_name).update(data, {
                    where: {
                        id: ShopCheckCustomer_id
                    },
                    transaction: transaction
                });

                for (let index = 0; index < findShopsProfileArray.length; index++) {
                    const element = findShopsProfileArray[index];
                    if (element.shop_code_id !== table_name) {

                        let findShopVehiclesCustomersHq = await ShopCheckCustomer(element.shop_code_id).findOne({
                            where: { id: ShopCheckCustomer_id },
                            transaction: transaction
                        });

                        if (findShopVehiclesCustomersHq) {
                            findShopVehiclesCustomersHq.set({
                                ...data,
                                ...{ shop_id: element.id },
                                updated_by: request.id,
                                updated_date: Date.now()
                            });

                            // Validate new values before save on this document
                            await findShopVehiclesCustomersHq.validate();
                            // Save new values on this document
                            await findShopVehiclesCustomersHq.save({ validate: true, transaction: transaction });
                        }

                    }

                }

                const afterUpdateDocument = await ShopCheckCustomer(table_name).findOne({
                    where: {
                        id: ShopCheckCustomer_id
                    },
                    transaction: transaction
                });

                return {
                    beforeUpdateDocument: beforeUpdateDocument,
                    afterUpdateDocument: afterUpdateDocument
                }
            }
        );


        await handleSaveLog(request, [[action, ShopCheckCustomer_id, request.body, transactionResult.beforeUpdateDocument], '']);

        return utilSetFastifyResponseJson("success", transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = {
    handleAdd,
    handleAll,
    handleById,
    handlePut
}