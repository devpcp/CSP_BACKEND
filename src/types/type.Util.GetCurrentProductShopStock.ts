import { Transaction } from 'sequelize/types/transaction'
export interface IUtilGetCurrentProductShopStock_Options {
    transaction?: Transaction;
    findStockId?: string;
    findShopProductId?: string;
    findShopWarehouseId?: string;
    findShopWarehouseItemId?: string;
    findPurchaseUnitId?: string | null;
    findDotMfd?: string | null;
}

export interface IResultCurrentProductShopStock {
    id: string;
    product_id: string;
    warehouse_id: string;
    warehouse_item_id: string;
    purchase_unit_id: string | null;
    dot_mfd: string | null;
    balance: number | string;
    balance_date: Date;
    created_date: Date;
    created_by: string;
    updated_date: Date | null;
    updated_by: string | null;
}


export interface IShopInventory_Add_product_list {
    product_id: string
    warehouse_detail: WarehouseDetail[]
    amount_all: number
    details: Details
}

export interface WarehouseDetail {
    warehouse: string
    shelf: Shelf
}

export interface Shelf {
    item: string
    amount: number
    dot_mfd: string
    purchase_unit_id: string
}

export interface Details {
    price: string
    price_text: string
    discount_percentage_1: any
    discount_percentage_1_text: any
    discount_percentage_2: any
    discount_percentage_2_text: any
    discount_3: any
    discount_3_text: any
    discount_3_type: string
    discount_thb: any
    discount_thb_text: any
    total_price: string
    total_price_text: string
    unit: string
}
