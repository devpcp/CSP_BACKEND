const tags = ['ShopTemporaryDeliveryOrderDoc'];
const security = [
    {
        apiKey: []
    }
];
const select_shop_ids = {
    description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- ถ้าเอาทุก Branch ที่มีให้ใส่ all \n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
    type: 'string',
    nullable: true,
    default: ''
};

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopTemporaryDeliveryOrderDoc/add
 */
const add = {
    description: 'เพิ่มข้อมูล ตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว - Service Temporary Delivery Order Document (TRN Doc)',
    body: {
        additionalProperties: false,
        properties: {
            shop_service_order_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารใบสั่งซ่อม - Service Order Document (JOB Doc)',
                type: 'string',
                format: 'uuid',
                nullable: false
            }
        },
    },
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopTemporaryDeliveryOrderDoc/all
 */
const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว - Service Temporary Delivery Order Document (TRN Doc)',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            search: {
                description: 'สิ่งที่ต้องกาค้นหา',
                type: 'string',
                default: ''
            },
            doc_date_startDate: {
                description: 'วันที่เอกสาร (เริ่มต้น)',
                type: 'string',
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            doc_date_endDate: {
                description: 'วันที่เอกสาร (สิ้นสุด)',
                type: 'string',
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            is_draft: {
                description: 'Filter ว่าให้แสดง เอกสารจริง หรือเอกสารร่าง \n- default = ไม่ Filter (แสดงทั้งหมด)\n- is_draft = ฉบับร่าง\n- not_draft = ฉบับจริง',
                type: 'string',
                enum: ['default', 'is_draft', 'not_draft'],
                default: 'default',
                example: 'default'
            },
            status: {
                description: `สถานะเอกสาร\n - default = ใช้งานเอกสาร และยกเลิกเอกสาร\n - active = ใช้งานเอกสาร\n - block = ยกเลิกเอกสาร\n - delete = ลบเอกสาร\n- all = แสดงทั้งหมด`,
                type: 'string',
                default: 'default',
                enum: ['default', 'active', 'block', 'delete', 'all']
            },
            ShopServiceOrderDoc__doc_sales_type: {
                description: 'ประเภทการขาย\n- 1 = ใบสั่งซ่อม\n- 2 = ใบสั่งขาย',
                type: 'number',
                nullable: true,
                enum: [1, 2],
                example: 1
            },
            ShopServiceOrderDoc__payment_paid_status: {
                description: 'ShopServiceOrderDoc Filter สถานะการชำระเงิน \n- 0 = ยกเลิกชำระ\n- 1 = ยังไม่ชำระ\n- 2 = ค้างชำระ\n- 3 = ชําระแล้ว\n- 4 = ชําระเกิน\n- 5 = ลูกหนี้การค้า',
                type: 'number',
                nullable: true,
                enum: [null, 0, 1, 2, 3, 4, 5],
                default: null,
                example: 1
            },
            ShopServiceOrderDoc__is_draft: {
                description: 'ShopServiceOrderDoc Filter ว่าให้แสดง เอกสารจริง หรือเอกสารร่าง \n- default = ไม่ Filter (แสดงทั้งหมด)\n- is_draft = ฉบับร่าง\n- not_draft = ฉบับจริง',
                type: 'string',
                enum: ['default', 'is_draft', 'not_draft'],
                default: 'default',
                example: 'default'
            },
            page: {
                description: 'แสดงผลในหน้าที่กำหนด',
                type: 'number',
                default: 1
            },
            limit: {
                description: 'จำนวนชุดข้อมูลที่จะแสดงผล',
                type: 'number',
                default: 10
            },
            sort: {
                description: 'เรียงข้อมูลจากฟิวส์...',
                type: 'string',
                enum: ['doc_date', 'created_date', 'updated_date'],
                default: 'doc_date'
            },
            order: {
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด',
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
            }
        }
    },
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopTemporaryDeliveryOrderDoc/byId/:id
 */
