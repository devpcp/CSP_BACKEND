/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/validators/user
 */
const user = {
    description: `ตรวจสอบข้อมูลประเภท User \- โดยจะต้องมีรายการค้นหา อย่างน้อย 1 รายการ`,
    querystring: {
        type: 'object',
        additionalProperties: false,
        anyOf: [
            {
                required: ['user_name']
            },
            {
                required: ['e_mail']
            }
        ],
        properties: {
            user_name: {
                description: 'ตรวจสอบ Username',
                type: 'string',
                nullable: true,
                default: undefined
            },
            e_mail: {
                description: 'ตรวจสอบ Email',
                type: 'string',
                format: 'email',
                nullable: true,
                default: undefined
            },
        }
    },
    tags: ['Validators'],
    security: [
        {
            'apiKey': []
        }
    ]
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/validators/sub-domain
 */
const sub_domain = {
    description: `ตรวจสอบข้อมูล Sub Domain เพื่อใช้งานในการทำระบบ Sub Domain ในการเข้าใจงาน Application`,
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['sub_domain_name'],
        properties: {
            sub_domain_name: {
                description: 'ตรวจสอบชื่อ Sub Domain',
                type: 'string',
                nullable: false
            }
        }
    },
    tags: ['Validators'],
    security: [
        {
            'apiKey': []
        }
    ]
};


module.exports = {
    user,
    sub_domain,
};