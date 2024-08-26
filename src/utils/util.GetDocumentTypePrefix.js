const _ = require('lodash');
const { isUUID } = require('./generate');
const modelMasterDocumentTypes = require('../models/model').DocumentTypes;

/**
 * This function returns the prefix of a document type
 * @param {string} documentTypeId - The document type id to find the prefix for.
 * @param {(object)?} options - An optional settings
 * @param {(string)?} options.defaultPrefix - When cannot find prefix it's will return this default, default: ""
 * @param {(import("sequelize/types").Transaction)?} options.transaction - Sequelize transaction, default: null
 * @returns {Promise<{found: boolean, prefix: string}>}
 */
const utilGetDocumentTypePrefix = async (documentTypeId, options) => {
    /**
     * @type {string}
     */
    const opt_defaultPrefix = _.get(options, 'defaultPrefix', '');

    /**
     * @type {import("sequelize/types").Transaction|null}
     */
    const opt_transaction = _.get(options, 'transaction', null);

    if (!isUUID(documentTypeId)) {
        return {
            found: false,
            prefix: opt_defaultPrefix,
        };
    }
    else if (!_.isString(opt_defaultPrefix)) {
        throw Error(`options.defaultPrefix must be string`);
    }
    else {
        const findPrefix = await modelMasterDocumentTypes.findOne({
            attributes: ['internal_code_id'],
            where: {
                id: documentTypeId
            },
            transaction: opt_transaction
        });

        if (!findPrefix || !_.isString(findPrefix.internal_code_id) || !findPrefix.internal_code_id) {
            return {
                found: false,
                prefix: opt_defaultPrefix,
            };
        }
        else {
            return {
                found: true,
                prefix: findPrefix.internal_code_id,
            };
        }
    }
};


module.exports = utilGetDocumentTypePrefix;