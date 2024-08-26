/**
 * A function do dynamics table of model ShopPartnerDebtCreditNoteList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_partner_debt_cn_list"
 */
const ShopPartnerDebtCreditNoteList = (table_name) => {
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
    const ShopPartnerDebtCreditNoteDoc = __model.ShopPartnerDebtCreditNoteDoc(table_name);
    const ShopInventoryImportDoc = __model.ShopInventoryTransaction(table_name);
    const ShopInventoryImportList = __model.ShopInventory(table_name);


    class ShopPartnerDebtCreditNoteList extends Model {
        static async createOrUpdateShopPartnerDebtCreditNote_Lists(shopId = null, userId = null, shop_partner_debt_cn_doc_id = null, shopPartnerDebtCreditNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!isUUID(shop_partner_debt_cn_doc_id)) { throw new Error(`Require parameter shop_partner_debt_cn_doc_id must be UUID`); }
            if (!Array.isArray(shopPartnerDebtCreditNoteLists)) { throw new Error(`Require parameter shopPartnerDebtCreditNoteLists must be array`); }

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
                ShopInventoryImportDoc,
                ShopInventoryImportList,
                ShopPartnerDebtCreditNoteList,
                ShopProduct
            } = ShopModels;

            /**
             * @type {{
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: Object<string, *> | null;
             *  currentData: ShopPartnerDebtCreditNoteList;
             * }[]};
             */
            const createdAndUpdatedDocuments = [];

            // ถ้าเป็นการยกเลิกเอกสาร แล้วไม่ได้ส่งการแก้ไขรายการนั้น จะต้องทำให้รายการไม่ถูกแก้ไข
            if (options?.isCancelStatus_Doc === true && shopPartnerDebtCreditNoteLists.length === 0) {
                const findShopPartnerDebtCreditNoteLists = await ShopPartnerDebtCreditNoteList.findAll({
                    where: {
                        shop_partner_debt_cn_doc_id: shop_partner_debt_cn_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findShopPartnerDebtCreditNoteLists.length; index++) {
                    const findShopPartnerDebtList = findShopPartnerDebtCreditNoteLists[index];
                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: false,
                        previousData: findShopPartnerDebtList.toJSON(),
                        currentData: findShopPartnerDebtList
                    });
                }
            }

            // Cancel unused ShopPartnerDebtCreditNoteList
            /**
             * @type {string[]}
             */
            const filterUsedIds = shopPartnerDebtCreditNoteLists.reduce((prev, curr) => {
                if (isUUID(curr?.id)) {
                    prev.push(curr.id);
                }
                return prev;
            }, []);
            const whereQuery = {};
            if (filterUsedIds.length > 0) {
                whereQuery['id'] = {
                    [Op.notIn]: filterUsedIds
                };
                whereQuery['shop_partner_debt_cn_doc_id'] = shop_partner_debt_cn_doc_id;
            }
            else {
                whereQuery['shop_partner_debt_cn_doc_id'] = shop_partner_debt_cn_doc_id;
            }
            if (Object.keys(whereQuery).length > 0) {
                whereQuery['status'] = 1;

                const findUnusedShopPartnerDebtCreditNoteLists = await ShopPartnerDebtCreditNoteList.findAll({
                    where: whereQuery,
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findUnusedShopPartnerDebtCreditNoteLists.length; index++) {
                    const element = findUnusedShopPartnerDebtCreditNoteLists[index];

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

            // Edit or Create ShopPartnerDebtCreditNoteList
            for (let index = 0; index < shopPartnerDebtCreditNoteLists.length; index++) {
                const shopPartnerDebtCreditNoteList = shopPartnerDebtCreditNoteLists[index];

                if (!isUUID(shopPartnerDebtCreditNoteList?.id)) { // สร้างรายการ
                    if (isUUID(shopPartnerDebtCreditNoteList?.shop_inventory_import_doc_id)) {
                        const findShopInventoryImportDoc = await ShopInventoryImportDoc.findOne({
                            attributes: ['id'],
                            where: {
                                id: shopPartnerDebtCreditNoteList.shop_inventory_import_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopInventoryImportDoc) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักเอกสารใบรับเข้าสินค้า ในการสร้างข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                    }

                    if (isUUID(shopPartnerDebtCreditNoteList?.shop_inventory_import_list_id)) {
                        const findShopInventoryImportList = await ShopInventoryImportList.findOne({
                            attributes: ['id', 'doc_inventory_id'],
                            where: {
                                id: shopPartnerDebtCreditNoteList.shop_inventory_import_list_id,
                                ...(
                                    !isUUID(shopPartnerDebtCreditNoteList?.shop_inventory_import_doc_id)
                                        ? {}
                                        : { doc_inventory_id: shopPartnerDebtCreditNoteList.shop_inventory_import_doc_id }
                                )
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopInventoryImportList) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักรายการใบรับเข้าสินค้า ในการสร้างข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        if (findShopInventoryImportList.get('doc_inventory_id') && !isUUID(shopPartnerDebtCreditNoteList?.shop_inventory_import_doc_id)) {
                            shopPartnerDebtCreditNoteList.shop_inventory_import_doc_id = findShopInventoryImportList.get('doc_inventory_id');
                        }
                    }

                    if (isUUID(shopPartnerDebtCreditNoteList?.product_id)) {
                        const findProduct = await Product.findOne({
                            attributes: ['id'],
                            where: {
                                id: shopPartnerDebtCreditNoteList.product_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findProduct) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักสินค้า ในการสร้างข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                    }

                    if (isUUID(shopPartnerDebtCreditNoteList?.shop_product_id)) {
                        const findShopProduct = await ShopProduct.findOne({
                            attributes: ['id', 'product_id'],
                            where: {
                                id: shopPartnerDebtCreditNoteList.shop_product_id,
                                ...(
                                    !isUUID(shopPartnerDebtCreditNoteList?.product_id)
                                        ? {}
                                        : { product_id: shopPartnerDebtCreditNoteList.product_id }
                                )
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopProduct) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักสินค้าของร้าน ในการสร้างข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        if (findShopProduct.get('product_id') && !isUUID(shopPartnerDebtCreditNoteList?.product_id)) {
                            shopPartnerDebtCreditNoteList.product_id = findShopProduct.get('product_id');
                        }
                    }

                    const objToCreate = {
                        ...shopPartnerDebtCreditNoteList,
                        shop_partner_debt_cn_doc_id: shop_partner_debt_cn_doc_id,
                        shop_id: shopId,
                        details: shopPartnerDebtCreditNoteList?.details || {},
                        status: 1,
                        created_by: userId,
                        created_date: currentDateTime,
                        updated_by: null,
                        updated_date: null
                    };

                    if (objToCreate.hasOwnProperty('id')) {
                        delete objToCreate.id;
                    }

                    const createdShopPartnerDebtCreditNoteList = await ShopPartnerDebtCreditNoteList.create(
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
                        currentData: createdShopPartnerDebtCreditNoteList
                    });
                }
                else { // แก้ไขรายการ
                    if (!isUUID(shopPartnerDebtCreditNoteList?.id)) {
                        throw new Error(`ต้องการรหัสหลักข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    /**
                     * รายการที่ต้องการแก้ไข
                     */
                    const findShopPartnerDebtCreditNoteList = await ShopPartnerDebtCreditNoteList.findOne({
                        where: {
                            id: shopPartnerDebtCreditNoteList?.id,
                            shop_partner_debt_cn_doc_id: shop_partner_debt_cn_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopPartnerDebtCreditNoteList) {
                        throw new Error(`ไม่พบข้อมูลรหัสหลักรายการใบลดหนี้ของเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า: รายการที่ ${shopPartnerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopPartnerDebtCreditNoteList.previous('status') !== 1) {
                        throw new Error(`ไม่สามารถแก้ไขข้อมูลรหัสหลักรายการใบลดหนี้ของเจ้าหนี้การค้า ในการแก้ไขข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า เนื่องจากรายการนี้อยกเลิกไปแล้ว: รายการที่ ${shopPartnerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else {
                        const objEditData = {};
                        const fnSetObjEditData = (key) => {
                            if (!key) { return; }
                            if (shopPartnerDebtCreditNoteList.hasOwnProperty(key)) {
                                objEditData[key] = shopPartnerDebtCreditNoteList[key];
                            }
                        };

                        fnSetObjEditData('seq_number');
                        fnSetObjEditData('shop_inventory_import_doc_id');
                        fnSetObjEditData('shop_inventory_import_list_id');
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
                                previousData: findShopPartnerDebtCreditNoteList.toJSON(),
                                currentData: findShopPartnerDebtCreditNoteList
                            });
                        }
                        else {
                            objEditData.updated_by = userId;
                            objEditData.updated_date = currentDateTime;

                            const findShopPartnerDebtCreditNoteList__previousData = findShopPartnerDebtCreditNoteList.toJSON();

                            findShopPartnerDebtCreditNoteList.set(objEditData);
                            await findShopPartnerDebtCreditNoteList.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: true,
                                previousData: findShopPartnerDebtCreditNoteList__previousData,
                                currentData: findShopPartnerDebtCreditNoteList
                            });
                        }
                    }
                }
            }

            return createdAndUpdatedDocuments;
        }
    }

    ShopPartnerDebtCreditNoteList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า`,
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
            shop_partner_debt_cn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของเจ้าหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopPartnerDebtCreditNoteDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            shop_inventory_import_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบรับเข้าสินค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopInventoryImportDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_inventory_import_list_id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบรับเข้าสินค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopInventoryImportList,
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
                    meta_data: {}
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
            modelName: 'ShopPartnerDebtCreditNoteList',
            tableName: `dat_${table_name}_partner_debt_cn_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการใบลดหนี้ของเจ้าหนี้การค้า',
            indexes: [
                {
                    name: `idx_${table_name}_pcn_list_debt_cn_doc_id`,
                    fields: ['shop_partner_debt_cn_doc_id']
                },
                {
                    name: `idx_${table_name}_pcn_list_ini_doc_id`,
                    fields: ['shop_inventory_import_doc_id']
                },
                {
                    name: `idx_${table_name}_pcn_list_ini_list_id`,
                    fields: ['shop_inventory_import_list_id']
                },
                {
                    name: `idx_${table_name}_pcn_list_product_id`,
                    fields: ['product_id']
                },
                {
                    name: `idx_${table_name}_pcn_list_shop_product_id`,
                    fields: ['shop_product_id']
                },
                {
                    name: `idx_${table_name}_pcn_list_list_id`,
                    fields: ['list_id']
                },
                {
                    name: `idx_${table_name}_pcn_list_list_name`,
                    fields: ['list_name']
                }
            ]
        }
    );

    ShopPartnerDebtCreditNoteList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopPartnerDebtCreditNoteList.belongsTo(ShopPartnerDebtCreditNoteDoc, { foreignKey: 'shop_partner_debt_cn_doc_id', as: 'ShopPartnerDebtCreditNoteDoc' });
    ShopPartnerDebtCreditNoteList.belongsTo(ShopInventoryImportDoc, { foreignKey: 'shop_inventory_import_doc_id', as: 'ShopInventoryImportDoc' });
    ShopPartnerDebtCreditNoteList.belongsTo(ShopInventoryImportList, { foreignKey: 'shop_inventory_import_list_id', as: 'ShopInventoryImportList' });
    ShopPartnerDebtCreditNoteList.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });
    ShopPartnerDebtCreditNoteList.belongsTo(ShopProduct, { foreignKey: 'shop_product_id', as: 'ShopProduct' });
    ShopPartnerDebtCreditNoteList.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopPartnerDebtCreditNoteList.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopInventoryImportDoc,
            ShopInventoryImportList,
            ShopProduct
        } = ShopModels;

        /**
         * Mutation ข้อมูลฟิวส์ "details.meta_data"
         * @param {ShopPartnerDebtCreditNoteList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopPartnerDebtCreditNoteList> | import("sequelize/types/model").SaveOptions<ShopPartnerDebtCreditNoteList>) & { isCancelStatus_Doc?: boolean }} options
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
                (instance.isNewRecord)
                ||
                (
                    (!instance.isNewRecord && instance.previous('status') === 1)
                    &&
                    (
                        instance.changed('shop_inventory_import_doc_id')
                        || instance.changed('shop_inventory_import_list_id')
                        || instance.changed('product_id')
                        || instance.changed('shop_product_id')
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
                        'shop_inventory_import_doc_id',
                        'ShopInventoryImportDoc',
                        ShopInventoryImportDoc,
                        {
                            id: instance.get('shop_inventory_import_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_inventory_import_list_id',
                        'ShopInventoryImportList',
                        ShopInventoryImportList,
                        {
                            id: instance.get('shop_inventory_import_list_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'product_id',
                        'Product',
                        Product,
                        {
                            id: instance.get('product_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_product_id',
                        'ShopProduct',
                        ShopProduct,
                        {
                            id: instance.get('shop_product_id')
                        },
                        transaction
                    )
                ]);
            }

            instance.set('details', details);
        };


        return {
            hookBeforeSave_mutationField__details
        };
    };

    ShopPartnerDebtCreditNoteList.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });
    });

    ShopPartnerDebtCreditNoteList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_mutationField__details(instance, options);
    });

    return ShopPartnerDebtCreditNoteList;
};


module.exports = ShopPartnerDebtCreditNoteList;