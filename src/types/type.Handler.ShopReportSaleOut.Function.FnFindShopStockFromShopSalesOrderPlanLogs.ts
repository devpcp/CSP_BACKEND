export interface IFnFindShopStockFromShopSalesOrderPlanLogs {
    shop_sales_order_plan_id: string
    warehouse_id: string
    shelf: Shelf
}

export interface Shelf {
    item: string
    purchase_unit_id: string
    dot_mfd: string
}
