export interface IWYZautoProduct {
    sku: string;
    dot: string;
    price: number;
    stock: number;
}

export interface ICSPWYZautoProduct extends Omit<IWYZautoProduct, 'sku'> {
    /**
     * WYZ Code SKU (Ref: IWYZautoProduct.sku)
     */
    wyz_code: string;
    /**
     * A UUID of warehouse
     */
    warehouse_id: string;
    /**
     * A name of Item from Shelf of Warehouse
     */
    shelfItem_id: string;
}

export interface ICSPWYZAutoProduct_Reduce extends Omit<IWYZautoProduct, 'sku'> {
    /**
     * WYZ Code SKU (Ref: IWYZautoProduct.sku)
     */
    wyz_code: string;
    warehouse_details: {
        warehouse_id: string;
        shelfItem_id: string;
        holding_product: number;
    }[]
}