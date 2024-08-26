/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopSalesTransactionDoc/add
 */
const add = {
    description: `เพิ่ม ชุดข้อมูลไปยัง "ตารางข้อมูลการนัดหมาย" (ShopAppointment) \n- ต้องมี "bus_customer_id" หรือ "per_customer_id" อย่างน้อย 1 อย่าง`,
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['shop_id', 'start_date', 'end_date'],
        properties: {
            shop_id: {
                description: 'รหัสข้อมูลร้านค้า',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            bus_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true
            },
            per_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรม',
                type: 'string',
                format: 'uuid',
                nullable: true
            },
            start_date: {
                description: 'วันที่เรื่มนัดหมาย',
                type: 'string',
                nullable: false,
                example: '2022-02-18 01:00:00'
            },
            end_date: {
                description: 'วันที่สิ้นสุดนัดหมาย',
                type: 'string',
                nullable: false,
                example: '2022-02-18 02:00:00'
            },
            details: {
                description: 'รายละเอียดข้อมูลการนัดหมาย',
                type: 'object',
                additionalProperties: true,
                nullable: true,
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            vehicles_customers_id: {
                description: 'รหัสตารางข้อมูลยานพาหนะ',
                type: 'string',
                format: 'uuid',
                nullable: true
            },
            appointment_status: {
                description: `สถานะการนัดหมาย \n- 0 = รอยืนยันการนัดมหาย \n- 1 = ยืนยันการนัดหมาย \n- 2 = ยกเลิกการนัดหมาย`,
                type: 'number',
                enum: [0, 1, 2],
                nullable: true,
                example: 0
            },
        }
    },
    tags: ['ShopAppointment'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopSalesTransactionDoc/all
 */
const all = {
    description: `แสดงข้อมูลของ "ตารางข้อมูลการนัดหมาย" (ShopAppointment)`,
    querystring: {
        type: 'object',
        additionalProperties: false,
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
                enum: ['created_date', 'updated_date'],
                default: 'created_date',
                description: 'เรียงข้อมูลจากฟิวส์...'
            },
            order: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc',
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด'
            },

            appointment_status: {
                type: 'string',
                enum: ['default', '0', '1', '2'],
                default: 'default',
                description: 'สถานะการนัดหมาย\n default = แสดงข้อมูลทั้งหมด  \n- 0 = รอยืนยันการนัดมหาย \n- 1 = ยืนยันการนัดหมาย \n- 2 = ยกเลิกการนัดหมาย'
            },
            bus_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาจาก รหัสตารางข้อมูลลูกต้าธุรกิจ`

            },
            per_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาจาก รหัสตารางข้อมูลลูกต้าธรรมดา`

            },
            vehicles_customers_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาจาก รหัสตารางข้อมูลยานพาหนะ`
            },
            start_date: {
                description: 'วันที่เรื่มนัดหมาย',
                type: 'string',
                nullable: true,
                example: '2022-02-18 01:00:00',
                default: null,
            },
            end_date: {
                description: 'วันที่สิ้นสุดนัดหมาย',
                type: 'string',
                nullable: true,
                example: '2022-02-18 02:00:00',
                default: null,
            },
            customer_type: {
                minItems: 1,
                type: 'array',
                enums: ['business', 'personal'],
                items: {
                    type: 'string'
                },
                collectionFormat: "multi", // <== HERE IT IS!
            },
            status: {
                type: 'string',
                default: 'default',
                enum: ['default', 'delete', 'active', 'block'],
                description: `สถานะข้อมูล \n- default = ไม่แสดงเอกสารที่เป็น "ถังขยะ" \n- 0 = ไม่ใช้งาน \n- 1 = ใช้งาน \n- 2 = ถังขยะ`,
            },
        }
    },
    tags: ['ShopAppointment'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopSalesTransactionDoc/byid/:id
 */
const byid = {
    description: 'แสดงข้อมูล "ตารางข้อมูลการนัดหมาย" (ShopAppointment) แบบระบุรหัส (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลัก "ตารางข้อมูลการนัดหมาย" (Id)'
            }
        }
    },
    tags: ['ShopAppointment'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopSalesTransactionDoc/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูล "ตารางข้อมูลการนัดหมาย" (ShopAppointment) แบบระบุรหัส (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลัก "ตารางข้อมูลการนัดหมาย" (Id)'
            }
        }
    },
    body: {
        additionalProperties: false,
        properties: {
            code_id: {
                description: 'รหัสเลขที่เอกสาร',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            bus_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            per_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            start_date: {
                description: 'วันที่เรื่มต้นนัดหมาย',
                type: 'string',
                nullable: true,
                default: undefined,
                example: '2022-03-01 01:00:00'
            },
            end_date: {
                description: 'วันที่สิ้นสุดนัดหมาย',
                type: 'string',
                nullable: true,
                default: undefined,
                example: '2022-03-01 02:00:00'
            },
            details: {
                description: 'รายละเอียดข้อมูลการนัดหมาย',
                type: 'object',
                additionalProperties: true,
                nullable: true,
                default: undefined,
                example: {
                    "data": "yyy",
                    "data_2": { "th": "yyy", "en": "yyy" },
                    "data_3": "yyy",
                    "data_4": "yyy"
                }
            },
            vehicles_customers_id: {
                description: 'รหัสตารางข้อมูลยานพาหนะ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            appointment_status: {
                description: 'สถานะการนัดหมาย \n- 0 = รอยืนยันการนัดมหาย \n- 1 = ยืนยันการนัดหมาย \n- 2 = ยกเลิกการนัดหมาย',
                type: 'number',
                enum: [0, 1, 2],
                nullable: true,
                default: undefined,
                example: 0
            },
            status: {
                type: 'string',
                nullable: true,
                default: undefined,
                enum: ['delete', 'active', 'block'],
                description: `สถานะข้อมูล \n- 0 = ไม่ใช้งาน \n- 1 = ใช้งาน \n- 2 = ถังขยะ`,
            },
        },
    },
    tags: ['ShopAppointment'],
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