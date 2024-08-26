

const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'sort_order', enum: ['sort_order', 'group_name', 'isuse', 'updated_date'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Group'],
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
            sort: { type: 'string', default: 'sort_order', enum: ['sort_order', 'group_name', 'updated_date'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] }
        }
    },
    tags: ['Group'],
    security: [
        {
            "apiKey": []
        }
    ]

}



const add = {
    body: {
        type: 'object',
        required: ['group_name'],
        properties: {
            group_name: { type: 'string', example: '' },
            parent_id: { type: 'string' }
        }
    },
    tags: ['Group'],
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
    tags: ['Group'],
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
            group_name: { type: 'string', example: '' },
            parent_id: { type: 'string' },
            sort_order: { type: 'number', example: '' },
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
    tags: ['Group'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = { all, all_raw, add, byid, put }