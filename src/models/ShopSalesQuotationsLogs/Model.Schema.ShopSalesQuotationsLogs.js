/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopSalesQuotationsLogs/add
 */
const add = {
    description: `เพิ่ม ชุดข้อมูลไปยัง "ตารางข้อมูลรายการสินค้าที่นำเสนอราคา บันทึกเป็น Logs" (ShopSalesQuotationsLogs)`,
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['shop_id', 'product_id', 'amount', 'doc_sale_id', 'details'],
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
            amount: {
                description: 'จำนวนรวมสินค้าที่เสนอราคา',
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
                description: 'รายละเอียดข้อมูลสินค้าที่เสนอขาย เก็บเป็น JSON',
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
    tags: ['ShopSalesQuotationsLogs'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopSalesQuotationsLogs/all
 */
const all = {
    description: `แสดงข้อมูลของ "ตารางข้อมูลรายการสินค้าที่นำเสนอราคา บันทึกเป็น Logs" (ShopSalesQuotationsLogs)`,
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
                enum: ['default', '0', '1', '2', '3'],
                default: 'default',
                description: `สถานะเอกสาร\n- 0 = ยกเลิก\n- 1 = รอเสนอราคา\n- 2 = ส่งเสนอราคาลูกค้าเรียบร้อย\n- 3 = ลูกค้าอนุมัติซื้อ`,
            }
        }
    },
    tags: ['ShopSalesQuotationsLogs'],
    security: [
        {
            'apiKey': []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopSalesQuotationsLogs/byid/:id
 */
const byid = {
    description: 'แสดงข้อมูล "ตารางข้อมูลรายการสินค้าที่นำเสนอราคา บันทึกเป็น Logs" (ShopSalesQuotationsLogs) แบบระบุรหัส (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลักตารางข้อมูลรายการสินค้าที่นำเสนอราคา (Id)'
            }
        }
    },
    tags: ['ShopSalesQuotationsLogs'],
    security: [
        {
            "apiKey": []
        }
    ]
};

/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopSalesQuotationsLogs/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูล "ตารางข้อมูลรายการสินค้าที่นำเสนอราคา บันทึกเป็น Logs" (ShopSalesQuotationsLogs) แบบระบุรหัส (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: byid.params.properties.id
        }
    },
    body: {
        additionalProperties: false,
        properties: {
            shop_id: {
                ...add.body.properties.shop_id,
                nullable: true,
                default: undefined,
                example: ''
            },
            product_id: {
                ...add.body.properties.product_id,
                nullable: true,
                default: undefined,
                example: ''
            },
            amount: {
                ...add.body.properties.amount,
                nullable: true,
                default: undefined
            },
            doc_sale_id: {
                ...add.body.properties.doc_sale_id,
                nullable: true,
                default: undefined,
                example: ''
            },
            details: {
                ...add.body.properties.details,
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
                enum: [0, 1, 2, 3],
                description: `สถานะเอกสาร\n- 0 = ยกเลิก\n- 1 = รอเสนอราคา\n- 2 = ส่งเสนอราคาลูกค้าเรียบร้อย\n- 3 = ลูกค้าอนุมัติซื้อ`,
            },
        },
    },
    tags: ['ShopSalesQuotationsLogs'],
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