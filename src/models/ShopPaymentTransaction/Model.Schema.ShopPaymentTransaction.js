const tags = ['ShopPaymentTransaction'];
const security = [
    {
        apiKey: []
    }
];

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopPaymentTransaction/add
 */
const add = {
    description: 'เพิ่มข้อมูล ตารางข้อมูลการชำระเงิน - Payment Transaction (PMT)',
    body: {
        additionalProperties: false,
        required: [
            'shop_service_order_doc_id',
            'shop_customer_debt_doc_id',
            'payment_method',
            'payment_price_paid',
            'is_partial_payment',
        ],
        properties: {
            shop_service_order_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย (เลือกอย่างใดอย่างหนึ่งกับ)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            },
            shop_customer_debt_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารลูกหนี้การค้า',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            },
            shop_inventory_transaction_id: {
                description: 'รหัสตารางข้อมูลใบนำเข้า',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            },
            shop_partner_debt_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารเจ้าหนี้การค้า',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            },
            doc_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                nullable: true,
                default: undefined,
                example: '2022-02-18'
            },
            bank_name_list_id: {
                description: 'รหัสตารางข้อมูลธนาคาร',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            },
            payment_method: {
                description: 'ช่องทางชำระเงิน' +
                    '\n- 1 เงินสด' +
                    '\n- 2 บัตรเครดิต' +
                    '\n- 3 เงินโอน' +
                    '\n- 4 เช็คเงินสด' +
                    '\n- 5 บันทึกเป็นลูกหนี้การค้า จากใบสั่งซ่อม/ใบสั่งขาย' +
                    '\n- 6 บันทึกเป็นเจ้าหนี้การค้า จากใบนำเข้า',
                type: 'number',
                enum: [1, 2, 3, 4, 5, 6],
                nullable: false,
                example: 0
            },
            payment_price_paid: {
                description: 'จำนวนเงินที่จะชำระ',
                type: 'string',
                nullable: false,
                example: '0.00'
            },
            is_partial_payment: {
                description: 'เป็น Partial Payment หรือไม่',
                type: 'boolean',
                nullable: false,
                example: false
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
                default: {},
                example: {
                    "ref_doc": ""
                },
            }
        },
    },
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/shopPaymentTransaction/all
 */
