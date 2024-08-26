const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const db = require("../db");
const { Transaction } = require("sequelize");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
/**
 * @type {import("lodash")}
 */
const _ = require("lodash");
const { initShopModel } = require("../models/model");
const utilGetModelsAndShopModels = require("../utils/util.GetModelsAndShopModels");

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T> || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault || {}} options
 */
const handlerShopTaxInvoiceDocPut = async (request = {}, reply = {}, options = {}) => {
    const action = 'PUT ShopTaxInvoiceDoc.Put';

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
        let edit_price = request.body.edit_price || false


        const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || initShopModel(table_name);
        const {
            ShopTaxInvoiceDoc,
            ShopTaxInvoiceList
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

                const findShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                    where: {
                        id: request.params.id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopTaxInvoiceDoc) {
                    throw new Error(`ไม่พบใบข้อมูลเอกสารใบกำกับภาษี`);
                }
                if (findShopTaxInvoiceDoc.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาตให้แก้ไขเอกสารใบกำกับภาษีเนื่องจากถูกยกเลิกหรือลบไปแล้ว`);
                }

                if ((request.body?.status === 0 || request.body?.status === 2) && findShopTaxInvoiceDoc.get('status') === 1) {
                    const previousDataValues = findShopTaxInvoiceDoc.toJSON();
                    findShopTaxInvoiceDoc.set({
                        status: request.body.status,
                        updated_by: request.id,
                        updated_date: currentDateTime
                    });
                    await findShopTaxInvoiceDoc.save({ transaction: transaction, ShopModels: ShopModels });

                    return {
                        previous: previousDataValues,
                        current: await findShopTaxInvoiceDoc.reload({ transaction: transaction, ShopModels: ShopModels }),
                        changed: true
                    };
                }

                if (edit_price === true) {
                    const previousDataValues = findShopTaxInvoiceDoc.toJSON();

                    findShopTaxInvoiceDoc.set({
                        ...request.body,
                        updated_date: currentDateTime
                    });
                    await findShopTaxInvoiceDoc.save({ transaction: transaction, ShopModels: ShopModels });

                    let shop_tax_list = request.body.ShopTaxInvoiceLists || []

                    if (shop_tax_list.length > 0) {

                        for (let index = 0; index < shop_tax_list.length; index++) {
                            const element = shop_tax_list[index];

                            let findShopTaxInvoiceList = await ShopTaxInvoiceList.findOne({
                                where: {
                                    id: element.id
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });

                            if (findShopTaxInvoiceList) {
                                findShopTaxInvoiceList.set({
                                    ...element,
                                    updated_date: currentDateTime
                                });
                                await findShopTaxInvoiceList.save({ transaction: transaction, ShopModels: ShopModels });

                            }

                        }

                    }

                    return {
                        previous: previousDataValues,
                        current: await findShopTaxInvoiceDoc.reload({ transaction: transaction, ShopModels: ShopModels }),
                        changed: true
                    };
                }
                /**
                 * @type {Object<string, *>}
                 */
                const objFieldsToUpdate = {
                    ...request.body,
                    updated_by: request.id,
                    updated_date: currentDateTime
                };
                const fnDelKey = (path = '') => {
                    if (_.has(objFieldsToUpdate, path)) {
                        delete objFieldsToUpdate[path];
                    }
                };
                fnDelKey('id');
                fnDelKey('shop_id');

                /**
                 * @type {Object<string, *>}
                 */
                const previousDataValues = findShopTaxInvoiceDoc.toJSON();
                findShopTaxInvoiceDoc.set(objFieldsToUpdate);

                /**
                 * @type {Object<string, boolean>}
                 */
                const objFieldsIsChanged = {
                    is_abb: findShopTaxInvoiceDoc.changed('is_abb'),
                    is_inv: findShopTaxInvoiceDoc.changed('is_inv'),
                    status: findShopTaxInvoiceDoc.changed('status')
                };
                let checkIsChanged = false;
                for (const objDataIsChangedKey in objFieldsIsChanged) {
                    if (objFieldsIsChanged[objDataIsChangedKey]) {
                        checkIsChanged = true;
                        break;
                    }
                }

                if (checkIsChanged) {
                    if (objFieldsIsChanged.is_abb) {
                        if (findShopTaxInvoiceDoc.previous('is_abb') === true) {
                            throw new Error(`ไม่อนุญาตให้สร้างใบกำกับภาษีอย่างย่อซ้ำ`);
                        }
                        if (findShopTaxInvoiceDoc.get('is_abb') === true) {
                            findShopTaxInvoiceDoc.set({
                                abb_doc_date: currentDateTime
                            });
                        }
                    }
                    if (objFieldsIsChanged.is_inv) {
                        if (findShopTaxInvoiceDoc.previous('is_inv') === true) {
                            throw new Error(`ไม่อนุญาตให้สร้างใบกำกับภาษีเต็มรูปซ้ำ`);
                        }
                        if (findShopTaxInvoiceDoc.get('is_inv') === true) {
                            findShopTaxInvoiceDoc.set({
                                inv_doc_date: currentDateTime
                            });
                        }
                    }

                    await findShopTaxInvoiceDoc.save({
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    return {
                        previous: previousDataValues,
                        current: await findShopTaxInvoiceDoc.reload({ transaction: transaction, ShopModels: ShopModels }),
                        changed: true
                    };
                }
                else {
                    return {
                        previous: previousDataValues,
                        current: await findShopTaxInvoiceDoc.reload({ transaction: transaction, ShopModels: ShopModels }),
                        changed: false
                    };
                }

            }
        );

        await handleSaveLog(request, [[action, request.params.id, request.body, transactionResult], '']);

        return utilSetFastifyResponseJson('success', transactionResult);

    } catch (error) {
        await handleSaveLog(request, [[action, request.params.id], error]);

        return utilSetFastifyResponseJson('failed', error.toString());
    }
};


module.exports = handlerShopTaxInvoiceDocPut;