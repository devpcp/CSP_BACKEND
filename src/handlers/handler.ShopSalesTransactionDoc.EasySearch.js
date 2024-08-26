const { escapeRegExp } = require("lodash");
const { Op } = require("sequelize");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const db = require("../db");

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopSalesTransactionDocEasySearch = async (request) => {
    const search = request.query.search || "";
    const sort = request.query.sort || "updated_date";
    const order = request.query.order || "asc";
    const limit = +request.query.limit || 10;
    const page = +request.query.page || 1;

    const splitSearch = search.split(/\s+/).filter(w => /\s+/.test(w) === false);

    /**
     * A result of find data to see what ShopProfile's id whereby this user's request
     */
    const findShopsProfile = await utilCheckShopTableName(request);
    /**
     * A name for create dynamics table
     * @type {string}
     */
    const table_name = findShopsProfile.shop_code_id;

    /**
     * A class's dynamics instance of model "ShopVehicleCustomers"
     */
    const instanceModelShopVehicleCustomers = require("../models/model").ShopVehicleCustomer(table_name);

    /**
     * A class's dynamics instance of model "ShopBusinessCustomers"
     */
    const instanceModelShopBusinessCustomers = require("../models/model").ShopBusinessCustomers(table_name);

    /**
     * A class's dynamics instance of model "ShopPersonalCustomers"
     */
    const instanceModelShopPersonalCustomers = require("../models/model").ShopPersonalCustomers(table_name);

    /**
     * It returns a regular expression that searches for a value in a JSON string
     * @param {string} [search=""] - The search string to look for.
     * @returns A regular expression that will match a JSON string that contains the search string.
     */
    const fnSearchDatabaseValueJSON = (search = "") => {
        return `[:](\\".*(${escapeRegExp(search)}).*\\")`;
    };

    const fnSearchSequelizeValueJSON = (literal = "", search = "") => {
        return db.where(
            db.literal(literal + "::text"),
            Op.regexp,
            fnSearchDatabaseValueJSON(search)
        )
    };

    const where_q = {
        [Op.or]: [
            {
                code_id: { [Op.iLike]: `%${search}%` }
            },
            db.where(
                db.literal(`"ShopVehicleCustomer".details->>'registration'`),
                Op.iLike,
                `%${search}%`
            ),
            db.where(
                db.literal(`"ShopVehicleCustomer".details->>'province_name'`),
                Op.iLike,
                `%${search}%`
            ),
            db.where(
                db.literal(`"ShopPersonalCustomer".master_customer_code_id`),
                Op.iLike,
                `%${search}%`
            ),
            fnSearchSequelizeValueJSON(`"ShopBusinessCustomer".tel_no`, search),
            fnSearchSequelizeValueJSON(`"ShopBusinessCustomer".mobile_no`, search),
            fnSearchSequelizeValueJSON(`"ShopPersonalCustomer".tel_no`, search),
            fnSearchSequelizeValueJSON(`"ShopPersonalCustomer".mobile_no`, search),

            ...splitSearch.map(w => fnSearchSequelizeValueJSON(`"ShopBusinessCustomer".customer_name`, w)),
            ...splitSearch.map(w => fnSearchSequelizeValueJSON(`"ShopPersonalCustomer".customer_name`, w)),
        ]
    }


    const inc = [
        {
            model: instanceModelShopBusinessCustomers
        },
        {
            model: instanceModelShopPersonalCustomers
        }
    ]


    // const findDocument = await instanceModelShopVehicleCustomers.findAll({
    //     include: inc,
    //     where: where_q,
    //     order: [[sort, order]],
    //     limit: limit,
    //     offset: (page - 1) * limit
    // });
    //
    //
    // const length_data = await instanceModelShopVehicleCustomers.count({
    //     include: inc,
    //     where: where_q
    // });

    const [findDocument, length_data] = await Promise.all([
        instanceModelShopVehicleCustomers.findAll({
            include: inc,
            where: where_q,
            order: [[sort, order]],
            limit: limit,
            offset: (page - 1) * limit
        }),
        instanceModelShopVehicleCustomers.count({
            include: inc,
            where: where_q
        })
    ]);


    const pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: findDocument.length,
        totalCount: length_data,
        data: findDocument
    };

    return utilSetFastifyResponseJson("success", pag);
};


module.exports = handlerShopSalesTransactionDocEasySearch;