const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ตารางข้อมูลการชำระเงิน - Payment Transaction (PMT)',
    querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['shop_service_order_doc_id'],
        properties: {
            search: {
                type: 'string',
                default: '',
                description: 'สิ่งที่ต้องการค้นหา'
            },
            shop_service_order_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย',
                type: 'string',
                format: 'uuid',
                nullable: false
            },
            shop_temporary_delivery_order_doc_id: {
                description: 'รหัสหลักตารางข้อมูลเอกสารใบส่งสินค้าชั่วคราว (Optional)',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: null
            },
            shop_tax_invoice_doc_id: {
                description: 'รหัสหลักตารางข้อมูลเอกสารใบสั่งซ่อม (Optional)',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: null
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
            payment_paid_date_startDate: {
                description: 'วันที่ชำระเงิน (เริ่มต้น)',
                type: 'string',
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            payment_paid_date_endDate: {
                description: 'วันที่ชำระเงิน (สิ้นสุด)',
                type: 'string',
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            canceled_payment_date_startDate: {
                description: 'วันที่ยกเลิกชำระเงิน (เริ่มต้น)',
                type: 'string',
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            canceled_payment_date_endDate: {
                description: 'วันที่ยกเลิกชำระเงิน (สิ้นสุด)',
                type: 'string',
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            filterInPaymentMethod: {
                description: 'แสดงตาม "ช่องทางชำระเงิน" (payment_method)' +
                    '\n- 1 = เงินสด' +
                    '\n- 2 = บัตรเครดิต' +
                    '\n- 3 = เงินโอน',
                type: 'string',
                nullable: false,
                default: '',
                example: '1,2,3'
            },
            filterInPaymentStatus: {
                description: 'แสดงตาม "สถาณะชำระเงิน" (payment_status)' +
                    '\n- 0 = รอชำระเงิน' +
                    '\n- 1 = ชำระเงินสำเร็จ' +
                    '\n- 2 = ชำระเงินไม่สำเร็จ',
                type: 'string',
                nullable: false,
                default: '',
                example: '0,1,2'
            },
            filterShowOnlyNonCanceledPayment: {
                description: 'ไม่แสดงรายการที่ถูกยกเลิกการชำระ',
                type: 'boolean',
                nullable: false,
                default: false,
                example: false
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
                enum: ['created_date', 'updated_date', 'doc_date', 'payment_paid_date', 'canceled_payment_date'],
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
 * Route [GET] => /api/shopPaymentTransaction/byId/:id
 */
const byId = {
    description: 'แสดงข้อมูลตารางข้อมูลการชำระเงิน - Payment Transaction (PMT) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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
 * Route [PUT] => /api/shopPaymentTransaction/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูลตารางข้อมูลการชำระเงิน - Payment Transaction (PMT) แบบระบุรหัสหลักตารางข้อมูล (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
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
            doc_date: {
                description: 'แก้ไข วันที่เอกสาร (YYYY-MM-DD) (ถ้าไม่อยากแก้ไขวันที่เอกสารชำระเงินไม่ต้องใส่)',
                type: 'string',
                pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                nullable: true,
                default: undefined,
                example: '2023-08-08'
            },
            canceled_payment_by: {
                description: 'ผู้ยกเลิกชำระเงิน (กรณีอยากยกเลิกชำระเงินต้องมีฟิวส์ "canceled_payment_by" และ "canceled_payment_date")',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa1'
            },
            canceled_payment_date: {
                description: 'วันที่ยกเลิกชำระเงิน เอาเป็นแบบเวลา z (กรณีอยากยกเลิกชำระเงินต้องมีฟิวส์ "canceled_payment_by" และ "canceled_payment_date")',
                type: 'string',
                nullable: true,
                default: undefined,
                example: '2023-08-08T08:17:59.742Z'
            },
            details: {
                description: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON',
                type: 'object',
                additionalProperties: true,
                nullable: true,
                default: {},
                example: {
                    "ref_doc": ""
                },
            }
        }
    },
    tags: tags,
    security: security
};


/**
 * A swagger and fastify validator schema for
 * Route [DELETE] => /api/shopPaymentTransaction/delete/:id
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

/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopPaymentTransaction/addPartialPayments
 */
const addPartialPayments = {
    description: 'เพิ่มข้อมูล ตารางข้อมูลการชำระเงิน - Payment Transaction (PMT) ในการส่งข้อมูลแบบ Partial Payment',
    body: {
        additionalProperties: false,
        required: [
            'shop_service_order_doc_id',
            'shop_customer_debt_doc_id',
            'shopPaymentTransactions'
        ],
        properties: {
            shop_service_order_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารใบสั่งซ่อม/ใบสั่งขาย (เลือกอย่างใดอย่างหนึ่งกับ)',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            },
            shop_customer_debt_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารลูกหนี้การค้า',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            },
            shop_partner_debt_doc_id: {
                description: 'รหัสตารางข้อมูลเอกสารเจ้าหนี้การค้า',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null,
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            },
            shopPaymentTransactions: {
                description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น Array',
                type: 'array',
                allowNull: false,
                items: {
                    description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น JSON',
                    type: 'object',
                    additionalProperties: false,
                    required: [
                        'payment_method',
                        'payment_price_paid',
                        'is_partial_payment',
                    ],
                    properties: {
                        doc_date: {
                            description: 'วันที่เอกสาร',
                            type: 'string',
                            pattern: '\^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])\$',
                            nullable: true,
                            default: undefined,
                            example: '2022-02-18'
                        },
                        bank_name_list_id: {
                            description: 'รหัสตารางข้อมูลธนาคาร',
                            type: 'string',
                            format: 'uuid',
                            nullable: true,
                            default: undefined,
                            example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
                        },
                        payment_method: {
                            description: 'ช่องทางชำระเงิน' +
                                '\n- 1 เงินสด' +
                                '\n- 2 บัตรเครดิต' +
                                '\n- 3 เงินโอน' +
                                '\n- 4 เช็คเงินสด',
                            type: 'number',
                            enum: [1, 2, 3, 4],
                            nullable: false,
                            example: 0
                        },
                        payment_price_paid: {
                            description: 'จำนวนเงินที่จะชำระ',
                            type: 'string',
                            nullable: false,
                            example: "0.00"
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
                            default: {},
                            example: {
                                "ref_doc": ""
                            },
                        }
                    },
                }
            }
        },
    },
    tags: tags,
    security: security
};


module.exports = {
    add,
    all,
    byId,
    put,
    del,
    addPartialPayments
};