const add = {
    description: 'เพิ่มข้อมูล ในตารางข้อมูลเอกสารสั่งซื้อ',
    body: {
        additionalProperties: false,
        required: ['shop_id', 'bus_partner_id', 'doc_date', 'details', 'doc_type_id', 'status'],
        properties: {
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้าจากส่วนกลาง',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            bus_partner_id: {
                description: 'รหัสข้อมูลตารางข้อมูลคู่ค้า',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            doc_date: {
                description: 'เอกสารวันที่',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: false,
                example: '2022-02-18'
            },
            details: {
                description: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON',
                type: 'object',
                additionalProperties: true,
                nullable: false,
                default: {},
                example: {
                    "data":"xxx",
                    "data_2": {"th":"xxx", "en":"xxx"},
                    "data_3":"xxx",
                    "data_4":"xxx"
                }
            },
            doc_type_id: {
                description: 'ประเภทเอกสาร',
                type: 'string',
                format: 'uuid',
                nullable: false,
                default: '67c45df3-4f84-45a8-8efc-de22fef31978',
                example: '67c45df3-4f84-45a8-8efc-de22fef31978'
            },
            status: {
                description: `สถานะการดำเนินงานของเอกสาร \n- 0 = ยกเลิก\n- 1 = รอดำเนินการ\n- 2 = อยู่ระหว่างดำเนินการ\n- 3 = อนุมัติ\n- 4 = ไม่อนุมัติ`,
                type: 'number',
                enum: [0, 1, 2, 3, 4],
                nullable: false,
                default: 1,
                example: 1
            },
        },
    },
    tags: ['ShopInventoryPurchasingPreOrderDoc'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ในตารางข้อมูลเอกสารสั่งซื้อ',
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
                enum: ['code_id', 'doc_date', 'created_date', 'updated_date'],
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
                default: 'default',
                enum: ['default', '0', '1', '2', '3', '4'],
                description: `สถานะการดำเนินงานของเอกสาร \n- default = ไม่สนใจ \n- 0 = ยกเลิก\n- 1 = รอดำเนินการ\n- 2 = อยู่ระหว่างดำเนินการ\n- 3 = อนุมัติ\n- 4 = ไม่อนุมัติ`,
            }
        }
    },
    tags: ['ShopInventoryPurchasingPreOrderDoc'],
    security: [
        {
            "apiKey": []
        }
    ]

};


const byid = {
    description: 'แสดงข้อมูล ในตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง แบบระบุรหัสหลักตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง (Id)',
                type: 'string',
                format: 'uuid'
            }
        }
    },
    tags: ['ShopInventoryPurchasingPreOrderDoc'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const put = {
    description: 'แก้ไขข้อมูล ในตารางข้อมูลเอกสารสั่งซื้อ แบบระบุรหัสหลักตารางข้อมูลเอกสารสั่งซื้อ (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางข้อมูลเอกสารสั่งซื้อ (Id)',
                type: 'string',
                format: 'uuid'
            }
        }
    },
    body: {
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้าจากส่วนกลาง',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            bus_partner_id: {
                description: 'รหัสข้อมูลตารางข้อมูลคู่ค้า',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            doc_date: {
                description: 'เอกสารวันที่',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: undefined,
                example: '2022-02-18'
            },
            details: {
                description: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON',
                type: 'object',
                additionalProperties: true,
                nullable: true,
                default: undefined,
                example: {
                    "data":"xxx",
                    "data_2": {"th":"xxx", "en":"xxx"},
                    "data_3":"xxx",
                    "data_4":"xxx"
                }
            },
            doc_type_id: {
                description: 'รหัสข้อมูลตารางข้อมูลประเภทเอกสาร จาก Master Lookup',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            status: {
                description: `สถานะการดำเนินงานของเอกสาร \n- 0 = ยกเลิก\n- 1 = รอดำเนินการ\n- 2 = อยู่ระหว่างดำเนินการ\n- 3 = อนุมัติ\n- 4 = ไม่อนุมัติ`,
                type: 'number',
                nullable: true,
                default: undefined,
                enum: [0, 1, 2, 3, 4]
            },
        },
    },
    tags: ['ShopInventoryPurchasingPreOrderDoc'],
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