/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/master/productPurchaseUnitTypes/add
 */
const add = {
    description: 'เพิ่ม ชุดข้อมูลไปยัง "ตารางข้อมูลประเภทหน่วยซื้อ" (ProductPurchaseUnitTypes)',
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['type_name', 'type_group_id'],
        properties: {
            internal_code_id: {
                description: 'รหัสควบคุมประเภทหน่วยซื้อ (ภายใน)',
                type: 'string',
                nullable: true,
                default: null,
                example: "UT-002"
            },
            type_name: {
                description: 'ชื่อประเภทหน่วยซื้อ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: false,
                example: {
                    "th": "หน่วย",
                    "en": "Unit"
                }
            },
            type_group_id: {
                description: 'รหัสกลุ่มประเภทสินค้า',
                type: 'string',
                format: 'uuid',
                nullable: false,
                example: 'da791822-401c-471b-9b62-038c671404ab'
            },
            amount_per_unit: {
                description: 'จำนวนปริมาตรต่อหน่อย',
                type: 'number',
            }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/master/productPurchaseUnitTypes/all
 */
const all = {
    description: 'แสดงข้อมูลของ "ตารางข้อมูลประเภทหน่วยซื้อ" (ProductPurchaseUnitTypes)',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: {
                description: 'สิ่งที่ต้องกาค้นหา',
                type: 'string',
                default: ''
            },
            sort: {
                description: 'เรียงข้อมูลจากฟิวส์...',
                type: 'string',
                enum: ['code_id', 'internal_code_id', 'type_name.th', 'type_name.en', 'created_date', 'updated_date'],
                default: 'type_name.th'
            },
            order: {
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด \n- asc = เรียงจากน้อยไปหามาก \n- desc เรียงจากมากไปหาน้อย',
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
            },
            status: {
                description: 'สถานะการใช้งานข้อมูล \n- default = ไม่สนใจการกรองข้อมูลชุดนี้ \n- block = ยกเลิกการใช้งานข้อมูล \n- active = ใช้งานข้อมูล \n- delete = ลบข้อมูลลงถังขยะ',
                type: 'string',
                enum: ['default', 'block', 'active', 'delete'],
                default: 'active'
            }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/productPurchaseUnitTypes/byid/:id
 */
const byid = {
    description: `แสดงข้อมูลของ "ตารางข้อมูลประเภทหน่วยซื้อ" (ProductPurchaseUnitTypes) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'ค่า id ของ ProductPurchaseUnitTypes'
            }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/productPurchaseUnitTypes/put/:id
 */
const put = {
    description: `แก้ไขข้อมูลของ "ตารางข้อมูลประเภทหน่วยซื้อ" (ProductPurchaseUnitTypes) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        required: ['id'],
        additionalProperties: false,
        properties: {
            id: {
                type: 'string',
                nullable: false,
                format: 'uuid',
                description: 'id ของ ProductPurchaseUnitTypes'
            }
        }
    },
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            internal_code_id: {
                description: 'รหัสควบคุมประเภทหน่วยซื้อ (ภายใน) ',
                type: 'string',
                nullable: true,
                default: undefined,
                example: "UT-003"
            },
            type_name: {
                description: 'ชื่อประเภทหน่วยซื้อ เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: true,
                default: undefined,
                example: {
                    "th": "เส้น",
                    "eh": "Bar"
                }
            },
            type_group_id: {
                description: 'รหัสกลุ่มประเภทสินค้า',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
            status: {
                description: 'สถานะการใช้งานข้อมูล \n- block = ยกเลิกการใช้งานข้อมูล \n- active = ใช้งานข้อมูล \n- delete = ลบข้อมูลลงถังขยะ',
                type: 'string',
                nullable: false,
                default: undefined,
                enum: ['block', 'active', 'delete']
            },
            amount_per_unit: {
                description: 'จำนวนปริมาตรต่อหน่อย',
                type: 'number',
                nullable: true,
                default: undefined
            }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};


module.exports = {
    add,
    all,
    byid,
    put
};