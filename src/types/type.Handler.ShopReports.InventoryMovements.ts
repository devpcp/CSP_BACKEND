export interface IInventoryMovement {
    id: string
    product_id: string
    warehouse_id: string
    warehouse_item_id: string
    dot_mfd?: string
    purchase_unit_id?: string
    amount: string
    status: number
    start_date?: string
    end_date?: string
    created_date: string
    created_by: string
    updated_date?: string
    updated_by?: string
    Product: Product
    previousStockAmount: number
    currentStockAmount: number
    doc_inventory_id?: string
    ShopInventoryTransaction?: ShopInventoryTransaction
    doc_sale_id?: string
    ShopSalesTransactionDoc?: ShopSalesTransactionDoc
}

export interface Product {
    id: string
    master_path_code_id: string
    custom_path_code_id?: string
    wyz_code?: string
    product_name: string
    partner_name?: string
}

export interface ShopInventoryTransaction {
    id: string
    code_id: string
    doc_date: string
    doc_type_id: string
    bus_partner_id: string
    created_date: string
    created_by: string
    updated_date?: string
    updated_by?: string
    DocumentType: DocumentType
    ShopBusinessPartner: ShopBusinessPartner
}

export interface DocumentType {
    id: string
    internal_code_id: string
    type_name: string
}

export interface ShopBusinessPartner {
    id: string
    code_id: string
}

export interface ShopSalesTransactionDoc {
    id: string
    code_id: string
    doc_date: string
    doc_type_id: string
    per_customer_id: any
    bus_customer_id: string
    created_date: string
    created_by: string
    updated_date: string
    updated_by: string
    DocumentType: DocumentType2
    ShopPersonalCustomer: ShopPersonalCustomer
    ShopBusinessCustomer: ShopBusinessCustomer
}

export interface DocumentType2 {
    id: string
    internal_code_id: string
    type_name: string
}

export interface ShopPersonalCustomer {
    id: any
    master_customer_code_id: any
    customer_name: any
}

export interface ShopBusinessCustomer {
    id: string
    master_customer_code_id: string
    customer_name: string
}

export interface IMigrationInventoryMovementToCreate<T = {}> {
    shop_id: string;
    product_id: string;
    doc_inventory_id?: string | null;
    doc_inventory_log_id?: string | null;
    doc_sale_id?: string | null;
    doc_sale_log_id?: string | null;
    doc_wyz_auto_id?: string | null;
    stock_id: string;
    warehouse_id: string;
    warehouse_item_id: string;
    dot_mfd: string;
    purchase_unit_id: string;
    count_previous_stock: string | number;
    count_adjust_stock: string | number;
    count_current_stock: string | number;
    details?: T | null;
    created_by: string;
    created_date: Date | number;
    updated_by?: string | null;
    updated_date: Date | number | null;
}

export interface IMigration_ShopStock_WarehouseDetail {
    /**
     * AKA: "warehouse_id"
     */
    warehouse: string
    shelf: {
        /**
         * AKA: "warehouse_item_id"
         */
        item: string
        purchase_unit_id: string
        dot_mfd: string
        balance: string
        holding_product: string
    }[]
}