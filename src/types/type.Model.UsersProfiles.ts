import {Optional} from "sequelize";
import {IModelExtensionJsonLanguages} from "./type.Model.Extension.JsonLanguages";

/**
 * ตารางเก็บข้อมูลส่วนบุคคลของผู้ใช้งานระบบ
 * - database: app_datas.dat_users_profiles
 */
export interface IModelUsersProfilesAttributes {
    /**
     * id: รหัสหลักตารางข้อมูลส่วนบุคคลผู้ใช้งานระบบ
     * - database: app_datas.dat_users_profiles.id
     * - type: string<UUID>
     */
    id: string;
    /**
     * รหัสเลขที่เอกสาร
     * - type: string
     */
    code_id: string;
    /**
     * รหัสนำหน้าเลขที่เอกสาร
     * - type: string
     */
    code_id_prefix: string;
    /**
     * user_id: รหัสผู้ใช้งานระบบสำหรับเชื่อมข้อมูล
     * - database: app_datas.dat_users_profiles.user_id
     * - type: string<UUID>
     */
    user_id: string;
    /**
     * name_title: คำนำหน้าชื่อ
     * - database: app_datas.dat_users_profiles.name_title
     * - type: string
     * - type: null
     */
    name_title: string | null;
    /**
     * fname: ชื่อ
     * - database: app_datas.dat_users_profiles.fname
     * - type: JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}
     */
    fname: IModelExtensionJsonLanguages;
    /**
     * lname: นามสกุล
     * - database: app_datas.dat_users_profiles.lname
     * - type: JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}
     */
    lname: IModelExtensionJsonLanguages;
    /**
     * id_code: รหัสบัตรประชาชน
     * - database: app_datas.dat_users_profiles.id_code
     * - type: string
     * - type: null
     */
    id_code: string | null;
    /**
     * tel: หมายเลขโทรศัพท์พื้นฐาน
     * - database: app_datas.dat_users_profiles.tel
     * - type: string
     * - type: null
     */
    tel: string | null;
    /**
     * mobile: หมายเลขโทรศัพท์มือถือ
     * - database: app_datas.dat_users_profiles.mobile
     * - type: string
     * - type: null
     */
    mobile: string | null;
    /**
     * address: ที่อยู่
     * - database: app_datas.dat_users_profiles.address
     * - type: JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}
     * - type: null
     */
    address: IModelExtensionJsonLanguages | null;
    /**
     * subdistrict_id: รหัสตำบล
     * - type: string<UUID>
     * - type: null
     */
    subdistrict_id: string | null;
    /**
     * district_id: รหัสอำเภอ
     * - database: app_datas.dat_users_profiles.district_id
     * - type: string<UUID>
     * - type: null
     */
    district_id: string | null;
    /**
     * province_id: รหัสจังหวัด
     * - database: app_datas.dat_users_profiles.province_id
     * - type: string<UUID>
     * - type: null
     */
    province_id: string | null;
    /**
     * shop_id: รหัสร้านค้าที่สังกัดอยู่
     * - database: app_datas.dat_users_profiles.shop_id
     * - type: string<UUID>
     */
    shop_id: string;
    /**
     * isuse: สถานะการใช้งานข้อมูล
     * - database: app_datas.dat_users_profiles.isuse
     * - type: number
     */
    isuse: number | 1;
    /**
     * ข้อมูลรายละเอียด JSON
     * - type: JSON
     */
    details: details;
    /**
     * created_by: สร้างข้อมูลโดย
     * - database: app_datas.dat_users_profiles.created_by
     * - type: string<UUID>
     */
    created_by: string;
    /**
     * created_date: วันที่สร้างข้อมูล
     * - database: app_datas.dat_users_profiles.created_date
     * - type: string<Date>
     * - type: Date
     */
    created_date: string | number | Date;
    /**
     * updated_by: ปรับปรุงข้อมูลโดย
     * - database: app_datas.dat_users_profiles.updated_by
     * - type: string<UUID>
     * - type: null
     */
    updated_by: string | null;
    /**
     * updated_date: วันที่ปรับปรุงข้อมูล
     * - database: app_datas.dat_users_profiles.updated_date
     * - type: string<Date>
     * - type: Date
     * - type: null
     */
    updated_date: string | number | Date | null;
}

export interface IModelUsersProfilesCreationAttributes extends Optional<IModelUsersProfilesAttributes, "id"> {
}

interface details {
    [key: string]: any;
}