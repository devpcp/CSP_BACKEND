/**
 * A function do dynamics table of model ShopPaymentTransaction
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_payment_transaction"
 */
const ShopPaymentTransaction = (table_name) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    /**
     * @type {import("@types/lodash")}
     */
    const _ = require("lodash");
    const currencyJS = require("currency.js");
    const optionsCurrencyJS = {
        symbol: ''
    };
    const { isUUID } = require("../../utils/generate");
    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Op } = require("sequelize");

    const db = require("../../db");

    const __model = require("../model");
    const User = __model.User;
    const ShopProfile = __model.ShopsProfiles;
    const DocumentType = __model.DocumentTypes;
    const BankNameList = __model.BankNameList;
    const ShopDocumentCode = __model.ShopDocumentCode(table_name);
    const ShopServiceOrderDoc = __model.ShopServiceOrderDoc(table_name);
    const ShopTemporaryDeliveryOrderDoc = __model.ShopTemporaryDeliveryOrderDoc(table_name);
    const ShopTaxInvoiceDoc = __model.ShopTaxInvoiceDoc(table_name);
    const ShopCustomerDebtDoc = __model.ShopCustomerDebtDoc(table_name);
    const ShopInventoryTransaction = __model.ShopInventoryTransaction(table_name);
    const ShopPartnerDebtDoc = __model.ShopPartnerDebtDoc(table_name)

    const defaultPrefixDoc = 'PMT';
    const default_doc_type_code_id = 'PMT';

    class ShopPaymentTransaction extends Model { }

    ShopPaymentTransaction.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลการชำระเงิน`,
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
            shop_service_order_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopServiceOrderDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
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
            shop_tax_invoice_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบกำกับภาษี`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopTaxInvoiceDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_customer_debt_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารลูกหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopCustomerDebtDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_inventory_transaction_id: {
                comment: `รหัสหลักตารางข้อมูลใบนำเข้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopInventoryTransaction,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            shop_partner_debt_doc_id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารเจ้าหนี้การค้า`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopPartnerDebtDoc,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            bank_name_list_id: {
                comment: `รหัสหลักตารางข้อมูลธนาคาร`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: BankNameList,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            payment_method: {
                comment: 'ช่องทางชำระเงิน' +
                    '\n- 0 ไม่ทราบช่องทางชำระเงิน' +
                    '\n- 1 เงินสด' +
                    '\n- 2 บัตรเครดิต' +
                    '\n- 3 เงินโอน' +
                    '\n- 4 เช็คเงินสด' +
                    '\n- 5 บันทึกเป็นลูกหนี้การค้า จากใบสั่งซ่อม/ใบสั่งขาย (เท่านั้น)' +
                    '\n- 6 บันทึกเป็นเจ้าหนี้การค้า จากใบนำเข้า (เท่านั้น)',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[0, 1, 2, 3, 4, 5, 6]]
                }
            },
            payment_status: {
                comment: 'สถาณะชำระเงิน' +
                    '\n0 = รอชำระเงิน' +
                    '\n1 = ชำระเงินสำเร็จ' +
                    '\n2 = ชำระเงินไม่สำเร็จ',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2]]
                }
            },
            payment_price_grand_total: {
                comment: `จำนวนเงินจากเอกสารใบสั่งซ่อม/ใบสั่งขาย หรือจากเอกสารลูกหนี้การค้า`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            payment_price_paid: {
                comment: `จำนวนเงินที่จะชำระ`,
                type: DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            payment_paid_date: {
                comment: `วันที่ชำระเงิน`,
                type: DataTypes.DATE,
                allowNull: true
            },
            payment_payee_by: {
                comment: `ผู้รับชำระเงิน`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: User,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            is_partial_payment: {
                comment: `เป็น Partial Payment หรือไม่`,
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            canceled_payment_by: {
                comment: `ผู้ยกเลิกชำระเงิน`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: User,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            canceled_payment_date: {
                comment: `วันที่ยกเลิกชำระเงิน`,
                type: DataTypes.DATE,
                allowNull: true
            },
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    ref_doc: '',
                    meta_data: {
                    }
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
            modelName: 'ShopPaymentTransaction',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_payment_transaction`,
            comment: 'ตารางข้อมูลการชำระเงิน',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_pmt_trx_code_id`,
                    fields: ['code_id']
                },
                {
                    name: `idx_${table_name}_pmt_trx_shop_service_order_doc_id`,
                    fields: ['shop_service_order_doc_id']
                },
                {
                    name: `idx_${table_name}_pmt_trx_shop_temporary_delivery_order_doc_id`,
                    fields: ['shop_temporary_delivery_order_doc_id']
                },
                {
                    name: `idx_${table_name}_pmt_trx_shop_tax_invoice_doc_id`,
                    fields: ['shop_tax_invoice_doc_id']
                },
                {
                    name: `idx_${table_name}_pmt_trx_shop_customer_debt_doc_id`,
                    fields: ['shop_customer_debt_doc_id']
                },
                {
                    name: `idx_${table_name}_pmt_trx_shop_inventory_transaction_id`,
                    fields: ['shop_inventory_transaction_id']
                },
                {
                    name: `idx_${table_name}_pmt_trx_shop_partner_debt_doc_id`,
                    fields: ['shop_partner_debt_doc_id']
                }
            ]
        }
    );

    ShopPaymentTransaction.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopPaymentTransaction.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentTypes' });
    ShopPaymentTransaction.belongsTo(ShopServiceOrderDoc, { foreignKey: 'shop_service_order_doc_id', as: 'ShopServiceOrderDoc' });
    ShopPaymentTransaction.belongsTo(ShopTemporaryDeliveryOrderDoc, { foreignKey: 'shop_temporary_delivery_order_doc_id', as: 'ShopTemporaryDeliveryOrderDoc' });
    ShopPaymentTransaction.belongsTo(ShopTaxInvoiceDoc, { foreignKey: 'shop_tax_invoice_doc_id', as: 'ShopTaxInvoiceDoc' });
    ShopPaymentTransaction.belongsTo(ShopCustomerDebtDoc, { foreignKey: 'shop_customer_debt_doc_id', as: 'ShopCustomerDebtDoc' });
    ShopPaymentTransaction.belongsTo(ShopInventoryTransaction, { foreignKey: 'shop_inventory_transaction_id', as: 'ShopInventoryTransaction' });
    ShopPaymentTransaction.belongsTo(ShopPartnerDebtDoc, { foreignKey: 'shop_partner_debt_doc_id', as: 'ShopPartnerDebtDoc' });
    ShopPaymentTransaction.belongsTo(BankNameList, { foreignKey: 'bank_name_list_id', as: 'BankNameList' });
    ShopPaymentTransaction.belongsTo(User, { foreignKey: 'canceled_payment_by', as: 'CanceledPaymentBy' });
    ShopPaymentTransaction.belongsTo(User, { foreignKey: 'payment_payee_by', as: 'PaymentPayeeBy' });
    ShopPaymentTransaction.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopPaymentTransaction.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || require("../model").initShopModel(table_name);
        const {
            ShopServiceOrderDoc,
            ShopTemporaryDeliveryOrderDoc,
            ShopTaxInvoiceDoc,
            ShopPaymentTransaction,
            ShopCustomerDebtDoc,
            ShopCustomerDebtList,
            ShopPartnerDebtDoc
        } = ShopModels;

        /**
         * ตรวจสอบไม่ใช้ข้อมูล ใบสั่งซ่อม/ใบสั่งขาย กับ ลูกหนี้การค้า มีแค่อย่างใดอย่างหนึ่งเท่านั้นในเอกสารเดียวกัน
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_isDocumentIdValid = async (instance, options) => {

            if ((instance.get('shop_service_order_doc_id') ? 1 : 0) + (instance.get('shop_customer_debt_doc_id') ? 1 : 0) +
                (instance.get('shop_inventory_transaction_id') ? 1 : 0) + (instance.get('shop_partner_debt_doc_id') ? 1 : 0) != 1) {
                throw Error(`รหัสตารางข้อมูลเอกสารลูกหนี้การค้า, รหัสตารางข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขายและหัสตารางข้อมูลเอกสารใบนำเข้า จะต้องมีแค่อย่างใดอย่างหนึ่ง`);
            }

            if (instance.get('shop_customer_debt_doc_id') && instance.get('payment_method') === 5) {
                throw new Error(`เอกสารลูกหนี้การค้าไม่อนุญาตให้ชำระแบบลูกหนี้การค้าได้`);
            }

            if (instance.get('shop_partner_debt_doc_id') && instance.get('payment_method') === 6) {
                throw new Error(`เอกสารเจ้าหนี้การค้าไม่อนุญาตให้ชำระแบบลูกหนี้การค้าได้`);
            }

            // Validate document ช่องทางชำระเงินแบบลูกหนี้การค้า
            if (instance.get('shop_service_order_doc_id')
                && !instance.get('shop_customer_debt_doc_id')
                && instance.get('payment_method') === 5
            ) {
                if (instance.get('is_partial_payment')) {
                    throw new Error(`ระบบ Partial Payment ไม่รองรับช่องทางชำระเงินที่เป็นลูกหนี้การค้า`);
                }

                // ให้ตรวจสอบว่ามีการชำระเงินแบบลูกหนี้การค้ามาก่อนหน้านี้หรือไม่
                if (instance.isNewRecord) {
                    /**
                     * @type {import("sequelize").Transaction | null}
                     */
                    const transaction = options?.transaction || null;

                    const findShopPaymentTransaction = await ShopPaymentTransaction.findOne({
                        include: [
                            {
                                model: ShopServiceOrderDoc,
                                as: 'ShopServiceOrderDoc',
                                attributes: ['id', 'code_id']
                            }
                        ],
                        attributes: ['id', 'code_id'],
                        where: {
                            shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                            payment_status: 1,
                            canceled_payment_by: null,
                            canceled_payment_date: null
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (findShopPaymentTransaction) { throw new Error(`เอกสารลูกหนี้การค้านี้ มีการชำระเงินแบบลูกหนี้การค้าแล้ว ไม่สามารถชำระเงินแบบลูกหนี้การค้าได้อีก: เลขที่ใบสั่งซ่อม/ใบสั่งขาย (${findShopPaymentTransaction?.ShopServiceOrderDoc?.code_id}), เลขที่รายการชำระ (${findShopPaymentTransaction.get('code_id')})`); }
                }
            }
        };

        /**
         * Setter ทำให้ข้ามการ validate ของการสร้าง Running number ของเอกสาร
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDocRunNumber = async (instance, options) => {
            if (instance.isNewRecord) {
                instance.set({ code_id: 'PMT-XXXXXXXXX' });
            }
        };

        /**
         * สร้าง Running number ของเอกสาร
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
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
                        defaultPrefix: defaultPrefixDoc
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
         * Setter ชุดข้อมูลต่าง ๆ ลงไปในฟิวส์ details.meta_data
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookBeforeSave_mutationField_details__meta_data = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const objDetails = {
                ...(instance.get('details') || {}),
                meta_data: {
                    ...(instance.get('details')?.meta_data || {}),
                }
            };

            if (instance.isNewRecord || instance.changed('bank_name_list_id')) {
                if (isUUID(instance.get('bank_name_list_id'))) {
                    const findBankNameList = await BankNameList.findOne({
                        where: {
                            id: instance.get('bank_name_list_id')
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (!findBankNameList) {
                        throw new Error(`ไม่พบข้อมูลชื่อธนาคาร`);
                    }

                    objDetails.meta_data.BankNameList = {
                        id: findBankNameList.get('id'),
                        code_id: findBankNameList.get('code_id') || '',
                        internal_code_id: findBankNameList.get('internal_code_id') || '',
                        bank_name: findBankNameList.get('bank_name')?.th || '',
                        details: findBankNameList.get('details') || {}
                    };
                }
                else {
                    objDetails.meta_data.BankNameList = {};
                }
            }

            instance.set({
                details: objDetails
            });
        };

        /**
         * ปรับปรุงฟิวส์ "สถานะการชําระเงิน" (payment_paid_status) ของเอกสารใบสั่งซ่อม/ใบสั่งขาย (ShopServiceOrderDoc) ,เอกสารลูกหนี้การค้า (ShopCustomerDebtDoc) , เอกสารใบนำเข้า (ShopInventoryTransaction) หรือ เอกสารเจ้าหนี้ (ShopPartnerDebtDoc)
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookAfterSave_mutation_PaymentPaidStatus = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            // ชำระเงินจากเอกสารใบสั่งซ่อม/ใบสั่งขาย
            if (instance.get('shop_service_order_doc_id')) {
                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: instance.get('shop_service_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย`);
                }
                else {
                    await instance.reload({ transaction: transaction, ShopModels: ShopModels });

                    if (findShopServiceOrderDoc.get('payment_paid_status') !== 0) { // จะทำการปรับปรุงสถานะการชําระเงิน เมื่อสถานะการชําระเงินยังไม่ได้ยกเลิกชำระ (0)
                        /**
                         * ราคาของใบสั่งซ่อม/ใบสั่งขาย
                         */
                        const payment_price_grand_total = new currencyJS(findShopServiceOrderDoc.get('price_grand_total'), optionsCurrencyJS);

                        const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                            where: {
                                shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                                canceled_payment_by: null,
                                canceled_payment_date: null
                            },
                            order: [
                                [literal(`id = '${instance.get('id')}'`), 'DESC'],
                                [`created_date`, 'DESC']
                            ],
                            transaction: transaction
                        });
                        /**
                         * จำนวนที่จ่ายเงินไปแล้ว
                         */
                        const reduce__payment_price_paid = new currencyJS(
                            findShopPaymentTransactions.reduce(
                                (previousValue, currentValue) => {
                                    return previousValue + Number(currentValue.get('payment_price_paid'));
                                },
                                0
                            ),
                            optionsCurrencyJS
                        );

                        // รายการชำระเงินยังมีเหลืออยู่ ให้ตรวจสอบยอดที่ชำระไปแล้ว กับยอดที่ต้องชำระที่เหลือ
                        if (findShopPaymentTransactions.length > 0) {
                            const objSetUpdatedByAndDate = {
                                updated_by: findShopPaymentTransactions[0].get('updated_by'),
                                updated_date: findShopPaymentTransactions[0].get('updated_date')
                            };

                            if (findShopServiceOrderDoc.get('payment_paid_status') === 1) { // ใบสั่งซ่อม/ใบสั่งขาย เคยยังไม่ชำระ (1) ให้ปรับสถาณะเป็นค้างชำระ (2)
                                if (reduce__payment_price_paid.value < payment_price_grand_total.value) { // ใบสั่งซ่อม/ใบสั่งขาย เคยยังไม่ชำระ (1) เมื่อตรวจพบว่ายังจ่ายไม่ครบให้ปรับสถาณะชำระเงินเป็นค้างชำระ (2)
                                    findShopServiceOrderDoc.set({ payment_paid_status: 2 });
                                }
                                else if (reduce__payment_price_paid.value === payment_price_grand_total.value) { // ใบสั่งซ่อม/ใบสั่งขาย เคยยังไม่ชำระ (1) เมื่อตรวจพบว่าจ่ายครบแล้วให้ปรับสถาณะเป็นชําระแล้ว (3)
                                    findShopServiceOrderDoc.set({ payment_paid_status: 3 });
                                }
                                else {
                                    throw new Error(`ผลรวมการชำระเงินจะต้องน้อยกว่าหรือเท่ากับราคาชำระเงินของเอกสารใบสั่งซ่อม/ใบสั่งขาย`)
                                }
                            }

                            if (findShopServiceOrderDoc.get('payment_paid_status') === 2 || findShopServiceOrderDoc.get('payment_paid_status') === 3) { // ใบสั่งซ่อม/ใบสั่งขาย เคยชําระแล้ว (3) ให้ตรวจสอบ
                                if (reduce__payment_price_paid.value < payment_price_grand_total.value) { // ใบสั่งซ่อม/ใบสั่งขาย เคยชําระแล้ว (3) เมื่อตรวจพบว่ายังจ่ายไม่ครบให้ปรับสถาณะชำระเงินเป็นค้างชำระ (2)
                                    findShopServiceOrderDoc.set({ payment_paid_status: 2 });
                                }
                                else if (reduce__payment_price_paid.value === payment_price_grand_total.value) { // ใบสั่งซ่อม/ใบสั่งขาย เคยชําระแล้ว (3) เมื่อตรวจพบว่าจ่ายครบแล้วให้ปรับสถาณะเป็นชําระแล้ว (3)
                                    findShopServiceOrderDoc.set({ payment_paid_status: 3 });
                                }
                                else {
                                    throw new Error(`ผลรวมการชำระเงินจะต้องน้อยกว่าหรือเท่ากับราคาชำระเงินของเอกสารใบสั่งซ่อม/ใบสั่งขาย`)
                                }
                            }
                        }

                        // รายการชำระเงินไม่มีแล้ว ให้มีสถาณะการชำระเป็น ยังไม่ชำระ (1) ได้เลย
                        if (findShopPaymentTransactions.length === 0) { // ใบสั่งซ่อม/ใบสั่งขาย กรณีไม่มีรายการชำระ ให้ปรับสถาณะเป็นยังไม่ชำระ (1)
                            const objSetUpdatedByAndDate = instance.get('canceled_payment_by')
                                ? { updated_by: instance.get('canceled_payment_by'), updated_date: instance.get('canceled_payment_date') }
                                : { updated_by: findShopServiceOrderDoc.get('updated_by'), updated_date: findShopServiceOrderDoc.get('updated_date') };

                            findShopServiceOrderDoc.set({ payment_paid_status: 1 });
                        }

                        // กรณีเป็นการบันทึกลูกหนี้การค้า ให้ปรับสถาณะเอกสารใบสั่งซ่อม/ใบสั่งขาย เป็น ลูกหนี้การค้า (5)
                        if (instance.get('payment_method') === 5 && findShopPaymentTransactions.length > 0) {
                            findShopServiceOrderDoc.set({ payment_paid_status: 5 });
                        }

                        if (findShopServiceOrderDoc.changed('payment_paid_status')) {
                            await findShopServiceOrderDoc.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                        }
                    }
                }
            }
            // ชำระเงินจากเอกสารลูกหนี้การค้า
            else if (instance.get('shop_customer_debt_doc_id')) {
                const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                    where: {
                        id: instance.get('shop_customer_debt_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopCustomerDebtDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้การค้า`);
                }
                else {
                    await instance.reload({ transaction: transaction, ShopModels: ShopModels });

                    if (findShopCustomerDebtDoc.get('payment_paid_status') !== 0) { // จะทำการปรับปรุงสถานะการชําระเงิน เมื่อสถานะการชําระเงินยังไม่ได้ยกเลิกชำระ (0)
                        /**
                         * ราคาของใบสั่งซ่อม/ใบสั่งขาย
                         */
                        const payment_price_grand_total = new currencyJS(findShopCustomerDebtDoc.get('price_grand_total'), optionsCurrencyJS);

                        const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                            where: {
                                shop_customer_debt_doc_id: instance.get('shop_customer_debt_doc_id'),
                                canceled_payment_by: null,
                                canceled_payment_date: null
                            },
                            order: [
                                [literal(`id = '${instance.get('id')}'`), 'DESC'],
                                [`created_date`, 'DESC']
                            ],
                            transaction: transaction
                        });
                        /**
                         * จำนวนที่จ่ายเงินไปแล้ว
                         */
                        const reduce__payment_price_paid = new currencyJS(
                            findShopPaymentTransactions.reduce(
                                (previousValue, currentValue) => {
                                    return previousValue + Number(currentValue.get('payment_price_paid'));
                                },
                                0
                            ),
                            optionsCurrencyJS
                        );
                        /**
                         * จำนวนเงินชำระลูกหนี้การค้ารวมทั้งสิ้น
                         */
                        const payment_debt_price_paid_total = new currencyJS(findShopCustomerDebtDoc.get('debt_price_paid_total'), optionsCurrencyJS);

                        // รายการชำระเงินยังมีเหลืออยู่ ให้ตรวจสอบยอดที่ชำระไปแล้ว กับยอดที่ต้องชำระที่เหลือ
                        if (findShopPaymentTransactions.length > 0) {
                            const objSetUpdatedByAndDate = {
                                updated_by: findShopPaymentTransactions[0].get('updated_by'),
                                updated_date: findShopPaymentTransactions[0].get('updated_date')
                            };

                            // ใบสั่งซ่อม/ใบสั่งขาย เคยยังไม่ชำระ (1) ให้ปรับสถาณะเป็นค้างชำระ (2)
                            if (findShopCustomerDebtDoc.get('payment_paid_status') === 1) {
                                if (reduce__payment_price_paid.value < payment_debt_price_paid_total.value) { // ใบสั่งซ่อม/ใบสั่งขาย เคยยังไม่ชำระ (1) เมื่อตรวจพบว่ายังจ่ายไม่ครบให้ปรับสถาณะชำระเงินเป็นค้างชำระ (2)
                                    findShopCustomerDebtDoc.set({ payment_paid_status: 2 });
                                }
                                else if (reduce__payment_price_paid.value === payment_debt_price_paid_total.value) { // ใบสั่งซ่อม/ใบสั่งขาย เคยยังไม่ชำระ (1) เมื่อตรวจพบว่าจ่ายครบแล้วให้ปรับสถาณะเป็นชําระแล้ว (3)
                                    findShopCustomerDebtDoc.set({ payment_paid_status: 3 });
                                }
                                else {
                                    throw new Error(`ผลรวมการชำระเงินจะต้องน้อยกว่าหรือเท่ากับราคาชำระเงินของเอกสารใบสั่งซ่อม/ใบสั่งขาย: จำนวนเงินที่ต้องชำระ (${payment_debt_price_paid_total}), จำนวนเงินที่ชำระสะสม (${reduce__payment_price_paid})`)
                                }
                            }

                            // ใบสั่งซ่อม/ใบสั่งขาย เคยชําระแล้ว (3) ให้ตรวจสอบ
                            if (findShopCustomerDebtDoc.get('payment_paid_status') === 2 || findShopCustomerDebtDoc.get('payment_paid_status') === 3) {
                                if (reduce__payment_price_paid.value < payment_debt_price_paid_total.value) { // ใบสั่งซ่อม/ใบสั่งขาย เคยชําระแล้ว (3) เมื่อตรวจพบว่ายังจ่ายไม่ครบให้ปรับสถาณะชำระเงินเป็นค้างชำระ (2)
                                    findShopCustomerDebtDoc.set({ payment_paid_status: 2 });
                                }
                                else if (reduce__payment_price_paid.value === payment_debt_price_paid_total.value) { // ใบสั่งซ่อม/ใบสั่งขาย เคยชําระแล้ว (3) เมื่อตรวจพบว่าจ่ายครบแล้วให้ปรับสถาณะเป็นชําระแล้ว (3)
                                    findShopCustomerDebtDoc.set({ payment_paid_status: 3 });
                                }
                                else {
                                    throw new Error(`ผลรวมการชำระเงินจะต้องน้อยกว่าหรือเท่ากับราคาชำระเงินของเอกสารใบสั่งซ่อม/ใบสั่งขาย: จำนวนเงินที่ต้องชำระ (${payment_debt_price_paid_total}), จำนวนเงินที่ชำระสะสม (${reduce__payment_price_paid})`)
                                }
                            }
                        }

                        // รายการชำระเงินไม่มีแล้ว ให้มีสถาณะการชำระเป็น ยังไม่ชำระ (1) ได้เลย
                        if (findShopPaymentTransactions.length === 0) {
                            const objSetUpdatedByAndDate = instance.get('canceled_payment_by')
                                ? { updated_by: instance.get('canceled_payment_by'), updated_date: instance.get('canceled_payment_date') }
                                : { updated_by: findShopCustomerDebtDoc.get('updated_by'), updated_date: findShopCustomerDebtDoc.get('updated_date') };

                            findShopCustomerDebtDoc.set({ payment_paid_status: 1 });
                        }

                        if (findShopCustomerDebtDoc.changed('payment_paid_status')) {
                            await findShopCustomerDebtDoc.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                        }
                    }
                }
            }
            // ชำระเงินจากเอกสารใบนำเข้า
            else if (instance.get('shop_inventory_transaction_id')) {
                const findShopInventoryTransaction = await ShopInventoryTransaction.findOne({
                    where: {
                        id: instance.get('shop_inventory_transaction_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopInventoryTransaction) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า`);
                }
                else {
                    await instance.reload({ transaction: transaction, ShopModels: ShopModels });

                    if (findShopInventoryTransaction.get('payment_paid_status') !== 0) { // จะทำการปรับปรุงสถานะการชําระเงิน เมื่อสถานะการชําระเงินยังไม่ได้ยกเลิกชำระ (0)
                        /**
                         * ราคาของใบนำเข้า
                         */
                        const payment_price_grand_total = new currencyJS(findShopInventoryTransaction.get('price_grand_total'), optionsCurrencyJS);

                        const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                            where: {
                                shop_inventory_transaction_id: instance.get('shop_inventory_transaction_id'),
                                canceled_payment_by: null,
                                canceled_payment_date: null
                            },
                            order: [
                                [literal(`id = '${instance.get('id')}'`), 'DESC'],
                                [`created_date`, 'DESC']
                            ],
                            transaction: transaction
                        });
                        /**
                         * จำนวนที่จ่ายเงินไปแล้ว
                         */
                        const reduce__payment_price_paid = new currencyJS(
                            findShopPaymentTransactions.reduce(
                                (previousValue, currentValue) => {
                                    return previousValue + Number(currentValue.get('payment_price_paid'));
                                },
                                0
                            ),
                            optionsCurrencyJS
                        );

                        // รายการชำระเงินยังมีเหลืออยู่ ให้ตรวจสอบยอดที่ชำระไปแล้ว กับยอดที่ต้องชำระที่เหลือ
                        if (findShopPaymentTransactions.length > 0) {
                            const objSetUpdatedByAndDate = {
                                updated_by: findShopPaymentTransactions[0].get('updated_by'),
                                updated_date: findShopPaymentTransactions[0].get('updated_date')
                            };

                            if (findShopInventoryTransaction.get('payment_paid_status') === 1) { // ใบนำเข้า เคยยังไม่ชำระ (1) ให้ปรับสถาณะเป็นค้างชำระ (2)
                                if (reduce__payment_price_paid.value < payment_price_grand_total.value) { // ใบนำเข้า เคยยังไม่ชำระ (1) เมื่อตรวจพบว่ายังจ่ายไม่ครบให้ปรับสถาณะชำระเงินเป็นค้างชำระ (2)
                                    findShopInventoryTransaction.set({ payment_paid_status: 2 });
                                }
                                else if (reduce__payment_price_paid.value === payment_price_grand_total.value) { // ใบนำเข้าเคยยังไม่ชำระ (1) เมื่อตรวจพบว่าจ่ายครบแล้วให้ปรับสถาณะเป็นชําระแล้ว (3)
                                    findShopInventoryTransaction.set({ payment_paid_status: 3 });
                                }
                                else {
                                    throw new Error(`ผลรวมการชำระเงินจะต้องน้อยกว่าหรือเท่ากับราคาชำระเงินของเอกสารใบนำเข้า`)
                                }
                            }

                            if (findShopInventoryTransaction.get('payment_paid_status') === 2 || findShopInventoryTransaction.get('payment_paid_status') === 3) { // ใบสั่งนำเข้า เคยชําระแล้ว (3) ให้ตรวจสอบ
                                if (reduce__payment_price_paid.value < payment_price_grand_total.value) { // ใบนำเข้า เคยชําระแล้ว (3) เมื่อตรวจพบว่ายังจ่ายไม่ครบให้ปรับสถาณะชำระเงินเป็นค้างชำระ (2)
                                    findShopInventoryTransaction.set({ payment_paid_status: 2 });
                                }
                                else if (reduce__payment_price_paid.value === payment_price_grand_total.value) { // ใบนำเข้า เคยชําระแล้ว (3) เมื่อตรวจพบว่าจ่ายครบแล้วให้ปรับสถาณะเป็นชําระแล้ว (3)
                                    findShopInventoryTransaction.set({ payment_paid_status: 3 });
                                }
                                else {
                                    throw new Error(`ผลรวมการชำระเงินจะต้องน้อยกว่าหรือเท่ากับราคาชำระเงินของเอกสารใบนำเข้า`)
                                }
                            }
                        }

                        // รายการชำระเงินไม่มีแล้ว ให้มีสถาณะการชำระเป็น ยังไม่ชำระ (1) ได้เลย
                        if (findShopPaymentTransactions.length === 0) { // ใบสั่งนำเข้า กรณีไม่มีรายการชำระ ให้ปรับสถาณะเป็นยังไม่ชำระ (1)
                            const objSetUpdatedByAndDate = instance.get('canceled_payment_by')
                                ? { updated_by: instance.get('canceled_payment_by'), updated_date: instance.get('canceled_payment_date') }
                                : { updated_by: findShopInventoryTransaction.get('updated_by'), updated_date: findShopInventoryTransaction.get('updated_date') };

                            findShopInventoryTransaction.set({ payment_paid_status: 1 });
                        }

                        // กรณีเป็นการบันทึกเจ้าหนี้การค้า ให้ปรับสถาณะเอกสารใบนำเข้า เป็น เจ้าหนี้การค้า (6)
                        if (instance.get('payment_method') === 6 && findShopPaymentTransactions.length > 0) {
                            findShopInventoryTransaction.set({ payment_paid_status: 6 });
                        }

                        if (findShopInventoryTransaction.changed('payment_paid_status')) {
                            await findShopInventoryTransaction.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                        }
                    }
                }
            }
            // ชำระเงินจากเอกสารเจ้าหนี้การค้า
            else if (instance.get('shop_partner_debt_doc_id')) {
                const findShopPartnerDebtDoc = await ShopPartnerDebtDoc.findOne({
                    where: {
                        id: instance.get('shop_partner_debt_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopPartnerDebtDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารเจ้าหนี้การค้า`);
                }
                else {
                    await instance.reload({ transaction: transaction, ShopModels: ShopModels });

                    if (findShopPartnerDebtDoc.get('payment_paid_status') !== 0) { // จะทำการปรับปรุงสถานะการชําระเงิน เมื่อสถานะการชําระเงินยังไม่ได้ยกเลิกชำระ (0)
                        /**
                         * ราคาของใบสั่งซ่อม/ใบสั่งขาย
                         */
                        const payment_price_grand_total = new currencyJS(findShopPartnerDebtDoc.get('price_grand_total'), optionsCurrencyJS);

                        const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                            where: {
                                shop_partner_debt_doc_id: instance.get('shop_partner_debt_doc_id'),
                                canceled_payment_by: null,
                                canceled_payment_date: null
                            },
                            order: [
                                [literal(`id = '${instance.get('id')}'`), 'DESC'],
                                [`created_date`, 'DESC']
                            ],
                            transaction: transaction
                        });
                        /**
                         * จำนวนที่จ่ายเงินไปแล้ว
                         */
                        const reduce__payment_price_paid = new currencyJS(
                            findShopPaymentTransactions.reduce(
                                (previousValue, currentValue) => {
                                    return previousValue + Number(currentValue.get('payment_price_paid'));
                                },
                                0
                            ),
                            optionsCurrencyJS
                        );
                        /**
                         * จำนวนเงินชำระเจ้าหนี้การค้ารวมทั้งสิ้น
                         */
                        const payment_debt_price_paid_total = new currencyJS(findShopPartnerDebtDoc.get('debt_price_paid_total'), optionsCurrencyJS);

                        // รายการชำระเงินยังมีเหลืออยู่ ให้ตรวจสอบยอดที่ชำระไปแล้ว กับยอดที่ต้องชำระที่เหลือ
                        if (findShopPaymentTransactions.length > 0) {
                            const objSetUpdatedByAndDate = {
                                updated_by: findShopPaymentTransactions[0].get('updated_by'),
                                updated_date: findShopPaymentTransactions[0].get('updated_date')
                            };

                            // เอกสารเจ้าหนี้ เคยยังไม่ชำระ (1) ให้ปรับสถาณะเป็นค้างชำระ (2)
                            if (findShopPartnerDebtDoc.get('payment_paid_status') === 1) {
                                if (reduce__payment_price_paid.value < payment_debt_price_paid_total.value) { // เอกสารเจ้าหนี้ เคยยังไม่ชำระ (1) เมื่อตรวจพบว่ายังจ่ายไม่ครบให้ปรับสถาณะชำระเงินเป็นค้างชำระ (2)
                                    findShopPartnerDebtDoc.set({ payment_paid_status: 2 });
                                }
                                else if (reduce__payment_price_paid.value === payment_debt_price_paid_total.value) { // เอกสารเจ้าหนี้ เคยยังไม่ชำระ (1) เมื่อตรวจพบว่าจ่ายครบแล้วให้ปรับสถาณะเป็นชําระแล้ว (3)
                                    findShopPartnerDebtDoc.set({ payment_paid_status: 3 });
                                }
                                else {
                                    throw new Error(`ผลรวมการชำระเงินจะต้องน้อยกว่าหรือเท่ากับราคาชำระเงินของเอกสารเจ้าหนี้: จำนวนเงินที่ต้องชำระ (${payment_debt_price_paid_total}), จำนวนเงินที่ชำระสะสม (${reduce__payment_price_paid})`)
                                }
                            }

                            // เจ้าหนี้ เคยชําระแล้ว (3) ให้ตรวจสอบ
                            if (findShopPartnerDebtDoc.get('payment_paid_status') === 2 || findShopPartnerDebtDoc.get('payment_paid_status') === 3) {
                                if (reduce__payment_price_paid.value < payment_debt_price_paid_total.value) { // เจ้าหนี้ เคยชําระแล้ว (3) เมื่อตรวจพบว่ายังจ่ายไม่ครบให้ปรับสถาณะชำระเงินเป็นค้างชำระ (2)
                                    findShopPartnerDebtDoc.set({ payment_paid_status: 2 });
                                }
                                else if (reduce__payment_price_paid.value === payment_debt_price_paid_total.value) { // เจ้าหนี้ เคยชําระแล้ว (3) เมื่อตรวจพบว่าจ่ายครบแล้วให้ปรับสถาณะเป็นชําระแล้ว (3)
                                    findShopPartnerDebtDoc.set({ payment_paid_status: 3 });
                                }
                                else {
                                    throw new Error(`ผลรวมการชำระเงินจะต้องน้อยกว่าหรือเท่ากับราคาชำระเงินของเอกสารเจ้าหนี้: จำนวนเงินที่ต้องชำระ (${payment_debt_price_paid_total}), จำนวนเงินที่ชำระสะสม (${reduce__payment_price_paid})`)
                                }
                            }
                        }

                        // รายการชำระเงินไม่มีแล้ว ให้มีสถาณะการชำระเป็น ยังไม่ชำระ (1) ได้เลย
                        if (findShopPaymentTransactions.length === 0) {
                            const objSetUpdatedByAndDate = instance.get('canceled_payment_by')
                                ? { updated_by: instance.get('canceled_payment_by'), updated_date: instance.get('canceled_payment_date') }
                                : { updated_by: findShopPartnerDebtDoc.get('updated_by'), updated_date: findShopPartnerDebtDoc.get('updated_date') };

                            findShopPartnerDebtDoc.set({ payment_paid_status: 1 });
                        }

                        if (findShopPartnerDebtDoc.changed('payment_paid_status')) {
                            await findShopPartnerDebtDoc.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                        }
                    }
                }
            }

        };

        /**
         * ตรวจสอบไม่ให้ยกเลิกเอกสารชำระเงินที่เคยยกเลิกไปแล้ว
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookBeforeSave_validatorNotAllowCancelPaymentFromCanceledPayment = async (instance, options) => {
            if (instance.previous('canceled_payment_date')) {
                throw new Error(`ไม่สามารถแก้ไขการยกเลิกชำระได้ เนื่องจากมีการยกเลิกการชำระในรายการนี้ไปแล้ว: ${instance.get('code_id')}`);
            }
            if (instance.previous('canceled_payment_by')) {
                throw new Error(`ไม่สามารถแก้ไขการยกเลิกชำระได้ เนื่องจากมีการยกเลิกการชำระในรายการนี้ไปแล้ว: ${instance.get('code_id')}`);
            }
        };

        /**
         * ปรุบปรุงฟิวส์ที่เกี่ยวข้อง หากมีการใส่ข้อมูล Ref. id ของเอกสารใบัสั่งซ่อม/ใบสั่งขาย เข้ามาในเอกสาร (shop_service_order_doc_id)
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookBeforeSave_mutationReferenceFieldsIfShopServiceOrderExists = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (instance.isNewRecord && instance.get('shop_service_order_doc_id')) {
                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    attributes: [
                        'id',
                        'price_grand_total',
                        'status'
                    ],
                    where: {
                        id: instance.get('shop_service_order_doc_id')
                    },
                    transaction: transaction
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error("ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย");
                }
                else {
                    if (findShopServiceOrderDoc.get('status') === 1) {
                        instance.set({ payment_price_grand_total: findShopServiceOrderDoc.get('price_grand_total') });

                        const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                            where: {
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                status: 1
                            },
                            transaction: transaction
                        });
                        if (findShopTemporaryDeliveryOrderDoc) {
                            instance.set({
                                shop_temporary_delivery_order_doc_id: findShopTemporaryDeliveryOrderDoc.get('id')
                            });
                        }

                        const findShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                            where: {
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                status: 1
                            },
                            transaction: transaction
                        });
                        if (findShopTaxInvoiceDoc) {
                            instance.set({
                                shop_tax_invoice_doc_id: findShopTaxInvoiceDoc.get('id')
                            });
                        }
                    }
                    else {
                        throw new Error(`ไม่สามารถสร้างการชำระเงินสำหรับเอกสารใบสั่งซ่อม/ใบสั่งขายที่ยกเลิกหรือลบไปแล้ว`);
                    }
                }
            }

            // หากรายการชำระเงินช่องทางบันทึกหนี้จากเอกสารใบสั่งซ่อม/ใบสั่งขาย รวมข้อมูลชำระเงินว่าจ่ายไปเท่าไหร่แล้วก่อนจะมาบันทึกหนี้ที่เหลือ
            if (instance.get('shop_service_order_doc_id') && instance.get('payment_method') === 5) {
                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    attributes: [
                        'id',
                        'price_grand_total',
                        'debt_price_amount',
                        'debt_price_amount_left'
                    ],
                    where: {
                        id: instance.get('shop_service_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) { throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย`); }
                else {
                    if (!instance.isNewRecord && instance.get('canceled_payment_date') && instance.get('canceled_payment_by')) { // หากเป็นการยกเลิกการชำระลูกหนี้การค้า
                        findShopServiceOrderDoc.set({
                            debt_price_amount: 0,
                            debt_price_amount_left: 0
                        });
                    }
                    else {
                        /**
                         * ราคาทั้งหมดของใบสั่งซ่อม/ใบสั่งขาย
                         */
                        const price_grand_total = new currencyJS(Number(findShopServiceOrderDoc.get('price_grand_total')), optionsCurrencyJS);

                        /**
                         * รายการชำระเงินจากเอกสารใบสั่งซ่อม/ใบสั่งขาย ก่อนจะทำการบันทึกหนี้การค้า
                         */
                        const findPaidFrom_ShopServiceOrderDocs = await ShopPaymentTransaction.findAll({
                            attributes: [
                                'id',
                                'payment_price_paid'
                            ],
                            where: {
                                shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                canceled_payment_date: null,
                                canceled_payment_by: null,
                                payment_method: {
                                    [Op.notIn]: [0, 5]
                                },
                                payment_status: 1
                            }
                        });
                        /**
                         * ผลรวมยอดชำระเงินจากเอกสารใบสั่งซ่อม/ใบสั่งขาย ก่อนจะทำการบันทึกหนี้การค้า
                         */
                        const sumPaidFrom_ShopServiceOrderDocs = findPaidFrom_ShopServiceOrderDocs.reduce((prev, curr) => {
                            return new currencyJS(prev.value + Number(curr.get('payment_price_paid')), optionsCurrencyJS);
                        }, new currencyJS(0, optionsCurrencyJS));

                        findShopServiceOrderDoc.set({
                            debt_price_amount: price_grand_total,
                            debt_price_amount_left: price_grand_total - sumPaidFrom_ShopServiceOrderDocs
                        });
                    }
                }

                if (findShopServiceOrderDoc.changed()) {
                    await findShopServiceOrderDoc.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                }
            }
        };

        /**
       * ปรุบปรุงฟิวส์ที่เกี่ยวข้อง หากมีการใส่ข้อมูล Ref. id ของเอกสารใบนำเข้า เข้ามาในเอกสาร (shop_inventory_transaction_id)
       * @param {ShopPaymentTransaction} instance
       * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
       */
        const hookBeforeSave_mutationReferenceFieldsIfShopInventoryTransactionExists = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (instance.isNewRecord && instance.get('shop_inventory_transaction_id')) {
                const findShopInventoryTransaction = await ShopInventoryTransaction.findOne({
                    attributes: [
                        'id',
                        'price_grand_total',
                        'status'
                    ],
                    where: {
                        id: instance.get('shop_inventory_transaction_id')
                    },
                    transaction: transaction
                });
                if (!findShopInventoryTransaction) {
                    throw new Error("ไม่พบข้อมูลเอกสารใบนำเข้า");
                }
                else {
                    if (findShopInventoryTransaction.get('status') === 1) {
                        instance.set({ payment_price_grand_total: findShopInventoryTransaction.get('price_grand_total') });
                    }
                    else {
                        throw new Error(`ไม่สามารถสร้างการชำระเงินสำหรับเอกสารใบสั่งซ่อม/ใบสั่งขายที่ยกเลิกหรือลบไปแล้ว`);
                    }
                }
            }

            // หากรายการชำระเงินช่องทางบันทึกหนี้จากเอกสารใบนำเข้า รวมข้อมูลชำระเงินว่าจ่ายไปเท่าไหร่แล้วก่อนจะมาบันทึกหนี้ที่เหลือ
            if (instance.get('shop_inventory_transaction_id') && instance.get('payment_method') === 6) {
                const findShopInventoryTransaction = await ShopInventoryTransaction.findOne({
                    attributes: [
                        'id',
                        'price_grand_total',
                        'debt_price_amount',
                        'debt_price_amount_left'
                    ],
                    where: {
                        id: instance.get('shop_inventory_transaction_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopInventoryTransaction) { throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า`); }
                else {
                    if (!instance.isNewRecord && instance.get('canceled_payment_date') && instance.get('canceled_payment_by')) { // หากเป็นการยกเลิกการชำระลูกหนี้การค้า
                        findShopInventoryTransaction.set({
                            debt_price_amount: 0,
                            debt_price_amount_left: 0
                        });
                    }
                    else {
                        /**
                         * ราคาทั้งหมดของใบสั่งซ่อม/ใบสั่งขาย
                         */
                        const price_grand_total = new currencyJS(Number(findShopInventoryTransaction.get('price_grand_total')), optionsCurrencyJS);

                        /**
                         * รายการชำระเงินจากเอกสารใบสั่งซ่อม/ใบสั่งขาย ก่อนจะทำการบันทึกหนี้การค้า
                         */
                        const findPaidFrom_ShopInventoryTransaction = await ShopPaymentTransaction.findAll({
                            attributes: [
                                'id',
                                'payment_price_paid'
                            ],
                            where: {
                                shop_inventory_transaction_id: findShopInventoryTransaction.get('id'),
                                canceled_payment_date: null,
                                canceled_payment_by: null,
                                payment_method: {
                                    [Op.notIn]: [0, 6]
                                },
                                payment_status: 1
                            }
                        });
                        /**
                         * ผลรวมยอดชำระเงินจากเอกสารใบนำเข้า ก่อนจะทำการบันทึกหนี้การค้า
                         */
                        const sumPaidFrom_ShopInventoryTransaction = findPaidFrom_ShopInventoryTransaction.reduce((prev, curr) => {
                            return new currencyJS(prev.value + Number(curr.get('payment_price_paid')), optionsCurrencyJS);
                        }, new currencyJS(0, optionsCurrencyJS));

                        findShopInventoryTransaction.set({
                            debt_price_amount: price_grand_total,
                            debt_price_amount_left: price_grand_total - sumPaidFrom_ShopInventoryTransaction
                        });
                    }
                }

                if (findShopInventoryTransaction.changed()) {
                    await findShopInventoryTransaction.save({ transaction: transaction, ShopModels: ShopModels, hooks: false });
                }
            }
        };

        /**
         * ปรับปรุงฟิวส์ที่เกี่ยวข้อง หากมีการใส่ข้อมูล Ref. id ของเอกสารลูกหนี้การค้า เข้ามาในเอกสาร (shop_customer_debt_doc_id)
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookBeforeSave_mutationReferenceFieldsIfShopCustomerDebtExists = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (instance.isNewRecord && instance.get('shop_customer_debt_doc_id')) {
                const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                    attributes: ['id', 'debt_price_paid_total', 'status'],
                    where: {
                        id: instance.get('shop_customer_debt_doc_id')
                    },
                    transaction: transaction
                });
                if (!findShopCustomerDebtDoc) {
                    throw new Error("ไม่พบข้อมูลเอกสารลูกหนี้การค้า");
                }
                else {
                    if (findShopCustomerDebtDoc.get('status') === 1) {
                        instance.set({ payment_price_grand_total: findShopCustomerDebtDoc.get('debt_price_paid_total') });
                    }
                    else {
                        throw new Error(`ไม่สามารถสร้างการชำระเงินสำหรับเอกสารลูกหนี้การค้าที่ยกเลิกหรือลบไปแล้ว`);
                    }
                }
            }
        };


        /**
       * ปรับปรุงฟิวส์ที่เกี่ยวข้อง หากมีการใส่ข้อมูล Ref. id ของเอกสารเจ้าหนี้การค้า เข้ามาในเอกสาร (shop_partner_debt_doc_id)
       * @param {ShopPaymentTransaction} instance
       * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
       */
        const hookBeforeSave_mutationReferenceFieldsIfShopPartnerDebtExists = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (instance.isNewRecord && instance.get('shop_partner_debt_doc_id')) {
                const findShopPartnerDebtDoc = await ShopPartnerDebtDoc.findOne({
                    attributes: ['id', 'debt_price_paid_total', 'status'],
                    where: {
                        id: instance.get('shop_partner_debt_doc_id')
                    },
                    transaction: transaction
                });
                if (!findShopPartnerDebtDoc) {
                    throw new Error("ไม่พบข้อมูลเอกสารเจ้าหนี้การค้า");
                }
                else {
                    if (findShopPartnerDebtDoc.get('status') === 1) {
                        instance.set({ payment_price_grand_total: findShopPartnerDebtDoc.get('debt_price_paid_total') });
                    }
                    else {
                        throw new Error(`ไม่สามารถสร้างการชำระเงินสำหรับเอกสารเจ้าหนี้การค้าที่ยกเลิกหรือลบไปแล้ว`);
                    }
                }
            }
        };

        /**
         * ตรวจสอบการชำระเงิน
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookAfterSave_validatorFieldPaymentPricePaidLists = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            // การชำระเงินจากเอกสารใบสั่งซ่อม/ใบสั่งขาย
            if (instance.get('shop_service_order_doc_id')) {
                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: instance.get('shop_service_order_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย`);
                }
                else {
                    const price_grand_total = new currencyJS(findShopServiceOrderDoc.get('price_grand_total'), optionsCurrencyJS);

                    const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                        where: {
                            shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                            canceled_payment_date: null,
                            canceled_payment_by: null
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    const reduce__payment_price_paid = new currencyJS(
                        findShopPaymentTransactions.reduce((pre, curr) => {
                            return pre + Number(curr.get('payment_price_paid'))
                        }, 0),
                        optionsCurrencyJS
                    );

                    if (price_grand_total.value >= 0 && reduce__payment_price_paid.value > price_grand_total.value) {
                        throw new Error(`ยอดชำระเงินทั้งหมดต้องไม่เกินราคาเอกสารใบสั่งซ่อม/ใบสั่งขาย: ยอดชำระทั้งหมด (${price_grand_total.value}), ยอดชำระสะสม (${reduce__payment_price_paid.value})`);
                    }

                    if (
                        instance.get('payment_method') === 5
                        && (
                            !instance.get('canceled_payment_date')
                            || !instance.get('canceled_payment_by')
                        )
                    ) {
                        if (findShopPaymentTransactions.length > 0) {
                            const findShopPaymentTransactionsNotThisDoc = await ShopPaymentTransaction.findAll({
                                attributes: ['id', 'code_id'],
                                where: {
                                    [Op.not]: {
                                        id: instance.get('id')
                                    },
                                    shop_service_order_doc_id: findShopServiceOrderDoc.get('id'),
                                    canceled_payment_date: null,
                                    canceled_payment_by: null
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (findShopPaymentTransactionsNotThisDoc.length > 0) {
                                throw new Error(`ไม่อนุญาตให้ชำระช่องทางชำระลูกหนี้การค้าในการชำระเงินเอกสารใบสั่งซ่อม/ใบสั่งขาย ที่มีการชำระเงินมาก่อนแล้ว: ${findShopPaymentTransactionsNotThisDoc.map(w => w?.code_id || '')}`);
                            }
                        }
                        if (instance.get('is_partial_payment')) {
                            throw new Error(`ไม่อนุญาตให้ชำระแบบ Partial Payment ในการชำระเงินเอกสารใบสั่งซ่อม/ใบสั่งขาย ที่เป็นช่องทางชำระลูกหนี้การค้า`);
                        }
                        if (reduce__payment_price_paid.value !== price_grand_total.value) {
                            throw new Error(`ยอดชำระเงินทั้งหมดต้องเท่ากับราคาเอกสารใบสั่งซ่อม/ใบสั่งขาย ในการชำระเงินเอกสารใบสั่งซ่อม/ใบสั่งขาย ที่เป็นช่องทางชำระลูกหนี้การค้า: จำนวนเงินทั้งหมด (${price_grand_total.value}), จำนวนเงินที่ชำระไป (${reduce__payment_price_paid.value})`);
                        }
                    }
                }
            }
            // การชำระเงินจากเอกสารลูกหนี้การค้า
            else if (instance.get('shop_customer_debt_doc_id')) {
                const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                    where: {
                        id: instance.get('shop_customer_debt_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopCustomerDebtDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารลูกหนี้การค้า`);
                }
                else {
                    const price_grand_total = new currencyJS(findShopCustomerDebtDoc.get('price_grand_total'), optionsCurrencyJS);

                    const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                        where: {
                            shop_customer_debt_doc_id: findShopCustomerDebtDoc.get('id'),
                            canceled_payment_date: null,
                            canceled_payment_by: null
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    const reduce__payment_price_paid = new currencyJS(
                        findShopPaymentTransactions.reduce((pre, curr) => {
                            return pre + Number(curr.get('payment_price_paid'))
                        }, 0),
                        optionsCurrencyJS
                    );

                    if (reduce__payment_price_paid.value > price_grand_total.value) {
                        throw new Error(`ยอดชำระเงินทั้งหมดต้องไม่เกินราคาเอกสารลูกหนี้การค้า: จำนวนเงินทั้งหมด ${price_grand_total.value}, จำนวนเงินที่ชำระไป ${reduce__payment_price_paid.value}`);
                    }
                }
            }
            // การชำระเงินจากเอกสารใบนำเข้า
            else if (instance.get('shop_inventory_transaction_id')) {
                const findShopInventoryTransaction = await ShopInventoryTransaction.findOne({
                    where: {
                        id: instance.get('shop_inventory_transaction_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopInventoryTransaction) {
                    throw new Error(`ไม่พบข้อมูลเอกสารใบนำเข้า`);
                }
                else {
                    const price_grand_total = new currencyJS(findShopInventoryTransaction.get('price_grand_total'), optionsCurrencyJS);

                    const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                        where: {
                            shop_inventory_transaction_id: findShopInventoryTransaction.get('id'),
                            canceled_payment_date: null,
                            canceled_payment_by: null
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    const reduce__payment_price_paid = new currencyJS(
                        findShopPaymentTransactions.reduce((pre, curr) => {
                            return pre + Number(curr.get('payment_price_paid'))
                        }, 0),
                        optionsCurrencyJS
                    );

                    if (price_grand_total.value >= 0 && reduce__payment_price_paid.value > price_grand_total.value) {
                        throw new Error(`ยอดชำระเงินทั้งหมดต้องไม่เกินราคาเอกสารใบนำเข้า: ยอดชำระทั้งหมด (${price_grand_total.value}), ยอดชำระสะสม (${reduce__payment_price_paid.value})`);
                    }

                    if (
                        instance.get('payment_method') === 6
                        && (
                            !instance.get('canceled_payment_date')
                            || !instance.get('canceled_payment_by')
                        )
                    ) {
                        if (findShopPaymentTransactions.length > 0) {
                            const findShopPaymentTransactionsNotThisDoc = await ShopPaymentTransaction.findAll({
                                attributes: ['id', 'code_id'],
                                where: {
                                    [Op.not]: {
                                        id: instance.get('id')
                                    },
                                    shop_inventory_transaction_id: findShopInventoryTransaction.get('id'),
                                    canceled_payment_date: null,
                                    canceled_payment_by: null
                                },
                                transaction: transaction,
                                ShopModels: ShopModels
                            });
                            if (findShopPaymentTransactionsNotThisDoc.length > 0) {
                                throw new Error(`ไม่อนุญาตให้ชำระช่องทางชำระลูกหนี้การค้าในการชำระเงินเอกสารใบนำเข้า ที่มีการชำระเงินมาก่อนแล้ว: ${findShopPaymentTransactionsNotThisDoc.map(w => w?.code_id || '')}`);
                            }
                        }
                        if (instance.get('is_partial_payment')) {
                            throw new Error(`ไม่อนุญาตให้ชำระแบบ Partial Payment ในการชำระเงินเอกสารใบนำเข้า ที่เป็นช่องทางชำระเจ้าหนี้การค้า`);
                        }
                        if (reduce__payment_price_paid.value !== price_grand_total.value) {
                            throw new Error(`ยอดชำระเงินทั้งหมดต้องเท่ากับราคาเอกสารใบนำเข้า ในการชำระเงินเอกสารใบนำเข้า ที่เป็นช่องทางชำระเจ้าหนี้การค้า: จำนวนเงินทั้งหมด (${price_grand_total.value}), จำนวนเงินที่ชำระไป (${reduce__payment_price_paid.value})`);
                        }
                    }
                }
            }
            // การชำระเงินจากเอกสารเจ้าหนี้การค้า
            else if (instance.get('shop_partner_debt_doc_id')) {
                const findShopPartnerDebtDoc = await ShopPartnerDebtDoc.findOne({
                    where: {
                        id: instance.get('shop_partner_debt_doc_id')
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopPartnerDebtDoc) {
                    throw new Error(`ไม่พบข้อมูลเอกสารเจ้าหนี้การค้า`);
                }
                else {
                    const price_grand_total = new currencyJS(findShopPartnerDebtDoc.get('price_grand_total'), optionsCurrencyJS);

                    const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                        where: {
                            shop_partner_debt_doc_id: findShopPartnerDebtDoc.get('id'),
                            canceled_payment_date: null,
                            canceled_payment_by: null
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    const reduce__payment_price_paid = new currencyJS(
                        findShopPaymentTransactions.reduce((pre, curr) => {
                            return pre + Number(curr.get('payment_price_paid'))
                        }, 0),
                        optionsCurrencyJS
                    );

                    if (reduce__payment_price_paid.value > price_grand_total.value) {
                        throw new Error(`ยอดชำระเงินทั้งหมดต้องไม่เกินราคาเอกสารเจ้าหนี้การค้า: จำนวนเงินทั้งหมด ${price_grand_total.value}, จำนวนเงินที่ชำระไป ${reduce__payment_price_paid.value}`);
                    }
                }
            }
        };

        /**
         * ตรวจสอบข้อมูลการชำระเงิน หากมีการบันทึกลูกหนี้การค้าใหม่ หรือแก้ไข หรือยกเลิก
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookBeforeSave_validatorWhenPaidMethodIsCustomerDebt = async (instance, options) => {
            if (instance.get('shop_service_order_doc_id') && instance.get('payment_method') === 5) {
                /**
                 * @type {import("sequelize").Transaction | null}
                 */
                const transaction = options?.transaction || null;

                const findUsageShopCustomerDebtDoc = await ShopCustomerDebtDoc.findAll({
                    attributes: ['id', 'code_id'],
                    include: [
                        {
                            model: ShopCustomerDebtList,
                            attributes: ['id', 'seq_number'],
                            required: true,
                            where: {
                                shop_service_order_doc_id: instance.get('shop_service_order_doc_id'),
                                status: 1
                            }
                        }
                    ],
                    where: {
                        status: 1
                    },
                    transaction: transaction
                });
                if (findUsageShopCustomerDebtDoc.length > 0) {
                    if (instance.isNewRecord) { throw new Error(`ไม่สามารถสร้างรายการชำระเงินได้ เนื่องจากมีการใช้งานในรายการลูกหนี้การค้า: ${findUsageShopCustomerDebtDoc.map(w => `(เลขที่เอกสารลูกหนี้การค้า ${w.code_id}${w?.ShopCustomerDebtLists.map(w => `, รายการที่ ${w.seq_number}`)}) `)}`.replace(/(\s)+$/g, '')); }
                    else if (instance.get('canceled_payment_by') || instance.get('canceled_payment_date')) { throw new Error(`ไม่สามารถยกเลิกรายการชำระเงินได้ เนื่องจากมีการใช้งานในรายการลูกหนี้การค้า: ${findUsageShopCustomerDebtDoc.map(w => `(เลขที่เอกสารลูกหนี้การค้า ${w.code_id}${w?.ShopCustomerDebtLists.map(w => `, รายการที่ ${w.seq_number}`)}) `)}`.replace(/(\s)+$/g, '')); }
                    else { throw new Error(`ไม่สามารถแก้ไขรายการชำระเงินได้ เนื่องจากมีการใช้งานในรายการลูกหนี้การค้า: ${findUsageShopCustomerDebtDoc.map(w => `(เลขที่เอกสารลูกหนี้การค้า ${w.code_id}${w?.ShopCustomerDebtLists.map(w => `, รายการที่ ${w.seq_number}`)}) `)}`.replace(/(\s)+$/g, '')); }
                }
            }
        };

        /**
         * ตรวจสอบการชำระเงินแบบ Partial payment
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookAfterSave_validatorPartialPayment = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            const objWhere = (() => {
                /**
                 * @type {{shop_service_order_doc_id: string;} | {shop_customer_debt_doc_id: string;} | | {shop_inventory_transaction_id: string;} | | {shop_partner_debt_doc_id: string;}}
                 */
                const objToWhere = {};
                if (instance.get('shop_service_order_doc_id')) {
                    objToWhere.shop_service_order_doc_id = instance.get('shop_service_order_doc_id');
                }
                if (instance.get('shop_customer_debt_doc_id')) {
                    objToWhere.shop_customer_debt_doc_id = instance.get('shop_customer_debt_doc_id');
                }
                if (instance.get('shop_inventory_transaction_id')) {
                    objToWhere.shop_inventory_transaction_id = instance.get('shop_inventory_transaction_id');
                }
                if (instance.get('shop_partner_debt_doc_id')) {
                    objToWhere.shop_partner_debt_doc_id = instance.get('shop_partner_debt_doc_id');
                }
                if (Object.keys(objToWhere).length !== 1) { throw Error(`เอกสารการชำระเงินจะต้องมีแหล่งที่มาเอกสารเป็นอย่างใดอย่างหนึ่งระหว่างเอกสารใบสั่งซ่อม/ใบสั่งขาย หรือเอกสารลูกหนี้การค้า`); }
                return objToWhere;
            })();

            const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                attributes: [
                    'id',
                    'payment_price_grand_total',
                    'payment_price_paid',
                    'is_partial_payment'
                ],
                where: {
                    ...objWhere,
                    payment_status: 1,
                    canceled_payment_by: null,
                    canceled_payment_date: null
                },
                transaction: transaction,
                ShopModels: ShopModels
            });

            if (findShopPaymentTransactions.length > 0) {
                // กรณีที่มีการชำระเงินแบบ Partial payment เป็นช่องทางชำระเงินแบบลูกหนี้การค้า จากเอกสารใบสั่งซ่อม/ใบสั่งขาย จะต้องไม่มีการชำระเงินแบบ Partial payment
                if (instance.get('shop_service_order_doc_id') && instance.get('payment_method') === 5) {
                    if (findShopPaymentTransactions.length !== 1) {
                        throw new Error(`การชำระเงินช่องทางลูกหนี้การค้าจากเอกสารใบสั่งซ่อม/ใบสั่งขายไม่รองรับระบบ Partial Payment`);
                    }

                    const isDebtPaymentFromShopServiceOrderIsPartialPayment = findShopPaymentTransactions.some(w => w.get('is_partial_payment') === true);
                    if (isDebtPaymentFromShopServiceOrderIsPartialPayment) {
                        throw new Error(`การชำระเงินช่องทางลูกหนี้การค้าจากเอกสารใบสั่งซ่อม/ใบสั่งขายไม่รองรับระบบ Partial Payment`);
                    }
                }

                // กรณีที่มีการชำระเงินแบบ Partial payment ที่ไม่เป็นช่องทางชำระเงินแบบลูกหนี้การค้า จากเอกสารลูกหนี้การค้า สามรถมีการชำระเงินแบบ Partial payment ได้
                if (instance.get('payment_method') !== 5) {
                    const isPartialPayment = findShopPaymentTransactions.some(w => w.get('is_partial_payment') === true);
                    if (isPartialPayment) {
                        const isAllPaymentsIsPartialPayment = findShopPaymentTransactions.every(w => w.get('is_partial_payment') === true);
                        if (!isAllPaymentsIsPartialPayment) {
                            throw new Error(`ไม่อนุญาตให้มีการชำระเงินแบบ Partial Payment และชำระเงินแบบปกติในรายการเดียวกัน`);
                        }

                        const reduce__payment_price_paid = findShopPaymentTransactions.reduce((pre, curr) => {
                            return pre + Number(curr.get('payment_price_paid'))
                        }, 0);

                        if (findShopPaymentTransactions.length === 1 && Number(findShopPaymentTransactions[0].get('payment_price_grand_total')) === reduce__payment_price_paid) {
                            throw new Error(`หากเป็นการชำระเงินแบบ Partial Payment ไม่สามารถจ่ายเต็มในครั้งแรกได้: จำนวนเงินที่ต้องชำระ ${findShopPaymentTransactions[0].get('payment_price_grand_total')}, จำนวนเงินที่ชำระ ${reduce__payment_price_paid}`);
                        }
                    }
                    else {
                        if (findShopPaymentTransactions.length !== 1) {
                            throw new Error(`หากไม่ได้เป็นการชำระเงินแบบ Partial Payment จะต้องมีการชำระเงินแบบเต็มเท่านั้น: จำนวนเอกสารชำระเงินที่ตรวจพบ ${findShopPaymentTransactions.length}`);
                        }

                        if (Number(findShopPaymentTransactions[0].get('payment_price_grand_total')) !== Number(findShopPaymentTransactions[0].get('payment_price_paid'))) {
                            throw new Error(`หากไม่ได้เป็นการชำระเงินแบบ Partial Payment จะต้องมีการชำระเงินแบบเต็มเท่านั้น: จำนวนเงินที่ต้องชำระ ${findShopPaymentTransactions[0].get('payment_price_grand_total')}, จำนวนเงินที่ชำระ ${findShopPaymentTransactions[0].get('payment_price_paid')}`);
                        }
                    }
                }
            }
        };

        /**
         * ปรับปรุงหนี้ของหน้าข้อมูลลูกค้า
         * @param {ShopPaymentTransaction} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
         */
        const hookAfterSave_mutationCustomerDebt_inCustomerData = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            if (isUUID(instance.get('shop_service_order_doc_id'))) {
                const findShopServiceOrderDoc = await ShopServiceOrderDoc.findOne({
                    where: {
                        id: instance.get('shop_service_order_doc_id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopServiceOrderDoc) {
                    return;
                }
                if (isUUID(findShopServiceOrderDoc.get('bus_customer_id'))) {
                    await ShopCustomerDebtDoc.updateCustomerDebtAmount(
                        findShopServiceOrderDoc.get('shop_id'),
                        findShopServiceOrderDoc.get('bus_customer_id'),
                        'bus_customer_id',
                        {
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );
                }
                if (isUUID(findShopServiceOrderDoc.get('per_customer_id'))) {
                    await ShopCustomerDebtDoc.updateCustomerDebtAmount(
                        findShopServiceOrderDoc.get('shop_id'),
                        findShopServiceOrderDoc.get('per_customer_id'),
                        'per_customer_id',
                        {
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );
                }
            }

            if (isUUID(instance.get('shop_customer_debt_doc_id'))) {
                const findShopCustomerDebtDoc = await ShopCustomerDebtDoc.findOne({
                    where: {
                        id: instance.get('shop_customer_debt_doc_id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopCustomerDebtDoc) {
                    return;
                }
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
            }
        };
        /**
        * ปรับปรุงหนี้ของหน้าข้อมูลผู้จำหน่าย
        * @param {ShopPaymentTransaction} instance
        * @param {import("sequelize/types/model").UpdateOptions<ShopPaymentTransaction> | import("sequelize/types/model").SaveOptions<ShopPaymentTransaction>} options
        */
        const hookAfterSave_mutationPartnerDebt_inPartnerData = async (instance, options) => {
            /**
             * @type {import("sequelize").Transaction | null}
             */
            const transaction = options?.transaction || null;

            console.log('hookAfterSave_mutationPartnerDebt_inPartnerData')
            if (isUUID(instance.get('shop_inventory_transaction_id'))) {
                const findShopInventoryTransaction = await ShopInventoryTransaction.findOne({
                    where: {
                        id: instance.get('shop_inventory_transaction_id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });

                if (!findShopInventoryTransaction) {
                    return;
                }
                if (isUUID(findShopInventoryTransaction.get('bus_partner_id'))) {
                    await ShopPartnerDebtDoc.updatePartnerDebtAmount(
                        findShopInventoryTransaction.get('shop_id'),
                        findShopInventoryTransaction.get('bus_partner_id'),
                        {
                            transaction: transaction,
                            ShopModels: ShopModels
                        }
                    );
                }

            }

            if (isUUID(instance.get('shop_partner_debt_doc_id'))) {
                const findShopPartnerDebtDoc = await ShopPartnerDebtDoc.findOne({
                    where: {
                        id: instance.get('shop_partner_debt_doc_id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });
                if (!findShopPartnerDebtDoc) {
                    return;
                }
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
            }
        };

        return {
            hookBeforeValidate_isDocumentIdValid,
            hookBeforeValidate_serializerDocRunNumber,
            hookBeforeSave_validatorNotAllowCancelPaymentFromCanceledPayment,
            hookBeforeSave_validatorWhenPaidMethodIsCustomerDebt,
            hookBeforeSave_mutationDocRunNumber,
            hookBeforeSave_mutationReferenceFieldsIfShopServiceOrderExists,
            hookBeforeSave_mutationReferenceFieldsIfShopInventoryTransactionExists,
            hookBeforeSave_mutationReferenceFieldsIfShopCustomerDebtExists,
            hookBeforeSave_mutationReferenceFieldsIfShopPartnerDebtExists,
            hookBeforeSave_mutationField_details__meta_data,
            hookAfterSave_validatorPartialPayment,
            hookAfterSave_validatorFieldPaymentPricePaidLists,
            hookAfterSave_mutation_PaymentPaidStatus,
            hookAfterSave_mutationCustomerDebt_inCustomerData,
            hookAfterSave_mutationPartnerDebt_inPartnerData,

        };
    };

    ShopPaymentTransaction.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        await instance.myHookFunctions.hookBeforeValidate_isDocumentIdValid(instance, options);
        await instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
    });

    ShopPaymentTransaction.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_validatorNotAllowCancelPaymentFromCanceledPayment(instance, options);
        await instance.myHookFunctions.hookBeforeSave_validatorWhenPaidMethodIsCustomerDebt(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationReferenceFieldsIfShopServiceOrderExists(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationReferenceFieldsIfShopInventoryTransactionExists(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationReferenceFieldsIfShopCustomerDebtExists(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationReferenceFieldsIfShopPartnerDebtExists(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField_details__meta_data(instance, options);
    });

    ShopPaymentTransaction.afterSave(async (instance, options) => {
        await instance.myHookFunctions.hookAfterSave_validatorPartialPayment(instance, options);
        await instance.myHookFunctions.hookAfterSave_validatorFieldPaymentPricePaidLists(instance, options);
        await instance.myHookFunctions.hookAfterSave_mutation_PaymentPaidStatus(instance, options);
        await instance.myHookFunctions.hookAfterSave_mutationCustomerDebt_inCustomerData(instance, options);
        await instance.myHookFunctions.hookAfterSave_mutationPartnerDebt_inPartnerData(instance, options);

    });

    return ShopPaymentTransaction;
};


module.exports = ShopPaymentTransaction;