/**
 * A function do dynamics table of model ShopQuotationDoc
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_quotation_doc"
 * @return An instance of model ShopQuotationDoc by sequelize
 */
const ShopQuotationDoc = (table_name) => {
    if (!table_name) { throw Error(`Require parameter 'table_name'`); }
    table_name = table_name.toLowerCase();

    const _ = require("lodash");
    const utilGetRunNumberFromModel = require("../../utils/util.GetRunNumberFromModel");
    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Transaction } = require("sequelize");

    const db = require("../../db");

    const modelUser = require("../Users/User");
    const modelShopProfile = require("../model").ShopsProfiles;
    const modelDocumentType = require("../model").DocumentTypes;
    const modelTaxType = require("../model").TaxTypes;
    const modelShopBusinessCustomer = require("../model").ShopBusinessCustomers(table_name);
    const modelShopPersonalCustomer = require("../model").ShopPersonalCustomers(table_name);
    const modelShopVehicleCustomer = require("../model").ShopVehicleCustomer(table_name);

    const defaultPrefixDoc = require("../../config").config_run_number_shop_quotation_prefix;

    class ShopQuotationDoc extends Model { }

    ShopQuotationDoc.init(
        {
            id: {
                comment: `รหัสหลักตารางข้อมูลเอกสารใบเสนอราคา`,
                type: DataTypes.UUID,
                defaultValue: literal('uuid_generate_v4()'),
                allowNull: true,
                primaryKey: true
            },
            run_no: {
                comment: `เลขที่ run เอกสาร`,
                type: DataTypes.INTEGER,
                allowNull: false
            },
            code_id: {
                comment: `รหัสเลขที่เอกสาร`,
                type: DataTypes.STRING,
                allowNull: false
            },
            shop_id: {
                comment: `รหัสตารางข้อมูลร้านค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfile,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            doc_date: {
                comment: `วันที่เอกสาร`,
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            doc_type_id: {
                comment: `รหัสตารางข้อมูลประเภทเอกสาร`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelDocumentType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            doc_type_code_id: {
                comment: 'รหัสประเภทเอกสาร',
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: defaultPrefixDoc
            },
            doc_quotation_code_id: {
                comment: 'ประเภทใบเสนอราคา' +
                    '\n 1 = ค้าปลีก' +
                    '\n 2 = ค้าส่ง',
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[0, 1, 2]]
                }
            },
            bus_customer_id: {
                comment: `รหัสตารางข้อมูลลูกค้าธุรกิจ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopBusinessCustomer,
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
                    model: modelShopPersonalCustomer,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            vehicles_customers_id: {
                comment: `รหัสตารางข้อมูลยานพาหนะ`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelShopVehicleCustomer,
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
                    model: modelTaxType,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            vat_type: {
                comment: `ประเภทภาษีมูลค่าเพิ่ม (Vat types)`
                    + `\n1 = รวมภาษีมูลค่าเพิ่ม`
                    + `\n2 = ไม่รวมภาษีมูลค่าเพิ่ม`
                    + `\n3 = ไม่คิดภาษีมูลค่าเพิ่ม`,
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isIn: [[0, 1, 2, 3]]
                }
            },
            vat_value: {
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
            details: {
                comment: 'รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON',
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            status: {
                comment: `สถานะเอกสาร 0 = ลบเอกสาร, 1 = ใช้งานเอกสาร, 2 = ยกเลิกเอกสาร`,
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
                    model: modelUser,
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
                    model: modelUser,
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
            modelName: 'ShopQuotationDoc',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_quotation_doc`,
            comment: 'ตารางข้อมูลเอกสารใบเสนอราคา',
            timestamps: false
        }
    );

    ShopQuotationDoc.belongsTo(modelShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopQuotationDoc.belongsTo(modelDocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopQuotationDoc.belongsTo(modelShopBusinessCustomer, { foreignKey: 'bus_customer_id', as: 'ShopBusinessCustomer' });
    ShopQuotationDoc.belongsTo(modelShopPersonalCustomer, { foreignKey: 'per_customer_id', as: 'ShopPersonalCustomer' });
    ShopQuotationDoc.belongsTo(modelShopVehicleCustomer, { foreignKey: 'vehicles_customers_id', as: 'ShopVehicleCustomer' });
    ShopQuotationDoc.belongsTo(modelTaxType, { foreignKey: 'tax_type_id', as: 'TaxType' });
    ShopQuotationDoc.belongsTo(modelUser, { foreignKey: 'created_by', as: 'CreatedBy' });
    ShopQuotationDoc.belongsTo(modelUser, { foreignKey: 'updated_by', as: 'UpdatedBy' });

    /**
     * @param {ShopQuotationDoc} instance
     * @param {import("sequelize/types/model").ValidationOptions} options
     */
    const preCreateRunNumber = (instance, options) => {
        if (instance.isNewRecord) {
            instance.set('run_no', 0);
            instance.set('code_id', 'QOU');
        }
    };

    /**
     * @param {ShopQuotationDoc} instance
     * @param {import("sequelize/types/model").CreateOptions} options
     */
    const createRunNumber = async (instance, options) => {
        if (instance.isNewRecord) {
            await db.transaction(
                {
                    transaction: options.transaction,
                    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                },
                async (t) => {
                    const createRunNumber = await utilGetRunNumberFromModel(
                        ShopQuotationDoc,
                        'run_no',
                        {
                            transaction: t,
                            prefix_config: (await utilGetDocumentTypePrefix(
                                instance.get('doc_type_id'),
                                {
                                    transaction: t,
                                    defaultPrefix: defaultPrefixDoc
                                }
                            )).prefix
                        }
                    );
                    instance.set('run_no', createRunNumber.runNumber);
                    instance.set('code_id', createRunNumber.runString);
                }
            )
        }
    };

    /**
     * @param {ShopQuotationDoc} instance
     * @param {import("sequelize/types/model").ValidationOptions} options
     */
    const preVatTypeSerializer = (instance, options) => {
        if (instance.isNewRecord) {
            switch (instance.get('tax_type_id')) {
                // 8c73e506-31b5-44c7-a21b-3819bb712321 = รวม Vat (1)
                case '8c73e506-31b5-44c7-a21b-3819bb712321': {
                    instance.set('vat_type', 1);
                    break;
                }
                // fafa3667-55d8-49d1-b06c-759c6e9ab064 = ไม่รวม Vat (2)
                case 'fafa3667-55d8-49d1-b06c-759c6e9ab064': {
                    instance.set('vat_type', 2);
                    break;
                }
                // 52b5a676-c331-4d03-b650-69fc5e591d2c = ไม่คิด Vat (3)
                case '52b5a676-c331-4d03-b650-69fc5e591d2c': {
                    instance.set('vat_type', 3);
                    break;
                }
                default: {
                    instance.set('vat_type', 0);
                    break;
                }
            }
        }
    }

    /**
     * @param {ShopQuotationDoc} instance
     * @param {import("sequelize/types/model").ValidationOptions} options
     */
    const priceTypeValidator = (instance, options) => {
        if (instance.isNewRecord) {
            const priceTypeData = [
                'vat_value',
                'price_discount_bill',
                'price_sub_total',
                'price_discount_total',
                'price_amount_total',
                'price_before_vat',
                'price_vat',
                'price_grand_total'
            ];

            for (let i = 0; i < priceTypeData.length; i++) {
                if (!_.isFinite(Number(instance.get(priceTypeData[i]))) || Number(instance.get(priceTypeData[i])) < 0) {
                    throw Error(`ShopQuotationDoc: Variable 'price_type' ${priceTypeData[i]} is not a number Price`);
                }
            }
        }
    };

    ShopQuotationDoc.beforeValidate((instance, options) => {
        preCreateRunNumber(instance, options);
        preVatTypeSerializer(instance, options);
        priceTypeValidator(instance, options);
    });

    ShopQuotationDoc.beforeCreate(async (instance, options) => {
        if (instance.isNewRecord) {
            instance.set('doc_quotation_code_id', 1);
        }
        await createRunNumber(instance, options);
    });

    return ShopQuotationDoc;
};


module.exports = ShopQuotationDoc;