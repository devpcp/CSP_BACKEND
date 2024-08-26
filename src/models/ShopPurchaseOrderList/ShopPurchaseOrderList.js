/**
 * A function do dynamics table of model ShopPurchaseOrderList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_purchase_order_list"
 * @return An instance of model ShopPurchaseOrderList by sequelize
 */
const ShopPurchaseOrderList = (table_name = '') => {
    if (!table_name) { throw Error(`Require parameter 'table_name'`); }
    else {
        table_name = table_name.toLowerCase();

        const Model = require("sequelize").Model;
        const { DataTypes, literal, Transaction } = require("sequelize");

        const db = require("../../db");

        const _ = require("lodash");
        const toCurrency = require("../../utils/util.toCurrency");

        const modelUser = require("../model").User;
        const modelShopProfile = require("../model").ShopsProfiles;
        const modelProductPurchaseUnitTypes = require("../model").ProductPurchaseUnitTypes;
        const modelShopPurchaseOrderDoc = require("../model").ShopPurchaseOrderDoc(table_name);
        const modelShopProduct = require("../model").ShopProduct(table_name);

        class ShopPurchaseOrderList extends Model { }

        ShopPurchaseOrderList.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: literal(`uuid_generate_v4()`),
                allowNull: false,
                primaryKey: true,
                comment: `รหัสหลักตารางข้อมูลรายการใบสั่งซื้อ PurchaseOrder List (PO List)`
            },
            shop_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfile,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลร้านค้า\n`
                    + `Foreign key: app_datas.dat_shops_profiles.id`,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            doc_purchase_order_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopPurchaseOrderDoc,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลเอกสารใบสั่งซื้อ\n`
                    + `Foreign key: app_shops_datas.dat_${table_name}_purchase_order_doc.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            seq_number: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: `ลำดับรายการ`
            },
            product_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProduct,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลรายการสินค้าในร้านค้า\n`
                    + `Foreign key: app_shops_datas.dat_${table_name}_products.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            purchase_unit_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelProductPurchaseUnitTypes,
                    key: 'id'
                },
                comment: `รหัสตารางข้อมูลประเภทหน่วยซื้อ\n`
                    + `Foreign key: master_lookup.mas_product_purchase_unit_types.id`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            dot_mfd: {
                type: DataTypes.CHAR(4),
                allowNull: true,
                comment: `รหัสวันที่ผลิต (DOT)`
            },
            amount: {
                type: DataTypes.BIGINT,
                allowNull: false,
                defaultValue: 0,
                comment: `จำนวนสินค้า`
            },
            price_unit: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: `ราคาต่อหน่วย`
            },
            price_discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: `ส่วนลด (บาท)`
            },
            price_discount_percent: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: `ส่วนลด (%)`
            },
            price_grand_total: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: `จำนวนเงินสุทธิ`
            },
            details: {
                type: DataTypes.JSONB,
                allowNull: false,
                comment: 'รายละเอียดเพิ่มเติมของรายการเก็บเป็น JSON'
            },
            status: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: literal(`1`),
                validate: {
                    isIn: [[0, 1]]
                },
                comment: `สถานะรายการ 0 = ลบรายการ, 1 = ใช้งานรายการ`
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal(`now()`),
                comment: `สร้างข้อมูลวันที่`
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelUser,
                    key: 'id'
                },
                comment: `สร้างข้อมูลโดย`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            updated_date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
                comment: `ปรับปรุงข้อมูลวันที่`
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelUser,
                    key: 'id'
                },
                comment: `ปรับปรุงข้อมูลโดย`,
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
        }, {
            sequelize: db,
            modelName: 'ShopPurchaseOrderList',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_purchase_order_list`,
            comment: 'ตารางข้อมูลรายการใบสั่งซื้อ PurchaseOrder List (PO List)',
            timestamps: false,
        });

        /**
         * @param {ShopPurchaseOrderList} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const dotSerializer = async (instance, options) => {
            if (instance.getDataValue('dot_mfd') === '') {
                instance.set('dot_mfd', null);
            }
        };

        /**
         * @param {ShopPurchaseOrderList} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const dotValidator = async (instance, options) => {
            if (!_.isString(instance.get('dot_mfd')) && !_.isNull(instance.get('dot_mfd'))) {
                throw Error(`ShopPurchaseOrderList: Variable dot_mfd is String DOT type or Null, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (_.isString(instance.get('dot_mfd'))) {
                if ((/^[0-9]{1,4}$/).test(instance.get('dot_mfd')) === false) {
                    throw Error(`ShopPurchaseOrderList: Variable 'dot_mfd' is String DOT type, instanceData: ${JSON.stringify(instance.toJSON())}`);
                }
            }
        };

        /**
         * @param {ShopPurchaseOrderList} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const priceSerializer = async (instance, options) => {
            if (_.isUndefined(instance.getDataValue('amount'))) {
                throw Error(`ShopPurchaseOrderList: Variable 'amount' is undefined, error from function priceSerializer, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (_.isUndefined(instance.getDataValue('price_unit'))) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_unit' is undefined, error from function priceSerializer, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (_.isUndefined(instance.getDataValue('price_discount')) && _.isUndefined(instance.getDataValue('price_discount_percent'))) {
                instance.set('price_discount', 0);
                instance.set('price_discount_percent', 0);
            }
            if (_.isUndefined(instance.getDataValue('price_discount')) && !_.isUndefined(instance.getDataValue('price_discount_percent'))) {
                // Find price_discount

            }
            if (!_.isUndefined(instance.getDataValue('price_discount')) && _.isUndefined(instance.getDataValue('price_discount_percent'))) {
                // Find price_discount_percent
                const amount = toCurrency(instance.getDataValue('amount'));
                const price_unit = Number(instance.getDataValue('price_unit'));
                const price_discount = toCurrency(instance.getDataValue('price_discount'));
                const price_discount_percent = amount
                    .multiply(price_unit)
                    .divide(price_discount)
                    .multiply(100);
                instance.set('price_discount_percent', price_discount_percent.value);
            }

            instance.set('amount', Number(instance.getDataValue('amount')));
            instance.set('price_unit', Number(instance.getDataValue('price_unit')));
            instance.set('price_discount', Number(instance.getDataValue('price_discount')));
            instance.set('price_discount_percent', Number(instance.getDataValue('price_discount_percent')));

            if (_.isUndefined(instance.getDataValue('price_grand_total'))) {
                const amount = Number(instance.getDataValue('amount'));
                const price_unit = Number(instance.getDataValue('price_unit'));
                const price_discount = Number(instance.getDataValue('price_discount'));

            }

            instance.set('price_grand_total', Number(instance.getDataValue('price_grand_total')));
        };

        /**
         * @param {ShopPurchaseOrderList} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const priceValidator = async (instance, options) => {
            /**
             * จำนวน
             * @type {number}
             */
            const amount = instance.get('amount');
            if (!_.isSafeInteger(amount)) {
                throw Error(`ShopPurchaseOrderList: Variable 'amount' must be Number SafeInteger type, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (amount < 0) {
                throw Error(`ShopPurchaseOrderList: Variable 'amount' must be more than or equal 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }

            /**
             * ราคาต่อหน่วย
             * @type {number}
             */
            const price_unit = instance.get('price_unit');
            if (!_.isFinite(price_unit)) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_unit' must be Number type, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (price_unit < 0) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_unit' must be more than or equal 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }

            /**
             * ส่วนลด (บาท)
             * @type {number}
             */
            const price_discount = instance.get('price_discount');
            if (!_.isFinite(price_discount)) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_discount' must be Number type, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (price_discount < 0) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_discount' must be more than or equal 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }

            /**
             * ส่วนลด (%)
             * @type {number}
             */
            const price_discount_percent = instance.get('price_discount_percent');
            if (!_.isFinite(price_discount_percent)) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_discount_percent' must be Number type, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (price_discount_percent < 0) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_discount_percent' must be more than or equal 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }

            /**
             * จำนวนเงิน
             * @type {number}
             */
            const price_grand_total = instance.get('price_grand_total');
            if (!_.isFinite(price_grand_total)) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_grand_total' must be Number type, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
            if (price_grand_total < 0) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_grand_total' must be more than or equal 0, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }

            /**
             * จำนวน
             */
            const currency__amount = toCurrency(amount);
            /**
             * ราคาต่อหน่วย
             */
            const currency__price_unit = toCurrency(price_unit);
            /**
             * ส่วนลด (บาท)
             */
            const currency__price_discount = toCurrency(price_discount);
            /**
             * ส่วนลด (%)
             */
            const number__price_discount_percent = Number(price_discount_percent.toFixed(2));
            /**
             * จำนวนเงิน
             */
            const currency__price_grand_total = toCurrency(price_grand_total);

            // const cal__price_discount = currency__price_unit
            //     .multiply(number__price_discount_percent * 100);
            // if (cal__price_discount.value !== currency__price_discount.value) {
            //     throw Error(`ShopPurchaseOrderList: Variable 'price_discount' is error from priceValidator, instanceData: ${JSON.stringify(instance.toJSON())}`);
            // }
            //
            // const cal__price_discount_percent = currency__price_discount
            //     .divide(currency__price_unit)
            //     .multiply(100);
            // if (cal__price_discount_percent.value !== number__price_discount_percent) {
            //     throw Error(`ShopPurchaseOrderList: Variable 'price_discount_percent' is error from priceValidator, instanceData: ${JSON.stringify(instance.toJSON())}`);
            // }

            const cal__price_grand_total = currency__amount
                .multiply(currency__price_unit)
                .subtract(currency__price_discount);
            if (cal__price_grand_total.value !== currency__price_grand_total.value) {
                throw Error(`ShopPurchaseOrderList: Variable 'price_grand_total' is error from priceValidator, instanceData: ${JSON.stringify(instance.toJSON())}`);
            }
        };

        /**
         * @param {ShopPurchaseOrderList | ShopPurchaseOrderList[]} instance
         * @param {import("sequelize/types/model").SaveOptions} options
         */
        const seqNumberSerializer = async (instance, options) => {
            if (_.isArray(instance)) {
                if (instance.filter(w => w.isNewRecord).length === instance.length) {
                    const findAnomalySeqNumber = instance.filter(
                        w => !_.isSafeInteger(w.getDataValue('seq_number')
                            || w.getDataValue('seq_number') <= 0
                        )
                    );
                    if (findAnomalySeqNumber.length > 0) {
                        for (let i = 0; i < instance.length; i++) {
                            instance[i].set('seq_number', i + 1);
                        }
                    }
                }
            }
        };

        /**
         * @param {ShopPurchaseOrderList | ShopPurchaseOrderList[]} instance
         * @param {import("sequelize/types/model").SaveOptions} options
         */
        const seqNumberValidator = async (instance, options) => {
            if (_.isArray(instance)) {
                if (instance.filter(w => w.isNewRecord).length === instance.length) {
                    const duplicatedSeqNumber = instance
                        .reduce(
                            (previousValue, currentValue) => {
                                const findDuplication = previousValue.findIndex(w => w === currentValue.get('seq_number'));
                                if (findDuplication === -1) {
                                    previousValue.push(currentValue.get('seq_number'));
                                    return previousValue;
                                }
                                else {
                                    return previousValue;
                                }
                            }
                            ,
                            /**
                             * @type Number[]
                             */
                            []
                        );
                    if (duplicatedSeqNumber.length !== instance.length) {
                        throw Error(`ShopPurchaseOrderList: Variable 'seq_number' must be unique, due from create new record, instanceData: ${JSON.stringify(instance.map(w => w.toJSON()))}`);
                    }
                }
            }
            else {
                if (instance.isNewRecord) {
                    await db.transaction(
                        {
                            transaction: options.transaction,
                            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                        },
                        async (transaction) => {
                            const findShopPurchaseOrderLists = await ShopPurchaseOrderList.findAll({
                                where: {
                                    doc_purchase_order_id: instance.get('doc_purchase_order_id'),
                                },
                                transaction: transaction
                            });
                            instance.set('seq_number', findShopPurchaseOrderLists.length + 1);
                        }
                    );
                }
            }
        };

        ShopPurchaseOrderList.beforeBulkCreate(async (instances, options) => {
            if (instances.filter(w => w.isNewRecord).length > 0) {
                // await seqNumberSerializer(instances, options);
                // await seqNumberValidator(instances, options);
                for (let i = 0; i < instances.length; i++) {
                    const instance = instances[i];

                    await dotSerializer(instance, options);
                    await dotValidator(instance, options);

                    // await priceSerializer(instance, options);
                    // await priceValidator(instance, options);
                }
            }
        });

        ShopPurchaseOrderList.belongsTo(modelShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
        ShopPurchaseOrderList.belongsTo(modelShopPurchaseOrderDoc, { foreignKey: 'doc_purchase_order_id', as: 'ShopPurchaseOrderDoc' });
        ShopPurchaseOrderList.belongsTo(modelShopProduct, { foreignKey: 'product_id', as: 'ShopProduct' });
        ShopPurchaseOrderList.belongsTo(modelProductPurchaseUnitTypes, { foreignKey: 'purchase_unit_id', as: 'ProductPurchaseUnitType' });
        ShopPurchaseOrderList.belongsTo(modelUser, { foreignKey: 'created_by', as: 'CreatedByUser' });
        ShopPurchaseOrderList.belongsTo(modelUser, { foreignKey: 'updated_by', as: 'UpdatedByUser' });

        return ShopPurchaseOrderList;
    }
};

module.exports = ShopPurchaseOrderList;