const { isNull } = require('../utils/generate')
const { Op } = require("sequelize");
const { handleSaveLog } = require('./log')

const sequelize = require("../db");
const ProductTypeGroup = require("../models/model").ProductTypeGroup;
const ProductBrand = require("../models/model").ProductBrand;
const ProductModelType = require("../models/model").ProductModelType;
const ProductType = require("../models/model").ProductType;



const handleAllRaw = async (request) => {

    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search
    var product_type_id = request.query.product_type_id
    var product_brand_id = request.query.product_brand_id
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

    var pro = await ProductModelType.findAll({
        include: [{ model: ProductType }, { model: ProductBrand }],
        where: {
            [Op.and]: [
                { isuse: isuse },
                (product_type_id) ? { product_type_id: product_type_id } : {},
                (product_brand_id) ? { product_brand_id: product_brand_id } : {}
            ],
            model_name: {
                [Op.or]: [
                    { th: { [Op.like]: '%' + search + '%' } },
                    { en: { [Op.like]: '%' + search + '%' } },
                    // { prov_name_en: { [Op.like]: '%' + search + '%' } }
                ]
            }

        },
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductModelType\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductModelType\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        order: [[sort, order]],


    })

    await handleSaveLog(request, [['get ProductModelType all raw'], ''])
    return ({ status: "success", data: pro })

}

const handleAll = async (request) => {

    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search
    var product_type_id = request.query.product_type_id
    var product_brand_id = request.query.product_brand_id
    const status = request.query.status;

    const page = request.query.page || 1;
    const limit = request.query.limit || 10;


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

    var where_q = {
        [Op.and]: [
            { isuse: isuse },
            (product_type_id) ? { product_type_id: product_type_id } : {},
            (product_brand_id) ? { product_brand_id: product_brand_id } : {}
        ],
        model_name: {
            [Op.or]: [
                { th: { [Op.like]: '%' + search + '%' } },
                { en: { [Op.like]: '%' + search + '%' } },
            ]
        }

    }

    var data = await ProductModelType.findAll({
        include: [{ model: ProductType }, { model: ProductBrand }],
        where: where_q,
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductModelType\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductModelType\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        order: [[sort, order]],
        limit: limit,
        offset: (page - 1) * limit
    })


    var length_data = await ProductModelType.count({
        include: [{ model: ProductType }, { model: ProductBrand }],
        where: where_q,
    })


    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: data.length,
        totalCount: length_data,
        data: data

    }

    await handleSaveLog(request, [['get ProductModelType all'], ''])
    return ({ status: "success", data: pag })

}

