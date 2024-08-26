const tags = ['ShopTaxInvoiceDoc'];
const security = [
    {
        apiKey: []
    }
];

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopTaxInvoiceDoc/add
 */
const add = {
    description: 'เพิ่มข้อมูล ตารางข้อมูลเอกสารใบกำกับภาษี - Tax Invoice Document (ABB/INV Doc)',
    body: {
        additionalProperties: false,
        properties: {
            shop_service_order_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารใบสั่งซ่อม - Service Order Document (JOB Doc)',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            is_abb: {
                description: 'เป็นเอกสารใบกำกับภาษีอย่างย่อหรือไม่',
                type: 'boolean',
                nullable: false,
                default: false
            },
            is_inv: {
                description: 'เป็นเอกสารใบกำกับภาษีเต็มรูปหรือไม่',
                nullable: false,
                default: false
            }
        },
    },
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopTaxInvoiceDoc/all
 */
const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ตารางข้อมูลเอกสารใบกำกับภาษี - Tax Invoice Document (ABB/INV Doc)',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
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
            status: {
                description: `สถานะเอกสาร\n - default = ใช้งานเอกสาร และยกเลิกเอกสาร\n - active = ใช้งานเอกสาร\n - block = ยกเลิกเอกสาร\n - delete = ลบเอกสาร\n - all = ทั้งหมด`,
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
                enum: ['abb_doc_date', 'inv_doc_date', 'created_date', 'updated_date'],
                default: 'created_date'
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
 * Route [GET] => /api/shopTaxInvoiceDoc/byId/:id
 */
const byId = {
    description: 'แสดงข้อมูลตารางข้อมูลเอกสารใบกำกับภาษี - Tax Invoice Document (ABB/INV Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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


/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopTaxInvoiceDoc/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูลตารางข้อมูลเอกสารใบกำกับภาษี - Tax Invoice Document (ABB/INV Doc) แบบระบุรหัสหลักตารางข้อมูล (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
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
            is_abb: {
                description: 'เป็นเอกสารใบกำกับภาษีอย่างย่อหรือไม่',
                type: 'boolean',
                nullable: true,
                default: undefined
            },
            is_inv: {
                description: 'เป็นเอกสารใบกำกับภาษีเต็มรูปหรือไม่',
                type: 'boolean',
                nullable: true,
                default: undefined
            },
            status: {
                description: 'สถาณะเอกสาร (ไม่ต้องใส่มาถ้าไม่ยกเลิก)\n- 2 = ยกเลิกเอกสาร',
                type: 'number',
                nullable: true,
                default: undefined
            },
            edit_price: {
                type: 'boolean',
                description: 'แก้ไขราคาทั้งหัวและรายงาน',
                defualt: undefined,
                nullable: true,
            },
            edit_amount: {
                type: 'boolean',
                description: 'แก้ไขราคาจำนวน (not available now)',
                defualt: undefined,
                nullable: true,
            },
            inv_doc_date: { type: 'string', defualt: undefined, nullable: true },
            bus_customer_id: { type: 'string', format: 'uuid', defualt: undefined, nullable: true },
            per_customer_id: { type: 'string', format: 'uuid', defualt: undefined, nullable: true },
            vehicle_customer_id: { type: 'string', format: 'uuid', defualt: undefined, nullable: true },
            tax_type_id: { type: 'string', format: 'uuid', defualt: undefined, nullable: true },
            vat_type: { type: 'number', defualt: undefined, nullable: true },
            vat_rate: { type: 'string', defualt: undefined, nullable: true },
            price_discount_bill: { defualt: undefined, nullable: true },
            price_discount_before_pay: { defualt: undefined, nullable: true },
            price_sub_total: { defualt: undefined, nullable: true },
            price_discount_total: { defualt: undefined, nullable: true },
            price_amount_total: { defualt: undefined, nullable: true },
            price_before_vat: { defualt: undefined, nullable: true },
            price_vat: { defualt: undefined, nullable: true },
            price_grand_total: { defualt: undefined, nullable: true },
            details: {
                type: 'object',
                defualt: undefined,
                nullable: true
            },
            ShopTaxInvoiceLists: {
                type: 'array',
                items: {
                    type: 'object',
                    defualt: undefined,
                    nullable: true,
                    required: ['id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        cost_unit: { defualt: undefined, nullable: true },
                        price_unit: { defualt: undefined, nullable: true },
                        price_discount: { defualt: undefined, nullable: true },
                        price_discount_percent: { defualt: undefined, nullable: true },
                        price_grand_total: { defualt: undefined, nullable: true },
                        proportion_discount_ratio: { defualt: undefined, nullable: true },
                        proportion_discount_price: { defualt: undefined, nullable: true },
                        details: {
                            type: 'object',
                            defualt: undefined,
                            nullable: true
                        },
                    },
                }
            }

        }
    },
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [DELETE] => /api/shopTaxInvoiceDoc/delete/:id
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