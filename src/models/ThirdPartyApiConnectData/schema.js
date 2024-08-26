const add = {
    body: {
        type: 'object',
        required: ['shop_id'],
        properties: {
            shop_id: {
                type: "string",
                format: "uuid",
                allowNull: false,
                description: "รหัสเชื่อมตารางตัวแทน"
            },
            api_key: {
                type: "string",
                allowNull: true,
                description: "Key สำหรับเชื่อม API"
            },
            auth_username: {
                type: "string",
                allowNull: true,
                description: "ชื่อผู้ใช้สำหรับเข้าถึง API"
            },
            auth_password: {
                type: "string",
                allowNull: true,
                description: "รหัสผ่านสำหรับเข้าถึง API"
            },
            auth_oauth: {
                type: "object",
                allowNull: true,
                description: "เก็บข้อมูล Oauth"
            },
            third_party_sys_id: {
                type: "string",
                format: "uuid",
                allowNull: true,
                description: "รหัสตารางข้อมูลการเชื่อนต่อ API บุคคลที่ 3"
            }
        }
    },
    tags: ['ThirdPartyApiConnectData'],
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
            shop_id: {
                type: "string",
                format: "uuid",
                description: "รหัสเชื่อมตารางตัวแทน"
            },
            api_key: {
                type: "string",
                description: "Key สำหรับเชื่อม API"
            },
            auth_username: {
                type: "string",
                description: "ชื่อผู้ใช้สำหรับเข้าถึง API"
            },
            auth_password: {
                type: "string",
                description: "รหัสผ่านสำหรับเข้าถึง API"
            },
            auth_oauth: {
                type: "object",
                description: "เก็บข้อมูล Oauth"
            },
            third_party_sys_id: {
                type: "string",
                description: "รหัสตารางข้อมูลการเชื่อนต่อ API บุคคลที่ 3 ถ้าจะอัพเดทให้เป็น null ให้ส่ง false"
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
    tags: ['ThirdPartyApiConnectData'],
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
                type: 'string', default: 'created_date',
                enum: ['shop_name.th', 'shop_name.en', 'api_key', 'auth_username', 'auth_password', 'created_date']
            },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['ThirdPartyApiConnectData'],
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
                type: 'string', default: 'created_date',
                enum: ['shop_name.th', 'shop_name.en', 'api_key', 'auth_username', 'auth_password', 'created_date']
            },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['ThirdPartyApiConnectData'],
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
    tags: ['ThirdPartyApiConnectData'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const test_connect = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ThirdPartyApiConnectData'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = {
    add, all, byid, put, all_raw, test_connect
}