const util = require("util");
const exec = util.promisify(require("child_process").exec);


/**
 * It's a promise based function that reloads nginx server
 * @returns {Promise<{status: boolean; error: boolean; message: any | {stdout?: string; stderr?: string; }}>} A promise result of nginx reload command
 */
const utilNginxCommandReload = async () => {
    if (process.platform !== 'linux') {
        throw Error(`This nginx reload, currently support only for linux, due you are using ${process.platform}`);
    }
    else {
        /**
         * A promise result of nginx reload command
         * @type {{
         *     status: boolean;
         *     error: boolean;
         *     message: any | {stdout?: string; stderr?: string; };
         * }}
         */
        const execCommand = await exec('nginx -s reload')
            .then(result => {
                return {
                    status: true,
                    error: false,
                    message: result
                };
            })
            .catch(error => {
                return {
                    status: false,
                    error: true,
                    message: error
                };
            });

        return execCommand;
    }
};


module.exports = utilNginxCommandReload;