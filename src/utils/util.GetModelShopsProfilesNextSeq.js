const _ = require("lodash");
const {Op} = require("sequelize");

const modelShopsProfiles = require("../models/model").ShopsProfiles;


/**
 * > This function will return the next sequence number of the shop code id
 * @param {string} [shopsType="01"] - The type of shop, which is a string of two characters.
 * @param {string} [shopsReference] - HQ or MQ
 * @returns an object with two properties, seq and shop_code_id.
 */
const utilGetModelShopsProfilesNextSeq = async (shopsType = "01", shopsReference = "") => {
    if (shopsType !== "01") {
        throw Error(`Require parameter #shopsType`);
    }
    else if (shopsReference !== "HQ" && shopsReference !== "MQ") {
        throw Error(`Require parameter #reference`);
    }
    else {
        /**
         * @type {number}
         */
        const findCurrentSeq = await modelShopsProfiles.max("seq", {
            where: {
                shop_code_id: {
                    [Op.like]: `%${shopsReference}%`
                }
            }
        }) + 1;

        const newStringSequence = _.padStart(String(findCurrentSeq), 4, "0");
        const concatStringShopCodeId = `${shopsType}${shopsReference}${newStringSequence}`;

        return {
            seq: findCurrentSeq,
            shop_code_id: concatStringShopCodeId
        };
    }
};


module.exports = utilGetModelShopsProfilesNextSeq;