const _ = require("lodash");
const { Op, literal } = require("sequelize");
const { handleSaveLog } = require("./log");
const { v4: uuid_v4 } = require("uuid");
const XLSX = require("sheetjs-style");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");

const modelShopLegacySalesOut = require("../models/model").ShopLegacySalesOut;

const fnShopLegacySalesOutAllExportExcel = async (jsonDataSets = []) => {
    const fnFromString = (value) => value || '';
    const fnFromNumber = (value) => value ? String(value) : '0';

    const configColumnTableDict = {
        "document_code_id": "เลขที่ใบเสร็จ",
        "document_date": "วันที่ใบเสร็จ",
        "customer_name": "ชื่อ-สกุล ลูกค้า",
        "customer_vehicle_reg_plate": "ทะเบียนรถ",
        "customer_tel_no": "เบอร์มือถือ",
        "product_code": "รหัสสินค้า",
        "product_name": "ชื่อสินค้า",
        "product_amount": "จำนวนสินค้า",
        "price_grand_total": "ยอดเงิน (รวม VAT)",
        "customer_latest_contact_date": "วันที่ติดต่อล่าสุด",
        "details.mileage": "เลขไมล์ครั้งนี้"
    };
    const configColumnTableDict_DataTypeSerializer = {
        "document_code_id": fnFromString,
        "document_date": fnFromString,
        "customer_name": fnFromString,
        "customer_vehicle_reg_plate": fnFromString,
        "customer_tel_no": fnFromString,
        "product_code": fnFromString,
        "product_name": fnFromString,
        "product_amount": fnFromString,
        "price_grand_total": fnFromString,
        "customer_latest_contact_date": fnFromString,
        "details.mileage": fnFromNumber
    };


    const configCellFormatType = {
        "text": "s",
    };

    const newJsonDataSets = jsonDataSets.map(element => {
        const objData = {};
        for (const configColumnTableDictKey in configColumnTableDict) {
            objData[configColumnTableDict[configColumnTableDictKey]]= {
                v: configColumnTableDict_DataTypeSerializer[configColumnTableDictKey](_.get(element, configColumnTableDictKey, null)),
                s: configCellFormatType["text"]
            }
        }
        return objData;
    });

    const workSheet = XLSX.utils.json_to_sheet(newJsonDataSets);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Sheet1');

    const fileName = uuid_v4() + '.xlsx';
    await XLSX.writeFile(workBook, "src/assets/" + fileName, { cellStyles: true });

    return { filePath: '/assets/' + fileName };
};


