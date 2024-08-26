const _ = require("lodash");
const XLSX = require("sheetjs-style");
const uuid_v4 = require("uuid").v4;
const moment = require("moment");
const { Transaction } = require("sequelize");
const { handleSaveLog } = require("./log");
const utilSetFastifyResponseJson = require("../utils/util.SetFastifyResponseJson");
const utilCheckShopTableName = require("../utils/util.CheckShopTableName");

const db = require("../db");
const modelShopLegacySalesOut = require("../models/model").ShopLegacySalesOut;


/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T> || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault & { shop_id: string; table_name: string; } || {}} options
 */
const fnShopLegacySaleOutReadExcelFile = async (request = {}, reply = {}, options = {}) => {
    const configColumnHeaderDict = {
        "เลขที่ใบเสร็จ": "A",
        "วันที่ใบเสร็จ": "B",
        "ชื่อ-สกุล ลูกค้า": "C",
        "ทะเบียนรถ": "D",
        "เบอร์มือถือ": "E",
        "รหัสสินค้า": "F",
        "ชื่อสินค้า": "G",
        "จำนวนสินค้า": "H",
        "ยอดเงิน (รวม VAT)": "I",
        "วันที่ติดต่อล่าสุด": "J",
        "เลขไมล์ครั้งนี้": "K",
        "Error": "L"
    };
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
    };
    const configColumnTableDict_Details = {
        "mileage": "เลขไมล์ครั้งนี้",
    };
    const configCellFormatType = {
        "text": "s",
        "dateOnly": "yyyy-mm-dd",
    };
    const configCellStyle = {
        "errorRed": {
            fill: {
                patternType: "solid",
                fgColor: {
                    rgb: "FF0000"
                }
            }
        }
    };


    /**
     * @type {import("fastify-multipart").MultipartFile}
     */
    const reqFileData = request.body.file;

    const wb = XLSX.read(
        await reqFileData.toBuffer(),
        {
            type: "buffer"
        }
    );


    /**
     * @type {import("../types/type.Handler.ShopLegacySalesOut.Add").IXlsxDataRow[]}
     */
    const data_rows = XLSX.utils.sheet_to_json(
        wb.Sheets[wb.SheetNames[0]],
        {
            range: 1,
            header: _.keys(configColumnHeaderDict),
            raw: false,
            defval: ''
        }
    );

    let isValidatorHaveError = false;
    for (let rowIndex = 0; rowIndex < data_rows.length; rowIndex++) {
        const elementDataRow = data_rows[rowIndex];

        const rowMsgErrors = [];

        // Validate: เลขที่ใบเสร็จ
        if (!_.isString(elementDataRow["เลขที่ใบเสร็จ"]) || elementDataRow["เลขที่ใบเสร็จ"].length === 0) {
            rowMsgErrors.push("['เลขที่ใบเสร็จ'] ต้องการข้อมูล");
        }
        elementDataRow["เลขที่ใบเสร็จ"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["เลขที่ใบเสร็จ"]
        };

        // Validate: วันที่ใบเสร็จ
        if (_.isString(elementDataRow["วันที่ใบเสร็จ"]) && elementDataRow["วันที่ใบเสร็จ"].length > 0) {
            const isDateValid = moment(elementDataRow["วันที่ใบเสร็จ"], 'yyyy-mm-dd').isValid();
            if (!isDateValid) {
                rowMsgErrors.push("['วันที่ใบเสร็จ'] ต้องใช้รูปแบบ yyyy-mm-dd");
            }
        }
        else {
            rowMsgErrors.push("['วันที่ใบเสร็จ'] ต้องการข้อมูลและใช้รูปแบบ yyyy-mm-dd");
        }
        elementDataRow["วันที่ใบเสร็จ"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["วันที่ใบเสร็จ"]
        };

        // Validate: ชื่อ-สกุล ลูกค้า
        if (!_.isString(elementDataRow["ชื่อ-สกุล ลูกค้า"])) {
            rowMsgErrors.push("['ชื่อ-สกุล ลูกค้า'] จะต้องเป็นข้อความหรือเป็นค่าว่าง");
        }
        elementDataRow["ชื่อ-สกุล ลูกค้า"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["ชื่อ-สกุล ลูกค้า"]
        }

        // Validate: ทะเบียนรถ
        if (!_.isString(elementDataRow["ทะเบียนรถ"])) {
            rowMsgErrors.push("['ทะเบียนรถ'] จะต้องเป็นข้อความหรือเป็นค่าว่าง");
        }
        elementDataRow["ทะเบียนรถ"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["ทะเบียนรถ"]
        };

        // Validate: เบอร์มือถือ
        if (!_.isString(elementDataRow["เบอร์มือถือ"])) {
            rowMsgErrors.push("['เบอร์มือถือ'] จะต้องเป็นข้อความหรือเป็นค่าว่าง");
        }
        elementDataRow["เบอร์มือถือ"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["เบอร์มือถือ"]
        };

        // Validate: รหัสสินค้า
        if (!_.isString(elementDataRow["รหัสสินค้า"])) {
            rowMsgErrors.push("['รหัสสินค้า'] จะต้องเป็นข้อความหรือเป็นค่าว่าง");
        }
        elementDataRow["รหัสสินค้า"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["รหัสสินค้า"]
        };

        // Validate: ชื่อสินค้า
        if (!_.isString(elementDataRow["ชื่อสินค้า"]) || elementDataRow["ชื่อสินค้า"].length === 0) {
            rowMsgErrors.push("['ชื่อสินค้า'] จะต้องเป็นข้อความ");
        }
        elementDataRow["ชื่อสินค้า"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["ชื่อสินค้า"]
        };

        // Validate: จำนวนสินค้า
        if (elementDataRow["จำนวนสินค้า"] === '' || !_.isFinite(Number(elementDataRow["จำนวนสินค้า"]))) {
            rowMsgErrors.push("['จำนวนสินค้า'] จะต้องเป็นจำนวนนับมีค่ามากกว่าหรือเท่ากับ 0");
        }
        else {
            if (Number(elementDataRow["จำนวนสินค้า"]) < 0) {
                rowMsgErrors.push("['จำนวนสินค้า'] จะต้องมีค่ามากกว่าหรือเท่ากับ 0");
            }
        }
        elementDataRow["จำนวนสินค้า"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["จำนวนสินค้า"]
        };

        // Validate: ยอดเงิน (รวม VAT)
        if (elementDataRow["ยอดเงิน (รวม VAT)"] === '' || !_.isFinite(Number(elementDataRow["ยอดเงิน (รวม VAT)"]))) {
            rowMsgErrors.push("['ยอดเงิน (รวม VAT)'] จะต้องเป็นจำนวนเงินมีค่ามากกว่าหรือเท่ากับ 0");
        }
        elementDataRow["ยอดเงิน (รวม VAT)"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["ยอดเงิน (รวม VAT)"]
        };

        // Validate: วันที่ติดต่อล่าสุด
        if (_.isString(elementDataRow["วันที่ติดต่อล่าสุด"]) && elementDataRow["วันที่ติดต่อล่าสุด"].length > 0) {
            const isDateValid = moment(elementDataRow["วันที่ติดต่อล่าสุด"], 'yyyy-mm-dd').isValid();
            if (!isDateValid) {
                rowMsgErrors.push("['วันที่ติดต่อล่าสุด'] ต้องใช้รูปแบบ yyyy-mm-dd");
            }
        }
        elementDataRow["วันที่ติดต่อล่าสุด"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["วันที่ติดต่อล่าสุด"]
        };

        // Validate: เลขไมล์ครั้งนี้
        if (elementDataRow["เลขไมล์ครั้งนี้"] === '' || !_.isFinite(Number(elementDataRow["เลขไมล์ครั้งนี้"]))) {
            rowMsgErrors.push("['เลขไมล์ครั้งนี้'] จะต้องเป็นจำนวนตัวเลขมีค่ามากกว่าหรือเท่ากับ 0");
        }
        elementDataRow["เลขไมล์ครั้งนี้"] = {
            t: configCellFormatType["text"],
            v: elementDataRow["เลขไมล์ครั้งนี้"]
        };

        // Append error message if they have any error in this row
        elementDataRow["Error"] = {
            t: configCellFormatType["text"],
            v: ""
        };
        if (rowMsgErrors.length > 0) {
            isValidatorHaveError = true;
            // Input error description into cell
            elementDataRow["Error"].v = rowMsgErrors.toString();
            // Fill background color reminded error
            for (const elementDataRowKey in elementDataRow) {
                elementDataRow[elementDataRowKey].s = {
                    fill: configCellStyle["errorRed"].fill
                }
            }
        }
    }

    if (isValidatorHaveError) {
        wb.Sheets[wb.SheetNames[0]] = XLSX.utils.json_to_sheet(data_rows);
        const fileName = uuid_v4() + '.xlsx';
        await XLSX.writeFile(wb, "src/assets/" + fileName, { cellStyles: true });
        return utilSetFastifyResponseJson("failed", { filePath: '/assets/' + fileName });
    }
    else {
        const transactionResult = await db.transaction(
            {
                transaction: request.transaction || null,
                isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
            },
            async (transaction) => {
                if (!request.transaction) {
                    request.transaction = transaction;
                }

                const reMap_data_rows = data_rows.map(w => {
                    const mappedData = {
                        shop_id: options.shop_id,
                        details: {},
                        created_by: request.id,
                        created_date: options.currentDateTime
                    };
                    for (const configColumnTableDictKey in configColumnTableDict) {
                        mappedData[configColumnTableDictKey] = w[configColumnTableDict[configColumnTableDictKey]].v !== ''
                            ? w[configColumnTableDict[configColumnTableDictKey]].v
                            : null;
                    }
                    for (const configColumnTableDict_DetailsKey in configColumnTableDict_Details) {
                        mappedData.details[configColumnTableDict_DetailsKey] = w[configColumnTableDict_Details[configColumnTableDict_DetailsKey]].v !== ''
                            ? w[configColumnTableDict_Details[configColumnTableDict_DetailsKey]].v
                            : null;
                    }
                    return mappedData;
                });

                const instanceModelShopLegacySalesOut = modelShopLegacySalesOut(options.table_name);

                const duplicatedDocuments = [];
                const prepareCreateDocument = [];
                let createdDocuments = [];
                for (let index = 0; index < reMap_data_rows.length; index++) {
                    const element = reMap_data_rows[index];

                    const findElement = { ...reMap_data_rows[index] };
                    delete findElement.shop_id;
                    delete findElement.created_by;
                    delete findElement.created_date;

                    const findDuplicatedDoc = await instanceModelShopLegacySalesOut.findOne({
                        where: findElement,
                        transaction: transaction
                    });
                    if (findDuplicatedDoc) {
                        duplicatedDocuments.push(findDuplicatedDoc);
                    }
                    else {
                        prepareCreateDocument.push(element);
                    }
                }
                if (prepareCreateDocument.length > 0) {
                    const createdDoc = await instanceModelShopLegacySalesOut.bulkCreate(
                        prepareCreateDocument,
                        {
                            transaction: transaction,
                            validate: true
                        }
                    );
                    createdDocuments = createdDoc;
                }

                return { duplicatedDocuments, createdDocuments };
            }
        );

        return utilSetFastifyResponseJson("success", transactionResult);
    }
};


