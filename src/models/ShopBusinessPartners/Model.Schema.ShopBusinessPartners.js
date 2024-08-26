const select_shop_ids = {
    description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- ถ้าเอาทุก Branch ที่มีให้ใส่ all \n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
    type: 'string',
    nullable: true,
    default: ''
};

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopBusinessPartners/add
 */
const add = {
    description: `เพิ่ม ชุดข้อมูลไปยัง "ตารางธุรกิจคู่ค้า" (ShopBusinessPartners)`,
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['partner_name'],
        properties: {
            tax_type_id: {
                description: 'ประเภทภาษี (ไม่สำหรับทำ Default ประเภทภาษี)',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            tax_id: {
                description: 'รหัสภาษีธุรกิจ',
                type: 'string',
                nullable: true,
                default: null,
                example: null
            },
            bus_type_id: {
                description: 'รหัสประเภทธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            partner_name: {
                description: 'ชื่อลูกค้า เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: false,
                properties: {
                    th: {
                        type: 'string',
                        nullable: false,
                        example: 'พระมหาเทวีเจ้า แห่งเมืองทิพย์'
                    },
                    en: {
                        type: 'string',
                        nullable: true,
                        example: 'Pramahataweejao Hangmuengtip'
                    }
                }
            },
            tel_no: {
                description: 'เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                type: 'object',
                nullable: true,
                default: null,
                properties: {
                    tel_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '024412455'
                    },
                    tel_no_2: {
                        type: 'string',
                        nullable: true,
                        example: '024454712'
                    }
                }
            },
            mobile_no: {
                description: 'เบอร์โทรศัพท์มือถือ  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                type: 'object',
                nullable: true,
                default: null,
                properties: {
                    mobile_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '0854431244'
                    }
                }
            },
            e_mail: {
                description: 'e-mail',
                type: 'string',
                format: 'email',
                nullable: true,
                default: null,
                example: 'pramahataweejao.tip@gmail.com'
            },
            address: {
                description: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: true,
                default: null,
                properties: {
                    th: {
                        type: 'string',
                        nullable: false,
                        example: 'เลขที่ 500'
                    },
                    en: {
                        type: 'string',
                        nullable: true,
                        example: 'House Number 500'
                    }
                }
            },
            subdistrict_id: {
                description: 'รหัสตำบล',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
            },
            district_id: {
                description: 'รหัสอำเภอ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            province_id: {
                description: 'รหัสจังหวัด',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
            },
            other_details: {
                description: 'รายละเอียดอื่นๆ เพิ่มเติมเก็บเป็น  Json',
                type: 'object',
                nullable: true,
                default: null,
                example: null
            }
        }
    },
    tags: ['ShopBusinessPartners'],
    security: [
        {
            'apiKey': []
        }
    ]
};
/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopBusinessCustomers/addByFile
 */
