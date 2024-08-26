/**
 * A function do dynamics table of model ShopCustomerDebtDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_customer_debt_doc"
 */
const ShopCustomerDebtDoc = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const moment = require("moment");
    const { isUUID } = require("../../utils/generate");
    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");
    const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

    const Model = require("sequelize").Model;
    const { DataTypes, literal, QueryTypes } = require("sequelize");

    const db = require("../../db");

    const __model = require("../model");
    const User = __model.User;
    const ShopProfile = __model.ShopsProfiles;
    const DocumentType = __model.DocumentTypes;
    const ShopDocumentCode = __model.ShopDocumentCode(table_name);
    const ShopBusinessCustomer = __model.ShopBusinessCustomers(table_name);
    const ShopPersonalCustomer = __model.ShopPersonalCustomers(table_name);

    const default_doc_type_code_id = 'CDD';

    class ShopCustomerDebtDoc extends Model {
        /**
         * สร้างเอกสารลูกหนี้การค้า
         * @param {string} shop_id
         * @param {string} userId
         * @param {Object<string, *>} shopCustomerDebtDoc
         * @param {{
         *     transaction?: import("sequelize").Transaction || null;
         *     currentDateTime?: Date;
         *     ShopModels?: Object;
         * }} options
         */
        static async createShopCustomerDebt_Doc (shop_id, userId, shopCustomerDebtDoc = {}, options = {}) {
            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }

            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopCustomerDebtDoc
            } = ShopModels;

            const objToCreate = {
                ...shopCustomerDebtDoc,

                price_discount_bill: 0,
                price_discount_before_pay: 0,
                price_sub_total: 0,
                price_discount_total: 0,
                price_amount_total: 0,
                price_before_vat: 0,
                price_vat: 0,
                price_grand_total: 0,

                debt_price_amount: 0,
                debt_price_amount_left: 0,
                debt_price_paid_adjust: 0,
                debt_price_paid_total: 0,

                shop_id: shop_id,
                payment_paid_status: 1,
                status: 1,
                created_by: userId,
                created_date: currentDateTime,
                updated_by: null,
                updated_date: null
            };

            delete objToCreate.id;
            delete objToCreate.code_id;
            delete objToCreate.code_id_prefix;
            delete objToCreate.doc_type_code_id;

            const createdShopCustomerDebtDoc = await ShopCustomerDebtDoc.create(
                objToCreate,
                {
                    validate: true,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            return {
                isCreated: true,
                isUpdated: false,
                previousData: null,
                currentData: createdShopCustomerDebtDoc
            };
        }

        /**
         * สร้างเอกสารลูกหนี้การค้า และรายการ
         * @param {string} shop_id
         * @param {string} userId
         * @param {Object<string, *>} shopCustomerDebtDoc
         * @param {Array<Object<string, *>>} shopCustomerDebtLists
         * @param {{
         *     transaction?: import("sequelize").Transaction || null;
         *     currentDateTime?: Date;
         *     ShopModels?: Object;
         * }} options
         */
        static async createShopCustomerDebt_Doc_Lists (shop_id, userId, shopCustomerDebtDoc = {}, shopCustomerDebtLists = [], options = {}) {
            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }

            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopCustomerDebtDoc,
                ShopCustomerDebtList
            } = ShopModels;

            const createdShopCustomerDebtDoc = await ShopCustomerDebtDoc.createShopCustomerDebt_Doc(
                shop_id,
                userId,
                shopCustomerDebtDoc,
                {
                    ...options,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            const createdShopCustomerDebtLists = await ShopCustomerDebtList.createOrEditShopCustomerDebt_Lists(
                shop_id,
                userId,
                createdShopCustomerDebtDoc.currentData.get('id'),
                shopCustomerDebtLists,
                {
                    ...options,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            const [
                reduce_SUM_ShopCustomerDebtLists__price_discount_bill,
                reduce_SUM_ShopCustomerDebtLists__price_discount_before_pay,
                reduce_SUM_ShopCustomerDebtLists__price_sub_total,
                reduce_SUM_ShopCustomerDebtLists__price_discount_total,
                reduce_SUM_ShopCustomerDebtLists__price_amount_total,
                reduce_SUM_ShopCustomerDebtLists__price_before_vat,
                reduce_SUM_ShopCustomerDebtLists__price_vat,
                reduce_SUM_ShopCustomerDebtLists__price_grand_total,
                reduce_SUM_ShopCustomerDebtLists__price_debt_grand_total,
                reduce_SUM_ShopCustomerDebtLists__debt_price_paid_adjust,
                reduce_SUM_ShopCustomerDebtLists__debt_price_paid_total
            ] = await Promise.all([
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_bill') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_before_pay') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_sub_total') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_total') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_amount_total') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_before_vat') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_vat') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_grand_total') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_debt_grand_total') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_paid_adjust') || 0);
                    }
                }, 0),
                createdShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_paid_total') || 0);
                    }
                }, 0),
            ]);

            createdShopCustomerDebtDoc.currentData.set({
                price_discount_bill: reduce_SUM_ShopCustomerDebtLists__price_discount_bill,
                price_discount_before_pay: reduce_SUM_ShopCustomerDebtLists__price_discount_before_pay,
                price_sub_total: reduce_SUM_ShopCustomerDebtLists__price_sub_total,
                price_discount_total: reduce_SUM_ShopCustomerDebtLists__price_discount_total,
                price_amount_total: reduce_SUM_ShopCustomerDebtLists__price_amount_total,
                price_before_vat: reduce_SUM_ShopCustomerDebtLists__price_before_vat,
                price_vat: reduce_SUM_ShopCustomerDebtLists__price_vat,
                price_grand_total: reduce_SUM_ShopCustomerDebtLists__price_grand_total,
                price_debt_grand_total: Object.hasOwn(shopCustomerDebtDoc, 'price_debt_grand_total')
                    ? shopCustomerDebtDoc.price_debt_grand_total !== null
                        ? shopCustomerDebtDoc.price_debt_grand_total
                        : reduce_SUM_ShopCustomerDebtLists__price_debt_grand_total
                    : reduce_SUM_ShopCustomerDebtLists__price_debt_grand_total,
                debt_price_paid_adjust: Object.hasOwn(shopCustomerDebtDoc, 'debt_price_paid_adjust')
                    ? shopCustomerDebtDoc.debt_price_paid_adjust !== null
                        ? shopCustomerDebtDoc.debt_price_paid_adjust
                        : reduce_SUM_ShopCustomerDebtLists__debt_price_paid_adjust
                    : reduce_SUM_ShopCustomerDebtLists__debt_price_paid_adjust,
                debt_price_paid_total: Object.hasOwn(shopCustomerDebtDoc, 'debt_price_paid_total')
                    ? shopCustomerDebtDoc.debt_price_paid_total !== null
                        ? shopCustomerDebtDoc.debt_price_paid_total
                        : reduce_SUM_ShopCustomerDebtLists__debt_price_paid_total
                    : reduce_SUM_ShopCustomerDebtLists__debt_price_paid_total
            });
            await createdShopCustomerDebtDoc.currentData.save({ transaction: transaction, ShopModels: ShopModels });
            await createdShopCustomerDebtDoc.currentData.reload({ transaction: transaction, ShopModels: ShopModels });

            if (isUUID(createdShopCustomerDebtDoc.currentData.get('bus_customer_id'))) {
                await ShopCustomerDebtDoc.updateCustomerDebtAmount(
                    createdShopCustomerDebtDoc.currentData.get('shop_id'),
                    createdShopCustomerDebtDoc.currentData.get('bus_customer_id'),
                    'bus_customer_id',
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            if (isUUID(createdShopCustomerDebtDoc.currentData.get('per_customer_id'))) {
                await ShopCustomerDebtDoc.updateCustomerDebtAmount(
                    createdShopCustomerDebtDoc.currentData.get('shop_id'),
                    createdShopCustomerDebtDoc.currentData.get('per_customer_id'),
                    'per_customer_id',
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }

            return {
                ShopCustomerDebtDoc: createdShopCustomerDebtDoc,
                ShopCustomerDebtLists: createdShopCustomerDebtLists
            };
        }

        static async cancelShopCustomerDebt_Doc (userId, shop_customer_debt_doc_id, options = {}) {
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }
            if (!isUUID(shop_customer_debt_doc_id)) {
                throw new Error(`Require parameter 'shop_customer_debt_doc_id' as UUID`);
            }

            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopCustomerDebtDoc
            } = ShopModels;

            const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                where: {
                    id: shop_customer_debt_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findShopCustomerDebtDoc) {
                throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้การค้า`);
            }
            else if (findShopCustomerDebtDoc.previous('status') !== 1) {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารลูกหนี้การค้าได้เนื่องจากเอกสารถูกยกเลิกไปแล้ว`);
            }
            else {
                const objToUpdate = {
                    payment_paid_status: 0,
                    status: 2,
                    updated_by: userId,
                    updated_date: currentDateTime
                };

                const previousData = findShopCustomerDebtDoc.toJSON();

                findShopCustomerDebtDoc.set(objToUpdate);

                await findShopCustomerDebtDoc.save({ transaction: transaction, ShopModels: ShopModels });

                if (isUUID(findShopCustomerDebtDoc.get('bus_customer_id'))) {
                    await ShopCustomerDebtDoc.updateCustomerDebtAmount(
                        findShopCustomerDebtDoc.get('shop_id'),
                        findShopCustomerDebtDoc.get('bus_customer_id'),
                        'bus_customer_id',
                        {
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );
                }
                if (isUUID(findShopCustomerDebtDoc.get('per_customer_id'))) {
                    await ShopCustomerDebtDoc.updateCustomerDebtAmount(
                        findShopCustomerDebtDoc.get('shop_id'),
                        findShopCustomerDebtDoc.get('per_customer_id'),
                        'per_customer_id',
                        {
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );
                }

                return {
                    isCreated: false,
                    isUpdated: false,
                    previousData: previousData,
                    currentData: findShopCustomerDebtDoc
                };
            }
        }

        /**
         * แก้ไขเอกสารลูกหนี้การค้า
         * @param {string} shop_id
         * @param {string} userId
         * @param {string} shop_customer_debt_doc_id
         * @param {Object<string, *>} shopCustomerDebtDoc
         * @param {{
         *     transaction?: import("sequelize").Transaction || null;
         *     currentDateTime?: Date;
         *     ShopModels?: Object;
         * }} options
         */
        static async editShopCustomerDebt_Doc (shop_id, userId, shop_customer_debt_doc_id, shopCustomerDebtDoc = {}, options = {}) {
            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }
            if (!isUUID(shop_customer_debt_doc_id)) {
                throw new Error(`Require parameter 'shop_customer_debt_doc_id' as UUID`);
            }

            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopCustomerDebtDoc
            } = ShopModels;

            const objToUpdate = {
                ...shopCustomerDebtDoc,
                updated_by: userId,
                updated_date: currentDateTime
            };

            delete objToUpdate.id;
            delete objToUpdate.shop_id;
            delete objToUpdate.code_id;
            delete objToUpdate.code_id_prefix;
            delete objToUpdate.doc_type_code_id;
            delete objToUpdate.price_discount_bill;
            delete objToUpdate.price_discount_before_pay;
            delete objToUpdate.price_sub_total;
            delete objToUpdate.price_discount_total;
            delete objToUpdate.price_amount_total;
            delete objToUpdate.price_before_vat;
            delete objToUpdate.price_vat;
            delete objToUpdate.price_grand_total;
            delete objToUpdate.payment_paid_status;
            delete objToUpdate.created_by;
            delete objToUpdate.created_date;

            const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                where: {
                    id: shop_customer_debt_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findShopCustomerDebtDoc) {
                throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้การค้า`);
            }
            else if (findShopCustomerDebtDoc.previous('status') !== 1) {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารลูกหนี้การค้าได้เนื่องจากเอกสารถูกยกเลิกไปแล้ว`);
            }
            else {
                if (
                    findShopCustomerDebtDoc.previous('status') === 1 && findShopCustomerDebtDoc.get('status') === 0
                    || (findShopCustomerDebtDoc.previous('status') === 1 && findShopCustomerDebtDoc.get('status') === 2)
                ) {
                    const canceledDoc =  await ShopCustomerDebtDoc.cancelShopCustomerDebt_Doc(
                        userId,
                        shop_customer_debt_doc_id,
                        {
                            ...options,
                            currentDateTime: currentDateTime,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    return canceledDoc;
                }
                else {
                    const previousData = findShopCustomerDebtDoc.toJSON();

                    findShopCustomerDebtDoc.set(objToUpdate);

                    await findShopCustomerDebtDoc.save({ transaction: transaction, ShopModels: ShopModels });

                    return {
                        isCreated: false,
                        isUpdated: true,
                        previousData: previousData,
                        currentData: findShopCustomerDebtDoc
                    };
                }
            }
        }

        /**
         * แก้ไขเอกสารลูกหนี้การค้า และรายการ
         * @param {string} shop_id
         * @param {string} userId
         * @param {string} shop_customer_debt_doc_id
         * @param {Object<string, *>} shopCustomerDebtDoc
         * @param {Array<Object<string, *>>} shopCustomerDebtLists
         * @param {{
         *     transaction?: import("sequelize").Transaction || null;
         *     currentDateTime?: Date;
         *     ShopModels?: Object;
         * }} options
         */
        static async editShopCustomerDebt_Doc_Lists (shop_id, userId, shop_customer_debt_doc_id,  shopCustomerDebtDoc = {}, shopCustomerDebtLists = [], options = {}) {
            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }
            if (!isUUID(shop_customer_debt_doc_id)) {
                throw new Error(`Require parameter 'shop_customer_debt_doc_id' as UUID`);
            }

            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopCustomerDebtDoc,
                ShopCustomerDebtList
            } = ShopModels;

            const updatedShopCustomerDebtLists = await ShopCustomerDebtList.createOrEditShopCustomerDebt_Lists(
                shop_id,
                userId,
                shop_customer_debt_doc_id,
                shopCustomerDebtLists,
                {
                    ...options,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels,
                    isCancelStatus_Doc: shopCustomerDebtDoc?.status === 0 || shopCustomerDebtDoc?.status === 2
                }
            );

            const updatedShopCustomerDebtDoc = await ShopCustomerDebtDoc.editShopCustomerDebt_Doc(
                shop_id,
                userId,
                shop_customer_debt_doc_id,
                shopCustomerDebtDoc,
                {
                    ...options,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            const [
                reduce_SUM_ShopCustomerDebtLists__price_discount_bill,
                reduce_SUM_ShopCustomerDebtLists__price_discount_before_pay,
                reduce_SUM_ShopCustomerDebtLists__price_sub_total,
                reduce_SUM_ShopCustomerDebtLists__price_discount_total,
                reduce_SUM_ShopCustomerDebtLists__price_amount_total,
                reduce_SUM_ShopCustomerDebtLists__price_before_vat,
                reduce_SUM_ShopCustomerDebtLists__price_vat,
                reduce_SUM_ShopCustomerDebtLists__price_grand_total,
                reduce_SUM_ShopCustomerDebtLists__price_debt_grand_total,
                reduce_SUM_ShopCustomerDebtLists__debt_price_paid_adjust,
                reduce_SUM_ShopCustomerDebtLists__debt_price_paid_total
            ] = await Promise.all([
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_bill') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_before_pay') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_sub_total') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_total') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_amount_total') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_before_vat') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_vat') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_grand_total') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_debt_grand_total') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_paid_adjust') || 0);
                    }
                }, 0),
                updatedShopCustomerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_paid_total') || 0);
                    }
                }, 0),
            ]);

            updatedShopCustomerDebtDoc.currentData.set({
                price_discount_bill: reduce_SUM_ShopCustomerDebtLists__price_discount_bill,
                price_discount_before_pay: reduce_SUM_ShopCustomerDebtLists__price_discount_before_pay,
                price_sub_total: reduce_SUM_ShopCustomerDebtLists__price_sub_total,
                price_discount_total: reduce_SUM_ShopCustomerDebtLists__price_discount_total,
                price_amount_total: reduce_SUM_ShopCustomerDebtLists__price_amount_total,
                price_before_vat: reduce_SUM_ShopCustomerDebtLists__price_before_vat,
                price_vat: reduce_SUM_ShopCustomerDebtLists__price_vat,
                price_grand_total: reduce_SUM_ShopCustomerDebtLists__price_grand_total,
                price_debt_grand_total: Object.hasOwn(shopCustomerDebtDoc, 'price_debt_grand_total')
                    ? shopCustomerDebtDoc.price_debt_grand_total
                    : reduce_SUM_ShopCustomerDebtLists__price_debt_grand_total,
                debt_price_paid_adjust: Object.hasOwn(shopCustomerDebtDoc, 'debt_price_paid_adjust')
                    ? shopCustomerDebtDoc.debt_price_paid_adjust
                    : reduce_SUM_ShopCustomerDebtLists__debt_price_paid_adjust,
                debt_price_paid_total: Object.hasOwn(shopCustomerDebtDoc, 'debt_price_paid_total')
                    ? shopCustomerDebtDoc.debt_price_paid_total
                    : reduce_SUM_ShopCustomerDebtLists__debt_price_paid_total
            });
            await updatedShopCustomerDebtDoc.currentData.save({ transaction: transaction, ShopModels: ShopModels });
            await updatedShopCustomerDebtDoc.currentData.reload({ transaction: transaction, ShopModels: ShopModels });

            if (isUUID(updatedShopCustomerDebtDoc.currentData.get('bus_customer_id'))) {
                await ShopCustomerDebtDoc.updateCustomerDebtAmount(
                    updatedShopCustomerDebtDoc.currentData.get('shop_id'),
                    updatedShopCustomerDebtDoc.currentData.get('bus_customer_id'),
                    'bus_customer_id',
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }
            if (isUUID(updatedShopCustomerDebtDoc.currentData.get('per_customer_id'))) {
                await ShopCustomerDebtDoc.updateCustomerDebtAmount(
                    updatedShopCustomerDebtDoc.currentData.get('shop_id'),
                    updatedShopCustomerDebtDoc.currentData.get('per_customer_id'),
                    'per_customer_id',
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }

            return {
                ShopCustomerDebtDoc: updatedShopCustomerDebtDoc,
                ShopCustomerDebtLists: updatedShopCustomerDebtLists
            };
        }

        /**
         * @param {string} shop_id
         * @param {string} id - bus_customer_id OR per_customer_id
         * @param {"bus_customer_id" | "per_customer_id"} selectBy
         * @param {Object<string,*> & { transaction?: import("sequelize").Transaction; } | {}} options
         * @returns {Promise<Array<ShopBusinessCustomer|ShopPersonalCustomer>>}
         */
        static async updateCustomerDebtAmount(shop_id, id, selectBy, options = {}) {
            const transaction = options?.transaction || null;

            if (!isUUID(shop_id)) {
                throw  new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(id)) {
                throw  new Error(`Require parameter 'id' as UUID`);
            }
            if (['bus_customer_id', 'per_customer_id'].includes(selectBy) === false) {
                throw  new Error(`Require parameter selectBy 'bus_customer_id' or 'per_customer_id'`);
            }

            /**
             * @type {{
             *  id: string;
             *  shop_code_id: string;
             * }|null} - shop_code_id is Uppercase
             */
            const shop_profile = ((await db.query(
                `
                SELECT id, shop_code_id
                FROM app_datas.dat_shops_profiles
                WHERE id = '${shop_id}';
                `.replace(/(\s)+/ig, ' '),
                {
                    transaction: transaction,
                    type: QueryTypes.SELECT,
                    nest: true
                }
            ))[0] || null);
            if (!shop_profile) { throw new Error(`Parameter shop_id is not found`); }

            /**
             * @type {{
             *  id: string;
             *  shop_code_id: string;
             * }[]} - shop_code_id is Uppercase
             */
            const multibranch__shop_profiles = (await db.query(
                `
                SELECT id, shop_code_id
                FROM app_datas.dat_shops_profiles AS J
                WHERE J.id IN (
                    (
                        SELECT X.shop_id
                        FROM app_datas.match_shop_to_hq AS X
                        WHERE (
                            SELECT Y.hq_id
                            FROM app_datas.match_shop_to_hq AS Y
                            WHERE Y.shop_id = '${shop_profile.id}'
                        ) = X.hq_id
                    )
                )
                ORDER BY shop_code_id = '${shop_profile.shop_code_id}' ASC , shop_code_id DESC;
                `.replace(/(\s)+/ig, ' '),
                {
                    transaction: transaction,
                    type: QueryTypes.SELECT,
                    nest: true
                }
            ));

            let customer_debt_amount = 0;
            const fnGet__customer_debt_amount = async (table_name) => {
                if (!table_name) {
                    throw  new Error(`Require parameter 'table_name' as String`);
                }

                const sqlQuery = `
                SELECT (
                    coalesce((SELECT sum("ShopPaymentTransaction".payment_price_paid) AS customer_debt_total
                    FROM app_shops_datas.dat_01hq0013_payment_transaction AS "ShopPaymentTransaction"
                    WHERE "ShopPaymentTransaction".canceled_payment_date IS NULL
                        AND "ShopPaymentTransaction".canceled_payment_by IS NULL
                        AND "ShopPaymentTransaction".payment_method = 5
                        AND "ShopPaymentTransaction".payment_status = 1
                        AND "ShopPaymentTransaction".shop_service_order_doc_id IN
                            (SELECT "ShopServiceOrderDoc".id 
                             FROM app_shops_datas.dat_01hq0013_service_order_doc AS "ShopServiceOrderDoc" 
                             WHERE "ShopServiceOrderDoc".status = 1
                               AND ${selectBy === 'bus_customer_id' ? `"ShopServiceOrderDoc".bus_customer_id = '${id}'` : `"ShopServiceOrderDoc".per_customer_id = '${id}'`} )),0)
                    -
                    (
                        coalesce((
                            SELECT (sum("ShopCustomerDebtList".debt_price_paid_total + "ShopCustomerDebtList".debt_price_paid_adjust)) AS customer_debt_paid_total
                            FROM app_shops_datas.dat_01hq0013_customer_debt_list AS "ShopCustomerDebtList"
                            WHERE
                                "ShopCustomerDebtList".shop_customer_debt_doc_id IS NOT NULL
                                AND ((
                                    SELECT "ShopCustomerDebtDoc".id 
                                    FROM app_shops_datas.dat_01hq0013_customer_debt_doc AS "ShopCustomerDebtDoc" 
                                    WHERE "ShopCustomerDebtDoc".status = 1 
                                      AND "ShopCustomerDebtDoc".payment_paid_status IN (3,4) 
                                      AND "ShopCustomerDebtDoc".id = "ShopCustomerDebtList".shop_customer_debt_doc_id
                                      AND ${selectBy === 'bus_customer_id' ? `"ShopCustomerDebtDoc".bus_customer_id = '${id}'` : `"ShopCustomerDebtDoc".per_customer_id = '${id}'`}
                                ) = "ShopCustomerDebtList".shop_customer_debt_doc_id)
                        ),0)
                        +
                        coalesce((
                            SELECT sum("ShopPaymentTransaction".payment_price_paid) AS customer_debt_paid_total
                            FROM app_shops_datas.dat_01hq0013_payment_transaction AS "ShopPaymentTransaction"
                            WHERE "ShopPaymentTransaction".canceled_payment_date IS NULL
                                AND "ShopPaymentTransaction".canceled_payment_by IS NULL
                                AND "ShopPaymentTransaction".payment_method != 5
                                AND "ShopPaymentTransaction".payment_status = 1
                                AND "ShopPaymentTransaction".shop_customer_debt_doc_id IN
                                    (
                                        SELECT "ShopCustomerDebtDoc".id 
                                        FROM app_shops_datas.dat_01hq0013_customer_debt_doc AS "ShopCustomerDebtDoc" 
                                        WHERE "ShopCustomerDebtDoc".status = 1 
                                            AND "ShopCustomerDebtDoc".payment_paid_status = 2
                                            AND ${selectBy === 'bus_customer_id' ? `"ShopCustomerDebtDoc".bus_customer_id = '${id}'` : `"ShopCustomerDebtDoc".per_customer_id = '${id}'`}
                                    )
                        ),0)
                    )
                ) AS customer_debt_amount
                `
                    .replace(/(01hq0013)+/ig, table_name)
                    .replace(/(\s)+/ig, ' ');

                const customer_debt_amount = Number((await db.query(
                    sqlQuery,
                    {
                        transaction: transaction,
                        type: QueryTypes.SELECT,
                        nest: true
                    }
                ))[0]?.customer_debt_amount || 0);

                return customer_debt_amount;
            };
            if (multibranch__shop_profiles.length === 0) {
                const table_name = shop_profile.shop_code_id.toLowerCase();
                customer_debt_amount = customer_debt_amount + (await fnGet__customer_debt_amount(table_name));
            }
            else {
                for (let index = 0; index < multibranch__shop_profiles.length; index++) {
                    const element__multibranch__shop_profiles = multibranch__shop_profiles[index];
                    const table_name = element__multibranch__shop_profiles.shop_code_id.toLowerCase();
                    customer_debt_amount = customer_debt_amount + (await fnGet__customer_debt_amount(table_name));
                }
            }


            let customer_debt_min_active_doc_date = null;
            let customer_debt_max_active_doc_date = null;
            const fnSet__customer_debt_MinMax_active_doc_date = async (table_name) => {
                if (!table_name) {
                    throw  new Error(`Require parameter 'table_name' as String`);
                }

                let sqlQuery = ``;

                if (multibranch__shop_profiles.length === 0) {
                    sqlQuery = `
                        SELECT "ShopCustomerDebtDoc".bus_customer_id,
                               "ShopCustomerDebtDoc".per_customer_id,
                               min("ShopCustomerDebtDoc".doc_date) AS debt_min_active_doc_date,
                               max("ShopCustomerDebtDoc".doc_date) AS debt_max_active_doc_date
                        FROM app_shops_datas.dat_01hq0013_customer_debt_doc AS "ShopCustomerDebtDoc"
                        WHERE "ShopCustomerDebtDoc".payment_paid_status IN (1, 2)
                        AND "ShopCustomerDebtDoc".bus_customer_id ${selectBy === 'bus_customer_id' ? `= '${id}'` : `IS NULL`}
                        AND "ShopCustomerDebtDoc".per_customer_id ${selectBy === 'per_customer_id' ? `= '${id}'` : `IS NULL`}
                        GROUP BY "ShopCustomerDebtDoc".bus_customer_id, "ShopCustomerDebtDoc".per_customer_id
                    `.replace(/(01hq0013)+/ig, table_name);
                }
                else {
                    sqlQuery = multibranch__shop_profiles.reduce((prev, curr, idx) => {
                        if (idx > 0) {
                            prev += `\n UNION ALL `;
                        }

                        prev += `
                            SELECT "ShopCustomerDebtDoc".bus_customer_id,
                                   "ShopCustomerDebtDoc".per_customer_id,
                                   min("ShopCustomerDebtDoc".doc_date) AS debt_min_active_doc_date,
                                   max("ShopCustomerDebtDoc".doc_date) AS debt_max_active_doc_date
                            FROM app_shops_datas.dat_01hq0013_customer_debt_doc AS "ShopCustomerDebtDoc"
                            WHERE "ShopCustomerDebtDoc".payment_paid_status IN (1, 2)
                            AND "ShopCustomerDebtDoc".bus_customer_id ${selectBy === 'bus_customer_id' ? `= '${id}'` : `IS NULL`}
                            AND "ShopCustomerDebtDoc".per_customer_id ${selectBy === 'per_customer_id' ? `= '${id}'` : `IS NULL`}
                            GROUP BY "ShopCustomerDebtDoc".bus_customer_id, "ShopCustomerDebtDoc".per_customer_id
                        `.replace(/(01hq0013)+/ig, curr.shop_code_id.toLowerCase());

                        return prev;
                    }, ``);

                    sqlQuery = `
                        WITH CTE_1 AS (${sqlQuery})
                        SELECT CTE_1.bus_customer_id, CTE_1.per_customer_id, min(CTE_1.debt_min_active_doc_date) AS debt_min_active_doc_date, max(CTE_1.debt_max_active_doc_date) AS debt_max_active_doc_date
                        FROM CTE_1
                        WHERE CTE_1.bus_customer_id ${selectBy === 'bus_customer_id' ? `= '${id}'` : `IS NULL`} AND CTE_1.per_customer_id ${selectBy === 'per_customer_id' ? `= '${id}'` : `IS NULL`}
                        GROUP BY CTE_1.bus_customer_id, CTE_1.per_customer_id;
                    `;
                }

                sqlQuery.replace(/(\s)+/ig, ' ');

                const queryResult = (await db.query(
                    sqlQuery,
                    {
                        transaction: transaction,
                        type: QueryTypes.SELECT,
                        nest: true
                    }
                ))[0] || null;

                if (!queryResult) { return; }
                else {
                    if (!queryResult?.bus_customer_id && !queryResult?.per_customer_id) { return; }
                    else {
                        customer_debt_min_active_doc_date = queryResult?.debt_min_active_doc_date || null;
                        customer_debt_max_active_doc_date = queryResult?.debt_max_active_doc_date || null;

                        return;
                    }
                }
            };
            await fnSet__customer_debt_MinMax_active_doc_date(table_name);

            let customer_debt_credit_term = null;
            let customer_debt_due_date = null;
            const fnSet__customer_debt_credit_term = async (table_name) => {
                if (!table_name) {
                    throw  new Error(`Require parameter 'table_name' as String`);
                }

                let sqlQuery = ``;

                if (multibranch__shop_profiles.length === 0) {
                    sqlQuery = `
                        ${
                            selectBy === 'bus_customer_id'
                                ? `
                                    SELECT "ShopBusinessCustomer".id AS bus_customer_id, null AS per_customer_id, ("ShopBusinessCustomer".other_details->>'credit_term')::bigint AS credit_term
                                    FROM app_shops_datas.dat_01hq0013_business_customers AS "ShopBusinessCustomer"
                                    WHERE id = '${id}'
                                `
                                : `
                                    SELECT null AS bus_customer_id, "ShopPersonalCustomer".id AS per_customer_id, ("ShopPersonalCustomer".other_details->>'credit_term')::bigint AS credit_term
                                    FROM app_shops_datas.dat_01hq0013_personal_customers AS "ShopPersonalCustomer"
                                    WHERE id = '${id}'
                                `
                        }
                    `.replace(/(01hq0013)+/ig, table_name);
                }
                else {
                    sqlQuery = multibranch__shop_profiles.reduce((prev, curr, idx) => {
                        if (idx > 0) {
                            prev += `\n UNION ALL `;
                        }

                        prev += `
                            ${
                                selectBy === 'bus_customer_id'
                                    ? `
                                        SELECT "ShopBusinessCustomer".id AS bus_customer_id, null AS per_customer_id, ("ShopBusinessCustomer".other_details->>'credit_term')::bigint AS credit_term
                                        FROM app_shops_datas.dat_01hq0013_business_customers AS "ShopBusinessCustomer"
                                        WHERE id = '${id}'
                                    `
                                    : `
                                        SELECT null AS bus_customer_id, "ShopPersonalCustomer".id AS per_customer_id, ("ShopPersonalCustomer".other_details->>'credit_term')::bigint AS credit_term
                                        FROM app_shops_datas.dat_01hq0013_personal_customers AS "ShopPersonalCustomer"
                                        WHERE id = '${id}'
                                    `
                            }
                        `.replace(/(01hq0013)+/ig, curr.shop_code_id.toLowerCase());

                        return prev;
                    }, ``);

                    sqlQuery = `
                        WITH CTE_1 AS (${sqlQuery})
                        SELECT CTE_1.bus_customer_id, CTE_1.per_customer_id, max(CTE_1.credit_term) AS credit_term
                        FROM CTE_1
                        WHERE CTE_1.bus_customer_id ${selectBy === 'bus_customer_id' ? `= '${id}'` : `IS NULL`} AND CTE_1.per_customer_id ${selectBy === 'per_customer_id' ? `= '${id}'` : `IS NULL`}
                        GROUP BY CTE_1.bus_customer_id, CTE_1.per_customer_id;
                    `;
                }

                sqlQuery.replace(/(\s)+/ig, ' ');

                const queryResult = (await db.query(
                    sqlQuery,
                    {
                        transaction: transaction,
                        type: QueryTypes.SELECT,
                        nest: true
                    }
                ))[0] || null;

                if (!queryResult) { return; }
                else {
                    if (!queryResult?.bus_customer_id && !queryResult?.per_customer_id) { return; }
                    else {
                        customer_debt_credit_term = Number.isSafeInteger(Number(queryResult?.credit_term))
                            ? Number(queryResult?.credit_term)
                            : null;

                        if (customer_debt_min_active_doc_date && Number.isSafeInteger(customer_debt_credit_term)) {
                            const mmDebtDueDate = moment(customer_debt_min_active_doc_date);
                            if (customer_debt_credit_term > 0) {
                                mmDebtDueDate.add(customer_debt_credit_term, 'days');
                            }
                            customer_debt_due_date = mmDebtDueDate.toISOString();
                        }

                        return;
                    }
                }
            };
            await fnSet__customer_debt_credit_term(table_name);


            /**
             * @param {string} table_name
             * @returns {Promise<ShopBusinessCustomer|ShopPersonalCustomer|void>}
             */
            const fnUpdateCustomerDebtDetailsData = async (table_name) => {
                const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || require("../model").initShopModel(table_name);
                if (selectBy === 'bus_customer_id') {
                    const {
                        ShopBusinessCustomer
                    } = ShopModels;
                    const findShopBusinessCustomer = await ShopBusinessCustomer.findOne({
                        attributes: ['id', 'other_details'],
                        where: {
                            id: id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopBusinessCustomer) { return; }
                    const other_details = {
                        ...(findShopBusinessCustomer.get('other_details') || {}),
                        debt_amount: customer_debt_amount
                    };
                    findShopBusinessCustomer.set('other_details', other_details);
                    return await findShopBusinessCustomer.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                }
                else {
                    const {
                        ShopPersonalCustomer
                    } = ShopModels;
                    const findShopPersonalCustomer = await ShopPersonalCustomer.findOne({
                        attributes: ['id', 'other_details'],
                        where: {
                            id: id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopPersonalCustomer) { return; }
                    const other_details = {
                        ...(findShopPersonalCustomer.get('other_details') || {}),
                        debt_amount: customer_debt_amount,
                        debt_min_active_doc_date: customer_debt_min_active_doc_date,
                        debt_max_active_doc_date: customer_debt_max_active_doc_date,
                        debt_due_date: customer_debt_due_date
                    };
                    findShopPersonalCustomer.set('other_details', other_details);
                    return await findShopPersonalCustomer.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                }
            };

            if (multibranch__shop_profiles.length === 0) {
                const table_name = shop_profile.shop_code_id.toLowerCase();
                const updatedData =  await fnUpdateCustomerDebtDetailsData(table_name)
                return updatedData ? [updatedData] : [];
            }
            else {
                /**
                 * @type {Array<ShopBusinessCustomer|ShopPersonalCustomer>}
                 */
                const arrPromise = [];
                for (let index = 0; index < multibranch__shop_profiles.length; index++) {
                    const element__multibranch__shop_profiles = multibranch__shop_profiles[index];
                    const table_name = element__multibranch__shop_profiles.shop_code_id.toLowerCase();
                    arrPromise.push(await fnUpdateCustomerDebtDetailsData(table_name));
                }
                return arrPromise.filter(w => w);
            }
        }
    }

    ShopCustomerDebtDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารลูกหนี้การค้า`,
                type: DataTypes.UUID,
                defaultValue: literal('uuid_generate_v4()'),
                allowNull: false,
                primaryKey: true
            },
            shop_id: {
                comment: `รหัสตารางข้อมูลร้านค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopProfile,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            code_id: {
                comment: `รหัสเลขที่เอกสาร`,
                type: DataTypes.STRING,
                allowNull: false
            },
            code_id_prefix: {
                comment: `รหัสนำหน้าเลขที่เอกสาร`,
                type: DataTypes.STRING,
                allowNull: true
            },
            doc_type_id: {
                comment: `รหัสตารางข้อมูลประเภทเอกสาร`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: DocumentType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            doc_type_code_id: {
                comment: 'รหัสประเภทเอกสาร',
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: default_doc_type_code_id
            },
            doc_date: {
                comment: `วันที่เอกสาร`,
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            bus_customer_id: {
                comment: `รหัสตารางข้อมูลลูกค้าธุรกิจ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopBusinessCustomer,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            per_customer_id: {
                comment: `รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopPersonalCustomer,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            customer_credit_debt_unpaid_balance: {
                comment: `จำนวนหนี้ค้างชำระ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            customer_credit_debt_current_balance: {
                comment: `วงเงินหนี้คงเหลือ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            customer_credit_debt_approval_balance: {
                comment: `วงเงินหนี้อนุมัติ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            customer_credit_debt_payment_period: {
                comment: `ระยะเวลาชำระหนี้`,
                type: DataTypes.INTEGER,
                allowNull: false
            },
            price_discount_bill: {
                comment: `ส่วนลดท้ายบิล`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_discount_before_pay: {
                comment: `ส่วนลดก่อนชำระเงิน`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_sub_total: {
                comment: `รวมเป็นเงิน`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_discount_total: {
                comment: `ส่วนลดรวม`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_amount_total: {
                comment: `ราคาหลังหักส่วนลด`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_before_vat: {
                comment: `ราคาก่อนรวมภาษี`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_vat: {
                comment: `ภาษีมูลค่าเพิ่ม`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            price_grand_total: {
                comment: `จำนวนเงินรวมทั้งสิ้น`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            debt_due_date: {
                comment: `วันครบกำหนดชำระหนี้`,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            debt_price_paid_adjust: {
                comment: `จำนวนเงินสำหรับปรับปรุงส่วนต่างของยอดเงินที่จะชำระลูกหนี้ โดยจะเอาไปใช้เป็นการบวกเพิ่มหลังจากยอดที่จะชำระ (ส่วนต่างยอดชำระ)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_paid_total: {
                comment: `จำนวนเงินชำระลูกหนี้การค้ารวมทั้งสิ้น (ยอดชำระ)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            payment_paid_status: {
                comment: 'สถานะการชําระเงิน' +
                    '\n0 = ยกเลิกชำระ' +
                    '\n1 = ยังไม่ชำระ' +
                    '\n2 = ค้างชำระ' +
                    '\n3 = ชําระแล้ว' +
                    '\n4 = ชําระเกิน' +
                    '\n5 = ลูกหนี้การค้า (ห้ามใช้ เพราะเอกสารนี้เป็นลูกหนี้การค้าอยู่แล้ว)',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2, 3, 4]]
                }
            },
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    ref_doc: '',
                    ref_date: '',
                    meta_data: {
                    }
                }
            },
            status: {
                comment: 'สถานะเอกสาร' +
                    '\n0 = ลบเอกสาร' +
                    '\n1 = ใช้งานเอกสาร' +
                    '\n2 = ยกเลิกเอกสาร',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2]]
                }
            },
            created_by: {
                comment: `สร้างข้อมูลโดย`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: User,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            created_date: {
                comment: `สร้างข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal('now()')
            },
            updated_by: {
                comment: `ปรับปรุงข้อมูลโดย`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: User,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            updated_date: {
                comment: `ปรับปรุงข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            }
        },
        {
            sequelize: db,
            modelName: 'ShopCustomerDebtDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_customer_debt_doc`,
            comment: 'ตารางข้อมูลเอกสารลูกหนี้การค้า',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_ccd_doc_code_id`,
                    fields: ['code_id']
                }
            ]
        }
    );

    ShopCustomerDebtDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopCustomerDebtDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopCustomerDebtDoc.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopCustomerDebtDoc.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopCustomerDebtDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopCustomerDebtDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopServiceOrderDoc,
            ShopCustomerDebtList,
            ShopPaymentTransaction
        } = ShopModels;

        /**
         * ตรวจสอบฟิวส์ ต่าง ๆ ของเอกสารนี้
         * @param {ShopCustomerDebtDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validateFields = async (instance, options) => {
            if (instance.get('payment_paid_status') === 5) {
                throw new Error(`ไม่กำหนดสามารถสถานะการชําระเงินเป็น 'ลูกหนี้การค้า' ได้ เนื่องจากเอกสารเป็นลูกหนี้การค้าอยู่แล้ว`);
            }
        };

        /**
         * @param {ShopCustomerDebtDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDocRunNumber = async (instance, options) => {
            if (instance.isNewRecord) {
                instance.set({ code_id: `${default_doc_type_code_id}-XXXXXXXXX` });
            }
        };

        /**
         * @param {ShopCustomerDebtDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerCustomerCreditDebtFields = async (instance, options) => {
            if (instance.isNewRecord) {
                /**
                 * @param {string} fieldName
                 * @returns {{
                 *     fieldName: string;
                 *     isFinite: boolean;
                 *     value: number;
                 * }}
                 */
                const getField = (fieldName) => {
                    if (!fieldName) { throw new Error(`Required parameter 'fieldName'`); }
                    if (Number.isFinite(Number(instance.get(fieldName)))) {
                        return {
                            fieldName: fieldName,
                            isFinite: true,
                            value: Number(instance.get(fieldName))
                        };
                    }
                    else {
                        return {
                            fieldName: fieldName,
                            isFinite: false,
                            value: 0
                        };
                    }
                };

                /**
                 * @param {string} fieldName
                 * @param {number} value
                 */
                const setField = (fieldName, value) => {
                    if (!fieldName) { throw new Error(`Required parameter 'fieldName'`); }
                    instance.set(fieldName, value);
                };

                const obj__customer_credit_debt_unpaid_balance = getField('customer_credit_debt_unpaid_balance');
                const obj__customer_credit_debt_current_balance = getField('customer_credit_debt_current_balance');
                const obj__customer_credit_debt_approval_balance = getField('customer_credit_debt_approval_balance');
                const obj__customer_credit_debt_payment_period = getField('customer_credit_debt_payment_period');

                setField(obj__customer_credit_debt_unpaid_balance.fieldName, obj__customer_credit_debt_unpaid_balance.value);
                setField(obj__customer_credit_debt_current_balance.fieldName, obj__customer_credit_debt_current_balance.value);
                setField(obj__customer_credit_debt_approval_balance.fieldName, obj__customer_credit_debt_approval_balance.value);
                setField(obj__customer_credit_debt_payment_period.fieldName, obj__customer_credit_debt_payment_period.value);
            }
        };

        /**
         * เอกสารลูกหนี้การค้า จะต้องมีแค่รหัสหลักตารางลูกค้าธรรมดา หรือลูกค้าธุระกิจอย่างใดอย่างหนึ่งเท่านั้น
         * @param {ShopCustomerDebtDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDoc>} options
         */
        const hookBeforeSave_validatorOnlyOneOfPersonalCustomerOrBusinessCustomer = async (instance, options) => {
            /**
             * รหัสหลักลูกค้าธุระกิจ
             * @type {string | null}
             */
            const bus_customer_id = instance.get('bus_customer_id') || null;
            /**
             * รหัสหลักลูกค้าบุคคลธรรมดา
             * @type {string | null}
             */
            const per_customer_id = instance.get('per_customer_id') || null;
            if (!bus_customer_id && !per_customer_id) {
                throw new Error(`ไม่สามารถสร้างเอกสารลูกหนี้การค้าได้ เนื่องจากต้องการรหัสหลักลูกค้าธุระกิจหรือลูกค้าบุคคลธรรมดาอย่างใดอย่างหนึ่ง`);
            }
            if (bus_customer_id && per_customer_id) {
                throw new Error(`ไม่สามารถสร้างเอกสารลูกหนี้การค้าได้ เนื่องจากต้องการรหัสหลักลูกค้าธุระกิจหรือลูกค้าบุคคลธรรมดาอย่างใดอย่างหนึ่งเท่านั้น`);
            }
        };

        /**
         * @param {ShopCustomerDebtDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDoc>} options
         */
        const hookBeforeSave_mutationDocRunNumber = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (instance.isNewRecord) { // กรณีสร้างเอกสารใหม่
                const objPrefixDocCode = await utilGetDocumentTypePrefix(
                    instance.get('doc_type_id') || null,
                    {
                        transaction: transaction,
                        defaultPrefix: default_doc_type_code_id
                    }
                );
                instance.set('code_id_prefix', objPrefixDocCode.prefix);

                const createdShopDocumentCode = await ShopDocumentCode.create(
                    {
                        shop_id: instance.get('shop_id'),
                        doc_type_code: instance.get('code_id_prefix'),
                    },
                    {
                        transaction: transaction
                    }
                );
                instance.set('code_id', createdShopDocumentCode.get('code_id'));
            }
        };

        /**
         * @param {ShopCustomerDebtDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDoc>} options
         */
        const hookBeforeSave_setOptionsDocumentIsCancelStatus = async (instance, options) => {
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') === 0) {
                options.isCancelStatus_Doc = true;
            }
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') === 2) {
                options.isCancelStatus_Doc = true;
            }
        };

        /**
         * Mutation ข้อมูลฟิวส์ "details.meta_data"
         * @param {ShopCustomerDebtDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDoc>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_mutationField__details = async (instance, options) => {
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') !== 1) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const details = {
                ...(!instance.isNewRecord ? instance.previous('details') || {} : {}),
                ...(instance.get('details') || {}),
                meta_data: {
                    ...(!instance.isNewRecord ? instance.previous('details')?.meta_data || {} : {})
                }
            };

            if (
                (instance.isNewRecord)
                ||
                (
                    (!instance.isNewRecord && instance.previous('status') === 1)
                    &&
                    (
                        instance.changed('doc_type_id')
                        || instance.changed('bus_customer_id')
                        || instance.changed('per_customer_id')
                    )
                )
            ) {
                const fnFindAndSetToMetaData = async (instanceFieldName, metaDataFieldName, model, where = {}, transaction = null) => {
                    if (!instance.isNewRecord && !instance.changed(instanceFieldName)) { return; }
                    if (!isUUID(instance.get(instanceFieldName))) {
                        details.meta_data[metaDataFieldName] = null;
                        return;
                    }
                    else {
                        const findModelObject = await model.findOne({
                            where: where,
                            transaction: transaction
                        });
                        if (findModelObject) {
                            details.meta_data[metaDataFieldName] = findModelObject?.toJSON() || null;
                            return;
                        }
                        else {
                            details.meta_data[metaDataFieldName] = null;
                            return;
                        }
                    }
                };

                await Promise.all([
                    fnFindAndSetToMetaData(
                        'doc_type_id',
                        'DocumentType',
                        DocumentType,
                        {
                            id: instance.get('doc_type_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'bus_customer_id',
                        'ShopBusinessCustomer',
                        ShopBusinessCustomer,
                        {
                            id: instance.get('bus_customer_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'per_customer_id',
                        'ShopPersonalCustomer',
                        ShopPersonalCustomer,
                        {
                            id: instance.get('per_customer_id')
                        },
                        transaction
                    )
                ]);
            }

            instance.set('details', details);
        };

        /**
         * @param {ShopCustomerDebtDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDoc>) & {isCancelStatus_Doc?: boolean}} options
         */
        const hookAfterSave_mutationPaymentTransaction_ifThisDocumentSetToCancel = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) {
                /**
                 * @type {import("sequelize").Transaction | null}
                 */
                const transaction = options?.transaction || null;
                /**
                 * @type {Date}
                 */
                const currentDateTime = options?.currentDateTime || instance.get('updated_date') || new Date();

                const findShopPaymentTransactions = await ShopPaymentTransaction.findAll(
                    {
                        where: {
                            shop_customer_debt_doc_id: instance.get('id'),
                            canceled_payment_by: null,
                            canceled_payment_date: null
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
                for (let index = 0; index < findShopPaymentTransactions.length; index++) {
                    const findShopPaymentTransaction = findShopPaymentTransactions[index];
                    findShopPaymentTransaction.set({
                        canceled_payment_by: instance.get('updated_by') || null,
                        canceled_payment_date: currentDateTime,
                        updated_date: currentDateTime,
                        updated_by: instance.get('updated_by') || null
                    });
                    await findShopPaymentTransaction.save({ transaction: transaction, ShopModels: ShopModels });
                }
            }
        };

        /**
         * @param {ShopCustomerDebtDoc} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDoc> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDoc>) & {isCancelStatus_Doc?: boolean}} options
         */
        const hookAfterSave_mutationFieldsFromShopServiceOrderDoc_ifThisDocumentSetToCancel = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) {
                /**
                 * @type {import("sequelize").Transaction | null}
                 */
                const transaction = options?.transaction || null;

                const findActiveShopCustomerDebtLists = await ShopCustomerDebtList.findAll({
                    attributes: [
                        'id',
                        'shop_service_order_doc_id',
                        'debt_price_paid_adjust',
                        'debt_price_paid_total'
                    ],
                    where: {
                        shop_customer_debt_doc_id: instance.get('id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findActiveShopCustomerDebtLists.length; index++) {
                    const element = findActiveShopCustomerDebtLists[index];

                    if (!element.get('shop_service_order_doc_id')) { continue; }

                    const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                        attributes: ['id', 'debt_price_amount_left'],
                        where: {
                            id: element.get('shop_service_order_doc_id'),
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopServiceOrderDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย`); }

                    /**
                     * จำนวนหนี้คงเหลือในใบสั่งซ่อม/ใบสั่งขาย
                     */
                    const current__debt_price_amount_left = Number(findShopServiceOrderDoc.get('debt_price_amount_left'))
                        + (Number(element.get('debt_price_paid_total')) + Number(instance.get('debt_price_paid_adjust')));

                    findShopServiceOrderDoc.set({
                        debt_price_amount_left: current__debt_price_amount_left
                    });

                    if (findShopServiceOrderDoc.changed()) {
                        await findShopServiceOrderDoc.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                    }
                }
            }
        };

        return {
            hookBeforeValidate_validateFields,
            hookBeforeValidate_serializerDocRunNumber,
            hookBeforeValidate_serializerCustomerCreditDebtFields,
            hookBeforeSave_setOptionsDocumentIsCancelStatus,
            hookBeforeSave_validatorOnlyOneOfPersonalCustomerOrBusinessCustomer,
            hookBeforeSave_mutationDocRunNumber,
            hookBeforeSave_mutationField__details,
            hookAfterSave_mutationFieldsFromShopServiceOrderDoc_ifThisDocumentSetToCancel,
            hookAfterSave_mutationPaymentTransaction_ifThisDocumentSetToCancel,
        }
    };

    ShopCustomerDebtDoc.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_validateFields(instance, options);
        await instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeValidate_serializerCustomerCreditDebtFields(instance, options);
    });

    ShopCustomerDebtDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_validatorOnlyOneOfPersonalCustomerOrBusinessCustomer(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__details(instance, options);
    });

    ShopCustomerDebtDoc.afterSave(async (instance, options) => {
        await instance.myHookFunctions.hookAfterSave_mutationFieldsFromShopServiceOrderDoc_ifThisDocumentSetToCancel(instance, options);
        await instance.myHookFunctions.hookAfterSave_mutationPaymentTransaction_ifThisDocumentSetToCancel(instance, options);
    });

    return ShopCustomerDebtDoc;
};


module.exports = ShopCustomerDebtDoc;