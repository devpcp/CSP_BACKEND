
const all = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: {
                type: 'number',
                default: 10
            },
            page: {
                type: 'number',
                default: 1
            },
            sort: {
                type: 'string',
                default: 'created_date'
            },
            order: {
                type: 'string',
                default: 'asc',
                enum: ['asc', 'desc']
            },
            status: {
                type: 'string',
                default: 'default',
                enum: ['default', 'delete', 'active', 'block']
            },
            bus_customer_id: { type: 'string', format: 'uuid' },
            per_customer_id: { type: 'string', format: 'uuid' },
            shop_bank_id: { type: 'string', format: 'uuid' },
            bank_id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ShopCheckCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]

}


const byid = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ShopCheckCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}



const add = {
    body: {
        // type: 'array', items: {
        type: 'object',
        required: ['check_no', 'check_date', 'check_amount', 'check_receive_date'],
        properties: {
            bus_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            per_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            bank_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'id ของ ธนาคาร จาก master',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            check_no: {
                type: 'string',
                nullable: false,
                comment: 'เลขที่เช็ค'
            },
            check_branch: {
                type: 'string',
                nullable: true,
                default: null,
                comment: 'สาขา'
            },
            check_date: {
                type: 'string',
                format: 'date',
                nullable: false,
                comment: 'วันที่หน้าเช็ค'
            },
            check_amount: {
                type: 'number',
                nullable: false,
                comment: 'จำนวนเงินหน้าเช็ค'
            },
            shop_bank_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'id ของ บัญชีธนาคาร จาก shop',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            check_receive_date: {
                type: 'string',
                format: 'date',
                nullable: false,
                comment: 'วันที่รับเช็ค'
            },
            check_status: {
                type: 'integer',
                nullable: true,
                default: 0,
                comment: 'สถานะการขึ้นเงิน 0=รอเคลียร์เช็ค 1=ขึ้นเช็คแล้ว 2=เช็คเด้ง',
                enum: [0, 1, 2]
            },
            details: {
                nullable: true,
                default: {},
                type: 'object',
                properties: {},
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            }

        }

    },
    tags: ['ShopCheckCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const put = {
    body: {
        // type: 'array', items: {
        type: 'object',
        properties: {
            bus_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            per_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            bank_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                comment: 'id ของ ธนาคาร จาก master',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            check_no: {
                type: 'string',
                nullable: true,
                default: undefined,
                comment: 'เลขที่เช็ค'
            },
            check_branch: {
                type: 'string',
                nullable: true,
                default: undefined,
                comment: 'สาขา'
            },
            check_date: {
                type: 'string',
                nullable: true,
                format: 'date',
                default: undefined,
                comment: 'วันที่หน้าเช็ค'
            },
            check_amount: {
                type: 'number',
                nullable: true,
                default: undefined,
                comment: 'จำนวนเงินหน้าเช็ค'
            },
            shop_bank_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                comment: 'id ของ บัญชีธนาคาร จาก shop',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            check_receive_date: {
                type: 'string',
                nullable: true,
                format: 'date',
                default: undefined,
                comment: 'วันที่รับเช็ค'
            },
            check_status: {
                type: 'integer',
                nullable: true,
                default: undefined,
                comment: 'สถานะการขึ้นเงิน 0=รอเคลียร์เช็ค 1=ขึ้นเช็คแล้ว 2=เช็คเด้ง',
                enum: [0, 1, 2]
            },
            details: {
                nullable: true,
                default: undefined,
                type: 'object',
                properties: {},
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }

        }

    },
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ShopCheckCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}




module.exports = { all, byid, add, put }