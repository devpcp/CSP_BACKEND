/**
 * @template T
 * @typedef {function(value: T): boolean} ValidateInputProductFunction
 * @typedef {function(value: T): Promise<boolean>} PromiseValidateInputProductFunction
 */

const _ = require("lodash");
const axios = require("axios").default;

const _config_Axios_Header_Authorization = 'Bearer ' + '4XrtfSK4J9UkcukpPdTr';

/* Create a new instance of axios from WIZauto with the headers set. */
const utilServiceWYZautoAPI = (authorization = _config_Axios_Header_Authorization) => axios.create({
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authorization
    }
});

/**
 * @type {{sku: ValidateInputProductFunction<string>; dot: ValidateInputProductFunction<string>; price: ValidateInputProductFunction<number>; stock: ValidateInputProductFunction<number>;}}
 */
const validateInputProductSync = {
    /**
     * @param {string} value - Input SKU
     */
    "sku": (value) => {
        // return (_.isString(value) && /^[a-z\d]+[a-z\d\-_]*$/.test(value));
        return (_.isString(value) && value.length > 0);
    },
    /**
     * @param {string} value - Input DOT
     */
    "dot": (value) => {
        return (_.isString(value) && /^\d{4}$/.test(value));
    },
    /**
     * @param {number} value - Input price
     */
    "price": (value) => {
        return (_.isFinite(value) && value >= 0);
    },
    /**
     * @param {number} value - Input stock
     */
    "stock": (value) => {
        return (_.isSafeInteger(value) && value >= 0);
    }
};
/**
 * @type {{sku: PromiseValidateInputProductFunction<string>; dot: PromiseValidateInputProductFunction<string>; price: PromiseValidateInputProductFunction<number>; stock: PromiseValidateInputProductFunction<number>;}}
 */
const validateInputProductAsync = {
    ...(Object.keys(validateInputProductSync)
        .reduce((previousValue, currentValue) => {
            previousValue[currentValue] = async (value) => {
                const result = validateInputProductSync[currentValue](value);
                if (!result) {
                    throw Error(`${currentValue} in product is invalid`);
                }
                else {
                    return true;
                }
            }

            return previousValue;
        }, {}))
};


module.exports = {
    utilServiceWYZautoAPI,
    validateInputProductSync,
    validateInputProductAsync
};