const get_sub = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            search_dealer: { type: 'string', default: '' },
            search_product: { type: 'string', default: '' },
            search_customer: { type: 'string', default: '' },
            start_date: { type: 'string', example: '2021-01-01' },
            end_date: { type: 'string', example: '2021-10-20' },
            dealer_id: { type: 'string', format: 'uuid' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'invoice_date', enum: ['invoice_date', 'created_date'] },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            which: { type: 'string', default: 'michelin data', enum: ['michelin data', 'my data'] }

            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['WebMax'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const get_stock = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            search_dealer: { type: 'string', default: '' },
            search_product: { type: 'string', default: '' },
            start_date: { type: 'string', example: '2021-01-01' },
            end_date: { type: 'string', example: '2021-10-20' },
            dealer_id: { type: 'string', format: 'uuid' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'balance_date', enum: ['balance_date', 'created_date'] },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            which: { type: 'string', default: 'michelin data', enum: ['michelin data', 'my data'] }
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['WebMax'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const get = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['RDBusinessRegNo', 'RDSubCode', 'TransMonth'],
        properties: {
            RDBusinessRegNo: { type: 'string' },
            RDSubCode: { type: 'string' },
            TransMonth: { type: 'string', example: 'FY2019M05' },
        }
    },
    tags: ['WebMax'],
    security: [
        {
            "apiKey": []
        }
    ]
}



const put = {

    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['RDBusinessRegNo', 'RDSubCode', 'TransDate'],
        properties: {
            RDBusinessRegNo: { type: 'string' },
            RDSubCode: { type: 'string' },
            TransDate: { type: 'string', example: '20190509' },
        }
    },
    body: {
        type: 'array', items: {
            type: 'object',
            required: ['ADCustomerName', 'PartDesc'],
            properties: {
                ADRegNo: { type: 'string', example: '' },
                ADCustomerName: { type: 'string', example: '' },
                DocType: { type: 'string', example: '', enum: ['IV', 'CN'] },
                InvoiceDate: { type: 'string', example: '20190503' },
                InvoiceNo: { type: 'string', example: '' },
                ItemNo: { type: 'string', example: '' },
                PartNumber: { type: 'string', example: '' },
                PartDesc: { type: 'string', example: '' },
                CAI: { type: 'string', example: '' },
                Qty: { type: 'number', example: 1 },

            },
        }
    },
    tags: ['WebMax'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const put_file = {

    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['RDBusinessRegNo', 'RDSubCode', 'TransDate'],
        properties: {
            RDBusinessRegNo: { type: 'string' },
            RDSubCode: { type: 'string' },
            TransDate: { type: 'string', example: '20190509' },
        }
    },
    tags: ['WebMax'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const put_stock = {

    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['RDBusinessRegNo', 'RDFileCode', 'TransDate'],
        properties: {
            RDBusinessRegNo: { type: 'string' },
            RDFileCode: { type: 'string', example: "A" },
            TransDate: { type: 'string', example: '20191120_152252' },
        }
    },
    body: {
        type: 'array', items: {
            type: 'object',
            required: ['CAI', 'Qty'],
            properties: {
                CAI: { type: 'string', example: '' },
                WarehouseCode: { type: 'string', example: '' },
                Qty: { type: 'number', example: 1 },
                Remarks: { type: 'string', example: '' },


            },
        }
    },
    tags: ['WebMax'],
    security: [
        {
            "apiKey": []
        }
    ]
}
const put_stock_file = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['RDBusinessRegNo', 'RDFileCode', 'TransDate'],
        properties: {
            RDBusinessRegNo: { type: 'string' },
            RDFileCode: { type: 'string', example: "A" },
            TransDate: { type: 'string', example: '20191120_152252' },
        }
    },
    tags: ['WebMax'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const put_edit_stock_unit = {
    body: {
        type: 'object',
        items: {
            type: 'object',
            required: ['id', 'balance'],
            properties: {
                id: { type: 'string' },
                balance: { type: 'number' },
            }
        }
    },
    tags: ['WebMax'],
    security: [
        {
            "apiKey": []
        }
    ]
}
module.exports = {
    get, put, put_file, get_sub, put_stock, get_stock, put_stock_file, put_edit_stock_unit
}