/**
 * A function do dynamics table of model ShopTaxInvoiceList
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_tax_invoice_list"
 */
const ShopTaxInvoiceList = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const { isUUID } = require("../../utils/generate");
    const utilProportionDiscountCalculator = require("../../utils/util.ProportionDiscountCalculator");

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Op } = require("sequelize");

    const db = require("../../db");

    const {
        User: Users,
        ShopsProfiles: ShopProfile,
        ProductPurchaseUnitTypes: ProductPurchaseUnitType
    } = require("../model");
    const ShopProduct = require("../model").ShopProduct(table_name);
    const ShopWarehouse = require("../model").ShopWarehouse(table_name);
    const ShopStock = require("../model").ShopStock(table_name);
    const ShopServiceOrderList = require("../model").ShopServiceOrderList(table_name);
    const ShopTaxInvoiceDoc = require("../model").ShopTaxInvoiceDoc(table_name);

    class ShopTaxInvoiceList extends Model {
        /**
         * สร้างรายการใบกำกับภาษี
         * @param shop_tax_invoice_doc_id {string} รหัสหลักตารางข้อมูลเอกสารใบกำกับภาษี
         * @param options {{ created_by: string; created_date: Date; currentDateTime: Date; ShopModels?: Object; transaction: import("sequelize").Transaction }}
         * @return {Promise<Array<ShopTaxInvoiceList>>}
         */
        static async createFromShopTaxInvoiceDoc(shop_tax_invoice_doc_id, options = {}) {
            if (!shop_tax_invoice_doc_id) { throw new Error(`Require parameter 'shop_tax_invoice_doc_id'`); }

            const currentDateTime = options?.currentDateTime || new Date();
            const transaction = options?.transaction || null;
            const ShopModels = options?.ShopModels || require("../model").initShopModel(table_name);

            const {
                ShopServiceOrderDoc,
                ShopServiceOrderList,
                ShopTaxInvoiceDoc,
                ShopTaxInvoiceList
            } = ShopModels;

            const findShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                where: {
                    id: shop_tax_invoice_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (!findShopTaxInvoiceDoc) {
                throw new Error(`ไม่พบข้อมูลเอกสารใบกำกับภาษี`);
            }
            if (findShopTaxInvoiceDoc.get('status') !== 1) {
                throw new Error(`ไม่อณุญาตให้สร้างข้อมูลรายการใบกำกับภาษีเนื่องจากเอกสารใบกำกับภาษีได้ยกเลิกหรือลบไปแล้ว`);
            }
            if (!isUUID(findShopTaxInvoiceDoc.get('shop_service_order_doc_id'))) {
                throw new Error(`รหัสอ้างอิงเอกสารใบสั่งซ่อมของเอกสารใบส่งสินค้าชั่วคราวไม่ถูกต้อง`);
            }

            const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                where: {
                    id: findShopTaxInvoiceDoc.get('shop_service_order_doc_id')
                },
                transaction: transaction,
                ShopModels: ShopModels
            })
            if (!findShopServiceOrderDoc) {
                throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม`);
            }
            if (findShopServiceOrderDoc.get('status') !== 1) {
                throw new Error(`ไม่อณุญาตให้สร้างข้อมูลรายการใบกำกับภาษีเนื่องจากเอกสารใบสั่งซ่อมได้ยกเลิกหรือลบไปแล้ว`);
            }

            const findShopServiceOrderList = await ShopServiceOrderList.findAll({
                where: {
                    shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                    status: 1
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            /**
             * @type {Array<ShopTaxInvoiceList>}
             */
            const arrCreatedShopTaxInvoiceLists = [];
            for (let index = 0; index < findShopServiceOrderList.length; index++) {
                const element = findShopServiceOrderList[index];
                const createdShopTaxInvoiceList = await ShopTaxInvoiceList.create(
                    {
                        shop_id: findShopTaxInvoiceDoc.get('shop_id'),
                        shop_tax_invoice_doc_id: findShopTaxInvoiceDoc.get('id'),
                        shop_service_order_list_id: element.get('id'),
                        seq_number: element.get('seq_number'),
                        shop_product_id: element.get('shop_product_id'),
                        shop_stock_id: element.get('shop_stock_id'),
                        shop_warehouse_id: element.get('shop_warehouse_id'),
                        shop_warehouse_shelf_item_id: element.get('shop_warehouse_shelf_item_id'),
                        purchase_unit_id: element.get('purchase_unit_id'),
                        dot_mfd: element.get('dot_mfd'),
                        amount: element.get('amount'),
                        cost_unit: element.get('cost_unit'),
                        price_unit: element.get('price_unit'),
                        price_discount: element.get('price_discount'),
                        price_discount_percent: element.get('price_discount_percent'),
                        price_grand_total: element.get('price_grand_total'),
                        details: element.get('details'),
                        created_by: options?.created_by || findShopServiceOrderDoc.get('created_by'),
                        created_date: options?.created_date || currentDateTime,
                    },
                    {
                        transaction: transaction,
                        ShopModels: ShopModels
                    }
                );
                arrCreatedShopTaxInvoiceLists.push(createdShopTaxInvoiceList);
            }

            return arrCreatedShopTaxInvoiceLists;
        }
        /**
         * ปรับปรุงขฟิวส้อมูลส่วนลดตามสัดส่วน
         * @param shop_tax_invoice_doc_id {string}
         * @param options {{ ShopModels: Object; transaction: import("sequelize").Transaction; }}
         */
        static async mutationFields__ProportionDiscount(shop_tax_invoice_doc_id, options = {}) {
            if (!shop_tax_invoice_doc_id) { throw new Error(`Require parameter 'shop_service_order_doc_id'`); }

            const transaction = options.transaction || null;
            const ShopModels = options?.ShopModels || require("../model").initShopModel(table_name);
            const {
                ShopTaxInvoiceDoc,
                ShopTaxInvoiceList
            } = ShopModels;

            const findDoc = await ShopTaxInvoiceDoc.findOne({
                where: {
                    id: shop_tax_invoice_doc_id
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (findDoc) {
                const price_bill_discount_total = (Number(findDoc.get('price_discount_bill') || 0) + Number(findDoc.get('price_discount_before_pay') || 0)).toFixed(2);

                const findLists = await ShopTaxInvoiceList.findAll({
                    where: {
                        shop_tax_invoice_doc_id: shop_tax_invoice_doc_id,
                        price_grand_total: { [Op.gte]: 0 },
                        status: 1
                    },
                    order: [['seq_number', 'ASC']],
                    transaction: transaction,
                    ShopModels: ShopModels
                });

                /**
                 * @type {{lists: {seq_number: string, proportion_discount_price: string, proportion_discount_ratio: string, objModel: ShopTaxInvoiceList, price_grand_total: string}[], price_bill_discount: string}}
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

    ShopTaxInvoiceList.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบส่งสินค้าชั่วคราว`,
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
            shop_tax_invoice_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบกำกับภาษี`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopTaxInvoiceDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            shop_service_order_list_id: {
                comment: `รหัสหลักตารางข้อมูลรายการใบสั่งซ่อม`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: ShopServiceOrderList,
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
            }
        },
        {
            sequelize: db,
            modelName: 'ShopTaxInvoiceList',
            tableName: `dat_${table_name}_tax_invoice_list`,
            schema: 'app_shops_datas',
            timestamps: false,
            comment: 'ตารางข้อมูลรายการใบกำกับภาษี'
        }
    );

    ShopTaxInvoiceList.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopTaxInvoiceList.belongsTo(ShopTaxInvoiceDoc, { foreignKey: 'shop_tax_invoice_doc_id', as: 'ShopTaxInvoiceDoc' });
    ShopTaxInvoiceList.belongsTo(ShopServiceOrderList, { foreignKey: 'shop_service_order_list_id', as: 'ShopServiceOrderList' });
    ShopTaxInvoiceList.belongsTo(ShopProduct, { foreignKey: 'shop_product_id', as: 'ShopProduct' });
    ShopTaxInvoiceList.belongsTo(ShopWarehouse, { foreignKey: 'shop_stock_id', as: 'ShopStock' });
    ShopTaxInvoiceList.belongsTo(ShopWarehouse, { foreignKey: 'shop_warehouse_id', as: 'ShopWarehouse' });
    ShopTaxInvoiceList.belongsTo(ProductPurchaseUnitType, { foreignKey: 'purchase_unit_id', as: 'ProductPurchaseUnitType' });
    ShopTaxInvoiceList.belongsTo(Users, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopTaxInvoiceList.belongsTo(Users, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (ShopModels = null) => {
        const {
            ShopServiceOrderList
        } = ShopModels || require("../model").initShopModel(table_name);

        /**
         * @param {ShopTaxInvoiceList} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const hookBeforeSave_mutationDetailsMetaData = async (instance, options) => {
            const transaction = options?.transaction || null;

            if (instance.isNewRecord) {
                const findShopServiceOrderList = await ShopServiceOrderList.findOne({
                    where: {
                        id: instance.get('shop_service_order_list_id')
                    },
                    transaction: transaction
                });
                if (!findShopServiceOrderList) {
                    throw new Error(`ไม่พบข้อมูลรายการใบสั่งซ่อม`);
                }
                if (findShopServiceOrderList.get('status') !== 1) {
                    throw new Error(`ไม่อนุญาตปรับปรุง Meta data ของรายการใบกำกับภาษีเนื่องจากรายการใบสั่งซ่อมได้ถูกยกเลิกหรือลบไปแล้ว`);
                }

                const objDetails = {
                    ...(findShopServiceOrderList.get('details') || {}),
                    ...(instance.get('details') || {}),
                    meta_data: {
                        ...((findShopServiceOrderList.get('details') || {})?.meta_data || {}),
                    }
                };

                instance.set({
                    details: objDetails
                });
            }
        };

        return {
            hookBeforeSave_mutationDetailsMetaData
        };
    };

    ShopTaxInvoiceList.beforeValidate((instance, options) => {
        instance.myHookFunctions = hookFunctions(options?.ShopModels);
    });

    ShopTaxInvoiceList.beforeSave(async (instance, options) => {
        // if (!instance.isNewRecord && instance.changed()) {
        //     throw new Error(`ไม่อนุญาตให้แก้ไขรายการใบกำกับภาษี`);
        // }

        await instance.myHookFunctions.hookBeforeSave_mutationDetailsMetaData(instance, options);
    });

    return ShopTaxInvoiceList;
};


module.exports = ShopTaxInvoiceList;