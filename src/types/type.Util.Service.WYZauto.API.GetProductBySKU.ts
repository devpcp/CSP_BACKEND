import { AxiosResponse } from "axios";
import { IWYZautoProduct } from "./type.Util.Service.WYZauto.API";

export type IAxiosResponseWYZautoAPIGetProductBySKU = AxiosResponse<IResponseWYZautoAPIGetProduct>;

export interface IResponseWYZautoAPIGetProduct {
    active: IWYZautoAPIGetProductBySKU_Active
    disabled: IWYZautoAPIGetProductBySKU_Disabled
}

interface IWYZautoAPIGetProductBySKU_Active {
    products: IWYZautoProduct[]
    total: number
}

interface IWYZautoAPIGetProductBySKU_Disabled {
    products: IWYZautoProduct[]
    total: number
}