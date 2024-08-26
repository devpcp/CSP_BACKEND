export interface IServiceShopReportSalesOuts {
    id: string
    run_no: number
    code_id: string
    doc_date: string
    created_date: string
    purchase_status: boolean
    sale_type: boolean
    products: Product[]
    total: number
    total_string: string
    discount: number
    discount_string: string
    vat: number
    vat_string: string
    net_total: number
    net_total_string: string
}

export interface Product {
    product_id: string
    product_shop_id: string
    product_code_sku: string
    product_code_cai: string
    product_code_ccid: string
    product_name: string
    product_dot_mfd: string
    product_quantity: number
    product_price: number
    product_price_string: string
    product_price_discount_from_price: number
    product_price_discount_from_price_string: string
    product_price_discount_from_percent: number
    product_price_discount_from_percent_string: string
    product_price_amount: number
    product_price_amount_string: string
    product_other_details: ProductOtherDetails
}

export interface ProductOtherDetails {
    ProductBrand: ProductBrand
    ProductType: ProductType
    ShopStock: ShopStock
}

export interface ProductBrand {
    id: string
    code_id: string
    brand_name: string
}

export interface ProductType {
    id: string
    code_id: string
    type_name: string
    type_group_id: string
    ProductTypeGroup: ProductTypeGroup
}

export interface ProductTypeGroup {
    id: string
    code_id: string
    internal_code_id: string
    group_type_name: string
    isstock: boolean
}

export interface ShopStock {
    id: string
    warehouse_id: string
    warehouse_name: string
    shelf: Shelf
}

export interface Shelf {
    item: string
    purchase_unit_id: string
    purchase_unit_name: string
    dot_mfd: string
}
