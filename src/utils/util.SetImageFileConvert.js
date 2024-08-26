const Jimp = require("jimp");

const utilGetImageFileSize = require("./util.GetImageFileSize");


/**
 * A utility help convert image from fastify upload image
 * @param {Buffer} imageBuffer
 * @return {Promise<typeof import("jimp")>}
 */
const utilSetImageFileConvert = async (imageBuffer) => {
    if (imageBuffer) {
        /**
         * @type {typeof import("jimp")}
         */
        const image = await Jimp.read(imageBuffer);

        if (utilGetImageFileSize(await image.getBase64Async(Jimp.AUTO), Jimp.MIME_JPEG, "kb").size > 1024) {
            image.quality(80);
        }

        return image;
    }
};

module.exports = utilSetImageFileConvert;