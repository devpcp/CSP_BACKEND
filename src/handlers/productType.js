const _ = require("lodash");
const { Op } = require("sequelize");
const { handleSaveLog } = require('../handlers/log')
const { isNull, generateSearchOpFromKeys, isUUID } = require('../utils/generate')
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const sequelize = require('../db');
const ProductType = require("../models/model").ProductType;
const ProductTypeGroup = require("../models/model").ProductTypeGroup;

const handleAll = async (request) => {
    const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
    const search = _.get(request, 'query.search', '');
    const sort = _.get(request, 'query.sort', 'created_date');
    const order = _.get(request, 'query.order','desc');
    const limit = _.get(request, 'query.limit', 10);
    const page = _.get(request, 'query.page', 1);
    const status = utilGetIsUse(_.get(request, 'query.status', 'default'));
    const objType_group_id = !isUUID(_.get(request, 'query.type_group_id', null)) ? {} : {
        type_group_id: request.query.type_group_id
    };

    const attributeIncludes = [
        [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductType\".\"created_by\" )"), 'created_by'],
        [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductType\".\"updated_by\" )"), 'updated_by'],
    ];

    const includeQueries = [
        { model: ProductTypeGroup }
    ];

    const whereQueries = {
        ...status,
        type_name: {
            [Op.or]: [
                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
            ]
        },
        ...objType_group_id
    };

    const [findDocuments, length_data] = await Promise.all([
        ProductType.findAll({
            attributes: {
                include: attributeIncludes
            },
            include: includeQueries,
            where: whereQueries,
            order: [[sort, order]],
        }),
        ProductType.count({
            include: includeQueries,
            where: whereQueries
        })
    ]);

    const pag = {
        currentPage: page,
        pages: Math.ceil(length_data / limit),
        currentCount: findDocuments.length,
        totalCount: length_data,
        data: findDocuments
    };

    await handleSaveLog(request, [['get ProductType all'], '']);

    return utilSetFastifyResponseJson('success', pag);
}


const handleById = async (req) => {
    var pro_bran_id = req.params.id
    var data = await ProductType.findAll({
        where: {
            id: pro_bran_id
        },
        attributes: {
            include: [
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductType\".\"created_by\" )"), 'created_by'],
                [sequelize.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductType\".\"updated_by\" )"), 'updated_by'],
            ]
        },
    })
    if (data[0]) {

        await handleSaveLog(req, [['get ProductType byid'], ''])
        return ({ status: "successful", data: [data[0]] })
    } else {
        await handleSaveLog(req, [['get ProductType byid'], 'ProductType not found'])
        return ({ status: "failed", data: "ProductType not found" })
    }
}

const handleAdd = async (request) => {
    var action = 'add ProductType'
    try {

        var { type_name, type_group_id, code_id } = request.body
        const isuse = 1

        if (isNull(type_name)) {
            await handleSaveLog(request, [[action], 'type_name null'])
            return ({ status: "failed", data: "type_name can not null" })
        }

        var check_group = await ProductTypeGroup.findAll({
            where: { id: type_group_id }
        })

        if (!check_group[0]) {
            await handleSaveLog(request, [[action], 'type_group_id not found'])
            return ({ status: "failed", data: "type_group_id not found" })
        }

        var create = await ProductType.create({
            type_name: type_name,
            code_id: code_id,
            type_group_id: type_group_id,
            isuse: isuse,
            created_by: request.id,
            created_date: Date.now()
        })

        await handleSaveLog(request, [[action, create.id, request.body], ''])
        return ({ status: "successful", data: create })

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handlePut = async (request) => {

    var action = 'put product type'

    try {
        var { type_name, type_group_id, code_id } = request.body
        var status_brand = request.body.status

        var data = {}
        var brand_id = request.params.id

        const find_group = await ProductType.findAll({ where: { id: brand_id } });
        if (!find_group[0]) {
            await handleSaveLog(request, [[action], 'ProductType not found'])
            return ({ status: "failed", data: "ProductType not found" })
        }

        if (!isNull(type_name)) {
            data.type_name = type_name
        }

        if (!isNull(code_id)) {
            data.code_id = code_id
        }

        if (!isNull(type_group_id)) {

            var check_group = await ProductTypeGroup.findAll({
                where: { id: type_group_id }
            })

            if (!check_group[0]) {
                await handleSaveLog(request, [[action], 'type_group_id not found'])
                return ({ status: "failed", data: "type_group_id not found" })
            } else {
                data.type_group_id = type_group_id

            }
        }

        if (!isNull(status_brand)) {
            if (status_brand == 'delete') {
                data.isuse = 2
            } else if (status_brand == 'active') {
                data.isuse = 1
            } else if (status_brand == 'block') {
                data.isuse = 0
            } else {
                await handleSaveLog(request, [[action], 'status not allow'])
                return ({ status: "failed", data: "status not allow" })
            }

        }
        data.updated_by = request.id
        data.updated_date = Date.now()
        var before_update = await ProductType.findOne({
            where: {
                id: brand_id
            }
        });

        await ProductType.update(data, {
            where: {
                id: brand_id
            }
        });

        var put = await ProductType.findOne({
            include: { model: ProductTypeGroup },
            where: { id: brand_id }
        })

        await handleSaveLog(request, [[action, brand_id, request.body, before_update], ''])
        return ({ status: "successful", data: put })
    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }

}

module.exports = {

    handleAll, handleById, handlePut, handleAdd
}