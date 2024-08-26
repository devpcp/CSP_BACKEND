const add = {
    description: 'เพิ่มข้อมูล ในตารางข้อมูลประเภทยานพาหนะ',
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['type_name'],
        properties: {
            internal_code_id: {
                description: 'รหัสควบคุมประเภทยานพาหนะ (ภายใน)',
                type: 'string',
                default: null,
                example: null
            },
            type_name: {
                description: 'ชื่อประเภทยานพาหนะ',
                type: 'object',
                properties: {
                    th: {
                        type: 'string'
                    },
                    en: {
                        type: 'string'
                    }
                },
                example: {
                    th: 'ชื่อ',
                    en: 'name'
                },
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


const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ในตารางข้อมูลประเภทยานพาหนะ',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: {
                description: 'ค้นหาตามคำค้น',
                type: 'string',
                default: ''
            },
            limit: {
                description: 'จำกัดการแสดงของข้อมูล ต่อ 1 หน้า\n - ถ้าใส่ 0 จะไม่จำกัดการแสดงผลของข้อมูล',
                type: 'number',
                default: 0
            },
            page: {
                description: 'ลำดับของหน้าของข้อมูล\n - ถ้าใส่ 0 จะไม่จำกัดการแสดงผลของข้อมูล',
                type: 'number',
                default: 0
            },
            sort: {
                description: 'จัดเรียงตาม...\n- created_date = วันที่แสร้างเอกสาร\n- updated_date = วันที่ปรับปรุงเอกสารล่าสุด\n- code_id = เลขที่เอกสาร\n- internal_code_id = เลขที่เอกสาร (ภายใน)\n- type_name.th = ชื่อภาษาทไทย\n- type_name.en = ชื่อภาษาทอังกฤษ',
                type: 'string',
                enum: ['created_date', 'updated_date', 'code_id', 'internal_code_id', 'type_name.th', 'type_name.en'],
                default: 'created_date'
            },
            order: {
                description: 'จัดเรียงจาก...\n- asc = เรียงจากน้อยไปหามาก\n- desc = เรียงจากมากไปหาน้อย',
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
            },
            status: {
                description: 'ค้นหาตามสถาณะของข้อมูล\n- default = สถาณะทั้งหมด\n- active = สถาณะปกติ\n- block = สถาณะปิดกั้น\n- delete = สถาณะอยู่ในถังขยะ',
                type: 'string',
                enum: ['default', 'active', 'block', 'delete'],
                default: 'default'
            },
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const byid = {
    description: 'แสดงข้อมูล ในตารางข้อมูลประเภทยานพาหนะ แบบระบุรหัสหลักตารางรางข้อมูล (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางรางข้อมูล (Id)',
                type: 'string',
                format: 'uuid'
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


const put = {
    description: 'แก้ไขข้อมูล ในตารางข้อมูลประเภทยานพาหนะ แบบระบุรหัสหลักตารางรางข้อมูล (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางรางข้อมูล (Id)',
                type: 'string',
                format: 'uuid'
            }
        }
    },
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            internal_code_id: {
                ...add.body.properties.internal_code_id,
                nullable: true,
                default: undefined
            },
            type_name: {
                ...add.body.properties.type_name,
                nullable: true,
                default: undefined
            },
            status: {
                description: 'สถานะการใช้งานข้อมูล (ถ้าไม่เปลี่ยนไม่ต้องใส่มาก็ได้)\n- ค่าว่าง \'\' = ไม่เปลี่ยนแปลง\n- active = ใช้งานข้อมูล\n- block = ยกเลิกการใช้งานข้อมูล\n- delete = ลบข้อมูลลงถังขยะ',
                type: 'string',
                enum: ['', 'active', 'delete', 'block'],
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