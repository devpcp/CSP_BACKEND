const { isFunction } = require("lodash");

/**
 * A function generator callback function to see error
 * @param {(function(error: Error): void)} callbackError
 * @return {(function(error: Error): void)}
 */
const fnCreateCallbackErrorFunction = (callbackError) => {
    return isFunction(callbackError)
        ? (error) => {
            new Promise((resolve, reject) => {
                try {
                    callbackError(error);
                    resolve(true);
                } catch (error) {
                    resolve(false);
                }
            })
        }
        : (error) => { };
};


/**
 * @param {typeof import("sequelize/types").Model} model
 * @param {(function(error: Error): void)} callbackError
 * @return {Promise<boolean>}
 */
const fnCreateTable = async (model, callbackError) => {
    const getCallbackError = fnCreateCallbackErrorFunction(callbackError);

    try {
        await model.sync();
        return true;
    } catch (error) {
        getCallbackError(error);
        return false;
    }
};


/**
 * @param {typeof import("sequelize/types").Model} model
 * @param {(function(error: Error): void)} callbackError
 * @return {Promise<boolean>}
 */
const fnDropTable = async (model, callbackError) => {
    const getCallbackError = fnCreateCallbackErrorFunction(callbackError);

    try {
        await model.drop({ cascade: true });
        return true;
    } catch (error) {
        getCallbackError(error);
        return false;
    }
};


/**
 * A function that create tables from models.
 * @param {Array<typeof import("sequelize/types").Model>} models - An array contains sequelize model, please sort your model by your relationship model (PK first after FK)
 * @param {(function(error: Error): void)?} callbackError - A callback function to see error
 * @return {Promise<{status: "success"|"failed", rollback: (function (): void);}>}
 */
const utilSequelizeCreateDynamicTableFromModels = async (models, callbackError) => {
    const getCallbackError = fnCreateCallbackErrorFunction(callbackError);

    const createdTablesResult = models.map(() => false);
    for (let index = 0; index < createdTablesResult.length; index++) {
        const model = models[index];
        const createTableResult = await fnCreateTable(model)
            .then(r => {
                if (!r) { throw Error(`cannot create table`); }
                else {
                    createdTablesResult[index] = true;
                    return true;
                }
            })
            .catch(e => {
                createdTablesResult[index] = false;
                getCallbackError(e);
                return false;
            });
        if (!createTableResult) {
            break;
        }
    }

    const rollback = async () => {
        for (let index = 0; index < createdTablesResult.length; index++) {
            if (createdTablesResult[index] === true) {
                const model = models[index];
                await fnDropTable(model)
                    .then(r => {
                        if (!r) { throw Error(`cannot drop table`); }
                    })
                    .catch(e => {
                        getCallbackError(e);
                    });
            }
        }
    };

    if (createdTablesResult.includes(false)) {
        return {
            status: 'failed',
            rollback: rollback,
        };
    }
    else {
        return {
            status: 'success',
            rollback: rollback
        };
    }
};


module.exports = utilSequelizeCreateDynamicTableFromModels;