const handleByTypeBrandAll = async (request) => {

    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search
    const page = request.query.page || 1;
    const limit = request.query.limit || 10;


    var sort_order = [sort, order]
    if (sort == 'sum') {
        sort_order = [sequelize.literal(`CAST(count(product_type_id) AS INT)`), order]
    } else if (sort == 'code_id') {
        sort_order = [sequelize.literal(`\"ProductType\".code_id`), order]
    } else if (sort == 'type_name.th') {
        sort_order = [sequelize.literal(`\"ProductType\".type_name->>'th'`), order]
    } else if (sort == 'type_name.th') {
        sort_order = [sequelize.literal(`\"ProductType\".type_name->>'en'`), order]
    }

    var where = {
        [Op.or]: [
            sequelize.literal(`\"ProductType\".code_id LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ProductType\".type_name->>'th' LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ProductType\".type_name->>'en' LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ProductType->ProductTypeGroup\".code_id LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ProductType->ProductTypeGroup\".group_type_name->>'th' LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ProductType->ProductTypeGroup\".group_type_name->>'en' LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ProductBrand\".code_id LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ProductBrand\".brand_name->>'th' LIKE '%'||:search||'%'`),
            sequelize.literal(`\"ProductBrand\".brand_name->>'en' LIKE '%'||:search||'%'`),
            sequelize.literal(`(SELECT COUNT(*) FROM (SELECT sub.id from master_lookup.mas_product_model_types as sub
                                WHERE sub.product_type_id = \"ProductType\".id 
                                AND sub.product_brand_id=\"ProductBrand\".id
                                AND sub.isuse = 1
                                AND (
                                    sub.code_id LIKE '%'||:search||'%' OR
                                    sub.model_name->>'th' LIKE '%'||:search||'%' OR
                                    sub.model_name->>'en' LIKE '%'||:search||'%' 
                                )) AS sub)>0`)
        ]
    }

    var attr = [
        'product_type_id', 'product_brand_id',
        [sequelize.literal(`(
            SELECT CAST(COUNT(sub.*) AS INT) 
            FROM(
                SELECT sub.*
                FROM master_lookup.mas_product_model_types as sub
                WHERE sub.product_type_id = \"ProductType\".id 
                AND sub.product_brand_id=\"ProductBrand\".id 
                AND sub.isuse = 1
            )AS sub)`), 'sum'],
        [sequelize.literal(`(
                            SELECT sub.updated_date
                            FROM master_lookup.mas_product_model_types as sub
                            WHERE sub.product_type_id = \"ProductType\".id 
                            AND sub.product_brand_id=\"ProductBrand\".id 
                            ORDER BY sub.updated_date desc nulls last
                            limit 1
                        )`), 'updated_date'],
        [sequelize.literal(`(
                            SELECT ss.user_name
                            FROM master_lookup.mas_product_model_types as sub
                            LEFT JOIN systems.sysm_users as ss ON ss.id = sub.updated_by
                            WHERE sub.product_type_id = \"ProductType\".id 
                            AND sub.product_brand_id=\"ProductBrand\".id 
                            ORDER BY sub.updated_date desc nulls last
                            limit 1
                        )`), 'updated_by'],
        [sequelize.literal(`(
                            SELECT sub.created_date
                            FROM master_lookup.mas_product_model_types as sub
                            WHERE sub.product_type_id = \"ProductType\".id 
                            AND sub.product_brand_id=\"ProductBrand\".id 
                            ORDER BY sub.created_date desc nulls last
                            limit 1
                        )`), 'created_date'],
        [sequelize.literal(`(
                            SELECT ss.user_name
                            FROM master_lookup.mas_product_model_types as sub
                            LEFT JOIN systems.sysm_users as ss ON ss.id = sub.created_by
                            WHERE sub.product_type_id = \"ProductType\".id 
                            AND sub.product_brand_id=\"ProductBrand\".id 
                            ORDER BY sub.created_date desc nulls last
                            limit 1
                        )`), 'created_by'],
        [sequelize.literal(`ARRAY( 
                                    SELECT json_build_object(
                                        'id',sub.id,
                                        'code_id',sub.code_id,
                                        'model_name',sub.model_name,
                                        'product_type_id',sub.product_type_id,
                                        'product_brand_id',product_brand_id,
                                        'updated_by',updated_by

                                        ) 
                                    from master_lookup.mas_product_model_types as sub
                                    WHERE sub.product_type_id = \"ProductType\".id 
                                    AND sub.product_brand_id=\"ProductBrand\".id 
                                    AND sub.isuse = 1 
                                    ORDER BY code_id ASC
                                    )`), 'model_list']
    ]

    var group = ['product_type_id', 'product_brand_id', 'ProductType.id', 'ProductBrand.id', 'ProductType->ProductTypeGroup.id']

    var inc = [
        {
            model: ProductType, attributes: ['id', 'code_id', 'type_name'],
            include: [{ model: ProductTypeGroup, attributes: ['id', 'code_id', 'group_type_name'] }],

        },
        {
            model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'],
        }
    ]

    var data = await ProductModelType.findAll({
        attributes: attr,
        group: group,
        include: inc,
        where: where,
        replacements: { search: search },
        order: [sort_order],
        limit: limit,
        offset: (page - 1) * limit
    })

    var length_data = await ProductModelType.count({
        attributes: attr,
        group: group,
        include: inc,
        where: where,
        replacements: { search: search }
    })

    length_data = length_data.length


    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: data.length,
        totalCount: length_data,
        data: data

    }



    await handleSaveLog(request, [['get ProductModelType all'], ''])
    return ({ status: "success", data: pag })

}


