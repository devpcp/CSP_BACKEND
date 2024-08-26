const select_shop_ids = {
    description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- ถ้าเอาทุก Branch ที่มีให้ใส่ all \n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
    type: 'string',
    nullable: true,
    default: ''
};

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopBusinessCustomers/add
 */
const add = {
    description: `เพิ่ม ชุดข้อมูลไปยัง "ตารางลูกค้าภายใต้ร้านค้า" (ShopBusinessCustomers)`,
    body: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        required: ['customer_name'],
        properties: {
            tax_id: {
                type: 'string',
                nullable: true,
                default: null,
                description: 'รหัสภาษีธุรกิจ',
                example: null
            },
            bus_type_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: 'รหัสประเภทธุรกิจ',
                example: null
            },
            customer_name: {
                type: 'object',
                nullable: false,
                properties: {
                    th: {
                        type: 'string',
                        nullable: false,
                        example: 'ธิดาพร ชาวคูเวียง'
                    },
                    en: {
                        type: 'string',
                        nullable: true,
                        example: 'Taidapon Chaokuweing'
                    }
                },
                description: 'ชื่อลูกค้า เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                example: {
                    "th": "ธิดาพร ชาวคูเวียง",
                    "en": "Taidapon Chaokuweing"
                },
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
            mobile_no: {
                type: 'object',
                nullable: true,
                default: null,
                properties: {
                    mobile_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '0854431244'
                    }
                },
                description: 'เบอร์โทรศัพท์มือถือ  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                example: {
                    "mobile_no_1": "0854431244",
                }
            },
            e_mail: {
                type: 'string',
                format: 'email',
                nullable: true,
                default: null,
                description: 'e-mail',
                example: 'tidapon.c@gmail.com'
            },
            address: {
                type: 'object',
                nullable: true,
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
                },
                default: null,
                description: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                example: {
                    "th": "เลขที่ 500",
                    "en": "House Number 500"
                }
            },
            subdistrict_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: 'รหัสตำบล',
                example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
            },
            district_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: 'รหัสอำเภอ',
                example: null
            },
            province_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: 'รหัสจังหวัด',
                example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
            },
            other_details: {
                type: 'object',
                nullable: true,
                default: null,
                description: 'รายละเอียดอื่นๆ เพิ่มเติมเก็บเป็น  Json',
                example: null
            },
            tags: {
                type: 'array',
                description: 'เป็น uuid ของ tag',
                items: {
                    type: 'string', format: 'uuid'
                },
            }
        }
    },
    tags: ['ShopBusinessCustomers'],
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
    description: `เพิ่ม ด้วยไฟล์ xlsx ชุดข้อมูลไปยัง "ตารางลูกค้าภายใต้ร้านค้า" (ShopBusinessCustomers)`,
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
    tags: ['ShopBusinessCustomers'],
    security: [
        {
            "apiKey": []
        }
    ]
};
/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopBusinessCustomers/all
 */
const all = {
    description: `แสดงข้อมูลของ "ตารางลูกค้าภายใต้ร้านค้า" (ShopBusinessCustomers)`,
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
                enum: ['customer_name.th', 'customer_name.en'],
                default: 'customer_name.th',
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
                enum: ['default', 'delete', 'active', 'block'],
                default: 'default',
                description: 'สถาณะชุดข้อมูล'
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
            },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            tags: {
                type: 'array',
                description: 'เป็น uuid ของ tag',
                type: 'string',
                nullable: true,
                default: null
            }
        }
    },
    tags: ['ShopBusinessCustomers'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopBusinessCustomers/byid/:id
 */
const byid = {
    description: `แสดงข้อมูลของ "ตารางลูกค้าภายใต้ร้านค้า" (ShopBusinessCustomers) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'ค่า id ของ ShopBusinessCustomers',
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
    tags: ['ShopBusinessCustomers'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopBusinessCustomers/put/:id
 */
const put = {
    description: `แก้ไขข้อมูลของ "ตารางลูกค้าภายใต้ร้านค้า" (ShopBusinessCustomers) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        required: ['id'],
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        properties: {
            id: {
                type: 'string',
                nullable: false,
                format: 'uuid',
                description: 'id ของ ShopBusinessCustomers',
                example: 'ef8c1eee-11ab-405f-9a8f-6937938b612c'
            }
        }
    },
    body: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        properties: {
            tax_id: {
                type: 'string',
                nullable: true,
                default: undefined,
                description: 'รหัสภาษีธุรกิจ',
                example: null
            },
            bus_type_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                description: 'รหัสประเภทธุรกิจ',
                example: null
            },
            customer_name: {
                type: 'object',
                nullable: false,
                default: undefined,
                properties: {
                    th: {
                        type: 'string',
                        nullable: false,
                        example: 'มิจจู้ ชาวคูเวียง'
                    },
                    en: {
                        type: 'string',
                        nullable: true,
                        example: 'Mitju Chaokuweing'
                    }
                },
                description: 'ชื่อลูกค้า เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                example: {
                    "th": "มิจจู้ ชาวคูเวียง",
                    "en": "Mitju Chaokuweing"
                },
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
            mobile_no: {
                type: 'object',
                nullable: true,
                default: undefined,
                properties: {
                    mobile_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '0941423587'
                    }
                },
                description: 'เบอร์โทรศัพท์มือถือ  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                example: {
                    "mobile_no_1": "0941423587",
                }
            },
            e_mail: {
                type: 'string',
                format: 'email',
                nullable: true,
                default: undefined,
                description: 'e-mail',
                example: 'mitju.c@gmail.com'
            },
            address: {
                type: 'object',
                nullable: true,
                default: undefined,
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
                },
                description: 'ที่อยู่ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                example: {
                    "th": "เลขที่ 500",
                    "en": "House Number 500"
                }
            },
            subdistrict_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                description: 'รหัสตำบล',
                example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
            },
            district_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                description: 'รหัสอำเภอ',
                example: null
            },
            province_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                description: 'รหัสจังหวัด',
                example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
            },
            other_details: {
                type: 'object',
                nullable: true,
                default: undefined,
                description: 'รายละเอียดอื่นๆ เพิ่มเติมเก็บเป็น  Json',
                example: null
            },
            tags: {
                type: 'array',
                description: 'เป็น uuid ของ tag',
                items: {
                    type: 'string', format: 'uuid'
                },
                default: undefined
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
    tags: ['ShopBusinessCustomers'],
    security: [
        {
            'apiKey': []
        }
    ]
};

module.exports = {
    add,
    add_by_file,
    all,
    byid,
    put,
};