

const all = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'code_id', enum: ['code_id', 'type_name.th', 'type_name.en', 'created_date', 'updated_date'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            type_group_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }
        }
    },
    tags: ['ProductType'],
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
    tags: ['ProductType'],
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
            code_id: { type: 'string', example: '' },
            type_group_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            type_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            }
        }
    },
    tags: ['ProductType'],
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
            code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            type_group_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            type_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            status: { nullableKey: { type: ['string', ''] }, enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }

        }
    },
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ProductType'],
    security: [
        {
            "apiKey": []
        }
    ]
}



module.exports = { all, byid, add, put }