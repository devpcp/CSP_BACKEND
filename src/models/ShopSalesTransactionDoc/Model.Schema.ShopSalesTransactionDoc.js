/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopSalesTransactionDoc/add
 */
const add = {
    description: `เพิ่ม ชุดข้อมูลไปยัง "ตารางข้อมูลเอกสารการขาย" (ShopSalesTransactionDoc) \n- ต้องมี "bus_customer_id" หรือ "per_customer_id" อย่างน้อย 1 อย่าง`,
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['shop_id', 'doc_date', 'details', 'doc_type_id', 'status'],
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
            doc_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: false,
                example: '2022-02-18'
            },
            details: {
                description: 'รายละเอียดข้อมูลเอกสารการขาย',
                type: 'object',
                additionalProperties: true,
                nullable: false,
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
            doc_type_id: {
                description: 'ประเภทเอกสาร',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            sale_type: {
                description: `ประเภทการขาย \n- true = ขายส่ง \n- false = ขายปลีก`,
                type: 'boolean',
                nullable: false
            },
            purchase_status: {
                description: 'สถานะการจ่าย \n- false = ยังไม่จ่าย \n- true = จ่ายแล้ว',
                type: 'boolean',
                nullable: false
            },
            status: {
                description: `สถานะเอกสาร \n- 0 = ยกเลิก \n- 1 = อยู่ระหว่างดำเนินการ \n- 2 = ดำเนินการเรียบร้อย \n- 3 = ออกบิลอย่างย่อ \n- 4 = ออกบิลเต็มรูป`,
                type: 'number',
                enum: [0, 1, 2, 3, 4],
                nullable: false,
                example: 1
            },
        }
    },
    tags: ['ShopSalesTransactionDoc'],
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
    description: `แสดงข้อมูลของ "ตารางข้อมูลเอกสารการขาย" (ShopSalesTransactionDoc)`,
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
            status: {
                type: 'string',
                enum: ['default', '0', '1', '2', '3', '4'],
                default: 'default',
                description: `สถานะเอกสาร \n- default = ไม่แสดงเอกสารที่เป็น "ยกเลิก" \n- 0 = ยกเลิก \n- 1 = อยู่ระหว่างดำเนินการ \n- 2 = ดำเนินการเรียบร้อย \n- 3 = ออกบิลอย่างย่อ \n- 4 = ออกบิลเต็มรูป`,
            },
            purchase_status: {
                type: 'boolean',
                nullable: true,
                default: null,
                description: 'สถานะการจ่าย \nfalse = ยังไม่จ่าย\ntrue = จ่ายแล้ว'
            },
            sale_type: {
                type: 'boolean',
                nullable: true,
                default: null,
                description: 'ประเภทการขาย \nfalse = ขายส่ง\ntrue = ขายปลีก'
            },
            "jsonField.details": {
                type: 'string',
                nullable: true,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาฟิวส์ JSON "details" โดยให้ใส่ค่า Key ภายในฟิวส์ JSON ดังกล่าวไป\n- example: "data"\n- example: "data_2,"\n- example: "data,data_2"`
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
            doc_type_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาจาก ประเภทเอกสาร`
            },
            filter_by_prefixDocType_code_id: {
                type: 'string',
                default: 'JOB',
                description: 'ค้นหาจากเลขที่เอกสาร Prefix ค่า Default เป็น JOB\n- ALL ค้นหาทั้งหมด\n- JOB ค้นหาเลขที่ใบสั่งซ่อม\n- TRN ค้นหาเลขใบส่งของชั่วคราว\n- INV ค้นหาเลขใบกำกับภาษี'
            }
        }
    },
    tags: ['ShopSalesTransactionDoc'],
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
    description: 'แสดงข้อมูล "ตารางข้อมูลเอกสารการขาย" (ShopSalesTransactionDoc) แบบระบุรหัส (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลัก "ตารางข้อมูลเอกสารการขาย" (Id)'
            }
        }
    },
    tags: ['ShopSalesTransactionDoc'],
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
    description: 'แก้ไขข้อมูล "ตารางข้อมูลเอกสารการขาย" (ShopSalesTransactionDoc) แบบระบุรหัส (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลัก "ตารางข้อมูลเอกสารการขาย" (Id)'
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
            // ไม่ให้ใช้งาน เพราะบางเอกสาร ไม่ได้มีการปรับ Product Stock และตอนนี้ยังไม่ได้รองรับกับสิ่งที่เกิดขึ้นดังกล่าว
            // shop_id: {
            //     description: 'รหัสข้อมูลร้านค้า',
            //     type: 'string',
            //     format: 'uuid',
            //     nullable: true,
            //     default: undefined,
            //     example: ''
            // },
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
            doc_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: undefined,
                example: '2022-03-01'
            },
            details: {
                description: 'รายละเอียดข้อมูลเอกสารการขาย',
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
            // ไม่ให้ใช้งาน เพราะบางเอกสาร ไม่ได้มีการปรับ Product Stock และตอนนี้ยังไม่ได้รองรับกับสิ่งที่เกิดขึ้นดังกล่าว
            // doc_type_id: {
            //     description: 'ประเภทเอกสาร',
            //     type: 'string',
            //     format: 'uuid',
            //     nullable: true,
            //     default: undefined,
            //     example: ''
            // },
            sale_type: {
                description: `ประเภทการขาย \n- true = ขายส่ง \n- false = ขายปลีก`,
                type: 'boolean',
                nullable: true,
                default: undefined,
                example: ''
            },
            purchase_status: {
                description: 'สถานะการจ่าย \n- false = ยังไม่จ่าย \n- true = จ่ายแล้ว',
                type: 'boolean',
                nullable: true,
                default: undefined,
                example: ''
            },
            status: {
                type: 'number',
                nullable: true,
                default: undefined,
                enum: [0, 1, 2, 3, 4],
                description: `สถานะเอกสาร \n- 0 = ยกเลิก \n- 1 = อยู่ระหว่างดำเนินการ \n- 2 = ดำเนินการเรียบร้อย \n- 3 = ออกบิลอย่างย่อ \n- 4 = ออกบิลเต็มรูป`
            },
        },
    },
    tags: ['ShopSalesTransactionDoc'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const easySearch = {
    description: 'ค้นหาแบบ Easy Search และแสดงข้อมูลของ "ตารางข้อมูลเอกสารการขาย" (ShopSalesTransactionDoc)',
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
                default: 'updated_date',
                description: 'เรียงข้อมูลจากฟิวส์...'
            },
            order: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc',
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด'
            }
        }
    },
    tags: ['ShopSalesTransactionDoc'],
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
    put,
    easySearch
};