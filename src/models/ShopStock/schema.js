

const all = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'กรองข้อมูลตาม Shop Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            search: { type: 'string', default: '' },
            searchPaths: { type: 'string', default: '', example: 'master_path_code_id,product_name' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'balance_date', enum: ['balance_date', 'balance'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] },
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
            filter_wyz_code: {
                description: 'การกรองเงื่อนไขแสดงเฉพาะข้อมูล Product ที่มี WYZ Code\n- true = ใช่ ต้องการกรองเงื่อนไขนี้\n- false = ไม่ ไม่ต้องการกรองเงื่อนไขนี้',
                type: 'boolean',
                default: false
            },
            filter_available_balance: {
                description: 'การกรองเงื่อนไขแสดงเฉพาะข้อมูล Product Stock ที่ไม่เท่ากับ 0\n- true = ใช่ ต้องการกรองเงื่อนไขนี้\n- false = ไม่ ไม่ต้องการกรองเงื่อนไขนี้',
                type: 'boolean',
                default: false
            },
            min_balance: { type: 'number', description: 'ช่วงของการกรอง จำนวนสินค้าคงเหลือต่ำสุด' },
            max_balance: { type: 'number', description: 'ช่วงของการกรอง จำนวนสินค้าคงเหลือสูงสุด' },
            product_id: {
                description: 'กรองข้อมูลตาม Product Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            center_product_id: {
                description: 'กรองข้อมูลตาม Product Id กลาง',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            tags: {
                type: 'array',
                description: 'เป็น uuid ของ tag',
                type: 'string',
                nullable: true,
                default: null
            },
        }
    },
    tags: ['ShopStock'],
    security: [
        {
            "apiKey": []
        }
    ]

}


const byid = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'เลือกข้อมูลในตาราง Shop ตาม ShopProfile Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            filter_wyz_code: {
                description: 'การกรองเงื่อนไขแสดงเฉพาะข้อมูล Product ที่มี WYZ Code\n- true = ใช่ ต้องการกรองเงื่อนไขนี้\n- false = ไม่ ไม่ต้องการกรองเงื่อนไขนี้',
                type: 'boolean',
                default: false
            }
        }
    },
    tags: ['ShopStock'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const reportAllStockExportExcel = {
    description: 'ชุดข้อมูลรายงานสินค้าคงคลัง',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            shop_id: {
                description: 'กรองข้อมูลตาม Shop Id',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null
            },
            search: {
                type: 'string',
                default: ''
            },
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
            dot: {
                description: 'กรองที่มี dot หรือ ไม่มี \n - 0 = ไม่มี dot \n- 1 = มี dot ',
                type: 'number',
                default: 0,
                enum: [0, 1]
            },
            min_balance: {
                description: 'ช่วงของการกรอง จำนวนสินค้าคงเหลือต่ำสุด',
                type: 'integer',
                nullable: true,
                default: 0
            },
            max_balance: {
                description: 'ช่วงของการกรอง จำนวนสินค้าคงเหลือสูงสุด',
                type: 'integer',
                nullable: true,
                default: null
            },
            filter_available_balance: {
                description: 'การกรองเงื่อนไขแสดงเฉพาะข้อมูล Product Stock ที่ไม่เท่ากับ 0\n- 1 = ใช่ ต้องการกรองเงื่อนไขนี้\n- 0 = ไม่ ไม่ต้องการกรองเงื่อนไขนี้',
                type: 'number',
                default: 0,
                enum: [0, 1]
            },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            }
        }
    },
    tags: ['ShopStock'],
    security: [
        {
            "apiKey": []
        }
    ]
};




module.exports = {
    all,
    byid,
    reportAllStockExportExcel
}