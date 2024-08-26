const apiTags = ['ShopPurchaseOrderDoc'];
const apiSecurity = [
    {
        "apiKey": []
    }
];


/**
 * A swagger and fastify validator schema for
 * Route [POST] => /api/shopPurchaseOrderDoc/add
 */
const add = {
    description: 'เพิ่มข้อมูล ตารางข้อมูลเอกสารใบสั่งซื้อ - PurchaseOrder Document (PO Doc)',
    body: {
        additionalProperties: false,
        properties: {
            doc_type_id: {
                description: 'ประเภทเอกสาร',
                type: 'string',
                format: 'uuid',
                nullable: false,
                default: null,
                example: '941c0fc7-794b-4838-afca-2bd8884dc36d'
            },
            doc_date: {
                description: 'วันที่เอกสาร',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: false,
                default: null,
                example: '2022-02-18'
            },
            purchase_requisition_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา' +
                    '\n- ตอนนี้ยังไม่ใช้งาน',
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
            bus_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            business_partner_id: {
                description: 'รหัสตารางธุรกิจคู่ค้า',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            tax_type_id: {
                description: 'ประเภทภาษี',
                type: 'string',
                format: 'uuid',
                nullable: false,
                default: null,
                example: '8c73e506-31b5-44c7-a21b-3819bb712321'
            },
            vat_type: {
                description: 'ประเภทภาษีมูลค่าเพิ่ม'
                    + `\n- 1 = รวมภาษีมูลค่าเพิ่ม`
                    + `\n- 2 = ไม่รวมภาษีมูลค่าเพิ่ม`
                    + `\n- 3 = ไม่คิดภาษีมูลค่าเพิ่ม`,
                type: 'number',
                enum: [1, 2, 3],
                nullable: false,
                default: null,
                example: 1
            },
            price_discount_bill: {
                description: 'ส่วนลดท้ายบิล',
                type: 'string',
                pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                allowNull: false,
                default: '0'
            },
            price_sub_total: {
                description: 'รวมเป็นเงิน',
                type: 'string',
                pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                allowNull: false,
                default: '0'
            },
            price_discount_total: {
                description: 'ส่วนลดรวม',
                type: 'string',
                pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                allowNull: false,
                default: '0'
            },
            price_amount_total: {
                description: 'ราคาหลังหักส่วนลด',
                type: 'string',
                pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                allowNull: false,
                default: '0'
            },
            price_before_vat: {
                description: 'ราคาก่อนรวมภาษี',
                type: 'string',
                pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                allowNull: false,
                default: '0'
            },
            price_vat: {
                description: 'ภาษีมูลค่าเพิ่ม',
                type: 'string',
                pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                allowNull: false,
                default: '0'
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                allowNull: false,
                default: '0'
            },
            approve_status: {
                description: `สถานะอนุมัติ`
                    + `\n1 = รอพิจารณา`
                    + `\n2 = อนุมัติ`
                    + `\n3 = ไม่อนุมัติ`,
                type: 'number',
                enum: [1, 2, 3],
                nullable: false,
                default: 1,
                example: 1
            },
            approve_date: {
                description: 'วันที่อนุมัติ',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: null,
                example: '2022-02-18'
            },
            approve_user_id: {
                description: 'รหัสตารางผู้ใช้ สำหรับบอกถึง ผู้อนุมัติ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                example: null
            },
            details: {
                description: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON แต่จะมี Key ที่สำคัญ ๆ ดังนี้\n'
                    + '{\n' +
                    '    "ref_doc": "เลขที่เอกสารอ้างอิง, เก็บเป็น string"\n' +
                    '    "business_partner_name": "ธุรกิจคู่ค้า ชื่อ - เอากรณีไม่ระบุ, เก็บเป็น string"\n' +
                    '    "business_partner_address": "ธุรกิจคู่ค้า ที่อยู่ - เอากรณีไม่ระบุ, เก็บเป็น string"\n' +
                    '    "approve_name": "ผู้อนุมัติ ชื่อ - เอากรณีไม่ระบุชื่อ, เก็บเป็น string"\n' +
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
                    },
                    business_partner_name: {
                        description: 'ธุรกิจคู่ค้า ชื่อ - เอากรณีไม่ระบุ\n- เก็บเป็น string',
                        type: 'string',
                        default: '',
                        example: ''
                    },
                    business_partner_address: {
                        description: 'ธุรกิจคู่ค้า ที่อยู่ - เอากรณีไม่ระบุ\n- เก็บเป็น string',
                        type: 'string',
                        default: '',
                        example: ''
                    },
                    approve_name: {
                        description: 'ผู้อนุมัติ ชื่อ - เอากรณีไม่ระบุชื่อ\n- เก็บเป็น string',
                        type: 'string',
                        default: '',
                        example: ''
                    },
                },
                example: {
                    "ref_doc": "",
                    "business_partner_name": "",
                    "business_partner_address": "",
                    "approve_name": "",
                },
            },
            status: {
                description: `สถานะการดำเนินงานของเอกสาร \n- 0 = ลบเอกสาร\n- 1 = ใช้งานเอกสาร\n- 2 = ยกเลิกเอกสาร`,
                type: 'number',
                enum: [0, 1, 2],
                nullable: false,
                default: 1,
                example: 1
            },
            shopPurchaseOrderLists: {
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
                            pattern: '^([0-9]{1,4})$',
                            allowNull: true,
                            default: null
                        },
                        amount: {
                            description: 'จำนวนสินค้า',
                            type: 'string',
                            pattern: '^[0-9]+$',
                            allowNull: false,
                            default: '0'
                        },
                        price_unit: {
                            description: 'ราคาต่อหน่วย',
                            type: 'string',
                            pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                            allowNull: false,
                            default: '0'
                        },
                        price_discount: {
                            description: 'ส่วนลด (บาท)',
                            type: 'string',
                            pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                            allowNull: false,
                            default: '0'
                        },
                        price_discount_percent: {
                            description: 'ส่วนลด (%)',
                            type: 'string',
                            pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                            allowNull: false,
                            default: '0'
                        },
                        price_grand_total: {
                            description: 'จำนวนเงินสุทธิ\n - วิธีคิด: จำนวนสินค้า * (ราคาต่อหน่วย - ส่วนลดบาท)',
                            type: 'string',
                            pattern: '^([0-9]+|[0-9]+.[0-9]{2}){1}$',
                            allowNull: false,
                            default: '0'
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
    tags: apiTags,
    security: apiSecurity
};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/PurchaseOrderDoc/all
 */
const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ตารางข้อมูลเอกสารใบสั่งซื้อ - PurchaseOrder Document (PO Doc)',
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
    tags: apiTags,
    security: apiSecurity

};


/**
 * A swagger and fastify validator schema for
 * Route [GET] => /api/PurchaseOrderDoc/byId/:id
 */
const byId = {
    description: 'แสดงข้อมูลตารางข้อมูลเอกสารใบสั่งซื้อ - PurchaseOrder Document (PO Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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
    tags: apiTags,
    security: apiSecurity
};


/**
 * A swagger and fastify validator schema for
 * Route [PUT] => /api/PurchaseOrderDoc/put/:id
 */
const put = {
    description: 'แก้ไขข้อมูลตารางข้อมูลเอกสารใบสั่งซื้อ - PurchaseOrder Document (PO Doc) แบบระบุรหัสหลักตารางข้อมูล (Id) \n- โดยสามรถเลือกใส่เฉพาะข้อมูลบางส่วนที่จะแก้ไขได้',
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
            purchase_requisition_id: {
                description: 'รหัสตารางข้อมูลลูกค้าบุคคลธรรมดา' +
                    '\n- ตอนนี้ยังไม่ใช้งาน',
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
            bus_customer_id: {
                description: 'รหัสตารางข้อมูลลูกค้าธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
            business_partner_id: {
                description: 'รหัสตารางธุรกิจคู่ค้า',
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
                pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_sub_total: {
                description: 'รวมเป็นเงิน',
                type: 'string',
                pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_discount_total: {
                description: 'ส่วนลดรวม',
                type: 'string',
                pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_amount_total: {
                description: 'ราคาหลังหักส่วนลด',
                type: 'string',
                pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_before_vat: {
                description: 'ราคาก่อนรวมภาษี',
                type: 'string',
                pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_vat: {
                description: 'ภาษีมูลค่าเพิ่ม',
                type: 'string',
                pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            price_grand_total: {
                description: 'จำนวนเงินรวมทั้งสิ้น',
                type: 'string',
                pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                nullable: true,
                default: undefined
            },
            approve_status: {
                description: `สถานะอนุมัติ`
                    + `\n1 = รอพิจารณา`
                    + `\n2 = อนุมัติ`
                    + `\n3 = ไม่อนุมัติ`,
                type: 'number',
                enum: [1, 2, 3],
                nullable: true,
                default: undefined
            },
            approve_date: {
                description: 'วันที่อนุมัติ',
                type: 'string',
                pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
                nullable: true,
                default: undefined
            },
            approve_user_id: {
                description: 'รหัสตารางผู้ใช้ สำหรับบอกถึง ผู้อนุมัติ',
                type: 'string',
                format: 'uuid',
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
                        nullable: true,
                        default: undefined
                    }
                },
            },
            status: {
                description: `สถานะเอกสาร\n- 0 = ลบเอกสาร\n- 1 = ใช้งานเอกสาร\n- 2 = ยกเลิกเอกสาร`,
                type: 'number',
                enum: [0, 1, 2],
                nullable: true,
                default: undefined
            },
            shopPurchaseOrderLists: {
                description: 'รายละเอียดข้อมูลรายการในเอกสาร เป็น Array\n- กรณีที่ไม่มีค่า ฟิวส์ id เข้ามา ระบบจะตีว่าเป็นการเพิ่ม (Add) ข้อมูลการการ',
                type: 'array',
                nullable: true,
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
                            pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_discount: {
                            description: 'ส่วนลด (บาท)',
                            type: 'string',
                            pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_discount_percent: {
                            description: 'ส่วนลด (%)',
                            type: 'string',
                            pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
                            nullable: true,
                            default: undefined
                        },
                        price_grand_total: {
                            description: 'จำนวนเงินสุทธิ',
                            type: 'string',
                            pattern: '\^([0-9]+|[0-9]+.[0-9]{2}){1}\$',
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
                default: null
            }
        }
    },
    tags: apiTags,
    security: apiSecurity
};


/**
 * A swagger and fastify validator schema for
 * Route [DELETE] => /api/PurchaseOrderDoc/delete/:id
 */
const del = {
    description: 'ลบข้อมูลตารางข้อมูลเอกสารใบสั่งซื้อ - PurchaseOrder Document (PO Doc) แบบระบุรหัสหลักตารางข้อมูล (Id)',
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
    tags: apiTags,
    security: apiSecurity
};


module.exports = {
    add,
    all,
    byId,
    put,
    del
};