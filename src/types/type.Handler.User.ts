import { FastifyRequest } from "fastify";
import { IModelExtensionJsonLanguages } from "./type.Model.Extension.JsonLanguages";

/**
 * A FastifyRequest contains incoming request from
 */
export type IHandlerUserRegisterRequest = FastifyRequest<ISchemaHandlerUserRegisterRequest>;

/**
 * An interface contains incoming request from
 */
export interface ISchemaHandlerUserRegisterRequest {
    // Headers: {},
    // Params: {},
    // Querystring: {},
    Body: {
        /**
         * ตารางผู้ใช้งานระบบ
         * - database: systems.sysm_users
         */
        user_data: {
            /**
             * user_name: ชื่อผู้ใช้เข้าระบบ
             * - database: systems.sysm_users.user_name
             * - type: string
             */
            user_name: string;
            /**
             * password: รหัสผ่านเข้าระบบ
             * - database: systems.sysm_users.password
             * - type: string
             */
            password: string;
            /**
             * e_mail: e-mail ผู้ใช้งานระบบ
             * - database: systems.sysm_users.e_mail
             * - type: string
             * - type: null
             * - type: undefined
             */
            e_mail?: string;
            /**
             * open_id: user_id ของระบบ Open ID
             * - database: systems.sysm_users.open_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            open_id?: string | null;
        };
        /**
         * ข้อมูลร้านค้าผู้ใช้ระบบ POS
         * - database: app_datas.dat_shops_profiles
         */
        shop_profile_data: {
            /**
             * shop_code_id: รหัสตัวแทนจำหน่ายต้นฉบับ
             * - database: app_datas.dat_shops_profiles.shop_code_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            shop_code_id?: string | null;
            /**
             * tax_code_id: เลขภาษี
             * - database: app_datas.dat_shops_profiles.tax_code_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            tax_code_id?: string | null;
            /**
             * bus_type_id: รหัสประเภทธุรกิจ
             * - database: app_datas.dat_shops_profiles.bus_type_id
             * - type: string<UUID>
             * - type: null
             * - type: undefined
             */
            bus_type_id?: string | null;
            /**
             * shop_name: ชื่อตัวแทนจำหน่าย
             * - database: app_datas.dat_shops_profiles.shop_name
             * - type: JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}
             */
            shop_name: IModelExtensionJsonLanguages;
            /**
             * tel_no: เบอร์โทรศัพท์พื้นฐาน
             * - database: app_datas.dat_shops_profiles.tel_no
             * - type: JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}
             */
            tel_no?: {
                [telNumKey: string]: string | null;
            } | null;
            /**
             * mobile_no: เบอร์โทรศัพท์มือถือ
             * - database: app_datas.dat_shops_profiles.mobile_no
             * - type: JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}
             */
            mobile_no?: {
                [telNumKey: string]: string | null;
            } | null;
            /**
             * e_mail: e-mail
             * - type: string
             * - type: null
             * - type: undefined
             */
            e_mail?: string | null;
            /**
             * address: ที่อยู่
             * - database: app_datas.dat_shops_profiles.address
             * - type: JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}
             */
            address?: IModelExtensionJsonLanguages | null;
            /**
             * subdistrict_id: รหัสตำบล
             * - database: app_datas.dat_shops_profiles.subdistrict_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            subdistrict_id?: string | null;
            /**
             * district_id: รหัสอำเภอ
             * - database: app_datas.dat_shops_profiles.district_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            district_id?: string | null;
            /**
             * province_id: รหัสจังหวัด
             * - database: app_datas.dat_shops_profiles.province_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            province_id?: string | null;
            /**
             * เก็บชื่อ Domain และ SubDomain เป็น JSON
             * - type: JSON
             */
            domain_name: {
                /**
                 * ชื่อ Domain
                 * - type: string
                 */
                domain_name: string,
                /**
                 * ชื่อ Sub Domain
                 * - type: string
                 */
                sub_domain_name: string,
                /**
                 * สถานะการเปลี่ยนแปลงข้อมูล Sub Domain
                 * - "0" = ไม่เปลี่ยนแปลง
                 * - "1" = เปลี่ยนแปลง
                 */
                changed: "0" | "1",
            };
        };
        /**
         * ข้อมูลส่วนบุคคลของผู้ใช้งานระบบ
         * - database: app_datas.dat_users_profiles
         */
        user_profile_data: {
            /**
             * name_title: คำนำหน้าชื่อ
             * - database: app_datas.dat_users_profiles.name_title
             * - type: string
             * - type: null
             * - type: undefined
             */
            name_title?: string | null;
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
             * - type: undefined
             */
            id_code?: string | null;
            /**
             * tel: หมายเลขโทรศัพท์พื้นฐาน
             * - database: app_datas.dat_users_profiles.tel
             * - type: string
             * - type: null
             * - type: undefined
             */
            tel?: string | null;
            /**
             * mobile: หมายเลขโทรศัพท์มือถือ
             * - database: app_datas.dat_users_profiles.mobile
             * - type: string
             * - type: null
             * - type: undefined
             */
            mobile?: string | null;
            /**
             * address: ที่อยู่
             * - database: app_datas.dat_users_profiles.address
             * - type: JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}
             * - type: null
             * - type: undefined
             */
            address?: IModelExtensionJsonLanguages | null;
            /**
             * subdistrict_id: รหัสตำบล
             * - database: app_datas.dat_users_profiles.subdistrict_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            subdistrict_id?: string | null;
            /**
             * district_id: รหัสอำเภอ
             * - database: app_datas.dat_users_profiles.district_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            district_id?: string | null;
            /**
             * province_id: รหัสจังหวัด
             * - database: app_datas.dat_users_profiles.province_id
             * - type: string
             * - type: null
             * - type: undefined
             */
            province_id?: string | null;
        };
    };
}