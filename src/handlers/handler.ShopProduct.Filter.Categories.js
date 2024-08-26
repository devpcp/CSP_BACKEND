const { Op, literal } = require("sequelize");
const { isUUID } = require("../utils/generate");
const { handleSaveLog } = require("./log");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");

const ProductTypeGroup = require("../models/model").ProductTypeGroup;
const ProductType = require("../models/model").ProductType;
const ProductBrand = require("../models/model").ProductBrand;
const ProductModelType = require("../models/model").ProductModelType;

/**
 * A handler display filter Data of Categories of shop products
 * - Route [GET] => /api/filter/shopProductCategories
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault} request
 */
const handlerShopProductFilterCategories = async (request) => {
    const action = 'get filterShopProductCategories';

    try {
        const shop_product_id = request.query.shop_product_id || '';
        const product_id = request.query.product_id || '';
        const product_group_id = request.query.product_group_id || '';
        const product_type_id = request.query.product_type_id || '';
        const product_brand_id = request.query.product_brand_id || '';
        const product_model_id = request.query.product_model_id || '';

        const commandSQL_InnerJoin_ForFilterProductGroup = `
            INNER JOIN "master_lookup"."mas_product_types" AS "MasterProductType"
                ON "MasterProductType"."id" = "Product"."product_type_id" 
            INNER JOIN "master_lookup"."mas_product_type_groups" AS "MasterProductGroup"
                ON "MasterProductType"."type_group_id" = "MasterProductGroup"."id"
        `;
        let commandSQL_WHERE = '';
        if (
            isUUID(shop_product_id)
            || isUUID(product_id)
            || isUUID(product_group_id)
            || isUUID(product_type_id)
            || isUUID(product_brand_id)
            || isUUID(product_model_id)
        )
        {
            commandSQL_WHERE = ' WHERE 1=1 ';
            if (isUUID(product_id)) { commandSQL_WHERE += ` AND "Product"."id" = '${product_id}' `}
            if (isUUID(product_group_id)) { commandSQL_WHERE += ` AND "MasterProductGroup"."id" = '${product_group_id}' `}
            if (isUUID(product_type_id)) { commandSQL_WHERE += ` AND "Product"."product_type_id" = '${product_type_id}' `}
            if (isUUID(product_brand_id)) { commandSQL_WHERE += ` AND "Product"."product_brand_id" = '${product_brand_id}' `}
            if (isUUID(product_model_id)) { commandSQL_WHERE += ` AND "Product"."product_model_id" = '${product_model_id}' `}
        }


        const shop_tables = await utilCheckShopTableName(request, 'select_shop_ids');

        const sqlCommandGroupProductCategories = (modelName = '', categoriesType = '') => {
            const acceptCategoriesType = [
                'product_type_id',
                'product_brand_id',
                'product_model_id'
            ];

            if (!acceptCategoriesType.includes(categoriesType)) {
                throw Error('Require parameter categoriesType');
            }

            return literal(
                `
                ${modelName ? `"${modelName}"."id"` : '"id"'} IN 
                (
                    SELECT "Product"."${categoriesType}" 
                    FROM "app_datas"."dat_products" AS "Product" 
                        INNER JOIN 
                            (
                                ${shop_tables.reduce((prev, curr, currIdx) => {
                                    if (currIdx === 0) {
                                        return prev + `
                                        (
                                            SELECT product_id
                                                FROM app_shops_datas.dat_${curr.shop_code_id}_products
                                                ${
                                                    !isUUID(shop_product_id) 
                                                        ? `` 
                                                        : `WHERE id = '${shop_product_id}'`
                                                }
                                        )
                                        `;
                                    }
                                    else {
                                        return prev + `
                                        UNION ALL
                                        (
                                            SELECT product_id
                                                FROM app_shops_datas.dat_${curr.shop_code_id}_products
                                                ${
                                                    !isUUID(shop_product_id)
                                                        ? ``
                                                        : `WHERE id = '${shop_product_id}'`
                                                }
                                        )
                                        `;
                                    }
                                }, ``)}
                            )
                            AS "ShopProduct" 
                                ON "Product"."id" = "ShopProduct"."product_id" 
                        ${!isUUID(product_group_id) ? '' : commandSQL_InnerJoin_ForFilterProductGroup}
                    ${commandSQL_WHERE}
                    GROUP BY "Product"."${categoriesType}"
                )
                `.replace(/\s+/g, ' ')
            );
        };

        const fnProductGroupLists = async () => await ProductTypeGroup.findAll({
            include: [
                {
                    model: ProductType,
                    required: true,
                    where: {
                        [Op.and]: sqlCommandGroupProductCategories(ProductType.name + 's','product_type_id')
                    },
                    attributes: []
                }
            ],
            order: [['code_id', 'ASC'], ['created_date', 'ASC']]
        });
        const fnProductTypeLists = async () => await ProductType.findAll({
            where: {
                [Op.and]: sqlCommandGroupProductCategories(ProductType.name,'product_type_id')
            },
            order: [['code_id', 'ASC'], ['created_date', 'ASC']]
        });
        const fnProductBrandLists = async () => await ProductBrand.findAll({
            where: {
                [Op.and]: sqlCommandGroupProductCategories(ProductBrand.name,'product_brand_id')
            },
            order: [['code_id', 'ASC'], ['created_date', 'ASC']]
        });
        const fnProductModelLists = async () => await ProductModelType.findAll({
            where: {
                [Op.and]: sqlCommandGroupProductCategories(ProductModelType.name,'product_model_id')
            },
            order: [['code_id', 'ASC'], ['created_date', 'ASC']]
        });

        const [
            productGroupLists,
            productTypeLists,
            productBrandLists,
            productModelLists,
        ] = await Promise.all([
            fnProductGroupLists(),
            fnProductTypeLists(),
            fnProductBrandLists(),
            fnProductModelLists(),
        ]);

        return {
            productGroupLists,
            productTypeLists,
            productBrandLists,
            productModelLists
        };
    }
    catch (error) {
        await handleSaveLog(request, [[action, '', request.body], `error: ${error}`]);

        throw error;
    }
};


module.exports = handlerShopProductFilterCategories;