const { handleSaveLog } = require("./log");

const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelDepartments = require("../models/model").Departments;


/**
 * A handler to add new Master Departments into database
 * - Route [POST] => /api/master/departments/add
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 * @return {Promise<import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<Departments>>}
 */
const handlerMasterDepartmentsAdd = async (request) => {
    const handlerName = 'post master departments add';

    try {
        const createdDocument = await modelDepartments.create({
            ...request.body,
            created_by: request.id,
            created_date: Date.now(),
        });

        await handleSaveLog(request, [[handlerName, createdDocument.id, request.body], ""]);
        return utilSetFastifyResponseJson("success", createdDocument);

    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);
        throw error;
    }
};


module.exports = handlerMasterDepartmentsAdd;