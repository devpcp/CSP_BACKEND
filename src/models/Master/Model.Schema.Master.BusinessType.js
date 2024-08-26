const all_raw = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            sort: { type: 'string', default: 'order_by', enum: ['order_by', 'business_type_name.th', 'business_type_name.en', 'code_id', 'internal_code_id'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }
        }
    },
    tags: ['Master'],
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
            sort: { type: 'string', default: 'order_by', enum: ['order_by', 'business_type_name.th', 'business_type_name.en', 'code_id', 'internal_code_id'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }
        }
    },
    tags: ['Master'],
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
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const add = {
    body: {
        type: 'object',
        required: ['business_type_name'],
        properties: {
            internal_code_id: {
                description: 'รหัสควบคุมประเภทยานพาหนะ (ภายใน)',
                type: 'string',
                default: null,
                example: null
            },
            business_type_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            initial_business_type: {
                type: 'object'
            }
        }
    },
    tags: ['Master'],
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
            business_type_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            initial_business_type: {
                type: 'object'
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
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
}



module.exports = {
    all_raw, all, byid, put, add
}