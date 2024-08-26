const tags = ['ShopCustomerDebtDoc'];
const security = [
    {
        apiKey: []
    }
];

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopCustomerDebtDoc/add
 */
const add = {
    description: 'เพิ่มข้อมูล ตารางข้อมูลเอกสารลูกหนี้การค้า - Customer Debt Document (CDD Doc)',
    body: {
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้า',
                type: 'string',
                format: 'uuid',
                nullable: false,
                example: 'e5871484-d096-41be-b515-b33aa715957x'
            },
            doc_type_id: {
                description: 'ประเภทเอกสาร',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: 'e5871484-d096-41be-b515-b33aa715957x'
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
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ (เลือกอย่างใดอย่างหนึ่ง ระหว่าง bus_customer_id กับ per_customer_id)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: 'e5871484-d096-41be-b515-b33aa715957x'
            },
            per_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา (เลือกอย่างใดอย่างหนึ่ง ระหว่าง bus_customer_id กับ per_customer_id)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: 'e5871484-d096-41be-b515-b33aa715957x'
            },
            customer_credit_debt_unpaid_balance: {
                description: 'จำนวนหนี้ค้างชำระ',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: true,
                default: null,
                example: '0.00'
            },
            customer_credit_debt_current_balance: {
                description: 'วงเงินหนี้คงเหลือ',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: true,
                default: null,
                example: '0.00'
            },
            customer_credit_debt_approval_balance: {
                description: 'วงเงินหนี้อนุมัติ',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: true,
                default: null,
                example: '0.00'
            },
            customer_credit_debt_payment_period: {
                description: 'ระยะเวลาชำระหนี้',
                type: ['string', 'null'],
                pattern: '\^([0-9]+){1}\$',
                allowNull: true,
                default: null,
                example: '0'
            },
            debt_price_paid_total: {
                description: 'จำนวนเงินชำระลูกหนี้การค้ารวมทั้งสิ้น',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: true,
                default: null,
                example: '0.00'
            },
            debt_due_date: {
                description: 'วันครบกำหนดชำระหนี้',
                type: 'string',
                pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                nullable: false,
                default: null,
                example: '2022-02-18'
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
                }
            },
            shopCustomerDebtLists: {
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
                        shop_customer_debt_dn_doc_id: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true
                        },
                        shop_customer_debt_cn_doc_id: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true
                        },
                        shop_customer_debt_cn_doc_id_t2: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า ไม่คิดภาษี',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true
                        },
                        shop_service_order_doc_id: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true
                        },
                        doc_date: {
                            description: 'วันที่เอกสาร',
                            type: 'string',
                            pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                            nullable: false,
                            default: null,
                            example: '2022-02-18'
                        },
                        debt_due_date: {
                            description: 'วันครบกำหนดชำระหนี้',
                            type: 'string',
                            pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                            nullable: false,
                            default: null,
                            example: '2022-02-18'
                        },
                        debt_price_amount: {
                            description: 'จำนวนเงินลูกหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)',
                            type: ['string', 'null'],
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: true,
                            default: null,
                            example: '0.00'
                        },
                        debt_price_amount_left: {
                            description: 'จำนวนเงินลูกหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)',
                            type: ['string', 'null'],
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: true,
                            default: null,
                            example: '0.00'
                        },
                        debt_price_paid_adjust: {
                            description: 'จำนวนเงินสำหรับปรับปรุงส่วนต่างของยอดเงินที่จะชำระลูกหนี้ โดยจะเอาไปใช้เป็นการบวกเพิ่มหลังจากยอดที่จะชำระ (ส่วนต่างยอดชำระ)',
                            type: ['string', 'null'],
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: true,
                            default: null,
                            example: '0.00'
                        },
                        debt_price_paid_total: {
                            description: 'จำนวนเงินชำระลูกหนี้การค้ารวมทั้งสิ้น (ยอดชำระ)',
                            type: ['string', 'null'],
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: true,
                            default: null,
                            example: '0.00'
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
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopCustomerDebtDoc/all
 */
const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ตารางข้อมูลเอกสารลูกหนี้การค้า - Customer Debt Document (CDD Doc)',
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
                type: ['string', 'null'],
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            doc_date_endDate: {
                description: 'วันที่เอกสาร (สิ้นสุด)',
                type: ['string', 'null'],
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            debt_due_date_startDate: {
                description: 'วันที่ชำระหนี้ (เริ่มต้น)',
                type: ['string', 'null'],
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            debt_due_date_endDate: {
                description: 'วันที่ชำระหนี้ (สิ้นสุด)',
                type: ['string', 'null'],
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            filter__debt_price_amount_left: {
                description: 'จำนวนเงินลูกหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ) ที่ไม่มี 0',
                type: 'boolean',
                nullable: true,
                default: false
            },
            status: {
                description: `สถานะเอกสาร\n - default = ใช้งานเอกสาร และยกเลิกเอกสาร\n - active = ใช้งานเอกสาร\n - block = ยกเลิกเอกสาร\n - delete = ลบเอกสาร\n - all = ทั้งหมด`,
                type: 'string',
                default: 'default',
                enum: ['default', 'active', 'block', 'delete', 'all']
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
                enum: ['code_id', 'doc_date', 'created_date', 'updated_date'],
                default: 'code_id'
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
 * Route [GET] => /api/shopCustomerDebtDoc/byId/:id
 */
const byId = {
    description: 'แสดงข้อมูลตารางข้อมูลเอกสารลูกหนี้การค้า - Customer Debt Document (CDD Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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
 * Route [PUT] => /api/shopCustomerDebtDoc/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูลตารางข้อมูลเอกสารลูกหนี้การค้า - Customer Debt Document (CDD Doc) แบบระบุรหัสหลักตารางข้อมูล (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
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
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: 'e5871484-d096-41be-b515-b33aa715957b'
            },
            doc_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                nullable: false,
                default: undefined,
                example: '2022-02-18'
            },
            bus_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ (เลือกอย่างใดอย่างหนึ่ง ระหว่าง bus_customer_id กับ per_customer_id)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: 'e5871484-d096-41be-b515-b33aa715957b'
            },
            per_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา (เลือกอย่างใดอย่างหนึ่ง ระหว่าง bus_customer_id กับ per_customer_id)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: 'e5871484-d096-41be-b515-b33aa715957b'
            },
            customer_credit_debt_approval_balance: {
                description: 'วงเงินหนี้อนุมัติ',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: undefined,
                example: '0.00'
            },
            customer_credit_debt_payment_period: {
                description: 'ระยะเวลาชำระหนี้',
                type: ['string', 'null'],
                pattern: '\^([0-9]+){1}\$',
                allowNull: false,
                default: undefined,
                example: '0'
            },
            debt_price_amount: {
                description: 'จำนวนเงินลูกหนี้การค้าที่บันทึกหนี้ไว้ (จำนวนเงิน)',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: undefined,
                example: '0.00'
            },
            debt_price_amount_left: {
                description: 'จำนวนเงินลูกหนี้การค้าที่เหลือที่ต้องจ่าย (ยอดคงเหลือ)',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: undefined,
                example: '0.00'
            },
            debt_price_paid_total: {
                description: 'จำนวนเงินชำระลูกหนี้การค้ารวมทั้งสิ้น (ยอดชำระ)',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: undefined,
                example: '0.00'
            },
            debt_due_date: {
                description: 'วันครบกำหนดชำระหนี้',
                type: 'string',
                pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                nullable: false,
                default: undefined,
                example: '2022-02-18'
            },
            details: {
                description: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON แต่จะมี Key ที่สำคัญ ๆ ดังนี้\n'
                    + '{\n' +
                    '    "ref_doc": "เลขที่เอกสารอ้างอิง, เก็บเป็น string"\n' +
                    '}',
                type: 'object',
                additionalProperties: true,
                nullable: false,
                properties: {},
                default: {},
                example: {
                    "ref_doc": ""
                }
            },
            status: {
                description: `สถานะเอกสาร\n- 0 = ลบเอกสาร\n- 1 = ใช้งานเอกสาร\n- 2 = ยกเลิกเอกสาร`,
                type: 'number',
                enum: [0, 1, 2],
                nullable: true,
                default: undefined
            },
            shopCustomerDebtLists: {
                description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น Array',
                type: 'array',
                allowNull: false,
                items: {
                    description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น JSON',
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        id: {
                            description: 'รหัสหลักตารางข้อมูลรายการลูกหนี้การค้า',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: null
                        },
                        seq_number: {
                            description: "ลำดับรายการ\n- เริ่มต้น 1\n- เลขต้องไม่ซ้ำกัน",
                            type: 'integer',
                            minimum: 1,
                            allowNull: false,
                            default: undefined
                        },
                        shop_customer_debt_dn_doc_id: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบเพิ่มหนี้ของลูกหนี้การค้า',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: undefined
                        },
                        shop_customer_debt_cn_doc_id: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: undefined
                        },
                        shop_customer_debt_cn_doc_id_t2: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า ไม่คิืดภาษี',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: undefined
                        },
                        shop_service_order_doc_id: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: undefined
                        },
                        doc_date: {
                            description: 'วันที่เอกสาร',
                            type: 'string',
                            pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                            nullable: false,
                            default: undefined,
                            example: '2022-02-18'
                        },
                        debt_due_date: {
                            description: 'วันครบกำหนดชำระหนี้',
                            type: 'string',
                            pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                            nullable: false,
                            default: undefined,
                            example: '2022-02-18'
                        },
                        debt_price_paid_adjust: {
                            description: 'จำนวนเงินสำหรับปรับปรุงส่วนต่างของยอดเงินที่จะชำระลูกหนี้ โดยจะเอาไปใช้เป็นการบวกเพิ่มหลังจากยอดที่จะชำระ (ส่วนต่างยอดชำระ)',
                            type: ['string', 'null'],
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: false,
                            default: undefined,
                            example: '0.00'
                        },
                        debt_price_paid_total: {
                            description: 'จำนวนเงินชำระลูกหนี้การค้ารวมทั้งสิ้น',
                            type: ['string', 'null'],
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: false,
                            default: undefined,
                            example: '0.00'
                        },
                        details: {
                            description: 'รายละเอียดเพิ่มเติมของรายการเก็บเป็น JSON',
                            type: 'object',
                            allowNull: false,
                            default: {},
                            example: {
                                "ref_doc": ""
                            }
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
 * Route [DELETE] => /api/shopCustomerDebtDoc/delete/:id
 */
const del = {
    description: 'ลบข้อมูลตารางข้อมูลเอกสารลูกหนี้การค้า - Customer Debt Document (CDD Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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