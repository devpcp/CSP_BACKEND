/**
 * A function do dynamics table of model ShopServiceOrderDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_service_order_doc"
 */
const ShopServiceOrderDoc = (table_name) => {
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

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Op } = require("sequelize");
    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");
    const utilSetShopStockProductBalance = require("../../utils/util.SetShopStockProductBalance");
    const utilGetModelsAndShopModels = require("../../utils/util.GetModelsAndShopModels");

    const db = require("../../db");

    const __model = require("../model");
    const User = __model.User;
    const ShopProfile = __model.ShopsProfiles;
    const DocumentType = __model.DocumentTypes;
    const TaxType = __model.TaxTypes;
    const SubDistrict = __model.SubDistrict;
    const District = __model.District;
    const Province = __model.Province;
    const VehicleType = __model.VehicleType;
    const VehicleBrand = __model.VehicleBrand;
    const VehicleModelType = __model.VehicleModelType;
    const NameTitle = __model.NameTitle;
    const ShopDocumentCode = __model.ShopDocumentCode(table_name);
    const ShopBusinessCustomer = __model.ShopBusinessCustomers(table_name);
    const ShopPersonalCustomer = __model.ShopPersonalCustomers(table_name);
    const ShopVehicleCustomer = __model.ShopVehicleCustomer(table_name);


    const defaultPrefixDoc = require("../../config").config_run_number_shop_sales_order_prefix;
    const default_doc_type_code_id = 'JOB';

    class ShopServiceOrderDoc extends Model { }

    ShopServiceOrderDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม`,
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
                allowNull: false,
                references: {
                    model: DocumentType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            doc_type_code_id: {
                comment: 'รหัสประเภทเอกสาร',
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: default_doc_type_code_id
            },
            doc_sales_type: {
                comment: 'ประเภทการขาย' +
                    '\n1 = ใบสั่งซ่อม' +
                    '\n2 = ใบสั่งขาย',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[1, 2]]
                }
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
                onDelete: 'SET NULL'
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
                onDelete: 'SET NULL'
            },
            vehicle_customer_id: {
                comment: `รหัสตารางข้อมูลยานพาหนะ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: ShopVehicleCustomer,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            tax_type_id: {
                comment: `รหัสตารางข้อมูลประเภทภาษีมูลค่าเพิ่ม`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: TaxType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            vat_type: {
                comment: 'ประเภทภาษีมูลค่าเพิ่ม (Vat types)'
                    + '\n1 = รวมภาษีมูลค่าเพิ่ม'
                    + '\n2 = ไม่รวมภาษีมูลค่าเพิ่ม'
                    + '\n3 = ไม่คิดภาษีมูลค่าเพิ่ม',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2, 3]]
                }
            },
            vat_rate: {
                comment: `อัตราภาษีมูลค่าเพิ่ม`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            price_discount_bill: {
                comment: `ส่วนลดท้ายบิล`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_discount_before_pay: {
                comment: `ส่วนลดก่อนชำระเงิน`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_sub_total: {
                comment: `รวมเป็นเงิน`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_discount_total: {
                comment: `ส่วนลดรวม`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_amount_total: {
                comment: `ราคาหลังหักส่วนลด`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_before_vat: {
                comment: `ราคาก่อนรวมภาษี`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_vat: {
                comment: `ภาษีมูลค่าเพิ่ม`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            price_grand_total: {
                comment: `จำนวนเงินรวมทั้งสิ้น`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            debt_due_date: {
                comment: `วันครบกำหนดชำระหนี้`,
                type: DataTypes.DATEONLY,
                allowNull: true,
                defaultValue: null
            },
            debt_price_amount: {
                comment: `จำนวนเงินลูกหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            debt_price_amount_left: {
                comment: `จำนวนเงินลูกหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)`,
                type: DataTypes.DECIMAL(10, 2),
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
                    '\n5 = ลูกหนี้การค้า',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2, 3, 4, 5]]
                }
            },
            is_draft: {
                comment: 'เอกสารนี้เป็นฉบับบันทึกร่าง หรือฉบับจริง',
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {
                    ref_doc: '',
                    previous_mileage: null,
                    current_mileage: null,
                    average_mileage: null,
                    meta_data: {
                        ShopBusinessCustomer: null,
                        ShopPersonalCustomer: null,
                        ShopVehicleCustomer: null,
                        customer_name: {
                            prefix_name: null,
                            first_name: null,
                            last_name: null,
                        },
                        customer_contract_name: null,
                        customer_vehicle_reg_plate: null,
                        customer_vehicle_reg_plate_province_name: null,
                        previous_mileage: null,
                        current_mileage: null,
                        average_mileage: null,
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
                onDelete: 'SET NULL'
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
            modelName: 'ShopServiceOrderDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_service_order_doc`,
            comment: 'ตารางข้อมูลเอกสารใบสั่งซ่อม',
            timestamps: false,
            indexes: [
                {
                    name: `idx_${table_name}_job_doc_code_id`,
                    fields: ['code_id']
                }
            ]
        }
    );

    ShopServiceOrderDoc.belongsTo(ShopProfile, { foreignKey: 'shop_id', as: 'ShopProfile' });
    ShopServiceOrderDoc.belongsTo(DocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopServiceOrderDoc.belongsTo(ShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopServiceOrderDoc.belongsTo(ShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopServiceOrderDoc.belongsTo(ShopVehicleCustomer, { foreignKey: 'vehicle_customer_id', as: 'ShopVehicleCustomer' });
    ShopServiceOrderDoc.belongsTo(TaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopServiceOrderDoc.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopServiceOrderDoc.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    const hookFunctions = (options = {}) => {
        const ShopModels = options?.ShopModels || utilGetModelsAndShopModels(table_name).ShopModels || __model.initShopModel(table_name);
        const {
            ShopServiceOrderDoc,
            ShopServiceOrderList,
            ShopTemporaryDeliveryOrderDoc,
            ShopTaxInvoiceDoc,
            ShopPaymentTransaction,
            ShopVehicleCustomer,
            ShopInventoryMovementLog
        } = ShopModels;

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerDocRunNumber = (instance, options) => {
            const doc_sales_type = Number(instance.get('doc_sales_type'));
            if (doc_sales_type !== 1 && doc_sales_type !== 2) {
                throw new Error(`โปรดระบุชนิดเอสารนี้ว่าเป็นใบสั่งซ่อมหรือใบสั่งขาย`);
            }

            if (instance.isNewRecord && instance.get('is_migrated') === false) {
                const doc_sales_type = Number(instance.get('doc_sales_type'));
                if (doc_sales_type === 1) {
                    instance.set('code_id', 'JOB');
                }
                else if (doc_sales_type === 2) {
                    instance.set('code_id', 'SLO');
                }
                else {
                    throw new Error(`โปรดระบุชนิดเอสารนี้ว่าเป็นใบสั่งซ่อมหรือใบสั่งขาย`);
                }
            }
        };

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_serializerVatType = (instance, options) => {
            const vatTypeId = {
                /**
                 * รวม Vat
                 */
                "IncludeVat": "8c73e506-31b5-44c7-a21b-3819bb712321",
                /**
                 * ไม่รวม Vat
                 */
                "ExcludeVat": "fafa3667-55d8-49d1-b06c-759c6e9ab064",
                /**
                 * ไม่คิด Vat
                 */
                "NoVat": "52b5a676-c331-4d03-b650-69fc5e591d2c"
            };
            const vatType = {
                /**
                 * รวม Vat
                 */
                "IncludeVat": 1,
                /**
                 * ไม่รวม Vat
                 */
                "ExcludeVat": 2,
                /**
                 * ไม่คิด Vat
                 */
                "NoVat": 3,
                "UnknownVat": 0
            };

            if (instance.isNewRecord) {
                switch (instance.get('tax_type_id')) {
                    // 8c73e506-31b5-44c7-a21b-3819bb712321 = รวม Vat (1)
                    case vatTypeId["IncludeVat"]: {
                        instance.set('vat_type', vatType["IncludeVat"]);
                        break;
                    }
                    // fafa3667-55d8-49d1-b06c-759c6e9ab064 = ไม่รวม Vat (2)
                    case vatTypeId["ExcludeVat"]: {
                        instance.set('vat_type', vatType["ExcludeVat"]);
                        break;
                    }
                    // 52b5a676-c331-4d03-b650-69fc5e591d2c = ไม่คิด Vat (3)
                    case vatTypeId["NoVat"]: {
                        instance.set('vat_type', vatType["NoVat"]);
                        break;
                    }
                    default: {
                        instance.set('vat_type', vatType["UnknownVat"]);
                        break;
                    }
                }
            }
        };

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validatorPriceType = (instance, options) => {
            if (instance.isNewRecord) {
                const priceTypeData = [
                    'vat_rate',
                    'price_discount_bill',
                    'price_discount_before_pay',
                    'price_sub_total',
                    'price_discount_total',
                    'price_amount_total',
                    'price_before_vat',
                    'price_vat',
                    'price_grand_total'
                ];

                for (let i = 0; i < priceTypeData.length; i++) {
                    const priceValue = Number(instance.get(priceTypeData[i]));
                    if (!_.isFinite(Number(priceValue))) {
                        throw new Error(`รูปแบบข้อมูลราคา '${priceTypeData[i]}' ไม่ถูกต้อง`);
                    }
                }
            }
        };

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validatorCustomerId = (instance, options) => {
            const bus_customer_id = instance.get('bus_customer_id') || null;
            const per_customer_id = instance.get('per_customer_id') || null;

            if (instance.isNewRecord || instance.get('status') === 1) {
                if (isUUID(bus_customer_id) && isUUID(per_customer_id)) {
                    throw new Error(`ไม่อนุญาติให้มีข้อมูลลูกค้าบคุคลธรรมดาและข้อมูลลูกค้าธุรกิจอยู่ในเอกสารชุดเดียวกัน`);
                }

                if (!isUUID(bus_customer_id) && !isUUID(per_customer_id)) {
                    throw new Error(`ต้องมีข้อมูลลูกค้าบคุคลธรรมดาหรือข้อมูลลูกค้าธุรกิจอยู่ในเอกสารอย่างใดอย่างหนึ่ง`);
                }
            }
        };

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const hookBeforeSave_mutationDocRunNumber = async (instance, options) => {
            const transaction = options?.transaction || null;

            if (instance.isNewRecord && instance.get('is_migrated') === false) { // กรณีสร้างเอกสารใหม่
                const objPrefixDocCode = await utilGetDocumentTypePrefix(
                    instance.get('doc_type_id') || null,
                    {
                        transaction: transaction,
                        defaultPrefix: defaultPrefixDoc
                    }
                );
                instance.set('code_id_prefix', `0${objPrefixDocCode.prefix ? '-' + objPrefixDocCode.prefix : ''}`);

                const createdShopDocumentCode = await ShopDocumentCode.create(
                    {
                        shop_id: instance.get('shop_id'),
                        doc_type_code: instance.get('code_id_prefix')
                    },
                    {
                        transaction: transaction
                    }
                );
                instance.set('code_id', createdShopDocumentCode.get('code_id'));
                return;
            }

            if (
                !instance.isNewRecord && instance.get('is_migrated') === false
                && instance.changed('is_draft')
                && instance.previous('is_draft') === true
                && instance.get('is_draft') === false
            ) { // กรณีปรับเอกสารฉบับร่าง ให้เป็นเอกสารฉบับจริง
                const objPrefixDocCode = await utilGetDocumentTypePrefix(
                    instance.get('doc_type_id') || null,
                    {
                        transaction: transaction,
                        defaultPrefix: defaultPrefixDoc
                    }
                );
                instance.set('code_id_prefix', `${objPrefixDocCode.prefix ? objPrefixDocCode.prefix : ''}`);

                const createdShopDocumentCode = await ShopDocumentCode.create(
                    {
                        shop_id: instance.get('shop_id'),
                        doc_type_code: instance.get('code_id_prefix')
                    },
                    {
                        transaction: transaction
                    }
                );

                instance.set({
                    details: {
                        ...(instance.get('details') || {}),
                        meta_data: {
                            ...((instance.get('details') || {})?.meta_data || {}),
                            data_JOB: {
                                ...((instance.get('details') || {})?.meta_data?.data_JOB || {}),
                                ref_draft_code_id: instance.get('code_id')
                            }
                        },
                    }
                });
                instance.set('code_id', createdShopDocumentCode.get('code_id'));
                return;
            }
        };

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").CreateOptions | import("sequelize/types/model").SaveOptions} options
         */
        const hookBeforeSave_mutationField__details = async (instance, options) => {
            const transaction = options?.transaction || null;

            const getMetaData__bus_customer_id = async (bus_customer_id = null) => {
                if (!isUUID(bus_customer_id)) {
                    return {
                        ShopBusinessCustomer: null,
                        customer_name: {
                            prefix_name: '',
                            first_name: '',
                            last_name: '',
                        },
                        customer_contract_name: ''
                    };
                }
                else {
                    const findData = await ShopBusinessCustomer.findOne({
                        attributes: [
                            'id',
                            'shop_id',
                            'master_customer_code_id',
                            'customer_name',
                            'tax_id',
                            'tel_no',
                            'mobile_no',
                            'e_mail',
                            'address',
                            'subdistrict_id',
                            'district_id',
                            'province_id',
                            'bus_type_id',
                            'other_details',
                        ],
                        where: {
                            id: bus_customer_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    const objCustomerName = {
                        customer_name : {
                            prefix_name: '',
                            first_name: '',
                            last_name: '',
                        },
                        customer_contract_name: ''
                    };
                    if (findData) {
                        /**
                         * @type {string}
                         */
                        const customer_fistName = findData?.customer_name?.th || '';
                        /**
                         * @type {string}
                         */
                        const customer_lastName = '';
                        /**
                         * @type {string}
                         */
                        const customer_contract_name = findData?.other_details?.contact_name || '';

                        objCustomerName.customer_name = {
                            prefix_name: '',
                            first_name: customer_fistName,
                            last_name: customer_lastName
                        };
                        objCustomerName.customer_contract_name = customer_contract_name.length > 0
                            ? customer_contract_name
                            : customer_fistName.length > 0
                                ? `${customer_fistName}`
                                : '';
                    }

                    return {
                        ShopBusinessCustomer: findData?.toJSON() || null,
                        customer_name: objCustomerName.customer_name,
                        customer_contract_name: objCustomerName.customer_contract_name
                    };
                }
            };

            const getMetaData__per_customer_id = async (per_customer_id = null) => {
                if (!isUUID(per_customer_id)) {
                    return {
                        ShopPersonalCustomer: null,
                        customer_name: {
                            prefix_name: '',
                            first_name: '',
                            last_name: '',
                        },
                        customer_contract_name: ''
                    };
                }
                else {
                    const findData = await ShopPersonalCustomer.findOne({
                        attributes: [
                            'id',
                            'shop_id',
                            'master_customer_code_id',
                            'customer_name',
                            'id_card_number',
                            'e_mail',
                            'tel_no',
                            'address',
                            'mobile_no',
                            'subdistrict_id',
                            'district_id',
                            'province_id',
                            'name_title_id'
                        ],
                        include: [
                            {
                                model: NameTitle,
                                as: 'NameTitle',
                                attributes: [
                                    'id',
                                    'code_id',
                                    'name_title',
                                    'initials'
                                ]
                            },
                            {
                                model: SubDistrict,
                                as: 'SubDistrict'
                            },
                            {
                                model: District,
                                as: 'District'
                            },
                            {
                                model: Province,
                                as: 'Province'
                            }
                        ],
                        where: {
                            id: per_customer_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    const objCustomerName = {
                        customer_name : {
                            prefix_name: '',
                            first_name: '',
                            last_name: '',
                        },
                        customer_contract_name: ''
                    };
                    if (findData) {
                        /**
                         * @type {string}
                         */
                        const customer_prefixName = findData?.NameTitle?.name_title?.th || '';
                        /**
                         * @type {string}
                         */
                        const customer_fistName = findData?.customer_name?.first_name?.th || '';
                        /**
                         * @type {string}
                         */
                        const customer_lastName = findData?.customer_name?.last_name?.th || '';

                        objCustomerName.customer_name.prefix_name = customer_prefixName;
                        objCustomerName.customer_name.first_name = customer_fistName;
                        objCustomerName.customer_name.last_name = customer_lastName;

                        objCustomerName.customer_contract_name = customer_fistName.length > 0
                            ? `${customer_fistName} ${customer_lastName}`
                            : '';
                    }

                    return {
                        ShopPersonalCustomer: findData?.toJSON() || null,
                        customer_name: objCustomerName.customer_name,
                        customer_contract_name: objCustomerName.customer_contract_name
                    };
                }
            };

            const getMetaData__vehicle_customer_id = async (vehicle_customer_id = null) => {
                if (!isUUID(vehicle_customer_id)) {
                    return  {
                        ShopVehicleCustomer: null,
                        customer_vehicle_reg_plate: '',
                        customer_vehicle_reg_plate_province_name: '',
                    }
                }
                else {
                    const findData = await ShopVehicleCustomer.findOne({
                        attributes: [
                            'id',
                            'shop_id',
                            'code_id',
                            'details',
                            'bus_customer_id',
                            'per_customer_id',
                            'vehicle_type_id',
                            'vehicle_brand_id',
                            'vehicle_model_id',
                        ],
                        include: [
                            {
                                model: VehicleType,
                                attributes: [
                                    'id',
                                    'code_id',
                                    'internal_code_id',
                                    'type_name',
                                ]
                            },
                            {
                                model: VehicleBrand,
                                attributes: [
                                    'id',
                                    'code_id',
                                    'internal_code_id',
                                    'brand_name',
                                ]
                            },
                            {
                                model: VehicleModelType,
                                attributes: [
                                    'id',
                                    'code_id',
                                    'model_name',
                                    'vehicle_type_id',
                                    'vehicles_brand_id'
                                ]
                            },
                        ],
                        where: {
                            id: vehicle_customer_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    const objVehicleCustomer = {
                        customer_vehicle_reg_plate: '',
                        customer_vehicle_reg_plate_province_name: ''
                    };
                    if (findData) {
                        /**
                         * @type {string}
                         */
                        const customer_vehicle_reg_plate = findData?.details?.registration || '';
                        /**
                         * @type {string}
                         */
                        const customer_vehicle_reg_plate_province_name = findData?.details?.province_name || '';

                        objVehicleCustomer.customer_vehicle_reg_plate = customer_vehicle_reg_plate;
                        objVehicleCustomer.customer_vehicle_reg_plate_province_name = customer_vehicle_reg_plate_province_name;
                    }

                    return  {
                        ShopVehicleCustomer: findData?.toJSON() || null,
                        customer_vehicle_reg_plate: objVehicleCustomer.customer_vehicle_reg_plate,
                        customer_vehicle_reg_plate_province_name: objVehicleCustomer.customer_vehicle_reg_plate_province_name,
                    }
                }
            };

            const getDetails_ShopServiceOrderDoc = async (shop_service_order_doc_id = null) => {
                if (!isUUID(shop_service_order_doc_id)) {
                    return {};
                }
                else {
                    const findData = await ShopServiceOrderDoc.findOne({
                        where: {
                            id: shop_service_order_doc_id
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });

                    return findData?.get('details') || {};
                }
            };

            const [
                metaData__bus_customer_id,
                metaData__per_customer_id,
                metaData__vehicle_customer_id,
                details_ShopServiceOrderDoc
            ] = await Promise.all([
                getMetaData__bus_customer_id(instance.get('bus_customer_id') || null),
                getMetaData__per_customer_id(instance.get('per_customer_id') || null),
                getMetaData__vehicle_customer_id(instance.get('vehicle_customer_id') || null),
                getDetails_ShopServiceOrderDoc(instance.get('id') || null)
            ]);

            const prev__details = instance.previous('details') || {};
            const curr__details = instance.get('details') || {};

            const details = {
                ...(details_ShopServiceOrderDoc || {}),
                ...(prev__details),
                ...(curr__details),
                meta_data: {
                    ...((details_ShopServiceOrderDoc || {})?.meta_data || {}),
                    ...metaData__bus_customer_id,
                    ...metaData__per_customer_id,
                    ...metaData__vehicle_customer_id,
                },
                ...(instance.isNewRecord && instance.get('is_migrated')
                    ? { migrate_data: (instance.get('details')['migrate_data'] || {}) }
                    : {}
                ),
            };

            instance.set({ details: details });
        };

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").CreateOptions | import("sequelize/types/model").SaveOptions} options
         */
        const hookBeforeSave_mutationShopServiceOrderListWhenThisDocumentSetToCancel = async (instance, options) => {
            const transaction = options?.transaction || null;

            if (
                (
                    !instance.isNewRecord
                    && instance.changed('status')
                    && instance.previous('status') === 1
                    && instance.get('status') === 0
                )
                ||
                (
                    !instance.isNewRecord
                    && instance.changed('status')
                    && instance.previous('status') === 1
                    && instance.get('status') === 2
                )
            ) { // เมื่อมีการยกเลิกเอกสาร
                const findShopServiceOrderLists = await ShopServiceOrderList.findAll({
                    where: {
                        shop_service_order_doc_id: instance.get('id'),
                        status: 1
                    },
                    transaction: transaction,
                    ShopModels: ShopModels
                });

                if (findShopServiceOrderLists.length > 0) {
                    if (!Array.isArray(options?.createdDocument__ShopInventoryMovementLogs)) {
                        options.createdDocument__ShopInventoryMovementLogs = [];
                    }
                    for (let index = 0; index < findShopServiceOrderLists.length; index++) {
                        const elementShopServiceOrderList = findShopServiceOrderLists[index];
                        const findCurrentStock = await ShopInventoryMovementLog.findCurrentShopStock(
                            instance.get('shop_id'),
                            elementShopServiceOrderList.get('shop_product_id'),
                            elementShopServiceOrderList.get('shop_warehouse_id'),
                            elementShopServiceOrderList.get('shop_warehouse_shelf_item_id'),
                            elementShopServiceOrderList.get('purchase_unit_id'),
                            elementShopServiceOrderList.get('dot_mfd'),
                            {
                                transaction: transaction
                            }
                        );
                        await utilSetShopStockProductBalance(
                            table_name,
                            elementShopServiceOrderList.get('shop_product_id'),
                            elementShopServiceOrderList.get('shop_warehouse_id'),
                            elementShopServiceOrderList.get('shop_warehouse_shelf_item_id'),
                            elementShopServiceOrderList.get('purchase_unit_id'),
                            elementShopServiceOrderList.get('dot_mfd'),
                            'revert_used_product',
                            elementShopServiceOrderList.get('amount'),
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        );
                        elementShopServiceOrderList.set({
                            updated_by: instance.get('updated_by'),
                            updated_date: instance.get('updated_date')
                        });
                        await elementShopServiceOrderList.save({ transaction: transaction, ShopModels: ShopModels });

                        options.createdDocument__ShopInventoryMovementLogs.push(await ShopInventoryMovementLog.createInventoryMovementLog(
                            instance.get('shop_id'),
                            {
                                document_service_order: {
                                    shop_service_order_doc_id: instance.get('id'),
                                    shop_service_order_list_id: elementShopServiceOrderList.get('id')
                                }
                            },
                            {
                                shop_product_id: findCurrentStock.shop_product_id,
                                shop_stock_id: findCurrentStock.shop_stock_id,
                                shop_warehouse_id: findCurrentStock.shop_warehouse_id,
                                shop_warehouse_shelf_item_id: findCurrentStock.shop_warehouse_shelf_item_id,
                                purchase_unit_id: findCurrentStock.purchase_unit_id,
                                dot_mfd: findCurrentStock.dot_mfd,
                                count_previous_stock: Number(findCurrentStock.balance),
                                count_adjust_stock: Number(elementShopServiceOrderList.get('amount')),
                                count_current_stock: Number(findCurrentStock.balance) + Number(elementShopServiceOrderList.get('amount'))
                            },
                            {
                                created_by: elementShopServiceOrderList.get('updated_by'),
                                created_date: elementShopServiceOrderList.get('updated_date')
                            },
                            {
                                reasons: 'Cancel',
                                documentType: default_doc_type_code_id
                            },
                            {
                                transaction: transaction,
                                ShopModels: ShopModels
                            }
                        ));
                    }
                }
            }
        };

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const hookBeforeValidate_validatorIsDraft = (instance, options) => {
            if (instance.isNewRecord && instance.get('is_migrated') === true) { // ข้ามการ is_draft หากเป็นการสร้างมาจาก migration
                instance.set({ is_draft: false });
            }

            if (!instance.isNewRecord && instance.changed('is_draft')) {
                if (instance.previous('is_draft') === false && instance.get('is_draft') === true) {
                    throw new Error('ไม่อนุญาติให้เปลี่ยนเอกสารฉบับจริงเป็นฉบับร่าง');
                }
            }
        };

        /**
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopServiceOrderDoc> | import("sequelize/types/model").SaveOptions<ShopServiceOrderDoc>} options
         */
        const hookBeforeSave_mutationOtherDocumentsWhenThisDocumentSetToCancel = async (instance, options) => {
            if (!instance.isNewRecord) {
                if (instance.changed('status') && instance.get('status') === 2) { // เมื่อยกเลิกเอกสารใบสั่งซ่อม จะต้องยกเลิกเอกสารใบสั่งสินค้าชั่วคราว ใบกำกับภาษี และการชำระเงินด้วย
                    if (instance.previous('status') !== 1) {
                        throw Error(`ไม่อนุญาตให้ยกเลิกเอกสารใบสั่งซ่อมเนื่องจากเอกสารใบสั่งซ่อมได้ยกเลิกหรือลบไปก่อนแล้ว`);
                    }

                    const transaction = options?.transaction || null;

                    const findShopTemporaryDeliveryOrderDoc = await ShopTemporaryDeliveryOrderDoc.findOne({
                        where: {
                            shop_service_order_doc_id: instance.get('id'),
                            status: 1
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (findShopTemporaryDeliveryOrderDoc) {
                        findShopTemporaryDeliveryOrderDoc.set({
                            status: 2,
                            updated_by: instance.get('updated_by'),
                            updated_date: instance.get('updated_date')
                        });
                        await findShopTemporaryDeliveryOrderDoc.save({ transaction: transaction, ShopModels: ShopModels });
                    }

                    const findShopTaxInvoiceDoc = await ShopTaxInvoiceDoc.findOne({
                        where: {
                            shop_service_order_doc_id: instance.get('id'),
                            status: 1
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    if (findShopTaxInvoiceDoc) {
                        findShopTaxInvoiceDoc.set({
                            status: 2,
                            updated_by: instance.get('updated_by'),
                            updated_date: instance.get('updated_date')
                        });
                        await findShopTaxInvoiceDoc.save({ transaction: transaction, ShopModels: ShopModels });
                    }

                    const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                        where: {
                            shop_service_order_doc_id: instance.get('id'),
                            [Op.or]: [
                                {
                                    canceled_payment_by: null
                                },
                                {
                                    canceled_payment_date: null
                                }
                            ]
                        },
                        transaction: transaction,
                        ShopModels: ShopModels
                    });
                    for (let index = 0; index < findShopPaymentTransactions.length; index++) {
                        const element = findShopPaymentTransactions[index];
                        element.set({
                            canceled_payment_date: instance.get('updated_date'),
                            canceled_payment_by: instance.get('updated_by'),
                            details: {
                                ...(element.get('details')),
                                canceled_payment_reasons: 'ยกเลิกเอกสารใบสั่งซ่อม/ใบสั่งขาย',
                            },
                            updated_by: instance.get('updated_by'),
                            updated_date: instance.get('updated_date')
                        });
                        await element.save({ transaction: transaction, ShopModels: ShopModels });
                    }

                    instance.set({ payment_paid_status: 0 });
                }
            }
        };

        /**
         * ปรับปรุงฟิวส์ "สถานะการชําระเงิน" (payment_paid_status) เมื่อมีการแก้ไขเอกสารใบสั่งซ่อม/ใบสั่งขาย
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopServiceOrderDoc> | import("sequelize/types/model").SaveOptions<ShopServiceOrderDoc>} options
         */
        const hookBeforeSave_mutationField__payment_paid_status = async (instance, options) => {
            if (instance.isNewRecord && instance.get('is_migrated') === true) { // ข้ามการ is_draft หากเป็นการสร้างมาจาก migration
                return;
            }

            if (instance.isNewRecord) { // การสร้างเอกสารใหม่ เป็นการ "ยังไม่ชำระ"
                instance.set({ payment_paid_status: 1 });
                return;
            }

            if (!instance.isNewRecord) { // หากเอกสารเคยยกเลิกมาแล้วจะต้องไม่สามารถปรับปรุงการชำระเงินได้
                if (instance.previous('status') !== 1) {
                    return;
                }
            }

            if (
                instance.changed('is_draft')
                && instance.previous('is_draft') === true
                && instance.get('is_draft') === false
            ) { // หากเอกสารนี้เป็นการเปลี่ยนจากฉบับร่างเป็นฉบับจริง สถาณะการชำระเงิน ถือว่า "ยังไม่ชำระ" (1)
                instance.set({ payment_paid_status: 1 });
                return;
            }

            const transaction = options?.transaction || null;

            const countShopPaymentTransactions = await ShopPaymentTransaction.count({
                where: {
                    shop_service_order_doc_id: instance.get('id')
                },
                transaction: transaction,
                ShopModels: ShopModels
            });
            if (countShopPaymentTransactions === 0) { // ยังไม่มีการชำระเงิน
                instance.set({ payment_paid_status: 1 });
                return;
            }

            const findShopPaymentTransactions = await ShopPaymentTransaction.findAll({
                where: {
                    shop_service_order_doc_id: instance.get('id'),
                    canceled_payment_date: null
                },
                transaction: transaction,
                ShopModels: ShopModels
            });

            /**
             * จำนวนเงินที่ต้องชำระ
             */
            const price_grand_total = new currencyJS(instance.get('price_grand_total') || 0, optionsCurrencyJS);

            /**
             * ยอดเงินที่ชำระไปแล้ว
             */
            const reduce__payment_price_paid = new currencyJS(
                findShopPaymentTransactions.reduce((previousValue, currentValue) => previousValue + Number(currentValue.get('payment_price_paid') || 0), 0),
                optionsCurrencyJS
            );

            if (reduce__payment_price_paid.value < price_grand_total.value) { // เมื่อมีการชำระเงินมาแล้ว แล้วยอดชำระรวมกันแล้วยังน้อยกว่าจำยวนที่ต้องชำระ จะถือว่า "ค้างชำระ" (2)
                instance.set({ payment_paid_status: 2 });
            }

            if (reduce__payment_price_paid.value > price_grand_total.value) { // เมื่อมีการชำระเงินมาแล้ว แล้วยอดชำระรวมกันแล้วยังน้อยกว่าจำยวนที่ต้องชำระ จะถือว่า "ชําระเกิน" (4)
                instance.set({ payment_paid_status: 4 });
            }

            if (reduce__payment_price_paid.value === price_grand_total.value) { // เมื่อมีการชำระเงินมาแล้ว และราคาเท่ากัน ถือว่า "ชำระเงินแล้ว" (3)
                instance.set({ payment_paid_status: 3 });
            }
        };

        /**
         * ปรับปรุงฟิวส์ (details.current_mileage) เมื่อมีการยืนยันเอกสารใบสั่งซ่อม/ใบสั่งขายเป็นฉบับจริง
         * @param {ShopServiceOrderDoc} instance
         * @param {import("sequelize/types/model").UpdateOptions<ShopServiceOrderDoc> | import("sequelize/types/model").SaveOptions<ShopServiceOrderDoc>} options
         */
        const hookBeforeSave_mutationField__details__current_mileage = async (instance, options) => {
            if (!instance.isNewRecord
                && instance.changed('is_draft') === true
                && instance.previous('is_draft') === true
                && instance.get('is_draft') === false
            ) {
                const transaction = options?.transaction;

                /**
                 * @type {number}
                 */
                let current_mileage = Number((instance.get('details') || {})?.current_mileage);
                if (_.isFinite(current_mileage)) {
                    const vehicle_customer_id = instance.get('vehicle_customer_id') || null;
                    if (isUUID(vehicle_customer_id)) {
                        const findShopVehicleCustomer = await ShopVehicleCustomer.findOne({
                            where: {
                                id: vehicle_customer_id
                            },
                            transaction: transaction
                        });
                        if (findShopVehicleCustomer) {
                            const details = findShopVehicleCustomer.get('details') || {};

                            /**
                             * @type {string}
                             */
                            let currDate = instance.get('updated_date') || null;
                            if (currDate) {
                                currDate = (new Date(currDate)).toISOString();
                            }
                            else {
                                currDate = (new Date()).toISOString()
                            }

                            if (!details?.mileage_first) {
                                details.mileage_first = current_mileage;
                                details.mileage = current_mileage;
                            }
                            else {
                                if (!details?.mileage) {
                                    details.mileage = current_mileage;
                                }
                                else {
                                    if (current_mileage > Number(details.mileage)) {
                                        details.mileage = current_mileage;
                                    }
                                }
                            }

                            if (!details?.service_date_first) {
                                details.service_date_first = currDate;
                            }
                            if (!details?.service_date_last) {
                                details.service_date_last = currDate;
                            }
                            else {
                                const prevDate__ = (new Date(details.service_date_last));
                                const currDate__ = (new Date(currDate));

                                if (currDate__.valueOf() > prevDate__.valueOf()) {
                                    details.service_date_last = currDate__.toISOString();
                                }
                            }

                            await ShopVehicleCustomer.update(
                                {
                                    details: details
                                },
                                {
                                    where: {
                                        id: vehicle_customer_id
                                    },
                                    transaction: transaction,
                                    ShopModels: ShopModels
                                }
                            );
                            return;
                        }
                    }
                }
            }
        };

        return {
            hookBeforeValidate_serializerDocRunNumber,
            hookBeforeValidate_serializerVatType,
            hookBeforeValidate_validatorPriceType,
            hookBeforeValidate_validatorCustomerId,
            hookBeforeSave_mutationDocRunNumber,
            hookBeforeSave_mutationField__details,
            hookBeforeSave_mutationShopServiceOrderListWhenThisDocumentSetToCancel,
            hookBeforeValidate_validatorIsDraft,
            hookBeforeSave_mutationOtherDocumentsWhenThisDocumentSetToCancel,
            hookBeforeSave_mutationField__payment_paid_status,
            hookBeforeSave_mutationField__details__current_mileage
        }
    };

    ShopServiceOrderDoc.beforeValidate(async (instance, options) => {
        instance.myHookFunctions = hookFunctions({ ShopModels: options?.ShopModels });

        instance.myHookFunctions.hookBeforeValidate_validatorIsDraft(instance, options);
        instance.myHookFunctions.hookBeforeValidate_validatorCustomerId(instance, options);
        instance.myHookFunctions.hookBeforeValidate_validatorPriceType(instance, options);
        instance.myHookFunctions.hookBeforeValidate_serializerVatType(instance, options);
        instance.myHookFunctions.hookBeforeValidate_serializerDocRunNumber(instance, options);
    });

    ShopServiceOrderDoc.beforeSave(async (instance, options) => {
        await instance.myHookFunctions.hookBeforeSave_mutationDocRunNumber(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationShopServiceOrderListWhenThisDocumentSetToCancel(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__details(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__details__current_mileage(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationField__payment_paid_status(instance, options);
        await instance.myHookFunctions.hookBeforeSave_mutationOtherDocumentsWhenThisDocumentSetToCancel(instance, options);
    });

    return ShopServiceOrderDoc;
};


module.exports = ShopServiceOrderDoc;