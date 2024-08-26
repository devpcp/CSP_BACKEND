const UsersProfiles = require("../models/model").UsersProfiles;
const ShopsProfiles = require("../models/model").ShopsProfiles;
const ShopHq = require("../models/model").ShopHq;
const MatchShopHq = require("../models/model").MatchShopHq;
const { Op, literal } = require("sequelize");
const { isUUID } = require("./generate");

const fnWhere_select_shop_ids = (request) => {
    if (request.query.select_shop_ids && request.query.select_shop_ids !== 'all') {
        /**
         * @type {Array<string>}
         */
        let select_shop_ids = request.query.select_shop_ids
            .split(',')
            .map(ele => (ele.toLowerCase()));

        if (select_shop_ids.filter(where => where === 'all').length > 0) {
            return {};
        }
        else if (select_shop_ids.filter(where => (where !== 'all' && !isUUID(where))).length > 0) {
            throw new Error('ข้อมูล select_shop_ids ไม่ถูกต้อง');
        }
        else {
            select_shop_ids = select_shop_ids.filter(where => isUUID(where));
        }

        return {
            '$"ShopHq->ShopsProfiles->MatchShopHq"."shop_id"$': {
                [Op.in]: select_shop_ids
            }
        };
    }
    else {
        return {};
    }
};

/**
 * @param request
 * @returns {string[][]}
 */
const fnSortBy_select_shop_ids = (request) => {
    if (request.query.select_shop_ids && request.query.select_shop_ids !== 'all') {
        /**
         * @type {Array<string>}
         */
        const select_shop_ids = request.query.select_shop_ids.split(',');
        return select_shop_ids
            .filter(where => isUUID(where))
            .map((element) => ([literal(`"ShopHq->ShopsProfiles->MatchShopHq"."shop_id" = '${element}'`), `DESC`]));
    }
    else {
        return [];
    }
};

/**
 * A utility help you get "shop_code_id" from fastify's "request.id"
 * - When select mode "default", it will return Object
 * - When select mode "select_shop_ids" it will return Array
 * @template T
 * @param {import("fastify").FastifyRequest<T> | import("../types/type.Default.Fastify").FastifyRequestDefault<T>} request
 * @param {'default' | 'select_shop_ids'} [mode='default']
 * @param {'default' | 'ignore_throw'} [option='default']
 * @returns {Promise<import("../models/ShopsProfiles/ShopsProfiles") & {shop_code_id: string} | Array<import("../models/ShopsProfiles/ShopsProfiles") & {shop_code_id: string}>>}
 */
const utilCheckShopTableName = async (request, mode = 'default', option = 'default') => {
    if (mode === 'default') {
        const check_table_name = await UsersProfiles.findOne({
            include: [
                {
                    model: ShopsProfiles,
                    required: false,
                    where: {
                        isuse: 1
                    }
                }
            ],
            where: {
                user_id: request.id,
                isuse: 1
            }
        });

        if (!check_table_name) {
            throw Error(`Shop profile not found`);
        }
        else {
            check_table_name.ShopsProfile.shop_code_id = check_table_name.ShopsProfile.shop_code_id.toLowerCase();
            return check_table_name.ShopsProfile;
        }
    }
    else if (mode === 'select_shop_ids') {
        const check_table_name = await UsersProfiles.findOne({
            include: [
                {
                    model: ShopsProfiles,
                    required: false,
                    where: {
                        isuse: 1
                    }
                },
                {
                    model: ShopHq,
                    include: [
                        {
                            model: ShopsProfiles,
                            through: MatchShopHq,
                        }
                    ]
                }
            ],
            where: {
                user_id: request.id,
                isuse: 1,
                ...fnWhere_select_shop_ids(request)
            },
            order: [
                ...fnSortBy_select_shop_ids(request),
                [literal(`"UsersProfiles"."shop_id" = "ShopHq->ShopsProfiles"."id"`), 'DESC'],
                [literal(`"ShopHq->ShopsProfiles"."shop_code_id"`), 'ASC']
            ]
        });

        if (!check_table_name && fnSortBy_select_shop_ids(request).length === 1) {
            const check_table_name = await UsersProfiles.findOne({
                include: [
                    {
                        model: ShopsProfiles,
                        required: true,
                        where: {
                            id: request.query.select_shop_ids,
                            isuse: 1
                        }
                    }
                ],
                where: {
                    user_id: request.id,
                    isuse: 1
                }
            });

            if (!check_table_name) {
                throw Error(`Shop profile not found`);
            }
            else {
                check_table_name.ShopsProfile.shop_code_id = check_table_name.ShopsProfile.shop_code_id.toLowerCase();
                return [check_table_name.ShopsProfile];
            }
        }

        if (!check_table_name) {
            throw Error(`Shop profile not found`);
        }
        else {
            if (!request.query.select_shop_ids) {
                check_table_name.ShopsProfile.shop_code_id = check_table_name.ShopsProfile.shop_code_id.toLowerCase();
                return [check_table_name.ShopsProfile];
            }
            else {
                if (check_table_name.hq_id) {
                    return check_table_name.ShopHq.ShopsProfiles.map(el => { return { ...el.dataValues, ...{ shop_code_id: el.dataValues.shop_code_id.toLowerCase() } } })
                }
                else {
                    if (option === 'ignore_throw') {
                        return [];
                    }
                    throw Error(`HQ not found`);
                }
            }
        }
    }
    else {
        throw Error(`Function parameter 'mode' not found`);
    }
};


module.exports = utilCheckShopTableName;

