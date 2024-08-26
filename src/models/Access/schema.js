

const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'sort_order', enum: ['sort_order', 'access_name', 'isuse', 'updated_date'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Access'],
    security: [
        {
            "apiKey": []
        }
    ]

}

const all_raw = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            sort: { type: 'string', default: 'sort_order', enum: ['sort_order', 'access_name', 'isuse', 'updated_date'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] }
        }
    },
    tags: ['Access'],
    security: [
        {
            "apiKey": []
        }
    ]

}



const add = {
    body: {
        type: 'object',
        required: ['access_name'],
        properties: {
            access_name: { type: 'string', example: '' },
            // group_id: { type: 'array', nullableKey: { type: ['array', '[]'] } }
            group_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                }
            }
        }
    },
    tags: ['Access'],
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
    tags: ['Access'],
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
            access_name: { nullableKey: { type: ['string', ''] }, example: '' },
            group_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                }
            },
            sort_order: { nullableKey: { type: ['number', ''] }, example: '' },
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
    tags: ['Access'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = { all, all_raw, add, byid, put }