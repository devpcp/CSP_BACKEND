/**
 * @typedef {import("../types/type.Util.Service.WYZauto.API.GetProductBySKU").IAxiosResponseWYZautoAPIGetProductBySKU} IAxiosResponseWYZautoAPIGetProductBySKU
 */

const _ = require("lodash");
const { utilServiceWYZautoAPI } = require("./util.Service.WYZauto.API");


/**
 * A function get product lists from WIZauto API by SKU
 * @param sku - The SKU of the product you want to get.
 * @param url
 * @param authorization
 */
const UtilServiceWYZautoAPIGetProductBySKU = async (sku, url = 'https://asia-southeast2-wyzauto.cloudfunctions.net/api-seller/get-product/', authorization = '') => {
    if (!_.isString(value) || !/^[a-z\d]+[a-z\d\-]*$/.test(value)) {
        throw Error(`parameter "sku" in is invalid`);
    }

    url = url.replace(/\/+$/, '') + `/${sku}`;

    /**
     * @type {IAxiosResponseWYZautoAPIGetProductBySKU}
     */
    const httpResponse = await utilServiceWYZautoAPI(authorization).get(url);

    return httpResponse;
};


module.exports = UtilServiceWYZautoAPIGetProductBySKU;