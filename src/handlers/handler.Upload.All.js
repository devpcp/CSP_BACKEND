const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetAssetsDirectoriesAvailable = require("../utils/util.GetAssetsDirectoriesAvailable");


/**
 * A handler (Controller) to handle list directories available
 * - [GET] => /api/upload/all
 * @param {import("../types/type.Handler.Upload").IHandlerUploadAllRequest} request
 * @return {import("../types/type.Util.FastifyResponseJson").IUtilFastifyResponseJson<string[]>}
 */
const handlerUploadAll = (request) => {
    const assetsDirectory = utilGetAssetsDirectoriesAvailable();
    return utilSetFastifyResponseJson("success", assetsDirectory);
};


module.exports = handlerUploadAll;