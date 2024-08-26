const { Op } = require("sequelize");
const { isNull } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");

const sequelize = require('../db');
const Product = require('../models/Product/Product');
const ProductType = require("../models/ProductType/ProductType");
const ProductBrand = require("../models/ProductBrand/ProductBrand");
const ProductCompleteSize = require("../models/ProductCompleteSize/ProductCompleteSize");
const ProductModelType = require("../models/ProductModelType/ProductModelType");

const productAll = async (request, res) => {

    const requestLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;
    var search = request.query.search;
    const sort = request.query.sort;
    const order = request.query.order;
    const status = request.query.status;

    var isuse = []
    if (status == 'delete') {
        isuse = [2]
    } else if (status == 'active') {
        isuse = [1]
    } else if (status == 'block') {
        isuse = [0]
    } else {
        isuse = [1, 0]
    }

    /**
     * A function to render literal search by CODE
     * @param {string} search
     * @return {Array<import("sequelize").literal>}
     */
    const renderSearchCode = (search) => {
        if (/^[0-9]+$/.test(search)) {
            return [
                ...requestLang.map(w => sequelize.Sequelize.literal(`REGEXP_REPLACE("Product"."product_name"->>'${w}', '\\D', '', 'g') LIKE '%${search}%'`))
            ];
        }
        else {
            return [];
        }
    }

    var where_q = {
        [Op.and]: [{ isuse: isuse }],
        [Op.or]: [
            ...renderSearchCode(search),
            {
                product_name: {
                    [Op.or]: [
                        { th: { [Op.like]: '%' + search + '%' } },
                        { en: { [Op.like]: '%' + search + '%' } },
                        { name_from_dealer: { [Op.like]: '%' + search + '%' } },
                    ]
                }
            },
            { product_code: { [Op.like]: '%' + search + '%' } },
            { master_path_code_id: { [Op.like]: '%' + search + '%' } },
            { custom_path_code_id: { [Op.like]: '%' + search + '%' } },
            // { "$Province.prov_name_th$": { [Op.like]: '%' + search + '%' } },
            sequelize.literal("type_name->>'th' LIKE '%" + search + "%'"),
            sequelize.literal("brand_name->>'th' LIKE '%" + search + "%'"),
            sequelize.literal("model_name->>'th' LIKE '%" + search + "%'"),
            {
                other_details: {
                    [Op.or]: [
                        { cci_code: { [Op.like]: '%' + search + '%' } },
                        { ccid_code: { [Op.like]: '%' + search + '%' } },
                        { cad_code: { [Op.like]: '%' + search + '%' } },
                        { sourcing_manufacturing: { [Op.like]: '%' + search + '%' } },
                        { position_front_and_rear: { [Op.like]: '%' + search + '%' } },
                        { tl_and_tt_index: { [Op.like]: '%' + search + '%' } },
                        { based_price: { [Op.like]: '%' + search + '%' } },
                        { after_channel_discount: { [Op.like]: '%' + search + '%' } },
                        { suggasted_re_sell_price: { [Op.like]: '%' + search + '%' } },
                        { suggested_online_price: { [Op.like]: '%' + search + '%' } },
                    ]
                }
            },

        ],


    }


    var producr = await Product.findAll({
        order: [[sort, order]],
        include: [{ model: ProductType, attributes: ['id', 'code_id', 'type_name', 'type_group_id'] },
        { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
        { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
        { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }],
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Product\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Product\".\"updated_by\" )"), 'updated_by']
            ]
        },
        required: false,
        where: where_q,
        limit: limit,
        offset: (page - 1) * limit,
    })


    var length_data = await Product.count({
        include:
            [{ model: ProductType, attributes: ['id', 'code_id', 'type_name', 'type_group_id'] },
            { model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'] },
            { model: ProductCompleteSize, attributes: ['id', 'code_id', 'complete_size_name'] },
            { model: ProductModelType, attributes: ['id', 'code_id', 'model_name'] }]
        ,
        where: where_q
    })



    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: producr.length,
        totalCount: length_data,
        data: producr

    }



    await handleSaveLog(request, [['get product all'], ''])
    return ({ status: 'success', data: pag })

}


