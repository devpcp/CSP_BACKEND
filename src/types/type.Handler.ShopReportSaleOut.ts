export interface IModelShopSalesTransactionDoc {
    id: string
    run_no: number
    code_id: string
    shop_id: string
    bus_customer_id: string
    per_customer_id: any
    doc_date: string
    details: Details
    vehicles_customers_id: any
    doc_type_id: string
    sale_type: boolean
    purchase_status: boolean
    status: number
    created_by: string
    created_date: string
    updated_by: string
    updated_date: string
}

export interface Details {
    customer_phone: any
    user_id: string
    tax_id: string
    remark: string
    list_service_product: ListServiceProduct[]
    calculate_result: CalculateResult
}

export interface ListServiceProduct {
    list_shop_stock: ListShopStock[]
    shop_stock_id: string
    dot_mfd_list: string[]
    price: number
    price_text: string
    product_id: string
    shelf_list: ShelfList[]
    warehouse_list: WarehouseList[]
    shelf_code: string
    amount: string
    warehouse_id: string
    balance: string
    dot_mfd: string
    id: string
    amount_old: string
    each_total_price?: number
}

export interface ListShopStock {
    id: string
    shop_id: string
    product_id: string
    warehouse_detail: WarehouseDetail[]
    balance: string
    balance_date: string
    created_by: string
    created_date: string
    updated_by?: string
    updated_date: string
    ShopsProfile: ShopsProfile
    ShopProduct: ShopProduct
}

export interface WarehouseDetail {
    warehouse: string
    shelf: Shelf
}

export interface Shelf {
    item: string
    dot_mfd: string
    balance: string
}

export interface ShopsProfile {
    id: string
    shop_code_id: string
    tax_code_id: string
    bus_type_id: string
    shop_name: ShopName
}

export interface ShopName {
    th: string
}

export interface ShopProduct {
    id: string
    product_id: string
    product_bar_code: string
    start_date: string
    end_date: any
    price: Price
    isuse: number
    created_by: string
    created_date: string
    updated_by: any
    updated_date: string
    Product: Product
}

export interface Price {
    suggasted_re_sell_price: SuggastedReSellPrice
    b2b_price: B2bPrice
    suggested_online_price: SuggestedOnlinePrice
    credit_30_price: Credit30Price
    credit_45_price: Credit45Price
}

export interface SuggastedReSellPrice {
    retail: number
    wholesale: number
}

export interface B2bPrice {
    retail: number
    wholesale: number
}

export interface SuggestedOnlinePrice {
    retail: any
    wholesale: any
}

export interface Credit30Price {
    retail: any
    wholesale: any
}

export interface Credit45Price {
    retail: any
    wholesale: any
}

export interface Product {
    id: string
    master_path_code_id: string
    product_name: ProductName
    product_type_id: string
    product_brand_id: string
    product_model_id: string
    other_details: OtherDetails
    wyz_code: any
    ProductType: ProductType
    ProductBrand: ProductBrand
    ProductCompleteSize: any
    ProductModelType: ProductModelType
}

export interface ProductName {
    th: string
    en: string
}

export interface OtherDetails {
    central_price: CentralPrice
    others_tire_detail: OthersTireDetail
    oe_tire: OeTire
    runflat_tire: RunflatTire
    based_price: any
    suggested_promote_price: any
    normal_price: any
    benchmark_price: any
    include_vat_price: any
    exclude_vat_price: any
    other_shops: OtherShop[]
}

export interface CentralPrice {
    suggasted_re_sell_price: SuggastedReSellPrice2
    b2b_price: B2bPrice2
    suggested_online_price: SuggestedOnlinePrice2
    credit_30_price: Credit30Price2
    credit_45_price: Credit45Price2
}

export interface SuggastedReSellPrice2 {
    retail: number
    wholesale: number
}

export interface B2bPrice2 {
    retail: number
    wholesale: number
}

export interface SuggestedOnlinePrice2 {
    retail: any
    wholesale: any
}

export interface Credit30Price2 {
    retail: any
    wholesale: any
}

export interface Credit45Price2 {
    retail: any
    wholesale: any
}

export interface OthersTireDetail {
    remark_others_tire_detail: RemarkOthersTireDetail
    status: boolean
}

export interface RemarkOthersTireDetail {
    th: string
}

export interface OeTire {
    remark_oe_tire: RemarkOeTire
    status: boolean
}

export interface RemarkOeTire {}

export interface RunflatTire {
    remark_runflat_tire: RemarkRunflatTire
    status: boolean
}

export interface RemarkRunflatTire {}

export interface OtherShop {
    prohand_price: any
    ezyFit_price: any
    wyz_price: any
    auto_one_price: any
    ycc_price: any
}

export interface ProductType {
    id: string
    code_id: string
    type_name: TypeName
    type_group_id: string
    ProductPurchaseUnitTypes: ProductPurchaseUnitType[]
}

export interface TypeName {
    th: string
    en: string
}

export interface ProductPurchaseUnitType {
    id: string
    code_id: string
    type_name: TypeName2
    type_group_id: string
    isuse: number
    created_by: string
    created_date: string
    updated_by?: string
    updated_date?: string
    amount_per_unit: number
    run_no: number
    internal_code_id: string
}

export interface TypeName2 {
    th: string
    en: string
}

export interface ProductBrand {
    id: string
    code_id: string
    brand_name: BrandName
}

export interface BrandName {
    th: string
    en: string
}

export interface ProductModelType {
    id: string
    code_id: string
    model_name: ModelName
}

export interface ModelName {
    th: string
    en: string
}

export interface ShelfList {
    code: string
    name: Name
    item: string
}

export interface Name {
    th: string
}

export interface WarehouseList {
    id: string
    code_id: string
    name: Name2
    shelf: Shelf2[]
    created_by: string
    created_date: string
    updated_by: string
    updated_date: string
    shelf_total: number
}

export interface Name2 {
    th: string
}

export interface Shelf2 {
    code: string
    name: Name3
    item: string
}

export interface Name3 {
    th: string
}

export interface CalculateResult {
    total: number
    total_text: string
    discount: number
    discount_text: number
    net_total: number
    net_total_text: string
    vat: number
    total_amount: number
}
