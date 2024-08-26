const all_raw = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            sort: { type: 'string', default: 'order_by', enum: ['order_by', 'hq_name.th', 'hq_name.en', 'code_id', 'internal_code_id'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }
        }
    },
    tags: ['ShopHQ'],
    security: [
        {
            "apiKey": []
        }
    ]

}
const all = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'order_by', enum: ['order_by', 'hq_name.th', 'hq_name.en', 'code_id', 'internal_code_id'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }
        }
    },
    tags: ['ShopHQ'],
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
    tags: ['ShopHQ'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const add = {
    body: {
        type: 'object',
        required: ['hq_name'],
        properties: {
            internal_code_id: {
                description: 'รหัสควบคุมประเภทยานพาหนะ (ภายใน)',
                type: 'string',
                default: null,
                example: null
            },
            hq_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' },
                items: {
                    th: 'string',
                    en: 'string'
                },
                description: 'ชื่อของ hq',

            },
            user_id: {
                type: 'array',
                description: 'เป็น uuid ของ user',
                default: null,
                items: {
                    type: 'string', format: 'uuid'
                },
            },
            shop_id: {
                type: 'array',
                description: 'เป็น uuid ของ shop, index แรก จะเป็น hq (is_hq = true)',
                default: null,
                items: {
                    type: 'string', format: 'uuid'
                },
            },
            details: {
                type: 'object', example: { data1: '', data2: '' },
                items: {},
                description: 'รายละเอียดเพิ่มเติม',
            }
        }
    },
    tags: ['ShopHQ'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const put = {
    body: {
        type: 'object',
        properties: {
            internal_code_id: {
                ...add.body.properties.internal_code_id,
                nullable: true,
                default: undefined
            },
            hq_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' },
                items: {
                    th: 'string',
                    en: 'string'
                },
                description: 'ชื่อของ hq',

            },
            user_id: {
                type: 'array',
                description: 'เป็น uuid ของ user',
                nullable: true,
                default: null,
                items: {
                    type: 'string', format: 'uuid'
                },
            },
            shop_id: {
                type: 'array',
                description: 'เป็น uuid ของ shop, index แรก จะเป็น hq (is_hq = true)',
                nullable: true,
                default: null,
                items: {
                    type: 'string', format: 'uuid'
                },
            },
            details: {
                type: 'object', example: { data1: '', data2: '' },
                items: {},
                description: 'รายละเอียดเพิ่มเติม',
            },
            order_by: { type: 'number' },
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
    tags: ['ShopHQ'],
    security: [
        {
            "apiKey": []
        }
    ]
}



module.exports = {
    all_raw, all, byid, put, add
}