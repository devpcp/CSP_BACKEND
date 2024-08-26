import {IModelExtensionJsonMultipleKeys} from "./type.Model.Extension.JsonMultipleKeys";


/**
 * An interface for json schema list current using telephone numbers
 * - เบอร์โทรศัพท์พื้นฐาน  เก็บเป็น JSON รองรับการขยายของข้อมูล
 * - ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}
 */
export interface IModelExtensionJsonMobileNumbers extends IModelExtensionJsonMultipleKeys<string|null> {
    variable_1: string | null;
    variable_2: string | null;
}