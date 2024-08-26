const _ = require("lodash");
const { Op, literal } = require("sequelize");
const { handleSaveLog } = require("./log");
const { paginate, generateSearchOpFromKeys } = require("../utils/generate");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilIsErrorDynamicsTableNotFound = require("../utils/util.IsErrorDynamicsTableNotFound");

const modelShopsProfiles = require("../models/model").ShopsProfiles;
const modelBusinessType = require("../models/model").BusinessType;
const modelSubDistrict = require("../models/model").SubDistrict;
const modelDistrict = require("../models/model").District;
const modelProvince = require("../models/model").Province;
const modelShopBusinessPartners = require("../models/model").ShopBusinessPartners;

const handlerShopBusinessPartnersAll = async (request) => {
    const action = "GET ShopShopBusinessPartners.All";

    try {
        /**
         * A function to generate JSON filter in postgres where is contains dynamic JSON keys
         * @param jsonFieldReq
         * @returns {string[]}
         */
        const setJsonField = (jsonFieldReq = "") => {
            if (!_.isString(jsonFieldReq) || !jsonFieldReq) {
                return [];
            } else {
                const extractData = jsonFieldReq.split(",")
                    .map(where => {
                        const refactorInput = where.replace(/\s/, "");
                        if (refactorInput !== "") {
                            return refactorInput;
                        }
                    });
                return extractData;
            }
        };

        // Init data as requested
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        const search = request.query.search || "";
        const status = utilGetIsUse(request.query.status);
        const sort = request.query.sort || "id";
        const order = request.query.order || "asc";
        const limit = +request.query.limit || 10;
        const page = +request.query.page || 1;
        const dropdown = request.query.dropdown
        const jsonField = {
            tel_no: setJsonField(_.get(request.query, "jsonField.tel_no", "")),
            mobile_no: setJsonField(_.get(request.query, "jsonField.mobile_no", "")),
            other_details: setJsonField(_.get(request.query, "jsonField.other_details", "")),
        };


        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');

        if (!findShopProfiles) {
            const instanceError = new Error(`Variable "findShopsProfile" return not found`);
            await handleSaveLog(request, [[action], instanceError]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopProfiles[0]?.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[action], instanceError]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else {
            /**
             * A name for create dynamics table
             * @type {string}
             */
            const table_name = findShopProfiles[0].shop_code_id;

            /**
             * A class's dynamics instance of model "ShopBusinessPartners"
             */
            const instanceModelShopBusinessPartners = modelShopBusinessPartners(table_name);

            let inc_attr = (dropdown) ? { attributes: [] } : {}
            let select_attr = (dropdown) ? ['id', 'code_id', 'partner_name'] : {
                include: [
                    [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopBusinessPartners"."created_by")`), `created_by`],
                    [literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "ShopBusinessPartners"."updated_by")`), `updated_by`]
                ]
            }
            let inc = [
                { model: modelShopsProfiles, as: 'ShopsProfiles', ...inc_attr },
                { model: modelBusinessType, as: 'BusinessType', ...inc_attr },
                { model: modelSubDistrict, as: 'SubDistrict', ...inc_attr },
                { model: modelDistrict, as: 'District', ...inc_attr },
                { model: modelProvince, as: 'Province', ...inc_attr }
            ]
            let whereQuery = {
                [Op.and]: [status],
                [Op.or]: [
                    {
                        code_id: { [Op.iLike]: `%${search}%` }
                    },
                    {
                        tax_id: { [Op.iLike]: `%${search}%` }
                    },
                    {
                        partner_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        }
                    },
                    {
                        tel_no: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(jsonField.tel_no, Op.iLike, `%${search}%`)
                            ]
                        }
                    },
                    {
                        mobile_no: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(jsonField.mobile_no, Op.iLike, `%${search}%`)
                            ]
                        }
                    },
                    {
                        e_mail: { [Op.iLike]: `%${search}%` },
                    },
                    {
                        address: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        }
                    },
                    {
                        other_details: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(jsonField.other_details, Op.iLike, `%${search}%`)
                            ]
                        }
                    }
                ]
            }

            const data = await instanceModelShopBusinessPartners.findAll(
                {
                    attributes: select_attr,
                    include: inc,
                    order: [[sort, order]],
                    where: whereQuery,
                    limit: limit,
                    offset: (page - 1) * limit
                }
            ).catch(e => {
                if (utilIsErrorDynamicsTableNotFound(e)) {
                    handleSaveLog(request, [[action], e]).catch(e => { });

                    return [];
                }
                else {
                    throw e;
                }
            });

            var length_data = await instanceModelShopBusinessPartners.count({
                include: inc,
                where: whereQuery
            })



            var pag = {
                currentPage: page,
                pages: Math.ceil(length_data / limit),
                currentCount: data.length,
                totalCount: length_data,
                data: data

            }


            await handleSaveLog(request, [[action], ""]);

            return utilSetFastifyResponseJson("success", pag);
        }
    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};


module.exports = handlerShopBusinessPartnersAll;