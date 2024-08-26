const all_raw = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            sort: { type: 'string', default: 'code_id', enum: ['type_name.th', 'type_name.en', 'code_id', 'internal_code_id'] },
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
            sort: { type: 'string', default: 'code_id', enum: ['type_name.th', 'type_name.en', 'code_id', 'internal_code_id'] },
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
        required: ['type_name', 'type_group_id'],
        properties: {
            internal_code_id: {
                description: 'รหัสควบคุมประเภทหน่วยซื้อ (ภายใน) ',
                type: 'string',
                example: "UT-003"
            },
            type_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            type_group_id: { type: 'string', format: 'uuid' }
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
                description: 'รหัสควบคุมประเภทหน่วยซื้อ (ภายใน) ',
                type: 'string',
                example: "UT-003"
            },
            type_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            type_group_id: { type: 'string', format: 'uuid' },
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
    all, byid, put, add, all_raw
}