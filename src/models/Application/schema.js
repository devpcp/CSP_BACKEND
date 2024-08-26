

const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'sort_order', enum: ['sort_order', 'application_name', 'use_menu', 'updated_date'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'inactive', 'active'] }

        }
    },
    tags: ['Application'],
    security: [
        {
            "apiKey": []
        }
    ]

}




const add = {
    body: {
        type: 'object',
        required: ['application_name'],
        properties: {
            application_name: {
                type: 'object',
                properties: {
                    th: { type: 'string', },
                    en: { type: 'string', },
                },
            },
            url: { type: 'string', example: '' },
            access: { type: 'string', format: 'uuid' },
            parent_menu: { type: 'string' },
            func_status: { type: 'number', example: 1 },
            use_menu: { type: 'boolean', example: true },
            application_config: { type: 'string' },
            isuse: {
                type: 'string',
                enum: ['default', 'block', 'active', 'delete'],
                default: 'default',
            }
        }
    },
    tags: ['Application'],
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
    tags: ['Application'],
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
            application_name: { nullableKey: { type: ['string', ''] }, example: '' },
            url: { nullableKey: { type: ['string', ''] }, example: '' },
            access: { nullableKey: { type: ['string', ''] }, format: 'uuid' },
            parent_menu: { type: 'string' },
            func_status: { nullableKey: { type: ['number', ''] }, example: '' },
            application_config: { nullableKey: { type: ['string', ''] } },
            sort_order: { nullableKey: { type: ['number', ''] }, example: '' },
            Access_role: {
                type: 'array', items: {
                    type: 'object',
                    properties: {
                        id: { nullableKey: { type: ['string', ''] }, format: 'uuid' },
                        create: { nullableKey: { type: ['number', ''] }, enum: [0, 1] },
                        read: { nullableKey: { type: ['number', ''] }, enum: [0, 1] },
                        update: { nullableKey: { type: ['number', ''] }, enum: [0, 1] },
                        delete: { nullableKey: { type: ['number', ''] }, enum: [0, 1] }
                    },
                }
            },
            status: { nullableKey: { type: ['string', ''] }, enum: ['active', 'inactive'], description: 'active,inactive' },
            isuse: {
                type: 'string',
                enum: ['default', 'block', 'active', 'delete'],
                default: 'default',
            }
        }

    },
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['Application'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const sort = {
    body: {

        type: 'array', items: {
            type: 'object',
            required: ['id', 'sort_order'],
            properties: {
                id: { type: 'string', format: 'uuid' },
                sort_order: { type: 'number', example: 1 }

            },
        }
    },
    tags: ['Application'],
    security: [
        {
            "apiKey": []
        }
    ]
}

module.exports = { all, add, byid, put, sort }