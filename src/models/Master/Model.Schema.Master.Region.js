const region_all_raw = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            sort: { type: 'string', default: 'name_th', enum: ['name_th', 'name_en', 'reg_code'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: '', enum: ['', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]

}
const region_all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'name_th', enum: ['name_th', 'name_en', 'reg_code'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            status: { type: 'string', default: '', enum: ['', 'delete', 'active', 'block'] }

        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]

}

const region_put = {
    body: {
        type: 'object',
        properties: {
            reg_code: { type: 'string', description: 'รหัสภูมิภาคตารางเดิม' },
            name_th: { type: 'string', description: 'ชื่อภาษาไทย' },
            name_en: { type: 'string', description: 'ชื่อภาษาอังกฤษ' },
            MapRegProvs: {
                type: 'array', items: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'id ของ จังหวัด' }
                    },
                }
            },
            status: { type: 'string', default: '', enum: ['', 'delete', 'active', 'block'] }
        }

    },
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
}

const region_add = {
    body: {
        type: 'object',
        required: ['name_th'],
        properties: {
            reg_code: { type: 'string', description: 'รหัสภูมิภาคตารางเดิม' },
            name_th: { type: 'string', description: 'ชื่อภาษาไทย' },
            name_en: { type: 'string', description: 'ชื่อภาษาอังกฤษ' },
            MapRegProvs: {
                type: 'array', items: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'id ของ จังหวัด' }
                    },
                }
            }
        }

    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
}



const region_byid = {
    params: {
        required: ['id'],
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    tags: ['Master'],
    security: [
        {
            "apiKey": []
        }
    ]
}

module.exports = {
    region_all_raw,
    region_all,
    region_put,
    region_add,
    region_byid
}