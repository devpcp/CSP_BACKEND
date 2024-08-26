const {
    Op,
    literal,
} = require("sequelize");
const utilIsErrorDynamicsTableNotFound = require("./util.IsErrorDynamicsTableNotFound");

/**
 * @param {typeof import("sequelize/types").Model} model
 * @return {Promise<""|"sync">}
 */
const utilSequelizeCreateTableIfNotExistsFromModel = async (model) => {
    let result = '';
    const testFind = await model.findOne({
        where: {
            [Op.and]: [
                literal('0 = 1')
            ]
        }
    })
        .then(result => result)
        .catch(async (error) => {
            if (utilIsErrorDynamicsTableNotFound(error)) {
                await model.sync();
                result = 'sync';
            }
            else {
                throw error;
            }
        });

    return '';
};


module.exports = utilSequelizeCreateTableIfNotExistsFromModel;