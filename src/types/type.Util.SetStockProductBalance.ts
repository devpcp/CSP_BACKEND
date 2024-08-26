export interface IShopStockProductBalanceWarehouseDetail {
    warehouse: string
    shelf: Shelf[]
}

export interface Shelf {
    item: string;
    purchase_unit_id: string;
    dot_mfd?: string;
    balance: string;
    holding_product: string;
}