const { Op, literal } = require("sequelize");
const { paginate } = require("../utils/generate");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilServiceWYZautoTaskScheduleGetProducts = require("../utils/util.Service.WYZauto.TaskSchedule.GetProducts");
const utilSequelizeCreateTableIfNotExistsFromModel = require("../utils/util.Sequelize.CreateTableIfNotExistsFromModel");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const {
    config_sys_third_party_api_enable_send_to_wyzauto,
} = require("../config");

const db = require("../db");
const modelProduct = require("../models/model").Product;
const modelProductType = require("../models/model").ProductType;
const modelProductTypeGroup = require("../models/model").ProductTypeGroup;
const modelProductBrand = require("../models/model").ProductBrand;
const modelProductCompleteSize = require("../models/model").ProductCompleteSize;
const modelProductModelType = require("../models/model").ProductModelType;


/**
 * @param request {import("../types/type.Default.Fastify").FastifyRequestDefault}
 */
const handlerShopProductsHoldWYZautoAll = async (request) => {
    const action = 'get ShopProductsHoldWYZauto all';
    const configSendToWYZAutoAPI = config_sys_third_party_api_enable_send_to_wyzauto;

    try {
        const user_id = request.id;

        const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        const search = request.query.search || "";
        const sort = request.query.sort || "created_date";
        const order = request.query.order || "desc";
        const limit = +request.query.limit || 10;
        const page = +request.query.page || 1;
        const status = ['0', '1', '2'].includes(request.query.status)
            ? { isuse: +request.query.status }
            : {
                start_date: {
                    [Op.not]: null
                },
                end_date: {
                    [Op.is]: null
                },
                isuse: { [Op.in] : [0, 1] }
            };

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);

        if (!findShopsProfile) {
            throw Error(`Variable "findShopsProfile" return not found`);
        } else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            throw Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
        } else {
            /**
             * A name for create dynamics table
             * @type {string}
             */
            const table_name = findShopsProfile.shop_code_id;

            const modelShopProducts = require("../models/model").ShopProduct(table_name);
            const modelShopStock = require("../models/model").ShopStock(table_name);

            const modelShopProductsHoldWYZauto = require("../models/model").ShopProductsHoldWYZauto(table_name);
            await utilSequelizeCreateTableIfNotExistsFromModel(modelShopProductsHoldWYZauto);

            if (configSendToWYZAutoAPI === true) {
                await utilServiceWYZautoTaskScheduleGetProducts(user_id, findShopsProfile.get('id'), findShopsProfile.shop_code_id);
            }

            /**
             * A function to render literal search by ProductBrandCodeId
             * @param {string} search
             * @return {Array<import("sequelize").literal>}
             */
            const extractSearchRule = (search = '') => {
                const storedSearchQueries = [];

                /**
                 * ✅ "9984"
                 */
                if (/^[0-9]+$/.test(search)) {
                    requestLang.forEach(w => {
                        if (w.length > 0) {
                            storedSearchQueries.push(db.Sequelize.literal(`REGEXP_REPLACE("ShopProducts->Product"."product_name"->>'${w}', '[^0-9]', '', 'g') LIKE '${search}%'`));
                        }
                    });
                }

                /**
                 * ✅ "MI 9984A"
                 * ✅ "MI  9984A"
                 */
                if (/^[a-zA-Z]{2,}\s+.*/.test(search)) {
                    /**
                     * @type {string[]}
                     */
                    const extractSearch = search
                        .split(/\s/)
                        .reduce((previousValue, currentValue) => {
                            if (currentValue.length > 0) {
                                previousValue.push(currentValue)
                            }
                            return previousValue;
                        }, []);

                    requestLang.forEach(whereLang => {
                        storedSearchQueries.push(db.literal(`"ShopProducts->Product"."product_name"->>'${whereLang}' iLIKE '%${
                            extractSearch.reduce((previousValue, currentValue) => {
                                return `${previousValue}%${currentValue}`
                            }, '')
                        }%'`));
                    });

                }

                /**
                 * ✅ "Yokohama2656018"
                 * ✅ "Yoko2656018"
                 * ✅ "Yo2656018"
                 * ✅ "YK2656018"
                 */
                if (/^[a-zA-Z]{2,}[0-9]+$/.test(search)) {
                    const extractSearchBrand = search
                        .match(/^[a-zA-Z]+/)[0];
                    const extractSearchNumber = search
                        .match(/[0-9]+$/)[0];

                    storedSearchQueries.push(db.literal(`"ShopProducts->Product"."master_path_code_id" iLIKE '%${extractSearchBrand}%'`));

                    storedSearchQueries.push({
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    db.literal(`"ShopProducts->Product->ProductBrand"."brand_name"->>'th' iLIKE '%${extractSearchBrand}%'`),
                                    db.literal(`"ShopProducts->Product->ProductBrand"."brand_name"->>'en' iLIKE '%${extractSearchBrand}%'`),
                                ]
                            },
                            {
                                [Op.or]: [
                                    ...requestLang.reduce((previousValue, currentValue) => {
                                        if (currentValue) {
                                            previousValue.push(db.Sequelize.literal(`REGEXP_REPLACE("ShopProducts->Product"."product_name"->>'${currentValue}', '[^0-9]', '', 'g') LIKE '${extractSearchNumber}%'`));
                                        }
                                        return previousValue;
                                    }, [])
                                ]
                            }
                        ]
                    })
                }

                /**
                 * Something Else
                 * ✅ "265/60R18"
                 */
                /**
                 * @type {string[]}
                 */
                const extractSearch = search
                    .split(/\s/)
                    .reduce((previousValue, currentValue) => {
                        if (currentValue.length > 0) {
                            previousValue.push(currentValue)
                        }
                        return previousValue;
                    }, []);

                storedSearchQueries.push(db.literal(`"ShopProducts->Product"."custom_path_code_id" iLIKE '${
                    extractSearch.reduce((previousValue, currentValue) => {
                        if (currentValue.length > 0) {
                            return `${previousValue}%${currentValue}`;
                        }
                        else {
                            return previousValue;
                        }
                    }, '')
                }%'`));
                storedSearchQueries.push(db.literal(`"ShopProducts->Product"."master_path_code_id" iLIKE '${
                    extractSearch.reduce((previousValue, currentValue) => {
                        if (currentValue.length > 0) {
                            return `${previousValue}%${currentValue}`;
                        }
                        else {
                            return previousValue;
                        }
                    }, '')
                }%'`));
                requestLang.forEach(w => {
                    storedSearchQueries.push(db.literal(`"ShopProducts->Product"."product_name"->>'${w}' iLIKE '${
                        extractSearch.reduce((previousValue, currentValue) => {
                            if (currentValue.length > 0) {
                                return `${previousValue}%${currentValue}`;
                            }
                            else {
                                return previousValue;
                            }
                        }, '')
                    }%'`));
                });

                return storedSearchQueries;
            };

            const findAll = await modelShopProductsHoldWYZauto.findAll({
                include: [
                    {
                        model: modelShopProducts,
                        as: 'ShopProducts',
                        include: [
                            {
                                model: modelProduct,
                                include: [
                                    {
                                        model: modelProductType,
                                        include: [
                                            {
                                                model: modelProductTypeGroup
                                            }
                                        ]
                                    },
                                    {
                                        model: modelProductBrand,
                                    },
                                    {
                                        model: modelProductCompleteSize,
                                    },
                                    {
                                        model: modelProductModelType,
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        model: modelShopStock,
                        as: 'ShopStock'
                    }
                ],
                where: {
                    ...status,
                    [Op.or]: [
                        ...extractSearchRule(search),
                        { details: { wyz_code: { [Op.iLike]: `%${search}%` } } },
                        { details: { shelfItem_id: { [Op.iLike]: `%${search}%` } } },
                        literal(`"ShopProducts->Product"."master_path_code_id" ILIKE '%${search}%'`),
                        literal(`"ShopProducts->Product"."custom_path_code_id" ILIKE '%${search}%'`),
                        literal(`"ShopProducts->Product"."other_details"->>'sku' ILIKE '%${search}%'`),

                        literal(`"ShopProducts->Product->ProductType"."code_id" ILIKE '%${search}%'`),
                        ...(
                            requestLang.map(w => {
                                return literal(`"ShopProducts->Product->ProductType"."type_name"->>'${w}' ILIKE '%${search}%'`);
                            })
                        ),

                        literal(`"ShopProducts->Product->ProductType->ProductTypeGroup"."code_id" ILIKE '%${search}%'`),
                        ...(
                            requestLang.map(w => {
                                return literal(`"ShopProducts->Product->ProductType->ProductTypeGroup"."group_type_name"->>'${w}' ILIKE '%${search}%'`);
                            })
                        ),

                        literal(`"ShopProducts->Product->ProductBrand"."code_id" ILIKE '%${search}%'`),
                        ...(
                            requestLang.map(w => {
                                return literal(`"ShopProducts->Product->ProductBrand"."brand_name"->>'${w}' ILIKE '%${search}%'`);
                            })
                        ),

                        literal(`"ShopProducts->Product->ProductCompleteSize"."code_id" ILIKE '%${search}%'`),
                        ...(
                            requestLang.map(w => {
                                return literal(`"ShopProducts->Product->ProductCompleteSize"."complete_size_name"->>'${w}' ILIKE '%${search}%'`);
                            })
                        ),

                        literal(`"ShopProducts->Product->ProductModelType"."code_id" ILIKE '%${search}%'`),
                        ...(
                            requestLang.map(w => {
                                return literal(`"ShopProducts->Product->ProductModelType"."model_name"->>'${w}' ILIKE '%${search}%'`);
                            })
                        ),
                    ]
                },
                order: [[sort, order]]
            });

            await handleSaveLog(request, [[action], '']);

            return utilSetFastifyResponseJson('success', paginate(findAll, limit, page));
        }
    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw new Error(`Request is error LogId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopProductsHoldWYZautoAll;