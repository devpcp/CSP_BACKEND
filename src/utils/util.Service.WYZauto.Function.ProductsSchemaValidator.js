const { validateInputProductAsync } = require("./util.Service.WYZauto.API");


/**
 * @param {Array<import("../types/type.Util.Service.WYZauto.API").IWYZautoProduct &{wyz_code?: string;}>} products
 * @param {"sku"|"wyz_code"} [mode="sku"]
 * @return {Promise<Array<import("../types/type.Util.Service.WYZauto.API").IWYZautoProduct>>}
 */
const utilServiceWYZautoFunctionProductsSchemaValidator = async (products, mode = 'sku') => {
    for (let index = 0; index < products.length; index++) {
        const element = products[index];
        await Promise.all([
            mode === 'wyz_code' ? validateInputProductAsync.sku(element.wyz_code) : validateInputProductAsync.sku(element.sku),
            validateInputProductAsync.dot(element.dot),
            validateInputProductAsync.price(element.price),
            validateInputProductAsync.stock(element.stock)
        ]);
    }

    return products;
};


module.exports = utilServiceWYZautoFunctionProductsSchemaValidator;