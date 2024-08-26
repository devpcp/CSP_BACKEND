const _ = require("lodash");

const Sequelize = require("sequelize");

/**
 * A utility help you create Sequelize literal of "attributes.include"
 * are contains replace field "created_by" and "created_by" into "user_name" field
 * @param {import("sequelize").Model | import("sequelize").Model<T>} modelInput
 * @param {object?} options
 * @param {string?} options.created_by - Override field name "created_by"
 * @param {boolean?} options.projectCreated_by - Output field name "created_by" (Default: true)
 * @param {string?} options.updated_by - Override field name "updated_by"
 * @param {boolean?} options.projectUpdated_by - Output field name "updated_by" (Default: true)
 * @returns {[]|[Literal,string][]}
 */
const utilGetCreateByAndUpdatedByFromModel = (modelInput, options = {}) => {
    if (!modelInput || !modelInput.name) {
        return [];
    }
    else {
        const getModelName = modelInput.name;

        const getCratedBy = _.get(options, "created_by", "created_by");
        const getUpdatedBy = _.get(options, "updated_by", "updated_by");

        const getProjectCreatedBy = Boolean(_.get(options, "projectCreated_by", true));
        const getProjectUpdatedBy = Boolean(_.get(options, "projectUpdated_by", true));

        const literalResult = [];

        if (getProjectCreatedBy) {
            literalResult.push([Sequelize.literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "${getModelName}"."${getCratedBy}")`), `${getCratedBy}`]);
        }

        if (getProjectUpdatedBy) {
            literalResult.push([Sequelize.literal(`(SELECT user_name FROM "systems"."sysm_users" WHERE id = "${getModelName}"."${getUpdatedBy}")`), `${getUpdatedBy}`]);
        }

        return literalResult;
    }
};


module.exports = utilGetCreateByAndUpdatedByFromModel;