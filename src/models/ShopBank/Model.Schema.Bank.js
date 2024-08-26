const add = {
    body: {
        required: ['account_name', 'account_no', 'bank_id'],
        properties: {
            account_name: {
                description: 'ชื่อบัญชี',
                type: 'object',
                example: {
                    "th": "xxx"
                }
            },
            account_no: {
                description: 'เลขบัญชี',
                type: 'string',
                example: 'xxxxxxxx',
                nullable: false,
            },
            details: {
                description: 'รายละเอียดข้อมูลใน tag ShopBank',
                type: 'object',
                nullable: false,
                default: {},
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            bank_id: {
                description: 'id ธนาคารจาก api/master/bankNameList/all',
                type: 'string',
                format: 'uuid',
                nullable: false,
            }
        },
    },
    ShopBank: ['ShopBank'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ในตารางข้อมูล ShopBank',
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: {
                type: 'string',
                default: '',
                description: 'สิ่งที่ต้องกาค้นหา'
            },
            limit: {
                type: 'number',
                default: 10,
                description: 'จำนวนชุดข้อมูลที่จะแสดงผล'
            },
            page: {
                type: 'number',
                default: 1,
                description: 'แสดงผลในหน้าที่กำหนด'
            },
            sort: {
                type: 'string',
                default: 'created_date',
                description: 'เรียงข้อมูลจากฟิวส์...'
            },
            order: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc',
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด'
            },
            status: {
                default: undefined,
                type: 'string',
                default: 'default',
                enum: ['default', 'delete', 'active', 'block', undefined],
                description: `สถานะของ ShopBank \n- default = active,block \n- block = ยกเลิก\n- active = ใช้งาน\n- delete = ถังขยะ`,

            }

        }
    },
    ShopBank: ['ShopBank'],
    security: [
        {
            "apiKey": []
        }
    ]

};


const byid = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid'
            }
        }
    },
    ShopBank: ['ShopBank'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const put = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid'
            }
        }
    },
    body: {
        additionalProperties: false,
        properties: {
            account_name: {
                description: 'ชื่อบัญชี',
                type: 'object',
                example: {
                    "th": "xxx"
                },
                nullable: true,
                default: undefined,
            },
            account_no: {
                description: 'เลขบัญชี',
                type: 'string',
                example: '000000000',
                nullable: true,
                default: undefined,
            },
            details: {
                description: 'รายละเอียดข้อมูลในเอกสารเก็บเป็น JSON',
                type: 'object',
                additionalProperties: true,
                nullable: true,
                default: undefined,
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            bank_id: {
                description: 'id ธนาคาร',
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: undefined
            },
            status: {
                type: 'string',
                nullable: true,
                default: undefined,
                enum: ['delete', 'active', 'block', undefined],
                description: 'สถานะของ delete,active,block'
            }
        },
    },
    ShopBank: ['ShopBank'],
    security: [
        {
            "apiKey": []
        }
    ]
};


module.exports = {
    add,
    all,
    byid,
    put
};