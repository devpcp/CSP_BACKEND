const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            // limit: { type: 'number', default: 10 },
            // page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'code_id', enum: ['code_id', 'brand_name.th', 'brand_name.en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] }
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['ProductBrand'],
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
    tags: ['ProductBrand'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const add = {
    body: {
        type: 'object',
        required: ['brand_name'],
        properties: {
            code_id: { type: 'string', example: '' },
            brand_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            }
        }
    },
    tags: ['ProductBrand'],
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
            brand_name: {
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
    tags: ['ProductBrand'],
    security: [
        {
            "apiKey": []
        }
    ]
}



module.exports = {
    all, byid, put, add
}