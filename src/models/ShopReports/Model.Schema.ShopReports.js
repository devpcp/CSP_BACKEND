const select_shop_ids = {
    description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- ถ้าเอาทุก Branch ที่มีให้ใส่ all \n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
    type: 'string',
    nullable: true,
    default: ''
};

const salesOut = {
    description: 'รายงานยอดขาย',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            search: { type: 'string', default: '' },
            filter_purchase_status: {
                description: 'Filter สถาณะการชำระเงิน\ntrue = ชำระเงินแล้ว\nfalse = ยังไม่ได้ชำระเงิน\n * ถ้าไม่ใส่มา จะไม่ได้รับการ Filter ในส่วนนี้',
                type: 'boolean',
                default: null,
                nullable: true
            },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            // sort: {
            //     type: 'string', default: 'master_customer_code_id',
            //     enum: ['master_customer_code_id', "customer_name->>'th'", "customer_name->>'en'", 'balance_point', 'balance_date']
            // },
            // order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
            start_date: { type: 'string', example: '2021-01-01' },
            end_date: { type: 'string', example: '2021-10-20' },
            report_sales_out_type: {
                description: 'Format รายงาน\n- doc = ตามเอกสาร\n- list = ตามรายการ',
                type: 'string',
                enum: ['doc', 'list'],
                default: 'doc'
            },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            which_export: {
                description: 'รูปแบบการ Export รายงานย่อย\n- 0 = แบบปกติ\n- 1 = จำนวนยี่ห้อที่ขายต่อลูกค้า\n- 2 = จำนวนรุ่นที่ขายต่อลูกค้า\n- 3 = จำนวนไซส์ที่ขายต่อลูกค้า',
                type: 'integer',
                enum: [0, 1, 2, 3],
                default: 0
            },
            doc_type_id: {
                description: 'ประเภทเอกสาร',
                type: 'string',
                example: '67c45df3-4f84-45a8-8efc-de22fef31978,7ef3840f-3d7f-43de-89ea-dce215703c16',
            },
            payment_paid_status: {
                description: 'สถานะการชําระเงิน (ใส่ค่าว่างได้)\n- 0 = ยกเลิกชำระ\n- 1 = ยังไม่ชำระ\n- 2 = ค้างชำระ\n- 3 = ชําระแล้ว\n- 4 = ชําระเกิน',
                type: 'string',
                example: '1,2,3,4,5',
                default: '1,2,3,4,5'
            },
            payment_type: {
                description: 'ประเภทการชำระ (ใส่ค่าว่างได้)\n- 0 = ไม่ได้ระบุ\n- 1 = เงินสด\n- 2 = บัตรเครดิต\n- 3 = เงินโอน\n- 4 = เช็คเงินสด\n- 5 = บันทึกเป็นลูกหนี้การค้า\n- 999 = Partial Payment',
                type: 'string',
                example: '1,2,3,4,5'
            },
            payment_paid_date__startDate: { type: 'string', example: '2021-01-01' },
            payment_paid_date__endDate: { type: 'string', example: '2021-01-01' },
            status: {
                description: 'สถานะเอกสาร (ใส่ค่าว่างได้)\n- 0 = ลบเอกสาร\n- 1 = ใช้งานเอกสาร\n- 2 = ยกเลิกเอกสาร',
                type: 'string',
                example: '1,2'
            },
            per_customer_id: {
                description: 'Filter ตาม ลูกค้าบุคคล',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            bus_customer_id: {
                description: 'Filter ตาม ลูกต้าธุรกิจ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            vehicle_customer_id: {
                description: 'Filter ตาม ยานพาหนะ',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            }

        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};
const partnerDebtDoc = {
    description: 'รายงานยอดขาย',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            search: { type: 'string', default: '' },
            filter_purchase_status: {
                description: 'Filter สถาณะการชำระเงิน\ntrue = ชำระเงินแล้ว\nfalse = ยังไม่ได้ชำระเงิน\n * ถ้าไม่ใส่มา จะไม่ได้รับการ Filter ในส่วนนี้',
                type: 'boolean',
                default: null,
                nullable: true
            },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            start_date: { type: 'string', example: '2021-01-01' },
            end_date: { type: 'string', example: '2021-10-20' },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            payment_paid_status: {
                description: 'สถานะการชําระเงิน (ใส่ค่าว่างได้)\n- 0 = ยกเลิกชำระ\n- 1 = ยังไม่ชำระ\n- 2 = ค้างชำระ\n- 3 = ชําระแล้ว\n- 4 = ชําระเกิน',
                type: 'string',
                example: '1,2,3,4,5',
                default: '0,1,2,3,4,5'
            },
            payment_type: {
                description: 'ประเภทการชำระ (ใส่ค่าว่างได้)\n- 0 = ไม่ได้ระบุ\n- 1 = เงินสด\n- 2 = บัตรเครดิต\n- 3 = เงินโอน\n- 4 = เช็คเงินสด\n- 5 = บันทึกเป็นลูกหนี้การค้า\n- 999 = Partial Payment',
                type: 'string',
                example: '1,2,3,4,5'
            },
            payment_paid_date__startDate: { type: 'string', example: '2021-01-01' },
            payment_paid_date__endDate: { type: 'string', example: '2021-01-01' },
            status: {
                description: 'สถานะเอกสาร (ใส่ค่าว่างได้)\n- 0 = ลบเอกสาร\n- 1 = ใช้งานเอกสาร\n- 2 = ยกเลิกเอกสาร',
                type: 'string',
                example: '1,2'
            }
        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const inventory = {
    description: 'รายงานการซื้อ',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            search: { type: 'string', default: '' },
            filter_shop_business_partner_ids: {
                description: 'Filter ผู้จำหน่าย จากค่า Id\n - ใช้เป็นค่า Array ได้ โดนจะแบ่งข้อมูลจาก ,',
                type: 'string',
                default: '',
                example: 'a92c3827-5c6f-4f84-953e-12c20823b877,a92c3827-5c6f-4f84-953e-12c20823b878',
            },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            order: {
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด',
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'asc'
            },
            sort: {
                type: 'string', default: 'RunningNo'
            },
            start_date: { type: 'string', example: '2021-01-01' },
            end_date: { type: 'string', example: '2021-10-20' },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            doc_type_id: { type: 'string', format: 'uuid' },
            shop_product_id: {
                description: 'Filter ตาม Shop Product Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },

        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const inventory_v2 = {
    description: 'รายงานการซื้อ Version 2',
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
            order: {
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด',
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
            },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            doc_date_startDate: {
                description: 'Filter วันที่เอกสาร (เริ่มต้น)',
                type: ['string', 'null'],
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            doc_date_endDate: {
                description: 'Filter วันที่เอกสาร (สิ้นสุด)',
                type: ['string', 'null'],
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            arrStrFilter__shop_business_partner_id: {
                description: 'Filter ผู้จำหน่าย จากค่า Id\n - ใช้เป็นค่า Array ได้ โดนจะแบ่งข้อมูลจาก ,',
                type: 'string',
                default: '',
                example: 'a92c3827-5c6f-4f84-953e-12c20823b877,a92c3827-5c6f-4f84-953e-12c20823b878',
            },
            shop_product_id: {
                description: 'Filter ตาม Shop Product Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const inventoryMovements = {
    description: 'รายงานการเคลื่อนไหวของสินค้า',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            product_id: {
                description: 'Filter ตาม Shop Product Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            warehouse_id: {
                description: 'Filter ตาม Shop Warehouse Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            warehouse_item_id: {
                description: 'Filter ตาม Shop Warehouse Item Id',
                type: 'string',
                nullable: true,
                default: null
            },
            dot_mfd: {
                description: 'Filter ตาม DOT',
                type: 'string',
                pattern: '^[0-9]{0,4}$',
                nullable: true,
                default: null
            },
            purchase_unit_id: {
                description: 'Filter ตาม Purchase Unit Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            // doc_type_id: {
            //     type: 'string',
            //     format: 'uuid',
            //     nullable: true,
            //     default: null
            // },
        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const inventoryMovements_v2 = {
    description: 'รายงานการเคลื่อนไหวของสินค้า Version 2',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            shop_id: {
                description: 'กรองข้อมูลตาม Shop Profile Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            product_id: {
                description: 'Filter ตาม Shop Product Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            product_group_id: {
                description: 'Filter ตาม Product Group Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            product_type_id: {
                description: 'Filter ตาม Product Type Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            product_brand_id: {
                description: 'Filter ตาม Product Brand Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            product_model_id: {
                description: 'Filter ตาม Product Model Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            complete_size_id: {
                description: 'Filter ตาม Product Complete Size Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            warehouse_id: {
                description: 'Filter ตาม Shop Warehouse Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            warehouse_item_id: {
                description: 'Filter ตาม Shop Warehouse Item Id',
                type: 'string',
                nullable: true,
                default: null
            },
            dot_mfd: {
                description: 'Filter ตาม DOT',
                type: 'string',
                pattern: '^[0-9]{0,4}$',
                nullable: true,
                default: null
            },
            purchase_unit_id: {
                description: 'Filter ตาม Purchase Unit Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            start_date: {
                description: 'วันที่รายการ (เริ่มต้น)',
                type: 'string',
                pattern: '^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})$',
                nullable: true,
                default: null
            },
            end_date: {
                description: 'วันที่รายการ (สิ้นสุด)',
                type: 'string',
                pattern: '^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})$',
                nullable: true,
                default: null
            },
        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const inventoryMovements_v3 = {
    description: 'รายงานการเคลื่อนไหวของสินค้า Version 3',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            limit: {
                description: 'จำกัดจำนวนรายการที่แสดง',
                type: 'number',
                default: 10
            },
            page: {
                description: 'เลขหน้าที่กำลังแสดง',
                type: 'number',
                default: 1
            },
            shop_ids: {
                description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
                type: 'string',
                nullable: true,
                default: ''
            },
            shop_id: {
                description: 'กรองข้อมูลตาม Shop Profile Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            shop_product_id: {
                description: 'Filter ตาม Shop Product Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            product_id: {
                description: 'Filter ตาม Product Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            product_group_id: {
                description: 'Filter ตาม Product Group Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            product_type_id: {
                description: 'Filter ตาม Product Type Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            product_brand_id: {
                description: 'Filter ตาม Product Brand Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            product_model_id: {
                description: 'Filter ตาม Product Model Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            complete_size_id: {
                description: 'Filter ตาม Product Complete Size Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            warehouse_id: {
                description: 'Filter ตาม Shop Warehouse Id\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            warehouse_item_id: {
                description: 'Filter ตาม Shop Warehouse Item Id\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            dot_mfd: {
                description: 'Filter ตาม DOT\n- String 4 ตัว เป็นเลข 0-9\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            purchase_unit_id: {
                description: 'Filter ตาม Purchase Unit Id\n- UUID\n- null\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                nullable: true,
                default: ''
            },
            start_date: {
                description: 'วันที่รายการ (เริ่มต้น)\n- yyyy-mm-dd\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                pattern: '^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})$',
                nullable: true,
                default: null
            },
            end_date: {
                description: 'วันที่รายการ (สิ้นสุด)\n- yyyy-mm-dd\n- ไม่ได้ใช้ ไม่ต้องใส่',
                type: 'string',
                pattern: '^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})$',
                nullable: true,
                default: null
            },
        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const shopStock = {
    description: 'รายงานสินค้าคงคลัง รองรับ MultiBranch',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            // sort: { type: 'string', default: 'balance_date', enum: ['balance_date', 'balance'] },
            // order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] },
            select_shop_ids,
            type_group_id: {
                description: 'กรองข้อมูลตาม Product Type Group Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            product_type_id: {
                description: 'กรองข้อมูลตาม Product Type Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            product_brand_id: {
                description: 'กรองข้อมูลตาม Product Brand Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            product_model_id: {
                description: 'กรองข้อมูลตาม Product Model Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            min_balance: { type: 'number', description: 'ช่วงของการกรอง จำนวนสินค้าคงเหลือต่ำสุด' },
            max_balance: { type: 'number', description: 'ช่วงของการกรอง จำนวนสินค้าคงเหลือสูงสุด' },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            gen_qr_code: {
                description: 'จะ gen qr code ของแต่ล่ะ product',
                type: 'boolean',
                default: false
            }
        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]

};

const shopStockGetMax = {
    description: 'api get ค่า max ของ สินค้าคงคลัง',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            filter_product_isstock: {
                description: 'กรองข้อมูลตามที่ไม่ใช้สินค้าบริการ',
                type: 'boolean',
                nullable: true,
                default: false
            }
        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]

};

const customerDebt = {
    description: 'รายงานลูกหนี้การค้า',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            search: {
                description: 'คำค้นค้นหาข้อมูล',
                type: 'string',
                nullable: true,
                default: '',
                example: ''
            },
            doc_date_startDate: {
                description: 'Filter วันที่เอกสาร (เริ่มต้น)',
                type: ['string', 'null'],
                pattern: '\^(((19|20)\\d\\d)-(0[1-9]|1[012])-([12][0-9]|3[01]|0[1-9])|(){1})\$',
                nullable: true,
                default: null
            },
            doc_date_endDate: {
                description: 'Filter วันที่เอกสาร (สิ้นสุด)',
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
            payment_paid_status: {
                description: `สถาณะการชำระเงิน คั่นด้วยลูกน้ำได้ (,)\nสถานะการชําระเงิน\n- 0 = ยกเลิกชำระ\n- 1 = ยังไม่ชำระ\n- 2 = ค้างชำระ\n- 3 = ชําระแล้ว\n- 4 = ชําระเกิน`,
                type: 'string',
                pattern: '\^(([0-9],)+|([0-9])+)+\$',
                nullable: true,
                default: null,
                example: '1,2'
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
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const shopSalesTax = {
    description: 'รายงานภาษี',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            search: {
                description: 'คำค้นหา',
                type: 'string',
                default: ''
            },
            limit: {
                description: 'จำนวนรายการต่อหน้า',
                type: 'number',
                default: 10
            },
            page: {
                description: 'จำนวนรายการต่อหน้า',
                type: 'number',
                default: 1
            },
            sort: {
                description: 'เรียงข้อมูลจากฟิวส์...',
                type: 'string',
                enum: ['code_id', 'doc_date'],
                default: 'code_id'
            },
            order: {
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด',
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
            },

            doc_date_startDate: {
                description: 'วันที่เอกสาร (เริ่มต้น)',
                type: 'string',
                example: '2021-01-01'
            },
            doc_date_endDate: {
                description: 'วันที่เอกสาร (สิ้นสุด)',
                type: 'string',
                example: '2021-10-20'
            },
            report_tax_type: {
                description: 'ประเภทรายงานภาษี\n- sales_tax = ภาษีขาย\n- purchase_tax = ภาษีซื้อ',
                type: 'string',
                enum: ['sales_tax', 'purchase_tax'],
                default: 'sales_tax'
            },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            arrStrFilter__status: {
                description: `กรองข้อมูลตามสถานะเอกสาร`,
                type: 'string',
                default: ''
            },
            arrStrFilter__tax_type_id: {
                description: 'กรองข้อมูลตามประเภทภาษี',
                type: 'string',
                default: 'fafa3667-55d8-49d1-b06c-759c6e9ab064,8c73e506-31b5-44c7-a21b-3819bb712321',
                example: 'fafa3667-55d8-49d1-b06c-759c6e9ab064,8c73e506-31b5-44c7-a21b-3819bb712321'
            },
            bolFilter__is_inv: {
                description: 'กรองข้อมูลให้แสดงเฉพาะใบกำกับภาษีเต็มรูป (สำหรับ report_tax_type เป็น sales_tax เท่านั้น)',
                type: 'boolean',
                default: true,
                example: true
            },
            bolFilter__is_abb: {
                description: 'กรองข้อมูลให้แสดงเฉพาะใบกำกับภาษีอย่างย่อ (สำหรับ report_tax_type เป็น sales_tax เท่านั้น)',
                type: 'boolean',
                default: false,
                example: false
            },
            arrStrFilter__payment_paid_status: {
                description: 'กรองข้อมูลตามสถานะการชำระเงิน (สำหรับ report_tax_type เป็น sales_tax เท่านั้น)' +
                    '\n- 0 = ยกเลิกชำระ' +
                    '\n- 1 = ยังไม่ชำระ' +
                    '\n- 2 = ค้างชำระ' +
                    '\n- 3 = ชําระแล้ว' +
                    '\n- 4 = ชําระเกิน' +
                    '\n- 5 = ลูกหนี้การค้า',
                type: 'string',
                default: '',
                example: '3,4,5'
            },
            bolFilter_show_zero_vat: {
                description: 'กรองข้อมูลภาษีมูลค่าเพิ่มที่น้อยกว่าหรือเท่ากับ 0 ด้วยหรือไม่',
                type: 'boolean',
                default: false,
                example: false
            },
        }
    },
    tags: ['ShopReports'],
    security: [
        {
            "apiKey": []
        }
    ]
};

module.exports = {
    salesOut,
    inventory,
    inventory_v2,
    inventoryMovements,
    inventoryMovements_v2,
    inventoryMovements_v3,
    shopStock,
    shopStockGetMax,
    customerDebt,
    shopSalesTax,
    partnerDebtDoc
};