const handleById = async (req) => {
    var id = req.params.id
    var data = await ProductModelType.findOne({
        include: [
            { model: ProductType },
            { model: ProductBrand }
        ],
        where: {
            id: id
        },
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductModelType\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductModelType\".\"updated_by\" )"), 'updated_by'],
            ]
        },
    })
    if (data) {

        await handleSaveLog(req, [['get ProductModelType byid'], ''])
        return ({ status: "success", data: data })
    } else {
        await handleSaveLog(req, [['get ProductModelType byid'], 'ProductModelType not found'])
        return ({ status: "failed", data: "ProductModelType not found" })
    }
}

const handleByTypeBrand = async (req) => {
    var product_type_id = req.params.product_type_id
    var product_brand_id = req.params.product_brand_id


    var where = {
        [Op.and]: [
            // sequelize.literal(`\"ProductType\".id = :product_type_id`),
            sequelize.literal(`\"ProductBrand\".id = :product_brand_id`),
        ]
    }

    var attr = [
        'product_type_id', 'product_brand_id',
        [sequelize.literal(`(
                SELECT CAST(COUNT(sub.*) AS INT) 
                FROM(
                    SELECT sub.*
                    FROM master_lookup.mas_product_model_types as sub
                    WHERE sub.product_type_id = \"ProductType\".id 
                    AND sub.product_brand_id=\"ProductBrand\".id 
                    AND sub.isuse = 1
                )AS sub)`), 'sum'],
        [sequelize.literal(`(
                        SELECT sub.updated_date
                        FROM master_lookup.mas_product_model_types as sub
                        WHERE sub.product_type_id = \"ProductType\".id 
                        AND sub.product_brand_id=\"ProductBrand\".id 
                        ORDER BY sub.updated_date desc
                        limit 1
                    )`), 'updated_date'],
        [sequelize.literal(`(
                        SELECT ss.user_name
                        FROM master_lookup.mas_product_model_types as sub
                        LEFT JOIN systems.sysm_users as ss ON ss.id = sub.updated_by
                        WHERE sub.product_type_id = \"ProductType\".id 
                        AND sub.product_brand_id=\"ProductBrand\".id 
                        ORDER BY sub.updated_date desc
                        limit 1
                    )`), 'updated_by'],
        [sequelize.literal(`(
                        SELECT sub.created_date
                        FROM master_lookup.mas_product_model_types as sub
                        WHERE sub.product_type_id = \"ProductType\".id 
                        AND sub.product_brand_id=\"ProductBrand\".id 
                        ORDER BY sub.created_date desc
                        limit 1
                    )`), 'created_date'],
        [sequelize.literal(`(
                        SELECT ss.user_name
                        FROM master_lookup.mas_product_model_types as sub
                        LEFT JOIN systems.sysm_users as ss ON ss.id = sub.created_by
                        WHERE sub.product_type_id = \"ProductType\".id 
                        AND sub.product_brand_id=\"ProductBrand\".id 
                        ORDER BY sub.created_date desc
                        limit 1
                    )`), 'created_by'],
        [sequelize.literal(`ARRAY( 
                                    SELECT json_build_object(
                                        'id',sub.id,
                                        'code_id',sub.code_id,
                                        'model_name',sub.model_name,
                                        'product_type_id',sub.product_type_id,
                                        'product_brand_id',product_brand_id,
                                        'created_date',sub.created_date,
                                        'created_by',sub.created_by,
                                        'updated_date',sub.updated_date,
                                        'updated_by',sub.updated_by
                                        ) 
                                    from master_lookup.mas_product_model_types as sub
                                    WHERE sub.product_type_id = \"ProductType\".id 
                                    AND sub.product_brand_id=\"ProductBrand\".id 
                                    AND sub.isuse = 1 
                                    ORDER BY code_id ASC
                                    )`), 'model_list']
    ]

    var group = ['product_type_id', 'product_brand_id', 'ProductType.id', 'ProductBrand.id', 'ProductType->ProductTypeGroup.id']

    var inc = [
        {
            model: ProductType, attributes: ['id', 'code_id', 'type_name'],
            include: [{ model: ProductTypeGroup, attributes: ['id', 'code_id', 'group_type_name'] }],

        },
        {
            model: ProductBrand, attributes: ['id', 'code_id', 'brand_name'],
        }
    ]

    var data = await ProductModelType.findAll({
        attributes: attr,
        group: group,
        include: inc,
        where: where,
        replacements: { product_type_id: product_type_id, product_brand_id: product_brand_id },
    })


    if (data[0]) {

        await handleSaveLog(req, [['get ProductModelType byid'], ''])
        return ({ status: "success", data: data[0] })
    } else {
        await handleSaveLog(req, [['get ProductModelType byid'], 'ProductModelType not found'])
        return ({ status: "failed", data: "ProductModelType not found" })
    }
}

