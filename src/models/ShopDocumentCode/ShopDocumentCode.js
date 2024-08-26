/**
 * A function do dynamics table of model ShopDocumentCode
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_document_code"
 */
const ShopDocumentCode = (table_name) => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    table_name = table_name.toLowerCase();

    const Model = require("sequelize").Model;
    const { DataTypes, literal, Transaction } = require("sequelize");

    const db = require("../../db");

    const modelUser = require("../model").User;
    const modelShopProfile = require("../model").ShopsProfiles;
    const modelDocumentType = require("../model").DocumentTypes;

    const utilGetRunNumberFromModel = require("../../utils/util.GetRunNumberFromModel");
    const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");

    const defaultPrefixDoc = 'DOCXXX';

    class ShopDocumentCode extends Model { }

    ShopDocumentCode.init({
        id: {
            comment: `รหัสหลักตารางตารางรหัสเอกสาร`,
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true
        },
        shop_id: {
            comment: `รหัสข้อมูลร้านค้า`,
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: {
                    schema: 'app_datas',
                    tableName: 'dat_shops_profiles'
                },
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        doc_type_id: {
            comment: `รหัสประเภทเอกสาร\n`
                + `Foreign key: master_lookup.mas_document_types.id`,
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: {
                    schema: 'master_lookup',
                    tableName: 'mas_document_types'
                },
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        doc_type_code: {
            comment: 'รหัสประเภทเอกสาร',
            type: DataTypes.STRING,
            allowNull: true
        },
        run_no: {
            comment: `เลขที่ Running number ของเอกสาร`,
            type: DataTypes.INTEGER,
            allowNull: false
        },
        code_id: {
            comment: `รหัสเอกสาร`,
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        created_by: {
            comment: `สร้างข้อมูลโดย`,
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: {
                    schema: 'systems',
                    tableName: 'sysm_users'
                },
                key: 'id'
            },
            defaultValue: '90f5a0a9-a111-49ee-94df-c5623811b6cc',
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
            defaultValue: null,
            references: {
                model: {
                    schema: 'systems',
                    tableName: 'sysm_users'
                },
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
        },
    }, {
        sequelize: db,
        modelName: 'ShopDocumentCode',
        tableName: `dat_${table_name}_document_code`,
        schema: 'app_shops_datas',
        comment: 'ตารางรหัสเอกสาร',
        timestamps: false,
        updated_date: false,
        updated_by: false
    });

    ShopDocumentCode.belongsTo(modelShopProfile, { foreignKey: 'shop_id', as: 'ShopsProfile' });
    ShopDocumentCode.belongsTo(modelDocumentType, { foreignKey: 'doc_type_id', as: 'DocumentType' });
    ShopDocumentCode.belongsTo(modelUser, { foreignKey: 'created_by', as: 'CreatedByUser' });
    ShopDocumentCode.belongsTo(modelUser, { foreignKey: 'updated_by', as: 'UpdatedByUser' });

    /**
     * @param {ShopDocumentCode} instance
     * @param {import("sequelize/types/model").ValidationOptions} options
     */
    const preCreateRunNumber = (instance, options) => {
        if (instance.isNewRecord) {
            instance.set('run_no', 0);
            instance.set('code_id', defaultPrefixDoc);
        }
    };

    /**
     * @param {ShopDocumentCode} instance
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
                    if (instance.get('doc_type_id')) {
                        const prefixDocCode = await utilGetDocumentTypePrefix(
                            instance.get('doc_type_id'),
                            {
                                transaction: t,
                                defaultPrefix: defaultPrefixDoc
                            }
                        );
                        instance.set('doc_type_code', prefixDocCode.prefix);
                    }

                    const createRunNumber = await utilGetRunNumberFromModel(
                        ShopDocumentCode,
                        'run_no',
                        {
                            transaction: t,
                            prefix_config: instance.get('doc_type_code') || null,
                            whereQuery: {
                                doc_type_id: instance.get('doc_type_id') || null,
                                doc_type_code: instance.get('doc_type_code') || null
                            }
                        }
                    );
                    instance.set('run_no', createRunNumber.runNumber);
                    instance.set('code_id', createRunNumber.runString);
                }
            )
        }
    };

    ShopDocumentCode.beforeValidate((instance, options) => {
        preCreateRunNumber(instance, options);
    });

    ShopDocumentCode.beforeCreate(async (instance, options) => {
        await createRunNumber(instance, options);
    });

    return ShopDocumentCode;
};

module.exports = ShopDocumentCode;