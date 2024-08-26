const {
    handleSaveLog,
} = require("./log");

const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetIsUse = require("../utils/util.GetIsUse");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelDepartments = require("../models/model").Departments;


/**
 * A handler to edit by id Master Departments from database
 * - Route [PUT] => /api/master/departments/put/:id
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<Departments>>}
 */
const handlerMasterDepartmentsPut = async (request) => {
    const handlerName = 'put master departments put';

    try {
        const getIsUse = utilGetIsUse(request.body.status);

        var before_update = await modelDepartments.findOne(
            {
                where: {
                    id: request.params.id
                }
            }
        );


        const updatedDocument = await modelDepartments.update(
            {
                ...request.body,
                ...getIsUse,
                updated_by: request.id,
                updated_date: Date.now(),
            },
            {
                where: {
                    id: request.params.id
                }
            }
        );

        const findUpdatedDocument = await modelDepartments.findOne(
            {
                attributes: {
                    include: [
                        ...utilGetCreateByAndUpdatedByFromModel(modelDepartments),
                        [modelDepartments.sequelize.Sequelize.literal(`(SELECT group_name FROM "systems"."sysm_user_groups" WHERE id = "Departments".user_group_id)`), 'group_name']
                    ]
                },
                where: {
                    id: request.params.id
                }
            }
        );

        await handleSaveLog(request, [[handlerName, request.params.id, request.body, before_update], ""]);
        return utilSetFastifyResponseJson("success", findUpdatedDocument);

    } catch (error) {
        await handleSaveLog(request, [[handlerName], ""]);
        throw error;
    }
};


module.exports = handlerMasterDepartmentsPut;