const handleAdd = async (request) => {
    try {
        var { model_list, product_brand_id } = request.body
        const isuse = 1


        for (let index = 0; index < model_list.length; index++) {
            const element = model_list[index];

            await ProductModelType.create({

                model_name: element.model_name,
                code_id: element.code_id || undefined,
                product_type_id: element.product_type_id,
                product_brand_id: product_brand_id,
                isuse: isuse,
                created_by: request.id,
                created_date: Date.now()
            })

        }

        const create = await ProductModelType.findAll(
            {
                where: {
                    product_brand_id: product_brand_id
                }
            }
        );

        await handleSaveLog(request, [['add ProductModelType', '', request.body], ''])
        return ({ status: "success", data: create })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, ['add ProductModelType', 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}



const handlePut = async (request) => {

    var action = 'put Product model type by type'

    try {
        var { model_list } = request.body

        // var product_type_id = request.params.product_type_id
        var product_brand_id = request.params.product_brand_id

        if (model_list && model_list.length > 0) {
            // await ProductModelType.destroy({
            //     where: { product_type_id: product_type_id, product_brand_id: product_brand_id }
            // })

            var data = {}
            for (let index = 0; index < model_list.length; index++) {
                data = {}
                const element = model_list[index];

                if (element.model_name) {
                    data.model_name = element.model_name
                }
                if (element.code_id) {
                    data.code_id = element.code_id
                }

                if (!isNull(element.status)) {
                    if (element.status == 'delete') {
                        data.isuse = 2
                    } else if (element.status == 'active') {
                        data.isuse = 1
                    } else if (element.status == 'block') {
                        data.isuse = 0
                    }
                }
                data.updated_by = request.id
                data.updated_date = Date.now()

                if (element.id) {
                    await ProductModelType.update(data, {
                        where: { id: element.id }
                    })
                } else {
                    await ProductModelType.create({
                        model_name: element.model_name,
                        code_id: element.code_id || undefined,
                        product_type_id: element.product_type_id,
                        product_brand_id: product_brand_id,
                        isuse: 1,
                        created_by: request.id,
                        created_date: Date.now()
                    })
                }



            }


        }


        var put = await handleByTypeBrand(request)
        put = put.data

        await handleSaveLog(request, [[action, '', request.body], ''])
        return ({ status: "success", data: put })
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }

}


module.exports = {

    handleAllRaw, handleAll, handleByTypeBrandAll, handleById, handleByTypeBrand, handleAdd, handlePut

}