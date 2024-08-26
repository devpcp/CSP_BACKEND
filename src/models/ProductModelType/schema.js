

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
            product_type_id: { type: 'string', format: 'uuid' },
            product_brand_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }
        }
    },
    tags: ['ProductModelType'],
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
            sort: { type: 'string', default: 'code_id', enum: ['code_id', 'model_name.th', 'model_name.en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            product_type_id: { type: 'string', format: 'uuid' },
            product_brand_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }
        }
    },
    tags: ['ProductModelType'],
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
            sort: { type: 'string', default: 'sum', enum: ['sum', 'code_id', 'type_name.th', 'type_name.en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
        }
    },
    tags: ['ProductModelType'],
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
            id: { type: 'string', format: 'uuid' },
        }
    },
    tags: ['ProductModelType'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const bytypebrand = {
    params: {
        required: ['product_brand_id'],
        type: 'object',
        properties: {
            // product_type_id: { type: 'string', format: 'uuid' },
            product_brand_id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ProductModelType'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const add = {
    body: {
        type: 'object',
        required: ['model_list', 'product_brand_id'],
        properties: {
            model_list: {
                type: "array", items: {
                    type: 'object',
                    required: ['model_name', 'product_type_id'],
                    properties: {
                        code_id: { type: 'string', example: '' },
                        model_name: {
                            type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                                th: 'string',
                                en: 'string'
                            }
                        },
                        product_type_id: { type: 'string', format: 'uuid' },

                    }

                }
            },
            product_brand_id: { type: 'string', format: 'uuid' }

        }
    },
    tags: ['ProductModelType'],
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
            model_list: {
                type: "array", items: {
                    type: 'object',
                    required: [],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        code_id: { type: 'string', example: '' },
                        model_name: {
                            type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                                th: 'string',
                                en: 'string'
                            }
                        },
                        product_type_id: { type: 'string', format: 'uuid' },
                        status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }
                    }

                }
            },
        }
    },
    params: {
        required: ['product_brand_id'],
        type: 'object',
        properties: {
            // product_type_id: { type: 'string', format: 'uuid' },
            product_brand_id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ProductModelType'],
    security: [
        {
            "apiKey": []
        }
    ]

}



module.exports = { all_raw, all, bytypebrandall, byid, bytypebrand, add, put }