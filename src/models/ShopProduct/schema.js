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
            type_group_id: { type: 'string', format: 'uuid', description: 'กลุ่มประเภทสินค้า' },
            product_type_id: { type: 'string', format: 'uuid', description: 'ประเภทสินค้า' },
            product_brand_id: { type: 'string', format: 'uuid', description: 'ยี่ห้อสินค้า' },
            product_model_id: { type: 'string', format: 'uuid', description: 'โมเดลทสินค้า' },
            search: { type: 'string', default: '' },
            searchPaths: { type: 'string', default: '', example: 'master_path_code_id,product_name' },
            tags: {
                type: 'array',
                description: 'เป็น uuid ของ tag',
                type: 'string',
                nullable: true,
                default: null
            },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'start_date', enum: ['start_date', 'end_date', 'suggasted_re_sell_price', 'suggested_online_price'] },
            order: { type: 'string', default: 'asc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] },
            dropdown: {
                type: "boolean",
                default: false,
                description: "จะ return แค่ id name code"
            },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            },
            shop_id: {
                description: 'กรองข้อมูลตาม Shop Id',
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
            }

        }
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]

}



const add = {
    body: {
        type: 'object',
        required: ['product_id', 'price'],
        properties: {
            product_id: { type: 'string', format: 'uuid' },
            product_bar_code: { type: 'string' },
            // start_date: { type: 'string', example: '2021-11-30' },
            // end_date: { type: 'string', example: '2021-12-30' },
            start_date: {
                type: 'string',
                allowNull: true,
                // pattern: `^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$`,
                example: '2021-11-30',
                default: null

            },
            end_date: {
                type: 'string',
                allowNull: true,
                // pattern: `^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$`,
                example: '2021-11-30',
                default: null
            },
            price: {
                type: 'object',
                required: ['suggasted_re_sell_price', 'suggested_online_price'],
                properties: {
                    suggasted_re_sell_price: {
                        type: 'object',
                    },
                    suggested_online_price: {
                        type: 'object',
                    },
                },
                example: { suggasted_re_sell_price: { retail: 987, wholesale: 987 }, suggested_online_price: { retail: 158, wholesale: 987 } }
            },
            price_arr: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['price_name', 'price_value'],
                    properties: {
                        price_name: { type: 'string', example: 'test' },
                        price_value: { type: 'string', example: '1222' },
                        price_standard_margin_percent: { type: 'string', example: '5' },
                        price_standard_margin_bath: { type: 'string', example: '5' }
                    }
                }
            },
            price_dot_arr: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['price_name', 'price_value'],
                    properties: {
                        price_name: { type: 'string', example: 'test' },
                        price_value: { type: 'string', example: '1222' },
                        price_standard_margin_percent: { type: 'string', example: '5' },
                        price_standard_margin_bath: { type: 'string', example: '5' }
                    }
                }
            },
            details: {
                type: 'object',
                allowNull: true,
                default: {}
            },
            tags: {
                type: 'array',
                description: 'เป็น uuid ของ tag',
                items: {
                    type: 'string', format: 'uuid'
                },
            }
        }
    },
    tags: ['ShopProducts'],
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
    tags: ['ShopProducts'],
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
            product_id: { nullableKey: { type: ['string', 'null'] }, format: 'uuid' },
            product_code: { nullableKey: { type: ['string', 'null'] } },
            product_bar_code: { nullableKey: { type: ['string', 'null'] } },
            start_date: { nullableKey: { type: ['string', 'null'], example: '2021-11-30' } },
            end_date: { nullableKey: { type: ['string', 'null'], example: '2021-11-30' } },
            price: {
                type: 'object',
                required: ['suggasted_re_sell_price', 'suggested_online_price'],
                properties: {
                    suggasted_re_sell_price: {
                        type: 'object',
                    },
                    suggested_online_price: {
                        type: 'object',
                    },
                },
                example: { suggasted_re_sell_price: { retail: 987, wholesale: 987 }, suggested_online_price: { retail: 158, wholesale: 987 } }

            },
            price_arr: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['price_name', 'price_value'],
                    properties: {
                        price_name: { type: 'string', example: 'test' },
                        price_value: { type: 'string', example: '1222' },
                        price_standard_margin_percent: { type: 'string', example: '5' },
                        price_standard_margin_bath: { type: 'string', example: '5' }
                    }
                }
            },
            price_dot_arr: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['price_name', 'price_value'],
                    properties: {
                        price_name: { type: 'string', example: 'test' },
                        price_value: { type: 'string', example: '1222' },
                        price_standard_margin_percent: { type: 'string', example: '5' },
                        price_standard_margin_bath: { type: 'string', example: '5' }
                    }
                }
            },
            status: { nullableKey: { type: ['string', ''] }, enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' },
            details: {
                type: 'object',
                allowNull: true,
                default: undefined
            },
            tags: {
                type: 'array',
                description: 'เป็น uuid ของ tag',
                items: {
                    type: 'string', format: 'uuid'
                },
                default: undefined
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
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const filterCategories = {
    description: 'ค้นหาชนิดของสินค้าภายในร้าน',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            select_shop_ids,
            shop_product_id: { type: 'string', format: 'uuid', description: 'รหัสหลักของสินค้าในร้าน' },
            product_id: { type: 'string', format: 'uuid', description: 'รหัสหลักของสินค้า' },
            product_group_id: { type: 'string', format: 'uuid', description: 'กลุ่มประเภทสินค้า' },
            product_type_id: { type: 'string', format: 'uuid', description: 'ประเภทสินค้า' },
            product_brand_id: { type: 'string', format: 'uuid', description: 'ยี่ห้อสินค้า' },
            product_model_id: { type: 'string', format: 'uuid', description: 'โมเดลทสินค้า' },
        }
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const addByFile = {
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['file'],
        additionalProperties: false,
        properties: {
            file: {
                isFileType: true,
            }
        },
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const addPriceDotByFile = {
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['file'],
        additionalProperties: false,
        properties: {
            file: {
                isFileType: true,
            }
        },
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const add_img_arr = {
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        isFileType: true,
        required: ['img'],
        additionalProperties: false,
        properties: {
            img: {
                // type: 'array',
                description: 'รูปภาพ เป็น array แต่ใน Swagger ไม่ทำงาน, ต้องทดสอบผ่าน postman',
                items: {
                    isFileType: true,
                }
            }
        },
    },

    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const priceDotReport = {
    description: 'รายงานร่องราคาตาม dot',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            }
        }
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]

};

const addPriceBaseByFile = {
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['file'],
        additionalProperties: false,
        properties: {
            file: {
                isFileType: true,
            }
        },
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const priceBaseReport = {
    description: 'รายงานราคาพื้นฐาน',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            }
        }
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]

};


const addPriceArrByFile = {
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['file'],
        additionalProperties: false,
        properties: {
            file: {
                isFileType: true,
            }
        },
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const priceArrReport = {
    description: 'รายงานร่องราคา',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            export_format: {
                description: 'รูปแบบการ Export ในรายงานนี้\n- json = JSON Format\n- xlsx = Excel Format',
                type: 'string',
                enum: ['json', 'xlsx'],
                default: 'json'
            }
        }
    },
    tags: ['ShopProducts'],
    security: [
        {
            "apiKey": []
        }
    ]

};



module.exports = {
    all,
    add,
    byid,
    put,
    filterCategories,
    addByFile,
    add_img_arr,
    addPriceDotByFile,
    priceDotReport,
    addPriceArrByFile,
    priceArrReport,
    addPriceBaseByFile,
    priceBaseReport
};