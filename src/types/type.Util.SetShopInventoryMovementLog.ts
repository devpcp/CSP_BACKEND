export type IFUtilSetShopInventoryMovementLog<T> = (documentType: IDocumentType, ) => Promise<T>

export interface IShopInventoryMovementLog<T> {
    shop_id: string;
    product_id: string;
    doc_inventory_id?: string | null;
    doc_inventory_log_id?: string | null;
    doc_sale_id?: string | null;
    doc_sale_log_id?: string | null;
    doc_wyz_auto_id?: string | null;
    warehouse_id: string;
    warehouse_item_id: string;
    dot_mfd?: string | null;
    purchase_unit_id?: string | null;
    count_previous_stock: number;
    count_adjust_stock: number;
    count_current_stock: number;
    details: T;
    created_by: string;
    created_date?: Date | number;
    updated_by?: string | null;
    updated_date?: Date | number | null;
}

export type IDocumentType = 'INI' | 'SO' | 'WYZAuto'