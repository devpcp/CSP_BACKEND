const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const db = require("../db");
const { Transaction } = require("sequelize");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
/**
 * @type {import("lodash")}
 */
const _ = require("lodash");
const { isUUID } = require("../utils/generate");
const { Op } = require("sequelize");
const {
    initShopModel
} = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T> || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault || {}} options
 */
const handlerShopTemporaryDeliveryOrderDocPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopTemporaryDeliveryOrderDoc.Put';

    try {
        /**
         * @type {Date}
         */
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
            ShopTemporaryDeliveryOrderDoc,
            ShopTemporaryDeliveryOrderList,
            ShopServiceOrderDoc,
            ShopServiceOrderList
        } = ShopModels;

        const transaction = request?.transaction || options?.transaction || null;

        const transactionResult = await db.transaction(
            {
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
                transaction: transaction
            },
            async (transaction) => {
                if (!request.transaction || !options?.transaction) {
                    request.transaction = transaction;
                    options.transaction = transaction;
                }

                const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels,
                });
                if (!findShopTemporaryDeliveryOrderDoc) {
                    throw new Error(`ไม่พบใบข้อมูลเอกสารใบส่งสินค้าชั่วคราว`);
                }
                if (findShopTemporaryDeliveryOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาตให้แก้ไขเอกสารใบส่งสินค้าชั่วคราวเนื่องจากถูกยกเลิกหรือลบไปแล้ว`);
                }

                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: findShopTemporaryDeliveryOrderDoc.get('shop_service_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels,
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบใบข้อมูลเอกสารใบสั่งซ่อม`);
                }
                if (findShopServiceOrderDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาตให้แก้ไขเอกสารใบส่งสินค้าชั่วคราวเนื่องจากเอกสารใบสั่งซ่อมถูกยกเลิกหรือลบไปแล้ว`);
                }

                if (!_.isUndefined(request.body?.status)) {
                    const status = Number(request.body.status);
                    if (status !== 1 && findShopTemporaryDeliveryOrderDoc.previous('status') === 1) {
                        const previousData__findShopTemporaryDeliveryOrderDoc = findShopTemporaryDeliveryOrderDoc.toJSON();
                        findShopTemporaryDeliveryOrderDoc.set({
                            status: status,
                            updated_by: request.id,
                            updated_date: currentDateTime
                        });
                        await findShopTemporaryDeliveryOrderDoc.save({ transaction: transaction, ShopModels: ShopModels, });
                        return {
                            ShopTemporaryDeliveryOrderDoc: {
                                previous: previousData__findShopTemporaryDeliveryOrderDoc,
                                current: await findShopTemporaryDeliveryOrderDoc.reload({ transaction: transaction, ShopModels: ShopModels, }),
                                changed: true
                            },
                            ShopServiceOrderDoc: {
                                previous: findShopTemporaryDeliveryOrderDoc.toJSON(),
                                current: findShopTemporaryDeliveryOrderDoc,
                                changed: false
                            }
                        };
                    }
                }

                if (!_.isUndefined(request.body?.is_draft)) {
                    const is_draft = request.body.is_draft;
                    if (is_draft === false && findShopTemporaryDeliveryOrderDoc.previous('is_draft') === true) {
                        const previousData__findShopTemporaryDeliveryOrderDoc = findShopTemporaryDeliveryOrderDoc.toJSON();
                        findShopTemporaryDeliveryOrderDoc.set({
                            is_draft: is_draft,
                            updated_by: request.id,
                            updated_date: currentDateTime
                        });
                        await findShopTemporaryDeliveryOrderDoc.save({ transaction: transaction, ShopModels: ShopModels, });
                        return {
                            ShopTemporaryDeliveryOrderDoc: {
                                previous: previousData__findShopTemporaryDeliveryOrderDoc,
                                current: await findShopTemporaryDeliveryOrderDoc.reload({ transaction: transaction, ShopModels: ShopModels, }),
                                changed: true
                            },
                            ShopServiceOrderDoc: {
                                previous: findShopTemporaryDeliveryOrderDoc.toJSON(),
                                current: findShopTemporaryDeliveryOrderDoc,
                                changed: false
                            }
                        };
                    }
                }

                const updatedDoc = await ShopTemporaryDeliveryOrderDoc.updateShopTemporaryDeliveryOrderDoc(
                    findShopTemporaryDeliveryOrderDoc.get('id'),
                    request.body,
                    request.id,
                    {
                        currentDateTime: currentDateTime,
                        transaction: transaction,
                        ShopModels: ShopModels,
                    }
                );

                /**
                 * @type {string[]}
                 */
                const savedListsId = [];
                /**
                 * @type {{createdDocs: Array<{ShopTemporaryDeliveryOrderList: {previous: Object<string, *>, current: ShopTemporaryDeliveryOrderList, changed: boolean}, ShopServiceOrderList: {previous: Object<string, *>, current: ShopServiceOrderList, changed: boolean}}>, updatedDocs: Array<{ShopTemporaryDeliveryOrderList: {previous: Object<string, *>, current: ShopTemporaryDeliveryOrderList, changed: boolean}, ShopServiceOrderList: {previous: Object<string, *>, current: ShopServiceOrderList, changed: boolean}}>}}
                 */
                let arrUpdatedLists = {
                    createdDocs: [],
                    updatedDocs: []
                };
                if (Array.isArray(request.body?.shopTemporaryDeliveryOrderLists) && request.body?.shopTemporaryDeliveryOrderLists.length > 0) {
                    arrUpdatedLists = await ShopTemporaryDeliveryOrderList.updateOrCreateShopTemporaryDeliveryOrderList(
                        findShopTemporaryDeliveryOrderDoc.get('id'),
                        request.body.shopTemporaryDeliveryOrderLists,
                        request.id,
                        {
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels,
                        }
                    );
                    arrUpdatedLists.updatedDocs.forEach(w => {
                        savedListsId.push(w.ShopTemporaryDeliveryOrderList.current.get('id'))
                    });
                    arrUpdatedLists.createdDocs.forEach(w => {
                        savedListsId.push(w.ShopTemporaryDeliveryOrderList.current.get('id'))
                    });
                }

                // ลบรายการที่ไม่ใช้งาน
                /**
                 * @type {{createdDocs: Array<{ShopTemporaryDeliveryOrderList: {previous: Object<string, *>, current: ShopTemporaryDeliveryOrderList, changed: boolean}, ShopServiceOrderList: {previous: Object<string, *>, current: ShopServiceOrderList, changed: boolean}}>, updatedDocs: Array<{ShopTemporaryDeliveryOrderList: {previous: Object<string, *>, current: ShopTemporaryDeliveryOrderList, changed: boolean}, ShopServiceOrderList: {previous: Object<string, *>, current: ShopServiceOrderList, changed: boolean}}>}}
                 */
                const arrCanceledLists = {
                    createdDocs: [],
                    updatedDocs: []
                };
                const findUnusedShopTemporaryDeliveryOrderLists = await ShopTemporaryDeliveryOrderList.findAll({
                    where: {
                        id: {
                            [Op.notIn]: savedListsId
                        },
                        shop_temporary_delivery_order_doc_id: findShopTemporaryDeliveryOrderDoc.get('id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels,
                });
                for (let index = 0; index < findUnusedShopTemporaryDeliveryOrderLists.length; index++) {
                    const findUnusedShopTemporaryDeliveryOrderList = findUnusedShopTemporaryDeliveryOrderLists[index];
                    const previousData__findUnusedShopTemporaryDeliveryOrderList = findUnusedShopTemporaryDeliveryOrderList.toJSON();

                    const findUnusedShopServiceOrderList = await ShopServiceOrderList.findOne({
                        where: {
                            id: findUnusedShopTemporaryDeliveryOrderList.get('shop_service_order_list_id')
                        },
                        transaction: transaction,
                        ShopModels: ShopModels,
                    });
                    const previousData__findUnusedShopServiceOrderList = findUnusedShopServiceOrderList.toJSON();

                    findUnusedShopTemporaryDeliveryOrderList.set({
                        status: 0,
                        updated_by: request.id,
                        updated_at: currentDateTime
                    });
                    await findUnusedShopTemporaryDeliveryOrderList.save({ transaction: transaction, ShopModels: ShopModels, });

                    findUnusedShopServiceOrderList.set({
                        status: 0,
                        updated_by: request.id,
                        updated_at: currentDateTime
                    });
                    await findUnusedShopServiceOrderList.save({ transaction: transaction, ShopModels: ShopModels, });

                    arrCanceledLists.updatedDocs.push({
                        ShopTemporaryDeliveryOrderList: {
                            previous: previousData__findUnusedShopTemporaryDeliveryOrderList,
                            current: await findUnusedShopTemporaryDeliveryOrderList.reload({ transaction: transaction, ShopModels: ShopModels, }),
                            changed: true
                        },
                        ShopServiceOrderList: {
                            previous: previousData__findUnusedShopServiceOrderList,
                            current: await findUnusedShopServiceOrderList.reload({ transaction: transaction, ShopModels: ShopModels, }),
                            changed: true
                        }
                    });
                }


                await ShopTemporaryDeliveryOrderList.mutationFields__ProportionDiscount(
                    findShopTemporaryDeliveryOrderDoc.get('id'),
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
                await ShopServiceOrderList.mutationFields__ProportionDiscount(
                    findShopServiceOrderDoc.get('id'),
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );

                return {
                    ShopTemporaryDeliveryOrderDoc: {
                        previous: updatedDoc.ShopTemporaryDeliveryOrderDoc.previous,
                        current: updatedDoc.ShopTemporaryDeliveryOrderDoc.current,
                        changed: updatedDoc.ShopTemporaryDeliveryOrderDoc.changed
                    },
                    ShopTemporaryDeliveryOrderLists: {
                        created: [...arrUpdatedLists.createdDocs, ...arrCanceledLists.createdDocs]
                            .map(w => ({ ShopTemporaryDeliveryOrderList: w.ShopTemporaryDeliveryOrderList })),
                        updated: [...arrUpdatedLists.updatedDocs, ...arrCanceledLists.updatedDocs]
                            .map(w => ({ ShopTemporaryDeliveryOrderList: w.ShopTemporaryDeliveryOrderList }))
                    },
                    ShopServiceOrderDoc: {
                        previous: updatedDoc.ShopServiceOrderDoc.previous,
                        current: updatedDoc.ShopServiceOrderDoc.current,
                        changed: updatedDoc.ShopServiceOrderDoc.changed
                    },
                    ShopServiceOrderLists: {
                        created: [...arrUpdatedLists.createdDocs, ...arrCanceledLists.createdDocs]
                            .map(w => ({ ShopServiceOrderList: w.ShopServiceOrderList })),
                        updated: [...arrUpdatedLists.updatedDocs, ...arrCanceledLists.updatedDocs]
                            .map(w => ({ ShopServiceOrderList: w.ShopServiceOrderList }))
                    }
                };
            }
        );

        return utilSetFastifyResponseJson('success', transactionResult);
    }
    catch (error) {
        await handleSaveLog(request, [[action, request.params.id], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopTemporaryDeliveryOrderDocPut;