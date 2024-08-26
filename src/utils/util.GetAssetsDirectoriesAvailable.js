const {
    config_assets_directories_available,
} = require("../config");

/**
 * A utility help to get list of directories inside "assets" (from "src/assets/*")
 * @return {string[]}
 */
const utilGetAssetsDirectoriesAvailable = () => {
    /**
     * An array from set of preLoad to create directory of "src/assets/*"
     * @type {string[]}
     */
    const assetsDirectory = Array.from(new Set(config_assets_directories_available.split(',').filter(w => w !== '').map(w => w.toLowerCase().replace(/\s/g, ""))));

    return assetsDirectory;
};

module.exports = utilGetAssetsDirectoriesAvailable;