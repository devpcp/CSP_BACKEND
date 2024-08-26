const tags = ['ShopCustomerDebtCreditNoteDoc'];
const security = [
    {
        apiKey: []
    }
];

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopCustomerDebtCreditNoteDoc/add
 */
const add = {
    description: 'เพิ่มข้อมูล ตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า - Customer Debt Credit Note Document (CCN Doc)',
    body: {
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'รหัสตารางข้อมูลร้านค้า',
                type: 'string',
                format: 'uuid',
                nullable: false,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            doc_type_id: {
                description: 'ประเภทเอกสาร',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            debt_credit_note_type: {
                description: 'ประเภทใบลดหนี้\n- 1 = ใบลดหนี้ (CN)\n- 2 = ส่วนลด (Rebate)',
                type: 'number',
                enum: [1, 2],
                nullable: false
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
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            per_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา (เลือกอย่างใดอย่างหนึ่ง ระหว่าง bus_customer_id กับ per_customer_id)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            shop_temporary_delivery_order_doc_id: {
                description: 'รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            customer_credit_debt_unpaid_balance: {
                description: 'จำนวนหนี้ค้างชำระ',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00',
                example: '0.00'
            },
            customer_credit_debt_current_balance: {
                description: 'วงเงินหนี้คงเหลือ',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00',
                example: '0.00'
            },
            customer_credit_debt_approval_balance: {
                description: 'วงเงินหนี้อนุมัติ',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                example: '0.00'
            },
            tax_type_id: {
                description: 'รหัสตารางข้อมูลประเภทภาษีมูลค่าเพิ่ม',
                type: 'string',
                format: 'uuid',
                nullable: false,
                default: null,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            vat_rate: {
                description: 'อัตราภาษีมูลค่าเพิ่ม',
                type: ['string', 'null'],
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00'
            },
            price_sub_total: {
                description: 'รวมเป็นเงิน',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00',
                example: '0.00'
            },
            price_before_vat: {
                description: 'ราคาก่อนรวมภาษี',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00',
                example: '0.00'
            },
            price_vat: {
                description: 'ภาษีมูลค่าเพิ่ม',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00',
                example: '0.00'
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                allowNull: false,
                default: '0.00',
                example: '0.00'
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
            shopCustomerDebtCreditNoteLists: {
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
                        shop_temporary_delivery_order_doc_id: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: null
                        },
                        shop_temporary_delivery_order_list_id: {
                            description: 'รหัสหลักตารางข้อมูลรายการใบส่งสินค้าชั่วคราว',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: null
                        },
                        product_id: {
                            description: 'รหัสหลักตารางข้อมูลสินค้า',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: null
                        },
                        shop_product_id: {
                            description: 'รหัสหลักตารางข้อมูลสินค้าในร้าน',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: null
                        },
                        list_id: {
                            description: 'เลขรหัสรายการ',
                            type: 'string',
                            allowNull: false
                        },
                        list_name: {
                            description: 'ชื่อรายการ',
                            type: 'string',
                            allowNull: false
                        },
                        price_unit: {
                            description: 'ราคาขาย/หน่วย',
                            type: 'string',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            allowNull: false,
                            default: '0.00'
                        },
                        amount: {
                            description: 'จำนวนสินค้า',
                            type: 'string',
                            pattern: '\^([0-9])+\$',
                            allowNull: false,
                            default: '1'
                        },
                        price_grand_total: {
                            description: 'จำนวนเงินรวมทั้งสิ้น',
                            type: 'string',
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
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopCustomerDebtCreditNoteDoc/all
 */
const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า - Customer Debt Credit Note Document (CCN Doc)',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: {
                description: 'สิ่งที่ต้องกาค้นหา',
                type: 'string',
                default: ''
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
            },
            status: {
                description: `สถานะเอกสาร\n - default = ใช้งานเอกสาร และยกเลิกเอกสาร\n - active = ใช้งานเอกสาร\n - block = ยกเลิกเอกสาร\n - delete = ลบเอกสาร\n - all = ทั้งหมด`,
                type: 'string',
                default: 'default',
                enum: ['default', 'active', 'block', 'delete', 'all']
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
            filter__unUsed__shop_customer_debt_cn_doc_id: {
                description: "แสดงเอกสารเอกสารใบลดหนี้ของลูกหนี้การค้า ที่ยังไม่ได้ถูกใช้งานในใบชำระลูกหนี้",
                type: "boolean",
                nullable: false,
                default: false
            }
        }
    },
    tags: tags,
    security: security

};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopCustomerDebtCreditNoteDoc/byId/:id
 */
const byId = {
    description: 'แสดงข้อมูลตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า - Customer Debt Credit Note Document (CCN Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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
 * Route [PUT] => /api/shopCustomerDebtCreditNoteDoc/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูลตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า - Customer Debt Credit Note Document (CCN Doc) แบบระบุรหัสหลักตารางข้อมูล (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
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
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            debt_credit_note_type: {
                description: 'ประเภทใบลดหนี้\n- 1 = ใบลดหนี้ (CN)\n- 2 = ส่วนลด (Rebate)',
                type: 'number',
                enum: [1, 2],
                nullable: true,
                default: undefined,
                example: 1
            },
            doc_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                nullable: true,
                default: undefined,
                example: '2023-12-19'
            },
            bus_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ (เลือกอย่างใดอย่างหนึ่ง ระหว่าง bus_customer_id กับ per_customer_id)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            per_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา (เลือกอย่างใดอย่างหนึ่ง ระหว่าง bus_customer_id กับ per_customer_id)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            shop_temporary_delivery_order_doc_id: {
                description: 'รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            customer_credit_debt_unpaid_balance: {
                description: 'จำนวนหนี้ค้างชำระ',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined,
                example: '0.00'
            },
            customer_credit_debt_current_balance: {
                description: 'วงเงินหนี้คงเหลือ',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined,
                example: '0.00'
            },
            customer_credit_debt_approval_balance: {
                description: 'วงเงินหนี้อนุมัติ',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined,
                example: '0.00'
            },
            tax_type_id: {
                description: 'รหัสตารางข้อมูลประเภทภาษีมูลค่าเพิ่ม',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: 'e5871484-d096-41be-b515-b33aa715957p'
            },
            vat_rate: {
                description: 'อัตราภาษีมูลค่าเพิ่ม',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined,
                example: '0.00'
            },
            price_sub_total: {
                description: 'รวมเป็นเงิน',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined,
                example: '0.00'
            },
            price_before_vat: {
                description: 'ราคาก่อนรวมภาษี',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined,
                example: '0.00'
            },
            price_vat: {
                description: 'ภาษีมูลค่าเพิ่ม',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined,
                example: '0.00'
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined,
                example: '0.00'
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
                default: undefined,
                example: 1
            },
            shopCustomerDebtCreditNoteLists: {
                description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น Array',
                type: 'array',
                allowNull: false,
                items: {
                    description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น JSON',
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        id: {
                            description: 'รหัสหลักตารางข้อมูลรายการ',
                            type: ['string', 'null'],
                            format: 'uuid',
                            allowNull: true,
                            default: undefined
                        },
                        seq_number: {
                            description: "ลำดับรายการ\n- เริ่มต้น 1\n- เลขต้องไม่ซ้ำกัน",
                            type: 'integer',
                            minimum: 1,
                            allowNull: false,
                            default: undefined
                        },
                        shop_temporary_delivery_order_doc_id: {
                            description: 'รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว',
                            type: ['string', 'null'],
                            format: 'uuid',
                            nullable: false,
                            default: undefined,
                        },
                        shop_temporary_delivery_order_list_id: {
                            description: 'รหัสหลักตารางข้อมูลรายการใบส่งสินค้าชั่วคราว',
                            type: ['string', 'null'],
                            format: 'uuid',
                            nullable: false,
                            default: undefined,
                        },
                        product_id: {
                            description: 'รหัสหลักตารางข้อมูลสินค้า',
                            type: ['string', 'null'],
                            format: 'uuid',
                            nullable: false,
                            default: undefined,
                        },
                        shop_product_id: {
                            description: 'รหัสหลักตารางข้อมูลสินค้าในร้าน',
                            type: ['string', 'null'],
                            format: 'uuid',
                            nullable: false,
                            default: undefined,
                        },
                        list_id: {
                            description: 'เลขรหัสรายการ',
                            type: 'string',
                            nullable: false,
                            default: undefined,
                        },
                        list_name: {
                            description: 'ชื่อรายการ',
                            type: 'string',
                            nullable: false,
                            default: undefined,
                        },
                        price_unit: {
                            description: 'ราคาขาย/หน่วย',
                            type: 'string',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: false,
                            default: undefined
                        },
                        amount: {
                            description: 'จำนวนสินค้า',
                            type: 'string',
                            pattern: '\^([0-9])+\$',
                            nullable: false,
                            default: undefined,
                        },
                        price_grand_total: {
                            description: 'จำนวนเงินรวมทั้งสิ้น',
                            type: 'string',
                            pattern: '\^\-{0,1}([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: false,
                            default: undefined,
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
 * Route [DELETE] => /api/shopCustomerDebtCreditNoteDoc/delete/:id
 */
const del = {
    description: 'ลบข้อมูลตารางข้อมูลเอกสารใบลดหนี้ของลูกหนี้การค้า - Customer Debt Credit Note Document (CCN Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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