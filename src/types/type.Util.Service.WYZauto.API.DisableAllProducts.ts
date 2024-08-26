import { AxiosResponse } from "axios";
import { IWYZautoProduct } from "./type.Util.Service.WYZauto.API";

export type IAxiosResponseWYZautoAPIDisableAllProducts = AxiosResponse<IResponseWYZautoAPIDisableAllProduct>;

export interface IResponseWYZautoAPIDisableAllProduct {
    products: IWYZautoProduct;
    total: number;
}