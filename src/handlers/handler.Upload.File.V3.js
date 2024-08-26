const {
    existsSync,
} = require("fs");
const _ = require("lodash");
const path = require("path");

const {
    handleSaveLog,
} = require("./log");

const {
    isUUID,
} = require("../utils/generate");
const utilSetImageFileConvert = require("../utils/util.SetImageFileConvert");
const utilSetImageFileSave = require("../utils/util.SetImageFileSave");
const utilCreateDirectory = require("../utils/util.CreateDirectory");


/**
 * A handler to handle upload file by request path
 * - [POST] => /api/upload/fileCustomPath
 * - This handler requires parameter
 *      - fileType
 *      - filePath
 *      - fileUpload
 *      - see at "src/types/type.Handler.Upload.ts"
 *      - or see at swagger
 * @param {import("../types/type.Handler.Upload").IHandlerUploadFileRequest} request
 */
const handleUploadFile = async (request) => {
    try {
        const fileUploadParser = request.body.fileUpload;
        if (!_.isPlainObject(fileUploadParser)) {
            throw Error('Request not fulfilled');
        }
        else if (!_.isEqual(_.keys(fileUploadParser), ["fieldname", "filename", "encoding", "mimetype", "file", "fields", "_buf", "toBuffer"])) { // Check instance of upload file
            throw Error('Request not fulfilled');
        }
        else {

            let filename = fileUploadParser.filename

            /**
             * A type of file from request
             * @type {string|undefined}
             */
            const fileType = _.get(fileUploadParser.fields, 'fileType.value');
            if (!fileType) { throw Error(`@fileType required`); }
            // Currently, allowed only type of image
            if (fileType !== "image") { throw Error(`@fileType not allowed`); }
            /**
             * A directory name to store in src/assets/${yourDirectoryRequest}
             * @type {string|undefined}
             */
            const fileDirectory = _.get(fileUploadParser.fields, 'fileDirectory.value');
            if (!fileDirectory) { throw Error(`@fileDirectory required`); }
            /**
             * A directory name to store in src/assets/${yourDirectoryRequest}/${yourDirectoryIdRequest}
             * @type {string|undefined}
             */
            const filePath = _.get(fileUploadParser.fields, 'filePath.value');
            if (!filePath) { throw Error(`@filePath required`); }
            // if (!isUUID(filePath)) { throw Error(`@filePath not accepted`); }

            /**
             * A path of directory "assets"
             * @type {string}
             */
            const directoryAssetsPath = path.join(__dirname, '../assets');
            /**
             * A path of directory as request but it from directory "assets" (ex: assets/myRequestDirectory)
             * @type {string}
             */
            const directoryRequestPath = path.join(directoryAssetsPath, fileDirectory);
            /**
             * A path of directory as request but it from directory "assets" (ex: assets/myRequestDirectory/myRequestDirectoryId)
             * @type {string}
             */
            const directoryIdRequestPath = path.join(directoryAssetsPath, fileDirectory, filePath);

            if (!existsSync(directoryRequestPath)) {
                throw Error('could not save file as request');
            }
            else {
                if (!existsSync(directoryIdRequestPath)) {
                    if (!utilCreateDirectory(directoryIdRequestPath)) {
                        throw Error('could not create directory as request')
                    }
                }

                const saveImage = await utilSetImageFileConvert(await fileUploadParser.toBuffer()).then(
                    async (jimpResult) => {
                        if (jimpResult) {
                            return await utilSetImageFileSave(jimpResult, directoryIdRequestPath, filename)
                        }
                    }
                ).catch(
                    async (e) => {
                        await handleSaveLog(request, [["post upload"], `error : ${e}`]);
                        return null;
                    }
                );

                if (!saveImage) {
                    throw Error('could not save file as request');
                }
                else {
                    await handleSaveLog(request, [["post upload", '', `/assets/${fileDirectory}/${filePath}/${filename}`], ""]);
                    return { status: 'success', data: { path: `/assets/${fileDirectory}/${filePath}/${filename}` } };
                }
            }
        }
    } catch (error) {
        await handleSaveLog(request, [["post upload"], `error : ${error}`]);
        throw error;
    }
};

module.exports = handleUploadFile;