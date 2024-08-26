
const all = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            bus_customer_id: { type: 'string', format: 'uuid' },
            per_customer_id: { type: 'string', format: 'uuid' },
            bus_partner_id: { type: 'string', format: 'uuid' },
            search: { type: 'string', default: '' },
            limit: {
                type: 'number',
                default: 10
            },
            page: {
                type: 'number',
                default: 1
            },
            sort: {
                type: 'string',
                default: 'created_date'
            },
            order: {
                type: 'string',
                default: 'asc',
                enum: ['asc', 'desc']
            },
            status: {
                type: 'string',
                default: 'default',
                enum: ['default', 'delete', 'active', 'block']
            }
        }
    },
    tags: ['ShopShipAddressCustomer'],
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
    tags: ['ShopShipAddressCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}



const add = {
    body: {
        // type: 'array', items: {
        type: 'object',
        required: ['address_name', 'province_id', 'district_id', 'subdistrict_id'],
        properties: {
            address_name: {
                type: 'object',
                properties: {},
                example: {
                    "th": "xxx",
                    "en": "xxx"
                }
            },
            address: {
                type: 'object',
                properties: {},
                example: {
                    "th": "xxx",
                    "en": "xxx"
                }
            },
            bus_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            per_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            bus_partner_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },

            province_id: { type: 'string', format: 'uuid' },
            district_id: { type: 'string', format: 'uuid' },
            subdistrict_id: { type: 'string', format: 'uuid' },
            details: {
                nullable: true,
                default: {},
                type: 'object', properties: {
                }, example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },

        }

    },
    tags: ['ShopShipAddressCustomer'],
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
            address_name: {
                type: 'object',
                properties: {},
                example: {
                    "th": "xxx",
                    "en": "xxx"
                }
            },
            address: {
                type: 'object',
                properties: {},
                example: {
                    "th": "xxx",
                    "en": "xxx"
                }
            },
            bus_customer_id: { type: 'string', format: 'uuid', nullable: true, comment: 'บังคับใส่อย่างใดอย่างหนึ่ง' },
            per_customer_id: { type: 'string', format: 'uuid', nullable: true, comment: 'บังคับใส่อย่างใดอย่างหนึ่ง' },
            bus_partner_id: { type: 'string', format: 'uuid', nullable: true, comment: 'บังคับใส่อย่างใดอย่างหนึ่ง' },
            province_id: { type: 'string', format: 'uuid' },
            district_id: { type: 'string', format: 'uuid' },
            subdistrict_id: { type: 'string', format: 'uuid' },
            details: {
                nullable: true,
                default: {},
                type: 'object',
                properties: {},
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
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
    tags: ['ShopShipAddressCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}




module.exports = { all, byid, add, put }