
const mydata = {
    tags: ['User'],
    security: [
        {
            "apiKey": []
        }
    ]
}
const logout = {
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const oauth = {
    description: 'ขอสิทธิ์การเข้าใช้ระบบ ผ่านรูปแบบ OAuth',
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['response_type', 'client_id', 'redirect_uri'],
        properties: {
            response_type: {
                type: 'string',
                enum: ["code"],
                nullable: false,
                description: 'ต้องใส่ค่า \"code\" เข้าไปเท่านั้น',
                example: "code"
            },
            client_id: {
                type: 'string',
                nullable: false,
                description: 'ค่า uuid ของ \"client_id\" สำหรับเข้าใช้',
                example: "5f4c26f2-d9e6-4e74-b559-4c66e851f4ec"
            },
            redirect_uri: {
                type: 'string',
                nullable: false,
                description: 'เมื่อ OAuth สำเร็จ จะให้ระบบ Redirect URL ไปที่ URL ที่กำหนดในค่าตัวนนี้',
                example: "http://localhost:5001"
            },
            scope: {
                type: 'string',
                description: "จะทำให้ระบบออก Token ที่ตาม Role (scope) ของระบบที่จะออกให้ได้ \n- ตอนนี้ไม่ต้องใส่",
                nullable: true,
                default: '',
                example: '',
            },
        }
    },
    tags: ['Auth']
}

const token = {
    description: 'ขอ Access/Refresh Token ที่มีการเข้าใช้ระบบ ผ่านรูปแบบ OAuth',
    body: {
        type: 'object',
        required: ['grant_type', 'client_id', 'client_secret'],
        properties: {
            grant_type: {
                type: 'string',
                enum: ['authorization_code', 'refresh_token', 'client_credentials'],
                example: 'authorization_code',
            },
            code: {
                type: 'string',
                description: 'จะบังคับใส่ เมื่อ \"grant_type\" เป็น \"authorization_code\"',
                example: 'string'
            },
            client_id: {
                type: 'string',
                format: 'uuid',
                description: 'ค่า Client ID ที่เคยลงทะเบียน OAuth ไว้',
                example: 'UUID'
            },
            client_secret: {
                type: 'string',
                description: 'ค่า Password ของ Client ID ที่เคยลงทะเบียน OAuth ไว้',
                example: 'string'
            },
            refresh_token: {
                type: 'string',
                description: 'จะบังคับใส่ เมื่อ \"grant_type\" เป็น \"refresh_token\"',
                example: 'string'
            }
        }
    },
    tags: ['Auth']
}

const register_oauth = {
    body: {
        type: 'object',
        required: ['user_id', 'client_secret'],
        properties: {
            user_id: { type: 'string', format: 'uuid' },
            client_secret: { type: 'string' },
            site_whitelist: { type: 'string', example: 'localhost:4000' }
        }
    },
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const refresh = {
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]
}
const login = {
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            user_name: { type: 'string', example: 'devfik' },
            password: { type: 'string', example: '12345678' }
        }
    },
    tags: ['Auth']

}

/**
 * A swagger and fastify (AJV.js) validator schema for
 * Route [POST] => /api/user/register
 */
