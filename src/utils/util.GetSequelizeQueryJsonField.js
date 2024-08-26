const {
    isString,
} = require("lodash");
const _ = require("lodash");

// --- Using Example ---
// const jsonField = {
//     tel_no: setJsonField(_.get(request.query, "jsonField.tel_no", "")),
//     mobile_no: setJsonField(_.get(request.query, "jsonField.mobile_no", "")),
//     other_details: setJsonField(_.get(request.query, "jsonField.other_details", "")),
// };

/**
 * A function to generate JSON filter in postgres where is contains dynamic JSON keys from String Request
 * - A word can determine by comma ","
 * - example: jsonField = "data_1"
 * - example: jsonField = "data_1,data_2"
 * - example: jsonField = "data_1,data_2,data_3"
 * @param {string} jsonField - Parameter
 * @returns {string[]}
 */
const utilGetSequelizeQueryJsonField = (jsonField = "") => {
    if (!isString(jsonField) || !jsonField) {
        return [];
    } else {
        const extractData = jsonField.split(",")
            .map(where => {
                const refactorInput = where.replace(/\s/, "");
                if (refactorInput !== "") {
                    return refactorInput;
                }
            });
        return extractData;
    }
};

module.exports = utilGetSequelizeQueryJsonField;