const byId = {
    description: 'แสดงข้อมูลตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว - Service Temporary Delivery Order Document (TRN Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางข้อมูล (Id)',
                type: 'string',
                format: 'uuid',
                allowNull: false,
                default: null
            }
        }
    },
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
        }
    },
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopTemporaryDeliveryOrderDoc/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูลตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว - Service Temporary Delivery Order Document (TRN Doc) แบบระบุรหัสหลักตารางข้อมูล (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'รหัสหลักตารางข้อมูล (Id)'
            }
        }
    },
    body: {
        additionalProperties: false,
        properties: {
            doc_type_id: {
                description: 'ประเภทเอกสาร',
                type: 'string',
                format: 'uuid',
                nullable: false,
                default: undefined
            },
            doc_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                nullable: true,
                default: undefined
            },
            bus_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
            per_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
            vehicle_customer_id: {
                description: 'รหัสตารางข้อมูลยานพาหนะ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
            tax_type_id: {
                description: 'ประเภทภาษีมูลค่าเพิ่ม',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
            price_discount_bill: {
                description: 'ส่วนลดท้ายบิล',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_discount_before_pay: {
                description: 'ส่วนลดก่อนชำระเงิน',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_sub_total: {
                description: 'รวมเป็นเงิน',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_discount_total: {
                description: 'ส่วนลดรวม',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_amount_total: {
                description: 'ราคาหลังหักส่วนลด',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_before_vat: {
                description: 'ราคาก่อนรวมภาษี',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_vat: {
                description: 'ภาษีมูลค่าเพิ่ม',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            details: {
                description: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON แต่จะมี Key ที่สำคัญ ๆ ดังนี้\n'
                    + '{\n' +
                    '    "ref_doc": "เลขที่เอกสารอ้างอิง, เก็บเป็น string"\n' +
                    '}',
                type: 'object',
                additionalProperties: true,
                nullable: true,
                default: undefined
            },
            status: {
                description: `สถานะเอกสาร\n- 0 = ลบเอกสาร\n- 1 = ใช้งานเอกสาร\n- 2 = ยกเลิกเอกสาร`,
                type: 'number',
                enum: [0, 1, 2],
                nullable: true,
                default: undefined
            },
            is_draft: {
                description: `เอกสารนี้เป็นฉบับบันทึกร่าง หรือฉบับจริง\n- true = เป็นบันทึกร่าง\n- false = เป็นฉบับจริง (ทำได้ครั้งเดียว)`,
                type: 'boolean',
                nullable: true,
                default: undefined
            },
            shopTemporaryDeliveryOrderLists: {
                description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น Array\n- กรณีที่ไม่มีค่า ฟิวส์ id เข้ามา ระบบจะตีว่าเป็นการเพิ่ม (Add) ข้อมูลการการ',
                type: 'array',
                allowNull: false,
                items: {
                    description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น JSON',
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        id: {
                            description: 'รหัสตารางข้อมูลประเภทหน่วยซื้อ\n - ถ้าไม่มี แปลว่าต้องการสร้างข้อมูลรายการตัวใหม่',
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                            default: undefined
                        },
                        seq_number: {
                            description: "ลำดับรายการ\n- เริ่มต้น 1\n- เลขต้องไม่ซ้ำกัน",
                            type: 'integer',
                            minimum: 1,
                            nullable: true,
                            default: undefined
                        },
                        shop_product_id: {
                            description: 'รหัสตารางข้อมูลรายการสินค้าในร้านค้า',
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                            default: undefined
                        },
                        shop_stock_id: {
                            description: 'รหัสหลักตารางข้อมูลสต๊อกสินค้า',
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                            default: undefined
                        },
                        shop_warehouse_id: {
                            description: 'รหัสหลักตารางข้อมูลคลังสินค้า',
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                            default: undefined
                        },
                        shop_warehouse_shelf_item_id: {
                            description: 'รหัสหลักตารางข้อมูลชั้นวางในคลังสินค้า',
                            type: 'string',
                            nullable: true,
                            default: undefined
                        },
                        purchase_unit_id: {
                            description: 'รหัสตารางข้อมูลประเภทหน่วยซื้อ',
                            type: ['string', 'null'],
                            format: 'uuid',
                            nullable: true,
                            default: undefined
                        },
                        dot_mfd: {
                            description: 'รหัสวันที่ผลิต (DOT)',
                            type: ['string', 'null'],
                            pattern: '\^[0-9]{0,4}\$',
                            nullable: true,
                            default: undefined
                        },
                        amount: {
                            description: 'จำนวนสินค้า',
                            type: 'string',
                            pattern: '\^[0-9]+\$',
                            nullable: true,
                            default: undefined
                        },
                        cost_unit: {
                            description: 'ราคาทุนต่อหน่วย',
                            type: 'string',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: false,
                            default: '0.00'
                        },
                        price_unit: {
                            description: 'ราคาต่อหน่วย',
                            type: 'string',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_discount: {
                            description: 'ส่วนลด (บาท)',
                            type: 'string',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_discount_percent: {
                            description: 'ส่วนลด (%)',
                            type: 'string',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_grand_total: {
                            description: 'จำนวนเงินสุทธิ',
                            type: 'string',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        details: {
                            description: 'รายละเอียดเพิ่มเติมของรายการเก็บเป็น JSON',
                            type: 'object',
                            nullable: true,
                            default: undefined
                        },
                        status: {
                            description: `สถานะรายการ\n- 0 = ลบรายการ\n- 1 = ใช้งานรายการ`,
                            type: 'number',
                            enum: [0, 1],
                            nullable: true,
                            default: undefined
                        }
                    }
                },
                default: [],
            }
        }
    },
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [DELETE] => /api/shopTemporaryDeliveryOrderDoc/delete/:id
 */
const del = {
    description: 'ลบข้อมูลตารางข้อมูลเอกสารใบเสนอราคา - Quotation Document (QU Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางข้อมูล (Id)',
                type: 'string',
                format: 'uuid',
                allowNull: false,
                default: null
            }
        }
    },
    tags: tags,
    security: security
};


module.exports = {
    add,
    all,
    byId,
    put,
    del
};