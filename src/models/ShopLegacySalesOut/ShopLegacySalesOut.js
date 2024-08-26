/**
 * A function do dynamics table of model ShopLegacySalesOut
 * @param {string} table_name - Dynamics table's name of "dat_${table_name}_legacy_sales_out"
 * @return An instance of model ShopLegacySalesOut by sequelize
 */
const ShopLegacySalesOut = (table_name = "") => {
    if (!table_name) { throw Error(`Require parameter "table_name"`); }
    else {
        table_name = table_name.toLowerCase();

        const _ = require("lodash");

        const Model = require("sequelize").Model;
        const { DataTypes, fn, Transaction } = require("sequelize");

        const db = require('../../db');

        const modelShopProfiles = require("../model").ShopsProfiles;
        const modelUsers = require("../model").User;

        const utilGetRunNumberFromModel = require("../../utils/util.GetRunNumberFromModel");

        const config_document_code_prefix = 'LGSO';

        class ShopLegacySalesOut extends Model { }

        ShopLegacySalesOut.init({
            id: {
                comment: `รหัสหลักตารางข้อมูลการสั่งซื้อสินค้า`,
                type: DataTypes.UUID,
                defaultValue: fn(`uuid_generate_v4`),
                allowNull: false,
                primaryKey: true
            },
            shop_id: {
                comment: `รหัสตารางข้อมูลร้านค้า`,
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: modelShopProfiles,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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
            document_code_id: {
                comment: `รหัสเลขที่เอกสาร`,
                type: DataTypes.STRING,
                allowNull: true
            },
            document_date: {
                comment: `วันที่เอกสาร`,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            customer_name: {
                comment: `ชื่อสกุลลูกค้า`,
                type: DataTypes.STRING,
                allowNull: true
            },
            customer_vehicle_reg_plate: {
                comment: `ทะเบียนรถลูกค้า`,
                type: DataTypes.STRING,
                allowNull: true
            },
            customer_tel_no: {
                comment: `เบอร์ติดต่อ`,
                type: DataTypes.STRING,
                allowNull: true
            },
            customer_latest_contact_date: {
                comment: `วันที่ติดต่อล่าสุด`,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            product_code: {
                comment: `รหัสสินค้า`,
                type: DataTypes.STRING,
                allowNull: true
            },
            product_name: {
                comment: `ชื่อสินค้า`,
                type: DataTypes.STRING,
                allowNull: true
            },
            product_amount: {
                comment: `จำนวนสินค้า`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },
            price_grand_total: {
                comment: `จำนวนเงินสุทธิ`,
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            details: {
                comment: `รายละเอียดข้อมูลอื่น ๆ เก็บเป็น JSON`,
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            status: {
                comment: `สถานะของรายการ 0 = ลบรายการ, 1 = ใช้งานรายการ`,
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1
            },
            created_date: {
                comment: `สร้างข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: fn(`now`)
            },
            created_by: {
                comment: `สร้างข้อมูลโดย`,
                type: DataTypes.UUID,
                allowNull: false,
                defaultValue: '90f5a0a9-a111-49ee-94df-c5623811b6cc',
                references: {
                    model: modelUsers,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            updated_date: {
                comment: `ปรับปรุงข้อมูลวันที่`,
                type: DataTypes.DATE,
                allowNull: true
            },
            updated_by: {
                comment: `ปรับปรุงข้อมูลโดย`,
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: modelUsers,
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            }
        }, {
            sequelize: db,
            modelName: 'ShopLegacySalesOut',
            schema: 'app_shops_datas',
            tableName: `dat_${table_name}_legacy_sales_out`,
            comment: 'ตารางรางข้อมูลรายการข้อมูลการขายเก่า',
            timestamps: false,
        });

        ShopLegacySalesOut.belongsTo(modelShopProfiles, { foreignKey: 'shop_id', as: 'ShopsProfile' });

        /**
         * @param {ShopLegacySalesOut} instance
         * @param {import("sequelize/types/model").ValidationOptions} options
         */
        const preCreateRunNumber = (instance, options) => {
            if (instance.isNewRecord) {
                instance.set('run_no', -1);
                instance.set('code_id', config_document_code_prefix);
            }
        };

        /**
         * @param {ShopLegacySalesOut} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const createRunNumber = async (instance, options) => {
            if (instance.isNewRecord && instance.get('run_no') === -1) {
                if (!options.addSeqNumber) {
                    options.addSeqNumber = 0;
                }

                await db.transaction(
                    {
                        transaction: options.transaction,
                        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
                    },
                    async (t) => {
                        const createRunNumber = await utilGetRunNumberFromModel(
                            ShopLegacySalesOut,
                            'run_no',
                            {
                                transaction: t,
                                prefix_config: config_document_code_prefix,
                                addSeqNumber: options.addSeqNumber
                            }
                        );
                        instance.set('run_no', createRunNumber.runNumber);
                        instance.set('code_id', createRunNumber.runString);
                    }
                )
            }
        };

        /**
         * @param {ShopLegacySalesOut} instance
         * @param {import("sequelize/types/model").CreateOptions} options
         */
        const detailsSerializer = async (instance, options) => {
            if (instance.isNewRecord) {
                const details = { ...(instance.get('details') || {}) };

                if (_.has(details, 'mileage')) {
                    details.mileage = Number((Number(details.mileage)).toFixed(2));
                }

                instance.set('details', details);
            }
        };

        ShopLegacySalesOut.beforeBulkCreate(async (instances, options) => {
            if (instances.length > 0) {
                for (let index = 0; index < instances.length; index++) {
                    const instance = instances[index];
                    preCreateRunNumber(instance, options);
                }

                const createRunNumber = await utilGetRunNumberFromModel(
                    ShopLegacySalesOut,
                    'run_no',
                    {
                        transaction: options.transaction,
                        prefix_config: config_document_code_prefix
                    }
                );

                for (let index = 0; index < instances.length; index++) {
                    const instance = instances[index];
                    const newRunNumber = createRunNumber.runNumber + index;
                    const newStringRowNumber = _.padStart(String(newRunNumber), 4, "0");
                    const concatStringRunNumber = `${createRunNumber.stringPrefix}${newStringRowNumber}`;
                    instance.set('run_no', newRunNumber);
                    instance.set('code_id', concatStringRunNumber);
                    await detailsSerializer(instance, options);
                }
            }
        });

        ShopLegacySalesOut.beforeValidate((instance, options) => {
            preCreateRunNumber(instance, options);
        });

        ShopLegacySalesOut.beforeCreate(async (instance, options) => {
            await createRunNumber(instance, options);
            await detailsSerializer(instance, options);
        });

        return ShopLegacySalesOut;
    }
};

module.exports = ShopLegacySalesOut;