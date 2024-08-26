/**
 * @type {import("sequelize").Model<IModelUsersProfilesAttributes, IModelUsersProfilesCreationAttributes>}
 */
const Model = require("sequelize").Model;
const { DataTypes, literal } = require("sequelize");
const db = require("../../db");
const modelDistrict = require("../Master/DIstrict");
const modelNameTitle = require("../Master/NameTitle");
const modelProvince = require("../Master/Province");
const modelSubDistrict = require("../Master/SubDIstrict");
const modelUser = require("../Users/User");
const modelShopHq = require("../ShopHq/ShopHq");
const modelShopsProfiles = require("../ShopsProfiles/ShopsProfiles");
const ShopDocumentCode = require("../ShopDocumentCode/ShopDocumentCode");

const default_code_id_prefix = 'EMP';

class UsersProfiles extends Model {
    /**
     * @param {string} table_name
     * @param {string} user_profile_id
     * @param {{
     *     transaction?: import("sequelize").Transaction;
     *     ShopDocumentCode?: Object;
     *     findUserProfile?: UsersProfiles;
     * }} options
     * @returns {Promise<{is_created: boolean; UserProfile: UsersProfiles;}>}
     */
    static async setField_code_id (table_name, user_profile_id, options = {}) {
        if (!table_name) { throw new Error(`Require parameter 'table_name'`); }
        if (!user_profile_id) { throw new Error(`Require parameter 'user_profile_id'`); }

        const transaction = options?.transaction || null;

        /**
         * @type {UsersProfiles}
         */
        const findUserProfile = options?.findUserProfile
        ? options?.findUserProfile
        : await UsersProfiles.findOne({
            where: {
                id: user_profile_id
            },
            transaction: transaction
        });

        let is_created = false;
        if (!findUserProfile) { throw new Error(`ไม่พบข้อมูลผู้ใช้`); }
        else {
            if (!findUserProfile.get('code_id')) {
                if (!findUserProfile.get('code_id_prefix')) {
                    findUserProfile.set('code_id_prefix', default_code_id_prefix);
                }
                const modelShopDocumentCode = options?.ShopDocumentCode || ShopDocumentCode(table_name.toLowerCase());

                const utilGetDocumentTypePrefix = require("../../utils/util.GetDocumentTypePrefix");
                const objPrefixDocCode = await utilGetDocumentTypePrefix(
                    null,
                    {
                        transaction: transaction,
                        defaultPrefix: findUserProfile.get('code_id_prefix') || default_code_id_prefix
                    }
                );

                const createdShopDocumentCode = await modelShopDocumentCode.create(
                    {
                        shop_id: findUserProfile.get('shop_id'),
                        doc_type_code: objPrefixDocCode.prefix
                    },
                    {
                        transaction: transaction
                    }
                );

                findUserProfile.set('code_id', createdShopDocumentCode.get('code_id'));

                const details = {
                    ...findUserProfile.get('details')
                };
                if (!details?.emp_code) {
                    details.emp_code = createdShopDocumentCode.get('code_id');
                    findUserProfile.set('details', details);
                }

                await findUserProfile.save({ transaction: transaction, hooks: false });

                is_created = true;
            }
            else {
                const details = {
                    ...findUserProfile.get('details')
                };
                if (!details?.emp_code) {
                    details.emp_code = findUserProfile.get('code_id');
                    findUserProfile.set('details', details);
                    await findUserProfile.save({ transaction: transaction, hooks: false });
                }
            }
        }

        return {
            is_created: is_created,
            UserProfile: await findUserProfile.reload({ transaction: transaction })
        };
    }
}

UsersProfiles.init(
    {
        id: {
            comment: 'รหัสหลักตารางข้อมูลส่วนบุคคลผู้ใช้งานระบบ',
            type: DataTypes.UUID,
            defaultValue: literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true
        },
        code_id: {
            comment: `รหัสเลขที่เอกสาร`,
            type: DataTypes.STRING,
            allowNull: true
        },
        code_id_prefix: {
            comment: `รหัสนำหน้าเลขที่เอกสาร`,
            type: DataTypes.STRING,
            allowNull: true
        },
        user_id: {
            comment: 'รหัสผู้ใช้งานระบบสำหรับเชื่อมข้อมูล',
            type: DataTypes.UUID,
            unique: true,
            allowNull: false,
            references: {
                model: modelUser,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        shop_id: {
            comment: `รหัสร้านค้าที่สังกัดอยู่ ใส่ id ถ้าอยู่ user มีสิทธิ์เป็น shop\n null ถ้า user เป็น hq`,
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: modelShopsProfiles,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        name_title: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'คำนำหน้าชื่อ',
            references: {
                model: modelNameTitle,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        fname: {
            comment: `ชื่อเก็บเป็น JSON รองรับหลายภาษา\nEx. {"th":"ข้อมูล", "en":"data"}`,
            type: DataTypes.JSON,
            allowNull: false
        },
        lname: {
            comment: `นามสกุลเก็บเป็น JSON รองรับหลายภาษา\nEx. {"th":"ข้อมูล", "en":"data"}`,
            type: DataTypes.JSON,
            allowNull: false
        },
        id_code: {
            comment: `รหัสบัตรประชาชน`,
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        tel: {
            comment: `หมายเลขโทรศัพท์พื้นฐาน`,
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        mobile: {
            comment: 'หมายเลขโทรศัพท์มือถือ',
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        address_old: {
            comment: 'ที่อยู่',
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
        },
        subdistrict_id: {
            comment: `รหัสตำบล`,
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: modelSubDistrict,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        district_id: {
            comment: `รหัสอำเภอ`,
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: modelDistrict,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        province_id: {
            comment: `รหัสจังหวัด`,
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: modelProvince,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        address: {
            comment: `ที่อยู่ เก็บเป็น JSON รองรับ 2 ภาษา`,
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        details: {
            comment: 'ข้อมูลรายละเอียด JSON',
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        hq_id: {
            comment: 'คนไหนเป็น ShopHq ก็จะลง Id ShopHq ตรงนี้',
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: modelShopHq,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        isuse: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1,
            comment: 'สถานะการใช้งานข้อมูล'
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'สร้างข้อมูลโดย',
            references: {
                model: modelUser,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        created_date: {
            comment: 'วันที่สร้างข้อมูล',
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: literal('now()')
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'ปรับปรุงข้อมูลโดย',
            references: {
                model: modelUser,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        updated_date: {
            comment: 'วันที่ปรับปรุงข้อมูล',
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize: db,
        modelName: 'UsersProfiles',
        schema: 'app_datas',
        tableName: 'dat_users_profiles',
        comment: 'ตารางเก็บข้อมูลส่วนบุคคลของผู้ใช้งานระบบ',
        indexes: [
            {
                name: 'dat_users_profiles_user_id_unique',
                fields: ['user_id'],
                unique: true,
                comment: `อนุญาตให้ 1 ผู้ใช้ อยู่ได้ 1 shop`
            }
        ]
    }
);


module.exports = UsersProfiles;