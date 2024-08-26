const { existsSync } = require('fs');
const { readdir } = require('fs/promises');
const { join } = require("path");
const { get } = require("lodash");
const utilNginxIsFormatSubDomainNameValid = require("./util.Nginx.IsFormatSubDomainNameValid");
const utilRandomAlphabetWithLength = require("./util.RandomAlphabetWithLength");


/**
 * It checks if a sub domain name exists in the nginx config directory
 * @param {string} [subDomain] - The sub domain name to check.
 * @param {string} [options.configDirectoryPathNginx] - The nginx config directory.
 * @param {boolean} [options.isSuggestions=false] - If true, it will return a suggestion if the sub domain name is not found.
 * @returns {Promise<{exists: boolean, suggestions: string[]}>} a promise that resolves to an object with two properties: exists and suggestions.
 */
const utilNginxIsConfigSubDomainExists = async (subDomain = '', options = {}) => {
    if (!utilNginxIsFormatSubDomainNameValid(subDomain)) {
        throw Error(`Invalid sub domain name: ${subDomain}`);
    }
    else {
        /**
         * @type {boolean}
         */
        const isSuggestions = get(options, 'isSuggestions', false);
        /**
         * @type {string}
         */
        const configDirectoryPathNginx = get(options, 'configDirectoryPathNginx', join(__dirname, '../configs/nginx'));


        if (!existsSync(configDirectoryPathNginx)) {
            throw Error('nginx directory path is not exists');
        }
        else if (!existsSync(join(configDirectoryPathNginx, subDomain + '.config.nginx'))) {
            return { exists: false, suggestions: [] };
        }
        else {
            if (!isSuggestions) {
                return { exists: true, suggestions: [] };
            }
            else {
                const existSubDomains = (await readdir(configDirectoryPathNginx, { encoding: 'utf-8' }))
                    .filter(fileName => fileName.endsWith('.config.nginx'))
                    .filter(fileName => new RegExp(`(${subDomain}.*)(\\.config\\.nginx)`).test(fileName));

                const preSubDomainSuggestions = [
                    `${subDomain}${existSubDomains.length + 1}`,
                    `${subDomain}${(existSubDomains.length + 1).toString().padStart(3, '0')}`,
                    `${subDomain}-warehouse${(existSubDomains.length + 1).toString().padStart(3, '0')}`,
                    `${subDomain}-zone${(existSubDomains.length + 1).toString().padStart(3, '0')}`,
                    `${subDomain}-area${(existSubDomains.length + 1).toString().padStart(3, '0')}`,
                ];

                const subDomainSuggestions = [];

                for (let i = 0; i < preSubDomainSuggestions.length; i++) {
                    const checkSuggestions = await utilNginxIsConfigSubDomainExists(preSubDomainSuggestions[i], { isSuggestions: false });
                    if (!checkSuggestions.exists) {
                        subDomainSuggestions.push(preSubDomainSuggestions[i]);
                    }
                }

                if (subDomainSuggestions.length < preSubDomainSuggestions.length) {
                    for (let i = 0; i < (preSubDomainSuggestions.length - subDomainSuggestions.length) + 1; i++) {
                        const randomAlphabet = utilRandomAlphabetWithLength(subDomain.length + 1);
                        const checkSuggestions = await utilNginxIsConfigSubDomainExists(`${subDomain}-${randomAlphabet}`, { isSuggestions: false });
                        if (!checkSuggestions.exists) {
                            subDomainSuggestions.push(randomAlphabet);
                        }
                    }
                }

                return { exists: true, suggestions: subDomainSuggestions };
            }
        }
    }
};


module.exports = utilNginxIsConfigSubDomainExists;