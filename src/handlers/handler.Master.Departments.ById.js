const {
    handleSaveLog,
} = require("./log");

const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelDepartments = require("../models/model").Departments;


/**
 * A handler to list by id Master Departments from database
 * - Route [GET] => /api/master/departments/byid/:id
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<Departments>>}
 */
const handlerMasterDepartmentsById = async (request) => {
    const handlerName = 'get master departments byid';

    try {
        const findDocument = await modelDepartments.findOne({
            attributes: {
                include: [
                    ...utilGetCreateByAndUpdatedByFromModel(modelDepartments),
                    [modelDepartments.sequelize.Sequelize.literal(`(SELECT group_name FROM "systems"."sysm_user_groups" WHERE id = "Departments".user_group_id)`), 'group_name']
                ]
            },
            where: {
                id: request.params.id
            }
        });

        await handleSaveLog(request, [[handlerName], ""]);

        return utilSetFastifyResponseJson("success", findDocument);

    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);
        throw error;
    }
};


module.exports = handlerMasterDepartmentsById;