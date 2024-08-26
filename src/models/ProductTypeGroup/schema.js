

const all_raw = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            // limit: { type: 'number', default: 10 },
            // page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'internal_code_id', enum: ['internal_code_id', 'code_id', 'group_type_name.th', 'group_type_name.en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }

        }
    },
    tags: ['ProductTypeGroup'],
    security: [
        {
            "apiKey": []
        }
    ]

}

const all = {


    querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
            search: { type: 'string', default: '' },
            limit: { type: 'number', default: 10 },
            page: { type: 'number', default: 1 },
            sort: { type: 'string', default: 'internal_code_id', enum: ['internal_code_id', 'code_id', 'group_type_name.th', 'group_type_name.en'] },
            order: { type: 'string', default: 'desc', enum: ['asc', 'desc'] },
            status: { type: 'string', enum: ['delete', 'active', 'block', ''], description: 'delete,active,block' }

        }
    },
    tags: ['ProductTypeGroup'],
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
    tags: ['ProductTypeGroup'],
    security: [
        {
            "apiKey": []
        }
    ]
}


const add = {
    body: {
        type: 'object',
        required: ['group_type_name'],
        properties: {
            internal_code_id: {
                description: 'รหัสควบคุมประเภทยานพาหนะ (ภายใน)',
                type: 'string',
                default: null,
                example: null
            },
            group_type_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            }
        }
    },
    tags: ['ProductTypeGroup'],
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
            internal_code_id: {
                ...add.body.properties.internal_code_id,
                nullable: true,
                default: undefined
            },
            group_type_name: {
                type: 'object', example: { th: 'ชื่อ', en: 'name' }, items: {
                    th: 'string',
                    en: 'string'
                }
            },
            isstock: { type: 'boolean' },
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
    tags: ['ProductTypeGroup'],
    security: [
        {
            "apiKey": []
        }
    ]
}



module.exports = { all_raw, all, byid, add, put }