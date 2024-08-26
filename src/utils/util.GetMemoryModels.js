const { Model } = require("sequelize");

/**
 * @template T
 * @type {Object<string, Object<string, T>>}
 */
const memModels = {};

/**
 * @template TModel
 * @param {string} table_name
 * @param {TModel} model
 * @returns TModel
 */
const utilGetMemoryModels = (table_name, model) => {
    if (!table_name) { throw new Error(`Require parameter 'table_name' as String`); }
    if (!model || !(model.prototype instanceof Model)) { throw new Error(`Require parameter 'model' as Model`); }

    const modelName = model.constructor.name;

    if (!memModels[table_name]) {
        memModels[table_name] = {};
    }
    if (!memModels[table_name][modelName]) {
        memModels[table_name][modelName] = model;
    }

    return memModels[table_name][modelName] = model;
};


module.exports = utilGetMemoryModels;