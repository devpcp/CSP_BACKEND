import { AxiosResponse } from "axios";
import { IWYZautoProduct } from "./type.Util.Service.WYZauto.API";

export type IAxiosResponseWYZautoAPIGetProducts = AxiosResponse<IResponseWYZautoAPIGetProduct>;

export interface IResponseWYZautoAPIGetProduct {
    active: IWYZautoAPIGetProduct_Active
    disabled: IWYZautoAPIGetProduct_Disabled
}

interface IWYZautoAPIGetProduct_Active {
    products: IWYZautoProduct[]
    total: number
}

interface IWYZautoAPIGetProduct_Disabled {
    products: IWYZautoProduct[]
    total: number
}