const add_by_file = {
    description: `เพิ่ม ด้วยไฟล์ xlsx ชุดข้อมูลไปยัง "ตารางลูกค้าภายใต้ร้านค้า" (ShopBusinessPartners)`,
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['file'],
        additionalProperties: false,
        properties: {
            file: {
                isFileType: true,
            }
        },
    },
    // params: {
    //     required: ['id'],
    //     type: 'object',
    //     properties: {
    //         id: { type: 'string', format: 'uuid' }
    //     }
    // },
    tags: ['ShopBusinessPartners'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopBusinessPartners/all
 */
const all = {
    description: `แสดงข้อมูลของ "ตารางธุรกิจคู่ค้า" (ShopBusinessPartners)`,
    querystring: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        properties: {
            select_shop_ids,
            search: {
                type: 'string',
                default: '',
                description: 'สิ่งที่ต้องกาค้นหา'
            },
            limit: {
                type: 'number',
                default: 10,
                description: 'จำนวนชุดข้อมูลที่จะแสดงผล'
            },
            page: {
                type: 'number',
                default: 1,
                description: 'แสดงผลในหน้าที่กำหนด'
            },
            sort: {
                type: 'string',
                enum: ['partner_name.th', 'partner_name.en'],
                default: 'partner_name.th',
                description: 'เรียงข้อมูลจากฟิวส์...'
            },
            order: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc',
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด'
            },
            status: {
                type: 'string',
                enum: ['default', 'active', 'block', 'delete'],
                default: 'default',
                description: 'สถาณะชุดข้อมูล \n- default: ไม่ต้องการค้นหาในส่วนนี้ \n- block: ยกเลิกการใช้งานข้อมูล (0) \n- active: ใช้งานข้อมูล (1) \n- delete: ลบข้อมูลลงถังขยะ (2)'
            },
            "jsonField.tel_no": {
                type: 'string',
                nullable: true,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาฟิวส์ JSON "tel_no" โดยให้ใส่ค่า Key ภายในฟิวส์ JSON ดังกล่าวไป\n- example: "tel_no_1"\n- example: "tel_no_1,"\n- example: "tel_no_1,tel_no_2"`
            },
            "jsonField.mobile_no": {
                type: 'string',
                nullable: true,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาฟิวส์ JSON "mobile_no" โดยให้ใส่ค่า Key ภายในฟิวส์ JSON ดังกล่าวไป\n- example: "mobile_no_1"\n- example: "mobile_no_1,"\n- example: "mobile_no_1,mobile_no_2"`
            },
            "jsonField.other_details": {
                type: 'string',
                nullable: true,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาฟิวส์ JSON "other_details" โดยให้ใส่ค่า Key ภายในฟิวส์ JSON ดังกล่าวไป`
            },
            dropdown: {
                type: "boolean",
                default: false,
                description: "จะ return แค่ id name code"
            }
        }
    },
    tags: ['ShopBusinessPartners'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopBusinessPartners/byid/:id
 */
const byid = {
    description: `แสดงข้อมูลของ "ตารางธุรกิจคู่ค้า" (ShopBusinessPartners) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'ค่า id ของ ShopBusinessPartners',
                example: 'ca280ffd-5c68-4723-a963-26303cdb6f31'
            }
        }
    },
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
        }
    },
    tags: ['ShopBusinessPartners'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopBusinessPartners/put/:id
 */
const put = {
    description: `แก้ไขข้อมูลของ "ตารางธุรกิจคู่ค้า" (ShopBusinessPartners) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        required: ['id'],
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        properties: {
            id: {
                type: 'string',
                nullable: false,
                format: 'uuid',
                description: 'id ของ ShopBusinessPartners',
                example: 'ef8c1eee-11ab-405f-9a8f-6937938b612c'
            }
        }
    },
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['partner_name'],
        properties: {
            tax_type_id: {
                description: 'ประเภทภาษี (ไม่สำหรับทำ Default ประเภทภาษี)',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: null
            },
            tax_id: {
                description: 'รหัสภาษีธุรกิจ',
                type: 'string',
                nullable: true,
                default: undefined,
                example: null
            },
            bus_type_id: {
                description: 'รหัสประเภทธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: null
            },
            partner_name: {
                description: 'ชื่อลูกค้า เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: false,
                default: undefined,
                properties: {
                    th: {
                        type: 'string',
                        nullable: true,
                        example: 'พระมหาเทวีเจ้า แห่งเมืองทิพย์'
                    },
                    en: {
                        type: 'string',
                        nullable: true,
                        example: 'Pramahataweejao Hangmuengtip'
                    }
                }
            },
            tel_no: {
                description: 'เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                type: 'object',
                nullable: true,
                default: undefined,
                properties: {
                    tel_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '024412455'
                    },
                    tel_no_2: {
                        type: 'string',
                        nullable: true,
                        example: '024454712'
                    }
                }
            },
            mobile_no: {
                description: 'เบอร์โทรศัพท์มือถือ  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                type: 'object',
                nullable: true,
                default: undefined,
                properties: {
                    mobile_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '0854431244'
                    }
                }
            },
            e_mail: {
                description: 'e-mail',
                type: 'string',
                format: 'email',
                nullable: true,
                default: undefined,
                example: 'pramahataweejao.tip@gmail.com'
            },
            address: {
                description: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: true,
                default: undefined,
                properties: {
                    th: {
                        type: 'string',
                        nullable: true,
                        example: 'เลขที่ 500'
                    },
                    en: {
                        type: 'string',
                        nullable: true,
                        example: 'House Number 500'
                    }
                }
            },
            subdistrict_id: {
                description: 'รหัสตำบล',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
            },
            district_id: {
                description: 'รหัสอำเภอ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: null
            },
            province_id: {
                description: 'รหัสจังหวัด',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
            },
            other_details: {
                description: 'รายละเอียดอื่นๆ เพิ่มเติมเก็บเป็น  Json',
                type: 'object',
                nullable: true,
                default: undefined,
                example: null
            },
            status: {
                type: 'string',
                nullable: false,
                default: undefined,
                enum: ['default', 'block', 'active', 'delete'],
                description: 'สถาณะชุดข้อมูล \n- default: ไม่ต้องการค้นหาในส่วนนี้ \n- block: ยกเลิกการใช้งานข้อมูล (0) \n- active: ใช้งานข้อมูล (1) \n- delete: ลบข้อมูลลงถังขยะ (2)',
                example: 'default'
            }
        }
    },
    tags: ['ShopBusinessPartners'],
    security: [
        {
            'apiKey': []
        }
    ]
};


module.exports = {
    add,
    all,
    byid,
    put,
    add_by_file
};