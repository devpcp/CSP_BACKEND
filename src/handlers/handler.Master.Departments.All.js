const {
    handleSaveLog,
} = require("./log");

const {
    Op,
} = require("sequelize");

const {
    generateSearchOpFromKeys,
} = require("../utils/generate");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelDepartments = require("../models/model").Departments;


/**
 * A handler to list Master Departments from database
 * - Route [GET] => /api/master/department/all
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<Departments[]>>}
 */
const handlerMasterDepartmentsAll = async (request) => {
    const handlerName = 'get master departments all';

    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        const search = request.query.search;
        const sort = request.query.sort;
        const order = request.query.order;

        const getIsUse = utilGetIsUse(request.query.status);

        const findDocuments = await modelDepartments.findAll({
            attributes: {
                include: [
                    ...utilGetCreateByAndUpdatedByFromModel(modelDepartments),
                    [modelDepartments.sequelize.Sequelize.literal(`(SELECT group_name FROM "systems"."sysm_user_groups" WHERE id = "Departments".user_group_id)`), 'group_name']
                ]
            },
            where: {
                ...getIsUse,
                [Op.or]: [
                    {
                        code_id: {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        department_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        }
                    }
                ]
            },
            order: [[sort, order]]
        });

        await handleSaveLog(request, [[handlerName], ""]);

        return utilSetFastifyResponseJson("success", findDocuments);

    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);
        throw error;
    }
};


module.exports = handlerMasterDepartmentsAll;