
const add = {
    body: {
        type: 'object',
        required: ['third_party_api_name', 'url_api_link',],
        properties: {
            third_party_api_name: {
                type: "string",
                allowNull: false,
                description: "ชื่อเรียก API บุคคลที่สามที่ต้องการเชื่อมต่อ"
            },
            url_api_link: {
                type: "string",
                allowNull: false,
                description: "ลิ้งค์ที่อยู่ของ api บุคคลที่สาม"
            },
            detail: {
                type: "object",
                allowNull: true,
                description: "รายละเอียดข้อมูลของ api"
            },
            sort_order: {
                type: "number",
                allowNull: true,
                description: "ใช้สำหรับจัดเรียง"
            }
        }
    },
    tags: ['ThirdPartyApi'],
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
            third_party_api_name: {
                type: "string",
                description: "ชื่อเรียก API บุคคลที่สามที่ต้องการเชื่อมต่อ"
            },
            url_api_link: {
                type: "string",
                description: "ลิ้งค์ที่อยู่ของ api บุคคลที่สาม"
            },
            detail: {
                type: "object",
                description: "รายละเอียดข้อมูลของ api"
            },
            sort_order: {
                type: "number",
                description: "ใช้สำหรับจัดเรียง"
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
    tags: ['ThirdPartyApi'],
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
            search: { type: 'string', default: '' },
            sort: {
                type: 'string', default: 'sort_order',
                enum: ['sort_order', 'third_party_api_name', 'url_api_link', 'created_date', 'updated_date']
            },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['ThirdPartyApi'],
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
                type: 'string', default: 'sort_order',
                enum: ['sort_order', 'third_party_api_name', 'url_api_link', 'created_date', 'updated_date']
            },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['ThirdPartyApi'],
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
    tags: ['ThirdPartyApi'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = {
    add, all, byid, put, all_raw
}