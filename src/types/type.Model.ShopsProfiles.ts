import {Optional} from "sequelize";

export interface IModelShopsProfilesAttributes {
    id: string;
    shop_code_id: string;
    tax_code_id: string | null;
    bus_type_id: string | null;
    shop_name: {
        th?: string | null;
        en?: string | null;
    };
    tel_no: {
        tel_no_1?: string | null;
        tel_no_2?: string | null;
    } | null;
    mobile_no: {
        mobile_no_1?: string | null;
    } | null;
    e_mail: string | null;
    address: {
        th?: string | null;
        en?: string | null;
    } | null;
    subdistrict_id: string | null;
    district_id: string | null;
    province_id: string | null;
    isuse: number | 1;
    created_by: string | null;
    created_date: string | null;
    updated_by: string | null;
    updated_date: string | null;
    sync_api_config: {
        rd_reg_no?: string,
        rd_code?: string,
        username?: string,
        password?: string
    } | null;
    domain_name: {
        domain_name: string;
        sub_domain_name: string;
        changed: "0" | "1";
    } | null,
    seq: number;
    /**
     * ตั้งค่า Shop
     */
    shop_config: {
        separate_ShopSalesTransaction_DocType_doc_code: boolean;
        enable_ShopSalesTransaction_TRN_doc_code: boolean;
        enable_ShopSalesTransaction_INV_doc_code: boolean;
        separate_ShopInventoryTransaction_DocType_doc_code: boolean;
    }
}

export interface IModelShopsProfilesCreationAttributes extends Optional<IModelShopsProfilesAttributes, "id"> {
}