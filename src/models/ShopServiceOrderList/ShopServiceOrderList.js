/**
 * A function do dynamics table of model ShopServiceOrderList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_service_order_list"
 */
const ShopServiceOrderList = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    /**
     * @type {import("lodash")}
     */
    const _ = require("lodash");
    const { isUUID } = require("../../utils/generate");

    const Model = require("sequelize").Model;
    const { DataTypes, literal, QueryTypes, Op } = require("sequelize");
    const utilSetShopStockProductBalance = require("../../utils/util.SetShopStockProductBalance");
    const utilProportionDiscountCalculator = require("../../utils/util.ProportionDiscountCalculator");
    const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

    const db = require("../../db");

    const __model = require("../model");
    const {
        User: Users,
        ShopsProfiles: ShopProfile,
        ProductPurchaseUnitTypes: ProductPurchaseUnitType,
        Product,
        ProductType,
        ProductTypeGroup,
        ProductModelType,
        ProductBrand
    } = __model;
    const ShopProduct = __model.ShopProduct(table_name);
    const ShopWarehouse = __model.ShopWarehouse(table_name);
    const ShopStock = __model.ShopStock(table_name);
    const ShopServiceOrderDoc = __model.ShopServiceOrderDoc(table_name);

    class ShopServiceOrderList extends Model {
        /**
         * ปรับปรุงขฟิวส้อมูลส่วนลดตามสัดส่วน
         * @param shop_service_order_doc_id {string}
         * @param options {{ ShopModels: Object; transaction: import("sequelize").Transaction; }}
         */
        static async mutationFields__ProportionDiscount (shop_service_order_doc_id, options = {}) {
            if (!shop_service_order_doc_id) { throw new Error(`Require parameter 'shop_service_order_doc_id'`); }

            const transaction = options.transaction || null;
            const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
            const {
                ShopServiceOrderDoc,
                ShopServiceOrderList
            } = ShopModels;

            const findDoc = await ShopServiceOrderDoc.findOne({
                where: {
                    id: shop_service_order_doc_id
                },
                transaction:transaction,
                ShopModels: ShopModels
            });
            if (findDoc) {
                const price_bill_discount_total = (Number(findDoc.get('price_discount_bill') || 0) + Number(findDoc.get('price_discount_before_pay') || 0)).toFixed(2);

                const findLists = await ShopServiceOrderList.findAll({
                    where: {
                        shop_service_order_doc_id: shop_service_order_doc_id,
                        price_grand_total: { [Op.gte]: 0 },
                        status: 1
                    },
                    order: [['seq_number', 'ASC']],
                    transaction: transaction,
                    ShopModels: ShopModels
                });

                /**
                 * @type {{lists: {seq_number: string, proportion_discount_price: string, proportion_discount_ratio: string, objModel: ShopServiceOrderList, price_grand_total: string}[], price_bill_discount: string}}
                 */
                const objBillAndLists = {
                    price_bill_discount: price_bill_discount_total,
                    lists: findLists.map(element => ({
                        seq_number: String(element.get('seq_number')),
                        price_grand_total: String(element.get('price_grand_total')),
                        proportion_discount_ratio: '0.00',
                        proportion_discount_price: '0.00',
                        objModel: element
                    }))
                };

                const calProportionDiscount = utilProportionDiscountCalculator(objBillAndLists, { toFixed: 2 });

                for (let index = 0; index < calProportionDiscount.lists.length; index++) {
                    const element = calProportionDiscount.lists[index];
                    element.objModel.set({
                        proportion_discount_ratio: element.proportion_discount_ratio,
                        proportion_discount_price: element.proportion_discount_price
                    });
                    await element.objModel.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                }
            }
        }
    }

    ShopServiceOrderList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบสั่งซ่อม`,
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
            shop_service_order_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopServiceOrderDoc,
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
            shop_product_id: {
                comment: `รหัสตารางข้อมูลสินค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopProduct,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            shop_stock_id: {
                comment: 'รหัสหลักตารางข้อมูลสต๊อกสินค้า',
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopStock,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            shop_warehouse_id: {
                comment: 'รหัสหลักตารางข้อมูลคลังสินค้า',
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopWarehouse,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            shop_warehouse_shelf_item_id: {
                comment: 'รหัสหลักตารางข้อมูลชั้นวางในคลังสินค้า',
                type: DataTypes.STRING,
                allowNull: true
            },
            purchase_unit_id: {
                comment: `รหัสตารางข้อมูลหน่วยนับสินค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ProductPurchaseUnitType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            dot_mfd: {
                comment: `รหัสวันที่ผลิต (DOT)`,
                type: DataTypes.STRING(4),
                allowNull: true
            },
            amount: {
                comment: `จำนวนสินค้า`,
                type: DataTypes.BIGINT,
                allowNull: false,
                defaultValue: 0
            },
            cost_unit: {
                comment: `ราคาทุน/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_unit: {
                comment: `ราคาขาย/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            price_discount: {
                comment: `ส่วนลด (บาท)/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            price_discount_percent: {
                comment: `ส่วนลด (%)/หน่วย`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            price_grand_total: {
                comment: `จำนวนเงินสุทธิ`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            proportion_discount_ratio: {
                comment: `อัตราส่วนของส่วนลดตามสัดส่วน`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            proportion_discount_price: {
                comment: `จำนวนเงินส่วนลดตามสัดส่วน`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
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
                    model: Users,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            created_date: {
                comment: `สร้างข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal(`now()`)
            },
            updated_by: {
                comment: `ปรับปรุงข้อมูลโดย`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: Users,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            updated_date: {
                comment: `ปรับปรุงข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null
            },
            is_migrated: {
                comment: 'เอกสารนี้มาจากการ Migration หรือไม่',
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
        },
        {
            sequelize: db,
            modelName: 'ShopServiceOrderList',
            tableName: `dat_${table_name}_service_order_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการใบสั่งซ่อม',
            indexes: [
                {
                    name: `idx_${table_name}_job_list_shop_service_order_doc_id`,
                    fields: ['shop_service_order_doc_id']
                },
                {
                    name: `idx_${table_name}_job_list_shop_product_id`,
                    fields: ['shop_product_id']
                },
                {
                    name: `idx_${table_name}_job_list_shop_stock_id`,
                    fields: ['shop_stock_id']
                },
                {
                    name: `idx_${table_name}_job_list_shop_warehouse_id`,
                    fields: ['shop_warehouse_id']
                },
                {
                    name: `idx_${table_name}_job_list_shop_warehouse_shelf_item_id`,
                    fields: ['shop_warehouse_shelf_item_id']
                },
                {
                    name: `idx_${table_name}_job_list_purchase_unit_id`,
                    fields: ['purchase_unit_id']
                },
                {
                    name: `idx_${table_name}_job_list_dot_mfd`,
                    fields: ['dot_mfd']
                }
            ]
        }
    );

    ShopServiceOrderList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopServiceOrderList.belongsTo(ShopServiceOrderDoc, { foreignKey: 'shop_service_order_doc_id', as: 'ShopServiceOrderDoc' });
    ShopServiceOrderList.belongsTo(ShopProduct, { foreignKey: 'shop_product_id', as: 'ShopProduct' });
    ShopServiceOrderList.belongsTo(ShopWarehouse, { foreignKey: 'shop_stock_id', as: 'ShopStock' });
    ShopServiceOrderList.belongsTo(ShopWarehouse, { foreignKey: 'shop_warehouse_id', as: 'ShopWarehouse' });
    ShopServiceOrderList.belongsTo(ProductPurchaseUnitType, { foreignKey: 'purchase_unit_id', as: 'ProductPurchaseUnitType' });
    ShopServiceOrderList.belongsTo(Users, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopServiceOrderList.belongsTo(Users, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopServiceOrderDoc,
            ShopServiceOrderList,
            ShopInventoryMovementLog,
        } = ShopModels;

        /**
         * @param {ShopServiceOrderList} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const fnFindShopStock = async (instance, options) => {
            const transaction = options?.transaction || null;

            /**
             * @type {string}
             */
            const shop_product_id = options?.overQuery?.shop_product_id || instance.get('shop_product_id');
            /**
             * @type {string}
             */
            const shop_warehouse_id = options?.overQuery?.shop_warehouse_id || instance.get('shop_warehouse_id');
            /**
             * @type {string}
             */
            const shop_warehouse_shelf_item_id = options?.overQuery?.shop_warehouse_shelf_item_id || instance.get('shop_warehouse_shelf_item_id');
            /**
             * @type {string|null}
             */
            const purchase_unit_id = options?.overQuery?.purchase_unit_id || instance.get('purchase_unit_id') || null;
            /**
             * @type {string|null}
             */
            const dot_mfd = options?.overQuery?.dot_mfd || instance.get('dot_mfd') || null;
            /**
             * @type {string|null}
             */
            const shop_stock_id = options?.overQuery?.shop_stock_id || instance.get('shop_stock_id') || null;
            /**
             * @type {number}
             */
            const amount = Number(options?.overQuery?.amount) || Number(instance.get('amount'));
            if (!_.isSafeInteger(amount) || amount <= 0) {
                throw new Error(`จำนวนสินค้าจะต้องเป็นจำนวนนับที่มากกว่า 0`);
            }

            const whereProductId = `shop_product_id = '${shop_product_id}'`;
            const whereWarehouseId = `shop_warehouse_id = '${shop_warehouse_id}'`;
            const whereWarehouseShelfItemId = `shop_warehouse_shelf_item_id = '${shop_warehouse_shelf_item_id}'`;
            const wherePurchaseUnitId = (() => {
                if (!purchase_unit_id) {
                    return `purchase_unit_id IS NULL`;
                }
                else {
                    return `purchase_unit_id = '${purchase_unit_id}'`;
                }
            })();
            const whereDotMfd = (() => {
                if (!dot_mfd) {
                    return `dot_mfd IS NULL`;
                }
                else {
                    return `dot_mfd = '${dot_mfd}'`;
                }
            })();

            /**
             * @type {
             * {
             *   shop_stock_id: string;
             *   shop_product_id: string;
             *   shop_warehouse_id: string;
             *   shop_warehouse_shelf_item_id: string;
             *   purchase_unit_id?: string;
             *   dot_mfd?: string;
             *   balance: number;
             *   balance_date: string;
             *   created_date: string;
             *   created_by: string;
             *   updated_date: string;
             *   updated_by: string;
             * }[]
             * }
             */
            const findStock = await db.query(
                `
                WITH ShopStock AS (
                    SELECT
                        ShopStock.id AS shop_stock_id,
                        ShopStock.product_id AS shop_product_id,
                        (ShopStockWarehouse->>'warehouse')::UUID AS shop_warehouse_id,
                        (nullif(trim((ShopStockWarehouseShelf->>'item')), ''))::varchar AS shop_warehouse_shelf_item_id,
                        (nullif(trim((ShopStockWarehouseShelf->>'purchase_unit_id')), ''))::UUID AS purchase_unit_id,
                        (nullif(trim((ShopStockWarehouseShelf->>'dot_mfd')), ''))::varchar AS dot_mfd,
                        (ShopStockWarehouseShelf->>'balance')::BIGINT AS balance,
                        ShopStock.balance_date AS balance_date,
                        ShopStock.created_date AS created_date,
                        ShopStock.created_by AS created_by,
                        ShopStock.updated_date AS updated_date,
                        ShopStock.updated_by AS updated_by
                    FROM app_shops_datas.dat_01hq0011_stock_products_balances AS ShopStock
                        CROSS JOIN LATERAL json_array_elements(ShopStock.warehouse_detail) AS ShopStockWarehouse
                        CROSS JOIN LATERAL json_array_elements(ShopStockWarehouse.value->'shelf') AS ShopStockWarehouseShelf
                )
                SELECT * FROM ShopStock
                WHERE
                    ${whereProductId}
                    AND ${whereWarehouseId}
                    AND ${whereWarehouseShelfItemId}
                    AND ${wherePurchaseUnitId}
                    AND ${whereDotMfd}
                    ${shop_stock_id ? `AND shop_stock_id = '${shop_stock_id}'` : ''}
            `.replace(/(\.dat_01hq0011_)/g, `.dat_${table_name}_`),
                {
                    type: QueryTypes.SELECT,
                    transaction: transaction
                }
            );
            if (findStock.length !== 1) {
                if (instance.isNewRecord && instance.get('is_migrated')) { return; }

                throw new Error(`ไม่พบข้อมูลสต็อกสินค้าหรืออาจจะระบบสต็อกสินค้าทำงานผิดพลาด`);
            }
            else {
                return findStock[0];
            }
        };

        /**
         * @param {ShopServiceOrderList} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const fnFindShopWarehouse = async (instance, options) => {
            const transaction = options?.transaction || null;

            /**
             * @type {string}
             */
            const shop_warehouse_id = instance.get('shop_warehouse_id');
            /**
             * @type {string}
             */
            const shop_warehouse_shelf_item_id = instance.get('shop_warehouse_shelf_item_id');

            /**
             * @type {{
             *   shop_warehouse_id: string;
             *   shop_warehouse_code_id: string;
             *   shop_warehouse_name: string;
             *   shop_warehouse_shelf_item_id: string;
             *   shop_warehouse_shelf_item_name: string;
             *   created_by: string;
             *   created_date: string;
             *   updated_by: string|null;
             * }[]}
             */
            const fndWarehouse = await db.query(
                `
                WITH CTE_ShopWarehouse AS (
                    SELECT
                        ShopWarehouse.id AS shop_warehouse_id,
                        ShopWarehouse.code_id AS shop_warehouse_code_id,
                        ShopWarehouse.name ->>'th' AS shop_warehouse_name,
                        ShopStockShelfItem.value->>'code' AS shop_warehouse_shelf_item_id,
                        ShopStockShelfItem.value->'name'->>'th' AS shop_warehouse_shelf_item_name,
                        ShopWarehouse.created_by,
                        ShopWarehouse.created_date,
                        ShopWarehouse.updated_by
                    FROM app_shops_datas.dat_01hq0011_warehouses AS ShopWarehouse
                        CROSS JOIN LATERAL json_array_elements(ShopWarehouse.shelf) AS ShopStockShelfItem
                )
                SELECT *
                FROM CTE_ShopWarehouse
                WHERE 
                    shop_warehouse_id = '${shop_warehouse_id}'
                    AND shop_warehouse_shelf_item_id = '${shop_warehouse_shelf_item_id}';
            `.replace(/(\.dat_01hq0011_)/g, `.dat_${table_name}_`),
                {
                    type: QueryTypes.SELECT,
                    transaction: transaction
                }
            );

            if (fndWarehouse.length !== 1) {
                if (instance.isNewRecord && instance.get('is_migrated')) { return; }

                throw new Error(`ไม่พบข้อมูลคลังสินค้าหรืออาจจะระบบคลังสินค้าผิดพลาด`);
            }
            else {
                return fndWarehouse[0];
            }
        };

        /**
         * @param {ShopServiceOrderList} instance
         * @param {import("sequelize/types/model").SaveOptions} options
         */
        const fnCheckStockAvailable = async (instance, options) => {
            /**
             * @type {number}
             */
            const amount = Number(instance.get('amount'));
            if (!_.isSafeInteger(amount) || amount <= 0) {
                throw new Error(`จำนวนสินค้าจะต้องเป็นจำนวนนับที่มากกว่า 0`);
            }

            if (instance.isNewRecord) { // When create new document
                const findStock = await fnFindShopStock(instance, options);
                if (!findStock) {
                    throw new Error(`ไม่พบข้อมูลสต็อกสินค้าจากการสร้างเอกสาร`);
                }
                else {
                    const stockBalance = Number(findStock.balance);
                    const calculateStockBalanceLeft = stockBalance - amount;
                    if (calculateStockBalanceLeft < 0) {
                        throw new Error(`จำนวนสินค้าไม่พอจากการสร้างเอกสาร`);
                    }
                    return findStock;
                }
            }
            else { // When edit document
                const shopServiceOrderList_ChangedData = {
                    id: instance.changed('id'),
                    shop_id: instance.changed('shop_id'),
                    shop_service_order_doc_id: instance.changed('shop_service_order_doc_id'),
                    shop_product_id: instance.changed('shop_product_id'),
                    shop_warehouse_id: instance.changed('shop_warehouse_id'),
                    shop_warehouse_shelf_item_id: instance.changed('shop_warehouse_shelf_item_id'),
                    purchase_unit_id: instance.changed('purchase_unit_id'),
                    dot_mfd: instance.changed('dot_mfd'),
                    amount: instance.changed('amount')
                };
                if (shopServiceOrderList_ChangedData.id) {
                    throw new Error(`ไม่อนุญาติให้แก้ไขรหัสหลักตารางข้อมูลรายการใบสั่งซ่อม`);
                }
                if (shopServiceOrderList_ChangedData.shop_id) {
                    throw new Error(`ไม่อนุญาตแก้ไขรหัสตารางข้อมูลร้านค้า`);
                }
                if (shopServiceOrderList_ChangedData.shop_service_order_doc_id) {
                    throw new Error(`ไม่อนุญาติรหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม`);
                }

                if (
                    shopServiceOrderList_ChangedData.shop_product_id
                    || shopServiceOrderList_ChangedData.shop_warehouse_id
                    || shopServiceOrderList_ChangedData.shop_warehouse_shelf_item_id
                    || shopServiceOrderList_ChangedData.purchase_unit_id
                    || shopServiceOrderList_ChangedData.dot_mfd
                    || shopServiceOrderList_ChangedData.amount
                ) {
                    const findStock = await fnFindShopStock(instance, options);
                    if (!findStock) {
                        throw new Error(`ไม่พบข้อมูลสต็อกสินค้าจากการแก้ไขรายการใบสั่งซ่อม`);
                    }
                    else {
                        const stockBalance = Number(findStock.balance);
                        const calculateStockBalanceLeft = stockBalance - amount;
                        if (calculateStockBalanceLeft < 0) {
                            throw new Error(`จำนวนสินค้าไม่พอจากการแก้ไขรายการใบสั่งซ่อม`);
                        }
                        return findStock;
                    }
                }
            }
        };

        /**
         * @param {ShopServiceOrderList} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDOT = (instance, options) => {
            if (instance.isNewRecord && instance.get('is_migrated')) { return; }

            /**
             * @type {string|null}
             */
            const dot_mfd = instance.get('dot_mfd') || null;
            if (_.isString(dot_mfd)) {
                if (!(/^[0-9]{4}$/g).test(dot_mfd)) {
                    throw new Error(`รหัส DOT จะต้องเป็นเลข 4 หลัก หรือเป็นข้อมูลว่าง`);
                }
            }

            instance.set('dot_mfd', dot_mfd);
        };

        /**
         * @param {ShopServiceOrderList} instance
         * @param {import("sequelize/types/model").SaveOptions} options
         */
        const hookBeforeSave_validatorShopServiceOrderDoc = async (instance, options) => {
            if (instance.isNewRecord && instance.get('is_migrated')) { return; }

            const transaction = options?.transaction || null;

            const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                where: {
                    id: instance.get('shop_service_order_doc_id')
                },
                transaction: transaction
            });
            if (!findShopServiceOrderDoc) {
                throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
            }
            if (instance.isNewRecord && instance.get('is_migrated')) { // ข้ามการตรวจสอบ status หากเป็นการสร้างมาจาก migration
                return;
            }
            if (findShopServiceOrderDoc.get('status') !== 1) {
                throw new Error(`ไม่สามารถสร้างหรือแก้ไขรายการได้, เนื่องจากใบสั่งซ่อมได้ยกเลิกหรือลบไปแล้ว`);
            }
        };

        /**
         * @param {ShopServiceOrderList} instance
         * @param {import("sequelize/types/model").SaveOptions<ShopServiceOrderList>} options
         */
        const hookBeforeSave_mutationField__details = async (instance, options) => {
            const transaction = options?.transaction || null;

            const getMetaData__shop_product_id = async (shop_product_id) => {
                if (isUUID(shop_product_id)) {
                    const findShopProduct = await ShopProduct.findOne({
                        attributes: [
                            'id',
                            'product_id',
                            'product_bar_code',
                            'start_date',
                            'end_date',
                            'price'
                        ],
                        where: {
                            id: shop_product_id
                        },
                        include: [
                            {
                                model: Product,
                                attributes: [
                                    'id',
                                    'product_code',
                                    'master_path_code_id',
                                    'custom_path_code_id',
                                    'wyz_code',
                                    'rim_size',
                                    'width',
                                    'hight',
                                    'series',
                                    'load_index',
                                    'speed_index',
                                    'product_name',
                                    'product_type_id',
                                    'product_brand_id',
                                    'product_model_id',
                                    'complete_size_id',
                                    'other_details'
                                ],
                                include: [
                                    {
                                        model: ProductType,
                                        attributes: [
                                            'id',
                                            'code_id',
                                            'type_name',
                                            'type_group_id'
                                        ],
                                        include: [
                                            {
                                                model: ProductTypeGroup,
                                                attributes: [
                                                    'id',
                                                    'run_no',
                                                    'code_id',
                                                    'internal_code_id',
                                                    'group_type_name',
                                                    'isstock'
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        model: ProductBrand,
                                        attributes: [
                                            'id',
                                            'code_id',
                                            'brand_name'
                                        ]
                                    },
                                    {
                                        model: ProductModelType,
                                        attributes: [
                                            'id',
                                            'code_id',
                                            'model_name',
                                            'product_type_id',
                                            'product_brand_id'
                                        ]
                                    }
                                ]
                            }
                        ],
                        transaction: transaction
                    });
                    if (!findShopProduct) {
                        throw new Error(`ไม่พบข้อมูลสินค้า`);
                    }
                    else {
                        return {
                            ShopProduct: findShopProduct.toJSON()
                        }
                    }
                }
                else {
                    throw new Error(`รหัสหลักข้อมูลสินค้าไม่ถูกต้อง`);
                }
            };

            const getMetaData__purchase_unit_id = async (purchase_unit_id) => {
                if (isUUID(purchase_unit_id)) {
                    const findProductPurchaseUnitType = await ProductPurchaseUnitType.findOne({
                        attributes: [
                            'id',
                            'code_id',
                            'internal_code_id',
                            'type_name',
                            'type_group_id',
                            'amount_per_unit',
                            'internal_code_id'
                        ],
                        where: {
                            id: purchase_unit_id
                        },
                        transaction: transaction
                    });
                    if (!findProductPurchaseUnitType) {
                        throw new Error(`ไม่พบข้อมูลหน่วยสินค้า`);
                    }
                    else {
                        return {
                            ProductPurchaseUnitType: findProductPurchaseUnitType.toJSON()
                        };
                    }
                }
                else {
                    return {
                        ProductPurchaseUnitType: null
                    };
                }
            };

            const getMetaData__stockAndWarehouse = async (shop_stock_id, purchase_unit_id, shop_warehouse_id, shop_warehouse_shelf_item_id) => {
                if (isUUID(shop_stock_id) && isUUID(shop_warehouse_id) && shop_warehouse_shelf_item_id) {
                    const findWarehouse = await fnFindShopWarehouse(instance, options);
                    if (!findWarehouse) {
                        if (instance.isNewRecord && instance.get('is_migrated')) { return { ShopStock: null }; }

                        throw new Error(`ไม่พบข้อมูลคลังสินค้า`);
                    }
                    else {
                        const findStock = await fnFindShopStock(instance, options);
                        if (!findStock) {
                            if (instance.isNewRecord && instance.get('is_migrated')) { return { ShopStock: null }; }

                            throw new Error(`ไม่พบข้อมูลสต็อกสินค้า`);
                        }
                        else {
                            return {
                                ShopStock: {
                                    id: findStock.shop_stock_id,
                                    ...(findStock),
                                    shop_stock_id: undefined,
                                    created_date: undefined,
                                    ShopWarehouse: {
                                        id: findWarehouse.shop_warehouse_id,
                                        code_id: findWarehouse.shop_warehouse_code_id,
                                        name: findWarehouse.shop_warehouse_name,
                                        shop_warehouse_shelf_item_id: findWarehouse.shop_warehouse_shelf_item_id,
                                        ShopWarehouseSelfItem: {
                                            id: findWarehouse.shop_warehouse_shelf_item_id,
                                            name: findWarehouse.shop_warehouse_shelf_item_name
                                        }
                                    }
                                }
                            };
                        }
                    }
                }
                else {
                    if (!isUUID(shop_stock_id)) {
                        throw new Error(`รหัสหลักสต็อกค้าไม่ถูกต้อง`);
                    }
                    if (!isUUID(shop_warehouse_id)) {
                        throw new Error(`รหัสหลักหลังคลังสินค้าไม่ถูกต้อง`);
                    }
                    if (!shop_warehouse_shelf_item_id) {
                        throw new Error(`รหัสหลักชั้นวางสินค้าไม่ถูกต้อง`);
                    }
                }
            };

            const getDetails__ShopServiceOrderList = async (shop_service_order_list_id) => {
                if (!isUUID(shop_service_order_list_id)) {
                    return {};
                }
                else {
                    const findData = await ShopServiceOrderList.findOne({
                        where: {
                            id: shop_service_order_list_id
                        },
                        transaction: transaction
                    });

                    return findData?.get('details') || {};
                }
            };

            const [
                metaData__shop_product_id,
                metaData__purchase_unit_id,
                metaData__stockAndWarehouse,
                details_ShopServiceOrderList
            ] = await Promise.all([
                getMetaData__shop_product_id(instance.get('shop_product_id')),
                getMetaData__purchase_unit_id(instance.get('purchase_unit_id') || null),
                getMetaData__stockAndWarehouse(
                    instance.get('shop_stock_id'),
                    instance.get('purchase_unit_id') || null,
                    instance.get('shop_warehouse_id'),
                    instance.get('shop_warehouse_shelf_item_id')
                ),
                getDetails__ShopServiceOrderList(instance.get('id') || null)
            ]);


            const prev__details = instance.previous('details') || {};
            const curr__details = instance.get('details') || {};

            const details = {
                ...(details_ShopServiceOrderList || {}),
                ...(prev__details),
                ...(curr__details),
                meta_data: {
                    ...((details_ShopServiceOrderList || {})?.meta_data || {}),
                    ...metaData__shop_product_id,
                    ...metaData__purchase_unit_id,
                    ...metaData__stockAndWarehouse,
                },
                ...(instance.isNewRecord && instance.get('is_migrated')
                        ? { migrate_data: (instance.get('details')['migrate_data'] || {}) }
                        : {}
                ),
            };

            instance.set({ details: details });
        };

        /**
         * @param {ShopServiceOrderList} instance
         * @param {import("sequelize/types/model").SaveOptions<ShopServiceOrderList>} options
         * @return {Promise<void>}
         */
        const hookBeforeSave_mutationShopStock = async (instance, options) => {
            const transaction = options?.transaction || null;

            if (instance.isNewRecord && instance.get('is_migrated')) { // ข้ามการตรวจสอบ status หากเป็นการสร้างมาจาก migration
                return;
            }

            if (instance.isNewRecord) { // เมื่อ Document นี้ ถูก Create
                if (instance.get('status') !== 1) {
                    throw new Error(`ไม่อณุญาตให้สร้างรายการใบสั่งซ่อมที่อยู่ในสถานะยกเลิกหรือลบ`);
                }

                const findCurrentStock = await fnCheckStockAvailable(instance, options);
                await utilSetShopStockProductBalance(
                    table_name,
                    instance.get('shop_product_id'),
                    instance.get('shop_warehouse_id'),
                    instance.get('shop_warehouse_shelf_item_id'),
                    instance.get('purchase_unit_id'),
                    instance.get('dot_mfd'),
                    "add_holding_product",
                    instance.get('amount'),
                    {
                        transaction: transaction,
                        updated_by: instance.get('updated_by'),
                        ShopModels: ShopModels
                    }
                );
                await utilSetShopStockProductBalance(
                    table_name,
                    instance.get('shop_product_id'),
                    instance.get('shop_warehouse_id'),
                    instance.get('shop_warehouse_shelf_item_id'),
                    instance.get('purchase_unit_id'),
                    instance.get('dot_mfd'),
                    "commit_holding_product",
                    instance.get('amount'),
                    {
                        transaction: transaction,
                        updated_by: instance.get('updated_by'),
                        ShopModels: ShopModels
                    }
                );

                if (!options?.skipCreateShopInventoryMovementLog && !options?.skipCreateShopInventoryMovementLogs) {
                    options.objToCreateShopInventoryMovementLogs = [{
                        documentData: {
                            document_service_order: {
                                shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                                shop_service_order_list_id: instance.get('id')
                            }
                        },
                        stockData: {
                            shop_product_id: findCurrentStock.shop_product_id,
                            shop_stock_id: findCurrentStock.shop_stock_id,
                            shop_warehouse_id: findCurrentStock.shop_warehouse_id,
                            shop_warehouse_shelf_item_id: findCurrentStock.shop_warehouse_shelf_item_id,
                            purchase_unit_id: findCurrentStock.purchase_unit_id,
                            dot_mfd: findCurrentStock.dot_mfd,
                            count_previous_stock: Number(findCurrentStock.balance),
                            count_adjust_stock: Number(instance.get('amount')) * (-1),
                            count_current_stock: Number(findCurrentStock.balance) + (Number(instance.get('amount')) * (-1))
                        },
                        userData: {
                            created_by: instance.get('created_by'),
                            created_date: instance.get('created_date')
                        },
                        detailsData: {
                            reasons: 'Create',
                            documentType: options?.metaData__ShopInventoryMovementLog?.details?.documentType || 'JOB'
                        },
                        options: {
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    }];
                }


                return;
            }
            else { // เมื่อ Document ที่ถูก Edit
                /**
                 * @type {boolean}
                 */
                const isChangedData_status = instance.changed('status');
                /**
                 * @type {number}
                 */
                const prevData_status = instance.previous('status');
                /**
                 * @type {number}
                 */
                const currData_status = instance.get('status');
                if (isChangedData_status && prevData_status === 0 && currData_status !== 0) { // เมื่อรายการเคยถูกยกเลิกไปแล้ว จะต้องไม่ใช้รายการนี้อีกต่อไป
                    throw new Error(`ไม่อนุญาตให้แก้ไขเนื่องจากรายการสินค้านี้เคยยกเลิกไปแล้ว`);
                }

                if (prevData_status !== 0 && currData_status === 0) { // เมื่อ Document ที่ถูก Edit เป็นการยกเลิก Document
                    const findCurrentStock = await fnFindShopStock(instance, options);
                    await utilSetShopStockProductBalance(
                        table_name,
                        instance.previous('shop_product_id'),
                        instance.previous('shop_warehouse_id'),
                        instance.previous('shop_warehouse_shelf_item_id'),
                        instance.previous('purchase_unit_id'),
                        instance.previous('dot_mfd'),
                        "revert_used_product",
                        instance.previous('amount'),
                        {
                            transaction: transaction,
                            updated_by: instance.get('updated_by'),
                            currentDateTime: instance.get('updated_date'),
                            ShopModels: ShopModels
                        }
                    );

                    if (!options?.skipCreateShopInventoryMovementLog && !options?.skipCreateShopInventoryMovementLogs) {
                        options.objToCreateShopInventoryMovementLogs = [{
                            documentData: {
                                document_service_order: {
                                    shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                                    shop_service_order_list_id: instance.get('id')
                                }
                            },
                            stockData: {
                                shop_product_id: findCurrentStock.shop_product_id,
                                shop_stock_id: findCurrentStock.shop_stock_id,
                                shop_warehouse_id: findCurrentStock.shop_warehouse_id,
                                shop_warehouse_shelf_item_id: findCurrentStock.shop_warehouse_shelf_item_id,
                                purchase_unit_id: findCurrentStock.purchase_unit_id,
                                dot_mfd: findCurrentStock.dot_mfd,
                                count_previous_stock: Number(findCurrentStock.balance),
                                count_adjust_stock: Number(instance.previous('amount')),
                                count_current_stock: Number(findCurrentStock.balance) + Number(instance.previous('amount'))
                            },
                            userData: {
                                created_by: instance.get('updated_by'),
                                created_date: instance.get('updated_date')
                            },
                            detailsData: {
                                reasons: 'Cancel',
                                documentType: options?.metaData__ShopInventoryMovementLog?.details?.documentType || 'JOB'
                            },
                            options: {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        }];
                    }

                    return;
                }

                if (prevData_status !== 0 && currData_status !== 0) { // เมื่อ Document ที่ถูก Edit นั้นไม่ได้เป็นการยกเลิก Document
                    if (
                        instance.changed('amount')
                        || instance.changed('shop_product_id')
                        || instance.changed('shop_warehouse_id')
                        || instance.changed('shop_warehouse_shelf_item_id')
                        || instance.changed('purchase_unit_id')
                        || instance.changed('dot_mfd')
                    ) {
                        /**
                         * @type {number}
                         */
                        const currData_amount = Number(instance.get('amount'));

                        if (currData_amount <= 0) {
                            throw new Error(`จำนวนสินค้าจะต้องเป็นจำนวนนับที่มากกว่า 0`);
                        }
                        else {
                            const findPreviousStock = await fnFindShopStock(instance, {
                                ...options,
                                overQuery: {
                                    shop_stock_id: instance.previous('shop_stock_id'),
                                    shop_product_id: instance.previous('shop_product_id'),
                                    shop_warehouse_id: instance.previous('shop_warehouse_id'),
                                    shop_warehouse_shelf_item_id: instance.previous('shop_warehouse_shelf_item_id'),
                                    purchase_unit_id: instance.previous('purchase_unit_id'),
                                    dot_mfd: instance.previous('dot_mfd'),
                                    amount: instance.previous('amount')
                                }
                            });
                            const findCurrentStock = await fnFindShopStock(instance, options);
                            await utilSetShopStockProductBalance(
                                table_name,
                                instance.previous('shop_product_id'),
                                instance.previous('shop_warehouse_id'),
                                instance.previous('shop_warehouse_shelf_item_id'),
                                instance.previous('purchase_unit_id'),
                                instance.previous('dot_mfd'),
                                "revert_used_product",
                                instance.previous('amount'),
                                {
                                    transaction: transaction,
                                    updated_by: instance.get('updated_by'),
                                    currentDateTime: instance.get('updated_date'),
                                    ShopModels: ShopModels
                                }
                            );
                            await fnCheckStockAvailable(instance, options);
                            await utilSetShopStockProductBalance(
                                table_name,
                                instance.get('shop_product_id'),
                                instance.get('shop_warehouse_id'),
                                instance.get('shop_warehouse_shelf_item_id'),
                                instance.get('purchase_unit_id'),
                                instance.get('dot_mfd'),
                                "add_holding_product",
                                instance.get('amount'),
                                {
                                    transaction: transaction,
                                    updated_by: instance.get('updated_by'),
                                    currentDateTime: instance.get('updated_date'),
                                    ShopModels: ShopModels
                                }
                            );
                            await utilSetShopStockProductBalance(
                                table_name,
                                instance.get('shop_product_id'),
                                instance.get('shop_warehouse_id'),
                                instance.get('shop_warehouse_shelf_item_id'),
                                instance.get('purchase_unit_id'),
                                instance.get('dot_mfd'),
                                "commit_holding_product",
                                instance.get('amount'),
                                {
                                    transaction: transaction,
                                    updated_by: instance.get('updated_by'),
                                    currentDateTime: instance.get('updated_date'),
                                    ShopModels: ShopModels
                                }
                            );

                            if (!options?.skipCreateShopInventoryMovementLog && !options?.skipCreateShopInventoryMovementLogs) {

                                if (
                                    instance.changed('amount')
                                    && !instance.changed('shop_product_id')
                                    && !instance.changed('shop_warehouse_id')
                                    && !instance.changed('shop_warehouse_shelf_item_id')
                                    && !instance.changed('purchase_unit_id')
                                    && !instance.changed('dot_mfd')
                                ) {
                                    options.objToCreateShopInventoryMovementLogs = [{
                                        documentData: {
                                            document_service_order: {
                                                shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                                                shop_service_order_list_id: instance.get('id')
                                            }
                                        },
                                        stockData: {
                                            shop_product_id: findCurrentStock.shop_product_id,
                                            shop_stock_id: findCurrentStock.shop_stock_id,
                                            shop_warehouse_id: findCurrentStock.shop_warehouse_id,
                                            shop_warehouse_shelf_item_id: findCurrentStock.shop_warehouse_shelf_item_id,
                                            purchase_unit_id: findCurrentStock.purchase_unit_id,
                                            dot_mfd: findCurrentStock.dot_mfd,
                                            count_previous_stock: Number(findCurrentStock.balance),
                                            count_adjust_stock: Number(instance.previous('amount')) - Number(instance.get('amount')),
                                            count_current_stock: Number(findCurrentStock.balance) + (Number(instance.previous('amount')) - Number(instance.get('amount')))
                                        },
                                        userData: {
                                            created_by: instance.get('updated_by'),
                                            created_date: instance.get('updated_date')
                                        },
                                        detailsData: {
                                            reasons: 'Edit',
                                            documentType: options?.metaData__ShopInventoryMovementLog?.details?.documentType || 'JOB'
                                        },
                                        options: {
                                            transaction: transaction,
                                            ShopModels: ShopModels
                                        }
                                    }];
                                }
                                else if (
                                    instance.changed('amount')
                                    || instance.changed('shop_product_id')
                                    || instance.changed('shop_warehouse_id')
                                    || instance.changed('shop_warehouse_shelf_item_id')
                                    || instance.changed('purchase_unit_id')
                                    || instance.changed('dot_mfd')
                                ) {
                                    options.objToCreateShopInventoryMovementLogs = [
                                        {
                                            documentData: {
                                                document_service_order: {
                                                    shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                                                    shop_service_order_list_id: instance.get('id')
                                                }
                                            },
                                            stockData: {
                                                shop_product_id: findPreviousStock.shop_product_id,
                                                shop_stock_id: findPreviousStock.shop_stock_id,
                                                shop_warehouse_id: findPreviousStock.shop_warehouse_id,
                                                shop_warehouse_shelf_item_id: findPreviousStock.shop_warehouse_shelf_item_id,
                                                purchase_unit_id: findPreviousStock.purchase_unit_id,
                                                dot_mfd: findPreviousStock.dot_mfd,
                                                count_previous_stock: Number(findPreviousStock.balance),
                                                count_adjust_stock: Number(instance.previous('amount')),
                                                count_current_stock: Number(findPreviousStock.balance) + Number(instance.previous('amount'))
                                            },
                                            userData: {
                                                created_by: instance.get('updated_by'),
                                                created_date: instance.get('updated_date')
                                            },
                                            detailsData: {
                                                reasons: 'Edit',
                                                documentType: options?.metaData__ShopInventoryMovementLog?.details?.documentType || 'JOB'
                                            },
                                            options: {
                                                transaction: transaction,
                                                ShopModels: ShopModels
                                            }
                                        },
                                        {
                                            documentData: {
                                                document_service_order: {
                                                    shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                                                    shop_service_order_list_id: instance.get('id')
                                                }
                                            },
                                            stockData: {
                                                shop_product_id: findCurrentStock.shop_product_id,
                                                shop_stock_id: findCurrentStock.shop_stock_id,
                                                shop_warehouse_id: findCurrentStock.shop_warehouse_id,
                                                shop_warehouse_shelf_item_id: findCurrentStock.shop_warehouse_shelf_item_id,
                                                purchase_unit_id: findCurrentStock.purchase_unit_id,
                                                dot_mfd: findCurrentStock.dot_mfd,
                                                count_previous_stock: Number(findCurrentStock.balance),
                                                count_adjust_stock: Number(instance.get('amount')) * (-1),
                                                count_current_stock: Number(findCurrentStock.balance) + (Number(instance.get('amount')) * (-1))
                                            },
                                            userData: {
                                                created_by: instance.get('updated_by'),
                                                created_date: instance.get('updated_date')
                                            },
                                            detailsData: {
                                                reasons: 'Edit',
                                                documentType: options?.metaData__ShopInventoryMovementLog?.details?.documentType || 'JOB'
                                            },
                                            options: {
                                                transaction: transaction,
                                                ShopModels: ShopModels
                                            }
                                        }
                                    ];
                                }
                            }
                        }
                    }

                    return;
                }

                throw new Error(`Test: Blocked!`)
            }
        };

        /**
         * @param {ShopServiceOrderList} instance
         * @param {import("sequelize/types/model").SaveOptions<ShopServiceOrderList>} options
         * @return {Promise<void>}
         */
        const hookAfterSave_mutationShopInventoryMovementLog = async (instance, options) => {
            if (instance.isNewRecord && instance.get('is_migrated')) { return; }

            const transaction = options?.transaction || null;

            if (options?.objToCreateShopInventoryMovementLogs && !options?.skipCreateShopInventoryMovementLog) {
                await instance.reload({ transaction: transaction, ShopModels: ShopModels });

                options.createdDocument__ShopInventoryMovementLogs = [];
                for (let index = 0; index < options.objToCreateShopInventoryMovementLogs.length; index++) {
                    options.createdDocument__ShopInventoryMovementLogs.push(await ShopInventoryMovementLog.createInventoryMovementLog(
                        instance.get('shop_id'),
                        {
                            document_service_order: {
                                shop_service_order_doc_id: options.objToCreateShopInventoryMovementLogs[index]?.documentData?.document_service_order?.shop_service_order_doc_id,
                                shop_service_order_list_id: instance.get('id')
                            }
                        },
                        options.objToCreateShopInventoryMovementLogs[index]?.stockData,
                        options.objToCreateShopInventoryMovementLogs[index]?.userData,
                        options.objToCreateShopInventoryMovementLogs[index]?.detailsData,
                        options.objToCreateShopInventoryMovementLogs[index]?.options
                    ));
                }

                instance.createdDocument__ShopInventoryMovementLogs = options.createdDocument__ShopInventoryMovementLogs;
            }
        };

        return {
            hookBeforeValidate_serializerDOT,
            hookBeforeSave_validatorShopServiceOrderDoc,
            hookBeforeSave_mutationField__details,
            hookBeforeSave_mutationShopStock,
            hookAfterSave_mutationShopInventoryMovementLog
        };
    };

    ShopServiceOrderList.beforeValidate((instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        instance.myHookFunctions.hookBeforeValidate_serializerDOT(instance, options);
    });

    ShopServiceOrderList.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_validatorShopServiceOrderDoc(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationShopStock(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__details(instance, options);
    });

    ShopServiceOrderList.afterSave(async (instance, options) => {
        await instance.myHookFunctions.hookAfterSave_mutationShopInventoryMovementLog(instance, options);
    });

    return ShopServiceOrderList;
};


module.exports = ShopServiceOrderList;