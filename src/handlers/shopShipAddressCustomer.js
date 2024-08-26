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

const sequelize = require('../db');
const Province = require('../models/model').Province;
const District = require('../models/model').District;
const SubDistrict = require('../models/model').SubDistrict;
const ShopShipAddressCustomer = require('../models/model').ShopShipAddressCustomer;
const ShopPersonalCustomers = require('../models/model').ShopPersonalCustomers;
const ShopBusinessCustomers = require('../models/model').ShopBusinessCustomers;
const ShopBusinessPartners = require('../models/model').ShopBusinessPartners;


const handleAdd = async (request, reply) => {
    const action = 'add ShopShipAddressCustomer';

    try {
        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;

        request.query.select_shop_ids = 'all'
        const findShopsProfileArray = await utilCheckShopTableName(request, 'select_shop_ids', 'ignore_throw');

        const { address_name, address, bus_customer_id, per_customer_id, bus_partner_id, details, province_id, district_id, subdistrict_id } = request.body;

        if ((bus_customer_id ? 1 : 0) + (per_customer_id ? 1 : 0) + (bus_partner_id ? 1 : 0) != 1) {
            throw Error(`กรุณาเลือกลูกค้าธุระกิจหรือบคุคลธรรมหรือผู้จำหน่ายอย่างใดอย่างหนึ่ง`);
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



                const createDocument = await ShopShipAddressCustomer(table_name).create(
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
                        await ShopShipAddressCustomer(element.shop_code_id).create(
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
    const action = 'get ShopShipAddressCustomer all';

    try {
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const search = request.query.search || '';
        const sort = request.query.sort || 'created_date';
        const order = request.query.order || 'desc';
        const bus_customer_id = request.query.bus_customer_id || null;
        const per_customer_id = request.query.per_customer_id || null;
        const bus_partner_id = request.query.bus_partner_id || null;
        const status = request.query.status;


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
                (bus_customer_id) ? { bus_customer_id: bus_customer_id } : {},
                (bus_partner_id) ? { bus_partner_id: bus_partner_id } : {},
            ],
            [Op.or]: [
                sequelize.literal(`"ShopShipAddressCustomer".address_name->>'th' ILIKE '%'||$1||'%'`),
                sequelize.literal(`"ShopShipAddressCustomer".address_name->>'en' ILIKE '%'||$1||'%'`),
                sequelize.literal(`"ShopShipAddressCustomer".address->>'th' ILIKE '%'||$1||'%'`),
                sequelize.literal(`"ShopShipAddressCustomer".address->>'en' ILIKE '%'||$1||'%'`),
                sequelize.literal(`"ShopBusinessCustomer".customer_name->>'th' ILIKE '%'||$1||'%'`),
                sequelize.literal(`"ShopPersonalCustomer".tel_no::text  ILIKE '%'||$1||'%'`),
                sequelize.literal(`CONCAT("ShopPersonalCustomer".customer_name->'first_name'->>'th' ,' ',"ShopPersonalCustomer".customer_name->'last_name'->>'th' )  ILIKE '%'||$1||'%'`),
                sequelize.literal(`details::text LIKE '%'||$1||'%'`),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopBusinessCustomer"."mobile_no"->>'mobile_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopBusinessCustomer"."tel_no"->>'tel_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopPersonalCustomer"."mobile_no"->>'mobile_no_${w}' ILIKE '%'||$1||'%'`))),
                ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => sequelize.literal(`"ShopPersonalCustomer"."tel_no"->>'tel_no_${w}' ILIKE '%'||$1||'%'`))),
            ]
        };

        const [findDocuments, length_data] = await Promise.all([
            ShopShipAddressCustomer(table_name).findAll({
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
                    { model: ShopBusinessPartners(table_name) },
                    { model: Province },
                    { model: District },
                    { model: SubDistrict }
                ],
                attributes: {
                    include: [
                        // [sequelize.literal('json_array_length(shelf)'), 'shelf_total'],
                        [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopShipAddressCustomer\".\"created_by\" )"), 'created_by'],
                        [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopShipAddressCustomer\".\"updated_by\" )"), 'updated_by'],
                    ]
                },
                where: where_q,
                bind: [search],
                limit: limit,
                offset: (page - 1) * limit
            }),
            ShopShipAddressCustomer(table_name).count({
                include: [
                    { model: ShopPersonalCustomers(table_name) },
                    { model: ShopBusinessCustomers(table_name) },
                    { model: ShopBusinessPartners(table_name) },
                    { model: Province },
                    { model: District },
                    { model: SubDistrict }
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
    const action = 'get ShopShipAddressCustomer byid';

    try {
        const shop_table = await utilCheckShopTableName(request);
        const table_name = shop_table.shop_code_id;
        const id = request.params.id;

        const findDocument = await ShopShipAddressCustomer(table_name).findOne({
            where: {
                id: id
            },
            attributes: {
                include: [
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopShipAddressCustomer\".\"created_by\" )"), 'created_by'],
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopShipAddressCustomer\".\"updated_by\" )"), 'updated_by'],
                ]
            },
            include: [
                { model: ShopPersonalCustomers(table_name) },
                { model: ShopBusinessCustomers(table_name) },
                { model: ShopBusinessPartners(table_name) },
                { model: Province },
                { model: District },
                { model: SubDistrict }
            ]
        });

        await handleSaveLog(request, [[action], '']);

        return utilSetFastifyResponseJson("success", findDocument);
    }
    catch (error) {
        await handleSaveLog(request, [[action], `error : ${error.toString()}`]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


const handlePut = async (request, reply) => {
    const action = 'put ShopShipAddressCustomer';

    try {
        const ShopVehicleCustomer_id = request.params.id;
        const { address_name, address, bus_customer_id, per_customer_id, bus_partner_id, details, province_id, district_id, subdistrict_id } = request.body;
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

                const find_ShopVehicleCustomer = await ShopShipAddressCustomer(table_name).findAll({
                    where: { id: ShopVehicleCustomer_id },
                    transaction: transaction
                });

                if (!find_ShopVehicleCustomer[0]) {
                    throw Error('ShopShipAddressCustomer not found');
                }
                if (!isNull(address_name)) {
                    data.address_name = address_name;
                }
                if (!isNull(address)) {
                    data.address = address;
                }
                if (isNull(bus_customer_id) || isUUID(bus_customer_id)) {
                    data.bus_customer_id = bus_customer_id;
                }
                if (isNull(per_customer_id) || isUUID(per_customer_id)) {
                    data.per_customer_id = per_customer_id;
                }
                if (isNull(bus_partner_id) || isUUID(bus_partner_id)) {
                    data.bus_partner_id = bus_partner_id;
                }
                if (!isNull(details)) {
                    data.details = details;
                }
                if (!isNull(province_id)) {
                    data.province_id = province_id;
                }
                if (!isNull(district_id)) {
                    data.district_id = district_id;
                }
                if (!isNull(subdistrict_id)) {
                    data.subdistrict_id = subdistrict_id;
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

                const beforeUpdateDocument = await ShopShipAddressCustomer(table_name).findOne({
                    where: {
                        id: ShopVehicleCustomer_id
                    },
                    transaction: transaction
                });

                const updateDocument = await ShopShipAddressCustomer(table_name).update(data, {
                    where: {
                        id: ShopVehicleCustomer_id
                    },
                    transaction: transaction
                });

                for (let index = 0; index < findShopsProfileArray.length; index++) {
                    const element = findShopsProfileArray[index];
                    if (element.shop_code_id !== table_name) {

                        let findShopVehiclesCustomersHq = await ShopShipAddressCustomer(element.shop_code_id).findOne({
                            where: { id: ShopVehicleCustomer_id },
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

                const afterUpdateDocument = await ShopShipAddressCustomer(table_name).findOne({
                    where: {
                        id: ShopVehicleCustomer_id
                    },
                    transaction: transaction
                });

                return {
                    beforeUpdateDocument: beforeUpdateDocument,
                    afterUpdateDocument: afterUpdateDocument
                }
            }
        );


        await handleSaveLog(request, [[action, ShopVehicleCustomer_id, request.body, transactionResult.beforeUpdateDocument], '']);

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