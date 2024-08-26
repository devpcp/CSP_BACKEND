const { isNull } = require('../utils/generate')
const { Op, literal } = require("sequelize");
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const VehicleModelType = require('../models/model').VehicleModelType;
const VehicleBrand = require('../models/model').VehicleBrand;
const VehicleType = require('../models/model').VehicleType;

const handleAllRaw = async (request) => {
    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search
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

    var pro = await VehicleModelType.findAll({
        include: [
            { model: VehicleBrand, attributes: ['id', 'code_id', 'brand_name'] },
            { model: VehicleType, attributes: ['id', 'code_id', 'type_name'] }],
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleModelType\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleModelType\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        where: {
            [Op.and]: [{ isuse: isuse },
            {
                [Op.or]:
                {
                    model_name: {
                        [Op.or]: [
                            { th: { [Op.iLike]: '%' + search + '%' } },
                            { en: { [Op.iLike]: '%' + search + '%' } },
                        ]
                    },
                    code_id: { [Op.iLike]: '%' + search + '%' }
                }
            }],

        },
        order: [[sort, order]],

    })

    await handleSaveLog(request, [["get master vehicle model type all"], ""]);
    return utilSetFastifyResponseJson("success", pro);
}
const handleAll = async (request) => {
    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search
    const status = request.query.status;
    var vehicle_type_id = request.query.vehicle_type_id
    var vehicles_brand_id = request.query.vehicles_brand_id
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
            (vehicle_type_id) ? { vehicle_type_id: vehicle_type_id } : {},
            (vehicles_brand_id) ? { vehicles_brand_id: vehicles_brand_id } : {},
            {
                [Op.or]:
                {
                    model_name: {
                        [Op.or]: [
                            { th: { [Op.iLike]: '%' + search + '%' } },
                            { en: { [Op.iLike]: '%' + search + '%' } },
                        ]
                    },
                    code_id: { [Op.iLike]: '%' + search + '%' }
                }
            }],

    }

    var inc = [
        { model: VehicleBrand, attributes: ['id', 'code_id', 'brand_name'] },
        { model: VehicleType, attributes: ['id', 'code_id', 'type_name'] }
    ]

    var attr = {
        include: [
            [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleModelType\".\"created_by\" )"), 'created_by'],
            [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleModelType\".\"updated_by\" )"), 'updated_by'],
        ]
    }

    var data = await VehicleModelType.findAll({
        include: inc,
        attributes: attr,
        where: where_q,
        order: [[sort, order]],
        limit: limit,
        offset: (page - 1) * limit

    })



    var length_data = await VehicleModelType.count({
        include: inc,
        attributes: attr,
        where: where_q,
    })


    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: data.length,
        totalCount: length_data,
        data: data

    }


    await handleSaveLog(request, [["get master vehicle model type all"], ""]);
    return utilSetFastifyResponseJson("success", pag);
}

const handleById = async (request) => {
    var action = "get master vehicle model type by id"
    var pro_bran_id = request.params.id
    var data = await VehicleModelType.findAll({
        include: [
            { model: VehicleBrand, attributes: ['id', 'code_id', 'brand_name'] },
            { model: VehicleType, attributes: ['id', 'code_id', 'type_name'] }],
        attributes: {
            include: [
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleModelType\".\"created_by\" )"), 'created_by'],
                [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"VehicleModelType\".\"updated_by\" )"), 'updated_by'],
            ]
        },
        where: {
            id: pro_bran_id
        }
    })
    if (data[0]) {

        await handleSaveLog(request, [[action], ""]);
        return utilSetFastifyResponseJson("success", data[0]);
    } else {
        await handleSaveLog(request, [[action], 'vehicle model type not found'])
        return utilSetFastifyResponseJson("failed", "vehicle model type not found");
    }
}


