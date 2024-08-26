export interface IModelStopStock_Col_WarehouseDetail {
    warehouse: string;
    shelf: IModelStopStock_Col_WarehouseDetail_Prop_Shelf[]
}

export interface IModelStopStock_Col_WarehouseDetail_Prop_Shelf {
    item: string;
    purchase_unit_id: string;
    dot_mfd?: string;
    balance: number;
}