const productAdd = async (request, res) => {
    var action = 'add product'
    try {


        // request.id = '90f5a0a9-a111-49ee-94df-c5623811b6cc'
        var { product_code, master_path_code_id, custom_path_code_id, product_name, product_type_id, product_brand_id, product_model_id,
            rim_size, width, hight, series, load_index, speed_index, complete_size_id, other_details } = request.body

        if (isNull(product_name)) {
            await handleSaveLog(request, [[action], 'product_name null'])
            return ({ status: "failed", data: "product_name can not null" })
        }


        if (master_path_code_id) {
            var check_master_path = await Product.findAll({ where: { master_path_code_id: master_path_code_id } });
            if (check_master_path[0]) {
                return ({ status: "failed", data: "master_path_code_id already" })
            }
        }

        if (custom_path_code_id) {
            var check_custom_path = await Product.findAll({ where: { custom_path_code_id: custom_path_code_id } });
            if (check_custom_path[0]) {
                return ({ status: "failed", data: "custom_path_code_id already" })
            }
        }

        if (product_type_id) {
            bus = await ProductType.findAll({ where: { id: product_type_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'product_type_id not found'])
                return ({ status: "failed", data: "product_type_id not found" })
            }
        }

        if (product_brand_id) {
            bus = await ProductBrand.findAll({ where: { id: product_brand_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'product_brand_id not found'])
                return ({ status: "failed", data: "product_brand_id not found" })
            }
        }


        if (product_model_id) {
            bus = await ProductModelType.findAll({ where: { id: product_model_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'product_model_id not found'])
                return ({ status: "failed", data: "product_model_id not found" })
            }
        }


        if (complete_size_id) {
            bus = await ProductCompleteSize.findAll({ where: { id: complete_size_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'complete_size_id not found'])
                return ({ status: "failed", data: "complete_size_id not found" })
            }
        }

        const details = request.body?.details || {};

        // return custom_path_code_id

        var create = await Product.create({
            product_code: product_code,
            master_path_code_id: master_path_code_id || undefined,
            custom_path_code_id: custom_path_code_id || undefined,
            product_name: product_name,
            product_type_id: product_type_id,
            product_brand_id: product_brand_id,
            product_model_id: product_model_id,
            rim_size: rim_size,
            width: width,
            hight: hight,
            series: series,
            load_index: load_index,
            speed_index: speed_index,
            complete_size_id: complete_size_id,
            created_date: Date.now(),
            created_by: request.id,
            other_details: other_details,
            isuse: 1,
            details: details
        })

        await handleSaveLog(request, [[action, create.id, request.body], ''])
        return ({ status: "success", data: create })

    } catch (error) {
        await handleSaveLog(request, [[action], 'error : ' + error])
        if (error.name.includes('Sequelize')) {
            return ({ status: "failed", data: error.errors.map(e => e.message).toString() })
        } else {
            return ({ status: "failed", data: error })
        }

    }
}

const productById = async (request, res) => {
    try {

        var product_id = request.params.id

        var find_product = await Product.findAll({
            include: [{ model: ProductType },
            { model: ProductBrand },
            { model: ProductCompleteSize },
            { model: ProductModelType }],
            attributes: {
                include: [
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Product\".\"created_by\" )"), 'created_by'],
                    [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"Product\".\"updated_by\" )"), 'updated_by']
                ]
            },
            required: false,
            where: {
                id: product_id
            },
        });

        await handleSaveLog(request, [['get product byid'], ''])
        return ({ status: "success", data: [find_product[0]] })


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['get product byid'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const productPut = async (request, res) => {
    var action = 'put product'
    try {

        var { product_code, master_path_code_id, custom_path_code_id, product_name, product_type_id, product_brand_id, product_model_id,
            rim_size, width, hight, series, load_index, speed_index, complete_size_id, other_details } = request.body

        var isuse = request.body.status

        var product_id = request.params.id
        var data = {}


        const find_product = await Product.findOne({ where: { id: product_id } });
        if (!find_product) {
            await handleSaveLog(request, [[action], 'product not found'])
            return ({ status: "failed", data: "product not found" })
        }
        if (!isNull(product_code)) {
            data.product_code = product_code
        }
        if (!isNull(master_path_code_id)) {
            data.master_path_code_id = master_path_code_id
        }
        if (!isNull(custom_path_code_id)) {
            data.custom_path_code_id = custom_path_code_id
        }
        if (!isNull(product_name)) {
            data.product_name = product_name
        }
        if (!isNull(rim_size)) {
            data.rim_size = rim_size
        }
        if (!isNull(width)) {
            data.width = width
        }
        if (!isNull(hight)) {
            data.hight = hight
        }
        if (!isNull(series)) {
            data.series = series
        }
        if (!isNull(load_index)) {
            data.load_index = load_index
        }
        if (!isNull(speed_index)) {
            data.speed_index = speed_index
        }
        if (!isNull(other_details)) {
            data.other_details = other_details
        }


        if (!isNull(product_type_id)) {
            bus = await ProductType.findAll({ where: { id: product_type_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'product_type_id not found'])
                return ({ status: "failed", data: "product_type_id not found" })
            } else {
                data.product_type_id = product_type_id
            }
        }

        if (!isNull(product_brand_id)) {
            bus = await ProductBrand.findAll({ where: { id: product_brand_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'product_brand_id not found'])
                return ({ status: "failed", data: "product_brand_id not found" })
            } else {
                data.product_brand_id = product_brand_id
            }
        }

        if (!isNull(product_model_id)) {
            bus = await ProductModelType.findAll({ where: { id: product_model_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'product_model_id not found'])
                return ({ status: "failed", data: "product_model_id not found" })
            } else {
                data.product_model_id = product_model_id
            }
        }

        if (!isNull(complete_size_id)) {
            bus = await ProductCompleteSize.findAll({ where: { id: complete_size_id } })
            if (!bus[0]) {
                await handleSaveLog(request, [[action], 'complete_size_id not found'])
                return ({ status: "failed", data: "complete_size_id not found" })
            } else {
                data.complete_size_id = complete_size_id
            }
        }


        if (!isNull(isuse)) {
            if (isuse == 'delete') {
                data.isuse = 2
            } else if (isuse == 'active') {
                data.isuse = 1
            } else if (isuse == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }

        if (request.body?.details) {
            if (Object.keys(request.body?.details).length > 0) {
                data.details = {
                    ...(find_product.get('details') || {}),
                    ...request.body.details
                };
            }
        }

        data.updated_by = request.id
        data.updated_date = new Date()


        var before_update = await Product.findOne({
            where: {
                id: product_id
            }
        });

        await Product.update(data, {
            where: {
                id: product_id
            }
        });

        var update = await Product.findOne({
            where: {
                id: product_id
            }
        });


        await handleSaveLog(request, [[action, product_id, request.body, before_update], ''])
        return ({ status: "success", data: update })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    productAll,
    productAdd,
    productById,
    productPut
}