const all_raw = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            sort: { type: 'string', default: 'code_id', enum: ['bank_name.th', 'bank_name.en', 'code_id'] },
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
            sort: { type: 'string', default: 'code_id', enum: ['bank_name.th', 'bank_name.en', 'code_id'] },
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
        required: ['bank_name'],
        properties: {
            code_id: { type: 'string', example: '' },
            bank_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
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
            code_id: { type: 'string', example: '' },
            bank_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
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