const handleAdd = async (request) => {
    var action = "add master vehicle model type"
    try {

        var { model_list, vehicles_brand_id } = request.body
        const isuse = 1

        var check = await VehicleBrand.findAll({
            where: { id: vehicles_brand_id }
        })
        if (!check[0]) {
            await handleSaveLog(request, [[action], 'vehicles_brand_id not found']);
            return utilSetFastifyResponseJson("failed", "vehicles_brand_id not found");
        }

        for (let index = 0; index < model_list.length; index++) {
            const element = model_list[index];

            await VehicleModelType.create({
                model_name: element.model_name,
                code_id: element.code_id || undefined,
                vehicles_brand_id: vehicles_brand_id,
                vehicle_type_id: element.vehicle_type_id || undefined,
                isuse: isuse,
                created_by: request.id,
                created_date: Date.now()
            })

        }

        const vehicle_create = await VehicleModelType.findAll(
            {
                where: {
                    vehicles_brand_id: vehicles_brand_id
                }
            }
        );


        await handleSaveLog(request, [[action, vehicle_create.id, request.body], ""]);
        return utilSetFastifyResponseJson("success", vehicle_create);

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error]);
        return utilSetFastifyResponseJson("failed", error);
    }
}

const handlePut = async (request) => {

    var action = 'put master vehicle by type brand'

    try {
        var { model_list } = request.body


        var vehicles_brand_id = request.params.vehicles_brand_id

        if (model_list && model_list.length > 0) {


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
                if (element.vehicle_type_id) {
                    data.vehicle_type_id = element.vehicle_type_id
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
                    await VehicleModelType.update(data, {
                        where: { id: element.id }
                    })
                } else {
                    await VehicleModelType.create({
                        model_name: element.model_name,
                        code_id: element.code_id || undefined,
                        vehicle_type_id: element.vehicle_type_id,
                        vehicles_brand_id: vehicles_brand_id,
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

const handleByTypeBrandAll = async (request) => {

    var sort = request.query.sort
    var order = request.query.order
    var search = request.query.search
    const page = request.query.page || 1;
    const limit = request.query.limit || 10;


    var sort_order = [sort, order]
    if (sort == 'sum') {
        sort_order = [literal(`CAST(count(vehicle_type_id) AS INT)`), order]
    } else if (sort == 'code_id') {
        sort_order = [literal(`\"VehicleType\".code_id`), order]
    } else if (sort == 'type_name.th') {
        sort_order = [literal(`\"VehicleType\".type_name->>'th'`), order]
    } else if (sort == 'type_name.th') {
        sort_order = [literal(`\"VehicleType\".type_name->>'en'`), order]
    }

    var where = {
        [Op.or]: [
            literal(`\"VehicleType\".code_id iLike :search`),
            literal(`\"VehicleType\".type_name->>'th' iLike :search`),
            literal(`\"VehicleType\".type_name->>'en' iLike :search`),
            // sequelize.literal(`\"VehicleType->ProductTypeGroup\".code_id iLike :search`),
            // sequelize.literal(`\"VehicleType->ProductTypeGroup\".group_type_name->>'th' iLike :search`),
            // sequelize.literal(`\"VehicleType->ProductTypeGroup\".group_type_name->>'en' iLike :search`),
            literal(`\"VehicleBrand\".code_id iLike :search`),
            literal(`\"VehicleBrand\".brand_name->>'th' iLike :search`),
            literal(`\"VehicleBrand\".brand_name->>'en' iLike :search`),
            literal(`(SELECT COUNT(*) FROM (SELECT sub.id from master_lookup.mas_vehicles_model_types as sub
                                WHERE sub.vehicle_type_id = \"VehicleType\".id 
                                AND sub.vehicles_brand_id=\"VehicleBrand\".id
                                AND sub.isuse = 1
                                AND (
                                    sub.code_id iLike :search OR
                                    sub.model_name->>'th' iLike :search OR
                                    sub.model_name->>'en' iLike :search 
                                )) AS sub)>0`)
        ]
    }

    var attr = [
        'vehicle_type_id', 'vehicles_brand_id',
        [literal(`(
            SELECT CAST(COUNT(sub.*) AS INT) 
            FROM(
                SELECT sub.*
                FROM master_lookup.mas_vehicles_model_types as sub
                WHERE sub.vehicle_type_id = \"VehicleType\".id 
                AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                AND sub.isuse = 1
            )AS sub)`), 'sum'],
        [literal(`(
                            SELECT sub.updated_date
                            FROM master_lookup.mas_vehicles_model_types as sub
                            WHERE sub.vehicle_type_id = \"VehicleType\".id 
                            AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                            ORDER BY sub.updated_date desc nulls last
                            limit 1
                        )`), 'updated_date'],
        [literal(`(
                            SELECT ss.user_name
                            FROM master_lookup.mas_vehicles_model_types as sub
                            LEFT JOIN systems.sysm_users as ss ON ss.id = sub.updated_by
                            WHERE sub.vehicle_type_id = \"VehicleType\".id 
                            AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                            ORDER BY sub.updated_date desc nulls last
                            limit 1
                        )`), 'updated_by'],
        [literal(`(
                            SELECT sub.created_date
                            FROM master_lookup.mas_vehicles_model_types as sub
                            WHERE sub.vehicle_type_id = \"VehicleType\".id 
                            AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                            ORDER BY sub.created_date desc nulls last
                            limit 1
                        )`), 'created_date'],
        [literal(`(
                            SELECT ss.user_name
                            FROM master_lookup.mas_vehicles_model_types as sub
                            LEFT JOIN systems.sysm_users as ss ON ss.id = sub.created_by
                            WHERE sub.vehicle_type_id = \"VehicleType\".id 
                            AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                            ORDER BY sub.created_date desc nulls last
                            limit 1
                        )`), 'created_by'],
        [literal(`ARRAY( 
                                    SELECT json_build_object(
                                        'id',sub.id,
                                        'code_id',sub.code_id,
                                        'model_name',sub.model_name,
                                        'vehicle_type_id',sub.vehicle_type_id,
                                        'vehicles_brand_id',vehicles_brand_id,
                                        'updated_by',updated_by

                                        ) 
                                    from master_lookup.mas_vehicles_model_types as sub
                                    WHERE sub.vehicle_type_id = \"VehicleType\".id 
                                    AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                                    AND sub.isuse = 1 
                                    ORDER BY code_id ASC
                                    )`), 'model_list']
    ]

    var group = ['vehicle_type_id', 'vehicles_brand_id', 'VehicleType.id', 'VehicleBrand.id',
        // 'VehicleType->ProductTypeGroup.id'
    ]

    var inc = [
        {
            model: VehicleType, attributes: ['id', 'code_id', 'type_name'],
            // include: [{ model: ProductTypeGroup, attributes: ['id', 'code_id', 'group_type_name'] }],

        },
        {
            model: VehicleBrand, attributes: ['id', 'code_id', 'brand_name'],
        }
    ]

    var data = await VehicleModelType.findAll({
        attributes: attr,
        group: group,
        include: inc,
        where: where,
        replacements: { search: '%' + search + '%' },
        order: [sort_order],
        limit: limit,
        offset: (page - 1) * limit
    })

    var length_data = await VehicleModelType.count({
        attributes: attr,
        group: group,
        include: inc,
        where: where,
        replacements: { search: '%' + search + '%' }
    })

    length_data = length_data.length


    var pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: data.length,
        totalCount: length_data,
        data: data

    }




    await handleSaveLog(request, [['get vehicle model type by type brand all'], ''])
    return ({ status: "success", data: pag })

}


const handleByTypeBrand = async (req) => {
    var vehicle_type_id = req.params.vehicle_type_id
    var vehicles_brand_id = req.params.vehicles_brand_id


    var where = {
        [Op.and]: [
            // sequelize.literal(`\"VehicleType\".id = :vehicle_type_id`),
            literal(`\"VehicleBrand\".id = :vehicles_brand_id`),
        ]
    }

    var attr = [
        'vehicle_type_id', 'vehicles_brand_id',
        [literal(`(
                SELECT CAST(COUNT(sub.*) AS INT) 
                FROM(
                    SELECT sub.*
                    FROM master_lookup.mas_vehicles_model_types as sub
                    WHERE sub.vehicle_type_id = \"VehicleType\".id 
                    AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                    AND sub.isuse = 1
                )AS sub)`), 'sum'],
        [literal(`(
                        SELECT sub.updated_date
                        FROM master_lookup.mas_vehicles_model_types as sub
                        WHERE sub.vehicle_type_id = \"VehicleType\".id 
                        AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                        ORDER BY sub.updated_date desc
                        limit 1
                    )`), 'updated_date'],
        [literal(`(
                        SELECT ss.user_name
                        FROM master_lookup.mas_vehicles_model_types as sub
                        LEFT JOIN systems.sysm_users as ss ON ss.id = sub.updated_by
                        WHERE sub.vehicle_type_id = \"VehicleType\".id 
                        AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                        ORDER BY sub.updated_date desc
                        limit 1
                    )`), 'updated_by'],
        [literal(`(
                        SELECT sub.created_date
                        FROM master_lookup.mas_vehicles_model_types as sub
                        WHERE sub.vehicle_type_id = \"VehicleType\".id 
                        AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                        ORDER BY sub.created_date desc
                        limit 1
                    )`), 'created_date'],
        [literal(`(
                        SELECT ss.user_name
                        FROM master_lookup.mas_vehicles_model_types as sub
                        LEFT JOIN systems.sysm_users as ss ON ss.id = sub.created_by
                        WHERE sub.vehicle_type_id = \"VehicleType\".id 
                        AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                        ORDER BY sub.created_date desc
                        limit 1
                    )`), 'created_by'],
        [literal(`ARRAY( 
                                    SELECT json_build_object(
                                        'id',sub.id,
                                        'code_id',sub.code_id,
                                        'model_name',sub.model_name,
                                        'vehicle_type_id',sub.vehicle_type_id,
                                        'vehicles_brand_id',vehicles_brand_id,
                                        'created_date',sub.created_date,
                                        'created_by',sub.created_by,
                                        'updated_date',sub.updated_date,
                                        'updated_by',sub.updated_by
                                        ) 
                                    from master_lookup.mas_vehicles_model_types as sub
                                    WHERE sub.vehicle_type_id = \"VehicleType\".id 
                                    AND sub.vehicles_brand_id=\"VehicleBrand\".id 
                                    AND sub.isuse = 1 
                                    ORDER BY code_id ASC
                                    )`), 'model_list']
    ]

    var group = ['vehicle_type_id', 'vehicles_brand_id', 'VehicleType.id', 'VehicleBrand.id',
        // 'VehicleType->ProductTypeGroup.id'
    ]

    var inc = [
        {
            model: VehicleType, attributes: ['id', 'code_id', 'type_name'],
            // include: [{ model: ProductTypeGroup, attributes: ['id', 'code_id', 'group_type_name'] }],

        },
        {
            model: VehicleBrand, attributes: ['id', 'code_id', 'brand_name'],
        }
    ]

    var data = await VehicleModelType.findAll({
        attributes: attr,
        group: group,
        include: inc,
        where: where,
        replacements: { vehicle_type_id: vehicle_type_id, vehicles_brand_id: vehicles_brand_id },
    })


    if (data[0]) {

        await handleSaveLog(req, [['get vehicle model type by type brand'], ''])
        return ({ status: "success", data: data[0] })
    } else {
        await handleSaveLog(req, [['get  vehicle model type by type brand'], 'VehicleModelType not found'])
        return ({ status: "failed", data: "VehicleModelType not found" })
    }
}

const handelCheckDuplicate = async (request) => {

    var action = 'check duplicate master vehicle model type'
    try {
        var { code_id, model_name, vehicles_brand_id, vehicle_type_id } = request.body


        if (!isNull(code_id)) {
            var check = await VehicleModelType.findOne({
                where: {
                    [Op.and]: [
                        { code_id: code_id },
                        (vehicles_brand_id) ? { vehicles_brand_id: vehicles_brand_id } : {},
                        (vehicle_type_id) ? { vehicle_type_id: vehicle_type_id } : {}
                    ]
                }
            })
            if (check) {
                await handleSaveLog(request, [[action], 'รหัสนี้ถูกใช้ไปแล้ว'])
                throw 'รหัสนี้ถูกใช้ไปแล้ว';
            }
        }

        if (!isNull(model_name)) {
            var check = await VehicleModelType.findOne({
                where: {
                    [Op.and]: [
                        {
                            model_name: {
                                [Op.or]: [
                                    { th: model_name.th },
                                    (model_name.en) ? { en: model_name.en } : {}
                                ]
                            }
                        },
                        (vehicles_brand_id) ? { vehicles_brand_id: vehicles_brand_id } : {},
                        (vehicle_type_id) ? { vehicle_type_id: vehicle_type_id } : {}
                    ]
                }
            })

            if (check) {
                await handleSaveLog(request, [[action], 'ชื่อนี้ถูกใช้ไปแล้ว'])
                throw 'ชื่อนี้ถูกใช้ไปแล้ว';
            }
        }

        await handleSaveLog(request, [[action], ''])
        return ({ status: "success", data: 'success' })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error]);
        return utilSetFastifyResponseJson("failed", error);
    }


}
module.exports = {

    handleAllRaw,
    handleAll,
    handleById,
    handleAdd,
    handlePut,
    handleByTypeBrandAll,
    handleByTypeBrand,
    handelCheckDuplicate
}