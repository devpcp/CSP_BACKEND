/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/master/departments/add
 */
const add = {
    description: 'เพิ่ม ชุดข้อมูลไปยัง "ตารางเก็บข้อมูลแผนก" (Departments)',
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['code_id', 'department_name', 'user_group_id'],
        properties: {
            code_id: {
                description: 'รหัสควบคุมแผนก',
                type: 'string',
                nullable: true,
                default: null,
                example: "PN-031"
            },
            department_name: {
                description: 'ชื่อแผนก เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: false,
                example: {
                    "th": "วิศวกรเครื่องยนต์",
                    "en": "Engine Engineer"
                }
            },
            user_group_id: {
                description: 'กลุ่มผู้ใช้งานระบบ ใช้เพื่อสร้างผู้ใช้',
                type: 'string',
                format: 'uuid',
                nullable: false,
                example: 'da791822-401c-471b-9b62-038c671404ab'
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
 * Route [GET] => /api/master/departments/all
 */
const all = {
    description: 'แสดงข้อมูลของ "ตารางเก็บข้อมูลแผนก" (Departments)',
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
                enum: ['code_id', 'department_name.th', 'department_name.en', 'created_date', 'updated_date'],
                default: 'department_name.th'
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
 * Route [GET] => /api/departments/byid/:id
 */
const byid = {
    description: `แสดงข้อมูลของ "ตารางเก็บข้อมูลแผนก" (Departments) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'ค่า id ของ Departments'
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
 * Route [PUT] => /api/departments/put/:id
 */
const put = {
    description: `แก้ไขข้อมูลของ "ตารางเก็บข้อมูลแผนก" (Departments) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        required: ['id'],
        additionalProperties: false,
        properties: {
            id: {
                type: 'string',
                nullable: false,
                format: 'uuid',
                description: 'id ของ departments'
            }
        }
    },
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            code_id: {
                description: 'รหัสหลักตารางข้อมูลแผนก',
                type: 'string',
                nullable: true,
                default: undefined,
                example: "PN-012"
            },
            department_name: {
                description: 'ชื่อแผนก เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: true,
                default: undefined,
                example: {
                    "th": "ช่างทางเทคนิค",
                    "eh": "Technical Services"
                }
            },
            user_group_id: {
                description: 'กลุ่มผู้ใช้งานระบบ ใช้เพื่อสร้างผู้ใช้',
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