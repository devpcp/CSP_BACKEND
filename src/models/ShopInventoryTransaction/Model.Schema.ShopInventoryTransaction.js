const select_shop_ids = {
    description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- ถ้าเอาทุก Branch ที่มีให้ใส่ all \n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
    type: 'string',
    nullable: true,
    default: ''
};

const add = {
    description: 'เพิ่มข้อมูล ในตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง',
    body: {
        additionalProperties: false,
        required: ['shop_id', 'doc_date', 'details', 'doc_type_id', 'status'],
        properties: {
            shop_id: {
                type: 'string',
                format: 'uuid',
                nullable: false,
                description: 'รหัสข้อมูลร้านค้า',
                // example: '',
            },
            bus_partner_id: {
                type: 'string',
                format: 'uuid',
                nullable: false,
                description: 'รหัสตารางข้อมูลคู่ค้า',
                // example: '',
            },
            doc_date: {
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: false,
                description: 'วันที่เอกสาร',
                example: '2022-02-18'
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            details: {
                type: 'object',
                additionalProperties: true,
                nullable: false,
                description: 'รายละเอียดข้อมูลเอกสารนำเข้าสินค้า',
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            doc_type_id: {
                type: 'string',
                format: 'uuid',
                nullable: false,
                description: 'ประเภทเอกสาร',
                // example: '',
            },
            status: {
                type: 'number',
                enum: [0, 1, 2, 3],
                nullable: false,
                description: 'สถานะการนำเข้าสินค้าสู่คลัง  \n- 0 = ยกเลิก \n1 = นำเข้าปกติ \n2 = ปรับเพิ่ม \n3 = ปรับลด',
                example: 1
            },
            use_stock: {
                description: 'ตัด Stock ไหม',
                type: 'boolean',
                nullable: true,
                default: true
            },
            ShopInventory_Add: {
                description: 'เมื่อเพิ่มรายการสินค้า ของใบนำเข้า ให้ใส่ตรงนี้',
                type: 'object',
                nullable: true,
                default: undefined,
                properties: {
                    product_list: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['product_id', 'warehouse_detail', 'amount_all'],
                            properties: {
                                product_id: { type: 'string', format: 'uuid', example: '3b99b737-205d-4366-9def-60d2d1abbdb8' },
                                warehouse_detail: {
                                    required: ['warehouse', 'shelf'],
                                    type: 'array', items: {
                                        warehouse: { type: 'string', format: 'uuid' },
                                        shelf: {
                                            type: 'object', properties: {
                                                item: {
                                                    type: 'string',
                                                },
                                                amount: {
                                                    type: 'number',
                                                }
                                            }
                                        }
                                    },
                                    example:
                                        [
                                            {
                                                "warehouse": "30f56783-d3e8-4697-b28a-a1421502328b",
                                                "shelf":
                                                {
                                                    "item": "num shelf 1", "amount": 3
                                                }
                                            },
                                            {
                                                "warehouse": "30f56783-d3e8-4697-b28a-a1421502328b",
                                                "shelf":
                                                {
                                                    "item": "num shelf 1", "amount": 3
                                                }
                                            }
                                        ]
                                },
                                amount_all: { type: 'number' },
                                details: {
                                    type: 'object', properties: {
                                        price: { example: "1000" },
                                        discount_percentage_1: { example: "2" },
                                        discount_percentage_2: { example: "0" },
                                        discount_thb: { example: "980" },
                                    }
                                },
                            }
                        }
                    },
                    import_date: { type: 'string', example: '2021-12-30' },
                }
            }
        },
    },
    tags: ['ShopInventoryTransaction'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const addbyfile = {
    description: 'เพิ่มข้อมูล ในตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลังด้วย xlsx',
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['file'],
        additionalProperties: false,
        properties: {
            file: {
                isFileType: true,
            }
        },
    },
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            check_data: {
                type: 'boolean',
                default: false,
                description: ' to check product found or not found first'
            },
            adjust_balance: {
                type: 'boolean',
                default: false,
                description: 'ปรับ balance'
            }
        },
    },
    tags: ['ShopInventoryTransaction'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ในตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
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
                enum: ['created_date', 'doc_date'],
                default: 'created_date',
                description: 'เรียงข้อมูลจากฟิวส์...'
            },
            order: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc',
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด'
            },
            doc_type_id: {
                type: 'string',
                format: 'uuid',
                description: 'ประเภทเอกสาร'
            },
            product_id: { type: 'string', format: 'uuid', description: 'id ของ shop product' },
            payment_paid_status: {
                description: 'Filter สถานะการชำระเงิน \n- 0 = ยกเลิกชำระ\n- 1 = ยังไม่ชำระ\n- 2 = ค้างชำระ\n- 3 = ชําระแล้ว\n- 4 = ชําระเกิน\n- 5 = เจ้าหนี้การค้า',
                type: 'number',
                nullable: true,
                enum: [null, 0, 1, 2, 3, 4, 6],
                default: null,
                example: 6
            },
            filter__debt_price_amount_left: {
                description: 'จำนวนเงินเจ้าหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ) ที่ไม่มี 0',
                type: 'boolean',
                nullable: true,
                default: false
            },
            status: {
                type: 'string',
                default: 'default',
                enum: ['default', '0', '1'],
                description: `สถานะการนำเข้าสินค้าสู่คลัง \n- default = เลือกทุกอย่างยกเว้นยกเลิก, \n- 0 = ยกเลิก \n- 1 = ปกติ`
            },
            select_destination_id: {
                type: 'string', format: 'uuid',
                description: 'เลือกเฉพาะใบโอนที่สาขาปลายทางเป็นตัวเอง จะส่งแค่กับใบรับโอนระหว่างสาขา'
            }
        }
    },
    tags: ['ShopInventoryTransaction'],
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
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลักตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง (Id)'
            }
        }
    },
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            shop_id: {
                description: 'กรองข้อมูลตาม Shop Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
        },
    },
    tags: ['ShopInventoryTransaction'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const put = {
    description: 'แก้ไขข้อมูล ในตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง แบบระบุรหัสหลักตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลักตารางข้อมูลเอกสารนำเข้าสินค้าสู่คลัง (Id)'
            }
        }
    },
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids

        }
    },
    body: {
        additionalProperties: false,
        properties: {
            shop_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                description: 'รหัสข้อมูลร้านค้า',
                example: '',
            },
            bus_partner_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                description: 'รหัสตารางข้อมูลคู่ค้า',
                example: '',
            },
            doc_date: {
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: undefined,
                description: 'วันที่เอกสาร',
                example: '2022-02-18'
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            use_stock: {
                description: 'ตัด Stock ไหม',
                type: 'boolean',
                nullable: true,
                default: true
            },
            details: {
                type: 'object',
                additionalProperties: true,
                nullable: true,
                default: undefined,
                description: 'รายละเอียดข้อมูลเอกสารนำเข้าสินค้า',
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            doc_type_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                description: 'ประเภทเอกสาร',
                example: '',
            },
            status: {
                type: 'number',
                nullable: true,
                default: undefined,
                enum: [0, 1, 2, 3],
                description: 'สถานะการนำเข้าสินค้าสู่คลัง  \n- 0 = ยกเลิก \n1 = นำเข้าปกติ \n2 = ปรับเพิ่ม \n3 = ปรับลด',
            },
            ShopInventory_Put: {
                description: 'เมื่อแก้ไขรายการสินค้า ของใบนำเข้า ให้ใส่ตรงนี้',
                type: 'object',
                nullable: true,
                default: undefined,
                properties: {
                    product_list: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['product_id', 'warehouse_detail', 'amount_all'],
                            properties: {
                                product_id: { type: 'string', format: 'uuid', example: '3b99b737-205d-4366-9def-60d2d1abbdb8' },
                                warehouse_detail: {
                                    required: ['warehouse', 'shelf'],
                                    type: 'array', items: {
                                        warehouse: { type: 'string', format: 'uuid' },
                                        shelf: {
                                            type: 'object', properties: {
                                                item: {
                                                    type: 'string',
                                                },
                                                amount: {
                                                    type: 'number',
                                                }
                                            }
                                        }
                                    },
                                    example:
                                        [
                                            {
                                                "warehouse": "30f56783-d3e8-4697-b28a-a1421502328b",
                                                "shelf":
                                                {
                                                    "item": "num shelf 1", "amount": 3
                                                }
                                            },
                                            {
                                                "warehouse": "30f56783-d3e8-4697-b28a-a1421502328b",
                                                "shelf":
                                                {
                                                    "item": "num shelf 1", "amount": 3
                                                }
                                            }
                                        ]
                                },
                                amount_all: { type: 'number' },
                                details: {
                                    type: 'object', properties: {
                                        price: { example: "1000" },
                                        discount_percentage_1: { example: "2" },
                                        discount_percentage_2: { example: "0" },
                                        discount_thb: { example: "980" },
                                    }
                                },
                            }
                        }
                    },
                    import_date: { type: 'string', example: '2021-12-30' },
                }
            }
        },
    },
    tags: ['ShopInventoryTransaction'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const importHistory = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ประวัติการนำเข้าสินค้า',
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
                enum: ['code_id', 'doc_date'],
                default: 'code_id',
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
                enum: ['default', '0', '1'],
                description: `สถานะการนำเข้าสินค้าสู่คลัง \n- default = ไม่สนใจ, \n- 0 = ยกเลิก \n- 1 = ปกติ`
            },
            doc_inventory_id: { type: 'string', format: 'uuid' },
            bus_partner_id: { type: 'string', format: 'uuid' },
            doc_date__startDate: { type: 'string' },
            doc_date__endDate: { type: 'string' },
            product_id: { type: 'string', format: 'uuid', description: 'id ของ master product' },
            shop_product_id: { type: 'string', format: 'uuid', description: 'id ของ shop product' }
        }
    },
    tags: ['ShopInventoryTransaction'],
    security: [
        {
            "apiKey": []
        }
    ]

};


module.exports = {
    add,
    all,
    addbyfile,
    byid,
    put,
    importHistory
};