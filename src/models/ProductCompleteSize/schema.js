
const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            // limit: { type: 'number', default: 10 },
            // page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'code_id', enum: ['code_id', 'complete_size_name.th', 'complete_size_name.en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] }
        }
    },
    tags: ['ProductCompleteSize'],
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
    tags: ['ProductCompleteSize'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const add = {
    body: {
        type: 'object',
        required: ['complete_size_name'],
        properties: {
            code_id: { type: 'string', example: '' },
            complete_size_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            }
        }
    },
    tags: ['ProductCompleteSize'],
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
            complete_size_name: {
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
    tags: ['ProductCompleteSize'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = {
    all, byid, add, put
}