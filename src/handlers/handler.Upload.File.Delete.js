const fs = require("fs");
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


const handleUploadFileDelete = async (request) => {
    try {

        let path = request.query.path

        fs.unlinkSync('src' + path)

        await handleSaveLog(request, [["delete upload file", '', path], ""]);
        return { status: 'success', data: 'successful' };

    } catch (error) {
        await handleSaveLog(request, [["post upload"], `error : ${error}`]);
        throw error;
    }
};

module.exports = handleUploadFileDelete;