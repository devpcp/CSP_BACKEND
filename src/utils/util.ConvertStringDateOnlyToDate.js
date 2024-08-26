const moment = require("moment");

/**
 * A utility function to convert a string to a date
 * @param {string} [input='YYYY-MM-DD']
 * @return {Date}
 */
const utilConvertStringDateOnlyToDate = (input = moment().format("YYYY-MM-DD")) => {
    return new Date(`${input} 00:00:00`);
};


module.exports = utilConvertStringDateOnlyToDate;