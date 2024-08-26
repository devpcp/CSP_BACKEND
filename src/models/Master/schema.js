
const sub_district = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        // required: ['district_id'],
        properties: {
            search: { type: 'string', default: '' },
            // limit: { type: 'number', default: 10 },
            // page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'name_th', enum: ['name_th', 'name_en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            district_id: { type: 'string', format: 'uuid' }
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]

}



const dis_trict = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        // required: ['province_id'],
        properties: {
            search: { type: 'string', default: '' },
            // limit: { type: 'number', default: 10 },
            // page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'name_th', enum: ['name_th', 'name_en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            province_id: { type: 'string', format: 'uuid' }
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]

}


const pro_vince = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        // required: ['province_id'],
        properties: {
            search: { type: 'string', default: '' },
            // limit: { type: 'number', default: 10 },
            // page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'prov_name_th', enum: ['prov_name_th', 'prov_name_en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            // province_id: { type: 'string', format: 'uuid' }
            // status: { type: 'string', default: 'default', enum: ['default', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]

}


const tax_types = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            sort: { type: 'string', default: 'type_name.th', enum: ['type_name.th', 'type_name.en', 'code_id'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const tax_types_byid = {
    description: `แสดงข้อมูลของ "ตารางข้อมูลประเภทภาษี" (mas_tax_types) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
            id: {
                type: 'string',
                format: 'uuid',
                description: 'ค่า id ของ mas_tax_types'
            }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const tax_types_add = {
    description: 'เพิ่ม ชุดข้อมูลไปยัง "ตารางข้อมูลประเภทภาษี" (mas_tax_types)',
    body: {
        type: 'object',
        additionalProperties: false,
        required: ['type_name', 'detail'],
        properties: {
            code_id: {
                description: 'รหัสควบคุมประเภทภาษี',
                type: 'string',
                nullable: true,
                default: null,
                example: "UT-002"
            },
            type_name: {
                description: 'ชื่อประเภทภาษี เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: false,
                example: {
                    "th": "ข้อมูล",
                    "en": "Data"
                }
            },
            detail: {
                description: 'รายละเอียดข้อมูล',
                type: 'object',
                nullable: false,
                example: {
                    "tax_rate_percent": 0,
                }
            },
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};

const tax_types_put = {
    description: `แก้ไขข้อมูลของ "ตารางข้อมูลประเภทภาษี" (mas_tax_types) \nตามพารามิเตอร์ "id" ที่ส่งมา`,
    params: {
        type: 'object',
        required: ['id'],
        additionalProperties: false,
        properties: {
            id: {
                type: 'string',
                nullable: false,
                format: 'uuid',
                description: 'id ของ mas_tax_types'
            }
        }
    },
    body: {
        type: 'object',
        additionalProperties: false,
        properties: {
            code_id: {
                description: 'รหัสควบคุมประเภทภาษี',
                type: 'string',
                nullable: false,
                default: null,
                example: "UT-002"
            },
            type_name: {
                description: 'ชื่อประเภทภาษี เก็บเป็น JSON รองรับหลายภาษา ตัวอย่างเช่น { "th":"ข้อมูล", "en":"data", }',
                type: 'object',
                nullable: false,
                example: {
                    "th": "ข้อมูล",
                    "en": "Data"
                }
            },
            detail: {
                description: 'รายละเอียดข้อมูล',
                type: 'object',
                nullable: false,
                example: {
                    "tax_rate_percent": 0,
                }
            },
            status: {
                description: 'สถานะการใช้งานข้อมูล \n- block = ยกเลิกการใช้งานข้อมูล \n- active = ใช้งานข้อมูล \n- delete = ลบข้อมูลลงถังขยะ',
                type: 'string',
                nullable: false,
                default: undefined,
                enum: ['block', 'active', 'delete']
            }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
};




module.exports = {
    sub_district,
    dis_trict,
    pro_vince,
    tax_types,
    tax_types_byid,
    tax_types_add,
    tax_types_put,
}