const _ = require("lodash");

/**
 * A utility gep to check is "shop_code_id" that is field from model "ShopsProfiles"
 * @param {string} shop_code_id
 * @returns {boolean}
 */
const utilCheckModelShopsProfilesAtFieldShopCodeId = (shop_code_id = "") => {
    if (!_.isString(shop_code_id) || !shop_code_id) {
        return false;
    }
    else {
        // const regexShopCodeId = /^[0-9]{2}((HQ)|(SQ)){1}[0-9]{4,}$/g;
        // return regexShopCodeId.test(shop_code_id);
        return true;
    }
};

module.exports = utilCheckModelShopsProfilesAtFieldShopCodeId;