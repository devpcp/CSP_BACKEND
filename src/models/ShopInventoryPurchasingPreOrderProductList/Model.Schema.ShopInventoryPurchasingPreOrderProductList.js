const add = {
    description: 'เพิ่มข้อมูล ในตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ',
    body: {
        additionalProperties: false,
        required: ['shop_id', 'product_id', 'amount', 'pre_order_date', 'doc_inventory_purchasing_pre_order_id'],
        properties: {
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้า',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            product_id: {
                description: 'รหัสตารางข้อมูลสินค้าภายในร้านค้าแต่ละร้าน',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            amount: {
                description: `จำนวนที่สั่งซื้อ`,
                type: 'string',
                pattern: `^(\\-)?[0-9]+$`,
                nullable: false
            },
            pre_order_date: {
                description: 'วันที่สั่งซื้อ',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: false,
                example: '2022-02-18'
            },
            doc_inventory_purchasing_pre_order_id: {
                description: `รหัสตารางข้อมูลเอกสารการสั่งซื้อสินค้าของแต่ละร้านค้า`,
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            details: {
                description: 'รรายละเอียดข้อมูลเพิ่มเตินของสินค้านั้นๆ เก็บเป็น JSON',
                type: 'object',
                additionalProperties: true,
                nullable: false,
                default: {},
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            status: {
                description: `สถานะของการสั่งซื้อสินค้านั้นๆ \n- 0 = ยกเลิก\n- 1 = สั่งซื้อสำเร็จครบถ้วน\n- 2 = สั่งซื้อสำเร็จบางส่วน`,
                type: 'number',
                enum: [0, 1, 2],
                nullable: false,
                default: 1,
                example: 1
            }
        }
    },
    tags: ['ShopInventoryPurchasingPreOrderProductList'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ในตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: {
                description: 'สิ่งที่ต้องกาค้นหา',
                type: 'string',
                default: ''
            },
            limit: {
                description: 'จำนวนชุดข้อมูลที่จะแสดงผล',
                type: 'number',
                default: 10
            },
            page: {
                description: 'แสดงผลในหน้าที่กำหนด',
                type: 'number',
                default: 1
            },
            sort: {
                description: 'เรียงข้อมูลจากฟิวส์...',
                type: 'string',
                enum: ['created_date', 'updated_date'],
                default: 'created_date'
            },
            order: {
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด',
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
            },
            status: {
                description: `สถานะการดำเนินงานของเอกสาร \n- default = ไม่สนใจ \n- 0 = ยกเลิก\n- 1 = สั่งซื้อสำเร็จครบถ้วน\n- 2 = สั่งซื้อสำเร็จบางส่วน`,
                type: 'string',
                default: 'default',
                enum: ['default', '0', '1', '2']
            }
        }
    },
    tags: ['ShopInventoryPurchasingPreOrderProductList'],
    security: [
        {
            "apiKey": []
        }
    ]

};


const byid = {
    description: 'แสดงข้อมูล ในตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ แบบระบุรหัสหลักตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ (Id)',
                type: 'string',
                format: 'uuid'
            }
        }
    },
    tags: ['ShopInventoryPurchasingPreOrderProductList'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const put = {
    description: 'แก้ไขข้อมูล ในตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ แบบระบุรหัสหลักตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ (Id)',
                type: 'string',
                format: 'uuid'
            }
        }
    },
    body: {
        additionalProperties: false,
        properties: {
            shop_id: {
                ...add.body.properties.shop_id,
                nullable: false,
                default: undefined,
                example: '',
            },
            product_id: {
                ...add.body.properties.product_id,
                nullable: false,
                default: undefined,
                example: '',
            },
            amount: {
                ...add.body.properties.amount,
                nullable: false,
                default: undefined,
                example: '1',
            },
            pre_order_date: {
                ...add.body.properties.pre_order_date,
                nullable: false,
                default: undefined,
                example: '',
            },
            doc_inventory_purchasing_pre_order_id: {
                ...add.body.properties.doc_inventory_purchasing_pre_order_id,
                nullable: false,
                default: undefined,
                example: '',
            },
            ref_pr_doc_inventory_purchasing_pre_order_id: {
                description: `อ้างอิงเอกสารรายการขอซื้อ PR สำหรับ PO`,
                type: 'string',
                format: 'uuid',
                nullable: true
            },
            ref_po_doc_inventory_purchasing_pre_order_id: {
                description: `อ้างอิงเอกสารรายการสั่งซื้อ PO สำหรับใบส่งคืนสินค้า Return Receipt`,
                type: 'string',
                format: 'uuid',
                nullable: true
            },
            details: {
                ...add.body.properties.details,
                nullable: false,
                default: undefined
            },
            status: {
                ...add.body.properties.status,
                nullable: false,
                default: undefined
            },
        },
    },
    tags: ['ShopInventoryPurchasingPreOrderProductList'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const del = {
    ...byid,
    description: 'ลบข้อมูล ในตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ แบบระบุรหัสหลักตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ (Id)',
};


module.exports = {
    add,
    all,
    byid,
    put,
    del
};