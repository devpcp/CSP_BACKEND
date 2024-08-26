const Model = require("sequelize").Model;
const { DataTypes, Transaction } = require("sequelize");
const db = require("../../db");
const {
    config_run_number_shop_hq_prefix: defaultPrefixDoc,
} = require("../../config");

class ShopHq extends Model { }

ShopHq.init({
    id: {
        comment: 'รหัสหลักตารางของ Multi Branch (HQ)',
        type: DataTypes.UUID,
        defaultValue: db.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
    },
    code_id: {
        comment: 'รหัสเอกสาร',
        type: DataTypes.STRING,
        allowNull: false
    },
    run_no: {
        comment: 'เลขที่ run เอกสาร',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    internal_code_id: {
        comment: 'รหัสเอกสาร (ภายใน)',
        type: DataTypes.STRING,
        allowNull: true
    },
    hq_name: {
        comment: 'ชื่อของ HQ',
        type: DataTypes.JSONB,
        allowNull: false
    },
    order_by: {
        comment: 'ลำดับรายการ',
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    details: {
        comment: 'ข้อมูลรายละเอียดเก็บเป็น JSONB',
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    isuse: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        comment: `สถานะการใช้งานข้อมูล 0=ยกเลิก, 1=ใช้งาน, 2=ลบลงถังขยะ`
    },
    created_by: {
        comment: 'สร้างข้อมูลโดย',
        type: DataTypes.UUID,
        references: {
            model: {
                schema: 'systems',
                tableName: 'sysm_users',
            },
            key: 'id'
        },
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    created_date: {
        comment: 'สร้างข้อมูลวันที่',
        type: DataTypes.DATE,
        defaultValue: db.literal('now()'),
        allowNull: false
    },
    updated_by: {
        comment: 'ปรับปรุงข้อมูลโดย',
        type: DataTypes.UUID,
        references: {
            model: {
                schema: 'systems',
                tableName: 'sysm_users',
            },
            key: 'id'
        },
        allowNull: true,
        defaultValue: null,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    updated_date: {
        comment: 'ปรับปรุงข้อมูลวันที่',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    sequelize: db,
    modelName: 'ShopHq',
    schema: 'app_datas',
    tableName: 'dat_shop_hq',
    timestamps: false,
    comment: 'ตารางข้อมูลเก็บข้อมูลระบบ Multi Branch (HQ)',
});


/**
 * @param {ShopHq} instance
 * @param {import("sequelize/types/model").ValidationOptions} options
 */
const preCreateRunNumber = (instance, options) => {
    if (instance.isNewRecord) {
        instance.set('run_no', -1);
        instance.set('code_id', 'XXXX');
    }
};

/**
 * @param {ShopHq} instance
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
                const utilGetRunNumberFromModel = require("../../utils/util.GetRunNumberFromModel");
                const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");
                const createRunNumber = await utilGetRunNumberFromModel(
                    ShopHq,
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


ShopHq.beforeValidate((instance, options) => {
    preCreateRunNumber(instance, options);
});

ShopHq.beforeCreate(async (instance, options) => {
    await createRunNumber(instance, options);
});


module.exports = ShopHq;