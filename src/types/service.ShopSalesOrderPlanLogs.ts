export interface IWarehouseDetail {
    warehouse: string;
    shelf: Shelf[];
}

interface Shelf {
    item: string;
    purchase_unit_id: string;
    dot_mfd?: string;
    amount: string;
}
