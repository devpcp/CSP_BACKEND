const {
    join,
} = require("path");
const {
    existsSync,
    accessSync,
    constants
} = require('fs');
const {
    writeFile,
    readFile,
} = require('fs/promises');

let exampleConfigTextNginx = '';

/**
 * It returns true if the directory at the given path has the given permission, and false otherwise
 * @param dirPath - The path to the directory you want to check.
 * @param [constant] - The constant is a number that represents the permission you want to check.
 * @returns A boolean value.
 */
const isDirectoryPermissionOK = (dirPath, constant = constants.R_OK) => {
    try {
        accessSync(dirPath, constant);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * It reads the example.config.nginx file and stores it in a variable
 * @returns {Promise<boolean>} A boolean value.
 */
const readConfigFileNginx = async () => {
    if (!exampleConfigTextNginx) {
        exampleConfigTextNginx = await readFile(join(__dirname, '../configs/nginx/example.config.nginx.file'), { encoding: 'utf-8'});
    }

    return exampleConfigTextNginx;
};

/**
 * It takes a subdomain as an argument and returns a new nginx config file with the subdomain replaced.
 * @param [subDomain=example] - The subdomain you want to use.
 */
const createConfigTextNginx = async (subDomain = 'example') => {
    if (subDomain.length < 3) {
        throw Error('createConfigTextNginx require subDomain length at least 3');
    }

    if (subDomain === 'example') {
        throw Error('createConfigTextNginx require subDomain is not match by example');
    }

    const newConfigTextNginx = exampleConfigTextNginx.replace(/(example\.)/g, `${subDomain}.`)
    if (new RegExp(`(${subDomain}\\.)`).test(newConfigTextNginx) === false) {
        throw Error(`createConfigTextNginx create config text failed, due cannot find subdomain after replace original nginx text`);
    }
    else {
        return newConfigTextNginx;
    }
};


/**
 * It creates a new config file for nginx.
 * @param [newConfigTextNginx] - The new text that will be written to the file.
 * @param [configFilePathNginx] - The path to the nginx config file.
 * @returns {Promise<{
 *         configTextNginx: newConfigTextNginx,
 *         configFilePathNginx: configFilePathNginx
 *     }>}
 */
const createConfigFileNginx = async (newConfigTextNginx = '', configFilePathNginx = '') => {
    if  (!newConfigTextNginx) {
        throw Error('createConfigFileNginx require newConfigTextNginx');
    }
    else if (!configFilePathNginx) {
        throw Error('configFilePathNginx require newConfigTextNginx');
    }
    else {
        await writeFile(configFilePathNginx, newConfigTextNginx, { encoding: 'utf-8' });
        return {
            configTextNginx: newConfigTextNginx,
            configFilePathNginx: configFilePathNginx
        };
    }
};

/**
 * > This function is used to create a new nginx configuration file for a subdomain
 * @param subDomain - The subdomain you want to create a configuration file for.
 * @param [configDirectoryPathNginx] - The path to the nginx configuration directory.
 * @returns A promise that resolves to a object value.
 */
const utilNginxCreateConfigSubDomain = async (subDomain, configDirectoryPathNginx = join(__dirname, '../configs/nginx')) => {
    if (!subDomain) {
        throw Error('utilNginxCreateConfigSubDomain require subDomain');
    }
    else if (!configDirectoryPathNginx) {
        throw Error('utilNginxCreateConfigSubDomain require configDirectoryPathNginx');
    }
    else if (!existsSync(configDirectoryPathNginx)) {
        throw Error('nginx directory path is not exists');
    }
    else if (!isDirectoryPermissionOK(configDirectoryPathNginx, constants.R_OK)) {
        throw Error('nginx directory path must be allow to read access');
    }
    else if (!isDirectoryPermissionOK(configDirectoryPathNginx, constants.W_OK)) {
        throw Error('nginx directory path must be allow to write access');
    }
    else if (existsSync(join(configDirectoryPathNginx, subDomain))) {
        throw Error('nginx file path is exists');
    }
    else {
        if (!exampleConfigTextNginx) {
            await readConfigFileNginx();
        }

        const newConfigTextNginx = await createConfigTextNginx(subDomain);

        return await createConfigFileNginx(newConfigTextNginx, join(configDirectoryPathNginx, `${subDomain}.config.nginx`));
    }
};


module.exports = utilNginxCreateConfigSubDomain;