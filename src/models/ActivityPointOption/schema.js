

const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'name.th', enum: ['code', 'name.th', 'name.en'] },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['ActivityPointOption'],
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
    tags: ['ActivityPointOption'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const add = {
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            code: { nullableKey: { type: ['string', ''] }, example: '' },
            name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            upline_levels_add_point: { nullableKey: { type: ['number'] }, example: 0 },
            multiplier_conditions: { nullableKey: { type: ['boolean'] }, example: false },
            config: {
                type: 'object', example: { product_model_id: [] }, items: {
                    product_model_id: {
                        type: 'array', example: [], items: {
                            type: 'string', format: 'uuid'
                        }
                    },
                }
            },

        }
    },
    tags: ['ActivityPointOption'],
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
            code: { nullableKey: { type: ['string', ''] }, example: '' },
            name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            upline_levels_add_point: { nullableKey: { type: ['number'] }, example: 0 },
            multiplier_conditions: { nullableKey: { type: ['boolean'] }, example: false },
            config: {
                type: 'object', example: { product_model_id: [] }, items: {
                    product_model_id: {
                        type: 'array', example: [], items: {
                            type: 'string', format: 'uuid'
                        }
                    },
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
    tags: ['ActivityPointOption'],
    security: [
        {
            "apiKey": []
        }
    ]
}



module.exports = { all, byid, add, put }