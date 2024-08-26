const currency = require("currency.js");

/**
 * Convert number | string value to account/currency value
 * @param value {number|string}
 * @return {import("currency.js")}
 */
const utilToCurrency = (value) => {
    return currency(value, { symbol: '', precision: 2 });
};

module.exports = utilToCurrency;