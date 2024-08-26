const Jimp = require("jimp");


/**
 * A utility help to check image size from base64 image from string
 * @param {string} imageBase64
 * @param {string} imageMIME
 * @param {"b" | "kb"} sizeType
 * @return {{sizeType: "b" | "kb", size: number}}
 */
const utilGetImageFileSize = (imageBase64, imageMIME= Jimp.MIME_JPEG, sizeType = "kb") => {
    const stringLength = imageBase64.length - `data:${imageMIME};base64,`.length;
    const sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;
    const sizeInKb = sizeInBytes/1000;
    if (sizeType) {
        if (sizeType.toLowerCase() === "b") {
            return { sizeType: "b", size: sizeInKb };
        }
        if (sizeType.toLowerCase() === "kb") {
            return { sizeType: "kb", size: sizeInKb };
        }
    }
    return { sizeType: "kb", size: sizeInKb };
};

module.exports = utilGetImageFileSize;