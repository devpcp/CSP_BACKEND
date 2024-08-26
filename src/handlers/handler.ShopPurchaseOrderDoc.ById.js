const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelProduct = require("../models/model").Product;
const modelShopProduct = require("../models/model").ShopProduct;
const modelShopPurchaseOrderDoc = require("../models/model").ShopPurchaseOrderDoc;
const modelShopPurchaseOrderList = require("../models/model").ShopPurchaseOrderList;
const modelShopBusinessCustomer = require("../models/model").ShopBusinessCustomers;
const modelShopPersonalCustomer = require("../models/model").ShopPersonalCustomers;
const modelShopBusinessPartner = require("../models/model").ShopBusinessPartners;
const modelBusinessType = require("../models/model").BusinessType;

/**
 *
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {{}} options
 */
const handlerShopPurchaseOrderDocById = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopQuotationDoc.ById';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const instanceModelShopBusinessCustomer = modelShopBusinessCustomer(table_name);
        const instanceModelShopPersonalCustomer = modelShopPersonalCustomer(table_name);
        const instanceModelShopBusinessPartner = modelShopBusinessPartner(table_name);

        const instanceModelShopProduct = modelShopProduct(table_name);

        const instanceModelShopPurchaseOrderDoc = modelShopPurchaseOrderDoc(table_name);
        const instanceModelShopPurchaseOrderList = modelShopPurchaseOrderList(table_name);

        instanceModelShopPurchaseOrderDoc.hasMany(instanceModelShopPurchaseOrderList, { sourceKey: 'id', foreignKey: 'doc_purchase_order_id', as: 'ShopPurchaseOrderLists' });

        const findDocument = await instanceModelShopPurchaseOrderDoc.findOne({
            include: [
                {
                    model: instanceModelShopPurchaseOrderList,
                    as: "ShopPurchaseOrderLists",
                    include: [
                        {
                            model: instanceModelShopProduct,
                            as: 'ShopProduct',
                            attributes: [
                                'id',
                                'product_id',
                                'product_bar_code',
                            ],
                            include: [
                                {
                                    model: modelProduct,
                                    attributes: [
                                        'id',
                                        'product_code',
                                        'master_path_code_id',
                                        'custom_path_code_id',
                                        'wyz_code',
                                        [`"product_name"->>'th'`, 'product_name'],
                                        'product_type_id',
                                        'product_brand_id',
                                        'product_model_id',
                                    ],
                                    required: false
                                }
                            ],
                            required: false
                        }
                    ],
                    required: false,
                    where: {
                        status: 1
                    },
                    order: [['seq_number', 'ASC']]
                },
                {
                    model: instanceModelShopBusinessCustomer,
                    as: 'ShopBusinessCustomer',
                    required: false,
                    include: [
                        {
                            model: modelBusinessType,
                            as: 'BusinessType'
                        }
                    ]
                },
                {
                    model: instanceModelShopPersonalCustomer,
                    as: 'ShopPersonalCustomer',
                    required: false
                },
                {
                    model: instanceModelShopBusinessPartner,
                    as: 'ShopBusinessPartner',
                    required: false,
                    include: [
                        {
                            model: modelBusinessType,
                            as: 'BusinessType'
                        }
                    ]
                }
            ],
            where: {
                id: request.params.id
            },
            transaction: request.transaction || options.transaction || null
        });

        await handleSaveLog(request, [[action, request.params.id], '']);

        return utilSetFastifyResponseJson('success', findDocument);

    }
    catch (error) {
        const errorLogId = await handleSaveLog(request, [[action, request.params.id], error]);

        throw Error(`Error with logId: ${errorLogId.id}`);
    }
};


module.exports = handlerShopPurchaseOrderDocById;