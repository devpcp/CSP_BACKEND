const add = {
    description: 'เพิ่มข้อมูล ในตารางข้อมูลเอกสารสั่งซื้อ',
    body: {
        additionalProperties: false,
        required: ['tag_name'],
        properties: {
            tag_name: {
                description: 'ชื่อของ Tags',
                type: 'object',
                example: {
                    "th": "xxx"
                }
            },
            details: {
                description: 'รายละเอียดข้อมูลใน tag Tags',
                type: 'object',
                additionalProperties: true,
                nullable: false,
                default: {},
                example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            tag_type: {
                description: 'ประเภทของ tags\n0=ใช้ได้ทั้งหมด\n 1=สินค้า\n 2=ลูกค้า',
                type: 'number',
                default: 0,
                example: 0,
                enum: [0, 1, 2]
            }
        },
    },
    tags: ['Tags'],
    security: [
        {
            "apiKey": []
        }
    ]
};


const all = {
    description: 'แสดงข้อมูล และค้นหาข้อมูล ในตารางข้อมูล Tags',
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
                enum: ['run_no', 'tag_name.th', 'created_date', 'updated_date'],
                default: 'run_no',
                description: 'เรียงข้อมูลจากฟิวส์...'
            },
            order: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc',
                description: 'รูปแบบที่จะเรียงข้อมูลจากฟิวส์ที่กำหนด'
            },
            tag_type: {
                type: 'string',
                default: undefined,
                enum: [undefined, '0', '1', '2'],
                description: `สถานะประเภทของ Tags \n- default = ไม่สนใจ \n-0 = ใช้ได้ทั้งหมด\n-1 = สินค้า\n-2 = ลูกค้า`,
            },
            status: {
                default: undefined,
                type: 'string',
                default: 'default',
                enum: ['default', 'delete', 'active', 'block', undefined],
                description: `สถานะของ Tags \n- default = active,block \n- block = ยกเลิก\n- active = ใช้งาน\n- delete = ถังขยะ`,

            }

        }
    },
    tags: ['Tags'],
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
    tags: ['Tags'],
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
            tag_name: {
                description: 'ชื่อของ Tags',
                type: 'object',
                example: {
                    "th": "xxx"
                },
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
            tag_type: {
                description: 'ประเภทของ tags\n0=ใช้ได้ทั้งหมด\n 1=สินค้า\n 2=ลูกค้า',
                type: 'number',
                nullable: true,
                default: undefined,
                enum: [0, 1, 2]
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
    tags: ['Tags'],
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