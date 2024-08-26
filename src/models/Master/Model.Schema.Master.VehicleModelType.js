const all_raw = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            // limit: { type: 'number', default: 10 },
            // page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'code_id', enum: ['code_id', 'model_name.th', 'model_name.en'] },
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
            vehicle_type_id: { type: 'string', format: 'uuid' },
            vehicles_brand_id: { type: 'string', format: 'uuid' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'code_id', enum: ['code_id', 'model_name.th', 'model_name.en'] },
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
        required: ['model_list', 'vehicles_brand_id'],
        properties: {
            model_list: {
                type: 'array', items: {
                    type: 'object',
                    required: ['model_name'],
                    properties: {
                        code_id: { type: 'string', example: '' },
                        model_name: {
                            type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                                th: 'string',
                                en: 'string'
                            }
                        },
                        vehicle_type_id: { type: 'string', format: 'uuid' }
                    }
                }
            },
            vehicles_brand_id: { type: 'string', format: 'uuid' },

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
        required: ['model_list'],
        properties: {
            model_list: {
                type: 'array', items: {
                    type: 'object',
                    required: ['model_name'],
                    properties: {
                        code_id: { type: 'string', example: '' },
                        model_name: {
                            type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                                th: 'string',
                                en: 'string'
                            }
                        },
                        vehicle_type_id: { type: 'string', format: 'uuid' },
                        status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }
                    }
                }
            }
        }
    },
    params: {
        required: ['vehicles_brand_id'],
        type: 'object',
        properties: {
            vehicles_brand_id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
}



const bytypebrandall = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'sum' },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const bytypebrand = {
    params: {
        required: ['vehicles_brand_id'],
        type: 'object',
        properties: {
            vehicles_brand_id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
}



const checkduplicate = {
    body: {
        type: 'object',
        required: ['model_name'],
        properties: {
            code_id: { type: 'string', default: 'string' },
            model_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            vehicles_brand_id: { type: 'string', format: 'uuid' },
            vehicle_type_id: { type: 'string', format: 'uuid' },
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
    all, all_raw, byid, put, add, bytypebrandall, bytypebrand, checkduplicate
}