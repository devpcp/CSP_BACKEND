

const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            ref_doc_sale_id: { type: 'string', format: 'uuid', description: 'รหัสตารางข้อมูลเอกสารกำกับการขาย เป็นข้อมูลเอกสารอ้างอิงที่ใช้ออกบิล ชนิดเอกสารใบสั่งซ่อม' },
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: {
                type: 'string', default: 'created_date',
                enum: ['created_date', 'item_no', 'qty']
            },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            status: {
                type: 'number', default: 1, enum: [0, 1, 2],
                description: 'สถานะการใช้ข้อมูลในการออกบิล (0=ยกเลิก, 1=บิลอย่างย่อย, 2=บิลอย่างย่อย+บิลเต็มรูปแบบ)'
            }

        }
    },
    tags: ['ShopSalesTransactionOut'],
    security: [
        {
            "apiKey": []
        }
    ]

}



const add = {
    body: {
        type: 'object',
        required: ['doc_sale_id', 'status'],
        properties: {
            doc_sale_id: { type: 'string', format: 'uuid', description: 'รหัสตารางข้อมูลเอกสารกำกับการขาย' },
            ref_doc_sale_id: { type: 'string', format: 'uuid', description: 'รหัสตารางข้อมูลเอกสารกำกับการขาย เป็นข้อมูลเอกสารอ้างอิงที่ใช้ออกบิล ชนิดเอกสารใบสั่งซ่อม' },
            full_invoice_doc_sale_id: { type: 'string', format: 'uuid', description: 'รหัสตารางข้อมูลเอกสารกำกับการขาย ชนิดเอกสารการออกบิลเต็มรูปแบบ' },
            status: { type: 'number', enum: [0, 1, 2], description: 'สถานะการใช้ข้อมูลในการออกบิล (0=ยกเลิก, 1=บิลอย่างย่อย, 2=บิลอย่างย่อย+บิลเต็มรูปแบบ)' }
        }
    },
    tags: ['ShopSalesTransactionOut'],
    security: [
        {
            "apiKey": []
        }
    ],
}

const byid = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ShopSalesTransactionOut'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const put = {
    description: 'แก้ไข ข้อมูลการออกบิลขาย ตาม Id',
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                description: 'รหัสหลักตารางข้อมูลการออกบิลขาย',
                type: 'string',
                format: 'uuid'
            }
        }
    },
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'รหัสข้อมูลตารางร้านค้า',
                type: 'string',
                format: 'uuid',
                default: undefined,
                allowNull: true
            },
            doc_sale_id: {
                description: 'รหัสตารางข้อมูลเอกสารกำกับการขาย',
                type: 'string',
                format: 'uuid',
                default: undefined,
                allowNull: true
            },
            full_invoice_doc_sale_id: {
                description: 'รหัสตารางข้อมูลเอกสารกำกับการขาย ชนิดเอกสารการออกบิลเต็มรูปแบบ',
                type: 'string',
                format: 'uuid',
                default: undefined,
                allowNull: true
            },
            ref_doc_sale_id: {
                description: 'รหัสตารางข้อมูลเอกสารกำกับการขาย เป็นข้อมูลเอกสารอ้างอิงที่ใช้ออกบิล ชนิดเอกสารใบสั่งซ่อม',
                type: 'string',
                format: 'uuid',
                default: undefined,
                allowNull: true
            },
            product_id: {
                description: 'ข้อมูลสินค้าใน Invoice',
                type: 'string',
                format: 'uuid',
                default: undefined,
                allowNull: true
            },
            item_no: {
                description: 'ลำดับสินค้าที่อยู่ใน Invoice',
                type: 'number',
                default: undefined,
                allowNull: true
            },
            qty: {
                description: 'จำนวนสินค้าใน Invoice',
                type: 'number',
                default: undefined,
                allowNull: true
            },
            status: {
                description: 'สถานะการใช้ข้อมูลในการออกบิล (0=ยกเลิก, 1=บิลอย่างย่อย, 2=บิลอย่างย่อย+บิลเต็มรูปแบบ)',
                type: 'number',
                default: undefined,
                allowNull: true
            },
        }
    },
    tags: ['ShopSalesTransactionOut'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = { all, add, byid, put }