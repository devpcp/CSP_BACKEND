import {Optional, Model} from "sequelize";
import {IModelExtensionJsonLanguages} from "./type.Model.Extension.JsonLanguages";
import {IModelExtensionJsonTelephoneNumbers} from "./type.Model.Extension.JsonTelephoneNumbers";
import {IModelExtensionJsonMobileNumbers} from "./type.Model.Extension.JsonMobileNumbers";
import {IModelExtensionJsonMultipleKeys} from "./type.Model.Extension.JsonMultipleKeys";

export interface IModelShopPersonalCustomersAttributes {
    /**
     * รหัสหลักตารางข้อมูลลูกค้าบุคคลทั่วไปภายใต้ร้านค้า
     */
    id: string;
    /**
     * รหัสร้านค้า
     */
    shop_id: string;
    /**
     * รหัสลูกค้า
     */
    master_customer_code_id: string;
    /**
     * รหัสประจำตัวบัตรประชาชน
     */
    id_card_number: string | null;
    /**
     * รหัสคำนำหน้าชื่อ
     * - string<uuid>
     * - null
     */
    name_title_id: string | null;
    /**
     * ชื่อลูกค้า เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "first_name": { "th": "ข้อมูล", "en": "ข้อมูล" }, "last_name": { "th": "data", "en": "data" } }
     */
    customer_name: IModelExtensionJsonLanguages;
    /**
     * เบอร์โทรศัพท์พื้นฐาน  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}
     */
    tel_no: IModelExtensionJsonTelephoneNumbers | null;
    /**
     * เบอร์โทรศัพท์มือถือ  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}
     */
    mobile_no: IModelExtensionJsonMobileNumbers | null;
    /**
     * e-mail
     */
    e_mail: string | null;
    /**
     * ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }
     */
    address: IModelExtensionJsonLanguages | null;
    /**
     * รหัสตำบล
     * - string<uuid>
     * - null
     */
    subdistrict_id: string;
    /**
     * รหัสอำเภอ
     * - string<uuid>
     * - null
     */
    district_id: string;
    /**
     * รหัสจังหวัด
     * - string<uuid>
     * - null
     */
    province_id: string;
    /**
     * สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)
     */
    isuse: 0 | 1 | 2;
    /**
     * รายละเอียดอื่นๆ เพิ่มเติมเก็บเป็น  Json
     */
    other_details: IModelExtensionJsonMultipleKeys;
    /**
     * เลขลำดับลูกค้า run อัตโนมัติ
     */
    run_no: number;
    /**
     * สร้างข้อมูลโดย
     * - string<uuid>
     */
    created_by: string;
    /**
     * สร้างข้อมูลวันที่
     */
    created_date: number | string | Date;
    /**
     * ปรับปรุงข้อมูลโดย
     * - string<uuid>
     * - null
     */
    updated_by: string | null;
    /**
     * ปรับปรุงข้อมูลวันที่
     */
    updated_date: number | string | Date | null;
}

export interface IModelShopPersonalCustomersCreationAttributes extends Optional<IModelShopPersonalCustomersAttributes, "id"> {
}

export interface IModelShopPersonalCustomersInstance extends Model<IModelShopPersonalCustomersAttributes, IModelShopPersonalCustomersCreationAttributes>, IModelShopPersonalCustomersAttributes {
}

export interface IModelShopPersonalCustomers extends Model<IModelShopPersonalCustomersAttributes, IModelShopPersonalCustomersCreationAttributes> {}