const register = {
    body: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        required: [
            'user_data',
            'user_profile_data',
            'shop_profile_data'
        ],
        properties: {
            user_data: {
                type: 'object',
                nullable: false,
                required: ['user_name', 'password', 'e_mail', 'open_id'],
                properties: {
                    user_name: {
                        type: 'string',
                        nullable: false,
                        comment: 'ชื่อผู้ใช้เข้าระบบ',
                        example: "ms.tidapon"
                    },
                    password: {
                        type: 'string',
                        nullable: false,
                        comment: 'รหัสผ่านเข้าระบบ',
                        example: "everyone$Like$NooRat%ButNotHelen"
                    },
                    e_mail: {
                        type: 'string',
                        format: 'email',
                        nullable: false,
                        comment: 'e-mail ผู้ใช้งานระบบ',
                        example: "tidapon.c@gmail.com",
                    },
                    open_id: {
                        type: 'string',
                        nullable: true,
                        comment: 'user_id ของระบบ Open ID',
                        example: null
                    }
                },
            },
            user_profile_data: {
                type: 'object',
                nullable: false,
                required: ['name_title', 'fname', 'lname', 'id_code', 'tel', 'mobile', 'address', 'subdistrict_id', 'district_id', 'province_id'],
                properties: {
                    name_title: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: "คำนำหน้าชื่อ",
                        example: null
                    },
                    fname: {
                        type: 'object',
                        nullable: false,
                        properties: {
                            th: {
                                type: 'string',
                                nullable: true,
                                example: 'ธิดาพร'
                            },
                            en: {
                                type: 'string',
                                nullable: true,
                                example: 'Tidapon'
                            },
                        },
                        comment: 'ชื่อ เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}'
                    },
                    lname: {
                        type: 'object',
                        nullable: false,
                        properties: {
                            th: {
                                type: 'string',
                                nullable: true,
                                example: 'ชาวคูเวียง'
                            },
                            en: {
                                type: 'string',
                                nullable: true,
                                example: 'Chaokuweing'
                            },
                        },
                        comment: 'นามสกุล เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}'
                    },
                    id_code: {
                        type: 'string',
                        nullable: true,
                        comment: 'รหัสบัตรประชาชน',
                        example: '0941122452844'
                    },
                    tel: {
                        type: 'string',
                        nullable: true,
                        comment: 'หมายเลขโทรศัพท์พื้นฐาน',
                        example: '074414571'
                    },
                    mobile: {
                        type: 'string',
                        nullable: true,
                        comment: 'หมายเลขโทรศัพท์พื้นฐาน',
                        example: '0941114712'
                    },
                    address: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            th: {
                                type: 'string',
                                nullable: true,
                                example: 'เลขที่ 500 ถนนวิภาวดี'
                            },
                            en: {
                                type: 'string',
                                nullable: true,
                                example: 'Number 500, Wipavadee St.'
                            },
                        },
                        comment: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}',
                    },
                    subdistrict_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: 'รหัสตำบล',
                        example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
                    },
                    district_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: 'รหัสอำเภอ',
                        example: null
                    },
                    province_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: 'รหัสจังหวัด',
                        example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
                    }
                }
            },
            shop_profile_data: {
                type: 'object',
                nullable: false,
                required: ['tax_code_id', 'bus_type_id', 'shop_name', 'tel_no', 'mobile_no', 'e_mail', 'address', 'subdistrict_id', 'district_id', 'province_id', 'domain_name'],
                properties: {
                    tax_code_id: {
                        type: 'string',
                        nullable: true,
                        comment: 'เลขภาษี',
                        example: '4525845456451'
                    },
                    bus_type_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: 'รหัสประเภทธุรกิจ',
                        example: null
                    },
                    shop_name: {
                        type: 'object',
                        nullable: false,
                        properties: {
                            th: {
                                type: 'string',
                                nullable: false,
                                example: 'หนูรัตน์ ช๊อป'
                            },
                            en: {
                                type: 'string',
                                nullable: false,
                                example: 'NooRat Shop'
                            }
                        },
                        comment: 'ชื่อตัวแทนจำหน่าย เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}'
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
                        comment: 'เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}'
                    },
                    mobile_no: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            mobile_no_1: {
                                type: 'string',
                                nullable: true,
                                example: '0854431244'
                            }
                        },
                        comment: 'เบอร์โทรศัพท์มือถือ เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}'
                    },
                    e_mail: {
                        type: 'string',
                        format: 'email',
                        nullable: true,
                        comment: 'e-mail',
                        example: null
                    },
                    address: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            th: {
                                type: 'string',
                                nullable: true,
                                example: 'บ้านเลขที่ 500'
                            },
                            en: {
                                type: 'string',
                                nullable: true,
                                example: 'House Number 500'
                            }
                        },
                        comment: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}'
                    },
                    subdistrict_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: 'รหัสตำบล',
                        example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
                    },
                    district_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: 'รหัสอำเภอ',
                        example: null
                    },
                    province_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: 'รหัสจังหวัด',
                        example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
                    },
                    domain_name: {
                        type: 'object',
                        nullable: false,
                        description: 'เก็บชื่อ Domain และ SubDomain เป็น JSON',
                        properties: {
                            domain_name: {
                                type: 'string',
                                nullable: false,
                                description: 'ชื่อ Domain',
                                default: null,
                                example: 'example.com'
                            },
                            sub_domain_name: {
                                type: 'string',
                                nullable: false,
                                description: 'ชื่อ Sub Domain',
                                default: null,
                                example: 'sub-domain.example.com'
                            },
                            changed: {
                                type: 'string',
                                enum: ['0', '1'],
                                description: 'สถานะการเปลี่ยนแปลงข้อมูล Sub Domain \n- "0" = ไม่เปลี่ยนแปลง\n- "1" = เปลี่ยนแปลง',
                                default: 0,
                                example: false
                            }
                        }
                    },
                },
            },
        }
    },
    tags: ['User'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const add = {
    body: {
        type: 'object',
        required: ['user_name', 'password'],
        properties: {
            user_name: { type: 'string', example: '' },
            password: { type: 'string', example: '' },
            e_mail: { nullableKey: { type: ['string', ''] }, format: 'email' },
            note: { nullableKey: { type: ['string', 'null'] } },
            // group_id: { nullableKey: { type: ['array', []] }, format: 'uuid' },
            group_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                }
            }

        }
    },
    tags: ['User'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const put = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    body: {
        type: 'object',
        properties: {
            user_name: { nullableKey: { type: ['string', ''] }, example: '' },
            password: { nullableKey: { type: ['string', ''] }, example: '' },
            e_mail: { nullableKey: { type: ['string', ''] }, format: 'email' },
            note: { nullableKey: { type: ['string', 'null'] }, example: '' },
            // group_id: { nullableKey: { type: ['string', 'null'] } },
            group_id: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                }
            },
            status: { nullableKey: { type: ['string', ''] }, enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' },
            user_profile_data: {
                type: 'object',
                additionalProperties: false,
                nullable: true,
                default: undefined,
                properties: {
                    name_title: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        default: undefined,
                        comment: "คำนำหน้าชื่อ",
                        example: null
                    },
                    fname: {
                        type: 'object',
                        nullable: true,
                        default: undefined,
                        properties: {
                            th: {
                                type: 'string',
                                nullable: true,
                                example: 'ธิดาพร'
                            },
                            en: {
                                type: 'string',
                                nullable: true,
                                example: 'Tidapon'
                            },
                        },
                        comment: 'ชื่อ เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}'
                    },
                    lname: {
                        type: 'object',
                        nullable: true,
                        default: undefined,
                        properties: {
                            th: {
                                type: 'string',
                                nullable: true,
                                example: 'ชาวคูเวียง'
                            },
                            en: {
                                type: 'string',
                                nullable: true,
                                example: 'Chaokuweing'
                            },
                        },
                        comment: 'นามสกุล เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}'
                    },
                    id_code: {
                        type: 'string',
                        nullable: true,
                        default: undefined,
                        comment: 'รหัสบัตรประชาชน',
                        example: '0941122452844'
                    },
                    tel: {
                        type: 'string',
                        nullable: true,
                        default: undefined,
                        comment: 'หมายเลขโทรศัพท์พื้นฐาน',
                        example: '074414571'
                    },
                    mobile: {
                        type: 'string',
                        nullable: true,
                        comment: 'หมายเลขโทรศัพท์พื้นฐาน',
                        example: '0941114712'
                    },
                    address: {
                        type: 'object',
                        nullable: true,
                        default: undefined,
                        properties: {
                            th: {
                                type: 'string',
                                nullable: true,
                                example: 'เลขที่ 500 ถนนวิภาวดี'
                            },
                            en: {
                                type: 'string',
                                nullable: true,
                                example: 'Number 500, Wipavadee St.'
                            },
                        },
                        comment: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}',
                    },
                    subdistrict_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        default: undefined,
                        comment: 'รหัสตำบล',
                        example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
                    },
                    district_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        comment: 'รหัสอำเภอ',
                        example: null
                    },
                    province_id: {
                        type: 'string',
                        format: 'uuid',
                        nullable: true,
                        default: undefined,
                        comment: 'รหัสจังหวัด',
                        example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
                    },
                    status: {
                        type: 'string',
                        nullable: false,
                        default: undefined,
                        enum: ['default', 'block', 'active', 'delete'],
                        description: 'สถานะการใช้งานข้อมูล (block=ยกเลิกการใช้งานข้อมูล , active=ใช้งานข้อมูล , delete=ลบข้อมูลลงถังขยะ)',
                        example: 'default'
                    }
                }
            },
        }

    },
    tags: ['User'],
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
            sort: { type: 'string', default: 'user_name', enum: ['user_name', 'e_mail', 'note', 'status', 'updated_date', 'last_login'] },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] },
            selectInAuth: { type: 'boolean', default: false, enum: [false, true] }
        }
    },
    tags: ['User'],
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
    tags: ['User'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const OauthAll = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'site_whitelist', enum: ['site_whitelist', 'created_date'] },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]

}

