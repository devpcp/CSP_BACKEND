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
            shop_id: {
                description: 'กรองข้อมูลตาม Shop Id',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null
            },
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'code_id', enum: ['code_id', 'name', 'shelf_total'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] }
        }
    },
    tags: ['Warehouses'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const add = {
    body: {
        type: 'object',
        required: ['code_id', 'name'],
        properties: {
            code_id: { type: 'string', example: '0001' },
            name: {
                type: 'object',
                properties: {
                    th: {
                        type: 'string',
                    },
                    en: {
                        type: 'string',
                    },
                },
                comment: 'ชื่อ เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}',
                example: {
                    "th": "เทส",
                    "en": "test"
                }
            },
            shelf: {
                type: 'array', items: {
                    type: 'object',
                    properties: {
                        item: {
                            type: 'string',
                        },
                        code: {
                            type: 'string',
                        },
                        name: {
                            type: 'object',
                            properties: {
                                th: {
                                    type: 'string',
                                },
                                en: {
                                    type: 'string',
                                },
                            },
                        }
                    },
                },
                example: [{
                    "item": "Run NO",
                    "code": "Code เรียงแทนชื่อ",
                    "name":
                    {
                        "th": "ชื่อ",
                        "en": "name"
                    }

                }],
            },
        }
    },
    tags: ['Warehouses'],
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
            select_shop_ids,
            shop_id: {
                description: 'กรองข้อมูลตาม Shop Id',
                type: ['string', 'null'],
                format: 'uuid',
                nullable: true,
                default: null
            }
        }
    },
    tags: ['Warehouses'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const put = {
    body: {
        type: 'object',
        properties: {
            code_id: { type: 'string', example: '0001' },
            name: {
                type: 'object',
                properties: {
                    th: {
                        type: 'string',
                    },
                    en: {
                        type: 'string',
                    },
                },
                comment: 'ชื่อ เก็บเป็น JSON รองรับหลายภาษา Ex. {"th":"ข้อมูล", "en":"data"}',
                example: {
                    "th": "เทส",
                    "en": "test"
                }
            },
            shelf: {
                type: 'array', items: {
                    type: 'object',
                    properties: {
                        item: {
                            type: 'string',
                        },
                        code: {
                            type: 'string',
                        },
                        name: {
                            type: 'object',
                            properties: {
                                th: {
                                    type: 'string',
                                },
                                en: {
                                    type: 'string',
                                },
                            },
                        }
                    },
                },
                example: [{
                    "item": "Run NO",
                    "code": "Code เรียงแทนชื่อ",
                    "name":
                    {
                        "th": "ชื่อ",
                        "en": "name"
                    }

                }],
            },
        }
    },
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['Warehouses'],
    security: [
        {
            "apiKey": []
        }
    ]
}


module.exports = {
    all,
    add,
    byid,
    put
}