/**
 * A function do dynamics table of model ShopCustomerDebtDebitNoteList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_customer_debt_dn_list"
 */
const ShopCustomerDebtDebitNoteList = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const { isUUID } = require("../../utils/generate");
    const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");
    const Model = require("sequelize").Model;
    const { DataTypes, literal, Op } = require("sequelize");

    const db = require("../../db");

    const __model = require("../model");
    const {
        User,
        ShopsProfiles: ShopProfile,
    } = __model;
    const Product = __model.Product;
    const ShopProduct = __model.ShopProduct(table_name);
    const ShopCustomerDebtDebitNoteDoc = __model.ShopCustomerDebtDebitNoteDoc(table_name);
    const ShopTemporaryDeliveryOrderDoc = __model.ShopTemporaryDeliveryOrderDoc(table_name);
    const ShopTemporaryDeliveryOrderList = __model.ShopTemporaryDeliveryOrderList(table_name);

    class ShopCustomerDebtDebitNoteList extends Model {
        static async createOrUpdateShopCustomerDebtDebitNote_Lists (shopId = null, userId = null, shop_customer_debt_dn_doc_id = null, shopCustomerDebtDebitNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!isUUID(shop_customer_debt_dn_doc_id)) { throw new Error(`Require parameter shop_customer_debt_dn_doc_id must be UUID`); }
            if (!Array.isArray(shopCustomerDebtDebitNoteLists)) { throw new Error(`Require parameter shopCustomerDebtDebitNoteLists must be array`); }

            /**
             * @type {Date}
             */
            const currentDateTime = options?.currentDateTime || new Date();

            /**
             * @type {import("sequelize").Transaction}
             */
            const transaction = options?.transaction;

            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopTemporaryDeliveryOrderDoc,
                ShopTemporaryDeliveryOrderList,
                ShopCustomerDebtDebitNoteList,
                ShopProduct
            } = ShopModels;

            /**
             * @type {{
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: Object<string, *> | null;
             *  currentData: ShopCustomerDebtDebitNoteList;
             * }[]};
             */
            const createdAndUpdatedDocuments = [];

            // ถ้าเป็นการยกเลิกเอกสาร แล้วไม่ได้ส่งการแก้ไขรายการนั้น จะต้องทำให้รายการไม่ถูกแก้ไข
            if (options?.isCancelStatus_Doc === true && shopCustomerDebtDebitNoteLists.length === 0) {
                const findShopCustomerDebtDebitNoteLists = await ShopCustomerDebtDebitNoteList.findAll({
                    where: {
                        shop_customer_debt_dn_doc_id: shop_customer_debt_dn_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findShopCustomerDebtDebitNoteLists.length; index++) {
                    const findShopCustomerDebtDebitNoteList = findShopCustomerDebtDebitNoteLists[index];
                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: false,
                        previousData: findShopCustomerDebtDebitNoteList.toJSON(),
                        currentData: findShopCustomerDebtDebitNoteList
                    });
                }
            }

            // Cancel unused ShopCustomerDebtDebitNoteList
            /**
             * @type {string[]}
             */
            const filterUsedIds = shopCustomerDebtDebitNoteLists.reduce((prev, curr) => {
                if (isUUID(curr?.id)) {
                    prev.push(curr.id);
                }
                return prev;
            }, []);
            const whereQuery = { };
            if (filterUsedIds.length > 0) {
                whereQuery['id'] = {
                    [Op.notIn]: filterUsedIds
                };
                whereQuery['shop_customer_debt_dn_doc_id'] = shop_customer_debt_dn_doc_id;
            }
            else {
                whereQuery['shop_customer_debt_dn_doc_id'] = shop_customer_debt_dn_doc_id;
            }
            if (Object.keys(whereQuery).length > 0) {
                whereQuery['status'] = 1;

                const findUnusedShopCustomerDebtDebitNoteLists = await ShopCustomerDebtDebitNoteList.findAll({
                    where: whereQuery,
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findUnusedShopCustomerDebtDebitNoteLists.length; index++) {
                    const element = findUnusedShopCustomerDebtDebitNoteLists[index];

                    const element__previousData = element.toJSON();

                    element.set({
                        status: 0,
                        updated_by: userId,
                        updated_date: currentDateTime
                    });

                    await element.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: true,
                        previousData: element__previousData,
                        currentData: element
                    });
                }
            }

            // Edit or Create ShopCustomerDebtDebitNoteList
            for (let index = 0; index < shopCustomerDebtDebitNoteLists.length; index++) {
                const shopCustomerDebtDebitNoteList = shopCustomerDebtDebitNoteLists[index];

                if (!isUUID(shopCustomerDebtDebitNoteList?.id)) { // สร้างรายการ
                    if (isUUID(shopCustomerDebtDebitNoteList?.shop_temporary_delivery_order_doc_id)) {
                        const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                            where: {
                                id: shopCustomerDebtDebitNoteList.shop_temporary_delivery_order_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopTemporaryDeliveryOrderDoc) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักเอกสารใบส่งสินค้าชั่วคราว ในการสร้างข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtDebitNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                    }

                    if (isUUID(shopCustomerDebtDebitNoteList?.shop_temporary_delivery_order_list_id)) {
                        const findShopTemporaryDeliveryOrderList = await ShopTemporaryDeliveryOrderList.findOne({
                            where: {
                                id: shopCustomerDebtDebitNoteList.shop_temporary_delivery_order_list_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopTemporaryDeliveryOrderList) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักเอกสารใบส่งสินค้าชั่วคราว ในการสร้างข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtDebitNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                    }

                    if (isUUID(shopCustomerDebtDebitNoteList?.product_id)) {
                        const findProduct = await Product.findOne({
                            where: {
                                id: shopCustomerDebtDebitNoteList.product_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findProduct) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักสินค้า ในการสร้างข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtDebitNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                    }

                    if (isUUID(shopCustomerDebtDebitNoteList?.shop_product_id)) {
                        const findShopProduct = await ShopProduct.findOne({
                            where: {
                                id: shopCustomerDebtDebitNoteList.shop_product_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopProduct) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักสินค้าของร้าน ในการสร้างข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtDebitNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                    }

                    const objToCreate = {
                        ...shopCustomerDebtDebitNoteList,
                        shop_customer_debt_dn_doc_id: shop_customer_debt_dn_doc_id,
                        shop_id: shopId,
                        details: shopCustomerDebtDebitNoteList?.details || {},
                        status: 1,
                        created_by: userId,
                        created_date: currentDateTime,
                        updated_by: null,
                        updated_date: null
                    };

                    if (objToCreate.hasOwnProperty('id')) {
                        delete objToCreate.id;
                    }

                    const createdShopCustomerDebtList = await ShopCustomerDebtDebitNoteList.create(
                        objToCreate,
                        {
                            validate: true,
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );

                    createdAndUpdatedDocuments.push({
                        isCreated: true,
                        isUpdated: false,
                        previousData: null,
                        currentData: createdShopCustomerDebtList
                    });
                }
                else { // แก้ไขรายการ
                    if (!isUUID(shopCustomerDebtDebitNoteList?.id)) {
                        throw new Error(`ต้องการรหัสหลักข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtDebitNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    /**
                     * รายการที่ต้องการแก้ไข
                     */
                    const findShopCustomerDebtDebitNoteLists = await ShopCustomerDebtDebitNoteList.findOne({
                        where: {
                            id: shopCustomerDebtDebitNoteList?.id,
                            shop_customer_debt_dn_doc_id: shop_customer_debt_dn_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopCustomerDebtDebitNoteLists) {
                        throw new Error(`ไม่พบข้อมูลรหัสหลักรายการใบเพิ่มหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtDebitNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopCustomerDebtDebitNoteLists.previous('status') !== 1) {
                        throw new Error(`ไม่สามารถแก้ไขข้อมูลรหัสหลักรายการใบเพิ่มหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า เนื่องจากรายการนี้อยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtDebitNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else {
                        const objEditData = {};
                        const fnSetObjEditData = (key) => {
                            if (!key) { return; }
                            if (shopCustomerDebtDebitNoteList.hasOwnProperty(key)) {
                                objEditData[key] = shopCustomerDebtDebitNoteList[key];
                            }
                        };

                        fnSetObjEditData('seq_number');
                        fnSetObjEditData('shop_temporary_delivery_order_doc_id');
                        fnSetObjEditData('shop_temporary_delivery_order_list_id');
                        fnSetObjEditData('product_id');
                        fnSetObjEditData('shop_product_id');
                        fnSetObjEditData('list_id');
                        fnSetObjEditData('list_name');
                        fnSetObjEditData('price_unit');
                        fnSetObjEditData('amount');
                        fnSetObjEditData('price_grand_total');
                        fnSetObjEditData('details');
                        fnSetObjEditData('status');

                        if (Object.keys(objEditData).length === 0) {
                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: false,
                                previousData: findShopCustomerDebtDebitNoteLists.toJSON(),
                                currentData: findShopCustomerDebtDebitNoteLists
                            });
                        }
                        else {
                            objEditData.updated_by = userId;
                            objEditData.updated_date = currentDateTime;

                            const findShopCustomerDebtDebitNoteList__previousData = findShopCustomerDebtDebitNoteLists.toJSON();

                            findShopCustomerDebtDebitNoteLists.set(objEditData);
                            await findShopCustomerDebtDebitNoteLists.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: true,
                                previousData: findShopCustomerDebtDebitNoteList__previousData,
                                currentData: findShopCustomerDebtDebitNoteLists
                            });
                        }
                    }
                }
            }

            return createdAndUpdatedDocuments;
        }
    }

    ShopCustomerDebtDebitNoteList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า`,
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
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
            seq_number: {
                comment: `ลำดับรายการ`,
                type: DataTypes.INTEGER,
                allowNull: false
            },
            shop_customer_debt_dn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopCustomerDebtDebitNoteDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            shop_temporary_delivery_order_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopTemporaryDeliveryOrderDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_temporary_delivery_order_list_id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบส่งสินค้าชั่วคราว`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopTemporaryDeliveryOrderList,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            product_id: {
                comment: `รหัสหลักตารางข้อมูลสินค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: Product,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_product_id: {
                comment: `รหัสหลักตารางข้อมูลสินค้าในร้าน`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopProduct,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            list_id: {
                comment: `เลขรหัสรายการ`,
                type: DataTypes.STRING,
                allowNull: false
            },
            list_name: {
                comment: `ชื่อรายการ`,
                type: DataTypes.STRING,
                allowNull: false
            },
            price_unit: {
                comment: `ราคาขาย/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            amount: {
                comment: `จำนวนสินค้า`,
                type: DataTypes.BIGINT,
                allowNull: false,
                defaultValue: 0
            },
            price_grand_total: {
                comment: `จำนวนเงินรวมทั้งสิ้น`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false
            },
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    meta_data: { }
                }
            },
            status: {
                comment: `สถานะรายการ 0 = ลบรายการ, 1 = ใช้งานรายการ`,
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1]]
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
            modelName: 'ShopCustomerDebtDebitNoteList',
            tableName: `dat_${table_name}_customer_debt_dn_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการใบเพิ่มหนี้ของลูกหนี้การค้า',
            indexes: [
                {
                    name: `idx_${table_name}_cdn_list_debt_dn_doc_id`,
                    fields: ['shop_customer_debt_dn_doc_id']
                },
                {
                    name: `idx_${table_name}_cdn_list_tmp_doc_id`,
                    fields: ['shop_temporary_delivery_order_doc_id']
                },
                {
                    name: `idx_${table_name}_cdn_list_tmp_list_id`,
                    fields: ['shop_temporary_delivery_order_list_id']
                },
                {
                    name: `idx_${table_name}_cdn_list_product_id`,
                    fields: ['product_id']
                },
                {
                    name: `idx_${table_name}_cdn_list_shop_product_id`,
                    fields: ['shop_product_id']
                },
                {
                    name: `idx_${table_name}_cdn_list_list_id`,
                    fields: ['list_id']
                },
                {
                    name: `idx_${table_name}_cdn_list_list_name`,
                    fields: ['list_name']
                }
            ]
        }
    );

    ShopCustomerDebtDebitNoteList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopCustomerDebtDebitNoteList.belongsTo(ShopCustomerDebtDebitNoteDoc, { foreignKey: 'shop_customer_debt_dn_doc_id', as: 'ShopCustomerDebtDebitNoteDoc' });
    ShopCustomerDebtDebitNoteList.belongsTo(ShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_temporary_delivery_order_doc_id', as: 'ShopTemporaryDeliveryOrderDoc' });
    ShopCustomerDebtDebitNoteList.belongsTo(ShopTemporaryDeliveryOrderList, { foreignKey: 'shop_temporary_delivery_order_list_id', as: 'ShopTemporaryDeliveryOrderList' });
    ShopCustomerDebtDebitNoteList.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });
    ShopCustomerDebtDebitNoteList.belongsTo(ShopProduct, { foreignKey: 'shop_product_id', as: 'ShopProduct' });
    ShopCustomerDebtDebitNoteList.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopCustomerDebtDebitNoteList.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopTemporaryDeliveryOrderDoc,
            ShopTemporaryDeliveryOrderList,
            ShopProduct
        } = ShopModels;

        /**
         * @param {ShopCustomerDebtDebitNoteList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtDebitNoteList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtDebitNoteList>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_mutationField__details = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

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
                (instance.isNewRecord || (!instance.isNewRecord && instance.previous('status') === 1))
                &&
                (
                    instance.changed('shop_temporary_delivery_order_doc_id')
                    || instance.changed('shop_temporary_delivery_order_list_id')
                    || instance.changed('product_id')
                    || instance.changed('shop_product_id')
                )
            ) {
                await Promise.all([
                    (async () => {
                        if (isUUID(instance.get('shop_temporary_delivery_order_doc_id'))) {
                            const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                                where: {
                                    id: instance.get('shop_temporary_delivery_order_doc_id')
                                },
                                transaction: transaction
                            });
                            if (findShopTemporaryDeliveryOrderDoc) {
                                details.meta_data.ShopTemporaryDeliveryOrderDoc = findShopTemporaryDeliveryOrderDoc?.toJSON();
                            }
                            else {
                                details.meta_data.ShopTemporaryDeliveryOrderDoc = null;
                            }
                        }
                        else {
                            details.meta_data.ShopTemporaryDeliveryOrderDoc = null;
                        }
                    })(),
                    (async () => {
                        if (isUUID(instance.get('shop_temporary_delivery_order_list_id'))) {
                            const findShopTemporaryDeliveryOrderList = await ShopTemporaryDeliveryOrderList.findOne({
                                where: {
                                    id: instance.get('shop_temporary_delivery_order_list_id')
                                },
                                transaction: transaction
                            });
                            if (findShopTemporaryDeliveryOrderList) {
                                details.meta_data.ShopTemporaryDeliveryOrderList = findShopTemporaryDeliveryOrderList?.toJSON();
                            }
                            else {
                                details.meta_data.ShopTemporaryDeliveryOrderList = null;
                            }
                        }
                        else {
                            details.meta_data.ShopTemporaryDeliveryOrderList = null;
                        }
                    })(),
                    (async () => {
                        if (isUUID(instance.get('product_id'))) {
                            const findProduct = await Product.findOne({
                                where: {
                                    id: instance.get('product_id')
                                },
                                transaction: transaction
                            });
                            if (findProduct) {
                                details.meta_data.Product = findProduct?.toJSON();
                            }
                            else {
                                details.meta_data.Product = null;
                            }
                        }
                        else {
                            details.meta_data.Product = null;
                        }
                    })(),
                    (async () => {
                        if (isUUID(instance.get('shop_product_id'))) {
                            const findProduct = await ShopProduct.findOne({
                                where: {
                                    id: instance.get('shop_product_id')
                                },
                                transaction: transaction
                            });
                            if (findProduct) {
                                details.meta_data.ShopProduct = findProduct?.toJSON();
                            }
                            else {
                                details.meta_data.ShopProduct = null;
                            }
                        }
                        else {
                            details.meta_data.ShopProduct = null;
                        }
                    })(),
                ]);
            }

            instance.set('details', details);
        };


        return {
            hookBeforeSave_mutationField__details
        };
    };

    ShopCustomerDebtDebitNoteList.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });
    });

    ShopCustomerDebtDebitNoteList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_mutationField__details(instance, options);
    });

    return ShopCustomerDebtDebitNoteList;
};


module.exports = ShopCustomerDebtDebitNoteList;