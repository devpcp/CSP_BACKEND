

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
    tags: ['ActivityPoint'],
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
    tags: ['ActivityPoint'],
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
            point: { nullableKey: { type: ['number'] }, example: 0 },
            multiplier: { nullableKey: { type: ['number'] }, example: 0 },
            activity_points_options_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                }
            },
            start_activity_date: { nullableKey: { type: ['string'] }, example: '20190503' },
            end_activity_date: { nullableKey: { type: ['string'] }, example: '20190503' },
        }
    },
    tags: ['ActivityPoint'],
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
            point: { nullableKey: { type: ['number'] }, example: 0 },
            multiplier: { nullableKey: { type: ['number'] }, example: 0 },
            activity_points_options_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                }
            },
            start_activity_date: { nullableKey: { type: ['string'] }, example: '20190503' },
            end_activity_date: { nullableKey: { type: ['string'] }, example: '20190503' },
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
    tags: ['ActivityPoint'],
    security: [
        {
            "apiKey": []
        }
    ]
}



module.exports = { all, byid, add, put }