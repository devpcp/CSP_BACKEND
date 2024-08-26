const utilServiceFunctionWIZautoProductsSchemaValidator = require("./util.Service.WYZauto.Function.ProductsSchemaValidator");


/**
 * @param {Array<import("../types/type.Util.Service.WYZauto.API").IWYZautoProduct>} products
 * @param {object?} param1
 * @param {boolean?} param1.doValidate - If sets 'true' it's will validate data structure
 */
const utilServiceWYZautoFunctionProductsSerializer = async (products, { doValidate }) => {
    if (doValidate === true) {
        await utilServiceFunctionWIZautoProductsSchemaValidator(products);
    }

    return products.reduce((previousValue, currentValue) => {
        const findPreviousValueIndex = previousValue.findIndex(where => where.dot === currentValue.dot && where.sku === currentValue.sku);
        if (findPreviousValueIndex >= 0) {
            previousValue[findPreviousValueIndex].stock += currentValue.stock;
        }
        else {
            previousValue.push(currentValue);
        }
        return previousValue;
    },
    /**
     * @type {Array<import("../types/type.Util.Service.WYZauto.API").IWYZautoProduct>}
     */
    []
    );
};


module.exports = utilServiceWYZautoFunctionProductsSerializer;