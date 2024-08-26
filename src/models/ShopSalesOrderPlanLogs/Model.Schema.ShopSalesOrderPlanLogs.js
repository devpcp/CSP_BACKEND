/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopSalesOrderPlanLogs/add
 */
const add = {
    description: `เพิ่ม ชุดข้อมูลไปยัง "ตารางข้อมูลการจัดการสินค้าในคลัง บันทึกเป็น Logs" (ShopSalesOrderPlanLogs)`,
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['shop_id', 'product_id', 'warehouse_detail', 'amount', 'doc_sale_id', 'details'],
        properties: {
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้า',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            product_id: {
                description: 'รหัสตารางข้อมูลสินค้า',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            warehouse_detail: {
                description: 'ระบบการจองสินค้าจากคลังสินค้าเก็บเป็น JSON',
                type: 'object',
                additionalProperties: true,
                example: {
                    "warehouse": "UUID",
                    "shelf": [
                        {
                            "item":"num shelf 1",
                            "purchase_unit_id":"UUID ของหน่อยซื้อ",
                            "amount":"จำนวนสินค้า"
                        },
                        {
                            "item":"num shelf 2",
                            "purchase_unit_id":"UUID ของหน่อยซื้อ",
                            "dot_mfd":"วันที่ผลิตหรือสัปดาห์การผลิต",
                            "amount":"จำนวนสินค้า",
                        }
                    ]
                }
            },
            amount: {
                description: 'จำนวนนับรวมสินค้าที่จะเบิก',
                type: 'string',
                pattern: `^(\\-)?[0-9]+$`,
                nullable: false
            },
            doc_sale_id: {
                description: 'รหัสหลักตารางข้อมูลเอกสาร',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            details: {
                description: 'รายละเอียดข้อมูลสินค้าในการซ่อมครั้งนั้น ๆ เก็บเป็น JSON',
                type: 'object',
                additionalProperties: true,
                example: {
                    "price": "1000",
                    "discount_percentage_1": "2",
                    "discount_percentage_2": "0",
                    "discount_thb": "980",
                }
            }
        }
    },
    tags: ['ShopSalesOrderPlanLogs'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopSalesOrderPlanLogs/all
 */
const all = {
    description: `แสดงข้อมูลของ "ตารางข้อมูลการจัดการสินค้าในคลัง บันทึกเป็น Logs" (ShopSalesOrderPlanLogs)`,
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
                enum: ['default', '0', '1', '2'],
                default: 'default',
                description: `สถานะเอกสาร \n- default = ไม่กรองเงื่อนไขนี้ \n- 0 = ยกเลิก \n- 1 = อยู่ระหว่างดำเนินการ \n- 2 = ดำเนินการเรียบร้อย`,
            },
            "jsonField.details": {
                type: 'string',
                nullable: true,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาฟิวส์ JSON "details" โดยให้ใส่ค่า Key ภายในฟิวส์ JSON ดังกล่าวไป\n- example: "data"\n- example: "data_2,"\n- example: "data,data_2"`
            },
            "jsonField.warehouse_detail": {
                type: 'string',
                nullable: true,
                description: `Optional (ไม่ต้องใส่ก็ได้): ค้นหาฟิวส์ JSON "warehouse_detail" โดยให้ใส่ค่า Key ภายในฟิวส์ JSON ดังกล่าวไป\n- example: "data"\n- example: "data_2,"\n- example: "data,data_2"`
            }
        }
    },
    tags: ['ShopSalesOrderPlanLogs'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopSalesOrderPlanLogs/byid/:id
 */
const byid = {
    description: 'แสดงข้อมูล "ตารางข้อมูลการจัดการสินค้าในคลัง บันทึกเป็น Logs" (ShopSalesOrderPlanLogs) แบบระบุรหัส (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลัก "รหัสหลักตารางข้อมูลการจัดการสินค้าในคลัง" (Id)'
            }
        }
    },
    tags: ['ShopSalesOrderPlanLogs'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopSalesOrderPlanLogs/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูล "ตารางข้อมูลการจัดการสินค้าในคลัง บันทึกเป็น Logs" (ShopSalesOrderPlanLogs) แบบระบุรหัส (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลัก "รหัสหลักตารางข้อมูลการจัดการสินค้าในคลัง" (Id)'
            }
        }
    },
    body: {
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้า',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            product_id: {
                description: 'รหัสตารางข้อมูลสินค้า',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            warehouse_detail: {
                description: 'ระบบการจองสินค้าจากคลังสินค้าเก็บเป็น JSON',
                type: 'object',
                required: ["warehouse", "shelf"],
                additionalProperties: true,
                nullable: true,
                default: undefined,
                properties: {
                    "warehouse": {
                        type: 'string',
                        format: 'uuid'
                    },
                    "shelf": {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ["item", "amount"],
                            additionalProperties: true,
                            oneOf: [
                                {
                                    required: ["item", "amount"],
                                },
                                {
                                    required: ["item", "dot", "amount"],
                                }
                            ],
                            properties: {
                                "item": { type: 'string' },
                                "dot": {
                                    type: 'string',
                                    nullable: true,
                                    default: undefined
                                },
                                "amount": {
                                    type: 'string',
                                    pattern: "^([0-9]){1}[0-9]*"
                                },
                            }
                        }
                    },
                },
                example: {
                    "warehouse": "UUID",
                    "shelf": [
                        {
                            "item":"num shelf 1",
                            "purchase_unit_id":"UUID ของหน่อยซื้อ",
                            "amount":"จำนวนสินค้า"
                        },
                        {
                            "item":"num shelf 2",
                            "purchase_unit_id":"UUID ของหน่อยซื้อ",
                            "dot_mfd":"วันที่ผลิตหรือสัปดาห์การผลิต",
                            "amount":"จำนวนสินค้า",
                        }
                    ]
                }
            },
            amount: {
                description: 'จำนวนนับรวมสินค้าที่จะเบิก',
                type: 'string',
                pattern: `^(\\-)?[0-9]+$`,
                nullable: true,
                default: undefined
            },
            doc_sale_id: {
                description: 'รหัสหลักตารางข้อมูลเอกสาร',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: ''
            },
            details: {
                description: 'รายละเอียดข้อมูลสินค้าในการซ่อมครั้งนั้น ๆ เก็บเป็น JSON',
                type: 'object',
                additionalProperties: true,
                nullable: true,
                default: undefined,
                example: {
                    "price": "1000",
                    "discount_percentage_1": "4",
                    "discount_percentage_2": "0",
                    "discount_thb": "960",
                }
            },
            status: {
                type: 'number',
                nullable: true,
                default: undefined,
                enum: [0, 1, 2],
                description: `สถานะเอกสาร \n- 0 = ยกเลิก \n- 1 = อยู่ระหว่างดำเนินการ \n- 2 = ดำเนินการเรียบร้อย`,
            },
        },
    },
    tags: ['ShopSalesOrderPlanLogs'],
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
}