/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T> || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault & { shop_id: string; table_name: string; } || {}} options
 */
const fnShopLegacySaleOutReadBodyJson = async (request = {}, reply = {}, options = {}) => {
    const transactionResult = await db.transaction(
        {
            transaction: request.transaction || null,
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        },
        async (transaction) => {
            if (!request.transaction) {
                request.transaction = transaction;
            }

            const instanceModelShopLegacySalesOut = modelShopLegacySalesOut(options.table_name);

            const duplicatedDocuments = [];
            const createdDocuments = [];

            if (_.isArray(request.body.shopLegacySalesOuts) && request.body.shopLegacySalesOuts.length > 0) {
                const map_dataSets = request.body.shopLegacySalesOuts.map(element => {
                    return {
                        shop_id: options.shop_id,
                        created_by: request.id,
                        created_date: options.currentDateTime,
                        ...element
                    };
                });


                for (let index = 0; index < map_dataSets.length; index++) {
                    const element = map_dataSets[index];

                    const findElement = { ...element };
                    delete findElement.shop_id;
                    delete findElement.created_by;
                    delete findElement.created_date;

                    const findDuplicatedDoc = await instanceModelShopLegacySalesOut.findOne({
                        where: findElement,
                        transaction: transaction
                    });
                    if (findDuplicatedDoc) {
                        duplicatedDocuments.push(findDuplicatedDoc);
                    }
                    else {
                        const createdDoc = await instanceModelShopLegacySalesOut.create(
                            element,
                            {
                                transaction: transaction,
                                validate: true
                            }
                        );
                        createdDocuments.push(createdDoc);
                    }
                }
            }
            else {
                delete request.body.shopLegacySalesOuts;

                const element = {
                    shop_id: options.shop_id,
                    created_by: request.id,
                    created_date: options.currentDateTime,
                    ...request.body
                };

                const findElement = { ...element };
                delete findElement.shop_id;
                delete findElement.created_by;
                delete findElement.created_date;

                const findDuplicatedDoc = await instanceModelShopLegacySalesOut.findOne({
                    where: findElement,
                    transaction: transaction
                });
                if (findDuplicatedDoc) {
                    duplicatedDocuments.push(findDuplicatedDoc);
                }
                else {
                    const createdDoc = await instanceModelShopLegacySalesOut.create(
                        element,
                        {
                            transaction: transaction,
                            validate: true
                        }
                    );
                    createdDocuments.push(createdDoc);
                }
            }

            return { duplicatedDocuments, createdDocuments };
        }
    );

    return utilSetFastifyResponseJson("success", transactionResult);
};

