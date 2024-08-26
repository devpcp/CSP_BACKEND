/**
 * @typedef {import("../types/type.Util.Service.WYZauto.API.GetProducts").IAxiosResponseWYZautoAPIGetProducts} IAxiosResponseAPIWIZautoGetProduct
 */

const { utilServiceWYZautoAPI } = require("./util.Service.WYZauto.API");

/**
 * A function get product lists from WIZauto API
 */
const utilServiceWYZautoAPIGetProducts = async (url = 'https://asia-southeast2-wyzauto.cloudfunctions.net/api-seller/get-products', authorization) => {
    /**
     * @type {IAxiosResponseAPIWIZautoGetProduct}
     */
    const httpResponse = await utilServiceWYZautoAPI(authorization).get(url);

    return httpResponse;
};


module.exports = utilServiceWYZautoAPIGetProducts;