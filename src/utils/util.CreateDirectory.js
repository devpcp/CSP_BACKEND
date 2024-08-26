const {
    existsSync,
    mkdirSync
} = require('fs');


/**
 * A utility help to create directory
 * @param dirPath
 * @return {string}
 */
const utilCreateDirectory = (dirPath) => {
    if (!existsSync(dirPath)){
        const result = mkdirSync(dirPath, { recursive: true, mode: 0o777 });
        return result;
    }
    else {
        return dirPath;
    }
};

module.exports = utilCreateDirectory;