/**
 * @template T
 * @param {import("../types/type.Default.Fastify").FastifyRequestDefault<T> || {}} request
 * @param {import("../types/type.Default.Fastify").FastifyReplyDefault || {}} reply
 * @param {import("../types/type.Default.Fastify").FastifyOptionDefault} options
 */
const handlerShopLegacySalesOutAdd = async (request = {}, reply = {}, options = {}) => {
    const action = 'POST ShopLegacySalesOut.Add';

    try {
        const currentDateTime = _.get(options, 'currentDateTime', new Date());
        options.currentDateTime = currentDateTime;

        /**
         * A result of find data to see what ShopProfile's id whereby this user's request
         */
        const findShopsProfile = await utilCheckShopTableName(request);
        options.shop_id = findShopsProfile.get('id');

        /**
         * A name for create dynamics table
         * @type {string}
         */
        const table_name = findShopsProfile.shop_code_id;
        options.table_name = table_name;

        if (request.body.file) {
            return await fnShopLegacySaleOutReadExcelFile(request, reply, options);
        }
        else {
            return await fnShopLegacySaleOutReadBodyJson(request, reply, options);
        }

    } catch (error) {
        const errorLogId = await handleSaveLog(request, [[action], error]);

        throw Error(`Error with logId: ${errorLogId.id}: ${error.toString()}`);
    }
};


module.exports = handlerShopLegacySalesOutAdd;