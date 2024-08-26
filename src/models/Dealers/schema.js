const add = {
    body: {
        type: 'object',
        required: ['dealer_name'],
        properties: {
            master_dealer_code_id: { type: 'string', example: '' },
            dealer_code_id: { type: 'string', example: '' },
            bus_type_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            dealer_name: {
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
                type: 'object', items: {
                    th: 'string', default: '',
                    en: 'string', default: ''
                }
            },
            subdistrict_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            district_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            province_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            sync_api_config: {
                type: 'object', items: {
                    // th: 'string', example: '',
                    // en: 'string', example: ''
                }
            },
            user_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' }
        }
    },
    tags: ['Dealers'],
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
            master_dealer_code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            dealer_code_id: { nullableKey: { type: ['string', ''] }, example: '' },
            bus_type_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            dealer_name: {
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
                type: 'object', items: {
                    th: 'string', example: '',
                    en: 'string', example: ''
                }
            },
            subdistrict_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            district_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            province_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            sync_api_config: {
                type: 'object', items: {
                    // th: 'string', example: '',
                    // en: 'string', example: ''
                }
            },
            user_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
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
    tags: ['Dealers'],
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
            sort: { type: 'string', default: 'dealer_name.th', enum: ['dealer_name.th', 'dealer_name.en'] },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] },
            which: { type: 'string', default: 'michelin data', enum: ['michelin data', 'my data'] }


        }
    },
    tags: ['Dealers'],
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
    tags: ['Dealers'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = {
    add, all, byid, put
}