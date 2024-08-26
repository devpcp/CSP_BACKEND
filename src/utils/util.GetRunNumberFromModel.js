const _ = require("lodash");
const {Op} = require("sequelize");
const moment = require("moment");

/**
 * A utility help generate Run number of Model (Especially dynamics model) for run number field as in parameter "run_number_field"
 * @param {T &import("sequelize").Model} model - A model instance was created from Sequelize
 * @param {string} run_number_field - A field in model instance refer to "run_number" (example: "run_no")
 * @param {object} options - An additional options
 * @param {import("sequelize").Transaction} options.transaction - An sequelize transactions (default: null)
 * @param {string?} options.prefix_config - A config of prefix (default: "XX")
 * @param {string?} options.created_date_field - A field refer date-time of document was created (default: "created_date")
 * @param {string?} options.addSeqNumber - A field seeding result sequence number (default: 0)
 * @param {import("sequelize").WhereOptions} options.whereQuery - If you have operation in where clause (default: null)
 * @returns {Promise<{stringPrefix: string, runNumber: number, runString: string}>}
 */
const utilGetRunNumberFromModel = async (model = null, run_number_field = "run_no", options= {}) => {
    if (!model) { throw Error(`require parameter @model as Sequelize's model`); }
    if (!_.isString(run_number_field) || !run_number_field) { throw Error(`require parameter @run_number_field as String`); }

    const currentDateTime = _.get(options, 'currentDateTime', new Date());
    const whereQuery = _.get(options, 'whereQuery', {});

    const transaction = _.get(options, "transaction", null);
    const prefixConfig = _.get(options, "prefix_config", "XX");
    const createdDateField = _.get(options, "created_date_field", "created_date");
    const addSeqNumber = _.get(options, "addSeqNumber", 0);

    /**
     * @return {[number,number]}
     */
    const getBetweenYear = () => [
        new Date(`${currentDateTime.getFullYear()}-${_.padStart(String(1), 2, "0")}-${_.padStart(String(1), 2, "0")}T00:00:00.000+07:00`).valueOf(),
        new Date(`${currentDateTime.getFullYear()}-${_.padStart(String(12), 2, "0")}-${_.padStart(String(31), 2, "0")}T23:59:59.999+07:00`).valueOf()
    ];

    /**
     * @return {[number,number]}
     */
    const getBetweenMonth = () => [
        moment()
            .startOf("day")
            .startOf("month")
            .valueOf(),
        moment()
            .endOf("day")
            .endOf("month")
            .valueOf()
    ];

    const getQueryBetween = () => _.get(options, 'betweenBy', 'month') === 'year'
        ? getBetweenYear()
        : getBetweenMonth();

    /**
     * A number variable calculated from max value of "run_no" between in current year
     * @type {number}
     */
    const findLatestRowNumber = await model.max(
        run_number_field,
        {
            where: {
                [createdDateField]: {
                    [Op.between]: getQueryBetween()
                },
                ...whereQuery
            },
            transaction: transaction
        }
    ) + 1 + addSeqNumber;

    // /**
    //  * example: 2023 => 23
    //  * @type {string}
    //  */
    // const newStringYear = _.padStart(String(currentDateTime.getFullYear()).slice(2, 4), 2, "0");
    /**
     * Running year
     *
     * example: 2023 => 2023
     *
     * @type {string}
     */
    const newStringYear = _.padStart(String(currentDateTime.getFullYear()), 4, "0");

    /**
     * Running month
     *
     * example: 1 => 01
     *
     * @type {string}
     */
    const newStringMonth = _.padStart(String(currentDateTime.getMonth() + 1), 2, "0");

    /**
     * Running number
     *
     * example: 4 => 0004
     *
     * @type {string}
     */
    const newStringRowNumber = _.padStart(String(findLatestRowNumber), 4, "0");

    const concatStringPrefix = `${prefixConfig}${newStringYear}${newStringMonth}`;
    const concatStringRunNumber = `${concatStringPrefix}${newStringRowNumber}`;

    return {
        stringPrefix: concatStringPrefix,
        runNumber: findLatestRowNumber,
        runString: concatStringRunNumber
    };
};


module.exports = utilGetRunNumberFromModel;