const OauthById = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const OauthPut = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    body: {
        type: 'object',
        properties: {
            user_id: { type: 'string', format: 'uuid' },
            client_secret: { type: 'string' },
            site_whitelist: { type: 'string', example: 'localhost:4000' },
            status: { nullableKey: { type: ['string', ''] }, enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }

        }
    },
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const OAuthLine = {
    description: 'ทำ OAuth LINE Login',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            redirect_uri: {
                description: 'Redirect URI ไปยังหน้าอื่น เมื่อทำงานเสร็จแล้ว',
                type: 'string',
                nullable: true,
                default: null
            }
        }
    },
    tags: ['Auth'],
};

const OauthLineCallback = {
    description: 'สำหรับรับ Callback จาก OAuth LINE Login',
    querystring: {
        type: 'object',
        additionalProperties: false,
        anyOf: [
            {
                required: ['code', 'state'],
            },
            {
                required: ['error', 'error_description', 'state'],
            }
        ],
        properties: {
            code: { type: 'string' },
            state: { type: 'string', format: 'uuid' },
            error: { type: 'string' },
            error_description: { type: 'string' },
        }
    },
    tags: ['Auth'],
    security: [
        {
            "apiKey": []
        }
    ]
};
const line_profile = {
    params: {
        required: ['user_line_id'],
        type: 'object',
        properties: {
            user_line_id: { type: 'string' }
        }
    },
    tags: ['User'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const line_notify = {
    tags: ['User'],
    body: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'test' },

        }
    },
    security: [
        {
            "apiKey": []
        }
    ]
}

const line_message = {
    tags: ['User'],
    body: {
        type: 'object',
        required: ['messages'],
        properties: {
            messages: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['type', 'text'],
                    properties: {
                        type: { type: 'string', example: 'text' },
                        text: { type: 'string', example: 'ssss' }
                    }
                }
            }

        }
    },
    params: {
        required: ['line_user_id'],
        type: 'object',
        properties: {
            line_user_id: { type: 'string' }
        }
    },
    security: [
        {
            "apiKey": []
        }
    ]
}

module.exports = {
    register, add, all, login, put, byid, mydata, refresh,
    register_oauth, token, logout, OauthAll, OauthById, OauthPut, oauth,
    OAuthLine, OauthLineCallback, line_profile, line_notify, line_message
}