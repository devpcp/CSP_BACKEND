const select_shop_ids = {
    description: 'เลือกใช้ข้อมูลตารางตาม Shop Profile Id ต่าง ๆ\n- แบ่งคั่นด้วยเครื่องหมาย ,\n- ถ้าเอาทุก Branch ที่มีให้ใส่ all \n- กรณีไม่ส่ง ระบบจะเช็คตาม User Login',
    type: 'string',
    nullable: true,
    default: ''
};


const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'created_date', enum: ['created_date', 'import_date', 'amount'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['ShopInventory'],
    security: [
        {
            "apiKey": []
        }
    ]

}


const add_json = {
    body: {
        // type: 'array', items: {
        type: 'object',
        required: ['product_list', 'doc_inventory_id', 'import_date'],
        properties: {
            product_list: {
                type: 'array', items: {
                    type: 'object',
                    required: ['product_id', 'warehouse_detail', 'amount_all'],
                    properties: {
                        product_id: { type: 'string', format: 'uuid', example: '3b99b737-205d-4366-9def-60d2d1abbdb8' },
                        warehouse_detail: {
                            required: ['warehouse', 'shelf'],
                            type: 'array', items: {
                                warehouse: { type: 'string', format: 'uuid' },
                                shelf: {
                                    type: 'object', properties: {
                                        item: {
                                            type: 'string',
                                        },
                                        amount: {
                                            type: 'number',
                                        }
                                    }
                                }
                            },
                            example:
                                [
                                    {
                                        "warehouse": "30f56783-d3e8-4697-b28a-a1421502328b",
                                        "shelf":
                                        {
                                            "item": "num shelf 1", "amount": 3
                                        }
                                    },
                                    {
                                        "warehouse": "30f56783-d3e8-4697-b28a-a1421502328b",
                                        "shelf":
                                        {
                                            "item": "num shelf 1", "amount": 3
                                        }
                                    }
                                ]
                        },
                        amount_all: { type: 'number' },
                        details: {
                            type: 'object', properties: {
                                price: { example: "1000" },
                                discount_percentage_1: { example: "2" },
                                discount_percentage_2: { example: "0" },
                                discount_thb: { example: "980" },
                            }
                        },
                    }
                }
            },
            doc_inventory_id: { type: 'string', format: 'uuid' },
            import_date: { type: 'string', example: '2021-12-30' },
            status: {
                description: 'สถานะการนำเข้าสินค้าสู่คลัง \n1 = นำเข้าปกติ \n2 = ปรับเพิ่ม \n3 = ปรับลด',
                type: 'number',
                default: 1
            },

        }
        // }

    },
    tags: ['ShopInventory'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const add_file = {
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['fileUpload'],
        properties: {
            fileUpload: {
                type: 'object',
                properties: {
                    encoding: { type: 'string' },
                    filename: { type: 'string' },
                    limit: { type: 'boolean' },
                    mimetype: { type: 'string' }
                },
                description: 'ไฟล์แนบ (ใน Swagger จะทดสอบไม่ได้)',
                example: '@C:\\Users\\MyUser\\Pictures\\34235dfsd.PNG'
            }
        }
    },
    tags: ['ShopInventory'],
    security: [
        {
            "apiKey": []
        }
    ]
}
const byid = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            gen_qr_code: { type: 'boolean', default: false, description: 'generate qr code' },
            inventory_list: {
                type: 'array', example: [], items: {
                    type: 'string', format: 'uuid'
                },
                default: [],
                description: 'ส่ง id ที่อยาก gen'
            },
            status: {
                type: 'string',
                default: 'default',
                enum: ['default', '0', '1'],
                description: `สถานะการนำเข้าสินค้าสู่คลัง \n- default = เลือกทุกอย่างยกเว้นยกเลิก, \n- 0 = ยกเลิก \n- 1 = ปกติ`
            }
        }
    },
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ShopInventory'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const put = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    body: {
        // type: 'array', items: {
        type: 'object',
        required: ['product_list'],
        properties: {
            product_list: {
                type: 'array', items: {
                    type: 'object',
                    required: ['product_id', 'warehouse_detail', 'amount_all'],
                    properties: {
                        product_id: { type: 'string', format: 'uuid', example: '3b99b737-205d-4366-9def-60d2d1abbdb8' },
                        warehouse_detail: {
                            required: ['warehouse', 'shelf'],
                            type: 'array', items: {
                                warehouse: { type: 'string', format: 'uuid' },
                                shelf: {
                                    type: 'object', properties: {
                                        item: {
                                            type: 'string',
                                        },
                                        amount: {
                                            type: 'number',
                                        }
                                    }
                                }
                            },
                            example:
                                [
                                    {
                                        "warehouse": "30f56783-d3e8-4697-b28a-a1421502328b",
                                        "shelf":
                                        {
                                            "item": "num shelf 1", "amount": 3
                                        }
                                    },
                                    {
                                        "warehouse": "30f56783-d3e8-4697-b28a-a1421502328b",
                                        "shelf":
                                        {
                                            "item": "num shelf 1", "amount": 3
                                        }
                                    }
                                ]
                        },
                        amount_all: { type: 'number' },
                        details: {
                            type: 'object', properties: {
                                price: { example: "1000" },
                                discount_percentage_1: { example: "2" },
                                discount_percentage_2: { example: "0" },
                                discount_thb: { example: "980" },
                            }
                        },
                    }
                }

            },
            // doc_inventory_id: { type: 'string', format: 'uuid' },
            import_date: { type: 'string', example: '2021-12-30' },
            // status: { type: 'number', default: 1 },

        }
        // }

    },
    tags: ['ShopInventory'],
    security: [
        {
            "apiKey": []
        }
    ]
}




module.exports = { all, add_file, add_json, byid, put }