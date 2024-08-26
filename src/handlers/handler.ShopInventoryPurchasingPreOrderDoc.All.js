const { Op } = require("sequelize");
const { handleSaveLog } = require("./log");
const { paginate } = require("../utils/generate");
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilCheckModelShopsProfilesAtFieldShopCodeId = require("../utils/util.CheckModelShopsProfilesAtFieldShopCodeId");
const utilGetCreateByAndUpdatedByFromModel = require("../utils/util.GetCreateByAndUpdatedByFromModel");

const modelShopProfiles = require("../models/model").ShopsProfiles;
const modelDocumentTypes = require("../models/model").DocumentTypes;
const modelDocumentTypeGroups = require("../models/model").DocumentTypeGroups;
const modelShopInventoryPurchasingPreOrderDoc = require("../models/model").ShopInventoryPurchasingPreOrderDoc;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 *
 */
const handlerShopInventoryPurchasingPreOrderDocAll = async (request) => {
    const action = 'get shopInventoryPurchasingPreOrderDoc all';
    try {
        // Init data as requested
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        const search = request.query.search || "";
        const status = ['0', '1', '2', '3', '4'].includes(request.query.status) ? { status: +request.query.status } : { status: { [Op.ne]: 0 } };
        const sort = request.query.sort || "created_date";
        const order = request.query.order || "desc";
        const limit = +request.query.limit || 10;
        const page = +request.query.page || 1;

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        if (!findShopsProfile) {
            const instanceError = new Error(`Variable "findShopsProfile" return not found`);
            await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else if (!utilCheckModelShopsProfilesAtFieldShopCodeId(findShopsProfile.shop_code_id)) {
            const instanceError = new Error(`Variable "findShopsProfile"."shop_code_id" is not found`);
            await handleSaveLog(request, [[action], `error : ${instanceError.message}`]);
            return utilSetFastifyResponseJson("success", paginate([], limit, page));
        }
        else {
            /**
             * A class's dynamics instance of model "ShopBusinessPartners"
             */
            const instanceModelShopBusinessPartners = require("../models/ShopBusinessPartners/ShopBusinessPartners")(table_name);
            /**
             * A class's dynamics instance of model "ShopInventoryPurchasingPreOrderDoc"
             */
            const instanceModelShopInventoryPurchasingPreOrderDoc = modelShopInventoryPurchasingPreOrderDoc(table_name);

            const findDocuments = await instanceModelShopInventoryPurchasingPreOrderDoc.findAll({
                attributes: {
                    include: [
                        ...utilGetCreateByAndUpdatedByFromModel(instanceModelShopInventoryPurchasingPreOrderDoc),
                    ]
                },
                include: [
                    { model: modelShopProfiles, as: 'ShopsProfiles' },
                    { model: instanceModelShopBusinessPartners, as: 'ShopBusinessPartners' },
                    {
                        model: modelDocumentTypes,
                        as: 'DocumentTypes',
                        include: [
                            {
                                model: modelDocumentTypeGroups
                            }
                        ],
                    },
                ],
                where: {
                    ...status,
                    [Op.or]: [
                        {
                            code_id: { [Op.iLike]: `%${search}%` }
                        }
                    ]
                },
                order: [[sort, order]]
            });

            await handleSaveLog(request, [[action, '', request.query], '']);

            return utilSetFastifyResponseJson("success", paginate(findDocuments, limit, page));
        }
    }
    catch (error) {
        await handleSaveLog(request, [[action, '', request.query], `error : ${error}`]);

        throw error;
    }
};


module.exports = handlerShopInventoryPurchasingPreOrderDocAll;