const path = require("path");
const {
    existsSync,
} = require("fs");


/**
 * A utility help to save image to storage from instance of Jimp
 * @param {typeof import("jimp")} imageJimp - An instance of Jimp
 * @param {string} directoryPath - A directory path to save on storage
 * @param {string} imageFileName - A file name to save on storage
 * @return {Promise<string|undefined>}
 */
const utilSetImageFileSave = async (imageJimp, directoryPath, imageFileName) => {
    if (imageJimp && directoryPath && existsSync(directoryPath)) {
        const imageFilePathToSave = path.join(directoryPath, imageFileName);
        const writeImageFile = await imageJimp.writeAsync(imageFilePathToSave);
        if (writeImageFile) {
            return imageFilePathToSave;
        }
    }
};

module.exports = utilSetImageFileSave;