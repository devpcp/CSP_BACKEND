/**
 * A function do dynamics table of model ShopPartnerDebtDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_partner_debt_doc"
 */
const ShopPartnerDebtDoc = (table_name) => {
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
    const ShopBusinessPartner = __model.ShopBusinessPartners(table_name);

    const default_doc_type_code_id = 'PDD';

    class ShopPartnerDebtDoc extends Model {

        /**
        * สร้างเอกสารเจ้าหนี้การค้า
        * @param {string} shop_id
        * @param {string} userId
        * @param {Object<string, *>} shopPartnerDebtDoc
        * @param {{
        *     transaction?: import("sequelize").Transaction || null;
        *     currentDateTime?: Date;
        *     ShopModels?: Object;
        * }} options
        */
        static async createShopPartnerDebt_Doc(shop_id, userId, shopPartnerDebtDoc = {}, options = {}) {
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
                ShopPartnerDebtDoc
            } = ShopModels;

            const objToCreate = {
                ...shopPartnerDebtDoc,

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

            const createdShopPartnerDebtDoc = await ShopPartnerDebtDoc.create(
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
                currentData: createdShopPartnerDebtDoc
            };
        }

        /**
        * สร้างเอกสารเจ้าหนี้การค้า และรายการ
        * @param {string} shop_id
        * @param {string} userId
        * @param {Object<string, *>} shopPartnerDebtDoc
        * @param {Array<Object<string, *>>} shopPartnerDebtLists
        * @param {{
        *     transaction?: import("sequelize").Transaction || null;
        *     currentDateTime?: Date;
        *     ShopModels?: Object;
        * }} options
        */
        static async createShopPartnerDebt_Doc_Lists(shop_id, userId, shopPartnerDebtDoc = {}, shopPartnerDebtLists = [], options = {}) {
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
                ShopPartnerDebtDoc,
                ShopPartnerDebtList
            } = ShopModels;

            const createdShopPartnerDebtDoc = await ShopPartnerDebtDoc.createShopPartnerDebt_Doc(
                shop_id,
                userId,
                shopPartnerDebtDoc,
                {
                    ...options,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            const createdShopPartnerDebtLists = await ShopPartnerDebtList.createOrEditShopPartnerDebt_Lists(
                shop_id,
                userId,
                createdShopPartnerDebtDoc.currentData.get('id'),
                shopPartnerDebtLists,
                {
                    ...options,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            const [
                reduce_SUM_ShopPartnerDebtLists__price_discount_bill,
                reduce_SUM_ShopPartnerDebtLists__price_discount_before_pay,
                reduce_SUM_ShopPartnerDebtLists__price_sub_total,
                reduce_SUM_ShopPartnerDebtLists__price_discount_total,
                reduce_SUM_ShopPartnerDebtLists__price_amount_total,
                reduce_SUM_ShopPartnerDebtLists__price_before_vat,
                reduce_SUM_ShopPartnerDebtLists__price_vat,
                reduce_SUM_ShopPartnerDebtLists__price_grand_total,
                reduce_SUM_ShopPartnerDebtLists__price_debt_grand_total,
                reduce_SUM_ShopPartnerDebtLists__debt_price_paid_adjust,
                reduce_SUM_ShopPartnerDebtLists__debt_price_paid_total
            ] = await Promise.all([
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_bill') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_before_pay') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_sub_total') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_total') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_amount_total') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_before_vat') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_vat') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_grand_total') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_debt_grand_total') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_paid_adjust') || 0);
                    }
                }, 0),
                createdShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_paid_total') || 0);
                    }
                }, 0),
            ]);

            createdShopPartnerDebtDoc.currentData.set({
                price_discount_bill: reduce_SUM_ShopPartnerDebtLists__price_discount_bill,
                price_discount_before_pay: reduce_SUM_ShopPartnerDebtLists__price_discount_before_pay,
                price_sub_total: reduce_SUM_ShopPartnerDebtLists__price_sub_total,
                price_discount_total: reduce_SUM_ShopPartnerDebtLists__price_discount_total,
                price_amount_total: reduce_SUM_ShopPartnerDebtLists__price_amount_total,
                price_before_vat: reduce_SUM_ShopPartnerDebtLists__price_before_vat,
                price_vat: reduce_SUM_ShopPartnerDebtLists__price_vat,
                price_grand_total: reduce_SUM_ShopPartnerDebtLists__price_grand_total,
                price_debt_grand_total: Object.hasOwn(shopPartnerDebtDoc, 'price_debt_grand_total')
                    ? shopPartnerDebtDoc.price_debt_grand_total !== null
                        ? shopPartnerDebtDoc.price_debt_grand_total
                        : reduce_SUM_ShopPartnerDebtLists__price_debt_grand_total
                    : reduce_SUM_ShopPartnerDebtLists__price_debt_grand_total,
                debt_price_paid_adjust: Object.hasOwn(shopPartnerDebtDoc, 'debt_price_paid_adjust')
                    ? shopPartnerDebtDoc.debt_price_paid_adjust !== null
                        ? shopPartnerDebtDoc.debt_price_paid_adjust
                        : reduce_SUM_ShopPartnerDebtLists__debt_price_paid_adjust
                    : reduce_SUM_ShopPartnerDebtLists__debt_price_paid_adjust,
                debt_price_paid_total: Object.hasOwn(shopPartnerDebtDoc, 'debt_price_paid_total')
                    ? shopPartnerDebtDoc.debt_price_paid_total !== null
                        ? shopPartnerDebtDoc.debt_price_paid_total
                        : reduce_SUM_ShopPartnerDebtLists__debt_price_paid_total
                    : reduce_SUM_ShopPartnerDebtLists__debt_price_paid_total
            });
            await createdShopPartnerDebtDoc.currentData.save({ transaction: transaction, ShopModels: ShopModels });
            await createdShopPartnerDebtDoc.currentData.reload({ transaction: transaction, ShopModels: ShopModels });

            if (isUUID(createdShopPartnerDebtDoc.currentData.get('bus_partner_id'))) {
                await ShopPartnerDebtDoc.updatePartnerDebtAmount(
                    createdShopPartnerDebtDoc.currentData.get('shop_id'),
                    createdShopPartnerDebtDoc.currentData.get('bus_partner_id'),
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }

            return {
                ShopPartnerDebtDoc: createdShopPartnerDebtDoc,
                ShopPartnerDebtLists: createdShopPartnerDebtLists
            };
        }


        static async cancelShopPartnerDebt_Doc(userId, shop_partner_debt_doc_id, options = {}) {
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }
            if (!isUUID(shop_partner_debt_doc_id)) {
                throw new Error(`Require parameter 'shop_partner_debt_doc_id' as UUID`);
            }

            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopPartnerDebtDoc
            } = ShopModels;

            const findShopPartnerDebtDoc = await ShopPartnerDebtDoc.findOne({
                where: {
                    id: shop_partner_debt_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findShopPartnerDebtDoc) {
                throw new Error(`ไม่พบข้อมูลเอกสารเจ้าหนี้การค้า`);
            }
            else if (findShopPartnerDebtDoc.previous('status') !== 1) {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารเจ้าหนี้การค้าได้เนื่องจากเอกสารถูกยกเลิกไปแล้ว`);
            }
            else {
                const objToUpdate = {
                    payment_paid_status: 0,
                    status: 2,
                    updated_by: userId,
                    updated_date: currentDateTime
                };

                const previousData = findShopPartnerDebtDoc.toJSON();

                findShopPartnerDebtDoc.set(objToUpdate);

                await findShopPartnerDebtDoc.save({ transaction: transaction, ShopModels: ShopModels });

                if (isUUID(findShopPartnerDebtDoc.get('bus_partner_id'))) {
                    await ShopPartnerDebtDoc.updatePartnerDebtAmount(
                        findShopPartnerDebtDoc.get('shop_id'),
                        findShopPartnerDebtDoc.get('bus_partner_id'),
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
                    currentData: findShopPartnerDebtDoc
                };
            }
        }


        /**
         * แก้ไขเอกสารเจ้าหนี้การค้า
         * @param {string} shop_id
         * @param {string} userId
         * @param {string} shop_partner_debt_doc_id
         * @param {Object<string, *>} shopPartnerDebtDoc
         * @param {{
        *     transaction?: import("sequelize").Transaction || null;
        *     currentDateTime?: Date;
        *     ShopModels?: Object;
        * }} options
        */
        static async editShopPartnerDebt_Doc(shop_id, userId, shop_partner_debt_doc_id, shopPartnerDebtDoc = {}, options = {}) {
            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }
            if (!isUUID(shop_partner_debt_doc_id)) {
                throw new Error(`Require parameter 'shop_partner_debt_doc_id' as UUID`);
            }

            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopPartnerDebtDoc
            } = ShopModels;

            const objToUpdate = {
                ...shopPartnerDebtDoc,
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

            const findShopPartnerDebtDoc = await ShopPartnerDebtDoc.findOne({
                where: {
                    id: shop_partner_debt_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findShopPartnerDebtDoc) {
                throw new Error(`ไม่พบข้อมูลเอกสารเจ้าหนี้การค้า`);
            }
            else if (findShopPartnerDebtDoc.previous('status') !== 1) {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลเอกสารเจ้าหนี้การค้าได้เนื่องจากเอกสารถูกยกเลิกไปแล้ว`);
            }
            else {
                if (
                    findShopPartnerDebtDoc.previous('status') === 1 && findShopPartnerDebtDoc.get('status') === 0
                    || (findShopPartnerDebtDoc.previous('status') === 1 && findShopPartnerDebtDoc.get('status') === 2)
                ) {
                    const canceledDoc = await ShopPartnerDebtDoc.cancelShopPartnerDebt_Doc(
                        userId,
                        shop_partner_debt_doc_id,
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
                    const previousData = findShopPartnerDebtDoc.toJSON();

                    findShopPartnerDebtDoc.set(objToUpdate);

                    await findShopPartnerDebtDoc.save({ transaction: transaction, ShopModels: ShopModels });

                    return {
                        isCreated: false,
                        isUpdated: true,
                        previousData: previousData,
                        currentData: findShopPartnerDebtDoc
                    };
                }
            }
        }

        /**
        * แก้ไขเอกสารเจ้าหนี้การค้า และรายการ
        * @param {string} shop_id
        * @param {string} userId
        * @param {string} shop_partner_debt_doc_id
        * @param {Object<string, *>} shopPartnerDebtDoc
        * @param {Array<Object<string, *>>} shopPartnerDebtLists
        * @param {{
        *     transaction?: import("sequelize").Transaction || null;
        *     currentDateTime?: Date;
        *     ShopModels?: Object;
        * }} options
        */
        static async editShopPartnerDebt_Doc_Lists(shop_id, userId, shop_partner_debt_doc_id, shopPartnerDebtDoc = {}, shopPartnerDebtLists = [], options = {}) {
            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(userId)) {
                throw new Error(`Require parameter 'userId' as UUID`);
            }
            if (!isUUID(shop_partner_debt_doc_id)) {
                throw new Error(`Require parameter 'shop_partner_debt_doc_id' as UUID`);
            }

            const transaction = options?.transaction || null;
            const currentDateTime = options?.currentDateTime || new Date();

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopPartnerDebtDoc,
                ShopPartnerDebtList
            } = ShopModels;

            const updatedShopPartnerDebtLists = await ShopPartnerDebtList.createOrEditShopPartnerDebt_Lists(
                shop_id,
                userId,
                shop_partner_debt_doc_id,
                shopPartnerDebtLists,
                {
                    ...options,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels,
                    isCancelStatus_Doc: shopPartnerDebtDoc?.status === 0 || shopPartnerDebtDoc?.status === 2
                }
            );

            const updatedShopPartnerDebtDoc = await ShopPartnerDebtDoc.editShopPartnerDebt_Doc(
                shop_id,
                userId,
                shop_partner_debt_doc_id,
                shopPartnerDebtDoc,
                {
                    ...options,
                    currentDateTime: currentDateTime,
                    transaction: transaction,
                    ShopModels: ShopModels
                }
            );

            const [
                reduce_SUM_ShopPartnerDebtLists__price_discount_bill,
                reduce_SUM_ShopPartnerDebtLists__price_discount_before_pay,
                reduce_SUM_ShopPartnerDebtLists__price_sub_total,
                reduce_SUM_ShopPartnerDebtLists__price_discount_total,
                reduce_SUM_ShopPartnerDebtLists__price_amount_total,
                reduce_SUM_ShopPartnerDebtLists__price_before_vat,
                reduce_SUM_ShopPartnerDebtLists__price_vat,
                reduce_SUM_ShopPartnerDebtLists__price_grand_total,
                reduce_SUM_ShopPartnerDebtLists__price_debt_grand_total,
                reduce_SUM_ShopPartnerDebtLists__debt_price_paid_adjust,
                reduce_SUM_ShopPartnerDebtLists__debt_price_paid_total
            ] = await Promise.all([
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_bill') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_before_pay') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_sub_total') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_discount_total') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_amount_total') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_before_vat') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_vat') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_grand_total') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('price_debt_grand_total') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_paid_adjust') || 0);
                    }
                }, 0),
                updatedShopPartnerDebtLists.reduce((prev, curr) => {
                    if (curr.currentData.get('status') === 0) {
                        return prev;
                    }
                    else {
                        return prev + Number(curr.currentData.get('debt_price_paid_total') || 0);
                    }
                }, 0),
            ]);

            updatedShopPartnerDebtDoc.currentData.set({
                price_discount_bill: reduce_SUM_ShopPartnerDebtLists__price_discount_bill,
                price_discount_before_pay: reduce_SUM_ShopPartnerDebtLists__price_discount_before_pay,
                price_sub_total: reduce_SUM_ShopPartnerDebtLists__price_sub_total,
                price_discount_total: reduce_SUM_ShopPartnerDebtLists__price_discount_total,
                price_amount_total: reduce_SUM_ShopPartnerDebtLists__price_amount_total,
                price_before_vat: reduce_SUM_ShopPartnerDebtLists__price_before_vat,
                price_vat: reduce_SUM_ShopPartnerDebtLists__price_vat,
                price_grand_total: reduce_SUM_ShopPartnerDebtLists__price_grand_total,
                price_debt_grand_total: Object.hasOwn(shopPartnerDebtDoc, 'price_debt_grand_total')
                    ? shopPartnerDebtDoc.price_debt_grand_total
                    : reduce_SUM_ShopPartnerDebtLists__price_debt_grand_total,
                debt_price_paid_adjust: Object.hasOwn(shopPartnerDebtDoc, 'debt_price_paid_adjust')
                    ? shopPartnerDebtDoc.debt_price_paid_adjust
                    : reduce_SUM_ShopPartnerDebtLists__debt_price_paid_adjust,
                debt_price_paid_total: Object.hasOwn(shopPartnerDebtDoc, 'debt_price_paid_total')
                    ? shopPartnerDebtDoc.debt_price_paid_total
                    : reduce_SUM_ShopPartnerDebtLists__debt_price_paid_total
            });
            await updatedShopPartnerDebtDoc.currentData.save({ transaction: transaction, ShopModels: ShopModels });
            await updatedShopPartnerDebtDoc.currentData.reload({ transaction: transaction, ShopModels: ShopModels });

            if (isUUID(updatedShopPartnerDebtDoc.currentData.get('bus_partner_id'))) {
                await ShopPartnerDebtDoc.updatePartnerDebtAmount(
                    updatedShopPartnerDebtDoc.currentData.get('shop_id'),
                    updatedShopPartnerDebtDoc.currentData.get('bus_partner_id'),
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
            }


            return {
                ShopPartnerDebtDoc: updatedShopPartnerDebtDoc,
                ShopPartnerDebtLists: updatedShopPartnerDebtLists
            };
        }

        /**
         * @param {string} shop_id
         * @param {string} id - bus_partner_id
         * @param {Object<string,*> & { transaction?: import("sequelize").Transaction; } | {}} options
         * @returns {Promise<Array<ShopBusinessPartner>>}
         */
        static async updatePartnerDebtAmount(shop_id, id, options = {}) {
            const transaction = options?.transaction || null;

            if (!isUUID(shop_id)) {
                throw new Error(`Require parameter 'shop_id' as UUID`);
            }
            if (!isUUID(id)) {
                throw new Error(`Require parameter 'id' as UUID`);
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

            let partner_debt_amount = 0;
            const fnGet__partner_debt_amount = async (table_name) => {
                if (!table_name) {
                    throw new Error(`Require parameter 'table_name' as String`);
                }

                const sqlQuery = `
                SELECT (
                    coalesce((SELECT sum("ShopPaymentTransaction".payment_price_paid) AS partner_debt_total
                    FROM app_shops_datas.dat_01hq0013_payment_transaction AS "ShopPaymentTransaction"
                    WHERE "ShopPaymentTransaction".canceled_payment_date IS NULL
                        AND "ShopPaymentTransaction".canceled_payment_by IS NULL
                        AND "ShopPaymentTransaction".payment_method = 6
                        AND "ShopPaymentTransaction".payment_status = 1
                        AND "ShopPaymentTransaction".shop_inventory_transaction_id IN
                            (SELECT "ShopInventoryTransaction".id 
                             FROM app_shops_datas.dat_01hq0013_inventory_transaction_doc AS "ShopInventoryTransaction" 
                             WHERE "ShopInventoryTransaction".status = 1
                               AND "ShopInventoryTransaction".bus_partner_id = '${id}' )),0)
                    -
                    (
                        coalesce((
                            SELECT (sum("ShopPartnerDebtList".debt_price_paid_total + "ShopPartnerDebtList".debt_price_paid_adjust)) AS partner_debt_paid_total
                            FROM app_shops_datas.dat_01hq0013_partner_debt_list AS "ShopPartnerDebtList"
                            WHERE
                                "ShopPartnerDebtList".shop_partner_debt_doc_id IS NOT NULL
                                AND ((
                                    SELECT "ShopPartnerDebtDoc".id 
                                    FROM app_shops_datas.dat_01hq0013_partner_debt_doc AS "ShopPartnerDebtDoc" 
                                    WHERE "ShopPartnerDebtDoc".status = 1 
                                      AND "ShopPartnerDebtDoc".payment_paid_status IN (3,4) 
                                      AND "ShopPartnerDebtDoc".id = "ShopPartnerDebtList".shop_partner_debt_doc_id
                                      AND "ShopPartnerDebtDoc".bus_partner_id = '${id}'
                                ) = "ShopPartnerDebtList".shop_partner_debt_doc_id)
                        ),0)
                        +
                        coalesce((
                            SELECT sum("ShopPaymentTransaction".payment_price_paid) AS partner_debt_paid_total
                            FROM app_shops_datas.dat_01hq0013_payment_transaction AS "ShopPaymentTransaction"
                            WHERE "ShopPaymentTransaction".canceled_payment_date IS NULL
                                AND "ShopPaymentTransaction".canceled_payment_by IS NULL
                                AND "ShopPaymentTransaction".payment_method != 6
                                AND "ShopPaymentTransaction".payment_status = 1
                                AND "ShopPaymentTransaction".shop_partner_debt_doc_id IN
                                    (
                                        SELECT "ShopPartnerDebtDoc".id 
                                        FROM app_shops_datas.dat_01hq0013_partner_debt_doc AS "ShopPartnerDebtDoc" 
                                        WHERE "ShopPartnerDebtDoc".status = 1 
                                            AND "ShopPartnerDebtDoc".payment_paid_status = 2
                                            AND "ShopPartnerDebtDoc".bus_partner_id = '${id}'
                                    )
                        ),0)
                    )
                ) AS partner_debt_amount
                `
                    .replace(/(01hq0013)+/ig, table_name)
                    .replace(/(\s)+/ig, ' ');

                const partner_debt_amount = Number((await db.query(
                    sqlQuery,
                    {
                        transaction: transaction,
                        type: QueryTypes.SELECT,
                        nest: true
                    }
                ))[0]?.partner_debt_amount || 0);

                return partner_debt_amount;
            };
            if (multibranch__shop_profiles.length === 0) {
                const table_name = shop_profile.shop_code_id.toLowerCase();
                partner_debt_amount = partner_debt_amount + (await fnGet__partner_debt_amount(table_name));
            }
            else {
                for (let index = 0; index < multibranch__shop_profiles.length; index++) {
                    const element__multibranch__shop_profiles = multibranch__shop_profiles[index];
                    const table_name = element__multibranch__shop_profiles.shop_code_id.toLowerCase();
                    partner_debt_amount = partner_debt_amount + (await fnGet__partner_debt_amount(table_name));
                }
            }


            console.log('partner_debt_amount')
            console.log(partner_debt_amount)

            let partner_debt_min_active_doc_date = null;
            let partner_debt_max_active_doc_date = null;
            const fnSet__partner_debt_MinMax_active_doc_date = async (table_name) => {
                if (!table_name) {
                    throw new Error(`Require parameter 'table_name' as String`);
                }

                let sqlQuery = ``;

                if (multibranch__shop_profiles.length === 0) {
                    sqlQuery = `
                        SELECT "ShopPartnerDebtDoc".bus_partner_id,
                               min("ShopPartnerDebtDoc".doc_date) AS debt_min_active_doc_date,
                               max("ShopPartnerDebtDoc".doc_date) AS debt_max_active_doc_date
                        FROM app_shops_datas.dat_01hq0013_partner_debt_doc AS "ShopPartnerDebtDoc"
                        WHERE "ShopPartnerDebtDoc".payment_paid_status IN (1, 2)
                        AND "ShopPartnerDebtDoc".bus_partner_id = '${id}'
                        GROUP BY "ShopPartnerDebtDoc".bus_partner_id
                    `.replace(/(01hq0013)+/ig, table_name);
                }
                else {
                    sqlQuery = multibranch__shop_profiles.reduce((prev, curr, idx) => {
                        if (idx > 0) {
                            prev += `\n UNION ALL `;
                        }

                        prev += `
                            SELECT "ShopPartnerDebtDoc".bus_partner_id,
                                   min("ShopPartnerDebtDoc".doc_date) AS debt_min_active_doc_date,
                                   max("ShopPartnerDebtDoc".doc_date) AS debt_max_active_doc_date
                            FROM app_shops_datas.dat_01hq0013_partner_debt_doc AS "ShopPartnerDebtDoc"
                            WHERE "ShopPartnerDebtDoc".payment_paid_status IN (1, 2)
                            AND "ShopPartnerDebtDoc".bus_partner_id = '${id}'
                            GROUP BY "ShopPartnerDebtDoc".bus_partner_id
                        `.replace(/(01hq0013)+/ig, curr.shop_code_id.toLowerCase());

                        return prev;
                    }, ``);

                    sqlQuery = `
                        WITH CTE_1 AS (${sqlQuery})
                        SELECT CTE_1.bus_partner_id, min(CTE_1.debt_min_active_doc_date) AS debt_min_active_doc_date, max(CTE_1.debt_max_active_doc_date) AS debt_max_active_doc_date
                        FROM CTE_1
                        WHERE CTE_1.bus_partner_id = '${id}'
                        GROUP BY CTE_1.bus_partner_id
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
                    if (!queryResult?.bus_partner_id) { return; }
                    else {
                        partner_debt_min_active_doc_date = queryResult?.debt_min_active_doc_date || null;
                        partner_debt_max_active_doc_date = queryResult?.debt_max_active_doc_date || null;

                        return;
                    }
                }
            };
            await fnSet__partner_debt_MinMax_active_doc_date(table_name);

            let partner_debt_credit_term = null;
            let partner_debt_due_date = null;
            const fnSet__partner_debt_credit_term = async (table_name) => {
                if (!table_name) {
                    throw new Error(`Require parameter 'table_name' as String`);
                }

                let sqlQuery = ``;

                if (multibranch__shop_profiles.length === 0) {
                    sqlQuery = `
                                    SELECT "ShopBusinessPartner".id AS bus_partner_id, ("ShopBusinessPartner".other_details->>'credit_term')::bigint AS credit_term
                                    FROM app_shops_datas.dat_01hq0013_business_partners AS "ShopBusinessPartner"
                                    WHERE id = '${id}'
                                
                    `.replace(/(01hq0013)+/ig, table_name);
                }
                else {
                    sqlQuery = multibranch__shop_profiles.reduce((prev, curr, idx) => {
                        if (idx > 0) {
                            prev += `\n UNION ALL `;
                        }

                        prev += `
                                        SELECT "ShopBusinessPartner".id AS bus_partner_id, ("ShopBusinessPartner".other_details->>'credit_term')::bigint AS credit_term
                                        FROM app_shops_datas.dat_01hq0013_business_partners AS "ShopBusinessPartner"
                                        WHERE id = '${id}'
                                    
                        `.replace(/(01hq0013)+/ig, curr.shop_code_id.toLowerCase());

                        return prev;
                    }, ``);

                    sqlQuery = `
                        WITH CTE_1 AS (${sqlQuery})
                        SELECT CTE_1.bus_partner_id, max(CTE_1.credit_term) AS credit_term
                        FROM CTE_1
                        WHERE CTE_1.bus_partner_id = '${id}' 
                        GROUP BY CTE_1.bus_partner_id;
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
                    if (!queryResult?.bus_partner_id) { return; }
                    else {
                        partner_debt_credit_term = Number.isSafeInteger(Number(queryResult?.credit_term))
                            ? Number(queryResult?.credit_term)
                            : null;

                        if (partner_debt_min_active_doc_date && Number.isSafeInteger(partner_debt_credit_term)) {
                            const mmDebtDueDate = moment(partner_debt_min_active_doc_date);
                            if (partner_debt_credit_term > 0) {
                                mmDebtDueDate.add(partner_debt_credit_term, 'days');
                            }
                            partner_debt_due_date = mmDebtDueDate.toISOString();
                        }

                        return;
                    }
                }
            };
            await fnSet__partner_debt_credit_term(table_name);


            /**
             * @param {string} table_name
             * @returns {Promise<ShopBusinessPartner|void>}
             */
            const fnUpdatePartnerDebtDetailsData = async (table_name) => {
                const ShopModels = utilGetModelsAndShopModels(table_name).ShopModels || require("../model").initShopModel(table_name);
                const {
                    ShopBusinessPartner
                } = ShopModels;
                const findShopBusinessPartner = await ShopBusinessPartner.findOne({
                    attributes: ['id', 'other_details'],
                    where: {
                        id: id
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopBusinessPartner) { return; }
                const other_details = {
                    ...(findShopBusinessPartner.get('other_details') || {}),
                    debt_amount: partner_debt_amount
                };
                findShopBusinessPartner.set('other_details', other_details);
                return await findShopBusinessPartner.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });


            };

            if (multibranch__shop_profiles.length === 0) {
                const table_name = shop_profile.shop_code_id.toLowerCase();
                const updatedData = await fnUpdatePartnerDebtDetailsData(table_name)
                return updatedData ? [updatedData] : [];
            }
            else {
                /**
                 * @type {Array<ShopBusinessPartner>}
                 */
                const arrPromise = [];
                for (let index = 0; index < multibranch__shop_profiles.length; index++) {
                    const element__multibranch__shop_profiles = multibranch__shop_profiles[index];
                    const table_name = element__multibranch__shop_profiles.shop_code_id.toLowerCase();
                    arrPromise.push(await fnUpdatePartnerDebtDetailsData(table_name));
                }
                return arrPromise.filter(w => w);
            }
        }
    }


    ShopPartnerDebtDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารเจ้าหนี้การค้า`,
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
            bus_partner_id: {
                comment: `รหัสคารางข้อมูลตารางข้อมูลคู่ค้าธุรกิจ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopBusinessPartner,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            partner_credit_debt_unpaid_balance: {
                comment: `จำนวนหนี้ค้างชำระ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            partner_credit_debt_current_balance: {
                comment: `วงเงินหนี้คงเหลือ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            partner_credit_debt_approval_balance: {
                comment: `วงเงินหนี้อนุมัติ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            partner_credit_debt_payment_period: {
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
                type: DataTypes.DECIMAL(10, 2),
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
            debt_price_sub_total: {
                comment: `ยอดคงหนี้เหลือทั้งหมด (รวมเป็นเงิน)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_discount_total: {
                comment: `ส่วนหนี้ลดรวมทั้งหมด (ส่วนลดรวม)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_amount_total: {
                comment: `ยอดคงหนี้เหลือทั้งหมดหลังหักส่วนลด (จำนวนเงินหลังหักส่วนลด)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_paid_total: {
                comment: `ยอดที่ได้รับชำระทั้งหมด (จำนวนเงินที่ชำระแล้ว)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_amount_left: {
                comment: `ยอดหนี้คงเหลือหลังจากชำระแล้ว (จำนวนเงินที่ค้างชำระ)`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            payment_paid_status: {
                comment: 'สถานะการชําระเงิน' +
                    '\n0 = ยกเลิกชำระ' +
                    '\n1 = ยังไม่ชำระ' +
                    '\n2 = ค้างชำระ' +
                    '\n3 = ชําระแล้ว' +
                    '\n4 = ชําระเกิน' +
                    '\n6 = เจ้าหนี้การค้า (ห้ามใช้ เพราะเอกสารนี้เป็นเจ้าหนี้การค้าอยู่แล้ว)',
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
            modelName: 'ShopPartnerDebtDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_partner_debt_doc`,
            comment: 'ตารางข้อมูลเอกสารเจ้าหนี้การค้า',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_partner_doc_code_id`,
                    fields: ['code_id']
                },
                {
                    name: `idx_${table_name}_pdd_bus_partner_id`,
                    fields: ['bus_partner_id']
                }
            ]
        }
    );

    ShopPartnerDebtDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopPartnerDebtDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopPartnerDebtDoc.belongsTo(ShopBusinessPartner, { foreignKey: 'bus_partner_id', as: 'ShopBusinessPartner' });
    ShopPartnerDebtDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopPartnerDebtDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopInventoryTransaction,
            ShopPartnerDebtList,
            ShopPaymentTransaction
        } = ShopModels;


        /**
        * ตรวจสอบฟิวส์ ต่าง ๆ ของเอกสารนี้
        * @param {ShopPartnerDebtDoc} instance
        * @param {import("sequelize/types/model").ValidationOptions} options
        */
        const hookBeforeValidate_validateFields = async (instance, options) => {
            if (instance.get('payment_paid_status') === 6) {
                throw new Error(`ไม่กำหนดสามารถสถานะการชําระเงินเป็น 'เจ้าหนี้การค้า' ได้ เนื่องจากเอกสารเป็นเจ้าหนี้การค้าอยู่แล้ว`);
            }
        };


        /**
         * @param {ShopPartnerDebtDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDocRunNumber = async (instance, options) => {
            if (instance.isNewRecord) {
                instance.set({ code_id: `${default_doc_type_code_id}-XXXXXXXXX` });
            }
        };

        /**
         * @param {ShopPartnerDebtDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtDoc>} options
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
         * @param {ShopPartnerDebtDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPartnerDebtDoc> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtDoc>} options
         */
        const hookBeforeSave_setOptionsDocumentIsCancelStatus = async (instance, options) => {
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') === 0) {
                options.isCancelStatus_Doc = true;
            }
            if (!instance.isNewRecord && instance.changed('status') && instance.get('status') === 2) {
                options.isCancelStatus_Doc = true;
            }
        };

        return {
            hookBeforeValidate_validateFields,
            hookBeforeValidate_serializerDocRunNumber,
            hookBeforeSave_mutationDocRunNumber,
            hookBeforeSave_setOptionsDocumentIsCancelStatus
        }
    };

    ShopPartnerDebtDoc.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_validateFields(instance, options);
        await instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
    });

    ShopPartnerDebtDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
    });

    return ShopPartnerDebtDoc;
};


module.exports = ShopPartnerDebtDoc;