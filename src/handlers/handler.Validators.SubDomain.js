const utilNginxIsFormatSubDomainNameValid = require("../utils/util.Nginx.IsFormatSubDomainNameValid");
const utilNginxIsConfigSubDomainExists = require("../utils/util.Nginx.IsConfigSubDomainExists");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");


/**
 * A handler to validate sub domain from request by nginx configs sub domains
 * - Route [GET] => /api/validators/sub-domain
 * @param request {import("../types/type.Default.Fastify").FastifyRequestDefault}
 * @returns {Promise<IUtilFastifyResponseJson<{exists: boolean, suggestions: string[]}>>}
 */
const handlerValidatorsSubDomain = async (request) => {
    const handlerName = 'get validators domain';

    try {
        const { sub_domain_name } = request.query;

        if (!utilNginxIsFormatSubDomainNameValid(sub_domain_name)) {
            throw Error(`Sub Domain is not valid`);
        }
        else {
            const checkNginxConfigDomain = await utilNginxIsConfigSubDomainExists(sub_domain_name, { isSuggestions: true });

            await handleSaveLog(request, [[handlerName], ""]);

            return utilSetFastifyResponseJson("success", checkNginxConfigDomain);
        }
    } catch (error) {
        await handleSaveLog(request, [[handlerName], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerValidatorsSubDomain;