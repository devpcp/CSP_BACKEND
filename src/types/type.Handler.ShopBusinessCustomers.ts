import {FastifyRequest} from "fastify";
import {IModelShopBusinessCustomersAttributes} from "./type.Model.ShopBusinessCustomers";

/**
 * A FastifyRequest contains incoming request from
 * - Route [POST] => /api/shopBusinessCustomers/add
 */
export type IHandlerShopBusinessCustomerAddRequest = FastifyRequest<ISchemaHandlerShopBusinessCustomersAddRequest>

/**
 * An interface contains incoming request from
 * - Route [POST] => /api/shopBusinessCustomers/add
 */
export interface ISchemaHandlerShopBusinessCustomersAddRequest {
    // Headers: {};
    // Params: {};
    // Querystring: {};
    Body: ISchemaHandlerShopBusinessCustomersAddRequestBody
}

/**
 * An extension interface contains incoming request from "Body"
 * - Route [POST] => /api/shopBusinessCustomers/add
 */
interface ISchemaHandlerShopBusinessCustomersAddRequestBody extends Omit<IModelShopBusinessCustomersAttributes, 'id' | 'run_no' | 'isuse' | 'created_by' | 'created_date' | 'updated_by' | 'updated_date'> {
}


/**
 * A FastifyRequest contains incoming request from
 * - Route [GET] => /api/shopBusinessCustomers/all
 */
export type IHandlerShopBusinessCustomerAllRequest = FastifyRequest<ISchemaHandlerShopBusinessCustomersAllRequest>

/**
 * An interface contains incoming request from
 * - Route [GET] => /api/shopBusinessCustomers/all
 */
export interface ISchemaHandlerShopBusinessCustomersAllRequest {
    // Headers: {};
    // Params: {};
    Querystring: ISchemaHandlerShopBusinessCustomersAllRequestBody;
    // Body: {}
}

/**
 * An extension interface contains incoming request from "Body"
 * - Route [GET] => /api/shopBusinessCustomers/all
 */
interface ISchemaHandlerShopBusinessCustomersAllRequestBody extends IModelShopBusinessCustomersAttributes {
    /**
     * คำค้นหา
     * default: เลืแกทั้งหมด
     */
    search?: string;
    /**
     * ฟิวส์ JSON ที่มีค่า Key ที่ระบบคงที่ไม่ได้
     */
    jsonField?: {
        /**
         * ฟิวส์ JSON "tel_no"
         * - example: "tel_no_1"
         * - example: "tel_no_1,"
         * - example: "tel_no_1,tel_no_2"
         */
        tel_no?: string;
        /**
         * ฟิวส์ JSON "mobile_no"
         * - example: "mobile_no_1"
         * - example: "mobile_no_1,"
         * - example: "mobile_no_1,mobile_no_2"
         */
        mobile_no?: string;
        /**
         * ฟิวส์ JSON "other_details"
         */
        other_details?: string;
    };
    /**
     * กรองข้อมูล ตามสถาณะของข้อมูล
     * - default: ["active"] || ["block"]
     */
    status?: 'delete' | 'active' | 'block';
    /**
     * ชื่อฟิวส์ที่อยากให้จัดเรียง
     * - default: "id"
     */
    sort?: string | "id";
    /**
     * รูปแบบการเรียง จาก query["order"]
     * - default: "asc"
     */
    order?: "asc" | "desc";
    /**
     * จำนวน ของชุดข้อมูล ต่อ 1 หน้า
     * - default: 10
     */
    limit?: number;
    /**
     * ลำดับ ของหน้า
     * - default: 1
     */
    page?: number;
}

/**
 * A FastifyRequest contains incoming request from
 * - Route [GET] => /api/shopBusinessCustomers/byid/:id
 */
export type IHandlerShopBusinessCustomerByIdRequest = FastifyRequest<ISchemaHandlerShopBusinessCustomersByIdRequest>

/**
 * An interface contains incoming request from
 * - Route [GET] => /api/shopBusinessCustomers/byid/:id
 */
export interface ISchemaHandlerShopBusinessCustomersByIdRequest {
    // Headers: {};
    Params: {
        /**
         * A request id refer to primary key of model "ShopBusinessCustomers"
         * - type: string<uuid>
         */
        id: string;
    };
    // Querystring: {};
    // Body: {}
}

/**
 * A FastifyRequest contains incoming request from
 * - Route [PUT] => /api/shopBusinessCustomers/put/:id
 */
export type IHandlerShopBusinessCustomerPutRequest = FastifyRequest<ISchemaHandlerShopBusinessCustomersPutRequest>

/**
 * An interface contains incoming request from
 * - Route [PUT] => /api/shopBusinessCustomers/put/:id
 */
export interface ISchemaHandlerShopBusinessCustomersPutRequest {
    // Headers: {};
    Params: {
        /**
         * A request id refer to primary key of model "ShopBusinessCustomers"
         * - type: string<uuid>
         */
    }
    // Querystring: {};
    Body: ISchemaHandlerShopBusinessCustomersPutRequestBody
}

/**
 * An extension interface contains incoming request from "Body"
 * - Route [PUT] => /api/shopBusinessCustomers/put/:id
 */
interface ISchemaHandlerShopBusinessCustomersPutRequestBody extends Omit<IModelShopBusinessCustomersAttributes, 'id' | 'isuse' | 'run_no' | 'created_by' | 'created_date' | 'updated_by' | 'updated_date'> {
    /**
     * Converted from field "isuse"
     * - "block" = 0
     * - "active" = 1
     * - "delete" = 2
     */
    status: "block" | "active" | "delete"
}