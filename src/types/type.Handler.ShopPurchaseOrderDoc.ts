import {  FastifyRequestDefault } from "./type.Default.Fastify"

export type IHandlerShopPersonalCustomersAddRequest = FastifyRequestDefault<ISchemaHandlerShopPurchaseOrderAddRequest>

export interface ISchemaHandlerShopPurchaseOrderAddRequest {
    // Headers: {};
    // Params: {};
    // Querystring: {};
    Body: ISchemaHandlerShopPurchaseOrderAddRequestBody
}

export interface ISchemaHandlerShopPurchaseOrderAddRequestBody {
    doc_type_id: string;
    doc_date: string;
    purchase_requisition_id?: string | null;
    per_customer_id?: string | null;
    bus_customer_id?: string | null;
    business_partner_id?: string | null;
    tax_type_id: string;
    vat_type: 1 | 2 | 3;
    price_discount_bill: string;
    price_sub_total: string;
    price_discount_total: string;
    price_amount_total: string;
    price_before_vat: string;
    price_vat: string;
    price_grand_total: string;
    approve_status: 1 | 2 | 3;
    approve_date?: string | null;
    approve_user_id?: string | null;
    details: {
        ref_doc?: string | null;
        business_partner_name?: string | null;
        business_partner_address?: string | null;
        approve_name?: string | null;
    };
    status: 0 | 1 | 2;
    shopPurchaseOrderLists: Array<{
        seq_number: number;
        product_id: string;
        purchase_unit_id: string | null;
        dot_mfd: string | null;
        amount: string;
        price_unit: string;
        price_discount: string;
        price_discount_percent: string;
        price_grand_total: string;
        details: {}
    }>
}