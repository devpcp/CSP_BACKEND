const attr_tags = ['ShopLegacySalesOut'];
const attr_security = [
    {
        'apiKey': []
    }
];

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopLegacySalesOut/add
 */
const add = {
    description: `เพิ่มชุดข้อมูลไปยัง "ตารางรางข้อมูลรายการข้อมูลการขายเก่า" (ShopLegacySalesOut)`,
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            document_code_id: {
                description: 'รหัสเลขที่เอกสาร',
                type: 'string',
                nullable: true,
                default: null
            },
            document_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: null,
                example: '2022-02-18'
            },
            customer_name: {
                description: 'ชื่อสกุลลูกค้า',
                type: 'string',
                nullable: true,
                default: null
            },
            customer_vehicle_reg_plate: {
                description: 'ทะเบียนรถลูกค้า',
                type: 'string',
                nullable: true,
                default: null
            },
            customer_tel_no: {
                description: 'เบอร์ติดต่อ',
                type: 'string',
                nullable: true,
                default: null
            },
            customer_latest_contact_date: {
                description: 'วันที่ติดต่อล่าสุด',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: null,
                example: '2022-02-18'
            },
            product_code: {
                description: 'รหัสสินค้า',
                type: 'string',
                nullable: true,
                default: null
            },
            product_name: {
                description: 'ชื่อสินค้า',
                type: 'string',
                nullable: true,
                default: null
            },
            product_amount: {
                description: 'จำนวนสินค้า',
                type: 'number',
                nullable: false,
                default: 0
            },
            price_grand_total: {
                description: 'จำนวนเงินสุทธิ',
                type: 'number',
                nullable: false,
                default: 0
            },
            details: {
                description: 'รายละเอียดข้อมูลอื่น ๆ',
                type: 'object',
                additionalProperties: true,
                nullable: true,
                default: {},
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            status: {
                description: `สถานะรายการ \n- 0 = ลบรายการ\n- 1 = ใช้งานรายการ`,
                type: 'integer',
                enum: [0, 1],
                nullable: false,
                default: 1,
                example: 1
            },

            shopLegacySalesOuts: {
                description: 'กรณีข้อมูลเป็นชุดหลายตัว',
                type: 'array',
                nullable: false,
                default: [],
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        document_code_id: {
                            description: 'รหัสเลขที่เอกสาร',
                            type: 'string',
                            nullable: true,
                            default: null
                        },
                        document_date: {
                            description: 'วันที่เอกสาร',
                            type: 'string',
                            pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                            nullable: true,
                            default: null,
                            example: '2022-02-18'
                        },
                        customer_name: {
                            description: 'ชื่อสกุลลูกค้า',
                            type: 'string',
                            nullable: true,
                            default: null
                        },
                        customer_vehicle_reg_plate: {
                            description: 'ทะเบียนรถลูกค้า',
                            type: 'string',
                            nullable: true,
                            default: null
                        },
                        customer_tel_no: {
                            description: 'เบอร์ติดต่อ',
                            type: 'string',
                            nullable: true,
                            default: null
                        },
                        customer_latest_contact_date: {
                            description: 'วันที่ติดต่อล่าสุด',
                            type: 'string',
                            pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                            nullable: true,
                            default: null,
                            example: '2022-02-18'
                        },
                        product_code: {
                            description: 'รหัสสินค้า',
                            type: 'string',
                            nullable: true,
                            default: null
                        },
                        product_name: {
                            description: 'ชื่อสินค้า',
                            type: 'string',
                            nullable: true,
                            default: null
                        },
                        product_amount: {
                            description: 'จำนวนสินค้า',
                            type: 'integer',
                            nullable: false,
                            default: 0
                        },
                        price_grand_total: {
                            description: 'จำนวนเงินสุทธิ',
                            type: 'number',
                            nullable: false,
                            default: 0
                        },
                        details: {
                            description: 'รายละเอียดข้อมูลอื่น ๆ',
                            type: 'object',
                            additionalProperties: true,
                            nullable: true,
                            default: {},
                            example: {
                                "data": "xxx",
                                "data_2": { "th": "xxx", "en": "xxx" },
                                "data_3": "xxx",
                                "data_4": "xxx"
                            }
                        },
                        status: {
                            description: `สถานะรายการ \n- 0 = ลบรายการ\n- 1 = ใช้งานรายการ`,
                            type: 'integer',
                            enum: [0, 1],
                            nullable: false,
                            default: 1,
                            example: 1
                        }
                    }
                },
            }
        }
    },
    tags: attr_tags,
    security: attr_security
};


/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopLegacySalesOut/addByFile
 */
const add_by_file = {
    description: `เพิ่มชุดข้อมูลไปยัง "ตารางรางข้อมูลรายการข้อมูลการขายเก่า"(ShopLegacySalesOut) ด้วยไฟล์ xlsx`,
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
    tags: attr_tags,
    security: attr_security
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopLegacySalesOut/all
 */
const all = {
    description: `แสดงข้อมูลของ ชุดข้อมูลไปยัง "ตารางรางข้อมูลรายการข้อมูลการขายเก่า" (ShopLegacySalesOut)`,
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: {
                type: 'string',
                default: '',
                description: 'สิ่งที่ต้องกาค้นหา'
            },
            start_date: {
                description: 'วันที่เรื่มนัดหมาย',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: null,
                example: '2022-02-18'
            },
            end_date: {
                description: 'วันที่สิ้นสุดนัดหมาย',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: null,
                example: '2022-02-18'
            },
            limit: {
                type: 'integer',
                default: 10,
                description: 'จำนวนชุดข้อมูลที่จะแสดงผล'
            },
            page: {
                type: 'integer',
                default: 1,
                description: 'แสดงผลในหน้าที่กำหนด'
            },
            sort: {
                type: 'string',
                enum: [
                    'code_id',
                    'document_code_id',
                    'document_date',
                    'customer_name',
                    'customer_latest_contact_date',
                    'created_date'
                ],
                default: 'document_date',
                description: 'เรียงข้อมูลจากฟิวส์...'
            },
            order: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'asc',
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด'
            },
            status: {
                type: 'string',
                enum: ['default', 'active', 'delete'],
                default: 'default',
                description: 'สถาณะชุดข้อมูล'
            },
            filter_by: {
                type: 'string',
                default: 'all',
                description: 'แยกการค้นหา เลือกได้หลาย Filter และคั่นด้วยลูกน้ำ โดยค้นหาจาก \n- all (ค้นหาทั้งหมด)\n- customer_name\n- customer_vehicle_reg_plate\n- customer_tel_no\n- product_code\n- product_name'
            },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            }
        }
    },
    tags: attr_tags,
    security: attr_security
};


module.exports = {
    add,
    add_by_file,
    all,
};