/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T> || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const handlerShopLegacySalesOutAll = async (request = {}, reply = {}, options = {}) => {
    const action = 'GET ShopLegacySalesOut.All';

    try {
        const search = (request.query.search || '')
            .replace(/(\s|\t|\r)+/ig, '%')
            .replace(/(%)+/ig, '%');
        const start_date = request.query.start_date || '';
        const end_date = request.query.end_date || '';
        const limit = request.query.limit || 10;
        const page = request.query.page || 1;
        const sort = request.query.sort || 'document_date';
        const order = request.query.order || 'ASC';
        const status = (request.query.status || 'default')
            .toLowerCase();
        const filter_by = (request.query.filter_by || '').split(',');
        const export_format = request.query.export_format || 'json';

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;

        const instanceModelShopLegacySalesOut = modelShopLegacySalesOut(table_name);

        const fnGetWhereQuery = () => {
            /**
             * @type {import("sequelize").WhereOptions || {}}
             */
            const whereData = {};

            if (search) {
                const whereQuery = [];

                if (filter_by.length === 0 || filter_by.includes('all') || filter_by.includes('customer_name')) {
                    whereQuery.push({
                        customer_name: {
                            [Op.iLike]: `%${search}%`
                        }
                    });
                    whereQuery.push(literal(`REGEXP_REPLACE(customer_name,'[-]',' ','ig') ILIKE '%${search}%'`));
                }
                if (filter_by.length === 0 || filter_by.includes('all') || filter_by.includes('customer_vehicle_reg_plate')) {
                    whereQuery.push({
                        customer_vehicle_reg_plate: {
                            [Op.iLike]: `%${search}%`
                        }
                    });
                    whereQuery.push(literal(`REGEXP_REPLACE(customer_vehicle_reg_plate,'[-]',' ','ig') ILIKE '%${search}%'`));
                }
                if (filter_by.length === 0 || filter_by.includes('all') || filter_by.includes('customer_tel_no')) {
                    whereQuery.push({
                        customer_tel_no: {
                            [Op.iLike]: `%${search}%`
                        }
                    });
                    whereQuery.push(literal(`REGEXP_REPLACE(customer_tel_no,'[^0-9]','','ig') ILIKE '%${search}%'`));
                }
                if (filter_by.length === 0 || filter_by.includes('all') || filter_by.includes('product_code')) {
                    whereQuery.push({
                        product_code: {
                            [Op.iLike]: `%${search}%`
                        }
                    });
                    whereQuery.push(literal(`REGEXP_REPLACE(product_code,'[-]',' ','ig') ILIKE '%${search}%'`));
                }
                if (filter_by.length === 0 || filter_by.includes('all') || filter_by.includes('product_name')) {
                    whereQuery.push({
                        product_name: {
                            [Op.iLike]: `%${search}%`
                        }
                    });
                    whereQuery.push(literal(`REGEXP_REPLACE(product_name,'[-]',' ','ig') ILIKE '%${search}%'`));
                    whereQuery.push(literal(`REGEXP_REPLACE(product_name,'[^0-9]','','ig') ILIKE '%${search}%'`));
                    whereQuery.push(literal(`REGEXP_REPLACE(product_name,'^((?![0-9]+(\\/|\\\\)[0-9]+\\s*(([a-z]*[A-Z]*[0-9])+)).)*','','ig') ILIKE '%${search}%'`));
                }

                whereData[Op.or] = whereQuery;
            }

            if (start_date.length > 0 && end_date.length > 0) {
                whereData.document_date = {
                    [Op.between]: [start_date, end_date]
                };
            }
            if (start_date.length > 0 && end_date.length === 0) {
                whereData.document_date = {
                    [Op.gte]: start_date
                };
            }
            if (start_date.length === 0 && end_date.length > 0) {
                whereData.document_date = {
                    [Op.lte]: end_date
                };
            }

            switch (status) {
                case 'active':
                    whereData.status = {
                        [Op.eq]: 1
                    };
                    break;
                case 'delete':
                    whereData.status = {
                        [Op.eq]: 0
                    };
                    break;
                default:
                    whereData.status = {
                        [Op.in]: [0, 1]
                    }
            }

            return whereData;
        };

        const whereQuery = fnGetWhereQuery();

        if (export_format === 'xlsx') {
            const findDocuments = await instanceModelShopLegacySalesOut.findAll({
                where: whereQuery,
                order: [['document_date', 'ASC'], ['code_id', 'ASC']]
            });

            const responseData = await fnShopLegacySalesOutAllExportExcel(findDocuments.map(w => w.toJSON()));

            await handleSaveLog(request, [[action, request.query], '']);

            return utilSetFastifyResponseJson('success', responseData);
        }
        else {
            const fnFindDocuments = async () => await instanceModelShopLegacySalesOut.findAll({
                where: whereQuery,
                order: [['document_date', 'ASC'], ['code_id', 'ASC']],
                limit: limit,
                offset: (page - 1) * limit
            });

            const fnCountFindDocuments = async () => await instanceModelShopLegacySalesOut.count({
                where: whereQuery
            });

            const [
                findDocuments,
                countFindDocuments
            ] = await Promise.all([
                fnFindDocuments(),
                fnCountFindDocuments()
            ]);

            const responseData = {
                currentPage: page,
                pages: Math.ceil(countFindDocuments / limit),
                currentCount: findDocuments.length,
                totalCount: countFindDocuments,
                data: findDocuments
            };

            await handleSaveLog(request, [[action, request.query], '']);

            return utilSetFastifyResponseJson('success', responseData);
        }

    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: ${errorLogId.id}: ${error.toString()}`);
    }
};


module.exports = handlerShopLegacySalesOutAll;