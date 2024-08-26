
const add_by_file = {
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
    tags: ['ShopVehicleCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
};
const all = {
    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: {
                type: 'number',
                default: 10
            },
            page: {
                type: 'number',
                default: 1
            },
            sort: {
                type: 'string',
                default: 'created_date'
            },
            order: {
                type: 'string',
                default: 'asc',
                enum: ['asc', 'desc']
            },
            status: {
                type: 'string',
                default: 'default',
                enum: ['default', 'delete', 'active', 'block']
            },
            bus_customer_id: { type: 'string', format: 'uuid' },
            per_customer_id: { type: 'string', format: 'uuid' },
            vehicle_type_id: { type: 'string', format: 'uuid' },
            vehicle_brand_id: { type: 'string', format: 'uuid' },
            vehicle_model_id: { type: 'string', format: 'uuid' },
            filter__details__province_name: { description: 'ชื่อจังหวัดบนป้านทะเบียนรถ (จะใส่ชื่อจังหวัด หรือ UUID มาก็ได้)', type: 'string' },
            filter__details__service_date_last__startDate: { description: 'วันที่เข้ามาใช้บริการครั้งล่าสุด (เริ่มต้น)', type: 'string' },
            filter__details__service_date_last__endDate: { description: 'วันที่เข้ามาใช้บริการครั้งล่าสุด (สิ้นสุด)', type: 'string' }
        }
    },
    tags: ['ShopVehicleCustomer'],
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
    tags: ['ShopVehicleCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}



const add = {
    body: {
        // type: 'array', items: {
        type: 'object',
        required: ['details', 'vehicle_type_id', 'vehicle_brand_id', 'vehicle_model_id'],
        properties: {
            bus_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            per_customer_id: {
                type: 'string',
                format: 'uuid',
                nullable: true,
                default: null,
                comment: 'บังคับใส่อย่างใดอย่างหนึ่ง',
                example: 'cd606fde-dd50-45df-b252-f01c80918416'
            },
            details: {
                type: 'object', properties: {
                }, example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            vehicle_type_id: { type: 'string', format: 'uuid', comment: 'เอาจาก master/VehicleType/all' },
            vehicle_brand_id: { type: 'string', format: 'uuid', comment: 'เอาจาก master/VehicleBrand/all' },
            vehicle_model_id: { type: 'string', format: 'uuid', comment: 'เอาจาก master/VehicleModelType/all' },

        }

    },
    tags: ['ShopVehicleCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const put = {
    body: {
        // type: 'array', items: {
        type: 'object',
        properties: {
            bus_customer_id: { type: 'string', format: 'uuid', nullable: true, comment: 'บังคับใส่อย่างใดอย่างหนึ่ง' },
            per_customer_id: { type: 'string', format: 'uuid', nullable: true, comment: 'บังคับใส่อย่างใดอย่างหนึ่ง' },
            details: {
                type: 'object', properties: {
                }, example: {
                    "data": "xxx",
                    "data_2": { "th": "xxx", "en": "xxx" },
                    "data_3": "xxx",
                    "data_4": "xxx"
                }
            },
            vehicle_type_id: { type: 'string', format: 'uuid', comment: 'เอาจาก master/VehicleType/all' },
            vehicle_brand_id: { type: 'string', format: 'uuid', comment: 'เอาจาก master/VehicleBrand/all' },
            vehicle_model_id: { type: 'string', format: 'uuid', comment: 'เอาจาก master/VehicleModelType/all' },
            status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }

        }

    },
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['ShopVehicleCustomer'],
    security: [
        {
            "apiKey": []
        }
    ]
}




module.exports = { add_by_file, all, byid, add, put }