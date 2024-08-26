/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopQuotationDoc/add
 */
const add = {
    description: 'เพิ่มข้อมูล ตารางข้อมูลเอกสารใบเสนอราคา - Quotation Document (QU Doc)',
    body: {
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้า',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            doc_type_id: {
                description: 'ประเภทเอกสาร',
                type: 'string',
                format: 'uuid',
                nullable: false,
                default: 'e5871484-d096-41be-b515-b33aa715957a',
                example: 'e5871484-d096-41be-b515-b33aa715957a'
            },
            doc_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                nullable: false,
                default: null,
                example: '2022-02-18'
            },
            bus_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            per_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            vehicles_customers_id: {
                description: 'รหัสตารางข้อมูลยานพาหนะ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            tax_type_id: {
                description: 'ประเภทภาษีมูลค่าเพิ่ม',
                type: 'string',
                format: 'uuid',
                nullable: false,
                default: null,
                example: '8c73e506-31b5-44c7-a21b-3819bb712321'
            },
            price_discount_bill: {
                description: 'ส่วนลดท้ายบิล',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            price_sub_total: {
                description: 'รวมเป็นเงิน',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            price_discount_total: {
                description: 'ส่วนลดรวม',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            price_amount_total: {
                description: 'ราคาหลังหักส่วนลด',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            price_before_vat: {
                description: 'ราคาก่อนรวมภาษี',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            price_vat: {
                description: 'ภาษีมูลค่าเพิ่ม',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            details: {
                description: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON แต่จะมี Key ที่สำคัญ ๆ ดังนี้\n'
                    + '{\n' +
                    '    "ref_doc": "เลขที่เอกสารอ้างอิง, เก็บเป็น string"\n' +
                    '}',
                type: 'object',
                additionalProperties: true,
                nullable: false,
                properties: {
                    ref_doc: {
                        description: 'เลขที่เอกสารอ้างอิง\n- เก็บเป็น string',
                        type: 'string',
                        default: '',
                        example: ''
                    }
                },
                example: {
                    "ref_doc": ""
                },
            },
            shopQuotationLists: {
                description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น Array',
                type: 'array',
                allowNull: false,
                items: {
                    description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น JSON',
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        seq_number: {
                            description: "ลำดับรายการ\n- เริ่มต้น 1\n- เลขต้องไม่ซ้ำกัน",
                            type: 'integer',
                            minimum: 1,
                            allowNull: false,
                            default: null
                        },
                        product_id: {
                            description: 'รหัสตารางข้อมูลรายการสินค้าในร้านค้า',
                            type: 'string',
                            format: 'uuid',
                            allowNull: false
                        },
                        purchase_unit_id: {
                            description: 'รหัสตารางข้อมูลประเภทหน่วยซื้อ',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: null
                        },
                        dot_mfd: {
                            description: 'รหัสวันที่ผลิต (DOT)',
                            type: ['string', 'null'],
                            pattern: '\^[0-9]{0,4}\$',
                            allowNull: true,
                            default: null
                        },
                        amount: {
                            description: 'จำนวนสินค้า',
                            type: 'string',
                            pattern: '\^[0-9]+\$',
                            allowNull: false,
                            default: '0'
                        },
                        price_unit: {
                            description: 'ราคาต่อหน่วย',
                            type: 'string',
                            // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: false,
                            default: '0.00'
                        },
                        price_discount: {
                            description: 'ส่วนลด (บาท)',
                            type: 'string',
                            // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: false,
                            default: '0.00'
                        },
                        price_discount_percent: {
                            description: 'ส่วนลด (%)',
                            type: 'string',
                            // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: false,
                            default: '0.00'
                        },
                        price_grand_total: {
                            description: 'จำนวนเงินสุทธิ',
                            type: 'string',
                            // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: false,
                            default: '0.00'
                        },
                        details: {
                            description: 'รายละเอียดเพิ่มเติมของรายการเก็บเป็น JSON',
                            type: 'object',
                            allowNull: false,
                            default: {},
                            example: {}
                        }
                    }
                },
                default: [],
            }
        },
    },
    tags: ['ShopQuotationDoc'],
    security: [
        {
            "apiKey": []
        }
    ]
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopQuotationDoc/all
 */
const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ในตารางข้อมูลเอกสารใบเสนอราคา - Quotation Document (QU Doc)',
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
                description: `สถานะเอกสาร\n - default = ใช้งานเอกสาร และยกเลิกเอกสาร\n - active = ใช้งานเอกสาร\n - block = ยกเลิกเอกสาร\n - delete = ลบเอกสาร`,
                type: 'string',
                default: 'default',
                enum: ['default', 'active', 'block', 'delete']
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
    tags: ['ShopQuotationDoc'],
    security: [
        {
            "apiKey": []
        }
    ]

};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopQuotationDoc/byId/:id
 */
const byId = {
    description: 'แสดงข้อมูลตารางข้อมูลเอกสารใบเสนอราคา - Quotation Document (QU Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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
    tags: ['ShopQuotationDoc'],
    security: [
        {
            "apiKey": []
        }
    ]
};


/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/shopQuotationDoc/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูลตารางข้อมูลเอกสารใบเสนอราคา - Quotation Document (QU Doc) แบบระบุรหัสหลักตารางข้อมูล (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
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
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้า',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
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
            vehicles_customers_id: {
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
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_sub_total: {
                description: 'รวมเป็นเงิน',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_discount_total: {
                description: 'ส่วนลดรวม',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_amount_total: {
                description: 'ราคาหลังหักส่วนลด',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_before_vat: {
                description: 'ราคาก่อนรวมภาษี',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_vat: {
                description: 'ภาษีมูลค่าเพิ่ม',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
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
                default: undefined,
                properties: {
                    ref_doc: {
                        description: 'เลขที่เอกสารอ้างอิง\n- เก็บเป็น string',
                        type: 'string',
                        default: '',
                        example: ''
                    }
                },
                example: {
                    "ref_doc": ""
                },
            },
            status: {
                description: `สถานะเอกสาร\n- 0 = ลบเอกสาร\n- 1 = ใช้งานเอกสาร\n- 2 = ยกเลิกเอกสาร`,
                type: 'number',
                enum: [0, 1, 2],
                nullable: true,
                default: undefined
            },
            shopQuotationLists: {
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
                        product_id: {
                            description: 'รหัสตารางข้อมูลรายการสินค้าในร้านค้า',
                            type: 'string',
                            format: 'uuid',
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
                        price_unit: {
                            description: 'ราคาต่อหน่วย',
                            type: 'string',
                            // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_discount: {
                            description: 'ส่วนลด (บาท)',
                            type: 'string',
                            // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_discount_percent: {
                            description: 'ส่วนลด (%)',
                            type: 'string',
                            // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_grand_total: {
                            description: 'จำนวนเงินสุทธิ',
                            type: 'string',
                            // pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
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
                            enum: [0, 1, 2],
                            nullable: true,
                            default: undefined
                        },
                    }
                },
                default: [],
            }
        }
    },
    tags: ['ShopQuotationDoc'],
    security: [
        {
            "apiKey": []
        }
    ]
};


/**
 * A swagger and fastify validator schema for
 * Route [DELETE] => /api/shopQuotationDoc/delete/:id
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
    tags: ['ShopQuotationDoc'],
    security: [
        {
            "apiKey": []
        }
    ]
};


module.exports = {
    add,
    all,
    byId,
    put,
    del
};