import { AxiosResponse } from 'axios';
import { IWYZautoProduct } from './type.Util.Service.WYZauto.API';

export interface IRequestWYZautoAPIPostProduct {
    products: IWYZautoProduct[];
}

export interface IResponseWYZautoAPIPostProduct {
    created: IWYZautoAPIPostProduct_Created;
    error: IWYZautoAPIPostProduct_Error;
    updated: IWYZautoAPIPostProduct_Updated;
}

export type IAxiosResponseWYZautoAPIPostProduct = AxiosResponse<IResponseWYZautoAPIPostProduct>;

interface IWYZautoAPIPostProduct_Created {
    products: Array<
        IWYZautoProduct &
        {
            sku_manufacturer: string;
        }>;
    total: number;
}

interface IWYZautoAPIPostProduct_Error {
    products: {
        product: IWYZautoProduct,
        reason: string;
    }[];
    total: number;
}

interface IWYZautoAPIPostProduct_Updated {
    products: IWYZautoProduct[];
    total: number;
}
