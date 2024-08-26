/**
 * A function do dynamics table of model ShopCustomerDebtCreditNoteศรหะ
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_customer_debt_cn_สรหะ"
 */
const ShopCustomerDebtCreditNoteList = (table_name) => {
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
    const ShopCustomerDebtCreditNoteDoc = __model.ShopCustomerDebtCreditNoteDoc(table_name);
    const ShopTemporaryDeliveryOrderDoc = __model.ShopTemporaryDeliveryOrderDoc(table_name);
    const ShopTemporaryDeliveryOrderList = __model.ShopTemporaryDeliveryOrderList(table_name);

    class ShopCustomerDebtCreditNoteList extends Model {
        static async createOrUpdateShopCustomerDebtCreditNote_Lists (shopId = null, userId = null, shop_customer_debt_cn_doc_id = null, shopCustomerDebtCreditNoteLists = null, options = {}) {
            if (!isUUID(shopId)) { throw new Error(`Require parameter shopId must be UUID`); }
            if (!isUUID(userId)) { throw new Error(`Require parameter userId must be UUID`); }
            if (!isUUID(shop_customer_debt_cn_doc_id)) { throw new Error(`Require parameter shop_customer_debt_cn_doc_id must be UUID`); }
            if (!Array.isArray(shopCustomerDebtCreditNoteLists)) { throw new Error(`Require parameter shopCustomerDebtCreditNoteLists must be array`); }

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
                ShopCustomerDebtCreditNoteList,
                ShopProduct
            } = ShopModels;

            /**
             * @type {{
             *  isCreated: boolean;
             *  isUpdated: boolean;
             *  previousData: Object<string, *> | null;
             *  currentData: ShopCustomerDebtCreditNoteList;
             * }[]};
             */
            const createdAndUpdatedDocuments = [];

            // ถ้าเป็นการยกเลิกเอกสาร แล้วไม่ได้ส่งการแก้ไขรายการนั้น จะต้องทำให้รายการไม่ถูกแก้ไข
            if (options?.isCancelStatus_Doc === true) {
                const findShopCustomerDebtCreditNoteList = await ShopCustomerDebtCreditNoteList.findAll({
                    where: {
                        shop_customer_debt_cn_doc_id: shop_customer_debt_cn_doc_id,
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findShopCustomerDebtCreditNoteList.length; index++) {
                    const findShopCustomerDebtList = findShopCustomerDebtCreditNoteList[index];
                    createdAndUpdatedDocuments.push({
                        isCreated: false,
                        isUpdated: false,
                        previousData: findShopCustomerDebtList.toJSON(),
                        currentData: findShopCustomerDebtList
                    });
                }
            }

            // Cancel unused ShopCustomerDebtCreditNoteList
            /**
             * @type {string[]}
             */
            const filterUsedIds = shopCustomerDebtCreditNoteLists.reduce((prev, curr) => {
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
                whereQuery['shop_customer_debt_cn_doc_id'] = shop_customer_debt_cn_doc_id;
            }
            else {
                whereQuery['shop_customer_debt_cn_doc_id'] = shop_customer_debt_cn_doc_id;
            }
            if (Object.keys(whereQuery).length > 0) {
                whereQuery['status'] = 1;

                const findUnusedShopCustomerDebtCreditNoteList = await ShopCustomerDebtCreditNoteList.findAll({
                    where: whereQuery,
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                for (let index = 0; index < findUnusedShopCustomerDebtCreditNoteList.length; index++) {
                    const element = findUnusedShopCustomerDebtCreditNoteList[index];

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

            // Edit or Create ShopCustomerDebtCreditNoteList
            for (let index = 0; index < shopCustomerDebtCreditNoteLists.length; index++) {
                const shopCustomerDebtCreditNoteList = shopCustomerDebtCreditNoteLists[index];

                if (!isUUID(shopCustomerDebtCreditNoteList.id)) { // สร้างรายการ
                    if (isUUID(shopCustomerDebtCreditNoteList?.shop_temporary_delivery_order_doc_id)) {
                        const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                            attributes: ['id'],
                            where: {
                                id: shopCustomerDebtCreditNoteList.shop_temporary_delivery_order_doc_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopTemporaryDeliveryOrderDoc) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักเอกสารใบส่งสินค้าชั่วคราว ในการสร้างข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                    }
                    if (isUUID(shopCustomerDebtCreditNoteList?.shop_temporary_delivery_order_list_id)) {
                        const findShopTemporaryDeliveryOrderList = await ShopTemporaryDeliveryOrderList.findOne({
                            attributes: ['id', 'shop_temporary_delivery_order_doc_id'],
                            where: {
                                id: shopCustomerDebtCreditNoteList.shop_temporary_delivery_order_list_id,
                                ...(
                                    !isUUID(shopCustomerDebtCreditNoteList?.shop_temporary_delivery_order_doc_id)
                                        ? {}
                                        : { shop_temporary_delivery_order_doc_id: shopCustomerDebtCreditNoteList?.shop_temporary_delivery_order_doc_id }
                                )
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopTemporaryDeliveryOrderList) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักเอกสารใบส่งสินค้าชั่วคราว ในการสร้างข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else {
                            if (!isUUID(shopCustomerDebtCreditNoteList?.shop_temporary_delivery_order_doc_id)) {
                                shopCustomerDebtCreditNoteList.shop_temporary_delivery_order_doc_id = findShopTemporaryDeliveryOrderList.get('shop_temporary_delivery_order_doc_id');
                            }
                        }
                    }

                    if (isUUID(shopCustomerDebtCreditNoteList?.product_id)) {
                        const findProduct = await Product.findOne({
                            attributes: ['id'],
                            where: {
                                id: shopCustomerDebtCreditNoteList.product_id
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findProduct) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักสินค้า ในการสร้างข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        if (!isUUID(shopCustomerDebtCreditNoteList?.shop_product_id)) {
                            const findShopProduct = await ShopProduct.findOne({
                                attributes: ['id', 'product_id'],
                                where: {
                                    product_id: findProduct.get('id')
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (findShopProduct) {
                                if (isUUID(findProduct.get('id'))) {
                                    shopCustomerDebtCreditNoteList.shop_product_id = findShopProduct.get('id');
                                }
                            }
                        }
                    }
                    if (isUUID(shopCustomerDebtCreditNoteList?.shop_product_id)) {
                        const findShopProduct = await ShopProduct.findOne({
                            attributes: ['id', 'product_id'],
                            where: {
                                id: shopCustomerDebtCreditNoteList.shop_product_id,
                                ...(
                                    !isUUID(shopCustomerDebtCreditNoteList?.product_id)
                                        ? {}
                                        : { product_id: shopCustomerDebtCreditNoteList?.product_id }
                                )
                            },
                            transaction: transaction,
                            ShopModels: ShopModels
                        });
                        if (!findShopProduct) {
                            throw new Error(`ไม่พบข้อมูลรหัสหลักสินค้าของร้าน ในการสร้างข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                        }
                        else {
                            if (isUUID(findShopProduct.get('product_id')) && !isUUID(shopCustomerDebtCreditNoteList?.product_id)) {
                                shopCustomerDebtCreditNoteList.product_id = findShopProduct.get('product_id');
                            }
                        }
                    }

                    const objToCreate = {
                        ...shopCustomerDebtCreditNoteList,
                        shop_customer_debt_cn_doc_id: shop_customer_debt_cn_doc_id,
                        shop_id: shopId,
                        details: shopCustomerDebtCreditNoteList?.details || {},
                        status: 1,
                        created_by: userId,
                        created_date: currentDateTime,
                        updated_by: null,
                        updated_date: null
                    };

                    if (objToCreate.hasOwnProperty('id')) {
                        delete objToCreate.id;
                    }

                    const createdShopCustomerDebtList = await ShopCustomerDebtCreditNoteList.create(
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
                    if (!isUUID(shopCustomerDebtCreditNoteList?.id)) {
                        throw new Error(`ต้องการรหัสหลักข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }

                    /**
                     * รายการที่ต้องการแก้ไข
                     */
                    const findShopCustomerDebtCreditNoteList = await ShopCustomerDebtCreditNoteList.findOne({
                        where: {
                            id: shopCustomerDebtCreditNoteList?.id,
                            shop_customer_debt_cn_doc_id: shop_customer_debt_cn_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findShopCustomerDebtCreditNoteList) {
                        throw new Error(`ไม่พบข้อมูลรหัสหลักรายการใบลดหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ ${shopCustomerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else if (findShopCustomerDebtCreditNoteList.previous('status') !== 1) {
                        throw new Error(`ไม่สามารถแก้ไขข้อมูลรหัสหลักรายการใบลดหนี้ของลูกหนี้การค้า ในการแก้ไขข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า เนื่องจากรายการนี้อยกเลิกไปแล้ว: รายการที่ ${shopCustomerDebtCreditNoteList?.seq_number}, ชุดข้อมูลที่ ${index + 1}`);
                    }
                    else {
                        const objEditData = {};
                        const fnSetObjEditData = (key) => {
                            if (!key) { return; }
                            if (shopCustomerDebtCreditNoteList.hasOwnProperty(key)) {
                                objEditData[key] = shopCustomerDebtCreditNoteList[key];
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
                                previousData: findShopCustomerDebtCreditNoteList.toJSON(),
                                currentData: findShopCustomerDebtCreditNoteList
                            });
                        }
                        else {
                            objEditData.updated_by = userId;
                            objEditData.updated_date = currentDateTime;

                            const findShopCustomerDebtCreditNoteList__previousData = findShopCustomerDebtCreditNoteList.toJSON();

                            findShopCustomerDebtCreditNoteList.set(objEditData);
                            await findShopCustomerDebtCreditNoteList.save({ validate: true, transaction: transaction, ShopModels: ShopModels });

                            createdAndUpdatedDocuments.push({
                                isCreated: false,
                                isUpdated: true,
                                previousData: findShopCustomerDebtCreditNoteList__previousData,
                                currentData: findShopCustomerDebtCreditNoteList
                            });
                        }
                    }
                }
            }

            return createdAndUpdatedDocuments;
        }
    }

    ShopCustomerDebtCreditNoteList.init(
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
            shop_customer_debt_cn_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopCustomerDebtCreditNoteDoc,
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
            modelName: 'ShopCustomerDebtCreditList',
            tableName: `dat_${table_name}_customer_debt_cn_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการใบลดหนี้ของลูกหนี้การค้า',
            indexes: [
                {
                    name: `idx_${table_name}_ccn_list_debt_cn_doc_id`,
                    fields: ['shop_customer_debt_cn_doc_id']
                },
                {
                    name: `idx_${table_name}_ccn_list_tmp_doc_id`,
                    fields: ['shop_temporary_delivery_order_doc_id']
                },
                {
                    name: `idx_${table_name}_ccn_list_tmp_list_id`,
                    fields: ['shop_temporary_delivery_order_list_id']
                },
                {
                    name: `idx_${table_name}_ccn_list_product_id`,
                    fields: ['product_id']
                },
                {
                    name: `idx_${table_name}_ccn_list_shop_product_id`,
                    fields: ['shop_product_id']
                },
                {
                    name: `idx_${table_name}_ccn_list_list_id`,
                    fields: ['list_id']
                },
                {
                    name: `idx_${table_name}_ccn_list_list_name`,
                    fields: ['list_name']
                }
            ]
        }
    );

    ShopCustomerDebtCreditNoteList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopCustomerDebtCreditNoteList.belongsTo(ShopCustomerDebtCreditNoteDoc, { foreignKey: 'shop_customer_debt_cn_doc_id', as: 'ShopCustomerDebtCreditNoteDoc' });
    ShopCustomerDebtCreditNoteList.belongsTo(ShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_temporary_delivery_order_doc_id', as: 'ShopTemporaryDeliveryOrderDoc' });
    ShopCustomerDebtCreditNoteList.belongsTo(ShopTemporaryDeliveryOrderList, { foreignKey: 'shop_temporary_delivery_order_list_id', as: 'ShopTemporaryDeliveryOrderList' });
    ShopCustomerDebtCreditNoteList.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });
    ShopCustomerDebtCreditNoteList.belongsTo(ShopProduct, { foreignKey: 'shop_product_id', as: 'ShopProduct' });
    ShopCustomerDebtCreditNoteList.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopCustomerDebtCreditNoteList.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopTemporaryDeliveryOrderDoc,
            ShopTemporaryDeliveryOrderList,
            ShopProduct
        } = ShopModels;

        /**
         * Setter พารามิเตอร์ options.isCancelStatus_Doc ถ้ามีการยกเลิกเอกสาร
         * @param {ShopCustomerDebtCreditNoteList} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopCustomerDebtCreditNoteList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtCreditNoteList>} options
         */
        const hookBeforeSave_setOptionsDocumentIsCancelStatus = async (instance, options) => {
            if (instance.isNewRecord) {
                return;
            }
            else if (!instance.isNewRecord && instance.previous('status') !== 1) {
                throw new Error(`ไม่สามาแก้ไขสถานะข้อมูลรายการใบลดหนี้ของลูกหนี้การค้าได้ เนื่องจากเคยยกเลิกไปแล้ว`);
            }
            else if (!instance.isNewRecord && instance.changed() && instance.previous('status') === 1 && instance.get('status') === 1) {
                return;
            }
            else if (!instance.isNewRecord && instance.changed('status') && instance.previous('status') === 1 && instance.get('status') === 0) {
                options.isCancelStatus_Doc = true;
                return;
            }
            else {
                throw new Error(`ไม่สามารถแก้ไขข้อมูลรายการใบลดหนี้ของลูกหนี้การค้าได้ เนื่องจากเกิดข้อผิดพลาดอื่น ๆ`);
            }
        };

        /**
         * @param {ShopCustomerDebtCreditNoteList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtCreditNoteList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtCreditNoteList>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_checkFields = async (instance, options) => {
            if (options?.isCancelStatus_Doc === true) { return; }

            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (isUUID(instance.get('shop_temporary_delivery_order_doc_id'))) {
                const findDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('shop_temporary_delivery_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบส่งสินค้าชั่วคราว จากการสร้างหรือแก้ไขรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ (${instance.get('seq_number')})`); }
            }
            if (isUUID(instance.get('shop_temporary_delivery_order_list_id'))) {
                const findDoc = await ShopTemporaryDeliveryOrderList.findOne({
                    attributes: ['id', 'shop_temporary_delivery_order_doc_id'],
                    where: {
                        id: instance.get('shop_temporary_delivery_order_list_id'),
                        ...(
                            !isUUID(instance.get('shop_temporary_delivery_order_doc_id'))
                                ? {}
                                : { shop_temporary_delivery_order_doc_id: instance.get('shop_temporary_delivery_order_doc_id') }
                        )
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลรายการใบส่งสินค้าชั่วคราว จากการสร้างหรือแก้ไขรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ (${instance.get('seq_number')})`); }
            }
            if (isUUID(instance.get('product_id'))) {
                const findDoc = await Product.findOne({
                    attributes: ['id'],
                    where: {
                        id: instance.get('product_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลสินค้า จากการสร้างหรือแก้ไขรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ (${instance.get('seq_number')})`); }
            }
            if (isUUID(instance.get('shop_product_id'))) {
                const findDoc = await ShopProduct.findOne({
                    attributes: ['id', 'product_id'],
                    where: {
                        id: instance.get('shop_product_id'),
                        ...(
                            !isUUID(instance.get('product_id'))
                                ? {}
                                : { product_id: instance.get('product_id') }
                        )
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findDoc) { throw new Error(`ไม่พบข้อมูลสินค้าของร้านค้า จากการสร้างหรือแก้ไขรายการใบลดหนี้ของลูกหนี้การค้า: รายการที่ (${instance.get('seq_number')})`); }
            }
        };

        /**
         * Mutation ข้อมูลฟิวส์ "details.meta_data"
         * @param {ShopCustomerDebtCreditNoteList} instance
         * @param {(import("sequelize/types/model").UpdateOptions<ShopCustomerDebtCreditNoteList> | import("sequelize/types/model").SaveOptions<ShopCustomerDebtCreditNoteList>) & { isCancelStatus_Doc?: boolean }} options
         */
        const hookBeforeSave_mutationField_details__meta_data = async (instance, options) => {
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
                    (!instance.isNewRecord && instance.previous('status') === 1 && instance.get('status') === 1)
                    &&
                    (
                        instance.changed('shop_temporary_delivery_order_doc_id')
                        || instance.changed('shop_temporary_delivery_order_list_id')
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
                        'shop_temporary_delivery_order_doc_id',
                        'ShopTemporaryDeliveryOrderDoc',
                        ShopTemporaryDeliveryOrderDoc,
                        {
                            id: instance.get('shop_temporary_delivery_order_doc_id')
                        },
                        transaction
                    ),
                    fnFindAndSetToMetaData(
                        'shop_temporary_delivery_order_list_id',
                        'ShopTemporaryDeliveryOrderList',
                        ShopTemporaryDeliveryOrderList,
                        {
                            id: instance.get('shop_temporary_delivery_order_list_id')
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
            hookBeforeSave_setOptionsDocumentIsCancelStatus,
            hookBeforeSave_checkFields,
            hookBeforeSave_mutationField_details__meta_data
        };
    };

    ShopCustomerDebtCreditNoteList.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });
    });

    ShopCustomerDebtCreditNoteList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_setOptionsDocumentIsCancelStatus(instance, options);
        await instance.myHookFunctions.hookBeforeSave_checkFields(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField_details__meta_data(instance, options);
    });

    return ShopCustomerDebtCreditNoteList;
};


module.exports = ShopCustomerDebtCreditNoteList;