const { literal } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const modelProductPurchaseUnitTypes = require("../models/model").ProductPurchaseUnitTypes;
const modelProductTypeGroup = require("../models/model").ProductTypeGroup;


const handlerMasterProductPurchaseUnitTypesById = async (request) => {
    try {
        const findProductPurchaseUnitTypes = await modelProductPurchaseUnitTypes.findOne({
            include: [
                { model: modelProductTypeGroup, as: 'ProductTypeGroup' }
            ],
            where: {
                id: request.params.id
            },
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductPurchaseUnitTypes\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductPurchaseUnitTypes\".\"updated_by\" )"), 'updated_by'],
                ]
            }
        });

        await handleSaveLog(request, [["get master product purchase unit types"], ""]);

        return utilSetFastifyResponseJson("success", findProductPurchaseUnitTypes);
    } catch (error) {
        await handleSaveLog(request, [["get master product purchase unit types"], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerMasterProductPurchaseUnitTypesById;