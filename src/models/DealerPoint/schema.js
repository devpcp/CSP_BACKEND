const add = {
    body: {
        type: 'object',
        required: ['dealer_id', 'product_id', 'invoice_no'],
        properties: {
            dealer_id: { type: 'string', format: 'uuid' },
            product_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                }
            },
            invoice_no: { type: 'string' }
        }
    },
    tags: ['DealerPoint'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const export_ = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['month'],
        properties: {
            month: { type: 'string' },
            // search: { type: 'string', default: '' },
            // limit: { type: 'number', default: 10 },
            // page: { type: 'number', default: 1 },
            // sort: {
            //     type: 'string', default: 'DealerPoint_name.th',
            //     enum: ['DealerPoint_name.th', 'DealerPoint_name.en', 'master_path_code_id', 'custom_path_code_id']
            // },
            // order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['DealerPoint'],
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
            master_path_code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            custom_path_code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            DealerPoint_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            DealerPoint_type_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            DealerPoint_brand_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            DealerPoint_model_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
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
    tags: ['DealerPoint'],
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
                type: 'string', default: 'master_customer_code_id',
                enum: ['master_customer_code_id', 'dealer_customer_code_id']
            },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            which: { type: 'string', default: 'michelin data', enum: ['michelin data', 'my data'] }
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['DealerPoint'],
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
    tags: ['DealerPoint'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const file = {
    // params: {
    //     required: ['id'],
    //     type: 'object',
    //     properties: {
    //         id: { type: 'string', format: 'uuid' }
    //     }
    // },
    tags: ['MatchDealerPoint'],
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
    tags: ['MatchDealerPoint'],
    security: [
        {
            "apiKey": []
        }
    ]
}

module.exports = {
    add, all, byid, put, json, file, export_
}