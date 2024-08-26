const Model = require("sequelize").Model;
const { DataTypes, literal, Transaction } = require("sequelize");
const db = require("../../db");
const utilGetRunNumberFromModel = require("../../utils/util.GetRunNumberFromModel");

class BankNameList extends Model { }

BankNameList.init(
    {
        id: {
            comment: `รหัสหลักตารางข้อมูลมาสเตอร์ชื่อธนาคาร`,
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: literal('uuid_generate_v4()')
        },
        run_no: {
            comment: `Running number`,
            type: DataTypes.INTEGER
        },
        code_id: {
            comment: `รหัสชื่อธนาคาร`,
            type: DataTypes.STRING,
            allowNull: true
        },
        internal_code_id: {
            comment: `รหัสภายในชื่อธนาคาร`,
            type: DataTypes.STRING,
            allowNull: true
        },
        bank_name: {
            type: DataTypes.JSONB,
            comment: `ชื่อธนาคาร เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }`,
            allowNull: false
        },
        details: {
            comment: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON',
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        isuse: {
            comment: `สถานะการใช้งานข้อมูล (0=ลบข้อมูล, 1=ใช้งานข้อมูล , 2=ไม่ใช้งานข้อมูล)`,
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                isIn: [[0, 1, 2]]
            },
            defaultValue: 1
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
                model: {
                    schema: 'systems',
                    tableName: 'sysm_users'
                },
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        updated_date: {
            comment: `ปรับปรุงข้อมูลวันที่`,
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize: db,
        modelName: 'BankNameList',
        schema: 'master_lookup',
        tableName: 'mas_bank_name_list',
        timestamps: false
    }
);


/**
 * @param {BankNameList} instance
 * @param {import("sequelize/types/model").ValidationOptions} options
 */
const preCreateRunNumber = (instance, options) => {
    if (instance.isNewRecord) {
        instance.set('run_no', -1);
        instance.set('code_id', 'BK');
    }
};


/**
 * @param {BankNameList} instance
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
                    BankNameList,
                    'run_no',
                    {
                        transaction: t,
                        prefix_config: 'BK'
                    }
                );
                instance.set('run_no', createRunNumber.runNumber);
                instance.set('code_id', createRunNumber.runString);
            }
        )
    }
};


BankNameList.beforeValidate((instance, options) => {
    preCreateRunNumber(instance, options);
});

BankNameList.beforeCreate(async (instance, options) => {
    await createRunNumber(instance, options);
});


module.exports = BankNameList;