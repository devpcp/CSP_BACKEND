const select_shop_ids = {
    description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- ถ้าเอาทุก Branch ที่มีให้ใส่ all \n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
    type: 'string',
    nullable: true,
    default: ''
};

const add = {
    body: {
        type: 'object',
        required: ['user_name', 'password', 'user_profile_data'],
        properties: {
            user_name: { type: 'string', example: '' },
            password: { type: 'string', example: '' },
            e_mail: { type: 'string', format: 'email' },
            note: { type: 'string' },
            department_id: {
                type: 'array',
                description: 'เป็น uuid ของ แผนก',
                nullable: true,
                default: undefined,
                items: {
                    type: 'string', format: 'uuid'
                },
            },
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
                    details: {
                        type: 'object',
                        nullable: true,
                        default: undefined,
                        comment: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา Ex. {"code":0011, "data1":"...."}',
                    }
                }
            },

        }
    },
    tags: ['ShopUser'],
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
            user_name: { type: 'string', example: '' },
            password: { type: 'string', example: '' },
            e_mail: { type: 'string', format: 'email' },
            note: { type: 'string', example: '' },
            status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' },
            department_id: {
                type: 'array',
                description: 'เป็น uuid ของ แผนก ถ้าจะลบการผูก []',
                nullable: true,
                default: undefined,
                items: {
                    type: 'string', format: 'uuid'
                },
            },
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
                    details: {
                        type: 'object',
                        nullable: true,
                        default: undefined,
                        comment: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา Ex. {"code":0011, "data1":"...."}',
                    }
                }
            },
        }

    },
    tags: ['ShopUser'],
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
            select_shop_ids,
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'user_name', enum: ['user_name', 'e_mail', 'note', 'status', 'updated_date', 'last_login'] },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] },
            selectInAuth: { type: 'boolean', default: false, enum: [false, true] },
            department_id: {
                minItems: 1,
                type: 'array',
                items: {
                    type: 'string', format: 'uuid'
                },
                collectionFormat: "multi", // <== HERE IT IS!
            },
        }
    },
    tags: ['ShopUser'],
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
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
        }
    },
    tags: ['ShopUser'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = {
    add, all, put, byid
}