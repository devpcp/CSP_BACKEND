const add = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['which'],
        properties: {
            which: { type: 'string', default: 'michelin data', enum: ['michelin data', 'my data'] }
        }
    },
    body: {
        type: 'object',
        required: ['customer_name'],
        properties: {
            master_customer_code_id: { type: 'string', example: '' },
            dealer_customer_code_id: { type: 'string', example: '' },
            bus_type_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            customer_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            tel_no: {
                type: 'object', example: { tel_no_1: '', tel_no_2: '' }, items: {
                    // th: 'string',
                    // en: 'string'
                }
            },
            mobile_no: {
                type: 'object', example: { mobile_no_1: '', mobile_no_2: '' }, items: {
                    // th: 'string',
                    // en: 'string'
                }
            },
            e_mail: { type: 'string', example: '' },
            address: {
                type: 'object', example: { th: 'ที่อยู่', en: '' }, items: {
                    // th: 'string', default: '',
                    // en: 'string', default: ''
                }
            },
            subdistrict_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            district_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            province_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            other_details: {
                type: 'object', example: { contact_name: 'ชื่อติดต่อ', old_ad_code: '', mdm_id: '' }, items: {
                    // contact_name: 'string',
                    // old_ad_code: 'string',
                    // mdm_id: 'string'
                }
            },
            dealer_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                }
            }
        }
    },
    tags: ['Customer'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const put = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['which'],
        properties: {
            which: { type: 'string', default: 'michelin data', enum: ['michelin data', 'my data'] }
        }
    },
    body: {
        type: 'object',
        properties: {
            master_customer_code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            dealer_customer_code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            bus_type_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            customer_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            tel_no: {
                type: 'object', example: { tel_no_1: '', tel_no_2: '' }, items: {
                    // th: 'string',
                    // en: 'string'
                }
            },
            mobile_no: {
                type: 'object', example: { mobile_no_1: '', mobile_no_2: '' }, items: {
                    // th: 'string',
                    // en: 'string'
                }
            },
            e_mail: { nullableKey: { type: ['string', ''] }, example: '' },
            address: {
                type: 'object', example: { th: 'ที่อยู่', en: '' }, items: {
                    // th: 'string', default: '',
                    // en: 'string', default: ''
                }
            },
            subdistrict_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            district_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            province_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            other_details: {
                type: 'object', example: { contact_name: 'ชื่อติดต่อ', old_ad_code: '', mdm_id: '' }, items: {
                    // contact_name: 'string',
                    // old_ad_code: 'string',
                    // mdm_id: 'string'
                }
            },
            dealer_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
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
    tags: ['Customer'],
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
                type: 'string', default: 'customer_name.th', enum: ['customer_name.th', 'customer_name.en',
                    'master_customer_code_id', 'dealer_customer_code_id']
            },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] },
            which: { type: 'string', default: 'michelin data', enum: ['michelin data', 'my data'] }

        }
    },
    tags: ['Customer'],
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
    tags: ['Customer'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = {
    add, all, byid, put
}