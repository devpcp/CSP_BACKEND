
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
    tags: ['ShopContactCustomer'],
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
    tags: ['ShopContactCustomer'],
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
        required: ['contact_name'],
        properties: {
            contact_name: {
                type: 'object',
                properties: {},
                example: {
                    "th": "xxx",
                    "en": "xxx"
                }
            },
            tel_no: {
                type: 'object',
                nullable: true,
                properties: {
                    tel_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '024412455'
                    }
                },
                default: null,
                description: 'เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                example: {
                    "tel_no_1": "024412455",
                    "tel_no_2": "024454712",
                    "tel_no_3": "072121541"
                }
            },
            department: {
                type: 'string',
                nullable: true,
                default: null,
                comment: 'ชื่อแผนก'
            },
            position: {
                type: 'string',
                nullable: true,
                default: null,
                comment: 'ชื่อตำแหน่ง'
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
    tags: ['ShopContactCustomer'],
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
            contact_name: {
                type: 'object',
                properties: {},
                example: {
                    "th": "xxx",
                    "en": "xxx"
                }
            },
            tel_no: {
                type: 'object',
                nullable: true,
                default: undefined,
                properties: {
                    tel_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '024412455'
                    }
                },
                description: 'เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                example: {
                    "tel_no_1": "024412455"
                }
            },
            department: {
                type: 'string',
                nullable: true,
                comment: 'ชื่อแผนก'
            },
            position: {
                type: 'string',
                nullable: true,
                comment: 'ชื่อตำแหน่ง'
            },
            bus_customer_id: { type: 'string', format: 'uuid', nullable: true, comment: 'บังคับใส่อย่างใดอย่างหนึ่ง' },
            per_customer_id: { type: 'string', format: 'uuid', nullable: true, comment: 'บังคับใส่อย่างใดอย่างหนึ่ง' },
            bus_partner_id: { type: 'string', format: 'uuid', nullable: true, comment: 'บังคับใส่อย่างใดอย่างหนึ่ง' },
            details: {
                nullable: true,
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
    tags: ['ShopContactCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}




module.exports = { all, byid, add, put }