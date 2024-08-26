
const add = {
    body: {
        type: 'object',
        required: ['product_code', 'product_name'],
        properties: {
            product_code: { type: 'string', example: '' },
            master_path_code_id: { type: 'string', example: '' },
            custom_path_code_id: { type: 'string', example: '' },
            product_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: { type: 'string', example: '' },
                    en: { type: 'string', example: '' }
                }
            },
            product_type_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            product_brand_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            product_model_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            rim_size: { type: 'number', allowNull: true, },
            width: { type: 'number', allowNull: true, },
            hight: { type: 'number', allowNull: true, },
            series: { type: 'number', allowNull: true, },
            load_index: { type: 'number', allowNull: true, },
            speed_index: { type: 'string', example: '' },
            complete_size_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            other_details: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: { type: 'string', example: '' },
                    en: { type: 'string', example: '' }
                }
            },
        }
    },
    tags: ['Product'],
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
            product_code: { nullableKey: { type: ['string', ''] }, example: '' },
            master_path_code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            custom_path_code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            product_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            product_type_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            product_brand_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            product_model_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            rim_size: { nullableKey: { type: ['number', ''] }, example: 0 },
            width: { nullableKey: { type: ['number', ''] }, example: 0 },
            hight: { nullableKey: { type: ['number', ''] }, example: 0 },
            series: { nullableKey: { type: ['number', ''] }, example: 0 },
            load_index: { nullableKey: { type: ['number', ''] }, example: 0 },
            speed_index: { nullableKey: { type: ['string', ''] }, example: '' },
            complete_size_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            other_details: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: { type: 'string', example: '' },
                    en: { type: 'string', example: '' }
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
    tags: ['Product'],
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
            sort: {
                type: 'string', default: 'product_name.th',
                enum: ['product_name.th', 'product_name.en', 'master_path_code_id', 'custom_path_code_id']
            },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Product'],
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
    tags: ['Product'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const file = {
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['file'],
        additionalProperties: false,
        properties: {
            file: {
                isFileType: true,
            }
        },
    },
    tags: ['MatchProduct'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const json = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['rdcode'],
        properties: {
            rdcode: { type: 'string' }
        }
    },
    body: {
        type: 'array', items: {
            type: 'object',
            required: ['สินค้า'],
            properties: {
                สินค้า: { type: 'string', example: '' },
                IDML: { nullableKey: { type: ['string', ''] }, example: "" },
                brand: { nullableKey: { type: ['string', ''] }, example: "MICHELIN" }
            },
        }
    },
    tags: ['MatchProduct'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const export_product = {
    // params: {
    //     required: ['id'],
    //     type: 'object',
    //     properties: {
    //         id: { type: 'string', format: 'uuid' }
    //     }
    // },
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['type_group_id'],
        properties: {
            type_group_id: { type: 'string', format: 'uuid' }
        }
    },

    tags: ['MatchProduct'],
    security: [
        {
            "apiKey": []
        }
    ]
}
module.exports = {
    add, all, byid, put, json, file, export_product
}