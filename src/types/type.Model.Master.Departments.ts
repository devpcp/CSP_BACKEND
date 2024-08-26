import {IModelExtensionJsonLanguages} from "./type.Model.Extension.JsonLanguages";
import {Optional} from "sequelize";

export interface IModelMasterDepartmentsAttributes {
    /**
     * รหัสหลักตารางข้อมูลแผนก
     */
    id: string;
    /**
     * รหัสควบคุมแผนก
     */
    code_id: string;
    /**
     * ชื่อแผนก เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }
     */
    department_name: IModelExtensionJsonLanguages;
    /**
     * กลุ่มผู้ใช้งานระบบ ใช้เพื่อสร้างผู้ใช้
     */
    user_group_id: string;
    /**
     * สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)
     */
    isuse: 0 | 1 | 2;
    /**
     * สร้างข้อมูลโดย
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

export interface IModelMasterDepartmentsCreationAttributes extends Optional<IModelMasterDepartmentsAttributes, "id"> {
}