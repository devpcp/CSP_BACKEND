const { Op, literal } = require("sequelize");
const { handleSaveLog } = require("./log");
const { generateSearchOpFromKeys } = require("../utils/generate");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilGetIsUse = require("../utils/util.GetIsUse");
const modelProductPurchaseUnitTypes = require("../models/model").ProductPurchaseUnitTypes;
const modelProductTypeGroup = require("../models/model").ProductTypeGroup;

const handlerMasterProductPurchaseUnitTypesAll = async (request) => {
    try {
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);

        const search = request.query.search;
        const sort = request.query.sort;
        const order = request.query.order;

        const getIsUse = utilGetIsUse(request.query.status);

        const findProductPurchaseUnitTypes = await modelProductPurchaseUnitTypes.findAll({
            include: [
                {
                    model: modelProductTypeGroup,
                    as: 'ProductTypeGroup'
                }
            ],
            where: {
                ...getIsUse,
                [Op.or]: [
                    {
                        code_id: {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        internal_code_id: {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        type_name: {
                            [Op.or]: [
                                ...generateSearchOpFromKeys(pageLang, Op.iLike, `%${search}%`)
                            ]
                        }
                    }
                ]
            },
            order: [[sort, order]],
            attributes: {
                include: [
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductPurchaseUnitTypes\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ProductPurchaseUnitTypes\".\"updated_by\" )"), 'updated_by'],
                ]
            }

        });

        await handleSaveLog(request, [["get master product purchase unit types all"], ""]);

        return utilSetFastifyResponseJson("success", findProductPurchaseUnitTypes);
    } catch (error) {
        await handleSaveLog(request, [["get master product purchase unit types all"], `error : ${error}`]);
        throw error;
    }
};


module.exports = handlerMasterProductPurchaseUnitTypesAll;