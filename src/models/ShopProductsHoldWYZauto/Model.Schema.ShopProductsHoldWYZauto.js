const add = {
    description: 'เพิ่มข้อมูล WYZAuto',
    body: {
        additionalProperties: false,
        required: ['products'],
        properties: {
            products: {
                type: "array",
                items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        warehouse_id: {
                            description: 'Warehouse UUID',
                            type: 'string',
                            format: 'uuid',
                            nullable: false
                        },
                        shelfItem_id: {
                            description: 'ShelfItem Id',
                            type: 'string',
                            nullable: false
                        },
                        wyz_code: {
                            description: 'รหัส SKU ที่ฝั่ง CSP และ WYZAuto ที่มีเหมือนกัน',
                            type: 'string',
                            nullable: false
                        },
                        dot: {
                            description: 'รหัส DOT ที่ฝั่ง CSP และ WYZAuto ที่มีเหมือนกัน',
                            type: 'string',
                            nullable: false
                        },
                        price: {
                            description: 'ราคาต่อหน่วย',
                            type: 'number',
                            nullable: false
                        },
                        stock: {
                            description: 'จำนวน Stock ที่ต้องการส่งไปยัง WYZAuto',
                            type: 'number',
                            nullable: false
                        },
                    }
                }
            }
        }
    },
    tags: ['ShopProductsHoldWYZauto'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล WYZAuto',
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
                enum: ['created_date', 'updated_date', 'start_date', 'end_date'],
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
    tags: ['ShopProductsHoldWYZauto'],
    security: [
        {
            "apiKey": []
        }
    ]

};


const byid = {
    description: 'แสดงข้อมูล WYZAuto แบบระบุรหัสหลักตารางรางข้อมูลรายการสินค้าที่สั่งซื้อ (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลัก WYZAuto (Id)',
                type: 'string',
                format: 'uuid'
            }
        }
    },
    tags: ['ShopProductsHoldWYZauto'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const put = {
    description: 'แก้ไขข้อมูล ใน WYZAuto แบบระบุรหัส WYZAuto (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลัก WYZAuto (Id)',
                type: 'string',
                format: 'uuid'
            }
        }
    },
    body: {
        additionalProperties: false,
        properties: {
            stock: {
                description: 'จำนวน Stock ที่ต้องการส่งไปยัง WYZAuto (ตอนนี้ ที่ได้แค่ส่ง 0 มา เพื่อยกเลิก)',
                type: 'number',
                nullable: false
            },
        },
    },
    tags: ['ShopProductsHoldWYZauto'],
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