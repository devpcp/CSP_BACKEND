/**
 * @typedef {import("../types/type.Util.Service.WYZauto.API").IWYZautoProduct} IWYZautoProduct
 * @typedef {import("../types/type.Util.Service.WYZauto.API.PostProducts").IRequestWYZautoAPIPostProduct} IRequestWYZautoAPIPostProduct
 * @typedef {import("../types/type.Util.Service.WYZauto.API.PostProducts").IResponseWYZautoAPIPostProduct} IResponseWYZautoAPIPostProduct
 * @typedef {import("../types/type.Util.Service.WYZauto.API.PostProducts").IAxiosResponseWYZautoAPIPostProduct} IAxiosResponseWYZautoAPIPostProduct
 */

const _ = require('lodash');
const { utilServiceWYZautoAPI, validateInputProductAsync } = require("./util.Service.WYZauto.API");

class CModelBodyRequestWIZAuto {
    /**
     * @type {IWYZautoProduct[]}
     */
    #products = [];

    /**
     * @param {IWYZautoProduct[]} products
     */
    constructor(products) {
        if (!_.isArray(products)) {
            throw Error(`parameter "products" constructor is not array`);
        }
        else {
            this.#products = products;
            Object.assign(this, this.valueOf);
        }
    }

    /**
     * @return {{products: IWYZautoProduct[]}}
     */
    get valueOf() {
        return { products: this.#products };
    }

    get toJSON() {
        return JSON.stringify(this.valueOf);
    }

    async validate() {
        for (let index = 0; index < this.#products; index++) {
            const objectProduct = this.#products[index];
            await this.#validateObjectProduct(objectProduct);
        }

        return true;
    }

    async #validateObjectProduct(objectProduct) {
        if (_.isPlainObject(objectProduct)) {
            throw Error(`content in product, require type object`);
        }
        for (const objectProductKey in objectProduct) {
            switch (objectProductKey) {
                case 'sku': {
                    const value = _.get(objectProduct, objectProductKey, '');
                    await validateInputProductAsync.sku(value);
                    break;
                }
                case 'dot': {
                    const value = _.get(objectProduct, objectProductKey, '');
                    await validateInputProductAsync.dot(value);
                    break;
                }
                case 'price': {
                    const value = _.get(objectProduct, objectProductKey, NaN);
                    await validateInputProductAsync.price(value);
                    break;
                }
                case 'stock': {
                    const value = _.get(objectProduct, objectProductKey, NaN);
                    await validateInputProductAsync.stock(value);
                    break;
                }
                default: {
                    throw Error(`content in product, property in object is invalid`);
                }
            }
        }

        return true;
    };
}


/**
 * A function that sends a request to the API WIZAuto to update products information.
 * @param  {IWYZautoProduct[]} products - An array of products to be sent to the API.
 * @param url
 * @param authorization
 * @return It will return status code '200' and objects from you request
 */
const utilServiceWYZautoAPIPostProducts = async (products, url = 'https://asia-southeast2-wyzauto.cloudfunctions.net/api-seller/post-products', authorization) => {
    const requestBody = new CModelBodyRequestWIZAuto(products);
    await requestBody.validate();
    /**
     * @type {IAxiosResponseWYZautoAPIPostProduct}
     */
    const httpResponse = await utilServiceWYZautoAPI(authorization).post(
        url,
        {
            ...requestBody.valueOf
        }
    );

    return httpResponse;
};


module.exports = utilServiceWYZautoAPIPostProducts;
