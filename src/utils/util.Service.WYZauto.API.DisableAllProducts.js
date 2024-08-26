/**
 * @typedef {import("../types/type.Util.Service.WYZauto.API.DisableAllProducts").IAxiosResponseWYZautoAPIDisableAllProducts} IAxiosResponseWYZautoAPIDisableAllProducts
 */

const { utilServiceWYZautoAPI } = require("./util.Service.WYZauto.API");

/**
 * A function disable all product lists from WIZauto API
 */
const UtilServiceWYZautoAPIDisableAllProducts = async (url = 'https://asia-southeast2-wyzauto.cloudfunctions.net/api-seller/disable-all-products', authorization) => {
    /**
     * @type {IAxiosResponseWYZautoAPIDisableAllProducts}
     */
    const httpResponse = await utilServiceWYZautoAPI(authorization).get(url);

    return httpResponse;
};


module.exports = UtilServiceWYZautoAPIDisableAllProducts;