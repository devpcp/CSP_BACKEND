const { Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const { generateSearchOpFromKeys } = require("../utils/generate");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetIsUse = require("../utils/util.GetIsUse");

const db = require('../db');
const SubDistrict = require("../models/model").SubDistrict;
const District = require("../models/model").District;
const Province = require("../models/model").Province;
const modelTaxTypes = require("../models/model").TaxTypes;


const subDistrict = async (request) => {
    const district_id = request.query.district_id || { [Op.ne]: null };
    const sort = request.query.sort;
    const order = request.query.order;
    const search = request.query.search;

    const findSubDistrict = await SubDistrict.findAll({
        where: {
            [Op.and]: [{ district_id: district_id }],
            [Op.or]: [
                { name_th: { [Op.iLike]: '%' + search + '%' } },
                { name_en: { [Op.iLike]: '%' + search + '%' } }
            ]

        },
        order: [[sort, order]],
    });

    handleSaveLog(request, [["get master subDistrict"], ""]).catch(e => { });

    return ({ status: "successful", data: findSubDistrict })
};

const district = async (request) => {
    const province_id = request.query.province_id || { [Op.ne]: null };
    const sort = request.query.sort;
    const order = request.query.order;
    const search = request.query.search;

    const findDistrict = await District.findAll({
        where: {
            [Op.and]: [{ province_id: province_id }],
            [Op.or]: [
                { name_th: { [Op.iLike]: '%' + search + '%' } },
                { name_en: { [Op.iLike]: '%' + search + '%' } }
            ]
        },
        order: [[sort, order]],
    });

    handleSaveLog(request, [["get master district"], ""]).catch(e => { });

    return ({ status: "successful", data: findDistrict })
};

const province = async (request) => {
    const sort = request.query.sort;
    const order = request.query.order;
    const search = request.query.search;

    const findProvince = await Province.findAll({
        where: {
            [Op.or]: [
                { prov_name_th: { [Op.iLike]: '%' + search + '%' } },
                { prov_name_en: { [Op.iLike]: '%' + search + '%' } }
            ]
        },
        order: [[sort, order]],
    });

    handleSaveLog(request, [["get master province"], ""]).catch(e => { });

    return ({ status: "successful", data: findProvince });
};


const taxTypes = async (request) => {
    const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

    const sort = request.query.sort;
    const order = request.query.order;
    const search = request.query.search;

    const findTaxTypes = await modelTaxTypes.findAll({
        where: {
            [Op.and]: [{ isuse: [1] }],
            type_name: {
                [Op.or]: [
                    ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                ]
            }
        },
        order: [[sort, order]],
        attributes: {
            include: [
                [db.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"TaxTypes\".\"created_by\" )"), 'created_by'],
                [db.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"TaxTypes\".\"updated_by\" )"), 'updated_by'],
            ]
        }
    });

    handleSaveLog(request, [["get master taxTypes"], ""]).catch(e => { });

    return utilSetFastifyResponseJson("success", findTaxTypes);
};

const taxTypesByid = async (request) => {
    try {
        const findTaxTypes = await modelTaxTypes.findOne({
            where: {
                id: request.params.id
            },
            attributes: {
                include: [
                    [db.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"TaxTypes\".\"created_by\" )"), 'created_by'],
                    [db.literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"TaxTypes\".\"updated_by\" )"), 'updated_by'],
                ]
            }
        });

        await handleSaveLog(request, [["get master taxTypes"], ""]);

        return utilSetFastifyResponseJson("success", findTaxTypes);
    } catch (error) {
        await handleSaveLog(request, [["get master taxTypes"], `error : ${error}`]);

        throw error;
    }
};

const taxTypesAdd = async (request) => {

    try {
        const currentDateTime = Date.now();
        const createdDocument = await modelTaxTypes.create({
            ...request.body,
            created_by: request.id,
            created_date: currentDateTime,
        });

        handleSaveLog(request, [["post master taxTypes", createdDocument.id, request.body], ""]).catch(e => { });
        return utilSetFastifyResponseJson("success", createdDocument);
    } catch (error) {
        await handleSaveLog(request, [["post master taxTypes"], `error : ${error}`]);
        throw error;
    }

};

const taxTypesPut = async (request) => {
    try {
        const currentDateTime = Date.now();

        const getIsUse = utilGetIsUse(request.body.status);

        var before_update = await modelTaxTypes.findOne(
            {
                where: {
                    id: request.params.id
                }
            }
        );

        await modelTaxTypes.update(
            {
                ...request.body,
                ...getIsUse,
                updated_by: request.id,
                updated_date: currentDateTime,
            },
            {
                where: {
                    id: request.params.id
                }
            }
        );

        const findTaxTypes = await modelTaxTypes.findOne(
            {
                where: {
                    id: request.params.id
                }
            }
        );

        await handleSaveLog(request, [["put master taxTypes put", request.params.id, request.body, before_update], ""]);
        return utilSetFastifyResponseJson("success", findTaxTypes);
    } catch (error) {
        await handleSaveLog(request, [["put master taxTypes put"], ""]);
        throw error;
    }
};


module.exports = {
    subDistrict,
    district,
    province,
    taxTypes,
    taxTypesByid,
    taxTypesAdd,
    taxTypesPut,
}