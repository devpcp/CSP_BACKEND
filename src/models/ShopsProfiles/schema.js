/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopsProfiles/add
 */
const add = {
    body: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        required: ['shop_name'],
        properties: {
            shop_code_id: {
                type: 'string',
                nullable: true,
                default: null,
                description: 'รหัสตัวแทนจำหน่ายต้นฉบับ',
                example: "PanLob-1000"
            },
            tax_code_id: {
                type: 'string',
                nullable: true,
                default: null,
                description: 'รหัสภาษี',
                example: "54411214141121"
            },
            bus_type_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: 'รหัสประเภทธุรกิจ',
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
                        nullable: true,
                        example: 'NooRat Shop'
                    }
                },
                description: 'ชื่อตัวแทนจำหน่าย เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                example: {
                    "th": "หนูรัตน์ ช๊อป",
                    "en": "NooRat Shop"
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
            province_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: 'รหัสจังหวัด',
                example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
            },
            district_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: 'รหัสอำเภอ',
                example: null
            },
            subdistrict_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: 'รหัสตำบล',
                example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
            },
            sync_api_config: {
                type: 'object',
                nullable: true,
                properties: {
                    rd_reg_no: {
                        type: 'string',
                        nullable: true,
                        example: 'X31-21011-YY27-XYX1'
                    },
                    rd_code: {
                        type: 'string',
                        nullable: true,
                        example: 'B458'
                    },
                    username: {
                        type: 'string',
                        nullable: true,
                        example: 'tidapon.c'
                    },
                    password: {
                        type: 'string',
                        nullable: true,
                        example: 'iDontLiketoPlayAS$TheEvilWanPetch'
                    },
                },
                default: null,
                description: 'ตั้งค่าเชื่อมต่อ API เพื่อส่งข้อมูลขึ้นต่างระบบ เก็บเป็น JSON Format',
                example: {
                    "rd_reg_no": "X31-21011-YY27-XYX1",
                    "rd_code": "B458",
                    "username": "tidapon.c",
                    "password": "iDontLiketoPlayAS$TheEvilWanPetch",
                }
            },
            parent_id: {
                description: 'รหัสร้านแม่',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            }
        }
    },
    tags: ['ShopsProfiles'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopsProfiles/all
 */
const all = {
    querystring: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        properties: {
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
                enum: ['shop_name.th', 'shop_name.en'],
                default: 'shop_name.th',
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
            byHq: {
                type: 'boolean',
                default: false,
                description: 'กรองโดย hq หรือไม่ จะมีผลต่อเมื่อ user เป้น HQ'
            }
        }
    },
    tags: ['ShopsProfiles'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopsProfiles/byid/:id
 */
const byid = {
    params: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'id ของ ShopsProfile',
                example: 'ca280ffd-5c68-4723-a963-26303cdb6f31'
            }
        }
    },
    tags: ['ShopsProfiles'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopsProfiles/put/:id
 */
const put = {
    params: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                nullable: false,
                format: 'uuid',
                description: 'ค่า id ของ ShopsProfile',
                example: 'ef8c1eee-11ab-405f-9a8f-6937938b612c'
            }
        }
    },
    body: {
        type: 'object',
        additionalProperties: false, // it will remove all the field that is NOT in the JSON schema
        properties: {
            tax_code_id: {
                type: 'string',
                nullable: true,
                description: 'รหัสภาษี',
                example: null
            },
            bus_type_id: {
                type: 'string',
                nullable: true,
                format: 'uuid',
                description: 'รหัสประเภทธุรกิจ',
                example: null
            },
            shop_name: {
                type: 'object',
                nullable: true,
                properties: {
                    th: {
                        type: 'string',
                        nullable: false,
                        example: 'พี่พันลบ ช๊อป'
                    },
                    en: {
                        type: 'string',
                        nullable: true,
                        example: 'PhanLob Shop'
                    }
                },
                description: 'ชื่อตัวแทนจำหน่าย เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                example: {
                    "th": "พี่พันลบ ช๊อป",
                    "en": "PhanLob Shop"
                },
            },
            tel_no: {
                type: 'object',
                nullable: true,
                properties: {
                    tel_no_1: {
                        type: 'string',
                        nullable: true,
                        example: '074641413'
                    }
                },
                description: 'เบอร์โทรศัพท์พื้นฐาน เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                example: {
                    tel_no_1: '074641413'
                }
            },
            mobile_no: {
                type: 'object',
                nullable: true,
                properties: {
                    mobile_no_1: {
                        type: 'string',
                        example: '0894567412'
                    }
                },
                description: 'เบอร์โทรศัพท์มือถือ  เก็บเป็น JSON รองรับการขยายของข้อมูล ตัวอย่างเช่น { "variable_1" : "data",  "variable_2" : "data", .....}',
                example: {
                    mobile_no_1: '0894567412'
                }
            },
            e_mail: {
                type: 'string',
                nullable: true,
                format: 'email',
                description: 'e-mail',
                example: 'phanlob.w@gmail.com'
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
            province_id: {
                type: 'string',
                nullable: true,
                format: 'uuid',
                description: 'รหัสจังหวัด',
                example: '1ac4b816-2cc6-4280-9494-4a1807d12ad3'
            },
            district_id: {
                type: 'string',
                nullable: true,
                format: 'uuid',
                description: 'รหัสอำเภอ',
                example: null
            },
            subdistrict_id: {
                type: 'string',
                nullable: true,
                format: 'uuid',
                description: 'รหัสตำบล',
                example: 'db8d1600-bcdd-4aca-ae00-0938158da42d'
            },
            isuse: {
                type: 'number',
                nullable: false,
                enum: [0, 1, 2],
                description: 'สถานะการใช้งานข้อมูล (0=ยกเลิกการใช้งานข้อมูล , 1=ใช้งานข้อมูล , 2=ลบข้อมูลลงถังขยะ)',
                example: 1
            },
            sync_api_config: {
                type: 'object',
                nullable: true,
                properties: {
                    rd_reg_no: {
                        type: 'string',
                        nullable: true,
                        example: 'X31-21011-YY27-XYX2'
                    },
                    rd_code: {
                        type: 'string',
                        nullable: true,
                        example: 'B459'
                    },
                    username: {
                        type: 'string',
                        nullable: true,
                        example: 'phanlob.w'
                    },
                    password: {
                        type: 'string',
                        nullable: true,
                        example: 'iLiketoSeeNooRatPlayAS@TheEvilWanPetch'
                    },
                },
                description: 'ตั้งค่าเชื่อมต่อ API เพื่อส่งข้อมูลขึ้นต่างระบบ เก็บเป็น JSON Format',
                example: {
                    rd_reg_no: 'X31-21011-YY27-XYX2',
                    rd_code: 'B459',
                    username: 'phanlob.w',
                    password: 'iLiketoSeeNooRatPlayAS@TheEvilWanPetch',
                }
            },
            parent_id: {
                description: 'รหัสร้านแม่',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
            shop_config: {
                description: 'ตั้งค่าของร้านค้า เก็บเป็น JSON Format',
                type: 'object',
                nullable: true,
                default: undefined,
                example: {
                    separate_ShopSalesTransaction_DocType_doc_code: false,
                    enable_ShopSalesTransaction_TRN_doc_code: false,
                    enable_ShopSalesTransaction_INV_doc_code: false,
                    separate_ShopInventoryTransaction_DocType_doc_code: false
                }
            }
        }
    },
    tags: ['ShopsProfiles'],
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
};