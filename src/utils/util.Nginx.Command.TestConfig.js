const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 * It will test the nginx configuration file and return a promise that will be resolved with the output of nginx test
 * config command
 * @returns {Promise<{status: boolean; error: boolean; message: any | {stdout?: string; stderr?: string; } }>} A promise that will be resolved with the output of nginx test config command
 */
const utilNginxCommandTestConfig = async () => {
    if (process.platform !== 'linux') {
        throw Error(`This nginx test config, currently support only for linux, due you are using ${process.platform}`);
    }
    else {
        /**
         * A promise that will be resolved with the output of nginx test config command
         * @type {{
         *     status: boolean;
         *     error: boolean;
         *     message: any | {stdout?: string; stderr?: string; };
         * }}
         */
        const execCommand = await exec('nginx -t')
            .then(result => {
                if (/((nginx: configuration file)(.*)(test is successful))/.test(result)) {
                    return {
                        status: true,
                        error: false,
                        message: result
                    };
                }
                else {
                    return {
                        status: false,
                        error: true,
                        message: result
                    };
                }
            })
            .catch(error => {
                if (/((nginx: the configuration file)(.*)(syntax is ok))/.test(error.stderr)) {
                    return {
                        status: true,
                        error: true,
                        message: error
                    };
                }
                else {
                    return {
                        status: false,
                        error: true,
                        message: error
                    };
                }
            });

        return execCommand;
    }
};


module.exports = utilNginxCommandTestConfig;