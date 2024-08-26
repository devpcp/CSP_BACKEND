/**
 * @type {import("@types/lodash")}
 */
const _ = require("lodash");
const { Transaction, Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const { isUUID } = require("../utils/generate");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const db = require("../db");
const {
    initShopModel
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault || {}} options
 */
const handlerShopServiceOrderDocPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopServiceOrderDoc.Put';

    try {
        const currentDateTime = options?.currentDateTime || new Date();
        options.currentDateTime = currentDateTime;

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopServiceOrderDoc,
            ShopServiceOrderList,
            ShopTemporaryDeliveryOrderDoc,
            ShopTaxInvoiceDoc
        } = ShopModels;

        /**
         * @type {{
         *  ShopServiceOrderDoc: { previous: ShopServiceOrderDoc; current: ShopServiceOrderDoc; },
         *  ShopServiceOrderLists: { previous?: ShopServiceOrderList; current: ShopServiceOrderList; }[]
         * }}
         */
        const transactionResult = await db.transaction(
            {
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
                transaction: request?.transaction || options?.transaction || null
            },
            async (transaction) => {
                if (!request.transaction || !options?.transaction) {
                    request.transaction = transaction;
                    options.transaction = transaction;
                }

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาติให้แก้ไขข้อมูลเอกสารใบสั่งซ่อมเนื่องจากถูกยกเลิกหรือลบไปแล้ว`);
                }

                const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                    where: {
                        shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                        status: 1
                    },
                    transaction: transaction
                });
                if (findShopTemporaryDeliveryOrderDoc) {
                    if (request.body?.status === undefined || request.body?.status === 1) {
                        throw new Error(`ไม่อนุญาติให้แก้ไขข้อมูลเอกสารใบสั่งซ่อมเนื่องจากมีใบสั่งสินค้าชั่วคราวที่เปิดใช้อยู่`)
                    }
                }

                const findShopShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                    where: {
                        shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                        status: 1
                    },
                    transaction: transaction
                });
                if (findShopShopTaxInvoiceDoc) {
                    if (request.body?.status === undefined || request.body?.status === 1) {
                        throw new Error(`ไม่อนุญาติให้แก้ไขข้อมูลเอกสารใบสั่งซ่อมเนื่องจากมีเอกสารใบกำกับภาษีที่เปิดใช้อยู่`)
                    }
                }

                if (_.isBoolean(request.body?.is_draft)) { // Feature สำหรับปรับปรุงเอกสารใบสั่งซ่อม จากแบบบันทึกร่าง เป็นฉบับจริง
                    if (findShopServiceOrderDoc.get('is_draft') === true && request.body.is_draft === false) {
                        findShopServiceOrderDoc.set({
                            is_draft: request.body.is_draft,
                            updated_by: request.id,
                            updated_date: currentDateTime
                        });
                    }
                    delete request.body.is_draft;
                }

                if (request.body?.status === 0 || request.body?.status === 2) { // ยกเลิกเอกสาร
                    if (findShopServiceOrderDoc.previous('status') === 1) {
                        const findShopServiceOrderList = await ShopServiceOrderList.findAll({
                            where: {
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id')
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });

                        /**
                         * @type {{previous: ShopServiceOrderList; current: ShopServiceOrderList;}[]}
                         */
                        const arrShopServiceOrderLists = [];
                        for (let index = 0; index < findShopServiceOrderList.length; index++) {
                            const element = findShopServiceOrderList[index];
                            const previousDataValues = element.toJSON();
                            arrShopServiceOrderLists.push({
                                previous: previousDataValues,
                                current: await element.reload({ transaction: transaction, ShopModels: ShopModels })
                            });
                        }

                        const previousDataValues = findShopServiceOrderDoc.toJSON();

                        findShopServiceOrderDoc.set({
                            status: request.body.status,
                            updated_by: request.id,
                            updated_date: currentDateTime
                        });
                        await findShopServiceOrderDoc.save({ transaction: transaction, ShopModels: ShopModels });

                        return {
                            ShopServiceOrderDoc: {
                                previous: previousDataValues,
                                current: findShopServiceOrderDoc,
                            },
                            ShopServiceOrderLists: arrShopServiceOrderLists
                        };
                    }
                    else {
                        throw Error('ไม่อนุญาติให้ยกเลิกเอกสารที่เคยยกเลิกไปแล้ว');
                    }
                }
                else { // แก้ไขเอกสาร
                    /**
                     * @type {{previous: ShopServiceOrderList; current: ShopServiceOrderList;}[]}
                     */
                    const arrShopServiceOrderLists = [];
                    if (request.body.shopServiceOrderLists?.length > 0) {
                        for (let index = 0; index < request.body.shopServiceOrderLists.length; index++) {
                            const element = request.body.shopServiceOrderLists[index];

                            if (!element?.id) { // สร้างรายการสินค้าใหม่
                                /**
                                 * @type {Object}
                                 */
                                const reqShopServiceOrderList = {
                                    ...element,
                                    shop_id: findShopServiceOrderDoc.get('shop_id'),
                                    shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                    created_by: request.id,
                                    created_date: currentDateTime
                                };
                                delete reqShopServiceOrderList.status;

                                const createdShopServiceOrderList = await ShopServiceOrderList.create(
                                    reqShopServiceOrderList,
                                    {
                                        transaction: transaction,
                                        ShopModels: ShopModels
                                    }
                                );

                                arrShopServiceOrderLists.push({
                                    previous: null,
                                    current: createdShopServiceOrderList
                                });
                            }
                            else { // แก้ไขรายการสินค้าที่มีอยู่
                                if (!isUUID(element.id)) {
                                    throw Error('รายการสินค้าที่เคยเลือกไว้ บางรายการส่งข้อมูล id ไม่ถูกต้อง');
                                }
                                else {
                                    const findShopServiceOrderList = await ShopServiceOrderList.findOne({
                                        where: {
                                            id: element.id,
                                            status: 1
                                        },
                                        transaction: transaction,
                                        ShopModels: ShopModels
                                    });
                                    if (!findShopServiceOrderList) {
                                        throw Error(`ไม่พบรายการสินค้าที่เคยสร้างไว้`);
                                    }
                                    else {
                                        const previousDataValues = findShopServiceOrderList.toJSON();

                                        findShopServiceOrderList.set({
                                            ...element,
                                            shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                            updated_by: request.id,
                                            updated_date: currentDateTime
                                        });
                                        await findShopServiceOrderList.save({ transaction: transaction, ShopModels: ShopModels });

                                        arrShopServiceOrderLists.push({
                                            previous: previousDataValues,
                                            current: await findShopServiceOrderList.reload({ transaction: transaction, ShopModels: ShopModels })
                                        });
                                    }
                                }
                            }
                        }

                        // ลบรายการที่ไม่ได้ใช้งาน
                        const findUnusedShopServiceOrderList = await ShopServiceOrderList.findAll({
                            where: {
                                id: {
                                    [Op.notIn]: arrShopServiceOrderLists.map(element => element.current.get('id'))
                                },
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                status: 1
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        for (let index = 0; index < findUnusedShopServiceOrderList.length; index++) {
                            const element = findUnusedShopServiceOrderList[index];

                            element.set({
                                status: 0,
                                updated_by: request.id,
                                updated_date: currentDateTime
                            });
                            await element.save({ transaction: transaction, ShopModels: ShopModels });
                        }
                    }

                    /**
                     * @type {Object}
                     */
                    const reqSaveShopServiceOrderDoc = {
                        ...request.body,
                        updated_by: request.id,
                        updated_date: currentDateTime
                    };
                    if (reqSaveShopServiceOrderDoc.body?.shop_id !== undefined) {
                        delete reqSaveShopServiceOrderDoc.body.shop_id;
                    }
                    if (reqSaveShopServiceOrderDoc.body?.status !== undefined) {
                        delete reqSaveShopServiceOrderDoc.body.status;
                    }
                    if (reqSaveShopServiceOrderDoc.body?.shopServiceOrderLists !== undefined) {
                        delete reqSaveShopServiceOrderDoc.body.shopServiceOrderLists;
                    }

                    const previousDataValues = findShopServiceOrderDoc.toJSON();
                    findShopServiceOrderDoc.set(reqSaveShopServiceOrderDoc);
                    await findShopServiceOrderDoc.save({ transaction: transaction, ShopModels: ShopModels });

                    await ShopServiceOrderList.mutationFields__ProportionDiscount(
                        findShopServiceOrderDoc.get('id'),
                        {
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    const findSequenceNumber = await ShopServiceOrderList.findAll({
                        attributes: ['id', 'seq_number'],
                        where: {
                            shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                            status: 1
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (findSequenceNumber.length > 0) { // ตรวจสอบลำดับรายการสินค้าว่าซ้ำกันหรือไม่?
                        const checkDuplicated = findSequenceNumber.filter(
                            where =>
                                where.get('id') !== where.get('id')
                                && where.get('seq_number') === where.get('seq_number')
                        );
                        if (checkDuplicated.length > 0) {
                            throw Error('ลำดับรายการสินค้าซ้ำกัน, กรุณาตรวจสอบ');
                        }
                    }

                    return {
                        ShopServiceOrderDoc: {
                            previous: previousDataValues,
                            current: findShopServiceOrderDoc,
                        },
                        ShopServiceOrderLists: arrShopServiceOrderLists
                    };
                }
            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult.ShopServiceOrderDoc], '']);
        for (let index = 0; index < transactionResult.ShopServiceOrderLists.length; index++) {
            const element = transactionResult.ShopServiceOrderLists[index];
            await handleSaveLog(request, [[action, request.params.id, request.body, element], '']);
        }

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopServiceOrderDocPut;