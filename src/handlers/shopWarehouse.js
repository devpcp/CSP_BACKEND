const { Op, literal } = require("sequelize");
const { isNull, isUUID } = require('../utils/generate');
const { handleSaveLog } = require('./log');
const utilSetFastifyResponseJson = require('../utils/util.SetFastifyResponseJson');
const utilCheckShopTableName = require('../utils/util.CheckShopTableName');
const utilGetFastifyRequestHeaderAcceptLanguage = require("../utils/util.GetFastifyRequestHeaderAcceptLanguage");

const __model = require('../models/model');
const ShopWarehouse = __model.ShopWarehouse;

const handleShopWarehousesAll = async (request, reply, options = {}) => {
    const action = 'GET ShopWarehouse.All';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = isUUID(request?.query?.shop_id || '')
            ? findShopProfiles.filter(w => w.id === request.query.shop_id)[0]?.shop_code_id
            : findShopProfiles[0].shop_code_id;
        if (!table_name) {
            throw new Error(`Shop is not found`);
        }

        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const search = request.query.search?.replace(/(\s)+/ig, ' ')?.replace(/(\s)+/ig, '%') || '';
        const sort = request.query.sort;
        const order = request.query.order;

        const where_q = {
            name: {
                [Op.or]: [
                    { th: { [Op.like]: '%' + search + '%' } },
                    { en: { [Op.like]: '%' + search + '%' } }
                ]
            }
        };

        const modelShopWarehouse = ShopWarehouse(table_name);

        const findDocuments = await modelShopWarehouse.findAll({
            attributes: {
                include: [
                    [literal('json_array_length(shelf)'), 'shelf_total'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopWarehouse\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopWarehouse\".\"updated_by\" )"), 'updated_by']
                ]
            },
            required: false,
            where: where_q,
            order: [[sort, order]],
            limit: limit,
            offset: (page - 1) * limit
        });

        const findDocumentCount = await modelShopWarehouse.count({
            where: where_q
        });

        const pag = {
            currentPage: page,
            pages: Math.ceil(findDocumentCount / limit),
            currentCount: findDocuments.length,
            totalCount: findDocumentCount,
            data: findDocuments
        };

        await handleSaveLog(request, [[action], '']);
        return utilSetFastifyResponseJson('success', pag);
    } catch (error) {
        const errorLogId =  await handleSaveLog(request, [[action], error]);
        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};


const handleShopWarehousesAdd = async (request, res) => {
    try {

        // request.id = '90f5a0a9-a111-49ee-94df-c5623811b6cc'
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        var shop_table = await utilCheckShopTableName(request)
        var table_name = shop_table.shop_code_id

        var { code_id, name, shelf } = request.body

        if (shelf) {

            var valueArr = shelf.map(function (item) { return item.code });
            var isDuplicate = valueArr.some(function (item, idx) {
                return valueArr.indexOf(item) != idx
            });

            if (isDuplicate == true) {
                return utilSetFastifyResponseJson("failed", "code can not duplicate")
            }

        }
        const findDataShopWarehouse = await ShopWarehouse(table_name).findOne({
            where: {
                [Op.or]: [
                    {
                        code_id: {
                            [Op.iLike]: `%${code_id}%`
                        }
                    },
                    {
                        name: {
                            [Op.or]: [
                                ...pageLang.reduce((previousValue, currentValue) => {
                                    if (name[currentValue]) {
                                        previousValue.push(literal(`"ShopWarehouse"."name"->>'${currentValue}' iLIKE '%${name[currentValue]}%'`));
                                    }
                                    return previousValue;
                                }, [])
                            ]
                        }
                    }
                ]
            }
        });
        if (findDataShopWarehouse) {
            return utilSetFastifyResponseJson("failed", "some of code_id or name is duplicated")
        }

        var create = await ShopWarehouse(table_name).create({
            ...request.body,
            created_by: request.id,
            created_date: Date.now()
        })
        await handleSaveLog(request, [['add ShopWarehouses', create.id, request.body], ''])
        return utilSetFastifyResponseJson("success", "successful")

    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [['add ShopWarehouses'], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

const handleShopWarehousesById = async (request, reply, options = {}) => {
    const action = 'GET ShopWarehouse.ById';

    try {
        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopProfiles = await utilCheckShopTableName(request, 'select_shop_ids');
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = isUUID(request?.query?.shop_id || '')
            ? findShopProfiles.filter(w => w.id === request.query.shop_id)[0]?.shop_code_id
            : findShopProfiles[0].shop_code_id;
        if (!table_name) {
            throw new Error(`Shop is not found`);
        }

        const ShopWarehouses_id = request.params.id;

        const find_ShopWarehouses = await ShopWarehouse(table_name).findAll({
            where: {
                id: ShopWarehouses_id
            },
            attributes: {
                include: [
                    [literal('json_array_length(shelf)'), 'shelf_total'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopWarehouse\".\"created_by\" )"), 'created_by'],
                    [literal("(SELECT user_name FROM systems.sysm_users WHERE id = \"ShopWarehouse\".\"updated_by\" )"), 'updated_by']
                ]
            },
        });

        await handleSaveLog(request, [[action], '']);
        return utilSetFastifyResponseJson('success', [find_ShopWarehouses[0]]);
    }
    catch (error) {
        const errorLogId =  await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: '${errorLogId.id}', Error: '${error?.message}'`);
    }
};

const handleShopWarehousesPut = async (request, res) => {
    var action = 'put ShopWarehouses'
    try {
        // request.id = '90f5a0a9-a111-49ee-94df-c5623811b6cc'
        const pageLang = utilGetFastifyRequestHeaderAcceptLanguage(request);
        var shop_table = await utilCheckShopTableName(request)
        var table_name = shop_table.shop_code_id

        var { code_id, name, shelf } = request.body

        var ShopWarehouses_id = request.params.id

        const findDataShopWarehouse = await ShopWarehouse(table_name).findOne({
            where: {
                id: {
                    [Op.ne]: request.params.id
                },
                [Op.or]: [
                    {
                        code_id: {
                            [Op.iLike]: `%${code_id}%`
                        }
                    },
                    {
                        name: {
                            [Op.or]: [
                                ...pageLang.reduce((previousValue, currentValue) => {
                                    if (name[currentValue]) {
                                        previousValue.push(literal(`"ShopWarehouse"."name"->>'${currentValue}' iLIKE '%${name[currentValue]}%'`));
                                    }
                                    return previousValue;
                                }, [])
                            ]
                        }
                    }
                ]
            }
        });
        if (findDataShopWarehouse) {
            return utilSetFastifyResponseJson("failed", "some of code_id or name is duplicated")
        }

        var data = {}
        const find_ShopWarehouses = await ShopWarehouse(table_name).findAll({ where: { id: ShopWarehouses_id } });
        if (!find_ShopWarehouses[0]) {
            await handleSaveLog(request, [[action], 'ShopWarehouses not found'])
            return ({ status: "failed", data: "ShopWarehouses not found" })
        }
        if (!isNull(code_id)) {
            data.code_id = code_id
        }

        if (!isNull(name)) {
            data.name = name
        }

        if (!isNull(shelf)) {

            var valueArr = shelf.map(function (item) { return item.code });
            var isDuplicate = valueArr.some(function (item, idx) {
                return valueArr.indexOf(item) != idx
            });

            if (isDuplicate == true) {
                return utilSetFastifyResponseJson("failed", "code can not duplicate")
            }

            data.shelf = shelf

        }

        data.updated_by = request.id
        data.updated_date = Date.now()

        var before_update = await ShopWarehouse(table_name).findOne({
            where: {
                id: ShopWarehouses_id
            }
        });

        await ShopWarehouse(table_name).update(data, {
            where: {
                id: ShopWarehouses_id
            }
        });
        await handleSaveLog(request, [[action, ShopWarehouses_id, request.body, before_update], ''])
        return utilSetFastifyResponseJson("success", "successful")


    } catch (error) {
        error = error.toString()
        await handleSaveLog(request, [[action], 'error : ' + error])
        return ({ status: "failed", data: error })
    }
}

module.exports = {
    handleShopWarehousesAll,
    handleShopWarehousesAdd,
    handleShopWarehousesById,
    handleShopWarehousesPut
}